const store = require("./store");

const SESSION_KEY = "cloudSession";
const MAX_RETRIES = 2;
const SYNC_BATCH_SIZE = 100;

function hasCloud() {
  return Boolean(wx.cloud && wx.cloud.callFunction);
}

function getSession() {
  return wx.getStorageSync(SESSION_KEY) || null;
}

function isLoggedIn() {
  const session = getSession();
  return Boolean(session && session.openid);
}

function isNetworkError(error) {
  const message = [error && error.errMsg, error && error.message, error && error.errCode]
    .filter(Boolean)
    .join(" ");
  return /network|timeout|request:fail|socket|connection/i.test(message);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function callFunction(name, data, retries = MAX_RETRIES) {
  if (!hasCloud()) {
    return Promise.reject(new Error("当前微信版本不支持云开发"));
  }
  return wx.cloud.callFunction({
    name,
    data
  }).catch((error) => {
    if (!isNetworkError(error) || retries <= 0) throw error;
    return wait((MAX_RETRIES - retries + 1) * 500)
      .then(() => callFunction(name, data, retries - 1));
  });
}

function login() {
  return callFunction("login", {}).then((res) => {
    const data = res.result || {};
    if (!data.openid) {
      throw new Error("login failed");
    }
    wx.setStorageSync(SESSION_KEY, {
      openid: data.openid,
      loginAt: Date.now()
    });
    return data;
  });
}

function ensureLogin() {
  if (isLoggedIn()) {
    return Promise.resolve(getSession());
  }
  return login();
}

function syncProgress() {
  if (!isLoggedIn()) {
    return Promise.resolve({ skipped: true });
  }
  const progress = store.getProgress();
  const changedProgress = Object.keys(progress).reduce((result, wordId) => {
    const item = progress[wordId];
    const hasLearningData = item
      && (item.status !== "new" || item.correct > 0 || item.mistakes > 0 || item.lastReviewedAt);
    if (hasLearningData) {
      result[wordId] = item;
    }
    return result;
  }, {});

  const entries = Object.entries(changedProgress);
  if (!entries.length) {
    return Promise.resolve({ synced: 0 });
  }

  let request = Promise.resolve(0);
  for (let index = 0; index < entries.length; index += SYNC_BATCH_SIZE) {
    const progress = entries.slice(index, index + SYNC_BATCH_SIZE).reduce((result, entry) => {
      result[entry[0]] = entry[1];
      return result;
    }, {});
    request = request.then((synced) => callFunction("syncProgress", { progress })
      .then((res) => synced + Number((res.result || {}).synced || 0)));
  }

  return request.then((synced) => ({ synced }));
}

function saveQuizLog(payload) {
  if (!isLoggedIn()) {
    return Promise.resolve({ skipped: true });
  }
  return callFunction("saveQuizLog", payload).then((res) => res.result || {});
}

function clearSession() {
  wx.removeStorageSync(SESSION_KEY);
}

function getFriendlyError(error) {
  const message = [error && error.errMsg, error && error.message]
    .filter(Boolean)
    .join(" ");
  if (isNetworkError(error)) {
    return "网络连接失败，学习记录已保存在本机。请检查网络后重新同步。";
  }
  if (/FUNCTION_NOT_FOUND|function.*not.*found|云函数不存在/i.test(message)) {
    return "云函数尚未部署，请在开发者工具中重新上传并部署云函数。";
  }
  if (/environment|env|INVALID_ENV/i.test(message)) {
    return "云环境连接失败，请确认当前项目选择了正确的云环境。";
  }
  return message || "云同步暂时不可用，学习记录已保存在本机。";
}

module.exports = {
  hasCloud,
  getSession,
  isLoggedIn,
  login,
  ensureLogin,
  syncProgress,
  saveQuizLog,
  clearSession,
  getFriendlyError
};

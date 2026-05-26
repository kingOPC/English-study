const store = require("./store");

const SESSION_KEY = "cloudSession";

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

function callFunction(name, data) {
  if (!hasCloud()) {
    return Promise.reject(new Error("cloud is not available"));
  }
  return wx.cloud.callFunction({
    name,
    data
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

  return callFunction("syncProgress", {
    progress: changedProgress
  }).then((res) => res.result || {});
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

module.exports = {
  hasCloud,
  getSession,
  isLoggedIn,
  login,
  ensureLogin,
  syncProgress,
  saveQuizLog,
  clearSession
};

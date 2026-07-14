const store = require("../../utils/store");
const cloud = require("../../utils/cloud");

Page({
  data: {
    loggedIn: false,
    loginText: "游客模式 · 本地保存学习进度",
    syncing: false,
    libraryText: "",
    vocabularyTotal: 0
  },

  onShow() {
    this.refreshLoginState();
    this.refreshLibraryText();
  },

  refreshLoginState() {
    const session = cloud.getSession();
    this.setData({
      loggedIn: cloud.isLoggedIn(),
      loginText: session && session.openid ? "已登录 · 学习进度可同步到云端" : "游客模式 · 本地保存学习进度"
    });
  },

  refreshLibraryText() {
    const elementary = store.getWordsByLevel("elementary").length;
    const highSchool = store.getWordsByLevel("high_school").length;
    const cet = store.getWordsByLevel("cet").length;
    this.setData({
      libraryText: `词库 v0.4：小学${elementary} · 高中${highSchool} · 四六级${cet}`,
      vocabularyTotal: elementary + highSchool + cet
    });
  },

  loginAndSync() {
    if (this.data.syncing) return;
    this.setData({ syncing: true });
    cloud.ensureLogin()
      .catch((error) => {
        throw new Error(`登录失败：${formatError(error)}`);
      })
      .then(() => cloud.syncProgress()
        .catch((error) => {
          throw new Error(`同步失败：${formatError(error)}`);
        }))
      .then((result) => {
        this.refreshLoginState();
        wx.showToast({
          title: `已同步${result.synced || 0}条`,
          icon: "success"
        });
      })
      .catch((error) => {
        console.error("sync failed", error);
        wx.showModal({
          title: "同步失败",
          content: cloud.getFriendlyError(error),
          showCancel: false
        });
      })
      .finally(() => {
        this.setData({ syncing: false });
      });
  },

  openPrivacy() {
    wx.navigateTo({
      url: "/pages/privacy/privacy"
    });
  },

  openAgreement() {
    wx.navigateTo({
      url: "/pages/agreement/agreement"
    });
  },

  confirmReset() {
    wx.showModal({
      title: "清空学习记录",
      content: "这会重置已学习、错词和复习进度，词库不会被删除。",
      confirmText: "清空",
      confirmColor: "#b6423c",
      success(result) {
        if (!result.confirm) return;
        store.resetLearningData();
        if (cloud.isLoggedIn()) {
          cloud.syncProgress();
        }
        wx.showToast({
          title: "已重置",
          icon: "success"
        });
      }
    });
  }
});

function formatError(error) {
  if (!error) return "未知错误";
  return cloud.getFriendlyError(error);
}

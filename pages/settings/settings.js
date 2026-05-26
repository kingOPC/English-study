const store = require("../../utils/store");
const cloud = require("../../utils/cloud");

Page({
  data: {
    loggedIn: false,
    loginText: "游客模式 · 本地保存学习进度",
    syncing: false
  },

  onShow() {
    this.refreshLoginState();
  },

  refreshLoginState() {
    const session = cloud.getSession();
    this.setData({
      loggedIn: cloud.isLoggedIn(),
      loginText: session && session.openid ? "已登录 · 学习进度可同步到云端" : "游客模式 · 本地保存学习进度"
    });
  },

  loginAndSync() {
    if (this.data.syncing) return;
    this.setData({ syncing: true });
    cloud.ensureLogin()
      .then(() => cloud.syncProgress())
      .then(() => {
        this.refreshLoginState();
        wx.showToast({
          title: "已同步",
          icon: "success"
        });
      })
      .catch(() => {
        wx.showToast({
          title: "同步失败，请检查云开发",
          icon: "none"
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

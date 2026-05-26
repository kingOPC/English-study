const store = require("../../utils/store");

Page({
  data: {
    words: []
  },

  onShow() {
    this.setData({
      words: store.getMistakeWords()
    });
  },

  startMistakeQuiz() {
    wx.navigateTo({
      url: "/pages/quiz/quiz?mode=mistakes"
    });
  }
});

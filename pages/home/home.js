const store = require("../../utils/store");

Page({
  data: {
    stats: {},
    mistakeCount: 0,
    levels: []
  },

  onShow() {
    const levels = store.books.map((book) => ({
      ...book,
      badge: book.id === "elementary" ? "小" : book.id === "high_school" ? "高" : "C",
      tone: book.id === "elementary" ? "elementary" : book.id === "high_school" ? "high" : "cet",
      summary: store.getLevelSummary(book.id)
    }));
    this.setData({
      stats: store.getStats(),
      mistakeCount: store.getMistakeWords().length,
      levels
    });
  },

  startLevelQuiz(event) {
    const level = event.currentTarget.dataset.level;
    wx.navigateTo({
      url: `/pages/quiz/quiz?mode=level&level=${level}`
    });
  },

  startMistakeQuiz() {
    if (!this.data.mistakeCount) return;
    wx.navigateTo({
      url: "/pages/quiz/quiz?mode=mistakes"
    });
  }
});

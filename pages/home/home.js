const store = require("../../utils/store");

Page({
  data: {
    stats: {},
    mistakeCount: 0,
    levels: [],
    vocabularyTotal: 0
  },

  onShow() {
    const levels = store.books.map((book) => {
      const summary = store.getLevelSummary(book.id);
      return {
        ...book,
        badge: book.id === "elementary" ? "小" : book.id === "high_school" ? "高" : "C",
        tone: book.id === "elementary" ? "elementary" : book.id === "high_school" ? "high" : "cet",
        summary,
        learnedPercent: summary.total ? Math.round((summary.learned / summary.total) * 100) : 0
      };
    });
    this.setData({
      stats: store.getStats(),
      mistakeCount: store.getMistakeWords().length,
      levels,
      vocabularyTotal: store.words.length
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

const store = require("../../utils/store");

Page({
  data: {
    words: [],
    currentIndex: 0,
    current: null,
    showAnswer: false
  },

  onLoad() {
    const task = store.getDailyTask();
    this.setData({
      words: task.words,
      current: task.words[0] || null
    });
  },

  reveal() {
    this.setData({
      showAnswer: true
    });
  },

  grade(event) {
    const grade = event.currentTarget.dataset.grade;
    const current = this.data.current;
    if (!current) return;
    store.answerWord(current.id, grade);

    const nextIndex = this.data.currentIndex + 1;
    this.setData({
      currentIndex: nextIndex,
      current: this.data.words[nextIndex] || null,
      showAnswer: false
    });
  },

  backHome() {
    wx.switchTab({
      url: "/pages/home/home"
    });
  }
});

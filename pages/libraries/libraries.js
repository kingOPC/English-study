const store = require("../../utils/store");

Page({
  data: {
    books: [],
    settings: {},
    totalWords: 0,
    activeCount: 0
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const settings = store.getSettings();
    const books = store.books.map((book) => {
      const summary = store.getLevelSummary(book.id);
      return {
        ...book,
        active: settings.activeBooks.includes(book.id),
        tone: book.id === "elementary" ? "elementary" : book.id === "high_school" ? "high" : "cet",
        label: book.id === "elementary" ? "基础" : book.id === "high_school" ? "进阶" : "拓展",
        summary,
        learnedPercent: summary.total ? Math.round((summary.learned / summary.total) * 100) : 0
      };
    });
    this.setData({
      books,
      settings,
      totalWords: store.words.length,
      activeCount: settings.activeBooks.length
    });
  },

  toggleBook(event) {
    const id = event.currentTarget.dataset.id;
    const enabled = event.detail.value;
    const settings = store.getSettings();
    const activeBooks = enabled
      ? Array.from(new Set([...settings.activeBooks, id]))
      : settings.activeBooks.filter((bookId) => bookId !== id);

    if (!activeBooks.length) {
      wx.showToast({
        title: "至少保留一个词库",
        icon: "none"
      });
      this.refresh();
      return;
    }

    store.saveSettings({
      ...settings,
      activeBooks
    });
    this.refresh();
  },

  changeNumber(event) {
    const field = event.currentTarget.dataset.field;
    const value = Math.max(Number(event.detail.value) || 1, 1);
    const settings = store.getSettings();
    store.saveSettings({
      ...settings,
      [field]: value
    });
    this.refresh();
  }
});

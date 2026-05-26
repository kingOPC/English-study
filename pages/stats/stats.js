const store = require("../../utils/store");

Page({
  data: {
    stats: {},
    advice: ""
  },

  onShow() {
    const stats = store.getStats();
    const advice = stats.mistakes > 10
      ? "最近错词偏多，建议明天先复习错词，再加新词。"
      : "节奏不错。保持每天少量新词和及时复习，比一次背很多更稳。";
    this.setData({
      stats,
      advice
    });
  }
});

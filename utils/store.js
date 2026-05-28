const { words, books } = require("./words");

const KEYS = {
  progress: "progress",
  settings: "settings",
  reviewLogs: "reviewLogs"
};

const defaultSettings = {
  activeBooks: ["elementary", "high_school", "cet"],
  dailyNewCount: 5,
  dailyReviewCount: 12
};

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ensureSeedData() {
  if (!wx.getStorageSync(KEYS.settings)) {
    wx.setStorageSync(KEYS.settings, defaultSettings);
  } else {
    migrateSettings();
  }
  const storedProgress = wx.getStorageSync(KEYS.progress);
  if (!storedProgress) {
    wx.setStorageSync(KEYS.progress, {});
  } else {
    wx.setStorageSync(KEYS.progress, storedProgress);
  }
  if (!wx.getStorageSync(KEYS.reviewLogs)) {
    wx.setStorageSync(KEYS.reviewLogs, []);
  }
}

function migrateSettings() {
  const settings = wx.getStorageSync(KEYS.settings);
  const validBookIds = books.map((book) => book.id);
  const activeBooks = (settings.activeBooks || [])
    .map((id) => (id === "cet4" || id === "cet6" ? "cet" : id))
    .filter((id, index, list) => validBookIds.includes(id) && list.indexOf(id) === index);

  wx.setStorageSync(KEYS.settings, {
    ...defaultSettings,
    ...settings,
    activeBooks: activeBooks.length ? activeBooks : defaultSettings.activeBooks
  });
}

function createProgress(wordId) {
  return {
    wordId,
    status: "new",
    ease: 0,
    mistakes: 0,
    correct: 0,
    nextReviewAt: todayKey(),
    lastReviewedAt: ""
  };
}

function getSettings() {
  return wx.getStorageSync(KEYS.settings) || defaultSettings;
}

function saveSettings(settings) {
  wx.setStorageSync(KEYS.settings, settings);
}

function getProgress() {
  ensureSeedData();
  return wx.getStorageSync(KEYS.progress) || {};
}

function saveProgress(progress) {
  wx.setStorageSync(KEYS.progress, progress);
}

function resetLearningData() {
  wx.setStorageSync(KEYS.progress, {});
  wx.setStorageSync(KEYS.reviewLogs, []);
}

function getActiveWords() {
  const settings = getSettings();
  return words.filter((word) => settings.activeBooks.includes(word.level));
}

function getWordsByLevel(level) {
  return words.filter((word) => word.level === level);
}

function getWordById(id) {
  return words.find((word) => word.id === id);
}

function addDays(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDailyTask() {
  const settings = getSettings();
  const progress = getProgress();
  const today = todayKey();
  const activeWords = getActiveWords();

  const dueWords = activeWords
    .filter((word) => {
      const item = progress[word.id] || createProgress(word.id);
      return item.nextReviewAt <= today && item.status !== "new";
    })
    .sort((a, b) => {
      const progressA = progress[a.id] || createProgress(a.id);
      const progressB = progress[b.id] || createProgress(b.id);
      return progressB.mistakes - progressA.mistakes;
    })
    .slice(0, settings.dailyReviewCount);

  const newWords = activeWords
    .filter((word) => {
      const item = progress[word.id] || createProgress(word.id);
      return item.status === "new";
    })
    .slice(0, settings.dailyNewCount);

  return {
    date: today,
    reviewWords: dueWords,
    newWords,
    words: [...dueWords, ...newWords]
  };
}

function answerWord(wordId, grade) {
  const progress = getProgress();
  const current = progress[wordId] || createProgress(wordId);
  const today = todayKey();
  const intervals = {
    again: 0,
    hard: 1,
    good: 3,
    easy: 7
  };
  const nextEase = grade === "again" ? 0 : Math.min((current.ease || 0) + (grade === "easy" ? 2 : 1), 5);

  progress[wordId] = {
    ...current,
    status: nextEase >= 4 ? "mastered" : "learning",
    ease: nextEase,
    mistakes: grade === "again" ? current.mistakes + 1 : current.mistakes,
    correct: grade === "again" ? current.correct : current.correct + 1,
    nextReviewAt: addDays(today, intervals[grade]),
    lastReviewedAt: today
  };
  saveProgress(progress);

  const logs = wx.getStorageSync(KEYS.reviewLogs) || [];
  logs.unshift({
    wordId,
    grade,
    date: today,
    time: Date.now()
  });
  wx.setStorageSync(KEYS.reviewLogs, logs.slice(0, 500));
}

function getMistakeWords() {
  const progress = getProgress();
  return words
    .filter((word) => {
      const item = progress[word.id] || createProgress(word.id);
      return item.mistakes > 0;
    })
    .sort((a, b) => {
      const progressA = progress[a.id] || createProgress(a.id);
      const progressB = progress[b.id] || createProgress(b.id);
      return progressB.mistakes - progressA.mistakes;
    })
    .map((word) => ({
      ...word,
      progress: progress[word.id] || createProgress(word.id)
    }));
}

function getMistakeWordsByLevel(level) {
  return getMistakeWords().filter((word) => !level || word.level === level);
}

function getLevelSummary(level) {
  const progress = getProgress();
  const levelWords = getWordsByLevel(level);
  const values = levelWords.map((word) => progress[word.id] || createProgress(word.id));
  const learned = values.filter((item) => item.status !== "new").length;
  const mastered = values.filter((item) => item.status === "mastered").length;
  const mistakes = values.reduce((sum, item) => sum + item.mistakes, 0);

  return {
    total: levelWords.length,
    learned,
    mastered,
    mistakes
  };
}

function getStats() {
  const progress = getProgress();
  const activeWords = getActiveWords();
  const values = activeWords
    .map((word) => progress[word.id] || createProgress(word.id));
  const learned = values.filter((item) => item.status !== "new").length;
  const mastered = values.filter((item) => item.status === "mastered").length;
  const mistakes = values.reduce((sum, item) => sum + item.mistakes, 0);
  const correct = values.reduce((sum, item) => sum + item.correct, 0);
  const totalAnswers = mistakes + correct;

  return {
    activeTotal: activeWords.length,
    learned,
    mastered,
    mistakes,
    accuracy: totalAnswers ? Math.round((correct / totalAnswers) * 100) : 0
  };
}

module.exports = {
  books,
  words,
  ensureSeedData,
  getSettings,
  saveSettings,
  getProgress,
  resetLearningData,
  getActiveWords,
  getWordsByLevel,
  getWordById,
  getDailyTask,
  answerWord,
  getMistakeWords,
  getMistakeWordsByLevel,
  getLevelSummary,
  getStats
};

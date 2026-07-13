const store = require("../../utils/store");
const cloud = require("../../utils/cloud");

const optionKeys = ["A", "B", "C", "D"];
const QUIZ_SIZE = 10;

function shuffle(items) {
  return items
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function getSourceWords(options) {
  if (options.mode === "mistakes") {
    return store.getMistakeWordsByLevel(options.level);
  }
  if (options.level) {
    return store.getWordsByLevel(options.level);
  }
  return store.getActiveWords();
}

function buildQuestions(options) {
  const sourceWords = getSourceWords(options);
  const allWords = store.words;
  return shuffle(sourceWords).slice(0, QUIZ_SIZE).map((word) => {
    const distractors = shuffle(allWords.filter((item) => (
      item.id !== word.id
      && item.text.toLowerCase() !== word.text.toLowerCase()
      && item.meaning !== word.meaning
    ))).slice(0, 3);
    const optionsWithKeys = shuffle([word, ...distractors]).map((item, index) => ({
      ...item,
      key: optionKeys[index]
    }));
    return {
      word,
      options: optionsWithKeys
    };
  });
}

function getModeTitle(options) {
  if (options.mode === "mistakes") return "错题复测";
  const book = store.books.find((item) => item.id === options.level);
  return book ? `${book.name}挑战` : "词汇挑战";
}

Page({
  data: {
    questions: [],
    currentIndex: 0,
    current: null,
    answered: false,
    selectedId: "",
    isCorrect: false,
    isLast: false,
    score: 0,
    total: 0,
    modeTitle: "词汇挑战",
    progressPercent: 0,
    wrongWordIds: [],
    quizMode: "level",
    quizLevel: ""
  },

  onLoad(options) {
    const questions = buildQuestions(options);
    this.setData({
      questions,
      current: questions[0] || null,
      total: questions.length,
      isLast: questions.length <= 1,
      modeTitle: getModeTitle(options),
      progressPercent: questions.length ? Math.round((1 / questions.length) * 100) : 0,
      quizMode: options.mode || "level",
      quizLevel: options.level || ""
    });
  },

  choose(event) {
    if (this.data.answered) return;
    const selectedId = event.currentTarget.dataset.id;
    const current = this.data.current;
    const isCorrect = selectedId === current.word.id;
    store.answerWord(current.word.id, isCorrect ? "good" : "again");
    const wrongWordIds = isCorrect
      ? this.data.wrongWordIds
      : Array.from(new Set([...this.data.wrongWordIds, current.word.id]));
    this.setData({
      answered: true,
      selectedId,
      isCorrect,
      score: this.data.score + (isCorrect ? 1 : 0),
      wrongWordIds
    });
  },

  nextQuestion() {
    const nextIndex = this.data.currentIndex + 1;
    const next = this.data.questions[nextIndex] || null;
    const total = this.data.questions.length;
    if (!next) {
      this.saveResult();
    }
    this.setData({
      currentIndex: nextIndex,
      current: next,
      answered: false,
      selectedId: "",
      isCorrect: false,
      isLast: nextIndex >= total - 1,
      progressPercent: next ? Math.round(((nextIndex + 1) / total) * 100) : 100
    });
  },

  saveResult() {
    cloud.saveQuizLog({
      mode: this.data.quizMode,
      level: this.data.quizLevel,
      score: this.data.score,
      total: this.data.total,
      wrongWordIds: this.data.wrongWordIds
    });
    cloud.syncProgress();
  },

  backHome() {
    wx.switchTab({
      url: "/pages/home/home"
    });
  }
});

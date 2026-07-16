const store = require("../../utils/store");
const cloud = require("../../utils/cloud");

const optionKeys = ["A", "B", "C", "D"];
const QUIZ_SIZE = 10;
const usageOverrides = {
  a: ["I saw a bird in the tree.", "我看见树上有一只鸟。"],
  the: ["The book on the desk is mine.", "桌子上的那本书是我的。"],
  be: ["You can be a better learner.", "你可以成为一名更优秀的学习者。"],
  can: ["I can finish the task today.", "我今天能完成这项任务。"],
  could: ["Could you open the window?", "你可以打开窗户吗？"],
  may: ["It may rain this afternoon.", "今天下午可能会下雨。"],
  must: ["We must follow the rules.", "我们必须遵守规则。"],
  should: ["You should check your answer.", "你应该检查一下答案。"],
  will: ["I will call you after school.", "放学后我会给你打电话。"],
  would: ["I would like a glass of water.", "我想要一杯水。"],
  and: ["Tom and Lily are classmates.", "汤姆和莉莉是同学。"],
  but: ["The question is difficult but useful.", "这个问题很难，但很有用。"],
  if: ["Call me if you need help.", "如果你需要帮助，就给我打电话。"],
  or: ["Would you like tea or coffee?", "你想喝茶还是咖啡？"],
  because: ["I stayed home because it was raining.", "因为下雨了，所以我待在家里。"],
  with: ["She went to the library with her friend.", "她和朋友一起去了图书馆。"],
  from: ["This letter is from my teacher.", "这封信来自我的老师。"],
  for: ["This gift is for you.", "这份礼物是给你的。"],
  in: ["The keys are in my bag.", "钥匙在我的包里。"],
  on: ["The picture is on the wall.", "这幅画在墙上。"],
  to: ["We walked to school together.", "我们一起步行去学校。"]
};

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

function getDistractors(word, allWords, startIndex) {
  const distractors = [];
  const usedTexts = new Set([word.text.toLowerCase()]);
  const usedMeanings = new Set([word.meaning]);

  for (let offset = 0; offset < allWords.length; offset += 1) {
    const item = allWords[(startIndex + offset) % allWords.length];
    const text = item.text.toLowerCase();
    if (usedTexts.has(text) || usedMeanings.has(item.meaning)) continue;
    distractors.push(item);
    usedTexts.add(text);
    usedMeanings.add(item.meaning);
    if (distractors.length === 3) break;
  }

  return distractors;
}

function buildQuestions(options) {
  const sourceWords = getSourceWords(options);
  const allWords = store.words;
  const questionWords = shuffle(sourceWords).slice(0, QUIZ_SIZE);
  const distractorPool = shuffle(allWords);
  return questionWords.map((word, index) => {
    const startIndex = Math.floor((index * distractorPool.length) / questionWords.length);
    const distractors = getDistractors(word, distractorPool, startIndex);
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

function getCoreMeaning(word) {
  return (word.meaning || "这个词")
    .split(/[；;,，]/)[0]
    .replace(/……/g, "")
    .replace(/的$/, "");
}

function buildUsage(word, role, label) {
  const override = usageOverrides[word.text.toLowerCase()];
  if (override) {
    return {
      id: `${role}_${word.id}`,
      role,
      label,
      word: word.text,
      phonetic: word.phonetic,
      sentence: override[0],
      translation: override[1]
    };
  }

  const part = (word.partOfSpeech || "").toLowerCase();
  const meaning = getCoreMeaning(word);
  let sentence;
  let translation;

  if (part.includes("vt.")) {
    sentence = `They tried to ${word.text} it.`;
    translation = `他们试着${meaning}它。`;
  } else if (part.includes("vi.")) {
    sentence = `They began to ${word.text}.`;
    translation = `他们开始${meaning}。`;
  } else if (part.includes("v.")) {
    sentence = `We learned how to ${word.text}.`;
    translation = `我们学习了如何${meaning}。`;
  } else if (part.startsWith("adj.") || part === "a.") {
    sentence = `The teacher described it as ${word.text}.`;
    translation = `老师把它描述为${meaning}。`;
  } else if (part.includes("adv.")) {
    sentence = `She explained it ${word.text}.`;
    translation = `她${meaning}地解释了这件事。`;
  } else if (part.includes("n.")) {
    sentence = `We learned about ${word.text} today.`;
    translation = `我们今天学习了与“${meaning}”有关的内容。`;
  } else {
    sentence = `We learned how to use "${word.text}" today.`;
    translation = `我们今天学习了如何使用“${word.text}”这个词。`;
  }

  return {
    id: `${role}_${word.id}`,
    role,
    label,
    word: word.text,
    phonetic: word.phonetic,
    sentence,
    translation
  };
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
    quizLevel: "",
    usageExamples: []
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
    const selectedWord = current.options.find((item) => item.id === selectedId);
    const isCorrect = selectedId === current.word.id;
    store.answerWord(current.word.id, isCorrect ? "good" : "again");
    const wrongWordIds = isCorrect
      ? this.data.wrongWordIds
      : Array.from(new Set([...this.data.wrongWordIds, current.word.id]));
    const usageExamples = isCorrect
      ? [buildUsage(current.word, "correct", "你的选择")]
      : [
        buildUsage(selectedWord, "selected", "你的选择"),
        buildUsage(current.word, "correct", "本题单词")
      ];
    this.setData({
      answered: true,
      selectedId,
      isCorrect,
      score: this.data.score + (isCorrect ? 1 : 0),
      wrongWordIds,
      usageExamples
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
      usageExamples: [],
      isLast: nextIndex >= total - 1,
      progressPercent: next ? Math.round(((nextIndex + 1) / total) * 100) : 100
    });
  },

  saveResult() {
    const saveLog = cloud.saveQuizLog({
      mode: this.data.quizMode,
      level: this.data.quizLevel,
      score: this.data.score,
      total: this.data.total,
      wrongWordIds: this.data.wrongWordIds
    }).catch((error) => {
      console.error("save quiz log failed; result remains local", error);
    });
    const sync = cloud.syncProgress().catch((error) => {
      console.error("sync progress failed; progress remains local", error);
    });
    return Promise.all([saveLog, sync]);
  },

  backHome() {
    wx.switchTab({
      url: "/pages/home/home"
    });
  }
});

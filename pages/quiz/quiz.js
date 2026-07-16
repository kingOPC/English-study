const store = require("../../utils/store");
const cloud = require("../../utils/cloud");

const optionKeys = ["A", "B", "C", "D"];
const QUIZ_SIZE = 10;
const usageOverrides = {
  a: ["I saw a bird in the tree.", "我看见树上有一只鸟。", "She bought a new notebook.", "她买了一本新笔记本。"],
  the: ["The book on the desk is mine.", "桌子上的那本书是我的。", "Please close the door.", "请把门关上。"],
  be: ["You can be a better learner.", "你可以成为一名更优秀的学习者。", "Be careful on the road.", "在路上要小心。"],
  can: ["I can finish the task today.", "我今天能完成这项任务。", "Can you help me with this question?", "你能帮我解答这道题吗？"],
  could: ["Could you open the window?", "你可以打开窗户吗？", "We could meet after class.", "我们可以课后见面。"],
  may: ["It may rain this afternoon.", "今天下午可能会下雨。", "You may use my dictionary.", "你可以使用我的词典。"],
  must: ["We must follow the rules.", "我们必须遵守规则。", "You must finish your homework first.", "你必须先完成作业。"],
  should: ["You should check your answer.", "你应该检查一下答案。", "We should help each other.", "我们应该互相帮助。"],
  will: ["I will call you after school.", "放学后我会给你打电话。", "She will arrive tomorrow.", "她明天会到达。"],
  would: ["I would like a glass of water.", "我想要一杯水。", "Would you join our study group?", "你愿意加入我们的学习小组吗？"],
  and: ["Tom and Lily are classmates.", "汤姆和莉莉是同学。", "Read the question and choose an answer.", "阅读题目并选择一个答案。"],
  but: ["The question is difficult but useful.", "这个问题很难，但很有用。", "He is tired, but he keeps studying.", "他很累，但仍继续学习。"],
  if: ["Call me if you need help.", "如果你需要帮助，就给我打电话。", "If it is sunny, we will go outside.", "如果天气晴朗，我们就出去。"],
  or: ["Would you like tea or coffee?", "你想喝茶还是咖啡？", "You can walk or take the bus.", "你可以步行或乘公共汽车。"],
  because: ["I stayed home because it was raining.", "因为下雨了，所以我待在家里。", "She smiled because she passed the test.", "她因为通过了考试而微笑。"],
  with: ["She went to the library with her friend.", "她和朋友一起去了图书馆。", "Write the answer with a pencil.", "用铅笔写答案。"],
  from: ["This letter is from my teacher.", "这封信来自我的老师。", "We study from Monday to Friday.", "我们从星期一学习到星期五。"],
  for: ["This gift is for you.", "这份礼物是给你的。", "We waited for the school bus.", "我们等候校车。"],
  in: ["The keys are in my bag.", "钥匙在我的包里。", "We have English class in the morning.", "我们上午有英语课。"],
  into: ["She walked into the classroom.", "她走进了教室。", "Pour the water into the glass.", "把水倒进玻璃杯里。"],
  on: ["The picture is on the wall.", "这幅画在墙上。", "The meeting starts on Monday.", "会议星期一开始。"],
  to: ["We walked to school together.", "我们一起步行去学校。", "Please listen to the teacher.", "请听老师讲课。"],
  at: ["Meet me at the school gate.", "在学校门口和我见面。", "She is good at English.", "她擅长英语。"],
  by: ["The novel was written by him.", "这部小说是他写的。", "I sat by the window.", "我坐在窗边。"],
  about: ["We talked about the new plan.", "我们讨论了新计划。", "About twenty students joined the club.", "大约二十名学生加入了社团。"],
  as: ["She works as a teacher.", "她是一名教师。", "Do as the teacher says.", "按照老师说的做。"],
  than: ["My brother is taller than me.", "我哥哥比我高。", "Reading is more useful than waiting.", "阅读比等待更有用。"],
  when: ["Call me when you arrive.", "你到达时给我打电话。", "When does the class begin?", "这节课什么时候开始？"],
  which: ["Which book do you prefer?", "你更喜欢哪一本书？", "I do not know which answer is right.", "我不知道哪个答案是对的。"],
  who: ["Who is your English teacher?", "谁是你的英语老师？", "Do you know who called me?", "你知道是谁给我打电话的吗？"],
  what: ["What does this word mean?", "这个单词是什么意思？", "Tell me what you learned today.", "告诉我你今天学到了什么。"]
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

function buildUsage(word, role, label, variant = 0) {
  const override = usageOverrides[word.text.toLowerCase()];
  if (override) {
    const offset = variant === 1 ? 2 : 0;
    return {
      id: `${role}_${word.id}_${variant}`,
      role,
      label,
      word: word.text,
      phonetic: word.phonetic,
      sentence: override[offset],
      translation: override[offset + 1]
    };
  }

  const part = (word.partOfSpeech || "").toLowerCase();
  const meaning = getCoreMeaning(word);
  let sentence;
  let translation;

  if (part.includes("vt.")) {
    sentence = variant === 1 ? `Please ${word.text} it before class.` : `They tried to ${word.text} it.`;
    translation = variant === 1 ? `请在课前${meaning}它。` : `他们试着${meaning}它。`;
  } else if (part.includes("vi.")) {
    sentence = variant === 1 ? `They will ${word.text} soon.` : `They began to ${word.text}.`;
    translation = variant === 1 ? `他们很快会${meaning}。` : `他们开始${meaning}。`;
  } else if (part.includes("v.")) {
    sentence = variant === 1 ? `Try to ${word.text} every day.` : `We learned how to ${word.text}.`;
    translation = variant === 1 ? `试着每天${meaning}。` : `我们学习了如何${meaning}。`;
  } else if (part.startsWith("adj.") || part === "a.") {
    sentence = variant === 1 ? `It seems ${word.text} to me.` : `The teacher described it as ${word.text}.`;
    translation = variant === 1 ? `在我看来，它似乎很${meaning}。` : `老师把它描述为${meaning}。`;
  } else if (part.includes("adv.")) {
    sentence = variant === 1 ? `He completed the task ${word.text}.` : `She explained it ${word.text}.`;
    translation = variant === 1 ? `他${meaning}地完成了任务。` : `她${meaning}地解释了这件事。`;
  } else if (part.includes("n.")) {
    sentence = variant === 1 ? `This lesson helped us understand ${word.text}.` : `We learned about ${word.text} today.`;
    translation = variant === 1 ? `这节课帮助我们理解了${meaning}。` : `我们今天学习了与“${meaning}”有关的内容。`;
  } else {
    sentence = variant === 1
      ? `I wrote the word "${word.text}" in my notebook.`
      : `We learned how to use "${word.text}" today.`;
    translation = variant === 1
      ? `我把“${word.text}”这个词写在了笔记本上。`
      : `我们今天学习了如何使用“${word.text}”这个词。`;
  }

  return {
    id: `${role}_${word.id}_${variant}`,
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
      ? [
        buildUsage(current.word, "correct", "例句 1", 0),
        buildUsage(current.word, "correct", "例句 2", 1)
      ]
      : [
        buildUsage(selectedWord, "selected", "你的选择", 0),
        buildUsage(current.word, "correct", "本题单词", 0)
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

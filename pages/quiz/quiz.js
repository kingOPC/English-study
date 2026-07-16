const store = require("../../utils/store");
const cloud = require("../../utils/cloud");
const examplesByWord = require("../../utils/examples");

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

function hashWord(text) {
  return text.split("").reduce((result, character) => result + character.charCodeAt(0), 0);
}

function pickTemplate(templates, word, variant) {
  const index = (hashWord(word.text) + variant) % templates.length;
  return templates[index](word.text, getCoreMeaning(word));
}

function buildFallbackUsage(word, variant) {
  const part = (word.partOfSpeech || "").toLowerCase();
  const nounTemplates = [
    (text, meaning) => [`The class discussed ${text} in detail.`, `全班详细讨论了${meaning}。`],
    (text, meaning) => [`The article provides useful information about ${text}.`, `这篇文章提供了有关${meaning}的有用信息。`],
    (text, meaning) => [`The teacher asked us to explain ${text} in our own words.`, `老师让我们用自己的话解释${meaning}。`],
    (text, meaning) => [`We found a clear example of ${text} in the text.`, `我们在文中找到了一个关于${meaning}的清晰例子。`],
    (text, meaning) => [`Understanding ${text} can help us read more carefully.`, `理解${meaning}能帮助我们更认真地阅读。`],
    (text, meaning) => [`Our lesson included a short discussion of ${text}.`, `我们的课程包含了一段关于${meaning}的简短讨论。`]
  ];
  const transitiveTemplates = [
    (text, meaning) => [`They tried to ${text} it before class.`, `他们试着在课前${meaning}它。`],
    (text, meaning) => [`Please ${text} the key point carefully.`, `请认真${meaning}这个要点。`],
    (text, meaning) => [`We need to ${text} this problem together.`, `我们需要一起${meaning}这个问题。`],
    (text, meaning) => [`The teacher showed us how to ${text} the material.`, `老师向我们展示了如何${meaning}这些材料。`],
    (text, meaning) => [`She decided to ${text} the plan after discussion.`, `讨论后，她决定${meaning}这个计划。`],
    (text, meaning) => [`It is important to ${text} each detail.`, `${meaning}每个细节都很重要。`]
  ];
  const intransitiveTemplates = [
    (text, meaning) => [`They began to ${text} after the bell rang.`, `铃响后，他们开始${meaning}。`],
    (text, meaning) => [`We waited for them to ${text}.`, `我们等着他们${meaning}。`],
    (text, meaning) => [`The students may ${text} at different times.`, `学生们可能会在不同时间${meaning}。`],
    (text, meaning) => [`He was the first to ${text}.`, `他是第一个${meaning}的人。`],
    (text, meaning) => [`They continued to ${text} despite the difficulty.`, `尽管有困难，他们仍继续${meaning}。`],
    (text, meaning) => [`It took them a long time to ${text}.`, `他们花了很长时间才${meaning}。`]
  ];
  const verbTemplates = [
    (text, meaning) => [`We learned how to ${text} in class.`, `我们在课堂上学习了如何${meaning}。`],
    (text, meaning) => [`The teacher asked us to ${text} carefully.`, `老师让我们认真${meaning}。`],
    (text, meaning) => [`It is useful to know when to ${text}.`, `知道什么时候该${meaning}很有用。`],
    (text, meaning) => [`Students practiced how to ${text} correctly.`, `学生们练习了如何正确地${meaning}。`],
    (text, meaning) => [`They decided to ${text} after discussion.`, `讨论后，他们决定${meaning}。`],
    (text, meaning) => [`The lesson showed us why people ${text}.`, `这节课让我们明白人们为什么会${meaning}。`]
  ];
  const adjectiveTemplates = [
    (text, meaning) => [`The teacher described the result as ${text}.`, `老师把这个结果描述为${meaning}。`],
    (text, meaning) => [`The situation became more ${text} over time.`, `随着时间推移，情况变得更加${meaning}。`],
    (text, meaning) => [`It seemed ${text} at first.`, `起初它似乎很${meaning}。`],
    (text, meaning) => [`The article gives a ${text} example.`, `这篇文章给出了一个${meaning}的例子。`],
    (text, meaning) => [`We found the idea both useful and ${text}.`, `我们发现这个想法既有用又${meaning}。`],
    (text, meaning) => [`Her explanation was clear and ${text}.`, `她的解释清楚而且${meaning}。`]
  ];
  const adverbTemplates = [
    (text, meaning) => [`She explained the idea ${text}.`, `她${meaning}地解释了这个想法。`],
    (text, meaning) => [`He completed the task ${text}.`, `他${meaning}地完成了任务。`],
    (text, meaning) => [`The students listened ${text}.`, `学生们${meaning}地听着。`],
    (text, meaning) => [`Please read the sentence ${text}.`, `请${meaning}地朗读这个句子。`],
    (text, meaning) => [`They responded ${text} to the question.`, `他们${meaning}地回答了这个问题。`],
    (text, meaning) => [`The teacher spoke ${text} during the lesson.`, `老师在课堂上${meaning}地讲话。`]
  ];
  const otherTemplates = [
    (text) => [`The teacher used "${text}" in a new sentence.`, `老师在一个新句子中使用了“${text}”。`],
    (text) => [`We compared two sentences containing "${text}".`, `我们比较了两个含有“${text}”的句子。`],
    (text) => [`I marked the word "${text}" in my notebook.`, `我在笔记本中标记了“${text}”这个词。`],
    (text) => [`The class practiced using "${text}" in context.`, `全班练习了在语境中使用“${text}”。`],
    (text) => [`Can you find "${text}" in the passage?`, `你能在文章中找到“${text}”吗？`],
    (text) => [`We reviewed the word "${text}" after class.`, `我们课后复习了“${text}”这个词。`]
  ];

  if (part.includes("vt.")) return pickTemplate(transitiveTemplates, word, variant);
  if (part.includes("vi.")) return pickTemplate(intransitiveTemplates, word, variant);
  if (part.includes("v.")) return pickTemplate(verbTemplates, word, variant);
  if (part.startsWith("adj.") || part === "a.") return pickTemplate(adjectiveTemplates, word, variant);
  if (part.includes("adv.")) return pickTemplate(adverbTemplates, word, variant);
  if (part.includes("n.")) return pickTemplate(nounTemplates, word, variant);
  return pickTemplate(otherTemplates, word, variant);
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

  const corpusExample = (examplesByWord[word.text.toLowerCase()] || [])[variant];
  if (corpusExample) {
    return {
      id: `${role}_${word.id}_${variant}`,
      role,
      label,
      word: word.text,
      phonetic: word.phonetic,
      ...corpusExample
    };
  }

  const fallback = buildFallbackUsage(word, variant);

  return {
    id: `${role}_${word.id}_${variant}`,
    role,
    label,
    word: word.text,
    phonetic: word.phonetic,
    sentence: fallback[0],
    translation: fallback[1],
    source: "词义辅助句"
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
    let usageExamples;
    if (isCorrect) {
      usageExamples = [
        buildUsage(current.word, "correct", "例句 1", 0),
        buildUsage(current.word, "correct", "例句 2", 1)
      ];
    } else {
      const selectedUsage = buildUsage(selectedWord, "selected", "你的选择", 0);
      let correctUsage = buildUsage(current.word, "correct", "本题单词", 0);
      if (correctUsage.sentence === selectedUsage.sentence) {
        correctUsage = buildUsage(current.word, "correct", "本题单词", 1);
      }
      usageExamples = [selectedUsage, correctUsage];
    }
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

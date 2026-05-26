const words = [
  {
    id: "el_animal",
    text: "animal",
    phonetic: "/ˈænɪml/",
    level: "elementary",
    book: "小学基础",
    partOfSpeech: "n.",
    meaning: "动物",
    example: "The panda is my favorite animal.",
    collocation: "wild animal",
    note: "小学常见名词，注意复数 animals。"
  },
  {
    id: "el_weather",
    text: "weather",
    phonetic: "/ˈweðə(r)/",
    level: "elementary",
    book: "小学基础",
    partOfSpeech: "n.",
    meaning: "天气",
    example: "The weather is sunny today.",
    collocation: "good weather",
    note: "不可数名词，不说 a weather。"
  },
  {
    id: "el_library",
    text: "library",
    phonetic: "/ˈlaɪbrəri/",
    level: "elementary",
    book: "小学基础",
    partOfSpeech: "n.",
    meaning: "图书馆",
    example: "I read books in the library.",
    collocation: "school library",
    note: "注意拼写，不要漏掉 r。"
  },
  {
    id: "el_important",
    text: "important",
    phonetic: "/ɪmˈpɔːtnt/",
    level: "elementary",
    book: "小学基础",
    partOfSpeech: "adj.",
    meaning: "重要的",
    example: "English is an important subject.",
    collocation: "be important to",
    note: "常用于表达某事很重要。"
  },
  {
    id: "el_because",
    text: "because",
    phonetic: "/bɪˈkɒz/",
    level: "elementary",
    book: "小学基础",
    partOfSpeech: "conj.",
    meaning: "因为",
    example: "I like English because it is useful.",
    collocation: "because of",
    note: "because 后接句子，because of 后接名词。"
  },
  {
    id: "el_careful",
    text: "careful",
    phonetic: "/ˈkeəfl/",
    level: "elementary",
    book: "小学基础",
    partOfSpeech: "adj.",
    meaning: "仔细的；小心的",
    example: "Be careful when you cross the road.",
    collocation: "be careful with",
    note: "常用于提醒注意安全或细节。"
  },
  {
    id: "el_finish",
    text: "finish",
    phonetic: "/ˈfɪnɪʃ/",
    level: "elementary",
    book: "小学基础",
    partOfSpeech: "v.",
    meaning: "完成；结束",
    example: "I finish my homework before dinner.",
    collocation: "finish doing sth.",
    note: "finish 后面接动词 ing 形式。"
  },
  {
    id: "el_healthy",
    text: "healthy",
    phonetic: "/ˈhelθi/",
    level: "elementary",
    book: "小学基础",
    partOfSpeech: "adj.",
    meaning: "健康的",
    example: "Fruit and vegetables are healthy food.",
    collocation: "keep healthy",
    note: "注意 healthy 是形容词，health 是名词。"
  },
  {
    id: "el_question",
    text: "question",
    phonetic: "/ˈkwestʃən/",
    level: "elementary",
    book: "小学基础",
    partOfSpeech: "n.",
    meaning: "问题",
    example: "Can I ask you a question?",
    collocation: "answer a question",
    note: "常和 ask、answer 搭配。"
  },
  {
    id: "el_together",
    text: "together",
    phonetic: "/təˈɡeðə(r)/",
    level: "elementary",
    book: "小学基础",
    partOfSpeech: "adv.",
    meaning: "一起",
    example: "We study together after school.",
    collocation: "work together",
    note: "表示共同做某事。"
  },
  {
    id: "hs_approach",
    text: "approach",
    phonetic: "/əˈprəʊtʃ/",
    level: "high_school",
    book: "高中核心",
    partOfSpeech: "n./v.",
    meaning: "方法；接近；处理",
    example: "We need a new approach to solving this problem.",
    collocation: "an approach to doing sth.",
    note: "阅读中常考“方法、途径”，不只是“接近”。"
  },
  {
    id: "hs_concern",
    text: "concern",
    phonetic: "/kənˈsɜːn/",
    level: "high_school",
    book: "高中核心",
    partOfSpeech: "n./v.",
    meaning: "担心；涉及；关心",
    example: "The report concerns the safety of students.",
    collocation: "be concerned about",
    note: "既可表示“担忧”，也可表示“涉及”。"
  },
  {
    id: "hs_available",
    text: "available",
    phonetic: "/əˈveɪləbl/",
    level: "high_school",
    book: "高中核心",
    partOfSpeech: "adj.",
    meaning: "可获得的；有空的",
    example: "Tickets are available online.",
    collocation: "be available to sb.",
    note: "常用于资源、时间、服务是否可用。"
  },
  {
    id: "hs_account",
    text: "account",
    phonetic: "/əˈkaʊnt/",
    level: "high_school",
    book: "熟词生义",
    partOfSpeech: "n./v.",
    meaning: "账户；描述；解释；占比",
    example: "Students account for 60 percent of the visitors.",
    collocation: "account for",
    note: "account for 常考“解释”或“占……比例”。"
  },
  {
    id: "hs_analyze",
    text: "analyze",
    phonetic: "/ˈænəlaɪz/",
    level: "high_school",
    book: "高中核心",
    partOfSpeech: "v.",
    meaning: "分析",
    example: "We need to analyze the reasons for the change.",
    collocation: "analyze a problem",
    note: "阅读和写作中常用于分析原因、数据和问题。"
  },
  {
    id: "hs_benefit",
    text: "benefit",
    phonetic: "/ˈbenɪfɪt/",
    level: "high_school",
    book: "高中核心",
    partOfSpeech: "n./v.",
    meaning: "好处；使受益",
    example: "Reading benefits students in many ways.",
    collocation: "benefit from",
    note: "benefit from 表示“从……中受益”。"
  },
  {
    id: "hs_challenge",
    text: "challenge",
    phonetic: "/ˈtʃælɪndʒ/",
    level: "high_school",
    book: "高中核心",
    partOfSpeech: "n./v.",
    meaning: "挑战；质疑",
    example: "The new task is a real challenge for us.",
    collocation: "face a challenge",
    note: "既可作名词，也可作动词。"
  },
  {
    id: "hs_evidence",
    text: "evidence",
    phonetic: "/ˈevɪdəns/",
    level: "high_school",
    book: "高中核心",
    partOfSpeech: "n.",
    meaning: "证据",
    example: "There is clear evidence that exercise improves sleep.",
    collocation: "clear evidence",
    note: "通常作不可数名词。"
  },
  {
    id: "hs_require",
    text: "require",
    phonetic: "/rɪˈkwaɪə(r)/",
    level: "high_school",
    book: "高中核心",
    partOfSpeech: "v.",
    meaning: "需要；要求",
    example: "The job requires patience and careful planning.",
    collocation: "require sb. to do sth.",
    note: "常用于说明规则、任务或条件。"
  },
  {
    id: "hs_strategy",
    text: "strategy",
    phonetic: "/ˈstrætədʒi/",
    level: "high_school",
    book: "高中核心",
    partOfSpeech: "n.",
    meaning: "策略；方法",
    example: "A good learning strategy can save time.",
    collocation: "learning strategy",
    note: "作文中可用来表达“解决问题的方法”。"
  },
  {
    id: "cet4_access",
    text: "access",
    phonetic: "/ˈækses/",
    level: "cet",
    book: "四六级拓展",
    partOfSpeech: "n./v.",
    meaning: "进入权；使用机会；访问",
    example: "Students have access to the digital library.",
    collocation: "have access to",
    note: "to 是介词，后接名词或动名词。"
  },
  {
    id: "cet4_issue",
    text: "issue",
    phonetic: "/ˈɪʃuː/",
    level: "cet",
    book: "四六级拓展",
    partOfSpeech: "n./v.",
    meaning: "问题；议题；发布",
    example: "The school issued a new safety notice.",
    collocation: "issue a statement",
    note: "名词是“议题”，动词是“发布”。"
  },
  {
    id: "cet4_factor",
    text: "factor",
    phonetic: "/ˈfæktə(r)/",
    level: "cet",
    book: "四六级拓展",
    partOfSpeech: "n.",
    meaning: "因素；要素",
    example: "Sleep is an important factor in learning efficiency.",
    collocation: "a key factor in",
    note: "作文和阅读中都很高频。"
  },
  {
    id: "cet6_compensate",
    text: "compensate",
    phonetic: "/ˈkɒmpenseɪt/",
    level: "cet",
    book: "四六级拓展",
    partOfSpeech: "v.",
    meaning: "补偿；弥补",
    example: "Extra practice can compensate for lost time.",
    collocation: "compensate for",
    note: "常和 for 搭配。"
  },
  {
    id: "cet_assumption",
    text: "assumption",
    phonetic: "/əˈsʌmpʃn/",
    level: "cet",
    book: "四六级拓展",
    partOfSpeech: "n.",
    meaning: "假设；设想",
    example: "The plan is based on a wrong assumption.",
    collocation: "make an assumption",
    note: "阅读中常用于论证和观点分析。"
  },
  {
    id: "cet_capacity",
    text: "capacity",
    phonetic: "/kəˈpæsəti/",
    level: "cet",
    book: "四六级拓展",
    partOfSpeech: "n.",
    meaning: "能力；容量",
    example: "The hall has a seating capacity of 500.",
    collocation: "capacity for",
    note: "既可指人的能力，也可指空间容量。"
  },
  {
    id: "cet_consequence",
    text: "consequence",
    phonetic: "/ˈkɒnsɪkwəns/",
    level: "cet",
    book: "四六级拓展",
    partOfSpeech: "n.",
    meaning: "结果；后果",
    example: "Every decision has its consequences.",
    collocation: "as a consequence",
    note: "常用于说明因果关系。"
  },
  {
    id: "cet_decline",
    text: "decline",
    phonetic: "/dɪˈklaɪn/",
    level: "cet",
    book: "四六级拓展",
    partOfSpeech: "n./v.",
    meaning: "下降；拒绝",
    example: "The number of visitors declined last year.",
    collocation: "a decline in",
    note: "可表示数量下降，也可表示礼貌拒绝。"
  },
  {
    id: "cet_emerge",
    text: "emerge",
    phonetic: "/ɪˈmɜːdʒ/",
    level: "cet",
    book: "四六级拓展",
    partOfSpeech: "v.",
    meaning: "出现；浮现",
    example: "New problems may emerge during the project.",
    collocation: "emerge from",
    note: "常用于描述趋势、问题或事实出现。"
  },
  {
    id: "cet_maintain",
    text: "maintain",
    phonetic: "/meɪnˈteɪn/",
    level: "cet",
    book: "四六级拓展",
    partOfSpeech: "v.",
    meaning: "维持；保持；主张",
    example: "It is hard to maintain a healthy balance.",
    collocation: "maintain balance",
    note: "阅读里也可表示“坚持认为”。"
  }
];

const books = [
  {
    id: "elementary",
    name: "小学",
    description: "基础词汇和常见生活表达，适合打底和低压力练习。"
  },
  {
    id: "high_school",
    name: "高中",
    description: "高考阅读、完形和写作中最应该稳住的词。"
  },
  {
    id: "cet",
    name: "四六级",
    description: "适合词汇量较好的学生提前拓展，偏阅读和写作高频词。"
  }
];

module.exports = {
  words,
  books
};

/**
 * data.js
 * Structured learning content for Unit 1 (Making friends) and Unit 2 (Different families).
 * All content sourced from PEP_English_G3_up.md (人民教育出版社 PEP 三年级上册).
 *
 * Schema:
 *   UNITS = [ { id, title, theme, emoji, words, sentences, letters, levels: [ { id, day, focus, challenges: [ ... ] } ] } ]
 *
 * Challenge types (consumed by game.js in Task 5+):
 *   - "learn-intro"   - 入门识词 : { type, word, cn, emoji, phonetic }  // 孩子第一题先听+看，不判分
 *   - "listen-choose"  - 听音选图 : { type, audio (word), options: [ {img, label} ], answerIndex }
 *   - "look-choose"    - 看图选词 : { type, image (emoji), options: [ "word" ], answerIndex }
 *   - "read-after"     - 跟读闯关 : { type, target (word), phonetic }
 *   - "drag-match"     - 拖拽配对 : { type, pairs: [ {image, word} ] }
 *   - "letter-sound"   - 字母拼读 : { type, word, answer (first letter), options: [letter] }
 *
 * Images use emoji for MVP (no image assets). For words without a clear emoji we use text labels.
 *
 * Total: 2 Units × 5 days × 5 challenges = 50 challenges (Task 1 MVP scope).
 *
 * EDITORIAL CONVENTION:
 *   - Each day's challenges MUST work standalone with no missing references.
 *   - First 2 questions of each day are warmup (听音选图/看图选词).
 *   - 3rd question is the day's letter-sound (if day has letters).
 *   - 4th question alternates read-after / drag-match.
 *   - 5th question is review (mixed type from the day's vocabulary).
 */

const UNITS = [

  // ============= UNIT 1: MAKING FRIENDS =============
  {
    id: 1,
    title: "Making friends",
    titleCn: "交朋友",
    theme: "schoolgate",
    emoji: "🫂",
    color: "#FFD93D",

    words: [
      { en: "name",   cn: "名字",   emoji: "🏷️" },
      { en: "nice",   cn: "友好的", emoji: "😊" },
      { en: "ear",    cn: "耳朵",   emoji: "👂" },
      { en: "hand",   cn: "手",     emoji: "✋" },
      { en: "eye",    cn: "眼睛",   emoji: "👁️" },
      { en: "mouth",  cn: "嘴",     emoji: "👄" },
      { en: "arm",    cn: "胳膊",   emoji: "💪" },
      { en: "share",  cn: "分享",   emoji: "🤝" },
      { en: "smile",  cn: "微笑",   emoji: "😄" },
      { en: "listen", cn: "听",     emoji: "👂" },
      { en: "help",   cn: "帮助",   emoji: "🆘" },
      { en: "say",    cn: "说",     emoji: "💬" },
      { en: "friend", cn: "朋友",   emoji: "🧑‍🤝‍🧑" },
      { en: "good",   cn: "好的",   emoji: "👍" },
      { en: "can",    cn: "可以",   emoji: "✅" }
    ],

    sentences: [
      { en: "Hello! I'm Mike Black.",          cn: "你好！我是 Mike Black。" },
      { en: "Hi! My name is Wu Binbin.",        cn: "嗨！我叫吴斌斌。" },
      { en: "Nice to meet you.",                cn: "见到你很高兴。" },
      { en: "Nice to meet you too.",            cn: "见到你我也很高兴。" },
      { en: "Oh no!",                            cn: "噢，不！" },
      { en: "It's OK. We can share.",            cn: "没关系。我们可以分享。" },
      { en: "Thank you.",                        cn: "谢谢你。" }
    ],

    letters: ["Aa", "Bb", "Cc", "Dd"],

    levels: [
      // -------- DAY 1: Hello & greet + Aa Bb --------
      {
        id: "u1d1",
        unitId: 1,
        day: 1,
        title: "第一次见面",
        focus: "问候与自我介绍",
        challenges: [
          {
            type: "learn-intro",
            word: "hello",
            cn: "你好",
            emoji: "👋",
            phonetic: "/həˈləʊ/"
          },
          {
            type: "listen-choose",
            audio: "hello",
            options: [
              { emoji: "👋", label: "hello" },
              { emoji: "🏷️", label: "name" },
              { emoji: "✋",  label: "hand" }
            ],
            answerIndex: 0
          },
          {
            type: "look-choose",
            image: "👋",
            options: ["hello", "ear", "good"],
            answerIndex: 0
          },
          {
            type: "letter-sound",
            word: "apple",
            phonetic: "/a/",
            answer: "Aa",
            options: ["Aa", "Bb", "Cc"]
          },
          {
            type: "read-after",
            target: "hello",
            phonetic: "/həˈləʊ/"
          },
          {
            type: "look-choose",
            image: "🏷️",
            options: ["name", "nice", "good"],
            answerIndex: 0
          }
        ]
      },

      // -------- DAY 2: Body parts + Cc Dd --------
      {
        id: "u1d2",
        unitId: 1,
        day: 2,
        title: "认识身体",
        focus: "身体部位",
        challenges: [
          {
            type: "listen-choose",
            audio: "ear",
            options: [
              { emoji: "👂", label: "ear" },
              { emoji: "👁️", label: "eye" },
              { emoji: "👄", label: "mouth" }
            ],
            answerIndex: 0
          },
          {
            type: "look-choose",
            image: "👁️",
            options: ["ear", "eye", "hand"],
            answerIndex: 1
          },
          {
            type: "letter-sound",
            word: "cat",
            phonetic: "/k/",
            answer: "Cc",
            options: ["Aa", "Bb", "Cc"]
          },
          {
            type: "letter-sound",
            word: "dog",
            phonetic: "/d/",
            answer: "Dd",
            options: ["Bb", "Cc", "Dd"]
          },
          {
            type: "read-after",
            target: "hand",
            phonetic: "/hænd/"
          }
        ]
      },

      // -------- DAY 3: Good friends + share --------
      {
        id: "u1d3",
        unitId: 1,
        day: 3,
        title: "做好朋友",
        focus: "朋友行为",
        challenges: [
          {
            type: "listen-choose",
            audio: "share",
            options: [
              { emoji: "🤝", label: "share" },
              { emoji: "😄", label: "smile" },
              { emoji: "💬", label: "say" }
            ],
            answerIndex: 0
          },
          {
            type: "look-choose",
            image: "🤝",
            options: ["share", "help", "good"],
            answerIndex: 0
          },
          {
            type: "letter-sound",
            word: "bag",
            phonetic: "/b/",
            answer: "Bb",
            options: ["Aa", "Bb", "Dd"]
          },
          {
            type: "read-after",
            target: "smile",
            phonetic: "/smaɪl/"
          },
          {
            type: "drag-match",
            pairs: [
              { image: "🤝", word: "share" },
              { image: "😄", word: "smile" },
              { image: "🆘", word: "help" }
            ]
          }
        ]
      },

      // -------- DAY 4: It's OK / Thanks + 综合 --------
      {
        id: "u1d4",
        unitId: 1,
        day: 4,
        title: "关心朋友",
        focus: "礼貌用语",
        challenges: [
          {
            type: "listen-choose",
            audio: "thanks",
            options: [
              { emoji: "🙏", label: "thanks" },
              { emoji: "👍", label: "good" },
              { emoji: "🤝", label: "share" }
            ],
            answerIndex: 0
          },
          {
            type: "look-choose",
            image: "👍",
            options: ["good", "nice", "ear"],
            answerIndex: 0
          },
          {
            type: "letter-sound",
            word: "bed",
            phonetic: "/b/",
            answer: "Bb",
            options: ["Bb", "Cc", "Dd"]
          },
          {
            type: "read-after",
            target: "friend",
            phonetic: "/frend/"
          },
          {
            type: "drag-match",
            pairs: [
              { image: "🆘", word: "help" },
              { image: "💬", word: "say" },
              { image: "👂", word: "listen" }
            ]
          }
        ]
      },

      // -------- DAY 5: 复习 + Aa-Dd 综合 --------
      {
        id: "u1d5",
        unitId: 1,
        day: 5,
        title: "回顾Unit1",
        focus: "综合复习",
        challenges: [
          {
            type: "listen-choose",
            audio: "friend",
            options: [
              { emoji: "🧑‍🤝‍🧑", label: "friend" },
              { emoji: "👋", label: "hello" },
              { emoji: "✋", label: "hand" }
            ],
            answerIndex: 0
          },
          {
            type: "look-choose",
            image: "💪",
            options: ["arm", "ear", "eye"],
            answerIndex: 0
          },
          {
            type: "letter-sound",
            word: "dad",
            phonetic: "/d/",
            answer: "Dd",
            options: ["Aa", "Cc", "Dd"]
          },
          {
            type: "read-after",
            target: "nice",
            phonetic: "/naɪs/"
          },
          {
            type: "drag-match",
            pairs: [
              { image: "👂", word: "ear" },
              { image: "👁️", word: "eye" },
              { image: "✋", word: "hand" }
            ]
          }
        ]
      }
    ]
  },

  // ============= UNIT 2: DIFFERENT FAMILIES =============
  {
    id: 2,
    title: "Different families",
    titleCn: "不同的家庭",
    theme: "home",
    emoji: "👨‍👩‍👧",
    color: "#FF9F9F",

    words: [
      { en: "mum",        cn: "妈妈",     emoji: "👩" },
      { en: "dad",        cn: "爸爸",     emoji: "👨" },
      { en: "grandma",    cn: "奶奶",     emoji: "👵" },
      { en: "grandpa",    cn: "爷爷",     emoji: "👴" },
      { en: "mother",     cn: "母亲",     emoji: "👩" },
      { en: "father",     cn: "父亲",     emoji: "👨" },
      { en: "me",         cn: "我",       emoji: "🧒" },
      { en: "sister",     cn: "姐妹",     emoji: "👧" },
      { en: "family",     cn: "家庭",     emoji: "👨‍👩‍👧" },
      { en: "big",        cn: "大的",     emoji: "🐘" },
      { en: "cousin",     cn: "堂表亲",   emoji: "🧑" },
      { en: "brother",    cn: "兄弟",     emoji: "👦" },
      { en: "small",      cn: "小的",     emoji: "🐜" }
    ],

    sentences: [
      { en: "This is my grandma.",       cn: "这是我奶奶。" },
      { en: "Look! This is my family.",  cn: "看！这是我的家庭。" },
      { en: "Is that your brother?",     cn: "那是你弟弟吗？" },
      { en: "Yes, it is.",               cn: "对，是的。" }
    ],

    letters: ["Ee", "Ff", "Gg", "Hh"],

    levels: [
      // -------- DAY 1: 介绍家人 + Ee --------
      {
        id: "u2d1",
        unitId: 2,
        day: 1,
        title: "我的家人",
        focus: "介绍家庭成员",
        challenges: [
          {
            type: "listen-choose",
            audio: "mum",
            options: [
              { emoji: "👩", label: "mum" },
              { emoji: "👨", label: "dad" },
              { emoji: "👧", label: "sister" }
            ],
            answerIndex: 0
          },
          {
            type: "look-choose",
            image: "👨",
            options: ["dad", "mum", "me"],
            answerIndex: 0
          },
          {
            type: "letter-sound",
            word: "egg",
            phonetic: "/e/",
            answer: "Ee",
            options: ["Ee", "Ff", "Gg"]
          },
          {
            type: "read-after",
            target: "family",
            phonetic: "/ˈfæməli/"
          },
          {
            type: "look-choose",
            image: "👴",
            options: ["grandpa", "grandma", "dad"],
            answerIndex: 0
          }
        ]
      },

      // -------- DAY 2: Grandma/Grandpa + Ff --------
      {
        id: "u2d2",
        unitId: 2,
        day: 2,
        title: "爷爷奶奶",
        focus: "祖父母",
        challenges: [
          {
            type: "listen-choose",
            audio: "grandma",
            options: [
              { emoji: "👵", label: "grandma" },
              { emoji: "👴", label: "grandpa" },
              { emoji: "👩", label: "mum" }
            ],
            answerIndex: 0
          },
          {
            type: "look-choose",
            image: "👵",
            options: ["grandma", "grandpa", "sister"],
            answerIndex: 0
          },
          {
            type: "letter-sound",
            word: "fish",
            phonetic: "/f/",
            answer: "Ff",
            options: ["Ee", "Ff", "Hh"]
          },
          {
            type: "read-after",
            target: "grandpa",
            phonetic: "/ˈgrænpɑː/"
          },
          {
            type: "drag-match",
            pairs: [
              { image: "👵", word: "grandma" },
              { image: "👴", word: "grandpa" },
              { image: "🧒", word: "me" }
            ]
          }
        ]
      },

      // -------- DAY 3: Sister/Brother + Gg --------
      {
        id: "u2d3",
        unitId: 2,
        day: 3,
        title: "兄弟姐妹",
        focus: "siblings",
        challenges: [
          {
            type: "listen-choose",
            audio: "sister",
            options: [
              { emoji: "👧", label: "sister" },
              { emoji: "👦", label: "brother" },
              { emoji: "🧒", label: "me" }
            ],
            answerIndex: 0
          },
          {
            type: "look-choose",
            image: "👦",
            options: ["brother", "sister", "cousin"],
            answerIndex: 0
          },
          {
            type: "letter-sound",
            word: "girl",
            phonetic: "/g/",
            answer: "Gg",
            options: ["Ee", "Ff", "Gg"]
          },
          {
            type: "read-after",
            target: "brother",
            phonetic: "/ˈbrʌðə(r)/"
          },
          {
            type: "drag-match",
            pairs: [
              { image: "👧", word: "sister" },
              { image: "👦", word: "brother" },
              { image: "🧑", word: "cousin" }
            ]
          }
        ]
      },

      // -------- DAY 4: Big/Small family + Hh --------
      {
        id: "u2d4",
        unitId: 2,
        day: 4,
        title: "大小家庭",
        focus: "big & small",
        challenges: [
          {
            type: "listen-choose",
            audio: "big",
            options: [
              { emoji: "🐘", label: "big" },
              { emoji: "🐜", label: "small" },
              { emoji: "👨‍👩‍👧", label: "family" }
            ],
            answerIndex: 0
          },
          {
            type: "look-choose",
            image: "🐜",
            options: ["small", "big", "family"],
            answerIndex: 0
          },
          {
            type: "letter-sound",
            word: "hat",
            phonetic: "/h/",
            answer: "Hh",
            options: ["Ff", "Gg", "Hh"]
          },
          {
            type: "read-after",
            target: "big",
            phonetic: "/bɪg/"
          },
          {
            type: "look-choose",
            image: "👨‍👩‍👧",
            options: ["family", "friend", "small"],
            answerIndex: 0
          }
        ]
      },

      // -------- DAY 5: 复习 + Ee-Hh 综合 --------
      {
        id: "u2d5",
        unitId: 2,
        day: 5,
        title: "回顾Unit2",
        focus: "综合复习",
        challenges: [
          {
            type: "listen-choose",
            audio: "mother",
            options: [
              { emoji: "👩", label: "mother" },
              { emoji: "👵", label: "grandma" },
              { emoji: "👧", label: "sister" }
            ],
            answerIndex: 0
          },
          {
            type: "look-choose",
            image: "🧑",
            options: ["cousin", "brother", "dad"],
            answerIndex: 0
          },
          {
            type: "letter-sound",
            word: "hen",
            phonetic: "/h/",
            answer: "Hh",
            options: ["Ee", "Gg", "Hh"]
          },
          {
            type: "read-after",
            target: "father",
            phonetic: "/ˈfɑːðə(r)/"
          },
          {
            type: "drag-match",
            pairs: [
              { image: "👨", word: "father" },
              { image: "👩", word: "mother" },
              { image: "🧒", word: "me" }
            ]
          }
        ]
      }
    ]
  }
];

const data = {
  UNITS,
  getUnit(unitId) {
    return UNITS.find(u => u.id === unitId) || null;
  },
  getLevel(levelId) {
    for (const u of UNITS) {
      const lv = u.levels.find(l => l.id === levelId);
      if (lv) return lv;
    }
    return null;
  },
  getDay(unitId, day) {
    const u = this.getUnit(unitId);
    if (!u) return null;
    return u.levels.find(l => l.day === day) || null;
  }
};

window.App = window.App || {};
window.App.data = data;

export interface QuizQuestion {
  id: number;
  sentence: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TenseLevel {
  id: string;
  name: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  levelNumber: number;
  formula: string;
  explanation: string;
  usage: string[];
  examples: string[];
  signalWords: string[];
  quiz: QuizQuestion[];
}

export const tenses: TenseLevel[] = [
  // ===== BASIC TENSES =====
  {
    id: 'simple-present',
    name: 'Simple Present',
    level: 'basic',
    levelNumber: 1,
    formula: 'Subject + base verb (+ s/es for he/she/it)',
    explanation: 'The Simple Present tense describes habits, routines, general truths, and permanent situations. It\'s the most fundamental tense in English and is used for actions that happen regularly or are always true.',
    usage: [
      'Habits and routines: "I wake up at 7 AM every day."',
      'General truths/facts: "Water boils at 100°C."',
      'Permanent situations: "She works at a hospital."',
      'Scheduled events: "The train leaves at 9 PM."',
      'Instructions/directions: "You turn left at the corner."'
    ],
    examples: [
      'She reads books every evening.',
      'The sun rises in the east.',
      'They play football on weekends.',
      'He doesn\'t like coffee.',
      'Do you speak English?'
    ],
    signalWords: ['always', 'usually', 'often', 'sometimes', 'never', 'every day/week/month', 'on Mondays'],
    quiz: [
      {
        id: 1,
        sentence: 'She ___ to school every day.',
        options: ['go', 'goes', 'going', 'gone'],
        correctIndex: 1,
        explanation: 'With "she" (third person singular), we add -es to the verb "go" → "goes".'
      },
      {
        id: 2,
        sentence: 'Water ___ at 100 degrees Celsius.',
        options: ['boil', 'boils', 'boiling', 'boiled'],
        correctIndex: 1,
        explanation: 'This is a general truth/fact. "Water" is third person singular, so we use "boils".'
      },
      {
        id: 3,
        sentence: 'They ___ tennis on Saturdays.',
        options: ['plays', 'play', 'playing', 'played'],
        correctIndex: 1,
        explanation: '"They" is a plural subject, so we use the base form "play" without -s.'
      },
      {
        id: 4,
        sentence: '___ you ___ breakfast every morning?',
        options: ['Do / eat', 'Does / eat', 'Are / eating', 'Is / eating'],
        correctIndex: 0,
        explanation: 'For questions with "you" in simple present, we use "Do" + base verb.'
      }
    ]
  },
  {
    id: 'simple-past',
    name: 'Simple Past',
    level: 'basic',
    levelNumber: 2,
    formula: 'Subject + verb-ed (regular) / irregular form',
    explanation: 'The Simple Past tense describes completed actions that happened at a specific time in the past. Regular verbs add -ed, while irregular verbs have unique past forms that must be memorized.',
    usage: [
      'Completed actions in the past: "I visited Paris last year."',
      'A series of past actions: "She woke up, brushed her teeth, and left."',
      'Past habits: "He played piano as a child."',
      'Past facts/states: "They lived in London for 10 years."'
    ],
    examples: [
      'I watched a movie last night.',
      'She bought a new car yesterday.',
      'They traveled to Japan in 2020.',
      'He didn\'t come to the party.',
      'Did you see that eclipse?'
    ],
    signalWords: ['yesterday', 'last week/month/year', 'ago', 'in 2020', 'when I was young'],
    quiz: [
      {
        id: 1,
        sentence: 'I ___ a great movie last night.',
        options: ['watch', 'watched', 'watching', 'watches'],
        correctIndex: 1,
        explanation: '"Last night" indicates a completed past action. Regular verb "watch" + -ed = "watched".'
      },
      {
        id: 2,
        sentence: 'She ___ to the store yesterday.',
        options: ['go', 'goes', 'went', 'going'],
        correctIndex: 2,
        explanation: '"Go" is an irregular verb. Its past form is "went", not "goed".'
      },
      {
        id: 3,
        sentence: '___ you ___ the news this morning?',
        options: ['Do / read', 'Did / read', 'Did / readed', 'Were / reading'],
        correctIndex: 1,
        explanation: 'Simple past questions use "Did" + base verb. "Read" stays as the base form after "Did".'
      },
      {
        id: 4,
        sentence: 'They ___ not ___ the answer.',
        options: ['do / know', 'did / know', 'did / knew', 'were / knowing'],
        correctIndex: 1,
        explanation: 'Negative simple past: "did not" + base verb. After "did not", we always use the base form.'
      }
    ]
  },
  {
    id: 'simple-future',
    name: 'Simple Future',
    level: 'basic',
    levelNumber: 3,
    formula: 'Subject + will + base verb / Subject + am/is/are going to + base verb',
    explanation: 'The Simple Future tense describes actions that will happen in the future. "Will" is used for predictions, promises, and spontaneous decisions. "Going to" is used for planned actions and predictions based on evidence.',
    usage: [
      'Predictions: "It will rain tomorrow."',
      'Promises: "I will help you with your homework."',
      'Spontaneous decisions: "I\'ll have the salad, please."',
      'Planned intentions (going to): "She is going to study medicine."',
      'Predictions with evidence (going to): "Look at those clouds — it\'s going to rain."'
    ],
    examples: [
      'I will travel to Spain next summer.',
      'She will call you later.',
      'They are going to move to a new house.',
      'He won\'t forget your birthday.',
      'Will you marry me?'
    ],
    signalWords: ['tomorrow', 'next week/month/year', 'soon', 'in the future', 'later'],
    quiz: [
      {
        id: 1,
        sentence: 'I ___ you tomorrow.',
        options: ['see', 'saw', 'will see', 'seeing'],
        correctIndex: 2,
        explanation: '"Tomorrow" indicates future time. We use "will" + base verb for future actions.'
      },
      {
        id: 2,
        sentence: 'She ___ to visit her grandmother this weekend.',
        options: ['goes', 'went', 'is going', 'will goes'],
        correctIndex: 2,
        explanation: 'This is a planned action, so "is going to visit" (going to form) is appropriate.'
      },
      {
        id: 3,
        sentence: 'Look at those dark clouds! It ___ rain.',
        options: ['will', 'is going to', 'rains', 'rained'],
        correctIndex: 1,
        explanation: 'When there\'s visible evidence (dark clouds), we use "going to" for predictions.'
      },
      {
        id: 4,
        sentence: '___ you help me with this?',
        options: ['Do', 'Did', 'Will', 'Are'],
        correctIndex: 2,
        explanation: '"Will" is used for requests and asking about future willingness.'
      }
    ]
  },

  // ===== INTERMEDIATE TENSES =====
  {
    id: 'present-continuous',
    name: 'Present Continuous',
    level: 'intermediate',
    levelNumber: 4,
    formula: 'Subject + am/is/are + verb-ing',
    explanation: 'The Present Continuous (also called Present Progressive) describes actions happening right now, temporary situations, and future arrangements. It emphasizes that an action is in progress at the moment of speaking.',
    usage: [
      'Actions happening now: "I am reading a book right now."',
      'Temporary situations: "She is staying with her friend this week."',
      'Future arrangements: "We are meeting John at 6 PM."',
      'Changing/developing situations: "The climate is getting warmer."',
      'Annoying habits (with "always"): "He is always leaving his socks on the floor!"'
    ],
    examples: [
      'I am studying for my exam.',
      'They are building a new bridge.',
      'She isn\'t feeling well today.',
      'Are you coming to the party tonight?',
      'My English is improving.'
    ],
    signalWords: ['now', 'right now', 'at the moment', 'currently', 'today', 'this week'],
    quiz: [
      {
        id: 1,
        sentence: 'She ___ a book at the moment.',
        options: ['reads', 'read', 'is reading', 'has read'],
        correctIndex: 2,
        explanation: '"At the moment" signals an action in progress now. We use "is reading" (Present Continuous).'
      },
      {
        id: 2,
        sentence: 'They ___ to Paris next Monday.',
        options: ['fly', 'flew', 'are flying', 'have flown'],
        correctIndex: 2,
        explanation: 'Future arrangements (already planned) use Present Continuous: "are flying".'
      },
      {
        id: 3,
        sentence: 'Be quiet! The baby ___.',
        options: ['sleeps', 'sleep', 'is sleeping', 'slept'],
        correctIndex: 2,
        explanation: 'The baby is sleeping right now (at this moment). We use Present Continuous.'
      },
      {
        id: 4,
        sentence: 'I ___ for a new job these days.',
        options: ['look', 'looked', 'am looking', 'have looked'],
        correctIndex: 2,
        explanation: '"These days" indicates a temporary, ongoing situation. Present Continuous is correct.'
      }
    ]
  },
  {
    id: 'past-continuous',
    name: 'Past Continuous',
    level: 'intermediate',
    levelNumber: 5,
    formula: 'Subject + was/were + verb-ing',
    explanation: 'The Past Continuous describes actions that were in progress at a specific time in the past. It\'s often used to set the scene in stories or to describe an ongoing action that was interrupted by another action.',
    usage: [
      'Action in progress at a past time: "At 8 PM, I was watching TV."',
      'Interrupted action: "I was cooking when the phone rang."',
      'Two parallel past actions: "While I was reading, she was cooking."',
      'Setting the scene: "The sun was shining and birds were singing."',
      'Polite requests: "I was wondering if you could help me."'
    ],
    examples: [
      'I was studying when you called.',
      'They were playing in the garden all afternoon.',
      'What were you doing at 10 PM last night?',
      'She wasn\'t listening during the lecture.',
      'It was raining when we left the house.'
    ],
    signalWords: ['while', 'when', 'at 8 PM yesterday', 'all morning/afternoon', 'the whole day'],
    quiz: [
      {
        id: 1,
        sentence: 'I ___ TV when the power went out.',
        options: ['watch', 'watched', 'was watching', 'have watched'],
        correctIndex: 2,
        explanation: 'An ongoing past action (watching TV) interrupted by another action (power went out). Use Past Continuous.'
      },
      {
        id: 2,
        sentence: 'While she ___, he was reading.',
        options: ['cooked', 'was cooking', 'cooks', 'has cooked'],
        correctIndex: 1,
        explanation: 'Two parallel ongoing actions in the past both use Past Continuous: "was cooking" and "was reading".'
      },
      {
        id: 3,
        sentence: 'What ___ you ___ at 9 PM last night?',
        options: ['did / do', 'were / doing', 'do / do', 'are / doing'],
        correctIndex: 1,
        explanation: 'Asking about an action in progress at a specific past time requires Past Continuous.'
      },
      {
        id: 4,
        sentence: 'They ___ in the park all morning yesterday.',
        options: ['played', 'were playing', 'play', 'have played'],
        correctIndex: 1,
        explanation: '"All morning yesterday" emphasizes the duration of an ongoing past action. Past Continuous fits best.'
      }
    ]
  },
  {
    id: 'present-perfect',
    name: 'Present Perfect',
    level: 'intermediate',
    levelNumber: 6,
    formula: 'Subject + have/has + past participle',
    explanation: 'The Present Perfect connects the past to the present. It describes experiences, changes, and situations that started in the past and continue to the present. The exact time is not important — what matters is the result or experience.',
    usage: [
      'Life experiences: "I have visited Japan three times."',
      'Changes over time: "Technology has improved a lot."',
      'Unfinished time periods: "I have written two emails today."',
      'Recent past with present result: "She has lost her keys (so she can\'t get in)."',
      'Actions that started in past and continue: "We have lived here for 10 years."'
    ],
    examples: [
      'I have never been to Australia.',
      'She has already finished her homework.',
      'Have you ever eaten sushi?',
      'They have known each other since childhood.',
      'He hasn\'t called me yet.'
    ],
    signalWords: ['ever', 'never', 'already', 'yet', 'just', 'recently', 'since', 'for', 'so far'],
    quiz: [
      {
        id: 1,
        sentence: 'I ___ to Paris three times.',
        options: ['went', 'have been', 'was going', 'go'],
        correctIndex: 1,
        explanation: 'Life experience without specific time → Present Perfect. "Have been" shows experience.'
      },
      {
        id: 2,
        sentence: 'She ___ her keys. She can\'t get in.',
        options: ['lost', 'has lost', 'was losing', 'loses'],
        correctIndex: 1,
        explanation: 'A past action with a present result (she can\'t get in now). Present Perfect is correct.'
      },
      {
        id: 3,
        sentence: '___ you ever ___ a ghost?',
        options: ['Did / see', 'Have / seen', 'Do / see', 'Were / seeing'],
        correctIndex: 1,
        explanation: '"Ever" + life experience = Present Perfect. "Have you ever seen...?"'
      },
      {
        id: 4,
        sentence: 'They ___ here since 2015.',
        options: ['lived', 'have lived', 'were living', 'are living'],
        correctIndex: 1,
        explanation: '"Since 2015" (from past until now) requires Present Perfect. The situation continues to the present.'
      }
    ]
  },

  // ===== ADVANCED TENSES =====
  {
    id: 'past-perfect',
    name: 'Past Perfect',
    level: 'advanced',
    levelNumber: 7,
    formula: 'Subject + had + past participle',
    explanation: 'The Past Perfect describes an action that was completed before another action or time in the past. It\'s the "past before the past" — it helps clarify the order of events when talking about two past events.',
    usage: [
      'Action before another past action: "She had left before I arrived."',
      'Reported speech: "He said he had finished the work."',
      'Third conditional: "If I had studied, I would have passed."',
      'Duration before past time: "They had been married for 20 years when he died."',
      'Wishes/regrets: "I wish I had listened to your advice."'
    ],
    examples: [
      'By the time we arrived, the movie had started.',
      'She had never seen snow before she moved to Canada.',
      'I realized I had forgotten my wallet.',
      'Had you studied English before you came here?',
      'He hadn\'t eaten anything all day.'
    ],
    signalWords: ['by the time', 'before', 'after', 'already', 'just', 'when', 'until', 'by'],
    quiz: [
      {
        id: 1,
        sentence: 'When I arrived, the train ___.',
        options: ['left', 'had left', 'has left', 'was leaving'],
        correctIndex: 1,
        explanation: 'The train left BEFORE I arrived (two past events). The earlier event uses Past Perfect: "had left".'
      },
      {
        id: 2,
        sentence: 'She was tired because she ___ all day.',
        options: ['worked', 'had worked', 'has worked', 'was working'],
        correctIndex: 1,
        explanation: 'The working happened before the tiredness (both in the past). Past Perfect shows the earlier action.'
      },
      {
        id: 3,
        sentence: 'If I ___ harder, I would have passed.',
        options: ['studied', 'had studied', 'have studied', 'would study'],
        correctIndex: 1,
        explanation: 'Third conditional: "If + past perfect, would have + past participle." This expresses an unreal past situation.'
      },
      {
        id: 4,
        sentence: 'He told me he ___ the book.',
        options: ['read', 'had read', 'has read', 'was reading'],
        correctIndex: 1,
        explanation: 'Reported speech: when the reporting verb is past ("told"), the reported action shifts to Past Perfect.'
      }
    ]
  },
  {
    id: 'future-perfect',
    name: 'Future Perfect',
    level: 'advanced',
    levelNumber: 8,
    formula: 'Subject + will have + past participle',
    explanation: 'The Future Perfect describes an action that will be completed before a specific time or another action in the future. It looks back from a future point to something that will already be finished.',
    usage: [
      'Completed before a future time: "By 2030, I will have graduated."',
      'Before another future event: "She will have left by the time you arrive."',
      'Duration up to a future point: "By June, we will have been married for 10 years."',
      'Predictions about completion: "The builders will have finished by Friday."'
    ],
    examples: [
      'By next year, I will have finished my degree.',
      'She will have cooked dinner by the time we get home.',
      'Will you have completed the project by Monday?',
      'They won\'t have arrived before midnight.',
      'By 2025, technology will have changed dramatically.'
    ],
    signalWords: ['by', 'by the time', 'by then', 'before', 'by next week/month/year', 'in two weeks'],
    quiz: [
      {
        id: 1,
        sentence: 'By next June, I ___ my degree.',
        options: ['finish', 'will finish', 'will have finished', 'am finishing'],
        correctIndex: 2,
        explanation: '"By next June" = before a future time. Future Perfect: "will have finished" shows completion before that point.'
      },
      {
        id: 2,
        sentence: 'She ___ the report by the time the meeting starts.',
        options: ['finishes', 'will finish', 'will have finished', 'finished'],
        correctIndex: 2,
        explanation: 'The report will be completed BEFORE the meeting (both in the future). Future Perfect is needed.'
      },
      {
        id: 3,
        sentence: 'By 10 PM, they ___ for 12 hours.',
        options: ['travel', 'will travel', 'will have traveled', 'are traveling'],
        correctIndex: 2,
        explanation: '"By 10 PM" + duration = Future Perfect. The traveling will be completed by that future time.'
      },
      {
        id: 4,
        sentence: '___ you ___ the work by Friday?',
        options: ['Will / finish', 'Will / have finished', 'Do / finish', 'Are / finishing'],
        correctIndex: 1,
        explanation: 'Asking about completion before a future deadline → Future Perfect: "Will you have finished...?"'
      }
    ]
  },
  {
    id: 'present-perfect-continuous',
    name: 'Present Perfect Continuous',
    level: 'advanced',
    levelNumber: 9,
    formula: 'Subject + have/has + been + verb-ing',
    explanation: 'The Present Perfect Continuous emphasizes the duration or ongoing nature of an action that started in the past and continues to the present (or just recently stopped). It focuses on the activity itself rather than the result.',
    usage: [
      'Ongoing action from past to present: "I have been studying for 3 hours."',
      'Recently stopped with visible results: "She has been crying (her eyes are red)."',
      'Emphasis on duration: "They have been waiting since morning."',
      'Temporary/recent situations: "He has been working from home lately."',
      'Complaining about repetition: "You have been interrupting me all evening!"'
    ],
    examples: [
      'I have been learning English for two years.',
      'It has been raining all day.',
      'She is tired because she has been running.',
      'How long have you been working here?',
      'They haven\'t been sleeping well recently.'
    ],
    signalWords: ['for', 'since', 'all day/morning/week', 'lately', 'recently', 'how long'],
    quiz: [
      {
        id: 1,
        sentence: 'I ___ English for 5 years.',
        options: ['study', 'studied', 'have been studying', 'am studying'],
        correctIndex: 2,
        explanation: 'An action that started in the past and continues now, emphasizing duration → Present Perfect Continuous.'
      },
      {
        id: 2,
        sentence: 'Her eyes are red. She ___.',
        options: ['cried', 'has cried', 'has been crying', 'is crying'],
        correctIndex: 2,
        explanation: 'Visible present result (red eyes) from a recently ongoing activity → Present Perfect Continuous.'
      },
      {
        id: 3,
        sentence: 'How long ___ you ___ here?',
        options: ['do / work', 'did / work', 'have / been working', 'are / working'],
        correctIndex: 2,
        explanation: '"How long" + ongoing action from past to present = Present Perfect Continuous.'
      },
      {
        id: 4,
        sentence: 'It ___ since 6 AM.',
        options: ['rains', 'rained', 'has been raining', 'is raining'],
        correctIndex: 2,
        explanation: '"Since 6 AM" + ongoing action (still raining or just stopped) = Present Perfect Continuous.'
      }
    ]
  },

  // ===== EXPERT TENSES =====
  {
    id: 'past-perfect-continuous',
    name: 'Past Perfect Continuous',
    level: 'expert',
    levelNumber: 10,
    formula: 'Subject + had + been + verb-ing',
    explanation: 'The Past Perfect Continuous describes an ongoing action that was happening before another action or time in the past. It emphasizes the duration of an activity that was in progress up to a certain point in the past.',
    usage: [
      'Duration before a past event: "She had been waiting for 2 hours when he finally arrived."',
      'Cause of a past state: "He was tired because he had been working all day."',
      'Recently stopped action with past evidence: "The road was wet because it had been raining."',
      'Emphasis on duration before past time: "They had been dating for years before they got married."'
    ],
    examples: [
      'I had been studying all night before the exam.',
      'She was out of breath because she had been running.',
      'They had been living in London for 5 years before they moved.',
      'How long had you been waiting before the bus came?',
      'He had been smoking for 20 years before he quit.'
    ],
    signalWords: ['for', 'since', 'before', 'when', 'all day/morning', 'how long'],
    quiz: [
      {
        id: 1,
        sentence: 'She was tired because she ___ all day.',
        options: ['worked', 'had worked', 'had been working', 'was working'],
        correctIndex: 2,
        explanation: 'Emphasis on the duration of an ongoing activity before a past state → Past Perfect Continuous.'
      },
      {
        id: 2,
        sentence: 'They ___ for 3 hours when the doctor finally arrived.',
        options: ['waited', 'had waited', 'had been waiting', 'were waiting'],
        correctIndex: 2,
        explanation: 'Duration of ongoing action before another past event → Past Perfect Continuous: "had been waiting".'
      },
      {
        id: 3,
        sentence: 'The ground was wet. It ___ all night.',
        options: ['rained', 'had rained', 'had been raining', 'was raining'],
        correctIndex: 2,
        explanation: 'Past evidence (wet ground) from a recently ongoing activity → Past Perfect Continuous.'
      },
      {
        id: 4,
        sentence: 'How long ___ you ___ before you got the job?',
        options: ['did / search', 'had / searched', 'had / been searching', 'were / searching'],
        correctIndex: 2,
        explanation: 'Duration of ongoing action before a past event → Past Perfect Continuous: "had been searching".'
      }
    ]
  },
  {
    id: 'future-continuous',
    name: 'Future Continuous',
    level: 'expert',
    levelNumber: 11,
    formula: 'Subject + will + be + verb-ing',
    explanation: 'The Future Continuous describes an action that will be in progress at a specific time in the future. It\'s used for actions that will be ongoing at a particular future moment, or for planned/predicted future activities.',
    usage: [
      'Action in progress at a future time: "At 8 PM, I will be eating dinner."',
      'Predicted ongoing activity: "This time tomorrow, I\'ll be lying on a beach."',
      'Polite inquiries: "Will you be using the car tonight?"',
      'Routine future events: "I\'ll be seeing her at the office anyway."',
      'Parallel future actions: "While you\'re cooking, I\'ll be setting the table."'
    ],
    examples: [
      'Don\'t call at 9 — I\'ll be watching the game.',
      'This time next week, we\'ll be flying to Tokyo.',
      'Will you be needing a ride tomorrow?',
      'She\'ll be working late tonight.',
      'They\'ll be waiting for us at the station.'
    ],
    signalWords: ['at this time tomorrow', 'at 8 PM', 'this time next week', 'while', 'when', 'all day tomorrow'],
    quiz: [
      {
        id: 1,
        sentence: 'This time tomorrow, I ___ on a beach.',
        options: ['lie', 'will lie', 'will be lying', 'am lying'],
        correctIndex: 2,
        explanation: 'An action in progress at a specific future time → Future Continuous: "will be lying".'
      },
      {
        id: 2,
        sentence: 'Don\'t call at 7. I ___ dinner.',
        options: ['cook', 'will cook', 'will be cooking', 'cooked'],
        correctIndex: 2,
        explanation: 'An action that will be ongoing at a specific future time → Future Continuous.'
      },
      {
        id: 3,
        sentence: '___ you ___ the car tonight? I need to borrow it.',
        options: ['Do / use', 'Did / use', 'Will / be using', 'Are / using'],
        correctIndex: 2,
        explanation: 'Polite inquiry about future plans → Future Continuous: "Will you be using...?"'
      },
      {
        id: 4,
        sentence: 'While you cook, I ___ the table.',
        options: ['set', 'will set', 'will be setting', 'am setting'],
        correctIndex: 2,
        explanation: 'Parallel future actions both in progress → Future Continuous for both: "will be setting".'
      }
    ]
  },
  {
    id: 'future-perfect-continuous',
    name: 'Future Perfect Continuous',
    level: 'expert',
    levelNumber: 12,
    formula: 'Subject + will + have + been + verb-ing',
    explanation: 'The Future Perfect Continuous is the rarest English tense. It describes an ongoing action that will continue up until a specific point in the future, emphasizing the duration. It looks forward from a future point and looks back at the duration of an activity.',
    usage: [
      'Duration up to a future point: "By December, I will have been working here for 10 years."',
      'Cause of a future state: "She will be tired because she will have been traveling all day."',
      'Emphasis on continuous duration: "By 5 PM, we will have been driving for 8 hours."',
      'Predicted duration at a future time: "Next month, they will have been dating for 5 years."'
    ],
    examples: [
      'By next year, I will have been teaching for 20 years.',
      'By the time she arrives, we will have been waiting for 3 hours.',
      'In June, he will have been living abroad for a decade.',
      'By 10 PM, they will have been dancing all night.',
      'How long will you have been studying by the time you graduate?'
    ],
    signalWords: ['by', 'by the time', 'by then', 'for (duration)', 'by next year/month', 'when'],
    quiz: [
      {
        id: 1,
        sentence: 'By December, I ___ here for 10 years.',
        options: ['work', 'will work', 'will have been working', 'am working'],
        correctIndex: 2,
        explanation: 'Duration of ongoing action up to a future point → Future Perfect Continuous: "will have been working".'
      },
      {
        id: 2,
        sentence: 'By the time he retires, he ___ in this field for 40 years.',
        options: ['works', 'will work', 'will have been working', 'has worked'],
        correctIndex: 2,
        explanation: 'Emphasizing 40 years of continuous work up to a future point → Future Perfect Continuous.'
      },
      {
        id: 3,
        sentence: 'By 6 PM, we ___ for 8 hours straight.',
        options: ['drive', 'will drive', 'will have been driving', 'are driving'],
        correctIndex: 2,
        explanation: 'Duration of ongoing activity up to a future time → Future Perfect Continuous.'
      },
      {
        id: 4,
        sentence: 'Next month, they ___ together for 5 years.',
        options: ['live', 'will live', 'will have been living', 'have lived'],
        correctIndex: 2,
        explanation: 'Predicted duration at a future point → Future Perfect Continuous: "will have been living".'
      }
    ]
  }
];

export const getLevels = () => {
  const levels = ['basic', 'intermediate', 'advanced', 'expert'] as const;
  return levels;
};

export const getTensesByLevel = (level: string) => {
  return tenses.filter(t => t.level === level);
};

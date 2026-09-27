// the "New Game" setup form (src/routes/new/+page.svelte): cash game vs
// tournament, blinds/antes, buy-in, chip set, structure, breaks, rebuys,
// add-ons, bounties, payouts, house cut, templates.
import type { Lang } from "./langs";

/** a value that changes shape by count. `other` always applies; the rest
 * are filled in only for languages whose plural rules use them. */
export interface PluralForms {
  zero?: string;
  one: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

export interface GameSetupDict {
  header: {
    titleCash: string;
    titleTournament: string;
    templateNamePlaceholder: string;
    templateNameAria: string;
    loadTemplateAria: string;
    startFromOption: string;
    yourTemplates: string;
    builtIn: string;
    presets: { turbo: string; hyper: string; deepstack: string; freezeout: string; sitgo: string; pko: string; mystery: string };
    saveAsTemplate: string;
    switchToTournament: string;
    switchToCash: string;
    cashGame: string;
    tournament: string;
  };
  basics: {
    legend: string;
    name: string;
    chipSet: string;
    editSets: string;
    yours: string;
    chipValues: string;
    asPrinted: string;
    printedTimes: string;
    chipPlaysAs: string;
  };
  cash: {
    blinds: {
      legend: string;
      smallBlind: string;
      bigBlind: string;
      straddlesAllowed: string;
    };
    buyIns: {
      legend: string;
      min: string;
      standard: string;
      max: string;
      standardBefore: string;
      standardAfter: string;
    };
    length: {
      legend: string;
      playForAbout: string;
      endsAround: string;
    };
    rake: {
      legend: string;
      remove: string;
      defaultHouseName: string;
    };
    chipMath: string;
    sides: {
      legend: string;
      bombPots: string;
      ante: string;
      bombEvery: string;
      doubleBoard: string;
      sevenTwo: string;
      eachPays: string;
      highHand: string;
      prize: string;
      highHandEvery: string;
      note: string;
    };
  };
  tournament: {
    buyInStacks: {
      legend: string;
      buyIn: string;
      startingStack: string;
      expectedPlayers: string;
      startingDepth: string;
    };
    length: {
      legend: string;
      wrapUpAbout: string;
      levelLength: string;
      levelsBetweenBreaks: string;
      breakMinutes: string;
      antesFromLevel: string;
    };
    rebuys: {
      rebuysAddOn: string;
      lateRegistration: string;
      bounty: string;
      rebuysLabel: string;
      cost: string;
      chips: string;
      throughLevel: string;
      addOnLabel: string;
      lateRegThroughLevel: string;
      bountyField: string;
      bountyKind: string;
      kindFlat: string;
      kindProgressive: string;
      kindMystery: string;
      mysteryFrom: string;
      hint: { flat: string; progressive: string; mystery: string };
    };
    payouts: {
      legend: string;
      percentagesLabel: string;
      sumWarning: string;
      roundTo: string;
      poolCaption: string;
      poolAfter: string;
      joinAnd: string;
      bountyPart: string;
      housePart: string;
    };
    houseCut: {
      legend: string;
      optional: string;
      remove: string;
    };
  };
  addable: {
    caption: string;
    rakeOrSeatFee: string;
    rebuysAddOns: string;
    bounty: string;
    turnOnForEvery: string;
  };
  players: {
    legend: string;
    optional: string;
    namesLabel: string;
    namesPlaceholder: string;
    regulars: string;
    gamesCount: PluralForms;
    notesLabel: string;
    notesPlaceholder: string;
    addHouseRules: string;
    editHouseRules: string;
    writeHouseRules: string;
  };
  previewCash: {
    eachBuyInGets: string;
    coversAbout: string;
    fewerThan: string;
    cantMake: string;
    summary: string;
    rowBlinds: string;
    rowBuyIn: string;
    rowLength: string;
    rowRake: string;
    straddlesInline: string;
    rakeNone: string;
    rakePct: string;
    rakeSeat: string;
  };
  previewTournament: {
    eachPlayerStarts: string;
    chipMathCaption: string;
    blindStructure: string;
    resetToAuto: string;
    autoEdit: string;
    levelsOver: string;
    endsAroundLevel: string;
    startNowTime: string;
    overtimeNote: string;
  };
  actions: {
    dealIt: string;
  };
  alerts: {
    makeChipSetFirst: string;
    structureEmpty: string;
    templateGone: string;
    presetGone: string;
    loadedTemplate: string;
    gameGone: string;
    copiedSetup: string;
    replaceTemplateConfirm: string;
    savedTemplate: string;
  };
}

export const gameSetup: Record<Lang, GameSetupDict> = {
  en: {
    header: {
      titleCash: "New Cash Game",
      titleTournament: "New Tournament",
      templateNamePlaceholder: "Template Name",
      templateNameAria: "Template name",
      loadTemplateAria: "Load a template",
      startFromOption: "Start From…",
      yourTemplates: "Your Templates",
      builtIn: "Built In",
      presets: {
        turbo: "Turbo (10 Min Levels)",
        hyper: "Hyper Turbo (5 Min Levels)",
        deepstack: "Deepstack (200 BB, 30 Min Levels)",
        freezeout: "Freezeout (No Rebuys)",
        sitgo: "Sit & Go (One Table, Top 3 Paid)",
        pko: "Progressive Knockout (PKO)",
        mystery: "Mystery Bounty",
      },
      saveAsTemplate: "Save as Template",
      switchToTournament: "Switch to Tournament",
      switchToCash: "Switch to Cash Game",
      cashGame: "Cash Game",
      tournament: "Tournament",
    },
    basics: {
      legend: "The Basics",
      name: "Name",
      chipSet: "Chip Set",
      editSets: "Edit Sets",
      yours: "Yours",
      chipValues: "Chip Values",
      asPrinted: "As Printed",
      printedTimes: "Printed ×{n}",
      chipPlaysAs: "A {chip} chip plays as {value}",
    },
    cash: {
      blinds: {
        legend: "Blinds",
        smallBlind: "Small Blind {sym}",
        bigBlind: "Big Blind {sym}",
        straddlesAllowed: "Straddles Allowed",
      },
      buyIns: {
        legend: "Buy-Ins",
        min: "Min {sym}",
        standard: "Standard {sym}",
        max: "Max {sym}",
        standardBefore: "Standard buy-in = ",
        standardAfter: " big blinds.",
      },
      length: {
        legend: "Length",
        playForAbout: "Play for About {duration}",
        endsAround: "Ends around {time} if you start now.",
      },
      rake: {
        legend: "Rake",
        remove: "Remove",
        defaultHouseName: "The House",
      },
      chipMath: "How Many Players for Chip Math",
      sides: {
        legend: "Side Games",
        bombPots: "Bomb Pots",
        ante: "Ante {sym}",
        bombEvery: "Every How Many Minutes (0 = When Called)",
        doubleBoard: "Double Board",
        sevenTwo: "The 7-2 Game",
        eachPays: "Each Player Pays {sym}",
        highHand: "High Hand",
        prize: "Prize {sym}",
        highHandEvery: "Minutes per Window (0 = Whole Game)",
        note: "Bomb pots and 7-2 wins are paid in chips at the table. A high hand prize is paid by the house in settle-up.",
      },
    },
    tournament: {
      buyInStacks: {
        legend: "Buy-In + Stacks",
        buyIn: "Buy-In {sym}",
        startingStack: "Starting Stack",
        expectedPlayers: "Expected Players",
        startingDepth: "Starting Depth",
      },
      length: {
        legend: "Length",
        wrapUpAbout: "Wrap Up in About {duration}",
        levelLength: "Level Length",
        levelsBetweenBreaks: "Levels Between Breaks (0 = None)",
        breakMinutes: "Break Minutes",
        antesFromLevel: "Antes From Level (0 = None)",
      },
      rebuys: {
        rebuysAddOn: "Rebuys & Add-On",
        lateRegistration: "Late Registration",
        bounty: "Bounty",
        rebuysLabel: "Rebuys",
        cost: "Cost {sym}",
        chips: "Chips",
        throughLevel: "Through Level",
        addOnLabel: "Add-On (At the First Break)",
        lateRegThroughLevel: "Late Registration Through Level",
        bountyField: "Bounty {sym} (Part of the Buy-In, 0 = None)",
        bountyKind: "Bounty Kind",
        kindFlat: "Flat",
        kindProgressive: "Progressive (PKO)",
        kindMystery: "Mystery",
        mysteryFrom: "Envelopes Come Out With Players Left (0 = In the Money)",
        hint: {
          flat: "A knockout pays the whole bounty.",
          progressive: "A knockout pays half the bounty. The other half goes on the winner's own head, so bounties grow as the game goes on.",
          mystery: "Knockouts pay nothing until the envelopes come out. From then on, every knockout opens a random envelope from all the bounty money.",
        },
      },
      payouts: {
        legend: "Payouts",
        percentagesLabel: "Percentages, 1st Place First (Blank = Auto)",
        sumWarning: "Adds up to {n}%, not 100%",
        roundTo: "Round Payouts To",
        poolCaption: "With {n} players the pool is ~{pool}",
        poolAfter: "(after {parts})",
        joinAnd: "and",
        bountyPart: "{amount} a head in bounties",
        housePart: "{amount} to the house",
      },
      houseCut: {
        legend: "House Cut",
        optional: "Optional",
        remove: "Remove",
      },
    },
    addable: {
      caption: "Also for This Game:",
      rakeOrSeatFee: "Rake or Seat Fee",
      rebuysAddOns: "Rebuys & Add-Ons",
      bounty: "Bounty",
      turnOnForEvery: "Turn On for Every Game",
    },
    players: {
      legend: "Players",
      optional: "Optional, or Add Them Later",
      namesLabel: "Names, One per Line or Split by Commas",
      namesPlaceholder: "Alex, Sam, Jordan",
      regulars: "Regulars:",
      gamesCount: { one: "{count} game", other: "{count} games" },
      notesLabel: "House Rules / Notes, One per Line (Shown on the TV)",
      notesPlaceholder: "No string bets. One player to a hand. Cards stay on the table.",
      addHouseRules: "Add the House Rules",
      editHouseRules: "Edit Your House Rules",
      writeHouseRules: "Write Your House Rules",
    },
    previewCash: {
      eachBuyInGets: "Each Buy-In ({amount}) Gets",
      coversAbout: "This set covers about {n} standard buy-ins in all",
      fewerThan: "(fewer than {n} players). You'll run short.",
      cantMake: "Can't make that buy-in from this set.",
      summary: "Summary",
      rowBlinds: "Blinds",
      rowBuyIn: "Buy-In",
      rowLength: "Length",
      rowRake: "Rake",
      straddlesInline: " (straddles allowed)",
      rakeNone: "None",
      rakePct: "{pct}% up to {cap}",
      rakeSeat: "{fee} a seat",
    },
    previewTournament: {
      eachPlayerStarts: "Each Player Starts With",
      chipMathCaption: "{chips} chips = {bb} big blinds at level 1. Biggest even stack for {n} players ≈ {amount}.",
      blindStructure: "Blind Structure",
      resetToAuto: "Reset to Auto",
      autoEdit: "Auto · Edit Any Cell to Change It",
      levelsOver: "{n} levels over {duration}",
      endsAroundLevel: "(ends around {sb}/{bb})",
      startNowTime: "· ~{time} if you start now.",
      overtimeNote: "Overtime levels (italic) are there in case it runs long. Total with overtime: {duration}.",
    },
    actions: {
      dealIt: "Deal It",
    },
    alerts: {
      makeChipSetFirst: "Make a chip set first",
      structureEmpty: "The blind structure is empty",
      templateGone: "That template no longer exists",
      presetGone: "That preset isn't here anymore.",
      loadedTemplate: "Loaded “{name}”",
      gameGone: "That game no longer exists",
      copiedSetup: "Copied the setup from “{name}”. Change what you need, then deal.",
      replaceTemplateConfirm: "Replace the template “{name}”?",
      savedTemplate: "Saved “{name}”. It's in the template list and Commands ({key}).",
    },
  },
  zh: {
    header: {
      titleCash: "新建现金局",
      titleTournament: "新建锦标赛",
      templateNamePlaceholder: "模板名称",
      templateNameAria: "模板名称",
      loadTemplateAria: "加载模板",
      startFromOption: "从这里开始…",
      yourTemplates: "你的模板",
      builtIn: "内置",
      presets: {
        turbo: "快速赛（每级 10 分钟）",
        hyper: "超快速赛（每级 5 分钟）",
        deepstack: "深筹码赛（200 BB，每级 30 分钟）",
        freezeout: "无重购赛",
        sitgo: "坐满即玩（一桌，前 3 名有奖）",
        pko: "累进赏金赛（PKO）",
        mystery: "神秘赏金赛",
      },
      saveAsTemplate: "保存为模板",
      switchToTournament: "切换到锦标赛",
      switchToCash: "切换到现金局",
      cashGame: "现金局",
      tournament: "锦标赛",
    },
    basics: {
      legend: "基本设置",
      name: "名称",
      chipSet: "筹码套装",
      editSets: "编辑套装",
      yours: "自有",
      chipValues: "筹码面值",
      asPrinted: "按印制面值",
      printedTimes: "印制面值 ×{n}",
      chipPlaysAs: "一枚 {chip} 筹码在本局中价值 {value}",
    },
    cash: {
      blinds: {
        legend: "盲注",
        smallBlind: "小盲 {sym}",
        bigBlind: "大盲 {sym}",
        straddlesAllowed: "允许抢注",
      },
      buyIns: {
        legend: "买入",
        min: "最低 {sym}",
        standard: "标准 {sym}",
        max: "最高 {sym}",
        standardBefore: "标准买入 = ",
        standardAfter: " 个大盲。",
      },
      length: {
        legend: "时长",
        playForAbout: "预计进行 {duration}",
        endsAround: "如果现在开始，大约 {time} 结束。",
      },
      rake: {
        legend: "抽水",
        remove: "移除",
        defaultHouseName: "庄家",
      },
      chipMath: "用于筹码计算的人数",
      sides: {
        legend: "附加玩法",
        bombPots: "炸弹底池",
        ante: "底注 {sym}",
        bombEvery: "每隔几分钟一次（0 = 手动叫）",
        doubleBoard: "双公共牌",
        sevenTwo: "7-2 玩法",
        eachPays: "每位玩家付 {sym}",
        highHand: "最大牌奖",
        prize: "奖金 {sym}",
        highHandEvery: "每个时段的分钟数（0 = 整场）",
        note: "炸弹底池和 7-2 奖励在桌上用筹码支付。最大牌奖金由主办方在结算时支付。",
      },
    },
    tournament: {
      buyInStacks: {
        legend: "买入与筹码量",
        buyIn: "买入 {sym}",
        startingStack: "起始筹码量",
        expectedPlayers: "预计人数",
        startingDepth: "起始深度",
      },
      length: {
        legend: "时长",
        wrapUpAbout: "预计 {duration} 内结束",
        levelLength: "级别时长",
        levelsBetweenBreaks: "每隔几个级别休息一次（0 = 不休息）",
        breakMinutes: "休息时长（分钟）",
        antesFromLevel: "从第几级开始收前注（0 = 不收）",
      },
      rebuys: {
        rebuysAddOn: "重买与增购",
        lateRegistration: "迟到报名",
        bounty: "赏金",
        rebuysLabel: "重买",
        cost: "费用 {sym}",
        chips: "筹码量",
        throughLevel: "截止级别",
        addOnLabel: "增购（在第一次休息时）",
        lateRegThroughLevel: "迟到报名截止级别",
        bountyField: "赏金 {sym}（计入买入，0 = 无）",
        bountyKind: "赏金类型",
        kindFlat: "固定",
        kindProgressive: "累进（PKO）",
        kindMystery: "神秘",
        mysteryFrom: "剩几人时拿出信封（0 = 进入钱圈时）",
        hint: {
          flat: "淘汰一人拿走全部赏金。",
          progressive: "淘汰一人拿走一半赏金，另一半加到自己头上，赏金会越滚越大。",
          mystery: "拿出信封前淘汰没有奖励。之后每淘汰一人，就从全部赏金里随机打开一个信封。",
        },
      },
      payouts: {
        legend: "奖金分配",
        percentagesLabel: "各名次百分比，第一名在前（留空 = 自动）",
        sumWarning: "加起来是 {n}%，不是 100%",
        roundTo: "奖金取整到",
        poolCaption: "以 {n} 名玩家计算，奖池约为 {pool}",
        poolAfter: "（扣除 {parts} 后）",
        joinAnd: "和",
        bountyPart: "每人 {amount} 计入赏金",
        housePart: "{amount} 归庄家",
      },
      houseCut: {
        legend: "庄家抽成",
        optional: "可选",
        remove: "移除",
      },
    },
    addable: {
      caption: "本局还可以加入：",
      rakeOrSeatFee: "抽水或坐台费",
      rebuysAddOns: "重买与增购",
      bounty: "赏金",
      turnOnForEvery: "为每局默认开启",
    },
    players: {
      legend: "玩家",
      optional: "可选，也可以稍后添加",
      namesLabel: "姓名，每行一个或用逗号分隔",
      namesPlaceholder: "小明, 小华, 小刚",
      regulars: "常客：",
      gamesCount: { one: "{count} 场游戏", other: "{count} 场游戏" },
      notesLabel: "场地规则/备注，每行一条（会显示在电视面板上）",
      notesPlaceholder: "禁止分批下注。一人一手牌。牌不能离开桌面。",
      addHouseRules: "加入场地规则",
      editHouseRules: "编辑场地规则",
      writeHouseRules: "填写场地规则",
    },
    previewCash: {
      eachBuyInGets: "每份买入（{amount}）可兑换",
      coversAbout: "这套筹码大约能兑换 {n} 份标准买入",
      fewerThan: "（少于 {n} 名玩家的量。筹码会不够用。）",
      cantMake: "这套筹码凑不出该买入金额。",
      summary: "摘要",
      rowBlinds: "盲注",
      rowBuyIn: "买入",
      rowLength: "时长",
      rowRake: "抽水",
      straddlesInline: "（允许抢注）",
      rakeNone: "无",
      rakePct: "{pct}%，上限 {cap}",
      rakeSeat: "每人 {fee}",
    },
    previewTournament: {
      eachPlayerStarts: "每名玩家的起始筹码",
      chipMathCaption: "{chips} 枚筹码在第一级相当于 {bb} 个大盲。{n} 名玩家平分时最大整数筹码量约为 {amount}。",
      blindStructure: "盲注结构",
      resetToAuto: "恢复自动生成",
      autoEdit: "自动生成 · 点击任意单元格即可修改",
      levelsOver: "共 {n} 级，历时 {duration}",
      endsAroundLevel: "（结束时约为 {sb}/{bb}）",
      startNowTime: "· 如果现在开始，约 {time} 结束。",
      overtimeNote: "斜体的是加时级别，以防比赛拖长。含加时总时长：{duration}。",
    },
    actions: {
      dealIt: "开始发牌",
    },
    alerts: {
      makeChipSetFirst: "请先创建一套筹码",
      structureEmpty: "盲注结构为空",
      templateGone: "该模板已不存在",
      presetGone: "这个预设已经不在了。",
      loadedTemplate: "已加载“{name}”",
      gameGone: "该对局已不存在",
      copiedSetup: "已复制“{name}”的设置。按需调整后即可开局。",
      replaceTemplateConfirm: "替换模板“{name}”？",
      savedTemplate: "已保存“{name}”，可在模板列表和命令面板（{key}）中找到。",
    },
  },
  hi: {
    header: {
      titleCash: "नया कैश गेम",
      titleTournament: "नया टूर्नामेंट",
      templateNamePlaceholder: "टेम्पलेट का नाम",
      templateNameAria: "टेम्पलेट का नाम",
      loadTemplateAria: "टेम्पलेट लोड करें",
      startFromOption: "यहाँ से शुरू करें…",
      yourTemplates: "आपके टेम्पलेट",
      builtIn: "बिल्ट-इन",
      presets: {
        turbo: "टर्बो (10 मिनट के लेवल)",
        hyper: "हाइपर टर्बो (5 मिनट के लेवल)",
        deepstack: "डीपस्टैक (200 BB, 30 मिनट के लेवल)",
        freezeout: "फ़्रीज़आउट (कोई रीबाय नहीं)",
        sitgo: "सिट एंड गो (एक टेबल, टॉप 3 को पैसे)",
        pko: "प्रोग्रेसिव नॉकआउट (PKO)",
        mystery: "मिस्ट्री बाउंटी",
      },
      saveAsTemplate: "टेम्पलेट के रूप में सहेजें",
      switchToTournament: "टूर्नामेंट पर स्विच करें",
      switchToCash: "कैश गेम पर स्विच करें",
      cashGame: "कैश गेम",
      tournament: "टूर्नामेंट",
    },
    basics: {
      legend: "मूल सेटिंग्स",
      name: "नाम",
      chipSet: "चिप सेट",
      editSets: "सेट संपादित करें",
      yours: "आपका",
      chipValues: "चिप मूल्य",
      asPrinted: "छपे मूल्य पर",
      printedTimes: "छपा मूल्य ×{n}",
      chipPlaysAs: "एक {chip} चिप इस गेम में {value} की मानी जाएगी",
    },
    cash: {
      blinds: {
        legend: "ब्लाइंड्स",
        smallBlind: "स्मॉल ब्लाइंड {sym}",
        bigBlind: "बिग ब्लाइंड {sym}",
        straddlesAllowed: "स्ट्रैडल की अनुमति है",
      },
      buyIns: {
        legend: "बाय-इन",
        min: "न्यूनतम {sym}",
        standard: "मानक {sym}",
        max: "अधिकतम {sym}",
        standardBefore: "मानक बाय-इन = ",
        standardAfter: " बिग ब्लाइंड के बराबर है।",
      },
      length: {
        legend: "अवधि",
        playForAbout: "लगभग {duration} तक खेलें",
        endsAround: "अभी शुरू करने पर लगभग {time} बजे खत्म होगा।",
      },
      rake: {
        legend: "रेक",
        remove: "हटाएं",
        defaultHouseName: "हाउस",
      },
      chipMath: "चिप गणना के लिए कितने खिलाड़ी",
      sides: {
        legend: "साइड गेम",
        bombPots: "बॉम्ब पॉट",
        ante: "एंटी {sym}",
        bombEvery: "हर कितने मिनट में (0 = बुलाने पर)",
        doubleBoard: "डबल बोर्ड",
        sevenTwo: "7-2 गेम",
        eachPays: "हर खिलाड़ी देता है {sym}",
        highHand: "हाई हैंड",
        prize: "इनाम {sym}",
        highHandEvery: "हर राउंड के मिनट (0 = पूरा गेम)",
        note: "बॉम्ब पॉट और 7-2 की जीत टेबल पर चिप्स में दी जाती है। हाई हैंड का इनाम हाउस सेटल-अप में देता है।",
      },
    },
    tournament: {
      buyInStacks: {
        legend: "बाय-इन + स्टैक",
        buyIn: "बाय-इन {sym}",
        startingStack: "शुरुआती स्टैक",
        expectedPlayers: "अनुमानित खिलाड़ी",
        startingDepth: "शुरुआती गहराई",
      },
      length: {
        legend: "अवधि",
        wrapUpAbout: "लगभग {duration} में समाप्त करें",
        levelLength: "लेवल की अवधि",
        levelsBetweenBreaks: "हर कितने लेवल बाद ब्रेक (0 = कोई ब्रेक नहीं)",
        breakMinutes: "ब्रेक के मिनट",
        antesFromLevel: "किस लेवल से एंटी शुरू हो (0 = कभी नहीं)",
      },
      rebuys: {
        rebuysAddOn: "रीबाय और ऐड-ऑन",
        lateRegistration: "लेट रजिस्ट्रेशन",
        bounty: "बाउंटी",
        rebuysLabel: "रीबाय",
        cost: "लागत {sym}",
        chips: "चिप्स",
        throughLevel: "किस लेवल तक",
        addOnLabel: "ऐड-ऑन (पहले ब्रेक पर)",
        lateRegThroughLevel: "लेट रजिस्ट्रेशन किस लेवल तक",
        bountyField: "बाउंटी {sym} (बाय-इन का हिस्सा, 0 = कोई नहीं)",
        bountyKind: "बाउंटी का प्रकार",
        kindFlat: "फ़्लैट",
        kindProgressive: "प्रोग्रेसिव (PKO)",
        kindMystery: "मिस्ट्री",
        mysteryFrom: "कितने खिलाड़ी बचने पर लिफ़ाफ़े निकलें (0 = इन द मनी पर)",
        hint: {
          flat: "नॉकआउट पर पूरी बाउंटी मिलती है।",
          progressive: "नॉकआउट पर आधी बाउंटी मिलती है। बाकी आधी जीतने वाले के अपने सिर पर जुड़ती है, तो बाउंटी बढ़ती जाती है।",
          mystery: "लिफ़ाफ़े निकलने तक नॉकआउट पर कुछ नहीं मिलता। उसके बाद हर नॉकआउट पूरी बाउंटी रकम में से एक रैंडम लिफ़ाफ़ा खोलता है।",
        },
      },
      payouts: {
        legend: "पेआउट",
        percentagesLabel: "प्रतिशत, पहला स्थान सबसे पहले (खाली = ऑटो)",
        sumWarning: "कुल {n}% है, 100% नहीं",
        roundTo: "पेआउट राउंड करें",
        poolCaption: "{n} खिलाड़ियों के साथ पूल लगभग {pool} है",
        poolAfter: "({parts} काटने के बाद)",
        joinAnd: "और",
        bountyPart: "{amount} प्रति खिलाड़ी बाउंटी में",
        housePart: "{amount} हाउस को",
      },
      houseCut: {
        legend: "हाउस कट",
        optional: "वैकल्पिक",
        remove: "हटाएं",
      },
    },
    addable: {
      caption: "इस गेम के लिए और भी जोड़ें:",
      rakeOrSeatFee: "रेक या सीट फीस",
      rebuysAddOns: "रीबाय और ऐड-ऑन",
      bounty: "बाउंटी",
      turnOnForEvery: "हर गेम के लिए चालू करें",
    },
    players: {
      legend: "खिलाड़ी",
      optional: "वैकल्पिक, बाद में भी जोड़ सकते हैं",
      namesLabel: "नाम, एक लाइन में एक या कॉमा से अलग करें",
      namesPlaceholder: "अमन, रोहन, प्रिया",
      regulars: "नियमित खिलाड़ी:",
      gamesCount: { one: "{count} गेम", other: "{count} गेम" },
      notesLabel: "हाउस रूल्स / नोट्स, एक लाइन में एक (टीवी पर दिखेंगे)",
      notesPlaceholder: "स्ट्रिंग बेट मान्य नहीं। एक खिलाड़ी, एक हाथ। कार्ड्स टेबल पर ही रहेंगे।",
      addHouseRules: "हाउस रूल्स जोड़ें",
      editHouseRules: "अपने हाउस रूल्स संपादित करें",
      writeHouseRules: "अपने हाउस रूल्स लिखें",
    },
    previewCash: {
      eachBuyInGets: "हर बाय-इन ({amount}) में मिलेगा",
      coversAbout: "यह सेट लगभग {n} मानक बाय-इन के लिए पर्याप्त है",
      fewerThan: "({n} खिलाड़ियों से कम के लिए। चिप्स कम पड़ जाएंगी।)",
      cantMake: "इस सेट से यह बाय-इन नहीं बन सकता।",
      summary: "सारांश",
      rowBlinds: "ब्लाइंड्स",
      rowBuyIn: "बाय-इन",
      rowLength: "अवधि",
      rowRake: "रेक",
      straddlesInline: " (स्ट्रैडल की अनुमति है)",
      rakeNone: "कोई नहीं",
      rakePct: "{pct}%, अधिकतम {cap} तक",
      rakeSeat: "प्रति सीट {fee}",
    },
    previewTournament: {
      eachPlayerStarts: "हर खिलाड़ी की शुरुआत",
      chipMathCaption: "{chips} चिप्स लेवल 1 पर {bb} बिग ब्लाइंड के बराबर हैं। {n} खिलाड़ियों में बराबर बांटने पर अधिकतम स्टैक लगभग {amount} होगा।",
      blindStructure: "ब्लाइंड संरचना",
      resetToAuto: "ऑटो पर रीसेट करें",
      autoEdit: "ऑटो · कोई भी सेल बदलने के लिए क्लिक करें",
      levelsOver: "{duration} में कुल {n} लेवल",
      endsAroundLevel: "(अंत में लगभग {sb}/{bb})",
      startNowTime: "· अभी शुरू करने पर लगभग {time} बजे।",
      overtimeNote: "इटैलिक वाले लेवल ओवरटाइम के लिए हैं, अगर गेम लंबा चले। ओवरटाइम सहित कुल समय: {duration}।",
    },
    actions: {
      dealIt: "गेम शुरू करें",
    },
    alerts: {
      makeChipSetFirst: "पहले एक चिप सेट बनाएं",
      structureEmpty: "ब्लाइंड संरचना खाली है",
      templateGone: "यह टेम्पलेट अब मौजूद नहीं है",
      presetGone: "यह प्रीसेट अब यहाँ नहीं है।",
      loadedTemplate: "“{name}” लोड हो गया",
      gameGone: "यह गेम अब मौजूद नहीं है",
      copiedSetup: "“{name}” की सेटिंग कॉपी कर दी गई। जो बदलना हो बदलें, फिर शुरू करें।",
      replaceTemplateConfirm: "क्या टेम्पलेट “{name}” को बदलें?",
      savedTemplate: "“{name}” सहेज दिया गया। यह टेम्पलेट सूची और कमांड्स ({key}) में मिलेगा।",
    },
  },
  es: {
    header: {
      titleCash: "Nuevo cash game",
      titleTournament: "Nuevo torneo",
      templateNamePlaceholder: "Nombre de la plantilla",
      templateNameAria: "Nombre de la plantilla",
      loadTemplateAria: "Cargar una plantilla",
      startFromOption: "Empezar desde…",
      yourTemplates: "Tus plantillas",
      builtIn: "Incluidas",
      presets: {
        turbo: "Turbo (niveles de 10 min)",
        hyper: "Hiper turbo (niveles de 5 min)",
        deepstack: "Deepstack (200 BB, niveles de 30 min)",
        freezeout: "Freezeout (sin recompras)",
        sitgo: "Sit & Go (una mesa, cobran los 3 primeros)",
        pko: "Knockout progresivo (PKO)",
        mystery: "Bounty misterioso",
      },
      saveAsTemplate: "Guardar como plantilla",
      switchToTournament: "Cambiar a torneo",
      switchToCash: "Cambiar a cash game",
      cashGame: "Cash game",
      tournament: "Torneo",
    },
    basics: {
      legend: "Lo básico",
      name: "Nombre",
      chipSet: "Set de fichas",
      editSets: "Editar sets",
      yours: "Tuyo",
      chipValues: "Valor de las fichas",
      asPrinted: "Según lo impreso",
      printedTimes: "Impreso ×{n}",
      chipPlaysAs: "Una ficha de {chip} vale {value} en esta partida",
    },
    cash: {
      blinds: {
        legend: "Ciegas",
        smallBlind: "Ciega pequeña {sym}",
        bigBlind: "Ciega grande {sym}",
        straddlesAllowed: "Straddles permitidos",
      },
      buyIns: {
        legend: "Buy-ins",
        min: "Mínimo {sym}",
        standard: "Estándar {sym}",
        max: "Máximo {sym}",
        standardBefore: "El buy-in estándar equivale a ",
        standardAfter: " ciegas grandes.",
      },
      length: {
        legend: "Duración",
        playForAbout: "Jugar por unas {duration}",
        endsAround: "Terminaría alrededor de las {time} si empiezan ahora.",
      },
      rake: {
        legend: "Rake",
        remove: "Quitar",
        defaultHouseName: "La casa",
      },
      chipMath: "Cuántos jugadores para calcular las fichas",
      sides: {
        legend: "Juegos extra",
        bombPots: "Bomb pots",
        ante: "Ante {sym}",
        bombEvery: "Cada cuántos minutos (0 = cuando se pida)",
        doubleBoard: "Doble board",
        sevenTwo: "El juego del 7-2",
        eachPays: "Cada jugador paga {sym}",
        highHand: "Mano más alta",
        prize: "Premio {sym}",
        highHandEvery: "Minutos por tramo (0 = toda la partida)",
        note: "Los bomb pots y el 7-2 se pagan en fichas en la mesa. El premio a la mano más alta lo paga la casa en la liquidación.",
      },
    },
    tournament: {
      buyInStacks: {
        legend: "Buy-in y stacks",
        buyIn: "Buy-in {sym}",
        startingStack: "Stack inicial",
        expectedPlayers: "Jugadores esperados",
        startingDepth: "Profundidad inicial",
      },
      length: {
        legend: "Duración",
        wrapUpAbout: "Terminar en unas {duration}",
        levelLength: "Duración del nivel",
        levelsBetweenBreaks: "Niveles entre descansos (0 = ninguno)",
        breakMinutes: "Minutos de descanso",
        antesFromLevel: "Ante desde el nivel (0 = ninguno)",
      },
      rebuys: {
        rebuysAddOn: "Rebuys y add-on",
        lateRegistration: "Inscripción tardía",
        bounty: "Bounty",
        rebuysLabel: "Rebuys",
        cost: "Costo {sym}",
        chips: "Fichas",
        throughLevel: "Hasta el nivel",
        addOnLabel: "Add-on (en el primer descanso)",
        lateRegThroughLevel: "Inscripción tardía hasta el nivel",
        bountyField: "Bounty {sym} (parte del buy-in, 0 = ninguno)",
        bountyKind: "Tipo de bounty",
        kindFlat: "Fijo",
        kindProgressive: "Progresivo (PKO)",
        kindMystery: "Misterioso",
        mysteryFrom: "Sobres cuando queden jugadores (0 = al entrar en premios)",
        hint: {
          flat: "Una eliminación paga el bounty entero.",
          progressive: "Una eliminación paga la mitad del bounty. La otra mitad se suma a la cabeza de quien elimina, así los bounties crecen durante el juego.",
          mystery: "Las eliminaciones no pagan nada hasta que salen los sobres. Desde ahí, cada eliminación abre un sobre al azar con parte del dinero de bounties.",
        },
      },
      payouts: {
        legend: "Premios",
        percentagesLabel: "Porcentajes, primer lugar primero (vacío = automático)",
        sumWarning: "Suma {n}%, no 100%",
        roundTo: "Redondear premios a",
        poolCaption: "Con {n} jugadores el pozo es de ~{pool}",
        poolAfter: "(después de {parts})",
        joinAnd: "y",
        bountyPart: "{amount} por cabeza en bounties",
        housePart: "{amount} para la casa",
      },
      houseCut: {
        legend: "Comisión de la casa",
        optional: "Opcional",
        remove: "Quitar",
      },
    },
    addable: {
      caption: "También para esta partida:",
      rakeOrSeatFee: "Rake o cuota de asiento",
      rebuysAddOns: "Rebuys y add-ons",
      bounty: "Bounty",
      turnOnForEvery: "Activar para todas las partidas",
    },
    players: {
      legend: "Jugadores",
      optional: "Opcional, o agrégalos después",
      namesLabel: "Nombres, uno por línea o separados por comas",
      namesPlaceholder: "Álex, Sam, Jordan",
      regulars: "Habituales:",
      gamesCount: { one: "{count} partida", other: "{count} partidas" },
      notesLabel: "Reglas de la casa / notas, una por línea (se muestran en la pantalla)",
      notesPlaceholder: "No se permiten apuestas en dos tiempos. Un jugador por mano. Las cartas no salen de la mesa.",
      addHouseRules: "Añadir las reglas de la casa",
      editHouseRules: "Editar tus reglas de la casa",
      writeHouseRules: "Escribir tus reglas de la casa",
    },
    previewCash: {
      eachBuyInGets: "Cada buy-in ({amount}) da",
      coversAbout: "Este set alcanza para unos {n} buy-ins estándar en total",
      fewerThan: "(menos de {n} jugadores. Se quedarán cortos.)",
      cantMake: "No se puede formar ese buy-in con este set.",
      summary: "Resumen",
      rowBlinds: "Ciegas",
      rowBuyIn: "Buy-in",
      rowLength: "Duración",
      rowRake: "Rake",
      straddlesInline: " (straddles permitidos)",
      rakeNone: "Ninguno",
      rakePct: "{pct}% hasta {cap}",
      rakeSeat: "{fee} por asiento",
    },
    previewTournament: {
      eachPlayerStarts: "Cada jugador empieza con",
      chipMathCaption: "{chips} fichas equivalen a {bb} ciegas grandes en el nivel 1. El stack parejo más grande para {n} jugadores es de ~{amount}.",
      blindStructure: "Estructura de ciegas",
      resetToAuto: "Volver a automático",
      autoEdit: "Automático · Edita cualquier celda para cambiarla",
      levelsOver: "{n} niveles en {duration}",
      endsAroundLevel: "(termina alrededor de {sb}/{bb})",
      startNowTime: "· ~{time} si empiezan ahora.",
      overtimeNote: "Los niveles en cursiva son por si se alarga. Duración total con tiempo extra: {duration}.",
    },
    actions: {
      dealIt: "Repartir",
    },
    alerts: {
      makeChipSetFirst: "Primero crea un set de fichas",
      structureEmpty: "La estructura de ciegas está vacía",
      templateGone: "Esa plantilla ya no existe",
      presetGone: "Ese ajuste ya no está aquí.",
      loadedTemplate: "Se cargó «{name}»",
      gameGone: "Esa partida ya no existe",
      copiedSetup: "Se copió la configuración de «{name}». Cambia lo que necesites y reparte.",
      replaceTemplateConfirm: "¿Reemplazar la plantilla «{name}»?",
      savedTemplate: "Se guardó «{name}». Está en la lista de plantillas y en Comandos ({key}).",
    },
  },
  fr: {
    header: {
      titleCash: "Nouveau cash game",
      titleTournament: "Nouveau tournoi",
      templateNamePlaceholder: "Nom du modèle",
      templateNameAria: "Nom du modèle",
      loadTemplateAria: "Charger un modèle",
      startFromOption: "Partir de…",
      yourTemplates: "Vos modèles",
      builtIn: "Intégrés",
      presets: {
        turbo: "Turbo (niveaux de 10 min)",
        hyper: "Hyper turbo (niveaux de 5 min)",
        deepstack: "Deepstack (200 BB, niveaux de 30 min)",
        freezeout: "Freezeout (sans recave)",
        sitgo: "Sit & Go (une table, 3 premiers payés)",
        pko: "Knockout progressif (PKO)",
        mystery: "Bounty mystère",
      },
      saveAsTemplate: "Enregistrer comme modèle",
      switchToTournament: "Passer au tournoi",
      switchToCash: "Passer au cash game",
      cashGame: "Cash game",
      tournament: "Tournoi",
    },
    basics: {
      legend: "Les bases",
      name: "Nom",
      chipSet: "Set de jetons",
      editSets: "Modifier les sets",
      yours: "à vous",
      chipValues: "Valeur des jetons",
      asPrinted: "Valeur imprimée",
      printedTimes: "Valeur imprimée ×{n}",
      chipPlaysAs: "Un jeton de {chip} vaut {value} dans cette partie",
    },
    cash: {
      blinds: {
        legend: "Blindes",
        smallBlind: "Petite blinde {sym}",
        bigBlind: "Grosse blinde {sym}",
        straddlesAllowed: "Straddles autorisés",
      },
      buyIns: {
        legend: "Buy-ins",
        min: "Min {sym}",
        standard: "Standard {sym}",
        max: "Max {sym}",
        standardBefore: "Le buy-in standard représente ",
        standardAfter: " grosses blindes.",
      },
      length: {
        legend: "Durée",
        playForAbout: "Jouer environ {duration}",
        endsAround: "Se terminerait vers {time} en commençant maintenant.",
      },
      rake: {
        legend: "Rake",
        remove: "Retirer",
        defaultHouseName: "La maison",
      },
      chipMath: "Nombre de joueurs pour le calcul des jetons",
      sides: {
        legend: "Jeux annexes",
        bombPots: "Bomb pots",
        ante: "Ante {sym}",
        bombEvery: "Toutes les combien de minutes (0 = sur demande)",
        doubleBoard: "Double board",
        sevenTwo: "Le jeu du 7-2",
        eachPays: "Chaque joueur paie {sym}",
        highHand: "Meilleure main",
        prize: "Prix {sym}",
        highHandEvery: "Minutes par période (0 = toute la partie)",
        note: "Les bomb pots et le 7-2 se paient en jetons à la table. Le prix de la meilleure main est payé par la maison au règlement.",
      },
    },
    tournament: {
      buyInStacks: {
        legend: "Buy-in et tapis",
        buyIn: "Buy-in {sym}",
        startingStack: "Tapis de départ",
        expectedPlayers: "Joueurs attendus",
        startingDepth: "Profondeur de départ",
      },
      length: {
        legend: "Durée",
        wrapUpAbout: "Se terminer en environ {duration}",
        levelLength: "Durée d'un niveau",
        levelsBetweenBreaks: "Niveaux entre les pauses (0 = aucune)",
        breakMinutes: "Minutes de pause",
        antesFromLevel: "Ante à partir du niveau (0 = jamais)",
      },
      rebuys: {
        rebuysAddOn: "Recaves et add-on",
        lateRegistration: "Inscription tardive",
        bounty: "Bounty",
        rebuysLabel: "Recaves",
        cost: "Coût {sym}",
        chips: "Jetons",
        throughLevel: "Jusqu'au niveau",
        addOnLabel: "Add-on (à la première pause)",
        lateRegThroughLevel: "Inscription tardive jusqu'au niveau",
        bountyField: "Bounty {sym} (inclus dans le buy-in, 0 = aucun)",
        bountyKind: "Type de bounty",
        kindFlat: "Fixe",
        kindProgressive: "Progressif (PKO)",
        kindMystery: "Mystère",
        mysteryFrom: "Enveloppes à combien de joueurs restants (0 = dans les places payées)",
        hint: {
          flat: "Une élimination rapporte tout le bounty.",
          progressive: "Une élimination rapporte la moitié du bounty. L'autre moitié s'ajoute à la tête de celui qui élimine, donc les bounties grossissent au fil du jeu.",
          mystery: "Les éliminations ne rapportent rien avant la sortie des enveloppes. Ensuite, chaque élimination ouvre une enveloppe au hasard prise dans tout l'argent des bounties.",
        },
      },
      payouts: {
        legend: "Répartition des gains",
        percentagesLabel: "Pourcentages, 1ère place en premier (vide = automatique)",
        sumWarning: "Le total fait {n}%, pas 100%",
        roundTo: "Arrondir les gains à",
        poolCaption: "Avec {n} joueurs, le pot est d'environ {pool}",
        poolAfter: "(après {parts})",
        joinAnd: "et",
        bountyPart: "{amount} par joueur pour les bounties",
        housePart: "{amount} pour la maison",
      },
      houseCut: {
        legend: "Commission de la maison",
        optional: "Optionnel",
        remove: "Retirer",
      },
    },
    addable: {
      caption: "Aussi pour cette partie :",
      rakeOrSeatFee: "Rake ou frais de table",
      rebuysAddOns: "Recaves et add-ons",
      bounty: "Bounty",
      turnOnForEvery: "Activer pour toutes les parties",
    },
    players: {
      legend: "Joueurs",
      optional: "Facultatif, ou à ajouter plus tard",
      namesLabel: "Noms, un par ligne ou séparés par des virgules",
      namesPlaceholder: "Alex, Sam, Jordan",
      regulars: "Habitués :",
      gamesCount: { one: "{count} partie", other: "{count} parties" },
      notesLabel: "Règles de la maison / notes, une par ligne (affichées sur l'écran)",
      notesPlaceholder: "Pas de mises en plusieurs temps. Un joueur par main. Les cartes restent sur la table.",
      addHouseRules: "Ajouter les règles de la maison",
      editHouseRules: "Modifier vos règles de la maison",
      writeHouseRules: "Rédiger vos règles de la maison",
    },
    previewCash: {
      eachBuyInGets: "Chaque buy-in ({amount}) donne",
      coversAbout: "Ce set couvre environ {n} buy-ins standards au total",
      fewerThan: "(moins de {n} joueurs. Il en manquera.)",
      cantMake: "Impossible de composer ce buy-in avec ce set.",
      summary: "Résumé",
      rowBlinds: "Blindes",
      rowBuyIn: "Buy-in",
      rowLength: "Durée",
      rowRake: "Rake",
      straddlesInline: " (straddles autorisés)",
      rakeNone: "Aucun",
      rakePct: "{pct} %, plafonné à {cap}",
      rakeSeat: "{fee} par joueur",
    },
    previewTournament: {
      eachPlayerStarts: "Chaque joueur commence avec",
      chipMathCaption: "{chips} jetons valent {bb} grosses blindes au niveau 1. Le plus grand tapis égal pour {n} joueurs est d'environ {amount}.",
      blindStructure: "Structure des blindes",
      resetToAuto: "Revenir à l'automatique",
      autoEdit: "Automatique · Modifiez une cellule pour la changer",
      levelsOver: "{n} niveaux sur {duration}",
      endsAroundLevel: "(se termine vers {sb}/{bb})",
      startNowTime: "· ~{time} en commençant maintenant.",
      overtimeNote: "Les niveaux en italique servent si la partie se prolonge. Durée totale avec prolongation : {duration}.",
    },
    actions: {
      dealIt: "Distribuer",
    },
    alerts: {
      makeChipSetFirst: "Créez d'abord un set de jetons",
      structureEmpty: "La structure des blindes est vide",
      templateGone: "Ce modèle n'existe plus",
      presetGone: "Ce préréglage n'existe plus.",
      loadedTemplate: "«{name}» chargé",
      gameGone: "Cette partie n'existe plus",
      copiedSetup: "Configuration copiée depuis «{name}». Modifiez ce qu'il faut, puis distribuez.",
      replaceTemplateConfirm: "Remplacer le modèle «{name}» ?",
      savedTemplate: "«{name}» enregistré. Il est dans la liste des modèles et dans Commandes ({key}).",
    },
  },
  ar: {
    header: {
      titleCash: "لعبة نقدية جديدة",
      titleTournament: "بطولة جديدة",
      templateNamePlaceholder: "اسم القالب",
      templateNameAria: "اسم القالب",
      loadTemplateAria: "تحميل قالب",
      startFromOption: "ابدأ من…",
      yourTemplates: "قوالبك",
      builtIn: "مضمّنة",
      presets: {
        turbo: "توربو (مستويات 10 دقائق)",
        hyper: "هايبر توربو (مستويات 5 دقائق)",
        deepstack: "رصيد عميق (200 BB، مستويات 30 دقيقة)",
        freezeout: "فريز آوت (بلا إعادة شراء)",
        sitgo: "سيت آند غو (طاولة واحدة، أول 3 يفوزون)",
        pko: "إقصاء تصاعدي (PKO)",
        mystery: "مكافأة غامضة",
      },
      saveAsTemplate: "حفظ كقالب",
      switchToTournament: "التبديل إلى البطولة",
      switchToCash: "التبديل إلى اللعبة النقدية",
      cashGame: "لعبة نقدية",
      tournament: "البطولة",
    },
    basics: {
      legend: "الأساسيات",
      name: "الاسم",
      chipSet: "طقم الرقائق",
      editSets: "تعديل الأطقم",
      yours: "طقمك",
      chipValues: "قيم الرقائق",
      asPrinted: "كما هي مطبوعة",
      printedTimes: "القيمة المطبوعة ×{n}",
      chipPlaysAs: "الرقاقة {chip} تُحتسب بقيمة {value} في هذه اللعبة",
    },
    cash: {
      blinds: {
        legend: "الرهانات العمياء",
        smallBlind: "الرهان الأعمى الصغير {sym}",
        bigBlind: "الرهان الأعمى الكبير {sym}",
        straddlesAllowed: "الستراديل مسموح به",
      },
      buyIns: {
        legend: "قيمة الدخول",
        min: "الحد الأدنى {sym}",
        standard: "القياسي {sym}",
        max: "الحد الأقصى {sym}",
        standardBefore: "قيمة الدخول القياسية تساوي ",
        standardAfter: " من الرهان الأعمى الكبير.",
      },
      length: {
        legend: "المدة",
        playForAbout: "اللعب لمدة تقارب {duration}",
        endsAround: "ستنتهي حوالي الساعة {time} إذا بدأتم الآن.",
      },
      rake: {
        legend: "عمولة النادي",
        remove: "إزالة",
        defaultHouseName: "النادي",
      },
      chipMath: "عدد اللاعبين لحساب الرقائق",
      sides: {
        legend: "ألعاب جانبية",
        bombPots: "بومب بوت",
        ante: "الرهان الإجباري {sym}",
        bombEvery: "كل كم دقيقة (0 = عند الطلب)",
        doubleBoard: "لوحتان",
        sevenTwo: "لعبة 7-2",
        eachPays: "كل لاعب يدفع {sym}",
        highHand: "أعلى يد",
        prize: "الجائزة {sym}",
        highHandEvery: "دقائق كل فترة (0 = اللعبة كلها)",
        note: "البومب بوت وربح 7-2 يُدفعان بالرقائق على الطاولة. جائزة أعلى يد تدفعها الجهة المنظمة عند التسوية.",
      },
    },
    tournament: {
      buyInStacks: {
        legend: "قيمة الدخول والرصيد",
        buyIn: "قيمة الدخول {sym}",
        startingStack: "الرصيد الافتتاحي",
        expectedPlayers: "عدد اللاعبين المتوقع",
        startingDepth: "العمق الافتتاحي",
      },
      length: {
        legend: "المدة",
        wrapUpAbout: "الانتهاء خلال حوالي {duration}",
        levelLength: "مدة المستوى",
        levelsBetweenBreaks: "عدد المستويات بين فترات الراحة (0 = بدون راحة)",
        breakMinutes: "دقائق الراحة",
        antesFromLevel: "بدء الأنتي من المستوى (0 = بدون أنتي)",
      },
      rebuys: {
        rebuysAddOn: "إعادة الدخول وإضافة الرقائق",
        lateRegistration: "التسجيل المتأخر",
        bounty: "مكافأة الإقصاء",
        rebuysLabel: "إعادة الدخول",
        cost: "التكلفة {sym}",
        chips: "الرقائق",
        throughLevel: "حتى المستوى",
        addOnLabel: "إضافة رقائق (في أول استراحة)",
        lateRegThroughLevel: "التسجيل المتأخر حتى المستوى",
        bountyField: "مكافأة الإقصاء {sym} (جزء من قيمة الدخول، 0 = بدون مكافأة)",
        bountyKind: "نوع مكافأة الإقصاء",
        kindFlat: "ثابتة",
        kindProgressive: "تصاعدية (PKO)",
        kindMystery: "غامضة",
        mysteryFrom: "تظهر الأظرف عند بقاء عدد اللاعبين (0 = عند دخول الجوائز)",
        hint: {
          flat: "الإقصاء يدفع المكافأة كاملة.",
          progressive: "الإقصاء يدفع نصف المكافأة، ويُضاف النصف الآخر إلى رأس من أقصى، فتكبر المكافآت مع تقدم اللعب.",
          mystery: "لا يدفع الإقصاء شيئًا حتى تظهر الأظرف. بعدها كل إقصاء يفتح ظرفًا عشوائيًا من مال المكافآت كله.",
        },
      },
      payouts: {
        legend: "توزيع الجوائز",
        percentagesLabel: "النسب المئوية، المركز الأول أولًا (فارغ = تلقائي)",
        sumWarning: "المجموع {n}%، وليس 100%",
        roundTo: "تقريب الجوائز إلى",
        poolCaption: "مع {n} لاعبًا يكون وعاء الجوائز حوالي {pool}",
        poolAfter: "(بعد خصم {parts})",
        joinAnd: "و",
        bountyPart: "{amount} للاعب الواحد كمكافآت إقصاء",
        housePart: "{amount} لصالح النادي",
      },
      houseCut: {
        legend: "عمولة النادي الإضافية",
        optional: "اختياري",
        remove: "إزالة",
      },
    },
    addable: {
      caption: "يمكن أيضًا إضافة ما يلي لهذه اللعبة:",
      rakeOrSeatFee: "عمولة النادي أو رسوم المقعد",
      rebuysAddOns: "إعادة الدخول وإضافة الرقائق",
      bounty: "مكافأة الإقصاء",
      turnOnForEvery: "تفعيلها لكل لعبة",
    },
    players: {
      legend: "اللاعبون",
      optional: "اختياري، أو يمكن إضافتهم لاحقًا",
      namesLabel: "الأسماء، اسم في كل سطر أو مفصولة بفواصل",
      namesPlaceholder: "علي, سام, جودي",
      regulars: "اللاعبون المعتادون:",
      gamesCount: {
        zero: "{count} لعبة",
        one: "{count} لعبة",
        two: "{count} لعبتان",
        few: "{count} ألعاب",
        many: "{count} لعبة",
        other: "{count} لعبة",
      },
      notesLabel: "قواعد النادي / ملاحظات، ملاحظة في كل سطر (تظهر على شاشة العرض)",
      notesPlaceholder: "لا يُسمح بالمراهنة على دفعات. لاعب واحد لكل يد. تبقى الأوراق على الطاولة.",
      addHouseRules: "إضافة قواعد النادي",
      editHouseRules: "تعديل قواعد ناديكم",
      writeHouseRules: "كتابة قواعد ناديكم",
    },
    previewCash: {
      eachBuyInGets: "كل دخول ({amount}) يحصل على",
      coversAbout: "هذا الطقم يكفي لنحو {n} من الدخول القياسي إجمالًا",
      fewerThan: "(أقل من {n} لاعبًا. ستنقص الرقائق.)",
      cantMake: "لا يمكن تكوين قيمة الدخول هذه من هذا الطقم.",
      summary: "الملخص",
      rowBlinds: "الرهانات العمياء",
      rowBuyIn: "قيمة الدخول",
      rowLength: "المدة",
      rowRake: "عمولة النادي",
      straddlesInline: " (الستراديل مسموح به)",
      rakeNone: "بدون",
      rakePct: "{pct}٪ حتى حد أقصى {cap}",
      rakeSeat: "{fee} لكل مقعد",
    },
    previewTournament: {
      eachPlayerStarts: "كل لاعب يبدأ برصيد",
      chipMathCaption: "{chips} رقاقة تساوي {bb} من الرهان الأعمى الكبير في المستوى الأول. أكبر رصيد متساوٍ لتوزيعه على {n} لاعبًا يبلغ نحو {amount}.",
      blindStructure: "هيكل الرهانات العمياء",
      resetToAuto: "الرجوع إلى الوضع التلقائي",
      autoEdit: "تلقائي · عدّل أي خلية لتغييرها",
      levelsOver: "{n} مستوى خلال {duration}",
      endsAroundLevel: "(تنتهي عند حوالي {sb}/{bb})",
      startNowTime: "· حوالي الساعة {time} إذا بدأتم الآن.",
      overtimeNote: "المستويات المائلة مخصصة للوقت الإضافي إن طالت اللعبة. المدة الإجمالية مع الوقت الإضافي: {duration}.",
    },
    actions: {
      dealIt: "ابدأ التوزيع",
    },
    alerts: {
      makeChipSetFirst: "أنشئ طقم رقائق أولًا",
      structureEmpty: "هيكل الرهانات العمياء فارغ",
      templateGone: "هذا القالب لم يعد موجودًا",
      presetGone: "هذا الإعداد لم يعد موجودًا.",
      loadedTemplate: "تم تحميل «{name}»",
      gameGone: "هذه اللعبة لم تعد موجودة",
      copiedSetup: "تم نسخ إعدادات «{name}». عدّل ما تحتاجه ثم ابدأ.",
      replaceTemplateConfirm: "هل تريد استبدال القالب «{name}»؟",
      savedTemplate: "تم حفظ «{name}». ستجده في قائمة القوالب وفي الأوامر ({key}).",
    },
  },
  bn: {
    header: {
      titleCash: "নতুন ক্যাশ গেম",
      titleTournament: "নতুন টুর্নামেন্ট",
      templateNamePlaceholder: "টেমপ্লেটের নাম",
      templateNameAria: "টেমপ্লেটের নাম",
      loadTemplateAria: "একটি টেমপ্লেট লোড করুন",
      startFromOption: "এখান থেকে শুরু করুন…",
      yourTemplates: "আপনার টেমপ্লেট",
      builtIn: "বিল্ট-ইন",
      presets: {
        turbo: "টার্বো (10 মিনিটের লেভেল)",
        hyper: "হাইপার টার্বো (5 মিনিটের লেভেল)",
        deepstack: "ডিপস্ট্যাক (200 BB, 30 মিনিটের লেভেল)",
        freezeout: "ফ্রিজআউট (রিবাই নেই)",
        sitgo: "সিট অ্যান্ড গো (এক টেবিল, সেরা 3 জন টাকা পান)",
        pko: "প্রগ্রেসিভ নকআউট (PKO)",
        mystery: "মিস্ট্রি বাউন্টি",
      },
      saveAsTemplate: "টেমপ্লেট হিসেবে সংরক্ষণ করুন",
      switchToTournament: "টুর্নামেন্টে পরিবর্তন করুন",
      switchToCash: "ক্যাশ গেমে পরিবর্তন করুন",
      cashGame: "ক্যাশ গেম",
      tournament: "টুর্নামেন্ট",
    },
    basics: {
      legend: "মূল বিষয়",
      name: "নাম",
      chipSet: "চিপ সেট",
      editSets: "সেট সম্পাদনা করুন",
      yours: "আপনার",
      chipValues: "চিপের মূল্য",
      asPrinted: "মুদ্রিত মূল্য অনুযায়ী",
      printedTimes: "মুদ্রিত মূল্য ×{n}",
      chipPlaysAs: "একটি {chip} চিপ এই খেলায় {value} হিসেবে গণ্য হবে",
    },
    cash: {
      blinds: {
        legend: "ব্লাইন্ড",
        smallBlind: "স্মল ব্লাইন্ড {sym}",
        bigBlind: "বিগ ব্লাইন্ড {sym}",
        straddlesAllowed: "স্ট্র্যাডল অনুমোদিত",
      },
      buyIns: {
        legend: "বাই-ইন",
        min: "সর্বনিম্ন {sym}",
        standard: "স্ট্যান্ডার্ড {sym}",
        max: "সর্বোচ্চ {sym}",
        standardBefore: "স্ট্যান্ডার্ড বাই-ইন = ",
        standardAfter: " বিগ ব্লাইন্ডের সমান।",
      },
      length: {
        legend: "সময়কাল",
        playForAbout: "প্রায় {duration} ধরে খেলুন",
        endsAround: "এখনই শুরু করলে শেষ হবে প্রায় {time} সময়ে।",
      },
      rake: {
        legend: "রেক",
        remove: "সরান",
        defaultHouseName: "হাউস",
      },
      chipMath: "চিপ হিসাবের জন্য কতজন খেলোয়াড়",
      sides: {
        legend: "সাইড গেম",
        bombPots: "বম্ব পট",
        ante: "অ্যান্টি {sym}",
        bombEvery: "কত মিনিট পরপর (0 = ডাকলে)",
        doubleBoard: "ডাবল বোর্ড",
        sevenTwo: "7-2 গেম",
        eachPays: "প্রত্যেক খেলোয়াড় দেন {sym}",
        highHand: "হাই হ্যান্ড",
        prize: "পুরস্কার {sym}",
        highHandEvery: "প্রতি পর্বের মিনিট (0 = পুরো গেম)",
        note: "বম্ব পট আর 7-2 জয় টেবিলে চিপসে দেওয়া হয়। হাই হ্যান্ডের পুরস্কার হাউস সেটল-আপে দেয়।",
      },
    },
    tournament: {
      buyInStacks: {
        legend: "বাই-ইন ও স্ট্যাক",
        buyIn: "বাই-ইন {sym}",
        startingStack: "শুরুর স্ট্যাক",
        expectedPlayers: "প্রত্যাশিত খেলোয়াড়",
        startingDepth: "শুরুর গভীরতা",
      },
      length: {
        legend: "সময়কাল",
        wrapUpAbout: "প্রায় {duration}-এর মধ্যে শেষ করুন",
        levelLength: "লেভেলের দৈর্ঘ্য",
        levelsBetweenBreaks: "কতটি লেভেল পর বিরতি (0 = বিরতি নেই)",
        breakMinutes: "বিরতির মিনিট",
        antesFromLevel: "কোন লেভেল থেকে অ্যান্টি শুরু (0 = কখনো নয়)",
      },
      rebuys: {
        rebuysAddOn: "রিবাই ও অ্যাড-অন",
        lateRegistration: "দেরিতে নিবন্ধন",
        bounty: "বাউন্টি",
        rebuysLabel: "রিবাই",
        cost: "খরচ {sym}",
        chips: "চিপস",
        throughLevel: "কোন লেভেল পর্যন্ত",
        addOnLabel: "অ্যাড-অন (প্রথম বিরতিতে)",
        lateRegThroughLevel: "দেরিতে নিবন্ধন কোন লেভেল পর্যন্ত",
        bountyField: "বাউন্টি {sym} (বাই-ইনের অংশ, 0 = নেই)",
        bountyKind: "বাউন্টির ধরন",
        kindFlat: "ফ্ল্যাট",
        kindProgressive: "প্রগ্রেসিভ (PKO)",
        kindMystery: "মিস্ট্রি",
        mysteryFrom: "কতজন বাকি থাকলে খাম বেরোবে (0 = ইন দ্য মানি হলে)",
        hint: {
          flat: "নকআউটে পুরো বাউন্টি পাওয়া যায়।",
          progressive: "নকআউটে অর্ধেক বাউন্টি পাওয়া যায়। বাকি অর্ধেক যিনি নকআউট করলেন তাঁর নিজের মাথায় যোগ হয়, তাই বাউন্টি বাড়তে থাকে।",
          mystery: "খাম বেরোনোর আগে নকআউটে কিছু পাওয়া যায় না। তারপর প্রতিটি নকআউট পুরো বাউন্টির টাকা থেকে একটি এলোমেলো খাম খোলে।",
        },
      },
      payouts: {
        legend: "পুরস্কার বণ্টন",
        percentagesLabel: "শতাংশ, প্রথম স্থান আগে (ফাঁকা = স্বয়ংক্রিয়)",
        sumWarning: "মোট হয় {n}%, ১০০% নয়",
        roundTo: "পুরস্কার রাউন্ড করুন",
        poolCaption: "{n} জন খেলোয়াড় নিয়ে পুল হবে আনুমানিক {pool}",
        poolAfter: "({parts} বাদ দেওয়ার পর)",
        joinAnd: "এবং",
        bountyPart: "প্রতি মাথাপিছু {amount} বাউন্টিতে",
        housePart: "{amount} হাউসের জন্য",
      },
      houseCut: {
        legend: "হাউস কাট",
        optional: "ঐচ্ছিক",
        remove: "সরান",
      },
    },
    addable: {
      caption: "এই খেলার জন্য আরও যোগ করা যায়:",
      rakeOrSeatFee: "রেক বা সিট ফি",
      rebuysAddOns: "রিবাই ও অ্যাড-অন",
      bounty: "বাউন্টি",
      turnOnForEvery: "সব খেলার জন্য চালু করুন",
    },
    players: {
      legend: "খেলোয়াড়",
      optional: "ঐচ্ছিক, পরেও যোগ করা যাবে",
      namesLabel: "নাম, প্রতি লাইনে একটি অথবা কমা দিয়ে আলাদা",
      namesPlaceholder: "অমিত, রাহুল, প্রিয়া",
      regulars: "নিয়মিত খেলোয়াড়:",
      gamesCount: { one: "{count} টি খেলা", other: "{count} টি খেলা" },
      notesLabel: "হাউস রুলস / নোট, প্রতি লাইনে একটি (টিভিতে দেখানো হবে)",
      notesPlaceholder: "স্ট্রিং বেট নিষেধ। প্রতি হাতে একজন খেলোয়াড়। কার্ড টেবিলেই থাকবে।",
      addHouseRules: "হাউস রুলস যোগ করুন",
      editHouseRules: "আপনার হাউস রুলস সম্পাদনা করুন",
      writeHouseRules: "আপনার হাউস রুলস লিখুন",
    },
    previewCash: {
      eachBuyInGets: "প্রতিটি বাই-ইনে ({amount}) পাওয়া যাবে",
      coversAbout: "এই সেট মোট প্রায় {n} টি স্ট্যান্ডার্ড বাই-ইনের জন্য যথেষ্ট",
      fewerThan: "({n} জনের কম খেলোয়াড়ের জন্য। চিপ কম পড়বে।)",
      cantMake: "এই সেট দিয়ে এই বাই-ইন তৈরি করা যাচ্ছে না।",
      summary: "সারসংক্ষেপ",
      rowBlinds: "ব্লাইন্ড",
      rowBuyIn: "বাই-ইন",
      rowLength: "সময়কাল",
      rowRake: "রেক",
      straddlesInline: " (স্ট্র্যাডল অনুমোদিত)",
      rakeNone: "নেই",
      rakePct: "{pct}%, সর্বোচ্চ {cap} পর্যন্ত",
      rakeSeat: "প্রতি আসনে {fee}",
    },
    previewTournament: {
      eachPlayerStarts: "প্রতিটি খেলোয়াড় শুরু করবে",
      chipMathCaption: "{chips} চিপ লেভেল ১-এ {bb} বিগ ব্লাইন্ডের সমান। {n} জন খেলোয়াড়ের মধ্যে সমানভাবে ভাগ করলে সর্বোচ্চ স্ট্যাক প্রায় {amount}।",
      blindStructure: "ব্লাইন্ড কাঠামো",
      resetToAuto: "স্বয়ংক্রিয়তে ফিরুন",
      autoEdit: "স্বয়ংক্রিয় · পরিবর্তনের জন্য যেকোনো ঘরে ক্লিক করুন",
      levelsOver: "{duration}-এ মোট {n} টি লেভেল",
      endsAroundLevel: "(শেষে আনুমানিক {sb}/{bb})",
      startNowTime: "· এখনই শুরু করলে প্রায় {time} সময়ে।",
      overtimeNote: "ইটালিক লেভেলগুলো খেলা দীর্ঘ হলে ওভারটাইমের জন্য। ওভারটাইমসহ মোট সময়: {duration}।",
    },
    actions: {
      dealIt: "খেলা শুরু করুন",
    },
    alerts: {
      makeChipSetFirst: "প্রথমে একটি চিপ সেট তৈরি করুন",
      structureEmpty: "ব্লাইন্ড কাঠামো খালি",
      templateGone: "এই টেমপ্লেটটি আর নেই",
      presetGone: "এই প্রিসেটটি আর নেই।",
      loadedTemplate: "“{name}” লোড হয়েছে",
      gameGone: "এই খেলাটি আর নেই",
      copiedSetup: "“{name}”-এর সেটআপ কপি করা হয়েছে। যা দরকার বদলে নিন, তারপর শুরু করুন।",
      replaceTemplateConfirm: "টেমপ্লেট “{name}” প্রতিস্থাপন করবেন?",
      savedTemplate: "“{name}” সংরক্ষণ করা হয়েছে। এটি টেমপ্লেট তালিকা ও কমান্ডসে ({key}) পাওয়া যাবে।",
    },
  },
  pt: {
    header: {
      titleCash: "Novo cash game",
      titleTournament: "Novo torneio",
      templateNamePlaceholder: "Nome do modelo",
      templateNameAria: "Nome do modelo",
      loadTemplateAria: "Carregar um modelo",
      startFromOption: "Começar de…",
      yourTemplates: "Seus modelos",
      builtIn: "Incluídos",
      presets: {
        turbo: "Turbo (níveis de 10 min)",
        hyper: "Hiper turbo (níveis de 5 min)",
        deepstack: "Deepstack (200 BB, níveis de 30 min)",
        freezeout: "Freezeout (sem recompras)",
        sitgo: "Sit & Go (uma mesa, 3 primeiros pagos)",
        pko: "Knockout progressivo (PKO)",
        mystery: "Bounty misterioso",
      },
      saveAsTemplate: "Salvar como modelo",
      switchToTournament: "Mudar para torneio",
      switchToCash: "Mudar para cash game",
      cashGame: "Cash game",
      tournament: "Torneio",
    },
    basics: {
      legend: "O básico",
      name: "Nome",
      chipSet: "Conjunto de fichas",
      editSets: "Editar conjuntos",
      yours: "Seu",
      chipValues: "Valor das fichas",
      asPrinted: "Conforme impresso",
      printedTimes: "Valor impresso ×{n}",
      chipPlaysAs: "Uma ficha de {chip} vale {value} nesta partida",
    },
    cash: {
      blinds: {
        legend: "Blinds",
        smallBlind: "Small Blind {sym}",
        bigBlind: "Big Blind {sym}",
        straddlesAllowed: "Straddles permitidos",
      },
      buyIns: {
        legend: "Buy-ins",
        min: "Mínimo {sym}",
        standard: "Padrão {sym}",
        max: "Máximo {sym}",
        standardBefore: "O buy-in padrão equivale a ",
        standardAfter: " big blinds.",
      },
      length: {
        legend: "Duração",
        playForAbout: "Jogar por cerca de {duration}",
        endsAround: "Deve terminar por volta de {time} se começarem agora.",
      },
      rake: {
        legend: "Rake",
        remove: "Remover",
        defaultHouseName: "A casa",
      },
      chipMath: "Quantos jogadores para o cálculo das fichas",
      sides: {
        legend: "Jogos extras",
        bombPots: "Bomb pots",
        ante: "Ante {sym}",
        bombEvery: "A cada quantos minutos (0 = quando pedido)",
        doubleBoard: "Board duplo",
        sevenTwo: "O jogo do 7-2",
        eachPays: "Cada jogador paga {sym}",
        highHand: "Mão mais alta",
        prize: "Prêmio {sym}",
        highHandEvery: "Minutos por período (0 = jogo todo)",
        note: "Bomb pots e o 7-2 são pagos em fichas na mesa. O prêmio da mão mais alta é pago pela casa no acerto.",
      },
    },
    tournament: {
      buyInStacks: {
        legend: "Buy-in e stacks",
        buyIn: "Buy-in {sym}",
        startingStack: "Stack inicial",
        expectedPlayers: "Jogadores esperados",
        startingDepth: "Profundidade inicial",
      },
      length: {
        legend: "Duração",
        wrapUpAbout: "Encerrar em cerca de {duration}",
        levelLength: "Duração do nível",
        levelsBetweenBreaks: "Níveis entre intervalos (0 = nenhum)",
        breakMinutes: "Minutos de intervalo",
        antesFromLevel: "Ante a partir do nível (0 = nenhum)",
      },
      rebuys: {
        rebuysAddOn: "Rebuys e add-on",
        lateRegistration: "Inscrição tardia",
        bounty: "Bounty",
        rebuysLabel: "Rebuys",
        cost: "Custo {sym}",
        chips: "Fichas",
        throughLevel: "Até o nível",
        addOnLabel: "Add-on (no primeiro intervalo)",
        lateRegThroughLevel: "Inscrição tardia até o nível",
        bountyField: "Bounty {sym} (parte do buy-in, 0 = nenhum)",
        bountyKind: "Tipo de bounty",
        kindFlat: "Fixo",
        kindProgressive: "Progressivo (PKO)",
        kindMystery: "Misterioso",
        mysteryFrom: "Envelopes quando restarem jogadores (0 = ao entrar nos prêmios)",
        hint: {
          flat: "Uma eliminação paga o bounty inteiro.",
          progressive: "Uma eliminação paga metade do bounty. A outra metade vai para a cabeça de quem eliminou, então os bounties crescem durante o jogo.",
          mystery: "As eliminações não pagam nada até os envelopes saírem. Depois disso, cada eliminação abre um envelope aleatório com o dinheiro dos bounties.",
        },
      },
      payouts: {
        legend: "Premiação",
        percentagesLabel: "Porcentagens, 1º lugar primeiro (vazio = automático)",
        sumWarning: "Soma {n}%, não 100%",
        roundTo: "Arredondar a premiação para",
        poolCaption: "Com {n} jogadores o total premiado é de ~{pool}",
        poolAfter: "(depois de {parts})",
        joinAnd: "e",
        bountyPart: "{amount} por cabeça em bounties",
        housePart: "{amount} para a casa",
      },
      houseCut: {
        legend: "Comissão da casa",
        optional: "Opcional",
        remove: "Remover",
      },
    },
    addable: {
      caption: "Também disponível para esta partida:",
      rakeOrSeatFee: "Rake ou taxa de assento",
      rebuysAddOns: "Rebuys e add-ons",
      bounty: "Bounty",
      turnOnForEvery: "Ativar para todas as partidas",
    },
    players: {
      legend: "Jogadores",
      optional: "Opcional, ou adicione depois",
      namesLabel: "Nomes, um por linha ou separados por vírgulas",
      namesPlaceholder: "Alex, Sam, Jordan",
      regulars: "Frequentes:",
      gamesCount: { one: "{count} jogo", other: "{count} jogos" },
      notesLabel: "Regras da casa / notas, uma por linha (exibidas na tela)",
      notesPlaceholder: "Sem apostas em duas etapas. Um jogador por mão. As cartas ficam na mesa.",
      addHouseRules: "Adicionar as regras da casa",
      editHouseRules: "Editar suas regras da casa",
      writeHouseRules: "Escrever suas regras da casa",
    },
    previewCash: {
      eachBuyInGets: "Cada buy-in ({amount}) rende",
      coversAbout: "Este conjunto cobre cerca de {n} buy-ins padrão no total",
      fewerThan: "(menos de {n} jogadores. Vai faltar ficha.)",
      cantMake: "Não é possível formar esse buy-in com este conjunto.",
      summary: "Resumo",
      rowBlinds: "Blinds",
      rowBuyIn: "Buy-in",
      rowLength: "Duração",
      rowRake: "Rake",
      straddlesInline: " (straddles permitidos)",
      rakeNone: "Nenhum",
      rakePct: "{pct}%, até {cap}",
      rakeSeat: "{fee} por assento",
    },
    previewTournament: {
      eachPlayerStarts: "Cada jogador começa com",
      chipMathCaption: "{chips} fichas equivalem a {bb} big blinds no nível 1. O maior stack igual para {n} jogadores é de cerca de {amount}.",
      blindStructure: "Estrutura de blinds",
      resetToAuto: "Voltar ao automático",
      autoEdit: "Automático · Edite qualquer célula para alterar",
      levelsOver: "{n} níveis em {duration}",
      endsAroundLevel: "(termina por volta de {sb}/{bb})",
      startNowTime: "· ~{time} se começarem agora.",
      overtimeNote: "Os níveis em itálico existem para o caso de a partida se prolongar. Duração total com prorrogação: {duration}.",
    },
    actions: {
      dealIt: "Distribuir",
    },
    alerts: {
      makeChipSetFirst: "Crie um conjunto de fichas primeiro",
      structureEmpty: "A estrutura de blinds está vazia",
      templateGone: "Esse modelo não existe mais",
      presetGone: "Essa predefinição não está mais aqui.",
      loadedTemplate: "“{name}” carregado",
      gameGone: "Essa partida não existe mais",
      copiedSetup: "Configuração copiada de “{name}”. Ajuste o que precisar e distribua.",
      replaceTemplateConfirm: "Substituir o modelo “{name}”?",
      savedTemplate: "“{name}” salvo. Está na lista de modelos e em Comandos ({key}).",
    },
  },
};

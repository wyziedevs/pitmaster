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
    game: string;
    chipSet: string;
    league: string;
    editLeagues: string;
    noLeague: string;
    editSets: string;
    yours: string;
    chipValues: string;
    asPrinted: string;
    printedTimes: string;
    chipPlaysAs: string;
  };
  variants: {
    addable: string;
    legend: string;
    remove: string;
    game: string;
    oneGame: string;
    dealersChoice: string;
    mixed: string;
    yourMix: string;
    choiceOrder: string;
    mixOrder: string;
    pickSome: string;
    rotateEvery: string;
    studAnte: string;
    bringIn: string;
    limitNoteCash: string;
    limitNoteTourney: string;
  };
  dice: {
    fewPlayersConfirm: string;
    rulesLegend: string;
    dicePerPlayer: string;
    onesWild: string;
    palifico: string;
    palificoHint: string;
    spotOn: string;
    spotOnOthers: string;
    spotOnGain: string;
    spotOnOff: string;
    stakesLegend: string;
    stakesPot: string;
    stakesPerDie: string;
    potCaption: string;
    perDie: string;
    perDieTo: string;
    toWinner: string;
    toPot: string;
    toWinnerHint: string;
    toPotHint: string;
    entryLegend: string;
    entryFull: string;
    entryQuick: string;
    entryFullHint: string;
    entryQuickHint: string;
    eachPlayer: string;
    howItPlays: string;
  };
  lives: {
    eachPlayer: string;
    livesEach: string;
    stakesPerLife: string;
    perLife: string;
    toWinner: string;
    toWinnerHint: string;
    toPotHint: string;
    rules: {
      scat: string;
      screw: string;
      whist: string;
      ship: string;
      custom: string;
    };
  };
  pot: {
    potLegend: string;
    ante: string;
    limit: string;
    limitHint: string;
    leftover: string;
    leftoverSplit: string;
    leftoverBack: string;
    eachRound: string;
    firstPot: string;
    rules: {
      inbetween: string;
      guts: string;
      bourre: string;
      pigs: string;
      custom: string;
    };
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
    format: {
      legend: string;
      addable: string;
      remove: string;
      shootout: string;
      shootoutHint: string;
      standard: string;
      bracket: string;
      bracketHint: string;
      satellite: string;
      satelliteHint: string;
      seatValue: string;
      seats: PluralForms;
      seatsCaption: string;
      restCaption: string;
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
    fewPlayersConfirm: string;
    namesLabel: string;
    namesPlaceholder: string;
    regulars: string;
    satelliteWinners: string;
    seatsFrom: string;
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
      game: "Game",
      chipSet: "Chip Set",
      league: "League",
      editLeagues: "Leagues",
      noLeague: "None",
      editSets: "Edit Sets",
      yours: "Yours",
      chipValues: "Chip Values",
      asPrinted: "As Printed",
      printedTimes: "Printed ×{n}",
      chipPlaysAs: "A {chip} chip plays as {value}",
    },
    variants: {
      addable: "Other Poker Games",
      legend: "Game",
      remove: "Just Hold'em",
      game: "Game",
      oneGame: "One Game",
      dealersChoice: "Dealer's Choice",
      mixed: "Mixed Games",
      yourMix: "Your Own Mix",
      choiceOrder: "Dealt in this order: {games}.",
      mixOrder: "A new game each level, in this order: {games}.",
      pickSome: "Pick the games to play.",
      rotateEvery: "Next Game Every (Minutes, 0 = You Switch)",
      studAnte: "Stud Ante {sym}",
      bringIn: "Bring-In {sym}",
      limitNoteCash: "Limit games bet the big blind and twice it, so blinds of 1/2 play 2/4.",
      limitNoteTourney: "Each level plays its game. Limit games bet the big blind and twice it, and stud levels get an ante and a bring-in.",
    },
    dice: {
      fewPlayersConfirm: "Liar's dice needs at least two players. Start it anyway and add them on the next page?",
      rulesLegend: "Rules",
      dicePerPlayer: "Dice per Player",
      onesWild: "Ones Are Wild",
      palifico: "Palifico",
      palificoHint: "When a player is down to their last die, the round they start has no wild ones, and nobody can change the face that's bid.",
      spotOn: "Spot On",
      spotOnOthers: "Spot On: Everyone Else Loses a Die",
      spotOnGain: "Spot On: The Caller Gets a Die Back",
      spotOnOff: "No Spot On",
      stakesLegend: "Stakes",
      stakesPot: "A Buy-In, Paid by Place",
      stakesPerDie: "Money per Die Lost",
      potCaption: "{n} players make a {pool} pot, paid:",
      perDie: "Per Die Lost {sym}",
      perDieTo: "Goes To",
      toWinner: "Whoever Won the Call",
      toPot: "The Pot, for the Winner",
      toWinnerHint: "Each die lost pays whoever won that call. The most anyone can lose is {most}.",
      toPotHint: "Each die lost goes in the pot, and the last one with dice takes it. The most anyone can lose is {most}.",
      entryLegend: "Entering Rounds",
      entryFull: "Full",
      entryQuick: "Quick",
      entryFullHint: "Enter the bid, who called it and how many there were, and PitMaster works out who loses a die.",
      entryQuickHint: "Just tap who lost a die. You can switch any time on the dealer screen.",
      eachPlayer: "Each Player Starts With",
      howItPlays: "Everyone rolls under a cup and bids on how many of a face there are on the whole table. Call a bid a liar and the cups come up: whoever was wrong loses a die. The last one with dice wins.",
    },
    lives: {
      eachPlayer: "Each Player Starts With",
      livesEach: "Lives Each",
      stakesPerLife: "Money per Life Lost",
      perLife: "Per Life Lost {sym}",
      toWinner: "Whoever Won the Round",
      toWinnerHint: "Each life lost pays whoever won that round. The most anyone can lose is {most}.",
      toPotHint: "Each life lost goes in the pot, and the last one standing takes it. The most anyone can lose is {most}.",
      rules: {
        scat: "Everyone gets three cards and draws to get closest to 31 in one suit. Knock to end it: everyone gets one more turn, then the lowest hand loses a life, and a knocker caught lowest loses two. A 31 wins at once, and everyone else loses one.",
        screw: "Everyone gets one card and can swap it with the player on their left, or keep it. A king stops a swap. After the dealer's turn, the lowest card loses a life.",
        whist: "Seven cards each, then one fewer every round, with a trump suit. Anyone who takes no tricks is out.",
        ship: "Roll five dice up to three times. You need a 6 (the ship), a 5 (the captain) and a 4 (the crew), in that order, and the other two dice are your score. The lowest score loses a life.",
        custom: "Everyone starts with the same lives. Each round, take away the ones they lost. The last one with any left wins.",
      },
    },
    pot: {
      potLegend: "Pot",
      ante: "Ante {sym}",
      limit: "Pot Limit {sym}",
      limitHint: "The most one bet can win or cost, and the most matching the pot costs. 0 means the whole pot.",
      leftover: "What's Left at the End",
      leftoverSplit: "Split Evenly",
      leftoverBack: "Back to Whoever Put It In",
      eachRound: "The First Pot",
      firstPot: "{players}, {ante} each",
      rules: {
        inbetween: "Two cards go up, and you bet up to the pot that the next one lands between them. Win and take your bet from the pot; lose and pay it in; hit either card (the post) and pay double.",
        guts: "Everyone antes and gets their cards, then says in or out. Of those in, the best hand takes the pot and the rest match it. When only one player is in, they take it.",
        bourre: "Five cards each, and one suit is trumps. Win the most tricks and take the pot. Take no tricks and you're bourréd: match the pot.",
        pigs: "Everyone antes. Roll the pigs and score by how they land; pig out and pay in. The first to 100 takes the pot.",
        custom: "A pot everyone antes into, pays into and takes from, however your table plays it.",
      },
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
      format: {
        legend: "Format",
        addable: "Shootout, Bracket or Satellite",
        remove: "Remove",
        shootout: "Shootout",
        shootoutHint: "Each table plays down to one winner, then the winners meet at a final table. Seats are drawn and the tables aren't balanced.",
        standard: "Standard",
        bracket: "Heads-Up Bracket",
        bracketHint: "Players meet one on one, and each match winner moves on. Seeds are drawn at random, byes fill out an uneven field, and payouts go by the round reached.",
        satellite: "Satellite",
        satelliteHint: "The prizes are seats in another game. The winners come in on that game's New Game with their buy-in paid.",
        seatValue: "Seat Worth ({sym})",
        seats: { one: "{count} seat", other: "{count} seats" },
        seatsCaption: "With {n} players the pool is {pool}: {seats} worth {value}.",
        restCaption: "{amount} goes to the next place.",
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
      fewPlayersConfirm: "This game needs at least two players. Start it anyway and add them on the next page?",
      namesLabel: "Names, One per Line or Split by Commas",
      namesPlaceholder: "Alex, Sam, Jordan",
      regulars: "Regulars:",
      satelliteWinners: "Satellite Winners",
      seatsFrom: "Seats won in {game}",
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
      game: "游戏",
      chipSet: "筹码套装",
      league: "联赛",
      editLeagues: "联赛",
      noLeague: "无",
      editSets: "编辑套装",
      yours: "自有",
      chipValues: "筹码面值",
      asPrinted: "按印制面值",
      printedTimes: "印制面值 ×{n}",
      chipPlaysAs: "一枚 {chip} 筹码在本局中价值 {value}",
    },
    variants: {
      addable: "其他扑克玩法",
      legend: "玩法",
      remove: "仅德州扑克",
      game: "玩法",
      oneGame: "单一玩法",
      dealersChoice: "庄家选择",
      mixed: "混合玩法",
      yourMix: "自选组合",
      choiceOrder: "按此顺序发牌：{games}。",
      mixOrder: "每一级换一个新玩法，顺序为：{games}。",
      pickSome: "选择要玩的玩法。",
      rotateEvery: "每隔几分钟换下一个玩法（0 = 手动切换）",
      studAnte: "梭哈前注 {sym}",
      bringIn: "强制开注 {sym}",
      limitNoteCash: "限注玩法按大盲和大盲的两倍下注，所以盲注 1/2 就按 2/4 来玩。",
      limitNoteTourney: "每一级玩各自的玩法。限注玩法按大盲和大盲的两倍下注，梭哈级别有前注和强制开注。",
    },
    dice: {
      fewPlayersConfirm: "大话骰至少需要两名玩家。仍要开始，并在下一页添加玩家吗？",
      rulesLegend: "规则",
      dicePerPlayer: "每人骰子数",
      onesWild: "1 点万能",
      palifico: "Palifico",
      palificoHint: "当某位玩家只剩最后一颗骰子时，由他开始的那一轮 1 点不算万能，而且谁都不能更改叫的点数。",
      spotOn: "刚好",
      spotOnOthers: "刚好：其他人各输一颗骰子",
      spotOnGain: "刚好：喊的人拿回一颗骰子",
      spotOnOff: "不玩刚好",
      stakesLegend: "赌注",
      stakesPot: "买入，按名次派彩",
      stakesPerDie: "每输一颗骰子付钱",
      potCaption: "{n} 名玩家凑成 {pool} 的奖池，派彩如下：",
      perDie: "每输一颗骰子 {sym}",
      perDieTo: "付给",
      toWinner: "开骰时赢的人",
      toPot: "奖池，归最后赢家",
      toWinnerHint: "每输一颗骰子，就付给那次开骰赢的人。每人最多输 {most}。",
      toPotHint: "每输一颗骰子就放进奖池，最后还有骰子的人拿走。每人最多输 {most}。",
      entryLegend: "记录每轮",
      entryFull: "完整",
      entryQuick: "快速",
      entryFullHint: "输入叫的数、谁开的、实际有几个，PitMaster 会算出谁输一颗骰子。",
      entryQuickHint: "只需点一下谁输了骰子。随时可以在游戏面板上切换。",
      eachPlayer: "每人起始骰子",
      howItPlays: "每个人把骰子摇在骰盅里，然后叫全桌某个点数一共有几个。有人喊开，就揭开骰盅：错的一方输一颗骰子。最后还有骰子的人获胜。",
    },
    lives: {
      eachPlayer: "每人开局拥有",
      livesEach: "每人几条命",
      stakesPerLife: "每丢一条命付钱",
      perLife: "每丢一条命 {sym}",
      toWinner: "那一轮的赢家",
      toWinnerHint: "每丢一条命，就付给那一轮的赢家。每人最多输 {most}。",
      toPotHint: "每丢一条命就放进奖池，最后活下来的人拿走。每人最多输 {most}。",
      rules: {
        scat: "每人发三张牌，轮流换牌，争取同一花色的点数最接近 31。有人敲桌就结束：其他人各再轮一次，然后点数最低的扣一条命，敲桌的人如果最低就扣两条。凑到 31 立刻获胜，其他人各扣一条命。",
        screw: "每人一张牌，可以和左边的玩家交换，也可以留着。有 K 就不能换。庄家轮完后，牌最小的扣一条命。",
        whist: "每人七张牌，之后每轮少发一张，并有一门将牌。一墩都没赢的人出局。",
        ship: "五颗骰子最多掷三次。你要按顺序凑出 6（船）、5（船长）和 4（船员），另外两颗骰子就是你的分数。分数最低的扣一条命。",
        custom: "每人开始时命数相同。每轮扣掉各自丢的命。最后还有命的人获胜。",
      },
    },
    pot: {
      potLegend: "奖池",
      ante: "底注 {sym}",
      limit: "奖池上限 {sym}",
      limitHint: "一次下注最多能赢或输多少，以及赔奖池最多赔多少。0 表示整个奖池。",
      leftover: "最后剩下的钱",
      leftoverSplit: "平分",
      leftoverBack: "退还给出钱的人",
      eachRound: "第一个奖池",
      firstPot: "{players}，每人 {ante}",
      rules: {
        inbetween: "翻开两张牌，你押不超过奖池的钱，赌下一张落在两张之间。赢了从奖池拿走你的注；输了把注放进奖池；和任一张相同（撞柱）要赔双倍。",
        guts: "每人下底注拿牌，然后说进还是不进。进的人里牌最好的拿走奖池，其余的人各赔一个奖池。只有一个人进时，他直接拿走。",
        bourre: "每人五张牌，一门花色是将牌。赢墩最多的人拿走奖池。一墩都没赢就是被 Bourré 了：要赔一个奖池。",
        pigs: "每人下底注。掷小猪，按落地的姿势计分；掷出 Pig Out 就往奖池付钱。先到 100 分的人拿走奖池。",
        custom: "一个大家下底注、往里付钱、从里拿钱的奖池，按你们桌上的玩法来。",
      },
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
      format: {
        legend: "赛制",
        addable: "淘汰赛、对阵表或卫星赛",
        remove: "移除",
        shootout: "淘汰赛",
        shootoutHint: "每桌打到只剩一位赢家，然后赢家们在决赛桌相遇。会抽座位，各桌不做平衡。",
        standard: "标准",
        bracket: "单挑对阵",
        bracketHint: "玩家一对一交手，每场的赢家晋级。种子位随机抽签，人数不齐时用轮空补齐，奖金按打到的轮次发放。",
        satellite: "卫星赛",
        satelliteHint: "奖品是另一场比赛的席位。赢家在那场比赛的新建页面加入，买入已付。",
        seatValue: "每席价值（{sym}）",
        seats: { one: "{count} 个席位", other: "{count} 个席位" },
        seatsCaption: "{n} 位玩家时奖池为 {pool}：{seats}，每个价值 {value}。",
        restCaption: "{amount} 给下一名。",
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
      fewPlayersConfirm: "这个游戏至少需要两名玩家。仍要开始，并在下一页添加玩家吗？",
      namesLabel: "姓名，每行一个或用逗号分隔",
      namesPlaceholder: "小明, 小华, 小刚",
      regulars: "常客：",
      satelliteWinners: "卫星赛赢家",
      seatsFrom: "在{game}赢得的席位",
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
      game: "गेम",
      chipSet: "चिप सेट",
      league: "लीग",
      editLeagues: "लीग",
      noLeague: "कोई नहीं",
      editSets: "सेट संपादित करें",
      yours: "आपका",
      chipValues: "चिप मूल्य",
      asPrinted: "छपे मूल्य पर",
      printedTimes: "छपा मूल्य ×{n}",
      chipPlaysAs: "एक {chip} चिप इस गेम में {value} की मानी जाएगी",
    },
    variants: {
      addable: "दूसरे पोकर गेम्स",
      legend: "गेम",
      remove: "सिर्फ़ होल्डम",
      game: "गेम",
      oneGame: "एक गेम",
      dealersChoice: "डीलर्स चॉइस",
      mixed: "मिक्स्ड गेम्स",
      yourMix: "अपना मिक्स",
      choiceOrder: "इस क्रम में डील होंगे: {games}।",
      mixOrder: "हर लेवल पर नया गेम, इस क्रम में: {games}।",
      pickSome: "खेलने के लिए गेम चुनें।",
      rotateEvery: "हर कितने मिनट में अगला गेम (0 = आप खुद बदलें)",
      studAnte: "स्टड एंटी {sym}",
      bringIn: "ब्रिंग-इन {sym}",
      limitNoteCash: "लिमिट गेम्स में बेट बिग ब्लाइंड और उसका दोगुना होती है, तो 1/2 के ब्लाइंड्स पर 2/4 खेला जाता है।",
      limitNoteTourney: "हर लेवल अपना गेम खेलता है। लिमिट गेम्स में बेट बिग ब्लाइंड और उसका दोगुना होती है, और स्टड लेवल्स में एंटी और ब्रिंग-इन होते हैं।",
    },
    dice: {
      fewPlayersConfirm: "लायर्स डाइस के लिए कम से कम दो खिलाड़ी चाहिए। फिर भी शुरू करें और अगले पेज पर खिलाड़ी जोड़ें?",
      rulesLegend: "नियम",
      dicePerPlayer: "हर खिलाड़ी के पासे",
      onesWild: "एक्के वाइल्ड हैं",
      palifico: "पालिफ़िको",
      palificoHint: "जब किसी खिलाड़ी के पास आखिरी पासा बचे, तो उसके शुरू किए राउंड में एक्के वाइल्ड नहीं होते, और कोई भी बोली का अंक नहीं बदल सकता।",
      spotOn: "एकदम सही",
      spotOnOthers: "एकदम सही: बाकी सब एक पासा हारते हैं",
      spotOnGain: "एकदम सही: कहने वाले को एक पासा वापस मिलता है",
      spotOnOff: "एकदम सही का नियम नहीं",
      stakesLegend: "दांव",
      stakesPot: "बाय-इन, स्थान के हिसाब से भुगतान",
      stakesPerDie: "हर हारे पासे पर पैसे",
      potCaption: "{n} खिलाड़ियों से {pool} का पॉट बनता है, भुगतान:",
      perDie: "हर हारे पासे पर {sym}",
      perDieTo: "किसे जाता है",
      toWinner: "जिसने चुनौती जीती",
      toPot: "पॉट में, विजेता के लिए",
      toWinnerHint: "हर हारे पासे का पैसा उस चुनौती के विजेता को जाता है। कोई भी ज़्यादा से ज़्यादा {most} हार सकता है।",
      toPotHint: "हर हारे पासे का पैसा पॉट में जाता है, और जिसके पास आखिर तक पासे बचें वह पूरा पॉट ले जाता है। कोई भी ज़्यादा से ज़्यादा {most} हार सकता है।",
      entryLegend: "राउंड दर्ज करना",
      entryFull: "पूरा",
      entryQuick: "जल्दी",
      entryFullHint: "बोली, चुनौती किसने दी और असल में कितने थे, दर्ज करें, और PitMaster बता देगा कि पासा कौन हारा।",
      entryQuickHint: "बस उस पर टैप करें जिसने पासा हारा। गेम स्क्रीन पर कभी भी बदल सकते हैं।",
      eachPlayer: "हर खिलाड़ी के शुरुआती पासे",
      howItPlays: "सब अपने कप के नीचे पासे फेंकते हैं और बोली लगाते हैं कि पूरी टेबल पर किसी अंक के कितने पासे हैं। किसी बोली को झूठ कहें तो कप उठते हैं: जो गलत था वह एक पासा हारता है। जिसके पास आखिर तक पासे बचें, वह जीतता है।",
    },
    lives: {
      eachPlayer: "हर खिलाड़ी शुरू करता है",
      livesEach: "हर किसी की जानें",
      stakesPerLife: "हर गई जान पर पैसे",
      perLife: "हर गई जान पर {sym}",
      toWinner: "जिसने राउंड जीता",
      toWinnerHint: "हर गई जान का पैसा उस राउंड के विजेता को जाता है। कोई भी ज़्यादा से ज़्यादा {most} हार सकता है।",
      toPotHint: "हर गई जान का पैसा पॉट में जाता है, और आखिर तक बचा खिलाड़ी पूरा पॉट ले जाता है। कोई भी ज़्यादा से ज़्यादा {most} हार सकता है।",
      rules: {
        scat: "सबको तीन पत्ते मिलते हैं, और सब पत्ते खींचकर एक ही सूट में 31 के सबसे करीब पहुंचने की कोशिश करते हैं। नॉक करके राउंड खत्म करें: बाकी सबको एक और चाल मिलती है, फिर सबसे कम हाथ वाले की एक जान जाती है, और अगर नॉक करने वाला सबसे कम निकले तो उसकी दो। 31 बनते ही जीत होती है, और बाकी सबकी एक-एक जान जाती है।",
        screw: "सबको एक पत्ता मिलता है, और हर कोई उसे अपने बाएं वाले खिलाड़ी से बदल सकता है या रख सकता है। बादशाह हो तो अदला-बदली नहीं होती। डीलर की बारी के बाद, सबसे छोटे पत्ते वाले की एक जान जाती है।",
        whist: "सबको सात पत्ते, फिर हर राउंड एक कम, और एक तुरुप का सूट। जो एक भी हाथ न बनाए, वह बाहर।",
        ship: "पांच पासे तीन बार तक फेंकें। आपको इसी क्रम में 6 (शिप), 5 (कैप्टन) और 4 (क्रू) चाहिए, और बाकी दो पासे आपका स्कोर हैं। सबसे कम स्कोर वाले की एक जान जाती है।",
        custom: "सब बराबर जानों से शुरू करते हैं। हर राउंड, जिसकी जितनी जानें गईं उतनी घटाएं। जिसके पास आखिर तक जान बचे, वह जीतता है।",
      },
    },
    pot: {
      potLegend: "पॉट",
      ante: "एंटी {sym}",
      limit: "पॉट लिमिट {sym}",
      limitHint: "एक बेट ज़्यादा से ज़्यादा कितना जीत या हार सकती है, और पॉट के बराबर भरने में ज़्यादा से ज़्यादा कितना लगता है। 0 का मतलब पूरा पॉट।",
      leftover: "आखिर में जो बचे",
      leftoverSplit: "बराबर बांटें",
      leftoverBack: "जिसने डाला उसे वापस",
      eachRound: "पहला पॉट",
      firstPot: "{players}, हर एक {ante}",
      rules: {
        inbetween: "दो पत्ते खुलते हैं, और आप पॉट तक की बेट लगाते हैं कि अगला पत्ता इनके बीच आएगा। जीतें तो अपनी बेट पॉट से लें; हारें तो उतना पॉट में डालें; किसी भी पत्ते से मेल खाए (पोस्ट) तो दोगुना भरें।",
        guts: "सब एंटी डालते हैं और पत्ते लेते हैं, फिर बताते हैं कि अंदर हैं या बाहर। अंदर वालों में सबसे अच्छा हाथ पॉट ले जाता है और बाकी पॉट के बराबर भरते हैं। अगर सिर्फ एक खिलाड़ी अंदर हो, तो वही पॉट ले जाता है।",
        bourre: "सबको पांच पत्ते, और एक सूट तुरुप होता है। सबसे ज़्यादा हाथ बनाएं और पॉट ले जाएं। एक भी हाथ न बने तो आप Bourré हो गए: पॉट के बराबर भरें।",
        pigs: "सब एंटी डालते हैं। सूअर फेंकें और वे जैसे गिरें उस हिसाब से अंक पाएं; पिग आउट हो तो पॉट में भरें। जो सबसे पहले 100 तक पहुंचे, वह पॉट ले जाता है।",
        custom: "एक पॉट जिसमें सब एंटी डालते हैं, पैसे डालते हैं और निकालते हैं, जैसे भी आपकी टेबल खेले।",
      },
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
      format: {
        legend: "फॉर्मेट",
        addable: "शूटआउट, ब्रैकेट या सैटेलाइट",
        remove: "हटाएं",
        shootout: "शूटआउट",
        shootoutHint: "हर टेबल एक विजेता तक खेलती है, फिर विजेता फाइनल टेबल पर मिलते हैं। सीटें निकाली जाती हैं और टेबल बैलेंस नहीं होतीं।",
        standard: "मानक",
        bracket: "हेड्स-अप ब्रैकेट",
        bracketHint: "खिलाड़ी आमने-सामने खेलते हैं, और हर मुकाबले का विजेता आगे बढ़ता है। सीड रैंडम तरीके से निकाले जाते हैं, खिलाड़ियों की संख्या पूरी न हो तो बाई से भरी जाती है, और पेआउट पहुंचे हुए राउंड के हिसाब से होते हैं।",
        satellite: "सैटेलाइट",
        satelliteHint: "इनाम दूसरे गेम की सीटें हैं। विजेता उस गेम के नया गेम पेज पर बाय-इन चुकाए हुए आते हैं।",
        seatValue: "सीट की कीमत ({sym})",
        seats: { one: "{count} सीट", other: "{count} सीटें" },
        seatsCaption: "{n} खिलाड़ियों पर पूल {pool} है: {seats}, हर एक {value} की।",
        restCaption: "{amount} अगली जगह को।",
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
      fewPlayersConfirm: "इस गेम के लिए कम से कम दो खिलाड़ी चाहिए। फिर भी शुरू करें और अगले पेज पर खिलाड़ी जोड़ें?",
      namesLabel: "नाम, एक लाइन में एक या कॉमा से अलग करें",
      namesPlaceholder: "अमन, रोहन, प्रिया",
      regulars: "नियमित खिलाड़ी:",
      satelliteWinners: "सैटेलाइट विजेता",
      seatsFrom: "{game} में जीती सीटें",
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
      game: "Juego",
      chipSet: "Set de fichas",
      league: "Liga",
      editLeagues: "Ligas",
      noLeague: "Ninguna",
      editSets: "Editar sets",
      yours: "Tuyo",
      chipValues: "Valor de las fichas",
      asPrinted: "Según lo impreso",
      printedTimes: "Impreso ×{n}",
      chipPlaysAs: "Una ficha de {chip} vale {value} en esta partida",
    },
    variants: {
      addable: "Otros Juegos de Póker",
      legend: "Juego",
      remove: "Solo Hold'em",
      game: "Juego",
      oneGame: "Un Solo Juego",
      dealersChoice: "Elección del Dealer",
      mixed: "Juegos Mixtos",
      yourMix: "Tu Propia Mezcla",
      choiceOrder: "Se reparten en este orden: {games}.",
      mixOrder: "Un juego nuevo en cada nivel, en este orden: {games}.",
      pickSome: "Elige los juegos que se van a jugar.",
      rotateEvery: "Minutos Hasta el Próximo Juego (0 = Cambias Tú)",
      studAnte: "Ante de Stud {sym}",
      bringIn: "Bring-In {sym}",
      limitNoteCash: "En los juegos limit se apuesta la ciega grande y el doble, así que con ciegas de 1/2 se juega 2/4.",
      limitNoteTourney: "Cada nivel juega su juego. En los juegos limit se apuesta la ciega grande y el doble, y los niveles de stud llevan ante y bring-in.",
    },
    dice: {
      fewPlayersConfirm: "El Perudo necesita al menos dos jugadores. ¿Empezar de todas formas y añadirlos en la página siguiente?",
      rulesLegend: "Reglas",
      dicePerPlayer: "Dados por Jugador",
      onesWild: "Los Unos Son Comodines",
      palifico: "Palifico",
      palificoHint: "Cuando a un jugador le queda un solo dado, en la ronda que empieza él los unos no son comodines y nadie puede cambiar el número apostado.",
      spotOn: "Calzo",
      spotOnOthers: "Calzo: Todos los Demás Pierden un Dado",
      spotOnGain: "Calzo: Quien lo Canta Recupera un Dado",
      spotOnOff: "Sin Calzo",
      stakesLegend: "Apuestas",
      stakesPot: "Un Buy-In, Pagado por Puesto",
      stakesPerDie: "Dinero por Dado Perdido",
      potCaption: "{n} jugadores forman un bote de {pool}, que se reparte así:",
      perDie: "Por Dado Perdido {sym}",
      perDieTo: "Va Para",
      toWinner: "Quien Ganó la Jugada",
      toPot: "El Bote, para el Ganador",
      toWinnerHint: "Cada dado perdido se le paga a quien ganó esa jugada. Lo máximo que puede perder alguien es {most}.",
      toPotHint: "Cada dado perdido va al bote, y se lo lleva el último que tenga dados. Lo máximo que puede perder alguien es {most}.",
      entryLegend: "Registro de Rondas",
      entryFull: "Completo",
      entryQuick: "Rápido",
      entryFullHint: "Anota la apuesta, quién la desafió y cuántos había, y PitMaster calcula quién pierde un dado.",
      entryQuickHint: "Solo toca quién perdió un dado. Puedes cambiarlo cuando quieras en la pantalla de la partida.",
      eachPlayer: "Cada Jugador Empieza Con",
      howItPlays: "Todos tiran los dados bajo un cubilete y apuestan cuántos dados de un número hay en toda la mesa. Si alguien dice \"dudo\", se levantan los cubiletes: quien se equivocó pierde un dado. El último que tenga dados gana.",
    },
    lives: {
      eachPlayer: "Cada Jugador Empieza Con",
      livesEach: "Vidas por Jugador",
      stakesPerLife: "Dinero por Vida Perdida",
      perLife: "Por Vida Perdida {sym}",
      toWinner: "Quien Ganó la Ronda",
      toWinnerHint: "Cada vida perdida se le paga a quien ganó esa ronda. Lo máximo que puede perder alguien es {most}.",
      toPotHint: "Cada vida perdida va al bote, y se lo lleva el último que quede en pie. Lo máximo que puede perder alguien es {most}.",
      rules: {
        scat: "Cada uno recibe tres cartas y roba para acercarse lo más posible a 31 en un solo palo. Toca la mesa para cerrar: los demás juegan un turno más, y luego la mano más baja pierde una vida; si quien tocó queda más bajo, pierde dos. Un 31 gana al instante y todos los demás pierden una.",
        screw: "Cada uno recibe una carta y puede cambiarla con el jugador de su izquierda o quedársela. Un rey bloquea el cambio. Tras el turno del repartidor, la carta más baja pierde una vida.",
        whist: "Siete cartas cada uno, luego una menos cada ronda, con un palo de triunfo. Quien no gane ninguna baza queda fuera.",
        ship: "Tira cinco dados hasta tres veces. Necesitas un 6 (el barco), un 5 (el capitán) y un 4 (la tripulación), en ese orden, y los otros dos dados son tu puntuación. La puntuación más baja pierde una vida.",
        custom: "Todos empiezan con las mismas vidas. En cada ronda, quita las que perdió cada uno. Gana el último al que le quede alguna.",
      },
    },
    pot: {
      potLegend: "Bote",
      ante: "Ante {sym}",
      limit: "Límite del Bote {sym}",
      limitHint: "Lo máximo que una apuesta puede ganar o costar, y lo máximo que cuesta igualar el bote. 0 significa todo el bote.",
      leftover: "Lo Que Quede al Final",
      leftoverSplit: "Repartir a Partes Iguales",
      leftoverBack: "Devolver a Quien lo Puso",
      eachRound: "El Primer Bote",
      firstPot: "{players}, {ante} cada uno",
      rules: {
        inbetween: "Se destapan dos cartas y apuestas, hasta el valor del bote, a que la siguiente cae entre ellas. Si ganas, te llevas tu apuesta del bote; si pierdes, la pagas al bote; si sale igual a una de las dos (el poste), pagas el doble.",
        guts: "Todos ponen el ante y reciben sus cartas, y luego dicen si entran o no. De los que entran, la mejor mano se lleva el bote y los demás lo igualan. Si solo entra un jugador, se lo lleva.",
        bourre: "Cinco cartas cada uno, y un palo es triunfo. Gana más bazas que nadie y llévate el bote. Si no ganas ninguna baza, te hacen bourré: igualas el bote.",
        pigs: "Todos ponen el ante. Tira los cerditos y puntúa según cómo caigan; si sale Pig Out, pagas al bote. El primero en llegar a 100 se lleva el bote.",
        custom: "Un bote al que todos ponen el ante, pagan y del que sacan, como se juegue en tu mesa.",
      },
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
      format: {
        legend: "Formato",
        addable: "Shootout, Cuadro o Satélite",
        remove: "Quitar",
        shootout: "Shootout",
        shootoutHint: "Cada mesa juega hasta un ganador y luego los ganadores se enfrentan en una mesa final. Se sortean los asientos y las mesas no se equilibran.",
        standard: "Estándar",
        bracket: "Cuadro Heads-Up",
        bracketHint: "Los jugadores se enfrentan uno contra uno y el ganador de cada duelo avanza. Las posiciones se sortean al azar, los byes cubren los huecos del cuadro y los premios dependen de la ronda alcanzada.",
        satellite: "Satélite",
        satelliteHint: "Los premios son plazas en otra partida. Los ganadores entran desde la Nueva Partida de esa partida con la entrada pagada.",
        seatValue: "Valor de la Plaza ({sym})",
        seats: { one: "{count} plaza", other: "{count} plazas" },
        seatsCaption: "Con {n} jugadores el bote es {pool}: {seats} de {value}.",
        restCaption: "{amount} va al siguiente puesto.",
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
      fewPlayersConfirm: "Este juego necesita al menos dos jugadores. ¿Empezar de todas formas y añadirlos en la página siguiente?",
      namesLabel: "Nombres, uno por línea o separados por comas",
      namesPlaceholder: "Álex, Sam, Jordan",
      regulars: "Habituales:",
      satelliteWinners: "Ganadores del Satélite",
      seatsFrom: "Plazas ganadas en {game}",
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
      game: "Jeu",
      chipSet: "Set de jetons",
      league: "Ligue",
      editLeagues: "Ligues",
      noLeague: "Aucune",
      editSets: "Modifier les sets",
      yours: "à vous",
      chipValues: "Valeur des jetons",
      asPrinted: "Valeur imprimée",
      printedTimes: "Valeur imprimée ×{n}",
      chipPlaysAs: "Un jeton de {chip} vaut {value} dans cette partie",
    },
    variants: {
      addable: "Autres Jeux de Poker",
      legend: "Jeu",
      remove: "Hold'em Seulement",
      game: "Jeu",
      oneGame: "Un Seul Jeu",
      dealersChoice: "Choix du Donneur",
      mixed: "Jeux Mixtes",
      yourMix: "Votre Propre Mélange",
      choiceOrder: "Distribués dans cet ordre : {games}.",
      mixOrder: "Un nouveau jeu à chaque niveau, dans cet ordre : {games}.",
      pickSome: "Choisissez les jeux à jouer.",
      rotateEvery: "Minutes Avant le Jeu Suivant (0 = Vous Changez)",
      studAnte: "Ante du Stud {sym}",
      bringIn: "Bring-In {sym}",
      limitNoteCash: "Les jeux limit misent la grosse blinde puis le double, donc des blindes de 1/2 se jouent en 2/4.",
      limitNoteTourney: "Chaque niveau se joue avec son jeu. Les jeux limit misent la grosse blinde puis le double, et les niveaux de stud ont une ante et un bring-in.",
    },
    dice: {
      fewPlayersConfirm: "Le Perudo se joue à deux joueurs minimum. Lancer quand même et les ajouter à la page suivante ?",
      rulesLegend: "Règles",
      dicePerPlayer: "Dés par Joueur",
      onesWild: "Les As Sont Jokers",
      palifico: "Palifico",
      palificoHint: "Quand un joueur n'a plus qu'un dé, la manche qu'il lance se joue sans as jokers, et personne ne peut changer la valeur annoncée.",
      spotOn: "Pile",
      spotOnOthers: "Pile : Tous les Autres Perdent un Dé",
      spotOnGain: "Pile : Celui Qui l'Annonce Récupère un Dé",
      spotOnOff: "Pas de Pile",
      stakesLegend: "Mises",
      stakesPot: "Un Buy-In, Payé selon le Classement",
      stakesPerDie: "De l'Argent par Dé Perdu",
      potCaption: "{n} joueurs forment un pot de {pool}, payé :",
      perDie: "Par Dé Perdu {sym}",
      perDieTo: "Va à",
      toWinner: "Celui Qui a Gagné le Défi",
      toPot: "Le Pot, pour le Gagnant",
      toWinnerHint: "Chaque dé perdu est payé à celui qui a gagné ce défi. On peut perdre au maximum {most}.",
      toPotHint: "Chaque dé perdu va dans le pot, et le dernier à avoir des dés le remporte. On peut perdre au maximum {most}.",
      entryLegend: "Saisie des Manches",
      entryFull: "Complète",
      entryQuick: "Rapide",
      entryFullHint: "Saisissez l'annonce, qui l'a contestée et combien il y en avait, et PitMaster calcule qui perd un dé.",
      entryQuickHint: "Touchez simplement qui a perdu un dé. Vous pouvez changer à tout moment sur l'écran de la partie.",
      eachPlayer: "Chaque Joueur Commence avec",
      howItPlays: "Chacun lance ses dés sous un gobelet et annonce combien de dés d'une valeur il y a sur toute la table. Si quelqu'un crie menteur, on lève les gobelets : celui qui s'est trompé perd un dé. Le dernier à avoir des dés gagne.",
    },
    lives: {
      eachPlayer: "Chaque Joueur Commence avec",
      livesEach: "Vies par Joueur",
      stakesPerLife: "De l'Argent par Vie Perdue",
      perLife: "Par Vie Perdue {sym}",
      toWinner: "Celui Qui a Gagné la Manche",
      toWinnerHint: "Chaque vie perdue est payée à celui qui a gagné cette manche. On peut perdre au maximum {most}.",
      toPotHint: "Chaque vie perdue va dans le pot, et le dernier encore en jeu le remporte. On peut perdre au maximum {most}.",
      rules: {
        scat: "Chacun reçoit trois cartes et pioche pour s'approcher le plus possible de 31 dans une seule couleur. Frappez pour finir : chacun joue encore un tour, puis la main la plus faible perd une vie, et celui qui a frappé en perd deux s'il est le plus bas. Un 31 gagne tout de suite, et tous les autres perdent une vie.",
        screw: "Chacun reçoit une carte et peut l'échanger avec le joueur à sa gauche, ou la garder. Un roi bloque l'échange. Après le tour du donneur, la carte la plus basse perd une vie.",
        whist: "Sept cartes chacun, puis une de moins à chaque manche, avec une couleur d'atout. Celui qui ne fait aucun pli est éliminé.",
        ship: "Lancez cinq dés jusqu'à trois fois. Il vous faut un 6 (le bateau), un 5 (le capitaine) et un 4 (l'équipage), dans cet ordre, et les deux autres dés font votre score. Le score le plus bas perd une vie.",
        custom: "Tout le monde commence avec le même nombre de vies. À chaque manche, retirez celles que chacun a perdues. Le dernier à qui il en reste gagne.",
      },
    },
    pot: {
      potLegend: "Pot",
      ante: "Ante {sym}",
      limit: "Limite du Pot {sym}",
      limitHint: "Le maximum qu'une mise peut gagner ou coûter, et le maximum à payer pour égaler le pot. 0 signifie tout le pot.",
      leftover: "Ce Qui Reste à la Fin",
      leftoverSplit: "Partagé à Parts Égales",
      leftoverBack: "Rendu à Ceux Qui l'Ont Mis",
      eachRound: "Le Premier Pot",
      firstPot: "{players}, {ante} chacun",
      rules: {
        inbetween: "Deux cartes sont retournées, et vous misez, jusqu'au montant du pot, que la suivante tombera entre les deux. Gagnez et prenez votre mise dans le pot ; perdez et payez-la au pot ; tombez sur l'une des deux cartes (le poteau) et payez le double.",
        guts: "Chacun paie l'ante et reçoit ses cartes, puis dit s'il reste ou s'il sort. Parmi ceux qui restent, la meilleure main prend le pot et les autres l'égalent. Si un seul joueur reste, il le prend.",
        bourre: "Cinq cartes chacun, et une couleur est atout. Faites le plus de plis et prenez le pot. Aucun pli et vous êtes bourré : égalez le pot.",
        pigs: "Chacun paie l'ante. Lancez les cochons et marquez selon leur chute ; un Pig Out et vous payez au pot. Le premier à 100 prend le pot.",
        custom: "Un pot où chacun met l'ante, paie et se sert, comme on le joue à votre table.",
      },
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
      format: {
        legend: "Format",
        addable: "Shootout, Tableau ou Satellite",
        remove: "Retirer",
        shootout: "Shootout",
        shootoutHint: "Chaque table joue jusqu'à un gagnant, puis les gagnants se retrouvent à une table finale. Les places sont tirées et les tables ne sont pas rééquilibrées.",
        standard: "Standard",
        bracket: "Tableau Heads-Up",
        bracketHint: "Les joueurs s'affrontent en tête-à-tête et le gagnant de chaque match passe au tour suivant. Les places sont tirées au hasard, des exemptions complètent un tableau incomplet et les gains dépendent du tour atteint.",
        satellite: "Satellite",
        satelliteHint: "Les gains sont des places dans une autre partie. Les gagnants arrivent depuis la Nouvelle Partie de celle-ci, buy-in payé.",
        seatValue: "Valeur de la Place ({sym})",
        seats: { one: "{count} place", other: "{count} places" },
        seatsCaption: "Avec {n} joueurs la cagnotte est de {pool} : {seats} de {value}.",
        restCaption: "{amount} va à la place suivante.",
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
      fewPlayersConfirm: "Ce jeu se joue à deux joueurs minimum. Lancer quand même et les ajouter à la page suivante ?",
      namesLabel: "Noms, un par ligne ou séparés par des virgules",
      namesPlaceholder: "Alex, Sam, Jordan",
      regulars: "Habitués :",
      satelliteWinners: "Gagnants du Satellite",
      seatsFrom: "Places gagnées dans {game}",
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
      game: "اللعبة",
      chipSet: "طقم الرقائق",
      league: "الدوري",
      editLeagues: "الدوريات",
      noLeague: "بدون",
      editSets: "تعديل الأطقم",
      yours: "طقمك",
      chipValues: "قيم الرقائق",
      asPrinted: "كما هي مطبوعة",
      printedTimes: "القيمة المطبوعة ×{n}",
      chipPlaysAs: "الرقاقة {chip} تُحتسب بقيمة {value} في هذه اللعبة",
    },
    variants: {
      addable: "ألعاب بوكر أخرى",
      legend: "اللعبة",
      remove: "هولدم فقط",
      game: "اللعبة",
      oneGame: "لعبة واحدة",
      dealersChoice: "اختيار الموزّع",
      mixed: "ألعاب مختلطة",
      yourMix: "مزيجك الخاص",
      choiceOrder: "تُوزَّع بهذا الترتيب: {games}.",
      mixOrder: "لعبة جديدة في كل مستوى، بهذا الترتيب: {games}.",
      pickSome: "اختر الألعاب التي ستُلعب.",
      rotateEvery: "كل كم دقيقة تأتي اللعبة التالية (0 = تبدّلها بنفسك)",
      studAnte: "أنتي الستاد {sym}",
      bringIn: "برينغ إن {sym}",
      limitNoteCash: "في ألعاب الحد الثابت يكون الرهان بقدر البيغ بلايند ثم ضعفه، فالرهانات العمياء 1/2 تُلعب 2/4.",
      limitNoteTourney: "كل مستوى يُلعب بلعبته. في ألعاب الحد الثابت يكون الرهان بقدر البيغ بلايند ثم ضعفه، ومستويات الستاد لها أنتي وبرينغ إن.",
    },
    dice: {
      fewPlayersConfirm: "تحتاج لعبة نرد الكذاب إلى لاعبَين على الأقل. هل تبدأها على أي حال وتضيفهم في الصفحة التالية؟",
      rulesLegend: "القواعد",
      dicePerPlayer: "أحجار النرد لكل لاعب",
      onesWild: "الواحد جوكر",
      palifico: "باليفيكو",
      palificoHint: "عندما يبقى مع لاعب آخر حجر نرد، تكون الجولة التي يبدؤها بلا جوكر للواحد، ولا يمكن لأحد تغيير الرقم المُزايَد عليه.",
      spotOn: "بالضبط",
      spotOnOthers: "بالضبط: يخسر كل الباقين حجرًا",
      spotOnGain: "بالضبط: يستعيد صاحب التحدي حجرًا",
      spotOnOff: "بلا قاعدة بالضبط",
      stakesLegend: "الرهانات",
      stakesPot: "قيمة دخول، تُوزَّع حسب المركز",
      stakesPerDie: "مبلغ عن كل حجر يُخسَر",
      potCaption: "عدد اللاعبين {n}، والبوت {pool}، ويُوزَّع كالتالي:",
      perDie: "عن كل حجر يُخسَر {sym}",
      perDieTo: "يذهب إلى",
      toWinner: "الفائز بالتحدي",
      toPot: "البوت، للفائز",
      toWinnerHint: "كل حجر يُخسَر يُدفع ثمنه للفائز بذلك التحدي. أقصى ما يمكن أن يخسره أي لاعب هو {most}.",
      toPotHint: "كل حجر يُخسَر يذهب ثمنه إلى البوت، ويأخذه آخر من يبقى معه نرد. أقصى ما يمكن أن يخسره أي لاعب هو {most}.",
      entryLegend: "تسجيل الجولات",
      entryFull: "كامل",
      entryQuick: "سريع",
      entryFullHint: "أدخل المزايدة ومن تحدّاها وكم كان العدد فعلًا، وسيحسب PitMaster من يخسر حجرًا.",
      entryQuickHint: "فقط اضغط على من خسر حجرًا. يمكنك التبديل في أي وقت من شاشة اللعبة.",
      eachPlayer: "يبدأ كل لاعب بـ",
      howItPlays: "يرمي الجميع النرد تحت كوب ويزايدون على عدد الأحجار التي تُظهر رقمًا معينًا على الطاولة كلها. إذا كذّب أحد مزايدة تُرفع الأكواب: من كان مخطئًا يخسر حجرًا. آخر من يبقى معه نرد يفوز.",
    },
    lives: {
      eachPlayer: "يبدأ كل لاعب بـ",
      livesEach: "الأرواح لكل لاعب",
      stakesPerLife: "مبلغ عن كل روح تُخسَر",
      perLife: "عن كل روح تُخسَر {sym}",
      toWinner: "الفائز بالجولة",
      toWinnerHint: "كل روح تُخسَر يُدفع ثمنها للفائز بتلك الجولة. أقصى ما يمكن أن يخسره أي لاعب هو {most}.",
      toPotHint: "كل روح تُخسَر يذهب ثمنها إلى البوت، ويأخذه آخر من يبقى في اللعبة. أقصى ما يمكن أن يخسره أي لاعب هو {most}.",
      rules: {
        scat: "يحصل كل لاعب على ثلاث أوراق ويسحب ليقترب قدر الإمكان من 31 في نوع واحد. اطرق الطاولة لإنهاء الجولة: يلعب الجميع دورًا أخيرًا، ثم تخسر أضعف يد روحًا، وإن كان من طرق هو الأضعف يخسر روحين. من يجمع 31 يفوز فورًا، ويخسر كل الباقين روحًا.",
        screw: "يحصل كل لاعب على ورقة واحدة، ويمكنه تبديلها مع اللاعب الذي على يساره أو الاحتفاظ بها. الملك يمنع التبديل. بعد دور الموزّع، تخسر أصغر ورقة روحًا.",
        whist: "سبع أوراق لكل لاعب، ثم ورقة أقل في كل جولة، مع نوع طرنيب. من لا يأخذ أي لمّة يخرج.",
        ship: "ارمِ خمسة أحجار نرد حتى ثلاث مرات. تحتاج إلى 6 (السفينة) و5 (القبطان) و4 (الطاقم) بهذا الترتيب، والحجران الباقيان هما نتيجتك. أقل نتيجة تخسر روحًا.",
        custom: "يبدأ الجميع بعدد الأرواح نفسه. في كل جولة، اطرح ما خسره كل لاعب. آخر من يبقى معه روح يفوز.",
      },
    },
    pot: {
      potLegend: "البوت",
      ante: "الأنتي {sym}",
      limit: "حد البوت {sym}",
      limitHint: "أقصى ما يمكن أن يربحه أو يكلّفه رهان واحد، وأقصى ما يكلّفه دفع مثل البوت. 0 يعني البوت كله.",
      leftover: "ما يتبقى في النهاية",
      leftoverSplit: "يُقسَّم بالتساوي",
      leftoverBack: "يعود لمن دفعه",
      eachRound: "البوت الأول",
      firstPot: "{players}، و{ante} لكل لاعب",
      rules: {
        inbetween: "تُكشف ورقتان، وتراهن بما لا يزيد على البوت أن الورقة التالية ستقع بينهما. إن فزت تأخذ رهانك من البوت، وإن خسرت تدفعه فيه، وإن طابقت إحدى الورقتين (العمود) تدفع الضعف.",
        guts: "يدفع الجميع الأنتي ويأخذون أوراقهم، ثم يقول كل لاعب إنه داخل أو خارج. من بين الداخلين، تأخذ أفضل يد البوت ويدفع الباقون مثله. إذا دخل لاعب واحد فقط، يأخذ البوت.",
        bourre: "خمس أوراق لكل لاعب، ونوع واحد هو الطرنيب. خذ أكثر اللمّات لتأخذ البوت. إن لم تأخذ أي لمّة صرت Bourré: ادفع مثل البوت.",
        pigs: "يدفع الجميع الأنتي. ارمِ الخنازير واحسب النقاط حسب طريقة وقوعها، وإن جاءت بيغ آوت تدفع في البوت. أول من يصل إلى 100 يأخذ البوت.",
        custom: "بوت يدفع فيه الجميع الأنتي، ويدفعون فيه ويأخذون منه، بالطريقة التي تلعبون بها.",
      },
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
      format: {
        legend: "النظام",
        addable: "مواجهة الطاولات أو جدول المواجهات أو تأهيلية",
        remove: "إزالة",
        shootout: "مواجهة الطاولات",
        shootoutHint: "تلعب كل طاولة حتى يبقى فائز واحد، ثم يلتقي الفائزون على طاولة نهائية. تُسحب المقاعد ولا تُوازَن الطاولات.",
        standard: "عادي",
        bracket: "مواجهات فردية",
        bracketHint: "يتواجه اللاعبون واحدًا لواحد، ويتأهل الفائز في كل مباراة. تُسحب المراكز عشوائيًا، وتُكمل الإعفاءات العدد الناقص، وتُوزع الجوائز حسب الدور الذي يصل إليه اللاعب.",
        satellite: "بطولة تأهيلية",
        satelliteHint: "الجوائز مقاعد في لعبة أخرى. يدخل الفائزون من صفحة اللعبة الجديدة لتلك اللعبة ورسوم دخولهم مدفوعة.",
        seatValue: "قيمة المقعد ({sym})",
        seats: { one: "{count} مقعد", other: "{count} مقاعد" },
        seatsCaption: "مع {n} لاعبين يكون المجموع {pool}: {seats} بقيمة {value}.",
        restCaption: "يذهب {amount} للمركز التالي.",
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
      fewPlayersConfirm: "تحتاج هذه اللعبة إلى لاعبَين على الأقل. هل تبدأها على أي حال وتضيفهم في الصفحة التالية؟",
      namesLabel: "الأسماء، اسم في كل سطر أو مفصولة بفواصل",
      namesPlaceholder: "علي, سام, جودي",
      regulars: "اللاعبون المعتادون:",
      satelliteWinners: "الفائزون في التأهيلية",
      seatsFrom: "مقاعد فازوا بها في {game}",
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
      game: "গেম",
      chipSet: "চিপ সেট",
      league: "লিগ",
      editLeagues: "লিগ",
      noLeague: "নেই",
      editSets: "সেট সম্পাদনা করুন",
      yours: "আপনার",
      chipValues: "চিপের মূল্য",
      asPrinted: "মুদ্রিত মূল্য অনুযায়ী",
      printedTimes: "মুদ্রিত মূল্য ×{n}",
      chipPlaysAs: "একটি {chip} চিপ এই খেলায় {value} হিসেবে গণ্য হবে",
    },
    variants: {
      addable: "অন্যান্য পোকার গেম",
      legend: "গেম",
      remove: "শুধু হোল্ডেম",
      game: "গেম",
      oneGame: "একটি গেম",
      dealersChoice: "ডিলার্স চয়েস",
      mixed: "মিক্সড গেম",
      yourMix: "নিজের মিক্স",
      choiceOrder: "এই ক্রমে ডিল হবে: {games}।",
      mixOrder: "প্রতি লেভেলে নতুন গেম, এই ক্রমে: {games}।",
      pickSome: "কোন গেমগুলো খেলবেন বেছে নিন।",
      rotateEvery: "কত মিনিট পরপর পরবর্তী গেম (0 = আপনি বদলাবেন)",
      studAnte: "স্টাড অ্যান্টি {sym}",
      bringIn: "ব্রিং-ইন {sym}",
      limitNoteCash: "লিমিট গেমে বেট হয় বিগ ব্লাইন্ড আর তার দ্বিগুণ, তাই 1/2 ব্লাইন্ডে খেলা হয় 2/4।",
      limitNoteTourney: "প্রতিটি লেভেলে তার নিজের গেম খেলা হয়। লিমিট গেমে বেট হয় বিগ ব্লাইন্ড আর তার দ্বিগুণ, আর স্টাড লেভেলে থাকে অ্যান্টি ও ব্রিং-ইন।",
    },
    dice: {
      fewPlayersConfirm: "লায়ার্স ডাইসে কমপক্ষে দুজন খেলোয়াড় লাগে। তবুও শুরু করে পরের পেজে তাদের যোগ করবেন?",
      rulesLegend: "নিয়ম",
      dicePerPlayer: "প্রতি খেলোয়াড়ের পাশা",
      onesWild: "এক হলো ওয়াইল্ড",
      palifico: "পালিফিকো",
      palificoHint: "কোনো খেলোয়াড়ের শেষ একটি পাশা বাকি থাকলে, তার শুরু করা রাউন্ডে এক ওয়াইল্ড থাকে না, আর কেউ ডাকা সংখ্যাটি বদলাতে পারে না।",
      spotOn: "একদম ঠিক",
      spotOnOthers: "একদম ঠিক: বাকি সবাই একটি পাশা হারায়",
      spotOnGain: "একদম ঠিক: যে বলেছে সে একটি পাশা ফেরত পায়",
      spotOnOff: "একদম ঠিক নেই",
      stakesLegend: "বাজি",
      stakesPot: "বাই-ইন, স্থান অনুযায়ী পুরস্কার",
      stakesPerDie: "প্রতি হারানো পাশায় টাকা",
      potCaption: "{n} জন খেলোয়াড়ে {pool}-এর পট হয়, বণ্টন:",
      perDie: "প্রতি হারানো পাশা {sym}",
      perDieTo: "কার কাছে যাবে",
      toWinner: "যে চ্যালেঞ্জ জিতেছে",
      toPot: "পটে, বিজয়ীর জন্য",
      toWinnerHint: "প্রতিটি হারানো পাশার টাকা পায় সেই চ্যালেঞ্জের বিজয়ী। কেউ সর্বোচ্চ {most} হারাতে পারে।",
      toPotHint: "প্রতিটি হারানো পাশার টাকা পটে যায়, আর যার কাছে শেষ পর্যন্ত পাশা থাকে সে পুরোটা নেয়। কেউ সর্বোচ্চ {most} হারাতে পারে।",
      entryLegend: "রাউন্ড লেখা",
      entryFull: "পূর্ণ",
      entryQuick: "দ্রুত",
      entryFullHint: "ডাক, কে চ্যালেঞ্জ করেছে আর আসলে কয়টি ছিল লিখুন, PitMaster হিসাব করে দেবে কে একটি পাশা হারাল।",
      entryQuickHint: "শুধু যে পাশা হারিয়েছে তাকে ট্যাপ করুন। গেম স্ক্রিনে যেকোনো সময় বদলাতে পারবেন।",
      eachPlayer: "প্রত্যেক খেলোয়াড়ের শুরুর পাশা",
      howItPlays: "সবাই একটি কাপের নিচে পাশা চালে আর ডাক দেয় পুরো টেবিলে কোনো একটি সংখ্যা কয়টি আছে। কেউ কোনো ডাককে মিথ্যা বললে কাপ তোলা হয়: যে ভুল, সে একটি পাশা হারায়। যার কাছে শেষ পর্যন্ত পাশা থাকে, সে জেতে।",
    },
    lives: {
      eachPlayer: "প্রত্যেক খেলোয়াড় শুরু করে",
      livesEach: "প্রত্যেকের লাইফ",
      stakesPerLife: "প্রতি হারানো লাইফে টাকা",
      perLife: "প্রতি হারানো লাইফ {sym}",
      toWinner: "যে রাউন্ড জিতেছে",
      toWinnerHint: "প্রতিটি হারানো লাইফের টাকা পায় সেই রাউন্ডের বিজয়ী। কেউ সর্বোচ্চ {most} হারাতে পারে।",
      toPotHint: "প্রতিটি হারানো লাইফের টাকা পটে যায়, আর শেষ পর্যন্ত যে টিকে থাকে সে পুরোটা নেয়। কেউ সর্বোচ্চ {most} হারাতে পারে।",
      rules: {
        scat: "সবাই তিনটি তাস পায় আর তাস টেনে এক রঙে 31-এর যত কাছে সম্ভব যেতে চায়। নক করে শেষ করুন: বাকি সবাই আর একটি চাল পায়, তারপর সবচেয়ে কম হাত একটি লাইফ হারায়, আর নক করা খেলোয়াড় সবচেয়ে কম হলে হারায় দুটি। 31 হলে সঙ্গে সঙ্গে জয়, আর বাকি সবাই একটি করে লাইফ হারায়।",
        screw: "সবাই একটি তাস পায়, আর বাঁ পাশের খেলোয়াড়ের সঙ্গে বদলাতে পারে বা রেখে দিতে পারে। সাহেব থাকলে বদল হয় না। ডিলারের পালার পর, সবচেয়ে ছোট তাস একটি লাইফ হারায়।",
        whist: "প্রত্যেকে সাতটি তাস, তারপর প্রতি রাউন্ডে একটি করে কম, আর একটি তুরুপের রং। যে একটিও পিঠ পায় না, সে আউট।",
        ship: "পাঁচটি পাশা তিনবার পর্যন্ত চালুন। আপনার চাই এই ক্রমে একটি 6 (শিপ), একটি 5 (ক্যাপ্টেন) আর একটি 4 (ক্রু), আর বাকি দুটি পাশা আপনার স্কোর। সবচেয়ে কম স্কোর একটি লাইফ হারায়।",
        custom: "সবাই সমান লাইফ নিয়ে শুরু করে। প্রতি রাউন্ডে, যে যতগুলো হারাল তা কেটে দিন। শেষ পর্যন্ত যার লাইফ বাকি থাকে, সে জেতে।",
      },
    },
    pot: {
      potLegend: "পট",
      ante: "অ্যান্টি {sym}",
      limit: "পট লিমিট {sym}",
      limitHint: "একটি বেট সর্বোচ্চ কত জিততে বা হারাতে পারে, আর পটের সমান দিতে সর্বোচ্চ কত লাগে। 0 মানে পুরো পট।",
      leftover: "শেষে যা বাকি থাকে",
      leftoverSplit: "সমান ভাগ",
      leftoverBack: "যে দিয়েছে তাকে ফেরত",
      eachRound: "প্রথম পট",
      firstPot: "{players}, প্রত্যেকে {ante}",
      rules: {
        inbetween: "দুটি তাস খোলা হয়, আর আপনি পট পর্যন্ত বেট ধরেন যে পরের তাসটি এ দুটির মাঝে পড়বে। জিতলে বেটের টাকা পট থেকে নিন; হারলে পটে দিন; কোনো একটির সঙ্গে মিললে (পোস্ট) দ্বিগুণ দিন।",
        guts: "সবাই অ্যান্টি দেয় আর তাস পায়, তারপর বলে ইন নাকি আউট। যারা ইন, তাদের মধ্যে সেরা হাত পট নেয় আর বাকিরা পটের সমান দেয়। শুধু একজন ইন থাকলে সে-ই পট নেয়।",
        bourre: "প্রত্যেকে পাঁচটি তাস, আর একটি রং তুরুপ। সবচেয়ে বেশি পিঠ নিন আর পট জিতুন। একটিও পিঠ না পেলে আপনি Bourré: পটের সমান দিন।",
        pigs: "সবাই অ্যান্টি দেয়। শূকরগুলো চালুন আর সেগুলো কীভাবে পড়ে সেই অনুযায়ী পয়েন্ট পান; পিগ আউট হলে পটে দিন। যে প্রথম 100-তে পৌঁছায়, সে পট নেয়।",
        custom: "একটি পট যাতে সবাই অ্যান্টি দেয়, টাকা দেয় আর তা থেকে নেয়, আপনার টেবিল যেভাবে খেলে।",
      },
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
      format: {
        legend: "ফরম্যাট",
        addable: "শুটআউট, ব্র্যাকেট বা স্যাটেলাইট",
        remove: "সরান",
        shootout: "শুটআউট",
        shootoutHint: "প্রতিটি টেবিল একজন বিজয়ী পর্যন্ত খেলে, তারপর বিজয়ীরা ফাইনাল টেবিলে মেলেন। সিট টানা হয় আর টেবিল ব্যালান্স হয় না।",
        standard: "সাধারণ",
        bracket: "হেডস-আপ ব্র্যাকেট",
        bracketHint: "খেলোয়াড়রা একে অপরের মুখোমুখি খেলেন, আর প্রতিটি ম্যাচের বিজয়ী এগিয়ে যান। সিড এলোমেলোভাবে টানা হয়, খেলোয়াড় কম পড়লে বাই দিয়ে পূরণ হয়, আর পুরস্কার দেওয়া হয় কোন রাউন্ড পর্যন্ত পৌঁছেছেন সেই অনুযায়ী।",
        satellite: "স্যাটেলাইট",
        satelliteHint: "পুরস্কার অন্য গেমের সিট। বিজয়ীরা সেই গেমের নতুন গেম পেজে বাই-ইন দেওয়া অবস্থায় আসেন।",
        seatValue: "সিটের দাম ({sym})",
        seats: { one: "{count}টি সিট", other: "{count}টি সিট" },
        seatsCaption: "{n} জন খেলোয়াড়ে পুল {pool}: {seats}, প্রতিটি {value}।",
        restCaption: "{amount} পরের স্থানে যায়।",
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
      fewPlayersConfirm: "এই গেমে কমপক্ষে দুজন খেলোয়াড় লাগে। তবুও শুরু করে পরের পেজে তাদের যোগ করবেন?",
      namesLabel: "নাম, প্রতি লাইনে একটি অথবা কমা দিয়ে আলাদা",
      namesPlaceholder: "অমিত, রাহুল, প্রিয়া",
      regulars: "নিয়মিত খেলোয়াড়:",
      satelliteWinners: "স্যাটেলাইট বিজয়ী",
      seatsFrom: "{game}-এ জেতা সিট",
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
      game: "Jogo",
      chipSet: "Conjunto de fichas",
      league: "Liga",
      editLeagues: "Ligas",
      noLeague: "Nenhuma",
      editSets: "Editar conjuntos",
      yours: "Seu",
      chipValues: "Valor das fichas",
      asPrinted: "Conforme impresso",
      printedTimes: "Valor impresso ×{n}",
      chipPlaysAs: "Uma ficha de {chip} vale {value} nesta partida",
    },
    variants: {
      addable: "Outros Jogos de Pôquer",
      legend: "Jogo",
      remove: "Só Hold'em",
      game: "Jogo",
      oneGame: "Um Só Jogo",
      dealersChoice: "Escolha do Dealer",
      mixed: "Jogos Mistos",
      yourMix: "Sua Própria Mistura",
      choiceOrder: "Distribuídos nesta ordem: {games}.",
      mixOrder: "Um jogo novo a cada nível, nesta ordem: {games}.",
      pickSome: "Escolha os jogos que vão rolar.",
      rotateEvery: "Minutos Até o Próximo Jogo (0 = Você Troca)",
      studAnte: "Ante do Stud {sym}",
      bringIn: "Bring-In {sym}",
      limitNoteCash: "Nos jogos limit a aposta é o big blind e o dobro dele, então blinds de 1/2 jogam 2/4.",
      limitNoteTourney: "Cada nível tem o seu jogo. Nos jogos limit a aposta é o big blind e o dobro dele, e os níveis de stud têm ante e bring-in.",
    },
    dice: {
      fewPlayersConfirm: "O Dado Mentiroso precisa de pelo menos dois jogadores. Começar mesmo assim e adicioná-los na próxima página?",
      rulesLegend: "Regras",
      dicePerPlayer: "Dados por Jogador",
      onesWild: "Os Uns São Coringas",
      palifico: "Palifico",
      palificoHint: "Quando um jogador fica com o último dado, na rodada que ele começa os uns não são coringas, e ninguém pode mudar o número apostado.",
      spotOn: "Na Mosca",
      spotOnOthers: "Na Mosca: Todos os Outros Perdem um Dado",
      spotOnGain: "Na Mosca: Quem Chamou Recupera um Dado",
      spotOnOff: "Sem Na Mosca",
      stakesLegend: "Apostas",
      stakesPot: "Um Buy-In, Pago por Colocação",
      stakesPerDie: "Dinheiro por Dado Perdido",
      potCaption: "{n} jogadores formam um pote de {pool}, pago assim:",
      perDie: "Por Dado Perdido {sym}",
      perDieTo: "Vai Para",
      toWinner: "Quem Ganhou o Desafio",
      toPot: "O Pote, para o Vencedor",
      toWinnerHint: "Cada dado perdido paga quem ganhou aquele desafio. O máximo que alguém pode perder é {most}.",
      toPotHint: "Cada dado perdido vai para o pote, e o último com dados leva tudo. O máximo que alguém pode perder é {most}.",
      entryLegend: "Registro das Rodadas",
      entryFull: "Completo",
      entryQuick: "Rápido",
      entryFullHint: "Informe a aposta, quem desafiou e quantos havia, e o PitMaster calcula quem perde um dado.",
      entryQuickHint: "Só toque em quem perdeu um dado. Dá para trocar a qualquer momento na tela do jogo.",
      eachPlayer: "Cada Jogador Começa Com",
      howItPlays: "Todos rolam os dados sob um copo e apostam quantos dados de um número há na mesa inteira. Se alguém chamar uma aposta de mentira, os copos são levantados: quem errou perde um dado. O último com dados vence.",
    },
    lives: {
      eachPlayer: "Cada Jogador Começa Com",
      livesEach: "Vidas por Jogador",
      stakesPerLife: "Dinheiro por Vida Perdida",
      perLife: "Por Vida Perdida {sym}",
      toWinner: "Quem Ganhou a Rodada",
      toWinnerHint: "Cada vida perdida paga quem ganhou aquela rodada. O máximo que alguém pode perder é {most}.",
      toPotHint: "Cada vida perdida vai para o pote, e o último que sobrar leva tudo. O máximo que alguém pode perder é {most}.",
      rules: {
        scat: "Cada um recebe três cartas e compra para chegar o mais perto de 31 em um só naipe. Bata para encerrar: todos jogam mais uma vez, e então a mão mais baixa perde uma vida; se quem bateu ficar com a mais baixa, perde duas. Um 31 vence na hora, e todos os outros perdem uma.",
        screw: "Cada um recebe uma carta e pode trocá-la com o jogador à esquerda, ou ficar com ela. Um rei bloqueia a troca. Depois da vez de quem deu as cartas, a carta mais baixa perde uma vida.",
        whist: "Sete cartas para cada um, depois uma a menos a cada rodada, com um naipe de trunfo. Quem não fizer nenhuma vaza está fora.",
        ship: "Role cinco dados até três vezes. Você precisa de um 6 (o navio), um 5 (o capitão) e um 4 (a tripulação), nessa ordem, e os outros dois dados são sua pontuação. A pontuação mais baixa perde uma vida.",
        custom: "Todos começam com as mesmas vidas. A cada rodada, tire as que cada um perdeu. O último que ainda tiver alguma vence.",
      },
    },
    pot: {
      potLegend: "Pote",
      ante: "Ante {sym}",
      limit: "Limite do Pote {sym}",
      limitHint: "O máximo que uma aposta pode ganhar ou custar, e o máximo que custa igualar o pote. 0 significa o pote inteiro.",
      leftover: "O Que Sobrar no Final",
      leftoverSplit: "Dividir Igualmente",
      leftoverBack: "Devolver a Quem Colocou",
      eachRound: "O Primeiro Pote",
      firstPot: "{players}, {ante} cada",
      rules: {
        inbetween: "Duas cartas são viradas, e você aposta, até o valor do pote, que a próxima cai entre elas. Ganhou, pega sua aposta do pote; perdeu, paga no pote; bateu em uma das duas (a trave), paga o dobro.",
        guts: "Todos pagam o ante e recebem as cartas, e então dizem se estão dentro ou fora. Entre os que estão dentro, a melhor mão leva o pote e os outros o igualam. Se só um jogador estiver dentro, ele leva.",
        bourre: "Cinco cartas para cada um, e um naipe é trunfo. Faça mais vazas e leve o pote. Não fez nenhuma vaza, levou bourré: iguale o pote.",
        pigs: "Todos pagam o ante. Role os porquinhos e pontue pelo jeito que caem; deu Pig Out, paga no pote. O primeiro a chegar a 100 leva o pote.",
        custom: "Um pote em que todos pagam o ante, colocam e tiram, do jeito que sua mesa joga.",
      },
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
      format: {
        legend: "Formato",
        addable: "Shootout, Chave ou Satélite",
        remove: "Remover",
        shootout: "Shootout",
        shootoutHint: "Cada mesa joga até um vencedor, depois os vencedores se enfrentam numa mesa final. Os lugares são sorteados e as mesas não são equilibradas.",
        standard: "Padrão",
        bracket: "Chave Heads-Up",
        bracketHint: "Os jogadores se enfrentam um contra um, e o vencedor de cada confronto avança. As posições são sorteadas, os byes completam uma chave incompleta e os prêmios dependem da rodada alcançada.",
        satellite: "Satélite",
        satelliteHint: "Os prêmios são vagas em outro jogo. Os vencedores entram pelo Novo Jogo daquele jogo com a entrada paga.",
        seatValue: "Valor da Vaga ({sym})",
        seats: { one: "{count} vaga", other: "{count} vagas" },
        seatsCaption: "Com {n} jogadores o prêmio é {pool}: {seats} de {value}.",
        restCaption: "{amount} vai para o próximo lugar.",
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
      fewPlayersConfirm: "Este jogo precisa de pelo menos dois jogadores. Começar mesmo assim e adicioná-los na próxima página?",
      namesLabel: "Nomes, um por linha ou separados por vírgulas",
      namesPlaceholder: "Alex, Sam, Jordan",
      regulars: "Frequentes:",
      satelliteWinners: "Vencedores do Satélite",
      seatsFrom: "Vagas ganhas em {game}",
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

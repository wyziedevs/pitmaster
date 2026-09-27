// the Players page (leaderboard, per-player history, pay handles) and the
// plain-text recap / CSV export built in report.ts. nest under `page` for the
// route itself and `report` for the pasted recap and spreadsheet headers.
import type { Lang } from "./langs";

/** a value picked by Intl.PluralRules; `{n}` inside the chosen string is the count. */
export interface PluralText {
  one: string;
  other: string;
  zero?: string;
  two?: string;
  few?: string;
  many?: string;
}

export interface PlayersDict {
  page: {
    title: string;
    subtitle: string;
    spreadsheetButton: string;
    filter: {
      periodLabel: string;
      typeLabel: string;
      allGames: string;
      cash: string;
      tournaments: string;
    };
    stats: {
      summary: string;
      games: PluralText;
      players: PluralText;
    };
    table: {
      player: string;
      games: string;
      net: string;
      cash: string;
      perHour: string;
      tournaments: string;
      wins: string;
      itm: string;
      kos: string;
      best: string;
      last: string;
    };
    history: {
      typeCash: string;
      typeTournament: string;
      place: string;
      kos: PluralText;
      cashInOut: string;
      hoursSuffix: string;
      worst: string;
      cashHours: string;
      cashedTournaments: string;
      tournamentsCount: PluralText;
      highHand: string;
      sevenTwo: PluralText;
    };
    payHandles: {
      label: string;
      ariaLabel: string;
    };
    owed: {
      heading: string;
      note: string;
      line: string;
      markPaid: string;
    };
    toast: {
      csvDownloaded: string;
      handleSaved: string;
      handleCleared: string;
      markedPaid: string;
    };
    empty: {
      default: string;
      filtered: string;
      backLink: string;
    };
    csv: {
      player: string;
      games: string;
      net: string;
      cashNet: string;
      tourneyNet: string;
      tournaments: string;
      wins: string;
      itm: string;
      knockouts: string;
      best: string;
      worst: string;
      cashHours: string;
      perHour: string;
      last: string;
    };
  };
  leagues: {
    tabBoard: string;
    tabLeagues: string;
    viewLabel: string;
    pickAria: string;
    new: string;
    edit: string;
    defaultName: string;
    dates: string;
    from: string;
    gamesCount: PluralText;
    strays: PluralText;
    addThem: string;
    byGame: string;
    byGameNote: string;
    byGameNoteBest: string;
    gameCol: string;
    noGames: string;
    none: string;
    table: {
      points: string;
      played: string;
    };
    scoring: {
      table: string;
      beaten: string;
      root: string;
      play: string;
      ko: string;
      bestOf: string;
    };
    form: {
      name: string;
      start: string;
      end: string;
      counts: string;
      points: string;
      kindTable: string;
      kindBeaten: string;
      kindRoot: string;
      table: string;
      hint: {
        table: string;
        beaten: string;
        root: string;
      };
      sample: string;
      play: string;
      ko: string;
      bestOf: string;
      cashNote: string;
      bestOfNote: string;
      create: string;
      delete: string;
      confirmDelete: string;
      needNameStart: string;
      needType: string;
      endBeforeStart: string;
      needTable: string;
    };
    toast: {
      created: string;
      saved: string;
      deleted: string;
      linked: PluralText;
    };
    csv: {
      place: string;
      player: string;
      points: string;
      played: string;
      wins: string;
      knockouts: string;
      net: string;
    };
  };
  report: {
    cash: {
      summary: string;
      stillPlaying: string;
      rakeBox: string;
      seatFee: string;
      settleUp: string;
      bombPots: PluralText;
      sevenTwo: string;
      highHand: string;
      settleLine: string;
      bankOff: string;
      costs: string;
      paidTag: string;
    };
    tourney: {
      entrants: PluralText;
      buyIn: string;
      rebuys: PluralText;
      addOns: PluralText;
      pool: string;
      rakeKept: string;
      endedAt: string;
      stillIn: string;
      seat: string;
      kos: PluralText;
      stillPlayingNote: string;
    };
    csv: {
      date: string;
      game: string;
      player: string;
      boughtIn: string;
      highHand: string;
      cashedOut: string;
      seatFee: string;
      net: string;
      satDown: string;
      left: string;
      place: string;
      rebuys: string;
      addOns: string;
      paidIn: string;
      won: string;
      knockouts: string;
      busted: string;
      costs: string;
    };
  };
}

export const players: Record<Lang, PlayersDict> = {
  en: {
    page: {
      title: "Players",
      subtitle:
        "Results from finished tournaments and from cash players who've cashed out. Names match across games, so spell them the same way.",
      spreadsheetButton: "Spreadsheet",
      filter: {
        periodLabel: "Time period",
        typeLabel: "Game type",
        allGames: "All Games",
        cash: "Cash",
        tournaments: "Tournaments",
      },
      stats: {
        summary: "{games} · {players} · {amount} bought in",
        games: { one: "{n} game", other: "{n} games" },
        players: { one: "{n} player", other: "{n} players" },
      },
      table: {
        player: "Player",
        games: "Games",
        net: "Net",
        cash: "Cash",
        perHour: "Per Hour",
        tournaments: "Tournaments",
        wins: "Wins",
        itm: "ITM",
        kos: "KOs",
        best: "Best Result",
        last: "Last Played",
      },
      history: {
        typeCash: "Cash",
        typeTournament: "Tournament",
        place: "{place} of {entrants}",
        kos: { one: "{n} KO", other: "{n} KOs" },
        cashInOut: "in {in}, out {out}",
        hoursSuffix: "{h}h",
        worst: "Worst result {amount}",
        cashHours: "{h} hours in cash games",
        cashedTournaments: "Cashed {itm} of {tournaments}",
        tournamentsCount: { one: "{n} tournament", other: "{n} tournaments" },
        highHand: "high hand {amount}",
        sevenTwo: { one: "{count} 7-2 win", other: "{count} 7-2 wins" },
      },
      payHandles: {
        label: "Gets Paid On",
        ariaLabel: "{name}'s {app}",
      },
      owed: {
        heading: "Owed",
        note: "Unpaid settle-ups from finished games, netted between each pair.",
        line: "{from} owes {to}",
        markPaid: "Mark {from} paid {to}",
      },
      toast: {
        csvDownloaded: "Spreadsheet downloaded",
        handleSaved: "Saved {name}'s {app}",
        handleCleared: "Cleared {name}'s {app}",
        markedPaid: "{from} paid {to} {amount}",
      },
      empty: {
        default:
          "No results yet. They show up here once a tournament has a winner or a cash player cashes out.",
        filtered:
          "No results yet for this filter. They show up here once a tournament has a winner or a cash player cashes out.",
        backLink: "Back to Games",
      },
      csv: {
        player: "Player",
        games: "Games",
        net: "Net",
        cashNet: "Cash Net",
        tourneyNet: "Tournament Net",
        tournaments: "Tournaments",
        wins: "Wins",
        itm: "In the Money",
        knockouts: "Knockouts",
        best: "Best Result",
        worst: "Worst Result",
        cashHours: "Cash Hours",
        perHour: "Per Hour",
        last: "Last Played",
      },
    },
    leagues: {
      tabBoard: "Leaderboard",
      tabLeagues: "Leagues",
      viewLabel: "View",
      pickAria: "League",
      new: "New League",
      edit: "Edit League",
      defaultName: "{year} Season",
      dates: "{start} to {end}",
      from: "From {start}",
      gamesCount: { one: "{count} game", other: "{count} games" },
      strays: { one: "{count} finished game from these dates isn't in a league.", other: "{count} finished games from these dates aren't in a league." },
      addThem: "Add Them",
      byGame: "Game by Game",
      byGameNote: "Each player's points from each game. Hover a number to see the place.",
      byGameNoteBest: "Each player's points from each game. A struck-through score isn't one of their best, so it doesn't count.",
      gameCol: "G{n}",
      noGames: "No finished games in this league yet. Pick it when you start a game, or on a game's page.",
      none: "No leagues yet. A league scores a season of games as a points race.",
      table: {
        points: "Points",
        played: "Played",
      },
      scoring: {
        table: "Points by place: {table}",
        beaten: "One point per player beaten",
        root: "Bigger fields score more",
        play: "{n} for playing",
        ko: "{n} per knockout",
        bestOf: "Best {n} count",
      },
      form: {
        name: "Name",
        start: "Starts",
        end: "Ends (Optional)",
        counts: "Counts:",
        points: "Points",
        kindTable: "By Place, From a Table",
        kindBeaten: "One per Player Beaten",
        kindRoot: "Bigger Fields Score More",
        table: "Points for 1st, 2nd, 3rd…",
        hint: {
          table: "Places past the end of the table score nothing.",
          beaten: "Everyone scores one point for each player they finished ahead of, plus one.",
          root: "10 × √(players ÷ place), so winning a big game is worth more.",
        },
        sample: "Of 10 players: 1st {first}, 2nd {second}, last {last}.",
        play: "Points for Playing",
        ko: "Points per Knockout",
        bestOf: "Best Of (0 = Every Game)",
        cashNote: "Cash games rank everyone by what they won that night.",
        bestOfNote: "Best of keeps each player's top scores and drops the rest.",
        create: "Create League",
        delete: "Delete League",
        confirmDelete: "Delete {name}? Its games stay, just not in a league.",
        needNameStart: "Give it a name and a start date",
        needType: "Pick at least one kind of game",
        endBeforeStart: "It can't end before it starts",
        needTable: "Type the points for each place",
      },
      toast: {
        created: "Created {name}",
        saved: "Saved {name}",
        deleted: "Deleted {name}",
        linked: { one: "Added {count} game to {name}", other: "Added {count} games to {name}" },
      },
      csv: {
        place: "Place",
        player: "Player",
        points: "Points",
        played: "Played",
        wins: "Wins",
        knockouts: "Knockouts",
        net: "Net",
      },
    },
    report: {
      cash: {
        summary: "{stakes}{played} · {bank} bought in",
        stillPlaying: "still playing ({in} in)",
        rakeBox: "Rake box: {amount}, to {house}",
        seatFee: "Seat fee: {amount} a player, to {house}",
        settleUp: "Settle up:",
        bombPots: { one: "{count} bomb pot", other: "{count} bomb pots" },
        sevenTwo: "Won with 7-2: {list}",
        highHand: "High hand: {name}, {hand}, {amount} (paid by {house})",
        settleLine: "{from} pays {to} {amount}{where}",
        bankOff: "(The bank is off by {amount}.)",
        costs: "Costs: {list}",
        paidTag: "paid",
      },
      tourney: {
        entrants: { one: "{n} player", other: "{n} players" },
        buyIn: "{amount} buy-in",
        rebuys: { one: "{n} rebuy", other: "{n} rebuys" },
        addOns: { one: "{n} add-on", other: "{n} add-ons" },
        pool: "pool {amount}",
        rakeKept: "(house kept {amount})",
        endedAt: "{duration}, ended at {stakes}",
        stillIn: "in",
        seat: "Seat ({amount})",
        kos: { one: "{n} KO", other: "{n} KOs" },
        stillPlayingNote: "(Still playing.)",
      },
      csv: {
        date: "Date",
        game: "Game",
        player: "Player",
        boughtIn: "Bought In",
        highHand: "High Hand",
        cashedOut: "Cashed Out",
        seatFee: "Seat Fee",
        net: "Net",
        satDown: "Sat Down",
        left: "Left",
        place: "Place",
        rebuys: "Rebuys",
        addOns: "Add-Ons",
        paidIn: "Paid In",
        won: "Won",
        knockouts: "Knockouts",
        busted: "Busted",
        costs: "Shared Costs",
      },
    },
  },
  zh: {
    page: {
      title: "选手",
      subtitle:
        "已结束锦标赛和已兑现离场的现金局选手的战绩会显示在这里。姓名要在各场比赛中保持一致的写法。",
      spreadsheetButton: "表格",
      filter: {
        periodLabel: "时间范围",
        typeLabel: "比赛类型",
        allGames: "全部比赛",
        cash: "现金局",
        tournaments: "锦标赛",
      },
      stats: {
        summary: "{games} · {players} · 共买入 {amount}",
        games: { one: "{n} 场比赛", other: "{n} 场比赛" },
        players: { one: "{n} 位选手", other: "{n} 位选手" },
      },
      table: {
        player: "选手",
        games: "场次",
        net: "净额",
        cash: "现金局",
        perHour: "每小时",
        tournaments: "锦标赛",
        wins: "夺冠",
        itm: "ITM",
        kos: "淘汰",
        best: "最佳战绩",
        last: "最近一次",
      },
      history: {
        typeCash: "现金局",
        typeTournament: "锦标赛",
        place: "第 {place} 名，共 {entrants} 人",
        kos: { one: "{n} 次淘汰", other: "{n} 次淘汰" },
        cashInOut: "买入 {in}，兑现 {out}",
        hoursSuffix: "{h} 小时",
        worst: "最差战绩 {amount}",
        cashHours: "现金局共 {h} 小时",
        cashedTournaments: "{tournaments}中有 {itm} 次进入奖金圈",
        tournamentsCount: { one: "{n} 场锦标赛", other: "{n} 场锦标赛" },
        highHand: "最大牌奖 {amount}",
        sevenTwo: { one: "7-2 赢 {count} 次", other: "7-2 赢 {count} 次" },
      },
      payHandles: {
        label: "收款方式",
        ariaLabel: "{name} 的 {app}",
      },
      owed: {
        heading: "欠款",
        note: "已结束牌局中未付的结算，按每两人之间抵消后显示。",
        line: "{from} 欠 {to}",
        markPaid: "标记 {from} 已付给 {to}",
      },
      toast: {
        csvDownloaded: "表格已下载",
        handleSaved: "已保存 {name} 的 {app}",
        handleCleared: "已清除 {name} 的 {app}",
        markedPaid: "{from} 已付给 {to} {amount}",
      },
      empty: {
        default:
          "暂无战绩。当有锦标赛产生冠军，或现金局选手兑现离场后，战绩会显示在这里。",
        filtered:
          "此筛选条件下暂无战绩。当有锦标赛产生冠军，或现金局选手兑现离场后，战绩会显示在这里。",
        backLink: "返回比赛列表",
      },
      csv: {
        player: "选手",
        games: "场次",
        net: "净额",
        cashNet: "现金局净额",
        tourneyNet: "锦标赛净额",
        tournaments: "锦标赛",
        wins: "夺冠",
        itm: "进入奖金圈",
        knockouts: "淘汰数",
        best: "最佳战绩",
        worst: "最差战绩",
        cashHours: "现金局时长",
        perHour: "每小时",
        last: "最近一次",
      },
    },
    leagues: {
      tabBoard: "排行榜",
      tabLeagues: "联赛",
      viewLabel: "查看",
      pickAria: "联赛",
      new: "新建联赛",
      edit: "编辑联赛",
      defaultName: "{year} 赛季",
      dates: "{start} 至 {end}",
      from: "自 {start} 起",
      gamesCount: { one: "{count} 场比赛", other: "{count} 场比赛" },
      strays: { one: "这段日期内有 {count} 场已结束的比赛不在任何联赛中。", other: "这段日期内有 {count} 场已结束的比赛不在任何联赛中。" },
      addThem: "加入它们",
      byGame: "逐场成绩",
      byGameNote: "每位选手在每场比赛中的积分。将鼠标悬停在数字上可查看名次。",
      byGameNoteBest: "每位选手在每场比赛中的积分。带删除线的分数不在其最佳成绩之列，因此不计入。",
      gameCol: "第{n}场",
      noGames: "这个联赛还没有已结束的比赛。开始比赛时或在比赛页面上选择它。",
      none: "还没有联赛。联赛把一个赛季的比赛按积分排名。",
      table: {
        points: "积分",
        played: "参赛",
      },
      scoring: {
        table: "按名次计分：{table}",
        beaten: "每胜过一位选手得一分",
        root: "人数越多，得分越高",
        play: "参赛得 {n} 分",
        ko: "每次淘汰得 {n} 分",
        bestOf: "取最佳 {n} 场",
      },
      form: {
        name: "名称",
        start: "开始",
        end: "结束（可选）",
        counts: "计入：",
        points: "积分",
        kindTable: "按名次，依积分表",
        kindBeaten: "每胜过一位选手得一分",
        kindRoot: "人数越多，得分越高",
        table: "第 1、2、3 名的积分…",
        hint: {
          table: "超出积分表的名次不得分。",
          beaten: "每位选手每排在一人之前就得一分，另加一分。",
          root: "10 × √(人数 ÷ 名次)，所以赢下大场比赛得分更多。",
        },
        sample: "10 人参赛时：第 1 名 {first}，第 2 名 {second}，最后一名 {last}。",
        play: "参赛积分",
        ko: "每次淘汰积分",
        bestOf: "取最佳场数（0 = 全部比赛）",
        cashNote: "现金局按每人当晚赢得的金额排名。",
        bestOfNote: "取最佳场数会保留每位选手的最高分，其余舍去。",
        create: "创建联赛",
        delete: "删除联赛",
        confirmDelete: "删除 {name}？其中的比赛会保留，只是不再属于任何联赛。",
        needNameStart: "请填写名称和开始日期",
        needType: "至少选择一种比赛类型",
        endBeforeStart: "结束日期不能早于开始日期",
        needTable: "请输入每个名次的积分",
      },
      toast: {
        created: "已创建 {name}",
        saved: "已保存 {name}",
        deleted: "已删除 {name}",
        linked: { one: "已将 {count} 场比赛加入 {name}", other: "已将 {count} 场比赛加入 {name}" },
      },
      csv: {
        place: "名次",
        player: "选手",
        points: "积分",
        played: "参赛",
        wins: "夺冠",
        knockouts: "淘汰数",
        net: "净额",
      },
    },
    report: {
      cash: {
        summary: "{stakes}{played} · 共买入 {bank}",
        stillPlaying: "仍在进行中（已买入 {in}）",
        rakeBox: "抽水箱：{amount}，归 {house}",
        seatFee: "座位费：每人 {amount}，归 {house}",
        settleUp: "结算：",
        bombPots: { one: "{count} 次炸弹底池", other: "{count} 次炸弹底池" },
        sevenTwo: "用 7-2 赢过：{list}",
        highHand: "最大牌：{name}，{hand}，{amount}（{house} 支付）",
        settleLine: "{from} 付给 {to} {amount}{where}",
        bankOff: "（账目有 {amount} 的误差。）",
        costs: "费用：{list}",
        paidTag: "已付",
      },
      tourney: {
        entrants: { one: "{n} 位选手", other: "{n} 位选手" },
        buyIn: "买入 {amount}",
        rebuys: { one: "{n} 次重买", other: "{n} 次重买" },
        addOns: { one: "{n} 次增购", other: "{n} 次增购" },
        pool: "奖池 {amount}",
        rakeKept: "（主办方抽水 {amount}）",
        endedAt: "{duration}，结束于 {stakes}",
        stillIn: "进行中",
        seat: "席位（{amount}）",
        kos: { one: "{n} 次淘汰", other: "{n} 次淘汰" },
        stillPlayingNote: "（比赛仍在进行。）",
      },
      csv: {
        date: "日期",
        game: "比赛",
        player: "选手",
        boughtIn: "买入",
        highHand: "最大牌奖",
        cashedOut: "兑现",
        seatFee: "座位费",
        net: "净额",
        satDown: "入座时间",
        left: "离场时间",
        place: "名次",
        rebuys: "重买次数",
        addOns: "增购次数",
        paidIn: "投入金额",
        won: "获得金额",
        knockouts: "淘汰数",
        busted: "出局",
        costs: "共同费用",
      },
    },
  },
  hi: {
    page: {
      title: "खिलाड़ी",
      subtitle:
        "समाप्त हो चुके टूर्नामेंट और कैश आउट कर चुके कैश गेम खिलाड़ियों के नतीजे यहाँ दिखते हैं। नाम सभी गेम में एक जैसे लिखें ताकि वे मेल खाएं।",
      spreadsheetButton: "स्प्रेडशीट",
      filter: {
        periodLabel: "समय अवधि",
        typeLabel: "गेम प्रकार",
        allGames: "सभी गेम",
        cash: "कैश",
        tournaments: "टूर्नामेंट",
      },
      stats: {
        summary: "{games} · {players} · {amount} की बाय-इन",
        games: { one: "{n} गेम", other: "{n} गेम" },
        players: { one: "{n} खिलाड़ी", other: "{n} खिलाड़ी" },
      },
      table: {
        player: "खिलाड़ी",
        games: "गेम",
        net: "नेट",
        cash: "कैश",
        perHour: "प्रति घंटा",
        tournaments: "टूर्नामेंट",
        wins: "जीत",
        itm: "ITM",
        kos: "नॉकआउट",
        best: "सर्वश्रेष्ठ नतीजा",
        last: "आखिरी बार खेला",
      },
      history: {
        typeCash: "कैश",
        typeTournament: "टूर्नामेंट",
        place: "{entrants} में से {place}",
        kos: { one: "{n} नॉकआउट", other: "{n} नॉकआउट" },
        cashInOut: "बाय-इन {in}, कैश आउट {out}",
        hoursSuffix: "{h} घंटे",
        worst: "सबसे खराब नतीजा {amount}",
        cashHours: "कैश गेम में {h} घंटे",
        cashedTournaments: "{tournaments} में से {itm} बार पैसा जीता",
        tournamentsCount: { one: "{n} टूर्नामेंट", other: "{n} टूर्नामेंट" },
        highHand: "हाई हैंड {amount}",
        sevenTwo: { one: "{count} बार 7-2 जीत", other: "{count} बार 7-2 जीत" },
      },
      payHandles: {
        label: "भुगतान कहाँ मिलेगा",
        ariaLabel: "{name} का {app}",
      },
      owed: {
        heading: "बकाया",
        note: "खत्म हुए गेम्स के बिना चुकाए हिसाब, हर जोड़ी के बीच जोड़-घटाकर।",
        line: "{from} पर {to} का बाकी",
        markPaid: "{from} ने {to} को चुका दिया",
      },
      toast: {
        csvDownloaded: "स्प्रेडशीट डाउनलोड हो गई",
        handleSaved: "{name} का {app} सहेजा गया",
        handleCleared: "{name} का {app} हटाया गया",
        markedPaid: "{from} ने {to} को {amount} दिए",
      },
      empty: {
        default:
          "अभी तक कोई नतीजा नहीं है। जैसे ही किसी टूर्नामेंट का विजेता तय होता है या कोई कैश गेम खिलाड़ी कैश आउट करता है, वह यहाँ दिखेगा।",
        filtered:
          "इस फ़िल्टर के लिए अभी तक कोई नतीजा नहीं है। जैसे ही किसी टूर्नामेंट का विजेता तय होता है या कोई कैश गेम खिलाड़ी कैश आउट करता है, वह यहाँ दिखेगा।",
        backLink: "गेम सूची पर वापस जाएं",
      },
      csv: {
        player: "खिलाड़ी",
        games: "गेम",
        net: "नेट",
        cashNet: "कैश नेट",
        tourneyNet: "टूर्नामेंट नेट",
        tournaments: "टूर्नामेंट",
        wins: "जीत",
        itm: "पैसा जीता",
        knockouts: "नॉकआउट",
        best: "सर्वश्रेष्ठ नतीजा",
        worst: "सबसे खराब नतीजा",
        cashHours: "कैश गेम घंटे",
        perHour: "प्रति घंटा",
        last: "आखिरी बार खेला",
      },
    },
    leagues: {
      tabBoard: "लीडरबोर्ड",
      tabLeagues: "लीग",
      viewLabel: "देखें",
      pickAria: "लीग",
      new: "नई लीग",
      edit: "लीग बदलें",
      defaultName: "{year} सीज़न",
      dates: "{start} से {end}",
      from: "{start} से",
      gamesCount: { one: "{count} गेम", other: "{count} गेम" },
      strays: { one: "इन तारीखों का {count} पूरा हुआ गेम किसी लीग में नहीं है।", other: "इन तारीखों के {count} पूरे हुए गेम किसी लीग में नहीं हैं।" },
      addThem: "इन्हें जोड़ें",
      byGame: "गेम-दर-गेम",
      byGameNote: "हर गेम में हर खिलाड़ी के अंक। स्थान देखने के लिए किसी संख्या पर होवर करें।",
      byGameNoteBest: "हर गेम में हर खिलाड़ी के अंक। कटा हुआ स्कोर उनके सबसे अच्छे स्कोर में नहीं है, इसलिए गिना नहीं जाता।",
      gameCol: "गेम {n}",
      noGames: "इस लीग में अभी कोई पूरा हुआ गेम नहीं है। गेम शुरू करते समय या गेम के पेज पर इसे चुनें।",
      none: "अभी कोई लीग नहीं। लीग पूरे सीज़न के गेम को अंकों की दौड़ की तरह गिनती है।",
      table: {
        points: "अंक",
        played: "खेले",
      },
      scoring: {
        table: "स्थान के हिसाब से अंक: {table}",
        beaten: "हराए गए हर खिलाड़ी पर एक अंक",
        root: "बड़े गेम में ज़्यादा अंक",
        play: "खेलने के {n}",
        ko: "हर नॉकआउट पर {n}",
        bestOf: "सबसे अच्छे {n} गिने जाते हैं",
      },
      form: {
        name: "नाम",
        start: "शुरू",
        end: "खत्म (वैकल्पिक)",
        counts: "गिने जाएं:",
        points: "अंक",
        kindTable: "स्थान के हिसाब से, तालिका से",
        kindBeaten: "हराए गए हर खिलाड़ी पर एक",
        kindRoot: "बड़े गेम में ज़्यादा अंक",
        table: "पहले, दूसरे, तीसरे स्थान के अंक…",
        hint: {
          table: "तालिका से आगे के स्थानों को कोई अंक नहीं मिलता।",
          beaten: "हर किसी को अपने से पीछे रहे हर खिलाड़ी पर एक अंक मिलता है, और एक अंक ऊपर से।",
          root: "10 × √(खिलाड़ी ÷ स्थान), यानी बड़ा गेम जीतना ज़्यादा कीमती है।",
        },
        sample: "10 खिलाड़ियों में: पहला {first}, दूसरा {second}, आखिरी {last}।",
        play: "खेलने के अंक",
        ko: "हर नॉकआउट के अंक",
        bestOf: "सबसे अच्छे (0 = हर गेम)",
        cashNote: "कैश गेम में सबको उस रात की जीत के हिसाब से क्रम दिया जाता है।",
        bestOfNote: "सबसे अच्छे वाला विकल्प हर खिलाड़ी के ऊपर के स्कोर रखता है और बाकी हटा देता है।",
        create: "लीग बनाएं",
        delete: "लीग हटाएं",
        confirmDelete: "{name} हटाएं? इसके गेम बने रहेंगे, बस किसी लीग में नहीं होंगे।",
        needNameStart: "नाम और शुरू होने की तारीख दें",
        needType: "कम से कम एक तरह का गेम चुनें",
        endBeforeStart: "यह शुरू होने से पहले खत्म नहीं हो सकती",
        needTable: "हर स्थान के अंक लिखें",
      },
      toast: {
        created: "{name} बनाई गई",
        saved: "{name} सेव की गई",
        deleted: "{name} हटाई गई",
        linked: { one: "{count} गेम {name} में जोड़ा गया", other: "{count} गेम {name} में जोड़े गए" },
      },
      csv: {
        place: "स्थान",
        player: "खिलाड़ी",
        points: "अंक",
        played: "खेले",
        wins: "जीत",
        knockouts: "नॉकआउट",
        net: "नेट",
      },
    },
    report: {
      cash: {
        summary: "{stakes}{played} · कुल बाय-इन {bank}",
        stillPlaying: "अभी खेल रहे हैं ({in} लगाए)",
        rakeBox: "रेक बॉक्स: {amount}, {house} के लिए",
        seatFee: "सीट फीस: प्रति खिलाड़ी {amount}, {house} के लिए",
        settleUp: "हिसाब चुकाएं:",
        bombPots: { one: "{count} बॉम्ब पॉट", other: "{count} बॉम्ब पॉट" },
        sevenTwo: "7-2 से जीते: {list}",
        highHand: "हाई हैंड: {name}, {hand}, {amount} ({house} ने दिया)",
        settleLine: "{from} ने {to} को {amount} दिए{where}",
        bankOff: "(हिसाब में {amount} का अंतर है।)",
        costs: "खर्च: {list}",
        paidTag: "चुकाया",
      },
      tourney: {
        entrants: { one: "{n} खिलाड़ी", other: "{n} खिलाड़ी" },
        buyIn: "{amount} बाय-इन",
        rebuys: { one: "{n} रीबाय", other: "{n} रीबाय" },
        addOns: { one: "{n} ऐड-ऑन", other: "{n} ऐड-ऑन" },
        pool: "पॉट {amount}",
        rakeKept: "(हाउस ने {amount} रखे)",
        endedAt: "{duration}, समाप्ति {stakes} पर",
        stillIn: "जारी",
        seat: "सीट ({amount})",
        kos: { one: "{n} नॉकआउट", other: "{n} नॉकआउट" },
        stillPlayingNote: "(अभी खेल जारी है।)",
      },
      csv: {
        date: "तारीख",
        game: "गेम",
        player: "खिलाड़ी",
        boughtIn: "बाय-इन",
        highHand: "हाई हैंड",
        cashedOut: "कैश आउट",
        seatFee: "सीट फीस",
        net: "नेट",
        satDown: "बैठे",
        left: "छोड़ा",
        place: "स्थान",
        rebuys: "रीबाय",
        addOns: "ऐड-ऑन",
        paidIn: "जमा राशि",
        won: "जीत राशि",
        knockouts: "नॉकआउट",
        busted: "आउट होना",
        costs: "साझा खर्च",
      },
    },
  },
  es: {
    page: {
      title: "Jugadores",
      subtitle:
        "Resultados de torneos terminados y de jugadores de cash que ya cobraron. Los nombres deben coincidir entre partidas, así que escríbelos siempre igual.",
      spreadsheetButton: "Hoja de Cálculo",
      filter: {
        periodLabel: "Periodo",
        typeLabel: "Tipo de partida",
        allGames: "Todas las Partidas",
        cash: "Cash",
        tournaments: "Torneos",
      },
      stats: {
        summary: "{games} · {players} · {amount} en buy-ins",
        games: { one: "{n} partida", other: "{n} partidas" },
        players: { one: "{n} jugador", other: "{n} jugadores" },
      },
      table: {
        player: "Jugador",
        games: "Partidas",
        net: "Neto",
        cash: "Cash",
        perHour: "Por Hora",
        tournaments: "Torneos",
        wins: "Victorias",
        itm: "ITM",
        kos: "KOs",
        best: "Mejor Resultado",
        last: "Última Vez",
      },
      history: {
        typeCash: "Cash",
        typeTournament: "Torneo",
        place: "{place} de {entrants}",
        kos: { one: "{n} KO", other: "{n} KOs" },
        cashInOut: "entró con {in}, salió con {out}",
        hoursSuffix: "{h}h",
        worst: "Peor resultado {amount}",
        cashHours: "{h} horas en partidas de cash",
        cashedTournaments: "Cobró en {itm} de {tournaments}",
        tournamentsCount: { one: "{n} torneo", other: "{n} torneos" },
        highHand: "mano más alta {amount}",
        sevenTwo: { one: "{count} victoria con 7-2", other: "{count} victorias con 7-2" },
      },
      payHandles: {
        label: "Recibe Pagos En",
        ariaLabel: "{app} de {name}",
      },
      owed: {
        heading: "Deudas",
        note: "Saldos sin pagar de partidas terminadas, compensados entre cada par.",
        line: "{from} le debe a {to}",
        markPaid: "Marcar que {from} le pagó a {to}",
      },
      toast: {
        csvDownloaded: "Hoja de cálculo descargada",
        handleSaved: "Se guardó el {app} de {name}",
        handleCleared: "Se borró el {app} de {name}",
        markedPaid: "{from} le pagó a {to} {amount}",
      },
      empty: {
        default:
          "Todavía no hay resultados. Aparecerán aquí en cuanto un torneo tenga un ganador o un jugador de cash cobre.",
        filtered:
          "Todavía no hay resultados para este filtro. Aparecerán aquí en cuanto un torneo tenga un ganador o un jugador de cash cobre.",
        backLink: "Volver a las Partidas",
      },
      csv: {
        player: "Jugador",
        games: "Partidas",
        net: "Neto",
        cashNet: "Neto en Cash",
        tourneyNet: "Neto en Torneos",
        tournaments: "Torneos",
        wins: "Victorias",
        itm: "En el Dinero",
        knockouts: "Eliminaciones",
        best: "Mejor Resultado",
        worst: "Peor Resultado",
        cashHours: "Horas de Cash",
        perHour: "Por Hora",
        last: "Última Vez",
      },
    },
    leagues: {
      tabBoard: "Clasificación",
      tabLeagues: "Ligas",
      viewLabel: "Ver",
      pickAria: "Liga",
      new: "Nueva Liga",
      edit: "Editar Liga",
      defaultName: "Temporada {year}",
      dates: "{start} a {end}",
      from: "Desde {start}",
      gamesCount: { one: "{count} partida", other: "{count} partidas" },
      strays: { one: "{count} partida terminada de estas fechas no está en ninguna liga.", other: "{count} partidas terminadas de estas fechas no están en ninguna liga." },
      addThem: "Añadirlas",
      byGame: "Partida a Partida",
      byGameNote: "Los puntos de cada jugador en cada partida. Pasa el ratón sobre un número para ver el puesto.",
      byGameNoteBest: "Los puntos de cada jugador en cada partida. Una puntuación tachada no está entre sus mejores, así que no cuenta.",
      gameCol: "P{n}",
      noGames: "Todavía no hay partidas terminadas en esta liga. Elígela al empezar una partida o en la página de una partida.",
      none: "Todavía no hay ligas. Una liga puntúa una temporada de partidas como una carrera por puntos.",
      table: {
        points: "Puntos",
        played: "Jugadas",
      },
      scoring: {
        table: "Puntos por puesto: {table}",
        beaten: "Un punto por jugador superado",
        root: "Más jugadores, más puntos",
        play: "{n} por jugar",
        ko: "{n} por eliminación",
        bestOf: "Cuentan las {n} mejores",
      },
      form: {
        name: "Nombre",
        start: "Empieza",
        end: "Termina (Opcional)",
        counts: "Cuenta:",
        points: "Puntos",
        kindTable: "Por Puesto, Según una Tabla",
        kindBeaten: "Uno por Jugador Superado",
        kindRoot: "Más Jugadores, Más Puntos",
        table: "Puntos para 1º, 2º, 3º…",
        hint: {
          table: "Los puestos más allá del final de la tabla no puntúan.",
          beaten: "Cada uno suma un punto por cada jugador que quedó por detrás, más uno.",
          root: "10 × √(jugadores ÷ puesto), así que ganar una partida grande vale más.",
        },
        sample: "Con 10 jugadores: 1º {first}, 2º {second}, último {last}.",
        play: "Puntos por Jugar",
        ko: "Puntos por Eliminación",
        bestOf: "Mejores (0 = Todas las Partidas)",
        cashNote: "En las partidas de cash, todos se ordenan por lo que ganaron esa noche.",
        bestOfNote: "Mejores guarda las puntuaciones más altas de cada jugador y descarta el resto.",
        create: "Crear Liga",
        delete: "Eliminar Liga",
        confirmDelete: "¿Eliminar {name}? Sus partidas se quedan, solo que fuera de una liga.",
        needNameStart: "Ponle un nombre y una fecha de inicio",
        needType: "Elige al menos un tipo de partida",
        endBeforeStart: "No puede terminar antes de empezar",
        needTable: "Escribe los puntos de cada puesto",
      },
      toast: {
        created: "{name} creada",
        saved: "{name} guardada",
        deleted: "{name} eliminada",
        linked: { one: "{count} partida añadida a {name}", other: "{count} partidas añadidas a {name}" },
      },
      csv: {
        place: "Lugar",
        player: "Jugador",
        points: "Puntos",
        played: "Jugadas",
        wins: "Victorias",
        knockouts: "Eliminaciones",
        net: "Neto",
      },
    },
    report: {
      cash: {
        summary: "{stakes}{played} · {bank} en buy-ins",
        stillPlaying: "sigue jugando ({in} en juego)",
        rakeBox: "Caja de rake: {amount}, para {house}",
        seatFee: "Cuota de mesa: {amount} por jugador, para {house}",
        settleUp: "Saldar cuentas:",
        bombPots: { one: "{count} bomb pot", other: "{count} bomb pots" },
        sevenTwo: "Ganaron con 7-2: {list}",
        highHand: "Mano más alta: {name}, {hand}, {amount} (pagado por {house})",
        settleLine: "{from} le paga a {to} {amount}{where}",
        bankOff: "(La caja tiene una diferencia de {amount}.)",
        costs: "Gastos: {list}",
        paidTag: "pagado",
      },
      tourney: {
        entrants: { one: "{n} jugador", other: "{n} jugadores" },
        buyIn: "buy-in de {amount}",
        rebuys: { one: "{n} rebuy", other: "{n} rebuys" },
        addOns: { one: "{n} add-on", other: "{n} add-ons" },
        pool: "bote de {amount}",
        rakeKept: "(la casa se quedó con {amount})",
        endedAt: "{duration}, terminó en {stakes}",
        stillIn: "en juego",
        seat: "Plaza ({amount})",
        kos: { one: "{n} KO", other: "{n} KOs" },
        stillPlayingNote: "(Todavía en juego.)",
      },
      csv: {
        date: "Fecha",
        game: "Partida",
        player: "Jugador",
        boughtIn: "Buy-in",
        highHand: "Mano más alta",
        cashedOut: "Cobrado",
        seatFee: "Cuota de Mesa",
        net: "Neto",
        satDown: "Se Sentó",
        left: "Se Fue",
        place: "Lugar",
        rebuys: "Rebuys",
        addOns: "Add-Ons",
        paidIn: "Aportado",
        won: "Ganado",
        knockouts: "Eliminaciones",
        busted: "Eliminado",
        costs: "Gastos Compartidos",
      },
    },
  },
  fr: {
    page: {
      title: "Joueurs",
      subtitle:
        "Résultats des tournois terminés et des joueurs de cash qui ont encaissé. Les noms doivent correspondre d'une partie à l'autre, alors gardez toujours la même orthographe.",
      spreadsheetButton: "Feuille de Calcul",
      filter: {
        periodLabel: "Période",
        typeLabel: "Type de partie",
        allGames: "Toutes les Parties",
        cash: "Cash",
        tournaments: "Tournois",
      },
      stats: {
        summary: "{games} · {players} · {amount} de buy-ins",
        games: { one: "{n} partie", other: "{n} parties" },
        players: { one: "{n} joueur", other: "{n} joueurs" },
      },
      table: {
        player: "Joueur",
        games: "Parties",
        net: "Net",
        cash: "Cash",
        perHour: "Par Heure",
        tournaments: "Tournois",
        wins: "Victoires",
        itm: "ITM",
        kos: "KO",
        best: "Meilleur Résultat",
        last: "Dernière Partie",
      },
      history: {
        typeCash: "Cash",
        typeTournament: "Tournoi",
        place: "{place} sur {entrants}",
        kos: { one: "{n} KO", other: "{n} KO" },
        cashInOut: "entré avec {in}, sorti avec {out}",
        hoursSuffix: "{h}h",
        worst: "Pire résultat {amount}",
        cashHours: "{h} heures en cash",
        cashedTournaments: "Dans les gains {itm} fois sur {tournaments}",
        tournamentsCount: { one: "{n} tournoi", other: "{n} tournois" },
        highHand: "meilleure main {amount}",
        sevenTwo: { one: "{count} gain au 7-2", other: "{count} gains au 7-2" },
      },
      payHandles: {
        label: "Reçoit les Paiements Sur",
        ariaLabel: "{app} de {name}",
      },
      owed: {
        heading: "Dettes",
        note: "Règlements impayés des parties terminées, compensés entre chaque paire.",
        line: "{from} doit à {to}",
        markPaid: "Marquer que {from} a payé {to}",
      },
      toast: {
        csvDownloaded: "Feuille de calcul téléchargée",
        handleSaved: "{app} de {name} enregistré",
        handleCleared: "{app} de {name} effacé",
        markedPaid: "{from} a payé {to} {amount}",
      },
      empty: {
        default:
          "Pas encore de résultats. Ils apparaîtront ici dès qu'un tournoi aura un vainqueur ou qu'un joueur de cash encaissera.",
        filtered:
          "Pas encore de résultats pour ce filtre. Ils apparaîtront ici dès qu'un tournoi aura un vainqueur ou qu'un joueur de cash encaissera.",
        backLink: "Retour aux Parties",
      },
      csv: {
        player: "Joueur",
        games: "Parties",
        net: "Net",
        cashNet: "Net Cash",
        tourneyNet: "Net Tournois",
        tournaments: "Tournois",
        wins: "Victoires",
        itm: "Dans les Gains",
        knockouts: "Éliminations",
        best: "Meilleur Résultat",
        worst: "Pire Résultat",
        cashHours: "Heures en Cash",
        perHour: "Par Heure",
        last: "Dernière Partie",
      },
    },
    leagues: {
      tabBoard: "Classement",
      tabLeagues: "Ligues",
      viewLabel: "Vue",
      pickAria: "Ligue",
      new: "Nouvelle Ligue",
      edit: "Modifier la Ligue",
      defaultName: "Saison {year}",
      dates: "Du {start} au {end}",
      from: "À partir du {start}",
      gamesCount: { one: "{count} partie", other: "{count} parties" },
      strays: { one: "{count} partie terminée à ces dates n'est dans aucune ligue.", other: "{count} parties terminées à ces dates ne sont dans aucune ligue." },
      addThem: "Les Ajouter",
      byGame: "Partie par Partie",
      byGameNote: "Les points de chaque joueur à chaque partie. Survolez un nombre pour voir la place.",
      byGameNoteBest: "Les points de chaque joueur à chaque partie. Un score barré ne fait pas partie de ses meilleurs, donc il ne compte pas.",
      gameCol: "P{n}",
      noGames: "Aucune partie terminée dans cette ligue pour l'instant. Choisissez-la en lançant une partie, ou sur la page d'une partie.",
      none: "Aucune ligue pour l'instant. Une ligue transforme une saison de parties en course aux points.",
      table: {
        points: "Points",
        played: "Jouées",
      },
      scoring: {
        table: "Points par place : {table}",
        beaten: "Un point par joueur battu",
        root: "Plus de joueurs, plus de points",
        play: "{n} pour avoir joué",
        ko: "{n} par élimination",
        bestOf: "Les {n} meilleures comptent",
      },
      form: {
        name: "Nom",
        start: "Début",
        end: "Fin (Facultatif)",
        counts: "Compte :",
        points: "Points",
        kindTable: "Par Place, Selon un Tableau",
        kindBeaten: "Un par Joueur Battu",
        kindRoot: "Plus de Joueurs, Plus de Points",
        table: "Points pour 1er, 2e, 3e…",
        hint: {
          table: "Les places au-delà du tableau ne rapportent rien.",
          beaten: "Chacun marque un point pour chaque joueur terminé derrière lui, plus un.",
          root: "10 × √(joueurs ÷ place), donc gagner une grosse partie rapporte plus.",
        },
        sample: "Sur 10 joueurs : 1er {first}, 2e {second}, dernier {last}.",
        play: "Points de Participation",
        ko: "Points par Élimination",
        bestOf: "Meilleures (0 = Toutes les Parties)",
        cashNote: "Les parties cash classent chacun selon ce qu'il a gagné ce soir-là.",
        bestOfNote: "Meilleures garde les scores les plus hauts de chaque joueur et écarte le reste.",
        create: "Créer la Ligue",
        delete: "Supprimer la Ligue",
        confirmDelete: "Supprimer {name} ? Ses parties restent, simplement hors ligue.",
        needNameStart: "Donnez-lui un nom et une date de début",
        needType: "Choisissez au moins un type de partie",
        endBeforeStart: "Elle ne peut pas finir avant de commencer",
        needTable: "Saisissez les points de chaque place",
      },
      toast: {
        created: "{name} créée",
        saved: "{name} enregistrée",
        deleted: "{name} supprimée",
        linked: { one: "{count} partie ajoutée à {name}", other: "{count} parties ajoutées à {name}" },
      },
      csv: {
        place: "Place",
        player: "Joueur",
        points: "Points",
        played: "Jouées",
        wins: "Victoires",
        knockouts: "Éliminations",
        net: "Net",
      },
    },
    report: {
      cash: {
        summary: "{stakes}{played} · {bank} de buy-ins",
        stillPlaying: "en cours ({in} engagés)",
        rakeBox: "Boîte de rake : {amount}, pour {house}",
        seatFee: "Frais de table : {amount} par joueur, pour {house}",
        settleUp: "Régler les comptes :",
        bombPots: { one: "{count} bomb pot", other: "{count} bomb pots" },
        sevenTwo: "Gagné avec 7-2 : {list}",
        highHand: "Meilleure main : {name}, {hand}, {amount} (payé par {house})",
        settleLine: "{from} paie {amount} à {to}{where}",
        bankOff: "(La caisse a un écart de {amount}.)",
        costs: "Frais : {list}",
        paidTag: "payé",
      },
      tourney: {
        entrants: { one: "{n} joueur", other: "{n} joueurs" },
        buyIn: "buy-in de {amount}",
        rebuys: { one: "{n} recave", other: "{n} recaves" },
        addOns: { one: "{n} add-on", other: "{n} add-ons" },
        pool: "pot de {amount}",
        rakeKept: "(la maison a gardé {amount})",
        endedAt: "{duration}, terminé à {stakes}",
        stillIn: "en cours",
        seat: "Place ({amount})",
        kos: { one: "{n} KO", other: "{n} KO" },
        stillPlayingNote: "(Toujours en cours.)",
      },
      csv: {
        date: "Date",
        game: "Partie",
        player: "Joueur",
        boughtIn: "Buy-in",
        highHand: "Meilleure main",
        cashedOut: "Encaissé",
        seatFee: "Frais de Table",
        net: "Net",
        satDown: "Arrivée",
        left: "Départ",
        place: "Place",
        rebuys: "Recaves",
        addOns: "Add-Ons",
        paidIn: "Versé",
        won: "Gagné",
        knockouts: "Éliminations",
        busted: "Éliminé",
        costs: "Frais Partagés",
      },
    },
  },
  ar: {
    page: {
      title: "اللاعبون",
      subtitle:
        "نتائج البطولات المنتهية ولاعبي الكاش الذين صرفوا رصيدهم تظهر هنا. اكتب الأسماء بنفس الطريقة في كل جولة حتى تتطابق.",
      spreadsheetButton: "جدول بيانات",
      filter: {
        periodLabel: "الفترة الزمنية",
        typeLabel: "نوع الجولة",
        allGames: "كل الجولات",
        cash: "كاش",
        tournaments: "البطولات",
      },
      stats: {
        summary: "{games} · {players} · {amount} إجمالي الدخول",
        games: { one: "جولة واحدة", other: "{n} جولة" },
        players: { one: "لاعب واحد", other: "{n} لاعب" },
      },
      table: {
        player: "اللاعب",
        games: "الجولات",
        net: "الصافي",
        cash: "كاش",
        perHour: "لكل ساعة",
        tournaments: "البطولات",
        wins: "الفوز",
        itm: "ITM",
        kos: "الإقصاءات",
        best: "أفضل نتيجة",
        last: "آخر مرة",
      },
      history: {
        typeCash: "كاش",
        typeTournament: "بطولة",
        place: "{place} من {entrants}",
        kos: { one: "إقصاء واحد", other: "{n} إقصاء" },
        cashInOut: "دخل بـ {in}، وخرج بـ {out}",
        hoursSuffix: "{h} س",
        worst: "أسوأ نتيجة {amount}",
        cashHours: "{h} ساعة في الكاش",
        cashedTournaments: "حقق جوائز في {itm} من {tournaments}",
        tournamentsCount: { one: "بطولة واحدة", other: "{n} بطولة" },
        highHand: "أعلى يد {amount}",
        sevenTwo: { one: "فوز واحد بـ 7-2", two: "فوزان بـ 7-2", few: "{count} انتصارات بـ 7-2", other: "{count} فوزًا بـ 7-2" },
      },
      payHandles: {
        label: "يستلم الدفعات على",
        ariaLabel: "{app} الخاص بـ {name}",
      },
      owed: {
        heading: "المستحقات",
        note: "تسويات غير مدفوعة من ألعاب منتهية، بعد المقاصة بين كل شخصين.",
        line: "{from} مدين لـ {to}",
        markPaid: "تعليم أن {from} دفع لـ {to}",
      },
      toast: {
        csvDownloaded: "تم تنزيل جدول البيانات",
        handleSaved: "تم حفظ {app} الخاص بـ {name}",
        handleCleared: "تم مسح {app} الخاص بـ {name}",
        markedPaid: "دفع {from} لـ {to} {amount}",
      },
      empty: {
        default:
          "لا توجد نتائج بعد. ستظهر هنا بمجرد أن تحدد إحدى البطولات فائزًا أو يصرف أحد لاعبي الكاش رصيده.",
        filtered:
          "لا توجد نتائج بعد لهذا الفلتر. ستظهر هنا بمجرد أن تحدد إحدى البطولات فائزًا أو يصرف أحد لاعبي الكاش رصيده.",
        backLink: "العودة إلى الجولات",
      },
      csv: {
        player: "اللاعب",
        games: "الجولات",
        net: "الصافي",
        cashNet: "صافي الكاش",
        tourneyNet: "صافي البطولات",
        tournaments: "البطولات",
        wins: "الفوز",
        itm: "ضمن الجوائز",
        knockouts: "الإقصاءات",
        best: "أفضل نتيجة",
        worst: "أسوأ نتيجة",
        cashHours: "ساعات الكاش",
        perHour: "لكل ساعة",
        last: "آخر مرة",
      },
    },
    leagues: {
      tabBoard: "لوحة الصدارة",
      tabLeagues: "الدوريات",
      viewLabel: "العرض",
      pickAria: "الدوري",
      new: "دوري جديد",
      edit: "تعديل الدوري",
      defaultName: "موسم {year}",
      dates: "من {start} إلى {end}",
      from: "من {start}",
      gamesCount: { zero: "لا جولات", one: "جولة واحدة", two: "جولتان", few: "{count} جولات", many: "{count} جولة", other: "{count} جولة" },
      strays: { zero: "لا توجد جولات منتهية من هذه التواريخ خارج الدوريات.", one: "جولة واحدة منتهية من هذه التواريخ ليست في أي دوري.", two: "جولتان منتهيتان من هذه التواريخ ليستا في أي دوري.", few: "{count} جولات منتهية من هذه التواريخ ليست في أي دوري.", many: "{count} جولة منتهية من هذه التواريخ ليست في أي دوري.", other: "{count} جولة منتهية من هذه التواريخ ليست في أي دوري." },
      addThem: "أضفها",
      byGame: "جولة بجولة",
      byGameNote: "نقاط كل لاعب في كل جولة. مرّر المؤشر فوق رقم لترى المركز.",
      byGameNoteBest: "نقاط كل لاعب في كل جولة. النتيجة المشطوبة ليست من أفضل نتائجه، لذا لا تُحتسب.",
      gameCol: "ج{n}",
      noGames: "لا جولات منتهية في هذا الدوري بعد. اختره عند بدء جولة، أو من صفحة الجولة.",
      none: "لا دوريات بعد. الدوري يحسب موسمًا من الجولات كسباق نقاط.",
      table: {
        points: "النقاط",
        played: "لعب",
      },
      scoring: {
        table: "النقاط حسب المركز: {table}",
        beaten: "نقطة لكل لاعب تتفوق عليه",
        root: "الجولات الأكبر تمنح نقاطًا أكثر",
        play: "{n} للمشاركة",
        ko: "{n} لكل إقصاء",
        bestOf: "تُحتسب أفضل {n}",
      },
      form: {
        name: "الاسم",
        start: "البداية",
        end: "النهاية (اختياري)",
        counts: "يُحتسب:",
        points: "النقاط",
        kindTable: "حسب المركز، من جدول",
        kindBeaten: "نقطة لكل لاعب تتفوق عليه",
        kindRoot: "الجولات الأكبر تمنح نقاطًا أكثر",
        table: "نقاط المركز الأول والثاني والثالث…",
        hint: {
          table: "المراكز بعد نهاية الجدول لا تحصل على نقاط.",
          beaten: "يحصل كل لاعب على نقطة عن كل لاعب أنهى خلفه، زائد نقطة.",
          root: "10 × √(اللاعبون ÷ المركز)، لذا الفوز بجولة كبيرة يساوي أكثر.",
        },
        sample: "من 10 لاعبين: الأول {first}، الثاني {second}، الأخير {last}.",
        play: "نقاط المشاركة",
        ko: "نقاط كل إقصاء",
        bestOf: "الأفضل من (0 = كل الجولات)",
        cashNote: "في ألعاب الكاش يُرتَّب الجميع حسب ما ربحوه تلك الليلة.",
        bestOfNote: "خيار الأفضل يحتفظ بأعلى نتائج كل لاعب ويُسقط الباقي.",
        create: "إنشاء الدوري",
        delete: "حذف الدوري",
        confirmDelete: "حذف {name}؟ تبقى جولاته، لكن خارج أي دوري.",
        needNameStart: "أعطه اسمًا وتاريخ بداية",
        needType: "اختر نوعًا واحدًا من الجولات على الأقل",
        endBeforeStart: "لا يمكن أن ينتهي قبل أن يبدأ",
        needTable: "اكتب النقاط لكل مركز",
      },
      toast: {
        created: "تم إنشاء {name}",
        saved: "تم حفظ {name}",
        deleted: "تم حذف {name}",
        linked: { zero: "لم تُضف أي جولة إلى {name}", one: "أُضيفت جولة واحدة إلى {name}", two: "أُضيفت جولتان إلى {name}", few: "أُضيفت {count} جولات إلى {name}", many: "أُضيفت {count} جولة إلى {name}", other: "أُضيفت {count} جولة إلى {name}" },
      },
      csv: {
        place: "المركز",
        player: "اللاعب",
        points: "النقاط",
        played: "لعب",
        wins: "الفوز",
        knockouts: "الإقصاءات",
        net: "الصافي",
      },
    },
    report: {
      cash: {
        summary: "{stakes}{played} · إجمالي الدخول {bank}",
        stillPlaying: "ما زال يلعب (دخل بـ {in})",
        rakeBox: "صندوق العمولة: {amount}، إلى {house}",
        seatFee: "رسوم المقعد: {amount} لكل لاعب، إلى {house}",
        settleUp: "تسوية الحسابات:",
        bombPots: { one: "بومب بوت واحد", two: "بومب بوت مرتان", few: "{count} بومب بوت", other: "{count} بومب بوت" },
        sevenTwo: "فازوا بـ 7-2: {list}",
        highHand: "أعلى يد: {name}، {hand}، {amount} (دفعها {house})",
        settleLine: "{from} يدفع لـ {to} {amount}{where}",
        bankOff: "(هناك فرق قدره {amount} في الحساب.)",
        costs: "التكاليف: {list}",
        paidTag: "مدفوع",
      },
      tourney: {
        entrants: { one: "لاعب واحد", other: "{n} لاعب" },
        buyIn: "قيمة دخول {amount}",
        rebuys: { one: "إعادة دخول واحدة", other: "{n} إعادة دخول" },
        addOns: { one: "إضافة رقائق واحدة", other: "{n} إضافة رقائق" },
        pool: "البوت {amount}",
        rakeKept: "(احتفظت الجهة المنظمة بـ {amount})",
        endedAt: "{duration}، وانتهت عند {stakes}",
        stillIn: "مستمر",
        seat: "مقعد ({amount})",
        kos: { one: "إقصاء واحد", other: "{n} إقصاء" },
        stillPlayingNote: "(البطولة ما زالت مستمرة.)",
      },
      csv: {
        date: "التاريخ",
        game: "الجولة",
        player: "اللاعب",
        boughtIn: "الدخول",
        highHand: "أعلى يد",
        cashedOut: "الصرف",
        seatFee: "رسوم المقعد",
        net: "الصافي",
        satDown: "وقت الجلوس",
        left: "وقت المغادرة",
        place: "المركز",
        rebuys: "إعادات الدخول",
        addOns: "إضافات الرقائق",
        paidIn: "المبلغ المدفوع",
        won: "المبلغ المكسوب",
        knockouts: "الإقصاءات",
        busted: "خرج من اللعبة",
        costs: "تكاليف مشتركة",
      },
    },
  },
  bn: {
    page: {
      title: "খেলোয়াড়",
      subtitle:
        "শেষ হওয়া টুর্নামেন্ট এবং যেসব ক্যাশ খেলোয়াড় ক্যাশ আউট করেছেন তাদের ফলাফল এখানে দেখা যায়। সব গেমে নাম একইভাবে লিখুন, যাতে সেগুলো মিলে যায়।",
      spreadsheetButton: "স্প্রেডশিট",
      filter: {
        periodLabel: "সময়কাল",
        typeLabel: "গেমের ধরন",
        allGames: "সব গেম",
        cash: "ক্যাশ",
        tournaments: "টুর্নামেন্ট",
      },
      stats: {
        summary: "{games} · {players} · মোট বাই-ইন {amount}",
        games: { one: "{n}টি গেম", other: "{n}টি গেম" },
        players: { one: "{n} জন খেলোয়াড়", other: "{n} জন খেলোয়াড়" },
      },
      table: {
        player: "খেলোয়াড়",
        games: "গেম",
        net: "নেট",
        cash: "ক্যাশ",
        perHour: "প্রতি ঘণ্টা",
        tournaments: "টুর্নামেন্ট",
        wins: "জয়",
        itm: "ITM",
        kos: "নকআউট",
        best: "সেরা ফলাফল",
        last: "সর্বশেষ খেলা",
      },
      history: {
        typeCash: "ক্যাশ",
        typeTournament: "টুর্নামেন্ট",
        place: "{entrants} জনের মধ্যে {place}",
        kos: { one: "{n} নকআউট", other: "{n} নকআউট" },
        cashInOut: "বাই-ইন {in}, ক্যাশ আউট {out}",
        hoursSuffix: "{h} ঘণ্টা",
        worst: "সবচেয়ে খারাপ ফলাফল {amount}",
        cashHours: "ক্যাশ গেমে {h} ঘণ্টা",
        cashedTournaments: "{tournaments}-এর মধ্যে {itm} বার পুরস্কার জিতেছেন",
        tournamentsCount: { one: "{n}টি টুর্নামেন্ট", other: "{n}টি টুর্নামেন্ট" },
        highHand: "হাই হ্যান্ড {amount}",
        sevenTwo: { one: "{count}বার 7-2 জয়", other: "{count}বার 7-2 জয়" },
      },
      payHandles: {
        label: "যেভাবে পেমেন্ট পাবেন",
        ariaLabel: "{name}-এর {app}",
      },
      owed: {
        heading: "বাকি",
        note: "শেষ হওয়া গেমের না-মেটানো হিসাব, প্রতি জোড়ার মধ্যে কাটাকাটি করে।",
        line: "{from}-এর কাছে {to} পাবেন",
        markPaid: "{from} {to}-কে দিয়েছেন বলে চিহ্ন দিন",
      },
      toast: {
        csvDownloaded: "স্প্রেডশিট ডাউনলোড হয়েছে",
        handleSaved: "{name}-এর {app} সংরক্ষণ করা হয়েছে",
        handleCleared: "{name}-এর {app} মুছে ফেলা হয়েছে",
        markedPaid: "{from} {to}-কে {amount} দিয়েছেন",
      },
      empty: {
        default:
          "এখনো কোনো ফলাফল নেই। কোনো টুর্নামেন্টের বিজয়ী ঠিক হলে বা কোনো ক্যাশ খেলোয়াড় ক্যাশ আউট করলে তা এখানে দেখা যাবে।",
        filtered:
          "এই ফিল্টারে এখনো কোনো ফলাফল নেই। কোনো টুর্নামেন্টের বিজয়ী ঠিক হলে বা কোনো ক্যাশ খেলোয়াড় ক্যাশ আউট করলে তা এখানে দেখা যাবে।",
        backLink: "গেম তালিকায় ফিরে যান",
      },
      csv: {
        player: "খেলোয়াড়",
        games: "গেম",
        net: "নেট",
        cashNet: "ক্যাশ নেট",
        tourneyNet: "টুর্নামেন্ট নেট",
        tournaments: "টুর্নামেন্ট",
        wins: "জয়",
        itm: "পুরস্কার জিতেছেন",
        knockouts: "নকআউট",
        best: "সেরা ফলাফল",
        worst: "সবচেয়ে খারাপ ফলাফল",
        cashHours: "ক্যাশ গেমের ঘণ্টা",
        perHour: "প্রতি ঘণ্টা",
        last: "সর্বশেষ খেলা",
      },
    },
    leagues: {
      tabBoard: "লিডারবোর্ড",
      tabLeagues: "লিগ",
      viewLabel: "দেখুন",
      pickAria: "লিগ",
      new: "নতুন লিগ",
      edit: "লিগ সম্পাদনা",
      defaultName: "{year} সিজন",
      dates: "{start} থেকে {end}",
      from: "{start} থেকে",
      gamesCount: { one: "{count}টি গেম", other: "{count}টি গেম" },
      strays: { one: "এই তারিখগুলোর {count}টি শেষ হওয়া গেম কোনো লিগে নেই।", other: "এই তারিখগুলোর {count}টি শেষ হওয়া গেম কোনো লিগে নেই।" },
      addThem: "এগুলো যোগ করুন",
      byGame: "গেম ধরে ধরে",
      byGameNote: "প্রতিটি গেমে প্রত্যেক খেলোয়াড়ের পয়েন্ট। স্থান দেখতে কোনো সংখ্যার ওপর হোভার করুন।",
      byGameNoteBest: "প্রতিটি গেমে প্রত্যেক খেলোয়াড়ের পয়েন্ট। কেটে দেওয়া স্কোর তাদের সেরাগুলোর মধ্যে নেই, তাই গোনা হয় না।",
      gameCol: "গেম {n}",
      noGames: "এই লিগে এখনো কোনো শেষ হওয়া গেম নেই। গেম শুরু করার সময় বা গেমের পেজে এটা বেছে নিন।",
      none: "এখনো কোনো লিগ নেই। লিগ একটা সিজনের গেমগুলোকে পয়েন্টের দৌড় হিসেবে গোনে।",
      table: {
        points: "পয়েন্ট",
        played: "খেলেছে",
      },
      scoring: {
        table: "স্থান অনুযায়ী পয়েন্ট: {table}",
        beaten: "হারানো প্রতি খেলোয়াড়ে এক পয়েন্ট",
        root: "বড় গেমে বেশি পয়েন্ট",
        play: "খেলার জন্য {n}",
        ko: "প্রতি নকআউটে {n}",
        bestOf: "সেরা {n}টি গোনা হয়",
      },
      form: {
        name: "নাম",
        start: "শুরু",
        end: "শেষ (ঐচ্ছিক)",
        counts: "গোনা হয়:",
        points: "পয়েন্ট",
        kindTable: "স্থান অনুযায়ী, টেবিল থেকে",
        kindBeaten: "হারানো প্রতি খেলোয়াড়ে এক",
        kindRoot: "বড় গেমে বেশি পয়েন্ট",
        table: "প্রথম, দ্বিতীয়, তৃতীয়ের পয়েন্ট…",
        hint: {
          table: "টেবিলের শেষের পরের স্থানগুলো কোনো পয়েন্ট পায় না।",
          beaten: "প্রত্যেকে তার পেছনে শেষ করা প্রতিটি খেলোয়াড়ের জন্য এক পয়েন্ট পায়, সঙ্গে আরও এক।",
          root: "10 × √(খেলোয়াড় ÷ স্থান), তাই বড় গেম জেতার মূল্য বেশি।",
        },
        sample: "10 জন খেলোয়াড়ে: প্রথম {first}, দ্বিতীয় {second}, শেষ {last}।",
        play: "খেলার পয়েন্ট",
        ko: "প্রতি নকআউটের পয়েন্ট",
        bestOf: "সেরা কয়টি (0 = সব গেম)",
        cashNote: "ক্যাশ গেমে সবাইকে সেই রাতে জেতা টাকার হিসেবে সাজানো হয়।",
        bestOfNote: "সেরা কয়টি প্রত্যেক খেলোয়াড়ের সবচেয়ে ভালো স্কোরগুলো রাখে, বাকিগুলো বাদ দেয়।",
        create: "লিগ তৈরি করুন",
        delete: "লিগ মুছুন",
        confirmDelete: "{name} মুছবেন? এর গেমগুলো থাকবে, শুধু কোনো লিগে থাকবে না।",
        needNameStart: "একটা নাম আর শুরুর তারিখ দিন",
        needType: "অন্তত এক ধরনের গেম বেছে নিন",
        endBeforeStart: "শুরুর আগে শেষ হতে পারে না",
        needTable: "প্রতিটি স্থানের পয়েন্ট লিখুন",
      },
      toast: {
        created: "{name} তৈরি হয়েছে",
        saved: "{name} সেভ হয়েছে",
        deleted: "{name} মুছে ফেলা হয়েছে",
        linked: { one: "{name}-এ {count}টি গেম যোগ হয়েছে", other: "{name}-এ {count}টি গেম যোগ হয়েছে" },
      },
      csv: {
        place: "স্থান",
        player: "খেলোয়াড়",
        points: "পয়েন্ট",
        played: "খেলেছে",
        wins: "জয়",
        knockouts: "নকআউট",
        net: "নেট",
      },
    },
    report: {
      cash: {
        summary: "{stakes}{played} · মোট বাই-ইন {bank}",
        stillPlaying: "এখনো খেলছেন ({in} বাই-ইন করেছেন)",
        rakeBox: "রেক বক্স: {amount}, {house}-কে দেওয়া",
        seatFee: "সিট ফি: প্রতি খেলোয়াড় {amount}, {house}-কে দেওয়া",
        settleUp: "হিসাব মেটানো:",
        bombPots: { one: "{count}টি বম্ব পট", other: "{count}টি বম্ব পট" },
        sevenTwo: "7-2 দিয়ে জিতেছেন: {list}",
        highHand: "হাই হ্যান্ড: {name}, {hand}, {amount} ({house} দিয়েছে)",
        settleLine: "{from}, {to}-কে {amount} দেবেন{where}",
        bankOff: "(হিসাবে {amount} গরমিল আছে।)",
        costs: "খরচ: {list}",
        paidTag: "দেওয়া হয়েছে",
      },
      tourney: {
        entrants: { one: "{n} জন খেলোয়াড়", other: "{n} জন খেলোয়াড়" },
        buyIn: "বাই-ইন {amount}",
        rebuys: { one: "{n} রিবাই", other: "{n} রিবাই" },
        addOns: { one: "{n} অ্যাড-অন", other: "{n} অ্যাড-অন" },
        pool: "পট {amount}",
        rakeKept: "(আয়োজক {amount} রেখেছেন)",
        endedAt: "{duration}, শেষ হয়েছে {stakes}-এ",
        stillIn: "চলছে",
        seat: "সিট ({amount})",
        kos: { one: "{n} নকআউট", other: "{n} নকআউট" },
        stillPlayingNote: "(এখনো চলছে।)",
      },
      csv: {
        date: "তারিখ",
        game: "গেম",
        player: "খেলোয়াড়",
        boughtIn: "বাই-ইন",
        highHand: "হাই হ্যান্ড",
        cashedOut: "ক্যাশ আউট",
        seatFee: "সিট ফি",
        net: "নেট",
        satDown: "বসেছেন",
        left: "ছেড়েছেন",
        place: "স্থান",
        rebuys: "রিবাই",
        addOns: "অ্যাড-অন",
        paidIn: "জমা করেছেন",
        won: "জিতেছেন",
        knockouts: "নকআউট",
        busted: "আউট হয়েছেন",
        costs: "ভাগের খরচ",
      },
    },
  },
  pt: {
    page: {
      title: "Jogadores",
      subtitle:
        "Resultados de torneios encerrados e de jogadores de cash que já sacaram aparecem aqui. Os nomes precisam bater entre as partidas, então escreva sempre do mesmo jeito.",
      spreadsheetButton: "Planilha",
      filter: {
        periodLabel: "Período",
        typeLabel: "Tipo de Partida",
        allGames: "Todas as Partidas",
        cash: "Cash",
        tournaments: "Torneios",
      },
      stats: {
        summary: "{games} · {players} · {amount} em buy-ins",
        games: { one: "{n} partida", other: "{n} partidas" },
        players: { one: "{n} jogador", other: "{n} jogadores" },
      },
      table: {
        player: "Jogador",
        games: "Partidas",
        net: "Saldo",
        cash: "Cash",
        perHour: "Por Hora",
        tournaments: "Torneios",
        wins: "Vitórias",
        itm: "ITM",
        kos: "KOs",
        best: "Melhor Resultado",
        last: "Última Vez",
      },
      history: {
        typeCash: "Cash",
        typeTournament: "Torneio",
        place: "{place} de {entrants}",
        kos: { one: "{n} KO", other: "{n} KOs" },
        cashInOut: "entrou com {in}, saiu com {out}",
        hoursSuffix: "{h}h",
        worst: "Pior resultado {amount}",
        cashHours: "{h} horas em cash",
        cashedTournaments: "Premiado em {itm} de {tournaments}",
        tournamentsCount: { one: "{n} torneio", other: "{n} torneios" },
        highHand: "mão mais alta {amount}",
        sevenTwo: { one: "{count} vitória com 7-2", other: "{count} vitórias com 7-2" },
      },
      payHandles: {
        label: "Recebe Pagamento Em",
        ariaLabel: "{app} de {name}",
      },
      owed: {
        heading: "Dívidas",
        note: "Acertos não pagos de jogos terminados, compensados entre cada par.",
        line: "{from} deve a {to}",
        markPaid: "Marcar que {from} pagou {to}",
      },
      toast: {
        csvDownloaded: "Planilha baixada",
        handleSaved: "{app} de {name} salvo",
        handleCleared: "{app} de {name} apagado",
        markedPaid: "{from} pagou {to} {amount}",
      },
      empty: {
        default:
          "Ainda não há resultados. Eles aparecem aqui assim que um torneio tiver um vencedor ou um jogador de cash sacar.",
        filtered:
          "Ainda não há resultados para este filtro. Eles aparecem aqui assim que um torneio tiver um vencedor ou um jogador de cash sacar.",
        backLink: "Voltar para as Partidas",
      },
      csv: {
        player: "Jogador",
        games: "Partidas",
        net: "Saldo",
        cashNet: "Saldo em Cash",
        tourneyNet: "Saldo em Torneios",
        tournaments: "Torneios",
        wins: "Vitórias",
        itm: "Premiado",
        knockouts: "Eliminações",
        best: "Melhor Resultado",
        worst: "Pior Resultado",
        cashHours: "Horas de Cash",
        perHour: "Por Hora",
        last: "Última Vez",
      },
    },
    leagues: {
      tabBoard: "Classificação",
      tabLeagues: "Ligas",
      viewLabel: "Ver",
      pickAria: "Liga",
      new: "Nova Liga",
      edit: "Editar Liga",
      defaultName: "Temporada {year}",
      dates: "{start} a {end}",
      from: "Desde {start}",
      gamesCount: { one: "{count} partida", other: "{count} partidas" },
      strays: { one: "{count} partida terminada nessas datas não está em nenhuma liga.", other: "{count} partidas terminadas nessas datas não estão em nenhuma liga." },
      addThem: "Adicionar Todas",
      byGame: "Partida a Partida",
      byGameNote: "Os pontos de cada jogador em cada partida. Passe o mouse sobre um número para ver a posição.",
      byGameNoteBest: "Os pontos de cada jogador em cada partida. Uma pontuação riscada não está entre as melhores dele, então não conta.",
      gameCol: "P{n}",
      noGames: "Ainda não há partidas terminadas nesta liga. Escolha-a ao começar uma partida ou na página de uma partida.",
      none: "Ainda não há ligas. Uma liga pontua uma temporada de partidas como uma corrida por pontos.",
      table: {
        points: "Pontos",
        played: "Jogadas",
      },
      scoring: {
        table: "Pontos por posição: {table}",
        beaten: "Um ponto por jogador superado",
        root: "Mais jogadores, mais pontos",
        play: "{n} por jogar",
        ko: "{n} por eliminação",
        bestOf: "Contam as {n} melhores",
      },
      form: {
        name: "Nome",
        start: "Início",
        end: "Fim (Opcional)",
        counts: "Conta:",
        points: "Pontos",
        kindTable: "Por Posição, de uma Tabela",
        kindBeaten: "Um por Jogador Superado",
        kindRoot: "Mais Jogadores, Mais Pontos",
        table: "Pontos para 1º, 2º, 3º…",
        hint: {
          table: "Posições além do fim da tabela não pontuam.",
          beaten: "Cada um ganha um ponto por jogador que terminou atrás dele, mais um.",
          root: "10 × √(jogadores ÷ posição), então ganhar uma partida grande vale mais.",
        },
        sample: "Com 10 jogadores: 1º {first}, 2º {second}, último {last}.",
        play: "Pontos por Jogar",
        ko: "Pontos por Eliminação",
        bestOf: "Melhores (0 = Todas as Partidas)",
        cashNote: "Nos jogos a dinheiro, todos são ordenados pelo que ganharam naquela noite.",
        bestOfNote: "Melhores guarda as maiores pontuações de cada jogador e descarta o resto.",
        create: "Criar Liga",
        delete: "Excluir Liga",
        confirmDelete: "Excluir {name}? As partidas continuam, só que fora de uma liga.",
        needNameStart: "Dê um nome e uma data de início",
        needType: "Escolha pelo menos um tipo de partida",
        endBeforeStart: "Não pode terminar antes de começar",
        needTable: "Digite os pontos de cada posição",
      },
      toast: {
        created: "{name} criada",
        saved: "{name} salva",
        deleted: "{name} excluída",
        linked: { one: "{count} partida adicionada a {name}", other: "{count} partidas adicionadas a {name}" },
      },
      csv: {
        place: "Posição",
        player: "Jogador",
        points: "Pontos",
        played: "Jogadas",
        wins: "Vitórias",
        knockouts: "Eliminações",
        net: "Saldo",
      },
    },
    report: {
      cash: {
        summary: "{stakes}{played} · {bank} em buy-ins",
        stillPlaying: "ainda jogando ({in} na mesa)",
        rakeBox: "Caixa de rake: {amount}, para {house}",
        seatFee: "Taxa de mesa: {amount} por jogador, para {house}",
        settleUp: "Acertar as contas:",
        bombPots: { one: "{count} bomb pot", other: "{count} bomb pots" },
        sevenTwo: "Ganharam com 7-2: {list}",
        highHand: "Mão mais alta: {name}, {hand}, {amount} (pago por {house})",
        settleLine: "{from} paga {amount} para {to}{where}",
        bankOff: "(O caixa está com uma diferença de {amount}.)",
        costs: "Custos: {list}",
        paidTag: "pago",
      },
      tourney: {
        entrants: { one: "{n} jogador", other: "{n} jogadores" },
        buyIn: "buy-in de {amount}",
        rebuys: { one: "{n} rebuy", other: "{n} rebuys" },
        addOns: { one: "{n} add-on", other: "{n} add-ons" },
        pool: "pote de {amount}",
        rakeKept: "(a casa ficou com {amount})",
        endedAt: "{duration}, terminou em {stakes}",
        stillIn: "em jogo",
        seat: "Vaga ({amount})",
        kos: { one: "{n} KO", other: "{n} KOs" },
        stillPlayingNote: "(Ainda em jogo.)",
      },
      csv: {
        date: "Data",
        game: "Partida",
        player: "Jogador",
        boughtIn: "Buy-in",
        highHand: "Mão mais alta",
        cashedOut: "Sacado",
        seatFee: "Taxa de Mesa",
        net: "Saldo",
        satDown: "Sentou",
        left: "Saiu",
        place: "Posição",
        rebuys: "Rebuys",
        addOns: "Add-Ons",
        paidIn: "Investido",
        won: "Ganhou",
        knockouts: "Eliminações",
        busted: "Eliminado",
        costs: "Custos Divididos",
      },
    },
  },
};

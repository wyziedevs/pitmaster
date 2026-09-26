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
    };
    payHandles: {
      label: string;
      ariaLabel: string;
    };
    toast: {
      csvDownloaded: string;
      handleSaved: string;
      handleCleared: string;
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
  report: {
    cash: {
      summary: string;
      stillPlaying: string;
      rakeBox: string;
      seatFee: string;
      settleUp: string;
      settleLine: string;
      bankOff: string;
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
      kos: PluralText;
      stillPlayingNote: string;
    };
    csv: {
      date: string;
      game: string;
      player: string;
      boughtIn: string;
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
      },
      payHandles: {
        label: "Gets Paid On",
        ariaLabel: "{name}'s {app}",
      },
      toast: {
        csvDownloaded: "Spreadsheet downloaded",
        handleSaved: "Saved {name}'s {app}",
        handleCleared: "Cleared {name}'s {app}",
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
    report: {
      cash: {
        summary: "{stakes}{played} · {bank} bought in",
        stillPlaying: "still playing ({in} in)",
        rakeBox: "Rake box: {amount}, to {house}",
        seatFee: "Seat fee: {amount} a player, to {house}",
        settleUp: "Settle up:",
        settleLine: "{from} pays {to} {amount}{where}",
        bankOff: "(The bank is off by {amount}.)",
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
        kos: { one: "{n} KO", other: "{n} KOs" },
        stillPlayingNote: "(Still playing.)",
      },
      csv: {
        date: "Date",
        game: "Game",
        player: "Player",
        boughtIn: "Bought In",
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
      },
      payHandles: {
        label: "收款方式",
        ariaLabel: "{name} 的 {app}",
      },
      toast: {
        csvDownloaded: "表格已下载",
        handleSaved: "已保存 {name} 的 {app}",
        handleCleared: "已清除 {name} 的 {app}",
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
    report: {
      cash: {
        summary: "{stakes}{played} · 共买入 {bank}",
        stillPlaying: "仍在进行中（已买入 {in}）",
        rakeBox: "抽水箱：{amount}，归 {house}",
        seatFee: "座位费：每人 {amount}，归 {house}",
        settleUp: "结算：",
        settleLine: "{from} 付给 {to} {amount}{where}",
        bankOff: "（账目有 {amount} 的误差。）",
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
        kos: { one: "{n} 次淘汰", other: "{n} 次淘汰" },
        stillPlayingNote: "（比赛仍在进行。）",
      },
      csv: {
        date: "日期",
        game: "比赛",
        player: "选手",
        boughtIn: "买入",
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
      },
      payHandles: {
        label: "भुगतान कहाँ मिलेगा",
        ariaLabel: "{name} का {app}",
      },
      toast: {
        csvDownloaded: "स्प्रेडशीट डाउनलोड हो गई",
        handleSaved: "{name} का {app} सहेजा गया",
        handleCleared: "{name} का {app} हटाया गया",
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
    report: {
      cash: {
        summary: "{stakes}{played} · कुल बाय-इन {bank}",
        stillPlaying: "अभी खेल रहे हैं ({in} लगाए)",
        rakeBox: "रेक बॉक्स: {amount}, {house} के लिए",
        seatFee: "सीट फीस: प्रति खिलाड़ी {amount}, {house} के लिए",
        settleUp: "हिसाब चुकाएं:",
        settleLine: "{from} ने {to} को {amount} दिए{where}",
        bankOff: "(हिसाब में {amount} का अंतर है।)",
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
        kos: { one: "{n} नॉकआउट", other: "{n} नॉकआउट" },
        stillPlayingNote: "(अभी खेल जारी है।)",
      },
      csv: {
        date: "तारीख",
        game: "गेम",
        player: "खिलाड़ी",
        boughtIn: "बाय-इन",
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
      },
      payHandles: {
        label: "Recibe Pagos En",
        ariaLabel: "{app} de {name}",
      },
      toast: {
        csvDownloaded: "Hoja de cálculo descargada",
        handleSaved: "Se guardó el {app} de {name}",
        handleCleared: "Se borró el {app} de {name}",
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
    report: {
      cash: {
        summary: "{stakes}{played} · {bank} en buy-ins",
        stillPlaying: "sigue jugando ({in} en juego)",
        rakeBox: "Caja de rake: {amount}, para {house}",
        seatFee: "Cuota de mesa: {amount} por jugador, para {house}",
        settleUp: "Saldar cuentas:",
        settleLine: "{from} le paga a {to} {amount}{where}",
        bankOff: "(La caja tiene una diferencia de {amount}.)",
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
        kos: { one: "{n} KO", other: "{n} KOs" },
        stillPlayingNote: "(Todavía en juego.)",
      },
      csv: {
        date: "Fecha",
        game: "Partida",
        player: "Jugador",
        boughtIn: "Buy-in",
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
      },
      payHandles: {
        label: "Reçoit les Paiements Sur",
        ariaLabel: "{app} de {name}",
      },
      toast: {
        csvDownloaded: "Feuille de calcul téléchargée",
        handleSaved: "{app} de {name} enregistré",
        handleCleared: "{app} de {name} effacé",
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
    report: {
      cash: {
        summary: "{stakes}{played} · {bank} de buy-ins",
        stillPlaying: "en cours ({in} engagés)",
        rakeBox: "Boîte de rake : {amount}, pour {house}",
        seatFee: "Frais de table : {amount} par joueur, pour {house}",
        settleUp: "Régler les comptes :",
        settleLine: "{from} paie {amount} à {to}{where}",
        bankOff: "(La caisse a un écart de {amount}.)",
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
        kos: { one: "{n} KO", other: "{n} KO" },
        stillPlayingNote: "(Toujours en cours.)",
      },
      csv: {
        date: "Date",
        game: "Partie",
        player: "Joueur",
        boughtIn: "Buy-in",
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
      },
      payHandles: {
        label: "يستلم الدفعات على",
        ariaLabel: "{app} الخاص بـ {name}",
      },
      toast: {
        csvDownloaded: "تم تنزيل جدول البيانات",
        handleSaved: "تم حفظ {app} الخاص بـ {name}",
        handleCleared: "تم مسح {app} الخاص بـ {name}",
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
    report: {
      cash: {
        summary: "{stakes}{played} · إجمالي الدخول {bank}",
        stillPlaying: "ما زال يلعب (دخل بـ {in})",
        rakeBox: "صندوق العمولة: {amount}، إلى {house}",
        seatFee: "رسوم المقعد: {amount} لكل لاعب، إلى {house}",
        settleUp: "تسوية الحسابات:",
        settleLine: "{from} يدفع لـ {to} {amount}{where}",
        bankOff: "(هناك فرق قدره {amount} في الحساب.)",
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
        kos: { one: "إقصاء واحد", other: "{n} إقصاء" },
        stillPlayingNote: "(البطولة ما زالت مستمرة.)",
      },
      csv: {
        date: "التاريخ",
        game: "الجولة",
        player: "اللاعب",
        boughtIn: "الدخول",
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
      },
      payHandles: {
        label: "যেভাবে পেমেন্ট পাবেন",
        ariaLabel: "{name}-এর {app}",
      },
      toast: {
        csvDownloaded: "স্প্রেডশিট ডাউনলোড হয়েছে",
        handleSaved: "{name}-এর {app} সংরক্ষণ করা হয়েছে",
        handleCleared: "{name}-এর {app} মুছে ফেলা হয়েছে",
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
    report: {
      cash: {
        summary: "{stakes}{played} · মোট বাই-ইন {bank}",
        stillPlaying: "এখনো খেলছেন ({in} বাই-ইন করেছেন)",
        rakeBox: "রেক বক্স: {amount}, {house}-কে দেওয়া",
        seatFee: "সিট ফি: প্রতি খেলোয়াড় {amount}, {house}-কে দেওয়া",
        settleUp: "হিসাব মেটানো:",
        settleLine: "{from}, {to}-কে {amount} দেবেন{where}",
        bankOff: "(হিসাবে {amount} গরমিল আছে।)",
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
        kos: { one: "{n} নকআউট", other: "{n} নকআউট" },
        stillPlayingNote: "(এখনো চলছে।)",
      },
      csv: {
        date: "তারিখ",
        game: "গেম",
        player: "খেলোয়াড়",
        boughtIn: "বাই-ইন",
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
      },
      payHandles: {
        label: "Recebe Pagamento Em",
        ariaLabel: "{app} de {name}",
      },
      toast: {
        csvDownloaded: "Planilha baixada",
        handleSaved: "{app} de {name} salvo",
        handleCleared: "{app} de {name} apagado",
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
    report: {
      cash: {
        summary: "{stakes}{played} · {bank} em buy-ins",
        stillPlaying: "ainda jogando ({in} na mesa)",
        rakeBox: "Caixa de rake: {amount}, para {house}",
        seatFee: "Taxa de mesa: {amount} por jogador, para {house}",
        settleUp: "Acertar as contas:",
        settleLine: "{from} paga {amount} para {to}{where}",
        bankOff: "(O caixa está com uma diferença de {amount}.)",
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
        kos: { one: "{n} KO", other: "{n} KOs" },
        stillPlayingNote: "(Ainda em jogo.)",
      },
      csv: {
        date: "Data",
        game: "Partida",
        player: "Jogador",
        boughtIn: "Buy-in",
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
      },
    },
  },
};

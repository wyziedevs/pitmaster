// the "toys" namespace: the home page (hero, in-progress/past games, side
// panels) and the desk toys (cards, dice, roulette, the toy switcher, the
// dealing loader).
import type { Lang } from "./langs";

export interface ToysDict {
  hero: {
    title: string;
    subtitle: string;
    newCash: string;
    newTournament: string;
  };
  evict: {
    /** "Safari deletes a site's saved games after 7 days without a visit." */
    text: string;
    exportLink: string;
    /** trailing clause after the export link, starts with a separator like ", or" */
    suffix: string;
  };
  gameType: {
    cash: string;
    tournament: string;
  };
  now: {
    heading: string;
    status: {
      finished: string;
      running: string;
      paused: string;
      notStarted: string;
    };
    /** "Made {time}" */
    made: string;
    tvView: string;
    /** "Level {num} · {sb}/{bb}" */
    level: string;
    break: string;
    /** "{status} · {time} left" */
    left: string;
    /** "{time} played · {money} on the table" */
    cashStatus: string;
    empty: {
      /** "No games running. Start one above, or {link}." */
      text: string;
      importLink: string;
    };
  };
  summary: {
    /** tp: "{count} player" / "{count} players" */
    players: { one: string; other: string };
    /** "{players} · {buyIn} buy-in · pool {pool}" */
    tournament: string;
    /** "{players} · {sb}/{bb}" */
    cashBlinds: string;
    /** "{blinds} · {bank} in play" */
    inPlay: string;
  };
  past: {
    heading: string;
    playerStats: string;
    searchPlaceholder: string;
    searchAria: string;
    typeAria: string;
    allGames: string;
    cashGames: string;
    tournaments: string;
    /** "{shown} of {total}" */
    countOf: string;
    table: {
      date: string;
      game: string;
      result: string;
      setup: string;
      empty: string;
    };
    runItBack: string;
    /** "Show All {count}" */
    showAll: string;
  };
  quickStart: {
    heading: string;
    empty: string;
    /** 'Run "{name}" back, same setup, same players' */
    runBackTitle: string;
  };
  chips: {
    heading: string;
    change: string;
    count: { one: string; other: string };
  };
  players: {
    heading: string;
    allStats: string;
  };
  tools: {
    heading: string;
    calculator: string;
    commands: string;
    manageData: string;
    howItWorks: string;
  };
  /** 'Running "{name}" back' */
  toastRunningBack: string;
  /** 'Delete "{name}"? This can't be undone.' */
  confirmDeleteGame: string;

  widget: {
    next: string;
    /** "Next toy, now {name}" */
    nextAria: string;
    names: {
      cards: string;
      moneyCounter: string;
      chipSort: string;
      dice: string;
      roulette: string;
    };
  };
  cardFan: {
    groupAria: string;
    faceDown: string;
    /** "{name}, face up" */
    faceUp: string;
    /** template combining a rank and a suit, e.g. "{rank} of {suit}" */
    cardName: string;
    /** Two..Ace, low to high */
    ranks: string[];
    /** Spades, Hearts, Diamonds, Clubs */
    suits: string[];
    hint: string;
  };
  diceCup: {
    aria: string;
    hint: string;
    names: {
      snakeEyes: string;
      aceDeuce: string;
      yo: string;
      boxcars: string;
      hardFour: string;
      hardSix: string;
      hardEight: string;
      hardTen: string;
    };
  };
  rouletteWheel: {
    aria: string;
    hint: string;
  };
  dealing: {
    loading: string;
  };
}

export const toys: Record<Lang, ToysDict> = {
  en: {
    hero: {
      title: "Run Your Game.",
      subtitle: "Set your chips, blinds and buy-ins, then put the game up on the TV or any screen.",
      newCash: "New Cash Game",
      newTournament: "New Tournament",
    },
    evict: {
      text: "Safari deletes a site's saved games after 7 days without a visit.",
      exportLink: "Export a Backup",
      suffix: ", or add PitMaster to your Home Screen to keep them.",
    },
    gameType: { cash: "Cash", tournament: "Tournament" },
    now: {
      heading: "Games in Progress",
      status: { finished: "Finished", running: "Running", paused: "Paused", notStarted: "Not Started" },
      made: "Made {time}",
      tvView: "TV View",
      level: "Level {num} · {sb}/{bb}",
      break: "Break",
      left: "{status} · {time} left",
      cashStatus: "{time} played · {money} on the table",
      empty: {
        text: "No games running. Start one above, or {link}.",
        importLink: "import one from another device",
      },
    },
    summary: {
      players: { one: "{count} player", other: "{count} players" },
      tournament: "{players} · {buyIn} buy-in · pool {pool}",
      cashBlinds: "{players} · {stakes}",
      inPlay: "{blinds} · {bank} in play",
    },
    past: {
      heading: "Past Games",
      playerStats: "Player Stats",
      searchPlaceholder: "Search Games or Players",
      searchAria: "Search past games",
      typeAria: "Game type",
      allGames: "All Games",
      cashGames: "Cash Games",
      tournaments: "Tournaments",
      countOf: "{shown} of {total}",
      table: { date: "Date", game: "Game", result: "Result", setup: "Setup", empty: "No past games match." },
      runItBack: "Run It Back",
      showAll: "Show All {count}",
    },
    quickStart: {
      heading: "Quick Start",
      empty: "Templates and past games land here.",
      runBackTitle: "Run “{name}” back, same setup, same players",
    },
    chips: {
      heading: "Your Chips",
      change: "Change",
      count: { one: "{count} chip", other: "{count} chips" },
    },
    players: { heading: "Top Players", allStats: "All Stats" },
    tools: {
      heading: "Tools",
      calculator: "Calculator",
      commands: "Commands",
      manageData: "Manage Data",
      howItWorks: "How It Works",
    },
    toastRunningBack: "Running “{name}” back",
    confirmDeleteGame: "Delete “{name}”? This can't be undone.",
    widget: {
      next: "Next Toy",
      nextAria: "Next toy, now {name}",
      names: { cards: "Cards", moneyCounter: "Money Counter", chipSort: "Chip Sort", dice: "Dice", roulette: "Roulette" },
    },
    cardFan: {
      groupAria: "A hand of cards to play with",
      faceDown: "Face-down card",
      faceUp: "{name}, face up",
      cardName: "{rank} of {suit}",
      ranks: ["Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King", "Ace"],
      suits: ["Spades", "Hearts", "Diamonds", "Clubs"],
      hint: "Tap to flip, hold to shuffle.",
    },
    diceCup: {
      aria: "Dice, hold to shake and let go to roll",
      hint: "Hold to shake, let go to roll.",
      names: {
        snakeEyes: "Snake Eyes",
        aceDeuce: "Ace-Deuce",
        yo: "Yo",
        boxcars: "Boxcars",
        hardFour: "Hard Four",
        hardSix: "Hard Six",
        hardEight: "Hard Eight",
        hardTen: "Hard Ten",
      },
    },
    rouletteWheel: { aria: "Roulette wheel, flick it to spin", hint: "Flick the wheel to spin it." },
    dealing: { loading: "Loading" },
  },
  zh: {
    hero: {
      title: "掌控你的牌局。",
      subtitle: "设置好筹码、盲注和买入，然后把游戏画面投到电视或任意屏幕上。",
      newCash: "新建现金局",
      newTournament: "新建锦标赛",
    },
    evict: {
      text: "Safari 会在网站 7 天无人访问后删除其保存的游戏。",
      exportLink: "导出备份",
      suffix: "，或将 PitMaster 添加到主屏幕以保留它们。",
    },
    gameType: { cash: "现金", tournament: "锦标赛" },
    now: {
      heading: "进行中的游戏",
      status: { finished: "已结束", running: "进行中", paused: "已暂停", notStarted: "未开始" },
      made: "创建于 {time}",
      tvView: "电视视图",
      level: "级别 {num} · {sb}/{bb}",
      break: "休息",
      left: "{status} · 剩余 {time}",
      cashStatus: "已进行 {time} · 台面上 {money}",
      empty: {
        text: "没有正在进行的游戏。在上方开始一局，或{link}。",
        importLink: "从其他设备导入一局",
      },
    },
    summary: {
      players: { one: "{count} 名玩家", other: "{count} 名玩家" },
      tournament: "{players} · 买入 {buyIn} · 奖池 {pool}",
      cashBlinds: "{players} · {stakes}",
      inPlay: "{blinds} · 台面上 {bank}",
    },
    past: {
      heading: "历史游戏",
      playerStats: "玩家数据",
      searchPlaceholder: "搜索游戏或玩家",
      searchAria: "搜索历史游戏",
      typeAria: "游戏类型",
      allGames: "所有游戏",
      cashGames: "现金局",
      tournaments: "锦标赛",
      countOf: "{total} 场中的 {shown} 场",
      table: { date: "日期", game: "游戏", result: "结果", setup: "设置", empty: "没有匹配的历史游戏。" },
      runItBack: "再来一局",
      showAll: "显示全部 {count} 场",
    },
    quickStart: {
      heading: "快速开始",
      empty: "模板和历史游戏会显示在这里。",
      runBackTitle: "再玩一次「{name}」，设置相同，玩家相同",
    },
    chips: {
      heading: "你的筹码",
      change: "更改",
      count: { one: "{count} 个筹码", other: "{count} 个筹码" },
    },
    players: { heading: "顶尖玩家", allStats: "全部数据" },
    tools: {
      heading: "工具",
      calculator: "计算器",
      commands: "命令",
      manageData: "管理数据",
      howItWorks: "使用说明",
    },
    toastRunningBack: "正在重新开始「{name}」",
    confirmDeleteGame: "删除「{name}」？此操作无法撤销。",
    widget: {
      next: "下一个玩具",
      nextAria: "下一个玩具，当前为{name}",
      names: { cards: "纸牌", moneyCounter: "点钞器", chipSort: "筹码分类", dice: "骰子", roulette: "轮盘" },
    },
    cardFan: {
      groupAria: "一手可以把玩的牌",
      faceDown: "背面朝上的牌",
      faceUp: "{name}，正面朝上",
      cardName: "{suit}{rank}",
      ranks: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"],
      suits: ["黑桃", "红心", "方块", "梅花"],
      hint: "点击翻牌，长按重新洗牌。",
    },
    diceCup: {
      aria: "骰子，按住摇动，松开掷出",
      hint: "按住摇骰，松开掷出。",
      names: {
        snakeEyes: "蛇眼",
        aceDeuce: "幺二",
        yo: "十一",
        boxcars: "双六",
        hardFour: "硬四",
        hardSix: "硬六",
        hardEight: "硬八",
        hardTen: "硬十",
      },
    },
    rouletteWheel: { aria: "轮盘，轻拨即可旋转", hint: "轻拨转轮即可旋转。" },
    dealing: { loading: "加载中" },
  },
  hi: {
    hero: {
      title: "अपना गेम चलाएं।",
      subtitle: "अपने चिप्स, ब्लाइंड्स और बाय-इन सेट करें, फिर गेम को टीवी या किसी भी स्क्रीन पर दिखाएं।",
      newCash: "नया कैश गेम",
      newTournament: "नया टूर्नामेंट",
    },
    evict: {
      text: "Safari किसी साइट के 7 दिनों तक न खुलने पर उसके सहेजे गए गेम मिटा देता है।",
      exportLink: "बैकअप निर्यात करें",
      suffix: ", या उन्हें बनाए रखने के लिए PitMaster को होम स्क्रीन पर जोड़ें।",
    },
    gameType: { cash: "कैश", tournament: "टूर्नामेंट" },
    now: {
      heading: "चल रहे गेम",
      status: { finished: "समाप्त", running: "चल रहा है", paused: "रुका हुआ", notStarted: "शुरू नहीं हुआ" },
      made: "{time} बनाया गया",
      tvView: "टीवी व्यू",
      level: "स्तर {num} · {sb}/{bb}",
      break: "ब्रेक",
      left: "{status} · {time} शेष",
      cashStatus: "{time} खेला गया · टेबल पर {money}",
      empty: {
        text: "कोई गेम नहीं चल रहा। ऊपर से एक शुरू करें, या {link}।",
        importLink: "किसी अन्य डिवाइस से एक आयात करें",
      },
    },
    summary: {
      players: { one: "{count} खिलाड़ी", other: "{count} खिलाड़ी" },
      tournament: "{players} · {buyIn} बाय-इन · पूल {pool}",
      cashBlinds: "{players} · {stakes}",
      inPlay: "{blinds} · {bank} मेज़ पर",
    },
    past: {
      heading: "पिछले गेम",
      playerStats: "खिलाड़ी आंकड़े",
      searchPlaceholder: "गेम या खिलाड़ी खोजें",
      searchAria: "पिछले गेम खोजें",
      typeAria: "गेम प्रकार",
      allGames: "सभी गेम",
      cashGames: "कैश गेम",
      tournaments: "टूर्नामेंट",
      countOf: "{total} में से {shown}",
      table: { date: "तारीख", game: "गेम", result: "परिणाम", setup: "सेटअप", empty: "कोई मेल खाता पिछला गेम नहीं मिला।" },
      runItBack: "फिर से खेलें",
      showAll: "सभी {count} दिखाएं",
    },
    quickStart: {
      heading: "क्विक स्टार्ट",
      empty: "टेम्पलेट और पिछले गेम यहां दिखेंगे।",
      runBackTitle: "“{name}” फिर से खेलें, वही सेटअप, वही खिलाड़ी",
    },
    chips: {
      heading: "आपके चिप्स",
      change: "बदलें",
      count: { one: "{count} चिप", other: "{count} चिप्स" },
    },
    players: { heading: "टॉप खिलाड़ी", allStats: "सभी आंकड़े" },
    tools: {
      heading: "टूल्स",
      calculator: "कैलकुलेटर",
      commands: "कमांड",
      manageData: "डेटा प्रबंधित करें",
      howItWorks: "यह कैसे काम करता है",
    },
    toastRunningBack: "“{name}” फिर से चलाया जा रहा है",
    confirmDeleteGame: "“{name}” मिटाएं? इसे वापस नहीं लाया जा सकता।",
    widget: {
      next: "अगला खिलौना",
      nextAria: "अगला खिलौना, अभी {name}",
      names: { cards: "पत्ते", moneyCounter: "मनी काउंटर", chipSort: "चिप्स सॉर्ट", dice: "पासे", roulette: "रूलेट" },
    },
    cardFan: {
      groupAria: "खेलने के लिए ताश के पत्तों का एक हाथ",
      faceDown: "उल्टा पत्ता",
      faceUp: "{name}, खुला हुआ",
      cardName: "{suit} का {rank}",
      ranks: ["दो", "तीन", "चार", "पांच", "छह", "सात", "आठ", "नौ", "दस", "जैक", "क्वीन", "किंग", "ऐस"],
      suits: ["हुकुम", "पान", "ईंट", "चिड़ी"],
      hint: "पलटने के लिए टैप करें, फेंटने के लिए दबाए रखें।",
    },
    diceCup: {
      aria: "पासे, हिलाने के लिए दबाए रखें और फेंकने के लिए छोड़ दें",
      hint: "हिलाने के लिए दबाए रखें, फेंकने के लिए छोड़ दें।",
      names: {
        snakeEyes: "साँप की आँखें",
        aceDeuce: "एक-दो",
        yo: "ग्यारह",
        boxcars: "दोहरा छक्का",
        hardFour: "कठिन चार",
        hardSix: "कठिन छह",
        hardEight: "कठिन आठ",
        hardTen: "कठिन दस",
      },
    },
    rouletteWheel: { aria: "रूलेट व्हील, घुमाने के लिए इसे फ्लिक करें", hint: "घुमाने के लिए व्हील को फ्लिक करें।" },
    dealing: { loading: "लोड हो रहा है" },
  },
  es: {
    hero: {
      title: "Dirige tu partida.",
      subtitle: "Configura tus fichas, ciegas y buy-ins, y luego pon la partida en la TV o en cualquier pantalla.",
      newCash: "Nuevo Cash Game",
      newTournament: "Nuevo Torneo",
    },
    evict: {
      text: "Safari elimina las partidas guardadas de un sitio tras 7 días sin visitarlo.",
      exportLink: "Exportar una Copia de Seguridad",
      suffix: ", o añade PitMaster a tu pantalla de inicio para conservarlas.",
    },
    gameType: { cash: "Cash", tournament: "Torneo" },
    now: {
      heading: "Partidas en Curso",
      status: { finished: "Finalizado", running: "En Curso", paused: "Pausado", notStarted: "No Iniciado" },
      made: "Creado {time}",
      tvView: "Vista de TV",
      level: "Nivel {num} · {sb}/{bb}",
      break: "Descanso",
      left: "{status} · quedan {time}",
      cashStatus: "{time} jugados · {money} en la mesa",
      empty: {
        text: "No hay partidas en curso. Empieza una arriba, o {link}.",
        importLink: "importa una desde otro dispositivo",
      },
    },
    summary: {
      players: { one: "{count} jugador", other: "{count} jugadores" },
      tournament: "{players} · {buyIn} buy-in · bote {pool}",
      cashBlinds: "{players} · {stakes}",
      inPlay: "{blinds} · {bank} en juego",
    },
    past: {
      heading: "Partidas Anteriores",
      playerStats: "Estadísticas de Jugadores",
      searchPlaceholder: "Buscar Partidas o Jugadores",
      searchAria: "Buscar partidas anteriores",
      typeAria: "Tipo de partida",
      allGames: "Todas las Partidas",
      cashGames: "Cash Games",
      tournaments: "Torneos",
      countOf: "{shown} de {total}",
      table: { date: "Fecha", game: "Partida", result: "Resultado", setup: "Configuración", empty: "No hay partidas anteriores que coincidan." },
      runItBack: "Repetir Partida",
      showAll: "Mostrar Todas ({count})",
    },
    quickStart: {
      heading: "Inicio Rápido",
      empty: "Las plantillas y partidas anteriores aparecen aquí.",
      runBackTitle: "Repetir “{name}”, misma configuración, mismos jugadores",
    },
    chips: {
      heading: "Tus Fichas",
      change: "Cambiar",
      count: { one: "{count} ficha", other: "{count} fichas" },
    },
    players: { heading: "Mejores Jugadores", allStats: "Todas las Estadísticas" },
    tools: {
      heading: "Herramientas",
      calculator: "Calculadora",
      commands: "Comandos",
      manageData: "Administrar Datos",
      howItWorks: "Cómo Funciona",
    },
    toastRunningBack: "Repitiendo “{name}”",
    confirmDeleteGame: "¿Eliminar “{name}”? Esto no se puede deshacer.",
    widget: {
      next: "Siguiente Juguete",
      nextAria: "Siguiente juguete, ahora {name}",
      names: { cards: "Cartas", moneyCounter: "Contador de Dinero", chipSort: "Ordenar Fichas", dice: "Dados", roulette: "Ruleta" },
    },
    cardFan: {
      groupAria: "Una mano de cartas para jugar",
      faceDown: "Carta boca abajo",
      faceUp: "{name}, boca arriba",
      cardName: "{rank} de {suit}",
      ranks: ["Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve", "Diez", "Jota", "Reina", "Rey", "As"],
      suits: ["Picas", "Corazones", "Diamantes", "Tréboles"],
      hint: "Toca para voltear, mantén pulsado para barajar.",
    },
    diceCup: {
      aria: "Dados, mantén pulsado para agitar y suelta para tirar",
      hint: "Mantén pulsado para agitar, suelta para tirar.",
      names: {
        snakeEyes: "Ojos de Serpiente",
        aceDeuce: "As-Dos",
        yo: "Once",
        boxcars: "Dobles Seis",
        hardFour: "Cuatro Duro",
        hardSix: "Seis Duro",
        hardEight: "Ocho Duro",
        hardTen: "Diez Duro",
      },
    },
    rouletteWheel: { aria: "Ruleta, dale un toque para girarla", hint: "Dale un toque a la rueda para girarla." },
    dealing: { loading: "Cargando" },
  },
  fr: {
    hero: {
      title: "Gérez votre partie.",
      subtitle: "Réglez vos jetons, blinds et buy-ins, puis affichez la partie sur la télé ou tout autre écran.",
      newCash: "Nouveau Cash Game",
      newTournament: "Nouveau Tournoi",
    },
    evict: {
      text: "Safari supprime les parties enregistrées d'un site après 7 jours sans visite.",
      exportLink: "Exporter une Sauvegarde",
      suffix: ", ou ajoutez PitMaster à votre écran d'accueil pour les conserver.",
    },
    gameType: { cash: "Cash", tournament: "Tournoi" },
    now: {
      heading: "Parties en Cours",
      status: { finished: "Terminé", running: "En Cours", paused: "En Pause", notStarted: "Non Démarré" },
      made: "Créé {time}",
      tvView: "Vue TV",
      level: "Niveau {num} · {sb}/{bb}",
      break: "Pause",
      left: "{status} · {time} restantes",
      cashStatus: "{time} jouées · {money} sur la table",
      empty: {
        text: "Aucune partie en cours. Commencez-en une ci-dessus, ou {link}.",
        importLink: "importez-en une depuis un autre appareil",
      },
    },
    summary: {
      players: { one: "{count} joueur", other: "{count} joueurs" },
      tournament: "{players} · {buyIn} buy-in · pot {pool}",
      cashBlinds: "{players} · {stakes}",
      inPlay: "{blinds} · {bank} en jeu",
    },
    past: {
      heading: "Parties Précédentes",
      playerStats: "Statistiques des Joueurs",
      searchPlaceholder: "Rechercher des Parties ou des Joueurs",
      searchAria: "Rechercher les parties précédentes",
      typeAria: "Type de partie",
      allGames: "Toutes les Parties",
      cashGames: "Cash Games",
      tournaments: "Tournois",
      countOf: "{shown} sur {total}",
      table: { date: "Date", game: "Partie", result: "Résultat", setup: "Configuration", empty: "Aucune partie précédente ne correspond." },
      runItBack: "Rejouer la Partie",
      showAll: "Tout Afficher ({count})",
    },
    quickStart: {
      heading: "Démarrage Rapide",
      empty: "Les modèles et les parties précédentes apparaissent ici.",
      runBackTitle: "Rejouer « {name} », même configuration, mêmes joueurs",
    },
    chips: {
      heading: "Vos Jetons",
      change: "Modifier",
      count: { one: "{count} jeton", other: "{count} jetons" },
    },
    players: { heading: "Meilleurs Joueurs", allStats: "Toutes les Statistiques" },
    tools: {
      heading: "Outils",
      calculator: "Calculatrice",
      commands: "Commandes",
      manageData: "Gérer les Données",
      howItWorks: "Comment Ça Marche",
    },
    toastRunningBack: "Relance de « {name} »",
    confirmDeleteGame: "Supprimer « {name} » ? Cette action est irréversible.",
    widget: {
      next: "Jouet Suivant",
      nextAria: "Jouet suivant, actuellement {name}",
      names: { cards: "Cartes", moneyCounter: "Compteur d'Argent", chipSort: "Trier les Jetons", dice: "Dés", roulette: "Roulette" },
    },
    cardFan: {
      groupAria: "Une main de cartes pour s'amuser",
      faceDown: "Carte face cachée",
      faceUp: "{name}, face visible",
      cardName: "{rank} de {suit}",
      ranks: ["Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf", "Dix", "Valet", "Dame", "Roi", "As"],
      suits: ["Piques", "Cœurs", "Carreaux", "Trèfles"],
      hint: "Touchez pour retourner, maintenez pour mélanger.",
    },
    diceCup: {
      aria: "Dés, maintenez pour secouer et relâchez pour lancer",
      hint: "Maintenez pour secouer, relâchez pour lancer.",
      names: {
        snakeEyes: "Yeux de Serpent",
        aceDeuce: "As-Deux",
        yo: "Onze",
        boxcars: "Double Six",
        hardFour: "Quatre Dur",
        hardSix: "Six Dur",
        hardEight: "Huit Dur",
        hardTen: "Dix Dur",
      },
    },
    rouletteWheel: { aria: "Roulette, donnez une pichenette pour la faire tourner", hint: "Donnez une pichenette à la roue pour la faire tourner." },
    dealing: { loading: "Chargement" },
  },
  ar: {
    hero: {
      title: "أدر لعبتك.",
      subtitle: "اضبط الرقائق والرهانات العمياء وقيم الدخول، ثم اعرض اللعبة على التلفاز أو أي شاشة.",
      newCash: "لعبة نقدية جديدة",
      newTournament: "بطولة جديدة",
    },
    evict: {
      text: "يحذف Safari الألعاب المحفوظة لموقع ما بعد مرور 7 أيام دون زيارته.",
      exportLink: "تصدير نسخة احتياطية",
      suffix: "، أو أضف PitMaster إلى الشاشة الرئيسية للاحتفاظ بها.",
    },
    gameType: { cash: "نقدي", tournament: "البطولة" },
    now: {
      heading: "الألعاب الجارية",
      status: { finished: "منتهية", running: "جارية", paused: "متوقفة مؤقتا", notStarted: "لم تبدأ" },
      made: "أُنشئت {time}",
      tvView: "عرض التلفاز",
      level: "المستوى {num} · {sb}/{bb}",
      break: "استراحة",
      left: "{status} · تبقى {time}",
      cashStatus: "{time} من اللعب · {money} على الطاولة",
      empty: {
        text: "لا توجد ألعاب جارية. ابدأ واحدة أعلاه، أو {link}.",
        importLink: "استورد واحدة من جهاز آخر",
      },
    },
    summary: {
      players: { one: "لاعب واحد", other: "{count} لاعب" },
      tournament: "{players} · قيمة دخول {buyIn} · وعاء {pool}",
      cashBlinds: "{players} · {stakes}",
      inPlay: "{blinds} · {bank} على الطاولة",
    },
    past: {
      heading: "الألعاب السابقة",
      playerStats: "إحصاءات اللاعبين",
      searchPlaceholder: "البحث عن الألعاب أو اللاعبين",
      searchAria: "البحث في الألعاب السابقة",
      typeAria: "نوع اللعبة",
      allGames: "جميع الألعاب",
      cashGames: "الألعاب النقدية",
      tournaments: "البطولات",
      countOf: "{shown} من {total}",
      table: { date: "التاريخ", game: "اللعبة", result: "النتيجة", setup: "الإعداد", empty: "لا توجد ألعاب سابقة مطابقة." },
      runItBack: "أعد اللعب",
      showAll: "عرض الكل ({count})",
    },
    quickStart: {
      heading: "بدء سريع",
      empty: "تظهر القوالب والألعاب السابقة هنا.",
      runBackTitle: "أعد لعب «{name}»، نفس الإعداد، نفس اللاعبين",
    },
    chips: {
      heading: "رقائقك",
      change: "تغيير",
      count: { one: "{count} رقاقة", other: "{count} رقائق" },
    },
    players: { heading: "أفضل اللاعبين", allStats: "كل الإحصاءات" },
    tools: {
      heading: "الأدوات",
      calculator: "الآلة الحاسبة",
      commands: "الأوامر",
      manageData: "إدارة البيانات",
      howItWorks: "كيف يعمل",
    },
    toastRunningBack: "جارٍ إعادة لعب «{name}»",
    confirmDeleteGame: "حذف «{name}»؟ لا يمكن التراجع عن هذا.",
    widget: {
      next: "اللعبة التالية",
      nextAria: "اللعبة التالية، حاليا {name}",
      names: { cards: "الأوراق", moneyCounter: "عداد النقود", chipSort: "فرز الرقائق", dice: "النرد", roulette: "الروليت" },
    },
    cardFan: {
      groupAria: "مجموعة أوراق للعب",
      faceDown: "بطاقة مقلوبة",
      faceUp: "{name}، الوجه لأعلى",
      cardName: "{rank} {suit}",
      ranks: ["اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة", "الغلام", "الملكة", "الملك", "الآس"],
      suits: ["سباتي", "كوبة", "ديناري", "شبة"],
      hint: "اضغط للقلب، اضغط مطولا للخلط.",
    },
    diceCup: {
      aria: "نرد، اضغط مطولا للهز واترك للرمي",
      hint: "اضغط مطولا للهز، اترك للرمي.",
      names: {
        snakeEyes: "عيون الثعبان",
        aceDeuce: "آس-اثنان",
        yo: "أحد عشر",
        boxcars: "ستة وستة",
        hardFour: "أربعة صعبة",
        hardSix: "ستة صعبة",
        hardEight: "ثمانية صعبة",
        hardTen: "عشرة صعبة",
      },
    },
    rouletteWheel: { aria: "عجلة الروليت، ادفعها بسرعة لتدويرها", hint: "ادفع العجلة بسرعة لتدويرها." },
    dealing: { loading: "جارٍ التحميل" },
  },
  bn: {
    hero: {
      title: "আপনার গেম পরিচালনা করুন।",
      subtitle: "আপনার চিপস, ব্লাইন্ড এবং বাই-ইন সেট করুন, তারপর গেমটি টিভি বা যেকোনো স্ক্রিনে দেখান।",
      newCash: "নতুন ক্যাশ গেম",
      newTournament: "নতুন টুর্নামেন্ট",
    },
    evict: {
      text: "Safari কোনো সাইট 7 দিন না খুললে তার সংরক্ষিত গেমগুলো মুছে ফেলে।",
      exportLink: "ব্যাকআপ এক্সপোর্ট করুন",
      suffix: ", অথবা সেগুলো রাখতে PitMaster হোম স্ক্রিনে যোগ করুন।",
    },
    gameType: { cash: "ক্যাশ", tournament: "টুর্নামেন্ট" },
    now: {
      heading: "চলমান গেম",
      status: { finished: "সমাপ্ত", running: "চলমান", paused: "বিরতি দেওয়া", notStarted: "শুরু হয়নি" },
      made: "{time} তৈরি হয়েছে",
      tvView: "টিভি ভিউ",
      level: "স্তর {num} · {sb}/{bb}",
      break: "বিরতি",
      left: "{status} · {time} বাকি",
      cashStatus: "{time} খেলা হয়েছে · টেবিলে {money}",
      empty: {
        text: "কোনো গেম চলছে না। উপর থেকে একটি শুরু করুন, অথবা {link}।",
        importLink: "অন্য ডিভাইস থেকে একটি আমদানি করুন",
      },
    },
    summary: {
      players: { one: "{count} জন খেলোয়াড়", other: "{count} জন খেলোয়াড়" },
      tournament: "{players} · {buyIn} বাই-ইন · পুল {pool}",
      cashBlinds: "{players} · {stakes}",
      inPlay: "{blinds} · টেবিলে {bank}",
    },
    past: {
      heading: "পূর্ববর্তী গেম",
      playerStats: "খেলোয়াড় পরিসংখ্যান",
      searchPlaceholder: "গেম বা খেলোয়াড় খুঁজুন",
      searchAria: "পূর্ববর্তী গেম খুঁজুন",
      typeAria: "গেমের ধরন",
      allGames: "সব গেম",
      cashGames: "ক্যাশ গেম",
      tournaments: "টুর্নামেন্ট",
      countOf: "{total} এর মধ্যে {shown}",
      table: { date: "তারিখ", game: "গেম", result: "ফলাফল", setup: "সেটআপ", empty: "কোনো মিলে যাওয়া পূর্ববর্তী গেম নেই।" },
      runItBack: "আবার খেলুন",
      showAll: "সব {count}টি দেখান",
    },
    quickStart: {
      heading: "দ্রুত শুরু",
      empty: "টেমপ্লেট এবং পূর্ববর্তী গেম এখানে দেখা যাবে।",
      runBackTitle: "“{name}” আবার খেলুন, একই সেটআপ, একই খেলোয়াড়",
    },
    chips: {
      heading: "আপনার চিপস",
      change: "পরিবর্তন করুন",
      count: { one: "{count}টি চিপ", other: "{count}টি চিপস" },
    },
    players: { heading: "শীর্ষ খেলোয়াড়", allStats: "সব পরিসংখ্যান" },
    tools: {
      heading: "টুলস",
      calculator: "ক্যালকুলেটর",
      commands: "কমান্ড",
      manageData: "ডেটা পরিচালনা করুন",
      howItWorks: "এটি কীভাবে কাজ করে",
    },
    toastRunningBack: "“{name}” আবার চালু করা হচ্ছে",
    confirmDeleteGame: "“{name}” মুছে ফেলবেন? এটি ফিরিয়ে আনা যাবে না।",
    widget: {
      next: "পরবর্তী খেলনা",
      nextAria: "পরবর্তী খেলনা, বর্তমানে {name}",
      names: { cards: "তাস", moneyCounter: "মানি কাউন্টার", chipSort: "চিপস সাজানো", dice: "পাশা", roulette: "রুলেট" },
    },
    cardFan: {
      groupAria: "খেলার জন্য তাসের একটি হাত",
      faceDown: "উল্টানো তাস",
      faceUp: "{name}, মুখ উপরে",
      cardName: "{suit} এর {rank}",
      ranks: ["দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ", "জ্যাক", "কুইন", "কিং", "টেক্কা"],
      suits: ["ইস্কাপন", "হরতন", "রুইতন", "চিড়িতন"],
      hint: "উল্টাতে ট্যাপ করুন, মেশাতে চেপে ধরে রাখুন।",
    },
    diceCup: {
      aria: "পাশা, ঝাঁকাতে চেপে ধরুন এবং ছুঁড়তে ছেড়ে দিন",
      hint: "ঝাঁকাতে চেপে ধরুন, ছুঁড়তে ছেড়ে দিন।",
      names: {
        snakeEyes: "সাপের চোখ",
        aceDeuce: "টেক্কা-দুই",
        yo: "এগারো",
        boxcars: "জোড়া ছয়",
        hardFour: "কঠিন চার",
        hardSix: "কঠিন ছয়",
        hardEight: "কঠিন আট",
        hardTen: "কঠিন দশ",
      },
    },
    rouletteWheel: { aria: "রুলেট চাকা, ঘোরাতে টোকা দিন", hint: "ঘোরাতে চাকায় টোকা দিন।" },
    dealing: { loading: "লোড হচ্ছে" },
  },
  pt: {
    hero: {
      title: "Comande sua partida.",
      subtitle: "Configure suas fichas, blinds e buy-ins, depois exiba a partida na TV ou em qualquer tela.",
      newCash: "Novo Cash Game",
      newTournament: "Novo Torneio",
    },
    evict: {
      text: "O Safari exclui as partidas salvas de um site após 7 dias sem visita.",
      exportLink: "Exportar um Backup",
      suffix: ", ou adicione o PitMaster à tela de início para mantê-las.",
    },
    gameType: { cash: "Cash", tournament: "Torneio" },
    now: {
      heading: "Partidas em Andamento",
      status: { finished: "Concluído", running: "Em Andamento", paused: "Pausado", notStarted: "Não Iniciado" },
      made: "Criado {time}",
      tvView: "Visualização de TV",
      level: "Nível {num} · {sb}/{bb}",
      break: "Intervalo",
      left: "{status} · restam {time}",
      cashStatus: "{time} jogados · {money} na mesa",
      empty: {
        text: "Nenhuma partida em andamento. Comece uma acima, ou {link}.",
        importLink: "importe uma de outro dispositivo",
      },
    },
    summary: {
      players: { one: "{count} jogador", other: "{count} jogadores" },
      tournament: "{players} · {buyIn} buy-in · prêmio {pool}",
      cashBlinds: "{players} · {stakes}",
      inPlay: "{blinds} · {bank} em jogo",
    },
    past: {
      heading: "Partidas Anteriores",
      playerStats: "Estatísticas dos Jogadores",
      searchPlaceholder: "Buscar Partidas ou Jogadores",
      searchAria: "Buscar partidas anteriores",
      typeAria: "Tipo de partida",
      allGames: "Todas as Partidas",
      cashGames: "Cash Games",
      tournaments: "Torneios",
      countOf: "{shown} de {total}",
      table: { date: "Data", game: "Partida", result: "Resultado", setup: "Configuração", empty: "Nenhuma partida anterior corresponde." },
      runItBack: "Repetir Partida",
      showAll: "Mostrar Todas ({count})",
    },
    quickStart: {
      heading: "Início Rápido",
      empty: "Modelos e partidas anteriores aparecem aqui.",
      runBackTitle: "Repetir “{name}”, mesma configuração, mesmos jogadores",
    },
    chips: {
      heading: "Suas Fichas",
      change: "Alterar",
      count: { one: "{count} ficha", other: "{count} fichas" },
    },
    players: { heading: "Melhores Jogadores", allStats: "Todas as Estatísticas" },
    tools: {
      heading: "Ferramentas",
      calculator: "Calculadora",
      commands: "Comandos",
      manageData: "Gerenciar Dados",
      howItWorks: "Como Funciona",
    },
    toastRunningBack: "Repetindo “{name}”",
    confirmDeleteGame: "Excluir “{name}”? Isso não pode ser desfeito.",
    widget: {
      next: "Próximo Brinquedo",
      nextAria: "Próximo brinquedo, agora {name}",
      names: { cards: "Cartas", moneyCounter: "Contador de Dinheiro", chipSort: "Ordenar Fichas", dice: "Dados", roulette: "Roleta" },
    },
    cardFan: {
      groupAria: "Uma mão de cartas para brincar",
      faceDown: "Carta virada para baixo",
      faceUp: "{name}, virada para cima",
      cardName: "{rank} de {suit}",
      ranks: ["Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove", "Dez", "Valete", "Dama", "Rei", "Ás"],
      suits: ["Espadas", "Copas", "Ouros", "Paus"],
      hint: "Toque para virar, mantenha pressionado para embaralhar.",
    },
    diceCup: {
      aria: "Dados, mantenha pressionado para chacoalhar e solte para lançar",
      hint: "Mantenha pressionado para chacoalhar, solte para lançar.",
      names: {
        snakeEyes: "Olhos de Cobra",
        aceDeuce: "Ás-Dois",
        yo: "Onze",
        boxcars: "Duplo Seis",
        hardFour: "Quatro Difícil",
        hardSix: "Seis Difícil",
        hardEight: "Oito Difícil",
        hardTen: "Dez Difícil",
      },
    },
    rouletteWheel: { aria: "Roleta, dê um toque para girar", hint: "Dê um toque na roda para girá-la." },
    dealing: { loading: "Carregando" },
  },
};

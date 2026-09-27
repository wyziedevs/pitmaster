// the "tv" namespace: the TV / live display (the blind clock screen, the go-live
// panel on the dealer screen, and the "put a game on a screen" entry page).
import type { Lang } from "./langs";

/** a count-dependent phrase; tp() picks the right one for the language and count */
interface Plural {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

export interface TvDict {
  panel: {
    title: string;
    openWindow: string;
    dragHint: string;
    tvCodeInstructions: string; // {host}
    copyCodeTitle: string;
    copyLink: string;
    stopSharing: string;
    stopConfirm: string;
    stopServerError: string;
    localhostBefore: string; // up to the bold "localhost"
    localhostAfter: string; // {openWindow}
    goLive: string; // short form, used inline in prose
    goLiveAnyDevice: string; // the button's own label
    gettingCode: string;
    goLiveHint: string;
    howItWorks: string;
    codeError: string; // {message}
    logWentLive: string; // {code}
    logStoppedSharing: string;
    logTvMessage: string; // {text}
    messageTable: string;
    messagePlaceholder: string;
    messageAriaLabel: string;
    send: string;
    typeMessageFirst: string;
    showing: string;
    toastOnTv: string;
    toastBannerCleared: string;
    quick: {
      onBreak: string;
      lastHandBeforeBreak: string;
      shuffleUpAndDeal: string;
      seatChange: string;
      backIn5: string;
      registrationClosing: string;
    };
  };
  enterCode: {
    title: string;
    introBefore: string; // up to the bold "Go Live"
    introAfter: string; // after "Go Live"
    codeAriaLabel: string;
    typeAllChars: string; // {n}
    showIt: string;
    encryptedNote: string;
    howItWorks: string;
  };
  connect: {
    connecting: string;
    connectingLabel: string;
    live: string; // {code}
    sameComputer: string;
    tryDifferent: string;
  };
  wait: {
    title: string;
    label: string;
    locked: string;
    notHereTitle: string;
    notHereBefore: string; // up to the bold "Go Live"
    notHereMiddle: string; // between "Go Live" and the link
    notHereAfter: string; // after the link
    waitingForHost: string;
  };
  meta: {
    cashGame: string;
    tournament: string;
    buyIn: string; // {amount}
  };
  level: {
    break: string;
    levelNum: string; // {n}
    blinds: string;
    ante: string;
    anteSuffix: string; // {n} — "Ante {n}", appended after a middle dot
    blindsAfterBreak: string;
    colorUpNow: string;
    colorUp: string;
    addOnsOpen: string;
    addOnsFor: string; // the connector word between cost and chips
    nextLevel: string;
    finalLevel: string;
    nextBreak: string;
  };
  status: {
    paused: string;
    notStarted: string;
  };
  warn: {
    lastMinute: string;
    minLeft: string; // {n}, always 2+ (1 minute uses lastMinute)
  };
  tourney: {
    players: string;
    onBubble: string;
    inTheMoney: string;
    seats: string;
    avgStack: string;
    bigBlinds: Plural; // {n}
    rebuys: string;
    addOns: string;
    lateRegOpen: string; // {level}
    rebuysOpen: string; // {level}
    elapsed: string;
    prizePool: string;
    payouts: string;
    pays: string;
    topN: string; // {n}
    morePaid: Plural; // {n}
    bountyOnEveryHead: string;
    progressiveBounties: string;
    biggestBounty: string;
    mysteryFrom: string; // {n}
    envelopesLeft: Plural; // {count}
    topEnvelope: string;
  };
  cash: {
    seatedLabel: string; // {n}
    session: string;
    timeLeft: string;
    ends: string;
    lastOrbit: string;
    straddlesWelcome: string;
    bombNextHand: string;
    nextBomb: string;
    highHand: string;
    highHandOpen: string;
    sevenTwoGame: string;
    sevenTwoPays: string; // {amount}
    highHandTimesUp: string;
    buyIn: string;
    onTable: string;
    rake: string;
    upToAPot: string; // {amount}
    seatFee: string;
    openSeats: string;
  };
  winner: {
    dealMade: string;
    champion: string;
    dealBig: string;
    nobodyYet: string;
  };
  seatList: {
    table: string; // {n}
    noSeatYet: string;
  };
  rules: {
    houseRules: string;
  };
  controls: {
    enableSound: string;
    clickForSound: string;
    soundOn: string;
    fullscreen: string;
  };
  voice: {
    breakTime: Plural; // {n}
    levelBlinds: string; // {level}, {sb}, {bb}
    levelBlindsAnte: string; // {level}, {sb}, {bb}, {ante}
    minutesLeftAtBlinds: Plural; // {n}
  };
}

export const tv: Record<Lang, TvDict> = {
  en: {
    panel: {
      title: "TV",
      openWindow: "Open TV Window",
      dragHint: "Drag it to the TV (HDMI) and press",
      tvCodeInstructions: "TV code: on any screen, open {host}/live and type",
      copyCodeTitle: "Copy the Code",
      copyLink: "Copy Link",
      stopSharing: "Stop Sharing",
      stopConfirm: "Stop sharing? Screens using the code stop updating, and the copy on the server is deleted.",
      stopServerError: "Couldn't reach the server to delete its copy. It's deleted on its own two days after the last update.",
      localhostBefore: "Other devices can't open ",
      localhostAfter: ", and a TV needs https to unlock the game. Use {openWindow} here, or a deployed copy or an https tunnel.",
      goLive: "Go Live",
      goLiveAnyDevice: "Go Live (Any Device)",
      gettingCode: "Getting a Code",
      goLiveHint: "Get a code for a smart TV, a Chromecast or phones. The game is encrypted before it's sent, and only screens with the code can read it.",
      howItWorks: "How it works",
      codeError: "Couldn't get a code ({message}). Check the connection and try again.",
      logWentLive: "Went live with code {code}",
      logStoppedSharing: "Stopped sharing",
      logTvMessage: "TV message: {text}",
      messageTable: "Message the Table",
      messagePlaceholder: "Shows as a Banner on the TV",
      messageAriaLabel: "TV Message",
      send: "Send",
      typeMessageFirst: "Type a message first",
      showing: "Showing:",
      toastOnTv: "On the TV",
      toastBannerCleared: "Banner cleared",
      quick: {
        onBreak: "On Break",
        lastHandBeforeBreak: "Last Hand Before Break",
        shuffleUpAndDeal: "Shuffle Up and Deal",
        seatChange: "Seat Change",
        backIn5: "Back in 5 Minutes",
        registrationClosing: "Registration Closing Soon",
      },
    },
    enterCode: {
      title: "Put a Game on This Screen",
      introBefore: "On the computer running the game, open it and press ",
      introAfter: ". Then type the code it shows here.",
      codeAriaLabel: "TV code",
      typeAllChars: "Type all {n} characters of the code first",
      showIt: "Show It",
      encryptedNote: "The game is encrypted before it leaves that computer, and only a screen with the code can unlock it.",
      howItWorks: "How TV Codes Work",
    },
    connect: {
      connecting: "Connecting…",
      connectingLabel: "Connecting",
      live: "Live · {code}",
      sameComputer: "Same-Computer Mode",
      tryDifferent: "Try a Different Code",
    },
    wait: {
      title: "Waiting for the Game",
      label: "Waiting",
      locked: "PitMaster is locked on this computer. Unlock it where the game is running and it shows up here.",
      notHereTitle: "That Game Isn't on This Device",
      notHereBefore: "On a different device? On the computer running the game, press ",
      notHereMiddle: ", then open ",
      notHereAfter: " here and type the code.",
      waitingForHost: "Waiting for the Host",
    },
    meta: {
      cashGame: "Cash Game",
      tournament: "Tournament",
      buyIn: "{amount} Buy-In",
    },
    level: {
      break: "Break",
      levelNum: "Level {n}",
      blinds: "Blinds",
      ante: "Ante",
      anteSuffix: "Ante {n}",
      blindsAfterBreak: "Blinds After the Break",
      colorUpNow: "Color Up Now",
      colorUp: "Color Up",
      addOnsOpen: "Add-Ons Open",
      addOnsFor: "for",
      nextLevel: "Next Level",
      finalLevel: "Final Level",
      nextBreak: "Next Break",
    },
    status: {
      paused: "Paused",
      notStarted: "Not Started",
    },
    warn: {
      lastMinute: "Last Minute",
      minLeft: "{n} Min Left",
    },
    tourney: {
      players: "Players",
      onBubble: "On the Bubble",
      inTheMoney: "In the Money",
      seats: "Seats",
      avgStack: "Avg Stack",
      bigBlinds: { one: "{n} Big Blind", other: "{n} Big Blinds" },
      rebuys: "Rebuys",
      addOns: "Add-Ons",
      lateRegOpen: "Late Reg Open Through Level {level}",
      rebuysOpen: "Rebuys Open Through Level {level}",
      elapsed: "Elapsed",
      prizePool: "Prize Pool",
      payouts: "Payouts",
      pays: "Pays",
      topN: "Top {n}",
      morePaid: { one: "+ {n} More Paid", other: "+ {n} More Paid" },
      bountyOnEveryHead: "Bounty on Every Head",
      progressiveBounties: "Progressive Bounties",
      biggestBounty: "Biggest Bounty",
      mysteryFrom: "Mystery Bounties at {n} Left",
      envelopesLeft: { one: "{count} Envelope Left", other: "{count} Envelopes Left" },
      topEnvelope: "Top Prize",
    },
    cash: {
      seatedLabel: "Seated · {n}",
      session: "Session",
      timeLeft: "Time Left",
      ends: "Ends",
      lastOrbit: "Last Orbit",
      straddlesWelcome: "Straddles Welcome",
      bombNextHand: "Bomb Pot Next Hand",
      nextBomb: "Next Bomb Pot",
      highHand: "High Hand",
      highHandOpen: "Up for Grabs",
      sevenTwoGame: "7-2 Game",
      sevenTwoPays: "{amount} From Everyone",
      highHandTimesUp: "Time's Up",
      buyIn: "Buy-In",
      onTable: "On the Table",
      rake: "Rake",
      upToAPot: "Up to {amount} a Pot",
      seatFee: "Seat Fee",
      openSeats: "Open Seats",
    },
    winner: {
      dealMade: "The Final Table Made a Deal",
      champion: "Champion",
      dealBig: "It's a Deal",
      nobodyYet: "Nobody Yet",
    },
    seatList: {
      table: "Table {n}",
      noSeatYet: "No Seat Yet",
    },
    rules: {
      houseRules: "House Rules",
    },
    controls: {
      enableSound: "Enable Sound",
      clickForSound: "Click Anywhere for Sound",
      soundOn: "Sound On",
      fullscreen: "Fullscreen",
    },
    voice: {
      breakTime: { one: "Break time. {n} minute.", other: "Break time. {n} minutes." },
      levelBlinds: "Level {level}. Blinds are {sb}, {bb}.",
      levelBlindsAnte: "Level {level}. Blinds are {sb}, {bb}, with a {ante} ante.",
      minutesLeftAtBlinds: { one: "One minute left at these blinds.", other: "{n} minutes left at these blinds." },
    },
  },
  zh: {
    panel: {
      title: "电视",
      openWindow: "打开电视窗口",
      dragHint: "把它拖到电视上(HDMI),然后按",
      tvCodeInstructions: "电视代码:在任意屏幕上打开 {host}/live 并输入",
      copyCodeTitle: "复制代码",
      copyLink: "复制链接",
      stopSharing: "停止分享",
      stopConfirm: "停止分享?使用该代码的屏幕将不再更新,服务器上的副本也会被删除。",
      stopServerError: "无法连接服务器删除副本。它会在最后一次更新两天后自动删除。",
      localhostBefore: "其他设备无法打开 ",
      localhostAfter: ",而且电视需要 https 才能解锁游戏。请在这里使用{openWindow},或使用已部署的版本或 https 隧道。",
      goLive: "开始直播",
      goLiveAnyDevice: "开始直播(任意设备)",
      gettingCode: "正在获取代码",
      goLiveHint: "获取一个代码,用于智能电视、Chromecast 或手机。游戏在发送前已加密,只有拥有代码的屏幕才能读取。",
      howItWorks: "查看原理",
      codeError: "无法获取代码({message})。请检查网络连接后重试。",
      logWentLive: "已开始直播,代码 {code}",
      logStoppedSharing: "已停止分享",
      logTvMessage: "电视消息:{text}",
      messageTable: "给牌桌发消息",
      messagePlaceholder: "以横幅形式显示在电视上",
      messageAriaLabel: "电视消息",
      send: "发送",
      typeMessageFirst: "请先输入消息",
      showing: "正在显示:",
      toastOnTv: "已显示在电视上",
      toastBannerCleared: "横幅已清除",
      quick: {
        onBreak: "休息中",
        lastHandBeforeBreak: "休息前最后一手",
        shuffleUpAndDeal: "洗牌开局",
        seatChange: "换座",
        backIn5: "5 分钟后回来",
        registrationClosing: "报名即将截止",
      },
    },
    enterCode: {
      title: "把游戏放到这块屏幕上",
      introBefore: "在运行游戏的电脑上打开它,按下",
      introAfter: "。然后在这里输入它显示的代码。",
      codeAriaLabel: "电视代码",
      typeAllChars: "请先输入全部 {n} 位代码",
      showIt: "显示",
      encryptedNote: "游戏在离开那台电脑前已加密,只有拥有该代码的屏幕才能解锁。",
      howItWorks: "电视代码的原理",
    },
    connect: {
      connecting: "正在连接…",
      connectingLabel: "正在连接",
      live: "直播中 · {code}",
      sameComputer: "同机模式",
      tryDifferent: "换一个代码试试",
    },
    wait: {
      title: "正在等待游戏",
      label: "等待中",
      locked: "PitMaster 在这台电脑上已锁定。请在运行游戏的地方解锁,它就会出现在这里。",
      notHereTitle: "这个游戏不在这台设备上",
      notHereBefore: "在另一台设备上?在运行游戏的电脑上按下",
      notHereMiddle: ",然后在这里打开",
      notHereAfter: "并输入代码。",
      waitingForHost: "正在等待主持人",
    },
    meta: {
      cashGame: "现金局",
      tournament: "锦标赛",
      buyIn: "买入 {amount}",
    },
    level: {
      break: "休息",
      levelNum: "第 {n} 级",
      blinds: "盲注",
      ante: "前注",
      anteSuffix: "前注 {n}",
      blindsAfterBreak: "休息后的盲注",
      colorUpNow: "现在换筹码",
      colorUp: "换筹码",
      addOnsOpen: "补充开放中",
      addOnsFor: "换取",
      nextLevel: "下一级",
      finalLevel: "最后一级",
      nextBreak: "下次休息",
    },
    status: {
      paused: "已暂停",
      notStarted: "未开始",
    },
    warn: {
      lastMinute: "最后一分钟",
      minLeft: "剩 {n} 分钟",
    },
    tourney: {
      players: "玩家",
      onBubble: "泡沫圈",
      inTheMoney: "已进入奖金圈",
      seats: "座位",
      avgStack: "平均筹码",
      bigBlinds: { other: "{n} 个大盲" },
      rebuys: "补码次数",
      addOns: "补充次数",
      lateRegOpen: "延迟报名开放至第 {level} 级",
      rebuysOpen: "补码开放至第 {level} 级",
      elapsed: "已用时",
      prizePool: "奖池",
      payouts: "奖金分配",
      pays: "支付名次",
      topN: "前 {n} 名",
      morePaid: { other: "另有 {n} 人获奖" },
      bountyOnEveryHead: "每人都有赏金",
      progressiveBounties: "累进赏金",
      biggestBounty: "最高赏金",
      mysteryFrom: "剩 {n} 人时开神秘赏金",
      envelopesLeft: { other: "剩 {count} 个信封" },
      topEnvelope: "最大奖",
    },
    cash: {
      seatedLabel: "在座 · {n}",
      session: "已进行",
      timeLeft: "剩余时间",
      ends: "结束于",
      lastOrbit: "最后一圈",
      straddlesWelcome: "欢迎抢盲",
      bombNextHand: "下一手炸弹底池",
      nextBomb: "下次炸弹底池",
      highHand: "最大牌",
      highHandOpen: "虚位以待",
      sevenTwoGame: "7-2 玩法",
      sevenTwoPays: "每人付 {amount}",
      highHandTimesUp: "时间到",
      buyIn: "买入",
      onTable: "桌面筹码",
      rake: "抽水",
      upToAPot: "每底池最多 {amount}",
      seatFee: "座位费",
      openSeats: "空位",
    },
    winner: {
      dealMade: "决赛桌达成协议",
      champion: "冠军",
      dealBig: "已达成协议",
      nobodyYet: "暂无",
    },
    seatList: {
      table: "第 {n} 桌",
      noSeatYet: "尚未安排",
    },
    rules: {
      houseRules: "场地规则",
    },
    controls: {
      enableSound: "开启声音",
      clickForSound: "点击任意处开启声音",
      soundOn: "声音已开启",
      fullscreen: "全屏",
    },
    voice: {
      breakTime: { other: "休息时间,{n} 分钟。" },
      levelBlinds: "第 {level} 级,盲注为 {sb},{bb}。",
      levelBlindsAnte: "第 {level} 级,盲注为 {sb},{bb},前注 {ante}。",
      minutesLeftAtBlinds: { other: "本级别还剩 {n} 分钟。" },
    },
  },
  hi: {
    panel: {
      title: "टीवी",
      openWindow: "टीवी विंडो खोलें",
      dragHint: "इसे टीवी पर (HDMI से) खींचें और दबाएं",
      tvCodeInstructions: "टीवी कोड: किसी भी स्क्रीन पर {host}/live खोलें और टाइप करें",
      copyCodeTitle: "कोड कॉपी करें",
      copyLink: "लिंक कॉपी करें",
      stopSharing: "साझा करना बंद करें",
      stopConfirm: "साझा करना बंद करें? कोड इस्तेमाल करने वाली स्क्रीनें अपडेट होना बंद कर देंगी, और सर्वर पर मौजूद कॉपी मिटा दी जाएगी।",
      stopServerError: "सर्वर से कॉपी मिटाने के लिए संपर्क नहीं हो सका। यह आखिरी अपडेट के दो दिन बाद अपने आप मिट जाती है।",
      localhostBefore: "दूसरे डिवाइस ",
      localhostAfter: " नहीं खोल सकते, और गेम अनलॉक करने के लिए टीवी को https चाहिए। यहां {openWindow} का इस्तेमाल करें, या कोई डिप्लॉय की गई कॉपी या https टनल इस्तेमाल करें।",
      goLive: "लाइव जाएं",
      goLiveAnyDevice: "लाइव जाएं (किसी भी डिवाइस पर)",
      gettingCode: "कोड लिया जा रहा है",
      goLiveHint: "स्मार्ट टीवी, क्रोमकास्ट या फोन के लिए एक कोड पाएं। गेम भेजे जाने से पहले एन्क्रिप्ट किया जाता है, और सिर्फ कोड वाली स्क्रीनें ही उसे पढ़ सकती हैं।",
      howItWorks: "यह कैसे काम करता है",
      codeError: "कोड नहीं मिल सका ({message})। कनेक्शन जांचें और फिर कोशिश करें।",
      logWentLive: "कोड {code} के साथ लाइव गए",
      logStoppedSharing: "साझा करना बंद किया",
      logTvMessage: "टीवी संदेश: {text}",
      messageTable: "टेबल को संदेश भेजें",
      messagePlaceholder: "टीवी पर बैनर के रूप में दिखेगा",
      messageAriaLabel: "टीवी संदेश",
      send: "भेजें",
      typeMessageFirst: "पहले एक संदेश टाइप करें",
      showing: "दिखाया जा रहा है:",
      toastOnTv: "टीवी पर दिख रहा है",
      toastBannerCleared: "बैनर हटाया गया",
      quick: {
        onBreak: "ब्रेक पर",
        lastHandBeforeBreak: "ब्रेक से पहले आखिरी हाथ",
        shuffleUpAndDeal: "पत्ते फेंटें और बांटें",
        seatChange: "सीट बदलें",
        backIn5: "5 मिनट में वापस",
        registrationClosing: "रजिस्ट्रेशन जल्द बंद हो रहा है",
      },
    },
    enterCode: {
      title: "गेम इस स्क्रीन पर लाएं",
      introBefore: "गेम चला रहे कंप्यूटर पर इसे खोलें और ",
      introAfter: " दबाएं। फिर यहां दिखने वाला कोड टाइप करें।",
      codeAriaLabel: "टीवी कोड",
      typeAllChars: "पहले कोड के सभी {n} अक्षर टाइप करें",
      showIt: "दिखाएं",
      encryptedNote: "गेम उस कंप्यूटर से निकलने से पहले एन्क्रिप्ट हो जाता है, और सिर्फ कोड वाली स्क्रीन ही उसे अनलॉक कर सकती है।",
      howItWorks: "टीवी कोड कैसे काम करते हैं",
    },
    connect: {
      connecting: "कनेक्ट हो रहा है…",
      connectingLabel: "कनेक्ट हो रहा है",
      live: "लाइव · {code}",
      sameComputer: "सेम-कंप्यूटर मोड",
      tryDifferent: "दूसरा कोड आज़माएं",
    },
    wait: {
      title: "गेम का इंतज़ार हो रहा है",
      label: "इंतज़ार हो रहा है",
      locked: "इस कंप्यूटर पर PitMaster लॉक है। जहां गेम चल रहा है वहां इसे अनलॉक करें, यह यहां अपने आप दिख जाएगा।",
      notHereTitle: "वह गेम इस डिवाइस पर नहीं है",
      notHereBefore: "किसी दूसरे डिवाइस पर? गेम चला रहे कंप्यूटर पर",
      notHereMiddle: "दबाएं, फिर यहां",
      notHereAfter: "खोलकर कोड टाइप करें।",
      waitingForHost: "होस्ट का इंतज़ार हो रहा है",
    },
    meta: {
      cashGame: "कैश गेम",
      tournament: "टूर्नामेंट",
      buyIn: "बाय-इन {amount}",
    },
    level: {
      break: "ब्रेक",
      levelNum: "लेवल {n}",
      blinds: "ब्लाइंड्स",
      ante: "एंटी",
      anteSuffix: "एंटी {n}",
      blindsAfterBreak: "ब्रेक के बाद ब्लाइंड्स",
      colorUpNow: "अभी चिप्स बदलें",
      colorUp: "चिप्स बदलें",
      addOnsOpen: "ऐड-ऑन खुले हैं",
      addOnsFor: "के लिए",
      nextLevel: "अगला लेवल",
      finalLevel: "आखिरी लेवल",
      nextBreak: "अगला ब्रेक",
    },
    status: {
      paused: "रुका हुआ",
      notStarted: "शुरू नहीं हुआ",
    },
    warn: {
      lastMinute: "आखिरी मिनट",
      minLeft: "{n} मिनट बचे",
    },
    tourney: {
      players: "खिलाड़ी",
      onBubble: "बबल पर",
      inTheMoney: "पैसों में",
      seats: "सीटें",
      avgStack: "औसत स्टैक",
      bigBlinds: { one: "{n} बिग ब्लाइंड", other: "{n} बिग ब्लाइंड्स" },
      rebuys: "रीबाय",
      addOns: "ऐड-ऑन",
      lateRegOpen: "लेट रजिस्ट्रेशन लेवल {level} तक खुला है",
      rebuysOpen: "रीबाय लेवल {level} तक खुले हैं",
      elapsed: "बीता समय",
      prizePool: "प्राइज़ पूल",
      payouts: "पेआउट",
      pays: "भुगतान",
      topN: "टॉप {n}",
      morePaid: { one: "+ {n} और भुगतान", other: "+ {n} और भुगतान" },
      bountyOnEveryHead: "हर खिलाड़ी पर बाउंटी",
      progressiveBounties: "प्रोग्रेसिव बाउंटी",
      biggestBounty: "सबसे बड़ी बाउंटी",
      mysteryFrom: "{n} बचने पर मिस्ट्री बाउंटी",
      envelopesLeft: { one: "{count} लिफ़ाफ़ा बचा", other: "{count} लिफ़ाफ़े बचे" },
      topEnvelope: "सबसे बड़ा इनाम",
    },
    cash: {
      seatedLabel: "बैठे हुए · {n}",
      session: "सेशन",
      timeLeft: "बचा समय",
      ends: "खत्म होगा",
      lastOrbit: "आखिरी ऑर्बिट",
      straddlesWelcome: "स्ट्रैडल की अनुमति है",
      bombNextHand: "अगला हाथ बॉम्ब पॉट",
      nextBomb: "अगला बॉम्ब पॉट",
      highHand: "हाई हैंड",
      highHandOpen: "अभी खुला है",
      sevenTwoGame: "7-2 गेम",
      sevenTwoPays: "हर किसी से {amount}",
      highHandTimesUp: "समय पूरा",
      buyIn: "बाय-इन",
      onTable: "टेबल पर",
      rake: "रेक",
      upToAPot: "हर पॉट पर अधिकतम {amount}",
      seatFee: "सीट फीस",
      openSeats: "खाली सीटें",
    },
    winner: {
      dealMade: "फाइनल टेबल ने डील कर ली",
      champion: "चैंपियन",
      dealBig: "डील हो गई",
      nobodyYet: "अभी कोई नहीं",
    },
    seatList: {
      table: "टेबल {n}",
      noSeatYet: "अभी सीट नहीं",
    },
    rules: {
      houseRules: "हाउस रूल्स",
    },
    controls: {
      enableSound: "आवाज़ चालू करें",
      clickForSound: "आवाज़ के लिए कहीं भी क्लिक करें",
      soundOn: "आवाज़ चालू है",
      fullscreen: "फुलस्क्रीन",
    },
    voice: {
      breakTime: { one: "ब्रेक टाइम। {n} मिनट।", other: "ब्रेक टाइम। {n} मिनट।" },
      levelBlinds: "लेवल {level}। ब्लाइंड्स हैं {sb}, {bb}।",
      levelBlindsAnte: "लेवल {level}। ब्लाइंड्स हैं {sb}, {bb}, साथ में {ante} की एंटी।",
      minutesLeftAtBlinds: { one: "इन ब्लाइंड्स पर एक मिनट बचा है।", other: "इन ब्लाइंड्स पर {n} मिनट बचे हैं।" },
    },
  },
  es: {
    panel: {
      title: "TV",
      openWindow: "Abrir Ventana de TV",
      dragHint: "Arrástrala a la TV (HDMI) y presiona",
      tvCodeInstructions: "Código de TV: en cualquier pantalla, abre {host}/live y escribe",
      copyCodeTitle: "Copiar el Código",
      copyLink: "Copiar Enlace",
      stopSharing: "Dejar de Compartir",
      stopConfirm: "¿Dejar de compartir? Las pantallas que usan el código dejan de actualizarse, y la copia en el servidor se elimina.",
      stopServerError: "No se pudo conectar con el servidor para borrar su copia. Se borra sola dos días después de la última actualización.",
      localhostBefore: "Otros dispositivos no pueden abrir ",
      localhostAfter: ", y una TV necesita https para desbloquear el juego. Usa {openWindow} aquí, o una copia publicada o un túnel https.",
      goLive: "Salir en Vivo",
      goLiveAnyDevice: "Salir en Vivo (Cualquier Dispositivo)",
      gettingCode: "Obteniendo un Código",
      goLiveHint: "Consigue un código para una TV inteligente, un Chromecast o teléfonos. El juego se encripta antes de enviarse, y solo las pantallas con el código pueden leerlo.",
      howItWorks: "Cómo funciona",
      codeError: "No se pudo obtener un código ({message}). Revisa la conexión e inténtalo de nuevo.",
      logWentLive: "Salió en vivo con el código {code}",
      logStoppedSharing: "Dejó de compartir",
      logTvMessage: "Mensaje de TV: {text}",
      messageTable: "Enviar Mensaje a la Mesa",
      messagePlaceholder: "Se muestra como un banner en la TV",
      messageAriaLabel: "Mensaje de TV",
      send: "Enviar",
      typeMessageFirst: "Escribe un mensaje primero",
      showing: "Mostrando:",
      toastOnTv: "En la TV",
      toastBannerCleared: "Banner borrado",
      quick: {
        onBreak: "En Descanso",
        lastHandBeforeBreak: "Última Mano Antes del Descanso",
        shuffleUpAndDeal: "Barajen y Repartan",
        seatChange: "Cambio de Asiento",
        backIn5: "De Vuelta en 5 Minutos",
        registrationClosing: "Inscripción por Cerrar",
      },
    },
    enterCode: {
      title: "Pon un Juego en Esta Pantalla",
      introBefore: "En la computadora que corre el juego, ábrelo y presiona ",
      introAfter: ". Luego escribe aquí el código que muestra.",
      codeAriaLabel: "Código de TV",
      typeAllChars: "Escribe primero los {n} caracteres del código",
      showIt: "Mostrarlo",
      encryptedNote: "El juego se encripta antes de salir de esa computadora, y solo una pantalla con el código puede desbloquearlo.",
      howItWorks: "Cómo Funcionan los Códigos de TV",
    },
    connect: {
      connecting: "Conectando…",
      connectingLabel: "Conectando",
      live: "En Vivo · {code}",
      sameComputer: "Modo Misma Computadora",
      tryDifferent: "Probar Otro Código",
    },
    wait: {
      title: "Esperando el Juego",
      label: "Esperando",
      locked: "PitMaster está bloqueado en esta computadora. Desbloquéalo donde corre el juego y aparecerá aquí.",
      notHereTitle: "Ese Juego No Está en Este Dispositivo",
      notHereBefore: "¿En otro dispositivo? En la computadora que corre el juego, presiona",
      notHereMiddle: ", luego abre",
      notHereAfter: " aquí y escribe el código.",
      waitingForHost: "Esperando al Anfitrión",
    },
    meta: {
      cashGame: "Cash Game",
      tournament: "Torneo",
      buyIn: "Buy-In de {amount}",
    },
    level: {
      break: "Descanso",
      levelNum: "Nivel {n}",
      blinds: "Ciegas",
      ante: "Ante",
      anteSuffix: "Ante {n}",
      blindsAfterBreak: "Ciegas Después del Descanso",
      colorUpNow: "Cambiar Fichas Ahora",
      colorUp: "Cambiar Fichas",
      addOnsOpen: "Add-Ons Abiertos",
      addOnsFor: "por",
      nextLevel: "Próximo Nivel",
      finalLevel: "Último Nivel",
      nextBreak: "Próximo Descanso",
    },
    status: {
      paused: "Pausado",
      notStarted: "Sin Empezar",
    },
    warn: {
      lastMinute: "Último Minuto",
      minLeft: "Quedan {n} Min",
    },
    tourney: {
      players: "Jugadores",
      onBubble: "En la Burbuja",
      inTheMoney: "En los Premios",
      seats: "Asientos",
      avgStack: "Stack Promedio",
      bigBlinds: { one: "{n} Ciega Grande", other: "{n} Ciegas Grandes" },
      rebuys: "Recompras",
      addOns: "Add-Ons",
      lateRegOpen: "Inscripción Tardía Abierta Hasta el Nivel {level}",
      rebuysOpen: "Recompras Abiertas Hasta el Nivel {level}",
      elapsed: "Transcurrido",
      prizePool: "Bolsa de Premios",
      payouts: "Premios",
      pays: "Pagan",
      topN: "Top {n}",
      morePaid: { one: "+ {n} Más Pagado", other: "+ {n} Más Pagados" },
      bountyOnEveryHead: "Recompensa por Cada Cabeza",
      progressiveBounties: "Recompensas Progresivas",
      biggestBounty: "Mayor Recompensa",
      mysteryFrom: "Recompensas Misteriosas con {n} en Juego",
      envelopesLeft: { one: "Queda {count} Sobre", other: "Quedan {count} Sobres" },
      topEnvelope: "Premio Mayor",
    },
    cash: {
      seatedLabel: "Sentados · {n}",
      session: "Sesión",
      timeLeft: "Tiempo Restante",
      ends: "Termina",
      lastOrbit: "Última Vuelta",
      straddlesWelcome: "Straddles Permitidos",
      bombNextHand: "Bomb Pot la Próxima Mano",
      nextBomb: "Próximo Bomb Pot",
      highHand: "Mano Más Alta",
      highHandOpen: "Sin Dueño",
      sevenTwoGame: "Juego del 7-2",
      sevenTwoPays: "{amount} de Cada Uno",
      highHandTimesUp: "Se Acabó el Tiempo",
      buyIn: "Buy-In",
      onTable: "Sobre la Mesa",
      rake: "Rake",
      upToAPot: "Hasta {amount} por Bote",
      seatFee: "Cuota de Asiento",
      openSeats: "Asientos Libres",
    },
    winner: {
      dealMade: "La Mesa Final Hizo un Trato",
      champion: "Campeón",
      dealBig: "Hay Trato",
      nobodyYet: "Nadie Todavía",
    },
    seatList: {
      table: "Mesa {n}",
      noSeatYet: "Sin Asiento Todavía",
    },
    rules: {
      houseRules: "Reglas de la Casa",
    },
    controls: {
      enableSound: "Activar Sonido",
      clickForSound: "Haz Clic en Cualquier Lugar para el Sonido",
      soundOn: "Sonido Activado",
      fullscreen: "Pantalla Completa",
    },
    voice: {
      breakTime: { one: "Hora de descanso. {n} minuto.", other: "Hora de descanso. {n} minutos." },
      levelBlinds: "Nivel {level}. Las ciegas son {sb}, {bb}.",
      levelBlindsAnte: "Nivel {level}. Las ciegas son {sb}, {bb}, con un ante de {ante}.",
      minutesLeftAtBlinds: { one: "Queda un minuto en estas ciegas.", other: "Quedan {n} minutos en estas ciegas." },
    },
  },
  fr: {
    panel: {
      title: "TV",
      openWindow: "Ouvrir la Fenêtre TV",
      dragHint: "Glissez-la sur la TV (HDMI) et appuyez sur",
      tvCodeInstructions: "Code TV : sur n'importe quel écran, ouvrez {host}/live et tapez",
      copyCodeTitle: "Copier le Code",
      copyLink: "Copier le Lien",
      stopSharing: "Arrêter le Partage",
      stopConfirm: "Arrêter le partage ? Les écrans utilisant le code cessent de se mettre à jour, et la copie sur le serveur est supprimée.",
      stopServerError: "Impossible de joindre le serveur pour supprimer sa copie. Elle se supprime d'elle-même deux jours après la dernière mise à jour.",
      localhostBefore: "Les autres appareils ne peuvent pas ouvrir ",
      localhostAfter: ", et une TV a besoin de https pour déverrouiller la partie. Utilisez {openWindow} ici, ou une copie déployée, ou un tunnel https.",
      goLive: "Passer en Direct",
      goLiveAnyDevice: "Passer en Direct (N'importe Quel Appareil)",
      gettingCode: "Obtention d'un Code",
      goLiveHint: "Obtenez un code pour une TV connectée, un Chromecast ou des téléphones. La partie est chiffrée avant l'envoi, et seuls les écrans avec le code peuvent la lire.",
      howItWorks: "Comment ça marche",
      codeError: "Impossible d'obtenir un code ({message}). Vérifiez la connexion et réessayez.",
      logWentLive: "Passé en direct avec le code {code}",
      logStoppedSharing: "Partage arrêté",
      logTvMessage: "Message TV : {text}",
      messageTable: "Envoyer un Message à la Table",
      messagePlaceholder: "Affiché en bandeau sur la TV",
      messageAriaLabel: "Message TV",
      send: "Envoyer",
      typeMessageFirst: "Tapez d'abord un message",
      showing: "Affiché :",
      toastOnTv: "Sur la TV",
      toastBannerCleared: "Bandeau effacé",
      quick: {
        onBreak: "En Pause",
        lastHandBeforeBreak: "Dernière Main Avant la Pause",
        shuffleUpAndDeal: "Mêlez et Distribuez",
        seatChange: "Changement de Place",
        backIn5: "De Retour dans 5 Minutes",
        registrationClosing: "Inscriptions Bientôt Closes",
      },
    },
    enterCode: {
      title: "Afficher une Partie sur cet Écran",
      introBefore: "Sur l'ordinateur qui fait tourner la partie, ouvrez-la et appuyez sur ",
      introAfter: ". Puis tapez ici le code affiché.",
      codeAriaLabel: "Code TV",
      typeAllChars: "Tapez d'abord les {n} caractères du code",
      showIt: "Afficher",
      encryptedNote: "La partie est chiffrée avant de quitter cet ordinateur, et seul un écran avec le code peut la déverrouiller.",
      howItWorks: "Comment Marchent les Codes TV",
    },
    connect: {
      connecting: "Connexion…",
      connectingLabel: "Connexion",
      live: "En Direct · {code}",
      sameComputer: "Mode Même Ordinateur",
      tryDifferent: "Essayer un Autre Code",
    },
    wait: {
      title: "En Attente de la Partie",
      label: "En attente",
      locked: "PitMaster est verrouillé sur cet ordinateur. Déverrouillez-le là où la partie tourne, et elle apparaîtra ici.",
      notHereTitle: "Cette Partie N'est Pas sur cet Appareil",
      notHereBefore: "Sur un autre appareil ? Sur l'ordinateur qui fait tourner la partie, appuyez sur",
      notHereMiddle: ", puis ouvrez",
      notHereAfter: " ici et tapez le code.",
      waitingForHost: "En Attente de l'Hôte",
    },
    meta: {
      cashGame: "Cash Game",
      tournament: "Tournoi",
      buyIn: "Buy-In de {amount}",
    },
    level: {
      break: "Pause",
      levelNum: "Niveau {n}",
      blinds: "Blindes",
      ante: "Ante",
      anteSuffix: "Ante {n}",
      blindsAfterBreak: "Blindes Après la Pause",
      colorUpNow: "Changer les Jetons Maintenant",
      colorUp: "Changer les Jetons",
      addOnsOpen: "Recharges Ouvertes",
      addOnsFor: "pour",
      nextLevel: "Niveau Suivant",
      finalLevel: "Dernier Niveau",
      nextBreak: "Prochaine Pause",
    },
    status: {
      paused: "En Pause",
      notStarted: "Pas Commencé",
    },
    warn: {
      lastMinute: "Dernière Minute",
      minLeft: "{n} Min Restantes",
    },
    tourney: {
      players: "Joueurs",
      onBubble: "Sur la Bulle",
      inTheMoney: "Dans les Places Payées",
      seats: "Places",
      avgStack: "Tapis Moyen",
      bigBlinds: { one: "{n} Grosse Blinde", other: "{n} Grosses Blindes" },
      rebuys: "Recaves",
      addOns: "Recharges",
      lateRegOpen: "Inscriptions Tardives Ouvertes Jusqu'au Niveau {level}",
      rebuysOpen: "Recaves Ouvertes Jusqu'au Niveau {level}",
      elapsed: "Écoulé",
      prizePool: "Cagnotte",
      payouts: "Répartition des Gains",
      pays: "Places Payées",
      topN: "Top {n}",
      morePaid: { one: "+ {n} Autre Payé", other: "+ {n} Autres Payés" },
      bountyOnEveryHead: "Prime sur Chaque Tête",
      progressiveBounties: "Primes Progressives",
      biggestBounty: "Plus Grosse Prime",
      mysteryFrom: "Primes Mystère à {n} Restants",
      envelopesLeft: { one: "{count} Enveloppe Restante", other: "{count} Enveloppes Restantes" },
      topEnvelope: "Gros Lot",
    },
    cash: {
      seatedLabel: "Assis · {n}",
      session: "Session",
      timeLeft: "Temps Restant",
      ends: "Se Termine",
      lastOrbit: "Dernier Tour",
      straddlesWelcome: "Straddles Autorisés",
      bombNextHand: "Bomb Pot à la Prochaine Main",
      nextBomb: "Prochain Bomb Pot",
      highHand: "Meilleure Main",
      highHandOpen: "À Prendre",
      sevenTwoGame: "Jeu du 7-2",
      sevenTwoPays: "{amount} de Chacun",
      highHandTimesUp: "Temps Écoulé",
      buyIn: "Buy-In",
      onTable: "Sur la Table",
      rake: "Rake",
      upToAPot: "Jusqu'à {amount} par Pot",
      seatFee: "Frais de Place",
      openSeats: "Places Libres",
    },
    winner: {
      dealMade: "La Table Finale a Conclu un Accord",
      champion: "Champion",
      dealBig: "C'est un Accord",
      nobodyYet: "Personne Encore",
    },
    seatList: {
      table: "Table {n}",
      noSeatYet: "Pas Encore de Place",
    },
    rules: {
      houseRules: "Règles de la Maison",
    },
    controls: {
      enableSound: "Activer le Son",
      clickForSound: "Cliquez N'importe Où pour le Son",
      soundOn: "Son Activé",
      fullscreen: "Plein Écran",
    },
    voice: {
      breakTime: { one: "C'est la pause. {n} minute.", other: "C'est la pause. {n} minutes." },
      levelBlinds: "Niveau {level}. Les blindes sont {sb}, {bb}.",
      levelBlindsAnte: "Niveau {level}. Les blindes sont {sb}, {bb}, avec un ante de {ante}.",
      minutesLeftAtBlinds: { one: "Il reste une minute à ces blindes.", other: "Il reste {n} minutes à ces blindes." },
    },
  },
  ar: {
    panel: {
      title: "التلفاز",
      openWindow: "فتح نافذة التلفاز",
      dragHint: "اسحبها إلى التلفاز (HDMI) ثم اضغط",
      tvCodeInstructions: "رمز التلفاز: على أي شاشة، افتح {host}/live واكتب",
      copyCodeTitle: "نسخ الرمز",
      copyLink: "نسخ الرابط",
      stopSharing: "إيقاف المشاركة",
      stopConfirm: "إيقاف المشاركة؟ ستتوقف الشاشات التي تستخدم الرمز عن التحديث، وسيتم حذف النسخة من الخادم.",
      stopServerError: "تعذر الوصول إلى الخادم لحذف نسخته. سيُحذف تلقائيًا بعد يومين من آخر تحديث.",
      localhostBefore: "الأجهزة الأخرى لا يمكنها فتح ",
      localhostAfter: "، والتلفاز يحتاج إلى https لفك تشفير اللعبة. استخدم {openWindow} هنا، أو نسخة منشورة، أو نفق https.",
      goLive: "بدء البث المباشر",
      goLiveAnyDevice: "بدء البث المباشر (أي جهاز)",
      gettingCode: "جارٍ الحصول على رمز",
      goLiveHint: "احصل على رمز لتلفاز ذكي أو Chromecast أو الهواتف. تُشفَّر اللعبة قبل إرسالها، ولا يمكن قراءتها إلا من الشاشات التي تملك الرمز.",
      howItWorks: "كيف يعمل هذا",
      codeError: "تعذر الحصول على رمز ({message}). تحقق من الاتصال وحاول مرة أخرى.",
      logWentLive: "بدأ البث المباشر بالرمز {code}",
      logStoppedSharing: "تم إيقاف المشاركة",
      logTvMessage: "رسالة التلفاز: {text}",
      messageTable: "إرسال رسالة إلى الطاولة",
      messagePlaceholder: "تظهر كشريط على التلفاز",
      messageAriaLabel: "رسالة التلفاز",
      send: "إرسال",
      typeMessageFirst: "اكتب رسالة أولاً",
      showing: "المعروض حاليًا:",
      toastOnTv: "على التلفاز",
      toastBannerCleared: "تم مسح الشريط",
      quick: {
        onBreak: "في استراحة",
        lastHandBeforeBreak: "آخر يد قبل الاستراحة",
        shuffleUpAndDeal: "اخلط وابدأ التوزيع",
        seatChange: "تغيير المقعد",
        backIn5: "العودة خلال 5 دقائق",
        registrationClosing: "التسجيل يقفل قريبًا",
      },
    },
    enterCode: {
      title: "عرض اللعبة على هذه الشاشة",
      introBefore: "على الحاسوب الذي يشغّل اللعبة، افتحها واضغط ",
      introAfter: ". ثم اكتب هنا الرمز الذي تعرضه.",
      codeAriaLabel: "رمز التلفاز",
      typeAllChars: "اكتب أولًا جميع أحرف الرمز البالغة {n}",
      showIt: "عرضه",
      encryptedNote: "تُشفَّر اللعبة قبل أن تغادر ذلك الحاسوب، ولا يمكن فك قفلها إلا من شاشة تملك الرمز.",
      howItWorks: "كيف تعمل رموز التلفاز",
    },
    connect: {
      connecting: "جارٍ الاتصال…",
      connectingLabel: "جارٍ الاتصال",
      live: "مباشر · {code}",
      sameComputer: "وضع الحاسوب نفسه",
      tryDifferent: "جرّب رمزًا آخر",
    },
    wait: {
      title: "في انتظار اللعبة",
      label: "في الانتظار",
      locked: "PitMaster مقفل على هذا الحاسوب. افتح القفل حيث تعمل اللعبة، وستظهر هنا.",
      notHereTitle: "هذه اللعبة ليست على هذا الجهاز",
      notHereBefore: "على جهاز آخر؟ على الحاسوب الذي يشغّل اللعبة، اضغط",
      notHereMiddle: "، ثم افتح",
      notHereAfter: " هنا واكتب الرمز.",
      waitingForHost: "في انتظار المضيف",
    },
    meta: {
      cashGame: "لعبة نقدية",
      tournament: "البطولة",
      buyIn: "الدخول بـ {amount}",
    },
    level: {
      break: "استراحة",
      levelNum: "المستوى {n}",
      blinds: "الرهانات العمياء",
      ante: "الأنتي",
      anteSuffix: "أنتي {n}",
      blindsAfterBreak: "الرهانات العمياء بعد الاستراحة",
      colorUpNow: "استبدال الرقائق الآن",
      colorUp: "استبدال الرقائق",
      addOnsOpen: "الإضافات مفتوحة",
      addOnsFor: "مقابل",
      nextLevel: "المستوى التالي",
      finalLevel: "المستوى الأخير",
      nextBreak: "الاستراحة التالية",
    },
    status: {
      paused: "متوقف مؤقتًا",
      notStarted: "لم يبدأ",
    },
    warn: {
      lastMinute: "الدقيقة الأخيرة",
      minLeft: "بقي {n} دقيقة",
    },
    tourney: {
      players: "اللاعبون",
      onBubble: "على الفقاعة",
      inTheMoney: "ضمن الفائزين بالمال",
      seats: "المقاعد",
      avgStack: "متوسط الرقائق",
      bigBlinds: { zero: "صفر بيغ بلايند", one: "بيغ بلايند واحد", two: "بيغ بلايندان", few: "{n} بيغ بلايند", many: "{n} بيغ بلايند", other: "{n} بيغ بلايند" },
      rebuys: "إعادات الشراء",
      addOns: "الإضافات",
      lateRegOpen: "التسجيل المتأخر مفتوح حتى المستوى {level}",
      rebuysOpen: "إعادة الشراء مفتوحة حتى المستوى {level}",
      elapsed: "الوقت المنقضي",
      prizePool: "مجموع الجوائز",
      payouts: "توزيع الجوائز",
      pays: "عدد الفائزين بالمال",
      topN: "أفضل {n}",
      morePaid: { zero: "لا فائزين إضافيين", one: "+ فائز واحد إضافي", two: "+ فائزان إضافيان", few: "+ {n} فائزين إضافيين", many: "+ {n} فائزًا إضافيًا", other: "+ {n} فائز إضافي" },
      bountyOnEveryHead: "مكافأة على كل لاعب",
      progressiveBounties: "مكافآت تصاعدية",
      biggestBounty: "أكبر مكافأة",
      mysteryFrom: "المكافآت الغامضة عند بقاء {n}",
      envelopesLeft: { one: "بقي ظرف واحد", two: "بقي ظرفان", few: "بقيت {count} أظرف", other: "بقي {count} ظرفًا" },
      topEnvelope: "أكبر جائزة",
    },
    cash: {
      seatedLabel: "الجالسون · {n}",
      session: "الجلسة",
      timeLeft: "الوقت المتبقي",
      ends: "تنتهي في",
      lastOrbit: "الجولة الأخيرة",
      straddlesWelcome: "الستراديل مسموح",
      bombNextHand: "بومب بوت في اليد التالية",
      nextBomb: "البومب بوت التالي",
      highHand: "أعلى يد",
      highHandOpen: "متاحة للجميع",
      sevenTwoGame: "لعبة 7-2",
      sevenTwoPays: "{amount} من كل لاعب",
      highHandTimesUp: "انتهى الوقت",
      buyIn: "الدخول",
      onTable: "على الطاولة",
      rake: "العمولة",
      upToAPot: "حتى {amount} لكل بوت",
      seatFee: "رسوم المقعد",
      openSeats: "مقاعد شاغرة",
    },
    winner: {
      dealMade: "توصلت الطاولة الأخيرة إلى اتفاق",
      champion: "البطل",
      dealBig: "تم الاتفاق",
      nobodyYet: "لا أحد بعد",
    },
    seatList: {
      table: "الطاولة {n}",
      noSeatYet: "لا مقعد بعد",
    },
    rules: {
      houseRules: "قواعد المكان",
    },
    controls: {
      enableSound: "تفعيل الصوت",
      clickForSound: "انقر في أي مكان لتفعيل الصوت",
      soundOn: "الصوت مفعّل",
      fullscreen: "ملء الشاشة",
    },
    voice: {
      breakTime: { zero: "وقت الاستراحة.", one: "وقت الاستراحة. دقيقة واحدة.", two: "وقت الاستراحة. دقيقتان.", few: "وقت الاستراحة. {n} دقائق.", many: "وقت الاستراحة. {n} دقيقة.", other: "وقت الاستراحة. {n} دقيقة." },
      levelBlinds: "المستوى {level}. الرهانات العمياء {sb}، {bb}.",
      levelBlindsAnte: "المستوى {level}. الرهانات العمياء {sb}، {bb}، مع أنتي {ante}.",
      minutesLeftAtBlinds: { zero: "لم يتبق وقت عند هذه الرهانات.", one: "بقيت دقيقة واحدة عند هذه الرهانات.", two: "بقيت دقيقتان عند هذه الرهانات.", few: "بقيت {n} دقائق عند هذه الرهانات.", many: "بقيت {n} دقيقة عند هذه الرهانات.", other: "بقيت {n} دقيقة عند هذه الرهانات." },
    },
  },
  bn: {
    panel: {
      title: "টিভি",
      openWindow: "টিভি উইন্ডো খুলুন",
      dragHint: "এটি টিভিতে (HDMI) টেনে আনুন এবং চাপুন",
      tvCodeInstructions: "টিভি কোড: যেকোনো স্ক্রিনে {host}/live খুলে টাইপ করুন",
      copyCodeTitle: "কোড কপি করুন",
      copyLink: "লিংক কপি করুন",
      stopSharing: "শেয়ার করা বন্ধ করুন",
      stopConfirm: "শেয়ার করা বন্ধ করবেন? কোড ব্যবহারকারী স্ক্রিনগুলো আপডেট হওয়া বন্ধ হয়ে যাবে, এবং সার্ভারের কপিটি মুছে ফেলা হবে।",
      stopServerError: "সার্ভার থেকে কপি মুছতে যোগাযোগ করা যায়নি। শেষ আপডেটের দুই দিন পর এটি নিজে থেকেই মুছে যায়।",
      localhostBefore: "অন্য ডিভাইসগুলো ",
      localhostAfter: " খুলতে পারে না, আর গেম আনলক করতে টিভিতে https প্রয়োজন। এখানে {openWindow} ব্যবহার করুন, অথবা ডিপ্লয় করা কোনো কপি বা https টানেল ব্যবহার করুন।",
      goLive: "লাইভে যান",
      goLiveAnyDevice: "লাইভে যান (যেকোনো ডিভাইস)",
      gettingCode: "কোড নেওয়া হচ্ছে",
      goLiveHint: "স্মার্ট টিভি, Chromecast বা ফোনের জন্য একটি কোড নিন। পাঠানোর আগেই গেমটি এনক্রিপ্ট করা হয়, আর শুধু কোডযুক্ত স্ক্রিনই এটি পড়তে পারে।",
      howItWorks: "এটি কীভাবে কাজ করে",
      codeError: "কোড পাওয়া যায়নি ({message})। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
      logWentLive: "{code} কোড দিয়ে লাইভে গেছে",
      logStoppedSharing: "শেয়ার করা বন্ধ করেছে",
      logTvMessage: "টিভি বার্তা: {text}",
      messageTable: "টেবিলে বার্তা পাঠান",
      messagePlaceholder: "টিভিতে ব্যানার হিসেবে দেখাবে",
      messageAriaLabel: "টিভি বার্তা",
      send: "পাঠান",
      typeMessageFirst: "আগে একটি বার্তা লিখুন",
      showing: "দেখানো হচ্ছে:",
      toastOnTv: "টিভিতে দেখানো হচ্ছে",
      toastBannerCleared: "ব্যানার মুছে ফেলা হয়েছে",
      quick: {
        onBreak: "বিরতিতে",
        lastHandBeforeBreak: "বিরতির আগে শেষ হাত",
        shuffleUpAndDeal: "শাফল করে বিলি করুন",
        seatChange: "আসন পরিবর্তন",
        backIn5: "৫ মিনিটে ফিরছি",
        registrationClosing: "নিবন্ধন শিগগিরই বন্ধ হবে",
      },
    },
    enterCode: {
      title: "এই স্ক্রিনে একটি গেম আনুন",
      introBefore: "যে কম্পিউটারে গেমটি চলছে, সেখানে এটি খুলে ",
      introAfter: " চাপুন। এরপর এখানে দেখানো কোডটি টাইপ করুন।",
      codeAriaLabel: "টিভি কোড",
      typeAllChars: "প্রথমে কোডের সবগুলো {n} অক্ষর টাইপ করুন",
      showIt: "দেখান",
      encryptedNote: "সেই কম্পিউটার ছাড়ার আগেই গেমটি এনক্রিপ্ট করা হয়, আর শুধু কোডযুক্ত স্ক্রিনই এটি আনলক করতে পারে।",
      howItWorks: "টিভি কোড কীভাবে কাজ করে",
    },
    connect: {
      connecting: "সংযোগ হচ্ছে…",
      connectingLabel: "সংযোগ হচ্ছে",
      live: "লাইভ · {code}",
      sameComputer: "একই-কম্পিউটার মোড",
      tryDifferent: "অন্য কোড চেষ্টা করুন",
    },
    wait: {
      title: "গেমের জন্য অপেক্ষা করা হচ্ছে",
      label: "অপেক্ষা করা হচ্ছে",
      locked: "এই কম্পিউটারে PitMaster লক করা আছে। যেখানে গেমটি চলছে সেখানে আনলক করুন, এটি এখানে আপনাআপনি দেখা যাবে।",
      notHereTitle: "সেই গেমটি এই ডিভাইসে নেই",
      notHereBefore: "অন্য ডিভাইসে? যে কম্পিউটারে গেমটি চলছে, সেখানে চাপুন",
      notHereMiddle: ", এরপর এখানে খুলুন",
      notHereAfter: " আর কোডটি টাইপ করুন।",
      waitingForHost: "হোস্টের জন্য অপেক্ষা করা হচ্ছে",
    },
    meta: {
      cashGame: "ক্যাশ গেম",
      tournament: "টুর্নামেন্ট",
      buyIn: "{amount} বাই-ইন",
    },
    level: {
      break: "বিরতি",
      levelNum: "লেভেল {n}",
      blinds: "ব্লাইন্ড",
      ante: "অ্যান্টি",
      anteSuffix: "অ্যান্টি {n}",
      blindsAfterBreak: "বিরতির পরের ব্লাইন্ড",
      colorUpNow: "এখনই চিপ বদলান",
      colorUp: "চিপ বদলান",
      addOnsOpen: "অ্যাড-অন খোলা",
      addOnsFor: "বিনিময়ে",
      nextLevel: "পরবর্তী লেভেল",
      finalLevel: "শেষ লেভেল",
      nextBreak: "পরবর্তী বিরতি",
    },
    status: {
      paused: "থামানো আছে",
      notStarted: "শুরু হয়নি",
    },
    warn: {
      lastMinute: "শেষ মিনিট",
      minLeft: "{n} মিনিট বাকি",
    },
    tourney: {
      players: "খেলোয়াড়",
      onBubble: "বাবলে",
      inTheMoney: "টাকার মধ্যে",
      seats: "আসন",
      avgStack: "গড় স্ট্যাক",
      bigBlinds: { one: "{n} বিগ ব্লাইন্ড", other: "{n} বিগ ব্লাইন্ড" },
      rebuys: "রিবাই",
      addOns: "অ্যাড-অন",
      lateRegOpen: "লেট রেজিস্ট্রেশন লেভেল {level} পর্যন্ত খোলা",
      rebuysOpen: "রিবাই লেভেল {level} পর্যন্ত খোলা",
      elapsed: "অতিবাহিত",
      prizePool: "পুরস্কারের অর্থ",
      payouts: "পেআউট",
      pays: "পে হয়",
      topN: "শীর্ষ {n}",
      morePaid: { one: "+ {n} জন আরও পেয়েছেন", other: "+ {n} জন আরও পেয়েছেন" },
      bountyOnEveryHead: "প্রতিটি মাথায় বাউন্টি",
      progressiveBounties: "প্রগ্রেসিভ বাউন্টি",
      biggestBounty: "সবচেয়ে বড় বাউন্টি",
      mysteryFrom: "{n} জন বাকি থাকলে মিস্ট্রি বাউন্টি",
      envelopesLeft: { one: "{count}টি খাম বাকি", other: "{count}টি খাম বাকি" },
      topEnvelope: "সবচেয়ে বড় পুরস্কার",
    },
    cash: {
      seatedLabel: "বসেছেন · {n}",
      session: "সেশন",
      timeLeft: "বাকি সময়",
      ends: "শেষ হবে",
      lastOrbit: "শেষ অরবিট",
      straddlesWelcome: "স্ট্র্যাডল স্বাগত",
      bombNextHand: "পরের হাতে বম্ব পট",
      nextBomb: "পরের বম্ব পট",
      highHand: "হাই হ্যান্ড",
      highHandOpen: "এখনো খোলা",
      sevenTwoGame: "7-2 গেম",
      sevenTwoPays: "প্রত্যেকের কাছ থেকে {amount}",
      highHandTimesUp: "সময় শেষ",
      buyIn: "বাই-ইন",
      onTable: "টেবিলে",
      rake: "রেক",
      upToAPot: "প্রতি পটে সর্বোচ্চ {amount}",
      seatFee: "আসন ফি",
      openSeats: "খালি আসন",
    },
    winner: {
      dealMade: "ফাইনাল টেবিল একটি চুক্তি করেছে",
      champion: "চ্যাম্পিয়ন",
      dealBig: "চুক্তি হয়ে গেছে",
      nobodyYet: "এখনও কেউ না",
    },
    seatList: {
      table: "টেবিল {n}",
      noSeatYet: "এখনও আসন নেই",
    },
    rules: {
      houseRules: "হাউস রুলস",
    },
    controls: {
      enableSound: "শব্দ চালু করুন",
      clickForSound: "শব্দের জন্য যেকোনো জায়গায় ক্লিক করুন",
      soundOn: "শব্দ চালু আছে",
      fullscreen: "ফুলস্ক্রিন",
    },
    voice: {
      breakTime: { one: "বিরতির সময়। {n} মিনিট।", other: "বিরতির সময়। {n} মিনিট।" },
      levelBlinds: "লেভেল {level}। ব্লাইন্ড হলো {sb}, {bb}।",
      levelBlindsAnte: "লেভেল {level}। ব্লাইন্ড হলো {sb}, {bb}, সাথে {ante} অ্যান্টি।",
      minutesLeftAtBlinds: { one: "এই ব্লাইন্ডে এক মিনিট বাকি।", other: "এই ব্লাইন্ডে {n} মিনিট বাকি।" },
    },
  },
  pt: {
    panel: {
      title: "TV",
      openWindow: "Abrir Janela da TV",
      dragHint: "Arraste para a TV (HDMI) e pressione",
      tvCodeInstructions: "Código da TV: em qualquer tela, abra {host}/live e digite",
      copyCodeTitle: "Copiar o Código",
      copyLink: "Copiar Link",
      stopSharing: "Parar de Compartilhar",
      stopConfirm: "Parar de compartilhar? As telas que usam o código param de atualizar, e a cópia no servidor é excluída.",
      stopServerError: "Não foi possível contatar o servidor para excluir sua cópia. Ela se apaga sozinha dois dias após a última atualização.",
      localhostBefore: "Outros dispositivos não conseguem abrir ",
      localhostAfter: ", e uma TV precisa de https para desbloquear o jogo. Use {openWindow} aqui, ou uma cópia publicada, ou um túnel https.",
      goLive: "Ficar Ao Vivo",
      goLiveAnyDevice: "Ficar Ao Vivo (Qualquer Dispositivo)",
      gettingCode: "Obtendo um Código",
      goLiveHint: "Consiga um código para uma TV inteligente, um Chromecast ou celulares. O jogo é criptografado antes de ser enviado, e só as telas com o código podem lê-lo.",
      howItWorks: "Como funciona",
      codeError: "Não foi possível obter um código ({message}). Verifique a conexão e tente de novo.",
      logWentLive: "Ficou ao vivo com o código {code}",
      logStoppedSharing: "Parou de compartilhar",
      logTvMessage: "Mensagem da TV: {text}",
      messageTable: "Enviar Mensagem para a Mesa",
      messagePlaceholder: "Aparece como um banner na TV",
      messageAriaLabel: "Mensagem da TV",
      send: "Enviar",
      typeMessageFirst: "Digite uma mensagem primeiro",
      showing: "Mostrando:",
      toastOnTv: "Na TV",
      toastBannerCleared: "Banner apagado",
      quick: {
        onBreak: "Em Pausa",
        lastHandBeforeBreak: "Última Mão Antes da Pausa",
        shuffleUpAndDeal: "Embaralhem e Distribuam",
        seatChange: "Troca de Assento",
        backIn5: "De Volta em 5 Minutos",
        registrationClosing: "Inscrições Fechando em Breve",
      },
    },
    enterCode: {
      title: "Coloque um Jogo Nesta Tela",
      introBefore: "No computador que está rodando o jogo, abra-o e pressione ",
      introAfter: ". Depois digite aqui o código exibido.",
      codeAriaLabel: "Código da TV",
      typeAllChars: "Digite primeiro os {n} caracteres do código",
      showIt: "Mostrar",
      encryptedNote: "O jogo é criptografado antes de sair daquele computador, e só uma tela com o código pode desbloqueá-lo.",
      howItWorks: "Como Funcionam os Códigos de TV",
    },
    connect: {
      connecting: "Conectando…",
      connectingLabel: "Conectando",
      live: "Ao Vivo · {code}",
      sameComputer: "Modo Mesmo Computador",
      tryDifferent: "Tentar Outro Código",
    },
    wait: {
      title: "Esperando o Jogo",
      label: "Esperando",
      locked: "O PitMaster está bloqueado neste computador. Desbloqueie onde o jogo está rodando, e ele aparece aqui.",
      notHereTitle: "Esse Jogo Não Está Neste Dispositivo",
      notHereBefore: "Em outro dispositivo? No computador que está rodando o jogo, pressione",
      notHereMiddle: ", depois abra",
      notHereAfter: " aqui e digite o código.",
      waitingForHost: "Esperando o Anfitrião",
    },
    meta: {
      cashGame: "Cash Game",
      tournament: "Torneio",
      buyIn: "Buy-In de {amount}",
    },
    level: {
      break: "Pausa",
      levelNum: "Nível {n}",
      blinds: "Blinds",
      ante: "Ante",
      anteSuffix: "Ante {n}",
      blindsAfterBreak: "Blinds Depois da Pausa",
      colorUpNow: "Trocar Fichas Agora",
      colorUp: "Trocar Fichas",
      addOnsOpen: "Add-Ons Abertos",
      addOnsFor: "por",
      nextLevel: "Próximo Nível",
      finalLevel: "Último Nível",
      nextBreak: "Próxima Pausa",
    },
    status: {
      paused: "Pausado",
      notStarted: "Não Começou",
    },
    warn: {
      lastMinute: "Último Minuto",
      minLeft: "Faltam {n} Min",
    },
    tourney: {
      players: "Jogadores",
      onBubble: "Na Bolha",
      inTheMoney: "Premiado",
      seats: "Assentos",
      avgStack: "Stack Médio",
      bigBlinds: { one: "{n} Big Blind", other: "{n} Big Blinds" },
      rebuys: "Recompras",
      addOns: "Add-Ons",
      lateRegOpen: "Inscrição Tardia Aberta Até o Nível {level}",
      rebuysOpen: "Recompras Abertas Até o Nível {level}",
      elapsed: "Decorrido",
      prizePool: "Prêmio Total",
      payouts: "Premiação",
      pays: "Pagam",
      topN: "Top {n}",
      morePaid: { one: "+ {n} A Mais Premiado", other: "+ {n} A Mais Premiados" },
      bountyOnEveryHead: "Recompensa em Cada Cabeça",
      progressiveBounties: "Recompensas Progressivas",
      biggestBounty: "Maior Recompensa",
      mysteryFrom: "Recompensas Misteriosas com {n} Restantes",
      envelopesLeft: { one: "Resta {count} Envelope", other: "Restam {count} Envelopes" },
      topEnvelope: "Maior Prêmio",
    },
    cash: {
      seatedLabel: "Sentados · {n}",
      session: "Sessão",
      timeLeft: "Tempo Restante",
      ends: "Termina",
      lastOrbit: "Última Rodada",
      straddlesWelcome: "Straddles Permitidos",
      bombNextHand: "Bomb Pot na Próxima Mão",
      nextBomb: "Próximo Bomb Pot",
      highHand: "Mão Mais Alta",
      highHandOpen: "Em Aberto",
      sevenTwoGame: "Jogo do 7-2",
      sevenTwoPays: "{amount} de Cada Um",
      highHandTimesUp: "Acabou o Tempo",
      buyIn: "Buy-In",
      onTable: "Na Mesa",
      rake: "Rake",
      upToAPot: "Até {amount} por Pote",
      seatFee: "Taxa de Assento",
      openSeats: "Assentos Livres",
    },
    winner: {
      dealMade: "A Mesa Final Fechou um Acordo",
      champion: "Campeão",
      dealBig: "Fechou Acordo",
      nobodyYet: "Ninguém Ainda",
    },
    seatList: {
      table: "Mesa {n}",
      noSeatYet: "Ainda Sem Assento",
    },
    rules: {
      houseRules: "Regras da Casa",
    },
    controls: {
      enableSound: "Ativar Som",
      clickForSound: "Clique em Qualquer Lugar para o Som",
      soundOn: "Som Ativado",
      fullscreen: "Tela Cheia",
    },
    voice: {
      breakTime: { one: "Hora da pausa. {n} minuto.", other: "Hora da pausa. {n} minutos." },
      levelBlinds: "Nível {level}. Os blinds são {sb}, {bb}.",
      levelBlindsAnte: "Nível {level}. Os blinds são {sb}, {bb}, com um ante de {ante}.",
      minutesLeftAtBlinds: { one: "Falta um minuto nestes blinds.", other: "Faltam {n} minutos nestes blinds." },
    },
  },
};

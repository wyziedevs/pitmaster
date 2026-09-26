// the site chrome: header, tabs, footer, the command palette's own UI, the
// lock screen, the welcome/how-it-works copy, doc pages' shared shell, and
// the game setup dropdowns. every string a page's own content is NOT here;
// that belongs to whichever agent/file owns that page.
import type { Lang } from "./langs";

export interface NavDict {
  /** the link back to the games list, reused on crash/error screens */
  backToGames: string;
  header: {
    skipToContent: string;
    pagesLabel: string;
    morePages: string;
    lock: string;
    lockTitle: string;
    calculator: string;
    calculatorTitle: string;
  };
  links: {
    games: string;
    players: string;
    tvView: string;
  };
  shortcuts: {
    newCashGame: string;
    newTournament: string;
    chipSets: string;
  };
  commands: {
    goTo: string;
    gamesInProgress: string;
    templates: string;
    newFromTemplate: string;
    lightTheme: string;
    darkTheme: string;
    rakeOn: string;
    rakeOff: string;
    houseCutOn: string;
    houseCutOff: string;
    soundsOn: string;
    soundsOff: string;
    yourData: string;
    exportEverything: string;
    lockNow: string;
    importFromFile: string;
    tools: string;
    openCalculator: string;
    closeCalculator: string;
  };
  toast: {
    saveFailed: string;
    saveRecovered: string;
    rakeOn: string;
    rakeOff: string;
    houseCutOn: string;
    houseCutOff: string;
    exported: string;
  };
  discardConfirm: string;
  crashed: {
    title: string;
    tvBody: string;
    pageBody: string;
    tryAgain: string;
  };
  unreadable: {
    title: string;
    body1: string;
    body2Prefix: string;
    body2Suffix: string;
    deleteAndStart: string;
  };
  memoryNotice: {
    bold: string;
    blocked: string;
    insecure: string;
    tail: string;
  };
  saveTrouble: {
    bold: string;
    bodyPrefix: string;
    exportLink: string;
    bodySuffix: string;
  };
  footer: {
    copyright: string;
    openSourceUnder: string;
    licenseSuffix: string;
    moreLabel: string;
    privacy: string;
    terms: string;
  };
  error: {
    notFoundTitle: string;
    genericTitle: string;
    misdeal: string;
    notFoundBody: string;
    tryThatAgain: string;
  };
  gameSelect: {
    depthTurbo: string;
    depthPlain: string;
    depthNormal: string;
    depthDeep: string;
    depthVeryDeep: string;
    minutes: string;
  };
  intro: {
    title: string;
    lede: string;
    dontShowAgain: string;
    letsPlay: string;
    notePrefix: string;
    noteSuffix: string;
  };
  howItWorks: {
    step1Title: string;
    step1Prefix: string;
    step1LinkText: string;
    step1Suffix: string;
    step2Title: string;
    step2Prefix: string;
    step2CashGame: string;
    step2Mid: string;
    step2Tournament: string;
    step2Suffix: string;
    step3Title: string;
    step3Prefix: string;
    step3OpenTv: string;
    step3Mid: string;
    step3GoLive: string;
    step3CodeMid: string;
    step3CodeSuffix: string;
    step4Title: string;
    step4Body: string;
  };
  docPage: {
    footerPrefix: string;
    footerMiddle: string;
    /** goes right after the GitHub link, before the "see also" sentence */
    codeSuffix: string;
    footerSeeAlso: string;
  };
  palette: {
    ariaLabel: string;
    placeholder: string;
    typeThenEnter: string;
    noResults: string;
    move: string;
    run: string;
  };
  lockScreen: {
    headTitle: string;
    title: string;
    body: string;
    passcodePlaceholder: string;
    unlock: string;
    unlocking: string;
    tooManyTries: string;
    wrongPasscode: string;
    forgotPrefix: string;
    forgotLinkText: string;
    forgotSuffix: string;
    forgetConfirm: string;
  };
}

export const nav: Record<Lang, NavDict> = {
  en: {
    backToGames: "Back to Games",
    header: {
      skipToContent: "Skip to Content",
      pagesLabel: "Pages",
      morePages: "More pages",
      lock: "Lock",
      lockTitle: "Lock PitMaster now",
      calculator: "Calculator",
      calculatorTitle: "Calculator ({key})",
    },
    links: { games: "Games", players: "Players", tvView: "TV View" },
    shortcuts: { newCashGame: "New Cash Game", newTournament: "New Tournament", chipSets: "Chip Sets" },
    commands: {
      goTo: "Go To",
      gamesInProgress: "Games in Progress",
      templates: "Templates",
      newFromTemplate: "New from “{name}”",
      lightTheme: "Light Theme",
      darkTheme: "Dark Theme",
      rakeOn: "Turn Cash Game Rake On",
      rakeOff: "Turn Cash Game Rake Off",
      houseCutOn: "Turn Tournament House Cut On",
      houseCutOff: "Turn Tournament House Cut Off",
      soundsOn: "Turn Interface Sounds On",
      soundsOff: "Turn Interface Sounds Off",
      yourData: "Your Data",
      exportEverything: "Export Everything",
      lockNow: "Lock PitMaster Now",
      importFromFile: "Import From a File",
      tools: "Tools",
      openCalculator: "Open Calculator",
      closeCalculator: "Close Calculator",
    },
    toast: {
      saveFailed: "Couldn't save. This browser may be out of space, or blocking site storage.",
      saveRecovered: "Saved. Everything's caught up.",
      rakeOn: "New cash games take a rake",
      rakeOff: "No rake on new cash games",
      houseCutOn: "New tournaments take a house cut",
      houseCutOff: "No house cut on new tournaments",
      exported: "Exported. On the other device, open it with Import.",
    },
    discardConfirm: "Delete the saved data this browser can't open, and start fresh? This can't be undone.",
    crashed: {
      title: "Something Broke.",
      tvBody: "This screen hit a problem drawing the game. It tries again in a few seconds.",
      pageBody: "This page hit a problem it couldn't get past. What's saved is safe.",
      tryAgain: "Try Again",
    },
    unreadable: {
      title: "Saved Data Can't Be Opened",
      body1:
        "PitMaster encrypts everything it saves with a key that only this browser holds. That key is gone, usually because part of this site's data was cleared, so what's saved here can't be read by anyone, including us.",
      body2Prefix: "If you have an export file, start fresh and import it from",
      body2Suffix: ". Otherwise, starting fresh is the only way forward.",
      deleteAndStart: "Delete It and Start Fresh",
    },
    memoryNotice: {
      bold: "Nothing here is being saved.",
      blocked:
        "This browser is blocking site storage for PitMaster (a private window, or a setting that blocks site data), so there's nowhere safe to keep anything.",
      insecure:
        "This page isn't on a secure (https) connection, so your browser won't encrypt, and PitMaster doesn't save anything unencrypted.",
      tail: "Whatever you do here is gone when the tab closes.",
    },
    saveTrouble: {
      bold: "Your latest changes aren't saved yet.",
      bodyPrefix:
        "This browser may be out of space, or blocking site storage. PitMaster keeps trying every few seconds; keep this tab open until it gets through, or",
      exportLink: "export a backup",
      bodySuffix: "to be safe.",
    },
    footer: {
      copyright: "© {year}",
      openSourceUnder: "Open source under the",
      licenseSuffix: ".",
      moreLabel: "More",
      privacy: "Privacy",
      terms: "Terms",
    },
    error: {
      notFoundTitle: "Page Not Found",
      genericTitle: "Error",
      misdeal: "Misdeal.",
      notFoundBody: "There's no page at this address. It may have moved, or the link has a typo.",
      tryThatAgain: "Try that again.",
    },
    gameSelect: {
      depthTurbo: "Turbo: {bb} Big Blinds",
      depthPlain: "{bb} Big Blinds",
      depthNormal: "Normal: {bb} Big Blinds",
      depthDeep: "Deep: {bb} Big Blinds",
      depthVeryDeep: "Very Deep: {bb} Big Blinds",
      minutes: "{n} Minutes",
    },
    intro: {
      title: "Welcome to the Table.",
      lede: "PitMaster runs your poker game, whatever its size. Four steps and you're dealing.",
      dontShowAgain: "Don't Show This Again",
      letsPlay: "Let's Play",
      notePrefix: "This lives in",
      noteSuffix: "too, at the bottom of every page.",
    },
    howItWorks: {
      step1Title: "Set Up Your Chips",
      step1Prefix: "Start from a common set, or",
      step1LinkText: "match the chips you play with",
      step1Suffix: ": colors, values and how many of each.",
      step2Title: "Make a Game",
      step2Prefix: "A",
      step2CashGame: "Cash Game",
      step2Mid: "(blinds, buy-ins and a settle-up at the end) or a",
      step2Tournament: "Tournament",
      step2Suffix: "(a blind clock sized to your time, payouts and rebuys).",
      step3Title: "Put It on the TV",
      step3Prefix: "Hit",
      step3OpenTv: "Open TV Window",
      step3Mid: "and drag it onto the TV. Or hit",
      step3GoLive: "Go Live",
      step3CodeMid: ", open",
      step3CodeSuffix: "on any screen and type the code.",
      step4Title: "Run It From Your Seat",
      step4Body: "Deal from your laptop or phone. The TV keeps up by itself.",
    },
    docPage: {
      footerPrefix: "PitMaster is an open source side project published by",
      footerMiddle: ", and its code is on",
      codeSuffix: ". ",
      footerSeeAlso: "See also the",
    },
    palette: {
      ariaLabel: "Commands",
      placeholder: "What Do You Want to Do?",
      typeThenEnter: "Type {prompt}, then press Enter.",
      noResults: "Nothing matches “{query}”.",
      move: "Move",
      run: "Run",
    },
    lockScreen: {
      headTitle: "Locked",
      title: "PitMaster Is Locked",
      body: "Type the passcode to get back to your games. TV screens keep showing the game while it's locked.",
      passcodePlaceholder: "Passcode",
      unlock: "Unlock",
      unlocking: "Unlocking…",
      tooManyTries: "Too many wrong tries. Try again in {time}.",
      wrongPasscode: "That's not the passcode.",
      forgotPrefix: "Forgot it? Nothing saved here can be opened without it, by you or by us. The only way forward is to",
      forgotLinkText: "delete everything and start fresh",
      forgotSuffix: ", then import an export file if you have one.",
      forgetConfirm:
        "Delete everything saved in this browser and start fresh? Without the passcode none of it can be opened, by you or by anyone. This can't be undone.",
    },
  },
  zh: {
    backToGames: "返回游戏",
    header: {
      skipToContent: "跳转到内容",
      pagesLabel: "页面",
      morePages: "更多页面",
      lock: "锁定",
      lockTitle: "立即锁定 PitMaster",
      calculator: "计算器",
      calculatorTitle: "计算器（{key}）",
    },
    links: { games: "游戏", players: "玩家", tvView: "电视视图" },
    shortcuts: { newCashGame: "新建现金局", newTournament: "新建锦标赛", chipSets: "筹码套装" },
    commands: {
      goTo: "前往",
      gamesInProgress: "进行中的游戏",
      templates: "模板",
      newFromTemplate: "根据“{name}”新建",
      lightTheme: "浅色主题",
      darkTheme: "深色主题",
      rakeOn: "开启现金局抽水",
      rakeOff: "关闭现金局抽水",
      houseCutOn: "开启锦标赛主办方抽成",
      houseCutOff: "关闭锦标赛主办方抽成",
      soundsOn: "开启界面音效",
      soundsOff: "关闭界面音效",
      yourData: "你的数据",
      exportEverything: "导出全部数据",
      lockNow: "立即锁定 PitMaster",
      importFromFile: "从文件导入",
      tools: "工具",
      openCalculator: "打开计算器",
      closeCalculator: "关闭计算器",
    },
    toast: {
      saveFailed: "保存失败。此浏览器可能存储空间不足，或阻止了网站存储。",
      saveRecovered: "已保存，数据已是最新。",
      rakeOn: "新的现金局将收取抽水",
      rakeOff: "新的现金局不再收取抽水",
      houseCutOn: "新的锦标赛将收取主办方抽成",
      houseCutOff: "新的锦标赛不再收取主办方抽成",
      exported: "已导出。在另一台设备上，用“导入”打开它。",
    },
    discardConfirm: "删除此浏览器无法打开的已保存数据，并重新开始？此操作无法撤销。",
    crashed: {
      title: "出错了。",
      tvBody: "这个屏幕在绘制游戏时出了问题，几秒后会自动重试。",
      pageBody: "这个页面遇到了无法解决的问题。已保存的数据是安全的。",
      tryAgain: "重试",
    },
    unreadable: {
      title: "已保存的数据无法打开",
      body1:
        "PitMaster 用一把只有此浏览器持有的密钥加密所有保存的数据。这把密钥已经丢失，通常是因为本网站的部分数据被清除了，所以这里保存的内容任何人都无法读取，包括我们自己。",
      body2Prefix: "如果你有导出文件，可以重新开始，然后从",
      body2Suffix: "导入它。否则，重新开始是唯一的办法。",
      deleteAndStart: "删除并重新开始",
    },
    memoryNotice: {
      bold: "这里的内容不会被保存。",
      blocked: "此浏览器阻止了 PitMaster 的网站存储（可能是隐私窗口，或阻止网站数据的设置），因此没有安全的地方可以保存任何内容。",
      insecure: "此页面没有使用安全的（https）连接，浏览器无法加密数据，而 PitMaster 不会保存任何未加密的内容。",
      tail: "关闭标签页后，你在这里做的一切都会消失。",
    },
    saveTrouble: {
      bold: "你最新的更改还未保存。",
      bodyPrefix: "此浏览器可能存储空间不足，或阻止了网站存储。PitMaster 会每隔几秒重试一次，请保持此标签页打开直到保存成功，或者",
      exportLink: "导出备份",
      bodySuffix: "以确保安全。",
    },
    footer: {
      copyright: "© {year}",
      openSourceUnder: "本项目以",
      licenseSuffix: " 开源。",
      moreLabel: "更多",
      privacy: "隐私",
      terms: "条款",
    },
    error: {
      notFoundTitle: "页面未找到",
      genericTitle: "错误",
      misdeal: "发错牌了。",
      notFoundBody: "这个地址没有对应的页面。它可能已被移动，或者链接有误。",
      tryThatAgain: "请重试。",
    },
    gameSelect: {
      depthTurbo: "快速：{bb} 大盲",
      depthPlain: "{bb} 大盲",
      depthNormal: "标准：{bb} 大盲",
      depthDeep: "深筹码：{bb} 大盲",
      depthVeryDeep: "超深筹码：{bb} 大盲",
      minutes: "{n} 分钟",
    },
    intro: {
      title: "欢迎入座。",
      lede: "PitMaster 可以运营任意规模的扑克游戏。只需四步，就能开局发牌。",
      dontShowAgain: "不再显示",
      letsPlay: "开始游戏",
      notePrefix: "这些内容也在",
      noteSuffix: "里，每个页面的底部都有。",
    },
    howItWorks: {
      step1Title: "设置你的筹码",
      step1Prefix: "从一套常见的筹码开始，或者",
      step1LinkText: "匹配你实际使用的筹码",
      step1Suffix: "：颜色、面值和每种筹码的数量。",
      step2Title: "创建一局游戏",
      step2Prefix: "选择",
      step2CashGame: "现金局",
      step2Mid: "（盲注、买入，最后结算）或者",
      step2Tournament: "锦标赛",
      step2Suffix: "（根据你的时间设定盲注时钟、派彩和重买）。",
      step3Title: "投放到电视上",
      step3Prefix: "点击",
      step3OpenTv: "打开电视窗口",
      step3Mid: "并把它拖到电视上。或者点击",
      step3GoLive: "开始直播",
      step3CodeMid: "，在任意屏幕上打开",
      step3CodeSuffix: "并输入代码。",
      step4Title: "在你的座位上操作",
      step4Body: "在你的笔记本电脑或手机上发牌，电视会自动保持同步。",
    },
    docPage: {
      footerPrefix: "PitMaster 是一个由",
      footerMiddle: "发布的开源副业项目，代码托管在",
      codeSuffix: "。",
      footerSeeAlso: "另请参阅",
    },
    palette: {
      ariaLabel: "命令",
      placeholder: "你想做什么？",
      typeThenEnter: "输入{prompt}，然后按 Enter。",
      noResults: "没有匹配“{query}”的结果。",
      move: "移动",
      run: "执行",
    },
    lockScreen: {
      headTitle: "已锁定",
      title: "PitMaster 已锁定",
      body: "输入密码即可返回你的游戏。电视屏幕在锁定期间会继续显示游戏画面。",
      passcodePlaceholder: "密码",
      unlock: "解锁",
      unlocking: "解锁中…",
      tooManyTries: "错误次数过多，请在 {time} 后重试。",
      wrongPasscode: "密码不正确。",
      forgotPrefix: "忘记密码了？没有密码，这里保存的任何内容都无法打开，无论是你还是我们都不行。唯一的办法是",
      forgotLinkText: "删除全部数据并重新开始",
      forgotSuffix: "，然后导入你的导出文件（如果有的话）。",
      forgetConfirm: "删除此浏览器中保存的所有内容并重新开始？没有密码，任何人都无法打开这些数据。此操作无法撤销。",
    },
  },
  hi: {
    backToGames: "गेम्स पर वापस जाएं",
    header: {
      skipToContent: "सामग्री पर जाएं",
      pagesLabel: "पेज",
      morePages: "और पेज",
      lock: "लॉक",
      lockTitle: "PitMaster को अभी लॉक करें",
      calculator: "कैलकुलेटर",
      calculatorTitle: "कैलकुलेटर ({key})",
    },
    links: { games: "गेम्स", players: "खिलाड़ी", tvView: "टीवी व्यू" },
    shortcuts: { newCashGame: "नया कैश गेम", newTournament: "नया टूर्नामेंट", chipSets: "चिप सेट" },
    commands: {
      goTo: "यहां जाएं",
      gamesInProgress: "चल रहे गेम्स",
      templates: "टेम्पलेट्स",
      newFromTemplate: "“{name}” से नया गेम",
      lightTheme: "लाइट थीम",
      darkTheme: "डार्क थीम",
      rakeOn: "कैश गेम रेक चालू करें",
      rakeOff: "कैश गेम रेक बंद करें",
      houseCutOn: "टूर्नामेंट हाउस कट चालू करें",
      houseCutOff: "टूर्नामेंट हाउस कट बंद करें",
      soundsOn: "इंटरफ़ेस साउंड चालू करें",
      soundsOff: "इंटरफ़ेस साउंड बंद करें",
      yourData: "आपका डेटा",
      exportEverything: "सब कुछ एक्सपोर्ट करें",
      lockNow: "PitMaster अभी लॉक करें",
      importFromFile: "फ़ाइल से इंपोर्ट करें",
      tools: "टूल्स",
      openCalculator: "कैलकुलेटर खोलें",
      closeCalculator: "कैलकुलेटर बंद करें",
    },
    toast: {
      saveFailed: "सेव नहीं हो सका। हो सकता है इस ब्राउज़र में जगह कम हो, या यह साइट स्टोरेज को रोक रहा हो।",
      saveRecovered: "सेव हो गया। सब कुछ अपडेट है।",
      rakeOn: "नए कैश गेम में अब रेक लिया जाएगा",
      rakeOff: "नए कैश गेम में अब रेक नहीं लिया जाएगा",
      houseCutOn: "नए टूर्नामेंट में अब हाउस कट लिया जाएगा",
      houseCutOff: "नए टूर्नामेंट में अब हाउस कट नहीं लिया जाएगा",
      exported: "एक्सपोर्ट हो गया। दूसरी डिवाइस पर इसे इंपोर्ट से खोलें।",
    },
    discardConfirm: "इस ब्राउज़र में जो सेव डेटा नहीं खुल रहा, उसे मिटाकर नए सिरे से शुरू करें? यह वापस नहीं किया जा सकता।",
    crashed: {
      title: "कुछ गड़बड़ हो गई।",
      tvBody: "गेम बनाते समय इस स्क्रीन में दिक्कत आई। यह कुछ सेकंड में फिर कोशिश करेगी।",
      pageBody: "इस पेज में ऐसी दिक्कत आई जिसे पार नहीं किया जा सका। जो सेव है वह सुरक्षित है।",
      tryAgain: "फिर कोशिश करें",
    },
    unreadable: {
      title: "सेव डेटा नहीं खोला जा सकता",
      body1:
        "PitMaster जो कुछ भी सेव करता है उसे एक ऐसी कुंजी से एन्क्रिप्ट करता है जो सिर्फ़ इसी ब्राउज़र के पास होती है। वह कुंजी खो चुकी है, आमतौर पर इसलिए क्योंकि इस साइट का कुछ डेटा मिटा दिया गया था, इसलिए यहां सेव की गई चीज़ें अब कोई नहीं पढ़ सकता, हम भी नहीं।",
      body2Prefix: "अगर आपके पास एक्सपोर्ट फ़ाइल है, तो नए सिरे से शुरू करें और उसे",
      body2Suffix: " से इंपोर्ट करें। वरना, नए सिरे से शुरू करना ही एकमात्र रास्ता है।",
      deleteAndStart: "मिटाएं और नए सिरे से शुरू करें",
    },
    memoryNotice: {
      bold: "यहां कुछ भी सेव नहीं हो रहा।",
      blocked:
        "यह ब्राउज़र PitMaster के लिए साइट स्टोरेज को रोक रहा है (शायद एक प्राइवेट विंडो, या साइट डेटा रोकने वाली कोई सेटिंग), इसलिए यहां कुछ भी सुरक्षित रूप से रखने की जगह नहीं है।",
      insecure:
        "यह पेज सुरक्षित (https) कनेक्शन पर नहीं है, इसलिए आपका ब्राउज़र एन्क्रिप्ट नहीं कर पाएगा, और PitMaster बिना एन्क्रिप्शन के कुछ भी सेव नहीं करता।",
      tail: "टैब बंद होते ही यहां जो कुछ भी किया गया वह मिट जाएगा।",
    },
    saveTrouble: {
      bold: "आपके नए बदलाव अभी सेव नहीं हुए हैं।",
      bodyPrefix:
        "हो सकता है इस ब्राउज़र में जगह कम हो, या यह साइट स्टोरेज को रोक रहा हो। PitMaster हर कुछ सेकंड में फिर कोशिश करता रहता है; जब तक यह सफल न हो जाए तब तक यह टैब खुला रखें, या",
      exportLink: "एक बैकअप एक्सपोर्ट करें",
      bodySuffix: "ताकि सुरक्षित रहे।",
    },
    footer: {
      copyright: "© {year}",
      openSourceUnder: "यह",
      licenseSuffix: " के तहत ओपन सोर्स है.",
      moreLabel: "और",
      privacy: "प्राइवेसी",
      terms: "शर्तें",
    },
    error: {
      notFoundTitle: "पेज नहीं मिला",
      genericTitle: "एरर",
      misdeal: "मिसडील।",
      notFoundBody: "इस पते पर कोई पेज नहीं है। हो सकता है यह हट गया हो, या लिंक में गलती हो।",
      tryThatAgain: "फिर कोशिश करें।",
    },
    gameSelect: {
      depthTurbo: "टर्बो: {bb} बिग ब्लाइंड्स",
      depthPlain: "{bb} बिग ब्लाइंड्स",
      depthNormal: "सामान्य: {bb} बिग ब्लाइंड्स",
      depthDeep: "डीप: {bb} बिग ब्लाइंड्स",
      depthVeryDeep: "बहुत डीप: {bb} बिग ब्लाइंड्स",
      minutes: "{n} मिनट",
    },
    intro: {
      title: "टेबल पर आपका स्वागत है।",
      lede: "PitMaster आपका पोकर गेम चलाता है, चाहे वह किसी भी आकार का हो। बस चार कदम और आप डील करने के लिए तैयार हैं।",
      dontShowAgain: "इसे दोबारा न दिखाएं",
      letsPlay: "चलिए खेलते हैं",
      notePrefix: "यह",
      noteSuffix: "में भी है, हर पेज के सबसे नीचे।",
    },
    howItWorks: {
      step1Title: "अपने चिप्स सेट करें",
      step1Prefix: "किसी आम सेट से शुरू करें, या",
      step1LinkText: "आप जिन चिप्स से खेलते हैं उनसे मिलाएं",
      step1Suffix: ": रंग, वैल्यू और हर एक की संख्या।",
      step2Title: "एक गेम बनाएं",
      step2Prefix: "एक",
      step2CashGame: "कैश गेम",
      step2Mid: "(ब्लाइंड्स, बाय-इन और आख़िर में हिसाब चुकाना) या एक",
      step2Tournament: "टूर्नामेंट",
      step2Suffix: "(आपके समय के हिसाब से ब्लाइंड क्लॉक, भुगतान और रीबाय)।",
      step3Title: "इसे टीवी पर लगाएं",
      step3Prefix: "दबाएं",
      step3OpenTv: "ओपन टीवी विंडो",
      step3Mid: "और इसे टीवी पर खींच लाएं। या दबाएं",
      step3GoLive: "गो लाइव",
      step3CodeMid: ", किसी भी स्क्रीन पर",
      step3CodeSuffix: "खोलें और कोड टाइप करें।",
      step4Title: "अपनी सीट से चलाएं",
      step4Body: "अपने लैपटॉप या फ़ोन से डील करें। टीवी अपने आप साथ चलता रहेगा।",
    },
    docPage: {
      footerPrefix: "PitMaster एक ओपन सोर्स साइड प्रोजेक्ट है, जिसे पब्लिश किया है",
      footerMiddle: " ने, और इसका कोड",
      codeSuffix: " पर है. ",
      footerSeeAlso: "यह भी देखें",
    },
    palette: {
      ariaLabel: "कमांड",
      placeholder: "आप क्या करना चाहते हैं?",
      typeThenEnter: "{prompt} टाइप करें, फिर Enter दबाएं।",
      noResults: "“{query}” से कुछ मेल नहीं खाता।",
      move: "मूव",
      run: "रन",
    },
    lockScreen: {
      headTitle: "लॉक्ड",
      title: "PitMaster लॉक है",
      body: "अपने गेम्स पर वापस जाने के लिए पासकोड डालें। लॉक रहते हुए भी टीवी स्क्रीन गेम दिखाती रहेंगी।",
      passcodePlaceholder: "पासकोड",
      unlock: "अनलॉक करें",
      unlocking: "अनलॉक हो रहा है…",
      tooManyTries: "बहुत सारी गलत कोशिशें। {time} बाद फिर कोशिश करें।",
      wrongPasscode: "यह सही पासकोड नहीं है।",
      forgotPrefix: "भूल गए? पासकोड के बिना यहां सेव कुछ भी नहीं खोला जा सकता, न आप और न हम। आगे बढ़ने का बस एक ही रास्ता है",
      forgotLinkText: "सब कुछ मिटाकर नए सिरे से शुरू करें",
      forgotSuffix: ", फिर अगर आपके पास एक्सपोर्ट फ़ाइल हो तो उसे इंपोर्ट करें।",
      forgetConfirm:
        "इस ब्राउज़र में सेव सब कुछ मिटाकर नए सिरे से शुरू करें? पासकोड के बिना इसे न आप खोल सकते हैं, न कोई और। यह वापस नहीं किया जा सकता।",
    },
  },
  es: {
    backToGames: "Volver a partidas",
    header: {
      skipToContent: "Saltar al contenido",
      pagesLabel: "Páginas",
      morePages: "Más páginas",
      lock: "Bloquear",
      lockTitle: "Bloquear PitMaster ahora",
      calculator: "Calculadora",
      calculatorTitle: "Calculadora ({key})",
    },
    links: { games: "Partidas", players: "Jugadores", tvView: "Vista de TV" },
    shortcuts: { newCashGame: "Nuevo cash game", newTournament: "Nuevo torneo", chipSets: "Conjuntos de fichas" },
    commands: {
      goTo: "Ir a",
      gamesInProgress: "Partidas en curso",
      templates: "Plantillas",
      newFromTemplate: "Nueva partida desde “{name}”",
      lightTheme: "Tema claro",
      darkTheme: "Tema oscuro",
      rakeOn: "Activar rake en cash games",
      rakeOff: "Desactivar rake en cash games",
      houseCutOn: "Activar comisión de la casa en torneos",
      houseCutOff: "Desactivar comisión de la casa en torneos",
      soundsOn: "Activar sonidos de la interfaz",
      soundsOff: "Desactivar sonidos de la interfaz",
      yourData: "Tus datos",
      exportEverything: "Exportar todo",
      lockNow: "Bloquear PitMaster ahora",
      importFromFile: "Importar desde un archivo",
      tools: "Herramientas",
      openCalculator: "Abrir calculadora",
      closeCalculator: "Cerrar calculadora",
    },
    toast: {
      saveFailed: "No se pudo guardar. Puede que este navegador se haya quedado sin espacio, o que esté bloqueando el almacenamiento del sitio.",
      saveRecovered: "Guardado. Todo está al día.",
      rakeOn: "Los nuevos cash games ahora cobran rake",
      rakeOff: "Los nuevos cash games ya no cobran rake",
      houseCutOn: "Los nuevos torneos ahora cobran comisión de la casa",
      houseCutOff: "Los nuevos torneos ya no cobran comisión de la casa",
      exported: "Exportado. En el otro dispositivo, ábrelo con Importar.",
    },
    discardConfirm: "¿Eliminar los datos guardados que este navegador no puede abrir y empezar de nuevo? Esto no se puede deshacer.",
    crashed: {
      title: "Algo se rompió.",
      tvBody: "Esta pantalla tuvo un problema mostrando la partida. Lo intentará de nuevo en unos segundos.",
      pageBody: "Esta página tuvo un problema que no pudo resolver. Lo guardado está a salvo.",
      tryAgain: "Intentar de nuevo",
    },
    unreadable: {
      title: "Los datos guardados no se pueden abrir",
      body1:
        "PitMaster cifra todo lo que guarda con una clave que solo tiene este navegador. Esa clave se ha perdido, normalmente porque se borró parte de los datos del sitio, así que lo guardado aquí ya no lo puede leer nadie, ni siquiera nosotros.",
      body2Prefix: "Si tienes un archivo exportado, empieza de nuevo e impórtalo desde",
      body2Suffix: ". De lo contrario, empezar de nuevo es la única opción.",
      deleteAndStart: "Eliminar todo y empezar de nuevo",
    },
    memoryNotice: {
      bold: "Nada de esto se está guardando.",
      blocked:
        "Este navegador está bloqueando el almacenamiento del sitio para PitMaster (una ventana privada, o un ajuste que bloquea los datos del sitio), así que no hay ningún lugar seguro donde guardar nada.",
      insecure: "Esta página no está en una conexión segura (https), así que tu navegador no puede cifrar, y PitMaster no guarda nada sin cifrar.",
      tail: "Todo lo que hagas aquí desaparece al cerrar la pestaña.",
    },
    saveTrouble: {
      bold: "Tus últimos cambios todavía no se han guardado.",
      bodyPrefix:
        "Puede que este navegador se haya quedado sin espacio, o que esté bloqueando el almacenamiento del sitio. PitMaster sigue intentándolo cada pocos segundos, mantén esta pestaña abierta hasta que se guarde, o",
      exportLink: "exporta una copia de seguridad",
      bodySuffix: "para estar seguro.",
    },
    footer: {
      copyright: "© {year}",
      openSourceUnder: "Código abierto bajo la",
      licenseSuffix: ".",
      moreLabel: "Más",
      privacy: "Privacidad",
      terms: "Términos",
    },
    error: {
      notFoundTitle: "Página no encontrada",
      genericTitle: "Error",
      misdeal: "Repartida mal.",
      notFoundBody: "No hay ninguna página en esta dirección. Puede que se haya movido, o que el enlace tenga un error.",
      tryThatAgain: "Inténtalo de nuevo.",
    },
    gameSelect: {
      depthTurbo: "Turbo: {bb} big blinds",
      depthPlain: "{bb} big blinds",
      depthNormal: "Normal: {bb} big blinds",
      depthDeep: "Profundo: {bb} big blinds",
      depthVeryDeep: "Muy profundo: {bb} big blinds",
      minutes: "{n} minutos",
    },
    intro: {
      title: "Bienvenido a la mesa.",
      lede: "PitMaster gestiona tu partida de póquer, sea cual sea su tamaño. Cuatro pasos y ya estás repartiendo.",
      dontShowAgain: "No volver a mostrar esto",
      letsPlay: "A jugar",
      notePrefix: "Esto también está en",
      noteSuffix: ", al final de cada página.",
    },
    howItWorks: {
      step1Title: "Configura tus fichas",
      step1Prefix: "Empieza con un set común, o",
      step1LinkText: "iguala las fichas con las que juegas",
      step1Suffix: ": colores, valores y cuántas hay de cada una.",
      step2Title: "Crea una partida",
      step2Prefix: "Un",
      step2CashGame: "cash game",
      step2Mid: "(ciegas, buy-ins y un ajuste de cuentas al final) o un",
      step2Tournament: "torneo",
      step2Suffix: "(un reloj de ciegas ajustado a tu tiempo, reparto de premios y rebuys).",
      step3Title: "Ponlo en la TV",
      step3Prefix: "Pulsa",
      step3OpenTv: "Abrir ventana de TV",
      step3Mid: "y arrástrala a la TV. O pulsa",
      step3GoLive: "Salir en vivo",
      step3CodeMid: ", abre",
      step3CodeSuffix: "en cualquier pantalla y escribe el código.",
      step4Title: "Llévalo desde tu asiento",
      step4Body: "Reparte desde tu portátil o tu móvil. La TV se mantiene al día sola.",
    },
    docPage: {
      footerPrefix: "PitMaster es un proyecto paralelo de código abierto publicado por",
      footerMiddle: ", y su código está en",
      codeSuffix: ". ",
      footerSeeAlso: "Consulta también",
    },
    palette: {
      ariaLabel: "Comandos",
      placeholder: "¿Qué quieres hacer?",
      typeThenEnter: "Escribe {prompt} y pulsa Enter.",
      noResults: "Nada coincide con “{query}”.",
      move: "Mover",
      run: "Ejecutar",
    },
    lockScreen: {
      headTitle: "Bloqueado",
      title: "PitMaster está bloqueado",
      body: "Escribe el código de acceso para volver a tus partidas. Las pantallas de TV siguen mostrando la partida mientras está bloqueado.",
      passcodePlaceholder: "Código de acceso",
      unlock: "Desbloquear",
      unlocking: "Desbloqueando…",
      tooManyTries: "Demasiados intentos fallidos. Vuelve a intentarlo en {time}.",
      wrongPasscode: "Ese no es el código de acceso.",
      forgotPrefix: "¿Lo olvidaste? Nada de lo guardado aquí se puede abrir sin él, ni tú ni nosotros. La única opción es",
      forgotLinkText: "eliminar todo y empezar de nuevo",
      forgotSuffix: ", y luego importar un archivo exportado si tienes uno.",
      forgetConfirm:
        "¿Eliminar todo lo guardado en este navegador y empezar de nuevo? Sin el código de acceso, nadie puede abrirlo, ni tú ni nadie más. Esto no se puede deshacer.",
    },
  },
  fr: {
    backToGames: "Retour aux parties",
    header: {
      skipToContent: "Aller au contenu",
      pagesLabel: "Pages",
      morePages: "Plus de pages",
      lock: "Verrouiller",
      lockTitle: "Verrouiller PitMaster maintenant",
      calculator: "Calculatrice",
      calculatorTitle: "Calculatrice ({key})",
    },
    links: { games: "Parties", players: "Joueurs", tvView: "Vue TV" },
    shortcuts: { newCashGame: "Nouveau cash game", newTournament: "Nouveau tournoi", chipSets: "Jeux de jetons" },
    commands: {
      goTo: "Aller à",
      gamesInProgress: "Parties en cours",
      templates: "Modèles",
      newFromTemplate: "Nouvelle partie depuis « {name} »",
      lightTheme: "Thème clair",
      darkTheme: "Thème sombre",
      rakeOn: "Activer le rake sur les cash games",
      rakeOff: "Désactiver le rake sur les cash games",
      houseCutOn: "Activer la commission du club sur les tournois",
      houseCutOff: "Désactiver la commission du club sur les tournois",
      soundsOn: "Activer les sons de l'interface",
      soundsOff: "Désactiver les sons de l'interface",
      yourData: "Vos données",
      exportEverything: "Tout exporter",
      lockNow: "Verrouiller PitMaster maintenant",
      importFromFile: "Importer depuis un fichier",
      tools: "Outils",
      openCalculator: "Ouvrir la calculatrice",
      closeCalculator: "Fermer la calculatrice",
    },
    toast: {
      saveFailed: "Impossible d'enregistrer. Ce navigateur manque peut-être d'espace, ou bloque le stockage du site.",
      saveRecovered: "Enregistré. Tout est à jour.",
      rakeOn: "Les nouveaux cash games prélèvent maintenant un rake",
      rakeOff: "Les nouveaux cash games ne prélèvent plus de rake",
      houseCutOn: "Les nouveaux tournois prélèvent maintenant une commission du club",
      houseCutOff: "Les nouveaux tournois ne prélèvent plus de commission du club",
      exported: "Exporté. Sur l'autre appareil, ouvrez-le avec Importer.",
    },
    discardConfirm: "Supprimer les données enregistrées que ce navigateur ne peut pas ouvrir, et repartir de zéro ? Cette action est irréversible.",
    crashed: {
      title: "Un problème est survenu.",
      tvBody: "Cet écran a rencontré un problème en affichant la partie. Il réessaiera dans quelques secondes.",
      pageBody: "Cette page a rencontré un problème qu'elle n'a pas pu résoudre. Ce qui est enregistré est en sécurité.",
      tryAgain: "Réessayer",
    },
    unreadable: {
      title: "Les données enregistrées ne peuvent pas être ouvertes",
      body1:
        "PitMaster chiffre tout ce qu'il enregistre avec une clé que seul ce navigateur possède. Cette clé a disparu, en général parce qu'une partie des données du site a été effacée, donc ce qui est enregistré ici ne peut plus être lu par personne, nous y compris.",
      body2Prefix: "Si vous avez un fichier exporté, repartez de zéro et importez-le depuis",
      body2Suffix: ". Sinon, repartir de zéro est la seule solution.",
      deleteAndStart: "Tout supprimer et repartir de zéro",
    },
    memoryNotice: {
      bold: "Rien ici n'est enregistré.",
      blocked:
        "Ce navigateur bloque le stockage du site pour PitMaster (une fenêtre privée, ou un réglage qui bloque les données du site), donc il n'y a nulle part où tout garder en sécurité.",
      insecure: "Cette page n'est pas sur une connexion sécurisée (https), donc votre navigateur ne peut pas chiffrer, et PitMaster n'enregistre rien de non chiffré.",
      tail: "Tout ce que vous faites ici disparaît à la fermeture de l'onglet.",
    },
    saveTrouble: {
      bold: "Vos derniers changements ne sont pas encore enregistrés.",
      bodyPrefix:
        "Ce navigateur manque peut-être d'espace, ou bloque le stockage du site. PitMaster continue d'essayer toutes les quelques secondes, laissez cet onglet ouvert jusqu'à ce que ça passe, ou",
      exportLink: "exportez une sauvegarde",
      bodySuffix: "pour plus de sécurité.",
    },
    footer: {
      copyright: "© {year}",
      openSourceUnder: "Open source sous la",
      licenseSuffix: ".",
      moreLabel: "Plus",
      privacy: "Confidentialité",
      terms: "Conditions",
    },
    error: {
      notFoundTitle: "Page introuvable",
      genericTitle: "Erreur",
      misdeal: "Mauvaise donne.",
      notFoundBody: "Il n'y a aucune page à cette adresse. Elle a peut-être été déplacée, ou le lien contient une erreur.",
      tryThatAgain: "Réessayez.",
    },
    gameSelect: {
      depthTurbo: "Turbo : {bb} grosses blindes",
      depthPlain: "{bb} grosses blindes",
      depthNormal: "Normal : {bb} grosses blindes",
      depthDeep: "Profond : {bb} grosses blindes",
      depthVeryDeep: "Très profond : {bb} grosses blindes",
      minutes: "{n} minutes",
    },
    intro: {
      title: "Bienvenue à la table.",
      lede: "PitMaster fait tourner votre partie de poker, quelle que soit sa taille. Quatre étapes et vous distribuez déjà.",
      dontShowAgain: "Ne plus afficher ceci",
      letsPlay: "On joue",
      notePrefix: "Ceci se trouve aussi dans",
      noteSuffix: ", en bas de chaque page.",
    },
    howItWorks: {
      step1Title: "Configurez vos jetons",
      step1Prefix: "Partez d'un set courant, ou",
      step1LinkText: "reproduisez les jetons que vous utilisez",
      step1Suffix: " : couleurs, valeurs et quantité de chacun.",
      step2Title: "Créez une partie",
      step2Prefix: "Un",
      step2CashGame: "cash game",
      step2Mid: "(blindes, buy-ins et un règlement des comptes à la fin) ou un",
      step2Tournament: "tournoi",
      step2Suffix: "(une horloge de blindes adaptée à votre temps, une répartition des gains et des recaves).",
      step3Title: "Affichez-la sur la TV",
      step3Prefix: "Cliquez sur",
      step3OpenTv: "Ouvrir la fenêtre TV",
      step3Mid: "et faites-la glisser sur la TV. Ou cliquez sur",
      step3GoLive: "Passer en direct",
      step3CodeMid: ", ouvrez",
      step3CodeSuffix: "sur n'importe quel écran et tapez le code.",
      step4Title: "Gérez-la depuis votre place",
      step4Body: "Distribuez depuis votre ordinateur portable ou votre téléphone. La TV se met à jour toute seule.",
    },
    docPage: {
      footerPrefix: "PitMaster est un projet personnel open source publié par",
      footerMiddle: ", et son code est sur",
      codeSuffix: ". ",
      footerSeeAlso: "Voir aussi",
    },
    palette: {
      ariaLabel: "Commandes",
      placeholder: "Que voulez-vous faire ?",
      typeThenEnter: "Tapez {prompt}, puis appuyez sur Entrée.",
      noResults: "Rien ne correspond à « {query} ».",
      move: "Déplacer",
      run: "Exécuter",
    },
    lockScreen: {
      headTitle: "Verrouillé",
      title: "PitMaster est verrouillé",
      body: "Tapez le code d'accès pour retrouver vos parties. Les écrans TV continuent d'afficher la partie pendant le verrouillage.",
      passcodePlaceholder: "Code d'accès",
      unlock: "Déverrouiller",
      unlocking: "Déverrouillage…",
      tooManyTries: "Trop d'essais incorrects. Réessayez dans {time}.",
      wrongPasscode: "Ce n'est pas le bon code d'accès.",
      forgotPrefix: "Oublié ? Rien de ce qui est enregistré ici ne peut être ouvert sans lui, ni par vous ni par nous. La seule solution est de",
      forgotLinkText: "tout supprimer et repartir de zéro",
      forgotSuffix: ", puis d'importer un fichier exporté si vous en avez un.",
      forgetConfirm:
        "Supprimer tout ce qui est enregistré dans ce navigateur et repartir de zéro ? Sans le code d'accès, personne ne peut l'ouvrir, ni vous ni personne d'autre. Cette action est irréversible.",
    },
  },
  ar: {
    backToGames: "العودة إلى الألعاب",
    header: {
      skipToContent: "الانتقال إلى المحتوى",
      pagesLabel: "الصفحات",
      morePages: "المزيد من الصفحات",
      lock: "قفل",
      lockTitle: "قفل PitMaster الآن",
      calculator: "الآلة الحاسبة",
      calculatorTitle: "الآلة الحاسبة ({key})",
    },
    links: { games: "الألعاب", players: "اللاعبون", tvView: "عرض التلفاز" },
    shortcuts: { newCashGame: "لعبة نقدية جديدة", newTournament: "بطولة جديدة", chipSets: "مجموعات الرقائق" },
    commands: {
      goTo: "الانتقال إلى",
      gamesInProgress: "الألعاب الجارية",
      templates: "القوالب",
      newFromTemplate: "لعبة جديدة من «{name}»",
      lightTheme: "المظهر الفاتح",
      darkTheme: "المظهر الداكن",
      rakeOn: "تفعيل عمولة النادي في اللعبة النقدية",
      rakeOff: "إيقاف عمولة النادي في اللعبة النقدية",
      houseCutOn: "تفعيل عمولة الجهة المنظمة في البطولات",
      houseCutOff: "إيقاف عمولة الجهة المنظمة في البطولات",
      soundsOn: "تفعيل أصوات الواجهة",
      soundsOff: "إيقاف أصوات الواجهة",
      yourData: "بياناتك",
      exportEverything: "تصدير كل شيء",
      lockNow: "قفل PitMaster الآن",
      importFromFile: "الاستيراد من ملف",
      tools: "الأدوات",
      openCalculator: "فتح الآلة الحاسبة",
      closeCalculator: "إغلاق الآلة الحاسبة",
    },
    toast: {
      saveFailed: "تعذر الحفظ. قد تكون مساحة هذا المتصفح ممتلئة، أو أنه يمنع تخزين بيانات الموقع.",
      saveRecovered: "تم الحفظ. كل شيء محدث.",
      rakeOn: "الألعاب النقدية الجديدة تخصم عمولة الآن",
      rakeOff: "الألعاب النقدية الجديدة لم تعد تخصم عمولة",
      houseCutOn: "البطولات الجديدة تخصم عمولة الجهة المنظمة الآن",
      houseCutOff: "البطولات الجديدة لم تعد تخصم عمولة الجهة المنظمة",
      exported: "تم التصدير. على الجهاز الآخر، افتحه باستخدام الاستيراد.",
    },
    discardConfirm: "هل تريد حذف البيانات المحفوظة التي لا يمكن لهذا المتصفح فتحها، والبدء من جديد؟ لا يمكن التراجع عن هذا.",
    crashed: {
      title: "حدث خطأ ما.",
      tvBody: "واجهت هذه الشاشة مشكلة أثناء رسم اللعبة. ستحاول مجددًا خلال ثوانٍ قليلة.",
      pageBody: "واجهت هذه الصفحة مشكلة لم تتمكن من تجاوزها. ما تم حفظه آمن.",
      tryAgain: "المحاولة مجددًا",
    },
    unreadable: {
      title: "تعذر فتح البيانات المحفوظة",
      body1:
        "يقوم PitMaster بتشفير كل ما يحفظه بمفتاح لا يملكه سوى هذا المتصفح. هذا المفتاح ضاع، عادة لأن جزءًا من بيانات هذا الموقع قد مُسح، لذا لا يمكن لأي أحد قراءة ما هو محفوظ هنا، بما في ذلك نحن.",
      body2Prefix: "إذا كان لديك ملف مُصدَّر، ابدأ من جديد واستورده من",
      body2Suffix: ". إن لم يكن كذلك، فالبدء من جديد هو الطريق الوحيد للمضي قدمًا.",
      deleteAndStart: "حذفه والبدء من جديد",
    },
    memoryNotice: {
      bold: "لا شيء هنا يتم حفظه.",
      blocked: "يمنع هذا المتصفح تخزين بيانات الموقع الخاصة بـ PitMaster (نافذة خاصة، أو إعداد يمنع بيانات المواقع)، لذا لا يوجد مكان آمن لحفظ أي شيء.",
      insecure: "هذه الصفحة ليست على اتصال آمن (https)، لذا لا يمكن لمتصفحك التشفير، ولا يحفظ PitMaster أي شيء غير مشفر.",
      tail: "كل ما تفعله هنا يختفي عند إغلاق التبويب.",
    },
    saveTrouble: {
      bold: "تغييراتك الأخيرة لم تُحفظ بعد.",
      bodyPrefix:
        "قد تكون مساحة هذا المتصفح ممتلئة، أو أنه يمنع تخزين بيانات الموقع. يواصل PitMaster المحاولة كل بضع ثوانٍ، أبقِ هذا التبويب مفتوحًا حتى تنجح العملية، أو",
      exportLink: "صدّر نسخة احتياطية",
      bodySuffix: "لتكون في أمان.",
    },
    footer: {
      copyright: "© {year}",
      openSourceUnder: "مفتوح المصدر بموجب",
      licenseSuffix: ".",
      moreLabel: "المزيد",
      privacy: "الخصوصية",
      terms: "الشروط",
    },
    error: {
      notFoundTitle: "الصفحة غير موجودة",
      genericTitle: "خطأ",
      misdeal: "توزيع خاطئ.",
      notFoundBody: "لا توجد صفحة بهذا العنوان. ربما تم نقلها، أو أن الرابط به خطأ.",
      tryThatAgain: "حاول مرة أخرى.",
    },
    gameSelect: {
      depthTurbo: "سريع: {bb} من الرهانات الكبيرة",
      depthPlain: "{bb} من الرهانات الكبيرة",
      depthNormal: "عادي: {bb} من الرهانات الكبيرة",
      depthDeep: "عميق: {bb} من الرهانات الكبيرة",
      depthVeryDeep: "عميق جدًا: {bb} من الرهانات الكبيرة",
      minutes: "{n} دقيقة",
    },
    intro: {
      title: "أهلًا بك على الطاولة.",
      lede: "يدير PitMaster لعبة البوكر الخاصة بك، أيًا كان حجمها. أربع خطوات وتصبح جاهزًا للتوزيع.",
      dontShowAgain: "عدم إظهار هذا مجددًا",
      letsPlay: "لنبدأ اللعب",
      notePrefix: "هذا موجود أيضًا في",
      noteSuffix: "، أسفل كل صفحة.",
    },
    howItWorks: {
      step1Title: "جهّز رقائقك",
      step1Prefix: "ابدأ من مجموعة شائعة، أو",
      step1LinkText: "طابق الرقائق التي تلعب بها",
      step1Suffix: "، الألوان والقيم وعدد كل نوع.",
      step2Title: "أنشئ لعبة",
      step2Prefix: "",
      step2CashGame: "لعبة نقدية",
      step2Mid: "(الرهانات العمياء، قيمة الدخول، وتسوية الحسابات في النهاية) أو",
      step2Tournament: "بطولة",
      step2Suffix: "(ساعة رهانات مضبوطة على وقتك، وتوزيع جوائز، وإعادة دخول).",
      step3Title: "اعرضها على التلفاز",
      step3Prefix: "اضغط",
      step3OpenTv: "فتح نافذة التلفاز",
      step3Mid: "واسحبها إلى التلفاز. أو اضغط",
      step3GoLive: "البث المباشر",
      step3CodeMid: "، افتح",
      step3CodeSuffix: "على أي شاشة واكتب الرمز.",
      step4Title: "تحكّم بها من مقعدك",
      step4Body: "وزّع الأوراق من حاسوبك المحمول أو هاتفك. يواكب التلفاز ذلك تلقائيًا.",
    },
    docPage: {
      footerPrefix: "PitMaster هو مشروع جانبي مفتوح المصدر نشرته",
      footerMiddle: "، وشيفرته البرمجية موجودة على",
      codeSuffix: ". ",
      footerSeeAlso: "انظر أيضًا",
    },
    palette: {
      ariaLabel: "الأوامر",
      placeholder: "ما الذي تريد فعله؟",
      typeThenEnter: "اكتب {prompt}، ثم اضغط Enter.",
      noResults: "لا شيء يطابق «{query}».",
      move: "التنقل",
      run: "التشغيل",
    },
    lockScreen: {
      headTitle: "مقفل",
      title: "تم قفل PitMaster",
      body: "أدخل رمز الدخول للعودة إلى ألعابك. تستمر شاشات التلفاز في عرض اللعبة أثناء القفل.",
      passcodePlaceholder: "رمز الدخول",
      unlock: "فتح القفل",
      unlocking: "جارٍ فتح القفل…",
      tooManyTries: "محاولات خاطئة كثيرة جدًا. أعد المحاولة بعد {time}.",
      wrongPasscode: "هذا ليس رمز الدخول الصحيح.",
      forgotPrefix: "نسيته؟ لا يمكن فتح أي شيء محفوظ هنا بدونه، لا أنت ولا نحن. الطريق الوحيد للمضي قدمًا هو",
      forgotLinkText: "حذف كل شيء والبدء من جديد",
      forgotSuffix: "، ثم استيراد ملف مُصدَّر إن كان لديك واحد.",
      forgetConfirm: "هل تريد حذف كل ما هو محفوظ في هذا المتصفح والبدء من جديد؟ بدون رمز الدخول، لا يمكن لأحد فتحه، لا أنت ولا أي شخص آخر. لا يمكن التراجع عن هذا.",
    },
  },
  bn: {
    backToGames: "গেমসে ফিরে যান",
    header: {
      skipToContent: "মূল কনটেন্টে যান",
      pagesLabel: "পেজ",
      morePages: "আরও পেজ",
      lock: "লক",
      lockTitle: "এখনই PitMaster লক করুন",
      calculator: "ক্যালকুলেটর",
      calculatorTitle: "ক্যালকুলেটর ({key})",
    },
    links: { games: "গেমস", players: "খেলোয়াড়", tvView: "টিভি ভিউ" },
    shortcuts: { newCashGame: "নতুন ক্যাশ গেম", newTournament: "নতুন টুর্নামেন্ট", chipSets: "চিপ সেট" },
    commands: {
      goTo: "যান",
      gamesInProgress: "চলমান গেমস",
      templates: "টেমপ্লেট",
      newFromTemplate: "“{name}” থেকে নতুন গেম",
      lightTheme: "লাইট থিম",
      darkTheme: "ডার্ক থিম",
      rakeOn: "ক্যাশ গেমে রেক চালু করুন",
      rakeOff: "ক্যাশ গেমে রেক বন্ধ করুন",
      houseCutOn: "টুর্নামেন্টে হাউস কাট চালু করুন",
      houseCutOff: "টুর্নামেন্টে হাউস কাট বন্ধ করুন",
      soundsOn: "ইন্টারফেস সাউন্ড চালু করুন",
      soundsOff: "ইন্টারফেস সাউন্ড বন্ধ করুন",
      yourData: "আপনার ডেটা",
      exportEverything: "সব এক্সপোর্ট করুন",
      lockNow: "এখনই PitMaster লক করুন",
      importFromFile: "ফাইল থেকে ইমপোর্ট করুন",
      tools: "টুলস",
      openCalculator: "ক্যালকুলেটর খুলুন",
      closeCalculator: "ক্যালকুলেটর বন্ধ করুন",
    },
    toast: {
      saveFailed: "সংরক্ষণ করা যায়নি। এই ব্রাউজারে হয়তো জায়গা কম, অথবা এটি সাইট স্টোরেজ ব্লক করে রেখেছে।",
      saveRecovered: "সংরক্ষিত হয়েছে। সব কিছু আপ টু ডেট।",
      rakeOn: "নতুন ক্যাশ গেমে এখন রেক নেওয়া হবে",
      rakeOff: "নতুন ক্যাশ গেমে আর রেক নেওয়া হবে না",
      houseCutOn: "নতুন টুর্নামেন্টে এখন হাউস কাট নেওয়া হবে",
      houseCutOff: "নতুন টুর্নামেন্টে আর হাউস কাট নেওয়া হবে না",
      exported: "এক্সপোর্ট হয়েছে। অন্য ডিভাইসে, ইমপোর্ট দিয়ে এটি খুলুন।",
    },
    discardConfirm: "এই ব্রাউজার খুলতে পারছে না এমন সংরক্ষিত ডেটা মুছে নতুন করে শুরু করবেন? এটি ফিরিয়ে আনা যাবে না।",
    crashed: {
      title: "কিছু একটা ভেঙে গেছে।",
      tvBody: "গেম আঁকতে গিয়ে এই স্ক্রিনে সমস্যা হয়েছে। এটি কয়েক সেকেন্ড পর আবার চেষ্টা করবে।",
      pageBody: "এই পেজে এমন সমস্যা হয়েছে যা পার হতে পারেনি। যা সংরক্ষিত আছে তা নিরাপদ।",
      tryAgain: "আবার চেষ্টা করুন",
    },
    unreadable: {
      title: "সংরক্ষিত ডেটা খোলা যাচ্ছে না",
      body1:
        "PitMaster যা কিছু সংরক্ষণ করে তা এমন একটি কী দিয়ে এনক্রিপ্ট করে যা শুধু এই ব্রাউজারের কাছেই থাকে। সেই কী হারিয়ে গেছে, সাধারণত এই সাইটের কিছু ডেটা মুছে ফেলার কারণে, তাই এখানে সংরক্ষিত কিছু আর কেউ পড়তে পারবে না, এমনকি আমরাও না।",
      body2Prefix: "আপনার কাছে এক্সপোর্ট ফাইল থাকলে, নতুন করে শুরু করে সেটি",
      body2Suffix: " থেকে ইমপোর্ট করুন। নাহলে, নতুন করে শুরু করাই একমাত্র উপায়।",
      deleteAndStart: "মুছে নতুন করে শুরু করুন",
    },
    memoryNotice: {
      bold: "এখানে কিছুই সংরক্ষণ করা হচ্ছে না।",
      blocked: "এই ব্রাউজার PitMaster-এর জন্য সাইট স্টোরেজ ব্লক করে রেখেছে (একটি প্রাইভেট উইন্ডো, বা সাইট ডেটা ব্লক করার কোনো সেটিং), তাই কিছু নিরাপদে রাখার কোনো জায়গা নেই।",
      insecure: "এই পেজ কোনো সুরক্ষিত (https) সংযোগে নেই, তাই আপনার ব্রাউজার এনক্রিপ্ট করতে পারবে না, এবং PitMaster এনক্রিপ্ট ছাড়া কিছু সংরক্ষণ করে না।",
      tail: "ট্যাব বন্ধ হয়ে গেলে এখানে যা করেছেন তার সব হারিয়ে যাবে।",
    },
    saveTrouble: {
      bold: "আপনার সাম্প্রতিক পরিবর্তনগুলো এখনও সংরক্ষিত হয়নি।",
      bodyPrefix:
        "এই ব্রাউজারে হয়তো জায়গা কম, অথবা এটি সাইট স্টোরেজ ব্লক করে রেখেছে। PitMaster প্রতি কয়েক সেকেন্ডে আবার চেষ্টা করতে থাকে, এটি সফল না হওয়া পর্যন্ত এই ট্যাব খোলা রাখুন, অথবা",
      exportLink: "একটি ব্যাকআপ এক্সপোর্ট করুন",
      bodySuffix: "নিরাপদ থাকতে।",
    },
    footer: {
      copyright: "© {year}",
      openSourceUnder: "ওপেন সোর্স, লাইসেন্স:",
      licenseSuffix: ".",
      moreLabel: "আরও",
      privacy: "প্রাইভেসি",
      terms: "শর্তাবলী",
    },
    error: {
      notFoundTitle: "পেজ পাওয়া যায়নি",
      genericTitle: "ত্রুটি",
      misdeal: "ভুল বণ্টন।",
      notFoundBody: "এই ঠিকানায় কোনো পেজ নেই। এটি হয়তো সরানো হয়েছে, বা লিংকে ভুল আছে।",
      tryThatAgain: "আবার চেষ্টা করুন।",
    },
    gameSelect: {
      depthTurbo: "টার্বো: {bb}টি বিগ ব্লাইন্ড",
      depthPlain: "{bb}টি বিগ ব্লাইন্ড",
      depthNormal: "সাধারণ: {bb}টি বিগ ব্লাইন্ড",
      depthDeep: "ডিপ: {bb}টি বিগ ব্লাইন্ড",
      depthVeryDeep: "খুব ডিপ: {bb}টি বিগ ব্লাইন্ড",
      minutes: "{n} মিনিট",
    },
    intro: {
      title: "টেবিলে স্বাগতম।",
      lede: "PitMaster আপনার পোকার গেম চালায়, তা যত বড় বা ছোটই হোক না কেন। মাত্র চারটি ধাপ, তারপরই আপনি বণ্টন শুরু করতে পারবেন।",
      dontShowAgain: "এটি আর দেখাবেন না",
      letsPlay: "খেলা শুরু করি",
      notePrefix: "এটি",
      noteSuffix: "-এও আছে, প্রতিটি পেজের নিচে।",
    },
    howItWorks: {
      step1Title: "আপনার চিপস সেট করুন",
      step1Prefix: "একটি সাধারণ সেট দিয়ে শুরু করুন, অথবা",
      step1LinkText: "আপনি যে চিপস দিয়ে খেলেন তার সাথে মেলান",
      step1Suffix: ", রং, মান এবং প্রতিটির সংখ্যা।",
      step2Title: "একটি গেম তৈরি করুন",
      step2Prefix: "একটি",
      step2CashGame: "ক্যাশ গেম",
      step2Mid: "(ব্লাইন্ড, বাই-ইন এবং শেষে হিসাব মেটানো) অথবা একটি",
      step2Tournament: "টুর্নামেন্ট",
      step2Suffix: "(আপনার সময় অনুযায়ী ব্লাইন্ড ক্লক, পুরস্কার বণ্টন এবং রিবাই)।",
      step3Title: "টিভিতে দেখান",
      step3Prefix: "চাপুন",
      step3OpenTv: "ওপেন টিভি উইন্ডো",
      step3Mid: "এবং সেটি টিভিতে টেনে আনুন। অথবা চাপুন",
      step3GoLive: "গো লাইভ",
      step3CodeMid: ", যেকোনো স্ক্রিনে",
      step3CodeSuffix: "খুলুন এবং কোডটি টাইপ করুন।",
      step4Title: "নিজের জায়গা থেকে চালান",
      step4Body: "আপনার ল্যাপটপ বা ফোন থেকে বণ্টন করুন। টিভি নিজে থেকেই সমান তালে চলবে।",
    },
    docPage: {
      footerPrefix: "PitMaster একটি ওপেন সোর্স সাইড প্রজেক্ট, যা প্রকাশ করেছে",
      footerMiddle: ", এবং এর কোড",
      codeSuffix: "-এ আছে। ",
      footerSeeAlso: "আরও দেখুন",
    },
    palette: {
      ariaLabel: "কমান্ড",
      placeholder: "আপনি কী করতে চান?",
      typeThenEnter: "{prompt} টাইপ করুন, তারপর Enter চাপুন।",
      noResults: "“{query}”-এর সাথে কিছু মেলে না।",
      move: "মুভ",
      run: "রান",
    },
    lockScreen: {
      headTitle: "লকড",
      title: "PitMaster লক করা আছে",
      body: "আপনার গেমসে ফিরে যেতে পাসকোড লিখুন। লক থাকা অবস্থায়ও টিভি স্ক্রিনে গেম দেখাতে থাকবে।",
      passcodePlaceholder: "পাসকোড",
      unlock: "আনলক করুন",
      unlocking: "আনলক হচ্ছে…",
      tooManyTries: "অনেক বেশি ভুল চেষ্টা। {time} পরে আবার চেষ্টা করুন।",
      wrongPasscode: "এটি সঠিক পাসকোড নয়।",
      forgotPrefix: "ভুলে গেছেন? এটি ছাড়া এখানে সংরক্ষিত কিছুই খোলা যাবে না, আপনিও না, আমরাও না। এগিয়ে যাওয়ার একমাত্র উপায় হলো",
      forgotLinkText: "সব মুছে নতুন করে শুরু করা",
      forgotSuffix: ", তারপর আপনার কাছে থাকলে একটি এক্সপোর্ট ফাইল ইমপোর্ট করা।",
      forgetConfirm: "এই ব্রাউজারে সংরক্ষিত সব কিছু মুছে নতুন করে শুরু করবেন? পাসকোড ছাড়া এটি কেউ খুলতে পারবে না, আপনিও না, অন্য কেউও না। এটি ফিরিয়ে আনা যাবে না।",
    },
  },
  pt: {
    backToGames: "Voltar aos jogos",
    header: {
      skipToContent: "Pular para o conteúdo",
      pagesLabel: "Páginas",
      morePages: "Mais páginas",
      lock: "Bloquear",
      lockTitle: "Bloquear o PitMaster agora",
      calculator: "Calculadora",
      calculatorTitle: "Calculadora ({key})",
    },
    links: { games: "Jogos", players: "Jogadores", tvView: "Visualização de TV" },
    shortcuts: { newCashGame: "Novo cash game", newTournament: "Novo torneio", chipSets: "Conjuntos de fichas" },
    commands: {
      goTo: "Ir para",
      gamesInProgress: "Jogos em andamento",
      templates: "Modelos",
      newFromTemplate: "Novo a partir de “{name}”",
      lightTheme: "Tema claro",
      darkTheme: "Tema escuro",
      rakeOn: "Ativar rake nos cash games",
      rakeOff: "Desativar rake nos cash games",
      houseCutOn: "Ativar comissão da casa nos torneios",
      houseCutOff: "Desativar comissão da casa nos torneios",
      soundsOn: "Ativar sons da interface",
      soundsOff: "Desativar sons da interface",
      yourData: "Seus dados",
      exportEverything: "Exportar tudo",
      lockNow: "Bloquear o PitMaster agora",
      importFromFile: "Importar de um arquivo",
      tools: "Ferramentas",
      openCalculator: "Abrir calculadora",
      closeCalculator: "Fechar calculadora",
    },
    toast: {
      saveFailed: "Não foi possível salvar. Este navegador pode estar sem espaço, ou bloqueando o armazenamento do site.",
      saveRecovered: "Salvo. Tudo está em dia.",
      rakeOn: "Os novos cash games agora cobram rake",
      rakeOff: "Os novos cash games não cobram mais rake",
      houseCutOn: "Os novos torneios agora cobram comissão da casa",
      houseCutOff: "Os novos torneios não cobram mais comissão da casa",
      exported: "Exportado. No outro dispositivo, abra com Importar.",
    },
    discardConfirm: "Excluir os dados salvos que este navegador não consegue abrir e começar do zero? Isso não pode ser desfeito.",
    crashed: {
      title: "Algo quebrou.",
      tvBody: "Esta tela teve um problema ao desenhar o jogo. Ela tenta de novo em alguns segundos.",
      pageBody: "Esta página teve um problema que não conseguiu superar. O que está salvo está seguro.",
      tryAgain: "Tentar de novo",
    },
    unreadable: {
      title: "Os dados salvos não podem ser abertos",
      body1:
        "O PitMaster criptografa tudo o que salva com uma chave que só este navegador possui. Essa chave se perdeu, geralmente porque parte dos dados deste site foi apagada, então o que está salvo aqui não pode ser lido por ninguém, nem mesmo por nós.",
      body2Prefix: "Se você tiver um arquivo exportado, comece do zero e importe-o em",
      body2Suffix: ". Caso contrário, começar do zero é o único caminho.",
      deleteAndStart: "Excluir tudo e começar do zero",
    },
    memoryNotice: {
      bold: "Nada aqui está sendo salvo.",
      blocked:
        "Este navegador está bloqueando o armazenamento do site para o PitMaster (uma janela privada, ou uma configuração que bloqueia dados do site), então não há onde guardar nada com segurança.",
      insecure: "Esta página não está numa conexão segura (https), então seu navegador não pode criptografar, e o PitMaster não salva nada sem criptografia.",
      tail: "Tudo o que você fizer aqui desaparece quando a aba fechar.",
    },
    saveTrouble: {
      bold: "Suas últimas alterações ainda não foram salvas.",
      bodyPrefix:
        "Este navegador pode estar sem espaço, ou bloqueando o armazenamento do site. O PitMaster continua tentando a cada poucos segundos, mantenha esta aba aberta até que funcione, ou",
      exportLink: "exporte um backup",
      bodySuffix: "para garantir.",
    },
    footer: {
      copyright: "© {year}",
      openSourceUnder: "Código aberto sob a",
      licenseSuffix: ".",
      moreLabel: "Mais",
      privacy: "Privacidade",
      terms: "Termos",
    },
    error: {
      notFoundTitle: "Página não encontrada",
      genericTitle: "Erro",
      misdeal: "Mão mal distribuída.",
      notFoundBody: "Não há nenhuma página neste endereço. Ela pode ter sido movida, ou o link pode ter um erro de digitação.",
      tryThatAgain: "Tente de novo.",
    },
    gameSelect: {
      depthTurbo: "Turbo: {bb} big blinds",
      depthPlain: "{bb} big blinds",
      depthNormal: "Normal: {bb} big blinds",
      depthDeep: "Profundo: {bb} big blinds",
      depthVeryDeep: "Muito profundo: {bb} big blinds",
      minutes: "{n} minutos",
    },
    intro: {
      title: "Bem-vindo à mesa.",
      lede: "O PitMaster administra o seu jogo de pôquer, seja qual for o tamanho. Quatro passos e você já está distribuindo as cartas.",
      dontShowAgain: "Não mostrar isso de novo",
      letsPlay: "Vamos jogar",
      notePrefix: "Isso também está em",
      noteSuffix: ", no rodapé de cada página.",
    },
    howItWorks: {
      step1Title: "Configure suas fichas",
      step1Prefix: "Comece com um conjunto comum, ou",
      step1LinkText: "iguale às fichas com que você joga",
      step1Suffix: ": cores, valores e quantas de cada uma.",
      step2Title: "Crie um jogo",
      step2Prefix: "Um",
      step2CashGame: "cash game",
      step2Mid: "(blinds, buy-ins e um acerto de contas no final) ou um",
      step2Tournament: "torneio",
      step2Suffix: "(um relógio de blinds ajustado ao seu tempo, distribuição de prêmios e rebuys).",
      step3Title: "Coloque na TV",
      step3Prefix: "Toque em",
      step3OpenTv: "Abrir janela da TV",
      step3Mid: "e arraste para a TV. Ou toque em",
      step3GoLive: "Entrar ao vivo",
      step3CodeMid: ", abra",
      step3CodeSuffix: "em qualquer tela e digite o código.",
      step4Title: "Controle do seu lugar",
      step4Body: "Distribua pelo seu notebook ou celular. A TV se mantém atualizada sozinha.",
    },
    docPage: {
      footerPrefix: "O PitMaster é um projeto paralelo de código aberto publicado por",
      footerMiddle: ", e seu código está no",
      codeSuffix: ". ",
      footerSeeAlso: "Veja também",
    },
    palette: {
      ariaLabel: "Comandos",
      placeholder: "O que você quer fazer?",
      typeThenEnter: "Digite {prompt} e pressione Enter.",
      noResults: "Nada corresponde a “{query}”.",
      move: "Mover",
      run: "Executar",
    },
    lockScreen: {
      headTitle: "Bloqueado",
      title: "O PitMaster está bloqueado",
      body: "Digite o código de acesso para voltar aos seus jogos. As telas de TV continuam mostrando o jogo enquanto ele está bloqueado.",
      passcodePlaceholder: "Código de acesso",
      unlock: "Desbloquear",
      unlocking: "Desbloqueando…",
      tooManyTries: "Tentativas erradas demais. Tente de novo em {time}.",
      wrongPasscode: "Esse não é o código de acesso.",
      forgotPrefix: "Esqueceu? Nada do que está salvo aqui pode ser aberto sem ele, nem por você nem por nós. O único caminho é",
      forgotLinkText: "excluir tudo e começar do zero",
      forgotSuffix: ", depois importar um arquivo exportado, se você tiver um.",
      forgetConfirm:
        "Excluir tudo o que está salvo neste navegador e começar do zero? Sem o código de acesso, ninguém consegue abrir, nem você nem mais ninguém. Isso não pode ser desfeito.",
    },
  },
};

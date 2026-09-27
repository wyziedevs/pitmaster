// the "settings" namespace: the whole /settings page (appearance, sound,
// keyboard, language & region, the game/defaults/chips/tv tabs, the passcode
// lock, and export/import/backup).
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

export interface SettingsDict {
  page: {
    title: string;
    heading: string;
    savedHint: string;
    exportLink: string;
    savedHintEnd: string;
  };
  nav: {
    groups: { games: string; you: string };
    tabs: { game: string; defaults: string; chips: string; tv: string; general: string; yours: string };
  };
  language: { title: string; hint: string };
  region: {
    heading: string;
    currency: { label: string; hint: string; hintEnd: string; names: { USD: string; EUR: string; JPY: string; GBP: string; CNY: string; AUD: string } };
    time: { label: string; hint: string; h12: string; h24: string }; // hint: {time}
  };
  appearance: {
    heading: string;
    theme: { label: string; hint: string; system: string; light: string; dark: string };
    sounds: { label: string; hint: string };
    volume: { label: string; hint: string; hintOn: string; hintOff: string; disabledTitle: string };
    motion: { label: string; hint: string; system: string; reduced: string };
    toys: { label: string; hint: string };
  };
  keyboard: {
    heading: string;
    openCommands: {
      label: string;
      hint: string;
      pressNewKeys: string;
      andAKey: string;
      escToKeep: string; // {key}
      resetButton: string; // {key}
      saved: string; // {key}
      resetTo: string; // {key}
    };
    otherShortcuts: { label: string; hint: string };
  };
  general: { heading: string };
  game: {
    heading: string;
    lede: string;
    rake: { label: string; hint: string; checkbox: string };
    houseCut: { label: string; hint: string; checkbox: string };
    extras: {
      heading: string;
      hint: string;
      bounties: { label: string; hint: string };
      rebuys: { label: string; hint: string };
      seats: { label: string; hint: string };
      deals: { label: string; hint: string };
      payLinks: { label: string; hint: string };
      costs: { label: string; hint: string };
      ledger: { label: string; hint: string };
      bombPots: { label: string; hint: string };
      sevenTwo: { label: string; hint: string };
      highHand: { label: string; hint: string };
    };
  };
  house: {
    heading: string;
    hint: string;
    placeholder: string;
    commonOnes: string;
    onNewGame: string;
    commonRules: {
      cardsSpeak: string;
      showOneShowAll: string;
      verbalBinding: string;
      noStringBets: string;
      onePlayerToAHand: string;
      protectYourHand: string;
      chipsStayOnTable: string;
      straddlesWelcome: string;
      runItTwice: string;
      chopBlinds: string;
      phonesDown: string;
      rebuysBetweenHands: string;
      newDeckOnRequest: string;
      lastHandAnnounced: string;
      settleUp: string;
      finalSay: string;
    };
  };
  defaults: {
    heading: string;
    lede: string;
    auto: string;
    length: { label: string; about: string }; // about: {time}
    tournaments: {
      heading: string;
      buyIn: { label: string; hint: string }; // label: {sym}
      players: { label: string; hint: string };
      startingStack: { label: string; hint: string };
      startingDepth: { label: string; hint: string };
      length: { hint: string };
      levelLength: { label: string };
      breaks: { label: string; hint: string; levelsBetween: string; minutes: string };
      antes: { label: string; hint: string; antesFrom: string; lateRegThrough: string };
      rebuys: { label: string; hint: string; checkbox: string; throughLevel: string; addOnCheckbox: string; cost: string }; // cost: {sym}
      bounty: { label: string; hint: string }; // label: {sym}
      bountyKind: { label: string; hint: string };
      payouts: { label: string; hint: string };
      roundTo: { label: string; hint: string }; // hint: {amount}
    };
    cash: {
      heading: string;
      buyIn: { label: string; hint: string; min: string; standard: string; max: string };
      length: { hint: string };
      straddles: { label: string; checkbox: string };
      bomb: { label: string; hint: string; anteBB: string; every: string };
      sevenTwo: { label: string; hint: string };
      highHand: { label: string; hint: string };
    };
    both: {
      heading: string;
      seatsPerTable: { label: string; hint: string; option: string }; // option: {n}
    };
    templates: {
      heading: string;
      empty: string;
      typeCash: string;
      typeTournament: string;
      playersCount: Plural; // {n}
      deleteAriaLabel: string; // {name}
      deleteConfirm: string; // {name}
      deletedToast: string; // {name}
      savedSetups: { label: string; hintBefore: string; saveAsTemplate: string; hintAfter: string };
    };
  };
  chips: { heading: string; lede: string };
  tv: {
    heading: string;
    levelWarning: { label: string; hint: string; before1: string; before2: string; before5: string };
    sound: { label: string; hint: string; checkbox: string };
    volume: { label: string; hint: string };
    keepAwake: { label: string; hint: string; checkbox: string };
    announcer: { label: string; hint: string; checkbox: string; hearIt: string; sample: string };
    money: { label: string; hint: string; checkbox: string };
  };
  yours: { heading: string };
  lock: {
    heading: string;
    intro: string;
    needsHttps: string;
    passcode: {
      label: string;
      hint: string; // {n}
      newPlaceholder: string;
      newAriaLabel: string;
      againPlaceholder: string;
      againAriaLabel: string;
      tooShort: string; // {n}
      mismatch: string;
      turnOnButton: string;
      turningOn: string;
    };
    autoLock: {
      label: string;
      hint: string;
      lockNowButton: string;
      options: {
        sec30: string;
        min1: string;
        min2: string;
        min5: string;
        min10: string;
        min15: string;
        min30: string;
        hour1: string;
        onClose: string;
      };
      phrase: {
        sec30: string;
        min1: string;
        min2: string;
        min5: string;
        min10: string;
        min15: string;
        min30: string;
        hour1: string;
        onClose: string;
        awhile: string;
      };
    };
    changeOrOff: {
      label: string;
      hint: string;
      currentPlaceholder: string;
      currentAriaLabel: string;
      typeCurrentFirst: string;
      changeButton: string;
      changingBusy: string;
      turnOffButton: string;
    };
    error: { wrongPasscode: string; generic: string };
    toast: { off: string; on: string; onWithAuto: string }; // onWithAuto: {phrase}
  };
  data: {
    heading: string;
    lede: string; // {summary}, {kb}
    privacyLink: string;
    summary: { join: string }; // {rest}, {last}
    count: {
      games: Plural; // {n}
      chipSets: Plural; // {n}
      templates: Plural; // {n}
      newGames: Plural; // {n}
      payLinksFor: Plural; // {n}
      inProgress: string; // {n}
    };
    export: {
      label: string;
      hint: string;
      button: string;
      busy: string;
      lastExported: string; // {time}
      includeSettings: string;
      lockWithPassword: string;
      passwordPlaceholder: string;
      passwordAriaLabel: string;
      passwordNote: string; // {n}
      passwordTitle: string; // {n}
      toast: { locked: string; plain: string; lockFailed: string };
    };
    import: {
      label: string;
      hint: string;
      kindGame: string;
      kindEverything: string;
      exportedAt: string; // {day}, {time}
      plusSettings: string;
      modeAriaLabel: string;
      modeMerge: string;
      modeReplace: string;
      replaceCount: Plural; // {n}
      replaceOthers: string;
      newerCount: string; // {n}
      keptCount: string; // {n}
      noGames: string;
      nothingDeleted: string;
      useSettingsToo: { label: string; hint: string };
      importButton: string;
      importedToast: Plural; // {n}
      undoneToast: string;
      lockedWithPassword: string;
      filePasswordAriaLabel: string;
      typePasswordFirst: string;
      unlockingBusy: string;
      unlockButton: string;
      dropAriaLabel: string;
      chooseFile: string;
      orDropHere: string;
      importedLabel: string;
      readyToRun: string;
      inProgress: string;
      undoButton: string;
      error: { tooBig: string; failed: string }; // failed: {message}
    };
    startOver: { label: string; hint: string; button: string; confirm: string; doneToast: string };
  };
}

export const settings: Record<Lang, SettingsDict> = {
  en: {
    page: {
      title: "Settings",
      heading: "Settings",
      savedHint: "Saved in this browser, encrypted. To take them to another device,",
      exportLink: "export",
      savedHintEnd: "them with your games.",
    },
    nav: {
      groups: { games: "Games", you: "You" },
      tabs: { game: "Your Game", defaults: "New Games", chips: "Chip Sets", tv: "TV", general: "General", yours: "Your Data" },
    },
    language: {
      title: "Language",
      hint: "What PitMaster's own text is written in. Guessed from your browser at first, and always changeable here. Games and buy-ins use the currency below, not this.",
    },
    region: {
      heading: "Language & Region",
      currency: {
        label: "Currency",
        hint: "How buy-ins, pots and cash chips are written:",
        hintEnd: "Live TVs follow this one.",
        names: { USD: "US Dollar ($)", EUR: "Euro (€)", JPY: "Japanese Yen (¥)", GBP: "British Pound (£)", CNY: "Chinese Yuan (¥)", AUD: "Australian Dollar ($)" },
      },
      time: { label: "Time", hint: "Start times, bust times and the TV's clock. It's {time}.", h12: "12-Hour", h24: "24-Hour" },
    },
    appearance: {
      heading: "Appearance",
      theme: { label: "Theme", hint: "System follows your device, and so does the TV.", system: "System", light: "Light", dark: "Dark" },
      sounds: {
        label: "Interface Sounds",
        hint: "Quiet clicks under buttons and switches, chips clacking when money moves, and every chip its own note when you tap it. The TV's alarms are separate.",
      },
      volume: {
        label: "Interface Volume",
        hint: "How loud those clicks and clacks are.",
        hintOn: "Let go of the slider to hear it.",
        hintOff: "Turn on Interface Sounds to set it.",
        disabledTitle: "Interface Sounds are off",
      },
      motion: {
        label: "Motion",
        hint: "System follows your device's reduce-motion setting. Reduced turns off the slides, flips and page swaps here and on the TV.",
        system: "System",
        reduced: "Reduced",
      },
      toys: {
        label: "Home Page Toys",
        hint: "Cards to fan, chips to sort, dice, a bill counter and a roulette wheel to fidget with beside the headline. Off keeps the home page to your games.",
      },
    },
    keyboard: {
      heading: "Keyboard",
      openCommands: {
        label: "Open Commands",
        hint: 'The command box does anything by name: go to a page, start a template, or "bust mike" on the dealer screen. Click the shortcut, then press the keys you want.',
        pressNewKeys: "Press the New Keys",
        andAKey: "and a Key",
        escToKeep: "Esc to keep {key}",
        resetButton: "Reset to {key}",
        saved: "Saved. {key} opens Commands now.",
        resetTo: "Back to {key}.",
      },
      otherShortcuts: { label: "Other Shortcuts", hint: "These are fixed. None of them fire while you're typing in a box." },
    },
    general: { heading: "General" },
    game: {
      heading: "Your Game",
      lede: "Turn on what your games use, whatever their size. Anything off stays off new games and the dealer screen, and a new game can still add it just for that game.",
      rake: {
        label: "Cash Game Rake",
        hint: "A cut of each pot into a rake box, or a flat fee to sit down. New games start with what you set here.",
        checkbox: "Take a Rake or Seat Fee",
      },
      houseCut: { label: "Tournament House Cut", hint: "A flat fee per entry, a percent of the rest, or both.", checkbox: "Take a Cut of Each Buy-In" },
      extras: {
        heading: "Extras",
        hint: "A game that already uses one keeps it.",
        bounties: { label: "Bounties & Knockouts", hint: "A bounty on every head, and who knocked out who." },
        rebuys: { label: "Rebuys & Add-Ons", hint: "Buying back in, and topping up at the first break." },
        seats: { label: "Seat Draw & Tables", hint: "Drawing seats, and balancing tables as players bust." },
        deals: { label: "Final Table Deals", hint: "The ICM and chip-chop calculator." },
        payLinks: { label: "Pay Links", hint: "Venmo, Cash App and PayPal links in settle-up and payouts." },
        costs: { label: "Shared Costs", hint: "Split what was bought for the game, like food or a new deck. It goes into settle-up, not into anyone's results." },
        ledger: { label: "Who Owes Who", hint: "Tick off settle-up payments as they're made. Players shows what's still owed across every game." },
        bombPots: { label: "Bomb Pots", hint: "Cash games: everyone antes and the flop comes with no betting first. Called by hand or on a timer." },
        sevenTwo: { label: "The 7-2 Game", hint: "Cash games: winning a hand with 7-2 collects a set amount from everyone dealt in." },
        highHand: { label: "High Hand", hint: "Cash games: the best hand in each stretch of play wins a prize the house pays." },
      },
    },
    house: {
      heading: "House Rules",
      hint: "One per line. They go on the TV under the clock, taking turns when there are more than two.",
      placeholder: "No string bets.\nRebuys close at the first break.",
      commonOnes: "Common Ones:",
      onNewGame: "Put Them on Every New Game",
      commonRules: {
        cardsSpeak: "Cards speak.",
        showOneShowAll: "Show one, show all.",
        verbalBinding: "Verbal action is binding.",
        noStringBets: "No string bets.",
        onePlayerToAHand: "One player to a hand.",
        protectYourHand: "Protect your hand.",
        chipsStayOnTable: "Chips stay on the table.",
        straddlesWelcome: "Straddles are welcome.",
        runItTwice: "Run it twice if both players agree.",
        chopBlinds: "Chop the blinds if it folds to them.",
        phonesDown: "Phones down during a hand.",
        rebuysBetweenHands: "Rebuys between hands only.",
        newDeckOnRequest: "New deck on request.",
        lastHandAnnounced: "The last hand is announced.",
        settleUp: "Settle up before you leave.",
        finalSay: "Whoever runs the game has the final say.",
      },
    },
    defaults: {
      heading: "New Games",
      lede: "Where a new game starts. Every one of these can still be changed on the game itself, and a template sets its own.",
      auto: "Auto",
      length: { label: "Length", about: "About {time}" },
      tournaments: {
        heading: "Tournaments",
        buyIn: { label: "Buy-In {sym}", hint: "Rebuys start at the same price." },
        players: { label: "Players", hint: "How many usually play. Stacks, chip math and payouts start from it." },
        startingStack: { label: "Starting Stack", hint: "Leave it blank and each game picks one that fits its chip set and players." },
        startingDepth: { label: "Starting Depth", hint: "The stack in big blinds at level 1." },
        length: { hint: "The blind structure is built to wrap up around then." },
        levelLength: { label: "Level Length" },
        breaks: { label: "Breaks", hint: "0 levels means no breaks.", levelsBetween: "Levels Between Breaks", minutes: "Break Minutes" },
        antes: {
          label: "Antes and Late Registration",
          hint: "0 means no antes. Late registration closes after the level you pick.",
          antesFrom: "Antes From Level",
          lateRegThrough: "Late Registration Through Level",
        },
        rebuys: {
          label: "Rebuys & Add-Ons",
          hint: "Rebuys cost the buy-in and give a starting stack. The add-on comes at the first break.",
          checkbox: "Rebuys",
          throughLevel: "Through Level",
          addOnCheckbox: "Add-On",
          cost: "Cost {sym}",
        },
        bounty: { label: "Bounty {sym}", hint: "The part of each buy-in that sits on the player's head. 0 means none." },
        bountyKind: { label: "Bounty Kind", hint: "Flat pays the whole bounty for a knockout. Progressive (PKO) pays half and adds half to the winner's own bounty. Mystery opens a random envelope for each knockout once the envelopes come out." },
        payouts: { label: "Payouts", hint: "Percentages, 1st place first, like 50, 30, 20. Leave it blank and they're picked by how many play." },
        roundTo: { label: "Round Payouts To", hint: "So no one is paid {amount}. Whatever's left over goes to 1st." },
      },
      cash: {
        heading: "Cash Games",
        buyIn: {
          label: "Buy-In",
          hint: "In big blinds, so it works at any stakes. The amounts come from each game's blinds.",
          min: "Min",
          standard: "Standard",
          max: "Max",
        },
        length: { hint: "For the end time and chip math. Cash games can always run long." },
        straddles: { label: "Straddles", checkbox: "Straddles Allowed" },
        bomb: { label: "Bomb Pots", hint: "The ante in big blinds, and how often one comes due.", anteBB: "Ante (Big Blinds)", every: "Every How Many Minutes (0 = When Called)" },
        sevenTwo: { label: "The 7-2 Game (Big Blinds)", hint: "What a 7-2 win collects from each player." },
        highHand: { label: "High Hand", hint: "The prize, and how long each window runs." },
      },
      both: {
        heading: "Both",
        seatsPerTable: { label: "Seats per Table", hint: "For drawing seats and balancing tables.", option: "{n} Seats" },
      },
      templates: {
        heading: "Templates",
        empty: "No templates yet.",
        typeCash: "Cash",
        typeTournament: "Tournament",
        playersCount: { one: "{n} player", other: "{n} players" },
        deleteAriaLabel: "Delete template {name}",
        deleteConfirm: 'Delete the template "{name}"? Games made from it stay.',
        deletedToast: 'Deleted "{name}"',
        savedSetups: {
          label: "Saved Setups",
          hintBefore: "Make one from",
          saveAsTemplate: "Save as Template",
          hintAfter: "on a new game; start from one there or from Commands",
        },
      },
    },
    chips: {
      heading: "Chip Sets",
      lede: "The chips you play with. Value is what's printed on the chip; each game can scale it (a chip printed 1 can play as 100 in a tournament). New games start with the default set.",
    },
    tv: {
      heading: "TV",
      levelWarning: {
        label: "Level Warning",
        hint: "The TV beeps and the clock turns red before the blinds go up. The last minute blinks.",
        before1: "1 Minute Before",
        before2: "2 Minutes Before",
        before5: "5 Minutes Before",
      },
      sound: { label: "Sound", hint: "Browsers need one click on the TV before it can play sound, so the TV asks for it.", checkbox: "Start TV Screens With Sound On" },
      volume: {
        label: "TV Volume",
        hint: "The beeps, the countdown ticks and the announcer. A TV on another device follows this too. Let go of the slider to hear the level-up sound.",
      },
      keepAwake: {
        label: "Keep Awake",
        hint: "So the screen doesn't dim in the middle of a level. Works in Chrome, Edge and Safari.",
        checkbox: "Keep the TV On While the Clock Runs",
      },
      announcer: {
        label: "Announcer",
        hint: "After the beep, the TV reads the new blinds, breaks, busts and the winner out loud, in the device's own voice.",
        checkbox: "Read Big Moments Out Loud",
        hearIt: "Hear It",
        sample: "Level 5. Blinds are 200, 400, with a 400 ante.",
      },
      money: {
        label: "Money on the TV",
        hint: "Turn off to keep the prize pool, payouts and buy-ins off the big screen. The dealer screen still shows everything.",
        checkbox: "Show Money Amounts on the TV",
      },
    },
    yours: { heading: "Your Data" },
    lock: {
      heading: "Passcode Lock",
      intro:
        "Everything here is already encrypted. A passcode goes further: nothing saved can be opened without it, even by someone using this browser, and PitMaster locks itself after a while with no input. TV screens keep showing the game while it's locked, and nothing on them can change it.",
      needsHttps: "It needs a secure (https) page, where this browser can encrypt.",
      passcode: {
        label: "Passcode",
        hint: "At least {n} characters, and longer is harder to crack if someone copies this browser's files. Forget it and everything saved here is gone for good, so export first.",
        newPlaceholder: "New Passcode",
        newAriaLabel: "New passcode",
        againPlaceholder: "Type It Again",
        againAriaLabel: "New passcode, again",
        tooShort: "At least {n} characters.",
        mismatch: "The two don't match yet.",
        turnOnButton: "Turn On the Lock",
        turningOn: "Locking…",
      },
      autoLock: {
        label: "Auto-Lock",
        hint: "After this long with no clicks, taps or keys in any PitMaster tab. TV screens don't count and don't lock.",
        lockNowButton: "Lock Now",
        options: {
          sec30: "After 30 Seconds",
          min1: "After 1 Minute",
          min2: "After 2 Minutes",
          min5: "After 5 Minutes",
          min10: "After 10 Minutes",
          min15: "After 15 Minutes",
          min30: "After 30 Minutes",
          hour1: "After 1 Hour",
          onClose: "Only When PitMaster Closes",
        },
        phrase: {
          sec30: "after 30 seconds",
          min1: "after 1 minute",
          min2: "after 2 minutes",
          min5: "after 5 minutes",
          min10: "after 10 minutes",
          min15: "after 15 minutes",
          min30: "after 30 minutes",
          hour1: "after 1 hour",
          onClose: "only when it closes",
          awhile: "after a while",
        },
      },
      changeOrOff: {
        label: "Change or Turn Off",
        hint: "Both take the current passcode. Everything is encrypted either way.",
        currentPlaceholder: "Current Passcode",
        currentAriaLabel: "Current passcode",
        typeCurrentFirst: "Type the current passcode first",
        changeButton: "Change Passcode",
        changingBusy: "Changing…",
        turnOffButton: "Turn Off the Lock",
      },
      error: { wrongPasscode: "That's not the current passcode.", generic: "Couldn't change it. Nothing was changed; try again." },
      toast: { off: "Lock off. Everything's still encrypted.", on: "Locked with a passcode.", onWithAuto: "Locked with a passcode. PitMaster locks {phrase} with no input." },
    },
    data: {
      heading: "Export & Import",
      lede: "Everything is saved in this browser, encrypted: {summary} ({kb} KB). There's no account and no cloud copy, so a file is how it gets to another device.",
      privacyLink: "How Your Data Is Handled",
      summary: { join: "{rest} and {last}" },
      count: {
        games: { one: "{n} game", other: "{n} games" },
        chipSets: { one: "{n} chip set", other: "{n} chip sets" },
        templates: { one: "{n} template", other: "{n} templates" },
        newGames: { one: "{n} new game", other: "{n} new games" },
        payLinksFor: { one: "pay links for {n} person", other: "pay links for {n} people" },
        inProgress: "({n} in progress)",
      },
      export: {
        label: "Export",
        hint: "One file with all of it. Keep it as a backup, or import it on another device and carry on from there. Without a password, anyone who has the file can read it.",
        button: "Export Everything",
        busy: "Locking…",
        lastExported: "Last exported {time}.",
        includeSettings: "Include These Settings",
        lockWithPassword: "Lock It With a Password",
        passwordPlaceholder: "Password",
        passwordAriaLabel: "Password for the file",
        passwordNote:
          "At least {n} characters, and longer is stronger. Encrypted with AES-256. Importing it takes this password, and a lost one can't be recovered, by you or by us.",
        passwordTitle: "Type a password of at least {n} characters, or turn off the lock",
        toast: {
          locked: "Exported and locked. Importing it takes the password.",
          plain: "Exported. On the other device, open it with Import.",
          lockFailed: "Couldn't lock the file. Try again, or export it without a password.",
        },
      },
      import: {
        label: "Import",
        hint: "A game in progress picks up right where it left off, clock, players and TV code included.",
        kindGame: "One game",
        kindEverything: "Everything",
        exportedAt: "exported {day} at {time}",
        plusSettings: ", plus settings",
        modeAriaLabel: "How to import",
        modeMerge: "Add to This Browser",
        modeReplace: "Replace Everything",
        replaceCount: { one: "The {n} game here is swapped for the file's", other: "The {n} games here are swapped for the file's" },
        replaceOthers: "Chip sets, templates and pay links too.",
        newerCount: "{n} newer than the copy here",
        keptCount: "{n} already up to date",
        noGames: "No games in it",
        nothingDeleted: "Nothing here is deleted.",
        useSettingsToo: {
          label: "Use Its Settings Too",
          hint: "House rules, money, game defaults and the TV. This screen's theme and sounds stay as they are.",
        },
        importButton: "Import",
        importedToast: { one: "Imported {n} game", other: "Imported {n} games" },
        undoneToast: "Import undone. Everything's as it was.",
        lockedWithPassword: "It's locked with a password.",
        filePasswordAriaLabel: "The file's password",
        typePasswordFirst: "Type the file's password first",
        unlockingBusy: "Unlocking…",
        unlockButton: "Unlock",
        dropAriaLabel: "Import a file",
        chooseFile: "Choose a File",
        orDropHere: "Or Drop It Here",
        importedLabel: "Imported.",
        readyToRun: "Ready to Run:",
        inProgress: "In Progress:",
        undoButton: "Undo Import",
        error: { tooBig: "That file is too big to be a PitMaster export.", failed: "That file didn't work. {message}" },
      },
      startOver: {
        label: "Start Over",
        hint: "Deletes every game and custom chip set in this browser. Can't be undone.",
        button: "Delete Everything",
        confirm: "Delete every game and custom chip set? This can't be undone. Export first if you might want them.",
        doneToast: "Everything's cleared. Fresh start.",
      },
    },
  },
  zh: {
    page: {
      title: "设置",
      heading: "设置",
      savedHint: "已加密保存在此浏览器中。要转移到其他设备,",
      exportLink: "导出",
      savedHintEnd: "连同你的对局一起。",
    },
    nav: {
      groups: { games: "对局", you: "个人" },
      tabs: { game: "本局设置", defaults: "新对局", chips: "筹码组", tv: "电视", general: "通用", yours: "你的数据" },
    },
    language: {
      title: "语言",
      hint: "PitMaster 界面文字所使用的语言。首次打开时会根据浏览器自动判断,之后可随时在这里更改。对局和买入金额使用下面的货币设置,与此无关。",
    },
    region: {
      heading: "语言与地区",
      currency: {
        label: "货币",
        hint: "买入、底池和现金筹码的书写方式:",
        hintEnd: "电视直播也会跟随这个设置。",
        names: { USD: "美元 ($)", EUR: "欧元 (€)", JPY: "日元 (¥)", GBP: "英镑 (£)", CNY: "人民币 (¥)", AUD: "澳元 ($)" },
      },
      time: { label: "时间", hint: "开始时间、出局时间和电视时钟。现在是 {time}。", h12: "12 小时制", h24: "24 小时制" },
    },
    appearance: {
      heading: "外观",
      theme: { label: "主题", hint: "跟随系统会随设备变化，电视屏幕也会跟随。", system: "跟随系统", light: "浅色", dark: "深色" },
      sounds: {
        label: "界面音效",
        hint: "按钮和开关的轻微点击声,资金变动时筹码碰撞的声音,以及点击每个筹码时它自己的音符。电视的提示音是单独设置的。",
      },
      volume: {
        label: "界面音量",
        hint: "这些点击和碰撞声的响度。",
        hintOn: "松开滑块即可听到效果。",
        hintOff: "先开启界面音效才能设置。",
        disabledTitle: "界面音效已关闭",
      },
      motion: {
        label: "动效",
        hint: "跟随系统会使用设备的减弱动态效果设置。精简会关闭这里和电视上的滑动、翻转和页面切换效果。",
        system: "跟随系统",
        reduced: "精简",
      },
      toys: {
        label: "首页小玩意",
        hint: "在标题旁边可以摆弄的扇形展开的扑克牌、可分类的筹码、骰子、点钞机和轮盘。关闭后首页只显示你的对局。",
      },
    },
    keyboard: {
      heading: "键盘",
      openCommands: {
        label: "打开命令面板",
        hint: "命令框可以按名称做任何事:跳转到某个页面、开始一个模板,或者在发牌员屏幕上“淘汰小明”。点击这个快捷键按钮,然后按下你想要的按键。",
        pressNewKeys: "请按下新的按键",
        andAKey: "以及一个按键",
        escToKeep: "按 Esc 保留 {key}",
        resetButton: "重置为 {key}",
        saved: "已保存。现在按 {key} 打开命令面板。",
        resetTo: "已恢复为 {key}。",
      },
      otherShortcuts: { label: "其他快捷键", hint: "这些是固定的。在输入框中打字时都不会触发。" },
    },
    general: { heading: "通用" },
    game: {
      heading: "本局设置",
      lede: "开启你的对局会用到的功能,无论规模大小。关闭的项目在新对局和发牌员屏幕上默认保持关闭,单局仍可单独为它开启。",
      rake: {
        label: "现金局抽水",
        hint: "从每个底池中抽取一部分放入抽水箱,或收取固定的坐台费。新对局会以这里的设置为起点。",
        checkbox: "抽水或收取坐台费",
      },
      houseCut: { label: "锦标赛主办方抽成", hint: "每个买入收取固定费用、按比例抽成,或两者兼有。", checkbox: "从每笔买入中抽成" },
      extras: {
        heading: "附加功能",
        hint: "已经在使用某项功能的对局会继续保留它。",
        bounties: { label: "赏金与击杀", hint: "每个人头上都有赏金,记录谁淘汰了谁。" },
        rebuys: { label: "重买与增购", hint: "买回筹码,并在第一次休息时补充筹码。" },
        seats: { label: "抽座与分桌", hint: "抽取座位,并在玩家出局时重新分配桌次。" },
        deals: { label: "决赛桌协议", hint: "ICM 和筹码分配计算器。" },
        payLinks: { label: "收款链接", hint: "在结算和派奖中使用的 Venmo、Cash App 和 PayPal 链接。" },
        costs: { label: "共同费用", hint: "分摊为这场牌局买的东西，比如食物或新牌。计入结算，不计入任何人的成绩。" },
        ledger: { label: "谁欠谁", hint: "付款后在结算中勾掉。玩家页会显示所有牌局中还欠的钱。" },
        bombPots: { label: "炸弹底池", hint: "现金局：每人下底注，翻牌前不下注直接发翻牌。可手动叫或定时。" },
        sevenTwo: { label: "7-2 玩法", hint: "现金局：用 7-2 赢下一手，向每位发到牌的玩家收取固定金额。" },
        highHand: { label: "最大牌奖", hint: "现金局：每个时段里最大的牌赢得主办方支付的奖金。" },
      },
    },
    house: {
      heading: "场地规则",
      hint: "每行一条。它们会显示在电视时钟下方,超过两条时会轮流展示。",
      placeholder: "禁止试探性下注。\n重买仅限第一次休息前。",
      commonOnes: "常用规则:",
      onNewGame: "应用到每个新对局",
      commonRules: {
        cardsSpeak: "牌面为准。",
        showOneShowAll: "亮一张就得全亮。",
        verbalBinding: "口头表态即为最终决定。",
        noStringBets: "禁止试探性下注。",
        onePlayerToAHand: "一手牌只能一人参与。",
        protectYourHand: "请自行保护好你的牌。",
        chipsStayOnTable: "筹码不得离开牌桌。",
        straddlesWelcome: "欢迎抢盲。",
        runItTwice: "双方同意可以跑两次牌。",
        chopBlinds: "所有人弃牌到盲注位可平分盲注。",
        phonesDown: "进行中的一手牌期间请放下手机。",
        rebuysBetweenHands: "只能在两手牌之间重买。",
        newDeckOnRequest: "可以要求更换新牌。",
        lastHandAnnounced: "最后一手牌会提前宣布。",
        settleUp: "离开前请完成结算。",
        finalSay: "主持对局的人拥有最终决定权。",
      },
    },
    defaults: {
      heading: "新对局",
      lede: "新对局的起始设置。以下每一项仍可在具体对局中单独修改,模板则会使用自己的设置。",
      auto: "自动",
      length: { label: "时长", about: "约 {time}" },
      tournaments: {
        heading: "锦标赛",
        buyIn: { label: "买入 {sym}", hint: "重买的价格与首次买入相同。" },
        players: { label: "玩家人数", hint: "通常参与的人数。筹码量、筹码分配和派奖都以此为起点。" },
        startingStack: { label: "起始筹码", hint: "留空则由每局根据筹码组和玩家人数自动选择。" },
        startingDepth: { label: "起始深度", hint: "第 1 级的筹码量,以大盲注为单位。" },
        length: { hint: "盲注结构会按此时长设计,以便按时结束。" },
        levelLength: { label: "级别时长" },
        breaks: { label: "休息", hint: "0 级表示不设休息。", levelsBetween: "每隔几级休息一次", minutes: "每次休息分钟数" },
        antes: {
          label: "前注与延迟报名",
          hint: "0 表示不设前注。延迟报名会在你选择的级别之后关闭。",
          antesFrom: "从第几级开始收前注",
          lateRegThrough: "延迟报名截止级别",
        },
        rebuys: {
          label: "重买与增购",
          hint: "重买按买入价格收取,并给予起始筹码。增购在第一次休息时进行。",
          checkbox: "允许重买",
          throughLevel: "截止级别",
          addOnCheckbox: "增购",
          cost: "费用 {sym}",
        },
        bounty: { label: "赏金 {sym}", hint: "每笔买入中悬赏在该玩家头上的部分。0 表示没有赏金。" },
        bountyKind: { label: "赏金类型", hint: "固定：淘汰一人拿走全部赏金。累进（PKO）：拿一半，另一半加到自己头上。神秘：信封拿出后，每淘汰一人随机打开一个信封。" },
        payouts: { label: "派奖比例", hint: "百分比,从第一名开始,例如 50、30、20。留空则根据参赛人数自动选择。" },
        roundTo: { label: "派奖金额取整到", hint: "这样就不会有人拿到 {amount} 这样的零头。多出或不足的部分计入第一名。" },
      },
      cash: {
        heading: "现金局",
        buyIn: {
          label: "买入",
          hint: "以大盲注为单位,因此适用于任何级别的赌注。具体金额由每局的盲注决定。",
          min: "最低",
          standard: "标准",
          max: "最高",
        },
        length: { hint: "用于计算结束时间和筹码分配。现金局总是可以打得更久。" },
        straddles: { label: "抢盲", checkbox: "允许抢盲" },
        bomb: { label: "炸弹底池", hint: "底注（以大盲计）以及多久来一次。", anteBB: "底注（大盲）", every: "每隔几分钟一次（0 = 手动叫）" },
        sevenTwo: { label: "7-2 玩法（大盲）", hint: "7-2 获胜时向每位玩家收取的金额。" },
        highHand: { label: "最大牌奖", hint: "奖金，以及每个时段多长。" },
      },
      both: {
        heading: "通用",
        seatsPerTable: { label: "每桌座位数", hint: "用于抽座和分桌。", option: "{n} 座" },
      },
      templates: {
        heading: "模板",
        empty: "还没有模板。",
        typeCash: "现金局",
        typeTournament: "锦标赛",
        playersCount: { other: "{n} 名玩家" },
        deleteAriaLabel: "删除模板 {name}",
        deleteConfirm: "删除模板“{name}”?由它创建的对局不受影响。",
        deletedToast: "已删除“{name}”",
        savedSetups: {
          label: "已保存的模板",
          hintBefore: "在新对局页面点击",
          saveAsTemplate: "保存为模板",
          hintAfter: "即可创建一个;之后可以从这里或命令面板开始",
        },
      },
    },
    chips: {
      heading: "筹码组",
      lede: "你使用的筹码。数值是筹码上印的面额;每局可以对其进行缩放(印着 1 的筹码在锦标赛中可以当作 100 使用)。新对局默认使用默认筹码组。",
    },
    tv: {
      heading: "电视",
      levelWarning: {
        label: "级别提醒",
        hint: "盲注上调前,电视会发出提示音,时钟变红。最后一分钟会闪烁。",
        before1: "提前 1 分钟",
        before2: "提前 2 分钟",
        before5: "提前 5 分钟",
      },
      sound: { label: "声音", hint: "浏览器要求在电视上点击一次才能播放声音,因此电视会请求这个操作。", checkbox: "打开电视屏幕时开启声音" },
      volume: {
        label: "电视音量",
        hint: "提示音、倒计时的滴答声和播报声。其他设备上的电视也会跟随此设置。松开滑块可以听到升级音效。",
      },
      keepAwake: {
        label: "保持唤醒",
        hint: "避免屏幕在级别进行中变暗。适用于 Chrome、Edge 和 Safari。",
        checkbox: "时钟运行时保持电视屏幕常亮",
      },
      announcer: {
        label: "播报员",
        hint: "提示音之后,电视会用设备自带的语音大声播报新的盲注、休息、出局和获胜者。",
        checkbox: "大声播报重要时刻",
        hearIt: "试听",
        sample: "第 5 级。盲注为 200、400,前注 400。",
      },
      money: {
        label: "电视上的金额",
        hint: "关闭后,奖池、派奖和买入金额不会显示在大屏幕上。发牌员屏幕仍会显示全部信息。",
        checkbox: "在电视上显示金额",
      },
    },
    yours: { heading: "你的数据" },
    lock: {
      heading: "密码锁定",
      intro:
        "这里的一切本就已加密。密码可以再进一步:未输入密码时,即使是使用同一浏览器的人也无法打开任何保存的内容,而且 PitMaster 会在无操作一段时间后自动锁定。电视屏幕在锁定期间仍会显示对局,但无法在电视上做任何更改。",
      needsHttps: "需要一个安全(https)页面,浏览器才能进行加密。",
      passcode: {
        label: "密码",
        hint: "至少 {n} 个字符,越长越难被破解,即使有人拷贝了这个浏览器的文件。忘记密码将导致这里保存的一切永久丢失,所以请先导出备份。",
        newPlaceholder: "新密码",
        newAriaLabel: "新密码",
        againPlaceholder: "再输入一次",
        againAriaLabel: "再次输入新密码",
        tooShort: "至少需要 {n} 个字符。",
        mismatch: "两次输入还不一致。",
        turnOnButton: "开启锁定",
        turningOn: "锁定中…",
      },
      autoLock: {
        label: "自动锁定",
        hint: "在任意 PitMaster 标签页中这么长时间没有点击、触摸或按键操作后触发。电视屏幕不计入,也不会被锁定。",
        lockNowButton: "立即锁定",
        options: {
          sec30: "30 秒后",
          min1: "1 分钟后",
          min2: "2 分钟后",
          min5: "5 分钟后",
          min10: "10 分钟后",
          min15: "15 分钟后",
          min30: "30 分钟后",
          hour1: "1 小时后",
          onClose: "仅在关闭 PitMaster 时",
        },
        phrase: {
          sec30: "30 秒后",
          min1: "1 分钟后",
          min2: "2 分钟后",
          min5: "5 分钟后",
          min10: "10 分钟后",
          min15: "15 分钟后",
          min30: "30 分钟后",
          hour1: "1 小时后",
          onClose: "仅在关闭时",
          awhile: "过一会儿后",
        },
      },
      changeOrOff: {
        label: "修改或关闭",
        hint: "两者都需要输入当前密码。无论哪种方式,数据始终保持加密。",
        currentPlaceholder: "当前密码",
        currentAriaLabel: "当前密码",
        typeCurrentFirst: "请先输入当前密码",
        changeButton: "修改密码",
        changingBusy: "修改中…",
        turnOffButton: "关闭锁定",
      },
      error: { wrongPasscode: "当前密码不正确。", generic: "无法修改。没有任何更改,请重试。" },
      toast: { off: "已关闭锁定。一切仍保持加密。", on: "已使用密码锁定。", onWithAuto: "已使用密码锁定。PitMaster 会在{phrase}无操作时自动锁定。" },
    },
    data: {
      heading: "导出与导入",
      lede: "一切都已加密保存在此浏览器中:{summary}({kb} KB)。没有账号,也没有云端备份,因此文件是转移到其他设备的唯一方式。",
      privacyLink: "你的数据是如何被处理的",
      summary: { join: "{rest}和{last}" },
      count: {
        games: { other: "{n} 局对局" },
        chipSets: { other: "{n} 组筹码" },
        templates: { other: "{n} 个模板" },
        newGames: { other: "{n} 局新对局" },
        payLinksFor: { other: "{n} 人的收款链接" },
        inProgress: "(进行中 {n} 局)",
      },
      export: {
        label: "导出",
        hint: "一个包含全部内容的文件。可作为备份保留,或在其他设备上导入后继续使用。若不设密码,拿到该文件的任何人都能读取其内容。",
        button: "导出全部",
        busy: "锁定中…",
        lastExported: "上次导出于 {time}。",
        includeSettings: "包含这些设置",
        lockWithPassword: "用密码锁定",
        passwordPlaceholder: "密码",
        passwordAriaLabel: "文件密码",
        passwordNote: "至少 {n} 个字符,越长越安全。使用 AES-256 加密。导入时需要这个密码,一旦忘记,你我都无法找回。",
        passwordTitle: "请输入至少 {n} 个字符的密码,或关闭锁定选项",
        toast: {
          locked: "已导出并加密锁定。导入时需要该密码。",
          plain: "已导出。请在其他设备上用导入功能打开它。",
          lockFailed: "无法锁定文件。请重试,或不设密码直接导出。",
        },
      },
      import: {
        label: "导入",
        hint: "进行中的对局会从中断处继续,时钟、玩家和电视代码都会一并恢复。",
        kindGame: "单个对局",
        kindEverything: "全部内容",
        exportedAt: "导出于 {day} {time}",
        plusSettings: ",还包含设置",
        modeAriaLabel: "导入方式",
        modeMerge: "添加到此浏览器",
        modeReplace: "替换全部内容",
        replaceCount: { other: "这里的 {n} 局对局将被替换为文件中的" },
        replaceOthers: "筹码组、模板和收款链接也会一并替换。",
        newerCount: "{n} 个比这里的版本更新",
        keptCount: "{n} 个已经是最新",
        noGames: "文件中没有对局",
        nothingDeleted: "这里的内容不会被删除。",
        useSettingsToo: {
          label: "同时使用它的设置",
          hint: "场地规则、货币、对局默认值和电视设置。此设备的主题和音效保持不变。",
        },
        importButton: "导入",
        importedToast: { other: "已导入 {n} 局对局" },
        undoneToast: "已撤销导入。一切恢复原样。",
        lockedWithPassword: "该文件已用密码锁定。",
        filePasswordAriaLabel: "文件密码",
        typePasswordFirst: "请先输入文件密码",
        unlockingBusy: "解锁中…",
        unlockButton: "解锁",
        dropAriaLabel: "导入文件",
        chooseFile: "选择文件",
        orDropHere: "或拖放到此处",
        importedLabel: "已导入。",
        readyToRun: "可以开始:",
        inProgress: "进行中:",
        undoButton: "撤销导入",
        error: { tooBig: "文件太大,不是有效的 PitMaster 导出文件。", failed: "文件无法使用。{message}" },
      },
      startOver: {
        label: "重新开始",
        hint: "删除此浏览器中的每一局对局和自定义筹码组。无法撤销。",
        button: "删除全部内容",
        confirm: "删除每一局对局和自定义筹码组?此操作无法撤销。如果可能还需要它们,请先导出备份。",
        doneToast: "已全部清空。重新开始。",
      },
    },
  },
  hi: {
    page: {
      title: "सेटिंग्स",
      heading: "सेटिंग्स",
      savedHint: "इस ब्राउज़र में एन्क्रिप्टेड सहेजा गया है। इन्हें किसी और डिवाइस पर ले जाने के लिए,",
      exportLink: "एक्सपोर्ट करें",
      savedHintEnd: "अपने गेम्स के साथ।",
    },
    nav: {
      groups: { games: "गेम्स", you: "आप" },
      tabs: { game: "आपका गेम", defaults: "नए गेम्स", chips: "चिप सेट्स", tv: "टीवी", general: "सामान्य", yours: "आपका डेटा" },
    },
    language: {
      title: "भाषा",
      hint: "PitMaster का अपना टेक्स्ट किस भाषा में लिखा है। पहली बार आपके ब्राउज़र से अंदाज़ा लगाया जाता है, और यहां हमेशा बदला जा सकता है। गेम्स और बाय-इन नीचे वाली करेंसी इस्तेमाल करते हैं, इसे नहीं।",
    },
    region: {
      heading: "भाषा और क्षेत्र",
      currency: {
        label: "करेंसी",
        hint: "बाय-इन, पॉट्स और कैश चिप्स कैसे लिखे जाते हैं:",
        hintEnd: "लाइव टीवी भी इसी को फॉलो करते हैं।",
        names: { USD: "US डॉलर ($)", EUR: "यूरो (€)", JPY: "जापानी येन (¥)", GBP: "ब्रिटिश पाउंड (£)", CNY: "चीनी युआन (¥)", AUD: "ऑस्ट्रेलियाई डॉलर ($)" },
      },
      time: { label: "समय", hint: "शुरुआत का समय, बस्ट होने का समय और टीवी की घड़ी। अभी {time} है।", h12: "12 घंटे", h24: "24 घंटे" },
    },
    appearance: {
      heading: "दिखावट",
      theme: { label: "थीम", hint: "सिस्टम आपके डिवाइस के हिसाब से चलती है, और टीवी भी इसी को फॉलो करता है।", system: "सिस्टम", light: "लाइट", dark: "डार्क" },
      sounds: {
        label: "इंटरफेस साउंड्स",
        hint: "बटन और स्विच के नीचे हल्की क्लिक्स, पैसा हिलने पर चिप्स की खनक, और हर चिप की अपनी अलग आवाज़ जब आप उसे टैप करते हैं। टीवी के अलार्म अलग हैं।",
      },
      volume: {
        label: "इंटरफेस वॉल्यूम",
        hint: "ये क्लिक्स और खनक कितनी तेज़ हैं।",
        hintOn: "सुनने के लिए स्लाइडर छोड़ दें।",
        hintOff: "इसे सेट करने के लिए इंटरफेस साउंड्स चालू करें।",
        disabledTitle: "इंटरफेस साउंड्स बंद हैं",
      },
      motion: {
        label: "मोशन",
        hint: "सिस्टम आपके डिवाइस की रिड्यूस-मोशन सेटिंग फॉलो करती है। रिड्यूस्ड यहां और टीवी पर स्लाइड्स, फ्लिप्स और पेज स्वैप्स बंद कर देता है।",
        system: "सिस्टम",
        reduced: "रिड्यूस्ड",
      },
      toys: {
        label: "होम पेज टॉयज़",
        hint: "हेडलाइन के बगल में फैलाने के लिए ताश के पत्ते, छांटने के लिए चिप्स, पासे, नोट गिनने की मशीन और घुमाने के लिए एक रूलेट व्हील। बंद करने पर होम पेज सिर्फ आपके गेम्स दिखाता है।",
      },
    },
    keyboard: {
      heading: "कीबोर्ड",
      openCommands: {
        label: "कमांड्स खोलें",
        hint: "कमांड बॉक्स नाम से कुछ भी कर सकता है: किसी पेज पर जाना, टेम्पलेट शुरू करना, या डीलर स्क्रीन पर “माइक को बस्ट करना”। शॉर्टकट पर क्लिक करें, फिर अपनी पसंद की कुंजियां दबाएं।",
        pressNewKeys: "नई कुंजियां दबाएं",
        andAKey: "और एक कुंजी",
        escToKeep: "{key} रखने के लिए Esc दबाएं",
        resetButton: "{key} पर रीसेट करें",
        saved: "सहेजा गया। अब {key} से कमांड्स खुलेंगे।",
        resetTo: "{key} पर वापस आ गया।",
      },
      otherShortcuts: { label: "बाकी शॉर्टकट्स", hint: "ये तय हैं। किसी बॉक्स में टाइप करते समय इनमें से कोई काम नहीं करता।" },
    },
    general: { heading: "सामान्य" },
    game: {
      heading: "आपका गेम",
      lede: "अपने गेम्स में जो इस्तेमाल होता है उसे चालू करें, चाहे उनका आकार कुछ भी हो। जो बंद है वह नए गेम्स और डीलर स्क्रीन पर बंद ही रहता है, और कोई एक गेम फिर भी सिर्फ अपने लिए इसे चालू कर सकता है।",
      rake: {
        label: "कैश गेम रेक",
        hint: "हर पॉट का एक हिस्सा रेक बॉक्स में, या बैठने की एक तय फीस। नए गेम्स यहां सेट की गई चीज़ से शुरू होते हैं।",
        checkbox: "रेक या सीट फीस लें",
      },
      houseCut: { label: "टूर्नामेंट हाउस कट", hint: "हर एंट्री पर एक तय फीस, बाकी का एक प्रतिशत, या दोनों।", checkbox: "हर बाय-इन से एक हिस्सा लें" },
      extras: {
        heading: "एक्स्ट्रा",
        hint: "जो गेम पहले से किसी चीज़ का इस्तेमाल करता है, वह उसे रखता है।",
        bounties: { label: "बाउंटी और नॉकआउट", hint: "हर सिर पर एक बाउंटी, और किसने किसे नॉकआउट किया।" },
        rebuys: { label: "रीबाय और ऐड-ऑन", hint: "वापस बाय-इन करना, और पहले ब्रेक पर टॉप-अप करना।" },
        seats: { label: "सीट ड्रॉ और टेबल्स", hint: "सीटें बांटना, और खिलाड़ियों के बस्ट होने पर टेबल्स को बैलेंस करना।" },
        deals: { label: "फाइनल टेबल डील्स", hint: "ICM और चिप-चॉप कैलकुलेटर।" },
        payLinks: { label: "पे लिंक्स", hint: "सेटल-अप और पेआउट्स में Venmo, Cash App और PayPal के लिंक्स।" },
        costs: { label: "साझा खर्च", hint: "गेम के लिए खरीदी चीज़ें बांटें, जैसे खाना या नई ताश। ये हिसाब में जाते हैं, किसी के नतीजों में नहीं।" },
        ledger: { label: "किसका किस पर बाकी", hint: "भुगतान होते ही हिसाब में टिक करें। खिलाड़ी पेज पर हर गेम का बाकी पैसा दिखता है।" },
        bombPots: { label: "बॉम्ब पॉट", hint: "कैश गेम: सब एंटी डालते हैं और बिना बेटिंग के फ़्लॉप आता है। हाथ से बुलाएँ या टाइमर पर।" },
        sevenTwo: { label: "7-2 गेम", hint: "कैश गेम: 7-2 से हाथ जीतने पर हर खिलाड़ी से तय रकम मिलती है।" },
        highHand: { label: "हाई हैंड", hint: "कैश गेम: हर राउंड का सबसे अच्छा हाथ हाउस से इनाम जीतता है।" },
      },
    },
    house: {
      heading: "हाउस रूल्स",
      hint: "एक लाइन में एक नियम। ये घड़ी के नीचे टीवी पर दिखते हैं, और दो से ज़्यादा होने पर बारी-बारी दिखते हैं।",
      placeholder: "स्ट्रिंग बेट्स नहीं।\nरीबाय पहले ब्रेक पर बंद हो जाते हैं।",
      commonOnes: "आम नियम:",
      onNewGame: "हर नए गेम पर लगाएं",
      commonRules: {
        cardsSpeak: "पत्ते ही आखिरी सच हैं।",
        showOneShowAll: "एक दिखाया तो सबको दिखाना होगा।",
        verbalBinding: "बोलकर लिया गया एक्शन आखिरी माना जाता है।",
        noStringBets: "स्ट्रिंग बेट्स नहीं।",
        onePlayerToAHand: "एक हाथ में सिर्फ एक खिलाड़ी।",
        protectYourHand: "अपने पत्ते खुद संभालें।",
        chipsStayOnTable: "चिप्स टेबल पर ही रहेंगे।",
        straddlesWelcome: "स्ट्रैडल्स का स्वागत है।",
        runItTwice: "अगर दोनों खिलाड़ी मानें तो दो बार चला सकते हैं।",
        chopBlinds: "अगर सब फोल्ड कर दें तो ब्लाइंड्स बांट लें।",
        phonesDown: "हाथ के दौरान फोन नीचे रखें।",
        rebuysBetweenHands: "रीबाय सिर्फ हाथों के बीच में।",
        newDeckOnRequest: "मांगने पर नया डेक मिलेगा।",
        lastHandAnnounced: "आखिरी हाथ की घोषणा पहले की जाती है।",
        settleUp: "जाने से पहले हिसाब पूरा करें।",
        finalSay: "गेम चलाने वाले की बात आखिरी होती है।",
      },
    },
    defaults: {
      heading: "नए गेम्स",
      lede: "नया गेम कहां से शुरू होता है। इनमें से हर चीज़ गेम पर ही बदली जा सकती है, और एक टेम्पलेट अपनी सेटिंग खुद तय करता है।",
      auto: "ऑटो",
      length: { label: "अवधि", about: "लगभग {time}" },
      tournaments: {
        heading: "टूर्नामेंट्स",
        buyIn: { label: "बाय-इन {sym}", hint: "रीबाय भी उसी कीमत पर शुरू होते हैं।" },
        players: { label: "खिलाड़ी", hint: "आमतौर पर कितने लोग खेलते हैं। स्टैक्स, चिप का हिसाब और पेआउट्स इसी से शुरू होते हैं।" },
        startingStack: { label: "शुरुआती स्टैक", hint: "खाली छोड़ दें और हर गेम अपने चिप सेट और खिलाड़ियों के हिसाब से एक चुन लेगा।" },
        startingDepth: { label: "शुरुआती डेप्थ", hint: "लेवल 1 पर बिग ब्लाइंड्स में स्टैक।" },
        length: { hint: "ब्लाइंड स्ट्रक्चर इस समय के आसपास खत्म होने के हिसाब से बनाया जाता है।" },
        levelLength: { label: "लेवल की लंबाई" },
        breaks: { label: "ब्रेक्स", hint: "0 लेवल का मतलब है कोई ब्रेक नहीं।", levelsBetween: "कितने लेवल बाद ब्रेक", minutes: "ब्रेक के मिनट" },
        antes: {
          label: "एंटी और लेट रजिस्ट्रेशन",
          hint: "0 का मतलब है कोई एंटी नहीं। लेट रजिस्ट्रेशन आपके चुने लेवल के बाद बंद हो जाता है।",
          antesFrom: "किस लेवल से एंटी शुरू",
          lateRegThrough: "लेट रजिस्ट्रेशन किस लेवल तक",
        },
        rebuys: {
          label: "रीबाय और ऐड-ऑन",
          hint: "रीबाय की कीमत बाय-इन जितनी होती है और शुरुआती स्टैक मिलता है। ऐड-ऑन पहले ब्रेक पर मिलता है।",
          checkbox: "रीबाय",
          throughLevel: "किस लेवल तक",
          addOnCheckbox: "ऐड-ऑन",
          cost: "कीमत {sym}",
        },
        bounty: { label: "बाउंटी {sym}", hint: "हर बाय-इन का वह हिस्सा जो खिलाड़ी के सिर पर रहता है। 0 का मतलब है कोई बाउंटी नहीं।" },
        bountyKind: { label: "बाउंटी का प्रकार", hint: "फ़्लैट में नॉकआउट पर पूरी बाउंटी मिलती है। प्रोग्रेसिव (PKO) में आधी मिलती है और आधी जीतने वाले की अपनी बाउंटी में जुड़ती है। मिस्ट्री में लिफ़ाफ़े निकलने के बाद हर नॉकआउट एक रैंडम लिफ़ाफ़ा खोलता है।" },
        payouts: { label: "पेआउट्स", hint: "प्रतिशत में, पहला स्थान सबसे पहले, जैसे 50, 30, 20। खाली छोड़ने पर खिलाड़ियों की संख्या के हिसाब से खुद चुने जाते हैं।" },
        roundTo: { label: "पेआउट्स इस तक राउंड करें", hint: "ताकि किसी को {amount} जैसी रकम न मिले। जो बचे वह पहले स्थान को चला जाता है।" },
      },
      cash: {
        heading: "कैश गेम्स",
        buyIn: {
          label: "बाय-इन",
          hint: "बिग ब्लाइंड्स में, ताकि यह किसी भी स्टेक पर काम करे। असली रकम हर गेम की ब्लाइंड्स से तय होती है।",
          min: "न्यूनतम",
          standard: "स्टैंडर्ड",
          max: "अधिकतम",
        },
        length: { hint: "खत्म होने के समय और चिप के हिसाब के लिए। कैश गेम्स हमेशा लंबे चल सकते हैं।" },
        straddles: { label: "स्ट्रैडल्स", checkbox: "स्ट्रैडल्स की अनुमति है" },
        bomb: { label: "बॉम्ब पॉट", hint: "बिग ब्लाइंड में एंटी, और कितनी बार आता है।", anteBB: "एंटी (बिग ब्लाइंड)", every: "हर कितने मिनट में (0 = बुलाने पर)" },
        sevenTwo: { label: "7-2 गेम (बिग ब्लाइंड)", hint: "7-2 की जीत पर हर खिलाड़ी से कितना मिलता है।" },
        highHand: { label: "हाई हैंड", hint: "इनाम, और हर राउंड कितना लंबा है।" },
      },
      both: {
        heading: "दोनों",
        seatsPerTable: { label: "हर टेबल पर सीटें", hint: "सीटें बांटने और टेबल्स बैलेंस करने के लिए।", option: "{n} सीटें" },
      },
      templates: {
        heading: "टेम्पलेट्स",
        empty: "अभी कोई टेम्पलेट नहीं है।",
        typeCash: "कैश",
        typeTournament: "टूर्नामेंट",
        playersCount: { one: "{n} खिलाड़ी", other: "{n} खिलाड़ी" },
        deleteAriaLabel: "टेम्पलेट {name} मिटाएं",
        deleteConfirm: "टेम्पलेट “{name}” मिटाएं? इससे बने गेम्स बने रहेंगे।",
        deletedToast: "“{name}” मिटा दिया गया",
        savedSetups: {
          label: "सहेजे गए सेटअप्स",
          hintBefore: "नए गेम पर",
          saveAsTemplate: "टेम्पलेट के रूप में सहेजें",
          hintAfter: "से एक बनाएं; वहां से या Commands से किसी एक को शुरू करें",
        },
      },
    },
    chips: {
      heading: "चिप सेट्स",
      lede: "वे चिप्स जिनसे आप खेलते हैं। वैल्यू वही है जो चिप पर छपी है; हर गेम इसे स्केल कर सकता है (1 छपी चिप टूर्नामेंट में 100 की तरह खेल सकती है)। नए गेम्स डिफ़ॉल्ट सेट से शुरू होते हैं।",
    },
    tv: {
      heading: "टीवी",
      levelWarning: {
        label: "लेवल की चेतावनी",
        hint: "ब्लाइंड्स बढ़ने से पहले टीवी बीप करता है और घड़ी लाल हो जाती है। आखिरी मिनट झपकता है।",
        before1: "1 मिनट पहले",
        before2: "2 मिनट पहले",
        before5: "5 मिनट पहले",
      },
      sound: { label: "साउंड", hint: "आवाज़ चलाने से पहले ब्राउज़र्स को टीवी पर एक क्लिक चाहिए होता है, इसलिए टीवी यह मांगता है।", checkbox: "टीवी स्क्रीन साउंड चालू के साथ शुरू करें" },
      volume: {
        label: "टीवी वॉल्यूम",
        hint: "बीप्स, काउंटडाउन की टिक-टिक और अनाउंसर। किसी और डिवाइस पर टीवी भी इसी को फॉलो करता है। लेवल-अप की आवाज़ सुनने के लिए स्लाइडर छोड़ दें।",
      },
      keepAwake: {
        label: "जगाए रखें",
        hint: "ताकि स्क्रीन लेवल के बीच में धुंधली न हो। Chrome, Edge और Safari में काम करता है।",
        checkbox: "घड़ी चलने तक टीवी चालू रखें",
      },
      announcer: {
        label: "अनाउंसर",
        hint: "बीप के बाद टीवी डिवाइस की अपनी आवाज़ में नई ब्लाइंड्स, ब्रेक्स, बस्ट्स और विजेता को ज़ोर से पढ़ता है।",
        checkbox: "बड़े पलों को ज़ोर से पढ़ें",
        hearIt: "सुनें",
        sample: "लेवल 5। ब्लाइंड्स हैं 200, 400, साथ में 400 की एंटी।",
      },
      money: {
        label: "टीवी पर पैसा",
        hint: "बड़ी स्क्रीन पर प्राइज़ पूल, पेआउट्स और बाय-इन्स न दिखाने के लिए बंद करें। डीलर स्क्रीन पर सब कुछ फिर भी दिखता रहेगा।",
        checkbox: "टीवी पर पैसे की रकम दिखाएं",
      },
    },
    yours: { heading: "आपका डेटा" },
    lock: {
      heading: "पासकोड लॉक",
      intro:
        "यहां सब कुछ पहले से ही एन्क्रिप्टेड है। एक पासकोड इसे और आगे ले जाता है: बिना इसके सहेजी गई कोई चीज़ नहीं खुल सकती, चाहे इसी ब्राउज़र का इस्तेमाल करने वाला कोई और ही क्यों न हो, और बिना किसी इनपुट के PitMaster कुछ देर बाद खुद लॉक हो जाता है। लॉक होने के दौरान भी टीवी स्क्रीन गेम दिखाती रहती है, और उन पर कुछ भी बदला नहीं जा सकता।",
      needsHttps: "इसके लिए एक सुरक्षित (https) पेज चाहिए, जहां यह ब्राउज़र एन्क्रिप्ट कर सके।",
      passcode: {
        label: "पासकोड",
        hint: "कम से कम {n} अक्षर, और जितना लंबा उतना तोड़ना मुश्किल, भले ही किसी ने इस ब्राउज़र की फाइलें कॉपी कर ली हों। इसे भूल जाने पर यहां सहेजा सब कुछ हमेशा के लिए चला जाता है, इसलिए पहले एक्सपोर्ट कर लें।",
        newPlaceholder: "नया पासकोड",
        newAriaLabel: "नया पासकोड",
        againPlaceholder: "फिर से टाइप करें",
        againAriaLabel: "नया पासकोड, दोबारा",
        tooShort: "कम से कम {n} अक्षर।",
        mismatch: "दोनों अभी मेल नहीं खाते।",
        turnOnButton: "लॉक चालू करें",
        turningOn: "लॉक हो रहा है…",
      },
      autoLock: {
        label: "ऑटो-लॉक",
        hint: "किसी भी PitMaster टैब में इतनी देर तक कोई क्लिक, टैप या कुंजी न दबने पर। टीवी स्क्रीनें इसमें नहीं गिनी जातीं और लॉक नहीं होतीं।",
        lockNowButton: "अभी लॉक करें",
        options: {
          sec30: "30 सेकंड बाद",
          min1: "1 मिनट बाद",
          min2: "2 मिनट बाद",
          min5: "5 मिनट बाद",
          min10: "10 मिनट बाद",
          min15: "15 मिनट बाद",
          min30: "30 मिनट बाद",
          hour1: "1 घंटे बाद",
          onClose: "सिर्फ PitMaster बंद होने पर",
        },
        phrase: {
          sec30: "30 सेकंड बाद",
          min1: "1 मिनट बाद",
          min2: "2 मिनट बाद",
          min5: "5 मिनट बाद",
          min10: "10 मिनट बाद",
          min15: "15 मिनट बाद",
          min30: "30 मिनट बाद",
          hour1: "1 घंटे बाद",
          onClose: "सिर्फ बंद होने पर",
          awhile: "कुछ देर बाद",
        },
      },
      changeOrOff: {
        label: "बदलें या बंद करें",
        hint: "दोनों के लिए मौजूदा पासकोड चाहिए। दोनों ही तरह से सब कुछ एन्क्रिप्टेड रहता है।",
        currentPlaceholder: "मौजूदा पासकोड",
        currentAriaLabel: "मौजूदा पासकोड",
        typeCurrentFirst: "पहले मौजूदा पासकोड टाइप करें",
        changeButton: "पासकोड बदलें",
        changingBusy: "बदला जा रहा है…",
        turnOffButton: "लॉक बंद करें",
      },
      error: { wrongPasscode: "यह मौजूदा पासकोड नहीं है।", generic: "इसे बदला नहीं जा सका। कुछ भी नहीं बदला गया; दोबारा कोशिश करें।" },
      toast: { off: "लॉक बंद। सब कुछ अब भी एन्क्रिप्टेड है।", on: "पासकोड से लॉक हो गया।", onWithAuto: "पासकोड से लॉक हो गया। बिना इनपुट के PitMaster {phrase} लॉक हो जाएगा।" },
    },
    data: {
      heading: "एक्सपोर्ट और इंपोर्ट",
      lede: "सब कुछ इस ब्राउज़र में एन्क्रिप्टेड सहेजा है: {summary} ({kb} KB)। कोई अकाउंट नहीं है और कोई क्लाउड कॉपी नहीं है, इसलिए किसी और डिवाइस तक पहुंचने का तरीका एक फाइल ही है।",
      privacyLink: "आपका डेटा कैसे संभाला जाता है",
      summary: { join: "{rest} और {last}" },
      count: {
        games: { one: "{n} गेम", other: "{n} गेम्स" },
        chipSets: { one: "{n} चिप सेट", other: "{n} चिप सेट्स" },
        templates: { one: "{n} टेम्पलेट", other: "{n} टेम्पलेट्स" },
        newGames: { one: "{n} नया गेम", other: "{n} नए गेम्स" },
        payLinksFor: { one: "{n} व्यक्ति के लिए पे लिंक्स", other: "{n} लोगों के लिए पे लिंक्स" },
        inProgress: "({n} चल रहे हैं)",
      },
      export: {
        label: "एक्सपोर्ट",
        hint: "सब कुछ एक फाइल में। इसे बैकअप के तौर पर रखें, या किसी और डिवाइस पर इंपोर्ट करके वहां से जारी रखें। बिना पासवर्ड के, फाइल जिसके पास भी हो वह इसे पढ़ सकता है।",
        button: "सब कुछ एक्सपोर्ट करें",
        busy: "लॉक हो रहा है…",
        lastExported: "आखिरी बार {time} एक्सपोर्ट किया गया।",
        includeSettings: "ये सेटिंग्स भी शामिल करें",
        lockWithPassword: "इसे पासवर्ड से लॉक करें",
        passwordPlaceholder: "पासवर्ड",
        passwordAriaLabel: "फाइल का पासवर्ड",
        passwordNote: "कम से कम {n} अक्षर, और जितना लंबा उतना मज़बूत। AES-256 से एन्क्रिप्टेड। इंपोर्ट करने पर यही पासवर्ड चाहिए होगा, और भूल जाने पर न आप इसे वापस पा सकते हैं, न हम।",
        passwordTitle: "कम से कम {n} अक्षरों का पासवर्ड टाइप करें, या लॉक बंद कर दें",
        toast: {
          locked: "एक्सपोर्ट होकर लॉक हो गया। इंपोर्ट करने पर पासवर्ड चाहिए होगा।",
          plain: "एक्सपोर्ट हो गया। दूसरे डिवाइस पर इसे Import से खोलें।",
          lockFailed: "फाइल लॉक नहीं हो सकी। दोबारा कोशिश करें, या बिना पासवर्ड के एक्सपोर्ट करें।",
        },
      },
      import: {
        label: "इंपोर्ट",
        hint: "चल रहा गेम वहीं से शुरू होता है जहां छोड़ा गया था, घड़ी, खिलाड़ी और टीवी कोड सहित।",
        kindGame: "एक गेम",
        kindEverything: "सब कुछ",
        exportedAt: "{day} को {time} पर एक्सपोर्ट किया गया",
        plusSettings: ", साथ में सेटिंग्स भी",
        modeAriaLabel: "इंपोर्ट कैसे करें",
        modeMerge: "इस ब्राउज़र में जोड़ें",
        modeReplace: "सब कुछ बदल दें",
        replaceCount: { one: "यहां का {n} गेम फाइल के गेम्स से बदल दिया जाएगा, जिसमें हैं", other: "यहां के {n} गेम्स फाइल के गेम्स से बदल दिए जाएंगे, जिसमें हैं" },
        replaceOthers: "चिप सेट्स, टेम्पलेट्स और पे लिंक्स भी।",
        newerCount: "{n} यहां की कॉपी से नए हैं",
        keptCount: "{n} पहले से अप टू डेट हैं",
        noGames: "इसमें कोई गेम नहीं है",
        nothingDeleted: "यहां कुछ भी मिटाया नहीं जाता।",
        useSettingsToo: {
          label: "इसकी सेटिंग्स भी इस्तेमाल करें",
          hint: "हाउस रूल्स, पैसा, गेम डिफ़ॉल्ट्स और टीवी। इस स्क्रीन की थीम और साउंड्स जैसी हैं वैसी ही रहेंगी।",
        },
        importButton: "इंपोर्ट",
        importedToast: { one: "{n} गेम इंपोर्ट हुआ", other: "{n} गेम्स इंपोर्ट हुए" },
        undoneToast: "इंपोर्ट वापस ले लिया गया। सब कुछ पहले जैसा है।",
        lockedWithPassword: "यह पासवर्ड से लॉक है।",
        filePasswordAriaLabel: "फाइल का पासवर्ड",
        typePasswordFirst: "पहले फाइल का पासवर्ड टाइप करें",
        unlockingBusy: "अनलॉक हो रहा है…",
        unlockButton: "अनलॉक करें",
        dropAriaLabel: "फाइल इंपोर्ट करें",
        chooseFile: "एक फाइल चुनें",
        orDropHere: "या यहां ड्रॉप करें",
        importedLabel: "इंपोर्ट हो गया।",
        readyToRun: "शुरू करने के लिए तैयार:",
        inProgress: "चल रहा है:",
        undoButton: "इंपोर्ट वापस लें",
        error: { tooBig: "यह फाइल PitMaster एक्सपोर्ट के लिए बहुत बड़ी है।", failed: "यह फाइल काम नहीं कर सकी। {message}" },
      },
      startOver: {
        label: "फिर से शुरू करें",
        hint: "इस ब्राउज़र का हर गेम और कस्टम चिप सेट मिटा देता है। वापस नहीं लिया जा सकता।",
        button: "सब कुछ मिटाएं",
        confirm: "हर गेम और कस्टम चिप सेट मिटाएं? यह वापस नहीं लिया जा सकता। अगर इन्हें रखना चाहते हों तो पहले एक्सपोर्ट कर लें।",
        doneToast: "सब कुछ साफ़ हो गया। नई शुरुआत।",
      },
    },
  },
  es: {
    page: {
      title: "Ajustes",
      heading: "Ajustes",
      savedHint: "Guardados en este navegador, encriptados. Para llevarlos a otro dispositivo,",
      exportLink: "expórtalos",
      savedHintEnd: "junto con tus partidas.",
    },
    nav: {
      groups: { games: "Partidas", you: "Tú" },
      tabs: { game: "Tu Partida", defaults: "Partidas Nuevas", chips: "Sets de Fichas", tv: "TV", general: "General", yours: "Tus Datos" },
    },
    language: {
      title: "Idioma",
      hint: "El idioma en que está escrito PitMaster. Se adivina de tu navegador al principio, y siempre se puede cambiar aquí. Las partidas y los buy-ins usan la moneda de abajo, no esto.",
    },
    region: {
      heading: "Idioma y Región",
      currency: {
        label: "Moneda",
        hint: "Cómo se escriben los buy-ins, los botes y las fichas de efectivo:",
        hintEnd: "Las TV en vivo siguen esta misma.",
        names: { USD: "Dólar estadounidense ($)", EUR: "Euro (€)", JPY: "Yen japonés (¥)", GBP: "Libra esterlina (£)", CNY: "Yuan chino (¥)", AUD: "Dólar australiano ($)" },
      },
      time: { label: "Hora", hint: "Horas de inicio, horas en que alguien queda eliminado y el reloj de la TV. Ahora son las {time}.", h12: "12 Horas", h24: "24 Horas" },
    },
    appearance: {
      heading: "Apariencia",
      theme: { label: "Tema", hint: "Sistema sigue tu dispositivo, y la pantalla de TV también.", system: "Sistema", light: "Claro", dark: "Oscuro" },
      sounds: {
        label: "Sonidos de la Interfaz",
        hint: "Clics suaves bajo botones e interruptores, fichas que suenan cuando se mueve el dinero, y cada ficha con su propia nota al tocarla. Las alarmas de la TV son aparte.",
      },
      volume: {
        label: "Volumen de la Interfaz",
        hint: "Qué tan fuertes son esos clics y sonidos.",
        hintOn: "Suelta el control para escucharlo.",
        hintOff: "Activa los Sonidos de la Interfaz para ajustarlo.",
        disabledTitle: "Los Sonidos de la Interfaz están apagados",
      },
      motion: {
        label: "Movimiento",
        hint: "Sistema sigue el ajuste de movimiento reducido de tu dispositivo. Reducido apaga los deslizamientos, giros y cambios de página aquí y en la TV.",
        system: "Sistema",
        reduced: "Reducido",
      },
      toys: {
        label: "Distracciones de la Página Principal",
        hint: "Cartas para abanicar, fichas para ordenar, dados, una contadora de billetes y una ruleta para entretenerse junto al titular. Apagado deja la página principal solo con tus partidas.",
      },
    },
    keyboard: {
      heading: "Teclado",
      openCommands: {
        label: "Abrir Comandos",
        hint: "El cuadro de comandos hace cualquier cosa por su nombre: ir a una página, iniciar una plantilla, o “eliminar a mike” en la pantalla del dealer. Haz clic en el atajo y luego presiona las teclas que quieras.",
        pressNewKeys: "Presiona las Nuevas Teclas",
        andAKey: "y una Tecla",
        escToKeep: "Esc para mantener {key}",
        resetButton: "Restablecer a {key}",
        saved: "Guardado. {key} abre Comandos ahora.",
        resetTo: "Vuelto a {key}.",
      },
      otherShortcuts: { label: "Otros Atajos", hint: "Estos son fijos. Ninguno se activa mientras escribes en un campo." },
    },
    general: { heading: "General" },
    game: {
      heading: "Tu Partida",
      lede: "Activa lo que usan tus partidas, sea cual sea su tamaño. Lo que está apagado se queda apagado en partidas nuevas y en la pantalla del dealer, y una partida siempre puede activarlo solo para ella.",
      rake: {
        label: "Rake de Cash Game",
        hint: "Una parte de cada bote va a una caja de rake, o una cuota fija por sentarse. Las partidas nuevas empiezan con lo que ajustes aquí.",
        checkbox: "Cobrar Rake o Cuota de Asiento",
      },
      houseCut: { label: "Comisión de la Casa en Torneos", hint: "Una cuota fija por entrada, un porcentaje del resto, o ambos.", checkbox: "Cobrar una Parte de Cada Buy-In" },
      extras: {
        heading: "Extras",
        hint: "Una partida que ya usa algo lo conserva.",
        bounties: { label: "Recompensas y Eliminaciones", hint: "Una recompensa sobre cada jugador, y quién eliminó a quién." },
        rebuys: { label: "Recompras y Add-Ons", hint: "Volver a comprar fichas, y recargar en el primer descanso." },
        seats: { label: "Sorteo de Asientos y Mesas", hint: "Sortear asientos, y equilibrar mesas cuando los jugadores quedan eliminados." },
        deals: { label: "Acuerdos de Mesa Final", hint: "La calculadora de ICM y reparto de fichas." },
        payLinks: { label: "Enlaces de Pago", hint: "Enlaces de Venmo, Cash App y PayPal en el saldo final y los premios." },
        costs: { label: "Gastos Compartidos", hint: "Reparte lo que se compró para la partida, como comida o una baraja nueva. Entra en el saldo de cuentas, no en los resultados de nadie." },
        ledger: { label: "Quién Debe a Quién", hint: "Marca los pagos del saldo de cuentas a medida que se hacen. Jugadores muestra lo que aún se debe de todas las partidas." },
        bombPots: { label: "Bomb pots", hint: "Partidas de cash: todos ponen un ante y el flop sale sin apuestas antes. A mano o con temporizador." },
        sevenTwo: { label: "El juego del 7-2", hint: "Partidas de cash: ganar una mano con 7-2 cobra una cantidad fija a cada jugador con cartas." },
        highHand: { label: "Mano más alta", hint: "Partidas de cash: la mejor mano de cada tramo gana un premio que paga la casa." },
      },
    },
    house: {
      heading: "Reglas de la Casa",
      hint: "Una por línea. Aparecen en la TV bajo el reloj, turnándose cuando hay más de dos.",
      placeholder: "Nada de apuestas en string.\nLas recompras cierran en el primer descanso.",
      commonOnes: "Comunes:",
      onNewGame: "Ponerlas en Cada Partida Nueva",
      commonRules: {
        cardsSpeak: "Las cartas hablan.",
        showOneShowAll: "Si muestras una, muestras todas.",
        verbalBinding: "La acción verbal es definitiva.",
        noStringBets: "Nada de apuestas en string.",
        onePlayerToAHand: "Un jugador por mano.",
        protectYourHand: "Protege tu mano.",
        chipsStayOnTable: "Las fichas se quedan en la mesa.",
        straddlesWelcome: "Los straddles son bienvenidos.",
        runItTwice: "Se puede correr dos veces si ambos jugadores están de acuerdo.",
        chopBlinds: "Se reparten las ciegas si todos se retiran hasta ellas.",
        phonesDown: "Los teléfonos guardados durante una mano.",
        rebuysBetweenHands: "Recompras solo entre manos.",
        newDeckOnRequest: "Baraja nueva si se pide.",
        lastHandAnnounced: "La última mano se anuncia.",
        settleUp: "Salda cuentas antes de irte.",
        finalSay: "Quien organiza la partida tiene la última palabra.",
      },
    },
    defaults: {
      heading: "Partidas Nuevas",
      lede: "De dónde parte una partida nueva. Cada uno de estos ajustes se puede cambiar en la propia partida, y una plantilla fija los suyos.",
      auto: "Auto",
      length: { label: "Duración", about: "Unas {time}" },
      tournaments: {
        heading: "Torneos",
        buyIn: { label: "Buy-In {sym}", hint: "Las recompras empiezan al mismo precio." },
        players: { label: "Jugadores", hint: "Cuántos suelen jugar. Los stacks, el cálculo de fichas y los premios parten de aquí." },
        startingStack: { label: "Stack Inicial", hint: "Déjalo en blanco y cada partida elegirá uno que se ajuste a su set de fichas y jugadores." },
        startingDepth: { label: "Profundidad Inicial", hint: "El stack en ciegas grandes en el nivel 1." },
        length: { hint: "La estructura de ciegas se arma para terminar alrededor de entonces." },
        levelLength: { label: "Duración de Nivel" },
        breaks: { label: "Descansos", hint: "0 niveles significa sin descansos.", levelsBetween: "Niveles Entre Descansos", minutes: "Minutos de Descanso" },
        antes: {
          label: "Antes e Inscripción Tardía",
          hint: "0 significa sin antes. La inscripción tardía cierra después del nivel que elijas.",
          antesFrom: "Antes Desde el Nivel",
          lateRegThrough: "Inscripción Tardía Hasta el Nivel",
        },
        rebuys: {
          label: "Recompras y Add-Ons",
          hint: "Las recompras cuestan el buy-in y dan un stack inicial. El add-on llega en el primer descanso.",
          checkbox: "Recompras",
          throughLevel: "Hasta el Nivel",
          addOnCheckbox: "Add-On",
          cost: "Costo {sym}",
        },
        bounty: { label: "Recompensa {sym}", hint: "La parte de cada buy-in que queda sobre la cabeza del jugador. 0 significa ninguna." },
        bountyKind: { label: "Tipo de bounty", hint: "Fijo paga el bounty entero por una eliminación. Progresivo (PKO) paga la mitad y suma la otra mitad al bounty de quien elimina. Misterioso abre un sobre al azar por cada eliminación cuando salen los sobres." },
        payouts: { label: "Premios", hint: "Porcentajes, el 1er lugar primero, como 50, 30, 20. Déjalo en blanco y se eligen según cuántos jueguen." },
        roundTo: { label: "Redondear Premios A", hint: "Para que a nadie le paguen {amount}. Lo que sobre va al 1er lugar." },
      },
      cash: {
        heading: "Cash Games",
        buyIn: {
          label: "Buy-In",
          hint: "En ciegas grandes, para que funcione en cualquier nivel de apuestas. Los montos salen de las ciegas de cada partida.",
          min: "Mín",
          standard: "Estándar",
          max: "Máx",
        },
        length: { hint: "Para la hora de fin y el cálculo de fichas. Los cash games siempre pueden alargarse." },
        straddles: { label: "Straddles", checkbox: "Straddles Permitidos" },
        bomb: { label: "Bomb pots", hint: "El ante en ciegas grandes y cada cuánto toca uno.", anteBB: "Ante (ciegas grandes)", every: "Cada cuántos minutos (0 = cuando se pida)" },
        sevenTwo: { label: "El juego del 7-2 (ciegas grandes)", hint: "Lo que cobra un 7-2 ganador a cada jugador." },
        highHand: { label: "Mano más alta", hint: "El premio y cuánto dura cada tramo." },
      },
      both: {
        heading: "Ambos",
        seatsPerTable: { label: "Asientos por Mesa", hint: "Para sortear asientos y equilibrar mesas.", option: "{n} Asientos" },
      },
      templates: {
        heading: "Plantillas",
        empty: "Aún no hay plantillas.",
        typeCash: "Cash",
        typeTournament: "Torneo",
        playersCount: { one: "{n} jugador", other: "{n} jugadores" },
        deleteAriaLabel: "Eliminar plantilla {name}",
        deleteConfirm: "¿Eliminar la plantilla “{name}”? Las partidas hechas con ella se conservan.",
        deletedToast: "“{name}” eliminada",
        savedSetups: {
          label: "Configuraciones Guardadas",
          hintBefore: "Crea una desde",
          saveAsTemplate: "Guardar como Plantilla",
          hintAfter: "en una partida nueva; empieza desde ahí o desde Comandos",
        },
      },
    },
    chips: {
      heading: "Sets de Fichas",
      lede: "Las fichas con las que juegas. El valor es lo que está impreso en la ficha; cada partida puede escalarlo (una ficha impresa con 1 puede jugar como 100 en un torneo). Las partidas nuevas empiezan con el set por defecto.",
    },
    tv: {
      heading: "TV",
      levelWarning: {
        label: "Aviso de Nivel",
        hint: "La TV suena y el reloj se pone rojo antes de que suban las ciegas. El último minuto parpadea.",
        before1: "1 Minuto Antes",
        before2: "2 Minutos Antes",
        before5: "5 Minutos Antes",
      },
      sound: { label: "Sonido", hint: "Los navegadores necesitan un clic en la TV antes de poder reproducir sonido, así que la TV lo pide.", checkbox: "Iniciar Pantallas de TV con el Sonido Activado" },
      volume: {
        label: "Volumen de la TV",
        hint: "Los pitidos, los tics de la cuenta regresiva y el anunciador. Una TV en otro dispositivo también sigue esto. Suelta el control para escuchar el sonido de subida de nivel.",
      },
      keepAwake: {
        label: "Mantener Despierta",
        hint: "Para que la pantalla no se oscurezca en medio de un nivel. Funciona en Chrome, Edge y Safari.",
        checkbox: "Mantener la TV Encendida Mientras Corre el Reloj",
      },
      announcer: {
        label: "Anunciador",
        hint: "Después del pitido, la TV lee en voz alta, con la voz propia del dispositivo, las nuevas ciegas, descansos, eliminaciones y el ganador.",
        checkbox: "Leer los Grandes Momentos en Voz Alta",
        hearIt: "Escucharlo",
        sample: "Nivel 5. Las ciegas son 200, 400, con un ante de 400.",
      },
      money: {
        label: "Dinero en la TV",
        hint: "Apágalo para que la bolsa de premios, los pagos y los buy-ins no aparezcan en la pantalla grande. La pantalla del dealer sigue mostrando todo.",
        checkbox: "Mostrar Montos de Dinero en la TV",
      },
    },
    yours: { heading: "Tus Datos" },
    lock: {
      heading: "Bloqueo con Código de Acceso",
      intro:
        "Todo aquí ya está encriptado. Un código de acceso va más allá: nada de lo guardado se puede abrir sin él, ni siquiera alguien que use este mismo navegador, y PitMaster se bloquea solo después de un rato sin actividad. Las pantallas de TV siguen mostrando la partida mientras está bloqueada, y nada en ellas puede cambiarla.",
      needsHttps: "Necesita una página segura (https), donde este navegador pueda encriptar.",
      passcode: {
        label: "Código de Acceso",
        hint: "Al menos {n} caracteres, y cuanto más largo, más difícil de descifrar si alguien copia los archivos de este navegador. Si lo olvidas, todo lo guardado aquí se pierde para siempre, así que exporta antes.",
        newPlaceholder: "Nuevo Código de Acceso",
        newAriaLabel: "Nuevo código de acceso",
        againPlaceholder: "Escríbelo Otra Vez",
        againAriaLabel: "Nuevo código de acceso, otra vez",
        tooShort: "Al menos {n} caracteres.",
        mismatch: "Los dos aún no coinciden.",
        turnOnButton: "Activar el Bloqueo",
        turningOn: "Bloqueando…",
      },
      autoLock: {
        label: "Bloqueo Automático",
        hint: "Después de este tiempo sin clics, toques o teclas en ninguna pestaña de PitMaster. Las pantallas de TV no cuentan y no se bloquean.",
        lockNowButton: "Bloquear Ahora",
        options: {
          sec30: "Después de 30 Segundos",
          min1: "Después de 1 Minuto",
          min2: "Después de 2 Minutos",
          min5: "Después de 5 Minutos",
          min10: "Después de 10 Minutos",
          min15: "Después de 15 Minutos",
          min30: "Después de 30 Minutos",
          hour1: "Después de 1 Hora",
          onClose: "Solo Cuando se Cierre PitMaster",
        },
        phrase: {
          sec30: "después de 30 segundos",
          min1: "después de 1 minuto",
          min2: "después de 2 minutos",
          min5: "después de 5 minutos",
          min10: "después de 10 minutos",
          min15: "después de 15 minutos",
          min30: "después de 30 minutos",
          hour1: "después de 1 hora",
          onClose: "solo cuando se cierre",
          awhile: "después de un rato",
        },
      },
      changeOrOff: {
        label: "Cambiar o Desactivar",
        hint: "Ambos piden el código de acceso actual. De cualquier forma, todo sigue encriptado.",
        currentPlaceholder: "Código de Acceso Actual",
        currentAriaLabel: "Código de acceso actual",
        typeCurrentFirst: "Escribe primero el código de acceso actual",
        changeButton: "Cambiar Código de Acceso",
        changingBusy: "Cambiando…",
        turnOffButton: "Desactivar el Bloqueo",
      },
      error: { wrongPasscode: "Ese no es el código de acceso actual.", generic: "No se pudo cambiar. No se cambió nada; inténtalo de nuevo." },
      toast: { off: "Bloqueo desactivado. Todo sigue encriptado.", on: "Bloqueado con un código de acceso.", onWithAuto: "Bloqueado con un código de acceso. PitMaster se bloquea {phrase} sin actividad." },
    },
    data: {
      heading: "Exportar e Importar",
      lede: "Todo está guardado en este navegador, encriptado: {summary} ({kb} KB). No hay cuenta ni copia en la nube, así que un archivo es la forma de llevarlo a otro dispositivo.",
      privacyLink: "Cómo se Maneja tu Información",
      summary: { join: "{rest} y {last}" },
      count: {
        games: { one: "{n} partida", other: "{n} partidas" },
        chipSets: { one: "{n} set de fichas", other: "{n} sets de fichas" },
        templates: { one: "{n} plantilla", other: "{n} plantillas" },
        newGames: { one: "{n} partida nueva", other: "{n} partidas nuevas" },
        payLinksFor: { one: "enlaces de pago para {n} persona", other: "enlaces de pago para {n} personas" },
        inProgress: "({n} en curso)",
      },
      export: {
        label: "Exportar",
        hint: "Un solo archivo con todo. Guárdalo como respaldo, o impórtalo en otro dispositivo y sigue desde ahí. Sin contraseña, cualquiera que tenga el archivo puede leerlo.",
        button: "Exportar Todo",
        busy: "Bloqueando…",
        lastExported: "Última exportación {time}.",
        includeSettings: "Incluir Estos Ajustes",
        lockWithPassword: "Bloquearlo con una Contraseña",
        passwordPlaceholder: "Contraseña",
        passwordAriaLabel: "Contraseña del archivo",
        passwordNote: "Al menos {n} caracteres, y cuanto más larga, más fuerte. Encriptado con AES-256. Importarlo requiere esta contraseña, y una perdida no se puede recuperar, ni por ti ni por nosotros.",
        passwordTitle: "Escribe una contraseña de al menos {n} caracteres, o desactiva el bloqueo",
        toast: {
          locked: "Exportado y bloqueado. Importarlo requiere la contraseña.",
          plain: "Exportado. En el otro dispositivo, ábrelo con Importar.",
          lockFailed: "No se pudo bloquear el archivo. Inténtalo de nuevo, o expórtalo sin contraseña.",
        },
      },
      import: {
        label: "Importar",
        hint: "Una partida en curso sigue justo donde quedó, con reloj, jugadores y código de TV incluidos.",
        kindGame: "Una partida",
        kindEverything: "Todo",
        exportedAt: "exportado el {day} a las {time}",
        plusSettings: ", más los ajustes",
        modeAriaLabel: "Cómo importar",
        modeMerge: "Añadir a Este Navegador",
        modeReplace: "Reemplazar Todo",
        replaceCount: { one: "La {n} partida de aquí se reemplaza por las del archivo, que tiene", other: "Las {n} partidas de aquí se reemplazan por las del archivo, que tiene" },
        replaceOthers: "También los sets de fichas, plantillas y enlaces de pago.",
        newerCount: "{n} más nuevas que la copia de aquí",
        keptCount: "{n} ya están al día",
        noGames: "No tiene partidas",
        nothingDeleted: "Nada aquí se elimina.",
        useSettingsToo: {
          label: "Usar También Sus Ajustes",
          hint: "Reglas de la casa, dinero, valores por defecto y la TV. El tema y los sonidos de esta pantalla se quedan como están.",
        },
        importButton: "Importar",
        importedToast: { one: "{n} partida importada", other: "{n} partidas importadas" },
        undoneToast: "Importación deshecha. Todo está como estaba.",
        lockedWithPassword: "Está bloqueado con una contraseña.",
        filePasswordAriaLabel: "La contraseña del archivo",
        typePasswordFirst: "Escribe primero la contraseña del archivo",
        unlockingBusy: "Desbloqueando…",
        unlockButton: "Desbloquear",
        dropAriaLabel: "Importar un archivo",
        chooseFile: "Elegir un Archivo",
        orDropHere: "O Suéltalo Aquí",
        importedLabel: "Importado.",
        readyToRun: "Listas para Jugar:",
        inProgress: "En Curso:",
        undoButton: "Deshacer Importación",
        error: { tooBig: "Ese archivo es demasiado grande para ser una exportación de PitMaster.", failed: "Ese archivo no funcionó. {message}" },
      },
      startOver: {
        label: "Empezar de Nuevo",
        hint: "Elimina cada partida y set de fichas personalizado en este navegador. No se puede deshacer.",
        button: "Eliminar Todo",
        confirm: "¿Eliminar cada partida y set de fichas personalizado? Esto no se puede deshacer. Exporta antes si podrías quererlos.",
        doneToast: "Todo borrado. Un comienzo limpio.",
      },
    },
  },
  fr: {
    page: {
      title: "Paramètres",
      heading: "Paramètres",
      savedHint: "Enregistrés dans ce navigateur, chiffrés. Pour les emporter sur un autre appareil,",
      exportLink: "exportez-les",
      savedHintEnd: "avec vos parties.",
    },
    nav: {
      groups: { games: "Parties", you: "Vous" },
      tabs: { game: "Votre Partie", defaults: "Nouvelles Parties", chips: "Sets de Jetons", tv: "TV", general: "Général", yours: "Vos Données" },
    },
    language: {
      title: "Langue",
      hint: "La langue dans laquelle les textes de PitMaster sont écrits. Devinée depuis votre navigateur au départ, et toujours modifiable ici. Les parties et les buy-ins utilisent la devise ci-dessous, pas celle-ci.",
    },
    region: {
      heading: "Langue et Région",
      currency: {
        label: "Devise",
        hint: "Comment les buy-ins, les pots et les jetons sont écrits :",
        hintEnd: "Les TV en direct suivent aussi celle-ci.",
        names: { USD: "Dollar américain ($)", EUR: "Euro (€)", JPY: "Yen japonais (¥)", GBP: "Livre sterling (£)", CNY: "Yuan chinois (¥)", AUD: "Dollar australien ($)" },
      },
      time: { label: "Heure", hint: "Les heures de début, d'élimination et l'horloge de la TV. Il est {time}.", h12: "12 Heures", h24: "24 Heures" },
    },
    appearance: {
      heading: "Apparence",
      theme: { label: "Thème", hint: "Système suit votre appareil, et l'écran de TV aussi.", system: "Système", light: "Clair", dark: "Sombre" },
      sounds: {
        label: "Sons de l'Interface",
        hint: "Des clics discrets sous les boutons et interrupteurs, des jetons qui claquent quand l'argent bouge, et une note propre à chaque jeton quand vous le touchez. Les alarmes de la TV sont séparées.",
      },
      volume: {
        label: "Volume de l'Interface",
        hint: "Le volume de ces clics et claquements.",
        hintOn: "Relâchez le curseur pour l'entendre.",
        hintOff: "Activez les Sons de l'Interface pour le régler.",
        disabledTitle: "Les Sons de l'Interface sont désactivés",
      },
      motion: {
        label: "Mouvement",
        hint: "Système suit le réglage de mouvement réduit de votre appareil. Réduit désactive les glissements, retournements et changements de page ici et sur la TV.",
        system: "Système",
        reduced: "Réduit",
      },
      toys: {
        label: "Distractions de la Page d'Accueil",
        hint: "Des cartes en éventail, des jetons à trier, des dés, une compteuse de billets et une roulette à côté du titre. Désactivé garde la page d'accueil centrée sur vos parties.",
      },
    },
    keyboard: {
      heading: "Clavier",
      openCommands: {
        label: "Ouvrir Commandes",
        hint: "La boîte de commandes fait tout par son nom : aller sur une page, démarrer un modèle, ou « éliminer mike » sur l'écran du croupier. Cliquez sur le raccourci, puis appuyez sur les touches voulues.",
        pressNewKeys: "Appuyez sur les Nouvelles Touches",
        andAKey: "et une Touche",
        escToKeep: "Échap pour garder {key}",
        resetButton: "Réinitialiser à {key}",
        saved: "Enregistré. {key} ouvre Commandes maintenant.",
        resetTo: "Revenu à {key}.",
      },
      otherShortcuts: { label: "Autres Raccourcis", hint: "Ceux-ci sont fixes. Aucun ne se déclenche pendant que vous tapez dans un champ." },
    },
    general: { heading: "Général" },
    game: {
      heading: "Votre Partie",
      lede: "Activez ce que vos parties utilisent, quelle que soit leur taille. Ce qui est désactivé reste désactivé dans les nouvelles parties et sur l'écran du croupier, et une partie peut toujours l'activer juste pour elle.",
      rake: {
        label: "Rake de Cash Game",
        hint: "Une part de chaque pot prélevée dans une caisse de rake, ou des frais fixes pour s'asseoir. Les nouvelles parties partent de ce que vous réglez ici.",
        checkbox: "Prélever un Rake ou des Frais de Place",
      },
      houseCut: { label: "Commission de la Maison en Tournoi", hint: "Des frais fixes par entrée, un pourcentage du reste, ou les deux.", checkbox: "Prélever une Part de Chaque Buy-In" },
      extras: {
        heading: "Extras",
        hint: "Une partie qui utilise déjà l'un d'eux le conserve.",
        bounties: { label: "Primes et Éliminations", hint: "Une prime sur chaque tête, et qui a éliminé qui." },
        rebuys: { label: "Recaves et Recharges", hint: "Racheter des jetons, et faire l'appoint à la première pause." },
        seats: { label: "Tirage des Places et Tables", hint: "Tirer les places, et équilibrer les tables à mesure que les joueurs sont éliminés." },
        deals: { label: "Accords de Table Finale", hint: "Le calculateur d'ICM et de partage des jetons." },
        payLinks: { label: "Liens de Paiement", hint: "Liens Venmo, Cash App et PayPal dans les règlements et les gains." },
        costs: { label: "Frais Partagés", hint: "Partagez ce qui a été acheté pour la partie, comme à manger ou un nouveau jeu de cartes. Ça entre dans le règlement, pas dans les résultats." },
        ledger: { label: "Qui Doit Quoi", hint: "Cochez les paiements du règlement au fur et à mesure. Joueurs affiche ce qui reste dû sur toutes les parties." },
        bombPots: { label: "Bomb pots", hint: "Parties cash : tout le monde met une ante et le flop sort sans enchères avant. À la demande ou sur minuteur." },
        sevenTwo: { label: "Le jeu du 7-2", hint: "Parties cash : gagner un coup avec 7-2 rapporte un montant fixe de chaque joueur servi." },
        highHand: { label: "Meilleure main", hint: "Parties cash : la meilleure main de chaque période gagne un prix payé par la maison." },
      },
    },
    house: {
      heading: "Règles de la Maison",
      hint: "Une par ligne. Elles s'affichent sur la TV sous l'horloge, en alternance quand il y en a plus de deux.",
      placeholder: "Pas de mises en string.\nLes recaves ferment à la première pause.",
      commonOnes: "Les Plus Courantes :",
      onNewGame: "Les Mettre sur Chaque Nouvelle Partie",
      commonRules: {
        cardsSpeak: "Les cartes parlent.",
        showOneShowAll: "Montrer une carte, c'est les montrer toutes.",
        verbalBinding: "L'annonce verbale est définitive.",
        noStringBets: "Pas de mises en string.",
        onePlayerToAHand: "Un seul joueur par main.",
        protectYourHand: "Protégez votre main.",
        chipsStayOnTable: "Les jetons restent sur la table.",
        straddlesWelcome: "Les straddles sont les bienvenus.",
        runItTwice: "On peut courir la main deux fois si les deux joueurs sont d'accord.",
        chopBlinds: "Les blindes se partagent si tout le monde se couche jusqu'à elles.",
        phonesDown: "Téléphones posés pendant une main.",
        rebuysBetweenHands: "Recaves uniquement entre les mains.",
        newDeckOnRequest: "Nouveau jeu de cartes sur demande.",
        lastHandAnnounced: "La dernière main est annoncée.",
        settleUp: "Réglez vos comptes avant de partir.",
        finalSay: "Celui qui organise la partie a le dernier mot.",
      },
    },
    defaults: {
      heading: "Nouvelles Parties",
      lede: "D'où part une nouvelle partie. Chacun de ces réglages peut encore être changé sur la partie elle-même, et un modèle fixe les siens.",
      auto: "Auto",
      length: { label: "Durée", about: "Environ {time}" },
      tournaments: {
        heading: "Tournois",
        buyIn: { label: "Buy-In {sym}", hint: "Les recaves commencent au même prix." },
        players: { label: "Joueurs", hint: "Combien jouent habituellement. Les tapis, le calcul des jetons et les gains en partent." },
        startingStack: { label: "Tapis de Départ", hint: "Laissez vide et chaque partie en choisira un adapté à son set de jetons et à ses joueurs." },
        startingDepth: { label: "Profondeur de Départ", hint: "Le tapis en grosses blindes au niveau 1." },
        length: { hint: "La structure de blindes est construite pour se terminer vers cette heure-là." },
        levelLength: { label: "Durée de Niveau" },
        breaks: { label: "Pauses", hint: "0 niveau signifie pas de pause.", levelsBetween: "Niveaux Entre les Pauses", minutes: "Minutes de Pause" },
        antes: {
          label: "Antes et Inscriptions Tardives",
          hint: "0 signifie pas d'ante. Les inscriptions tardives ferment après le niveau choisi.",
          antesFrom: "Antes à Partir du Niveau",
          lateRegThrough: "Inscriptions Tardives Jusqu'au Niveau",
        },
        rebuys: {
          label: "Recaves et Recharges",
          hint: "Les recaves coûtent le buy-in et donnent un tapis de départ. La recharge arrive à la première pause.",
          checkbox: "Recaves",
          throughLevel: "Jusqu'au Niveau",
          addOnCheckbox: "Recharge",
          cost: "Coût {sym}",
        },
        bounty: { label: "Prime {sym}", hint: "La part de chaque buy-in posée sur la tête du joueur. 0 signifie aucune." },
        bountyKind: { label: "Type de bounty", hint: "Fixe rapporte tout le bounty à chaque élimination. Progressif (PKO) en rapporte la moitié et ajoute l'autre moitié au bounty de celui qui élimine. Mystère ouvre une enveloppe au hasard à chaque élimination, une fois les enveloppes sorties." },
        payouts: { label: "Gains", hint: "En pourcentages, la 1re place d'abord, comme 50, 30, 20. Laissez vide et ils sont choisis selon le nombre de joueurs." },
        roundTo: { label: "Arrondir les Gains à", hint: "Pour que personne ne soit payé {amount}. Ce qui reste va à la 1re place." },
      },
      cash: {
        heading: "Cash Games",
        buyIn: {
          label: "Buy-In",
          hint: "En grosses blindes, pour que ça marche à n'importe quelles mises. Les montants viennent des blindes de chaque partie.",
          min: "Min",
          standard: "Standard",
          max: "Max",
        },
        length: { hint: "Pour l'heure de fin et le calcul des jetons. Les cash games peuvent toujours durer plus longtemps." },
        straddles: { label: "Straddles", checkbox: "Straddles Autorisés" },
        bomb: { label: "Bomb pots", hint: "L'ante en grosses blinds, et la fréquence.", anteBB: "Ante (grosses blinds)", every: "Toutes les combien de minutes (0 = sur demande)" },
        sevenTwo: { label: "Le jeu du 7-2 (grosses blinds)", hint: "Ce qu'un gain au 7-2 rapporte de chaque joueur." },
        highHand: { label: "Meilleure main", hint: "Le prix, et la durée de chaque période." },
      },
      both: {
        heading: "Les Deux",
        seatsPerTable: { label: "Places par Table", hint: "Pour le tirage des places et l'équilibrage des tables.", option: "{n} Places" },
      },
      templates: {
        heading: "Modèles",
        empty: "Pas encore de modèle.",
        typeCash: "Cash",
        typeTournament: "Tournoi",
        playersCount: { one: "{n} joueur", other: "{n} joueurs" },
        deleteAriaLabel: "Supprimer le modèle {name}",
        deleteConfirm: "Supprimer le modèle « {name} » ? Les parties créées à partir de lui restent.",
        deletedToast: "« {name} » supprimé",
        savedSetups: {
          label: "Configurations Enregistrées",
          hintBefore: "Créez-en une depuis",
          saveAsTemplate: "Enregistrer comme Modèle",
          hintAfter: "sur une nouvelle partie ; démarrez-en une de là ou depuis Commandes",
        },
      },
    },
    chips: {
      heading: "Sets de Jetons",
      lede: "Les jetons avec lesquels vous jouez. La valeur est celle imprimée sur le jeton ; chaque partie peut la mettre à l'échelle (un jeton imprimé 1 peut valoir 100 dans un tournoi). Les nouvelles parties partent du set par défaut.",
    },
    tv: {
      heading: "TV",
      levelWarning: {
        label: "Alerte de Niveau",
        hint: "La TV bipe et l'horloge devient rouge avant que les blindes montent. La dernière minute clignote.",
        before1: "1 Minute Avant",
        before2: "2 Minutes Avant",
        before5: "5 Minutes Avant",
      },
      sound: { label: "Son", hint: "Les navigateurs ont besoin d'un clic sur la TV avant de pouvoir jouer du son, donc la TV le demande.", checkbox: "Démarrer les Écrans TV avec le Son Activé" },
      volume: {
        label: "Volume de la TV",
        hint: "Les bips, les tics du compte à rebours et l'annonceur. Une TV sur un autre appareil suit aussi ce réglage. Relâchez le curseur pour entendre le son de changement de niveau.",
      },
      keepAwake: {
        label: "Garder Éveillé",
        hint: "Pour que l'écran ne s'assombrisse pas en plein niveau. Fonctionne dans Chrome, Edge et Safari.",
        checkbox: "Garder la TV Allumée Pendant que l'Horloge Tourne",
      },
      announcer: {
        label: "Annonceur",
        hint: "Après le bip, la TV lit à voix haute, avec la voix propre de l'appareil, les nouvelles blindes, les pauses, les éliminations et le gagnant.",
        checkbox: "Lire les Grands Moments à Voix Haute",
        hearIt: "Écouter",
        sample: "Niveau 5. Les blindes sont 200, 400, avec un ante de 400.",
      },
      money: {
        label: "Argent sur la TV",
        hint: "Désactivez pour garder la cagnotte, les gains et les buy-ins hors du grand écran. L'écran du croupier affiche toujours tout.",
        checkbox: "Afficher les Montants d'Argent sur la TV",
      },
    },
    yours: { heading: "Vos Données" },
    lock: {
      heading: "Verrouillage par Code d'Accès",
      intro:
        "Tout ici est déjà chiffré. Un code d'accès va plus loin : rien de ce qui est enregistré ne peut être ouvert sans lui, même par quelqu'un utilisant ce même navigateur, et PitMaster se verrouille de lui-même après un moment sans activité. Les écrans de TV continuent d'afficher la partie pendant qu'elle est verrouillée, et rien sur eux ne peut la modifier.",
      needsHttps: "Il faut une page sécurisée (https), où ce navigateur puisse chiffrer.",
      passcode: {
        label: "Code d'Accès",
        hint: "Au moins {n} caractères, et plus c'est long, plus c'est difficile à casser si quelqu'un copie les fichiers de ce navigateur. L'oublier fait perdre pour de bon tout ce qui est enregistré ici, donc exportez d'abord.",
        newPlaceholder: "Nouveau Code d'Accès",
        newAriaLabel: "Nouveau code d'accès",
        againPlaceholder: "Retapez-le",
        againAriaLabel: "Nouveau code d'accès, encore une fois",
        tooShort: "Au moins {n} caractères.",
        mismatch: "Les deux ne correspondent pas encore.",
        turnOnButton: "Activer le Verrouillage",
        turningOn: "Verrouillage…",
      },
      autoLock: {
        label: "Verrouillage Automatique",
        hint: "Après ce délai sans clic, tape ou touche dans un onglet PitMaster. Les écrans de TV ne comptent pas et ne se verrouillent pas.",
        lockNowButton: "Verrouiller Maintenant",
        options: {
          sec30: "Après 30 Secondes",
          min1: "Après 1 Minute",
          min2: "Après 2 Minutes",
          min5: "Après 5 Minutes",
          min10: "Après 10 Minutes",
          min15: "Après 15 Minutes",
          min30: "Après 30 Minutes",
          hour1: "Après 1 Heure",
          onClose: "Seulement à la Fermeture de PitMaster",
        },
        phrase: {
          sec30: "après 30 secondes",
          min1: "après 1 minute",
          min2: "après 2 minutes",
          min5: "après 5 minutes",
          min10: "après 10 minutes",
          min15: "après 15 minutes",
          min30: "après 30 minutes",
          hour1: "après 1 heure",
          onClose: "seulement à la fermeture",
          awhile: "après un moment",
        },
      },
      changeOrOff: {
        label: "Changer ou Désactiver",
        hint: "Les deux demandent le code d'accès actuel. Tout reste chiffré dans les deux cas.",
        currentPlaceholder: "Code d'Accès Actuel",
        currentAriaLabel: "Code d'accès actuel",
        typeCurrentFirst: "Tapez d'abord le code d'accès actuel",
        changeButton: "Changer le Code d'Accès",
        changingBusy: "Changement…",
        turnOffButton: "Désactiver le Verrouillage",
      },
      error: { wrongPasscode: "Ce n'est pas le code d'accès actuel.", generic: "Impossible de le changer. Rien n'a été modifié ; réessayez." },
      toast: { off: "Verrouillage désactivé. Tout reste chiffré.", on: "Verrouillé avec un code d'accès.", onWithAuto: "Verrouillé avec un code d'accès. PitMaster se verrouille {phrase} sans activité." },
    },
    data: {
      heading: "Exporter et Importer",
      lede: "Tout est enregistré dans ce navigateur, chiffré : {summary} ({kb} Ko). Il n'y a ni compte ni copie dans le cloud, donc un fichier est le moyen de tout emporter sur un autre appareil.",
      privacyLink: "Comment vos Données sont Traitées",
      summary: { join: "{rest} et {last}" },
      count: {
        games: { one: "{n} partie", other: "{n} parties" },
        chipSets: { one: "{n} set de jetons", other: "{n} sets de jetons" },
        templates: { one: "{n} modèle", other: "{n} modèles" },
        newGames: { one: "{n} nouvelle partie", other: "{n} nouvelles parties" },
        payLinksFor: { one: "liens de paiement pour {n} personne", other: "liens de paiement pour {n} personnes" },
        inProgress: "({n} en cours)",
      },
      export: {
        label: "Exporter",
        hint: "Un seul fichier avec tout. Gardez-le comme sauvegarde, ou importez-le sur un autre appareil et continuez de là. Sans mot de passe, quiconque a le fichier peut le lire.",
        button: "Tout Exporter",
        busy: "Verrouillage…",
        lastExported: "Dernière exportation {time}.",
        includeSettings: "Inclure Ces Paramètres",
        lockWithPassword: "Le Verrouiller avec un Mot de Passe",
        passwordPlaceholder: "Mot de Passe",
        passwordAriaLabel: "Mot de passe du fichier",
        passwordNote: "Au moins {n} caractères, et plus c'est long, plus c'est solide. Chiffré en AES-256. L'importer demande ce mot de passe, et un mot de passe perdu ne peut être récupéré, ni par vous ni par nous.",
        passwordTitle: "Tapez un mot de passe d'au moins {n} caractères, ou désactivez le verrouillage",
        toast: {
          locked: "Exporté et verrouillé. L'importer demande le mot de passe.",
          plain: "Exporté. Sur l'autre appareil, ouvrez-le avec Importer.",
          lockFailed: "Impossible de verrouiller le fichier. Réessayez, ou exportez-le sans mot de passe.",
        },
      },
      import: {
        label: "Importer",
        hint: "Une partie en cours reprend juste où elle en était, horloge, joueurs et code TV compris.",
        kindGame: "Une partie",
        kindEverything: "Tout",
        exportedAt: "exporté le {day} à {time}",
        plusSettings: ", plus les paramètres",
        modeAriaLabel: "Comment importer",
        modeMerge: "Ajouter à ce Navigateur",
        modeReplace: "Tout Remplacer",
        replaceCount: { one: "La {n} partie ici est remplacée par celle du fichier, qui en a", other: "Les {n} parties ici sont remplacées par celles du fichier, qui en a" },
        replaceOthers: "Les sets de jetons, modèles et liens de paiement aussi.",
        newerCount: "{n} plus récentes que la copie ici",
        keptCount: "{n} déjà à jour",
        noGames: "Il n'y a pas de partie dedans",
        nothingDeleted: "Rien ici n'est supprimé.",
        useSettingsToo: {
          label: "Utiliser Aussi Ses Paramètres",
          hint: "Règles de la maison, argent, réglages par défaut et TV. Le thème et les sons de cet écran restent comme ils sont.",
        },
        importButton: "Importer",
        importedToast: { one: "{n} partie importée", other: "{n} parties importées" },
        undoneToast: "Importation annulée. Tout est comme avant.",
        lockedWithPassword: "Il est verrouillé avec un mot de passe.",
        filePasswordAriaLabel: "Le mot de passe du fichier",
        typePasswordFirst: "Tapez d'abord le mot de passe du fichier",
        unlockingBusy: "Déverrouillage…",
        unlockButton: "Déverrouiller",
        dropAriaLabel: "Importer un fichier",
        chooseFile: "Choisir un Fichier",
        orDropHere: "Ou Déposez-le Ici",
        importedLabel: "Importé.",
        readyToRun: "Prête à Jouer :",
        inProgress: "En Cours :",
        undoButton: "Annuler l'Importation",
        error: { tooBig: "Ce fichier est trop volumineux pour être un export PitMaster.", failed: "Ce fichier n'a pas fonctionné. {message}" },
      },
      startOver: {
        label: "Tout Recommencer",
        hint: "Supprime chaque partie et set de jetons personnalisé dans ce navigateur. Ne peut pas être annulé.",
        button: "Tout Supprimer",
        confirm: "Supprimer chaque partie et set de jetons personnalisé ? Ceci ne peut pas être annulé. Exportez d'abord si vous pourriez en avoir besoin.",
        doneToast: "Tout est effacé. Un nouveau départ.",
      },
    },
  },
  ar: {
    page: {
      title: "الإعدادات",
      heading: "الإعدادات",
      savedHint: "محفوظة في هذا المتصفح، ومشفّرة. لنقلها إلى جهاز آخر،",
      exportLink: "صدّرها",
      savedHintEnd: "مع ألعابك.",
    },
    nav: {
      groups: { games: "الألعاب", you: "أنت" },
      tabs: { game: "لعبتك", defaults: "الألعاب الجديدة", chips: "أطقم الرقائق", tv: "التلفاز", general: "عام", yours: "بياناتك" },
    },
    language: {
      title: "اللغة",
      hint: "اللغة التي يُكتب بها نص PitMaster نفسه. تُخمَّن من متصفحك في البداية، ويمكن تغييرها هنا دائمًا. الألعاب وقيم الدخول تستخدم العملة أدناه، وليس هذا الخيار.",
    },
    region: {
      heading: "اللغة والمنطقة",
      currency: {
        label: "العملة",
        hint: "كيف تُكتب قيم الدخول والبوتات ورقائق النقد:",
        hintEnd: "شاشات التلفاز المباشرة تتبع هذا الخيار أيضًا.",
        names: { USD: "دولار أمريكي ($)", EUR: "يورو (€)", JPY: "ين ياباني (¥)", GBP: "جنيه إسترليني (£)", CNY: "يوان صيني (¥)", AUD: "دولار أسترالي ($)" },
      },
      time: { label: "الوقت", hint: "أوقات البدء وأوقات الخروج وساعة التلفاز. الوقت الآن {time}.", h12: "12 ساعة", h24: "24 ساعة" },
    },
    appearance: {
      heading: "المظهر",
      theme: { label: "السمة", hint: "يتبع خيار النظام جهازك، وشاشة التلفاز تتبعه أيضًا.", system: "النظام", light: "فاتحة", dark: "داكنة" },
      sounds: {
        label: "أصوات الواجهة",
        hint: "نقرات هادئة تحت الأزرار والمفاتيح، وصوت اصطدام الرقائق عند تحرك المال، ولكل رقاقة نغمتها الخاصة عند لمسها. تنبيهات التلفاز منفصلة عن هذا.",
      },
      volume: {
        label: "مستوى صوت الواجهة",
        hint: "مدى ارتفاع هذه النقرات والاصطدامات.",
        hintOn: "حرّر شريط التمرير لسماعه.",
        hintOff: "فعّل أصوات الواجهة لضبطه.",
        disabledTitle: "أصوات الواجهة مُطفأة",
      },
      motion: {
        label: "الحركة",
        hint: "يتبع خيار النظام إعداد تقليل الحركة في جهازك. يوقف المخفَّف الانزلاقات والانقلابات وتبديل الصفحات هنا وعلى التلفاز.",
        system: "النظام",
        reduced: "مخفَّفة",
      },
      toys: {
        label: "أدوات الصفحة الرئيسية",
        hint: "أوراق تُفرد كمروحة، ورقائق تُرتَّب، وزهر نرد، وعدّاد أوراق نقدية، وعجلة روليت للعبث بها بجانب العنوان الرئيسي. الإطفاء يبقي الصفحة الرئيسية مقتصرة على ألعابك.",
      },
    },
    keyboard: {
      heading: "لوحة المفاتيح",
      openCommands: {
        label: "فتح الأوامر",
        hint: "يقوم صندوق الأوامر بأي شيء عبر اسمه: الانتقال إلى صفحة، أو بدء قالب، أو إخراج أحد اللاعبين من شاشة الموزّع. انقر على الاختصار ثم اضغط المفاتيح التي تريدها.",
        pressNewKeys: "اضغط المفاتيح الجديدة",
        andAKey: "ومفتاحًا",
        escToKeep: "اضغط Esc للاحتفاظ بـ {key}",
        resetButton: "إعادة تعيينه إلى {key}",
        saved: "تم الحفظ. {key} يفتح الأوامر الآن.",
        resetTo: "عاد إلى {key}.",
      },
      otherShortcuts: { label: "اختصارات أخرى", hint: "هذه ثابتة. لا يعمل أي منها أثناء الكتابة في حقل ما." },
    },
    general: { heading: "عام" },
    game: {
      heading: "لعبتك",
      lede: "فعّل ما تستخدمه ألعابك، مهما كان حجمها. أي خيار مُطفأ يبقى مُطفأ في الألعاب الجديدة وشاشة الموزّع، وأي لعبة يمكنها دائمًا تفعيله لنفسها فقط.",
      rake: {
        label: "عمولة اللعبة النقدية",
        hint: "جزء من كل بوت يوضع في صندوق العمولة، أو رسم ثابت للجلوس على الطاولة. الألعاب الجديدة تبدأ بما تضبطه هنا.",
        checkbox: "أخذ عمولة أو رسم مقعد",
      },
      houseCut: { label: "عمولة الجهة المنظمة في البطولات", hint: "رسم ثابت لكل دخول، أو نسبة من الباقي، أو كليهما.", checkbox: "أخذ نسبة من كل قيمة دخول" },
      extras: {
        heading: "إضافات",
        hint: "أي لعبة تستخدم إحداها بالفعل تحتفظ بها.",
        bounties: { label: "المكافآت والإقصاءات", hint: "مكافأة على كل لاعب، وسجل بمن أقصى من." },
        rebuys: { label: "إعادة الشراء والإضافات", hint: "شراء رقائق جديدة، والتزود عند أول استراحة." },
        seats: { label: "توزيع المقاعد والطاولات", hint: "توزيع المقاعد، وموازنة الطاولات مع خروج اللاعبين." },
        deals: { label: "اتفاقات الطاولة الأخيرة", hint: "حاسبة ICM وتقسيم الرقائق." },
        payLinks: { label: "روابط الدفع", hint: "روابط Venmo وCash App وPayPal في التسوية والجوائز." },
        costs: { label: "تكاليف مشتركة", hint: "قسّم ما اشتُري للعبة، مثل الطعام أو ورق لعب جديد. يدخل في التسوية لا في نتائج أحد." },
        ledger: { label: "من يدين لمن", hint: "علّم دفعات التسوية عند سدادها. تعرض صفحة اللاعبين ما زال مستحقًا من كل الألعاب." },
        bombPots: { label: "بومب بوت", hint: "ألعاب الكاش: الجميع يدفع رهانًا إجباريًا ويُكشف الفلوب بلا رهان قبله. عند الطلب أو بمؤقت." },
        sevenTwo: { label: "لعبة 7-2", hint: "ألعاب الكاش: الفوز بيد بـ 7-2 يجمع مبلغًا ثابتًا من كل لاعب وُزعت عليه الأوراق." },
        highHand: { label: "أعلى يد", hint: "ألعاب الكاش: أفضل يد في كل فترة تربح جائزة تدفعها الجهة المنظمة." },
      },
    },
    house: {
      heading: "قواعد المكان",
      hint: "قاعدة واحدة في كل سطر. تظهر على التلفاز تحت الساعة، وتتناوب عند وجود أكثر من قاعدتين.",
      placeholder: "لا رهانات تدريجية.\nإعادة الشراء تُغلق عند أول استراحة.",
      commonOnes: "القواعد الشائعة:",
      onNewGame: "وضعها في كل لعبة جديدة",
      commonRules: {
        cardsSpeak: "الأوراق هي الفيصل.",
        showOneShowAll: "من يكشف ورقة يكشفها كلها.",
        verbalBinding: "التصريح الشفهي قرار نهائي.",
        noStringBets: "لا رهانات تدريجية.",
        onePlayerToAHand: "لاعب واحد لكل يد.",
        protectYourHand: "احمِ أوراقك بنفسك.",
        chipsStayOnTable: "الرقائق تبقى على الطاولة.",
        straddlesWelcome: "الستراديل مسموح به.",
        runItTwice: "يمكن توزيع الأوراق مرتين إذا وافق اللاعبان.",
        chopBlinds: "تُقسَّم الرهانات العمياء إذا انسحب الجميع حتى وصولها.",
        phonesDown: "الهواتف بعيدًا أثناء اليد.",
        rebuysBetweenHands: "إعادة الشراء بين الأيدي فقط.",
        newDeckOnRequest: "مجموعة أوراق جديدة عند الطلب.",
        lastHandAnnounced: "يُعلن عن اليد الأخيرة مسبقًا.",
        settleUp: "سوِّ الحسابات قبل المغادرة.",
        finalSay: "من يدير اللعبة له القرار الأخير.",
      },
    },
    defaults: {
      heading: "الألعاب الجديدة",
      lede: "من أين تبدأ اللعبة الجديدة. كل واحد من هذه الإعدادات يمكن تغييره في اللعبة نفسها، والقالب يحدد إعداداته الخاصة.",
      auto: "تلقائي",
      length: { label: "المدة", about: "نحو {time}" },
      tournaments: {
        heading: "البطولات",
        buyIn: { label: "قيمة الدخول {sym}", hint: "إعادة الشراء تبدأ بنفس السعر." },
        players: { label: "اللاعبون", hint: "كم لاعبًا يشارك عادة. الرقائق وحساباتها والجوائز تبدأ من هذا الرقم." },
        startingStack: { label: "الرقائق الابتدائية", hint: "اتركه فارغًا وستختار كل لعبة قيمة تناسب طقم رقائقها وعدد لاعبيها." },
        startingDepth: { label: "العمق الابتدائي", hint: "الرقائق بعدد الرهانات العمياء الكبيرة في المستوى 1." },
        length: { hint: "تُبنى بنية الرهانات العمياء لتنتهي في هذا الوقت تقريبًا." },
        levelLength: { label: "مدة المستوى" },
        breaks: { label: "الاستراحات", hint: "المستوى 0 يعني بلا استراحات.", levelsBetween: "عدد المستويات بين الاستراحات", minutes: "دقائق الاستراحة" },
        antes: {
          label: "الأنتي والتسجيل المتأخر",
          hint: "0 يعني بلا أنتي. التسجيل المتأخر يُغلق بعد المستوى الذي تختاره.",
          antesFrom: "الأنتي ابتداءً من المستوى",
          lateRegThrough: "التسجيل المتأخر حتى المستوى",
        },
        rebuys: {
          label: "إعادة الشراء والإضافات",
          hint: "تكلف إعادة الشراء قيمة الدخول وتمنح رقائق ابتدائية. تأتي الإضافة عند أول استراحة.",
          checkbox: "إعادة الشراء",
          throughLevel: "حتى المستوى",
          addOnCheckbox: "إضافة",
          cost: "التكلفة {sym}",
        },
        bounty: { label: "المكافأة {sym}", hint: "الجزء من كل قيمة دخول الذي يوضع على رأس اللاعب. 0 يعني بلا مكافأة." },
        bountyKind: { label: "نوع مكافأة الإقصاء", hint: "الثابتة تدفع المكافأة كاملة لكل إقصاء. التصاعدية (PKO) تدفع النصف وتضيف النصف الآخر إلى مكافأة من أقصى. الغامضة تفتح ظرفًا عشوائيًا لكل إقصاء بعد ظهور الأظرف." },
        payouts: { label: "توزيع الجوائز", hint: "نسب مئوية، المركز الأول أولًا، مثل 50، 30، 20. اتركه فارغًا وتُختار حسب عدد اللاعبين." },
        roundTo: { label: "تقريب الجوائز إلى", hint: "حتى لا يُدفع لأحد {amount}. أي فائض يذهب إلى المركز الأول." },
      },
      cash: {
        heading: "الألعاب النقدية",
        buyIn: {
          label: "قيمة الدخول",
          hint: "بعدد الرهانات العمياء الكبيرة، لتعمل عند أي مستوى رهان. القيم الفعلية تأتي من رهانات كل لعبة.",
          min: "الأدنى",
          standard: "المعتاد",
          max: "الأقصى",
        },
        length: { hint: "لتحديد وقت الانتهاء وحساب الرقائق. يمكن للألعاب النقدية أن تستمر طويلًا دائمًا." },
        straddles: { label: "الستراديل", checkbox: "الستراديل مسموح به" },
        bomb: { label: "بومب بوت", hint: "الرهان الإجباري بالبلايند الكبير، وكل كم يحين واحد.", anteBB: "الرهان الإجباري (بلايند كبير)", every: "كل كم دقيقة (0 = عند الطلب)" },
        sevenTwo: { label: "لعبة 7-2 (بلايند كبير)", hint: "ما يجمعه الفوز بـ 7-2 من كل لاعب." },
        highHand: { label: "أعلى يد", hint: "الجائزة، ومدة كل فترة." },
      },
      both: {
        heading: "كلاهما",
        seatsPerTable: { label: "المقاعد لكل طاولة", hint: "لتوزيع المقاعد وموازنة الطاولات.", option: "{n} مقاعد" },
      },
      templates: {
        heading: "القوالب",
        empty: "لا توجد قوالب بعد.",
        typeCash: "نقدية",
        typeTournament: "بطولة",
        playersCount: { zero: "بلا لاعبين", one: "لاعب واحد", two: "لاعبان", few: "{n} لاعبين", many: "{n} لاعبًا", other: "{n} لاعب" },
        deleteAriaLabel: "حذف القالب {name}",
        deleteConfirm: "حذف القالب “{name}”؟ الألعاب المُنشأة منه تبقى كما هي.",
        deletedToast: "تم حذف “{name}”",
        savedSetups: {
          label: "الإعدادات المحفوظة",
          hintBefore: "أنشئ واحدًا من",
          saveAsTemplate: "حفظ كقالب",
          hintAfter: "في لعبة جديدة؛ ابدأ من هناك أو من الأوامر",
        },
      },
    },
    chips: {
      heading: "أطقم الرقائق",
      lede: "الرقائق التي تلعب بها. القيمة هي ما هو مطبوع على الرقاقة؛ يمكن لكل لعبة تكبيرها (رقاقة مطبوع عليها 1 يمكن أن تُستخدم بقيمة 100 في بطولة). الألعاب الجديدة تبدأ بالطقم الافتراضي.",
    },
    tv: {
      heading: "التلفاز",
      levelWarning: {
        label: "تنبيه المستوى",
        hint: "يصدر التلفاز صفيرًا وتتحول الساعة إلى الأحمر قبل ارتفاع الرهانات العمياء. الدقيقة الأخيرة تومض.",
        before1: "قبل دقيقة واحدة",
        before2: "قبل دقيقتين",
        before5: "قبل 5 دقائق",
      },
      sound: { label: "الصوت", hint: "تحتاج المتصفحات إلى نقرة واحدة على التلفاز قبل أن تتمكن من تشغيل الصوت، لذا يطلب التلفاز ذلك.", checkbox: "بدء شاشات التلفاز والصوت مفعّل" },
      volume: {
        label: "مستوى صوت التلفاز",
        hint: "الصفير، ونقرات العد التنازلي، والمعلّق. أي تلفاز على جهاز آخر يتبع هذا أيضًا. حرّر شريط التمرير لسماع صوت رفع المستوى.",
      },
      keepAwake: {
        label: "إبقاء الشاشة مستيقظة",
        hint: "حتى لا تخفت الشاشة في منتصف مستوى ما. يعمل في Chrome وEdge وSafari.",
        checkbox: "إبقاء التلفاز مُشغَّلًا أثناء عمل الساعة",
      },
      announcer: {
        label: "المعلّق",
        hint: "بعد الصفير، يقرأ التلفاز بصوت عالٍ، بصوت الجهاز نفسه، الرهانات العمياء الجديدة والاستراحات والإقصاءات والفائز.",
        checkbox: "قراءة اللحظات المهمة بصوت عالٍ",
        hearIt: "استمع إليه",
        sample: "المستوى 5. الرهانات العمياء 200، 400، مع أنتي 400.",
      },
      money: {
        label: "المال على التلفاز",
        hint: "أطفئه لإبقاء مجموع الجوائز والمدفوعات وقيم الدخول بعيدًا عن الشاشة الكبيرة. شاشة الموزّع تظل تعرض كل شيء.",
        checkbox: "إظهار مبالغ المال على التلفاز",
      },
    },
    yours: { heading: "بياناتك" },
    lock: {
      heading: "قفل رمز الدخول",
      intro:
        "كل شيء هنا مشفّر بالفعل. رمز الدخول يذهب إلى ما هو أبعد: لا يمكن فتح أي شيء محفوظ بدونه، حتى من قِبل شخص يستخدم هذا المتصفح نفسه، وPitMaster يُقفل نفسه بعد فترة من عدم الاستخدام. تستمر شاشات التلفاز في عرض اللعبة أثناء القفل، ولا شيء عليها يمكنه تغييرها.",
      needsHttps: "يحتاج إلى صفحة آمنة (https)، حيث يمكن لهذا المتصفح التشفير.",
      passcode: {
        label: "رمز الدخول",
        hint: "{n} أحرف على الأقل، وكلما طال كان أصعب في الاختراق إذا نسخ أحدهم ملفات هذا المتصفح. نسيانه يعني ضياع كل شيء محفوظ هنا نهائيًا، لذا صدّر نسخة احتياطية أولًا.",
        newPlaceholder: "رمز دخول جديد",
        newAriaLabel: "رمز دخول جديد",
        againPlaceholder: "اكتبه مرة أخرى",
        againAriaLabel: "رمز الدخول الجديد، مرة أخرى",
        tooShort: "{n} أحرف على الأقل.",
        mismatch: "الرمزان غير متطابقين بعد.",
        turnOnButton: "تفعيل القفل",
        turningOn: "جارٍ القفل…",
      },
      autoLock: {
        label: "القفل التلقائي",
        hint: "بعد هذه المدة بلا نقرات أو لمسات أو ضغطات مفاتيح في أي علامة تبويب لـ PitMaster. شاشات التلفاز لا تُحتسب ولا تُقفل.",
        lockNowButton: "قفل الآن",
        options: {
          sec30: "بعد 30 ثانية",
          min1: "بعد دقيقة واحدة",
          min2: "بعد دقيقتين",
          min5: "بعد 5 دقائق",
          min10: "بعد 10 دقائق",
          min15: "بعد 15 دقيقة",
          min30: "بعد 30 دقيقة",
          hour1: "بعد ساعة واحدة",
          onClose: "فقط عند إغلاق PitMaster",
        },
        phrase: {
          sec30: "بعد 30 ثانية",
          min1: "بعد دقيقة واحدة",
          min2: "بعد دقيقتين",
          min5: "بعد 5 دقائق",
          min10: "بعد 10 دقائق",
          min15: "بعد 15 دقيقة",
          min30: "بعد 30 دقيقة",
          hour1: "بعد ساعة واحدة",
          onClose: "فقط عند الإغلاق",
          awhile: "بعد فترة",
        },
      },
      changeOrOff: {
        label: "التغيير أو الإيقاف",
        hint: "كلاهما يتطلب رمز الدخول الحالي. يبقى كل شيء مشفّرًا في الحالتين.",
        currentPlaceholder: "رمز الدخول الحالي",
        currentAriaLabel: "رمز الدخول الحالي",
        typeCurrentFirst: "اكتب رمز الدخول الحالي أولًا",
        changeButton: "تغيير رمز الدخول",
        changingBusy: "جارٍ التغيير…",
        turnOffButton: "إيقاف القفل",
      },
      error: { wrongPasscode: "هذا ليس رمز الدخول الحالي.", generic: "تعذّر التغيير. لم يتغيّر شيء؛ حاول مرة أخرى." },
      toast: { off: "القفل مُطفأ. كل شيء لا يزال مشفّرًا.", on: "تم القفل برمز دخول.", onWithAuto: "تم القفل برمز دخول. سيُقفل PitMaster {phrase} بلا استخدام." },
    },
    data: {
      heading: "التصدير والاستيراد",
      lede: "كل شيء محفوظ في هذا المتصفح، ومشفّر: {summary} ({kb} كيلوبايت). لا يوجد حساب ولا نسخة سحابية، لذا فالملف هو وسيلة نقله إلى جهاز آخر.",
      privacyLink: "كيف تُعالَج بياناتك",
      summary: { join: "{rest} و{last}" },
      count: {
        games: { zero: "بلا ألعاب", one: "لعبة واحدة", two: "لعبتان", few: "{n} ألعاب", many: "{n} لعبة", other: "{n} لعبة" },
        chipSets: { zero: "بلا أطقم رقائق", one: "طقم رقائق واحد", two: "طقما رقائق", few: "{n} أطقم رقائق", many: "{n} طقم رقائق", other: "{n} طقم رقائق" },
        templates: { zero: "بلا قوالب", one: "قالب واحد", two: "قالبان", few: "{n} قوالب", many: "{n} قالبًا", other: "{n} قالب" },
        newGames: { zero: "بلا ألعاب جديدة", one: "لعبة جديدة واحدة", two: "لعبتان جديدتان", few: "{n} ألعاب جديدة", many: "{n} لعبة جديدة", other: "{n} لعبة جديدة" },
        payLinksFor: { one: "روابط دفع لشخص واحد", two: "روابط دفع لشخصين", few: "روابط دفع لـ {n} أشخاص", many: "روابط دفع لـ {n} شخصًا", other: "روابط دفع لـ {n} شخص" },
        inProgress: "({n} جارية)",
      },
      export: {
        label: "تصدير",
        hint: "ملف واحد يحتوي كل شيء. احتفظ به كنسخة احتياطية، أو استورده على جهاز آخر وتابع من هناك. بلا كلمة مرور، يمكن لأي شخص يملك الملف قراءته.",
        button: "تصدير كل شيء",
        busy: "جارٍ القفل…",
        lastExported: "آخر تصدير {time}.",
        includeSettings: "تضمين هذه الإعدادات",
        lockWithPassword: "قفله بكلمة مرور",
        passwordPlaceholder: "كلمة المرور",
        passwordAriaLabel: "كلمة مرور الملف",
        passwordNote: "{n} أحرف على الأقل، وكلما طالت كانت أقوى. مشفّرة بـ AES-256. استيرادها يتطلب كلمة المرور هذه، ولا يمكن استرجاع كلمة مرور مفقودة، لا من قِبلك ولا من قِبلنا.",
        passwordTitle: "اكتب كلمة مرور من {n} أحرف على الأقل، أو أوقف القفل",
        toast: {
          locked: "تم التصدير والقفل. استيراده يتطلب كلمة المرور.",
          plain: "تم التصدير. على الجهاز الآخر، افتحه باستخدام الاستيراد.",
          lockFailed: "تعذّر قفل الملف. حاول مرة أخرى، أو صدّره بلا كلمة مرور.",
        },
      },
      import: {
        label: "استيراد",
        hint: "اللعبة الجارية تستأنف من حيث توقفت تمامًا، مع الساعة واللاعبين ورمز التلفاز.",
        kindGame: "لعبة واحدة",
        kindEverything: "كل شيء",
        exportedAt: "صُدِّر في {day} الساعة {time}",
        plusSettings: "، بالإضافة إلى الإعدادات",
        modeAriaLabel: "طريقة الاستيراد",
        modeMerge: "الإضافة إلى هذا المتصفح",
        modeReplace: "استبدال كل شيء",
        replaceCount: {
          zero: "لا ألعاب هنا لتُستبدل بألعاب الملف، الذي يحتوي",
          one: "اللعبة الواحدة هنا تُستبدل بألعاب الملف، الذي يحتوي",
          two: "اللعبتان هنا تُستبدلان بألعاب الملف، الذي يحتوي",
          few: "الألعاب الـ{n} هنا تُستبدل بألعاب الملف، الذي يحتوي",
          many: "اللعبة الـ{n} هنا تُستبدل بألعاب الملف، الذي يحتوي",
          other: "الألعاب الـ{n} هنا تُستبدل بألعاب الملف، الذي يحتوي",
        },
        replaceOthers: "أطقم الرقائق والقوالب وروابط الدفع أيضًا.",
        newerCount: "{n} أحدث من النسخة هنا",
        keptCount: "{n} محدّثة بالفعل",
        noGames: "لا توجد ألعاب فيه",
        nothingDeleted: "لا شيء هنا يُحذف.",
        useSettingsToo: {
          label: "استخدام إعداداته أيضًا",
          hint: "قواعد المكان، والمال، وإعدادات الألعاب الافتراضية، والتلفاز. سمة هذه الشاشة وأصواتها تبقى كما هي.",
        },
        importButton: "استيراد",
        importedToast: { zero: "لم تُستورد ألعاب", one: "تم استيراد لعبة واحدة", two: "تم استيراد لعبتين", few: "تم استيراد {n} ألعاب", many: "تم استيراد {n} لعبة", other: "تم استيراد {n} لعبة" },
        undoneToast: "تم التراجع عن الاستيراد. كل شيء كما كان.",
        lockedWithPassword: "إنه مقفل بكلمة مرور.",
        filePasswordAriaLabel: "كلمة مرور الملف",
        typePasswordFirst: "اكتب كلمة مرور الملف أولًا",
        unlockingBusy: "جارٍ فك القفل…",
        unlockButton: "فك القفل",
        dropAriaLabel: "استيراد ملف",
        chooseFile: "اختيار ملف",
        orDropHere: "أو أفلته هنا",
        importedLabel: "تم الاستيراد.",
        readyToRun: "جاهزة للتشغيل:",
        inProgress: "قيد التقدم:",
        undoButton: "التراجع عن الاستيراد",
        error: { tooBig: "هذا الملف كبير جدًا ليكون تصدير PitMaster.", failed: "لم يعمل هذا الملف. {message}" },
      },
      startOver: {
        label: "البدء من جديد",
        hint: "يحذف كل لعبة وطقم رقائق مخصص في هذا المتصفح. لا يمكن التراجع عنه.",
        button: "حذف كل شيء",
        confirm: "حذف كل لعبة وطقم رقائق مخصص؟ هذا لا يمكن التراجع عنه. صدّر نسخة احتياطية أولًا إذا كنت قد تحتاجها.",
        doneToast: "تم مسح كل شيء. بداية جديدة.",
      },
    },
  },
  bn: {
    page: {
      title: "সেটিংস",
      heading: "সেটিংস",
      savedHint: "এই ব্রাউজারে এনক্রিপ্ট করে সংরক্ষিত। অন্য ডিভাইসে নিতে,",
      exportLink: "এক্সপোর্ট করুন",
      savedHintEnd: "আপনার গেমগুলোসহ।",
    },
    nav: {
      groups: { games: "গেম", you: "আপনি" },
      tabs: { game: "আপনার গেম", defaults: "নতুন গেম", chips: "চিপ সেট", tv: "টিভি", general: "সাধারণ", yours: "আপনার তথ্য" },
    },
    language: {
      title: "ভাষা",
      hint: "PitMaster নিজেই যে ভাষায় লেখা থাকে। প্রথমে আপনার ব্রাউজার থেকে অনুমান করা হয়, আর এখানে সবসময় বদলানো যায়। গেম আর বাই-ইনে নিচের কারেন্সি ব্যবহৃত হয়, এটি নয়।",
    },
    region: {
      heading: "ভাষা ও অঞ্চল",
      currency: {
        label: "কারেন্সি",
        hint: "বাই-ইন, পট আর ক্যাশ চিপস কীভাবে লেখা হয়:",
        hintEnd: "লাইভ টিভিও এটিই অনুসরণ করে।",
        names: { USD: "US ডলার ($)", EUR: "ইউরো (€)", JPY: "জাপানি ইয়েন (¥)", GBP: "ব্রিটিশ পাউন্ড (£)", CNY: "চীনা ইউয়ান (¥)", AUD: "অস্ট্রেলীয় ডলার ($)" },
      },
      time: { label: "সময়", hint: "শুরুর সময়, বিদায় নেওয়ার সময় আর টিভির ঘড়ি। এখন {time}।", h12: "১২ ঘণ্টা", h24: "২৪ ঘণ্টা" },
    },
    appearance: {
      heading: "চেহারা",
      theme: { label: "থিম", hint: "সিস্টেম আপনার ডিভাইস অনুসরণ করে, টিভিও এটিই অনুসরণ করে।", system: "সিস্টেম", light: "লাইট", dark: "ডার্ক" },
      sounds: {
        label: "ইন্টারফেস শব্দ",
        hint: "বোতাম আর সুইচের নিচে হালকা ক্লিক, টাকা সরলে চিপসের ঠোকাঠুকির শব্দ, আর প্রতিটি চিপে ট্যাপ করলে তার নিজস্ব সুর। টিভির অ্যালার্ম আলাদা।",
      },
      volume: {
        label: "ইন্টারফেস ভলিউম",
        hint: "এই ক্লিক আর ঠোকাঠুকির শব্দ কতটা জোরে।",
        hintOn: "শোনার জন্য স্লাইডার ছেড়ে দিন।",
        hintOff: "এটি সেট করতে ইন্টারফেস শব্দ চালু করুন।",
        disabledTitle: "ইন্টারফেস শব্দ বন্ধ আছে",
      },
      motion: {
        label: "মোশন",
        hint: "সিস্টেম আপনার ডিভাইসের রিডিউস-মোশন সেটিং অনুসরণ করে। রিডিউসড এখানে আর টিভিতে স্লাইড, ফ্লিপ আর পেজ পরিবর্তনের অ্যানিমেশন বন্ধ করে দেয়।",
        system: "সিস্টেম",
        reduced: "রিডিউসড",
      },
      toys: {
        label: "হোম পেজের খেলনা",
        hint: "শিরোনামের পাশে সময় কাটানোর জন্য ছড়িয়ে রাখা তাস, সাজানোর জন্য চিপস, পাশা, একটি নোট গোনার মেশিন আর একটি রুলেট চাকা। বন্ধ থাকলে হোম পেজে শুধু আপনার গেমগুলোই দেখা যায়।",
      },
    },
    keyboard: {
      heading: "কীবোর্ড",
      openCommands: {
        label: "কমান্ড খুলুন",
        hint: "কমান্ড বক্স নাম দিয়ে যেকোনো কিছু করতে পারে: কোনো পেজে যাওয়া, একটি টেমপ্লেট শুরু করা, বা ডিলার স্ক্রিনে “মাইককে আউট করা”। শর্টকাটে ক্লিক করুন, তারপর আপনার পছন্দের কি চাপুন।",
        pressNewKeys: "নতুন কি চাপুন",
        andAKey: "আর একটি কি",
        escToKeep: "{key} রাখতে Esc চাপুন",
        resetButton: "{key} তে রিসেট করুন",
        saved: "সংরক্ষিত হয়েছে। এখন {key} দিয়ে কমান্ড খুলবে।",
        resetTo: "{key} তে ফিরে এসেছে।",
      },
      otherShortcuts: { label: "অন্যান্য শর্টকাট", hint: "এগুলো নির্দিষ্ট। কোনো বক্সে টাইপ করার সময় এগুলোর কোনোটিই কাজ করে না।" },
    },
    general: { heading: "সাধারণ" },
    game: {
      heading: "আপনার গেম",
      lede: "আপনার গেম যা ব্যবহার করে তা চালু করুন, আকার যাই হোক না কেন। বন্ধ থাকা যেকোনো কিছু নতুন গেম আর ডিলার স্ক্রিনে বন্ধই থাকে, আর কোনো একটি গেম চাইলে শুধু নিজের জন্য সেটি চালু করতে পারে।",
      rake: {
        label: "ক্যাশ গেম রেক",
        hint: "প্রতিটি পটের একটি অংশ রেক বাক্সে যায়, অথবা বসার জন্য একটি নির্দিষ্ট ফি। নতুন গেমগুলো এখানে সেট করা মান দিয়ে শুরু হয়।",
        checkbox: "রেক বা সিট ফি নিন",
      },
      houseCut: { label: "টুর্নামেন্টে আয়োজকের কমিশন", hint: "প্রতিটি এন্ট্রিতে নির্দিষ্ট ফি, বাকিটার একটি শতাংশ, বা দুটোই।", checkbox: "প্রতিটি বাই-ইন থেকে একটি অংশ নিন" },
      extras: {
        heading: "অতিরিক্ত সুবিধা",
        hint: "যে গেম ইতিমধ্যে কোনো একটি ব্যবহার করছে তা সেটি রেখে দেয়।",
        bounties: { label: "বাউন্টি ও নকআউট", hint: "প্রতিটি মাথায় একটি বাউন্টি, আর কে কাকে নকআউট করল তার হিসাব।" },
        rebuys: { label: "রিবাই ও অ্যাড-অন", hint: "আবার চিপ কেনা, আর প্রথম বিরতিতে টপ-আপ করা।" },
        seats: { label: "সিট ড্র ও টেবিল", hint: "সিট বণ্টন করা, আর খেলোয়াড় আউট হলে টেবিল সমান করা।" },
        deals: { label: "ফাইনাল টেবিল চুক্তি", hint: "ICM ও চিপ-চপ ক্যালকুলেটর।" },
        payLinks: { label: "পে লিংক", hint: "সেটল-আপ আর পেআউটে Venmo, Cash App আর PayPal লিংক।" },
        costs: { label: "ভাগের খরচ", hint: "গেমের জন্য কেনা জিনিস ভাগ করুন, যেমন খাবার বা নতুন তাস। এটা হিসাবে যায়, কারও ফলাফলে নয়।" },
        ledger: { label: "কে কার কাছে পাবে", hint: "পেমেন্ট হলে হিসাবে টিক দিন। খেলোয়াড় পেজে সব গেমের বাকি টাকা দেখায়।" },
        bombPots: { label: "বম্ব পট", hint: "ক্যাশ গেম: সবাই অ্যান্টি দেন আর আগে বেটিং ছাড়াই ফ্লপ আসে। হাতে ডাকুন বা টাইমারে।" },
        sevenTwo: { label: "7-2 গেম", hint: "ক্যাশ গেম: 7-2 দিয়ে হাত জিতলে কার্ড পাওয়া প্রত্যেকের কাছ থেকে নির্দিষ্ট অঙ্ক মেলে।" },
        highHand: { label: "হাই হ্যান্ড", hint: "ক্যাশ গেম: প্রতি পর্বের সেরা হাত হাউসের দেওয়া পুরস্কার জেতে।" },
      },
    },
    house: {
      heading: "আয়োজকের নিয়ম",
      hint: "প্রতি লাইনে একটি করে। এগুলো টিভিতে ঘড়ির নিচে দেখানো হয়, দুইয়ের বেশি হলে পালা করে।",
      placeholder: "স্ট্রিং বেট নিষিদ্ধ।\nপ্রথম বিরতির পর রিবাই বন্ধ।",
      commonOnes: "প্রচলিত নিয়ম:",
      onNewGame: "প্রতিটি নতুন গেমে যোগ করুন",
      commonRules: {
        cardsSpeak: "তাসই শেষ কথা।",
        showOneShowAll: "একটি দেখালে সবগুলো দেখাতে হবে।",
        verbalBinding: "মুখে বলা সিদ্ধান্তই চূড়ান্ত।",
        noStringBets: "স্ট্রিং বেট নিষিদ্ধ।",
        onePlayerToAHand: "প্রতি হাতে একজন খেলোয়াড়।",
        protectYourHand: "নিজের তাস নিজে সামলান।",
        chipsStayOnTable: "চিপ টেবিলেই থাকবে।",
        straddlesWelcome: "স্ট্র্যাডল স্বাগত।",
        runItTwice: "দুই খেলোয়াড় রাজি থাকলে দুইবার চালানো যাবে।",
        chopBlinds: "সবাই ব্লাইন্ড পর্যন্ত ফোল্ড করলে ব্লাইন্ড ভাগ করে নেওয়া হবে।",
        phonesDown: "হাত চলাকালীন ফোন নামিয়ে রাখুন।",
        rebuysBetweenHands: "শুধু দুই হাতের মাঝে রিবাই করা যাবে।",
        newDeckOnRequest: "চাইলে নতুন তাসের প্যাক দেওয়া হবে।",
        lastHandAnnounced: "শেষ হাত আগে থেকে ঘোষণা করা হয়।",
        settleUp: "চলে যাওয়ার আগে হিসাব মিটিয়ে নিন।",
        finalSay: "যে গেম চালায় তার সিদ্ধান্তই চূড়ান্ত।",
      },
    },
    defaults: {
      heading: "নতুন গেম",
      lede: "একটি নতুন গেম যেখান থেকে শুরু হয়। এর প্রতিটি সেটিং গেমেই বদলানো যায়, আর একটি টেমপ্লেট নিজের সেটিং ঠিক করে নেয়।",
      auto: "স্বয়ংক্রিয়",
      length: { label: "সময়কাল", about: "প্রায় {time}" },
      tournaments: {
        heading: "টুর্নামেন্ট",
        buyIn: { label: "বাই-ইন {sym}", hint: "রিবাইও একই দামে শুরু হয়।" },
        players: { label: "খেলোয়াড়", hint: "সাধারণত কতজন খেলে। স্ট্যাক, চিপের হিসাব আর পেআউট এখান থেকেই শুরু হয়।" },
        startingStack: { label: "শুরুর স্ট্যাক", hint: "খালি রাখলে প্রতিটি গেম তার চিপ সেট আর খেলোয়াড় অনুযায়ী একটি বেছে নেবে।" },
        startingDepth: { label: "শুরুর গভীরতা", hint: "লেভেল ১-এ বিগ ব্লাইন্ডে স্ট্যাক।" },
        length: { hint: "ব্লাইন্ড কাঠামো এই সময়ের কাছাকাছি শেষ হওয়ার জন্য তৈরি করা হয়।" },
        levelLength: { label: "লেভেলের দৈর্ঘ্য" },
        breaks: { label: "বিরতি", hint: "০ লেভেল মানে কোনো বিরতি নেই।", levelsBetween: "কত লেভেল পরপর বিরতি", minutes: "বিরতির মিনিট" },
        antes: {
          label: "অ্যান্টি ও দেরিতে নিবন্ধন",
          hint: "০ মানে কোনো অ্যান্টি নেই। আপনার বেছে নেওয়া লেভেলের পর দেরিতে নিবন্ধন বন্ধ হয়ে যায়।",
          antesFrom: "কোন লেভেল থেকে অ্যান্টি শুরু",
          lateRegThrough: "কোন লেভেল পর্যন্ত দেরিতে নিবন্ধন",
        },
        rebuys: {
          label: "রিবাই ও অ্যাড-অন",
          hint: "রিবাইয়ের দাম বাই-ইনের সমান আর শুরুর স্ট্যাক দেয়। অ্যাড-অন আসে প্রথম বিরতিতে।",
          checkbox: "রিবাই",
          throughLevel: "কোন লেভেল পর্যন্ত",
          addOnCheckbox: "অ্যাড-অন",
          cost: "খরচ {sym}",
        },
        bounty: { label: "বাউন্টি {sym}", hint: "প্রতিটি বাই-ইনের যে অংশ খেলোয়াড়ের মাথায় থাকে। ০ মানে কোনো বাউন্টি নেই।" },
        bountyKind: { label: "বাউন্টির ধরন", hint: "ফ্ল্যাটে নকআউটে পুরো বাউন্টি পাওয়া যায়। প্রগ্রেসিভে (PKO) অর্ধেক পাওয়া যায়, বাকি অর্ধেক নকআউটকারীর নিজের বাউন্টিতে যোগ হয়। মিস্ট্রিতে খাম বেরোনোর পর প্রতিটি নকআউট একটি এলোমেলো খাম খোলে।" },
        payouts: { label: "পেআউট", hint: "শতাংশে, প্রথম স্থান আগে, যেমন ৫০, ৩০, ২০। খালি রাখলে খেলোয়াড় সংখ্যা অনুযায়ী বেছে নেওয়া হয়।" },
        roundTo: { label: "পেআউট রাউন্ড করুন এই পর্যন্ত", hint: "যাতে কাউকে {amount} মতো অঙ্ক দিতে না হয়। বাকি থাকা অংশ প্রথম স্থানে যাবে।" },
      },
      cash: {
        heading: "ক্যাশ গেম",
        buyIn: {
          label: "বাই-ইন",
          hint: "বিগ ব্লাইন্ডে, যাতে যেকোনো স্টেকে কাজ করে। প্রকৃত অঙ্ক প্রতিটি গেমের ব্লাইন্ড থেকে আসে।",
          min: "সর্বনিম্ন",
          standard: "স্বাভাবিক",
          max: "সর্বোচ্চ",
        },
        length: { hint: "শেষ হওয়ার সময় আর চিপের হিসাবের জন্য। ক্যাশ গেম সবসময় বেশি সময় ধরে চলতে পারে।" },
        straddles: { label: "স্ট্র্যাডল", checkbox: "স্ট্র্যাডল অনুমোদিত" },
        bomb: { label: "বম্ব পট", hint: "বিগ ব্লাইন্ডে অ্যান্টি, আর কত ঘন ঘন আসে।", anteBB: "অ্যান্টি (বিগ ব্লাইন্ড)", every: "কত মিনিট পরপর (0 = ডাকলে)" },
        sevenTwo: { label: "7-2 গেম (বিগ ব্লাইন্ড)", hint: "7-2 জিতলে প্রত্যেকের কাছ থেকে কত মেলে।" },
        highHand: { label: "হাই হ্যান্ড", hint: "পুরস্কার, আর প্রতি পর্ব কতক্ষণ।" },
      },
      both: {
        heading: "উভয়",
        seatsPerTable: { label: "প্রতি টেবিলে সিট", hint: "সিট বণ্টন আর টেবিল সমান করার জন্য।", option: "{n} সিট" },
      },
      templates: {
        heading: "টেমপ্লেট",
        empty: "এখনো কোনো টেমপ্লেট নেই।",
        typeCash: "ক্যাশ",
        typeTournament: "টুর্নামেন্ট",
        playersCount: { one: "{n} জন খেলোয়াড়", other: "{n} জন খেলোয়াড়" },
        deleteAriaLabel: "{name} টেমপ্লেট মুছুন",
        deleteConfirm: "“{name}” টেমপ্লেটটি মুছবেন? এটি দিয়ে তৈরি গেমগুলো থেকে যাবে।",
        deletedToast: "“{name}” মুছে ফেলা হয়েছে",
        savedSetups: {
          label: "সংরক্ষিত সেটআপ",
          hintBefore: "নতুন গেমে",
          saveAsTemplate: "টেমপ্লেট হিসেবে সংরক্ষণ করুন",
          hintAfter: "থেকে একটি তৈরি করুন; সেখান থেকে বা কমান্ড থেকে একটি শুরু করুন",
        },
      },
    },
    chips: {
      heading: "চিপ সেট",
      lede: "যে চিপ দিয়ে আপনি খেলেন। মান হলো চিপের গায়ে যা ছাপা আছে; প্রতিটি গেম সেটি স্কেল করতে পারে (১ ছাপানো চিপ টুর্নামেন্টে ১০০ হিসেবে খেলতে পারে)। নতুন গেম ডিফল্ট সেট দিয়ে শুরু হয়।",
    },
    tv: {
      heading: "টিভি",
      levelWarning: {
        label: "লেভেল সতর্কতা",
        hint: "ব্লাইন্ড বাড়ার আগে টিভি বিপ করে আর ঘড়ি লাল হয়ে যায়। শেষ মিনিটে জ্বলে-নেভে।",
        before1: "১ মিনিট আগে",
        before2: "২ মিনিট আগে",
        before5: "৫ মিনিট আগে",
      },
      sound: { label: "শব্দ", hint: "শব্দ চালাতে ব্রাউজারের টিভিতে একটি ক্লিক দরকার হয়, তাই টিভি এটি চায়।", checkbox: "শব্দ চালু রেখে টিভি স্ক্রিন শুরু করুন" },
      volume: {
        label: "টিভির ভলিউম",
        hint: "বিপ শব্দ, কাউন্টডাউনের টিকটিক আর ঘোষক। অন্য ডিভাইসের টিভিও এটি অনুসরণ করে। লেভেল-আপের শব্দ শুনতে স্লাইডার ছেড়ে দিন।",
      },
      keepAwake: {
        label: "জেগে রাখুন",
        hint: "যাতে লেভেল চলাকালীন স্ক্রিন ম্লান না হয়। Chrome, Edge আর Safari-তে কাজ করে।",
        checkbox: "ঘড়ি চলাকালীন টিভি চালু রাখুন",
      },
      announcer: {
        label: "ঘোষক",
        hint: "বিপ শব্দের পর, টিভি ডিভাইসের নিজস্ব কণ্ঠে নতুন ব্লাইন্ড, বিরতি, আউট আর বিজয়ী উচ্চস্বরে ঘোষণা করে।",
        checkbox: "বড় মুহূর্তগুলো জোরে পড়ে শোনান",
        hearIt: "শুনুন",
        sample: "লেভেল ৫। ব্লাইন্ড ২০০, ৪০০, সাথে ৪০০ অ্যান্টি।",
      },
      money: {
        label: "টিভিতে টাকা",
        hint: "বড় স্ক্রিনে প্রাইজ পুল, পেআউট আর বাই-ইন না দেখাতে বন্ধ করুন। ডিলার স্ক্রিনে সবকিছু দেখা যাবে।",
        checkbox: "টিভিতে টাকার অঙ্ক দেখান",
      },
    },
    yours: { heading: "আপনার তথ্য" },
    lock: {
      heading: "পাসকোড লক",
      intro:
        "এখানে সবকিছু ইতিমধ্যেই এনক্রিপ্ট করা। একটি পাসকোড আরও এগিয়ে নেয়: এটি ছাড়া সংরক্ষিত কিছুই খোলা যায় না, এমনকি একই ব্রাউজার ব্যবহার করা কেউও নয়, আর কোনো ইনপুট ছাড়া কিছুক্ষণ পর PitMaster নিজে থেকে লক হয়ে যায়। লক থাকা অবস্থায়ও টিভি স্ক্রিন গেম দেখাতে থাকে, আর সেখান থেকে কিছুই বদলানো যায় না।",
      needsHttps: "এর জন্য একটি নিরাপদ (https) পেজ দরকার, যেখানে এই ব্রাউজার এনক্রিপ্ট করতে পারে।",
      passcode: {
        label: "পাসকোড",
        hint: "কমপক্ষে {n} অক্ষর, আর যত লম্বা তত ভাঙা কঠিন, কেউ এই ব্রাউজারের ফাইল কপি করলেও। ভুলে গেলে এখানে সংরক্ষিত সবকিছু চিরতরে হারিয়ে যায়, তাই আগে এক্সপোর্ট করে নিন।",
        newPlaceholder: "নতুন পাসকোড",
        newAriaLabel: "নতুন পাসকোড",
        againPlaceholder: "আবার টাইপ করুন",
        againAriaLabel: "নতুন পাসকোড, আবার",
        tooShort: "কমপক্ষে {n} অক্ষর।",
        mismatch: "দুটি এখনো মিলছে না।",
        turnOnButton: "লক চালু করুন",
        turningOn: "লক করা হচ্ছে…",
      },
      autoLock: {
        label: "অটো-লক",
        hint: "কোনো PitMaster ট্যাবে এতক্ষণ ক্লিক, ট্যাপ বা কি প্রেস না হলে। টিভি স্ক্রিন এর মধ্যে গণ্য হয় না, লকও হয় না।",
        lockNowButton: "এখনই লক করুন",
        options: {
          sec30: "৩০ সেকেন্ড পর",
          min1: "১ মিনিট পর",
          min2: "২ মিনিট পর",
          min5: "৫ মিনিট পর",
          min10: "১০ মিনিট পর",
          min15: "১৫ মিনিট পর",
          min30: "৩০ মিনিট পর",
          hour1: "১ ঘণ্টা পর",
          onClose: "শুধু PitMaster বন্ধ হলে",
        },
        phrase: {
          sec30: "৩০ সেকেন্ড পর",
          min1: "১ মিনিট পর",
          min2: "২ মিনিট পর",
          min5: "৫ মিনিট পর",
          min10: "১০ মিনিট পর",
          min15: "১৫ মিনিট পর",
          min30: "৩০ মিনিট পর",
          hour1: "১ ঘণ্টা পর",
          onClose: "শুধু বন্ধ হলে",
          awhile: "কিছুক্ষণ পর",
        },
      },
      changeOrOff: {
        label: "বদলান বা বন্ধ করুন",
        hint: "দুটোতেই বর্তমান পাসকোড লাগে। যেভাবেই হোক, সবকিছু এনক্রিপ্ট করা থাকে।",
        currentPlaceholder: "বর্তমান পাসকোড",
        currentAriaLabel: "বর্তমান পাসকোড",
        typeCurrentFirst: "আগে বর্তমান পাসকোড টাইপ করুন",
        changeButton: "পাসকোড বদলান",
        changingBusy: "বদলানো হচ্ছে…",
        turnOffButton: "লক বন্ধ করুন",
      },
      error: { wrongPasscode: "এটি বর্তমান পাসকোড নয়।", generic: "বদলানো যায়নি। কিছুই বদলায়নি; আবার চেষ্টা করুন।" },
      toast: { off: "লক বন্ধ। সবকিছু এখনো এনক্রিপ্ট করা আছে।", on: "পাসকোড দিয়ে লক করা হয়েছে।", onWithAuto: "পাসকোড দিয়ে লক করা হয়েছে। কোনো ইনপুট ছাড়া PitMaster {phrase} লক হয়ে যাবে।" },
    },
    data: {
      heading: "এক্সপোর্ট ও ইমপোর্ট",
      lede: "সবকিছু এই ব্রাউজারে এনক্রিপ্ট করে সংরক্ষিত: {summary} ({kb} KB)। কোনো অ্যাকাউন্ট নেই, কোনো ক্লাউড কপিও নেই, তাই একটি ফাইলই অন্য ডিভাইসে নেওয়ার উপায়।",
      privacyLink: "আপনার তথ্য কীভাবে ব্যবহার করা হয়",
      summary: { join: "{rest} আর {last}" },
      count: {
        games: { one: "{n}টি গেম", other: "{n}টি গেম" },
        chipSets: { one: "{n}টি চিপ সেট", other: "{n}টি চিপ সেট" },
        templates: { one: "{n}টি টেমপ্লেট", other: "{n}টি টেমপ্লেট" },
        newGames: { one: "{n}টি নতুন গেম", other: "{n}টি নতুন গেম" },
        payLinksFor: { one: "{n} জনের জন্য পে লিংক", other: "{n} জনের জন্য পে লিংক" },
        inProgress: "({n}টি চলমান)",
      },
      export: {
        label: "এক্সপোর্ট",
        hint: "সবকিছু নিয়ে একটি ফাইল। এটি ব্যাকআপ হিসেবে রাখুন, বা অন্য ডিভাইসে ইমপোর্ট করে সেখান থেকে চালিয়ে যান। পাসওয়ার্ড ছাড়া, ফাইলটি যার কাছে আছে সে-ই এটি পড়তে পারবে।",
        button: "সব এক্সপোর্ট করুন",
        busy: "লক করা হচ্ছে…",
        lastExported: "সর্বশেষ এক্সপোর্ট {time}।",
        includeSettings: "এই সেটিংসগুলোও অন্তর্ভুক্ত করুন",
        lockWithPassword: "পাসওয়ার্ড দিয়ে লক করুন",
        passwordPlaceholder: "পাসওয়ার্ড",
        passwordAriaLabel: "ফাইলের পাসওয়ার্ড",
        passwordNote: "কমপক্ষে {n} অক্ষর, যত লম্বা তত শক্তিশালী। AES-256 দিয়ে এনক্রিপ্ট করা। ইমপোর্ট করতে এই পাসওয়ার্ড লাগবে, আর হারিয়ে গেলে তা আপনি বা আমরা কেউই ফিরে পাব না।",
        passwordTitle: "কমপক্ষে {n} অক্ষরের একটি পাসওয়ার্ড টাইপ করুন, বা লক বন্ধ করে দিন",
        toast: {
          locked: "এক্সপোর্ট করে লক করা হয়েছে। ইমপোর্ট করতে পাসওয়ার্ড লাগবে।",
          plain: "এক্সপোর্ট হয়েছে। অন্য ডিভাইসে এটি ইমপোর্ট দিয়ে খুলুন।",
          lockFailed: "ফাইল লক করা যায়নি। আবার চেষ্টা করুন, বা পাসওয়ার্ড ছাড়াই এক্সপোর্ট করুন।",
        },
      },
      import: {
        label: "ইমপোর্ট",
        hint: "চলমান গেম ঠিক যেখানে ছিল সেখান থেকেই শুরু হয়, ঘড়ি, খেলোয়াড় আর টিভি কোডসহ।",
        kindGame: "একটি গেম",
        kindEverything: "সবকিছু",
        exportedAt: "{day} তারিখে {time} এ এক্সপোর্ট করা হয়েছে",
        plusSettings: ", সাথে সেটিংসও",
        modeAriaLabel: "কীভাবে ইমপোর্ট করবেন",
        modeMerge: "এই ব্রাউজারে যোগ করুন",
        modeReplace: "সবকিছু প্রতিস্থাপন করুন",
        replaceCount: { one: "এখানকার {n}টি গেম ফাইলের গেম দিয়ে প্রতিস্থাপিত হবে, যাতে আছে", other: "এখানকার {n}টি গেম ফাইলের গেমগুলো দিয়ে প্রতিস্থাপিত হবে, যাতে আছে" },
        replaceOthers: "চিপ সেট, টেমপ্লেট আর পে লিংকও।",
        newerCount: "{n}টি এখানকার কপির চেয়ে নতুন",
        keptCount: "{n}টি ইতিমধ্যে হালনাগাদ",
        noGames: "এতে কোনো গেম নেই",
        nothingDeleted: "এখানে কিছুই মুছে ফেলা হয় না।",
        useSettingsToo: {
          label: "এটির সেটিংসও ব্যবহার করুন",
          hint: "আয়োজকের নিয়ম, টাকা, গেমের ডিফল্ট আর টিভি। এই স্ক্রিনের থিম আর শব্দ যেমন আছে তেমনই থাকবে।",
        },
        importButton: "ইমপোর্ট",
        importedToast: { one: "{n}টি গেম ইমপোর্ট করা হয়েছে", other: "{n}টি গেম ইমপোর্ট করা হয়েছে" },
        undoneToast: "ইমপোর্ট বাতিল করা হয়েছে। সবকিছু আগের মতো।",
        lockedWithPassword: "এটি পাসওয়ার্ড দিয়ে লক করা।",
        filePasswordAriaLabel: "ফাইলের পাসওয়ার্ড",
        typePasswordFirst: "আগে ফাইলের পাসওয়ার্ড টাইপ করুন",
        unlockingBusy: "আনলক করা হচ্ছে…",
        unlockButton: "আনলক করুন",
        dropAriaLabel: "একটি ফাইল ইমপোর্ট করুন",
        chooseFile: "একটি ফাইল বেছে নিন",
        orDropHere: "বা এখানে ড্রপ করুন",
        importedLabel: "ইমপোর্ট হয়েছে।",
        readyToRun: "চালানোর জন্য প্রস্তুত:",
        inProgress: "চলমান:",
        undoButton: "ইমপোর্ট বাতিল করুন",
        error: { tooBig: "এই ফাইলটি PitMaster এক্সপোর্ট হওয়ার জন্য অনেক বড়।", failed: "এই ফাইলটি কাজ করেনি। {message}" },
      },
      startOver: {
        label: "নতুন করে শুরু করুন",
        hint: "এই ব্রাউজারের প্রতিটি গেম আর কাস্টম চিপ সেট মুছে দেয়। এটি ফেরানো যায় না।",
        button: "সবকিছু মুছে ফেলুন",
        confirm: "প্রতিটি গেম আর কাস্টম চিপ সেট মুছবেন? এটি ফেরানো যাবে না। প্রয়োজন হতে পারলে আগে এক্সপোর্ট করে নিন।",
        doneToast: "সবকিছু মুছে ফেলা হয়েছে। নতুন শুরু।",
      },
    },
  },
  pt: {
    page: {
      title: "Configurações",
      heading: "Configurações",
      savedHint: "Salvas neste navegador, criptografadas. Para levá-las a outro dispositivo,",
      exportLink: "exporte-as",
      savedHintEnd: "junto com suas partidas.",
    },
    nav: {
      groups: { games: "Partidas", you: "Você" },
      tabs: { game: "Sua Partida", defaults: "Novas Partidas", chips: "Conjuntos de Fichas", tv: "TV", general: "Geral", yours: "Seus Dados" },
    },
    language: {
      title: "Idioma",
      hint: "O idioma em que o próprio texto do PitMaster é escrito. Detectado do seu navegador no início, e sempre pode ser trocado aqui. As partidas e os buy-ins usam a moeda abaixo, não esta.",
    },
    region: {
      heading: "Idioma e Região",
      currency: {
        label: "Moeda",
        hint: "Como buy-ins, potes e fichas de dinheiro são escritos:",
        hintEnd: "As TVs ao vivo também seguem esta.",
        names: { USD: "Dólar americano ($)", EUR: "Euro (€)", JPY: "Iene japonês (¥)", GBP: "Libra esterlina (£)", CNY: "Yuan chinês (¥)", AUD: "Dólar australiano ($)" },
      },
      time: { label: "Hora", hint: "Horários de início, de eliminação e o relógio da TV. Agora são {time}.", h12: "12 Horas", h24: "24 Horas" },
    },
    appearance: {
      heading: "Aparência",
      theme: { label: "Tema", hint: "Sistema segue o seu dispositivo, e a tela da TV também.", system: "Sistema", light: "Claro", dark: "Escuro" },
      sounds: {
        label: "Sons da Interface",
        hint: "Cliques discretos sob botões e interruptores, fichas batendo quando o dinheiro se move, e cada ficha com sua própria nota ao tocá-la. Os alarmes da TV são separados.",
      },
      volume: {
        label: "Volume da Interface",
        hint: "Quão altos são esses cliques e batidas.",
        hintOn: "Solte o controle deslizante para ouvir.",
        hintOff: "Ative os Sons da Interface para ajustar.",
        disabledTitle: "Os Sons da Interface estão desligados",
      },
      motion: {
        label: "Movimento",
        hint: "Sistema segue a configuração de movimento reduzido do seu dispositivo. Reduzido desliga os deslizes, giros e trocas de página aqui e na TV.",
        system: "Sistema",
        reduced: "Reduzido",
      },
      toys: {
        label: "Distrações da Página Inicial",
        hint: "Cartas para abrir em leque, fichas para organizar, dados, uma contadora de notas e uma roleta para mexer ao lado do título. Desligado mantém a página inicial só com suas partidas.",
      },
    },
    keyboard: {
      heading: "Teclado",
      openCommands: {
        label: "Abrir Comandos",
        hint: "A caixa de comandos faz qualquer coisa pelo nome: ir para uma página, iniciar um modelo, ou “eliminar o mike” na tela do dealer. Clique no atalho e depois pressione as teclas que quiser.",
        pressNewKeys: "Pressione as Novas Teclas",
        andAKey: "e uma Tecla",
        escToKeep: "Esc para manter {key}",
        resetButton: "Redefinir para {key}",
        saved: "Salvo. {key} abre Comandos agora.",
        resetTo: "Voltou para {key}.",
      },
      otherShortcuts: { label: "Outros Atalhos", hint: "Estes são fixos. Nenhum deles funciona enquanto você digita em um campo." },
    },
    general: { heading: "Geral" },
    game: {
      heading: "Sua Partida",
      lede: "Ative o que suas partidas usam, seja qual for o tamanho. O que está desligado continua desligado nas partidas novas e na tela do dealer, e uma partida ainda pode ativá-lo só para ela.",
      rake: {
        label: "Rake do Jogo em Dinheiro",
        hint: "Uma parte de cada pote vai para uma caixa de rake, ou uma taxa fixa para se sentar. As partidas novas começam com o que você define aqui.",
        checkbox: "Cobrar Rake ou Taxa de Assento",
      },
      houseCut: { label: "Comissão da Casa no Torneio", hint: "Uma taxa fixa por entrada, uma porcentagem do resto, ou ambos.", checkbox: "Cobrar uma Parte de Cada Buy-In" },
      extras: {
        heading: "Extras",
        hint: "Uma partida que já usa algum deles continua usando.",
        bounties: { label: "Recompensas e Eliminações", hint: "Uma recompensa sobre cada jogador, e quem eliminou quem." },
        rebuys: { label: "Recompras e Add-Ons", hint: "Comprar fichas de novo, e completar o estoque no primeiro intervalo." },
        seats: { label: "Sorteio de Assentos e Mesas", hint: "Sortear assentos, e equilibrar mesas conforme os jogadores são eliminados." },
        deals: { label: "Acordos de Mesa Final", hint: "A calculadora de ICM e divisão de fichas." },
        payLinks: { label: "Links de Pagamento", hint: "Links de Venmo, Cash App e PayPal no acerto de contas e nos pagamentos." },
        costs: { label: "Custos Divididos", hint: "Divida o que foi comprado para o jogo, como comida ou um baralho novo. Entra no acerto de contas, não nos resultados de ninguém." },
        ledger: { label: "Quem Deve a Quem", hint: "Marque os pagamentos do acerto de contas conforme forem feitos. Jogadores mostra o que ainda se deve em todos os jogos." },
        bombPots: { label: "Bomb pots", hint: "Jogos a dinheiro: todos põem um ante e o flop sai sem apostas antes. Na hora ou com cronômetro." },
        sevenTwo: { label: "O jogo do 7-2", hint: "Jogos a dinheiro: ganhar uma mão com 7-2 cobra um valor fixo de cada jogador com cartas." },
        highHand: { label: "Mão mais alta", hint: "Jogos a dinheiro: a melhor mão de cada período ganha um prêmio pago pela casa." },
      },
    },
    house: {
      heading: "Regras da Casa",
      hint: "Uma por linha. Elas aparecem na TV embaixo do relógio, alternando quando há mais de duas.",
      placeholder: "Sem apostas em string.\nRecompras fecham no primeiro intervalo.",
      commonOnes: "Comuns:",
      onNewGame: "Colocar em Cada Partida Nova",
      commonRules: {
        cardsSpeak: "As cartas falam.",
        showOneShowAll: "Mostrou uma, mostra todas.",
        verbalBinding: "A ação verbal vale como definitiva.",
        noStringBets: "Sem apostas em string.",
        onePlayerToAHand: "Um jogador por mão.",
        protectYourHand: "Proteja sua mão.",
        chipsStayOnTable: "As fichas ficam na mesa.",
        straddlesWelcome: "Straddles são bem-vindos.",
        runItTwice: "Pode rodar duas vezes se os dois jogadores concordarem.",
        chopBlinds: "As blinds são divididas se todos desistirem até elas.",
        phonesDown: "Celulares guardados durante uma mão.",
        rebuysBetweenHands: "Recompras só entre as mãos.",
        newDeckOnRequest: "Baralho novo se for pedido.",
        lastHandAnnounced: "A última mão é anunciada.",
        settleUp: "Acerte as contas antes de sair.",
        finalSay: "Quem organiza a partida tem a palavra final.",
      },
    },
    defaults: {
      heading: "Novas Partidas",
      lede: "De onde uma partida nova começa. Cada um desses ajustes ainda pode ser mudado na própria partida, e um modelo define os seus.",
      auto: "Automático",
      length: { label: "Duração", about: "Cerca de {time}" },
      tournaments: {
        heading: "Torneios",
        buyIn: { label: "Buy-In {sym}", hint: "As recompras começam pelo mesmo preço." },
        players: { label: "Jogadores", hint: "Quantos costumam jogar. Estoques, cálculo de fichas e pagamentos partem daqui." },
        startingStack: { label: "Estoque Inicial", hint: "Deixe em branco e cada partida escolherá um que combine com seu conjunto de fichas e jogadores." },
        startingDepth: { label: "Profundidade Inicial", hint: "O estoque em big blinds no nível 1." },
        length: { hint: "A estrutura de blinds é montada para terminar por volta desse horário." },
        levelLength: { label: "Duração do Nível" },
        breaks: { label: "Intervalos", hint: "0 níveis significa sem intervalos.", levelsBetween: "Níveis Entre Intervalos", minutes: "Minutos de Intervalo" },
        antes: {
          label: "Antes e Inscrição Tardia",
          hint: "0 significa sem antes. A inscrição tardia fecha depois do nível que você escolher.",
          antesFrom: "Antes a Partir do Nível",
          lateRegThrough: "Inscrição Tardia Até o Nível",
        },
        rebuys: {
          label: "Recompras e Add-Ons",
          hint: "As recompras custam o buy-in e dão um estoque inicial. O add-on chega no primeiro intervalo.",
          checkbox: "Recompras",
          throughLevel: "Até o Nível",
          addOnCheckbox: "Add-On",
          cost: "Custo {sym}",
        },
        bounty: { label: "Recompensa {sym}", hint: "A parte de cada buy-in que fica sobre a cabeça do jogador. 0 significa nenhuma." },
        bountyKind: { label: "Tipo de bounty", hint: "Fixo paga o bounty inteiro por eliminação. Progressivo (PKO) paga metade e soma a outra metade ao bounty de quem eliminou. Misterioso abre um envelope aleatório a cada eliminação depois que os envelopes saem." },
        payouts: { label: "Pagamentos", hint: "Porcentagens, o 1º lugar primeiro, tipo 50, 30, 20. Deixe em branco e são escolhidas pelo número de jogadores." },
        roundTo: { label: "Arredondar Pagamentos Para", hint: "Para que ninguém receba {amount}. O que sobrar vai para o 1º lugar." },
      },
      cash: {
        heading: "Jogos em Dinheiro",
        buyIn: {
          label: "Buy-In",
          hint: "Em big blinds, para funcionar em qualquer valor de aposta. Os valores vêm das blinds de cada partida.",
          min: "Mín",
          standard: "Padrão",
          max: "Máx",
        },
        length: { hint: "Para o horário de término e o cálculo de fichas. Jogos em dinheiro sempre podem se estender." },
        straddles: { label: "Straddles", checkbox: "Straddles Permitidos" },
        bomb: { label: "Bomb pots", hint: "O ante em big blinds e a cada quanto tempo sai um.", anteBB: "Ante (big blinds)", every: "A cada quantos minutos (0 = quando pedido)" },
        sevenTwo: { label: "O jogo do 7-2 (big blinds)", hint: "O que uma vitória com 7-2 cobra de cada jogador." },
        highHand: { label: "Mão mais alta", hint: "O prêmio e quanto dura cada período." },
      },
      both: {
        heading: "Ambos",
        seatsPerTable: { label: "Assentos por Mesa", hint: "Para sortear assentos e equilibrar mesas.", option: "{n} Assentos" },
      },
      templates: {
        heading: "Modelos",
        empty: "Ainda não há modelos.",
        typeCash: "Dinheiro",
        typeTournament: "Torneio",
        playersCount: { one: "{n} jogador", other: "{n} jogadores" },
        deleteAriaLabel: "Excluir modelo {name}",
        deleteConfirm: "Excluir o modelo “{name}”? As partidas criadas a partir dele continuam existindo.",
        deletedToast: "“{name}” excluído",
        savedSetups: {
          label: "Configurações Salvas",
          hintBefore: "Crie uma a partir de",
          saveAsTemplate: "Salvar como Modelo",
          hintAfter: "em uma partida nova; comece por lá ou pelos Comandos",
        },
      },
    },
    chips: {
      heading: "Conjuntos de Fichas",
      lede: "As fichas com que você joga. O valor é o que está impresso na ficha; cada partida pode escalá-lo (uma ficha impressa com 1 pode valer 100 em um torneio). Partidas novas começam com o conjunto padrão.",
    },
    tv: {
      heading: "TV",
      levelWarning: {
        label: "Aviso de Nível",
        hint: "A TV apita e o relógio fica vermelho antes das blinds subirem. O último minuto pisca.",
        before1: "1 Minuto Antes",
        before2: "2 Minutos Antes",
        before5: "5 Minutos Antes",
      },
      sound: { label: "Som", hint: "Os navegadores precisam de um clique na TV antes de poder tocar som, então a TV pede isso.", checkbox: "Iniciar Telas de TV com o Som Ligado" },
      volume: {
        label: "Volume da TV",
        hint: "Os apitos, os tiques da contagem regressiva e o locutor. Uma TV em outro dispositivo também segue isso. Solte o controle deslizante para ouvir o som de mudança de nível.",
      },
      keepAwake: {
        label: "Manter Acordada",
        hint: "Para a tela não escurecer no meio de um nível. Funciona no Chrome, Edge e Safari.",
        checkbox: "Manter a TV Ligada Enquanto o Relógio Corre",
      },
      announcer: {
        label: "Locutor",
        hint: "Depois do apito, a TV lê em voz alta, com a voz própria do aparelho, as novas blinds, intervalos, eliminações e o vencedor.",
        checkbox: "Ler os Grandes Momentos em Voz Alta",
        hearIt: "Ouvir",
        sample: "Nível 5. As blinds são 200, 400, com um ante de 400.",
      },
      money: {
        label: "Dinheiro na TV",
        hint: "Desligue para manter o prêmio total, os pagamentos e os buy-ins fora da tela grande. A tela do dealer continua mostrando tudo.",
        checkbox: "Mostrar Valores em Dinheiro na TV",
      },
    },
    yours: { heading: "Seus Dados" },
    lock: {
      heading: "Bloqueio por Código de Acesso",
      intro:
        "Tudo aqui já está criptografado. Um código de acesso vai além: nada que foi salvo pode ser aberto sem ele, mesmo por alguém usando este mesmo navegador, e o PitMaster se bloqueia sozinho depois de um tempo sem uso. As telas de TV continuam mostrando a partida enquanto está bloqueada, e nada nelas pode mudá-la.",
      needsHttps: "Precisa de uma página segura (https), onde este navegador possa criptografar.",
      passcode: {
        label: "Código de Acesso",
        hint: "Pelo menos {n} caracteres, e quanto mais longo, mais difícil de quebrar se alguém copiar os arquivos deste navegador. Esquecê-lo faz tudo que foi salvo aqui se perder para sempre, então exporte antes.",
        newPlaceholder: "Novo Código de Acesso",
        newAriaLabel: "Novo código de acesso",
        againPlaceholder: "Digite de Novo",
        againAriaLabel: "Novo código de acesso, de novo",
        tooShort: "Pelo menos {n} caracteres.",
        mismatch: "Os dois ainda não coincidem.",
        turnOnButton: "Ativar o Bloqueio",
        turningOn: "Bloqueando…",
      },
      autoLock: {
        label: "Bloqueio Automático",
        hint: "Depois deste tempo sem cliques, toques ou teclas em nenhuma aba do PitMaster. Telas de TV não contam e não são bloqueadas.",
        lockNowButton: "Bloquear Agora",
        options: {
          sec30: "Depois de 30 Segundos",
          min1: "Depois de 1 Minuto",
          min2: "Depois de 2 Minutos",
          min5: "Depois de 5 Minutos",
          min10: "Depois de 10 Minutos",
          min15: "Depois de 15 Minutos",
          min30: "Depois de 30 Minutos",
          hour1: "Depois de 1 Hora",
          onClose: "Só Quando o PitMaster Fechar",
        },
        phrase: {
          sec30: "depois de 30 segundos",
          min1: "depois de 1 minuto",
          min2: "depois de 2 minutos",
          min5: "depois de 5 minutos",
          min10: "depois de 10 minutos",
          min15: "depois de 15 minutos",
          min30: "depois de 30 minutos",
          hour1: "depois de 1 hora",
          onClose: "só quando fechar",
          awhile: "depois de um tempo",
        },
      },
      changeOrOff: {
        label: "Alterar ou Desativar",
        hint: "Ambos pedem o código de acesso atual. De qualquer forma, tudo continua criptografado.",
        currentPlaceholder: "Código de Acesso Atual",
        currentAriaLabel: "Código de acesso atual",
        typeCurrentFirst: "Digite o código de acesso atual primeiro",
        changeButton: "Alterar Código de Acesso",
        changingBusy: "Alterando…",
        turnOffButton: "Desativar o Bloqueio",
      },
      error: { wrongPasscode: "Esse não é o código de acesso atual.", generic: "Não foi possível alterar. Nada foi mudado; tente de novo." },
      toast: { off: "Bloqueio desativado. Tudo continua criptografado.", on: "Bloqueado com um código de acesso.", onWithAuto: "Bloqueado com um código de acesso. O PitMaster se bloqueia {phrase} sem uso." },
    },
    data: {
      heading: "Exportar e Importar",
      lede: "Tudo está salvo neste navegador, criptografado: {summary} ({kb} KB). Não há conta nem cópia na nuvem, então um arquivo é como isso chega a outro dispositivo.",
      privacyLink: "Como Seus Dados São Tratados",
      summary: { join: "{rest} e {last}" },
      count: {
        games: { one: "{n} partida", other: "{n} partidas" },
        chipSets: { one: "{n} conjunto de fichas", other: "{n} conjuntos de fichas" },
        templates: { one: "{n} modelo", other: "{n} modelos" },
        newGames: { one: "{n} partida nova", other: "{n} partidas novas" },
        payLinksFor: { one: "links de pagamento para {n} pessoa", other: "links de pagamento para {n} pessoas" },
        inProgress: "({n} em andamento)",
      },
      export: {
        label: "Exportar",
        hint: "Um único arquivo com tudo. Mantenha-o como backup, ou importe-o em outro dispositivo e continue por lá. Sem senha, qualquer um com o arquivo pode lê-lo.",
        button: "Exportar Tudo",
        busy: "Bloqueando…",
        lastExported: "Última exportação {time}.",
        includeSettings: "Incluir Estas Configurações",
        lockWithPassword: "Bloquear com uma Senha",
        passwordPlaceholder: "Senha",
        passwordAriaLabel: "Senha do arquivo",
        passwordNote: "Pelo menos {n} caracteres, e quanto mais longa, mais forte. Criptografado com AES-256. Importá-lo exige essa senha, e uma perdida não pode ser recuperada, nem por você nem por nós.",
        passwordTitle: "Digite uma senha de pelo menos {n} caracteres, ou desative o bloqueio",
        toast: {
          locked: "Exportado e bloqueado. Importá-lo exige a senha.",
          plain: "Exportado. No outro dispositivo, abra-o com Importar.",
          lockFailed: "Não foi possível bloquear o arquivo. Tente de novo, ou exporte sem senha.",
        },
      },
      import: {
        label: "Importar",
        hint: "Uma partida em andamento continua exatamente de onde parou, com relógio, jogadores e código de TV incluídos.",
        kindGame: "Uma partida",
        kindEverything: "Tudo",
        exportedAt: "exportado em {day} às {time}",
        plusSettings: ", mais as configurações",
        modeAriaLabel: "Como importar",
        modeMerge: "Adicionar a Este Navegador",
        modeReplace: "Substituir Tudo",
        replaceCount: { one: "A {n} partida daqui será substituída pela do arquivo, que tem", other: "As {n} partidas daqui serão substituídas pelas do arquivo, que tem" },
        replaceOthers: "Conjuntos de fichas, modelos e links de pagamento também.",
        newerCount: "{n} mais novas que a cópia daqui",
        keptCount: "{n} já atualizadas",
        noGames: "Não tem partidas",
        nothingDeleted: "Nada aqui é excluído.",
        useSettingsToo: {
          label: "Usar as Configurações Dele Também",
          hint: "Regras da casa, dinheiro, padrões de partida e a TV. O tema e os sons desta tela continuam como estão.",
        },
        importButton: "Importar",
        importedToast: { one: "{n} partida importada", other: "{n} partidas importadas" },
        undoneToast: "Importação desfeita. Tudo está como estava.",
        lockedWithPassword: "Está bloqueado com uma senha.",
        filePasswordAriaLabel: "A senha do arquivo",
        typePasswordFirst: "Digite a senha do arquivo primeiro",
        unlockingBusy: "Desbloqueando…",
        unlockButton: "Desbloquear",
        dropAriaLabel: "Importar um arquivo",
        chooseFile: "Escolher um Arquivo",
        orDropHere: "Ou Solte Aqui",
        importedLabel: "Importado.",
        readyToRun: "Prontas para Rodar:",
        inProgress: "Em Andamento:",
        undoButton: "Desfazer Importação",
        error: { tooBig: "Esse arquivo é grande demais para ser uma exportação do PitMaster.", failed: "Esse arquivo não funcionou. {message}" },
      },
      startOver: {
        label: "Recomeçar",
        hint: "Exclui cada partida e conjunto de fichas personalizado neste navegador. Não pode ser desfeito.",
        button: "Excluir Tudo",
        confirm: "Excluir cada partida e conjunto de fichas personalizado? Isso não pode ser desfeito. Exporte antes se puder querer mantê-los.",
        doneToast: "Tudo apagado. Um novo começo.",
      },
    },
  },
};

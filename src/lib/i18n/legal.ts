// copy for the Help, Privacy and Terms of Use pages. long paragraph-style
// strings are expected here: this is prose, not short UI labels. paragraphs
// that carry an inline link or bold phrase are split into pieces around it
// (…pre / …post, or a1a / a1b) since the piece in the middle stays a real
// element, not translated text.
import type { Lang } from "./langs";

export interface LegalDict {
  lastUpdated: string;
  changesTitle: string;
  contactTitle: string;
  nav: { privacyPolicy: string; termsOfUse: string };
  links: { privacy: string; export: string };
  help: {
    sub: string;
    onThisPage: string;
    nav: { start: string; dealing: string; tv: string; calculator: string; keys: string; data: string };
    start: { welcomeBack: string };
    dealing: {
      cashTitle: string;
      cashBody: string;
      tourneyTitle: string;
      tourneyBody: string;
      paletteTitle: string;
      paletteBody1: string;
      paletteBody2: string;
      paletteBody3: string;
      everyTitle: string;
      everyBody1: string;
      everyBody2: string;
    };
    tv: {
      body1a: string;
      openWindow: string;
      body1b: string;
      goLive: string;
      body1c: string;
      body1d: string;
      body2a: string;
      body2b: string;
      body2c: string;
    };
    calculator: {
      press: string;
      onAnyPage: string;
      onAnyPageOr: string;
      openNow: string;
      floats: string;
      li1a: string;
      li1b: string;
      li1c: string;
      li1d: string;
      li2a: string;
      li3a: string;
      li3b: string;
      li4a: string;
      li4b: string;
      li4c: string;
      li5a: string;
      li5b: string;
      li6a: string;
      li6b: string;
      li6c: string;
      addUp: string;
      li6d: string;
      li6e: string;
      into: string;
      li7: string;
      li8: string;
      potKey: string;
      li9: string;
    };
    keys: { note: string };
    data: {
      q1: string;
      a1a: string;
      a1b: string;
      q2: string;
      a2: string;
      q3: string;
      a3a: string;
      moveDevice: string;
      a3b: string;
      q4: string;
      a4: string;
      q5: string;
      a5a: string;
      a5b: string;
      q6: string;
      a6a: string;
      a6b: string;
      a6c: string;
    };
  };
  privacy: {
    intro: { pre: string; post: string };
    short: { title: string; li1: string; li2: string; li3: string; li4: string; li5pre: string; li5post: string };
    onDevice: {
      title: string;
      lead: string;
      li1: string;
      li2: string;
      li3: string;
      li4: string;
      p1: string;
      p2: string;
      p3: string;
      p4: string;
      p5pre: string;
      passcodeLinkText: string;
      p5post: string;
      p6pre: string;
      exportImportLinkText: string;
      p6mid: string;
    };
    exports: { title: string; p1: string; p2: string };
    tv: { title: string; p1: string; p2: string; li1: string; li2: string; li3: string; li4: string; li5: string; p3: string };
    protected: { title: string; li1: string; li2: string; li3: string; li4: string; li5: string; p1: string };
    phones: {
      title: string;
      p1: string;
      li1: string;
      li2: string;
      li3: string;
      li4: string;
      p2: string;
    };
    host: { title: string; p1pre: string; linkText: string; p1post: string };
    other: { title: string; li1: string; li2: string; li3: string };
    choices: { title: string; li1pre: string; li1post: string; li2: string; li3: string };
    children: { title: string; p1: string };
    changes: { p1: string };
    contact: { p1pre: string };
  };
  terms: {
    intro: { pre: string; post: string };
    what: { title: string; p1: string };
    yourChoice: { title: string; p1: string };
    legalGame: { title: string; p1: string; p2: string };
    data: { title: string; p1: string; p2: string; p3: string };
    math: { title: string; p1: string };
    fair: { title: string; p1: string };
    code: { title: string; p1pre: string; p1mid: string; p1post: string };
    trademarks: { title: string; p1: string };
    warranty: { title: string; p1: string };
    liability: { title: string; p1: string };
    indemnity: { title: string; p1: string };
    rest: { title: string; p1pre: string; p1post: string };
    changes: { p1: string };
    contact: { p1pre: string };
  };
}

export const legal: Record<Lang, LegalDict> = {
  en: {
    lastUpdated: "Last updated September 26, 2026",
    changesTitle: "Changes",
    contactTitle: "Contact",
    nav: { privacyPolicy: "Privacy Policy", termsOfUse: "Terms of Use" },
    links: { privacy: "Privacy", export: "Export" },
    help: {
      sub: "How PitMaster works, what it can do, and where your games live.",
      onThisPage: "On this page",
      nav: {
        start: "Getting Started",
        dealing: "Running a Game",
        tv: "The TV",
        calculator: "Calculator",
        keys: "Shortcuts",
        data: "Your Data",
      },
      start: { welcomeBack: "Show the Welcome on the Home Page Again" },
      dealing: {
        cashTitle: "Cash Games",
        cashBody:
          "Set the blinds and buy-in range, then add players as they sit down. Rebuys and cash-outs are a tap each, and the bank keeps count of every chip on the table. When the game's over, Settle Up works out who pays whom, with Venmo, Cash App and PayPal links if you want them. Side games have their own switches too: bomb pots on a timer or when called, the 7-2 game, and a high hand prize the house pays in settle-up. Shared costs split what was bought for the game, and Who Owes Who ticks off payments and keeps a running tab on the Players page. A waitlist keeps track of who's next for a seat, and the TV says when one opens.",
        tourneyTitle: "Tournaments",
        tourneyBody:
          "Pick how long you want to play and PitMaster builds the blind structure to fit: starting stacks, breaks, antes, rebuys, add-ons and bounties. Bust players as they go and the payouts, average stack and table balancing follow along. At the final table the deal calculator splits the prize pool by chip count or ICM. Bounties can be flat, progressive (PKO) or mystery envelopes, and Start From has ready-made setups like Turbo, Deepstack and Sit & Go. Once there's a winner, Settle Up shows what the house pays each player. Satellites pay out seats in another game, and shootouts play each table down to one winner before a final table. A heads-up bracket plays it one on one instead: draw the bracket, click each match's winner, and the TV shows who plays who.",
        paletteTitle: "Do Anything by Name",
        paletteBody1: "Press",
        paletteBody2:
          "anywhere to open Commands. Type what you want, like “next level”, “bust mike” or “new tournament”, and press Enter. Mistakes happen at every table:",
        paletteBody3: "undoes the last change on the dealer screen.",
        everyTitle: "Every Game Is Different",
        everyBody1: "Rake, house cut, bounties, rebuys, seating, deals and pay links each have their own switch in",
        everyBody2: "so a quiet kitchen game and a forty-player tournament each take only what they need. Leagues score a season of games in points, with standings on Players and the TV. Other Poker Games adds Omaha, stud, razz, draw and mixed games like HORSE, one game a level, and dealer's choice for cash games, with each game's limits on the TV. It isn't only poker: Liar's Dice keeps each player's dice, works out who loses one from the call, and settles a buy-in pot or money per die lost. Lives games (31, Screw Your Neighbor, Knock-Out Whist, Ship, Captain and Crew) count lives down to a winner, and pot games (In-Between, Guts, Bourré, Pass the Pigs) keep a running pot with a limit, and both settle up like everything else.",
      },
      tv: {
        body1a: "There are two ways to put the game on a big screen. On a laptop hooked up to the TV, hit",
        openWindow: "Open TV Window",
        body1b:
          "on the dealer screen and drag the window onto the TV. For any other screen (a smart TV's browser, a tablet, someone's phone), hit",
        goLive: "Go Live",
        body1c: "then open",
        body1d: "on that screen and type the 8-character code.",
        body2a:
          "The TV shows the clock, blinds, payouts and messages you send the table, and keeps up by itself. It can't change anything, and a live game is end-to-end encrypted on its way there. Press",
        body2b: "on the TV for full screen and",
        body2c: "for sound. Phones can follow along too: scan the QR code on the TV or the dealer screen, then type your name into Find Me to see your seat and where you stand.",
      },
      calculator: {
        press: "Press",
        onAnyPage: "on any page.",
        onAnyPageOr: "on any page, or",
        openNow: "open it now",
        floats:
          "It floats over the page, so you can drag it out of the way, shrink it to just the answer, or turn on Ghost to see through it and click the page underneath.",
        li1a: "Type sums straight from the keyboard.",
        li1b: "gives the answer,",
        li1c: "clears, and",
        li1d: "takes back a digit.",
        li2a: "It does × and ÷ before + and −, like on paper, and brackets work too:",
        li3a: "Percent works like a till:",
        li3b: "is 220.",
        li4a: "Type",
        li4b: "or",
        li4c: "after a number for thousands or millions, so a stack is quick to type:",
        li5a: "After",
        li5b: "the answer also shows in chips from your chip set, the fewest that make it, so you know what to hand over.",
        li6a: "Every answer goes in the history. Click a sum to change it, or its answer to use it.",
        li6b: "and",
        li6c: "step through the answers,",
        addUp: "Add Up",
        li6d: "totals them all (a game's cash-outs, say), and",
        li6e: "takes the lot as text.",
        into: "Into",
        li7: "puts the answer in the last number box you were in, like a buy-in or a chip count.",
        li8: "Nothing typed into it is ever saved.",
        potKey: "Pot Limit",
        li9: "works out the biggest raise in a pot limit game. Take the pot from the display, then the amount to call, and it shows the most anyone can raise to. Tap that to use it.",
      },
      keys: { note: "None of these fire while you're typing in a box. The Commands shortcut can be changed in" },
      data: {
        q1: "Where Are My Games Saved?",
        a1a: "In this browser, on this device, encrypted. There are no accounts, so nobody else has a copy, us included. Add a passcode in",
        a1b: "and nothing opens without it.",
        q2: "Does It Work Offline?",
        a2: "Yes. Once it's opened in a browser, PitMaster loads and runs there with no connection, TV window included. Only Go Live needs one, on both screens.",
        q3: "How Do I Move to Another Device?",
        a3a: "everything to a file, then import it on the other device. A single game can move too:",
        moveDevice: "Move to Another Device",
        a3b: "is on its dealer screen, and it carries on there, TV code and all.",
        q4: "What If I Clear My Browser?",
        a4: "Clearing this site's data deletes what's saved here for good, so export first if you want to keep it.",
        q5: "Does It Cost Anything?",
        a5a: "No. PitMaster is free, with no ads and no tracking, and its code is open source on",
        a5b: "page has the details.",
        q6: "Something's Not Right?",
        a6a: "Tell us at",
        a6b: "or open an issue on",
        a6c: "Please don't send anything from your games; we never need it.",
      },
    },
    privacy: {
      intro: {
        pre: "PitMaster (",
        post:
          ") is a free, open source side project, built entirely by one person and published by Wyzie LLC (“we”, “us”). It's built so your games never have to leave your device, and this page says exactly when something does.",
      },
      short: {
        title: "The Short Version",
        li1: "There are no accounts and no database of your games. We don't know who you are.",
        li2: "Everything you enter is saved in this browser, on this device, encrypted with a key only this browser holds. Add a passcode and nothing opens without it. We can't see any of it, and we can't recover it if it's lost.",
        li3: "The one exception: while a game has a TV code, an encrypted copy of it sits on our server so other screens can show it. It's locked with a key made from the TV code, which we never see, and it's deleted when you stop sharing, or two days after it last changed.",
        li4: "No ads, no analytics, no tracking cookies and no third-party scripts.",
        li5pre: "PitMaster's code is public on",
        li5post: "so anyone can check that it does what this page says.",
      },
      onDevice: {
        title: "What's Saved on Your Device",
        lead: "PitMaster keeps everything in your browser's storage:",
        li1: "Games: players' names, buy-ins, cash-outs, rebuys, knockouts, seats, payouts, deals, the game log and notes.",
        li2: "Your chip sets and templates.",
        li3: "The Venmo, Cash App and PayPal names you save for players.",
        li4: "Your settings.",
        p1: "All of it is encrypted with AES-256-GCM before it's stored. Your browser makes the key at random on your first visit and keeps it so that no script, ours included, can read it out; it can only be used, in this browser, to lock and unlock your data. The only things stored unencrypted are the theme and reduced motion (the page needs them before it draws) and, with a passcode, how many wrong tries were made. None of it says anything about you or your games.",
        p2: "Your browser keeps its own history of pages you've visited. PitMaster keeps game names out of it: a game's tab is just called Cash Game or Tournament. A TV's address does hold its code, so the TV can pick the game back up after a reload.",
        p3: "The browser also keeps a copy of PitMaster's own files (the app itself, its icons and the pages' layouts) so the site opens without a connection. They're the same for everyone and hold none of your games or settings.",
        p4: "Without a passcode, that keeps your games unreadable to anything that looks at the saved data without using the key, like someone browsing the site's storage in developer tools. It doesn't stop anyone who can use this browser: they can open PitMaster and see your games. And since the browser keeps the key on the same device, anyone who copies the whole browser profile gets the key along with the data. Protect the device and your account on it the way you would anything else. If a page isn't on a secure (https) connection, browsers won't encrypt, so PitMaster saves nothing at all there rather than saving it unencrypted.",
        p5pre: "A passcode closes that gap (",
        passcodeLinkText: "Settings, Passcode Lock",
        p5post:
          "). The key is then kept locked by a key made from the passcode (PBKDF2 with 600,000 rounds), so nothing saved can be opened without it, even by someone using this browser or copying its files. A short passcode can still be guessed by someone who has a copy, so longer is better. PitMaster locks itself after the time you choose with no input, and every tab locks with it. TV screens keep showing the game they were given, can't change anything, and never hold the key. We never see the passcode and can't recover a lost one: without it, the only way forward is deleting everything saved in the browser.",
        p6pre: "Your data stays until you delete it (",
        exportImportLinkText: "Settings, Export & Import",
        p6mid:
          "then Delete Everything), clear this site's data in your browser, or close a private window. Clearing the site's data deletes the key too, and without it nothing saved here can be read again, by you or by anyone. Every browser and device keeps its own separate copy, which is why exports exist.",
      },
      exports: {
        title: "Export Files",
        p1: "An export is made inside your browser and saved wherever you choose. It never passes through us. It holds everything listed above, players' names and pay links included.",
        p2: "You can lock a full export with a password of at least 8 characters. It's then encrypted with AES-256-GCM under a key made from the password (PBKDF2 with 600,000 rounds), and only the file's type and date can be read without it. The longer the password, the harder it is to guess. We never see the password and can't recover a lost one. A file without a password, like a single game moved to another device, can be read by anyone who has it, and so can a spreadsheet or recap you download or copy. Keep them somewhere you trust and share them only with people who should see them.",
      },
      tv: {
        title: "TV Codes",
        p1: "A TV window on the same computer gets the game straight from the dealer screen. Nothing leaves your device.",
        p2: "When you press Go Live to show a game on another device:",
        li1: "Your browser makes an eight-character code, and from it two things: an ID for our server to file the game under, and a key that locks it. Both come from a slow, one-way hash of the code (PBKDF2), and the code itself is never sent to us.",
        li2: "Each time the game changes, your browser encrypts a copy with that key (AES-256-GCM) and sends it. The copy has the game and its display settings (like the currency, the clock format and the TV's volume), but not the game log, your other games, chip sets, templates or pay links.",
        li3: "Our server stores the locked copy, the ID and a one-way hash (SHA-256) of a separate write key that only your browser holds, so only you can change or delete it. It has no way to unlock the copy.",
        li4: "A screen given the code makes the same ID and key, fetches the copy and unlocks it. TV links carry the code after a “#”, a part of the address browsers never send to a server.",
        li5: "The copy is deleted as soon as you press Stop Sharing or delete the game, or automatically two days after its last update. After Stop Sharing, a blank record with no game in it keeps the code from being reused until those two days are up.",
        p3: "Anyone who has the code, or guesses it, can see the game while it's shared, so leave out anything you wouldn't show the room. That includes phones: the TV and the dealer screen show the link as a QR code, drawn on the device, and a phone gets the same copy the TV does. Find Me searches that copy on the phone itself, and nothing typed into it is saved or sent.",
      },
      protected: {
        title: "How It's Protected",
        li1: "The site and the TV code server are served over encrypted connections (HTTPS), and tell browsers never to use anything less.",
        li2: "The site loads no third-party code: no ads, analytics, trackers or outside fonts. A strict content security policy stops the page from running any other scripts or talking to any server but ours.",
        li3: "Your data is encrypted on your device, on our server and in password-locked exports, as described above.",
        li4: "To slow down anyone trying to guess TV codes, the TV code server counts each IP address's requests for a minute at a time. The counts are kept only in memory and are never stored or logged.",
        li5: "Files you import are checked before anything is saved, and one that doesn't look exactly like a PitMaster export is turned away whole.",
        p1: "No system is perfectly secure, and PitMaster is a side project, not an audited security product. Don't put anything in it you couldn't stand to lose or to have seen.",
      },
      phones: {
        title: "Player Phones",
        p1: "With phones as cups in liar's dice, each player's phone is their cup. The host's screen shows each player a code for their own seat, and the key that lets a phone write to that seat never goes anywhere but that phone and the host's screen.",
        li1: "What a phone sends: first a hash of its numbers for the round (which gives nothing away), then, when a bid is called, the numbers themselves. Both are sealed with the game's key on the phone, like a TV snapshot.",
        li2: "What the server can see: the game's id, each seat's id, a SHA-256 of each seat's key, and ciphertext. It never has a seat's key, a player's name or anyone's dice.",
        li3: "What the host's screen can see: only what a phone has already shown. The host's own numbers are half of every die, and they're no use without the phone's half.",
        li4: "A phone keeps its own numbers for the round sealed, with a key made on the phone that no script can read out, so a reload doesn't lose the cup. Nothing is kept in plain text.",
        p2: "Like everything live, the mailboxes are deleted when the host stops sharing, or two days after the last update.",
      },
      host: {
        title: "Our Host",
        p1pre:
          "The site and the TV code server run on Cloudflare. To deliver pages and block attacks, Cloudflare handles technical details of each request, such as IP addresses and browser type, under",
        linkText: "its own privacy policy",
        p1post: "We don't add analytics, ads or tracking cookies, we don't log what you do, and we don't sell or share anything about you.",
      },
      other: {
        title: "Other Services",
        li1: "Pay links open Venmo, Cash App or PayPal with an amount and the game's name filled in. What happens there is between you and them.",
        li2: "The announcer only uses the voices built into your device, so what it reads out never leaves it. Where a browser only offers online voices, the announcer stays quiet.",
        li3: "Links to other sites follow those sites' own policies.",
      },
      choices: {
        title: "Your Choices",
        li1pre: "Delete everything at any time from",
        li1post: "or by clearing this site's data in your browser.",
        li2: "Stop sharing a TV code at any time, and the copy on our server is deleted right away.",
        li3: "Because we hold nothing that identifies you, there's nothing for us to look up, correct, hand over or delete on request. Everything is already in your hands.",
      },
      children: {
        title: "Children",
        p1: "PitMaster is meant for adults. It isn't for children, and we don't knowingly collect information from anyone, of any age.",
      },
      changes: { p1: "If this policy changes, the new version goes here and the date at the top changes with it." },
      contact: { p1pre: "Questions about privacy? Reach Wyzie LLC at" },
    },
    terms: {
      intro: {
        pre: "These terms are an agreement between you and Wyzie LLC (“we”, “us”), which publishes PitMaster at",
        post: "By using PitMaster you agree to them. If you don't, please don't use it.",
      },
      what: {
        title: "What PitMaster Is",
        p1: "PitMaster is a free, open source side project, built entirely by one person and published by Wyzie LLC, for anyone to use for their own poker games, of any size. It handles chip math, blind clocks, buy-ins, rake, payouts, settle-up and a TV display. It keeps records and does arithmetic. It doesn't take bets, hold or move money, or run any game itself, and it isn't a gambling service. It comes with no support, no guarantees and no promise that it will keep existing.",
      },
      yourChoice: {
        title: "How You Use It Is Up to You",
        p1: "Whether and how you use PitMaster is your choice, and you're solely responsible for that choice and for everything that follows from it: the games you run, the rules, stakes and fees you set, the money that changes hands, the information you enter, and anything you share or put on a screen. We don't supervise, check or approve any game, and nothing PitMaster shows is legal, financial or tax advice.",
      },
      legalGame: {
        title: "Running a Legal Game",
        p1: "Poker laws vary a lot from place to place. Some places don't allow real-money poker outside licensed rooms, and many forbid anyone but a licensed operator from taking a rake, a seat fee or any other cut. You're responsible for making sure any game you run with PitMaster, and every setting you use in it, is legal where you play, that you hold any license it needs, that any taxes it involves are reported and paid, and that everyone at the table is old enough to be there.",
        p2: "PitMaster isn't certified or approved by any gaming regulator. If you run a licensed or commercial room, it's up to you whether your rules allow it, and it doesn't replace any records you're required to keep.",
      },
      data: {
        title: "Your Data",
        p1: "Everything you enter is saved in your browser, encrypted (see",
        p2: "). It's yours, and so is keeping it safe. Clearing your browser, losing or switching devices, a browser problem or a bug can erase it or make it unreadable, and we have no copy to restore.",
        p3: "often, and keep your exports somewhere safe. If you lock an export with a password and lose the password, the file can't be opened, by you or by us.",
      },
      math: {
        title: "Check the Math",
        p1: "Payouts, rake, settle-up amounts, deal calculations and blind structures are worked out in good faith, but they can be wrong, or wrong for your game. Check anything that matters before money changes hands. Disagreements at the table are for the table to settle.",
      },
      fair: {
        title: "Using It Fairly",
        p1: "Don't misuse PitMaster or its TV code server: no overloading it, trying to guess or collect other people's codes, getting around its security, using it to break the law, or storing anything in it but poker games. Only enter information you have the right to share. We may limit or block use that breaks these rules.",
      },
      code: {
        title: "The Code",
        p1pre: "PitMaster's code is public at",
        p1mid: "under the",
        p1post:
          "you're free to read it, copy it, change it and run your own copy, on that license's terms. The license covers the code; these terms cover using PitMaster at pitmaster.cc. A copy someone else runs is theirs, not ours: these terms and our Privacy Policy don't apply to it, and we aren't responsible for it. The license doesn't include the PitMaster name, so if you publish your own copy, give it a name of its own so nobody mistakes it for this one.",
      },
      trademarks: {
        title: "Names and Trademarks",
        p1: "Built-in chip sets are named after the real products they match, from makers like DA VINCI, KardShark, Playzaic and Casino Supply, and pay links name Venmo, Cash App and PayPal. Those names belong to their owners. PitMaster isn't affiliated with or endorsed by any of them.",
      },
      warranty: {
        title: "No Warranty",
        p1: "PitMaster is provided “as is” and “as available,” without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, accuracy, security and non-infringement. We don't promise that it will be correct, secure, uninterrupted or free of bugs, or that your data will be kept safe or can be recovered. We can change, limit or end PitMaster at any time without notice, and it can break or go offline, including in the middle of a game.",
      },
      liability: {
        title: "Limitation of Liability",
        p1: "To the fullest extent the law allows, neither Wyzie LLC nor the person who built PitMaster is liable for any indirect, incidental, special, consequential or punitive damages, or for lost data, lost money, lost profits, gambling losses, legal trouble or disputes between players, arising from or related to your use of PitMaster, even if we were told they were possible. Where liability can't be excluded, our total liability to you for all claims together is limited to $50. Some places don't allow these limits, so some of them may not apply to you.",
      },
      indemnity: {
        title: "Indemnity",
        p1: "If anyone makes a claim against Wyzie LLC or the person who built PitMaster because of how you used it, a game you ran with it, or your breaking these terms or the law, you agree to cover the resulting losses and costs, including reasonable legal fees, to the extent the law allows.",
      },
      rest: {
        title: "The Rest",
        p1pre:
          "If any part of these terms can't be enforced, the rest still applies. Not enforcing a part isn't giving it up. These terms and the",
        p1post: "are the whole agreement between you and us about PitMaster.",
      },
      changes: { p1: "We may update these terms. The date at the top says when they last changed, and using PitMaster after a change means you accept the new version." },
      contact: { p1pre: "Questions about these terms? Reach Wyzie LLC at" },
    },
  },
  zh: {
    lastUpdated: "最近更新于 2026 年 9 月 26 日",
    changesTitle: "变更",
    contactTitle: "联系我们",
    nav: { privacyPolicy: "隐私政策", termsOfUse: "使用条款" },
    links: { privacy: "隐私", export: "导出" },
    help: {
      sub: "PitMaster 的工作原理、它能做什么,以及你的牌局数据保存在哪里。",
      onThisPage: "本页内容",
      nav: {
        start: "快速上手",
        dealing: "开一局牌局",
        tv: "电视大屏",
        calculator: "计算器",
        keys: "快捷键",
        data: "你的数据",
      },
      start: { welcomeBack: "再次显示主页的欢迎介绍" },
      dealing: {
        cashTitle: "现金局",
        cashBody:
          "设置盲注和买入范围,然后在玩家入座时把他们加进来。补码和兑现都只需轻点一下,账房会记录桌上每一枚筹码。牌局结束后,「结算」会算出谁该付给谁,如果需要,还带有 Venmo、Cash App 和 PayPal 的收款链接。附加玩法也各有开关：定时或手动叫的炸弹底池、7-2 玩法，以及由主办方在结算时支付的最大牌奖。 共同费用会分摊为牌局买的东西；“谁欠谁”可以勾掉已付的款项，并在玩家页记下所有还欠的钱。 候补名单记录谁下一个入座，有空位时电视会提示。",
        tourneyTitle: "锦标赛",
        tourneyBody:
          "选好想玩多久,PitMaster 就会据此搭建盲注结构:起始筹码、休息时间、前注、补码、加购和奖金。玩家出局时随手记录,奖金分配、平均筹码量和并桌都会自动跟上。到了决赛桌,分牌计算器可以按筹码量或 ICM 分配奖池。赏金可以是固定、累进（PKO）或神秘信封；“从这里开始”里还有快速赛、深筹码赛、坐满即玩等现成设置。 决出冠军后，结算会显示主办方要付给每位玩家多少。 卫星赛的奖品是另一场比赛的席位；淘汰赛每桌打到只剩一位赢家，再进决赛桌。 单挑对决赛则一对一进行：抽签排好对阵，点选每场的胜者，电视会显示谁对谁。",
        paletteTitle: "输入名称即可完成任何操作",
        paletteBody1: "在任何地方按",
        paletteBody2:
          "即可打开命令面板。输入你想做的事,比如「下一级」「淘汰 mike」或「新建锦标赛」,然后按回车。每张桌子都难免出错:",
        paletteBody3: "可以撤销发牌员界面上的最后一次操作。",
        everyTitle: "每一局牌局都不一样",
        everyBody1: "抽水、场地抽成、奖金、补码、座位、分牌和收款链接,每一项都在",
        everyBody2: "里有自己的开关,这样无论是小规模牌局还是四十人的锦标赛,都只需要用到自己需要的那部分。 联赛按积分为一整季的比赛计分，排名显示在玩家页和电视上。 开启“其他扑克玩法”后可玩奥马哈、梭哈、Razz、换牌和 HORSE 等混合玩法（每个级别换一种），现金局还能庄家选玩法，电视会显示每种玩法的限注。 不只是扑克：吹牛骰子会记下每位玩家的骰子，根据开牌算出谁输掉一颗，并结算买入奖池或每颗骰子的钱。 生命值游戏（31 点、坑邻居、淘汰惠斯特、船长与船员）会一路扣命直到剩下赢家；奖池游戏（In-Between、Guts、Bourré、Pass the Pigs）会记录有上限的滚动奖池，两者都像其他游戏一样结算。",
      },
      tv: {
        body1a: "把牌局显示到大屏幕上有两种办法。如果笔记本电脑已经接上电视,就在发牌员界面点",
        openWindow: "「打开电视窗口」",
        body1b: "把窗口拖到电视上。如果是其他任何屏幕(智能电视的浏览器、平板、别人的手机),就点",
        goLive: "「开始直播」",
        body1c: "然后在那块屏幕上打开",
        body1d: "并输入 8 位字符的代码。",
        body2a: "电视画面会显示时钟、盲注、奖金分配和你发给牌桌的消息,并自动保持同步。它不能修改任何内容,牌局在传输过程中是端到端加密的。在电视上按",
        body2b: "可以进入全屏,按",
        body2c: "可以开关声音。 手机也能跟看：扫描电视或荷官页面上的二维码，然后在「找到我」里输入名字，就能看到你的座位和名次。",
      },
      calculator: {
        press: "在任意页面按",
        onAnyPage: "即可打开。",
        onAnyPageOr: "即可打开,或者",
        openNow: "现在打开它",
        floats: "它悬浮在页面上方,可以把它拖开、缩小到只剩答案,或者打开「幽灵模式」透视它并点击下方页面。",
        li1a: "直接用键盘输入算式。",
        li1b: "给出答案,",
        li1c: "清空,",
        li1d: "删除最后一位数字。",
        li2a: "它会像笔算一样先乘除后加减,括号也可以用:",
        li3a: "百分比按收银机的算法来:",
        li3b: "等于 220。",
        li4a: "在数字后面按",
        li4b: "或",
        li4c: "表示千或百万,这样输入一叠筹码的数目会更快:",
        li5a: "按下",
        li5b: "后,答案还会按你的筹码套装换算成筹码组合,用最少的筹码凑出来,方便你知道该找多少。",
        li6a: "每个答案都会进入历史记录。点击算式可以修改它,点击答案可以直接使用它。",
        li6b: "和",
        li6c: "可以在历史答案间跳转,",
        addUp: "「合计」",
        li6d: "会把它们全部加总(比如一局牌局的所有兑现金额),",
        li6e: "「复制」",
        into: "「填入」",
        li7: "会把答案填进你上一次停留的数字框,比如买入金额或筹码数量。",
        li8: "在里面输入的任何内容都不会被保存。",
        potKey: "底池限注",
        li9: "算出底池限注玩法中的最大加注额。先取显示屏上的底池，再填跟注额，就会显示任何人最多能加注到多少。点一下即可使用。",
      },
      keys: { note: "只要你正在某个输入框里打字,这些快捷键就不会触发。命令面板的快捷键可以在" },
      data: {
        q1: "我的牌局保存在哪里?",
        a1a: "保存在这个浏览器、这台设备上,并且是加密的。这里没有账户,所以除了你自己,没有人有一份副本,我们也没有。在",
        a1b: "里设置密码后,不输入密码就打不开。",
        q2: "离线也能用吗?",
        a2: "可以。只要在浏览器里打开过一次,PitMaster 之后无需联网也能加载和运行,电视窗口也一样。只有「开始直播」需要联网,而且两块屏幕都要联网。",
        q3: "怎么迁移到另一台设备?",
        a3a: "把所有内容导出成一个文件,再在另一台设备上导入。单个牌局也可以单独迁移:发牌员界面上的",
        moveDevice: "「迁移到另一台设备」",
        a3b: "就能做到,迁移后牌局会在那边继续,连电视代码都会一起带过去。",
        q4: "清除浏览器数据会怎样?",
        a4: "清除本网站的数据会把保存在这里的内容永久删除,所以想保留的话请先导出。",
        q5: "需要付费吗?",
        a5a: "不需要。PitMaster 完全免费,没有广告也不追踪你,代码在",
        a5b: "页面上有详细说明。",
        q6: "遇到问题了?",
        a6a: "可以通过",
        a6b: "联系我们,或者在",
        a6c: "上提交一个 issue。请不要发送任何来自你牌局的数据,我们从不需要它。",
      },
    },
    privacy: {
      intro: {
        pre: "PitMaster(",
        post:
          ")是一个免费、开源的副业项目,完全由一个人开发,并由 Wyzie LLC(「我们」)发布。它的设计初衷就是让你的牌局数据无需离开你的设备,本页会明确说明哪些情况例外。",
      },
      short: {
        title: "简要说明",
        li1: "没有账户,也没有存储你牌局数据的数据库。我们不知道你是谁。",
        li2: "你输入的一切都保存在这个浏览器、这台设备上,并用只有这个浏览器才持有的密钥加密。设置密码后,不输入密码就打不开。我们看不到其中任何内容,一旦丢失也无法找回。",
        li3: "唯一的例外:当一局牌局带有电视代码时,它的加密副本会存放在我们的服务器上,以便其他屏幕显示它。这份副本用由电视代码生成的密钥加密,我们从不会看到这个密钥,并且会在你停止分享时,或最后一次更新之后两天,自动删除。",
        li4: "没有广告,没有分析统计,没有跟踪 cookie,也没有第三方脚本。",
        li5pre: "PitMaster 的代码公开在",
        li5post: "上,任何人都可以核实它是否真的按本页说的那样做。",
      },
      onDevice: {
        title: "你的设备上保存了什么",
        lead: "PitMaster 把以下所有内容都保存在你浏览器的本地存储中:",
        li1: "牌局:玩家姓名、买入、兑现、补码、淘汰、座位、奖金分配、分牌、牌局记录和备注。",
        li2: "你的筹码套装和模板。",
        li3: "你为玩家保存的 Venmo、Cash App 和 PayPal 名称。",
        li4: "你的设置。",
        p1: "所有内容在存储前都会用 AES-256-GCM 加密。你的浏览器会在你第一次访问时随机生成密钥,并让任何脚本(包括我们的)都无法读取它;这个密钥只能在这个浏览器内用来加密和解密你的数据。唯一以未加密形式保存的是主题外观和减弱动效(页面在绘制前就需要用到它们),以及在设置密码后,记录的错误尝试次数。这些都不会透露关于你或你的牌局的任何信息。",
        p2: "你的浏览器会保留自己的浏览历史。PitMaster 会让历史记录中看不到牌局名称:牌局标签页只会显示「现金局」或「锦标赛」。电视地址里确实会带有代码,这样电视才能在刷新后重新接上牌局。",
        p3: "浏览器还会缓存 PitMaster 自身的文件(应用本身、图标和页面布局),这样网站在没有网络时也能打开。这些文件对所有人都一样,不包含你的任何牌局或设置。",
        p4: "没有设置密码时,这能让你的牌局在有人不通过密钥直接查看已保存数据时(比如在开发者工具里浏览网站存储)无法读懂。但它无法阻止能使用这个浏览器的人:他们可以直接打开 PitMaster 看到你的牌局。而且由于浏览器把密钥保存在同一台设备上,任何复制了整个浏览器配置文件的人也会一并获得密钥。请像保护其他重要账户一样保护这台设备和你在其上的账户。如果页面不是通过安全的(https)连接打开的,浏览器不会加密数据,所以这种情况下 PitMaster 干脆什么都不保存,而不是保存未加密的数据。",
        p5pre: "设置密码可以补上这个缺口(见",
        passcodeLinkText: "「设置,密码锁」",
        p5post:
          ")。之后密钥会被一个由密码生成的密钥(采用 60 万轮 PBKDF2)锁住,这样即使是能使用这个浏览器或复制了它文件的人,也无法打开任何保存的数据。较短的密码仍可能被持有副本的人猜出,所以密码越长越好。PitMaster 会在你选定的无操作时长后自动锁定,而且所有标签页都会一起锁定。电视屏幕会继续显示分配给它的牌局,无法修改任何内容,也从不持有密钥。我们从不会看到密码,一旦丢失也无法找回:唯一的解决办法就是删除浏览器中保存的一切。",
        p6pre: "你的数据会一直保留,直到你自己删除它(见",
        exportImportLinkText: "「设置,导出与导入」",
        p6mid:
          ",然后点击「删除所有内容」)、清除本网站的数据,或者关闭一个隐私窗口。清除网站数据也会删除密钥,没有它,这里保存的任何内容,无论是你还是任何人,都无法再读取。每个浏览器和设备都各自保存独立的一份副本,这也是导出功能存在的原因。",
      },
      exports: {
        title: "导出文件",
        p1: "导出是在你的浏览器内生成的,并保存到你自己选择的位置,不会经过我们的服务器。它包含上面列出的所有内容,包括玩家姓名和收款链接。",
        p2: "你可以用至少 8 位字符的密码给完整导出加密。之后它会用由密码生成的密钥(采用 60 万轮 PBKDF2)以 AES-256-GCM 加密,没有密码只能看到文件类型和日期。密码越长越难猜。我们从不会看到密码,一旦丢失也无法找回。没有密码的文件(比如迁移单个牌局用的文件)以及你下载或复制的表格、总结,任何拿到它的人都能读取。请把它们保存在你信任的地方,并且只与应该看到它们的人分享。",
      },
      tv: {
        title: "电视代码",
        p1: "同一台电脑上的电视窗口会直接从发牌员界面获取牌局数据,不会离开你的设备。",
        p2: "当你按下「开始直播」以便在另一台设备上显示牌局时:",
        li1: "你的浏览器会生成一个 8 位字符的代码,并由此得到两样东西:一个供我们服务器归档牌局用的 ID,以及一个用于加密它的密钥。两者都来自对该代码的一次慢速单向哈希运算(PBKDF2),代码本身从不会发送给我们。",
        li2: "牌局每次发生变化,你的浏览器都会用那个密钥(AES-256-GCM)加密一份副本并发送出去。这份副本包含牌局本身和它的显示设置(比如货币、时钟格式和电视的音量),但不包含牌局记录、你的其他牌局、筹码套装、模板或收款链接。",
        li3: "我们的服务器只存储加密后的副本、ID,以及一个只有你的浏览器才持有的独立「写入密钥」的单向哈希值(SHA-256),这样只有你能修改或删除它。服务器没有任何办法解密这份副本。",
        li4: "拿到代码的屏幕会生成同样的 ID 和密钥,取回副本并解密它。电视链接会把代码放在「#」符号之后,这是浏览器从不会发送给服务器的一部分地址。",
        li5: "副本会在你点击「停止分享」或删除该牌局时立即删除,或者在最后一次更新之后两天自动删除。点击「停止分享」后,一条不含任何牌局内容的空白记录会在这两天内占用该代码,防止它被重复使用。",
        p3: "任何拿到代码,或者猜中代码的人,都能在分享期间看到这局牌局,所以不要在里面留下任何你不愿意让全桌人看到的内容。 手机也一样：电视和荷官页面会把链接显示成二维码（在设备上生成），手机拿到的就是电视那份副本。「找到我」只在手机上搜索这份副本，输入的内容不会被保存或发送。",
      },
      protected: {
        title: "安全防护措施",
        li1: "网站和电视代码服务器都通过加密连接(HTTPS)提供服务,并且会告诉浏览器绝不使用低于此级别的连接。",
        li2: "网站不加载任何第三方代码:没有广告、分析统计、跟踪脚本,也没有外部字体。严格的内容安全策略会阻止页面运行除我们自己以外的任何脚本,或与除我们以外的任何服务器通信。",
        li3: "如上所述,你的数据在设备上、我们的服务器上以及带密码保护的导出文件中都是加密的。",
        li4: "为了拖慢任何试图猜测电视代码的人,电视代码服务器会按分钟统计每个 IP 地址的请求次数。这些计数只保存在内存中,从不会被存储或记录。",
        li5: "你导入的文件在保存前都会被检查,任何看起来不完全像 PitMaster 导出文件的内容都会被整体拒绝。",
        p1: "没有任何系统是绝对安全的,PitMaster 是一个副业项目,而不是经过审计的安全产品。请不要在里面存放任何你无法承受丢失或被人看到的内容。",
      },
      phones: {
        title: "玩家手机",
        p1: "在大话骰中使用手机当骰盅时，每位玩家的手机就是自己的骰盅。主持人的屏幕会为每位玩家显示一个对应自己座位的代码，而允许手机写入该座位的密钥只存在于那部手机和主持人的屏幕上，不会去往别处。",
        li1: "手机发送的内容：先发送本轮点数的一个哈希值（不会透露任何信息），等有人对叫数喊开或刚好时，再发送点数本身。两者都会在手机上用本局的密钥加密，就像电视副本一样。",
        li2: "服务器能看到的：本局的 ID、每个座位的 ID、每个座位密钥的 SHA-256 哈希值，以及密文。它从不持有座位的密钥、玩家的名字或任何人的骰子。",
        li3: "主持人的屏幕能看到的：只有手机已经亮出的内容。主持人自己的点数是每颗骰子的一半，没有手机那一半就毫无用处。",
        li4: "手机会把自己本轮的点数加密保存，所用的密钥在手机上生成，任何脚本都无法读取，所以重新加载页面也不会丢失骰盅。不会以明文保存任何内容。",
        p2: "和所有直播内容一样，这些信箱会在主持人停止分享时删除，或在最后一次更新两天后删除。",
      },
      host: {
        title: "我们的托管方",
        p1pre:
          "网站和电视代码服务器都运行在 Cloudflare 上。为了传送页面和拦截攻击,Cloudflare 会依据",
        linkText: "其自身的隐私政策",
        p1post: "处理每次请求的技术细节,例如 IP 地址和浏览器类型。我们不添加任何分析统计、广告或跟踪 cookie,不记录你的操作,也不出售或分享关于你的任何信息。",
      },
      other: {
        title: "其他服务",
        li1: "收款链接会打开 Venmo、Cash App 或 PayPal,并自动填好金额和牌局名称。之后发生的事只在你和它们之间。",
        li2: "语音播报只会使用你设备内置的语音,播报内容从不会离开你的设备。如果浏览器只提供在线语音,播报功能会保持静默。",
        li3: "指向其他网站的链接遵循这些网站各自的政策。",
      },
      choices: {
        title: "你的选择",
        li1pre: "你可以随时在",
        li1post: "删除所有内容,也可以在浏览器中清除本网站的数据。",
        li2: "你可以随时停止分享一个电视代码,我们服务器上的副本会立即被删除。",
        li3: "因为我们不持有任何能识别你身份的信息,所以也没有什么可供我们查询、更正、交出或按你的请求删除,一切本来就都在你自己手中。",
      },
      children: {
        title: "儿童保护",
        p1: "PitMaster 面向成年人。它不是为儿童设计的,我们也不会有意从任何年龄段的人那里收集信息。",
      },
      changes: { p1: "如果本政策发生变化,新版本会发布在这里,页面顶部的日期也会随之更新。" },
      contact: { p1pre: "对隐私有疑问?可以通过" },
    },
    terms: {
      intro: {
        pre: "本条款是你与 Wyzie LLC(「我们」)之间的协议,Wyzie LLC 在",
        post: "发布 PitMaster。使用 PitMaster 即表示你同意本条款。如果不同意,请不要使用它。",
      },
      what: {
        title: "PitMaster 是什么",
        p1: "PitMaster 是一个免费、开源的副业项目,完全由一个人开发,并由 Wyzie LLC 发布,供任何人用于自己的扑克牌局,不限规模。它负责筹码换算、盲注计时、买入、抽水、奖金分配、结算以及电视显示。它只负责记录数据和做算术,不接受下注,不持有或转移资金,也不运营任何牌局本身,它不是一项博彩服务。它不附带任何支持承诺、任何保证,也不保证会一直存在下去。",
      },
      yourChoice: {
        title: "如何使用它由你决定",
        p1: "是否使用 PitMaster,以及如何使用它,都由你自己决定,你也需要为这个决定以及由此产生的一切独自负责:你开的牌局、你设定的规则、注额和费用、涉及的资金往来、你输入的信息,以及你分享或展示在屏幕上的任何内容。我们不会监督、审查或批准任何牌局,PitMaster 显示的任何内容都不构成法律、财务或税务建议。",
      },
      legalGame: {
        title: "合法地开局",
        p1: "各地的扑克法律差异很大。有些地方不允许在持牌场所之外进行真钱扑克,许多地方也禁止除持牌运营商以外的任何人抽取抽水、座位费或其他任何形式的抽成。你需要自行确保,你用 PitMaster 开的每一局牌局,以及你在其中使用的每一项设置,在你所在地都是合法的,你持有所需的任何许可,相关税款已如实申报并缴纳,并且桌上每个人都达到了法定年龄。",
        p2: "PitMaster 没有获得任何博彩监管机构的认证或批准。如果你运营的是持牌或商业场所,是否允许使用它取决于你自己的规则,它也不能替代你依法必须保留的任何记录。",
      },
      data: {
        title: "你的数据",
        p1: "你输入的一切都保存在你的浏览器中,并经过加密(详见",
        p2: ")。数据是你的,保护它的安全也是你的责任。清除浏览器、丢失或更换设备、浏览器故障或程序缺陷都可能把它抹去或变得无法读取,而我们没有副本可以恢复。",
        p3: "经常导出,并把导出文件保存在安全的地方。如果你给导出文件加了密码却把密码弄丢,这个文件将无法打开,无论是你还是我们都无能为力。",
      },
      math: {
        title: "核对计算结果",
        p1: "奖金分配、抽水、结算金额、分牌计算和盲注结构都是本着诚意计算出来的,但仍可能出错,或者不适合你的牌局。在涉及资金往来之前,请核对任何重要的数字。牌桌上的分歧应由牌桌自行解决。",
      },
      fair: {
        title: "公平使用",
        p1: "请不要滥用 PitMaster 或它的电视代码服务器:不要给它增加过大负担,不要试图猜测或收集他人的代码,不要绕过它的安全机制,不要用它从事违法行为,也不要在里面存放扑克牌局以外的任何内容。只输入你有权分享的信息。我们可能会限制或封禁违反这些规则的使用行为。",
      },
      code: {
        title: "代码",
        p1pre: "PitMaster 的代码公开在",
        p1mid: "遵循",
        p1post:
          "许可,你可以自由阅读、复制、修改代码,并按该许可的条款运行自己的一份。该许可只涵盖代码本身;本条款则涵盖在 pitmaster.cc 使用 PitMaster 这件事。别人运行的副本属于他们自己,与我们无关:本条款和我们的隐私政策都不适用于那份副本,我们也不对它负责。该许可并不包含 PitMaster 这个名称,所以如果你发布自己的副本,请给它起一个属于自己的名字,以免有人把它误认为是这个版本。",
      },
      trademarks: {
        title: "名称与商标",
        p1: "内置的筹码套装是以它们所对应的真实产品命名的,这些产品来自 DA VINCI、KardShark、Playzaic 和 Casino Supply 等厂商,收款链接则使用了 Venmo、Cash App 和 PayPal 的名称。这些名称都归其各自所有者所有。PitMaster 与它们中的任何一方都没有关联,也未获得它们的认可。",
      },
      warranty: {
        title: "不提供担保",
        p1: "PitMaster 按「现状」和「现有可用性」提供,不附带任何明示或暗示的担保,包括适销性、特定用途适用性、准确性、安全性和不侵权担保。我们不承诺它会准确无误、安全、不中断或没有缺陷,也不承诺你的数据会被妥善保管或能够被恢复。我们可以随时更改、限制或终止 PitMaster,恕不另行通知,它也可能出现故障或离线,即使是在一局牌局进行到一半的时候。",
      },
      liability: {
        title: "责任限制",
        p1: "在法律允许的最大范围内,无论是 Wyzie LLC 还是开发 PitMaster 的个人,都不对任何间接、附带、特殊、后果性或惩罚性损害负责,也不对因你使用 PitMaster 而产生或与之相关的数据丢失、资金损失、利润损失、赌博损失、法律纠纷或玩家之间的争议负责,即使我们已被告知这些情况可能发生。在无法排除责任的情况下,我们对你就所有索赔合计承担的总责任上限为 $50。有些地方不允许这类责任限制,因此其中一些条款可能不适用于你。",
      },
      indemnity: {
        title: "赔偿",
        p1: "如果有人因为你使用 PitMaster 的方式、你用它运营的某局牌局,或者你违反本条款或法律而对 Wyzie LLC 或开发 PitMaster 的个人提出索赔,你同意在法律允许的范围内,承担由此产生的损失和费用,包括合理的律师费。",
      },
      rest: {
        title: "其他条款",
        p1pre: "如果本条款的任何部分无法执行,其余部分仍然有效。未执行某一部分并不代表放弃该部分。本条款与",
        p1post: "构成你与我们之间关于 PitMaster 的完整协议。",
      },
      changes: { p1: "我们可能会更新本条款。页面顶部的日期会说明它们最近一次更改的时间,在条款更新后继续使用 PitMaster,即表示你接受新版本。" },
      contact: { p1pre: "对本条款有疑问?可以通过" },
    },
  },
  hi: {
    lastUpdated: "आखिरी बार 26 सितंबर 2026 को अपडेट किया गया",
    changesTitle: "बदलाव",
    contactTitle: "संपर्क करें",
    nav: { privacyPolicy: "गोपनीयता नीति", termsOfUse: "उपयोग की शर्तें" },
    links: { privacy: "गोपनीयता", export: "एक्सपोर्ट करें" },
    help: {
      sub: "PitMaster कैसे काम करता है, यह क्या-क्या कर सकता है, और आपकी गेम्स कहाँ सुरक्षित रहती हैं.",
      onThisPage: "इस पेज पर",
      nav: {
        start: "शुरुआत कैसे करें",
        dealing: "गेम कैसे चलाएं",
        tv: "टीवी",
        calculator: "कैलकुलेटर",
        keys: "शॉर्टकट",
        data: "आपका डेटा",
      },
      start: { welcomeBack: "होम पेज पर स्वागत संदेश फिर से दिखाएं" },
      dealing: {
        cashTitle: "कैश गेम्स",
        cashBody:
          "ब्लाइंड्स और बाय-इन की सीमा तय करें, फिर खिलाड़ी बैठते ही उन्हें जोड़ें. रीबाय और कैश-आउट एक टैप में हो जाते हैं, और बैंक मेज़ पर मौजूद हर चिप का हिसाब खुद रखता है. गेम खत्म होने पर, Settle Up यह हिसाब लगा देता है कि किसे किसको पैसे देने हैं, और अगर चाहें तो Venmo, Cash App और PayPal के लिंक भी साथ में देता है. साइड गेम के भी अपने स्विच हैं: टाइमर पर या बुलाने पर बॉम्ब पॉट, 7-2 गेम, और हाई हैंड का इनाम जो हाउस सेटल-अप में देता है। साझा खर्च गेम के लिए खरीदी चीज़ें बांटते हैं, और किसका किस पर बाकी भुगतान टिक करता है और खिलाड़ी पेज पर पूरा हिसाब रखता है। वेटलिस्ट बताती है कि अगली सीट किसकी है, और सीट खाली होते ही टीवी बता देता है।",
        tourneyTitle: "टूर्नामेंट",
        tourneyBody:
          "आप कितनी देर खेलना चाहते हैं यह चुनें, और PitMaster उसी हिसाब से ब्लाइंड स्ट्रक्चर बना देगा: शुरुआती स्टैक, ब्रेक, एंटी, रीबाय, ऐड-ऑन और बाउंटी. जैसे-जैसे खिलाड़ी बाहर होते जाएं, पेआउट, औसत स्टैक और टेबल बैलेंसिंग खुद-ब-खुद अपडेट होते रहते हैं. फाइनल टेबल पर डील कैलकुलेटर प्राइज़ पूल को चिप काउंट या ICM के हिसाब से बांट देता है. बाउंटी फ़्लैट, प्रोग्रेसिव (PKO) या मिस्ट्री लिफ़ाफ़े हो सकती है, और \"यहाँ से शुरू करें\" में टर्बो, डीपस्टैक और सिट एंड गो जैसे तैयार सेटअप हैं। विजेता तय होते ही हिसाब चुकाएं दिखाता है कि हाउस हर खिलाड़ी को कितना देगा। सैटेलाइट में इनाम दूसरे गेम की सीटें होते हैं, और शूटआउट में हर टेबल एक विजेता तक खेलती है, फिर फाइनल टेबल। हेड्स-अप ब्रैकेट में मुकाबले आमने-सामने होते हैं: ब्रैकेट निकालें, हर मैच के विजेता पर क्लिक करें, और टीवी दिखाता है कि कौन किससे खेल रहा है।",
        paletteTitle: "बस नाम लिखकर कुछ भी करें",
        paletteBody1: "कहीं भी",
        paletteBody2:
          "दबाकर Commands खोलें. जो चाहें टाइप करें, जैसे “next level”, “bust mike” या “new tournament”, और Enter दबाएं. हर मेज़ पर गलतियां होती ही हैं:",
        paletteBody3: "डीलर स्क्रीन पर हुए आखिरी बदलाव को वापस कर देता है.",
        everyTitle: "हर गेम अलग होता है",
        everyBody1: "रेक, हाउस कट, बाउंटी, रीबाय, सीटिंग, डील और पे लिंक, इन सबके लिए अलग-अलग स्विच",
        everyBody2: "में मिलते हैं, ताकि एक छोटी-सी गेम और चालीस खिलाड़ियों वाला टूर्नामेंट, दोनों को सिर्फ वही मिले जिसकी उन्हें ज़रूरत है. लीग पूरे सीज़न के खेलों को पॉइंट्स में गिनती है, और रैंकिंग खिलाड़ी पेज और टीवी पर दिखती है। अन्य पोकर गेम से ओमाहा, स्टड, रैज़, ड्रॉ और HORSE जैसे मिक्स्ड गेम (हर लेवल पर एक गेम) और कैश गेम में डीलर्स चॉइस मिलते हैं, और हर गेम की लिमिट टीवी पर दिखती है। सिर्फ़ पोकर नहीं: लायर्स डाइस हर खिलाड़ी के पासे गिनता है, कॉल से तय करता है कि कौन एक पासा हारा, और बाय-इन पॉट या हर हारे पासे के पैसे का हिसाब करता है। लाइव्स गेम (31, स्क्रू योर नेबर, नॉक-आउट व्हिस्ट, शिप, कैप्टन एंड क्रू) विजेता तक जानें गिनते हैं, और पॉट गेम (इन-बिटवीन, गट्स, बूरे, पास द पिग्स) सीमा वाला चलता पॉट रखते हैं, और दोनों बाकी खेलों की तरह हिसाब करते हैं।",
      },
      tv: {
        body1a: "गेम को बड़ी स्क्रीन पर दिखाने के दो तरीके हैं. अगर लैपटॉप टीवी से जुड़ा है, तो डीलर स्क्रीन पर",
        openWindow: "Open TV Window",
        body1b: "दबाएं और विंडो को टीवी पर खींच लें. किसी भी दूसरी स्क्रीन के लिए (स्मार्ट टीवी का ब्राउज़र, टैबलेट, किसी का फोन), दबाएं",
        goLive: "Go Live",
        body1c: "फिर उस स्क्रीन पर खोलें",
        body1d: "और 8 अक्षरों वाला कोड डालें.",
        body2a: "टीवी पर घड़ी, ब्लाइंड्स, पेआउट और आपके भेजे गए संदेश दिखते हैं, और यह खुद-ब-खुद अपडेट होता रहता है. यह कुछ भी बदल नहीं सकता, और गेम वहां तक पहुंचते समय एंड-टू-एंड एन्क्रिप्टेड रहता है. टीवी पर पूरी स्क्रीन के लिए",
        body2b: "दबाएं और आवाज़ के लिए",
        body2c: "दबाएं. फ़ोन भी साथ देख सकते हैं: टीवी या डीलर स्क्रीन पर QR कोड स्कैन करें, फिर मुझे ढूंढें में अपना नाम लिखकर अपनी सीट और स्थिति देखें।",
      },
      calculator: {
        press: "किसी भी पेज पर",
        onAnyPage: "दबाएं.",
        onAnyPageOr: "दबाएं, या",
        openNow: "इसे अभी खोलें",
        floats: "यह पेज के ऊपर तैरता रहता है, तो आप इसे रास्ते से हटा सकते हैं, इसे सिकोड़कर सिर्फ जवाब जितना छोटा कर सकते हैं, या Ghost ऑन करके इसके आर-पार देखकर नीचे मौजूद पेज पर क्लिक कर सकते हैं.",
        li1a: "कीबोर्ड से सीधे जोड़-घटाव टाइप करें.",
        li1b: "जवाब देता है,",
        li1c: "साफ करता है, और",
        li1d: "आखिरी अंक हटा देता है.",
        li2a: "यह कागज़ पर हिसाब की तरह ही + और − से पहले × और ÷ करता है, और ब्रैकेट भी काम करते हैं:",
        li3a: "प्रतिशत बिल्कुल कैश काउंटर की तरह काम करता है:",
        li3b: "यानी 220.",
        li4a: "किसी संख्या के बाद हज़ार या लाख के लिए",
        li4b: "या",
        li4c: "टाइप करें, ताकि स्टैक जल्दी टाइप हो सके:",
        li5a: "दबाने के बाद",
        li5b: "जवाब आपके चिप सेट के हिसाब से चिप्स में भी दिखता है, कम से कम चिप्स में, ताकि आपको पता रहे कि कितना देना है.",
        li6a: "हर जवाब हिस्ट्री में जुड़ जाता है. किसी जोड़-घटाव पर क्लिक करके उसे बदलें, या उसके जवाब पर क्लिक करके इस्तेमाल करें.",
        li6b: "और",
        li6c: "पुराने जवाबों के बीच आगे-पीछे जाने के लिए हैं,",
        addUp: "Add Up",
        li6d: "सबका जोड़ बना देता है (जैसे किसी गेम के सारे कैश-आउट), और",
        li6e: "पूरी लिस्ट टेक्स्ट के रूप में कॉपी कर देता है.",
        into: "Into",
        li7: "जवाब को उस आखिरी नंबर बॉक्स में डाल देता है जिसमें आप थे, जैसे कोई बाय-इन या चिप गिनती.",
        li8: "इसमें टाइप की गई कोई भी चीज़ कभी सेव नहीं होती.",
        potKey: "पॉट लिमिट",
        li9: "पॉट लिमिट गेम में सबसे बड़ी रेज़ निकालता है. डिस्प्ले से पॉट लें, फिर कॉल की रकम, और यह दिखाता है कि कोई ज़्यादा से ज़्यादा कितने तक रेज़ कर सकता है. इस्तेमाल करने के लिए उस पर टैप करें.",
      },
      keys: { note: "जब तक आप किसी बॉक्स में टाइप कर रहे हों, तब तक इनमें से कोई भी शॉर्टकट काम नहीं करेगा. Commands का शॉर्टकट यहां बदला जा सकता है:" },
      data: {
        q1: "मेरी गेम्स कहां सेव होती हैं?",
        a1a: "इसी ब्राउज़र में, इसी डिवाइस पर, एन्क्रिप्टेड. यहां कोई अकाउंट नहीं है, इसलिए हमारे अलावा किसी और के पास भी इसकी कोई कॉपी नहीं है. यहां पासकोड जोड़ें:",
        a1b: "और उसके बिना कुछ भी नहीं खुलेगा.",
        q2: "क्या यह ऑफलाइन काम करता है?",
        a2: "हां. एक बार ब्राउज़र में खुल जाने के बाद, PitMaster बिना इंटरनेट के भी लोड और चालू रहता है, टीवी विंडो भी शामिल है. सिर्फ Go Live को ही इंटरनेट चाहिए, वो भी दोनों स्क्रीन पर.",
        q3: "किसी दूसरे डिवाइस पर कैसे ले जाएं?",
        a3a: "सब कुछ एक फाइल में एक्सपोर्ट करें, फिर दूसरे डिवाइस पर इंपोर्ट कर लें. सिर्फ एक गेम भी अलग से ले जाई जा सकती है: इसके लिए डीलर स्क्रीन पर",
        moveDevice: "Move to Another Device",
        a3b: "मौजूद है, और वहां जाकर वह वहीं से आगे चलती है, टीवी कोड समेत.",
        q4: "अगर मैं ब्राउज़र का डेटा साफ कर दूं तो?",
        a4: "इस साइट का डेटा साफ करने से यहां सेव सब कुछ हमेशा के लिए मिट जाता है, इसलिए अगर रखना चाहते हैं तो पहले एक्सपोर्ट कर लें.",
        q5: "क्या इसका कोई खर्च है?",
        a5a: "नहीं. PitMaster मुफ्त है, इसमें कोई विज्ञापन या ट्रैकिंग नहीं है, और इसका कोड यहां ओपन सोर्स है:",
        a5b: "पेज पर पूरी जानकारी है.",
        q6: "कुछ ठीक नहीं लग रहा?",
        a6a: "हमें यहां बताएं:",
        a6b: "या यहां एक issue खोलें:",
        a6c: "कृपया अपनी गेम्स से जुड़ी कोई भी चीज़ न भेजें; हमें उसकी कभी ज़रूरत नहीं होती.",
      },
    },
    privacy: {
      intro: {
        pre: "PitMaster (",
        post:
          ") एक मुफ्त, ओपन सोर्स साइड प्रोजेक्ट है, जिसे पूरी तरह एक ही व्यक्ति ने बनाया है और जिसे Wyzie LLC (“हम”) पब्लिश करती है. यह इस तरह बनाया गया है कि आपकी गेम्स को कभी आपके डिवाइस से बाहर न जाना पड़े, और यह पेज बताता है कि ठीक कब कुछ बाहर जाता है.",
      },
      short: {
        title: "संक्षेप में",
        li1: "यहां कोई अकाउंट नहीं है और आपकी गेम्स का कोई डेटाबेस नहीं है. हम नहीं जानते कि आप कौन हैं.",
        li2: "आप जो कुछ भी दर्ज करते हैं वह इसी ब्राउज़र में, इसी डिवाइस पर, एक ऐसी कुंजी से एन्क्रिप्ट होकर सेव होता है जो सिर्फ इसी ब्राउज़र के पास होती है. पासकोड जोड़ें और उसके बिना कुछ भी नहीं खुलेगा. हम उसमें से कुछ भी नहीं देख सकते, और अगर वह खो जाए तो हम उसे वापस भी नहीं ला सकते.",
        li3: "एक ही अपवाद है: जब तक किसी गेम का टीवी कोड चालू है, उसकी एक एन्क्रिप्टेड कॉपी हमारे सर्वर पर रहती है ताकि दूसरी स्क्रीन उसे दिखा सकें. यह टीवी कोड से बनी एक कुंजी से लॉक होती है, जिसे हम कभी नहीं देखते, और यह तब मिट जाती है जब आप शेयर करना बंद करते हैं, या आखिरी बदलाव के दो दिन बाद अपने आप.",
        li4: "कोई विज्ञापन नहीं, कोई एनालिटिक्स नहीं, कोई ट्रैकिंग कुकी नहीं और कोई थर्ड-पार्टी स्क्रिप्ट नहीं.",
        li5pre: "PitMaster का कोड सार्वजनिक रूप से यहां उपलब्ध है:",
        li5post: ", ताकि कोई भी जांच सके कि यह वही करता है जो यह पेज कहता है.",
      },
      onDevice: {
        title: "आपके डिवाइस पर क्या सेव होता है",
        lead: "PitMaster सब कुछ आपके ब्राउज़र के स्टोरेज में रखता है:",
        li1: "गेम्स: खिलाड़ियों के नाम, बाय-इन, कैश-आउट, रीबाय, नॉकआउट, सीटें, पेआउट, डील, गेम लॉग और नोट्स.",
        li2: "आपके चिप सेट और टेम्पलेट्स.",
        li3: "खिलाड़ियों के लिए सेव किए गए Venmo, Cash App और PayPal के नाम.",
        li4: "आपकी सेटिंग्स.",
        p1: "यह सब कुछ सेव होने से पहले AES-256-GCM से एन्क्रिप्ट किया जाता है. आपका ब्राउज़र पहली बार खोलते ही रैंडम कुंजी बना लेता है और उसे इस तरह रखता है कि कोई भी स्क्रिप्ट, हमारी भी नहीं, उसे पढ़ नहीं सकती; उसका इस्तेमाल सिर्फ इसी ब्राउज़र में आपका डेटा लॉक-अनलॉक करने के लिए होता है. बिना एन्क्रिप्शन के सिर्फ थीम और reduced motion सेटिंग सेव होती है (पेज को इनकी ज़रूरत ड्रॉ होने से पहले ही पड़ती है), और अगर पासकोड लगा है तो कितनी बार गलत कोशिश हुई. इनमें से कुछ भी आपके या आपकी गेम्स के बारे में कुछ नहीं बताता.",
        p2: "आपका ब्राउज़र देखे गए पेजों का अपना इतिहास रखता है. PitMaster गेम के नाम इससे दूर रखता है: किसी गेम का टैब बस “Cash Game” या “Tournament” कहलाता है. टीवी के पते में कोड ज़रूर होता है, ताकि रीलोड के बाद टीवी उसी गेम को फिर से पकड़ सके.",
        p3: "ब्राउज़र PitMaster की अपनी फाइलों (ऐप खुद, उसके आइकन और पेजों का ले-आउट) की एक कॉपी भी रखता है, ताकि साइट बिना इंटरनेट के भी खुल सके. ये फाइलें सबके लिए एक जैसी होती हैं और इनमें आपकी कोई गेम या सेटिंग नहीं होती.",
        p4: "बिना पासकोड के भी, यह आपकी गेम्स को उन लोगों से पढ़े जाने से बचाता है जो बिना कुंजी इस्तेमाल किए सेव डेटा देखने की कोशिश करते हैं, जैसे कोई डेवलपर टूल्स में साइट का स्टोरेज देख रहा हो. लेकिन यह उस किसी को नहीं रोकता जो इसी ब्राउज़र का इस्तेमाल कर सकता है: वह PitMaster खोलकर आपकी गेम्स देख सकता है. और चूंकि ब्राउज़र कुंजी को उसी डिवाइस पर रखता है, इसलिए जो कोई पूरा ब्राउज़र प्रोफाइल कॉपी कर ले, उसे डेटा के साथ कुंजी भी मिल जाती है. इस डिवाइस और इस पर मौजूद अपने अकाउंट को उतनी ही सावधानी से सुरक्षित रखें जितनी किसी और चीज़ को रखेंगे. अगर कोई पेज सुरक्षित (https) कनेक्शन पर नहीं है, तो ब्राउज़र एन्क्रिप्ट नहीं करेंगे, इसलिए PitMaster वहां बिना एन्क्रिप्शन के सेव करने के बजाय कुछ भी सेव नहीं करता.",
        p5pre: "पासकोड इस कमी को पूरा कर देता है (देखें",
        passcodeLinkText: "Settings, Passcode Lock",
        p5post:
          "). इसके बाद कुंजी को पासकोड से बनी एक और कुंजी (60 लाख राउंड वाले PBKDF2) से लॉक कर दिया जाता है, ताकि इसी ब्राउज़र का इस्तेमाल करने वाला या इसकी फाइलें कॉपी करने वाला कोई भी, इसके बिना कुछ भी न खोल पाए. छोटा पासकोड फिर भी कॉपी रखने वाले किसी व्यक्ति द्वारा अंदाज़ा लगाया जा सकता है, इसलिए जितना लंबा हो उतना बेहतर. आपके चुने गए समय तक कोई गतिविधि न होने पर PitMaster अपने आप लॉक हो जाता है, और उसके साथ हर टैब भी लॉक हो जाता है. टीवी स्क्रीन उसे दी गई गेम दिखाना जारी रखती हैं, कुछ भी बदल नहीं सकतीं, और कभी कुंजी नहीं रखतीं. हम कभी पासकोड नहीं देखते और खो जाने पर उसे वापस नहीं ला सकते: उसके बिना, आगे बढ़ने का इकलौता रास्ता ब्राउज़र में सेव सब कुछ मिटाना ही है.",
        p6pre: "आपका डेटा तब तक रहता है जब तक आप उसे खुद न मिटाएं (",
        exportImportLinkText: "Settings, Export & Import",
        p6mid:
          "में जाकर, फिर Delete Everything दबाकर), इस साइट का डेटा ब्राउज़र से साफ न करें, या कोई प्राइवेट विंडो बंद न करें. साइट का डेटा साफ करने से कुंजी भी मिट जाती है, और उसके बिना यहां सेव कुछ भी दोबारा नहीं पढ़ा जा सकता, न आपके द्वारा न किसी और के द्वारा. हर ब्राउज़र और डिवाइस अपनी अलग कॉपी रखता है, यही वजह है कि एक्सपोर्ट का विकल्प मौजूद है.",
      },
      exports: {
        title: "एक्सपोर्ट फाइलें",
        p1: "एक्सपोर्ट आपके ब्राउज़र के अंदर बनता है और आपकी चुनी हुई जगह पर सेव होता है. यह कभी हमारे पास से नहीं गुज़रता. इसमें ऊपर बताई गई हर चीज़ होती है, खिलाड़ियों के नाम और पे लिंक भी शामिल हैं.",
        p2: "आप पूरे एक्सपोर्ट को कम से कम 8 अक्षरों वाले पासवर्ड से लॉक कर सकते हैं. इसके बाद यह पासवर्ड से बनी एक कुंजी (60 लाख राउंड वाले PBKDF2) के तहत AES-256-GCM से एन्क्रिप्ट हो जाता है, और बिना पासवर्ड के सिर्फ फाइल का प्रकार और तारीख ही पढ़ी जा सकती है. पासवर्ड जितना लंबा होगा, उसे अंदाज़ा लगाना उतना ही मुश्किल होगा. हम कभी पासवर्ड नहीं देखते और खो जाने पर उसे वापस नहीं ला सकते. बिना पासवर्ड वाली फाइल, जैसे किसी दूसरे डिवाइस पर ले जाई गई कोई एक गेम, उसे किसी के पास भी होने पर पढ़ा जा सकता है, और यही किसी डाउनलोड या कॉपी की गई स्प्रेडशीट या रीकैप पर भी लागू होता है. इन्हें ऐसी जगह रखें जिस पर आपको भरोसा है, और सिर्फ उन्हीं लोगों के साथ शेयर करें जिन्हें इन्हें देखना चाहिए.",
      },
      tv: {
        title: "टीवी कोड",
        p1: "एक ही कंप्यूटर पर मौजूद टीवी विंडो गेम को सीधे डीलर स्क्रीन से लेती है. आपके डिवाइस से कुछ भी बाहर नहीं जाता.",
        p2: "जब आप किसी दूसरे डिवाइस पर गेम दिखाने के लिए Go Live दबाते हैं, तो:",
        li1: "आपका ब्राउज़र आठ अक्षरों वाला एक कोड बनाता है, और उससे दो चीज़ें: एक ऐसी ID जिसके नाम पर हमारा सर्वर गेम को फाइल करता है, और एक कुंजी जो इसे लॉक करती है. दोनों ही उस कोड के एक धीमे, वन-वे हैश (PBKDF2) से आती हैं, और कोड खुद कभी हमें नहीं भेजा जाता.",
        li2: "जब भी गेम में बदलाव होता है, आपका ब्राउज़र उस कुंजी (AES-256-GCM) से एक कॉपी एन्क्रिप्ट करके भेज देता है. इस कॉपी में गेम और उसकी डिस्प्ले सेटिंग्स (जैसे करेंसी, क्लॉक फॉर्मेट और टीवी का वॉल्यूम) होती हैं, लेकिन गेम लॉग, आपकी दूसरी गेम्स, चिप सेट, टेम्पलेट्स या पे लिंक नहीं होते.",
        li3: "हमारा सर्वर सिर्फ लॉक की हुई कॉपी, ID, और सिर्फ आपके ब्राउज़र के पास मौजूद एक अलग write key का वन-वे हैश (SHA-256) रखता है, ताकि सिर्फ आप ही उसे बदल या मिटा सकें. सर्वर के पास इस कॉपी को अनलॉक करने का कोई तरीका नहीं है.",
        li4: "जिस स्क्रीन को कोड दिया गया है, वह वही ID और कुंजी बना लेती है, कॉपी लाकर उसे अनलॉक कर लेती है. टीवी लिंक कोड को “#” के बाद रखते हैं, जो पते का वह हिस्सा है जिसे ब्राउज़र कभी सर्वर तक नहीं भेजते.",
        li5: "कॉपी तब मिट जाती है जब आप Stop Sharing दबाते हैं या गेम को डिलीट करते हैं, या आखिरी अपडेट के दो दिन बाद अपने आप. Stop Sharing के बाद, बिना किसी गेम वाला एक खाली रिकॉर्ड उस कोड को उन दो दिनों तक दोबारा इस्तेमाल होने से रोके रखता है.",
        p3: "जिसके पास भी वह कोड है, या जो उसका अंदाज़ा लगा लेता है, वह शेयर किए जाने के दौरान गेम देख सकता है, इसलिए उसमें ऐसी कोई भी चीज़ न रखें जो आप पूरी मेज़ को नहीं दिखाना चाहते. इसमें फ़ोन भी शामिल हैं: टीवी और डीलर स्क्रीन लिंक को QR कोड के रूप में दिखाते हैं, जो डिवाइस पर ही बनता है, और फ़ोन को वही कॉपी मिलती है जो टीवी को। मुझे ढूंढें उसी कॉपी में फ़ोन पर ही खोजता है, और उसमें लिखा कुछ भी न सहेजा जाता है, न भेजा जाता है।",
      },
      protected: {
        title: "यह कैसे सुरक्षित रखा जाता है",
        li1: "साइट और टीवी कोड सर्वर, दोनों एन्क्रिप्टेड कनेक्शन (HTTPS) पर काम करते हैं, और ब्राउज़र को इससे कमज़ोर किसी भी चीज़ का इस्तेमाल न करने के लिए कहते हैं.",
        li2: "साइट कोई थर्ड-पार्टी कोड लोड नहीं करती: कोई विज्ञापन, एनालिटिक्स, ट्रैकर या बाहरी फॉन्ट नहीं. एक सख्त कंटेंट सिक्योरिटी पॉलिसी पेज को हमारे अलावा किसी और स्क्रिप्ट को चलाने या हमारे अलावा किसी और सर्वर से बात करने से रोकती है.",
        li3: "जैसा ऊपर बताया गया, आपका डेटा आपके डिवाइस पर, हमारे सर्वर पर और पासवर्ड-लॉक्ड एक्सपोर्ट में एन्क्रिप्टेड रहता है.",
        li4: "टीवी कोड का अंदाज़ा लगाने की कोशिश करने वालों को धीमा करने के लिए, टीवी कोड सर्वर हर IP एड्रेस के रिक्वेस्ट एक मिनट के हिसाब से गिनता है. ये गिनतियां सिर्फ मेमोरी में रहती हैं और कभी सेव या लॉग नहीं होतीं.",
        li5: "आप जो फाइलें इंपोर्ट करते हैं उन्हें सेव करने से पहले जांचा जाता है, और जो बिल्कुल किसी PitMaster एक्सपोर्ट जैसी नहीं दिखती, उसे पूरी तरह अस्वीकार कर दिया जाता है.",
        p1: "कोई भी सिस्टम पूरी तरह सुरक्षित नहीं होता, और PitMaster एक साइड प्रोजेक्ट है, न कि कोई ऑडिट किया गया सिक्योरिटी प्रोडक्ट. इसमें ऐसी कोई भी चीज़ न रखें जिसे खोना या किसी और के देख लेना आपको बर्दाश्त न हो.",
      },
      phones: {
        title: "खिलाड़ियों के फ़ोन",
        p1: "लायर्स डाइस में फ़ोन को कप बनाने पर, हर खिलाड़ी का फ़ोन उसका कप होता है. होस्ट की स्क्रीन हर खिलाड़ी को उसकी अपनी सीट का कोड दिखाती है, और जिस कुंजी से फ़ोन उस सीट पर लिख सकता है, वह उस फ़ोन और होस्ट की स्क्रीन के सिवा कहीं नहीं जाती.",
        li1: "फ़ोन क्या भेजता है: पहले राउंड के अपने अंकों का एक हैश (जिससे कुछ पता नहीं चलता), फिर जब किसी बोली को चुनौती दी जाती है, तब खुद अंक. दोनों फ़ोन पर ही गेम की कुंजी से लॉक किए जाते हैं, बिल्कुल टीवी कॉपी की तरह.",
        li2: "सर्वर क्या देख सकता है: गेम की ID, हर सीट की ID, हर सीट की कुंजी का एक SHA-256, और एन्क्रिप्ट किया हुआ डेटा. उसके पास कभी किसी सीट की कुंजी, किसी खिलाड़ी का नाम या किसी के पासे नहीं होते.",
        li3: "होस्ट की स्क्रीन क्या देख सकती है: सिर्फ वही जो कोई फ़ोन पहले ही दिखा चुका है. होस्ट के अपने अंक हर पासे का आधा हिस्सा हैं, और फ़ोन के आधे हिस्से के बिना उनका कोई काम नहीं.",
        li4: "फ़ोन राउंड के अपने अंक लॉक करके रखता है, एक ऐसी कुंजी से जो फ़ोन पर ही बनती है और जिसे कोई स्क्रिप्ट पढ़ नहीं सकती, इसलिए पेज रीलोड करने पर भी कप नहीं खोता. कुछ भी सादे टेक्स्ट में नहीं रखा जाता.",
        p2: "लाइव की बाकी हर चीज़ की तरह, ये मेलबॉक्स तब मिट जाते हैं जब होस्ट शेयर करना बंद करता है, या आखिरी अपडेट के दो दिन बाद.",
      },
      host: {
        title: "हमारी होस्टिंग",
        p1pre:
          "साइट और टीवी कोड सर्वर, दोनों Cloudflare पर चलते हैं. पेज पहुंचाने और हमलों को रोकने के लिए, Cloudflare हर रिक्वेस्ट की तकनीकी जानकारी, जैसे IP एड्रेस और ब्राउज़र का प्रकार,",
        linkText: "अपनी खुद की गोपनीयता नीति",
        p1post: "के तहत संभालता है. हम कोई एनालिटिक्स, विज्ञापन या ट्रैकिंग कुकी नहीं जोड़ते, आप क्या करते हैं यह लॉग नहीं करते, और आपके बारे में कुछ भी बेचते या शेयर नहीं करते.",
      },
      other: {
        title: "अन्य सेवाएं",
        li1: "पे लिंक Venmo, Cash App या PayPal को एक रकम और गेम के नाम के साथ पहले से भरकर खोलते हैं. वहां जो कुछ भी होता है वह सिर्फ आपके और उनके बीच होता है.",
        li2: "अनाउंसर सिर्फ आपके डिवाइस में पहले से मौजूद आवाज़ों का इस्तेमाल करता है, इसलिए वह जो कुछ पढ़ता है वह कभी डिवाइस से बाहर नहीं जाता. जहां ब्राउज़र सिर्फ ऑनलाइन आवाज़ें देता है, वहां अनाउंसर चुप रहता है.",
        li3: "दूसरी साइट्स के लिंक उन साइट्स की अपनी नीतियों का पालन करते हैं.",
      },
      choices: {
        title: "आपके विकल्प",
        li1pre: "यहां से कभी भी सब कुछ मिटाएं:",
        li1post: "या फिर अपने ब्राउज़र में इस साइट का डेटा साफ करके.",
        li2: "किसी भी समय किसी टीवी कोड को शेयर करना बंद करें, और हमारे सर्वर पर मौजूद कॉपी तुरंत मिट जाएगी.",
        li3: "चूंकि हम आपकी पहचान बताने वाली कोई भी चीज़ नहीं रखते, इसलिए हमारे पास आपके अनुरोध पर देखने, ठीक करने, सौंपने या मिटाने के लिए कुछ है ही नहीं. सब कुछ पहले से ही आपके हाथ में है.",
      },
      children: {
        title: "बच्चे",
        p1: "PitMaster बड़ों के लिए बनाया गया है. यह बच्चों के लिए नहीं है, और हम किसी भी उम्र के किसी भी व्यक्ति से जानबूझकर जानकारी इकट्ठा नहीं करते.",
      },
      changes: { p1: "अगर यह नीति बदलती है, तो नया वर्शन यहीं आएगा और ऊपर की तारीख भी उसी के साथ बदल जाएगी." },
      contact: { p1pre: "गोपनीयता को लेकर कोई सवाल है? Wyzie LLC तक यहां पहुंचें:" },
    },
    terms: {
      intro: {
        pre: "ये शर्तें आपके और Wyzie LLC (“हम”) के बीच एक समझौता हैं, जो PitMaster को यहां पब्लिश करती है:",
        post: "PitMaster का इस्तेमाल करने का मतलब है कि आप इन शर्तों से सहमत हैं. अगर नहीं हैं, तो कृपया इसका इस्तेमाल न करें.",
      },
      what: {
        title: "PitMaster क्या है",
        p1: "PitMaster एक मुफ्त, ओपन सोर्स साइड प्रोजेक्ट है, जिसे पूरी तरह एक ही व्यक्ति ने बनाया है और जिसे Wyzie LLC पब्लिश करती है, ताकि कोई भी इसे अपनी पोकर गेम्स के लिए, किसी भी आकार में, इस्तेमाल कर सके. यह चिप का हिसाब, ब्लाइंड क्लॉक, बाय-इन, रेक, पेआउट, सेटल-अप और टीवी डिस्प्ले संभालता है. यह रिकॉर्ड रखता है और गणना करता है. यह कोई दांव नहीं लेता, पैसे नहीं रखता या नहीं भेजता, और खुद कोई गेम नहीं चलाता, और यह कोई गैंबलिंग सेवा नहीं है. इसके साथ कोई सपोर्ट, कोई गारंटी और यह वादा नहीं आता कि यह हमेशा मौजूद रहेगा.",
      },
      yourChoice: {
        title: "इसे कैसे इस्तेमाल करना है, यह आप पर निर्भर है",
        p1: "PitMaster का इस्तेमाल करना है या नहीं, और कैसे करना है, यह आपकी अपनी पसंद है, और इस पसंद और इससे निकलने वाली हर चीज़ के लिए आप ही पूरी तरह ज़िम्मेदार हैं: जो गेम्स आप चलाते हैं, जो नियम, स्टेक और फीस आप तय करते हैं, जो पैसा हाथ बदलता है, जो जानकारी आप दर्ज करते हैं, और जो कुछ भी आप शेयर करते हैं या स्क्रीन पर डालते हैं. हम किसी भी गेम की निगरानी, जांच या मंज़ूरी नहीं देते, और PitMaster जो कुछ भी दिखाता है वह कानूनी, वित्तीय या टैक्स सलाह नहीं है.",
      },
      legalGame: {
        title: "एक कानूनी गेम चलाना",
        p1: "पोकर से जुड़े कानून जगह-जगह काफी अलग होते हैं. कुछ जगहों पर लाइसेंस वाले स्थानों के बाहर रियल-मनी पोकर की इजाज़त नहीं है, और कई जगहों पर लाइसेंस वाले ऑपरेटर के अलावा किसी और को रेक, सीट फीस या किसी भी तरह का कट लेने की मनाही है. यह सुनिश्चित करना आपकी ज़िम्मेदारी है कि PitMaster से चलाई गई कोई भी गेम, और उसमें इस्तेमाल की गई हर सेटिंग, आपके यहां कानूनी हो, आपके पास इसके लिए ज़रूरी कोई भी लाइसेंस हो, इससे जुड़ा कोई भी टैक्स सही तरीके से दिखाया और चुकाया गया हो, और मेज़ पर मौजूद हर कोई इसके लिए उम्र में पूरा हो.",
        p2: "PitMaster किसी भी गेमिंग रेगुलेटर से प्रमाणित या मंज़ूर नहीं है. अगर आप कोई लाइसेंस वाला या कमर्शियल स्थान चलाते हैं, तो यह आप पर निर्भर है कि आपके नियम इसे इजाज़त देते हैं या नहीं, और यह आपके लिए ज़रूरी किसी भी रिकॉर्ड की जगह नहीं ले सकता.",
      },
      data: {
        title: "आपका डेटा",
        p1: "आप जो कुछ भी दर्ज करते हैं वह आपके ब्राउज़र में सेव होता है, एन्क्रिप्टेड (देखें",
        p2: "). यह आपका है, और इसे सुरक्षित रखना भी आपकी ज़िम्मेदारी है. ब्राउज़र साफ करने, डिवाइस खोने या बदलने, ब्राउज़र में किसी दिक्कत या किसी बग से यह मिट सकता है या पढ़ने लायक नहीं रह सकता, और इसे वापस लाने के लिए हमारे पास कोई कॉपी नहीं होती.",
        p3: "अक्सर एक्सपोर्ट करें, और अपने एक्सपोर्ट किसी सुरक्षित जगह पर रखें. अगर आप किसी एक्सपोर्ट को पासवर्ड से लॉक करते हैं और पासवर्ड भूल जाते हैं, तो वह फाइल नहीं खुल पाएगी, न आपसे और न ही हमसे.",
      },
      math: {
        title: "गणना जांच लें",
        p1: "पेआउट, रेक, सेटल-अप राशि, डील कैलकुलेशन और ब्लाइंड स्ट्रक्चर पूरी ईमानदारी से निकाले जाते हैं, लेकिन ये गलत हो सकते हैं, या आपकी गेम के लिए सही न हों. पैसे हाथ बदलने से पहले जो भी मायने रखता है उसे जांच लें. मेज़ पर होने वाले मतभेद मेज़ पर ही सुलझाने होते हैं.",
      },
      fair: {
        title: "इसे सही तरीके से इस्तेमाल करना",
        p1: "PitMaster या इसके टीवी कोड सर्वर का गलत इस्तेमाल न करें: इसे ओवरलोड न करें, दूसरों के कोड का अंदाज़ा लगाने या इकट्ठा करने की कोशिश न करें, इसकी सुरक्षा को दरकिनार न करें, इसे कानून तोड़ने के लिए इस्तेमाल न करें, या पोकर गेम्स के अलावा कुछ भी इसमें सेव न करें. सिर्फ वही जानकारी दर्ज करें जिसे शेयर करने का आपको अधिकार है. हम इन नियमों को तोड़ने वाले इस्तेमाल को सीमित या ब्लॉक कर सकते हैं.",
      },
      code: {
        title: "कोड",
        p1pre: "PitMaster का कोड यहां सार्वजनिक रूप से मौजूद है:",
        p1mid: "यह",
        p1post:
          "के तहत है: आप इसे पढ़ने, कॉपी करने, बदलने और उस लाइसेंस की शर्तों पर अपनी कॉपी चलाने के लिए स्वतंत्र हैं. यह लाइसेंस सिर्फ कोड को कवर करता है; ये शर्तें pitmaster.cc पर PitMaster के इस्तेमाल को कवर करती हैं. कोई और व्यक्ति जो कॉपी चलाता है वह उसकी अपनी है, हमारी नहीं: ये शर्तें और हमारी गोपनीयता नीति उस पर लागू नहीं होतीं, और हम उसके लिए ज़िम्मेदार नहीं हैं. यह लाइसेंस PitMaster नाम को शामिल नहीं करता, इसलिए अगर आप अपनी कॉपी पब्लिश करते हैं, तो उसे अपना अलग नाम दें ताकि कोई इसे इसी वाले से न समझ बैठे.",
      },
      trademarks: {
        title: "नाम और ट्रेडमार्क",
        p1: "बिल्ट-इन चिप सेट्स के नाम उन असली प्रोडक्ट्स के नाम पर रखे गए हैं जिनसे वे मेल खाते हैं, जैसे DA VINCI, KardShark, Playzaic और Casino Supply जैसे बनाने वाले, और पे लिंक Venmo, Cash App और PayPal के नाम इस्तेमाल करते हैं. ये सभी नाम अपने-अपने मालिकों के हैं. PitMaster इनमें से किसी से भी जुड़ा हुआ नहीं है और न ही इनमें से किसी ने इसे मंज़ूर किया है.",
      },
      warranty: {
        title: "कोई वारंटी नहीं",
        p1: "PitMaster “जैसा है” और “जितना उपलब्ध है” वैसा ही दिया जाता है, बिना किसी तरह की वारंटी के, चाहे वह स्पष्ट हो या अनुमानित, जिसमें मर्चेंटेबिलिटी, किसी खास मकसद के लिए उपयुक्तता, सटीकता, सुरक्षा और नॉन-इन्फ्रिंजमेंट शामिल हैं. हम यह वादा नहीं करते कि यह सही, सुरक्षित, बिना रुकावट या बग-रहित रहेगा, या आपका डेटा सुरक्षित रहेगा या वापस लाया जा सकेगा. हम बिना किसी सूचना के PitMaster को कभी भी बदल, सीमित या बंद कर सकते हैं, और यह किसी गेम के बीच में भी खराब हो सकता है या ऑफलाइन हो सकता है.",
      },
      liability: {
        title: "देयता की सीमा",
        p1: "कानून जितनी छूट देता है उतनी हद तक, न तो Wyzie LLC और न ही PitMaster बनाने वाला व्यक्ति किसी भी अप्रत्यक्ष, आकस्मिक, विशेष, परिणामी या दंडात्मक नुकसान के लिए, या PitMaster के इस्तेमाल से उपजे या उससे जुड़े डेटा नुकसान, पैसे के नुकसान, मुनाफे के नुकसान, जुए में हुए नुकसान, कानूनी परेशानी या खिलाड़ियों के बीच विवादों के लिए ज़िम्मेदार है, भले ही हमें बताया गया हो कि ये संभव हैं. जहां देयता को पूरी तरह हटाया नहीं जा सकता, वहां सभी दावों के लिए मिलाकर आपके प्रति हमारी कुल देयता $50 तक सीमित है. कुछ जगहें इन सीमाओं की इजाज़त नहीं देतीं, इसलिए इनमें से कुछ आप पर लागू न हों.",
      },
      indemnity: {
        title: "क्षतिपूर्ति",
        p1: "अगर कोई व्यक्ति आपके PitMaster इस्तेमाल करने के तरीके, इससे चलाई गई किसी गेम, या इन शर्तों या कानून को तोड़ने की वजह से Wyzie LLC या PitMaster बनाने वाले व्यक्ति के खिलाफ कोई दावा करता है, तो आप कानून की इजाज़त की सीमा तक, इससे होने वाले नुकसान और खर्चों, जिसमें उचित कानूनी फीस भी शामिल है, को वहन करने के लिए सहमत होते हैं.",
      },
      rest: {
        title: "बाकी शर्तें",
        p1pre: "अगर इन शर्तों का कोई हिस्सा लागू नहीं किया जा सकता, तो बाकी हिस्सा फिर भी लागू रहता है. किसी हिस्से को लागू न करना उसे छोड़ देना नहीं है. ये शर्तें और",
        p1post: "आपके और हमारे बीच PitMaster को लेकर पूरा समझौता हैं.",
      },
      changes: { p1: "हम इन शर्तों को अपडेट कर सकते हैं. ऊपर की तारीख बताती है कि इन्हें आखिरी बार कब बदला गया, और किसी बदलाव के बाद PitMaster का इस्तेमाल जारी रखने का मतलब है कि आप नया वर्शन स्वीकार करते हैं." },
      contact: { p1pre: "इन शर्तों को लेकर कोई सवाल है? Wyzie LLC तक यहां पहुंचें:" },
    },
  },
  es: {
    lastUpdated: "Última actualización: 26 de septiembre de 2026",
    changesTitle: "Cambios",
    contactTitle: "Contacto",
    nav: { privacyPolicy: "Política de Privacidad", termsOfUse: "Términos de Uso" },
    links: { privacy: "Privacidad", export: "Exportar" },
    help: {
      sub: "Cómo funciona PitMaster, qué puede hacer y dónde viven tus partidas.",
      onThisPage: "En esta página",
      nav: {
        start: "Primeros Pasos",
        dealing: "Cómo Llevar una Partida",
        tv: "La Televisión",
        calculator: "Calculadora",
        keys: "Atajos",
        data: "Tus Datos",
      },
      start: { welcomeBack: "Mostrar de Nuevo la Bienvenida en la Página de Inicio" },
      dealing: {
        cashTitle: "Partidas de Efectivo",
        cashBody:
          "Define las ciegas y el rango de entrada, y luego añade a los jugadores a medida que se sientan. Las recompras y los retiros son un toque cada uno, y la banca lleva la cuenta de cada ficha en la mesa. Cuando la partida termina, Settle Up calcula quién le paga a quién, con enlaces de Venmo, Cash App y PayPal si los quieres. Los juegos extra también tienen su propio interruptor: bomb pots con temporizador o cuando se pidan, el juego del 7-2 y un premio a la mano más alta que la casa paga en la liquidación. Los gastos compartidos reparten lo que se compró para la partida, y Quién Debe a Quién marca los pagos y lleva la cuenta en la página de Jugadores. Una lista de espera lleva la cuenta de quién sigue para sentarse, y la TV avisa cuando se libera un asiento.",
        tourneyTitle: "Torneos",
        tourneyBody:
          "Elige cuánto tiempo quieres jugar y PitMaster arma la estructura de ciegas a medida: pilas iniciales, descansos, antes, recompras, add-ons y bounties. Elimina jugadores a medida que caen y los pagos, la pila promedio y el balanceo de mesas se ajustan solos. En la mesa final, la calculadora de reparto divide el pozo por número de fichas o por ICM. Los bounties pueden ser fijos, progresivos (PKO) o sobres misteriosos, y Empezar desde trae configuraciones listas como Turbo, Deepstack y Sit & Go. Cuando hay un ganador, Saldar Cuentas muestra lo que la casa le paga a cada jugador. Los satélites dan plazas para otra partida, y en los shootouts cada mesa juega hasta un ganador antes de la mesa final. Un cuadro mano a mano se juega uno contra uno: sortea el cuadro, haz clic en el ganador de cada duelo y la TV muestra quién juega contra quién.",
        paletteTitle: "Haz Cualquier Cosa Escribiendo Su Nombre",
        paletteBody1: "Pulsa",
        paletteBody2:
          "en cualquier lugar para abrir Comandos. Escribe lo que quieras, como “siguiente nivel”, “eliminar a mike” o “nuevo torneo”, y pulsa Enter. En cada mesa se cometen errores:",
        paletteBody3: "deshace el último cambio en la pantalla del dealer.",
        everyTitle: "Cada Partida Es Distinta",
        everyBody1: "El rake, la comisión de la casa, los bounties, las recompras, los asientos, los repartos y los enlaces de pago tienen cada uno su propio interruptor en",
        everyBody2: "así que una partida tranquila y un torneo de cuarenta jugadores solo usan lo que necesitan. Las ligas puntúan una temporada de partidas, con la clasificación en Jugadores y en la TV. Otros Juegos de Póker añade Omaha, stud, razz, draw y juegos mixtos como HORSE, un juego por nivel, y dealer's choice en cash, con los límites de cada juego en la TV. No es solo póker: el Perudo lleva los dados de cada jugador, calcula quién pierde uno según el dudo, y liquida un bote de entrada o dinero por dado perdido. Los juegos de vidas (31, Screw Your Neighbor, Knock-Out Whist, Ship, Captain and Crew) cuentan vidas hasta un ganador, y los juegos de bote (In-Between, Guts, Bourré, Pass the Pigs) llevan un bote con límite, y ambos se liquidan como todo lo demás.",
      },
      tv: {
        body1a: "Hay dos formas de poner la partida en una pantalla grande. Si tienes un portátil conectado al televisor, pulsa",
        openWindow: "Abrir Ventana de TV",
        body1b: "en la pantalla del dealer y arrastra la ventana al televisor. Para cualquier otra pantalla (el navegador de un smart TV, una tablet, el teléfono de alguien), pulsa",
        goLive: "Salir en Vivo",
        body1c: "y luego abre",
        body1d: "en esa pantalla y escribe el código de 8 caracteres.",
        body2a: "La televisión muestra el reloj, las ciegas, los pagos y los mensajes que le envías a la mesa, y se mantiene al día por sí sola. No puede cambiar nada, y una partida en vivo va cifrada de extremo a extremo en su camino hasta allí. Pulsa",
        body2b: "en la televisión para pantalla completa y",
        body2c: "para el sonido. Los teléfonos también pueden seguirla: escanea el código QR de la TV o de la pantalla del dealer y escribe tu nombre en Búscame para ver tu asiento y cómo vas.",
      },
      calculator: {
        press: "Pulsa",
        onAnyPage: "en cualquier página.",
        onAnyPageOr: "en cualquier página, o",
        openNow: "ábrela ahora",
        floats: "Flota sobre la página, así que puedes arrastrarla para quitarla de en medio, reducirla hasta que solo quede el resultado, o activar Ghost para ver a través de ella y hacer clic en la página de abajo.",
        li1a: "Escribe operaciones directamente desde el teclado.",
        li1b: "da el resultado,",
        li1c: "borra, y",
        li1d: "quita el último dígito.",
        li2a: "Hace × y ÷ antes que + y −, como en papel, y los paréntesis también funcionan:",
        li3a: "El porcentaje funciona como en una caja registradora:",
        li3b: "es 220.",
        li4a: "Escribe",
        li4b: "o",
        li4c: "después de un número para miles o millones, así una pila de fichas se escribe rápido:",
        li5a: "Después de pulsar",
        li5b: "el resultado también se muestra en fichas de tu set, con las menos posibles para lograrlo, así sabes qué entregar.",
        li6a: "Cada resultado queda en el historial. Haz clic en una operación para cambiarla, o en su resultado para usarlo.",
        li6b: "y",
        li6c: "recorren los resultados,",
        addUp: "Sumar Todo",
        li6d: "los suma todos (por ejemplo, los retiros de una partida), y",
        li6e: "Copiar",
        into: "Insertar",
        li7: "pone el resultado en la última casilla numérica en la que estabas, como una entrada o una cantidad de fichas.",
        li8: "Nada de lo que escribas en ella se guarda jamás.",
        potKey: "Pot Limit",
        li9: "calcula la subida más grande en un juego pot limit. Toma el bote de la pantalla, luego lo que hay que igualar, y te muestra hasta cuánto puede subir cualquiera. Tócalo para usarlo.",
      },
      keys: { note: "Ninguno de estos atajos se activa mientras escribes en una casilla. El atajo de Comandos se puede cambiar en" },
      data: {
        q1: "¿Dónde Se Guardan Mis Partidas?",
        a1a: "En este navegador, en este dispositivo, cifradas. No hay cuentas, así que nadie más tiene una copia, nosotros incluidos. Añade un código de acceso en",
        a1b: "y nada se abre sin él.",
        q2: "¿Funciona Sin Conexión?",
        a2: "Sí. Una vez abierto en un navegador, PitMaster carga y funciona ahí sin conexión, la ventana de TV incluida. Solo Salir en Vivo necesita conexión, en ambas pantallas.",
        q3: "¿Cómo Paso a Otro Dispositivo?",
        a3a: "todo a un archivo, y luego impórtalo en el otro dispositivo. Una sola partida también puede moverse:",
        moveDevice: "Mover a Otro Dispositivo",
        a3b: "está en su pantalla de dealer, y ahí sigue funcionando, código de TV incluido.",
        q4: "¿Qué Pasa Si Borro los Datos del Navegador?",
        a4: "Borrar los datos de este sitio elimina para siempre lo guardado aquí, así que exporta antes si quieres conservarlo.",
        q5: "¿Cuesta Algo?",
        a5a: "No. PitMaster es gratis, sin anuncios ni rastreo, y su código es de código abierto en",
        a5b: "tiene los detalles.",
        q6: "¿Algo No Funciona Bien?",
        a6a: "Escríbenos en",
        a6b: "o abre un issue en",
        a6c: "Por favor no nos envíes nada de tus partidas; nunca lo necesitamos.",
      },
    },
    privacy: {
      intro: {
        pre: "PitMaster (",
        post:
          ") es un proyecto paralelo gratuito y de código abierto, creado enteramente por una sola persona y publicado por Wyzie LLC (“nosotros”). Está hecho para que tus partidas nunca tengan que salir de tu dispositivo, y esta página dice exactamente cuándo algo sí lo hace.",
      },
      short: {
        title: "La Versión Corta",
        li1: "No hay cuentas ni una base de datos de tus partidas. No sabemos quién eres.",
        li2: "Todo lo que ingresas se guarda en este navegador, en este dispositivo, cifrado con una clave que solo tiene este navegador. Añade un código de acceso y nada se abre sin él. No podemos ver nada de eso, y no podemos recuperarlo si se pierde.",
        li3: "La única excepción: mientras una partida tiene un código de TV, una copia cifrada de ella queda en nuestro servidor para que otras pantallas puedan mostrarla. Está bloqueada con una clave hecha a partir del código de TV, que nunca vemos, y se elimina cuando dejas de compartir, o dos días después de su último cambio.",
        li4: "Sin anuncios, sin analítica, sin cookies de rastreo y sin scripts de terceros.",
        li5pre: "El código de PitMaster es público en",
        li5post: "así que cualquiera puede comprobar que hace lo que dice esta página.",
      },
      onDevice: {
        title: "Qué Se Guarda en Tu Dispositivo",
        lead: "PitMaster guarda todo en el almacenamiento de tu navegador:",
        li1: "Partidas: nombres de jugadores, entradas, retiros, recompras, eliminaciones, asientos, pagos, repartos, el registro de la partida y notas.",
        li2: "Tus sets de fichas y plantillas.",
        li3: "Los nombres de Venmo, Cash App y PayPal que guardas para los jugadores.",
        li4: "Tus ajustes.",
        p1: "Todo esto se cifra con AES-256-GCM antes de guardarse. Tu navegador crea la clave al azar en tu primera visita y la guarda de forma que ningún script, ni siquiera los nuestros, pueda leerla; solo puede usarse, en este navegador, para bloquear y desbloquear tus datos. Lo único que se guarda sin cifrar es el tema y el movimiento reducido (la página los necesita antes de dibujarse) y, con un código de acceso, cuántos intentos incorrectos se hicieron. Nada de esto dice nada sobre ti ni sobre tus partidas.",
        p2: "Tu navegador guarda su propio historial de páginas visitadas. PitMaster mantiene los nombres de las partidas fuera de ahí: la pestaña de una partida simplemente se llama Partida de Efectivo o Torneo. La dirección de una TV sí contiene su código, para que la TV pueda retomar la partida tras recargar.",
        p3: "El navegador también guarda una copia de los propios archivos de PitMaster (la aplicación en sí, sus iconos y el diseño de las páginas) para que el sitio se abra sin conexión. Son iguales para todos y no contienen ninguna de tus partidas ni ajustes.",
        p4: "Sin un código de acceso, esto hace que tus partidas sean ilegibles para cualquier cosa que examine los datos guardados sin usar la clave, como alguien que revise el almacenamiento del sitio en las herramientas de desarrollador. No detiene a quien pueda usar este navegador: puede abrir PitMaster y ver tus partidas. Y como el navegador guarda la clave en el mismo dispositivo, quien copie todo el perfil del navegador obtiene la clave junto con los datos. Protege el dispositivo y tu cuenta en él como harías con cualquier otra cosa. Si una página no está en una conexión segura (https), los navegadores no cifrarán, así que PitMaster no guarda nada ahí en vez de guardarlo sin cifrar.",
        p5pre: "Un código de acceso cierra esa brecha (",
        passcodeLinkText: "Ajustes, Bloqueo por Código",
        p5post:
          "). La clave queda entonces bloqueada por otra clave hecha a partir del código de acceso (PBKDF2 con 600.000 rondas), así que nada guardado puede abrirse sin él, ni siquiera por alguien que use este navegador o copie sus archivos. Un código corto aún puede ser adivinado por alguien que tenga una copia, así que cuanto más largo, mejor. PitMaster se bloquea solo tras el tiempo que elijas sin actividad, y cada pestaña se bloquea con él. Las pantallas de TV siguen mostrando la partida que se les dio, no pueden cambiar nada, y nunca guardan la clave. Nunca vemos el código de acceso y no podemos recuperar uno perdido: sin él, el único camino es borrar todo lo guardado en el navegador.",
        p6pre: "Tus datos se quedan hasta que los borras (",
        exportImportLinkText: "Ajustes, Exportar e Importar",
        p6mid:
          ", y luego Borrar Todo), borras los datos de este sitio en tu navegador, o cierras una ventana privada. Borrar los datos del sitio también borra la clave, y sin ella nada de lo guardado aquí puede volver a leerse, ni por ti ni por nadie. Cada navegador y dispositivo guarda su propia copia separada, por eso existen las exportaciones.",
      },
      exports: {
        title: "Archivos de Exportación",
        p1: "Una exportación se genera dentro de tu navegador y se guarda donde tú elijas. Nunca pasa por nosotros. Contiene todo lo listado arriba, incluidos nombres de jugadores y enlaces de pago.",
        p2: "Puedes proteger una exportación completa con una contraseña de al menos 8 caracteres. Entonces se cifra con AES-256-GCM bajo una clave hecha a partir de la contraseña (PBKDF2 con 600.000 rondas), y sin ella solo se puede leer el tipo de archivo y la fecha. Cuanto más larga la contraseña, más difícil de adivinar. Nunca vemos la contraseña y no podemos recuperar una perdida. Un archivo sin contraseña, como una sola partida movida a otro dispositivo, puede ser leído por cualquiera que lo tenga, igual que una hoja de cálculo o un resumen que descargues o copies. Guárdalos en un lugar de confianza y compártelos solo con quienes deban verlos.",
      },
      tv: {
        title: "Códigos de TV",
        p1: "Una ventana de TV en el mismo ordenador obtiene la partida directamente de la pantalla del dealer. Nada sale de tu dispositivo.",
        p2: "Cuando pulsas Salir en Vivo para mostrar una partida en otro dispositivo:",
        li1: "Tu navegador crea un código de ocho caracteres, y a partir de él, dos cosas: un ID con el que nuestro servidor archiva la partida, y una clave que la bloquea. Ambos vienen de un hash lento y de una sola vía del código (PBKDF2), y el código en sí nunca se nos envía.",
        li2: "Cada vez que la partida cambia, tu navegador cifra una copia con esa clave (AES-256-GCM) y la envía. La copia tiene la partida y sus ajustes de pantalla (como la moneda, el formato del reloj y el volumen de la TV), pero no el registro de la partida, tus otras partidas, sets de fichas, plantillas ni enlaces de pago.",
        li3: "Nuestro servidor guarda la copia bloqueada, el ID y un hash de una sola vía (SHA-256) de una clave de escritura separada que solo tiene tu navegador, así que solo tú puedes cambiarla o borrarla. No tiene forma de desbloquear la copia.",
        li4: "Una pantalla a la que se le da el código genera el mismo ID y clave, obtiene la copia y la desbloquea. Los enlaces de TV llevan el código después de un “#”, una parte de la dirección que los navegadores nunca envían a un servidor.",
        li5: "La copia se borra en cuanto pulsas Dejar de Compartir o borras la partida, o automáticamente dos días después de su última actualización. Tras Dejar de Compartir, un registro vacío sin ninguna partida evita que el código se reutilice hasta que pasen esos dos días.",
        p3: "Cualquiera que tenga el código, o lo adivine, puede ver la partida mientras se comparte, así que no incluyas nada que no le mostrarías a toda la mesa. Eso incluye los teléfonos: la TV y la pantalla del dealer muestran el enlace como código QR, generado en el propio dispositivo, y un teléfono recibe la misma copia que la TV. Búscame busca en esa copia dentro del teléfono, y lo que escribas ahí no se guarda ni se envía.",
      },
      protected: {
        title: "Cómo Está Protegido",
        li1: "El sitio y el servidor de códigos de TV se sirven mediante conexiones cifradas (HTTPS), y le dicen a los navegadores que nunca usen algo menos seguro.",
        li2: "El sitio no carga código de terceros: sin anuncios, analítica, rastreadores ni fuentes externas. Una política estricta de seguridad de contenido impide que la página ejecute cualquier otro script o hable con cualquier servidor que no sea el nuestro.",
        li3: "Tus datos se cifran en tu dispositivo, en nuestro servidor y en las exportaciones protegidas con contraseña, como se describió arriba.",
        li4: "Para frenar a quien intente adivinar códigos de TV, el servidor de códigos de TV cuenta las peticiones de cada dirección IP minuto a minuto. Los conteos se guardan solo en memoria y nunca se almacenan ni registran.",
        li5: "Los archivos que importas se revisan antes de guardar nada, y uno que no se parezca exactamente a una exportación de PitMaster es rechazado por completo.",
        p1: "Ningún sistema es perfectamente seguro, y PitMaster es un proyecto paralelo, no un producto de seguridad auditado. No pongas en él nada que no puedas soportar perder o que alguien más lo vea.",
      },
      phones: {
        title: "Teléfonos de los Jugadores",
        p1: "Con teléfonos como cubiletes en el Perudo, el teléfono de cada jugador es su cubilete. La pantalla del anfitrión muestra a cada jugador un código para su propio asiento, y la clave que permite a un teléfono escribir en ese asiento nunca va a ningún sitio más que a ese teléfono y a la pantalla del anfitrión.",
        li1: "Lo que envía un teléfono: primero un hash de sus números de la ronda (que no revela nada) y luego, cuando se canta sobre una apuesta, los números en sí. Ambos van bloqueados con la clave de la partida en el propio teléfono, como una copia de la TV.",
        li2: "Lo que puede ver el servidor: el ID de la partida, el ID de cada asiento, un SHA-256 de la clave de cada asiento y texto cifrado. Nunca tiene la clave de un asiento, el nombre de un jugador ni los dados de nadie.",
        li3: "Lo que puede ver la pantalla del anfitrión: solo lo que un teléfono ya ha mostrado. Los números propios del anfitrión son la mitad de cada dado, y no sirven de nada sin la mitad del teléfono.",
        li4: "Un teléfono guarda bloqueados sus propios números de la ronda, con una clave creada en el teléfono que ningún script puede leer, así que recargar la página no hace perder el cubilete. Nada se guarda en texto plano.",
        p2: "Como todo lo que está en vivo, los buzones se borran cuando el anfitrión deja de compartir, o dos días después de la última actualización.",
      },
      host: {
        title: "Nuestro Proveedor de Alojamiento",
        p1pre:
          "El sitio y el servidor de códigos de TV funcionan sobre Cloudflare. Para entregar las páginas y bloquear ataques, Cloudflare maneja detalles técnicos de cada solicitud, como direcciones IP y tipo de navegador, según",
        linkText: "su propia política de privacidad",
        p1post: "No añadimos analítica, anuncios ni cookies de rastreo, no registramos lo que haces, y no vendemos ni compartimos nada sobre ti.",
      },
      other: {
        title: "Otros Servicios",
        li1: "Los enlaces de pago abren Venmo, Cash App o PayPal con un monto y el nombre de la partida ya completados. Lo que pase ahí es entre tú y ellos.",
        li2: "El locutor solo usa las voces integradas en tu dispositivo, así que lo que lee en voz alta nunca sale de él. Donde un navegador solo ofrece voces en línea, el locutor se queda callado.",
        li3: "Los enlaces a otros sitios siguen las propias políticas de esos sitios.",
      },
      choices: {
        title: "Tus Opciones",
        li1pre: "Borra todo en cualquier momento desde",
        li1post: ", o borrando los datos de este sitio en tu navegador.",
        li2: "Deja de compartir un código de TV en cualquier momento, y la copia en nuestro servidor se elimina de inmediato.",
        li3: "Como no guardamos nada que te identifique, no hay nada que podamos buscar, corregir, entregar o borrar a pedido. Todo está ya en tus manos.",
      },
      children: {
        title: "Menores",
        p1: "PitMaster está pensado para adultos. No es para menores, y no recopilamos información a sabiendas de nadie, sea cual sea su edad.",
      },
      changes: { p1: "Si esta política cambia, la nueva versión se publica aquí y la fecha de arriba cambia con ella." },
      contact: { p1pre: "¿Preguntas sobre privacidad? Contacta a Wyzie LLC en" },
    },
    terms: {
      intro: {
        pre: "Estos términos son un acuerdo entre tú y Wyzie LLC (“nosotros”), que publica PitMaster en",
        post: "Al usar PitMaster los aceptas. Si no estás de acuerdo, por favor no lo uses.",
      },
      what: {
        title: "Qué Es PitMaster",
        p1: "PitMaster es un proyecto paralelo gratuito y de código abierto, creado enteramente por una sola persona y publicado por Wyzie LLC, para que cualquiera lo use en sus propias partidas de póquer, de cualquier tamaño. Maneja el cálculo de fichas, relojes de ciegas, entradas, rake, pagos, saldos entre jugadores y una pantalla de TV. Lleva registros y hace aritmética. No toma apuestas, no retiene ni mueve dinero, ni organiza ninguna partida en sí, y no es un servicio de apuestas. No viene con soporte, ni garantías, ni la promesa de que seguirá existiendo.",
      },
      yourChoice: {
        title: "Cómo Lo Uses Depende de Ti",
        p1: "Si usas PitMaster y cómo lo haces es tu decisión, y eres el único responsable de esa decisión y de todo lo que se derive de ella: las partidas que llevas, las reglas, apuestas y comisiones que fijas, el dinero que cambia de manos, la información que ingresas, y cualquier cosa que compartas o pongas en una pantalla. No supervisamos, revisamos ni aprobamos ninguna partida, y nada de lo que muestra PitMaster es asesoría legal, financiera o fiscal.",
      },
      legalGame: {
        title: "Llevar una Partida Legal",
        p1: "Las leyes sobre el póquer varían mucho de un lugar a otro. Algunos lugares no permiten el póquer con dinero real fuera de salas con licencia, y muchos prohíben que nadie que no sea un operador con licencia cobre un rake, una tarifa por asiento o cualquier otro corte. Eres responsable de asegurarte de que cualquier partida que lleves con PitMaster, y cada ajuste que uses en ella, sea legal donde juegas, de que tengas cualquier licencia que se requiera, de que se declaren y paguen los impuestos que correspondan, y de que todos en la mesa tengan la edad suficiente para estar ahí.",
        p2: "PitMaster no está certificado ni aprobado por ningún regulador de juegos. Si diriges una sala con licencia o comercial, depende de ti si tus reglas lo permiten, y no reemplaza ningún registro que estés obligado a llevar.",
      },
      data: {
        title: "Tus Datos",
        p1: "Todo lo que ingresas se guarda en tu navegador, cifrado (ver",
        p2: "). Es tuyo, y mantenerlo a salvo también lo es. Borrar tu navegador, perder o cambiar de dispositivo, un problema del navegador o un error pueden borrarlo o hacerlo ilegible, y no tenemos copia para restaurarlo.",
        p3: "a menudo, y guarda tus exportaciones en un lugar seguro. Si bloqueas una exportación con una contraseña y la pierdes, el archivo no podrá abrirse, ni por ti ni por nosotros.",
      },
      math: {
        title: "Comprueba los Cálculos",
        p1: "Los pagos, el rake, los montos de los saldos entre jugadores, los cálculos de reparto y las estructuras de ciegas se calculan de buena fe, pero pueden estar equivocados, o no ser correctos para tu partida. Comprueba todo lo que importe antes de que el dinero cambie de manos. Los desacuerdos en la mesa son cosa de la mesa.",
      },
      fair: {
        title: "Usarlo con Justicia",
        p1: "No hagas mal uso de PitMaster ni de su servidor de códigos de TV: no lo sobrecargues, no intentes adivinar ni recopilar los códigos de otras personas, no evadas su seguridad, no lo uses para infringir la ley, ni guardes en él nada que no sean partidas de póquer. Ingresa solo información que tengas derecho a compartir. Podemos limitar o bloquear el uso que infrinja estas reglas.",
      },
      code: {
        title: "El Código",
        p1pre: "El código de PitMaster es público en",
        p1mid: "bajo la",
        p1post:
          ": eres libre de leerlo, copiarlo, cambiarlo y ejecutar tu propia copia, según los términos de esa licencia. La licencia cubre el código; estos términos cubren el uso de PitMaster en pitmaster.cc. Una copia que otra persona ejecute es suya, no nuestra: estos términos y nuestra Política de Privacidad no se aplican a ella, y no somos responsables de ella. La licencia no incluye el nombre PitMaster, así que si publicas tu propia copia, dale un nombre propio para que nadie la confunda con esta.",
      },
      trademarks: {
        title: "Nombres y Marcas",
        p1: "Los sets de fichas integrados llevan el nombre de los productos reales a los que corresponden, de fabricantes como DA VINCI, KardShark, Playzaic y Casino Supply, y los enlaces de pago usan los nombres de Venmo, Cash App y PayPal. Esos nombres pertenecen a sus dueños. PitMaster no está afiliado a ninguno de ellos ni respaldado por ellos.",
      },
      warranty: {
        title: "Sin Garantía",
        p1: "PitMaster se ofrece “tal cual” y “según disponibilidad”, sin garantías de ningún tipo, expresas o implícitas, incluidas comerciabilidad, idoneidad para un propósito particular, exactitud, seguridad y no infracción. No prometemos que sea correcto, seguro, ininterrumpido o esté libre de errores, ni que tus datos se mantengan a salvo o puedan recuperarse. Podemos cambiar, limitar o finalizar PitMaster en cualquier momento sin previo aviso, y puede fallar o quedar fuera de línea, incluso en medio de una partida.",
      },
      liability: {
        title: "Limitación de Responsabilidad",
        p1: "En la máxima medida que la ley permita, ni Wyzie LLC ni la persona que creó PitMaster son responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, ni por datos perdidos, dinero perdido, ganancias perdidas, pérdidas de apuestas, problemas legales o disputas entre jugadores, que surjan de o estén relacionados con tu uso de PitMaster, aun si se nos advirtió que eran posibles. Cuando la responsabilidad no pueda excluirse, nuestra responsabilidad total contigo por todos los reclamos juntos se limita a $50. Algunos lugares no permiten estos límites, así que alguno de ellos podría no aplicarte.",
      },
      indemnity: {
        title: "Indemnización",
        p1: "Si alguien presenta un reclamo contra Wyzie LLC o la persona que creó PitMaster por cómo lo usaste, una partida que llevaste con él, o por infringir estos términos o la ley, aceptas cubrir las pérdidas y costos resultantes, incluidos honorarios legales razonables, en la medida en que la ley lo permita.",
      },
      rest: {
        title: "Lo Demás",
        p1pre: "Si alguna parte de estos términos no puede hacerse cumplir, el resto sigue aplicando. No hacer cumplir una parte no significa renunciar a ella. Estos términos y la",
        p1post: "son el acuerdo completo entre tú y nosotros sobre PitMaster.",
      },
      changes: { p1: "Podemos actualizar estos términos. La fecha de arriba indica cuándo cambiaron por última vez, y usar PitMaster después de un cambio significa que aceptas la nueva versión." },
      contact: { p1pre: "¿Preguntas sobre estos términos? Contacta a Wyzie LLC en" },
    },
  },
  fr: {
    lastUpdated: "Dernière mise à jour le 26 septembre 2026",
    changesTitle: "Modifications",
    contactTitle: "Contact",
    nav: { privacyPolicy: "Politique de Confidentialité", termsOfUse: "Conditions d'Utilisation" },
    links: { privacy: "Confidentialité", export: "Exporter" },
    help: {
      sub: "Comment fonctionne PitMaster, ce qu'il peut faire, et où vivent vos parties.",
      onThisPage: "Sur cette page",
      nav: {
        start: "Premiers Pas",
        dealing: "Mener une Partie",
        tv: "La Télévision",
        calculator: "Calculatrice",
        keys: "Raccourcis",
        data: "Vos Données",
      },
      start: { welcomeBack: "Réafficher l'Accueil sur la Page d'Accueil" },
      dealing: {
        cashTitle: "Parties en Cash",
        cashBody:
          "Réglez les blinds et la fourchette de buy-in, puis ajoutez les joueurs à mesure qu'ils s'installent. Recaves et cash-outs se font en un geste, et la banque compte chaque jeton sur la table. Une fois la partie terminée, Settle Up calcule qui doit payer qui, avec des liens Venmo, Cash App et PayPal si vous le souhaitez. Les jeux annexes ont aussi leur interrupteur : bomb pots sur minuteur ou à la demande, le jeu du 7-2, et un prix pour la meilleure main que la maison paie au règlement. Les frais partagés répartissent ce qui a été acheté pour la partie, et Qui Doit Quoi coche les paiements et tient les comptes sur la page Joueurs. Une liste d'attente suit qui est le prochain à s'asseoir, et la TV annonce quand une place se libère.",
        tourneyTitle: "Tournois",
        tourneyBody:
          "Choisissez la durée de jeu souhaitée et PitMaster construit la structure de blinds en conséquence : tapis de départ, pauses, antes, recaves, add-ons et bounties. Éliminez les joueurs au fil de l'eau, et les gains, le tapis moyen et l'équilibrage des tables suivent automatiquement. À la table finale, le calculateur de deal répartit le prize pool selon le nombre de jetons ou l'ICM. Les bounties peuvent être fixes, progressifs (PKO) ou en enveloppes mystère, et Partir de propose des formats tout prêts comme Turbo, Deepstack et Sit & Go. Dès qu'il y a un gagnant, Régler les Comptes montre ce que la maison verse à chaque joueur. Les satellites offrent des places pour une autre partie, et en shootout chaque table joue jusqu'à un gagnant avant la table finale. Un tableau en tête-à-tête se joue en un contre un : tirez le tableau, cliquez sur le gagnant de chaque match, et la TV affiche qui joue contre qui.",
        paletteTitle: "Tout Faire en Tapant un Nom",
        paletteBody1: "Appuyez sur",
        paletteBody2:
          "n'importe où pour ouvrir Commandes. Tapez ce que vous voulez, comme « niveau suivant », « éliminer mike » ou « nouveau tournoi », puis appuyez sur Entrée. Des erreurs arrivent à chaque table :",
        paletteBody3: "annule le dernier changement effectué sur l'écran du croupier.",
        everyTitle: "Chaque Partie Est Différente",
        everyBody1: "Le rake, la commission de la maison, les bounties, les recaves, les places, les deals et les liens de paiement ont chacun leur propre interrupteur dans",
        everyBody2: "de sorte qu'une petite partie tranquille et un tournoi de quarante joueurs n'utilisent chacun que ce dont ils ont besoin. Les ligues comptent les points d'une saison de parties, avec le classement dans Joueurs et sur la TV. Autres Jeux de Poker ajoute l'Omaha, le stud, le razz, le draw et les jeux mixtes comme le HORSE, un jeu par niveau, et le dealer's choice en cash, avec les limites de chaque jeu sur la TV. Ce n'est pas que du poker : le Perudo suit les dés de chaque joueur, calcule qui en perd un selon l'annonce, et règle un pot d'entrée ou de l'argent par dé perdu. Les jeux à vies (31, Screw Your Neighbor, Knock-Out Whist, Ship, Captain and Crew) décomptent les vies jusqu'au gagnant, et les jeux de pot (In-Between, Guts, Bourré, Pass the Pigs) suivent un pot avec une limite, et les deux se règlent comme le reste.",
      },
      tv: {
        body1a: "Il y a deux façons d'afficher la partie sur un grand écran. Sur un portable branché à la télévision, appuyez sur",
        openWindow: "Ouvrir la Fenêtre TV",
        body1b: "sur l'écran du croupier et faites glisser la fenêtre sur la télévision. Pour tout autre écran (le navigateur d'une smart TV, une tablette, le téléphone de quelqu'un), appuyez sur",
        goLive: "Diffuser en Direct",
        body1c: "puis ouvrez",
        body1d: "sur cet écran et tapez le code à 8 caractères.",
        body2a: "La télévision affiche l'horloge, les blinds, les gains et les messages que vous envoyez à la table, et se met à jour toute seule. Elle ne peut rien modifier, et une partie en direct est chiffrée de bout en bout sur son chemin jusque-là. Appuyez sur",
        body2b: "sur la télévision pour le plein écran et sur",
        body2c: "pour le son. Les téléphones peuvent suivre aussi : scannez le QR code sur la TV ou l'écran du croupier, puis tapez votre nom dans Me Trouver pour voir votre place et où vous en êtes.",
      },
      calculator: {
        press: "Appuyez sur",
        onAnyPage: "sur n'importe quelle page.",
        onAnyPageOr: "sur n'importe quelle page, ou",
        openNow: "ouvrez-la maintenant",
        floats: "Elle flotte au-dessus de la page, vous pouvez donc la faire glisser hors du chemin, la réduire pour ne garder que le résultat, ou activer Ghost pour voir à travers et cliquer sur la page en dessous.",
        li1a: "Tapez les calculs directement au clavier.",
        li1b: "donne le résultat,",
        li1c: "efface, et",
        li1d: "supprime le dernier chiffre.",
        li2a: "Elle fait × et ÷ avant + et −, comme sur papier, et les parenthèses fonctionnent aussi :",
        li3a: "Le pourcentage fonctionne comme une caisse enregistreuse :",
        li3b: "donne 220.",
        li4a: "Tapez",
        li4b: "ou",
        li4c: "après un nombre pour les milliers ou les millions, pour taper un tapis rapidement :",
        li5a: "Après avoir appuyé sur",
        li5b: "le résultat s'affiche aussi en jetons de votre set, avec le moins de jetons possible, pour savoir quoi rendre.",
        li6a: "Chaque résultat va dans l'historique. Cliquez sur un calcul pour le modifier, ou sur son résultat pour l'utiliser.",
        li6b: "et",
        li6c: "font défiler les résultats,",
        addUp: "Additionner",
        li6d: "les additionne tous (les cash-outs d'une partie, par exemple), et",
        li6e: "Copier",
        into: "Insérer",
        li7: "place le résultat dans la dernière case numérique où vous étiez, comme un buy-in ou un nombre de jetons.",
        li8: "Rien de ce qui y est tapé n'est jamais enregistré.",
        potKey: "Pot Limit",
        li9: "calcule la plus grosse relance possible dans une partie pot limit. Prenez le pot affiché, puis le montant à suivre, et il indique jusqu'où on peut relancer au maximum. Touchez ce nombre pour l'utiliser.",
      },
      keys: { note: "Aucun de ces raccourcis ne se déclenche pendant que vous tapez dans une case. Le raccourci des Commandes peut être changé dans" },
      data: {
        q1: "Où Mes Parties Sont-Elles Enregistrées ?",
        a1a: "Dans ce navigateur, sur cet appareil, chiffrées. Il n'y a pas de comptes, donc personne d'autre n'en a de copie, nous y compris. Ajoutez un code d'accès dans",
        a1b: "et rien ne s'ouvre sans lui.",
        q2: "Fonctionne-t-Il Hors Ligne ?",
        a2: "Oui. Une fois ouvert dans un navigateur, PitMaster s'y charge et fonctionne sans connexion, fenêtre TV comprise. Seul Diffuser en Direct en a besoin, sur les deux écrans.",
        q3: "Comment Passer à un Autre Appareil ?",
        a3a: "tout dans un fichier, puis importez-le sur l'autre appareil. Une seule partie peut aussi être déplacée :",
        moveDevice: "Déplacer vers un Autre Appareil",
        a3b: "se trouve sur son écran de croupier, et elle continue là-bas, code TV compris.",
        q4: "Que Se Passe-t-Il Si J'Efface les Données de Mon Navigateur ?",
        a4: "Effacer les données de ce site supprime définitivement ce qui est enregistré ici, donc exportez d'abord si vous voulez le garder.",
        q5: "Est-Ce Que Ça Coûte Quelque Chose ?",
        a5a: "Non. PitMaster est gratuit, sans publicité ni pistage, et son code est open source sur",
        a5b: "en a le détail.",
        q6: "Quelque Chose Ne Va Pas ?",
        a6a: "Contactez-nous sur",
        a6b: "ou ouvrez un issue sur",
        a6c: "Merci de ne rien nous envoyer de vos parties ; nous n'en avons jamais besoin.",
      },
    },
    privacy: {
      intro: {
        pre: "PitMaster (",
        post:
          ") est un projet parallèle gratuit et open source, entièrement conçu par une seule personne et publié par Wyzie LLC (« nous »). Il est conçu pour que vos parties n'aient jamais à quitter votre appareil, et cette page indique précisément quand quelque chose le fait.",
      },
      short: {
        title: "La Version Courte",
        li1: "Il n'y a ni comptes ni base de données de vos parties. Nous ne savons pas qui vous êtes.",
        li2: "Tout ce que vous saisissez est enregistré dans ce navigateur, sur cet appareil, chiffré avec une clé que seul ce navigateur détient. Ajoutez un code d'accès et rien ne s'ouvre sans lui. Nous ne pouvons rien en voir, et nous ne pouvons rien récupérer si c'est perdu.",
        li3: "La seule exception : tant qu'une partie a un code TV, une copie chiffrée de celle-ci se trouve sur notre serveur pour que d'autres écrans puissent l'afficher. Elle est verrouillée par une clé issue du code TV, que nous ne voyons jamais, et elle est supprimée quand vous arrêtez le partage, ou deux jours après sa dernière modification.",
        li4: "Pas de publicité, pas d'analytique, pas de cookies de pistage et pas de scripts tiers.",
        li5pre: "Le code de PitMaster est public sur",
        li5post: "afin que chacun puisse vérifier qu'il fait bien ce que dit cette page.",
      },
      onDevice: {
        title: "Ce Qui Est Enregistré Sur Votre Appareil",
        lead: "PitMaster conserve tout dans le stockage de votre navigateur :",
        li1: "Parties : noms des joueurs, buy-ins, cash-outs, recaves, éliminations, places, gains, deals, le journal de la partie et les notes.",
        li2: "Vos sets de jetons et modèles.",
        li3: "Les noms Venmo, Cash App et PayPal que vous enregistrez pour les joueurs.",
        li4: "Vos réglages.",
        p1: "Tout cela est chiffré avec AES-256-GCM avant d'être stocké. Votre navigateur génère la clé au hasard lors de votre première visite et la conserve de façon qu'aucun script, y compris les nôtres, ne puisse la lire ; elle ne peut servir, dans ce navigateur, qu'à verrouiller et déverrouiller vos données. Les seules choses stockées non chiffrées sont le thème et la réduction des animations (la page en a besoin avant même de s'afficher) et, avec un code d'accès, le nombre d'essais erronés effectués. Rien de tout cela n'en dit quoi que ce soit sur vous ou vos parties.",
        p2: "Votre navigateur conserve son propre historique des pages visitées. PitMaster en tient les noms de parties à l'écart : l'onglet d'une partie s'appelle simplement Partie Cash ou Tournoi. L'adresse d'une TV contient bien son code, pour que la TV puisse retrouver la partie après un rechargement.",
        p3: "Le navigateur conserve aussi une copie des propres fichiers de PitMaster (l'application elle-même, ses icônes et la mise en page) pour que le site s'ouvre sans connexion. Ils sont identiques pour tout le monde et ne contiennent aucune de vos parties ni de vos réglages.",
        p4: "Sans code d'accès, cela rend vos parties illisibles pour quiconque examine les données enregistrées sans utiliser la clé, comme quelqu'un qui parcourrait le stockage du site dans les outils de développement. Cela n'arrête pas quelqu'un qui peut utiliser ce navigateur : il peut ouvrir PitMaster et voir vos parties. Et comme le navigateur conserve la clé sur le même appareil, quiconque copie tout le profil du navigateur obtient la clé avec les données. Protégez l'appareil et votre compte dessus comme vous le feriez pour toute autre chose. Si une page n'est pas sur une connexion sécurisée (https), les navigateurs ne chiffreront pas, donc PitMaster n'y enregistre rien du tout plutôt que de l'enregistrer sans chiffrement.",
        p5pre: "Un code d'accès comble cette faille (voir",
        passcodeLinkText: "Réglages, Verrouillage par Code",
        p5post:
          "). La clé est alors verrouillée par une clé issue du code d'accès (PBKDF2 avec 600 000 tours), si bien que rien d'enregistré ne peut s'ouvrir sans lui, même par quelqu'un utilisant ce navigateur ou copiant ses fichiers. Un code court peut encore être deviné par quelqu'un qui en a une copie, donc plus il est long, mieux c'est. PitMaster se verrouille de lui-même après le délai d'inactivité que vous choisissez, et chaque onglet se verrouille avec lui. Les écrans TV continuent d'afficher la partie qui leur a été donnée, ne peuvent rien modifier, et ne détiennent jamais la clé. Nous ne voyons jamais le code d'accès et ne pouvons pas en récupérer un perdu : sans lui, la seule solution est de supprimer tout ce qui est enregistré dans le navigateur.",
        p6pre: "Vos données restent jusqu'à ce que vous les supprimiez (",
        exportImportLinkText: "Réglages, Exporter et Importer",
        p6mid:
          ", puis Tout Supprimer), que vous effaciez les données de ce site dans votre navigateur, ou que vous fermiez une fenêtre privée. Effacer les données du site supprime aussi la clé, et sans elle, plus rien d'enregistré ici ne peut être relu, ni par vous ni par personne. Chaque navigateur et appareil garde sa propre copie séparée, c'est pour cela que les exports existent.",
      },
      exports: {
        title: "Fichiers d'Export",
        p1: "Un export est créé à l'intérieur de votre navigateur et enregistré où vous le choisissez. Il ne passe jamais par nous. Il contient tout ce qui est listé ci-dessus, noms des joueurs et liens de paiement compris.",
        p2: "Vous pouvez verrouiller un export complet avec un mot de passe d'au moins 8 caractères. Il est alors chiffré avec AES-256-GCM sous une clé issue du mot de passe (PBKDF2 avec 600 000 tours), et seuls le type de fichier et la date restent lisibles sans lui. Plus le mot de passe est long, plus il est difficile à deviner. Nous ne voyons jamais le mot de passe et ne pouvons pas en récupérer un perdu. Un fichier sans mot de passe, comme une seule partie déplacée vers un autre appareil, peut être lu par quiconque le possède, tout comme un tableur ou un récapitulatif que vous téléchargez ou copiez. Gardez-les quelque part de confiance et ne les partagez qu'avec ceux qui doivent les voir.",
      },
      tv: {
        title: "Codes TV",
        p1: "Une fenêtre TV sur le même ordinateur récupère la partie directement depuis l'écran du croupier. Rien ne quitte votre appareil.",
        p2: "Quand vous appuyez sur Diffuser en Direct pour afficher une partie sur un autre appareil :",
        li1: "Votre navigateur crée un code à huit caractères, et à partir de lui deux choses : un identifiant sous lequel notre serveur classe la partie, et une clé qui la verrouille. Les deux proviennent d'un hachage lent et à sens unique du code (PBKDF2), et le code lui-même ne nous est jamais envoyé.",
        li2: "À chaque changement de la partie, votre navigateur chiffre une copie avec cette clé (AES-256-GCM) et l'envoie. La copie contient la partie et ses réglages d'affichage (comme la devise, le format de l'horloge et le volume de la TV), mais pas le journal de la partie, vos autres parties, sets de jetons, modèles ou liens de paiement.",
        li3: "Notre serveur stocke la copie verrouillée, l'identifiant et un hachage à sens unique (SHA-256) d'une clé d'écriture distincte que seul votre navigateur détient, si bien que vous seul pouvez la modifier ou la supprimer. Il n'a aucun moyen de déverrouiller la copie.",
        li4: "Un écran auquel on donne le code génère le même identifiant et la même clé, récupère la copie et la déverrouille. Les liens TV portent le code après un « # », une partie de l'adresse que les navigateurs n'envoient jamais à un serveur.",
        li5: "La copie est supprimée dès que vous appuyez sur Arrêter le Partage ou supprimez la partie, ou automatiquement deux jours après sa dernière mise à jour. Après Arrêter le Partage, un enregistrement vide sans aucune partie empêche le code d'être réutilisé pendant ces deux jours.",
        p3: "Quiconque a le code, ou le devine, peut voir la partie tant qu'elle est partagée, alors n'y laissez rien que vous ne montreriez pas à toute la table. Cela vaut aussi pour les téléphones : la TV et l'écran du croupier affichent le lien en QR code, généré sur l'appareil, et un téléphone reçoit la même copie que la TV. Me Trouver cherche dans cette copie sur le téléphone même, et rien de ce qui y est tapé n'est enregistré ni envoyé.",
      },
      protected: {
        title: "Comment C'Est Protégé",
        li1: "Le site et le serveur de codes TV sont servis via des connexions chiffrées (HTTPS), et indiquent aux navigateurs de ne jamais utiliser moins sécurisé.",
        li2: "Le site ne charge aucun code tiers : pas de publicité, d'analytique, de traqueurs ni de polices externes. Une politique de sécurité de contenu stricte empêche la page d'exécuter tout autre script ou de communiquer avec tout serveur autre que le nôtre.",
        li3: "Vos données sont chiffrées sur votre appareil, sur notre serveur et dans les exports protégés par mot de passe, comme décrit ci-dessus.",
        li4: "Pour ralentir quiconque essaie de deviner des codes TV, le serveur de codes TV compte les requêtes de chaque adresse IP minute par minute. Les compteurs restent uniquement en mémoire et ne sont jamais stockés ni journalisés.",
        li5: "Les fichiers que vous importez sont vérifiés avant tout enregistrement, et un fichier qui ne ressemble pas exactement à un export PitMaster est rejeté en bloc.",
        p1: "Aucun système n'est parfaitement sûr, et PitMaster est un projet parallèle, pas un produit de sécurité audité. N'y mettez rien que vous ne pourriez pas supporter de perdre ou de voir vu par quelqu'un d'autre.",
      },
      phones: {
        title: "Téléphones des Joueurs",
        p1: "Avec les téléphones en gobelets au Perudo, le téléphone de chaque joueur est son gobelet. L'écran de l'hôte montre à chaque joueur un code pour son propre siège, et la clé qui permet à un téléphone d'écrire sur ce siège ne va nulle part ailleurs que sur ce téléphone et l'écran de l'hôte.",
        li1: "Ce qu'envoie un téléphone : d'abord un hachage de ses nombres pour la manche (qui ne révèle rien), puis, quand une annonce est contestée, les nombres eux-mêmes. Les deux sont verrouillés avec la clé de la partie sur le téléphone, comme une copie TV.",
        li2: "Ce que le serveur peut voir : l'identifiant de la partie, celui de chaque siège, un SHA-256 de la clé de chaque siège, et du texte chiffré. Il n'a jamais la clé d'un siège, le nom d'un joueur ni les dés de qui que ce soit.",
        li3: "Ce que l'écran de l'hôte peut voir : uniquement ce qu'un téléphone a déjà montré. Les nombres de l'hôte forment la moitié de chaque dé, et ils ne servent à rien sans la moitié du téléphone.",
        li4: "Un téléphone garde ses propres nombres de la manche verrouillés, avec une clé créée sur le téléphone qu'aucun script ne peut lire, si bien qu'un rechargement ne fait pas perdre le gobelet. Rien n'est conservé en clair.",
        p2: "Comme tout ce qui est en direct, les boîtes aux lettres sont supprimées quand l'hôte arrête le partage, ou deux jours après la dernière mise à jour.",
      },
      host: {
        title: "Notre Hébergeur",
        p1pre:
          "Le site et le serveur de codes TV fonctionnent sur Cloudflare. Pour livrer les pages et bloquer les attaques, Cloudflare traite des détails techniques de chaque requête, comme les adresses IP et le type de navigateur, selon",
        linkText: "sa propre politique de confidentialité",
        p1post: "Nous n'ajoutons aucune analytique, publicité ou cookie de pistage, nous n'enregistrons pas ce que vous faites, et nous ne vendons ni ne partageons rien à votre sujet.",
      },
      other: {
        title: "Autres Services",
        li1: "Les liens de paiement ouvrent Venmo, Cash App ou PayPal avec un montant et le nom de la partie déjà remplis. Ce qui se passe ensuite est entre vous et eux.",
        li2: "L'annonceur n'utilise que les voix intégrées à votre appareil, donc ce qu'il lit à voix haute n'en sort jamais. Là où un navigateur ne propose que des voix en ligne, l'annonceur reste silencieux.",
        li3: "Les liens vers d'autres sites suivent les propres politiques de ces sites.",
      },
      choices: {
        title: "Vos Choix",
        li1pre: "Supprimez tout à tout moment depuis",
        li1post: ", ou en effaçant les données de ce site dans votre navigateur.",
        li2: "Arrêtez de partager un code TV à tout moment, et la copie sur notre serveur est supprimée immédiatement.",
        li3: "Comme nous ne détenons rien qui vous identifie, il n'y a rien que nous puissions rechercher, corriger, transmettre ou supprimer sur demande. Tout est déjà entre vos mains.",
      },
      children: {
        title: "Enfants",
        p1: "PitMaster est destiné aux adultes. Ce n'est pas pour les enfants, et nous ne collectons sciemment d'informations sur personne, quel que soit son âge.",
      },
      changes: { p1: "Si cette politique change, la nouvelle version est publiée ici et la date en haut change avec elle." },
      contact: { p1pre: "Des questions sur la confidentialité ? Contactez Wyzie LLC sur" },
    },
    terms: {
      intro: {
        pre: "Ces conditions sont un accord entre vous et Wyzie LLC (« nous »), qui publie PitMaster sur",
        post: "En utilisant PitMaster, vous les acceptez. Si vous n'êtes pas d'accord, merci de ne pas l'utiliser.",
      },
      what: {
        title: "Ce Qu'Est PitMaster",
        p1: "PitMaster est un projet parallèle gratuit et open source, entièrement conçu par une seule personne et publié par Wyzie LLC, destiné à quiconque veut l'utiliser pour ses propres parties de poker, quelle qu'en soit la taille. Il gère le calcul des jetons, les horloges de blinds, les buy-ins, le rake, les gains, les règlements entre joueurs et un affichage TV. Il tient des registres et fait des calculs. Il ne prend pas de paris, ne détient ni ne déplace d'argent, et ne fait tourner aucune partie lui-même, et ce n'est pas un service de jeux d'argent. Il ne vient avec aucun support, aucune garantie et aucune promesse qu'il continuera d'exister.",
      },
      yourChoice: {
        title: "Comment Vous l'Utilisez Ne Tient Qu'à Vous",
        p1: "Utiliser PitMaster ou non, et comment, est votre choix, et vous êtes seul responsable de ce choix et de tout ce qui en découle : les parties que vous menez, les règles, les mises et les frais que vous fixez, l'argent qui change de mains, les informations que vous saisissez, et tout ce que vous partagez ou affichez à l'écran. Nous ne supervisons, ne vérifions ni n'approuvons aucune partie, et rien de ce que montre PitMaster ne constitue un conseil juridique, financier ou fiscal.",
      },
      legalGame: {
        title: "Mener une Partie Légale",
        p1: "Les lois sur le poker varient beaucoup d'un endroit à l'autre. Certains endroits n'autorisent pas le poker en argent réel en dehors de salles agréées, et beaucoup interdisent à quiconque n'est pas un opérateur agréé de prélever un rake, un droit de table ou toute autre commission. Vous êtes responsable de vous assurer que toute partie que vous menez avec PitMaster, et chaque réglage que vous y utilisez, est légal là où vous jouez, que vous détenez toute licence requise, que les impôts éventuels sont déclarés et payés, et que tout le monde à la table a l'âge requis pour y être.",
        p2: "PitMaster n'est certifié ni approuvé par aucun régulateur de jeux. Si vous gérez une salle agréée ou commerciale, c'est à vous de voir si vos règles l'autorisent, et il ne remplace aucun registre que vous êtes tenu de conserver.",
      },
      data: {
        title: "Vos Données",
        p1: "Tout ce que vous saisissez est enregistré dans votre navigateur, chiffré (voir",
        p2: "). Elles sont à vous, et les garder en sécurité aussi. Effacer votre navigateur, perdre ou changer d'appareil, un problème de navigateur ou un bug peuvent les effacer ou les rendre illisibles, et nous n'avons aucune copie pour les restaurer.",
        p3: "souvent, et gardez vos exports en lieu sûr. Si vous verrouillez un export avec un mot de passe et le perdez, le fichier ne pourra être ouvert, ni par vous ni par nous.",
      },
      math: {
        title: "Vérifiez les Calculs",
        p1: "Les gains, le rake, les montants des règlements entre joueurs, les calculs de deal et les structures de blinds sont établis de bonne foi, mais ils peuvent être faux, ou inadaptés à votre partie. Vérifiez tout ce qui compte avant que l'argent ne change de mains. Les désaccords à la table sont à régler à la table.",
      },
      fair: {
        title: "L'Utiliser Loyalement",
        p1: "N'abusez pas de PitMaster ni de son serveur de codes TV : ne le surchargez pas, n'essayez pas de deviner ou de collecter les codes d'autres personnes, ne contournez pas sa sécurité, ne l'utilisez pas pour enfreindre la loi, et n'y stockez rien d'autre que des parties de poker. Ne saisissez que des informations que vous avez le droit de partager. Nous pouvons limiter ou bloquer un usage qui enfreint ces règles.",
      },
      code: {
        title: "Le Code",
        p1pre: "Le code de PitMaster est public sur",
        p1mid: "sous la",
        p1post:
          " : vous êtes libre de le lire, de le copier, de le modifier et de faire tourner votre propre copie, selon les termes de cette licence. La licence couvre le code ; ces conditions couvrent l'utilisation de PitMaster sur pitmaster.cc. Une copie que quelqu'un d'autre fait tourner lui appartient, pas à nous : ces conditions et notre Politique de Confidentialité ne s'y appliquent pas, et nous n'en sommes pas responsables. La licence n'inclut pas le nom PitMaster, donc si vous publiez votre propre copie, donnez-lui un nom bien à elle pour que personne ne la confonde avec celle-ci.",
      },
      trademarks: {
        title: "Noms et Marques",
        p1: "Les sets de jetons intégrés portent le nom des produits réels auxquels ils correspondent, de fabricants comme DA VINCI, KardShark, Playzaic et Casino Supply, et les liens de paiement portent les noms Venmo, Cash App et PayPal. Ces noms appartiennent à leurs propriétaires respectifs. PitMaster n'est affilié à aucun d'entre eux ni soutenu par eux.",
      },
      warranty: {
        title: "Aucune Garantie",
        p1: "PitMaster est fourni « tel quel » et « selon disponibilité », sans garantie d'aucune sorte, expresse ou implicite, y compris de qualité marchande, d'adéquation à un usage particulier, d'exactitude, de sécurité et de non-contrefaçon. Nous ne promettons pas qu'il sera exact, sûr, ininterrompu ou exempt de bugs, ni que vos données resteront en sécurité ou pourront être récupérées. Nous pouvons modifier, limiter ou arrêter PitMaster à tout moment sans préavis, et il peut se casser ou passer hors ligne, même en plein milieu d'une partie.",
      },
      liability: {
        title: "Limitation de Responsabilité",
        p1: "Dans toute la mesure permise par la loi, ni Wyzie LLC ni la personne qui a créé PitMaster ne sont responsables de dommages indirects, accessoires, spéciaux, consécutifs ou punitifs, ni de pertes de données, d'argent, de profits, de pertes de jeu, de problèmes juridiques ou de litiges entre joueurs, découlant de ou liés à votre utilisation de PitMaster, même si on nous a dit que c'était possible. Lorsque la responsabilité ne peut être exclue, notre responsabilité totale envers vous pour l'ensemble des réclamations est limitée à 50 $. Certains endroits n'autorisent pas ces limites, donc certaines d'entre elles pourraient ne pas s'appliquer à vous.",
      },
      indemnity: {
        title: "Indemnisation",
        p1: "Si quelqu'un présente une réclamation contre Wyzie LLC ou la personne qui a créé PitMaster à cause de la façon dont vous l'avez utilisé, d'une partie que vous avez menée avec lui, ou du fait que vous avez enfreint ces conditions ou la loi, vous acceptez de couvrir les pertes et coûts en résultant, y compris les honoraires d'avocat raisonnables, dans la mesure permise par la loi.",
      },
      rest: {
        title: "Le Reste",
        p1pre: "Si une partie de ces conditions ne peut être appliquée, le reste continue de s'appliquer. Ne pas faire respecter une partie ne revient pas à y renoncer. Ces conditions et la",
        p1post: "constituent l'accord complet entre vous et nous à propos de PitMaster.",
      },
      changes: { p1: "Nous pouvons mettre à jour ces conditions. La date en haut indique quand elles ont changé pour la dernière fois, et utiliser PitMaster après un changement signifie que vous acceptez la nouvelle version." },
      contact: { p1pre: "Des questions sur ces conditions ? Contactez Wyzie LLC sur" },
    },
  },
  ar: {
    lastUpdated: "آخر تحديث في 26 سبتمبر 2026",
    changesTitle: "التغييرات",
    contactTitle: "التواصل",
    nav: { privacyPolicy: "سياسة الخصوصية", termsOfUse: "شروط الاستخدام" },
    links: { privacy: "الخصوصية", export: "تصدير" },
    help: {
      sub: "كيف يعمل PitMaster، وما الذي يمكنه فعله، وأين تعيش بيانات ألعابك.",
      onThisPage: "في هذه الصفحة",
      nav: {
        start: "البداية",
        dealing: "إدارة اللعبة",
        tv: "شاشة التلفاز",
        calculator: "الآلة الحاسبة",
        keys: "الاختصارات",
        data: "بياناتك",
      },
      start: { welcomeBack: "إظهار رسالة الترحيب في الصفحة الرئيسية مرة أخرى" },
      dealing: {
        cashTitle: "ألعاب الكاش",
        cashBody:
          "حدد قيمة البلايند ونطاق الشراء، ثم أضف اللاعبين بمجرد جلوسهم. عمليات إعادة الشراء والتصفية تتم بنقرة واحدة لكل منها، ويحتفظ البنك بعدّ كل رقاقة على الطاولة. عند انتهاء اللعبة، تحسب Settle Up من يدفع لمن، مع روابط Venmo وCash App وPayPal إذا أردت ذلك. للألعاب الجانبية مفاتيحها أيضًا: بومب بوت بمؤقت أو عند الطلب، ولعبة 7-2، وجائزة لأعلى يد تدفعها الجهة المنظمة عند التسوية. تقسم التكاليف المشتركة ما اشتُري للعبة، ويعلّم «من يدين لمن» الدفعات ويحفظ الحساب في صفحة اللاعبين. تتابع قائمة الانتظار من التالي للجلوس، ويعلن التلفاز عندما يفرغ مقعد.",
        tourneyTitle: "البطولات",
        tourneyBody:
          "اختر المدة التي تريد اللعب خلالها، ويبني PitMaster هيكل البلايند المناسب: الرصيد الابتدائي، فترات الراحة، الأنتي، عمليات إعادة الشراء، الإضافات والمكافآت. أخرج اللاعبين المستبعدين أولاً بأول، وتتبع الجوائز ومتوسط الرصيد وتوازن الطاولات ذلك تلقائياً. عند الطاولة الأخيرة، توزّع حاسبة التقسيم الجائزة حسب عدد الرقائق أو ICM. يمكن أن تكون مكافآت الإقصاء ثابتة أو تصاعدية (PKO) أو أظرفًا غامضة، وفي «ابدأ من» إعدادات جاهزة مثل توربو ورصيد عميق وسيت آند غو. عند وجود فائز، تعرض تسوية الحسابات ما تدفعه الجهة المنظمة لكل لاعب. تمنح البطولات التأهيلية مقاعد في لعبة أخرى، وفي مواجهة الطاولات تلعب كل طاولة حتى فائز واحد قبل الطاولة النهائية. أما جدول المواجهات الفردية فيُلعب واحدًا لواحد: اسحب الجدول، وانقر على الفائز في كل مباراة، ويعرض التلفاز من يواجه من.",
        paletteTitle: "افعل أي شيء بكتابة اسمه",
        paletteBody1: "اضغط",
        paletteBody2:
          "في أي مكان لفتح الأوامر. اكتب ما تريده، مثل “المستوى التالي” أو “إخراج mike” أو “بطولة جديدة”، ثم اضغط Enter. تحدث الأخطاء على كل طاولة:",
        paletteBody3: "يتراجع عن آخر تغيير في شاشة الموزّع.",
        everyTitle: "كل لعبة مختلفة",
        everyBody1: "لكل من نسبة البيت والعمولة والمكافآت وإعادة الشراء والجلوس والتقسيم وروابط الدفع مفتاحه الخاص في",
        everyBody2: "بحيث تأخذ اللعبة الهادئة الصغيرة وبطولة الأربعين لاعباً كل منهما ما تحتاجه فقط. تحسب الدوريات نقاط موسم كامل من الألعاب، مع الترتيب في صفحة اللاعبين وعلى التلفاز. يضيف خيار ألعاب البوكر الأخرى أوماها والستاد والراز والدرو والألعاب المختلطة مثل HORSE، لعبة لكل مستوى، واختيار الموزّع في ألعاب الكاش، مع حدود كل لعبة على التلفاز. ليس البوكر وحده: تتابع لعبة نرد الكذّاب نرد كل لاعب، وتحسب من يخسر نردًا حسب التحدي، وتسوّي وعاء الاشتراك أو المال عن كل نرد يُخسر. تعدّ ألعاب الأرواح (31، Screw Your Neighbor، Knock-Out Whist، Ship, Captain and Crew) الأرواح حتى يبقى فائز، وتتابع ألعاب الوعاء (In-Between، Guts، Bourré، Pass the Pigs) وعاءً متجددًا بحد أقصى، وتُسوّى الاثنتان مثل كل شيء آخر.",
      },
      tv: {
        body1a: "هناك طريقتان لعرض اللعبة على شاشة كبيرة. على حاسوب محمول متصل بالتلفاز، اضغط",
        openWindow: "فتح نافذة التلفاز",
        body1b: "في شاشة الموزّع واسحب النافذة إلى شاشة التلفاز. لأي شاشة أخرى (متصفح تلفاز ذكي، جهاز لوحي، هاتف أحدهم)، اضغط",
        goLive: "بدء البث المباشر",
        body1c: "ثم افتح",
        body1d: "على تلك الشاشة واكتب الرمز المكون من 8 خانات.",
        body2a: "تعرض شاشة التلفاز الساعة والبلايند والجوائز والرسائل التي ترسلها للطاولة، وتبقى محدّثة من تلقائها. لا يمكنها تغيير أي شيء، وتُشفّر اللعبة المباشرة من طرف إلى طرف في طريقها إليها. اضغط",
        body2b: "على التلفاز لملء الشاشة و",
        body2c: "للصوت. يمكن للهواتف المتابعة أيضًا: امسح رمز QR على التلفاز أو شاشة الموزّع، ثم اكتب اسمك في «ابحث عني» لترى مقعدك وترتيبك.",
      },
      calculator: {
        press: "اضغط",
        onAnyPage: "في أي صفحة.",
        onAnyPageOr: "في أي صفحة، أو",
        openNow: "افتحها الآن",
        floats: "تطفو فوق الصفحة، فيمكنك سحبها بعيداً عن طريقك، أو تصغيرها لتظهر الإجابة فقط، أو تفعيل وضع الشبح لترى ما تحتها وتنقر على الصفحة الأسفل.",
        li1a: "اكتب العمليات الحسابية مباشرة من لوحة المفاتيح.",
        li1b: "يعطي الإجابة،",
        li1c: "يمسح، و",
        li1d: "يحذف آخر رقم.",
        li2a: "تُجري × و÷ قبل + و−، تماماً كما على الورق، والأقواس تعمل أيضاً:",
        li3a: "النسبة المئوية تعمل كما في آلة الصندوق:",
        li3b: "تساوي 220.",
        li4a: "اكتب",
        li4b: "أو",
        li4c: "بعد رقم للآلاف أو الملايين، لكتابة رصيد كبير بسرعة:",
        li5a: "بعد الضغط على",
        li5b: "تظهر الإجابة أيضاً برقائق من مجموعتك، بأقل عدد ممكن منها، لتعرف كم يجب أن تُعيد.",
        li6a: "تُضاف كل إجابة إلى السجل. انقر على عملية حسابية لتعديلها، أو على إجابتها لاستخدامها.",
        li6b: "و",
        li6c: "يتنقلان بين الإجابات،",
        addUp: "جمع الكل",
        li6d: "يجمعها كلها (مثل مبالغ التصفية في لعبة ما)، و",
        li6e: "نسخ",
        into: "إدراج",
        li7: "يضع الإجابة في آخر خانة رقمية كنت فيها، مثل مبلغ شراء أو عدد رقائق.",
        li8: "لا يُحفظ أبداً أي شيء تكتبه فيها.",
        potKey: "حد البوت",
        li9: "يحسب أكبر زيادة ممكنة في لعبة بحد البوت. خذ البوت من الشاشة، ثم مبلغ المجاراة، فيعرض أقصى مبلغ يمكن لأي لاعب أن يزيد إليه. اضغط عليه لاستخدامه.",
      },
      keys: { note: "لا يعمل أي من هذه الاختصارات أثناء الكتابة في خانة إدخال. يمكن تغيير اختصار الأوامر في" },
      data: {
        q1: "أين تُحفظ ألعابي؟",
        a1a: "في هذا المتصفح، على هذا الجهاز، مشفّرة. لا توجد حسابات، لذا لا يملك أحد آخر نسخة منها، ونحن كذلك. أضف رمز دخول في",
        a1b: "ولن يفتح شيء بدونه.",
        q2: "هل يعمل بدون اتصال؟",
        a2: "نعم. بمجرد فتحه في متصفح، يعمل PitMaster ويُحمَّل هناك دون أي اتصال، بما في ذلك نافذة التلفاز. البث المباشر فقط هو ما يحتاج اتصالاً، على الشاشتين معاً.",
        q3: "كيف أنقله إلى جهاز آخر؟",
        a3a: "كل شيء إلى ملف، ثم استورده على الجهاز الآخر. يمكن أيضاً نقل لعبة واحدة بمفردها:",
        moveDevice: "النقل إلى جهاز آخر",
        a3b: "موجود في شاشة الموزّع، وتستمر اللعبة هناك، بما في ذلك رمز التلفاز.",
        q4: "ماذا لو مسحت بيانات متصفحي؟",
        a4: "يؤدي مسح بيانات هذا الموقع إلى حذف ما هو محفوظ هنا بشكل نهائي، لذا صدّر أولاً إن أردت الاحتفاظ به.",
        q5: "هل له أي تكلفة؟",
        a5a: "لا. PitMaster مجاني، بلا إعلانات وبلا تتبع، وكوده مفتوح المصدر على",
        a5b: "يحتوي على التفاصيل.",
        q6: "هناك خطأ ما؟",
        a6a: "أخبرنا عبر",
        a6b: "أو افتح تذكرة (issue) على",
        a6c: "من فضلك لا ترسل لنا أي شيء من ألعابك؛ فنحن لا نحتاجه أبداً.",
      },
    },
    privacy: {
      intro: {
        pre: "PitMaster (",
        post:
          ") مشروع جانبي مجاني ومفتوح المصدر، بناه شخص واحد بالكامل ونشرته شركة Wyzie LLC (“نحن”). صُمم بحيث لا تحتاج ألعابك أبداً لمغادرة جهازك، وتوضّح هذه الصفحة بدقة متى يحدث ذلك.",
      },
      short: {
        title: "النسخة المختصرة",
        li1: "لا توجد حسابات ولا قاعدة بيانات لألعابك. نحن لا نعرف من أنت.",
        li2: "كل ما تُدخله يُحفظ في هذا المتصفح، على هذا الجهاز، مشفّراً بمفتاح لا يملكه سوى هذا المتصفح. أضف رمز دخول ولن يفتح شيء بدونه. لا يمكننا رؤية أي منه، ولا يمكننا استرجاعه إن ضاع.",
        li3: "الاستثناء الوحيد: طالما أن اللعبة لديها رمز تلفاز، تبقى نسخة مشفّرة منها على خادمنا حتى تتمكن الشاشات الأخرى من عرضها. تُقفل هذه النسخة بمفتاح مُشتق من رمز التلفاز، لا نراه أبداً، وتُحذف عند إيقاف المشاركة، أو بعد يومين من آخر تغيير فيها.",
        li4: "بلا إعلانات، بلا تحليلات، بلا كوكيز تتبّع، وبلا سكربتات من جهات خارجية.",
        li5pre: "كود PitMaster متاح للعامة على",
        li5post: "حتى يتمكن أي شخص من التحقق أنه يفعل ما تقوله هذه الصفحة فعلاً.",
      },
      onDevice: {
        title: "ما الذي يُحفظ على جهازك",
        lead: "يحتفظ PitMaster بكل شيء في تخزين متصفحك:",
        li1: "الألعاب: أسماء اللاعبين، مبالغ الشراء، التصفيات، إعادة الشراء، الإخراج، المقاعد، الجوائز، التقسيمات، سجل اللعبة والملاحظات.",
        li2: "مجموعات رقائقك وقوالبك.",
        li3: "أسماء Venmo وCash App وPayPal التي تحفظها للاعبين.",
        li4: "إعداداتك.",
        p1: "كل ذلك مشفّر بـ AES-256-GCM قبل تخزينه. يُنشئ متصفحك المفتاح بشكل عشوائي عند أول زيارة لك ويحتفظ به بحيث لا يستطيع أي سكربت، بما في ذلك سكربتاتنا، قراءته؛ ولا يمكن استخدامه إلا داخل هذا المتصفح لقفل بياناتك وفتحها. الأشياء الوحيدة المخزّنة دون تشفير هي المظهر وتقليل الحركة (تحتاجهما الصفحة قبل أن تُرسم أصلاً)، وعند وجود رمز دخول، عدد المحاولات الخاطئة. لا يكشف أي من ذلك أي شيء عنك أو عن ألعابك.",
        p2: "يحتفظ متصفحك بسجل التصفح الخاص به للصفحات التي زرتها. يُبقي PitMaster أسماء الألعاب بعيدة عنه: تسمية علامة تبويب اللعبة تكون فقط “لعبة كاش” أو “بطولة”. أما عنوان شاشة التلفاز فيحمل الرمز فعلاً، حتى تتمكن الشاشة من استئناف اللعبة بعد إعادة التحميل.",
        p3: "يحتفظ المتصفح أيضاً بنسخة من ملفات PitMaster نفسها (التطبيق ذاته وأيقوناته وتخطيطات الصفحات) حتى يفتح الموقع دون اتصال. هذه الملفات متطابقة للجميع ولا تحتوي على أي من ألعابك أو إعداداتك.",
        p4: "بدون رمز دخول، يبقى هذا كافياً لجعل ألعابك غير قابلة للقراءة من قِبل أي شيء يفحص البيانات المحفوظة دون استخدام المفتاح، مثل شخص يتصفح تخزين الموقع في أدوات المطوّرين. لكنه لا يمنع أي شخص يستطيع استخدام هذا المتصفح: فبإمكانه فتح PitMaster ورؤية ألعابك. ولأن المتصفح يحتفظ بالمفتاح على نفس الجهاز، فإن أي شخص ينسخ ملف تعريف المتصفح بأكمله يحصل على المفتاح مع البيانات. احمِ الجهاز وحسابك عليه كما تحمي أي شيء آخر مهم. وإذا لم تكن الصفحة عبر اتصال آمن (https)، فلن تقوم المتصفحات بالتشفير، لذا لا يحفظ PitMaster أي شيء هناك على الإطلاق بدلاً من حفظه دون تشفير.",
        p5pre: "يسد رمز الدخول هذه الثغرة (انظر",
        passcodeLinkText: "الإعدادات، قفل رمز الدخول",
        p5post:
          "). عندها يُقفل المفتاح بمفتاح آخر مُشتق من رمز الدخول (PBKDF2 بـ 600,000 دورة)، بحيث لا يمكن فتح أي شيء محفوظ بدونه، حتى من قِبل شخص يستخدم هذا المتصفح أو ينسخ ملفاته. لا يزال يمكن تخمين رمز دخول قصير من قِبل شخص لديه نسخة منه، لذا كلما كان أطول كان أفضل. يقفل PitMaster نفسه تلقائياً بعد المدة التي تختارها دون أي نشاط، وتُقفل معه كل علامات التبويب. تستمر شاشات التلفاز في عرض اللعبة التي أُعطيت لها، ولا يمكنها تغيير أي شيء، ولا تحتفظ بالمفتاح أبداً. نحن لا نرى رمز الدخول أبداً ولا يمكننا استرجاعه إن ضاع: بدونه، الطريقة الوحيدة للمضي قدماً هي حذف كل ما هو محفوظ في المتصفح.",
        p6pre: "تبقى بياناتك محفوظة حتى تحذفها بنفسك (",
        exportImportLinkText: "الإعدادات، التصدير والاستيراد",
        p6mid:
          "، ثم حذف كل شيء)، أو تمسح بيانات هذا الموقع في متصفحك، أو تغلق نافذة تصفح خاص. مسح بيانات الموقع يحذف المفتاح أيضاً، وبدونه لا يمكن قراءة أي شيء محفوظ هنا مرة أخرى، لا من قِبلك ولا من قِبل أي شخص آخر. يحتفظ كل متصفح وجهاز بنسخته الخاصة المنفصلة، ولهذا السبب توجد ميزة التصدير.",
      },
      exports: {
        title: "ملفات التصدير",
        p1: "يُنشأ التصدير داخل متصفحك ويُحفظ حيثما تختار. لا يمر أبداً عبرنا. ويحتوي على كل ما ذُكر أعلاه، بما في ذلك أسماء اللاعبين وروابط الدفع.",
        p2: "يمكنك قفل تصدير كامل بكلمة مرور من 8 أحرف على الأقل. يُشفَّر عندها بـ AES-256-GCM تحت مفتاح مُشتق من كلمة المرور (PBKDF2 بـ 600,000 دورة)، ولا يمكن قراءة سوى نوع الملف وتاريخه بدونها. كلما طالت كلمة المرور، صعُب تخمينها. نحن لا نرى كلمة المرور أبداً ولا يمكننا استرجاعها إن ضاعت. يمكن لأي شخص يملك ملفاً بلا كلمة مرور، مثل لعبة واحدة نُقلت إلى جهاز آخر، قراءته، وكذلك أي جدول بيانات أو ملخص تُنزّله أو تنسخه. احتفظ بها في مكان تثق به، وشاركها فقط مع من يجب أن يراها.",
      },
      tv: {
        title: "رموز التلفاز",
        p1: "تحصل نافذة التلفاز على نفس الحاسوب على اللعبة مباشرة من شاشة الموزّع. لا شيء يغادر جهازك.",
        p2: "عندما تضغط بدء البث المباشر لعرض لعبة على جهاز آخر:",
        li1: "يُنشئ متصفحك رمزاً من ثمانية أحرف، ويشتق منه شيئين: معرّفاً يفهرس خادمنا اللعبة تحته، ومفتاحاً يقفلها. يأتي كلاهما من دالة اشتقاق بطيئة أحادية الاتجاه للرمز (PBKDF2)، ولا يُرسل الرمز نفسه إلينا أبداً.",
        li2: "في كل مرة تتغير فيها اللعبة، يُشفّر متصفحك نسخة بذلك المفتاح (AES-256-GCM) ويرسلها. تحتوي النسخة على اللعبة وإعدادات عرضها (مثل العملة، وتنسيق الساعة، ومستوى صوت التلفاز)، لكن ليس سجل اللعبة أو ألعابك الأخرى أو مجموعات الرقائق أو القوالب أو روابط الدفع.",
        li3: "يخزّن خادمنا النسخة المقفلة، والمعرّف، وتجزئة أحادية الاتجاه (SHA-256) لمفتاح كتابة منفصل يملكه متصفحك وحده، بحيث تكون أنت وحدك من يستطيع تعديلها أو حذفها. لا توجد لدى الخادم أي وسيلة لفتح النسخة.",
        li4: "تُنشئ الشاشة التي تحصل على الرمز نفس المعرّف والمفتاح، وتجلب النسخة وتفتحها. تحمل روابط التلفاز الرمز بعد علامة “#”، وهو جزء من العنوان لا ترسله المتصفحات أبداً إلى أي خادم.",
        li5: "تُحذف النسخة بمجرد ضغطك على إيقاف المشاركة أو حذف اللعبة، أو تلقائياً بعد يومين من آخر تحديث لها. بعد إيقاف المشاركة، يمنع سجل فارغ لا يحوي أي لعبة إعادة استخدام الرمز حتى تنقضي هذان اليومان.",
        p3: "يمكن لأي شخص يملك الرمز، أو يخمّنه، رؤية اللعبة أثناء مشاركتها، لذا لا تترك فيها أي شيء لا تريد إظهاره لكل من على الطاولة. ويشمل ذلك الهواتف: يعرض التلفاز وشاشة الموزّع الرابط كرمز QR يُنشأ على الجهاز نفسه، ويحصل الهاتف على النسخة نفسها التي يحصل عليها التلفاز. تبحث «ابحث عني» في تلك النسخة على الهاتف نفسه، ولا يُحفظ أو يُرسل أي شيء يُكتب فيها.",
      },
      protected: {
        title: "كيف تتم الحماية",
        li1: "يُقدَّم كل من الموقع وخادم رموز التلفاز عبر اتصالات مشفّرة (HTTPS)، ويُخبران المتصفحات بألا تستخدم أبداً أي اتصال أقل أماناً.",
        li2: "لا يحمّل الموقع أي كود من جهات خارجية: لا إعلانات، لا تحليلات، لا أدوات تتبّع ولا خطوط خارجية. تمنع سياسة أمان محتوى صارمة الصفحة من تشغيل أي سكربتات أخرى أو التواصل مع أي خادم غير خوادمنا.",
        li3: "بياناتك مشفّرة على جهازك، وعلى خادمنا، وفي ملفات التصدير المحمية بكلمة مرور، كما هو موضح أعلاه.",
        li4: "لإبطاء أي شخص يحاول تخمين رموز التلفاز، يحصي خادم رموز التلفاز طلبات كل عنوان IP دقيقة بدقيقة. تُحفظ هذه العدادات في الذاكرة فقط ولا تُخزَّن أو تُسجَّل أبداً.",
        li5: "تُفحص الملفات التي تستوردها قبل حفظ أي شيء منها، ويُرفض بالكامل أي ملف لا يبدو تماماً كتصدير حقيقي من PitMaster.",
        p1: "لا يوجد نظام آمن تماماً، وPitMaster مشروع جانبي، وليس منتج أمان خاضع للتدقيق. لا تضع فيه أي شيء لا تحتمل خسارته أو رؤية شخص آخر له.",
      },
      phones: {
        title: "هواتف اللاعبين",
        p1: "عند استخدام الهواتف كأكواب في نرد الكذاب، يكون هاتف كل لاعب هو كوبه. تعرض شاشة المضيف لكل لاعب رمزًا لمقعده الخاص، والمفتاح الذي يتيح للهاتف الكتابة إلى ذلك المقعد لا يذهب أبدًا إلى أي مكان غير ذلك الهاتف وشاشة المضيف.",
        li1: "ما يرسله الهاتف: أولًا تجزئة لأرقامه في الجولة (لا تكشف شيئًا)، ثم الأرقام نفسها عندما يُعلن تحدٍّ على مزايدة. كلاهما يُقفل بمفتاح اللعبة على الهاتف نفسه، مثل نسخة التلفاز.",
        li2: "ما يمكن للخادم رؤيته: معرّف اللعبة، ومعرّف كل مقعد، وتجزئة SHA-256 لمفتاح كل مقعد، ونصًا مشفرًا. لا يملك أبدًا مفتاح أي مقعد، ولا اسم أي لاعب، ولا أحجار أي أحد.",
        li3: "ما يمكن لشاشة المضيف رؤيته: فقط ما كشفه الهاتف بالفعل. أرقام المضيف نفسه هي نصف كل حجر، ولا فائدة منها دون نصف الهاتف.",
        li4: "يحتفظ الهاتف بأرقامه للجولة مقفلة، بمفتاح يُنشأ على الهاتف لا يستطيع أي نص برمجي قراءته، لذا لا تؤدي إعادة تحميل الصفحة إلى فقدان الكوب. لا يُحفظ أي شيء كنص عادي.",
        p2: "مثل كل ما هو مباشر، تُحذف صناديق البريد عندما يوقف المضيف المشاركة، أو بعد يومين من آخر تحديث.",
      },
      host: {
        title: "من يستضيف الموقع",
        p1pre:
          "يعمل كل من الموقع وخادم رموز التلفاز على Cloudflare. ولتوصيل الصفحات وصد الهجمات، تتعامل Cloudflare مع تفاصيل تقنية لكل طلب، مثل عناوين IP ونوع المتصفح، بموجب",
        linkText: "سياسة الخصوصية الخاصة بها",
        p1post: "نحن لا نضيف أي تحليلات أو إعلانات أو كوكيز تتبّع، ولا نسجّل ما تفعله، ولا نبيع أو نشارك أي شيء عنك.",
      },
      other: {
        title: "خدمات أخرى",
        li1: "تفتح روابط الدفع تطبيق Venmo أو Cash App أو PayPal مع مبلغ واسم اللعبة معبّأين مسبقاً. ما يحدث هناك هو أمر بينك وبينهم فقط.",
        li2: "يستخدم المُعلّق الصوتي فقط الأصوات المدمجة في جهازك، لذا فإن ما يقرأه لا يغادر جهازك أبداً. وحيث لا يقدّم المتصفح إلا أصواتاً عبر الإنترنت، يبقى المُعلّق صامتاً.",
        li3: "تتبع الروابط إلى مواقع أخرى سياسات تلك المواقع الخاصة بها.",
      },
      choices: {
        title: "خياراتك",
        li1pre: "احذف كل شيء في أي وقت من",
        li1post: "أو بمسح بيانات هذا الموقع في متصفحك.",
        li2: "أوقف مشاركة رمز التلفاز في أي وقت، وتُحذف النسخة الموجودة على خادمنا فوراً.",
        li3: "لأننا لا نحتفظ بأي شيء يحدد هويتك، فلا يوجد لدينا ما نبحث عنه أو نصححه أو نسلّمه أو نحذفه بناءً على طلب. كل شيء موجود بالفعل في يديك.",
      },
      children: {
        title: "الأطفال",
        p1: "PitMaster مخصص للبالغين. إنه ليس للأطفال، ونحن لا نجمع معلومات عن قصد من أي شخص، بغض النظر عن عمره.",
      },
      changes: { p1: "إذا تغيّرت هذه السياسة، تُنشر النسخة الجديدة هنا ويتغيّر التاريخ في الأعلى معها." },
      contact: { p1pre: "لديك أسئلة حول الخصوصية؟ تواصل مع Wyzie LLC عبر" },
    },
    terms: {
      intro: {
        pre: "تمثل هذه الشروط اتفاقاً بينك وبين Wyzie LLC (“نحن”)، التي تنشر PitMaster على",
        post: "باستخدامك PitMaster فإنك توافق عليها. إذا كنت لا توافق، فمن فضلك لا تستخدمه.",
      },
      what: {
        title: "ما هو PitMaster",
        p1: "PitMaster مشروع جانبي مجاني ومفتوح المصدر، بناه شخص واحد بالكامل ونشرته شركة Wyzie LLC، ليستخدمه أي شخص في ألعاب البوكر الخاصة به، أياً كان حجمها. يتولى حساب الرقائق، وساعات البلايند، ومبالغ الشراء، والعمولة، والجوائز، والتسويات، وعرض التلفاز. إنه يحفظ السجلات ويقوم بالعمليات الحسابية فقط. إنه لا يقبل الرهانات، ولا يحتفظ بالأموال أو ينقلها، ولا يدير أي لعبة بنفسه، وهو ليس خدمة مقامرة. يأتي دون دعم، ودون ضمانات، ودون أي وعد بأنه سيستمر في الوجود.",
      },
      yourChoice: {
        title: "كيفية استخدامه تعود إليك",
        p1: "استخدام PitMaster من عدمه، وكيفية استخدامه، هما خياران يخصانك وحدك، وأنت المسؤول الوحيد عن هذا الخيار وعن كل ما ينتج عنه: الألعاب التي تديرها، والقواعد والرهانات والرسوم التي تحددها، والأموال التي تنتقل بين الأيدي، والمعلومات التي تدخلها، وأي شيء تشاركه أو تعرضه على شاشة. نحن لا نشرف على أي لعبة ولا نراجعها ولا نوافق عليها، ولا شيء يعرضه PitMaster يُعد استشارة قانونية أو مالية أو ضريبية.",
      },
      legalGame: {
        title: "إدارة لعبة قانونية",
        p1: "تتفاوت قوانين البوكر كثيراً من مكان إلى آخر. بعض الأماكن لا تسمح بالبوكر بأموال حقيقية خارج القاعات المرخّصة، ويحظر كثير منها على أي شخص غير المشغّل المرخّص أخذ عمولة أو رسم مقعد أو أي اقتطاع آخر. أنت المسؤول عن التأكد من أن أي لعبة تديرها باستخدام PitMaster، وكل إعداد تستخدمه فيها، قانونية في المكان الذي تلعب فيه، وأنك تحمل أي ترخيص تتطلبه، وأن أي ضرائب تخصها مُصرَّح عنها ومدفوعة، وأن كل من على الطاولة بلغ السن القانونية.",
        p2: "لم يحصل PitMaster على شهادة أو موافقة من أي جهة تنظيمية للمقامرة. إذا كنت تدير قاعة مرخّصة أو تجارية، فيعود إليك تحديد ما إذا كانت قواعدك تسمح باستخدامه، وهو لا يحل محل أي سجلات مُلزَم بالاحتفاظ بها.",
      },
      data: {
        title: "بياناتك",
        p1: "كل ما تُدخله يُحفظ في متصفحك، مشفّراً (انظر",
        p2: "). البيانات ملكك، وأمانها مسؤوليتك أيضاً. قد يؤدي مسح متصفحك، أو فقدان جهازك أو استبداله، أو مشكلة في المتصفح أو خطأ برمجي، إلى محوها أو جعلها غير قابلة للقراءة، ونحن لا نملك نسخة لاستعادتها.",
        p3: "بانتظام، واحتفظ بملفات التصدير في مكان آمن. إذا قفلت ملف تصدير بكلمة مرور ثم فقدتها، فلن يمكن فتح الملف، لا من قِبلك ولا من قِبلنا.",
      },
      math: {
        title: "تحقق من الحسابات",
        p1: "الجوائز، والعمولة، ومبالغ التسوية، وحسابات التقسيم، وهياكل البلايند، جميعها تُحسب بحسن نية، لكنها قد تكون خاطئة، أو غير مناسبة للعبتك. تحقق من أي شيء مهم قبل أن تنتقل الأموال بين الأيدي. الخلافات على الطاولة يجب أن تُحل على الطاولة.",
      },
      fair: {
        title: "استخدامه بإنصاف",
        p1: "لا تسئ استخدام PitMaster أو خادم رموز التلفاز الخاص به: لا تُثقل عليه، ولا تحاول تخمين رموز الآخرين أو جمعها، ولا تتحايل على أمانه، ولا تستخدمه لخرق القانون، ولا تخزّن فيه أي شيء غير ألعاب البوكر. أدخل فقط المعلومات التي تملك الحق في مشاركتها. يمكننا تقييد أو حظر أي استخدام يخالف هذه القواعد.",
      },
      code: {
        title: "الكود",
        p1pre: "كود PitMaster متاح للعامة على",
        p1mid: "بموجب",
        p1post:
          ": أنت حرّ في قراءته ونسخه وتعديله وتشغيل نسختك الخاصة، وفق شروط تلك الرخصة. تغطي الرخصة الكود فقط؛ أما هذه الشروط فتغطي استخدام PitMaster على pitmaster.cc. النسخة التي يشغّلها شخص آخر ملكه هو، وليست ملكنا: لا تنطبق عليها هذه الشروط ولا سياسة الخصوصية الخاصة بنا، ولسنا مسؤولين عنها. لا تشمل الرخصة اسم PitMaster، لذا إذا نشرت نسختك الخاصة، فأعطها اسماً خاصاً بها حتى لا يخلط بينها وبين هذه النسخة أحد.",
      },
      trademarks: {
        title: "الأسماء والعلامات التجارية",
        p1: "سُمّيت مجموعات الرقائق المدمجة على أسماء المنتجات الحقيقية التي تطابقها، من صانعين مثل DA VINCI وKardShark وPlayzaic وCasino Supply، وتحمل روابط الدفع أسماء Venmo وCash App وPayPal. تلك الأسماء ملك لأصحابها. PitMaster ليس تابعاً لأي منها ولا معتمداً منها.",
      },
      warranty: {
        title: "بلا ضمان",
        p1: "يُقدَّم PitMaster “كما هو” و“حسب توفره”، دون أي ضمانات من أي نوع، صريحة أو ضمنية، بما في ذلك القابلية للتسويق، والملاءمة لغرض معين، والدقة، والأمان، وعدم انتهاك حقوق الغير. نحن لا نعِد بأنه سيكون دقيقاً أو آمناً أو غير منقطع أو خالياً من الأخطاء، ولا بأن بياناتك ستبقى آمنة أو قابلة للاسترجاع. يمكننا تغيير PitMaster أو تقييده أو إنهاءه في أي وقت دون إشعار، وقد يتعطّل أو يصبح غير متصل، حتى في منتصف لعبة ما.",
      },
      liability: {
        title: "حدود المسؤولية",
        p1: "إلى أقصى حد يسمح به القانون، لا تتحمل شركة Wyzie LLC ولا الشخص الذي بنى PitMaster المسؤولية عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو تأديبية، ولا عن فقدان البيانات أو الأموال أو الأرباح أو خسائر المقامرة أو المشاكل القانونية أو النزاعات بين اللاعبين، الناشئة عن استخدامك لـ PitMaster أو المتعلقة به، حتى لو أُخبرنا بإمكانية حدوثها. وحيثما لا يمكن استبعاد المسؤولية، تكون مسؤوليتنا الإجمالية تجاهك عن جميع المطالبات مجتمعة محدودة بمبلغ $50. لا تسمح بعض الأماكن بهذه الحدود، لذا فقد لا تنطبق بعضها عليك.",
      },
      indemnity: {
        title: "التعويض",
        p1: "إذا تقدّم أي شخص بمطالبة ضد Wyzie LLC أو الشخص الذي بنى PitMaster بسبب طريقة استخدامك له، أو لعبة أدرتها به، أو إخلالك بهذه الشروط أو بالقانون، فإنك توافق على تغطية الخسائر والتكاليف الناتجة، بما في ذلك أتعاب المحاماة المعقولة، إلى الحد الذي يسمح به القانون.",
      },
      rest: {
        title: "باقي الأحكام",
        p1pre: "إذا تعذّر تطبيق أي جزء من هذه الشروط، تبقى بقية الأجزاء سارية. عدم تطبيق جزء ما لا يعني التنازل عنه. تشكّل هذه الشروط و",
        p1post: "كامل الاتفاق بينك وبيننا بشأن PitMaster.",
      },
      changes: { p1: "قد نحدّث هذه الشروط. يوضح التاريخ في الأعلى آخر موعد تغيّرت فيه، واستخدامك لـ PitMaster بعد أي تغيير يعني أنك تقبل النسخة الجديدة." },
      contact: { p1pre: "لديك أسئلة حول هذه الشروط؟ تواصل مع Wyzie LLC عبر" },
    },
  },
  bn: {
    lastUpdated: "সর্বশেষ আপডেট ২৬ সেপ্টেম্বর ২০২৬",
    changesTitle: "পরিবর্তন",
    contactTitle: "যোগাযোগ",
    nav: { privacyPolicy: "গোপনীয়তা নীতি", termsOfUse: "ব্যবহারের শর্তাবলী" },
    links: { privacy: "গোপনীয়তা", export: "এক্সপোর্ট করুন" },
    help: {
      sub: "PitMaster কীভাবে কাজ করে, এটি কী করতে পারে, আর আপনার গেমগুলো কোথায় সংরক্ষিত থাকে।",
      onThisPage: "এই পাতায়",
      nav: {
        start: "শুরু করা",
        dealing: "একটি গেম চালানো",
        tv: "টিভি",
        calculator: "ক্যালকুলেটর",
        keys: "শর্টকাট",
        data: "আপনার ডেটা",
      },
      start: { welcomeBack: "হোম পেজে আবার স্বাগত বার্তা দেখান" },
      dealing: {
        cashTitle: "ক্যাশ গেম",
        cashBody:
          "ব্লাইন্ড আর বাই-ইনের পরিসীমা ঠিক করুন, তারপর খেলোয়াড়রা বসার সাথে সাথে তাদের যোগ করুন। রিবাই আর ক্যাশ-আউট প্রতিটিই এক ট্যাপে হয়ে যায়, আর ব্যাংক টেবিলের প্রতিটি চিপের হিসাব রাখে। গেম শেষ হলে, Settle Up হিসাব করে দেয় কে কাকে টাকা দেবে, চাইলে Venmo, Cash App আর PayPal-এর লিংকসহ। সাইড গেমেরও নিজস্ব সুইচ আছে: টাইমারে বা ডাকলে বম্ব পট, 7-2 গেম, আর হাউসের দেওয়া হাই হ্যান্ড পুরস্কার, যা সেটল-আপে আসে। ভাগের খরচ গেমের জন্য কেনা জিনিস ভাগ করে, আর কে কার কাছে পাবে পেমেন্টে টিক দেয় এবং খেলোয়াড় পেজে পুরো হিসাব রাখে। ওয়েটলিস্ট মনে রাখে পরের সিট কার, আর সিট খালি হলেই টিভি জানিয়ে দেয়।",
        tourneyTitle: "টুর্নামেন্ট",
        tourneyBody:
          "আপনি কতক্ষণ খেলতে চান তা বেছে নিন, আর PitMaster সেই অনুযায়ী ব্লাইন্ড স্ট্রাকচার তৈরি করবে: শুরুর স্ট্যাক, বিরতি, অ্যান্টি, রিবাই, অ্যাড-অন আর বাউন্টি। খেলোয়াড়রা বাদ পড়ার সাথে সাথে তাদের বাদ দিন, আর পেআউট, গড় স্ট্যাক আর টেবিল ব্যালান্সিং নিজে থেকেই চলতে থাকে। ফাইনাল টেবিলে ডিল ক্যালকুলেটর প্রাইজ পুল চিপ সংখ্যা বা ICM অনুযায়ী ভাগ করে দেয়। বাউন্টি ফ্ল্যাট, প্রগ্রেসিভ (PKO) বা মিস্ট্রি খাম হতে পারে, আর \"এখান থেকে শুরু করুন\"-এ টার্বো, ডিপস্ট্যাক, সিট অ্যান্ড গো-র মতো তৈরি সেটআপ আছে। বিজয়ী ঠিক হলে হিসাব মেটান দেখায় আয়োজক প্রত্যেক খেলোয়াড়কে কত দেবে। স্যাটেলাইটে পুরস্কার হয় অন্য গেমের সিট, আর শুটআউটে প্রতিটি টেবিল একজন বিজয়ী পর্যন্ত খেলে, তারপর ফাইনাল টেবিল। হেডস-আপ ব্র্যাকেটে খেলা হয় একজন বনাম একজন: ব্র্যাকেট ড্র করুন, প্রতিটি ম্যাচের বিজয়ীতে ক্লিক করুন, আর টিভি দেখায় কে কার সাথে খেলছে।",
        paletteTitle: "শুধু নাম লিখে যেকোনো কিছু করুন",
        paletteBody1: "যেকোনো জায়গায়",
        paletteBody2:
          "চাপুন Commands খুলতে। যা চান টাইপ করুন, যেমন “next level”, “bust mike” বা “new tournament”, তারপর Enter চাপুন। প্রতিটি টেবিলেই ভুল হয়:",
        paletteBody3: "ডিলার স্ক্রিনে করা শেষ পরিবর্তনটি ফিরিয়ে দেয়।",
        everyTitle: "প্রতিটি গেম আলাদা",
        everyBody1: "রেক, হাউস কাট, বাউন্টি, রিবাই, সিটিং, ডিল আর পে লিংক, প্রতিটিরই নিজস্ব সুইচ আছে",
        everyBody2: "তে, যাতে একটি ছোট শান্ত গেম আর চল্লিশ খেলোয়াড়ের টুর্নামেন্ট, দুটোই শুধু নিজের প্রয়োজনীয়টুকুই ব্যবহার করে। লিগ পুরো মৌসুমের খেলাকে পয়েন্টে গোনে, আর র‍্যাংকিং খেলোয়াড় পেজে ও টিভিতে দেখা যায়। অন্যান্য পোকার গেম চালু করলে ওমাহা, স্টাড, রেজ, ড্র আর HORSE-এর মতো মিক্সড গেম (প্রতি লেভেলে একটি গেম) এবং ক্যাশ গেমে ডিলার্স চয়েস পাওয়া যায়, আর প্রতিটি গেমের লিমিট টিভিতে দেখা যায়। শুধু পোকার নয়: লায়ার্স ডাইস প্রত্যেক খেলোয়াড়ের ছক্কা গোনে, কল থেকে বের করে কে একটি হারাল, আর বাই-ইন পট বা প্রতি হারানো ছক্কার টাকার হিসাব মেলায়। লাইভস গেম (31, স্ক্রু ইয়োর নেইবার, নক-আউট হুইস্ট, শিপ, ক্যাপ্টেন অ্যান্ড ক্রু) বিজয়ী পর্যন্ত জীবন গোনে, আর পট গেম (ইন-বিটুইন, গাটস, বুরে, পাস দ্য পিগস) সীমাসহ চলমান পট রাখে, আর দুটোই বাকি সবকিছুর মতো হিসাব মেলায়।",
      },
      tv: {
        body1a: "গেমকে বড় স্ক্রিনে দেখানোর দুটি উপায় আছে। টিভির সাথে সংযুক্ত ল্যাপটপে, ডিলার স্ক্রিনে চাপুন",
        openWindow: "Open TV Window",
        body1b: "আর উইন্ডোটি টেনে টিভিতে নিয়ে যান। অন্য যেকোনো স্ক্রিনের জন্য (স্মার্ট টিভির ব্রাউজার, ট্যাবলেট, কারও ফোন), চাপুন",
        goLive: "Go Live",
        body1c: "তারপর সেই স্ক্রিনে খুলুন",
        body1d: "আর 8 অক্ষরের কোডটি টাইপ করুন।",
        body2a: "টিভিতে ঘড়ি, ব্লাইন্ড, পেআউট আর আপনার পাঠানো বার্তাগুলো দেখা যায়, আর এটি নিজে থেকেই আপডেট থাকে। এটি কিছুই পরিবর্তন করতে পারে না, আর একটি লাইভ গেম সেখানে পৌঁছানোর পথে এন্ড-টু-এন্ড এনক্রিপ্টেড থাকে। টিভিতে ফুল স্ক্রিনের জন্য চাপুন",
        body2b: "আর শব্দের জন্য চাপুন",
        body2c: "। ফোনেও দেখা যায়: টিভি বা ডিলার স্ক্রিনের QR কোড স্ক্যান করুন, তারপর ‘আমাকে খুঁজুন’-এ নাম লিখে আপনার আসন আর অবস্থান দেখুন।",
      },
      calculator: {
        press: "যেকোনো পাতায় চাপুন",
        onAnyPage: "।",
        onAnyPageOr: ", অথবা",
        openNow: "এখনই খুলুন",
        floats: "এটি পাতার ওপরে ভেসে থাকে, তাই আপনি এটিকে টেনে সরিয়ে রাখতে পারেন, শুধু উত্তরটুকু দেখানোর জন্য ছোট করতে পারেন, বা Ghost চালু করে এর ভেতর দিয়ে দেখে নিচের পাতায় ক্লিক করতে পারেন।",
        li1a: "কীবোর্ড থেকে সরাসরি যোগ-বিয়োগ টাইপ করুন।",
        li1b: "উত্তর দেয়,",
        li1c: "মুছে দেয়, আর",
        li1d: "শেষ অঙ্কটি বাদ দেয়।",
        li2a: "এটি কাগজের হিসাবের মতোই + আর − এর আগে × আর ÷ করে, আর বন্ধনীও কাজ করে:",
        li3a: "শতাংশ ক্যাশ কাউন্টারের মতোই কাজ করে:",
        li3b: "মানে 220।",
        li4a: "কোনো সংখ্যার পরে",
        li4b: "বা",
        li4c: "টাইপ করুন হাজার বা মিলিয়নের জন্য, যাতে একটি বড় স্ট্যাক তাড়াতাড়ি টাইপ করা যায়:",
        li5a: "চাপার পরে",
        li5b: "উত্তরটি আপনার চিপ সেট থেকে চিপ আকারেও দেখায়, সবচেয়ে কম সংখ্যক চিপে, যাতে আপনি জানেন কী ফেরত দিতে হবে।",
        li6a: "প্রতিটি উত্তর ইতিহাসে জমা হয়। কোনো হিসাবে ক্লিক করে তা পরিবর্তন করুন, বা তার উত্তরে ক্লিক করে তা ব্যবহার করুন।",
        li6b: "আর",
        li6c: "উত্তরগুলোর মধ্যে যাতায়াত করে,",
        addUp: "Add Up",
        li6d: "সবগুলো যোগ করে দেয় (যেমন একটি গেমের সব ক্যাশ-আউট), আর",
        li6e: "Copy",
        into: "Into",
        li7: "উত্তরটি আপনি যে শেষ সংখ্যার বাক্সে ছিলেন সেখানে বসিয়ে দেয়, যেমন কোনো বাই-ইন বা চিপ সংখ্যা।",
        li8: "এতে টাইপ করা কোনো কিছুই কখনো সংরক্ষিত হয় না।",
        potKey: "পট লিমিট",
        li9: "পট লিমিট গেমে সবচেয়ে বড় রেইজ কত হতে পারে তা বের করে। ডিসপ্লে থেকে পট নিন, তারপর কল করার পরিমাণ, আর এটি দেখায় কেউ সর্বোচ্চ কত পর্যন্ত রেইজ করতে পারে। ব্যবহার করতে সেটিতে ট্যাপ করুন।",
      },
      keys: { note: "আপনি যখন কোনো বাক্সে টাইপ করছেন তখন এসবের কোনোটিই কাজ করবে না। Commands-এর শর্টকাট এখানে পরিবর্তন করা যায়:" },
      data: {
        q1: "আমার গেমগুলো কোথায় সংরক্ষিত থাকে?",
        a1a: "এই ব্রাউজারে, এই ডিভাইসে, এনক্রিপ্টেড অবস্থায়। এখানে কোনো অ্যাকাউন্ট নেই, তাই আমাদের সহ আর কারও কাছেই এর কোনো কপি নেই। এখানে পাসকোড যোগ করুন",
        a1b: "আর এটি ছাড়া কিছুই খুলবে না।",
        q2: "এটি কি অফলাইনে কাজ করে?",
        a2: "হ্যাঁ। একবার ব্রাউজারে খোলার পর, PitMaster সংযোগ ছাড়াই সেখানে লোড হয় ও চলে, টিভি উইন্ডোসহ। শুধু Go Live-এর জন্যই সংযোগ দরকার, দুটো স্ক্রিনেই।",
        q3: "অন্য একটি ডিভাইসে কীভাবে নেব?",
        a3a: "সব কিছু একটি ফাইলে এক্সপোর্ট করুন, তারপর অন্য ডিভাইসে ইমপোর্ট করুন। একটি একক গেমও আলাদাভাবে নেওয়া যায়:",
        moveDevice: "Move to Another Device",
        a3b: "ডিলার স্ক্রিনে আছে, আর তা সেখানে গিয়ে চলতে থাকে, টিভি কোডসহ সবকিছু।",
        q4: "আমি যদি আমার ব্রাউজার সাফ করি তাহলে কী হবে?",
        a4: "এই সাইটের ডেটা সাফ করলে এখানে সংরক্ষিত সবকিছু চিরতরে মুছে যায়, তাই রাখতে চাইলে আগে এক্সপোর্ট করে নিন।",
        q5: "এর জন্য কি কোনো খরচ আছে?",
        a5a: "না। PitMaster সম্পূর্ণ বিনামূল্যে, কোনো বিজ্ঞাপন বা ট্র্যাকিং নেই, আর এর কোড ওপেন সোর্স এখানে:",
        a5b: "পাতায় বিস্তারিত আছে।",
        q6: "কিছু ঠিক মনে হচ্ছে না?",
        a6a: "আমাদের জানান",
        a6b: "অথবা একটি issue খুলুন",
        a6c: "দয়া করে আপনার গেম থেকে কিছু পাঠাবেন না; আমাদের তা কখনোই দরকার হয় না।",
      },
    },
    privacy: {
      intro: {
        pre: "PitMaster (",
        post:
          ") একটি বিনামূল্যের, ওপেন সোর্স সাইড প্রজেক্ট, যা সম্পূর্ণভাবে একজন মাত্র মানুষ তৈরি করেছেন এবং Wyzie LLC (“আমরা”) প্রকাশ করেছে। এটি এমনভাবে তৈরি যাতে আপনার গেমগুলোকে কখনো আপনার ডিভাইস ছেড়ে যেতে না হয়, আর এই পাতায় ঠিক কখন কিছু বাইরে যায় তা বলা আছে।",
      },
      short: {
        title: "সংক্ষিপ্ত বিবরণ",
        li1: "এখানে কোনো অ্যাকাউন্ট নেই আর আপনার গেমগুলোর কোনো ডেটাবেস নেই। আপনি কে তা আমরা জানি না।",
        li2: "আপনি যা কিছু লেখেন তা এই ব্রাউজারে, এই ডিভাইসে, এমন একটি কী দিয়ে এনক্রিপ্ট করে সংরক্ষিত থাকে যা শুধু এই ব্রাউজারই ধরে রাখে। পাসকোড যোগ করুন আর এটি ছাড়া কিছুই খুলবে না। আমরা এর কিছুই দেখতে পারি না, আর হারিয়ে গেলে তা ফিরিয়ে আনতেও পারি না।",
        li3: "একমাত্র ব্যতিক্রম: যতক্ষণ কোনো গেমের একটি টিভি কোড থাকে, ততক্ষণ এর একটি এনক্রিপ্টেড কপি আমাদের সার্ভারে থাকে যাতে অন্য স্ক্রিন এটি দেখাতে পারে। এটি টিভি কোড থেকে তৈরি একটি কী দিয়ে লক করা থাকে, যা আমরা কখনো দেখি না, আর আপনি শেয়ার করা বন্ধ করলে, বা শেষবার পরিবর্তনের দুই দিন পর, এটি মুছে যায়।",
        li4: "কোনো বিজ্ঞাপন নেই, কোনো অ্যানালিটিক্স নেই, কোনো ট্র্যাকিং কুকি নেই, আর কোনো থার্ড-পার্টি স্ক্রিপ্ট নেই।",
        li5pre: "PitMaster-এর কোড সর্বজনীনভাবে এখানে আছে:",
        li5post: ", যাতে যে কেউ যাচাই করতে পারে এটি সত্যিই এই পাতায় বলা কাজগুলো করে কিনা।",
      },
      onDevice: {
        title: "আপনার ডিভাইসে কী সংরক্ষিত থাকে",
        lead: "PitMaster সবকিছু আপনার ব্রাউজারের স্টোরেজে রাখে:",
        li1: "গেম: খেলোয়াড়দের নাম, বাই-ইন, ক্যাশ-আউট, রিবাই, নকআউট, সিট, পেআউট, ডিল, গেম লগ আর নোট।",
        li2: "আপনার চিপ সেট আর টেমপ্লেট।",
        li3: "খেলোয়াড়দের জন্য সংরক্ষিত Venmo, Cash App আর PayPal-এর নাম।",
        li4: "আপনার সেটিংস।",
        p1: "সংরক্ষণের আগে এসব কিছুই AES-256-GCM দিয়ে এনক্রিপ্ট করা হয়। আপনার ব্রাউজার আপনার প্রথম ভিজিটেই এলোমেলোভাবে কী তৈরি করে আর এমনভাবে রাখে যাতে কোনো স্ক্রিপ্ট, আমাদেরটিসহ, তা পড়তে না পারে; এটি শুধু এই ব্রাউজারেই আপনার ডেটা লক-আনলক করতে ব্যবহার করা যায়। বিনা এনক্রিপশনে শুধু থিম আর reduced motion সংরক্ষিত হয় (পাতা আঁকার আগেই এগুলো দরকার হয়), আর পাসকোড থাকলে কতবার ভুল চেষ্টা হয়েছে তা। এর কোনোটিই আপনার বা আপনার গেম সম্পর্কে কিছু বলে না।",
        p2: "আপনার ব্রাউজার আপনার দেখা পাতাগুলোর নিজস্ব ইতিহাস রাখে। PitMaster গেমের নাম তা থেকে দূরে রাখে: একটি গেমের ট্যাব শুধু Cash Game বা Tournament নামে থাকে। একটি টিভির ঠিকানায় অবশ্য এর কোড থাকে, যাতে রিলোডের পর টিভি সেই গেমটি আবার ধরতে পারে।",
        p3: "ব্রাউজার PitMaster-এর নিজস্ব ফাইলগুলোরও (অ্যাপটি নিজে, এর আইকন আর পাতার লে-আউট) একটি কপি রাখে যাতে সংযোগ ছাড়াই সাইট খোলা যায়। এগুলো সবার জন্য একই এবং এতে আপনার কোনো গেম বা সেটিংস থাকে না।",
        p4: "পাসকোড ছাড়াও, এর ফলে আপনার গেমগুলো এমন কারও কাছে পড়ার অযোগ্য থাকে যে কী ব্যবহার না করে সংরক্ষিত ডেটা দেখার চেষ্টা করে, যেমন কেউ ডেভেলপার টুলসে সাইটের স্টোরেজ ঘেঁটে দেখছে। কিন্তু এটি এমন কাউকে থামাতে পারে না যে এই ব্রাউজার ব্যবহার করতে পারে: সে PitMaster খুলে আপনার গেমগুলো দেখতে পারবে। আর যেহেতু ব্রাউজার কী-টি একই ডিভাইসে রাখে, তাই যে কেউ পুরো ব্রাউজার প্রোফাইল কপি করলে ডেটার সাথে কী-টিও পেয়ে যায়। এই ডিভাইস আর এতে থাকা আপনার অ্যাকাউন্টকে অন্য যেকোনো গুরুত্বপূর্ণ জিনিসের মতোই সুরক্ষিত রাখুন। যদি কোনো পাতা নিরাপদ (https) সংযোগে না থাকে, তাহলে ব্রাউজার এনক্রিপ্ট করবে না, তাই সেক্ষেত্রে PitMaster এনক্রিপশন ছাড়া সংরক্ষণ করার বদলে সেখানে কিছুই সংরক্ষণ করে না।",
        p5pre: "একটি পাসকোড এই ফাঁকটি বন্ধ করে দেয় (দেখুন",
        passcodeLinkText: "Settings, Passcode Lock",
        p5post:
          ")। এরপর কী-টি পাসকোড থেকে তৈরি আরেকটি কী (৬ লাখ রাউন্ডের PBKDF2) দিয়ে লক হয়ে যায়, তাই এই ব্রাউজার ব্যবহার করা বা এর ফাইল কপি করা কারও পক্ষেও এটি ছাড়া কিছু খোলা সম্ভব নয়। একটি ছোট পাসকোড তবুও কারও কাছে কপি থাকলে অনুমান করে নেওয়া সম্ভব, তাই যত লম্বা তত ভালো। আপনার বেছে নেওয়া সময় ধরে কোনো কার্যকলাপ না হলে PitMaster নিজে থেকেই লক হয়ে যায়, আর তার সাথে প্রতিটি ট্যাবও লক হয়ে যায়। টিভি স্ক্রিনগুলো তাদের দেওয়া গেম দেখাতে থাকে, কিছুই পরিবর্তন করতে পারে না, আর কখনো কী ধরে রাখে না। আমরা কখনো পাসকোড দেখি না আর হারিয়ে গেলে তা ফিরিয়ে আনতেও পারি না: এটি ছাড়া, এগিয়ে যাওয়ার একমাত্র উপায় হলো ব্রাউজারে সংরক্ষিত সবকিছু মুছে ফেলা।",
        p6pre: "আপনি নিজে মুছে না ফেলা পর্যন্ত আপনার ডেটা থেকে যায় (",
        exportImportLinkText: "Settings, Export & Import",
        p6mid:
          "-এ গিয়ে, তারপর Delete Everything চাপুন), আপনার ব্রাউজারে এই সাইটের ডেটা সাফ করলে, বা একটি প্রাইভেট উইন্ডো বন্ধ করলে। সাইটের ডেটা সাফ করলে কী-টিও মুছে যায়, আর তা ছাড়া এখানে সংরক্ষিত কিছুই আর পড়া যায় না, না আপনি, না অন্য কেউ। প্রতিটি ব্রাউজার আর ডিভাইস নিজের আলাদা কপি রাখে, এই কারণেই এক্সপোর্টের সুবিধা আছে।",
      },
      exports: {
        title: "এক্সপোর্ট ফাইল",
        p1: "একটি এক্সপোর্ট আপনার ব্রাউজারের ভেতরেই তৈরি হয় আর আপনি যেখানে চান সেখানে সংরক্ষিত হয়। এটি কখনো আমাদের মধ্য দিয়ে যায় না। এতে ওপরে উল্লেখিত সবকিছু থাকে, খেলোয়াড়দের নাম আর পে লিংকসহ।",
        p2: "আপনি অন্তত ৮ অক্ষরের একটি পাসওয়ার্ড দিয়ে পুরো এক্সপোর্ট লক করতে পারেন। এরপর এটি পাসওয়ার্ড থেকে তৈরি একটি কী (৬ লাখ রাউন্ডের PBKDF2) এর অধীনে AES-256-GCM দিয়ে এনক্রিপ্ট হয়, আর এটি ছাড়া শুধু ফাইলের ধরন আর তারিখই পড়া যায়। পাসওয়ার্ড যত লম্বা হবে, তা অনুমান করা তত কঠিন হবে। আমরা কখনো পাসওয়ার্ড দেখি না আর হারিয়ে গেলে তা ফিরিয়ে আনতেও পারি না। পাসওয়ার্ড ছাড়া একটি ফাইল, যেমন অন্য কোনো ডিভাইসে নেওয়া একটি একক গেম, তা যার কাছেই থাকুক না কেন সে পড়তে পারবে, আর আপনার ডাউনলোড বা কপি করা কোনো স্প্রেডশিট বা রিক্যাপও তাই। এগুলো আপনার বিশ্বাসযোগ্য কোনো জায়গায় রাখুন আর শুধু তাদের সাথেই শেয়ার করুন যাদের দেখা উচিত।",
      },
      tv: {
        title: "টিভি কোড",
        p1: "একই কম্পিউটারে থাকা একটি টিভি উইন্ডো সরাসরি ডিলার স্ক্রিন থেকে গেমটি পায়। আপনার ডিভাইস থেকে কিছুই বের হয়ে যায় না।",
        p2: "আপনি যখন অন্য একটি ডিভাইসে গেম দেখানোর জন্য Go Live চাপেন:",
        li1: "আপনার ব্রাউজার একটি আট-অক্ষরের কোড তৈরি করে, আর তা থেকে দুটো জিনিস: একটি ID যার অধীনে আমাদের সার্ভার গেমটি ফাইল করে, আর একটি কী যা এটি লক করে। দুটোই কোডটির একটি ধীর, ওয়ান-ওয়ে হ্যাশ (PBKDF2) থেকে আসে, আর কোডটি নিজে কখনো আমাদের কাছে পাঠানো হয় না।",
        li2: "গেমে যতবার পরিবর্তন হয়, আপনার ব্রাউজার সেই কী (AES-256-GCM) দিয়ে একটি কপি এনক্রিপ্ট করে পাঠিয়ে দেয়। এই কপিতে গেম আর এর ডিসপ্লে সেটিংস থাকে (যেমন মুদ্রা, ঘড়ির ফরম্যাট আর টিভির ভলিউম), কিন্তু গেম লগ, আপনার অন্য গেম, চিপ সেট, টেমপ্লেট বা পে লিংক থাকে না।",
        li3: "আমাদের সার্ভার শুধু লক করা কপি, ID, আর একটি আলাদা write key-এর একটি ওয়ান-ওয়ে হ্যাশ (SHA-256) সংরক্ষণ করে যা শুধু আপনার ব্রাউজারই ধরে রাখে, তাই শুধু আপনিই এটি পরিবর্তন বা মুছতে পারেন। কপিটি আনলক করার কোনো উপায় সার্ভারের নেই।",
        li4: "যে স্ক্রিনকে কোডটি দেওয়া হয়েছে সেটি একই ID আর কী তৈরি করে, কপিটি নিয়ে আসে আর তা আনলক করে। টিভি লিংকগুলো একটি “#” এর পরে কোডটি বহন করে, ঠিকানার এমন একটি অংশ যা ব্রাউজার কখনো কোনো সার্ভারে পাঠায় না।",
        li5: "আপনি Stop Sharing চাপার সাথে সাথে বা গেমটি মুছে ফেললে, অথবা এর শেষ আপডেটের দুই দিন পর স্বয়ংক্রিয়ভাবে, কপিটি মুছে যায়। Stop Sharing-এর পর, কোনো গেম নেই এমন একটি ফাঁকা রেকর্ড কোডটিকে সেই দুই দিন পার হওয়া পর্যন্ত পুনরায় ব্যবহার হওয়া থেকে আটকে রাখে।",
        p3: "যার কাছেই কোডটি আছে, বা যে এটি অনুমান করে ফেলে, সে শেয়ার করার সময় গেমটি দেখতে পারবে, তাই এতে এমন কিছু রাখবেন না যা আপনি পুরো টেবিলকে দেখাতে চান না। ফোনও এর মধ্যে পড়ে: টিভি আর ডিলার স্ক্রিন লিংকটি QR কোড হিসেবে দেখায়, যা ডিভাইসেই তৈরি হয়, আর ফোন সেই একই কপি পায় যা টিভি পায়। ‘আমাকে খুঁজুন’ ফোনেই সেই কপিতে খোঁজে, আর সেখানে লেখা কিছুই সেভ বা পাঠানো হয় না।",
      },
      protected: {
        title: "এটি কীভাবে সুরক্ষিত",
        li1: "সাইট আর টিভি কোড সার্ভার, দুটোই এনক্রিপ্টেড সংযোগে (HTTPS) পরিবেশিত হয়, আর ব্রাউজারগুলোকে এর চেয়ে কম নিরাপদ কিছু কখনো ব্যবহার না করতে বলে।",
        li2: "সাইট কোনো থার্ড-পার্টি কোড লোড করে না: কোনো বিজ্ঞাপন, অ্যানালিটিক্স, ট্র্যাকার বা বাইরের ফন্ট নেই। একটি কঠোর কনটেন্ট সিকিউরিটি পলিসি পাতাটিকে আমাদের বাইরে অন্য কোনো স্ক্রিপ্ট চালাতে বা আমাদের বাইরে অন্য কোনো সার্ভারের সাথে কথা বলতে বাধা দেয়।",
        li3: "ওপরে বর্ণিত হিসাবে, আপনার ডেটা আপনার ডিভাইসে, আমাদের সার্ভারে আর পাসওয়ার্ড-লকড এক্সপোর্টে এনক্রিপ্টেড থাকে।",
        li4: "টিভি কোড অনুমান করার চেষ্টা করা যে কাউকে ধীর করতে, টিভি কোড সার্ভার প্রতিটি IP ঠিকানার রিকোয়েস্ট মিনিটে মিনিটে গোনে। এই গণনাগুলো শুধু মেমোরিতে থাকে আর কখনো সংরক্ষিত বা লগ করা হয় না।",
        li5: "আপনার ইমপোর্ট করা ফাইলগুলো কিছু সংরক্ষণের আগেই যাচাই করা হয়, আর যেটি একদম PitMaster এক্সপোর্টের মতো দেখায় না তা সম্পূর্ণভাবে প্রত্যাখ্যান করা হয়।",
        p1: "কোনো সিস্টেমই পুরোপুরি নিরাপদ নয়, আর PitMaster একটি সাইড প্রজেক্ট, কোনো অডিট করা সিকিউরিটি প্রোডাক্ট নয়। এতে এমন কিছু রাখবেন না যা হারানো বা অন্য কারও দেখে ফেলা আপনি সহ্য করতে পারবেন না।",
      },
      phones: {
        title: "খেলোয়াড়দের ফোন",
        p1: "লায়ার্স ডাইসে ফোনকে কাপ হিসেবে ব্যবহার করলে, প্রত্যেক খেলোয়াড়ের ফোনই তার কাপ। হোস্টের স্ক্রিন প্রত্যেক খেলোয়াড়কে তার নিজের আসনের একটি কোড দেখায়, আর যে কী দিয়ে একটি ফোন সেই আসনে লিখতে পারে, সেটি সেই ফোন আর হোস্টের স্ক্রিন ছাড়া আর কোথাও যায় না।",
        li1: "একটি ফোন যা পাঠায়: প্রথমে রাউন্ডের জন্য তার সংখ্যাগুলোর একটি হ্যাশ (যা কিছুই ফাঁস করে না), তারপর কোনো ডাকে চ্যালেঞ্জ হলে সংখ্যাগুলো নিজেই। দুটোই ফোনেই গেমের কী দিয়ে লক করা হয়, ঠিক টিভির কপির মতো।",
        li2: "সার্ভার যা দেখতে পায়: গেমের ID, প্রতিটি আসনের ID, প্রতিটি আসনের কী-এর একটি SHA-256, আর এনক্রিপ্ট করা লেখা। এর কাছে কখনো কোনো আসনের কী, কোনো খেলোয়াড়ের নাম বা কারও পাশা থাকে না।",
        li3: "হোস্টের স্ক্রিন যা দেখতে পায়: শুধু যা কোনো ফোন আগেই দেখিয়েছে। হোস্টের নিজের সংখ্যাগুলো প্রতিটি পাশার অর্ধেক, আর ফোনের অর্ধেক ছাড়া সেগুলো কোনো কাজে আসে না।",
        li4: "একটি ফোন রাউন্ডের জন্য তার নিজের সংখ্যাগুলো লক করে রাখে, ফোনেই তৈরি এমন একটি কী দিয়ে যা কোনো স্ক্রিপ্ট পড়তে পারে না, তাই রিলোড করলেও কাপ হারায় না। কিছুই সাধারণ লেখায় রাখা হয় না।",
        p2: "লাইভের সবকিছুর মতো, হোস্ট শেয়ার করা বন্ধ করলে, অথবা শেষ আপডেটের দুই দিন পর, মেইলবক্সগুলো মুছে যায়।",
      },
      host: {
        title: "আমাদের হোস্ট",
        p1pre:
          "সাইট আর টিভি কোড সার্ভার, দুটোই Cloudflare-এ চলে। পাতা পৌঁছে দিতে আর আক্রমণ ঠেকাতে, Cloudflare প্রতিটি রিকোয়েস্টের প্রযুক্তিগত তথ্য, যেমন IP ঠিকানা আর ব্রাউজারের ধরন,",
        linkText: "তাদের নিজস্ব গোপনীয়তা নীতির",
        p1post: "অধীনে সামলায়। আমরা কোনো অ্যানালিটিক্স, বিজ্ঞাপন বা ট্র্যাকিং কুকি যোগ করি না, আপনি কী করেন তা লগ করি না, আর আপনার সম্পর্কে কিছুই বিক্রি বা শেয়ার করি না।",
      },
      other: {
        title: "অন্যান্য সেবা",
        li1: "পে লিংকগুলো Venmo, Cash App বা PayPal খুলে দেয় একটি পরিমাণ আর গেমের নাম আগে থেকেই পূরণ করা অবস্থায়। সেখানে যা ঘটে তা শুধু আপনার আর তাদের মধ্যেই।",
        li2: "অ্যানাউন্সার শুধু আপনার ডিভাইসে থাকা কণ্ঠস্বরই ব্যবহার করে, তাই এটি যা পড়ে তা কখনো আপনার ডিভাইস ছেড়ে যায় না। যেখানে ব্রাউজার শুধু অনলাইন কণ্ঠস্বর দেয়, সেখানে অ্যানাউন্সার চুপ থাকে।",
        li3: "অন্য সাইটের লিংক সেসব সাইটের নিজস্ব নীতি অনুসরণ করে।",
      },
      choices: {
        title: "আপনার বিকল্প",
        li1pre: "এখান থেকে যেকোনো সময় সব কিছু মুছে ফেলুন",
        li1post: "অথবা আপনার ব্রাউজারে এই সাইটের ডেটা সাফ করে।",
        li2: "যেকোনো সময় একটি টিভি কোড শেয়ার করা বন্ধ করুন, আর আমাদের সার্ভারে থাকা কপিটি সাথে সাথে মুছে যাবে।",
        li3: "যেহেতু আমরা আপনার পরিচয় জানায় এমন কিছুই ধরে রাখি না, তাই অনুরোধে খুঁজে দেখার, ঠিক করার, হস্তান্তর করার বা মুছে ফেলার মতো কিছুই আমাদের কাছে নেই। সবকিছু আগে থেকেই আপনার হাতে আছে।",
      },
      children: {
        title: "শিশুরা",
        p1: "PitMaster প্রাপ্তবয়স্কদের জন্য তৈরি। এটি শিশুদের জন্য নয়, আর আমরা যেকোনো বয়সের কারও কাছ থেকে জেনেশুনে তথ্য সংগ্রহ করি না।",
      },
      changes: { p1: "এই নীতি পরিবর্তন হলে, নতুন সংস্করণ এখানেই প্রকাশ হবে আর ওপরের তারিখও তার সাথে পরিবর্তিত হবে।" },
      contact: { p1pre: "গোপনীয়তা নিয়ে প্রশ্ন আছে? Wyzie LLC-এর সাথে যোগাযোগ করুন" },
    },
    terms: {
      intro: {
        pre: "এই শর্তাবলী আপনার আর Wyzie LLC (“আমরা”) এর মধ্যে একটি চুক্তি, যারা PitMaster প্রকাশ করে",
        post: "PitMaster ব্যবহার করার মানে আপনি এতে সম্মত। যদি সম্মত না হন, তাহলে দয়া করে এটি ব্যবহার করবেন না।",
      },
      what: {
        title: "PitMaster কী",
        p1: "PitMaster একটি বিনামূল্যের, ওপেন সোর্স সাইড প্রজেক্ট, যা সম্পূর্ণভাবে একজন মাত্র মানুষ তৈরি করেছেন এবং Wyzie LLC প্রকাশ করেছে, যাতে যে কেউ নিজের পোকার গেমে, যেকোনো আকারে, এটি ব্যবহার করতে পারে। এটি চিপের হিসাব, ব্লাইন্ড ক্লক, বাই-ইন, রেক, পেআউট, সেটল-আপ আর একটি টিভি ডিসপ্লে সামলায়। এটি রেকর্ড রাখে আর গাণিতিক হিসাব করে। এটি কোনো বাজি নেয় না, টাকা ধরে রাখে না বা সরায় না, বা নিজে কোনো গেম চালায় না, আর এটি কোনো জুয়ার সেবা নয়। এর সাথে কোনো সাপোর্ট, কোনো গ্যারান্টি, বা এটি চিরকাল থাকবে এমন কোনো প্রতিশ্রুতি নেই।",
      },
      yourChoice: {
        title: "এটি কীভাবে ব্যবহার করবেন তা আপনার সিদ্ধান্ত",
        p1: "PitMaster ব্যবহার করবেন কিনা, আর কীভাবে করবেন, তা আপনার নিজের সিদ্ধান্ত, আর এই সিদ্ধান্ত এবং এর থেকে উদ্ভূত সবকিছুর জন্য আপনিই একমাত্র দায়ী: আপনি যে গেম চালান, আপনি যে নিয়ম, স্টেক আর ফি নির্ধারণ করেন, যে টাকা হাত বদল হয়, আপনি যে তথ্য দেন, আর স্ক্রিনে আপনি যা কিছু শেয়ার বা প্রদর্শন করেন। আমরা কোনো গেম তদারকি, যাচাই বা অনুমোদন করি না, আর PitMaster যা কিছু দেখায় তা কোনো আইনি, আর্থিক বা কর সংক্রান্ত পরামর্শ নয়।",
      },
      legalGame: {
        title: "একটি বৈধ গেম চালানো",
        p1: "পোকার সংক্রান্ত আইন জায়গাভেদে অনেক আলাদা। কিছু জায়গায় লাইসেন্সপ্রাপ্ত জায়গার বাইরে সত্যিকারের টাকার পোকার খেলার অনুমতি নেই, আর অনেক জায়গায় লাইসেন্সপ্রাপ্ত পরিচালক ছাড়া অন্য কারও রেক, সিট ফি বা অন্য কোনো কাট নেওয়া নিষিদ্ধ। এটা নিশ্চিত করা আপনার দায়িত্ব যে PitMaster দিয়ে আপনি যে গেমই চালান না কেন, আর তাতে আপনি যে সেটিংসই ব্যবহার করুন না কেন, তা আপনি যেখানে খেলছেন সেখানে বৈধ, আপনার কাছে প্রয়োজনীয় লাইসেন্স আছে, এতে জড়িত যেকোনো কর ঘোষণা করা আর পরিশোধ করা হয়েছে, আর টেবিলে থাকা সবাই বয়সে যথেষ্ট বড়।",
        p2: "কোনো গেমিং নিয়ন্ত্রক সংস্থা থেকে PitMaster প্রত্যয়িত বা অনুমোদিত নয়। আপনি যদি একটি লাইসেন্সপ্রাপ্ত বা বাণিজ্যিক জায়গা চালান, তাহলে আপনার নিয়ম এটির অনুমতি দেয় কিনা তা আপনার ওপর নির্ভর করে, আর এটি আপনার রাখতে বাধ্য এমন কোনো রেকর্ডের বিকল্প নয়।",
      },
      data: {
        title: "আপনার ডেটা",
        p1: "আপনি যা কিছু লেখেন তা আপনার ব্রাউজারে সংরক্ষিত থাকে, এনক্রিপ্টেড অবস্থায় (দেখুন",
        p2: ")। এটি আপনার, আর এটি নিরাপদ রাখাও আপনার দায়িত্ব। ব্রাউজার সাফ করা, ডিভাইস হারানো বা পরিবর্তন করা, ব্রাউজারের সমস্যা বা কোনো বাগ এটি মুছে ফেলতে পারে বা পড়ার অযোগ্য করে দিতে পারে, আর তা পুনরুদ্ধার করার জন্য আমাদের কাছে কোনো কপি নেই।",
        p3: "প্রায়ই, আর আপনার এক্সপোর্টগুলো নিরাপদ কোথাও রাখুন। আপনি যদি কোনো এক্সপোর্ট পাসওয়ার্ড দিয়ে লক করেন আর পাসওয়ার্ড হারিয়ে ফেলেন, তাহলে ফাইলটি খোলা যাবে না, না আপনার দ্বারা, না আমাদের দ্বারা।",
      },
      math: {
        title: "হিসাব যাচাই করুন",
        p1: "পেআউট, রেক, সেটল-আপের পরিমাণ, ডিল ক্যালকুলেশন আর ব্লাইন্ড স্ট্রাকচার সৎভাবেই হিসাব করা হয়, কিন্তু এগুলো ভুল হতে পারে, বা আপনার গেমের জন্য উপযুক্ত নাও হতে পারে। টাকা হাত বদল হওয়ার আগে যা গুরুত্বপূর্ণ তা যাচাই করে নিন। টেবিলে মতবিরোধ টেবিলেই মেটানোর বিষয়।",
      },
      fair: {
        title: "সঠিকভাবে ব্যবহার করা",
        p1: "PitMaster বা এর টিভি কোড সার্ভারের অপব্যবহার করবেন না: এটির ওপর বাড়তি চাপ দেবেন না, অন্যদের কোড অনুমান করা বা সংগ্রহ করার চেষ্টা করবেন না, এর নিরাপত্তা এড়িয়ে যাবেন না, এটি আইন ভাঙতে ব্যবহার করবেন না, বা পোকার গেম ছাড়া অন্য কিছু এতে সংরক্ষণ করবেন না। শুধু সেই তথ্যই দিন যা শেয়ার করার অধিকার আপনার আছে। এই নিয়ম ভাঙা ব্যবহার আমরা সীমিত বা বন্ধ করে দিতে পারি।",
      },
      code: {
        title: "কোড",
        p1pre: "PitMaster-এর কোড সর্বজনীনভাবে এখানে আছে:",
        p1mid: "এর অধীনে",
        p1post:
          ": আপনি এটি পড়া, কপি করা, পরিবর্তন করা আর সেই লাইসেন্সের শর্তে নিজের কপি চালানোর ক্ষেত্রে স্বাধীন। লাইসেন্সটি শুধু কোডকে কভার করে; এই শর্তাবলী pitmaster.cc-তে PitMaster ব্যবহারকে কভার করে। অন্য কেউ চালানো কপি তার নিজের, আমাদের নয়: এই শর্তাবলী আর আমাদের গোপনীয়তা নীতি তাতে প্রযোজ্য নয়, আর আমরা তার জন্য দায়ী নই। লাইসেন্সটিতে PitMaster নামটি অন্তর্ভুক্ত নয়, তাই আপনি যদি নিজের কপি প্রকাশ করেন, তাহলে এটিকে নিজস্ব একটি নাম দিন যাতে কেউ একে এটির সাথে গুলিয়ে না ফেলে।",
      },
      trademarks: {
        title: "নাম আর ট্রেডমার্ক",
        p1: "বিল্ট-ইন চিপ সেটগুলোর নাম রাখা হয়েছে সেই আসল পণ্যের নামে যাদের সাথে এগুলো মেলে, যেমন DA VINCI, KardShark, Playzaic আর Casino Supply-এর মতো প্রস্তুতকারক, আর পে লিংকগুলোতে Venmo, Cash App আর PayPal-এর নাম আছে। এই নামগুলো তাদের নিজ নিজ মালিকদের। PitMaster এদের কোনোটির সাথেই সংযুক্ত নয় বা এদের কোনোটি দ্বারা অনুমোদিতও নয়।",
      },
      warranty: {
        title: "কোনো ওয়ারেন্টি নেই",
        p1: "PitMaster “যেমন আছে” আর “যতটা পাওয়া যায়” সেভাবেই দেওয়া হয়, কোনো ধরনের ওয়ারেন্টি ছাড়াই, প্রকাশ্য বা অন্তর্নিহিত, যার মধ্যে আছে বাণিজ্যযোগ্যতা, একটি নির্দিষ্ট উদ্দেশ্যের জন্য উপযুক্ততা, নির্ভুলতা, নিরাপত্তা আর অ-লঙ্ঘন। আমরা প্রতিশ্রুতি দিই না যে এটি সঠিক, নিরাপদ, বাধাহীন বা ত্রুটিমুক্ত থাকবে, বা আপনার ডেটা নিরাপদ থাকবে বা পুনরুদ্ধারযোগ্য হবে। আমরা যেকোনো সময় কোনো নোটিশ ছাড়াই PitMaster পরিবর্তন, সীমিত বা বন্ধ করে দিতে পারি, আর এটি কোনো গেমের মাঝখানেও নষ্ট হতে বা অফলাইন হয়ে যেতে পারে।",
      },
      liability: {
        title: "দায়বদ্ধতার সীমা",
        p1: "আইন যতটা অনুমতি দেয় তার সর্বোচ্চ পরিসরে, Wyzie LLC বা PitMaster তৈরিকারী ব্যক্তি, কেউই কোনো পরোক্ষ, আনুষঙ্গিক, বিশেষ, ফলস্বরূপ বা শাস্তিমূলক ক্ষতির জন্য দায়ী নয়, আর PitMaster ব্যবহারের ফলে বা তার সাথে সম্পর্কিত ডেটা হারানো, টাকা হারানো, লাভ হারানো, জুয়ার ক্ষতি, আইনি ঝামেলা বা খেলোয়াড়দের মধ্যে বিরোধের জন্যও দায়ী নয়, এমনকি যদি আমাদের বলা হয়ে থাকে যে এগুলো ঘটতে পারে। যেখানে দায়বদ্ধতা বাদ দেওয়া যায় না, সেখানে সব দাবি মিলিয়ে আপনার প্রতি আমাদের মোট দায়বদ্ধতা $50 পর্যন্ত সীমাবদ্ধ। কিছু জায়গায় এই সীমা অনুমোদিত নয়, তাই এর কিছু আপনার ক্ষেত্রে প্রযোজ্য নাও হতে পারে।",
      },
      indemnity: {
        title: "ক্ষতিপূরণ",
        p1: "আপনি এটি যেভাবে ব্যবহার করেছেন, এর সাহায্যে চালানো কোনো গেমের কারণে, বা এই শর্তাবলী বা আইন ভাঙার কারণে যদি কেউ Wyzie LLC বা PitMaster তৈরিকারী ব্যক্তির বিরুদ্ধে কোনো দাবি করে, তাহলে আপনি আইন যতটা অনুমতি দেয় ততটুকু পর্যন্ত, যুক্তিসঙ্গত আইনি ফিসহ, এর ফলে সৃষ্ট ক্ষতি আর খরচ বহন করতে সম্মত হন।",
      },
      rest: {
        title: "বাকি অংশ",
        p1pre: "এই শর্তাবলীর কোনো অংশ প্রয়োগ করা না গেলে, বাকি অংশ তবু প্রযোজ্য থাকবে। কোনো অংশ প্রয়োগ না করা মানে এটি ছেড়ে দেওয়া নয়। এই শর্তাবলী আর",
        p1post: "PitMaster নিয়ে আপনার আর আমাদের মধ্যে সম্পূর্ণ চুক্তি।",
      },
      changes: { p1: "আমরা এই শর্তাবলী আপডেট করতে পারি। ওপরের তারিখ বলে দেয় এগুলো শেষ কবে পরিবর্তিত হয়েছে, আর কোনো পরিবর্তনের পর PitMaster ব্যবহার চালিয়ে যাওয়ার মানে আপনি নতুন সংস্করণ মেনে নিচ্ছেন।" },
      contact: { p1pre: "এই শর্তাবলী নিয়ে প্রশ্ন আছে? Wyzie LLC-এর সাথে যোগাযোগ করুন" },
    },
  },
  pt: {
    lastUpdated: "Última atualização em 26 de setembro de 2026",
    changesTitle: "Alterações",
    contactTitle: "Contato",
    nav: { privacyPolicy: "Política de Privacidade", termsOfUse: "Termos de Uso" },
    links: { privacy: "Privacidade", export: "Exportar" },
    help: {
      sub: "Como o PitMaster funciona, o que ele pode fazer e onde ficam guardadas as suas partidas.",
      onThisPage: "Nesta página",
      nav: {
        start: "Primeiros Passos",
        dealing: "Conduzindo uma Partida",
        tv: "A TV",
        calculator: "Calculadora",
        keys: "Atalhos",
        data: "Seus Dados",
      },
      start: { welcomeBack: "Mostrar as Boas-Vindas na Página Inicial Outra Vez" },
      dealing: {
        cashTitle: "Partidas em Dinheiro",
        cashBody:
          "Defina as blinds e a faixa de buy-in, depois adicione os jogadores conforme se sentarem. Recompras e cash-outs levam um toque cada, e o banco mantém a contagem de cada ficha na mesa. Quando a partida termina, o Settle Up calcula quem paga a quem, com links do Venmo, Cash App e PayPal caso você queira. Os jogos extras também têm seus interruptores: bomb pots com cronômetro ou quando pedido, o jogo do 7-2 e um prêmio para a mão mais alta que a casa paga no acerto. Os custos divididos repartem o que foi comprado para o jogo, e Quem Deve a Quem marca os pagamentos e mantém a conta na página Jogadores. Uma lista de espera guarda quem é o próximo a sentar, e a TV avisa quando um lugar abre.",
        tourneyTitle: "Torneios",
        tourneyBody:
          "Escolha por quanto tempo quer jogar e o PitMaster monta a estrutura de blinds sob medida: pilhas iniciais, intervalos, antes, recompras, add-ons e bounties. Elimine jogadores conforme saem e os pagamentos, a pilha média e o balanceamento de mesas acompanham sozinhos. Na mesa final, a calculadora de acordo divide o prêmio por contagem de fichas ou por ICM. Os bounties podem ser fixos, progressivos (PKO) ou envelopes misteriosos, e Começar de traz formatos prontos como Turbo, Deepstack e Sit & Go. Quando há um vencedor, Acertar as Contas mostra o que a casa paga a cada jogador. Os satélites dão vagas em outro jogo, e nos shootouts cada mesa joga até um vencedor antes da mesa final. Uma chave heads-up é jogada um contra um: sorteie a chave, clique no vencedor de cada partida e a TV mostra quem joga contra quem.",
        paletteTitle: "Faça Qualquer Coisa Digitando o Nome",
        paletteBody1: "Pressione",
        paletteBody2:
          "em qualquer lugar para abrir Comandos. Digite o que quiser, como “próximo nível”, “eliminar mike” ou “novo torneio”, e pressione Enter. Erros acontecem em toda mesa:",
        paletteBody3: "desfaz a última alteração feita na tela do dealer.",
        everyTitle: "Cada Partida É Diferente",
        everyBody1: "Rake, taxa da casa, bounties, recompras, assentos, acordos e links de pagamento têm cada um seu próprio interruptor em",
        everyBody2: "então uma partida pequena e tranquila e um torneio de quarenta jogadores usam apenas o que precisam. As ligas pontuam uma temporada de jogos, com a classificação em Jogadores e na TV. Outros Jogos de Pôquer adiciona Omaha, stud, razz, draw e jogos mistos como HORSE, um jogo por nível, e dealer's choice no cash, com os limites de cada jogo na TV. Não é só pôquer: o Dado Mentiroso acompanha os dados de cada jogador, calcula quem perde um pela chamada e acerta um pote de entrada ou dinheiro por dado perdido. Os jogos de vidas (31, Screw Your Neighbor, Knock-Out Whist, Ship, Captain and Crew) contam vidas até sobrar um vencedor, e os jogos de pote (In-Between, Guts, Bourré, Pass the Pigs) mantêm um pote com limite, e os dois acertam as contas como todo o resto.",
      },
      tv: {
        body1a: "Há duas formas de colocar a partida em uma tela grande. Em um notebook ligado à TV, toque em",
        openWindow: "Abrir Janela da TV",
        body1b: "na tela do dealer e arraste a janela para a TV. Para qualquer outra tela (o navegador de uma smart TV, um tablet, o celular de alguém), toque em",
        goLive: "Ficar Ao Vivo",
        body1c: "depois abra",
        body1d: "nessa tela e digite o código de 8 caracteres.",
        body2a: "A TV mostra o relógio, as blinds, os pagamentos e as mensagens que você envia à mesa, e se mantém atualizada sozinha. Ela não pode mudar nada, e uma partida ao vivo é criptografada de ponta a ponta no caminho até lá. Pressione",
        body2b: "na TV para tela cheia e",
        body2c: "para o som. Os celulares também podem acompanhar: escaneie o QR code na TV ou na tela do dealer e digite seu nome em Me Encontre para ver seu assento e sua posição.",
      },
      calculator: {
        press: "Pressione",
        onAnyPage: "em qualquer página.",
        onAnyPageOr: "em qualquer página, ou",
        openNow: "abra-a agora",
        floats: "Ela flutua sobre a página, então você pode arrastá-la para fora do caminho, encolhê-la até sobrar só o resultado, ou ativar o modo Fantasma para ver através dela e clicar na página por baixo.",
        li1a: "Digite contas direto pelo teclado.",
        li1b: "dá o resultado,",
        li1c: "limpa, e",
        li1d: "apaga o último dígito.",
        li2a: "Ela faz × e ÷ antes de + e −, como no papel, e parênteses também funcionam:",
        li3a: "A porcentagem funciona como em um caixa registradora:",
        li3b: "dá 220.",
        li4a: "Digite",
        li4b: "ou",
        li4c: "depois de um número para milhares ou milhões, para digitar uma pilha rapidamente:",
        li5a: "Depois de pressionar",
        li5b: "o resultado também aparece em fichas do seu set, com o menor número possível delas, para você saber o que entregar.",
        li6a: "Todo resultado entra no histórico. Clique em uma conta para alterá-la, ou no resultado dela para usá-lo.",
        li6b: "e",
        li6c: "percorrem os resultados,",
        addUp: "Somar Tudo",
        li6d: "soma todos eles (os cash-outs de uma partida, por exemplo), e",
        li6e: "Copiar",
        into: "Inserir",
        li7: "coloca o resultado na última caixa numérica em que você estava, como um buy-in ou uma contagem de fichas.",
        li8: "Nada digitado nela é salvo, jamais.",
        potKey: "Pot Limit",
        li9: "calcula o maior aumento possível num jogo pot limit. Pegue o pote do visor, depois o valor para pagar, e ele mostra até quanto alguém pode aumentar. Toque nele para usar.",
      },
      keys: { note: "Nenhum desses atalhos dispara enquanto você digita em uma caixa. O atalho de Comandos pode ser alterado em" },
      data: {
        q1: "Onde Minhas Partidas Ficam Guardadas?",
        a1a: "Neste navegador, neste dispositivo, criptografadas. Não há contas, então mais ninguém tem uma cópia, nós incluídos. Adicione uma senha em",
        a1b: "e nada abre sem ela.",
        q2: "Funciona Offline?",
        a2: "Sim. Depois de aberto uma vez em um navegador, o PitMaster carrega e roda ali sem conexão, janela de TV incluída. Só o Ficar Ao Vivo precisa de conexão, nas duas telas.",
        q3: "Como Eu Passo para Outro Dispositivo?",
        a3a: "tudo para um arquivo, depois importe no outro dispositivo. Uma única partida também pode ser movida:",
        moveDevice: "Mover para Outro Dispositivo",
        a3b: "fica na tela do dealer, e a partida continua por lá, código de TV incluído.",
        q4: "E Se Eu Limpar Meu Navegador?",
        a4: "Limpar os dados deste site apaga para sempre o que está guardado aqui, então exporte antes se quiser manter.",
        q5: "Custa Alguma Coisa?",
        a5a: "Não. O PitMaster é gratuito, sem anúncios e sem rastreamento, e seu código é aberto em",
        a5b: "tem os detalhes.",
        q6: "Algo Não Está Certo?",
        a6a: "Fale conosco em",
        a6b: "ou abra uma issue em",
        a6c: "Por favor, não nos envie nada das suas partidas; nunca precisamos disso.",
      },
    },
    privacy: {
      intro: {
        pre: "O PitMaster (",
        post:
          ") é um projeto paralelo gratuito e de código aberto, feito inteiramente por uma única pessoa e publicado pela Wyzie LLC (“nós”). Ele é feito para que suas partidas nunca precisem sair do seu dispositivo, e esta página diz exatamente quando algo sai.",
      },
      short: {
        title: "A Versão Resumida",
        li1: "Não há contas nem um banco de dados das suas partidas. Não sabemos quem você é.",
        li2: "Tudo o que você insere é salvo neste navegador, neste dispositivo, criptografado com uma chave que só este navegador possui. Adicione uma senha e nada abre sem ela. Não conseguimos ver nada disso, e não conseguimos recuperar se for perdido.",
        li3: "A única exceção: enquanto uma partida tem um código de TV, uma cópia criptografada dela fica em nosso servidor para que outras telas possam mostrá-la. Ela é trancada com uma chave feita a partir do código de TV, que nunca vemos, e é apagada quando você para de compartilhar, ou dois dias após sua última alteração.",
        li4: "Sem anúncios, sem análises, sem cookies de rastreamento e sem scripts de terceiros.",
        li5pre: "O código do PitMaster é público em",
        li5post: "para que qualquer um possa conferir que ele faz o que esta página diz.",
      },
      onDevice: {
        title: "O Que Fica Guardado no Seu Dispositivo",
        lead: "O PitMaster mantém tudo no armazenamento do seu navegador:",
        li1: "Partidas: nomes dos jogadores, buy-ins, cash-outs, recompras, eliminações, assentos, pagamentos, acordos, o registro da partida e notas.",
        li2: "Seus sets de fichas e modelos.",
        li3: "Os nomes de Venmo, Cash App e PayPal que você salva para os jogadores.",
        li4: "Suas configurações.",
        p1: "Tudo isso é criptografado com AES-256-GCM antes de ser guardado. Seu navegador cria a chave aleatoriamente na sua primeira visita e a mantém de forma que nenhum script, incluindo os nossos, consiga lê-la; ela só pode ser usada, neste navegador, para trancar e destrancar seus dados. As únicas coisas guardadas sem criptografia são o tema e a redução de movimento (a página precisa delas antes mesmo de se desenhar) e, com uma senha, quantas tentativas erradas foram feitas. Nada disso diz qualquer coisa sobre você ou suas partidas.",
        p2: "Seu navegador mantém seu próprio histórico das páginas visitadas. O PitMaster mantém os nomes das partidas fora dele: a aba de uma partida se chama simplesmente Partida em Dinheiro ou Torneio. O endereço de uma TV, esse sim, contém seu código, para que a TV possa retomar a partida depois de uma recarga.",
        p3: "O navegador também guarda uma cópia dos próprios arquivos do PitMaster (o aplicativo em si, seus ícones e o layout das páginas) para que o site abra sem conexão. Eles são iguais para todos e não contêm nenhuma das suas partidas ou configurações.",
        p4: "Mesmo sem senha, isso mantém suas partidas ilegíveis para qualquer coisa que examine os dados salvos sem usar a chave, como alguém olhando o armazenamento do site nas ferramentas de desenvolvedor. Isso não impede quem consiga usar este navegador: essa pessoa pode abrir o PitMaster e ver suas partidas. E como o navegador guarda a chave no mesmo dispositivo, quem copiar todo o perfil do navegador leva a chave junto com os dados. Proteja o dispositivo e sua conta nele como faria com qualquer outra coisa importante. Se uma página não estiver em uma conexão segura (https), os navegadores não vão criptografar, então o PitMaster não guarda nada ali, em vez de guardar sem criptografia.",
        p5pre: "Uma senha fecha essa brecha (veja",
        passcodeLinkText: "Configurações, Bloqueio por Senha",
        p5post:
          "). A chave passa então a ficar trancada por outra chave feita a partir da senha (PBKDF2 com 600.000 rodadas), então nada salvo pode ser aberto sem ela, mesmo por alguém usando este navegador ou copiando seus arquivos. Uma senha curta ainda pode ser adivinhada por quem tiver uma cópia, então quanto mais longa, melhor. O PitMaster se tranca sozinho depois do tempo que você escolher sem uso, e todas as abas se trancam junto. As telas de TV continuam mostrando a partida que receberam, não podem mudar nada, e nunca guardam a chave. Nunca vemos a senha e não conseguimos recuperar uma perdida: sem ela, o único caminho é apagar tudo o que está salvo no navegador.",
        p6pre: "Seus dados ficam guardados até você apagá-los (",
        exportImportLinkText: "Configurações, Exportar e Importar",
        p6mid:
          ", depois Apagar Tudo), limpar os dados deste site no seu navegador, ou fechar uma janela privada. Limpar os dados do site também apaga a chave, e sem ela nada guardado aqui pode ser lido de novo, nem por você nem por ninguém. Cada navegador e dispositivo guarda sua própria cópia separada, e é por isso que as exportações existem.",
      },
      exports: {
        title: "Arquivos de Exportação",
        p1: "Uma exportação é criada dentro do seu navegador e salva onde você escolher. Ela nunca passa por nós. Contém tudo o que foi listado acima, nomes dos jogadores e links de pagamento incluídos.",
        p2: "Você pode trancar uma exportação completa com uma senha de pelo menos 8 caracteres. Ela é então criptografada com AES-256-GCM sob uma chave feita a partir da senha (PBKDF2 com 600.000 rodadas), e sem ela só o tipo do arquivo e a data podem ser lidos. Quanto mais longa a senha, mais difícil de adivinhar. Nunca vemos a senha e não conseguimos recuperar uma perdida. Um arquivo sem senha, como uma única partida movida para outro dispositivo, pode ser lido por qualquer um que o tenha, assim como uma planilha ou resumo que você baixa ou copia. Guarde-os em algum lugar de confiança e compartilhe apenas com quem deve vê-los.",
      },
      tv: {
        title: "Códigos de TV",
        p1: "Uma janela de TV no mesmo computador pega a partida direto da tela do dealer. Nada sai do seu dispositivo.",
        p2: "Quando você pressiona Ficar Ao Vivo para mostrar uma partida em outro dispositivo:",
        li1: "Seu navegador cria um código de oito caracteres, e a partir dele duas coisas: um ID sob o qual nosso servidor arquiva a partida, e uma chave que a tranca. Ambos vêm de um hash lento e de mão única do código (PBKDF2), e o código em si nunca é enviado para nós.",
        li2: "A cada mudança na partida, seu navegador criptografa uma cópia com essa chave (AES-256-GCM) e a envia. A cópia tem a partida e suas configurações de exibição (como a moeda, o formato do relógio e o volume da TV), mas não o registro da partida, suas outras partidas, sets de fichas, modelos ou links de pagamento.",
        li3: "Nosso servidor guarda a cópia trancada, o ID e um hash de mão única (SHA-256) de uma chave de escrita separada que só o seu navegador possui, então só você pode alterá-la ou apagá-la. Ele não tem como destrancar a cópia.",
        li4: "Uma tela que recebe o código gera o mesmo ID e chave, busca a cópia e a destranca. Links de TV carregam o código depois de um “#”, uma parte do endereço que os navegadores nunca enviam a um servidor.",
        li5: "A cópia é apagada assim que você pressiona Parar de Compartilhar ou apaga a partida, ou automaticamente dois dias após sua última atualização. Depois de Parar de Compartilhar, um registro em branco sem nenhuma partida impede que o código seja reutilizado até que esses dois dias passem.",
        p3: "Quem tiver o código, ou adivinhá-lo, pode ver a partida enquanto ela estiver sendo compartilhada, então não deixe nela nada que você não mostraria para a mesa toda. Isso inclui celulares: a TV e a tela do dealer mostram o link como QR code, gerado no próprio aparelho, e um celular recebe a mesma cópia que a TV. Me Encontre procura nessa cópia no próprio celular, e nada digitado ali é salvo ou enviado.",
      },
      protected: {
        title: "Como Isso É Protegido",
        li1: "O site e o servidor de códigos de TV são servidos por conexões criptografadas (HTTPS), e dizem aos navegadores para nunca usarem nada menos seguro.",
        li2: "O site não carrega código de terceiros: sem anúncios, análises, rastreadores ou fontes externas. Uma política rígida de segurança de conteúdo impede que a página rode qualquer outro script ou fale com qualquer servidor que não seja o nosso.",
        li3: "Seus dados são criptografados no seu dispositivo, em nosso servidor e em exportações protegidas por senha, como descrito acima.",
        li4: "Para atrasar quem tentar adivinhar códigos de TV, o servidor de códigos de TV conta as requisições de cada endereço IP minuto a minuto. As contagens ficam só na memória e nunca são armazenadas ou registradas.",
        li5: "Os arquivos que você importa são verificados antes de qualquer coisa ser salva, e um que não pareça exatamente com uma exportação do PitMaster é rejeitado por completo.",
        p1: "Nenhum sistema é perfeitamente seguro, e o PitMaster é um projeto paralelo, não um produto de segurança auditado. Não coloque nele nada que você não suportaria perder ou ver por outra pessoa.",
      },
      phones: {
        title: "Celulares dos Jogadores",
        p1: "Com celulares como copos no Dado Mentiroso, o celular de cada jogador é o copo dele. A tela do anfitrião mostra a cada jogador um código para o próprio lugar, e a chave que permite a um celular escrever nesse lugar nunca vai a lugar nenhum além desse celular e da tela do anfitrião.",
        li1: "O que um celular envia: primeiro um hash dos seus números da rodada (que não revela nada) e depois, quando uma aposta é desafiada, os próprios números. Os dois são trancados com a chave do jogo no próprio celular, como uma cópia da TV.",
        li2: "O que o servidor pode ver: o ID do jogo, o ID de cada lugar, um SHA-256 da chave de cada lugar e texto cifrado. Ele nunca tem a chave de um lugar, o nome de um jogador nem os dados de ninguém.",
        li3: "O que a tela do anfitrião pode ver: só o que um celular já mostrou. Os números do próprio anfitrião são metade de cada dado, e não servem para nada sem a metade do celular.",
        li4: "Um celular guarda os próprios números da rodada trancados, com uma chave criada no celular que nenhum script consegue ler, então recarregar a página não faz perder o copo. Nada é guardado em texto puro.",
        p2: "Como tudo que é ao vivo, as caixas de correio são apagadas quando o anfitrião para de compartilhar, ou dois dias após a última atualização.",
      },
      host: {
        title: "Nosso Provedor",
        p1pre:
          "O site e o servidor de códigos de TV rodam sobre a Cloudflare. Para entregar páginas e bloquear ataques, a Cloudflare lida com detalhes técnicos de cada requisição, como endereços IP e tipo de navegador, sob",
        linkText: "a própria política de privacidade dela",
        p1post: "Não adicionamos análises, anúncios ou cookies de rastreamento, não registramos o que você faz, e não vendemos nem compartilhamos nada sobre você.",
      },
      other: {
        title: "Outros Serviços",
        li1: "Os links de pagamento abrem o Venmo, Cash App ou PayPal com um valor e o nome da partida já preenchidos. O que acontece ali é entre você e eles.",
        li2: "O locutor só usa as vozes embutidas no seu dispositivo, então o que ele lê em voz alta nunca sai dele. Onde um navegador só oferece vozes online, o locutor fica em silêncio.",
        li3: "Links para outros sites seguem as próprias políticas desses sites.",
      },
      choices: {
        title: "Suas Escolhas",
        li1pre: "Apague tudo a qualquer momento em",
        li1post: ", ou limpando os dados deste site no seu navegador.",
        li2: "Pare de compartilhar um código de TV a qualquer momento, e a cópia em nosso servidor é apagada na hora.",
        li3: "Como não guardamos nada que identifique você, não há nada que possamos buscar, corrigir, entregar ou apagar a pedido. Tudo já está em suas mãos.",
      },
      children: {
        title: "Crianças",
        p1: "O PitMaster é feito para adultos. Ele não é para crianças, e não coletamos informações intencionalmente de ninguém, de qualquer idade.",
      },
      changes: { p1: "Se esta política mudar, a nova versão vai aparecer aqui e a data no topo muda junto com ela." },
      contact: { p1pre: "Perguntas sobre privacidade? Fale com a Wyzie LLC em" },
    },
    terms: {
      intro: {
        pre: "Estes termos são um acordo entre você e a Wyzie LLC (“nós”), que publica o PitMaster em",
        post: "Ao usar o PitMaster, você concorda com eles. Se não concordar, por favor não o use.",
      },
      what: {
        title: "O Que É o PitMaster",
        p1: "O PitMaster é um projeto paralelo gratuito e de código aberto, feito inteiramente por uma única pessoa e publicado pela Wyzie LLC, para qualquer um usar em suas próprias partidas de pôquer, de qualquer tamanho. Ele cuida do cálculo de fichas, relógios de blind, buy-ins, rake, pagamentos, acerto de contas e uma exibição de TV. Ele mantém registros e faz aritmética. Ele não recebe apostas, não guarda nem movimenta dinheiro, e não conduz nenhuma partida sozinho, e não é um serviço de apostas. Ele vem sem suporte, sem garantias e sem nenhuma promessa de que continuará existindo.",
      },
      yourChoice: {
        title: "Como Você o Usa Depende de Você",
        p1: "Usar o PitMaster ou não, e como usá-lo, é uma escolha sua, e você é o único responsável por essa escolha e por tudo o que resulta dela: as partidas que você conduz, as regras, stakes e taxas que você define, o dinheiro que muda de mãos, as informações que você insere, e qualquer coisa que você compartilhe ou coloque em uma tela. Nós não supervisionamos, verificamos ou aprovamos nenhuma partida, e nada que o PitMaster mostra é conselho jurídico, financeiro ou fiscal.",
      },
      legalGame: {
        title: "Conduzindo uma Partida Legal",
        p1: "As leis sobre pôquer variam muito de um lugar para outro. Alguns lugares não permitem pôquer com dinheiro real fora de salas licenciadas, e muitos proíbem qualquer pessoa que não seja um operador licenciado de cobrar rake, taxa de assento ou qualquer outro corte. Você é responsável por garantir que qualquer partida que conduza com o PitMaster, e cada configuração que use nela, seja legal onde você joga, que você tenha qualquer licença necessária, que quaisquer impostos envolvidos sejam declarados e pagos, e que todos na mesa tenham idade suficiente para estar ali.",
        p2: "O PitMaster não é certificado nem aprovado por nenhum órgão regulador de jogos. Se você administra uma sala licenciada ou comercial, cabe a você decidir se suas regras permitem o uso dele, e ele não substitui nenhum registro que você seja obrigado a manter.",
      },
      data: {
        title: "Seus Dados",
        p1: "Tudo o que você insere é salvo no seu navegador, criptografado (veja",
        p2: "). É seu, e mantê-lo seguro também é. Limpar seu navegador, perder ou trocar de dispositivo, um problema no navegador ou um bug podem apagá-lo ou torná-lo ilegível, e não temos cópia para restaurá-lo.",
        p3: "com frequência, e guarde suas exportações em um lugar seguro. Se você trancar uma exportação com uma senha e perder a senha, o arquivo não poderá ser aberto, nem por você nem por nós.",
      },
      math: {
        title: "Confira os Cálculos",
        p1: "Pagamentos, rake, valores de acerto de contas, cálculos de acordo e estruturas de blind são calculados de boa-fé, mas podem estar errados, ou não ser adequados para sua partida. Confira qualquer coisa que importe antes que o dinheiro mude de mãos. Desentendimentos na mesa são para serem resolvidos na mesa.",
      },
      fair: {
        title: "Usando-o com Justiça",
        p1: "Não faça mau uso do PitMaster ou do seu servidor de códigos de TV: não o sobrecarregue, não tente adivinhar ou coletar códigos de outras pessoas, não contorne sua segurança, não o use para infringir a lei, e não guarde nele nada além de partidas de pôquer. Insira apenas informações que você tem o direito de compartilhar. Podemos limitar ou bloquear o uso que infrinja essas regras.",
      },
      code: {
        title: "O Código",
        p1pre: "O código do PitMaster é público em",
        p1mid: "sob a",
        p1post:
          ": você é livre para lê-lo, copiá-lo, alterá-lo e rodar sua própria cópia, nos termos dessa licença. A licença cobre o código; estes termos cobrem o uso do PitMaster em pitmaster.cc. Uma cópia que outra pessoa roda é dela, não nossa: estes termos e nossa Política de Privacidade não se aplicam a ela, e não somos responsáveis por ela. A licença não inclui o nome PitMaster, então se você publicar sua própria cópia, dê a ela um nome próprio para que ninguém a confunda com esta.",
      },
      trademarks: {
        title: "Nomes e Marcas Registradas",
        p1: "Os sets de fichas embutidos levam o nome dos produtos reais aos quais correspondem, de fabricantes como DA VINCI, KardShark, Playzaic e Casino Supply, e os links de pagamento usam os nomes Venmo, Cash App e PayPal. Esses nomes pertencem aos seus respectivos donos. O PitMaster não é afiliado a nenhum deles nem endossado por eles.",
      },
      warranty: {
        title: "Sem Garantia",
        p1: "O PitMaster é fornecido “como está” e “conforme disponível”, sem garantias de qualquer tipo, expressas ou implícitas, incluindo comercialização, adequação a um propósito específico, precisão, segurança e não violação. Não prometemos que ele será correto, seguro, ininterrupto ou livre de bugs, nem que seus dados serão mantidos seguros ou poderão ser recuperados. Podemos alterar, limitar ou encerrar o PitMaster a qualquer momento sem aviso, e ele pode quebrar ou ficar offline, mesmo no meio de uma partida.",
      },
      liability: {
        title: "Limitação de Responsabilidade",
        p1: "Na máxima extensão permitida por lei, nem a Wyzie LLC nem a pessoa que criou o PitMaster são responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, ou por dados perdidos, dinheiro perdido, lucros perdidos, perdas em apostas, problemas jurídicos ou disputas entre jogadores, decorrentes de ou relacionados ao seu uso do PitMaster, mesmo que nos tenham avisado de que eram possíveis. Onde a responsabilidade não puder ser excluída, nossa responsabilidade total para com você por todas as reivindicações juntas é limitada a $50. Alguns lugares não permitem esses limites, então alguns deles podem não se aplicar a você.",
      },
      indemnity: {
        title: "Indenização",
        p1: "Se alguém apresentar uma reivindicação contra a Wyzie LLC ou a pessoa que criou o PitMaster por causa de como você o usou, uma partida que você conduziu com ele, ou por você ter violado estes termos ou a lei, você concorda em cobrir as perdas e custos resultantes, incluindo honorários advocatícios razoáveis, na medida em que a lei permitir.",
      },
      rest: {
        title: "O Restante",
        p1pre: "Se alguma parte destes termos não puder ser aplicada, o restante continua valendo. Não aplicar uma parte não significa abrir mão dela. Estes termos e a",
        p1post: "são o acordo completo entre você e nós sobre o PitMaster.",
      },
      changes: { p1: "Podemos atualizar estes termos. A data no topo indica quando mudaram pela última vez, e usar o PitMaster depois de uma mudança significa que você aceita a nova versão." },
      contact: { p1pre: "Perguntas sobre estes termos? Fale com a Wyzie LLC em" },
    },
  },
};

<script lang="ts">
  import Icon from "./Icon.svelte";
  import Digits from "./Digits.svelte";
  import Trophy from "@lucide/svelte/icons/trophy";
  import VolumeX from "@lucide/svelte/icons/volume-x";
  import Volume2 from "@lucide/svelte/icons/volume-2";
  import Maximize from "@lucide/svelte/icons/maximize";
  import Skull from "@lucide/svelte/icons/skull";
  import Coins from "@lucide/svelte/icons/coins";
  import Shuffle from "@lucide/svelte/icons/shuffle";
  import HandCoins from "@lucide/svelte/icons/hand-coins";
  import Handshake from "@lucide/svelte/icons/handshake";
  import Armchair from "@lucide/svelte/icons/armchair";
  import Megaphone from "@lucide/svelte/icons/megaphone";
  import Gift from "@lucide/svelte/icons/gift";
  import Bomb from "@lucide/svelte/icons/bomb";
  import Spade from "@lucide/svelte/icons/spade";
  import Crown from "@lucide/svelte/icons/crown";
  import Layers from "@lucide/svelte/icons/layers";
  import type { EventKind, Game, Level } from "$lib/types";
  import { cashGameNow, cashStakes, gameLine, isLimit, isStud, rotationName, stakesText, variant, variantName } from "$lib/variants";
  import { derive, cashElapsed } from "$lib/clock";
  import { tourneyStats, cashStats, cashRake, seatLabel, tableCounts, paidFor, bountyBook, envelopesLeft, mysteryStartsAt, sideStats, shootout, currentRound, roundName, payGroups, placeRange } from "$lib/game";
  import { amt, clock, clockFace, duration, money, ordinal, timeOfDay } from "$lib/util";
  import { play, sounds, resumeAudio, audioReady, speak } from "$lib/sound";
  import { hostPrefs, prefs } from "$lib/settings.svelte";
  import { time } from "$lib/now.svelte";
  import ChipLegend from "./ChipLegend.svelte";
  import Chip from "./Chip.svelte";
  import ChipStack from "./ChipStack.svelte";
  import Count from "./Count.svelte";
  import ProgressBar from "./ProgressBar.svelte";
  import Dealing from "./Dealing.svelte";
  import Kbd from "./Kbd.svelte";
  import { MediaQuery } from "svelte/reactivity";
  import FindMe from "./FindMe.svelte";
  import QrCode from "./QrCode.svelte";
  import Bracket from "./Bracket.svelte";
  import { kind } from "$lib/kinds";
  import { fade, fly } from "svelte/transition";
  import { replay, fresh, rise, leave, reveal, slide } from "$lib/motion";
  // the local "t" below is tourney stats (t.left, t.pool…), already established
  // through this file, so the translator is imported under another name
  import { t as tr, tp } from "$lib/i18n";

  // code: the tv code this board was opened with (a tv on this computer has it on the game)
  let { game, status = "", code = "" }: { game: Game; status?: string; code?: string } = $props();

  const isCash = $derived(game.type === "cash");
  // this is the poker board; a kind of game that isn't poker brings its own middle
  const k = $derived(kind(game.type));
  const board = $derived(k.poker ? null : (k.Board ?? null));

  // things that show up mid-game (a callout, the bubble, a new seat) make an
  // entrance. on the tv's first paint, or a reload, everything is simply there.
  const openedAt = Date.now();
  function later(node: HTMLElement, cls: string) {
    if (Date.now() - openedAt > 1500) node.classList.add(cls);
  }

  // a tv on another device takes the host's currency, clock and warning
  $effect(() => {
    hostPrefs.current = game.prefs ?? null;
  });
  $effect(() => () => (hostPrefs.current = null));

  // sound starts on if the host said so; the browser still wants one click
  // before it lets a page make noise, so until then the button asks for it.
  // (even asking makes the browser grumble before that first click, so it waits)
  let soundOn = $state(prefs().tvSound);
  let audioOk = $state(false);
  $effect(() => {
    if (soundOn && navigator.userActivation?.hasBeenActive) audioOk = audioReady();
  });
  async function wake() {
    if (soundOn && !audioOk) audioOk = await resumeAudio();
  }
  let idle = $state(false);
  let idleTimer: ReturnType<typeof setTimeout>;
  // the host can have the tv read the big moments out, and can keep money off the screen
  const voice = $derived(soundOn && prefs().tvVoice);
  const showMoney = $derived(prefs().tvMoney !== false);
  const say = (n: number) => n.toLocaleString("en-US");

  // the whole board scales off one unit (css --u); chips are drawn in px, so
  // they get the same unit from the window size
  let vw = $state(1280);
  let vh = $state(720);
  // (same unit as the css: phones and portrait screens go by width, a phone on
  // its side by whichever runs out first)
  const u = $derived(
    vw <= 700 ? vw * 0.016 : vh <= 500 ? Math.min(vw * 0.016, vh * 0.022) : vh > vw ? vw * 0.015 : Math.min(vw / 100, (vh * 1.7778) / 100)
  );
  const chipPx = $derived(Math.round(Math.max(40, Math.min(96, u * 3.9))));
  // a phone (the same test as the css): one column, and Find Me under the clock
  const phone = new MediaQuery("(max-width: 700px), (max-height: 500px)", false);
  const narrow = $derived(phone.current);
  // phones follow along from a qr code on the board: the same link, drawn here
  const phoneCode = $derived(code || game.live?.code || "");
  const followUrl = $derived(phoneCode ? `${location.origin}/tv#${phoneCode}` : "");

  // ---------- tournament ----------
  // only a running clock needs the time: paused or not started, the board sits still
  const d = $derived(!isCash && game.levels.length ? derive(game, game.clock.status === "running" ? time.now : 0) : null);
  const t = $derived(!isCash && game.tourney ? tourneyStats(game) : null);
  // the warning window is the host's pick (0 = off); the last minute also blinks
  const warnMs = $derived(prefs().levelWarning * 60000);
  const warning = $derived(!!d && !!warnMs && !d.level.isBreak && d.remainingMs <= warnMs && game.clock.status === "running");
  const lastMinute = $derived(warning && !!d && d.remainingMs <= 60000);
  const finalFive = $derived(!!d && !!d.next && game.clock.status === "running" && d.remainingMs <= 5000);
  const warnLabel = $derived(
    !d ? "" : d.remainingMs <= 60000 ? tr("tv.warn.lastMinute") : tr("tv.warn.minLeft", { n: String(Math.ceil(d.remainingMs / 60000)) })
  );
  const colorUpChips = $derived(d?.level.colorUp?.map((id) => game.chips.find((c) => c.id === id)).filter((c) => !!c) ?? []);
  const nextColorUp = $derived.by(() => {
    if (!d || !d.level.isBreak) return [];
    const nextLevel = game.levels.slice(d.index + 1).find((l) => !l.isBreak);
    return nextLevel?.colorUp?.map((id) => game.chips.find((c) => c.id === id)).filter((c) => !!c) ?? [];
  });
  const gone = $derived.by(() => {
    if (!d) return [];
    return game.levels.slice(0, d.index + 1).flatMap((l) => l.colorUp ?? []);
  });
  const levelNum = $derived(d ? (d.level.isBreak ? game.levels.slice(0, d.index).filter((l) => !l.isBreak).length : (d.level.num ?? 0)) : 0);
  const rebuyOpen = $derived(!!d && !!game.tourney?.rebuy.on && levelNum <= game.tourney.rebuy.untilLevel);
  // a bracket is set once it's drawn: no late entries
  const lateRegOpen = $derived(!!d && !!game.tourney?.lateRegLevel && levelNum <= game.tourney.lateRegLevel && game.tourney.format !== "bracket");
  const winner = $derived(game.finished && !isCash ? game.players.find((p) => p.place === 1) : null);
  // a wall clock doesn't pad the minutes: 8:27, not 08:27
  const timeLeft = $derived(d ? clockFace(d.remainingMs) : "");
  // house rules in the footer: two fit on a line; more take turns, one every ten seconds
  const rules = $derived(game.notes.split("\n").map((r) => r.trim()).filter(Boolean));
  let ruleAt = $state(0);
  $effect(() => {
    if (rules.length <= 2) return;
    const id = setInterval(() => ruleAt++, 10000);
    return () => clearInterval(id);
  });

  // the payout ladder fits nine places; a bigger field says how many more get paid
  const LADDER = 9;

  // bounties: the biggest head still in (progressive), or the envelopes left (mystery)
  const bountyKind = $derived(game.tourney?.bounty ? game.tourney.bountyKind : null);
  const topHead = $derived.by(() => {
    if (bountyKind !== "progressive") return null;
    const head = bountyBook(game).head;
    const top = game.players.filter((p) => !p.out).sort((a, b) => (head[b.id] ?? 0) - (head[a.id] ?? 0))[0];
    return top ? { name: top.name, amount: head[top.id] ?? 0 } : null;
  });
  const envelopes = $derived(bountyKind === "mystery" ? envelopesLeft(game) : []);

  // a satellite's places pay seats; a shootout says how many tables have their winner
  const seats = $derived(game.tourney?.satellite && t ? t.seats : 0);
  const shoot = $derived(shootout(game));
  const tablesWon = $derived(shoot ? shoot.tables.filter((x) => x.left.length === 1).length : 0);

  // ---------- a heads-up bracket ----------
  const bracket = $derived(!isCash && game.tourney?.format === "bracket" && !!game.matches?.length);
  const round = $derived(bracket ? currentRound(game) : null);
  // the round being played, big enough to read across the room (byes aren't matches)
  const liveMatches = $derived(bracket && round ? game.matches!.filter((m) => m.round === round && m.a && m.b) : []);
  const pname = (id: string | null) => game.players.find((p) => p.id === id)?.name ?? "";
  const groups = $derived(bracket && t && !game.deal ? payGroups(t.entrants, t.payouts.length) : []);
  // before the start and on breaks the whole bracket takes turns with the clock, bracket first
  const bracketTime = $derived(bracket && !winner && (game.clock.status === "idle" || !!d?.level.isBreak));
  let bracketTurn = $state(false);
  $effect(() => {
    if (!bracketTime) return void (bracketTurn = false);
    bracketTurn = true;
    const id = setInterval(() => (bracketTurn = !bracketTurn), 15000);
    return () => clearInterval(id);
  });

  // ---------- league ----------
  // a league game's standings take turns with a column while nothing's being
  // played: before the start, on a break, and once it's over
  const league = $derived(game.league?.rows.length ? game.league : null);
  const leagueTime = $derived(!!league && (game.clock.status === "idle" || !!d?.level.isBreak || game.finished));
  let leagueTurn = $state(false);
  $effect(() => {
    if (!leagueTime) return void (leagueTurn = false);
    const id = setInterval(() => (leagueTurn = !leagueTurn), 15000);
    return () => clearInterval(id);
  });
  const pts = (n: number) => tr("tv.league.points", { n: String(Math.round(n * 10) / 10) });

  // the winner's pot: a row of stacks from the game's own chips, biggest first
  const pot = $derived([...game.chips].sort((a, b) => b.value - a.value).slice(0, 5));

  // ---------- cash ----------
  const cash = $derived(isCash ? cashStats(game) : null);
  const rake = $derived(isCash ? cashRake(game) : null);
  const elapsed = $derived(isCash ? cashElapsed(game, time.now) : 0);
  // the side games: a bomb pot coming due, the 7-2 game, the high hand and its window
  const side = $derived(isCash && game.cash ? sideStats(game, elapsed) : null);
  const highHolder = $derived(side?.current ? game.players.find((p) => p.id === side.current!.playerId) : null);
  const planned = $derived(isCash && game.cash ? game.cash.plannedMinutes * 60000 : 0);
  const cashRemaining = $derived(planned - elapsed);
  // another poker game, or dealer's choice: the game now (the timer moves it on by itself)
  const cashNow = $derived(isCash && game.cash?.games?.length ? cashGameNow(game.cash, elapsed) : null);
  const choice = $derived((game.cash?.games?.length ?? 0) > 1);
  // a limit game's big number is its bets, not its blinds
  const cashPair = $derived(isCash && game.cash ? (cashNow && isLimit(cashNow.id) ? [game.cash.bb, game.cash.bb * 2] : [game.cash.sb, game.cash.bb]) : [0, 0]);
  const stakes = $derived(isCash && game.cash ? `${money(cashPair[0])}/${money(cashPair[1])}` : "");
  // with money off the board and no rake, a cash game has nothing for the right column
  const cashRight = $derived(showMoney || (!!rake && rake.mode !== "none"));

  // a mixed game's name in the header (HORSE, 8-Game), or the one game it plays
  const rotation = $derived(game.tourney?.rotation ?? []);
  const mix = $derived(rotation.length > 1 ? (rotationName(rotation) ?? tr("tv.level.mixedGames")) : rotation.length ? variantName(rotation[0]) : "");

  // the numbers a level is played for, as the board's cells: blinds and an
  // ante, a limit game's bets (and its blinds), or stud's bets, ante and bring-in
  function cells(l: Level, afterBreak = false): { k: string; v: string[] }[] {
    const limits = { k: afterBreak ? tr("tv.level.limitsAfterBreak") : tr("tv.level.limits"), v: [amt(l.bb), amt(l.bb * 2)] };
    if (isStud(l.game)) return [limits, { k: tr("tv.level.ante"), v: [amt(l.ante)] }, { k: tr("tv.level.bringIn"), v: [amt(l.bringIn ?? 0)] }];
    if (isLimit(l.game)) return [limits, { k: tr("tv.level.blinds"), v: [amt(l.sb), amt(l.bb)] }];
    return [{ k: afterBreak ? tr("tv.level.blindsAfterBreak") : tr("tv.level.blinds"), v: [amt(l.sb), amt(l.bb)] }, ...(l.ante ? [{ k: tr("tv.level.ante"), v: [amt(l.ante)] }] : [])];
  }
  // the game on the board: this level's, or on a break the one coming
  const shownGame = $derived(d ? (d.level.isBreak ? d.next?.game : d.level.game) : undefined);

  const meta = $derived(
    !k.poker
      ? [k.label()]
      : isCash
      ? [tr("tv.meta.cashGame"), cashNow && game.cash ? gameLine(cashStakes(game.cash, cashNow.id), true) : stakes]
      : [tr("tv.meta.tournament"), mix, showMoney && game.tourney ? tr("tv.meta.buyIn", { amount: money(game.tourney.buyIn) }) : ""]
  );

  // ---------- cues: every sound comes with something to see ----------
  // a tv's speakers are often off, muted or down the hall, so nothing may rely
  // on sound alone. every sound goes through cue(), which also flares the edge
  // of the screen in the moment's color (yellow: level, money, the host;
  // red: busts, warnings, the countdown; green: breaks; chalk: chips, cards).
  const BANNER = "var(--tv-banner)";
  const HOT = "var(--tv-hot)";
  const GOOD = "var(--tv-good)";
  const CHALK = "var(--tv-fg)";
  let flare = $state<{ color: string; n: number; key: number } | null>(null);
  let flareTimer: ReturnType<typeof setTimeout>;
  function cue(sound: () => void, color: string, n = 2) {
    if (soundOn) sound();
    const key = performance.now();
    flare = { color, n, key };
    clearTimeout(flareTimer);
    flareTimer = setTimeout(() => flare?.key === key && (flare = null), n * 720 + 200);
  }

  // ---------- effects: sounds, level-up flash, toasts ----------
  let lastIndex = -1;
  let flashLevel = $state(false);
  $effect(() => {
    if (!d) return;
    if (lastIndex !== -1 && d.index !== lastIndex) {
      flashLevel = true;
      setTimeout(() => (flashLevel = false), 2500);
      cue(d.level.isBreak ? sounds.break : sounds.level, d.level.isBreak ? GOOD : BANNER, 3);
      // after the beeps, the new level in words
      const l = d.level;
      if (voice)
        speak(
          l.isBreak
            ? tp("tv.voice.breakTime", l.minutes)
            : l.game
              ? gameVoice(l)
              : l.ante
              ? tr("tv.voice.levelBlindsAnte", { level: String(levelNum), sb: say(l.sb), bb: say(l.bb), ante: say(l.ante) })
              : tr("tv.voice.levelBlinds", { level: String(levelNum), sb: say(l.sb), bb: say(l.bb) }),
          1300
        );
    }
    lastIndex = d.index;
  });

  /** a level of another game, in words: its name and what it's played for */
  function gameVoice(l: Level) {
    const game = variantName(l.game);
    const level = String(levelNum);
    if (isStud(l.game)) return tr("tv.voice.levelStud", { level, game, ante: say(l.ante), bringIn: say(l.bringIn ?? 0), small: say(l.bb), big: say(l.bb * 2) });
    if (isLimit(l.game)) return tr("tv.voice.levelLimit", { level, game, small: say(l.bb), big: say(l.bb * 2) });
    return l.ante
      ? tr("tv.voice.levelGameAnte", { level, game, sb: say(l.sb), bb: say(l.bb), ante: say(l.ante) })
      : tr("tv.voice.levelGame", { level, game, sb: say(l.sb), bb: say(l.bb) });
  }

  // the last five seconds of a level (or a break) tick out loud, one a second
  // (the clock gives a small pulse with each one)
  let ticked = -1;
  let tickKey = $state(0);
  $effect(() => {
    if (!d || !d.next || game.clock.status !== "running") return;
    const left = Math.ceil(d.remainingMs / 1000);
    if (left < 1 || left > 5 || left === ticked) return;
    ticked = left;
    tickKey++;
    cue(() => sounds.tick(left), HOT, 1);
  });

  let warned = -1;
  $effect(() => {
    if (warning && warned !== d!.index) {
      warned = d!.index;
      cue(sounds.warn, HOT, 2);
      const m = Math.round(warnMs / 60000);
      if (voice) speak(tp("tv.voice.minutesLeftAtBlinds", m), 700);
    }
  });

  // every announcement has a kind, set by whatever raised it (game.ts, or a
  // dealer-screen control): it picks the toast's icon, how it arrives, and
  // what the room hears. no more guessing it by matching English words in
  // text that's now translated.
  const KINDS: Record<EventKind, { icon: typeof Trophy; sound: () => void; color: string; n: number }> = {
    win: { icon: Trophy, sound: sounds.ship, color: BANNER, n: 4 },
    deal: { icon: Handshake, sound: sounds.money, color: BANNER, n: 3 },
    money: { icon: HandCoins, sound: sounds.money, color: GOOD, n: 3 },
    bounty: { icon: Gift, sound: sounds.money, color: BANNER, n: 3 },
    bust: { icon: Skull, sound: sounds.bust, color: HOT, n: 2 },
    chips: { icon: Coins, sound: sounds.chips, color: BANNER, n: 2 },
    rack: { icon: Coins, sound: sounds.rack, color: CHALK, n: 2 },
    shuffle: { icon: Shuffle, sound: sounds.shuffle, color: CHALK, n: 2 },
    draw: { icon: Shuffle, sound: sounds.shuffle, color: CHALK, n: 2 },
    bomb: { icon: Bomb, sound: sounds.bust, color: HOT, n: 3 },
    sevenTwo: { icon: Spade, sound: sounds.chips, color: BANNER, n: 2 },
    highHand: { icon: Crown, sound: sounds.chime, color: BANNER, n: 3 },
    game: { icon: Layers, sound: sounds.shuffle, color: BANNER, n: 3 },
    seat: { icon: Armchair, sound: sounds.ding, color: CHALK, n: 2 },
    note: { icon: Megaphone, sound: sounds.ding, color: BANNER, n: 2 },
  };

  let toast = $state<{ text: string; kind: EventKind; at: number } | null>(null);
  let lastFlash = 0;
  $effect(() => {
    const f = game.flash;
    if (!f || f.at <= lastFlash) return;
    const first = lastFlash === 0;
    lastFlash = f.at;
    if (first && Date.now() - f.at > 8000) return; // don't replay old news on load
    const kind = f.kind;
    // a win or a deal takes over the whole screen; a toast on top would only cover the name
    if (kind !== "win" && kind !== "deal") toast = { text: f.text, kind, at: f.at };
    cue(KINDS[kind].sound, KINDS[kind].color, KINDS[kind].n);
    if (voice) speak(f.text, kind === "win" ? 2200 : kind === "money" || kind === "deal" ? 1400 : 800);
    setTimeout(() => toast?.at === f.at && (toast = null), 7000);
  });

  // dealer's choice on a timer moves on by itself: the board says so (a game
  // picked on the dealer screen comes with its own announcement)
  let lastGame = "";
  $effect(() => {
    const id = cashNow?.id ?? "";
    const picked = game.flash?.kind === "game" && Date.now() - game.flash.at < 5000;
    if (lastGame && id && id !== lastGame && !picked && game.cash) {
      const text = tr("gamePlay.variants.gameNowFlash", { game: variantName(id), line: stakesText(cashStakes(game.cash, id), true) });
      const at = Date.now();
      toast = { text, kind: "game", at };
      cue(KINDS.game.sound, KINDS.game.color, KINDS.game.n);
      if (voice) speak(text, 800);
      setTimeout(() => toast?.at === at && (toast = null), 7000);
    }
    lastGame = id;
  });

  // the host's message lands with a chime (and gets read out, with the announcer on)
  let lastMessage = 0;
  let bannerKey = $state(0);
  $effect(() => {
    const m = game.message;
    if (!m || m.at <= lastMessage) return;
    const first = lastMessage === 0;
    lastMessage = m.at;
    if (first && Date.now() - m.at > 8000) return;
    cue(sounds.chime, BANNER, 3);
    bannerKey++;
    if (voice) speak(m.text, 1100);
  });

  // the bubble bursting runs a glint down the payout ladder, once
  let wasItm: boolean | null = null;
  let burst = $state(false);
  $effect(() => {
    const itm = !!t?.itm;
    if (wasItm === false && itm) {
      burst = true;
      setTimeout(() => (burst = false), 2600);
    }
    wasItm = itm;
  });

  // the winner screen only makes its entrance if the game just ended
  const justWon = $derived(!!game.endedAt && Date.now() - game.endedAt < 15000);

  async function enableSound() {
    soundOn = true;
    audioOk = await resumeAudio();
    sounds.ding();
  }

  // keep the screen from dimming mid-level (where the browser allows it)
  const wantAwake = $derived(prefs().tvAwake && game.clock.status === "running" && !game.finished);
  $effect(() => {
    if (!wantAwake || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let done = false;
    const grab = async () => {
      if (done || lock || document.visibilityState !== "visible") return;
      try {
        lock = await navigator.wakeLock.request("screen");
        lock.addEventListener("release", () => (lock = null));
        if (done) lock.release();
      } catch {}
    };
    grab();
    // the lock drops whenever the tab is hidden; take it back on return
    document.addEventListener("visibilitychange", grab);
    return () => {
      done = true;
      document.removeEventListener("visibilitychange", grab);
      lock?.release();
    };
  });

  // before the cards go in the air, the tv shows who sits where
  const tables = $derived(tableCounts(game).length);
  const seating = $derived(
    game.clock.status === "idle" && tables
      ? game.players
          .filter((p) => p.seat && (isCash ? p.cashOut === null : !p.out))
          .sort((a, b) => a.seat!.table - b.seat!.table || a.seat!.seat - b.seat!.seat)
      : []
  );
  const seated = $derived(isCash ? game.players.filter((p) => p.cashOut === null) : []);
  // who's next for a seat, and how long they've waited
  const WAITLIST = 6;
  const waitlist = $derived(isCash ? (game.waitlist ?? []) : []);
  const waited = (at: number) => duration(Math.max(1, (time.now - at) / 60000));
  // several tables list side by side, one column a table
  const byTable = (list: typeof game.players) =>
    [...new Set(list.map((p) => p.seat?.table ?? 0))]
      .sort((a, b) => a - b)
      .map((table) => ({ table, players: list.filter((p) => (p.seat?.table ?? 0) === table).sort((a, b) => (a.seat?.seat ?? 99) - (b.seat?.seat ?? 99)) }));
  const wideLeft = $derived(tables > 1 && (seating.length > 0 || (isCash && seated.some((p) => p.seat))));

  // the blinds strip shrinks to fit long numbers (3,000/6,000 plus an ante):
  // its width in characters goes to css as --n
  const stripLen = (cs: { v: string[] }[]) => cs.reduce((n, c) => n + c.v.join("/").length, 0) + (cs.length - 1) * 2.5 || 1;

  // an iPhone has no fullscreen for pages at all, so there's no button to press there
  const canFullscreen = document.fullscreenEnabled;
  function fullscreen() {
    if (!canFullscreen) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  }

  // the controls show for a few seconds at a time: when the board opens, and
  // whenever a mouse moves, a finger taps or a remote's key is pressed
  function poke() {
    idle = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => (idle = true), 3000);
  }
  $effect(() => {
    poke();
    return () => clearTimeout(idleTimer);
  });

  function soundOff() {
    soundOn = false;
    play("off");
  }

  function onKey(e: KeyboardEvent) {
    poke();
    if (soundOn) wake();
    // Ctrl F is the browser's find, not fullscreen
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === "f") fullscreen();
    if (k === "s") soundOn ? soundOff() : enableSound();
  }
</script>

<svelte:window
  onmousemove={poke}
  onkeydown={onKey}
  onpointerdown={() => {
    poke();
    wake();
  }}
  bind:innerWidth={vw}
  bind:innerHeight={vh}
/>

<div
  class="tv"
  class:idle
  class:hot={warning}
  class:last={lastMinute}
  class:final={finalFive}
  class:brk={d?.level.isBreak || !!winner}
  class:two={isCash && !cashRight}
  class:wide-left={wideLeft}
  class:held={game.clock.status === "paused"}
  class:full={bracketTurn}
>
  <header>
    <!-- the logo's suits, turning over every time the level goes up -->
    <span class="suits" class:turned={levelNum % 2 === 0} aria-hidden="true">
      <span class="sw"><span>♠</span><span class="red">♦</span></span><span class="sw"><span class="red">♥</span><span>♣</span></span>
    </span>
    <span class="name">{game.name}</span>
    <span class="meta">{meta.filter(Boolean).join(" · ")}</span>
    <span class="tod fig">{timeOfDay(time.now)}</span>
  </header>

  {#if game.message?.text}
    <div class="banner" out:slide={leave()} use:replay={[bannerKey, "ring"]}>{game.message.text}</div>
  {/if}

  {#if board}
    <!-- ================= ANOTHER KIND'S OWN BOARD ================= -->
    <section class="kind-board">
      {#await board() then m}<m.default {game} {narrow} />{/await}
    </section>
  {:else if winner}
    <!-- ================= WINNER ================= -->
    <section class="winner" class:entrance={justWon}>
      <div class="trophy"><Icon icon={Trophy} size="11vh" /></div>
      <div class="k">{game.deal ? tr("tv.winner.dealMade") : seats > 1 ? tr("tv.winner.satellite") : tr("tv.winner.champion")}</div>
      <div class="big">{game.deal ? tr("tv.winner.dealBig") : seats > 1 ? tp("tv.winner.seatsWon", seats) : winner.name}</div>
      <!-- the pot, pushed across the felt and stacked one chip at a time -->
      <div class="pot" aria-hidden="true">
        {#each pot as c, i (c.id)}<span style:--d="{500 + i * 160}ms"><ChipStack chip={c} n={[12, 18, 9, 15, 7][i]} width="min(6vw, 10vh)" /></span>{/each}
      </div>
      {#if leagueTurn && league}
        {@const rows = league.rows.length > 5 ? Math.ceil(league.rows.length / 2) : league.rows.length}
        <div class="k" in:fade={reveal()}>{tr("tv.league.standings")} · {league.name}</div>
        <ol class="final" class:split={league.rows.length > 5} style:--rows={rows} in:fade={reveal()}>
          {#each league.rows as r, i (i)}
            <li class:top={i % rows === 0}>
              <span class="place">{ordinal(i + 1)}</span>
              <b>{r.name}</b>
              <span class="fig">{pts(r.points)}</span>
            </li>
          {/each}
        </ol>
      {:else if t && groups.length}
        {@const rows = groups.length > 5 ? Math.ceil(groups.length / 2) : groups.length}
        <ol class="final" class:split={groups.length > 5} style:--rows={rows}>
          {#each groups as g, i (g.from)}
            <li class:top={i % rows === 0} style:--i={i}>
              <span class="place">{placeRange(g)}</span>
              <b>{game.players.filter((x) => x.place === g.from).map((x) => x.name).join(", ") || tr("tv.winner.nobodyYet")}</b>
              {#if showMoney}<span class="fig">{money(t.payouts[g.from - 1] ?? 0)}</span>{/if}
            </li>
          {/each}
        </ol>
      {:else if t}
        {@const places = Math.min(10, game.deal ? Object.keys(game.deal.amounts).length : t.payouts.length)}
        {@const rows = places > 5 ? Math.ceil(places / 2) : places}
        <ol class="final" class:split={places > 5} style:--rows={rows}>
          {#each Array.from({ length: places }) as _, i (i)}
            {@const who = game.players.find((x) => x.place === i + 1)}
            <li class:top={i % rows === 0} style:--i={i}>
              <span class="place">{ordinal(i + 1)}</span>
              <b>{who?.name ?? tr("tv.winner.nobodyYet")}</b>
              {#if i < seats}<span class="fig">{tr("tv.tourney.seat")}</span>{:else if showMoney}<span class="fig">{money(paidFor(game, who?.id, i + 1, t.payouts))}</span>{/if}
            </li>
          {/each}
        </ol>
      {/if}
    </section>
  {:else if d && t}
    <!-- ================= TOURNAMENT ================= -->
    <aside class="col left">
      <div class="stat">
        <span class="k">{tr("tv.tourney.players")}</span>
        <span class="v fig"><span class="n" use:replay={[t.left, "tumble"]}>{t.left}</span><span class="of">/{t.entrants}</span></span>
        {#if t.bubble}<span class="sub hot-text" use:later={"stamp"}>{tr("tv.tourney.onBubble")}</span>{:else if t.itm}<span class="sub good-text" use:later={"stamp"}>{tr("tv.tourney.inTheMoney")}</span>{/if}
      </div>
      {#if bracket}
        <div class="stat matches" class:many={liveMatches.length > 5}>
          <span class="k">{round ? roundName(game, round) : ""}</span>
          {#each liveMatches as m, i (m.slot)}
            <div class="match" style:--i={i} use:later={"deal-in"}>
              <span class:won={m.winner === m.a} class:lost={!!m.winner && m.winner !== m.a}>{pname(m.a)}</span>
              <span class="vs">{tr("tv.bracket.vs")}</span>
              <span class:won={m.winner === m.b} class:lost={!!m.winner && m.winner !== m.b}>{pname(m.b)}</span>
            </div>
          {/each}
        </div>
      {:else if seating.length}
        <div class="stat seats" class:many={seating.length > 10}>
          <span class="k">{tr("tv.tourney.seats")}</span>
          {@render seatList(seating)}
        </div>
      {:else}
        <div class="stat">
          <span class="k">{tr("tv.tourney.avgStack")}</span>
          <span class="v fig"><Count value={Math.round(t.avgStack)} format={(n) => amt(n)} /></span>
          {#if !d.level.isBreak && d.level.bb}<span class="sub fig">{tp("tv.tourney.bigBlinds", Math.round(t.avgStack / d.level.bb))}</span>{/if}
        </div>
        {#if game.tourney!.rebuy.on || game.tourney!.addOn.on}
          <div class="stat pair">
            {#if game.tourney!.rebuy.on}<div><span class="k">{tr("tv.tourney.rebuys")}</span><span class="v fig" use:replay={[t.rebuys, "pop"]}>{t.rebuys}</span></div>{/if}
            {#if game.tourney!.addOn.on}<div><span class="k">{tr("tv.tourney.addOns")}</span><span class="v fig" use:replay={[t.addOns, "pop"]}>{t.addOns}</span></div>{/if}
          </div>
        {/if}
      {/if}
      <div class="notes-col">
        {#if seats}<span>{tp("tv.tourney.satelliteSeats", seats)}{#if showMoney}{" · "}<span class="fig">{money(game.tourney!.satellite!.seatValue)}</span>{/if}</span>{/if}
        {#if shoot && shoot.tables.length > 1 && !shoot.final}<span use:replay={[tablesWon, "pop"]}>{tr("tv.tourney.shootoutTables", { won: String(tablesWon), tables: String(shoot.tables.length) })}</span>
        {:else if shoot?.final}<span class="good-text">{tr("tv.tourney.shootoutFinal")}</span>{/if}
        {#if lateRegOpen}<span class="good-text">{tr("tv.tourney.lateRegOpen", { level: String(game.tourney!.lateRegLevel) })}</span>{/if}
        {#if rebuyOpen}<span class="good-text">{tr("tv.tourney.rebuysOpen", { level: String(game.tourney!.rebuy.untilLevel) })}</span>{/if}
        {#if game.clock.status !== "idle"}<span>{tr("tv.tourney.elapsed")} <span class="fig">{clock(d.totalElapsedMs)}</span></span>{/if}
      </div>
    </aside>

    <section class="main" class:flash={flashLevel}>
      {#if bracketTurn}
      <div class="bracket-wrap" in:fade={reveal()}><Bracket {game} tv /></div>
      {:else}
      <div class="level">
        <span use:replay={[d.index, "roll"]}>{#if d.level.isBreak}{tr("tv.level.break")}{:else}{tr("tv.level.levelNum", { n: String(levelNum) })}{/if}</span>
        {#if game.clock.status === "paused"}<span class="pill" use:later={"pop"}><span class="blink">{tr("tv.status.paused")}</span></span>{/if}
        {#if game.clock.status === "idle"}<span class="pill">{tr("tv.status.notStarted")}</span>{/if}
        {#if warning}<span class="pill warn-pill" use:later={"stamp"}>{warnLabel}</span>{/if}
      </div>
      {#if shownGame}<div class="gname" use:replay={[d.index, "roll"]}>{#if d.level.isBreak}<span class="k">{tr("tv.level.nextGame")}</span>{/if}{variantName(shownGame)}</div>{/if}
      <!-- three layers so each motion owns one: the final-minute blink, the
           last-five-seconds pulse, and the new level rolling in -->
      <div class="clock fig" class:long={timeLeft.length > 5}>
        <span class="pulse" use:replay={[tickKey, "tick"]}><span class="face" use:replay={[d.index, "roll"]}><Digits value={timeLeft} /></span></span>
      </div>
      <div class="bar"><ProgressBar value={d.progress} /></div>

      {#if d.level.isBreak}
        {#if d.next}{@render strip(d.next, true)}{/if}
        {#if nextColorUp.length || (game.tourney?.addOn.on && levelNum === game.tourney.breakEvery)}
          <div class="callouts">
            {#if nextColorUp.length}
              <div class="callout" use:later={"pop"}>
                <span class="k">{tr("tv.level.colorUpNow")}</span>
                {#each nextColorUp as c, i (c.id)}<span class="flip" style:--i={i} use:later={"flip-in"}><Chip chip={c} size={chipPx} /></span>{/each}
              </div>
            {/if}
            {#if game.tourney?.addOn.on && levelNum === game.tourney.breakEvery}
              <div class="callout" use:later={"pop"}><span class="k">{tr("tv.level.addOnsOpen")}</span><span class="fig">{money(game.tourney.addOn.cost)}</span> {tr("tv.level.addOnsFor")} <span class="fig">{amt(game.tourney.addOn.chips)}</span></div>
            {/if}
          </div>
        {/if}
      {:else}
        {@render strip(d.level, false)}
        <div class="after">
          <span>
            <span class="k">{tr("tv.level.nextLevel")}</span>
            {#if d.next}<span class="fig" use:replay={[d.index, "roll"]}>{#if d.next.game}{d.next.game !== d.level.game ? gameLine(d.next) : stakesText(d.next)}{:else}{amt(d.next.sb)}/{amt(d.next.bb)}{d.next.ante ? ` · ${tr("tv.level.anteSuffix", { n: amt(d.next.ante) })}` : ""}{/if}</span>{:else}{tr("tv.level.finalLevel")}{/if}
          </span>
          {#if d.nextBreakInMs !== null}<span><span class="k">{tr("tv.level.nextBreak")}</span> <span class="fig">{clock(d.nextBreakInMs)}</span></span>{/if}
        </div>
        {#if colorUpChips.length && d.elapsedMs < 5 * 60000}
          <div class="callout" use:later={"pop"}>
            <span class="k">{tr("tv.level.colorUp")}</span>
            {#each colorUpChips as c, i (c.id)}<span class="flip" style:--i={i} use:later={"flip-in"}><Chip chip={c} size={chipPx} /></span>{/each}
          </div>
        {/if}
      {/if}
      {/if}
    </section>

    <aside class="col right">
      {#if leagueTurn && league}
        {@render standings(league)}
      {:else}
      {#if showMoney}
        <div class="stat">
          <span class="k">{tr("tv.tourney.prizePool")}</span>
          <span class="v fig" use:replay={[t.pool, "glint"]}><Count value={t.pool} format={money} /></span>
        </div>
      {/if}
      <div class="stat">
        <span class="k">{showMoney ? tr("tv.tourney.payouts") : tr("tv.tourney.pays")}</span>
        {#if showMoney}
          <!-- places fill in as players finish in the money: their name stamps onto the line -->
          {#if groups.length}
          <ol class="ladder" class:burst>
            {#each groups.slice(0, LADDER) as g, i (g.from)}
              {@const who = game.players.filter((x) => x.out && x.place === g.from)}
              <li style:--i={i}>
                <span class="place">{placeRange(g)}</span>
                {#if who.length}<span class="who">{who.map((x) => x.name).join(", ")}</span>{/if}
                <span class="fig">{money(t.payouts[g.from - 1] ?? 0)}</span>
              </li>
            {/each}
          </ol>
          {:else}
          <ol class="ladder" class:burst>
            {#each t.payouts.slice(0, LADDER) as p, i (i)}
              {@const who = game.players.find((x) => x.out && x.place === i + 1)}
              <li style:--i={i}>
                <span class="place">{ordinal(i + 1)}</span>
                {#if who}<span class="who" use:fresh={[who.bustedAt, "stamp"]}>{who.name}</span>{/if}
                <span class="fig">{i < seats ? tr("tv.tourney.seat") : money(p)}</span>
              </li>
            {/each}
          </ol>
          {/if}
          {#if !groups.length && t.payouts.length > LADDER}<span class="sub">{tp("tv.tourney.morePaid", t.payouts.length - LADDER)}</span>{/if}
        {:else}
          <span class="v">{tr("tv.tourney.topN", { n: String(t.paid) })}</span>
        {/if}
      </div>
      {#if bountyKind}
        <div class="notes-col">
          {#if bountyKind === "progressive"}
            <span>{tr("tv.tourney.progressiveBounties")}</span>
            {#if topHead}<span>{tr("tv.tourney.biggestBounty")} <b>{topHead.name}</b>{#if showMoney}{" "}<span class="fig" use:replay={[topHead.amount, "pop"]}>{money(topHead.amount)}</span>{/if}</span>{/if}
          {:else if bountyKind === "mystery"}
            {#if game.mystery}
              <span><span use:replay={[envelopes.length, "pop"]}>{tp("tv.tourney.envelopesLeft", envelopes.length)}</span>{#if showMoney && envelopes.length}{" · "}{tr("tv.tourney.topEnvelope")}{" "}<span class="fig">{money(envelopes[0])}</span>{/if}</span>
            {:else}
              <span>{tr("tv.tourney.mysteryFrom", { n: String(mysteryStartsAt(game)) })}</span>
            {/if}
          {:else}
            <span>{#if showMoney}<span class="fig">{money(game.tourney!.bounty)}</span> {/if}{tr("tv.tourney.bountyOnEveryHead")}</span>
          {/if}
        </div>
      {/if}
      {/if}
    </aside>

    <footer class="foot">
      <ChipLegend chips={game.chips} size={chipPx} dim={gone} />
      {@render houseRules()}
      {@render follow()}
    </footer>
  {:else if cash && game.cash}
    <!-- ================= CASH ================= -->
    <aside class="col left">
      {#if leagueTurn && league && !cashRight}
        {@render standings(league)}
      {:else}
      <div class="stat seats" class:many={seated.length > 10}>
        <span class="k">{tr("tv.cash.seatedLabel", { n: String(cash.seated) })}</span>
        {@render seatList(seated)}
        {#if !seated.length}<div class="sub">{tr("tv.cash.openSeats")}</div>{/if}
      </div>
      {#if waitlist.length}
        <div class="stat seats">
          <span class="k">{tr("tv.cash.waitlist")}</span>
          {#each waitlist.slice(0, WAITLIST) as w, i (w.id)}<div class="seat" use:later={"deal-in"} out:fade={leave()}><span class="fig">{i + 1}</span>{w.name}<span class="waited fig">{waited(w.at)}</span></div>{/each}
          {#if waitlist.length > WAITLIST}<span class="sub">{tp("tv.cash.waitlistMore", waitlist.length - WAITLIST)}</span>{/if}
        </div>
      {/if}
      {/if}
    </aside>

    <section class="main">
      <div class="level">
        <span>{cashNow && isLimit(cashNow.id) ? tr("tv.level.limits") : tr("tv.level.blinds")}</span>
        {#if game.clock.status === "paused"}<span class="pill" use:later={"pop"}><span class="blink">{tr("tv.status.paused")}</span></span>{/if}
        {#if game.clock.status === "idle"}<span class="pill">{tr("tv.status.notStarted")}</span>{/if}
      </div>
      {#if cashNow}<div class="gname" use:replay={[cashNow.id, "roll"]}>{variantName(cashNow.id)}</div>{/if}
      <div class="clock fig stakes" style:--n={stakes.length}>
        <span class="face" use:replay={[stakes, "roll"]}>{money(cashPair[0])}<span class="sep">/</span>{money(cashPair[1])}</span>
      </div>
      {#if planned}<div class="bar"><ProgressBar value={elapsed} max={planned} /></div>{/if}
      <div class="after">
        <span><span class="k">{tr("tv.cash.session")}</span> <span class="fig">{clock(elapsed)}</span></span>
        {#if game.clock.status !== "idle" && planned}
          {#if cashRemaining > 0}
            <span><span class="k">{tr("tv.cash.timeLeft")}</span> <span class="fig">{clock(cashRemaining)}</span></span>
            <span><span class="k">{tr("tv.cash.ends")}</span> <span class="fig">~{timeOfDay(time.now + cashRemaining)}</span></span>
          {:else}
            <span class="hot-text">{tr("tv.cash.lastOrbit")}</span>
          {/if}
        {/if}
      </div>
      {#if cashNow && isStud(cashNow.id)}<div class="callout plain"><span class="fig">{stakesText(cashStakes(game.cash, cashNow.id), true).split(" · ")[0]}</span></div>{/if}
      {#if cashNow && choice}
        <div class="callout plain">
          <span class="k">{tr("tv.cash.dealersChoice")}</span>
          <span>{tr("tv.cash.nextGame", { game: variant(cashNow.next).short })}</span>
          {#if cashNow.nextIn !== null && game.clock.status === "running"}<span class="fig">{clock(cashNow.nextIn)}</span>{/if}
        </div>
      {/if}
      {#if game.cash.straddle && !(cashNow && isStud(cashNow.id))}<div class="callout plain"><span class="k">{tr("tv.cash.straddlesWelcome")}</span></div>{/if}
      {#if side && game.cash.bomb.on}
        {#if side.bombDue}<div class="callout hot-callout" use:later={"pop"}><span class="k">{tr("tv.cash.bombNextHand")}</span>{#if showMoney}<span class="fig">{money(game.cash.bomb.ante)}</span>{/if}</div>
        {:else if side.bombIn !== null && game.clock.status === "running"}<div class="callout plain"><span class="k">{tr("tv.cash.nextBomb")}</span> <span class="fig">{clock(side.bombIn)}</span></div>{/if}
      {/if}
      {#if side && game.cash.highHand.on}
        <div class="callout plain" use:replay={[side.current?.at ?? 0, "pop"]}>
          <span class="k">{tr("tv.cash.highHand")}</span>
          {#if side.current && highHolder}<b>{side.current.hand}</b> <span>{highHolder.name}</span>{:else}<span>{tr("tv.cash.highHandOpen")}</span>{/if}
          {#if showMoney}<span class="fig">{money(game.cash.highHand.prize)}</span>{/if}
          {#if side.hhDue}<span class="hot-text">{tr("tv.cash.highHandTimesUp")}</span>{:else if side.windowLeft !== null && game.clock.status === "running"}<span class="fig">{clock(side.windowLeft)}</span>{/if}
        </div>
      {/if}
      {#if game.cash.sevenTwo.on}<div class="callout plain"><span class="k">{tr("tv.cash.sevenTwoGame")}</span>{#if showMoney}<span class="fig">{tr("tv.cash.sevenTwoPays", { amount: money(game.cash.sevenTwo.amount) })}</span>{/if}</div>{/if}
    </section>

    {#if cashRight}
      <aside class="col right">
        {#if leagueTurn && league}
          {@render standings(league)}
        {:else}
        {#if showMoney}
          <div class="stat">
            <span class="k">{tr("tv.cash.buyIn")}</span>
            <span class="v fig">{money(game.cash.minBuyIn)}<span class="of">–{money(game.cash.maxBuyIn)}</span></span>
          </div>
          <div class="stat">
            <span class="k">{tr("tv.cash.onTable")}</span>
            <span class="v fig" use:replay={[cash.onTable, "glint"]}><Count value={cash.onTable} format={money} /></span>
          </div>
        {/if}
        {#if rake && rake.mode === "pot"}
          <div class="stat"><span class="k">{tr("tv.cash.rake")}</span><span class="v fig">{rake.pct}%</span><span class="sub">{tr("tv.cash.upToAPot", { amount: money(rake.cap) })}</span></div>
        {:else if rake && rake.mode === "seat"}
          <div class="stat"><span class="k">{tr("tv.cash.seatFee")}</span><span class="v fig">{money(rake.fee)}</span></div>
        {/if}
        {/if}
      </aside>
    {/if}

    <footer class="foot">
      <ChipLegend chips={game.chips} size={chipPx} isCash />
      {@render houseRules()}
      {@render follow()}
    </footer>
  {:else}
    <section class="main wait"><div class="level"><Dealing label={tr("tv.wait.waitingForHost")} />{tr("tv.wait.waitingForHost")}</div></section>
  {/if}

  {#if narrow && (game.players.length || waitlist.length)}<FindMe {game} />{/if}

  {#if toast}
    {#key toast.at}
      <div class="tv-scrim" aria-hidden="true" out:fade={leave()}></div>
      <div class="tv-toast is-{toast.kind}" role="status" out:fade={leave()}>
        <span class="t-icon"><Icon icon={KINDS[toast.kind].icon} size="0.9em" /></span>{toast.text}
      </div>
    {/key}
  {/if}

  {#if flare}
    {#key flare.key}<div class="flare" style:--flare={flare.color} style:--n={flare.n} aria-hidden="true"></div>{/key}
  {/if}

  <div class="controls">
    {#if status}<span class="status">{status}</span>{/if}
    <!-- turning sound on answers with the tv's own chime, at the tv's volume -->
    {#if !soundOn}<button data-sound="none" onclick={enableSound}><Icon icon={VolumeX} />{tr("tv.controls.enableSound")} <Kbd k="S" class="keys-hint" /></button>
    {:else if !audioOk}<button class="ask" data-sound="none" onclick={enableSound}><Icon icon={VolumeX} />{tr("tv.controls.clickForSound")}</button>
    {:else}<button data-sound="off" onclick={() => (soundOn = false)}><Icon icon={Volume2} />{tr("tv.controls.soundOn")} <Kbd k="S" class="keys-hint" /></button>{/if}
    {#if canFullscreen}<button onclick={fullscreen}><Icon icon={Maximize} />{tr("tv.controls.fullscreen")} <Kbd k="F" class="keys-hint" /></button>{/if}
  </div>
</div>

{#snippet seatList(list: typeof game.players)}
  {#if tables > 1}
    <div class="tables">
      {#each byTable(list) as tb (tb.table)}
        <div>
          <span class="tname">{tb.table ? tr("tv.seatList.table", { n: String(tb.table) }) : tr("tv.seatList.noSeatYet")}</span>
          {#each tb.players as p, i (p.id)}<div class="seat" style:--i={i} use:later={"deal-in"} out:fade={leave()}><span class="fig">{p.seat?.seat ?? ""}</span>{p.name}</div>{/each}
        </div>
      {/each}
    </div>
  {:else}
    {#each byTable(list).flatMap((tb) => tb.players) as p, i (p.id)}<div class="seat" style:--i={i} use:later={"deal-in"} out:fade={leave()}>{#if p.seat}<span class="fig">{seatLabel(p.seat, tables)}</span>{/if}{p.name}</div>{/each}
  {/if}
{/snippet}

{#snippet standings(b: NonNullable<Game["league"]>)}
  <div class="stat league" in:fade={reveal()}>
    <span class="k">{tr("tv.league.standings")}</span>
    <span class="lname">{b.name}</span>
    <ol class="ladder">
      {#each b.rows.slice(0, LADDER) as r, i (i)}
        <li><span class="place">{i + 1}</span><span class="who">{r.name}</span><span class="fig">{pts(r.points)}</span></li>
      {/each}
    </ol>
    <span class="sub">{tp("tv.league.afterGames", b.games)}</span>
  </div>
{/snippet}

{#snippet strip(l: Level, afterBreak: boolean)}
  {@const cs = cells(l, afterBreak)}
  <div class="strip" style:--n={stripLen(cs)}>
    {#each cs as c, i (i)}
      <div class="cell">
        <span class="k">{c.k}</span>
        <span class="v fig" use:replay={[d?.index ?? 0, "roll"]}>{c.v[0]}{#if c.v.length > 1}<span class="sep">/</span>{c.v[1]}{/if}</span>
      </div>
    {/each}
  </div>
{/snippet}

{#snippet follow()}
  {#if followUrl && !narrow}
    <figure class="follow">
      <QrCode text={followUrl} label={tr("tv.phone.qrLabel")} size="max(64px, calc(var(--u) * 6.5))" />
      <figcaption>{tr("tv.phone.follow")}</figcaption>
    </figure>
  {/if}
{/snippet}

{#snippet houseRules()}
  {#if rules.length > 2}
    <p class="rules"><span class="k">{tr("tv.rules.houseRules")}</span> {#key ruleAt % rules.length}<span class="rule" in:fly={rise(10)}>{rules[ruleAt % rules.length]}</span>{/key}</p>
  {:else if rules.length}
    <p class="rules"><span class="k">{tr("tv.rules.houseRules")}</span> {rules.join(" · ")}</p>
  {/if}
{/snippet}

<style>
  /* one unit for the whole board: 1% of the width on a 16:9 screen, and the
     same share of the height on anything wider, so nothing ever overflows */
  .tv {
    --u: min(1vw, 1.7778vh);
    --tv-good: var(--good);
    /* across a room a single real pixel disappears, so the board's hairline is
       one css pixel on any screen */
    --hair: 1px;
    --side: calc(var(--u) * 23);
    position: fixed;
    inset: 0;
    background: var(--tv-bg);
    color: var(--tv-fg);
    font-family: var(--font);
    display: grid;
    grid-template-columns: var(--side-l, var(--side)) minmax(0, 1fr) var(--side);
    grid-template-rows: auto auto minmax(0, 1fr) auto;
    grid-template-areas:
      "head head head"
      "banner banner banner"
      "left main right"
      "foot foot foot";
    overflow: hidden;
    transition: background-color 600ms var(--ease-out);
    /* a layer for good, so its text never changes weight when it stops moving
       (+layout.svelte). it fills the screen, so what's fixed inside it stays put */
    will-change: transform;
  }
  .tv.wide-left {
    --side-l: calc(var(--u) * 34);
  }
  .tv.two {
    grid-template-columns: var(--side-l, var(--side)) minmax(0, 1fr);
    grid-template-areas:
      "head head"
      "banner banner"
      "left main"
      "foot foot";
  }
  .tv.idle {
    cursor: none;
  }
  /* on the felt a grey line is the felt's own shade and disappears, so the
     board's lines go a step lighter than the felt instead */
  .tv.brk {
    --tv-line: color-mix(in oklch, var(--tv-fg) 16%, var(--tv-felt));
    background: var(--tv-felt);
  }

  /* big numbers are Arial Bold: its figures are all one width, so the clock
     never jitters, and at room size it reads as a clock, not code */
  .fig {
    font-family: var(--font);
    font-variant-numeric: tabular-nums;
  }
  /* labels: small, tracked, uppercase through css */
  .k {
    display: block;
    color: var(--tv-muted);
    font-size: max(12px, calc(var(--u) * 1.05));
    font-weight: 400;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    line-height: 1.3;
  }
  .hot-text {
    color: var(--tv-hot);
  }
  .good-text {
    color: var(--tv-good);
  }

  header {
    grid-area: head;
    display: flex;
    gap: calc(var(--u) * 1.6);
    align-items: baseline;
    padding: calc(var(--u) * 1.1) calc(var(--u) * 2);
    border-bottom: var(--hair) solid var(--tv-line);
  }
  .name {
    font: calc(var(--u) * 2.3) / 1.1 var(--font-serif);
    letter-spacing: -0.01em;
  }
  /* the logo's suits: each is a window one glyph tall, and a new level rolls
     the other suit up into it (the site logo does the same on hover) */
  .suits {
    display: inline-flex;
    align-self: center;
    margin-right: calc(var(--u) * -0.9);
    font: calc(var(--u) * 2.1) / 1 var(--font-serif);
  }
  .sw {
    display: inline-flex;
    flex-direction: column;
    height: 1.15em;
    line-height: 1.15;
    overflow: hidden;
  }
  .sw > span {
    transition: transform 700ms var(--ease-out-expo);
  }
  .sw + .sw > span {
    transition-delay: 90ms;
  }
  .turned .sw > span {
    transform: translateY(-100%);
  }
  .red {
    color: var(--tv-hot);
  }
  .meta {
    color: var(--tv-muted);
    font-size: max(13px, calc(var(--u) * 1.35));
  }
  .tod {
    margin-left: auto;
    font-size: max(14px, calc(var(--u) * 1.7));
    font-weight: 700;
  }

  /* a new message rings: the strip flashes bright three times as it lands */
  .banner:global(.ring) {
    animation:
      slidein 0.5s var(--ease-out-expo),
      ring 0.6s var(--ease-out) 0.35s 3;
  }
  @keyframes ring {
    30% {
      background: var(--tv-fg);
    }
  }
  .banner {
    grid-area: banner;
    background: var(--tv-banner);
    color: var(--tv-banner-fg);
    font-size: max(18px, calc(var(--u) * 2.5));
    font-weight: 700;
    padding: calc(var(--u) * 0.9) calc(var(--u) * 2);
    text-align: center;
    animation: slidein 0.5s var(--ease-out-expo);
  }
  @keyframes slidein {
    from {
      transform: translateY(-100%);
    }
  }

  /* ---------- the side columns: ledger stats, label over number ---------- */
  .col {
    padding: calc(var(--u) * 1.6) calc(var(--u) * 2);
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
    font-size: max(14px, calc(var(--u) * 1.5));
  }
  .left {
    grid-area: left;
    border-right: var(--hair) solid var(--tv-line);
  }
  .right {
    grid-area: right;
    border-left: var(--hair) solid var(--tv-line);
  }
  .stat {
    display: flex;
    flex-direction: column;
    gap: calc(var(--u) * 0.3);
    padding: calc(var(--u) * 1.3) 0;
    border-bottom: var(--hair) solid var(--tv-line);
  }
  .stat:first-child {
    padding-top: calc(var(--u) * 0.4);
  }
  .v {
    font-size: calc(var(--u) * 3.7);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .of {
    color: var(--tv-muted);
    font-weight: 400;
  }
  /* one fewer player: the new count drops into place */
  .n {
    display: inline-block;
  }
  .n:global(.tumble) {
    animation: tumble 600ms var(--ease-out-expo);
  }
  @keyframes tumble {
    from {
      transform: translateY(-0.45em);
      opacity: 0;
    }
  }
  /* money going up catches the light: the number counts up out of banner yellow */
  .v:global(.glint) {
    animation: glint 1.6s var(--ease-out);
  }
  @keyframes glint {
    from,
    15% {
      color: var(--tv-banner);
    }
  }
  .sub {
    color: var(--tv-muted);
    font-size: 0.95em;
  }
  /* bubble / in the money: a word the table should catch, so it's loud */
  .sub.hot-text,
  .sub.good-text {
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.85em;
  }
  .sub.hot-text {
    color: var(--tv-hot);
  }
  .sub.good-text {
    color: var(--tv-good);
  }
  .pair {
    flex-direction: row;
    gap: calc(var(--u) * 2.6);
  }
  .pair > div {
    display: flex;
    flex-direction: column;
    gap: calc(var(--u) * 0.3);
  }
  .notes-col {
    margin-top: auto;
    padding-top: calc(var(--u) * 1.2);
    display: flex;
    flex-direction: column;
    gap: calc(var(--u) * 0.4);
    color: var(--tv-muted);
    font-size: 0.9em;
  }
  .seats {
    gap: calc(var(--u) * 0.2);
  }
  .seat {
    display: flex;
    gap: 0.6em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .seat .fig {
    min-width: 3.4em;
    color: var(--tv-muted);
  }
  /* seats drawn (or a player sitting down) mid-game: dealt in like cards off the top */
  .seat:global(.deal-in) {
    animation: dealt var(--dur-pop) var(--ease-out-expo) backwards;
    animation-delay: calc(var(--i, 0) * 70ms);
  }
  .seats.many {
    font-size: 0.8em;
  }
  .tables {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(9em, 1fr));
    gap: calc(var(--u) * 0.8) calc(var(--u) * 1.6);
  }
  .tables > div {
    display: flex;
    flex-direction: column;
    gap: calc(var(--u) * 0.15);
    min-width: 0;
  }
  .tname {
    font-weight: 700;
    padding-bottom: calc(var(--u) * 0.2);
    margin-bottom: calc(var(--u) * 0.2);
    border-bottom: var(--hair) solid var(--tv-line);
  }
  .tables .seat .fig {
    min-width: 1.6em;
  }
  .ladder {
    list-style: none;
    margin: calc(var(--u) * 0.3) 0 0;
    padding: 0;
    font-size: 1.15em;
  }
  .ladder li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: baseline;
    gap: 0.6em;
    padding: calc(var(--u) * 0.35) calc(var(--u) * 0.3);
    margin: 0 calc(var(--u) * -0.3);
    border-top: var(--hair) solid var(--tv-line);
  }
  .ladder .fig {
    grid-column: 3;
  }
  .who {
    font-size: 0.8em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* the bubble bursts: a flash of banner yellow runs down the ladder */
  .ladder.burst li {
    animation: burst 1.2s var(--ease-out);
    animation-delay: calc(var(--i) * 90ms);
  }
  @keyframes burst {
    25% {
      background: color-mix(in oklch, var(--tv-banner) 32%, transparent);
    }
  }
  .ladder li:first-child {
    border-top: 0;
    font-weight: 700;
  }
  .lname {
    font: 1.15em / 1.15 var(--font-serif);
  }
  /* the game being played (another poker game, a mix, dealer's choice): its name, big */
  .gname {
    font: max(22px, min(calc(var(--u) * 4.2), 8.5cqh)) / 1.05 var(--font-serif);
    letter-spacing: -0.01em;
  }
  .gname .k {
    font-family: var(--font);
    font-size: max(14px, min(calc(var(--u) * 1.3), 3cqh));
  }
  /* the game's name takes a line, so the clock and the numbers under it give it the room */
  .main:has(.gname) .clock {
    font-size: min(var(--big), 30vh, 36cqh, var(--fit));
  }
  .main:has(.gname):has(.callout) .clock {
    font-size: min(var(--big), 26vh, 27cqh, var(--fit));
  }
  .main:has(.gname) .cell .v {
    font-size: min(calc(var(--u) * 7.8), 13.5vh, 12.5cqh, calc(92cqw / (var(--n, 5) * 0.58)));
  }
  .cell .k {
    white-space: nowrap;
  }
  /* a bracket's matches: both names, big, with a quiet "vs" between */
  .matches {
    gap: calc(var(--u) * 0.5);
  }
  .match {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: baseline;
    gap: 0.5em;
    font-size: 1.15em;
    font-weight: 700;
    padding: calc(var(--u) * 0.35) 0;
    border-top: var(--hair) solid var(--tv-line);
  }
  .match:global(.deal-in) {
    animation: dealt var(--dur-pop) var(--ease-out-expo) backwards;
    animation-delay: calc(var(--i, 0) * 70ms);
  }
  .match > span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .match > span:last-child {
    text-align: right;
  }
  .match .vs {
    color: var(--tv-muted);
    font-size: 0.6em;
    font-weight: 400;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .match .lost {
    color: var(--tv-muted);
    text-decoration: line-through;
    font-weight: 400;
  }
  .match .won {
    color: var(--tv-good);
  }
  .matches.many .match {
    font-size: 0.9em;
  }
  /* a kind that isn't poker draws everything under the header itself */
  .kind-board {
    grid-column: 1 / -1;
    grid-row: 3 / -1;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  /* the whole bracket takes the width of the board while it's on */
  .tv.full .col {
    display: none;
  }
  .tv.full .main {
    grid-column: 1 / -1;
  }
  .bracket-wrap {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: stretch;
    min-height: 0;
  }
  .league .who {
    font-size: 0.9em;
  }
  .ladder li > span:first-child {
    color: var(--tv-muted);
  }

  /* ---------- the middle: level, clock, blinds ---------- */
  /* the middle sizes itself off its own height too (cqh), so a banner or a
     color-up callout shrinks the clock instead of pushing things off screen */
  .main {
    grid-area: main;
    container-type: size;
    padding: calc(var(--u) * 1.6) calc(var(--u) * 3);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: min(calc(var(--u) * 1.2), 2cqh);
    min-width: 0;
    text-align: center;
  }
  .main > * {
    flex-shrink: 0;
  }
  .main.wait {
    grid-column: 1 / -1;
  }
  .main.flash {
    animation: flash 0.6s var(--ease-out) 4;
  }
  .main.flash .level {
    color: var(--tv-banner);
  }
  @keyframes flash {
    30% {
      background: var(--tv-raise);
    }
  }
  .level {
    display: flex;
    align-items: center;
    gap: calc(var(--u) * 1.2);
    font-size: max(18px, min(calc(var(--u) * 2.9), 7cqh));
    letter-spacing: 0.12em;
    text-transform: uppercase;
    line-height: 1;
  }
  .pill {
    font-size: 0.5em;
    letter-spacing: 0.1em;
    padding: 0.3em 0.5em;
  }
  .blink {
    animation: blink 1.2s steps(1) infinite;
  }
  @keyframes blink {
    50% {
      opacity: 0.35;
    }
  }
  /* --big is the size it wants, --fit the most its width allows */
  .clock {
    --big: calc(var(--u) * 19);
    --fit: 38cqw;
    font-size: min(var(--big), 31vh, 44cqh, var(--fit));
    font-weight: 700;
    line-height: 0.84;
    letter-spacing: -0.03em;
    white-space: nowrap;
    transition:
      color var(--dur-slow) var(--ease-out),
      opacity var(--dur-slow) var(--ease-out);
  }
  .clock.long {
    --big: calc(var(--u) * 14);
    --fit: 28cqw;
  }
  .main:has(.callout) .clock {
    font-size: min(var(--big), 31vh, 34cqh, var(--fit));
  }
  .pulse,
  .face {
    display: inline-block;
  }
  /* the last five seconds: each tick punches the clock out in banner yellow and
     it settles back, in time with the sound (or instead of it) */
  .pulse:global(.tick) {
    animation: tick 720ms var(--ease-out);
  }
  @keyframes tick {
    from {
      transform: scale(1.09);
      color: var(--tv-banner);
    }
  }
  /* the minute's blink steps aside so the ticks read cleanly */
  .tv.final .clock {
    animation: none;
  }
  .warn-pill {
    color: var(--tv-hot);
  }
  .held .clock {
    opacity: 0.55;
  }
  /* cash stakes run from $1/$2 to $0.25/$0.50: fit by character count */
  .clock.stakes {
    --big: calc(var(--u) * 13);
    --fit: calc(92cqw / (var(--n, 5) * 0.52));
  }
  .sep {
    color: var(--tv-muted);
    font-weight: 400;
    margin: 0 0.08em;
  }
  .hot .clock {
    color: var(--tv-hot);
  }
  .last .clock {
    animation: blink 1s steps(1) infinite;
  }
  /* the dealer screen's bar (ProgressBar), at room size in the board's colors */
  .bar {
    width: 100%;
    max-width: calc(var(--u) * 50);
    margin: min(calc(var(--u) * 0.6), 1cqh) 0 min(calc(var(--u) * 0.4), 0.7cqh);
    --bar-h: max(4px, calc(var(--u) * 0.55));
    --track: var(--tv-line);
    --fill: var(--tv-fg);
  }
  .hot .bar {
    --fill: var(--tv-hot);
  }

  /* blinds and ante: two cells split by a hairline, the second-biggest thing on the board */
  .strip {
    display: flex;
    justify-content: center;
  }
  .cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: calc(var(--u) * 0.5);
    padding: 0 calc(var(--u) * 2.6);
  }
  .cell + .cell {
    border-left: var(--hair) solid var(--tv-line);
  }
  .cell .k {
    font-size: max(13px, calc(var(--u) * 1.25));
  }
  .cell .v {
    font-size: min(calc(var(--u) * 7), 12vh, 15cqh, calc(92cqw / (var(--n, 5) * 0.58)));
    letter-spacing: -0.02em;
  }
  .main:has(.callout) .cell .v {
    font-size: min(calc(var(--u) * 7), 12vh, 12cqh, calc(92cqw / (var(--n, 5) * 0.58)));
  }
  /* a new level rolls up into place: the label, the clock, the blinds, what's next */
  .tv :global(.roll) {
    display: inline-block;
    animation: roll 0.7s var(--ease-out-expo);
  }
  @keyframes roll {
    from {
      transform: translateY(0.45em);
      opacity: 0;
      clip-path: inset(0 0 100% 0);
    }
    to {
      clip-path: inset(0 0 0 0);
    }
  }
  .after {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: calc(var(--u) * 0.6) calc(var(--u) * 3);
    font-size: max(16px, min(calc(var(--u) * 2), 4.2cqh));
    line-height: 1.3;
    margin-top: min(calc(var(--u) * 0.6), 1cqh);
  }
  .after .k {
    display: inline;
    margin-right: 0.5em;
    font-size: 0.6em;
    vertical-align: 0.15em;
  }
  /* more than one callout stacks as a column of equal-width boxes */
  .callouts {
    display: grid;
    gap: min(calc(var(--u) * 0.8), 1.4cqh);
    margin-top: min(calc(var(--u) * 0.6), 1cqh);
  }
  .callouts .callout {
    justify-content: center;
    margin-top: 0;
  }
  .callout {
    display: flex;
    gap: calc(var(--u) * 1.2);
    align-items: center;
    font-size: max(16px, calc(var(--u) * 2));
    background: var(--tv-raise);
    border: var(--hair) solid var(--tv-line);
    padding: min(calc(var(--u) * 0.8), 1.4cqh) calc(var(--u) * 1.4);
    margin-top: min(calc(var(--u) * 0.6), 1cqh);
  }
  .callout .k {
    font-size: 0.6em;
  }
  .callout {
    perspective: 700px;
  }
  .flip {
    display: inline-block;
    line-height: 0;
  }
  /* color-up chips: flicked onto the felt one after another, like the chip editor */
  .flip:global(.flip-in) {
    animation: flip-in 640ms var(--ease-out-expo) backwards;
    animation-delay: calc(250ms + var(--i) * 130ms);
  }
  @keyframes flip-in {
    from {
      transform: translateY(-14px) rotateY(90deg);
      opacity: 0;
    }
  }
  /* on the felt, a gray box reads as a hole; darken the felt instead */
  .brk .callout {
    background: color-mix(in oklch, var(--tv-bg) 45%, transparent);
  }
  .callout.plain {
    background: none;
  }

  /* ---------- the footer: this game's chips and the house rules ---------- */
  .foot {
    grid-area: foot;
    border-top: var(--hair) solid var(--tv-line);
    padding: calc(var(--u) * 1.1) calc(var(--u) * 2);
    display: flex;
    gap: calc(var(--u) * 3);
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    font-size: max(13px, calc(var(--u) * 1.3));
  }
  .foot :global(.legend) {
    gap: calc(var(--u) * 1.4);
  }
  .foot :global(.legend b) {
    font-family: var(--font);
    font-size: 1.05em;
  }
  .rules {
    margin: 0;
    max-width: 60ch;
    text-align: right;
    font-size: 1.1em;
  }
  .rules .k {
    display: inline;
    margin-right: 0.8em;
    font-size: 0.8em;
  }
  .rule {
    display: inline-block;
  }
  .follow {
    margin: 0;
    display: flex;
    align-items: center;
    gap: calc(var(--u) * 0.9);
    color: var(--tv-muted);
    font-size: 0.8em;
    line-height: 1.25;
    max-width: 9em;
  }
  .rules + .follow {
    margin-left: calc(var(--u) * -1);
  }
  .seat .waited {
    margin-left: auto;
    min-width: 0;
    color: var(--tv-muted);
  }

  /* ---------- winner ---------- */
  .winner {
    grid-column: 1 / -1;
    grid-row: 3 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: calc(var(--u) * 1.2);
    text-align: center;
  }
  .trophy {
    color: var(--tv-banner);
    line-height: 0;
  }
  /* the game just ended: trophy lands, the name wipes up, the pot drops, then
     the standings are dealt out one line at a time */
  .entrance .trophy {
    animation: land 0.7s var(--ease-out-expo) backwards;
  }
  .entrance > .k {
    animation: land 0.6s var(--ease-out-expo) 0.2s backwards;
  }
  .entrance .big {
    animation: wipe 0.9s var(--ease-out-expo) 0.3s backwards;
  }
  .entrance .final li {
    animation: dealt var(--dur-pop) var(--ease-out-expo) backwards;
    animation-delay: calc(1400ms + var(--i) * 90ms);
  }
  @keyframes wipe {
    from {
      clip-path: inset(0 0 100% 0);
      transform: translateY(0.25em);
    }
    to {
      clip-path: inset(0 0 -10% 0);
    }
  }
  @keyframes land {
    from {
      transform: translateY(-4vh) scale(0.8);
      opacity: 0;
    }
  }
  .winner .k {
    font-size: max(14px, calc(var(--u) * 1.6));
  }
  .winner .big {
    font: min(calc(var(--u) * 9), 15vh) / 1 var(--font-serif);
    letter-spacing: -0.01em;
  }
  .pot {
    display: flex;
    align-items: flex-end;
    gap: calc(var(--u) * 0.8);
    margin: calc(var(--u) * 0.6) 0;
  }
  .pot :global(.stack) {
    --t: 1vh;
  }
  .final {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: max(16px, calc(var(--u) * 2.1));
    line-height: 1.25;
    min-width: calc(var(--u) * 40);
  }
  .final li {
    display: grid;
    grid-template-columns: 3.2em 1fr auto;
    gap: 1em;
    text-align: left;
    padding: calc(var(--u) * 0.45) 0;
    border-top: var(--hair) solid var(--tv-line);
  }
  .final li.top {
    border-top: 0;
  }
  /* a big payout list runs down two columns instead of off the screen */
  .final.split {
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: repeat(var(--rows), auto);
    column-gap: calc(var(--u) * 4);
    /* never wider than the screen, on a tv stood on its end */
    min-width: min(calc(var(--u) * 76), 96vw);
  }
  .place {
    color: var(--tv-muted);
  }

  /* ---------- the flare: the screen's edge glows in the moment's color ----------
     the visual half of every sound. opacity only (no movement), and at most
     about one pulse a second, so it stays on under reduced motion and well
     clear of anything that could trouble photosensitive viewers. */
  .flare {
    position: fixed;
    inset: 0;
    z-index: 5;
    pointer-events: none;
    opacity: 0;
    box-shadow:
      inset 0 0 0 max(6px, calc(var(--u) * 0.7)) var(--flare),
      inset 0 0 calc(var(--u) * 9) calc(var(--u) * 1.5) color-mix(in oklch, var(--flare) 45%, transparent);
    animation: flare 720ms var(--ease-out) var(--n);
  }
  :global(:root) .tv .flare {
    animation-duration: 720ms !important;
    animation-iteration-count: var(--n) !important;
  }
  @keyframes flare {
    12% {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  /* ---------- toast and controls ---------- */
  /* while news is up the board steps back, so the chalk toast never runs into
     the chalk clock under it. no border needed to hold it apart. */
  .tv-scrim {
    position: fixed;
    inset: 0;
    background: color-mix(in oklch, var(--tv-bg) 50%, transparent);
    animation: dim 0.45s var(--ease-out);
  }
  @keyframes dim {
    from {
      opacity: 0;
    }
  }
  .tv-toast {
    position: fixed;
    left: 50%;
    top: 42%;
    transform: translate(-50%, -50%);
    background: var(--tv-fg);
    color: var(--tv-bg);
    font: bold max(24px, calc(var(--u) * 4.6)) / 1.1 var(--font);
    padding: calc(var(--u) * 1.8) calc(var(--u) * 3);
    animation: pop 0.45s var(--ease-out-expo);
    text-align: center;
    /* centered by translate, so it would only get half the screen to wrap in */
    width: max-content;
    max-width: min(80vw, 22em);
    text-wrap: balance;
  }
  @keyframes pop {
    from {
      transform: translate(-50%, -50%) scale(0.85);
      opacity: 0;
    }
  }
  /* each kind of news arrives its own way: a bust slams down like a stamp,
     money and the winner rise, a shuffle is dealt in from the side */
  .tv-toast:is(.is-bust, .is-bomb) {
    animation: slam 0.5s var(--ease-out-expo);
  }
  @keyframes slam {
    from {
      transform: translate(-50%, -50%) scale(1.3) rotate(-3deg);
      opacity: 0;
    }
    55% {
      opacity: 1;
    }
  }
  .tv-toast:is(.is-win, .is-money, .is-deal) {
    animation: lift 0.7s var(--ease-out-expo);
  }
  @keyframes lift {
    from {
      transform: translate(-50%, -20%);
      opacity: 0;
    }
  }
  /* a bounty is an envelope torn open: it flips up toward the room */
  .tv-toast.is-bounty {
    animation: unseal 0.8s var(--ease-out-expo);
  }
  @keyframes unseal {
    from {
      transform: translate(-50%, -50%) perspective(40em) rotateX(75deg);
      opacity: 0;
    }
  }
  /* a bomb pot coming due is the one callout that asks for attention */
  .callout.hot-callout {
    color: var(--tv-hot);
    border-color: var(--tv-hot);
  }
  .tv-toast:is(.is-shuffle, .is-draw) {
    animation: deal 0.6s var(--ease-out-expo);
  }
  @keyframes deal {
    from {
      transform: translate(-90%, -65%) rotate(-7deg);
      opacity: 0;
    }
  }
  .t-icon {
    display: inline-block;
    margin-right: 0.4em;
    vertical-align: -0.06em;
    line-height: 0;
    animation: icon-in 0.55s var(--ease-out-expo) 0.14s backwards;
  }
  @keyframes icon-in {
    from {
      transform: scale(0.3) rotate(-25deg);
      opacity: 0;
    }
  }

  /* clear of a phone's rounded corners and home bar */
  .controls {
    position: fixed;
    right: calc(10px + env(safe-area-inset-right));
    bottom: calc(10px + env(safe-area-inset-bottom));
    display: flex;
    gap: 6px;
    align-items: center;
    transition: opacity var(--dur-slow) var(--ease-out);
  }
  .idle .controls {
    opacity: 0;
  }
  /* until the browser allows sound, the ask stays up even when idle */
  .idle .controls:has(.ask) {
    opacity: 1;
  }
  .status {
    color: var(--tv-muted);
    font-size: var(--fs-sm);
  }
  .controls button {
    background: var(--tv-raise);
    color: var(--tv-fg);
    border-color: var(--tv-line);
    font-size: var(--fs-sm);
  }
  .controls button:hover {
    border-color: var(--tv-muted);
  }
  .controls :global(kbd) {
    border-color: var(--tv-line);
    background: var(--tv-bg);
  }

  /* a tv on its side: the clock across the top, the two stat columns under it */
  @media (orientation: portrait) {
    .tv,
    .tv.two {
      --u: 1.5vw;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      grid-template-rows: auto auto minmax(0, 1fr) auto auto;
      grid-template-areas: "head head" "banner banner" "main main" "left right" "foot foot";
    }
    .tv.two {
      grid-template-areas: "head head" "banner banner" "main main" "left left" "foot foot";
    }
    .col {
      border: 0;
      border-top: var(--hair) solid var(--tv-line);
    }
    .right {
      border-left: var(--hair) solid var(--tv-line);
    }
  }

  /* a phone, or any short screen (a phone on its side): one column that
     scrolls, clock first, so nothing gets cut off at the bottom */
  @media (max-width: 700px), (max-height: 500px) {
    .tv,
    .tv.two {
      --u: 1.6vw;
      grid-template-columns: 1fr;
      grid-template-areas: "head" "banner" "main" "find" "left" "right" "foot";
      grid-template-rows: none;
      grid-auto-rows: auto;
      align-content: start;
      overflow-y: auto;
      /* no layer of its own here: that would anchor the fixed controls, toasts
         and flare to the board, and they'd scroll away with it */
      will-change: auto;
      /* the notch, on a phone on its side */
      padding-inline: env(safe-area-inset-left) env(safe-area-inset-right);
    }
    header {
      flex-wrap: wrap;
      row-gap: 2px;
    }
    /* the results take the clock's place, and Find Me still comes after them */
    .winner {
      grid-area: main;
      padding-block: calc(var(--u) * 5);
    }
    .name {
      flex: 1 1 auto;
    }
    .tod {
      white-space: nowrap;
    }
    .meta {
      order: 3;
      flex-basis: 100%;
    }
    .main {
      container-type: normal;
      padding-block: calc(var(--u) * 5);
    }
    /* no size container here, so cqw means the screen's width */
    .main .clock,
    .main:has(.callout) .clock {
      font-size: min(24vw, var(--fit));
    }
    .cell .v,
    .main:has(.callout) .cell .v {
      font-size: 11vw;
    }
    .level {
      font-size: 4.5vw;
    }
    .col {
      border: 0;
      border-top: var(--hair) solid var(--tv-line);
      font-size: max(14px, calc(var(--u) * 2.4));
      overflow: visible;
    }
    /* room under the chips for the sound and fullscreen buttons */
    .foot {
      justify-content: center;
      padding-bottom: calc(56px + env(safe-area-inset-bottom));
    }
    /* which ride along the bottom as a bar of their own, so the board
       scrolling under them never shows through the words */
    .controls {
      left: 0;
      right: 0;
      bottom: 0;
      padding: 8px calc(10px + env(safe-area-inset-right)) calc(8px + env(safe-area-inset-bottom))
        calc(10px + env(safe-area-inset-left));
      justify-content: flex-end;
      background: var(--tv-bg);
      border-top: var(--hair) solid var(--tv-line);
    }
    .status {
      margin-right: auto;
    }
    .rules {
      text-align: center;
    }
  }
  /* on its side the screen is wide but short: the board goes by whichever runs
     out first (the same unit as the script's), and the clock and blinds by the
     height, so the clock still fits on the first screen */
  @media (min-width: 701px) and (max-height: 500px) {
    .tv,
    .tv.two {
      --u: min(1.6vw, 2.2vh);
    }
    .main .clock,
    .main:has(.callout) .clock {
      font-size: min(24vw, 44vh, var(--fit));
    }
    .cell .v,
    .main:has(.callout) .cell .v {
      font-size: min(11vw, 18vh);
    }
    .level {
      font-size: min(4.5vw, 7vh);
    }
  }
</style>

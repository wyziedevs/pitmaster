// what the whole tv board works from: the game's clock and numbers, the
// room's settings, and whose turn it is between the clock, the bracket and a
// league's standings. TvView makes one; its views (TourneyView, CashView,
// TvWinner) read it.
import type { Game } from "$lib/types";
import { MediaQuery } from "svelte/reactivity";
import { derive, cashElapsed } from "$lib/clock";
import { tourneyBook } from "$lib/kinds/tournament/engine";
import { currentRound } from "$lib/kinds/tournament/bracket";
import { cashGameNow, cashStakes, gameLine, rotationName, stakesText, variantName } from "$lib/variants";
import { kind as kindOf } from "$lib/kinds";
import { money } from "$lib/util";
import { prefs } from "$lib/settings.svelte";
import { time } from "$lib/now.svelte";
import { t } from "$lib/i18n";
import { Cues } from "./cues.svelte";

export class TvState {
  readonly #game: () => Game;
  readonly #code: () => string;
  readonly cues = new Cues();
  /** the board's unit (css --u) in px, measured off the board, so what's drawn in px (chips) scales with it */
  unit = $state(12.8);
  // a phone (the same test as the css): one column, and Find Me under the clock
  readonly #phone = new MediaQuery("(max-width: 700px), (max-height: 500px)", false);
  // things that show up mid-game (a callout, the bubble, a new seat) make an
  // entrance. on the tv's first paint, or a reload, everything is simply there.
  readonly #openedAt = Date.now();

  constructor(game: () => Game, code: () => string) {
    this.#game = game;
    this.#code = code;
    // the bracket, the clock and the standings take turns, 15 seconds each
    $effect(() => {
      if (this.#turns.length < 2) return;
      this.#turnAt = 0;
      const id = setInterval(() => this.#turnAt++, 15000);
      return () => clearInterval(id);
    });
  }

  get game() {
    return this.#game();
  }
  readonly kind = $derived(kindOf(this.game.type));
  readonly isCash = $derived(this.game.type === "cash");
  /** the host can keep money off the screen */
  readonly showMoney = $derived(prefs().tvMoney !== false);
  get narrow() {
    return this.#phone.current;
  }
  readonly chipPx = $derived(Math.round(Math.max(40, Math.min(96, this.unit * 3.9))));
  /** phones follow along from a qr code on the board: the same link, drawn there */
  readonly followUrl = $derived.by(() => {
    const code = this.#code() || this.game.live?.code || "";
    return code ? `${location.origin}/tv#${code}` : "";
  });
  readonly later = (node: HTMLElement, cls: string) => {
    if (Date.now() - this.#openedAt > 1500) node.classList.add(cls);
  };

  // ---------- a tournament ----------
  // only a running clock needs the time: paused or not started, the board sits still
  readonly d = $derived(!this.isCash && this.game.levels.length ? derive(this.game, this.game.clock.status === "running" ? time.now : 0) : null);
  /** the tournament's book: its numbers, paid places and bounties */
  readonly stats = $derived(!this.isCash && this.game.tourney ? tourneyBook(this.game, this.game.tourney) : null);
  readonly levelNum = $derived(this.d?.levelNum ?? 0);
  readonly winner = $derived(this.game.finished && !this.isCash ? this.game.players.find((p) => p.place === 1) : null);
  /** a satellite's places pay seats */
  readonly seats = $derived(this.stats?.seats ?? 0);

  // a heads-up bracket
  readonly bracket = $derived(!this.isCash && this.game.tourney?.format === "bracket" && !!this.game.matches?.length);
  readonly round = $derived(this.bracket ? currentRound(this.game) : null);
  // the whole bracket starts at the first round of eight matches or fewer, so
  // every name can be read across the room. until the one being played gets
  // there, the matches in the left column are the bracket.
  readonly bracketFrom = $derived.by(() => {
    if (!this.bracket) return 1;
    const count = (r: number) => this.game.matches!.filter((m) => m.round === r).length;
    let r = 1;
    while (count(r) > 8) r++;
    return r;
  });

  // ---------- a cash game ----------
  readonly elapsed = $derived(this.isCash ? cashElapsed(this.game, time.now) : 0);
  /** another poker game, or dealer's choice: the game now (the timer moves it on by itself) */
  readonly cashNow = $derived(this.isCash && this.game.cash?.games?.length ? cashGameNow(this.game.cash, this.elapsed) : null);

  /** the header's line: the kind of game, what it's played for */
  readonly meta = $derived.by(() => {
    const g = this.game;
    if (!this.kind.poker) return this.kind.label();
    if (g.cash) return [t("tv.meta.cashGame"), this.cashNow ? gameLine(cashStakes(g.cash, this.cashNow.id), true) : stakesText(cashStakes(g.cash, "nlhe"), true)].join(" · ");
    // a mixed game's name (HORSE, 8-Game), or the one game it plays
    const rotation = g.tourney?.rotation ?? [];
    const mix = rotation.length > 1 ? (rotationName(rotation) ?? t("tv.level.mixedGames")) : rotation.length ? variantName(rotation[0]) : "";
    return [t("tv.meta.tournament"), mix, this.showMoney && g.tourney ? t("tv.meta.buyIn", { amount: money(g.tourney.buyIn) }) : ""].filter(Boolean).join(" · ");
  });

  // ---------- whose turn ----------
  /** a league game's standings, while there are any */
  readonly league = $derived(this.game.league?.rows.length ? this.game.league : null);
  // before the start and on breaks the whole bracket takes turns with the
  // clock (not on a phone, where the board scrolls instead)
  readonly #bracketTime = $derived(
    this.bracket && !this.winner && !this.narrow && (this.round ?? 1) >= this.bracketFrom && (this.game.clock.status === "idle" || !!this.d?.level.isBreak)
  );
  // the standings take a column's turn while nothing's being played: before
  // the start, on a break, and once it's over. another kind's game has no
  // clock: its quiet times are before the first round and after the last
  readonly #leagueTime = $derived(
    !!this.league &&
      (this.kind.poker ? this.game.clock.status === "idle" || !!this.d?.level.isBreak || this.game.finished : !this.game.clock.startedAt || this.game.finished)
  );
  readonly #turns = $derived([...(this.#bracketTime ? ["bracket"] : []), "clock", ...(this.#leagueTime ? ["league"] : [])]);
  #turnAt = $state(0);
  readonly #turn = $derived(this.#turns[this.#turnAt % this.#turns.length]);
  get bracketTurn() {
    return this.#turn === "bracket";
  }
  /** the league's standings, while it's their turn */
  get standings() {
    return this.#turn === "league" ? this.league : null;
  }
}

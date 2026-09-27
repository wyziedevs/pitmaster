// a cash game on the poker form: its stakes, buy-ins, rake and side games.
// settings() is what's saved and fill() takes it back, from a template or an
// old game.
import type { CashRake, CashSettings } from "$lib/types";
import { isStud, studAmounts } from "$lib/variants";
import { round2 } from "$lib/util";
import { settings } from "$lib/settings.svelte";
import type { Features } from "../poker/features.svelte";
import type { GamePick } from "../poker/games.svelte";

export class CashDraft {
  sb = $state(0.25);
  bb = $state(0.5);
  straddle = $state(settings.cashStraddle);
  minBuyIn = $state(20);
  maxBuyIn = $state(100);
  defaultBuyIn = $state(50);
  hours = $state(settings.cashHours);
  /** how many to work the chips out for */
  players = $state(8);
  rakeMode = $state<CashRake["mode"]>(settings.cashRakeMode);
  rakePct = $state(settings.cashRakePct);
  rakeCap = $state(settings.cashRakeCap);
  seatFee = $state(settings.cashSeatFee);
  house = $state(settings.houseName);
  // side games: the amounts start from the host's usual, in big blinds
  bombOn = $state(true);
  bombAnte = $state(0);
  bombEvery = $state(settings.cashBombEvery);
  bombDouble = $state(settings.cashBombDouble);
  sevenTwoOn = $state(true);
  sevenTwoAmount = $state(0);
  highHandOn = $state(true);
  highHandPrize = $state(settings.cashHighHandPrize);
  highHandEvery = $state(settings.cashHighHandEvery);
  // dealer's choice moves on by itself every this many minutes; stud's ante and bring-in
  rotateMinutes = $state(0);
  studAnte = $state(0);
  studBringIn = $state(0);

  constructor(
    readonly features: Features,
    readonly pick: GamePick,
  ) {}

  /** how the house is paid: none unless the rake is on the form */
  readonly rake = $derived.by<CashRake["mode"]>(() => (this.features.shows("rake") ? this.rakeMode : "none"));
  /** the standard buy-in, in big blinds */
  readonly deep = $derived(this.bb ? Math.round(this.defaultBuyIn / this.bb) : 0);

  /** a new chip set: blinds of its smallest chip, and the host's usual depths and side games in big blinds */
  defaults(unit: number) {
    this.sb = unit;
    this.bb = round2(unit * 2);
    this.defaultBuyIn = round2(this.bb * (settings.cashDepth || 100));
    this.minBuyIn = round2(this.bb * (settings.cashMinBB || 40));
    this.maxBuyIn = round2(this.bb * (settings.cashMaxBB || 200));
    this.bombAnte = round2(this.bb * settings.cashBombBB);
    ({ ante: this.studAnte, bringIn: this.studBringIn } = studAmounts(this.bb, unit));
    this.sevenTwoAmount = round2(this.bb * settings.cashSevenTwoBB);
  }

  settings(): CashSettings {
    const f = this.features;
    const games = this.pick.games;
    return {
      sb: this.sb,
      bb: this.bb,
      straddle: this.straddle,
      minBuyIn: this.minBuyIn,
      maxBuyIn: this.maxBuyIn,
      defaultBuyIn: this.defaultBuyIn,
      plannedMinutes: this.hours * 60,
      rake: { mode: this.rake, pct: this.rakePct, cap: this.rakeCap, fee: this.seatFee },
      bomb: { on: f.shows("bomb") && this.bombOn, ante: Math.max(0, this.bombAnte), doubleBoard: this.bombDouble, everyMinutes: Math.max(0, Math.round(this.bombEvery || 0)) },
      sevenTwo: { on: f.shows("sevenTwo") && this.sevenTwoOn, amount: Math.max(0, this.sevenTwoAmount) },
      highHand: { on: f.shows("highHand") && this.highHandOn, prize: Math.max(0, this.highHandPrize), everyMinutes: Math.max(0, Math.round(this.highHandEvery || 0)) },
      ...(f.shows("variants") && !this.pick.holdem
        ? {
            games: [...games],
            current: games[0],
            since: 0,
            rotateMinutes: games.length > 1 ? Math.max(0, Math.round(this.rotateMinutes || 0)) : 0,
            ...(games.some(isStud) ? { ante: Math.max(0, this.studAnte), bringIn: Math.max(0, this.studBringIn) } : {}),
          }
        : {}),
    };
  }

  /** what settings() saved, back on the form (with what it used added for the night), for `named` players */
  fill(c: CashSettings, named: number) {
    const on = this.features.tonight;
    ({ sb: this.sb, bb: this.bb, straddle: this.straddle, minBuyIn: this.minBuyIn, maxBuyIn: this.maxBuyIn, defaultBuyIn: this.defaultBuyIn } = c);
    this.hours = c.plannedMinutes / 60;
    ({ mode: this.rakeMode, pct: this.rakePct, cap: this.rakeCap, fee: this.seatFee } = c.rake);
    if (this.rakeMode !== "none") on.rake = true;
    ({ on: this.bombOn, ante: this.bombAnte, doubleBoard: this.bombDouble, everyMinutes: this.bombEvery } = c.bomb);
    ({ on: this.sevenTwoOn, amount: this.sevenTwoAmount } = c.sevenTwo);
    ({ on: this.highHandOn, prize: this.highHandPrize, everyMinutes: this.highHandEvery } = c.highHand);
    if (this.bombOn) on.bomb = true;
    if (this.sevenTwoOn) on.sevenTwo = true;
    if (this.highHandOn) on.highHand = true;
    if (c.games?.length) {
      this.pick.set(c.games, true);
      this.rotateMinutes = c.rotateMinutes ?? 0;
      if (c.ante !== undefined) this.studAnte = c.ante;
      if (c.bringIn !== undefined) this.studBringIn = c.bringIn;
      on.variants = true;
    }
    this.players = Math.max(this.players, named);
  }
}

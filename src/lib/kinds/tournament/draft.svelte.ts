// a tournament on the poker form: its buy-in and stacks, the clock, rebuys,
// bounties, the format and the payouts, with the blind structure worked out
// from them (until the host edits it). settings() is what's saved and fill()
// takes it back, from a template or an old game.
import type { BountyKind, GameChip, Level, TourneySettings } from "$lib/types";
import type { Preset } from "$lib/presets";
import { defaultPayouts, generateStructure } from "$lib/blinds";
import { maxStack } from "$lib/chips";
import { prizeTable } from "$lib/game";
import { payGroups } from "$lib/bracket";
import { positives, round2 } from "$lib/util";
import { settings } from "$lib/settings.svelte";
import type { Features } from "../poker/features.svelte";
import type { GamePick } from "../poker/games.svelte";

type Format = TourneySettings["format"];

/**
 * what a format allows. a bracket is heads-up all the way: no rebuys or
 * add-ons, and its prizes are cash, so no satellite. a format or satellite
 * the form doesn't show isn't played.
 */
export function formatRules(p: { format: Format; satelliteOn: boolean; seatValue: number }, shows: { satellite: boolean; shootout: boolean; bracket: boolean }) {
  const bracket = shows.bracket && p.format === "bracket";
  return {
    bracket,
    /** the format saved */
    format: (bracket || (shows.shootout && p.format === "shootout") ? p.format : "standard") as Format,
    satellite: shows.satellite && p.satelliteOn && p.seatValue > 0 && !bracket,
    rebuys: !bracket,
  };
}

/** the biggest round number (1, 1.5, 2, 2.5 ... 8 times a power of ten) at or under x */
function niceBelow(x: number) {
  const m = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8];
  let best = 0;
  for (let k = 0; k < 9; k++) for (const v of m) if (v * 10 ** k <= x && v * 10 ** k > best) best = v * 10 ** k;
  return best || Math.floor(x);
}

/** deeply reactive, so a structure the host edits in place redraws as they go */
function live<T>(v: T) {
  const s = $state(v);
  return s;
}

export class TourneyDraft {
  buyIn = $state(settings.tBuyIn);
  stack = $state(settings.tStack || 10000);
  expected = $state(settings.tPlayers);
  hours = $state(settings.tHours);
  levelMinutes = $state(settings.tLevel);
  breakEvery = $state(settings.tBreakEvery);
  breakMinutes = $state(settings.tBreakMinutes);
  anteFrom = $state(settings.tAnteFrom);
  depth = $state(settings.tDepth);
  rebuyOn = $state(settings.tRebuy);
  rebuyCost = $state(settings.tBuyIn);
  rebuyChips = $state(10000);
  rebuyUntil = $state(settings.tRebuyUntil);
  addOnOn = $state(settings.tAddOn);
  addOnCost = $state(settings.tAddOnCost);
  addOnChips = $state(5000);
  lateReg = $state(settings.tLateReg);
  payoutText = $state(settings.tPayouts);
  rakePct = $state(settings.tRakePct);
  fee = $state(settings.tFee);
  payoutRound = $state(settings.payoutRound);
  bounty = $state(settings.tBounty);
  bountyKind = $state<BountyKind>(settings.tBountyKind);
  mysteryFrom = $state(0);
  // the format: standard, a shootout or a heads-up bracket, and a satellite whose prizes are seats worth this much
  format = $state<Format>("standard");
  satelliteOn = $state(false);
  seatValue = $state(0);
  /** the structure as the host edited it (null: worked out from the rest) */
  edited = $state<Level[] | null>(null);

  constructor(
    readonly features: Features,
    readonly pick: GamePick,
    readonly chips: () => GameChip[],
  ) {}

  readonly rules = $derived.by(() =>
    formatRules(this, { satellite: this.features.shows("format", "useSatellites"), shootout: this.features.shows("format", "useShootouts"), bracket: this.features.shows("format", "useBrackets") }),
  );
  readonly payouts = $derived(this.payoutText.trim() ? positives(this.payoutText) : defaultPayouts(this.expected));
  readonly payoutSum = $derived(this.payouts.reduce((s, p) => s + p, 0));
  /** the games, one a level in turn, when it's more than hold'em */
  readonly #rotation = $derived.by(() => (this.features.shows("variants") && !this.pick.holdem ? this.pick.games : undefined));

  /** the structure these settings make, until the host edits it */
  readonly #auto = $derived.by(() =>
    live(
      generateStructure({
        stack: this.stack,
        players: this.expected,
        targetMinutes: this.hours * 60,
        levelMinutes: this.levelMinutes,
        chips: this.chips(),
        depth: this.depth,
        anteFrom: this.anteFrom,
        breakEvery: this.breakEvery,
        breakMinutes: this.breakMinutes,
        rotation: this.#rotation,
      }),
    ),
  );
  readonly levels = $derived(this.edited ?? this.#auto);

  /** the host changed a level: it's theirs now, whatever else changes */
  keep() {
    this.edited ??= this.#auto;
  }

  /** a new chip set: the host's usual stack, or one that fits it, and rebuys and add-ons to match */
  defaults(chips: GameChip[]) {
    this.stack = settings.tStack || niceBelow(maxStack(chips, this.expected) * 0.6);
    this.rebuyChips = this.stack;
    this.addOnChips = niceBelow(this.stack / 2);
  }

  settings(): TourneySettings {
    const f = this.features;
    const r = this.rules;
    const cut = f.shows("cut");
    return {
      buyIn: this.buyIn,
      stack: this.stack,
      expected: this.expected,
      targetMinutes: this.hours * 60,
      levelMinutes: this.levelMinutes,
      breakEvery: this.breakEvery,
      breakMinutes: this.breakMinutes,
      anteFrom: this.anteFrom,
      depth: this.depth,
      rebuy: { on: f.shows("rebuys") && this.rebuyOn && r.rebuys, cost: this.rebuyCost, chips: this.rebuyChips, untilLevel: this.rebuyUntil },
      addOn: { on: f.shows("rebuys") && this.addOnOn && r.rebuys, cost: this.addOnCost, chips: this.addOnChips },
      lateRegLevel: this.lateReg,
      payouts: this.payoutText.trim() ? this.payouts : [],
      rakePct: cut ? this.rakePct : 0,
      fee: cut ? Math.max(0, this.fee) : 0,
      payoutRound: this.payoutRound,
      bounty: f.shows("bounty") ? Math.max(0, Math.min(this.bounty, this.buyIn)) : 0,
      bountyKind: this.bountyKind,
      mysteryFrom: Math.max(0, Math.round(this.mysteryFrom || 0)),
      satellite: r.satellite ? { seatValue: this.seatValue } : null,
      format: r.format,
      rotation: this.#rotation && [...this.#rotation],
    };
  }

  /** the money with the expected players: the pool, the house's cut and what each place would take (a bracket's rounds share theirs: 3-4, 5-8 ...) */
  readonly estimate = $derived.by(() => {
    const s = this.settings();
    const m = prizeTable(s, this.expected);
    const paid = this.rules.bracket
      ? payGroups(this.expected, m.payouts.length).map((g) => ({ place: g.to > g.from ? `${g.from}–${g.to}` : `${g.from}`, amount: m.payouts[g.from - 1] }))
      : m.payouts.map((amount, i) => ({ place: `${i + 1}`, amount }));
    return { ...m, bounty: s.bounty, house: round2(m.gross - m.bounties - m.pool), paid };
  });

  /** what settings() saved, back on the form (with what it used added for the night) */
  fill(ts: TourneySettings) {
    const on = this.features.tonight;
    ({
      buyIn: this.buyIn,
      stack: this.stack,
      expected: this.expected,
      levelMinutes: this.levelMinutes,
      breakEvery: this.breakEvery,
      breakMinutes: this.breakMinutes,
      anteFrom: this.anteFrom,
      depth: this.depth,
      rakePct: this.rakePct,
      bounty: this.bounty,
      bountyKind: this.bountyKind,
      mysteryFrom: this.mysteryFrom,
      fee: this.fee,
      payoutRound: this.payoutRound,
    } = ts);
    this.hours = ts.targetMinutes / 60;
    ({ on: this.rebuyOn, cost: this.rebuyCost, chips: this.rebuyChips, untilLevel: this.rebuyUntil } = ts.rebuy);
    ({ on: this.addOnOn, cost: this.addOnCost, chips: this.addOnChips } = ts.addOn);
    this.lateReg = ts.lateRegLevel;
    this.payoutText = ts.payouts.join(", ");
    if (this.bounty) on.bounty = true;
    if (this.fee || this.rakePct) on.cut = true;
    if (ts.rebuy.on || ts.addOn.on) on.rebuys = true;
    this.satelliteOn = !!ts.satellite;
    if (ts.satellite) this.seatValue = ts.satellite.seatValue;
    this.format = ts.format;
    if (ts.rotation?.length) {
      this.pick.set(ts.rotation, false);
      on.variants = true;
    }
    if (this.satelliteOn || this.format !== "standard") on.format = true;
  }

  /** a built-in preset only changes what makes it what it is; the rest of the form stays as it was */
  preset(p: Preset) {
    if (p.levelMinutes) this.levelMinutes = p.levelMinutes;
    if (p.hours) this.hours = p.hours;
    if (p.depth) this.depth = p.depth;
    if (p.breakEvery !== undefined) this.breakEvery = p.breakEvery;
    if (p.lateReg !== undefined) this.lateReg = p.lateReg;
    if (p.rebuys !== undefined) this.rebuyOn = p.rebuys;
    if (p.addOn !== undefined) this.addOnOn = p.addOn;
    if (p.expected) this.expected = p.expected;
    if (p.payouts) this.payoutText = p.payouts.join(", ");
    if (p.bountyKind) {
      this.bountyKind = p.bountyKind;
      if (p.bountyShare) this.bounty = round2(this.buyIn * p.bountyShare);
      this.features.tonight.bounty = true;
    }
    this.edited = null;
  }
}

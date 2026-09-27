import type { GameChip, Level } from "./types";
import { isMultiple, near, round2 } from "./util";
import { smallestNeeded } from "./chips";
import { isStud, studAmounts, variant } from "./variants";

// 25/50, 50/100, 75/150, 100/200, 150/300, 200/400, 300/600, 400/800, 500/1000...
const MANTISSAS = [1, 1.5, 2, 3, 4, 5, 6, 8];

/** every "nice" big blind whose small blind can be paid with the smallest chip */
function candidates(unit: number, max: number) {
  const out = new Set<number>();
  for (let k = -3; k <= 8; k++) {
    for (const m of MANTISSAS) {
      const bb = +(m * 10 ** k).toFixed(6);
      if (bb < unit * 2 - 1e-9 || bb > max * 4) continue;
      if (!isMultiple(bb / 2, unit)) continue;
      out.add(bb);
    }
  }
  return [...out].sort((a, b) => a - b);
}

/** closest candidate to target (in log space) strictly above prev */
function pick(cands: number[], target: number, prev: number) {
  const ok = cands.filter((c) => c > prev + 1e-9);
  if (!ok.length) return null;
  return ok.reduce((best, c) => (Math.abs(Math.log(c / target)) < Math.abs(Math.log(best / target)) ? c : best));
}

export interface StructureOpts {
  stack: number;
  players: number;
  targetMinutes: number;
  levelMinutes: number;
  chips: GameChip[];
  /** starting stack in big blinds */
  depth?: number;
  /** at target time, big blind ~ total chips / endRatio */
  endRatio?: number;
  anteFrom?: number;
  breakEvery?: number;
  breakMinutes?: number;
  /** overtime levels past the target so the clock never runs dry */
  extra?: number;
  /** the games, one a level in turn (variants.ts); none = no limit hold'em all night */
  rotation?: string[];
}

/** a blind structure that should wrap up near targetMinutes */
export function generateStructure(o: StructureOpts): Level[] {
  const { stack, players, targetMinutes, levelMinutes, chips } = o;
  const depth = o.depth ?? 100;
  const endRatio = o.endRatio ?? 20;
  const anteFrom = o.anteFrom ?? 0;
  const breakEvery = o.breakEvery ?? 4;
  const breakMinutes = o.breakMinutes ?? 10;
  const extra = o.extra ?? 4;

  if (!chips.length || stack <= 0 || levelMinutes <= 0) return [];
  const unit = Math.min(...chips.map((c) => c.value));
  const totalChips = stack * Math.max(2, players);
  const cands = candidates(unit, totalChips);
  if (!cands.length) return [];

  const perLevel = levelMinutes + (breakEvery > 0 ? breakMinutes / breakEvery : 0);
  const n = Math.max(3, Math.round(targetMinutes / perLevel));

  const startBB = pick(cands, stack / depth, 0)!;
  const endBB = Math.max(startBB * 2, totalChips / endRatio);
  const r = (endBB / startBB) ** (1 / (n - 1));

  const levels: Level[] = [];
  let prev = 0;
  for (let i = 0; i < n + extra; i++) {
    const bb = pick(cands, startBB * r ** i, prev);
    if (!bb) break;
    prev = bb;
    levels.push({ sb: +(bb / 2).toFixed(4), bb, ante: 0, minutes: levelMinutes, overtime: i >= n });
  }

  // each level plays the next game in the rotation. stud antes every hand and
  // brings it in; a big blind ante only belongs in the big-bet games
  const rotation = o.rotation?.length ? o.rotation : null;
  levels.forEach((l, i) => {
    const game = rotation?.[i % rotation.length];
    if (rotation) l.game = game;
    if (isStud(game)) Object.assign(l, { sb: 0 }, studAmounts(l.bb, unit));
    else if (anteFrom > 0 && i + 1 >= anteFrom && variant(game).betting !== "fl") l.ante = l.bb;
  });

  const out: Level[] = [];
  levels.forEach((l, i) => {
    out.push(l);
    if (breakEvery > 0 && (i + 1) % breakEvery === 0 && i < levels.length - 1) {
      out.push({ sb: 0, bb: 0, ante: 0, isBreak: true, minutes: breakMinutes });
    }
  });

  return annotate(out, chips);
}

/** level numbers + color-up notes. call after any edit to the structure. */
export function annotate(levels: Level[], chips: GameChip[]): Level[] {
  const play = levels.filter((l) => !l.isBreak);
  const sorted = [...chips].sort((a, b) => a.value - b.value);
  let inPlay = sorted.map((c) => c.value);
  let num = 0;

  for (const l of levels) {
    if (l.isBreak) {
      l.num = null;
      l.colorUp = [];
      continue;
    }
    l.num = ++num;
    if (!sorted.length) continue;
    // chips smaller than what every remaining level needs can be raced off
    const future = play.slice(num - 1).flatMap((x) => [x.sb, x.bb, x.ante, x.bringIn ?? 0]);
    const need = smallestNeeded(future, sorted);
    const remove = inPlay.filter((v) => v < need.value - 1e-9);
    l.colorUp = remove.length && num > 1 ? sorted.filter((c) => remove.some((v) => near(v, c.value))).map((c) => c.id) : [];
    inPlay = inPlay.filter((v) => v >= need.value - 1e-9);
  }
  return levels;
}

export const structureMinutes = (levels: Level[], upTo = levels.length) =>
  levels.slice(0, upTo).reduce((s, l) => s + Number(l.minutes || 0), 0);

/** minutes until the first overtime level */
export const plannedMinutes = (levels: Level[]) => {
  const i = levels.findIndex((l) => l.overtime);
  return structureMinutes(levels, i < 0 ? levels.length : i);
};

// ---------- payouts ----------

export function defaultPayouts(entrants: number) {
  if (entrants <= 3) return [100];
  if (entrants <= 6) return [65, 35];
  if (entrants <= 10) return [50, 30, 20];
  if (entrants <= 18) return [45, 27, 18, 10];
  if (entrants <= 27) return [40, 25, 16, 11, 8];
  return [35, 22, 15, 11, 9, 8];
}

/** whole-dollar payouts; leftovers go to 1st */
export function payoutAmounts(pool: number, pcts: number[], round = 1) {
  const amts = pcts.map((p) => Math.floor((pool * p) / 100 / round) * round);
  const diff = pool - amts.reduce((s, a) => s + a, 0);
  if (amts.length) amts[0] = +(amts[0] + diff).toFixed(2);
  return amts;
}

/**
 * a place table spread over the rounds: 3rd and 4th share their two payouts,
 * 5th to 8th their four, and so on. shares are in the payout rounding, and
 * what that leaves over (and any places no one can finish in) goes to 1st,
 * like payoutAmounts, so it still adds up to the pool
 */
export function roundShares(table: number[], entrants: number, unit = 1) {
  const out = table.slice(0, 2);
  let rest = 0;
  for (let lo = 3; lo <= entrants; lo = lo * 2 - 1) {
    const hi = Math.min(lo * 2 - 2, entrants);
    const sum = table.slice(lo - 1, hi).reduce((a, v) => a + v, 0);
    const each = round2(Math.floor(sum / (hi - lo + 1) / unit + 1e-9) * unit);
    if (each <= 0) break;
    for (let i = lo - 1; i < hi; i++) out[i] = each;
    rest += sum - each * (hi - lo + 1);
  }
  rest += table.slice(out.length).reduce((a, v) => a + v, 0);
  if (out.length) out[0] = round2(out[0] + rest);
  return out;
}

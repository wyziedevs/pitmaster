// a cash game, worked out from what's saved: the bank, the house's cut, the
// side games and what each player's night came to. nothing here changes the
// game (actions.ts does), so the dealer screen, the tv, the recap and the
// Players page all get the same numbers.
import type { CashRake, Game, HighHandSet, Player } from "$lib/types";
import { round2 } from "$lib/util";

/** the cash game's rake setup (a tournament has none) */
export const cashRake = (game: Game): CashRake => game.cash?.rake ?? { mode: "none", pct: 0, cap: 0, fee: 0 };

/** what each player pays the house to sit, 0 when it rakes the pots instead (or nothing) */
export function seatFee(game: Game) {
  const r = cashRake(game);
  return r.mode === "seat" ? r.fee : 0;
}

export function cashStats(game: Game) {
  const bank = round2(game.players.reduce((s, p) => s + p.cashIn, 0));
  const out = round2(game.players.reduce((s, p) => s + (p.cashOut ?? 0), 0));
  const seated = game.players.filter((p) => p.cashOut === null).length;
  const onTable = round2(game.players.filter((p) => p.cashOut === null).reduce((s, p) => s + p.cashIn, 0));
  const allOut = game.players.length > 0 && seated === 0;
  const r = cashRake(game);
  // chips in the rake box left the table, so they count as cashed out for the bank check
  const rakeBox = r.mode === "pot" ? round2(game.rakeBox ?? 0) : 0;
  // a seat fee is paid in cash, outside the chips: it never touches the bank
  const seatFees = round2(seatFee(game) * game.players.length);
  return { bank, out, seated, onTable, allOut, rakeBox, seatFees, diff: round2(out + rakeBox - bank) };
}

/** high hand prizes paid so far, by player */
export function highHandPrizes(game: Game) {
  const won: Record<string, number> = {};
  for (const e of game.sides ?? []) if (e.kind === "highHandPaid") won[e.playerId] = round2((won[e.playerId] ?? 0) + e.amount);
  return won;
}

/** a player's night in money: see cashNight */
export interface CashNight {
  /** what they cashed out, less what they bought in */
  chips: number;
  /** the seat fee they owe the house */
  fee: number;
  /** high hand prizes the house paid them */
  prizes: number;
  /** what the night came to: the chips, less the fee, plus the prizes */
  net: number;
}

/**
 * what a player's night came to, once they've cashed out (null while they're
 * still playing). `out` asks what it would come to if they cashed out that.
 */
export function cashNight(game: Game, p: Player): CashNight | null;
export function cashNight(game: Game, p: Player, out: number): CashNight;
export function cashNight(game: Game, p: Player, out = p.cashOut): CashNight | null {
  if (out === null) return null;
  const fee = seatFee(game);
  const prizes = highHandPrizes(game)[p.id] ?? 0;
  const chips = round2(out - p.cashIn);
  return { chips, fee, prizes, net: round2(chips - fee + prizes) };
}

/**
 * where the side games stand after `played` of play, worked out from what's
 * happened: bomb pots called and whether one's due, and the high hand now
 * and its window.
 */
export function sideStats(game: Game, played: number) {
  const c = game.cash!;
  // the screen's clock can trail the session's own start by a moment
  const elapsed = Math.max(0, played);
  const list = game.sides ?? [];
  const bombs = list.filter((e) => e.kind === "bomb").length;
  // a timed bomb pot comes due each time another stretch of play goes by, and
  // stays due until the host calls it
  const bombEvery = c.bomb.on ? c.bomb.everyMinutes * 60000 : 0;
  const bombDue = !!bombEvery && Math.floor(elapsed / bombEvery) > bombs;
  const bombIn = bombEvery ? Math.max(0, (bombs + 1) * bombEvery - elapsed) : null;
  const hhEvery = c.highHand.on ? c.highHand.everyMinutes * 60000 : 0;
  const window = hhEvery ? Math.floor(elapsed / hhEvery) : 0;
  const windowLeft = hhEvery ? (window + 1) * hhEvery - elapsed : null;
  const lastPaid = list.findLastIndex((e) => e.kind === "highHandPaid");
  const current = list.slice(lastPaid + 1).findLast((e): e is HighHandSet => e.kind === "highHand") ?? null;
  // the window it was set in is over: time to pay it
  const hhDue = !!current && !!hhEvery && current.window < window;
  const sevenTwos = list.filter((e) => e.kind === "sevenTwo").length;
  return { bombs, bombDue, bombIn, window, windowLeft, current, hhDue, sevenTwos };
}

// liar's dice, worked out from the rounds. only the rounds are saved: dice
// left, who's out, places, whose turn it is and what everyone owes all come
// from them every time, so undoing a round (or fixing one) fixes the rest.
// the "last one standing" part (lives lost until one is left) is shared by
// every lives game (kinds/standing.ts); the dice part is here.
import type { DiceRound, DiceSettings, Game } from "$lib/types";
import { lastStanding } from "../standing";

/** what a round did to each player's dice: -1 lost one, +1 got one back */
function roundEffect(r: DiceRound): Record<string, number> {
  const out: Record<string, number> = {};
  for (const id of r.losers) out[id] = (out[id] ?? 0) - 1;
  for (const id of r.gains ?? []) out[id] = (out[id] ?? 0) + 1;
  return out;
}

/** a called bid, as a round keeps it */
export type Call = { bid: { count: number; face: number }; bidder: string; caller: string; call: "liar" | "spot" };

/** a round that was a call (not a quick one): its bid, the call and the count are all there */
export const called = (r: DiceRound): r is DiceRound & Pick<Call, "bid" | "call"> & { actual: number } => !!r.call && !!r.bid && r.actual !== undefined;

/** whether the call was right: a liar with fewer than the bid there, or spot on with exactly that many */
export const rightCall = (r: { bid: { count: number }; call: "liar" | "spot"; actual: number }) => (r.call === "liar" ? r.actual < r.bid.count : r.actual === r.bid.count);

/** a die that counts toward a bid on `face`: that face, or a one when they're wild (ones themselves only count as ones) */
export const countsToward = (v: number, face: number, wild: boolean) => v === face || (wild && face !== 1 && v === 1);

/**
 * who loses a die (or gets one back) for a called bid, from how many of that
 * face there really were. a wrong call costs the caller one. a right one:
 * liar, and the bidder loses one; spot on, and everyone else loses one, or
 * the caller gets one back.
 */
export function judge(s: DiceSettings, r: Call & { actual: number }, alive: string[]) {
  const none: string[] = [];
  if (!rightCall(r)) return { losers: [r.caller], gains: none, winner: r.bidder };
  if (r.call === "liar") return { losers: [r.bidder], gains: none, winner: r.caller };
  if (s.spotOn === "gain") return { losers: none, gains: [r.caller], winner: r.caller };
  return { losers: alive.filter((id) => id !== r.caller), gains: none, winner: r.caller };
}

/** how many of `face` a bid can expect among `total` dice: a third of them with ones wild (a sixth for ones themselves), a sixth without */
export const expected = (total: number, face: number, wild: boolean) => (wild && face !== 1 ? total / 3 : total / 6);

/**
 * everything about a dice game right now: each player's dice, who's out and
 * where they finished, whether this round is palifico, who starts it, and
 * the money (per die lost, or the buy-in pot by place).
 */
export function diceState(game: Game) {
  const s = game.dice!;
  const rounds = game.rounds ?? [];
  const ids = game.players.map((p) => p.id);
  // money per die goes to whoever won the round, for every die the others lost in it
  const byRound = rounds.map((r) => ({ winner: r.winner, lost: Object.fromEntries(r.losers.map((id) => [id, 1])) }));
  const st = lastStanding(ids, s.dice, rounds.map((r) => ({ effect: roundEffect(r), at: r.at })), s.stakes, byRound);
  const total = st.alive.reduce((n, id) => n + st.lives[id], 0);
  // palifico after the first n rounds: someone just went down to their last
  // die (for the first time) with three or more still in, so the round they
  // start plays it
  const palificoAfter = (n: number) => {
    const last = st.history[n - 1];
    if (!s.palifico || !last || Object.values(last.after).filter((v) => v > 0).length <= 2) return null;
    return Object.keys(last.effect).find((id) => last.before[id] === 2 && last.after[id] === 1 && !st.history.slice(0, n - 1).some((h) => h.after[id] === 1)) ?? null;
  };
  const palifico = palificoAfter(rounds.length);
  // the round starts with whoever lost the last one (if they're still in), or
  // the next one along. a spot on that cost everyone else a die (or gave one
  // back) was the caller's round, so they start
  const r = rounds.at(-1);
  const spotRight = r?.call === "spot" && !!r.caller && !r.losers.includes(r.caller) && !r.cheats?.length;
  const lastLoser = r && (spotRight || r.losers.length !== 1) ? (r.caller ?? r.winner ?? r.gains?.[0] ?? r.losers[0]) : r?.losers[0];
  const from = lastLoser ? ids.indexOf(lastLoser) : 0;
  const starter = palifico ?? [...ids.slice(from), ...ids.slice(0, from)].find((id) => st.lives[id] > 0) ?? null;
  const wild = s.onesWild && !palifico;
  // (the round just played had its own: it can have been the palifico one)
  const lastWild = s.onesWild && !palificoAfter(rounds.length - 1);
  return { ...st, total, palifico, starter, wild, lastWild };
}

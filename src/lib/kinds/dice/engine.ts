// liar's dice, worked out from the rounds. only the rounds are saved: dice
// left, who's out, places, whose turn it is and what everyone owes all come
// from them every time, so undoing a round (or fixing one) fixes the rest.
// the "last one standing" part (lives lost until one is left) is shared by
// every lives game (kinds/standing.ts); the dice part is here.
import type { DiceRound, DiceSettings, Game } from "$lib/types";
import { standing, stakeMoney } from "../standing";

/** what a round did to each player's dice: -1 lost one, +1 got one back */
export function roundEffect(r: DiceRound): Record<string, number> {
  const out: Record<string, number> = {};
  for (const id of r.losers) out[id] = (out[id] ?? 0) - 1;
  for (const id of r.gains ?? []) out[id] = (out[id] ?? 0) + 1;
  return out;
}

/**
 * who loses a die (or gets one back) for a called bid, from how many of that
 * face there really were. liar: the bid stood (the caller loses) or it didn't
 * (the bidder loses). spot on: right on the number and everyone else loses one,
 * or the caller gets one back; wrong, and the caller loses one.
 */
export function judge(s: DiceSettings, r: { bid: { count: number; face: number }; bidder: string; caller: string; call: "liar" | "spot"; actual: number }, alive: string[]) {
  if (r.call === "liar") {
    const stood = r.actual >= r.bid.count;
    return { losers: [stood ? r.caller : r.bidder], gains: [] as string[], winner: stood ? r.bidder : r.caller };
  }
  if (r.actual !== r.bid.count) return { losers: [r.caller], gains: [] as string[], winner: r.bidder };
  if (s.spotOn === "gain") return { losers: [] as string[], gains: [r.caller], winner: r.caller };
  return { losers: alive.filter((id) => id !== r.caller), gains: [] as string[], winner: r.caller };
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
  const st = standing(ids, s.dice, rounds.map((r) => ({ effect: roundEffect(r), at: r.at })), s.dice);
  const alive = ids.filter((id) => st.lives[id] > 0);
  const total = alive.reduce((n, id) => n + st.lives[id], 0);
  // palifico: someone just went down to their last die (for the first time)
  // with three or more still in, so the round they start plays it
  let palifico: string | null = null;
  if (s.palifico && rounds.length && alive.length > 2) {
    const last = st.history.at(-1)!;
    const hit = Object.keys(last.effect).find((id) => last.before[id] === 2 && st.lives[id] === 1 && !st.history.slice(0, -1).some((h) => h.after[id] === 1));
    if (hit) palifico = hit;
  }
  // the round starts with whoever lost the last one (if they're still in), or the next one along
  const lastLoser = rounds.at(-1)?.losers[0] ?? rounds.at(-1)?.gains?.[0];
  const from = lastLoser ? ids.indexOf(lastLoser) : 0;
  const starter = palifico ?? [...ids.slice(from), ...ids.slice(0, from)].find((id) => st.lives[id] > 0) ?? null;
  const wild = s.onesWild && !palifico;
  const money = diceMoney(game, st.lost, st.places);
  return { ...st, alive, total, palifico, starter, wild, money, over: alive.length <= 1 && ids.length > 1 };
}

/** what each player paid in and took home (see stakeMoney): a die is a life */
export const diceMoney = (game: Game, lost: Record<string, number>, places: Record<string, number | null>) =>
  stakeMoney(
    game.dice!.stakes,
    game.players.map((p) => p.id),
    lost,
    places,
    (game.rounds ?? []).map((r) => ({ winner: r.winner, lost: Object.fromEntries(r.losers.map((id) => [id, 1])) }))
  );

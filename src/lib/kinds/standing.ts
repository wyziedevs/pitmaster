// last one standing: everyone starts with the same lives (dice in liar's dice,
// coins in 31, cards in screw your neighbor...), each event takes some away
// (or, now and then, gives one back), and a player with none left is out.
// every lives game is worked out from its events with this, so none of it is
// saved: lives, places, who's still in and the money come from the events
// every time.
import type { DiceStakes } from "$lib/types";
import { defaultPayouts, payoutAmounts } from "$lib/blinds";
import { round2, splitCents } from "$lib/util";

export interface LivesEvent {
  /** lives each player gained (+) or lost (-) */
  effect: Record<string, number>;
  at: number;
}

/**
 * where everyone stands after these events, in order.
 *  lives:   what each player has left
 *  lost:    how many each has lost in all (a life won back doesn't undo one)
 *  places:  where each player finished, once they're out (the winner is 1st);
 *           players out in the same event share the best of their places
 *  history: each event with everyone's lives before and after it
 */
function standing(ids: string[], start: number, events: LivesEvent[]) {
  const lives: Record<string, number> = {};
  const lost: Record<string, number> = {};
  const places: Record<string, number | null> = {};
  for (const id of ids) {
    lives[id] = start;
    lost[id] = 0;
    places[id] = null;
  }
  const history: { effect: Record<string, number>; before: Record<string, number>; after: Record<string, number>; at: number }[] = [];
  for (const e of events) {
    const before = { ...lives };
    const alive = ids.filter((id) => lives[id] > 0);
    for (const [id, d] of Object.entries(e.effect)) {
      if (!(id in lives) || lives[id] <= 0) continue;
      if (d < 0) lost[id] += -d;
      lives[id] = Math.max(0, Math.min(start, lives[id] + d));
    }
    const gone = alive.filter((id) => lives[id] === 0);
    // out together: they share the best place among them
    for (const id of gone) places[id] = alive.length - gone.length + 1;
    history.push({ effect: e.effect, before, after: { ...lives }, at: e.at });
  }
  const left = ids.filter((id) => lives[id] > 0);
  if (left.length === 1 && ids.length > 1) places[left[0]] = 1;
  return { lives, lost, places, history };
}

/**
 * a last-one-standing game from its events: where everyone stands (above),
 * who's still in, whether it's over, and the money (below). `rounds` say who
 * won each round and what everyone lost in it, for money paid round by round.
 */
export function lastStanding(ids: string[], start: number, events: LivesEvent[], stakes: DiceStakes, rounds: { winner?: string; lost: Record<string, number> }[]) {
  const st = standing(ids, start, events);
  const alive = ids.filter((id) => st.lives[id] > 0);
  return { ...st, alive, money: stakeMoney(stakes, ids, st.lost, st.places, rounds), over: alive.length <= 1 && ids.length > 1 };
}
export type Standing = ReturnType<typeof lastStanding>;

/** what a player is up (or down) so far */
export const netOf = (st: Standing, id: string) => round2((st.money.won[id] ?? 0) - (st.money.paid[id] ?? 0));

/**
 * what each player paid in and took home in a lives game.
 *  pot:    everyone's buy-in goes in, paid out by place from the payout table;
 *          players out together share their places' payouts
 *  perDie: every life lost costs a set amount (a die in liar's dice), into a
 *          pot the last one standing takes, or straight to whoever won that
 *          round (every life the others lost in it)
 */
function stakeMoney(
  s: DiceStakes,
  ids: string[],
  lost: Record<string, number>,
  places: Record<string, number | null>,
  rounds: { winner?: string; lost: Record<string, number> }[]
) {
  const paid: Record<string, number> = {};
  const won: Record<string, number> = {};
  for (const id of ids) (paid[id] = 0), (won[id] = 0);
  let pool = 0;
  let payouts: number[] = [];
  if (s.mode === "pot") {
    for (const id of ids) paid[id] = s.buyIn;
    pool = round2(s.buyIn * ids.length);
    payouts = payoutAmounts(pool, s.payouts.length ? s.payouts : defaultPayouts(ids.length), s.payoutRound || 1);
    const at: Record<number, string[]> = {};
    for (const id of ids) if (places[id]) (at[places[id]!] ??= []).push(id);
    for (const [place, who] of Object.entries(at)) {
      const from = Number(place);
      const share = payouts.slice(from - 1, from - 1 + who.length).reduce((a, v) => a + v, 0);
      splitCents(share, who.map(() => 1)).forEach((v, i) => (won[who[i]] = v));
    }
  } else {
    for (const id of ids) paid[id] = round2((lost[id] ?? 0) * s.perDie);
    if (s.perDieTo === "pot") {
      pool = round2(Object.values(paid).reduce((a, v) => a + v, 0));
      // players out together at the very end share it
      const champs = ids.filter((id) => places[id] === 1);
      splitCents(pool, champs.map(() => 1)).forEach((v, i) => (won[champs[i]] = v));
    } else
      for (const r of rounds) {
        if (!r.winner || !(r.winner in won)) continue;
        const n = Object.entries(r.lost).reduce((a, [id, k]) => a + (id === r.winner ? 0 : k), 0);
        won[r.winner] = round2(won[r.winner] + n * s.perDie);
      }
  }
  return { paid, won, pool, payouts };
}

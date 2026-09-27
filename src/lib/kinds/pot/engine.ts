// a pot game (in-between, guts, bourre...): a running pot that players ante
// into, pay into and take from. only the events are saved; the pot, what
// each player has put in and taken out, whose turn it is and the round all
// come from them. each player's in and out adds up like a cash game, so
// settle-up works the same way.
import type { Game, PotEvent, PotSettings } from "$lib/types";
import { round2, splitCents } from "$lib/util";

/** the most a bet (or matching the pot) can be right now: the pot, or the limit if it's lower */
export const potCap = (s: PotSettings, pot: number) => round2(Math.max(0, s.limit > 0 ? Math.min(pot, s.limit) : pot));

export function potState(game: Game) {
  const s = game.pot!;
  const ids = game.players.map((p) => p.id);
  const paid: Record<string, number> = {};
  const taken: Record<string, number> = {};
  for (const id of ids) (paid[id] = 0), (taken[id] = 0);
  let pot = 0;
  let rounds = 0;
  let last: string | null = null;
  for (const e of game.potEvents ?? []) {
    const who = e.players.filter((id) => id in paid);
    if (e.kind === "ante") {
      rounds++;
      for (const id of who) paid[id] = round2(paid[id] + e.amount);
      pot = round2(pot + e.amount * who.length);
      continue;
    }
    for (const id of who) {
      if (e.kind === "take") {
        const got = round2(Math.min(pot, e.amount));
        taken[id] = round2(taken[id] + got);
        pot = round2(pot - got);
      } else {
        paid[id] = round2(paid[id] + e.amount);
        pot = round2(pot + e.amount);
      }
      last = id;
    }
  }
  // once it's over, what's left in the pot goes back out
  if (game.finished && pot > 0) {
    const back = s.leftover === "back" ? ids.filter((id) => paid[id] > 0) : ids;
    splitCents(pot, back.map((id) => (s.leftover === "back" ? paid[id] : 1))).forEach((v, i) => (taken[back[i]] = round2(taken[back[i]] + v)));
  }
  // the turn goes round the table from whoever acted last
  const from = last ? ids.indexOf(last) + 1 : 0;
  const turn = ids.length ? ids[from % ids.length] : null;
  const net = Object.fromEntries(ids.map((id) => [id, round2(taken[id] - paid[id])]));
  return { pot: game.finished ? 0 : pot, left: pot, paid, taken, net, rounds, turn };
}

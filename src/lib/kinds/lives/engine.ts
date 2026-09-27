// a lives game (31, screw your neighbor, knock-out whist, ship captain and
// crew), worked out from its rounds on the shared last-one-standing engine:
// lives left, who's out, places and the money all come from the rounds.
import type { Game, LivesRound } from "$lib/types";
import { standing, stakeMoney } from "../standing";

/** what a round did to each player: lives lost count down */
export const roundEffect = (r: LivesRound): Record<string, number> => Object.fromEntries(Object.entries(r.lost).map(([id, n]) => [id, -n]));

export function livesState(game: Game) {
  const s = game.lives!;
  const rounds = game.lifeRounds ?? [];
  const ids = game.players.map((p) => p.id);
  const st = standing(ids, s.lives, rounds.map((r) => ({ effect: roundEffect(r), at: r.at })));
  const alive = ids.filter((id) => st.lives[id] > 0);
  const money = stakeMoney(
    s.stakes,
    ids,
    st.lost,
    st.places,
    rounds.map((r) => ({ winner: r.winner, lost: r.lost }))
  );
  return { ...st, alive, money, over: alive.length <= 1 && ids.length > 1 };
}

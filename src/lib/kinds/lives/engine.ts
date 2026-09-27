// a lives game (31, screw your neighbor, knock-out whist, ship captain and
// crew), worked out from its rounds on the shared last-one-standing engine:
// lives left, who's out, places and the money all come from the rounds.
import type { Game, LivesRound } from "$lib/types";
import { lastStanding } from "../standing";

/** what a round did to each player: lives lost count down */
const roundEffect = (r: LivesRound): Record<string, number> => Object.fromEntries(Object.entries(r.lost).map(([id, n]) => [id, -n]));

export function livesState(game: Game) {
  const s = game.lives!;
  const rounds = game.lifeRounds ?? [];
  return lastStanding(
    game.players.map((p) => p.id),
    s.lives,
    rounds.map((r) => ({ effect: roundEffect(r), at: r.at })),
    s.stakes,
    rounds,
  );
}

// heads-up brackets: the shape of one, the places its rounds pay, and where
// it stands. the draw and the matches themselves are actions (actions.ts).
import type { Game, Match } from "$lib/types";
import { ordinal } from "$lib/util";
import { t } from "$lib/i18n";

/** the field rounded up to a whole bracket: 11 players play in a bracket of 16 */
export const bracketSize = (n: number) => 2 ** Math.ceil(Math.log2(Math.max(2, n)));

/** seeds in bracket order, so the top seeds meet last: 1 v 8, 4 v 5, 2 v 7, 3 v 6 */
export function seedOrder(size: number): number[] {
  if (size <= 2) return [1, 2];
  return seedOrder(size / 2).flatMap((s) => [s, size + 1 - s]);
}

/** how many rounds a bracket of this field plays */
const bracketRounds = (n: number) => Math.log2(bracketSize(n));

/** where a player out in `round` finishes: everyone out that round shares the best of those places */
export const roundPlace = (entrants: number, round: number) => bracketSize(entrants) / 2 ** round + 1;

/** a bracket's paid places in groups by round: 1st, 2nd, 3rd to 4th, 5th to 8th ... */
export function payGroups(entrants: number, paid: number) {
  const groups: { from: number; to: number }[] = [];
  for (let from = 1; from <= paid; ) {
    const to = from <= 2 ? from : Math.min(from * 2 - 2, entrants);
    groups.push({ from, to });
    from = to + 1;
  }
  return groups;
}

/** a place, or a shared range of them: "3rd–4th" */
export const placeRange = (g: { from: number; to: number }) => (g.to > g.from ? `${ordinal(g.from)}–${ordinal(g.to)}` : ordinal(g.from));

/** the round still being played (the lowest with a match to decide), or null once it's over */
export const currentRound = (game: Game) => {
  const open = (game.matches ?? []).filter((m) => !m.winner);
  return open.length ? Math.min(...open.map((m) => m.round)) : null;
};

/** matches decided by playing, not by a bye */
export const matchesPlayed = (game: Game) => (game.matches ?? []).filter((m) => m.winner && m.a && m.b).length;

/** the match a match's winner plays next (none after the final) */
export const nextMatch = (game: Game, m: Match) => game.matches?.find((x) => x.round === m.round + 1 && x.slot === Math.floor(m.slot / 2));

/** the name of a round, by how many are left after it: the final, the semifinals, ... */
export function roundName(game: Game, round: number) {
  const left = bracketRounds(game.players.length) - round + 1;
  if (left === 1) return t("gameEvents.roundFinal");
  if (left === 2) return t("gameEvents.roundSemis");
  if (left === 3) return t("gameEvents.roundQuarters");
  return t("gameEvents.roundOf", { n: 2 ** left });
}

/** the match a player lost, while it can still be taken back: the winner hasn't played on since */
export function lostMatch(game: Game, playerId: string) {
  const m = game.matches?.find((x) => x.winner && x.a && x.b && x.winner !== playerId && (x.a === playerId || x.b === playerId));
  return m && !nextMatch(game, m)?.winner ? m : undefined;
}

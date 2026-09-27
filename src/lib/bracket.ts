// heads-up brackets: the draw, the matches, and the places they pay
import type { Game, Match } from "./types";
import { ordinal, shuffle } from "./util";
import { t, tp } from "./i18n";
import { flash, logEvent, playerName } from "./events";
import { bust, creditKo, unbust } from "./game";

/** the field rounded up to a whole bracket: 11 players play in a bracket of 16 */
export const bracketSize = (n: number) => 2 ** Math.ceil(Math.log2(Math.max(2, n)));

/** seeds in bracket order, so the top seeds meet last: 1 v 8, 4 v 5, 2 v 7, 3 v 6 */
function seedOrder(size: number): number[] {
  if (size <= 2) return [1, 2];
  return seedOrder(size / 2).flatMap((s) => [s, size + 1 - s]);
}

/** how many rounds a bracket of this field plays */
export const bracketRounds = (n: number) => Math.log2(bracketSize(n));

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
const nextMatch = (game: Game, m: Match) => game.matches?.find((x) => x.round === m.round + 1 && x.slot === Math.floor(m.slot / 2));

function advance(game: Game, m: Match) {
  const next = nextMatch(game, m);
  if (!next) return;
  if (m.slot % 2 === 0) next.a = m.winner;
  else next.b = m.winner;
}

/**
 * random seeds for everyone still in, with the byes (for a field that isn't
 * a power of two) going to the top seeds, so no one gets two and no match is
 * a bye against a bye. a bye moves its player straight on.
 */
export function drawBracket(game: Game) {
  const ps = shuffle(game.players.filter((p) => !p.out));
  const size = bracketSize(ps.length);
  const order = seedOrder(size);
  const now = Date.now();
  const matches: Match[] = [];
  for (let round = 1; size / 2 ** round >= 1; round++)
    for (let slot = 0; slot < size / 2 ** round; slot++)
      matches.push({
        round,
        slot,
        a: round === 1 ? (ps[order[slot * 2] - 1]?.id ?? null) : null,
        b: round === 1 ? (ps[order[slot * 2 + 1] - 1]?.id ?? null) : null,
        winner: null,
        at: null,
      });
  game.matches = matches;
  for (const m of matches.filter((x) => x.round === 1 && (!x.a || !x.b))) {
    m.winner = m.a ?? m.b;
    m.at = now;
    advance(game, m);
  }
  for (const p of game.players) p.seat = null;
  logEvent(game, tp("gameEvents.bracketDrawnLog", ps.length, { byes: size - ps.length }));
  flash(game, t("gameEvents.bracketDrawnFlash"), "draw");
}

/** the name of a round, by how many are left after it: the final, the semifinals, ... */
export function roundName(game: Game, round: number) {
  const left = bracketRounds(game.players.length) - round + 1;
  if (left === 1) return t("gameEvents.roundFinal");
  if (left === 2) return t("gameEvents.roundSemis");
  if (left === 3) return t("gameEvents.roundQuarters");
  return t("gameEvents.roundOf", { n: 2 ** left });
}

/** a match is won: the loser is out in that round, the winner moves on (and, heads-up, takes the knockout) */
export function decideMatch(game: Game, i: number, winnerId: string) {
  const m = game.matches?.[i];
  if (!m || m.winner || !m.a || !m.b || (winnerId !== m.a && winnerId !== m.b)) return;
  const loserId = winnerId === m.a ? m.b : m.a;
  m.winner = winnerId;
  m.at = Date.now();
  bust(game, loserId, roundPlace(game.players.length, m.round));
  // a plain bust says who's out; a match says who beat who and where they go
  const plain = game.flash?.kind === "bust";
  creditKo(game, loserId, winnerId);
  if (!game.finished) {
    advance(game, m);
    const text = t("gameEvents.matchWonFlash", { winner: playerName(game, winnerId), loser: playerName(game, loserId), round: roundName(game, m.round + 1) });
    logEvent(game, text);
    if (plain && game.flash?.kind === "bust") flash(game, text, "bust");
  }
}

/** the match a player lost, while it can still be taken back: the winner hasn't played on since */
export function lostMatch(game: Game, playerId: string) {
  const m = game.matches?.find((x) => x.winner && x.a && x.b && x.winner !== playerId && (x.a === playerId || x.b === playerId));
  return m && !nextMatch(game, m)?.winner ? m : undefined;
}

/** take a match back: the loser is in again, and the winner back out of the next round */
export function undoMatch(game: Game, playerId: string) {
  const m = lostMatch(game, playerId);
  if (!m) return;
  const next = nextMatch(game, m);
  if (next && m.slot % 2 === 0) next.a = null;
  else if (next) next.b = null;
  m.winner = null;
  m.at = null;
  unbust(game, playerId);
}

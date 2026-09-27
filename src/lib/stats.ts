// results and all-time numbers, worked out from the saved games every time.
// nothing here is stored, so fixing a game fixes the leaderboard too.
import type { Game, GameType, League, LeagueBoard, LeaguePoints, Player } from "./types";
import { settled } from "./settle";
import { nameKey, round2 } from "./util";
import { playedAt } from "./game";
import { kind } from "./kinds";

/** one player's night in one game */
export interface Result {
  gameId: string;
  gameName: string;
  type: GameType;
  at: number;
  key: string;
  name: string;
  /** money put in: buy-ins, rebuys, add-ons, seat fees */
  cost: number;
  /** money taken home: cash-out and any high hand prize, or payout + bounties */
  won: number;
  net: number;
  /** tournaments */
  place: number | null;
  entrants: number;
  itm: boolean;
  kos: number;
  /** cash: hours at the table, when we know */
  hours: number | null;
  /** cash side games: high hand prizes the house paid them, and hands won with 7-2 */
  highHand: number;
  sevenTwo: number;
}

/** a player's result in a game from what they paid in and took home; each kind adds its own numbers (a place, knockouts, hours...) */
export const resultRow = (game: Game, p: Player, cost: number, won: number, more: Partial<Result> = {}): Result => ({
  gameId: game.id,
  gameName: game.name,
  type: game.type,
  at: playedAt(game),
  key: nameKey(p.name),
  name: p.name.trim(),
  cost,
  won,
  net: round2(won - cost),
  place: null,
  entrants: game.players.length,
  itm: false,
  kos: 0,
  hours: null,
  highHand: 0,
  sevenTwo: 0,
  ...more,
});

/**
 * final results only, from the game's kind: a cash player counts once
 * they've cashed out, a tournament once it has a winner, and so on.
 */
export const results = (game: Game): Result[] => kind(game.type).results(game);

export interface PlayerLine {
  key: string;
  name: string;
  games: number;
  cashGames: number;
  tourneys: number;
  cashNet: number;
  tourneyNet: number;
  net: number;
  wins: number;
  itm: number;
  kos: number;
  best: number;
  worst: number;
  hours: number;
  last: number;
  results: Result[];
}

export type Period = "all" | "year" | "90d" | "30d";
export const PERIODS: Period[] = ["all", "year", "90d", "30d"];

export function since(period: Period, now = Date.now()) {
  if (period === "year") return new Date(new Date(now).getFullYear(), 0, 1).getTime();
  if (period === "90d") return now - 90 * 86400000;
  if (period === "30d") return now - 30 * 86400000;
  return 0;
}

/** everyone's totals, biggest winner first */
export function leaderboard(games: Game[], opts: { period?: Period; type?: GameType | "all" } = {}): PlayerLine[] {
  const from = since(opts.period ?? "all");
  const lines = new Map<string, PlayerLine>();
  for (const g of games) {
    if (opts.type && opts.type !== "all" && g.type !== opts.type) continue;
    for (const r of results(g)) {
      if (r.at < from || !r.key) continue;
      let l = lines.get(r.key);
      if (!l) {
        l = { key: r.key, name: r.name, games: 0, cashGames: 0, tourneys: 0, cashNet: 0, tourneyNet: 0, net: 0, wins: 0, itm: 0, kos: 0, best: -Infinity, worst: Infinity, hours: 0, last: 0, results: [] };
        lines.set(r.key, l);
      }
      l.games++;
      if (r.type === "cash") {
        l.cashGames++;
        l.cashNet = round2(l.cashNet + r.net);
        l.hours += r.hours ?? 0;
      } else if (r.type === "tournament") {
        l.tourneys++;
        l.tourneyNet = round2(l.tourneyNet + r.net);
        if (r.itm) l.itm++;
        l.kos += r.kos;
      }
      if (r.place === 1) l.wins++;
      l.net = round2(l.net + r.net);
      l.best = Math.max(l.best, r.net);
      l.worst = Math.min(l.worst, r.net);
      // the spelling from their most recent game wins
      if (r.at >= l.last) Object.assign(l, { last: r.at, name: r.name });
      l.results.push(r);
    }
  }
  for (const l of lines.values()) l.results.sort((a, b) => b.at - a.at);
  return [...lines.values()].sort((a, b) => b.net - a.net || b.games - a.games);
}

/** the night in one line, for lists: who won and by how much */
export const headline = (game: Game) => kind(game.type).headline(game);

// ---------- leagues ----------
// standings are worked out from the linked games every time, like the
// leaderboard: fix a game and the league fixes itself.

/** the ways a league can score a place, with the table most leagues start from */
export const POINT_TABLE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
export const round1 = (n: number) => Math.round(n * 10) / 10;

/** what finishing `place` of `entrants` is worth, before points for playing and knockouts */
export function placePoints(p: LeaguePoints, place: number, entrants: number) {
  if (place < 1 || entrants < 1) return 0;
  if (p.kind === "beaten") return Math.max(0, entrants - place + 1);
  if (p.kind === "root") return round1(10 * Math.sqrt(entrants / place));
  return p.table[place - 1] ?? 0;
}

/** one player's game in a league */
export interface LeagueResult {
  gameId: string;
  gameName: string;
  type: GameType;
  at: number;
  place: number;
  entrants: number;
  kos: number;
  net: number;
  points: number;
  /** false when best-of left it out of their total */
  counted: boolean;
}

export interface LeagueLine {
  key: string;
  name: string;
  points: number;
  played: number;
  wins: number;
  kos: number;
  net: number;
  /** oldest first, the same order as the league's games */
  results: LeagueResult[];
}

/** the games that count toward a league, oldest first: linked, the right kind, and over */
export const leagueGames = (league: League, games: Game[]) =>
  games
    .filter((g) => g.leagueId === league.id && league.types.includes(g.type) && settled(g))
    .sort((a, b) => playedAt(a) - playedAt(b));

/**
 * each game's places: its own (a tournament's), or, for a game without them
 * (cash), by what each player won that night (level money shares the better place)
 */
function places(game: Game) {
  const rs = results(game).filter((r) => r.key);
  if (kind(game.type).ranks === "place") return rs.map((r) => ({ r, place: r.place ?? rs.length, entrants: r.entrants }));
  const sorted = [...rs].sort((a, b) => b.net - a.net);
  return sorted.map((r) => ({ r, place: sorted.findIndex((x) => Math.abs(x.net - r.net) < 0.005) + 1, entrants: sorted.length }));
}

/** everyone's points in a league, best first */
export function leagueStandings(league: League, games: Game[]) {
  const counted = leagueGames(league, games);
  const lines = new Map<string, LeagueLine>();
  for (const g of counted) {
    for (const { r, place, entrants } of places(g)) {
      let l = lines.get(r.key);
      if (!l) lines.set(r.key, (l = { key: r.key, name: r.name, points: 0, played: 0, wins: 0, kos: 0, net: 0, results: [] }));
      const points = round1(placePoints(league.points, place, entrants) + league.points.play + r.kos * league.points.ko);
      l.results.push({ gameId: g.id, gameName: g.name, type: g.type, at: r.at, place, entrants, kos: r.kos, net: r.net, points, counted: true });
      l.played++;
      if (place === 1) l.wins++;
      l.kos += r.kos;
      l.net = round2(l.net + r.net);
      // the spelling from their latest game wins
      l.name = r.name;
    }
  }
  const best = league.bestOf && league.bestOf > 0 ? league.bestOf : Infinity;
  for (const l of lines.values()) {
    // best-of keeps the biggest scores; on a tie, the earlier game
    const keep = new Set([...l.results].sort((a, b) => b.points - a.points || a.at - b.at).slice(0, best));
    for (const r of l.results) r.counted = keep.has(r);
    l.points = round1(l.results.reduce((s, r) => s + (r.counted ? r.points : 0), 0));
  }
  const rows = [...lines.values()].sort((a, b) => b.points - a.points || b.wins - a.wins || b.net - a.net || a.name.localeCompare(b.name));
  return { rows, games: counted };
}

/** the top of the table, for a tv */
export function leagueBoard(league: League, games: Game[], top = 10): LeagueBoard {
  const s = leagueStandings(league, games);
  return { name: league.name, games: s.games.length, rows: s.rows.slice(0, top).map((l) => ({ name: l.name, points: l.points, games: l.played })) };
}

/** the season's dates hold `at` (the end date runs to the end of that day, local time) */
export function inSeason(league: League, at: number) {
  if (at < league.start) return false;
  if (!league.end) return true;
  const after = new Date(league.end);
  after.setDate(after.getDate() + 1);
  return at < after.getTime();
}

/** a league that's on at `at`, for a new game of this type (the latest to start wins) */
export const currentLeague = (leagues: League[], type: GameType, at = Date.now()) =>
  leagues
    .filter((l) => l.types.includes(type) && inSeason(l, at))
    .sort((a, b) => b.start - a.start)[0] ?? null;

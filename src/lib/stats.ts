// results and all-time numbers, worked out from the saved games every time.
// nothing here is stored, so fixing a game fixes the leaderboard too.
import type { Game, GameType, League, LeagueBoard, LeaguePoints } from "./types";
import { tourneyStats, koCount, paidFor, cashRake, bountyBook, highHandPrizes, settled } from "./game";
import { money, nameKey, round2, signed } from "./util";

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

/**
 * final results only. a cash player counts once they've cashed out; a
 * tournament counts once it has a winner (until then the pool can still grow).
 */
export function results(game: Game): Result[] {
  const base = { gameId: game.id, gameName: game.name, type: game.type, at: game.clock.startedAt ?? game.createdAt };
  if (game.type === "cash") {
    // a seat fee is part of what the night cost them
    const r = cashRake(game);
    const fee = r.mode === "seat" ? r.fee : 0;
    const prizes = highHandPrizes(game);
    return game.players
      .filter((p) => p.cashOut !== null)
      .map((p) => {
        const start = Math.max(p.joinedAt ?? 0, game.clock.startedAt ?? 0) || null;
        const hours = start && p.leftAt && p.leftAt > start ? (p.leftAt - start) / 3600000 : null;
        const highHand = prizes[p.id] ?? 0;
        return {
          ...base,
          key: nameKey(p.name),
          name: p.name.trim(),
          cost: round2(p.cashIn + fee),
          won: round2((p.cashOut ?? 0) + highHand),
          net: round2((p.cashOut ?? 0) + highHand - p.cashIn - fee),
          place: null,
          entrants: game.players.length,
          itm: false,
          kos: 0,
          hours,
          highHand,
          sevenTwo: (game.sides ?? []).filter((e) => e.kind === "sevenTwo" && e.playerId === p.id).length,
        };
      });
  }
  if (!game.finished || !game.tourney) return [];
  const t = game.tourney;
  const s = tourneyStats(game);
  const book = bountyBook(game);
  return game.players.map((p) => {
    const cost = t.buyIn + p.rebuys * t.rebuy.cost + p.addOns * t.addOn.cost;
    const payout = p.place ? paidFor(game, p.id, p.place, s.payouts) : 0;
    const kos = koCount(game, p.id);
    const won = round2(payout + (book.won[p.id] ?? 0));
    return {
      ...base,
      key: nameKey(p.name),
      name: p.name.trim(),
      cost,
      won,
      net: round2(won - cost),
      place: p.place,
      entrants: s.entrants,
      itm: payout > 0,
      kos,
      hours: null,
      highHand: 0,
      sevenTwo: 0,
    };
  });
}

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
export const PERIODS: { id: Period; label: string }[] = [
  { id: "all", label: "All Time" },
  { id: "year", label: "This Year" },
  { id: "90d", label: "90 Days" },
  { id: "30d", label: "30 Days" },
];

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
      } else {
        l.tourneys++;
        l.tourneyNet = round2(l.tourneyNet + r.net);
        if (r.place === 1) l.wins++;
        if (r.itm) l.itm++;
        l.kos += r.kos;
      }
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
export function headline(game: Game) {
  const rs = results(game);
  if (game.type === "tournament") {
    const w = rs.find((r) => r.place === 1);
    return w ? `${w.name} won ${money(w.won)}` : "";
  }
  const top = [...rs].sort((a, b) => b.net - a.net)[0];
  return top && top.net > 0 ? `${top.name} ${signed(top.net)}` : "";
}

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
    .sort((a, b) => (a.clock.startedAt ?? a.createdAt) - (b.clock.startedAt ?? b.createdAt));

/**
 * each game's places: a tournament's own, and a cash game's by what each player
 * won that night (level money shares the better place)
 */
function places(game: Game) {
  const rs = results(game).filter((r) => r.key);
  if (game.type !== "cash") return rs.map((r) => ({ r, place: r.place ?? rs.length, entrants: r.entrants }));
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
      const points = round1(placePoints(league.points, place, entrants) + league.points.play + (g.type === "tournament" ? r.kos * league.points.ko : 0));
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

/** a league that's on at `at`, for a new game of this type (the latest to start wins) */
export const currentLeague = (leagues: League[], type: GameType, at = Date.now()) =>
  leagues
    .filter((l) => l.types.includes(type) && l.start <= at && (!l.end || at < l.end + 86400000))
    .sort((a, b) => b.start - a.start)[0] ?? null;

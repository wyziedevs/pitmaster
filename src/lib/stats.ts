// results and all-time numbers, worked out from the saved games every time.
// nothing here is stored, so fixing a game fixes the leaderboard too.
import type { Game, GameType } from "./types";
import { tourneyStats, koCount, paidFor, cashRake, bountyBook } from "./game";
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
  /** money taken home: cash-out, or payout + bounties */
  won: number;
  net: number;
  /** tournaments */
  place: number | null;
  entrants: number;
  itm: boolean;
  kos: number;
  /** cash: hours at the table, when we know */
  hours: number | null;
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
    return game.players
      .filter((p) => p.cashOut !== null)
      .map((p) => {
        const start = Math.max(p.joinedAt ?? 0, game.clock.startedAt ?? 0) || null;
        const hours = start && p.leftAt && p.leftAt > start ? (p.leftAt - start) / 3600000 : null;
        return {
          ...base,
          key: nameKey(p.name),
          name: p.name.trim(),
          cost: round2(p.cashIn + fee),
          won: p.cashOut ?? 0,
          net: round2((p.cashOut ?? 0) - p.cashIn - fee),
          place: null,
          entrants: game.players.length,
          itm: false,
          kos: 0,
          hours,
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

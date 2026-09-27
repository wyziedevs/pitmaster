// seats and tables: the draw, balancing as people go out, and shootout tables
import type { Game, Player, Seat } from "./types";
import { range, shuffle } from "./util";
import { t, tp } from "./i18n";
import { flash, logEvent, playerName } from "./events";
import { kind } from "./kinds";

export const seatsPer = (game: Game) => game.seatsPerTable ?? 9;

/** people who still need a chair: not busted, not cashed out */
const playing = (game: Game) => game.players.filter((p) => kind(game.type).playing(game, p));

export const seatsDrawn = (game: Game) => game.players.some((p) => p.seat);

/** random seats, dealt round-robin so the tables come out even */
export function drawSeats(game: Game, perTable = seatsPer(game)) {
  game.seatsPerTable = perTable;
  const ps = shuffle(playing(game));
  const tables = Math.max(1, Math.ceil(ps.length / perTable));
  const chairs = Array.from({ length: tables }, () => shuffle(range(perTable)));
  ps.forEach((p, i) => (p.seat = { table: (i % tables) + 1, seat: chairs[i % tables].pop()! }));
  const ids = new Set(ps.map((p) => p.id));
  for (const p of game.players) if (!ids.has(p.id)) p.seat = null;
  logEvent(game, tp("gameEvents.seatsDrawnLog", tables, { n: ps.length }));
  flash(game, t("gameEvents.seatsDrawnFlash"), "draw");
}

export function clearSeats(game: Game) {
  for (const p of game.players) p.seat = null;
}

/** how many are sitting at each table, smallest first */
export function tableCounts(game: Game) {
  const counts = new Map<number, number>();
  for (const p of playing(game)) if (p.seat) counts.set(p.seat.table, (counts.get(p.seat.table) ?? 0) + 1);
  return [...counts].map(([table, n]) => ({ table, n })).sort((a, b) => a.n - b.n || a.table - b.table);
}

function freeSeats(game: Game, table: number) {
  const taken = new Set(playing(game).filter((p) => p.seat?.table === table).map((p) => p.seat!.seat));
  return range(seatsPer(game)).filter((s) => !taken.has(s));
}

/** a late arrival (or a rebuy) takes a free chair at the shortest table */
export function seatNewcomer(game: Game, p: Player) {
  if (!seatsDrawn(game) || p.seat) return;
  const tables = tableCounts(game);
  const open = tables.find((t) => t.n < seatsPer(game));
  const table = open ? open.table : Math.max(0, ...tables.map((t) => t.table)) + 1;
  const free = shuffle(freeSeats(game, table));
  p.seat = { table, seat: free[0] ?? 1 };
}

/** back in the game: keep their old chair unless someone's in it now */
export function reseat(game: Game, p: Player) {
  if (!seatsDrawn(game)) return;
  const s = p.seat;
  const taken = s && playing(game).some((x) => x.id !== p.id && x.seat?.table === s.table && x.seat.seat === s.seat);
  if (!s || taken) {
    p.seat = null;
    seatNewcomer(game, p);
  }
}

export type TableAdvice =
  | { kind: "break"; table: number; moves: { id: string; to: Seat }[] }
  | { kind: "move"; id: string; from: Seat; to: Seat };

/**
 * what the floor would say: break a table once everyone fits at one fewer, or
 * move one player when tables are two or more apart. deterministic, so the
 * advice doesn't flicker between renders.
 */
export function tableAdvice(game: Game): TableAdvice | null {
  // shootout tables play on short-handed until each has its winner
  if (shootout(game)?.final === false) return null;
  const tables = tableCounts(game);
  if (tables.length < 2) return null;
  const per = seatsPer(game);
  const total = tables.reduce((s, t) => s + t.n, 0);
  if (Math.ceil(total / per) < tables.length) {
    const gone = tables[0].table;
    const movers = playing(game).filter((p) => p.seat?.table === gone);
    const room = tables
      .slice(1)
      .flatMap((t) => freeSeats(game, t.table).map((seat) => ({ table: t.table, seat, n: t.n })))
      .sort((a, b) => a.n - b.n || a.table - b.table || a.seat - b.seat);
    // fill the shortest tables first, one chair at a time
    const moves: { id: string; to: Seat }[] = [];
    const fill = new Map(tables.map((t) => [t.table, t.n]));
    for (const p of movers) {
      room.sort((a, b) => fill.get(a.table)! - fill.get(b.table)! || a.table - b.table || a.seat - b.seat);
      const spot = room.shift();
      if (!spot) break;
      fill.set(spot.table, fill.get(spot.table)! + 1);
      moves.push({ id: p.id, to: { table: spot.table, seat: spot.seat } });
    }
    return { kind: "break", table: gone, moves };
  }
  const small = tables[0];
  const big = tables[tables.length - 1];
  if (big.n - small.n < 2) return null;
  const mover = playing(game)
    .filter((p) => p.seat?.table === big.table)
    .sort((a, b) => b.seat!.seat - a.seat!.seat)[0];
  const seat = freeSeats(game, small.table)[0];
  if (!mover || !seat) return null;
  return { kind: "move", id: mover.id, from: mover.seat!, to: { table: small.table, seat } };
}

export function applyAdvice(game: Game, a: TableAdvice) {
  if (a.kind === "move") {
    const p = game.players.find((x) => x.id === a.id);
    if (!p) return;
    p.seat = a.to;
    logEvent(game, t("gameEvents.movedLog", { name: p.name, table: a.to.table, seat: a.to.seat }));
    flash(game, t("gameEvents.movedFlash", { name: p.name, table: a.to.table, seat: a.to.seat }), "seat");
  } else {
    for (const m of a.moves) {
      const p = game.players.find((x) => x.id === m.id);
      if (p) p.seat = m.to;
    }
    const details = a.moves.map((m) => `${playerName(game, m.id)} to T${m.to.table} S${m.to.seat}`).join(", ");
    logEvent(game, t("gameEvents.tableBrokeLog", { table: a.table, details }));
    flash(game, t("gameEvents.tableBreakingFlash", { table: a.table }), "seat");
  }
}

/**
 * a shootout's tables: who's still in at each, and whether every table is down
 * to its winner (then the final table can be drawn). null when it's not a shootout.
 */
export function shootout(game: Game) {
  if (game.tourney?.format !== "shootout") return null;
  const alive = game.players.filter((p) => !p.out);
  const nums = [...new Set(alive.map((p) => p.seat?.table ?? 0).filter(Boolean))].sort((a, b) => a - b);
  const tables = nums.map((table) => ({ table, left: alive.filter((p) => p.seat?.table === table) }));
  const final = !!game.finalAt;
  const ready = !final && !game.finished && tables.length > 1 && tables.every((x) => x.left.length === 1) && alive.every((p) => p.seat);
  return { final, tables, ready };
}

/** the table winners take their seats at the final table */
export function drawFinalTable(game: Game) {
  const alive = shuffle(game.players.filter((p) => !p.out));
  const chairs = shuffle(range(Math.max(seatsPer(game), alive.length)));
  alive.forEach((p) => (p.seat = { table: 1, seat: chairs.pop()! }));
  game.finalAt = Date.now();
  const names = alive.map((p) => p.name).join(", ");
  logEvent(game, t("gameEvents.finalTableFlash", { names }));
  flash(game, t("gameEvents.finalTableFlash", { names }), "draw");
}

export const seatLabel = (s: Seat | null | undefined, tables: number) => (!s ? "" : tables > 1 ? `T${s.table} · ${s.seat}` : `${s.seat}`);

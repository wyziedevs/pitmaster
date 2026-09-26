import type { CashSettings, EventKind, Game, GameChip, GameType, Level, Player, Seat, TourneySettings } from "./types";
import { newClock } from "./clock";
import { defaultPayouts, payoutAmounts } from "./blinds";
import { money, nameKey, ordinal, round2, uid } from "./util";
import { t, tp } from "./i18n";

export function newGame(p: {
  name: string;
  type: GameType;
  chipSetName: string;
  multiplier: number;
  chips: GameChip[];
  notes: string;
  players: string[];
  levels?: Level[];
  tourney?: TourneySettings;
  cash?: CashSettings;
}): Game {
  const now = Date.now();
  const game: Game = {
    id: uid(),
    name: p.name,
    type: p.type,
    createdAt: now,
    updatedAt: now,
    chipSetName: p.chipSetName,
    multiplier: p.multiplier,
    chips: p.chips,
    notes: p.notes,
    players: [],
    clock: newClock(),
    levels: p.levels ?? [],
    tourney: p.tourney,
    cash: p.cash,
    message: null,
    flash: null,
    log: [],
    live: null,
    finished: false,
  };
  for (const name of p.players) addPlayer(game, name, true);
  logEvent(game, t("gameEvents.created"));
  return game;
}

export function newPlayer(name: string): Player {
  return { id: uid(), name, cashIn: 0, cashOut: null, rebuys: 0, addOns: 0, out: false, place: null, bustedAt: null };
}

export function logEvent(game: Game, text: string) {
  game.log.unshift({ t: Date.now(), text });
  game.log = game.log.slice(0, 300);
}

export function flash(game: Game, text: string, kind: EventKind = "note") {
  game.flash = { text, at: Date.now(), kind };
}

export function addPlayer(game: Game, name: string, quiet = false) {
  const p = newPlayer(name.trim() || `Seat ${game.players.length + 1}`);
  if (game.type === "cash" && game.cash) {
    p.cashIn = game.cash.defaultBuyIn;
    p.joinedAt = Date.now();
  }
  // seat them before they join the list: once pushed into a live game, writes
  // have to go through game.players, not this object
  seatNewcomer(game, p);
  game.players.push(p);
  if (!quiet) {
    logEvent(
      game,
      game.type === "cash" ? t("gameEvents.satDownWithAmount", { name: p.name, amount: money(p.cashIn) }) : t("gameEvents.registered", { name: p.name }),
    );
    flash(game, game.type === "cash" ? t("gameEvents.satDownFlash", { name: p.name }) : t("gameEvents.isInFlash", { name: p.name }), "chips");
  }
  return p;
}

// ---------- tournament ----------

export function tourneyStats(game: Game) {
  const t = game.tourney!;
  const entrants = game.players.length;
  const rebuys = game.players.reduce((s, p) => s + p.rebuys, 0);
  const addOns = game.players.reduce((s, p) => s + p.addOns, 0);
  const gross = entrants * t.buyIn + rebuys * t.rebuy.cost + addOns * t.addOn.cost;
  // each entry (buy-in or rebuy) puts one bounty on that player's head
  const bounty = t.bounty;
  const bounties = round2((entrants + rebuys) * bounty);
  // the house: a flat fee out of every entry, then its % of what's left
  const fees = round2((entrants + rebuys) * t.fee);
  const rake = round2(fees + ((gross - bounties - fees) * (t.rakePct || 0)) / 100);
  const pool = round2(Math.max(0, gross - bounties - rake));
  const chipsInPlay = entrants * t.stack + rebuys * t.rebuy.chips + addOns * t.addOn.chips;
  const left = game.players.filter((p) => !p.out).length;
  const avgStack = left ? chipsInPlay / left : 0;
  const pcts = t.payouts.length ? t.payouts : defaultPayouts(entrants);
  const payouts = payoutAmounts(pool, pcts, t.payoutRound || 1);
  // one out from the money, and in it
  const paid = payouts.filter((p) => p > 0).length;
  const bubble = !game.finished && left === paid + 1 && entrants > paid;
  const itm = !game.finished && left <= paid && left > 1;
  return { entrants, rebuys, addOns, gross, bounty, bounties, fees, rake, pool, chipsInPlay, left, avgStack, pcts, payouts, paid, bubble, itm };
}

export function bust(game: Game, playerId: string) {
  const p = game.players.find((x) => x.id === playerId);
  if (!p || p.out) return;
  const left = game.players.filter((x) => !x.out).length;
  p.out = true;
  p.place = left;
  p.bustedAt = Date.now();
  // assign first, then push through game.kos: pushing onto the fresh [] itself
  // would skip the reactive copy the game actually keeps
  if (!game.kos) game.kos = [];
  game.kos.push({ out: p.id, by: null, at: p.bustedAt });
  logEvent(game, t("gameEvents.bustedLog", { name: p.name, place: ordinal(left) }));
  flash(game, t("gameEvents.bustedFlash", { name: p.name, place: ordinal(left) }), "bust");

  const alive = game.players.filter((x) => !x.out);
  // the bubble bursts: everyone still sitting gets paid
  const paid = tourneyStats(game).paid;
  if (alive.length > 1 && alive.length === paid && game.players.length > paid) {
    logEvent(game, t("gameEvents.bubbleLog", { name: p.name }));
    flash(game, t("gameEvents.bubbleFlash", { name: p.name }), "money");
  }
  if (alive.length === 1) {
    alive[0].place = 1;
    game.finished = true;
    game.endedAt = Date.now();
    logEvent(game, t("gameEvents.wins", { name: alive[0].name }));
    flash(game, t("gameEvents.wins", { name: alive[0].name }), "win");
  }
}

/** undo a bust. `rebuy` = they really went out and bought back in, so the knockout stands */
export function unbust(game: Game, playerId: string, rebuy = false) {
  const p = game.players.find((x) => x.id === playerId);
  if (!p || !p.out) return;
  if (!rebuy && game.kos) {
    const i = game.kos.findLastIndex((k) => k.out === playerId);
    if (i >= 0) game.kos.splice(i, 1);
  }
  const place = p.place ?? 0;
  p.out = false;
  p.place = null;
  p.bustedAt = null;
  // anyone who busted after them now finished one spot lower
  for (const x of game.players) if (x.out && x.place !== null && x.place < place) x.place++;
  for (const x of game.players) if (!x.out) x.place = null;
  game.finished = false;
  game.endedAt = undefined;
  reseat(game, p);
  if (!rebuy) logEvent(game, t("gameEvents.unbustLog", { name: p.name }));
}

/**
 * the remaining players chop it up. they finish in chip order (for the
 * record), each takes their deal amount, and the tournament is over.
 */
export function takeDeal(game: Game, kind: "icm" | "chop", amounts: Record<string, number>, stacks: Record<string, number>) {
  const alive = game.players.filter((p) => !p.out).sort((a, b) => (stacks[b.id] ?? 0) - (stacks[a.id] ?? 0));
  const now = Date.now();
  alive.forEach((p, i) => {
    p.place = i + 1;
    if (i > 0) {
      p.out = true;
      p.bustedAt = now;
    }
  });
  game.deal = { kind, amounts, at: now };
  game.finished = true;
  game.endedAt = now;
  const list = alive.map((p) => `${p.name} ${money(amounts[p.id] ?? 0)}`).join(", ");
  logEvent(game, t("gameEvents.dealLog", { kind: kind === "icm" ? t("gameEvents.dealKindIcm") : t("gameEvents.dealKindChop"), list }));
  flash(game, t("gameEvents.dealFlash", { names: alive.map((p) => p.name).join(", ") }), "deal");
}

/** what a finishing place pays in this game: the deal if there was one, else the payout table */
export function paidFor(game: Game, playerId: string | undefined, place: number, table: number[]) {
  if (game.deal && playerId && playerId in game.deal.amounts) return game.deal.amounts[playerId];
  if (game.deal && place <= Object.keys(game.deal.amounts).length) return 0;
  return table[place - 1] ?? 0;
}

/** credit a knockout: the latest time `outId` went out, `byId` did it */
export function creditKo(game: Game, outId: string, byId: string | null) {
  const k = game.kos?.findLast((k) => k.out === outId);
  if (!k) return;
  k.by = byId;
  const out = game.players.find((p) => p.id === outId);
  const by = game.players.find((p) => p.id === byId);
  if (out && by) logEvent(game, t("gameEvents.knockoutLog", { by: by.name, out: out.name }));
}

export const koCount = (game: Game, playerId: string) => game.kos?.filter((k) => k.by === playerId).length ?? 0;

// ---------- cash ----------

/** who rake and fees are owed to when the host hasn't named a house */
export const HOUSE = () => t("gameEvents.defaultHouseName");

/** the cash game's rake setup (a tournament has none) */
export const cashRake = (game: Game) => game.cash?.rake ?? { mode: "none" as const, pct: 0, cap: 0, fee: 0 };

export function cashStats(game: Game) {
  const bank = round2(game.players.reduce((s, p) => s + p.cashIn, 0));
  const out = round2(game.players.reduce((s, p) => s + (p.cashOut ?? 0), 0));
  const seated = game.players.filter((p) => p.cashOut === null).length;
  const onTable = round2(game.players.filter((p) => p.cashOut === null).reduce((s, p) => s + p.cashIn, 0));
  const allOut = game.players.length > 0 && seated === 0;
  const r = cashRake(game);
  // chips in the rake box left the table, so they count as cashed out for the bank check
  const rakeBox = r.mode === "pot" ? round2(game.rakeBox ?? 0) : 0;
  // a seat fee is paid in cash, outside the chips: it never touches the bank
  const seatFees = r.mode === "seat" ? round2(r.fee * game.players.length) : 0;
  return { bank, out, seated, onTable, allOut, rakeBox, seatFees, diff: round2(out + rakeBox - bank) };
}

/**
 * who pays who at the end of a cash game: everyone who's cashed out, plus the
 * house for the rake box and seat fees. if the house is one of the players
 * (the host), it's folded into their numbers.
 */
export function cashSettle(game: Game) {
  const r = cashRake(game);
  const done = game.players.filter((p) => p.cashOut !== null);
  const house = game.house?.trim() || HOUSE();
  const fee = r.mode === "seat" ? r.fee : 0;
  const nets = done.map((p) => ({ name: p.name, net: round2((p.cashOut ?? 0) - p.cashIn - fee) }));
  const owed = round2((r.mode === "pot" ? (game.rakeBox ?? 0) : 0) + fee * done.length);
  if (owed > 0.001) {
    const host = nets.find((x) => nameKey(x.name) === nameKey(house));
    if (host) host.net = round2(host.net + owed);
    else nets.push({ name: house, net: owed });
  }
  return settle(nets);
}

/** fewest payments to square everyone up */
export function settle(people: { name: string; net: number }[]) {
  const nets = people.map((p) => ({ name: p.name, net: round2(p.net) })).filter((x) => Math.abs(x.net) > 0.001);
  const debtors = nets.filter((x) => x.net < 0).map((x) => ({ ...x, net: -x.net })).sort((a, b) => b.net - a.net);
  const creditors = nets.filter((x) => x.net > 0).sort((a, b) => b.net - a.net);
  const moves: { from: string; to: string; amount: number }[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = round2(Math.min(debtors[i].net, creditors[j].net));
    if (pay > 0) moves.push({ from: debtors[i].name, to: creditors[j].name, amount: pay });
    debtors[i].net = round2(debtors[i].net - pay);
    creditors[j].net = round2(creditors[j].net - pay);
    if (debtors[i].net <= 0.001) i++;
    if (creditors[j].net <= 0.001) j++;
  }
  return moves;
}

// ---------- seats ----------

export const seatsPer = (game: Game) => game.seatsPerTable ?? 9;
/** people who still need a chair: not busted, not cashed out */
const playing = (game: Game) => game.players.filter((p) => (game.type === "cash" ? p.cashOut === null : !p.out));
export const seatsDrawn = (game: Game) => game.players.some((p) => p.seat);

function shuffle<T>(xs: T[]) {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

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
  flash(game, t("gameEvents.seatsDrawnFlash"), "shuffle");
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
  const name = (id: string) => game.players.find((p) => p.id === id)?.name ?? "?";
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
    const details = a.moves.map((m) => `${name(m.id)} to T${m.to.table} S${m.to.seat}`).join(", ");
    logEvent(game, t("gameEvents.tableBrokeLog", { table: a.table, details }));
    flash(game, t("gameEvents.tableBreakingFlash", { table: a.table }), "seat");
  }
}

export const seatLabel = (s: Seat | null | undefined, tables: number) => (!s ? "" : tables > 1 ? `T${s.table} · ${s.seat}` : `${s.seat}`);

// ---------- run it back ----------

const clone = <T>(x: T): T => (x === undefined ? x : JSON.parse(JSON.stringify(x)));

/** a fresh game with the same setup: chips, structure, buy-ins and (optionally) the same people */
export function rerun(game: Game, keepPlayers = true): Game {
  const seen = new Set<string>();
  const names = keepPlayers
    ? game.players.map((p) => p.name).filter((n) => !seen.has(nameKey(n)) && seen.add(nameKey(n)))
    : [];
  const g = newGame({
    name: game.name,
    type: game.type,
    chipSetName: game.chipSetName,
    multiplier: game.multiplier,
    chips: clone(game.chips),
    notes: game.notes,
    players: names,
    levels: clone(game.levels),
    tourney: clone(game.tourney),
    cash: clone(game.cash),
  });
  g.from = game.id;
  g.seatsPerTable = game.seatsPerTable;
  g.house = game.house;
  // cash regulars named up front shouldn't be on the clock before the game starts
  for (const p of g.players) p.joinedAt = undefined;
  return g;
}

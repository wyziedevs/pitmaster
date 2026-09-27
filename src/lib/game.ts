import type { Cost, EventKind, Game, GameChip, GameType, Level, Match, Player, Seat, TourneySettings } from "./types";
import { newClock } from "./clock";
import { defaultPayouts, payoutAmounts, roundShares } from "./blinds";
import { money, nameKey, ordinal, round2, uid } from "./util";
import { t, tp } from "./i18n";
import { flash, logEvent } from "./events";
import { reseat, seatNewcomer, shootout } from "./seats";

/** when a game was played: when its clock started, or when it was made */
export const playedAt = (game: Game) => game.clock.startedAt ?? game.createdAt;
/** its day, for a spreadsheet: 2026-09-27 */
export const gameDate = (game: Game) => new Date(playedAt(game)).toISOString().slice(0, 10);

/** it's over (at `at`, or now) */
export function finish(game: Game, at = Date.now()) {
  game.finished = true;
  game.endedAt = at;
}

/** back on: the end was taken back */
export function reopen(game: Game) {
  game.finished = false;
  game.endedAt = undefined;
}

/** the rules only its kind reads: a tournament's structure, a cash game's stakes, the other kinds' own */
type Rules = Partial<Pick<Game, "tourney" | "cash" | "dice" | "lives" | "pot">>;

/** a new game. the chips and the clock's levels are poker's; the other kinds leave them out */
export function newGame(p: { name: string; type: GameType; notes: string; players: string[]; chipSetName?: string; multiplier?: number; chips?: GameChip[]; levels?: Level[] } & Rules): Game {
  const now = Date.now();
  const game: Game = {
    id: uid(),
    name: p.name,
    type: p.type,
    createdAt: now,
    updatedAt: now,
    chipSetName: p.chipSetName ?? "",
    multiplier: p.multiplier ?? 1,
    chips: p.chips ?? [],
    notes: p.notes,
    players: [],
    clock: newClock(),
    levels: p.levels ?? [],
    tourney: p.tourney,
    cash: p.cash,
    dice: p.dice,
    lives: p.lives,
    pot: p.pot,
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

function newPlayer(name: string): Player {
  return { id: uid(), name, cashIn: 0, cashOut: null, rebuys: 0, addOns: 0, out: false, place: null, bustedAt: null };
}

export function addPlayer(game: Game, name: string, quiet = false) {
  const p = newPlayer(name.trim() || `Seat ${game.players.length + 1}`);
  // a cash game buys them in and starts their clock
  if (game.cash) {
    p.cashIn = game.cash.defaultBuyIn;
    p.joinedAt = Date.now();
  }
  // seat them before they join the list: once pushed into a live game, writes
  // have to go through game.players, not this object
  seatNewcomer(game, p);
  game.players.push(p);
  // a late entry in a mystery bounty game adds its bounty to the envelopes
  fitEnvelopes(game);
  if (!quiet) {
    logEvent(
      game,
      game.cash ? t("gameEvents.satDownWithAmount", { name: p.name, amount: money(p.cashIn) }) : t("gameEvents.registered", { name: p.name }),
    );
    flash(game, game.cash ? t("gameEvents.satDownFlash", { name: p.name }) : t("gameEvents.isInFlash", { name: p.name }), "chips");
  }
  return p;
}

// ---------- tournament ----------

/** what `entries` buy-ins, `rebuys` rebuys and `addOns` add-ons come to (one player's night, or everyone's) */
export const paidIn = (t: TourneySettings, entries: number, rebuys: number, addOns: number) => entries * t.buyIn + rebuys * t.rebuy.cost + addOns * t.addOn.cost;

/**
 * where a tournament's money goes with this many entries: the bounties, the
 * house's cut, the pool, and what each place pays (a satellite's seats, a
 * bracket's rounds sharing theirs). the new-game form's estimate and the game
 * itself both work it out here.
 */
export function prizeTable(t: TourneySettings, entrants: number, rebuys = 0, addOns = 0) {
  const gross = paidIn(t, entrants, rebuys, addOns);
  // each entry (buy-in or rebuy) puts one bounty on that player's head
  const bounties = round2((entrants + rebuys) * t.bounty);
  // the house: a flat fee out of every entry, then its % of what's left
  const fees = round2((entrants + rebuys) * t.fee);
  const rake = round2(fees + ((gross - bounties - fees) * (t.rakePct || 0)) / 100);
  const pool = round2(Math.max(0, gross - bounties - rake));
  // a satellite pays in seats: as many as the pool covers, and what's left over to the next place
  const seatValue = t.satellite?.seatValue ?? 0;
  const seats = seatValue > 0 ? Math.floor(round2(pool / seatValue)) : 0;
  const rest = round2(pool - seats * seatValue);
  const table = seatValue > 0 ? [...Array<number>(seats).fill(seatValue), ...(rest > 0.004 ? [rest] : [])] : payoutAmounts(pool, t.payouts.length ? t.payouts : defaultPayouts(entrants), t.payoutRound || 1);
  // a bracket pays by the round reached: everyone out in the same round shares those places
  const payouts = t.format === "bracket" ? roundShares(table, entrants, t.payoutRound || 1) : table;
  return { gross, bounties, fees, rake, pool, seats, rest, payouts };
}

export function tourneyStats(game: Game) {
  const t = game.tourney!;
  const entrants = game.players.length;
  const rebuys = game.players.reduce((s, p) => s + p.rebuys, 0);
  const addOns = game.players.reduce((s, p) => s + p.addOns, 0);
  const { gross, bounties, fees, rake, pool, seats, payouts } = prizeTable(t, entrants, rebuys, addOns);
  const bounty = t.bounty;
  const chipsInPlay = entrants * t.stack + rebuys * t.rebuy.chips + addOns * t.addOn.chips;
  const left = game.players.filter((p) => !p.out).length;
  const avgStack = left ? chipsInPlay / left : 0;
  const pcts = (t.satellite?.seatValue ?? 0) > 0 ? payouts.map((p) => (pool ? Math.round((p / pool) * 100) : 0)) : t.payouts.length ? t.payouts : defaultPayouts(entrants);
  // one out from the money, and in it
  const paid = payouts.filter((p) => p > 0).length;
  const bubble = !game.finished && left === paid + 1 && entrants > paid;
  const itm = !game.finished && left <= paid && left > 1;
  return { entrants, rebuys, addOns, gross, bounty, bounties, fees, rake, pool, chipsInPlay, left, avgStack, pcts, payouts, paid, bubble, itm, seats };
}

/** out goes a player. `place` is where they finish, if not last of those left (a bracket's round) */
export function bust(game: Game, playerId: string, place?: number) {
  const p = game.players.find((x) => x.id === playerId);
  if (!p || p.out) return;
  const left = place ?? game.players.filter((x) => !x.out).length;
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
  const burst = alive.length > 1 && alive.length === paid && game.players.length > paid;
  if (burst) {
    logEvent(game, t("gameEvents.bubbleLog", { name: p.name }));
    flash(game, t("gameEvents.bubbleFlash", { name: p.name }), "money");
  }
  // down to the mystery bounties: the envelopes come out
  const tr = game.tourney!;
  if (tr.bounty && tr.bountyKind === "mystery" && !game.mystery && alive.length <= mysteryStartsAt(game)) {
    startMystery(game, alive.length, p.bustedAt);
    if (alive.length > 1)
      flash(game, burst ? t("gameEvents.mysteryBubbleFlash", { name: p.name }) : tp("gameEvents.mysteryStartFlash", alive.length), "bounty");
  }
  // a shootout table down to its last player has its winner
  const shoot = shootout(game);
  const table = p.seat?.table;
  const last = shoot && !shoot.final && shoot.tables.length > 1 ? shoot.tables.find((x) => x.table === table)?.left : undefined;
  if (last?.length === 1) {
    logEvent(game, t("gameEvents.tableWonFlash", { name: last[0].name, table: String(table) }));
    flash(game, t(shoot!.ready ? "gameEvents.tablesDoneFlash" : "gameEvents.tableWonFlash", { name: last[0].name, table: String(table) }), "win");
  }
  // a satellite is over once everyone left has a seat
  const seats = tourneyStats(game).seats;
  if (tr.satellite && alive.length > 1 && alive.length <= seats) {
    alive.forEach((x, i) => (x.place = i + 1));
    finish(game);
    const names = alive.map((x) => x.name).join(", ");
    logEvent(game, t("gameEvents.seatsWonFlash", { names }));
    flash(game, t("gameEvents.seatsWonFlash", { names }), "win");
    openOwnEnvelopes(game);
  }
  if (alive.length === 1) {
    alive[0].place = 1;
    finish(game);
    logEvent(game, t("gameEvents.wins", { name: alive[0].name }));
    flash(game, t("gameEvents.wins", { name: alive[0].name }), "win");
    openOwnEnvelopes(game);
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
  // anyone who busted after them now finished one spot lower (a bracket's places go by round instead)
  if (game.tourney?.format !== "bracket") for (const x of game.players) if (x.out && x.place !== null && x.place < place) x.place++;
  for (const x of game.players) if (!x.out) x.place = null;
  reopen(game);
  // what the survivors opened goes back in the pile until it's over again
  if (game.mystery) game.mystery.own = {};
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
  finish(game, now);
  openOwnEnvelopes(game);
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
  const m = game.mystery;
  if (m && k.at > m.at) {
    // a knockout after the envelopes came out opens one; uncrediting it puts it back
    if (!byId) delete k.prize;
    else if (k.prize === undefined) {
      const left = envelopesLeft(game);
      if (left.length && out && by) {
        k.prize = left[fairIndex(left.length)];
        logEvent(game, t("gameEvents.mysteryOpenLog", { by: by.name, out: out.name, prize: money(k.prize) }));
        flash(game, t("gameEvents.mysteryOpenFlash", { by: by.name, prize: money(k.prize) }), "bounty");
      }
    }
    return;
  }
  // a bounty collected: the room hears who took what
  const tr = game.tourney;
  if (!out || !by || !tr?.bounty || tr.bountyKind === "mystery") return;
  const book = bountyBook(game);
  const took = book.paid[game.kos!.lastIndexOf(k)] ?? 0;
  if (took <= 0) return;
  if (tr.bountyKind === "progressive") {
    const head = money(book.head[by.id] ?? 0);
    logEvent(game, t("gameEvents.pkoLog", { by: by.name, out: out.name, amount: money(took), head }));
    flash(game, t("gameEvents.pkoFlash", { by: by.name, amount: money(took), head }), "bounty");
  } else flash(game, t("gameEvents.bountyFlash", { by: by.name, out: out.name, amount: money(took) }), "bounty");
}

export const koCount = (game: Game, playerId: string) => game.kos?.filter((k) => k.by === playerId).length ?? 0;

// ---------- bounties ----------

/** a fair random whole number below n (an envelope draw has to be one nobody can call) */
function fairIndex(n: number) {
  const limit = Math.floor(0x100000000 / n) * n;
  const x = new Uint32Array(1);
  do crypto.getRandomValues(x);
  while (x[0] >= limit);
  return x[0] % n;
}

/** who took the pot home: the winner, or everyone in on a deal */
const survivors = (game: Game) =>
  !game.finished ? [] : game.deal ? game.players.filter((p) => p.id in game.deal!.amounts) : game.players.filter((p) => p.place === 1);

/**
 * where the bounty money has gone, worked out from the knockouts every time,
 * so crediting, uncrediting or undoing a bust fixes everything after it.
 *  won:       what each player has taken in bounties
 *  head:      what's on each player's head right now (flat and progressive)
 *  paid:      what each knockout paid on the spot, in the order of game.kos
 *  unclaimed: money from knockouts nobody's been credited with, or (mystery)
 *             envelopes nobody opened once it's over
 */
export function bountyBook(game: Game) {
  const tr = game.tourney;
  const won: Record<string, number> = {};
  const head: Record<string, number> = {};
  const paid: number[] = [];
  let unclaimed = 0;
  if (!tr?.bounty) return { won, head, paid, unclaimed };
  const b = tr.bounty;
  const kos = game.kos ?? [];
  for (const p of game.players) {
    won[p.id] = 0;
    // a rebuy after going out comes with a fresh bounty (below); one bought
    // while still in adds to the bounty they've got
    const busts = kos.filter((k) => k.out === p.id).length;
    const topUps = Math.max(0, p.rebuys - (busts - (p.out ? 1 : 0)));
    head[p.id] = round2(b * (1 + topUps));
  }
  if (tr.bountyKind === "mystery") {
    for (const k of kos) {
      const prize = k.by && k.by in won ? (k.prize ?? 0) : 0;
      if (prize) won[k.by!] = round2(won[k.by!] + prize);
      paid.push(prize);
    }
    for (const [id, v] of Object.entries(game.mystery?.own ?? {})) if (id in won) won[id] = round2(won[id] + v);
    if (game.finished) unclaimed = round2(envelopesLeft(game).reduce((s, v) => s + v, 0));
    return { won, head: {}, paid, unclaimed };
  }
  for (const k of kos) {
    const h = head[k.out] ?? 0;
    let cash = 0;
    if (k.by && k.by in won) {
      cash = tr.bountyKind === "progressive" ? round2(h / 2) : h;
      won[k.by] = round2(won[k.by] + cash);
      head[k.by] = round2(head[k.by] + h - cash);
    } else unclaimed = round2(unclaimed + h);
    paid.push(cash);
    // back in on a rebuy, with a fresh bounty
    head[k.out] = b;
  }
  // whoever's still standing at the end keeps the bounty on their own head
  for (const p of survivors(game)) won[p.id] = round2(won[p.id] + head[p.id]);
  return { won, head, paid, unclaimed };
}

/** how many players are left when a mystery game's envelopes come out */
export const mysteryStartsAt = (game: Game) => game.tourney?.mysteryFrom || tourneyStats(game).paid;

/**
 * the bounty money split into n envelopes: one big one, a few good ones and
 * plenty of small ones, each a round amount (the payout rounding, where the
 * money allows). worked in cents so nothing is lost to rounding.
 */
function makeEnvelopes(pool: number, n: number, unit = 1) {
  const total = Math.round(pool * 100);
  if (n < 1 || total <= 0) return [];
  const u = Math.round(([unit, 1, 0.01].find((x) => x <= unit && pool / n >= x) ?? 0.01) * 100);
  const w = Array.from({ length: n }, (_, i) => 1 / (i + 1));
  const sum = w.reduce((s, x) => s + x, 0);
  let cents = w.map((x) => Math.max(u, Math.floor((total * x) / sum / u) * u));
  cents[0] += total - cents.reduce((s, x) => s + x, 0);
  // too little money for that shape: even envelopes instead
  if (cents[0] < u) {
    cents = Array.from({ length: n }, () => Math.floor(total / n / u) * u);
    cents[0] += total - cents.reduce((s, x) => s + x, 0);
  }
  return cents.map((c) => c / 100);
}

/** envelopes nobody's opened yet, biggest first */
export function envelopesLeft(game: Game) {
  const m = game.mystery;
  if (!m) return [];
  const left = [...m.prizes];
  const opened = [...(game.kos ?? []).flatMap((k) => (k.by && k.prize !== undefined ? [k.prize] : [])), ...Object.values(m.own)];
  for (const v of opened) {
    const i = left.findIndex((x) => Math.abs(x - v) < 0.005);
    if (i >= 0) left.splice(i, 1);
  }
  return left.sort((a, b) => b - a);
}

function startMystery(game: Game, left: number, at: number | null) {
  const s = tourneyStats(game);
  game.mystery = { at: at ?? Date.now(), prizes: makeEnvelopes(s.bounties, Math.max(1, left), game.tourney!.payoutRound || 1), own: {} };
  logEvent(game, tp("gameEvents.mysteryStartLog", left, { pool: money(s.bounties) }));
}

/** it's over: everyone still standing opens one of what's left */
function openOwnEnvelopes(game: Game) {
  const tr = game.tourney;
  if (!tr?.bounty || tr.bountyKind !== "mystery") return;
  // a deal before the envelopes came out: they come out now, one each
  if (!game.mystery) startMystery(game, survivors(game).length, game.endedAt ?? null);
  const m = game.mystery!;
  for (const p of survivors(game)) {
    if (p.id in m.own) continue;
    const left = envelopesLeft(game);
    if (!left.length) break;
    m.own[p.id] = left[fairIndex(left.length)];
    logEvent(game, t("gameEvents.mysteryOwnLog", { name: p.name, prize: money(m.own[p.id]) }));
  }
}

/**
 * keeps the envelopes equal to the bounty money: a late entry or a rebuy after
 * they came out adds one, and taking one back takes the smallest unopened ones out
 */
export function fitEnvelopes(game: Game) {
  const m = game.mystery;
  if (!m || !game.tourney) return;
  let diff = round2(tourneyStats(game).bounties - m.prizes.reduce((s, v) => s + v, 0));
  if (diff > 0.004) return void m.prizes.push(diff);
  const small = envelopesLeft(game).reverse();
  while (diff < -0.004 && small.length) {
    const v = small.shift()!;
    m.prizes.splice(m.prizes.findIndex((x) => Math.abs(x - v) < 0.005), 1);
    diff = round2(diff + v);
  }
  if (diff > 0.004) m.prizes.push(diff);
}

/** the host's own amounts for the unopened envelopes; they have to add up to the same money */
export function setEnvelopes(game: Game, amounts: number[]) {
  const m = game.mystery;
  if (!m || !amounts.length || amounts.some((a) => !(a > 0))) return false;
  const left = envelopesLeft(game);
  const sum = (xs: number[]) => round2(xs.reduce((s, v) => s + v, 0));
  if (Math.abs(sum(amounts) - sum(left)) > 0.004) return false;
  const opened = [...m.prizes];
  for (const v of left) opened.splice(opened.findIndex((x) => Math.abs(x - v) < 0.005), 1);
  m.prizes = [...opened, ...amounts.map(round2)];
  logEvent(game, t("gameEvents.envelopesEditedLog"));
  return true;
}

// ---------- shootouts and satellites ----------

/** seats won in finished satellites that haven't been used in another game yet */
export function unusedSeats(games: Game[]) {
  const used = new Set(games.flatMap((g) => g.players.filter((p) => p.ticket).map((p) => `${p.ticket}>${nameKey(p.name)}`)));
  return games
    .filter((g) => g.finished && g.tourney?.satellite)
    .map((g) => {
      const seats = tourneyStats(g).seats;
      return { game: g, winners: g.players.filter((p) => p.place && p.place <= seats && !used.has(`${g.id}>${nameKey(p.name)}`)) };
    })
    .filter((x) => x.winners.length);
}

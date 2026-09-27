import type { CashSettings, Cost, EventKind, Game, GameChip, GameType, Level, Player, Seat, SideEvent, TourneySettings } from "./types";
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
  // a late entry in a mystery bounty game adds its bounty to the envelopes
  fitEnvelopes(game);
  if (!quiet) {
    logEvent(
      game,
      game.type === "cash" ? t("gameEvents.satDownWithAmount", { name: p.name, amount: money(p.cashIn) }) : t("gameEvents.registered", { name: p.name }),
    );
    flash(game, game.type === "cash" ? t("gameEvents.satDownFlash", { name: p.name }) : t("gameEvents.isInFlash", { name: p.name }), "chips");
  }
  return p;
}

// ---------- the waitlist (cash) ----------

export function joinWaitlist(game: Game, name: string) {
  const w = { id: uid(), name: name.trim(), at: Date.now() };
  if (!w.name) return;
  game.waitlist = [...(game.waitlist ?? []), w];
  logEvent(game, t("gameEvents.waitlistJoinedLog", { name: w.name }));
}

export function leaveWaitlist(game: Game, id: string) {
  const w = game.waitlist?.find((x) => x.id === id);
  if (!w) return;
  game.waitlist = game.waitlist!.filter((x) => x.id !== id);
  logEvent(game, t("gameEvents.waitlistLeftLog", { name: w.name }));
}

/** someone on the list who played earlier tonight comes back to their own row */
export const waitingReturn = (game: Game, id: string) => {
  const w = game.waitlist?.find((x) => x.id === id);
  return w ? game.players.find((p) => p.cashOut !== null && nameKey(p.name) === nameKey(w.name)) : undefined;
};

/** the next on the list (or anyone on it) sits down, and gets a seat if seats are drawn */
export function seatWaiting(game: Game, id = game.waitlist?.[0]?.id) {
  const w = game.waitlist?.find((x) => x.id === id);
  if (!w) return null;
  game.waitlist = game.waitlist!.filter((x) => x.id !== id);
  return addPlayer(game, w.name);
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
  // a satellite pays in seats: as many as the pool covers, and what's left over to the next place
  const seatValue = t.satellite?.seatValue ?? 0;
  const seats = seatValue > 0 ? Math.floor(round2(pool / seatValue)) : 0;
  const rest = round2(pool - seats * seatValue);
  const payouts = seatValue > 0 ? [...Array<number>(seats).fill(seatValue), ...(rest > 0.004 ? [rest] : [])] : payoutAmounts(pool, t.payouts.length ? t.payouts : defaultPayouts(entrants), t.payoutRound || 1);
  const pcts = seatValue > 0 ? payouts.map((p) => (pool ? Math.round((p / pool) * 100) : 0)) : t.payouts.length ? t.payouts : defaultPayouts(entrants);
  // one out from the money, and in it
  const paid = payouts.filter((p) => p > 0).length;
  const bubble = !game.finished && left === paid + 1 && entrants > paid;
  const itm = !game.finished && left <= paid && left > 1;
  return { entrants, rebuys, addOns, gross, bounty, bounties, fees, rake, pool, chipsInPlay, left, avgStack, pcts, payouts, paid, bubble, itm, seats };
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
    game.finished = true;
    game.endedAt = Date.now();
    const names = alive.map((x) => x.name).join(", ");
    logEvent(game, t("gameEvents.seatsWonFlash", { names }));
    flash(game, t("gameEvents.seatsWonFlash", { names }), "win");
    openOwnEnvelopes(game);
  }
  if (alive.length === 1) {
    alive[0].place = 1;
    game.finished = true;
    game.endedAt = Date.now();
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
  // anyone who busted after them now finished one spot lower
  for (const x of game.players) if (x.out && x.place !== null && x.place < place) x.place++;
  for (const x of game.players) if (!x.out) x.place = null;
  game.finished = false;
  game.endedAt = undefined;
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
  game.finished = true;
  game.endedAt = now;
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
export function makeEnvelopes(pool: number, n: number, unit = 1) {
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
  // a high hand prize is the house paying a player, outside the chips
  const prizes = highHandPrizes(game);
  const nets = done.map((p) => ({ name: p.name, net: round2((p.cashOut ?? 0) - p.cashIn - fee + (prizes[p.id] ?? 0)) }));
  const paid = round2(done.reduce((s, p) => s + (prizes[p.id] ?? 0), 0));
  const owed = round2((r.mode === "pot" ? (game.rakeBox ?? 0) : 0) + fee * done.length - paid);
  return settle(withCosts(game, addTo(nets, house, owed), house));
}

// ---------- cash side games ----------

function addSide(game: Game, e: SideEvent) {
  // assign first, then push through game.sides (see bust)
  if (!game.sides) game.sides = [];
  game.sides.push(e);
}

/**
 * where the side games stand after `elapsed` of play, worked out from what's
 * happened: bomb pots called and whether one's due, and the high hand now
 * and its window.
 */
export function sideStats(game: Game, played: number) {
  const c = game.cash!;
  // the screen's clock can trail the session's own start by a moment
  const elapsed = Math.max(0, played);
  const list = game.sides ?? [];
  const bombs = list.filter((e) => e.kind === "bomb").length;
  // a timed bomb pot comes due each time another stretch of play goes by, and
  // stays due until the host calls it
  const bombEvery = c.bomb.on ? c.bomb.everyMinutes * 60000 : 0;
  const bombDue = !!bombEvery && Math.floor(elapsed / bombEvery) > bombs;
  const bombIn = bombEvery ? Math.max(0, (bombs + 1) * bombEvery - elapsed) : null;
  const hhEvery = c.highHand.on ? c.highHand.everyMinutes * 60000 : 0;
  const window = hhEvery ? Math.floor(elapsed / hhEvery) : 0;
  const windowLeft = hhEvery ? (window + 1) * hhEvery - elapsed : null;
  const lastPaid = list.findLastIndex((e) => e.kind === "highHandPaid");
  const current = list.slice(lastPaid + 1).findLast((e) => e.kind === "highHand") ?? null;
  // the window it was set in is over: time to pay it
  const hhDue = !!current && !!hhEvery && (current.window ?? 0) < window;
  const sevenTwos = list.filter((e) => e.kind === "sevenTwo").length;
  return { bombs, bombDue, bombIn, window, windowLeft, current, hhDue, sevenTwos };
}

const playerName = (game: Game, id: string | undefined) => game.players.find((p) => p.id === id)?.name ?? "?";

export function callBombPot(game: Game) {
  const b = game.cash!.bomb;
  addSide(game, { kind: "bomb", at: Date.now() });
  const text = t(b.doubleBoard ? "gameEvents.bombDoubleFlash" : "gameEvents.bombFlash", { ante: money(b.ante) });
  logEvent(game, text);
  flash(game, text, "bomb");
}

export function sevenTwoWin(game: Game, playerId: string) {
  const amount = game.cash!.sevenTwo.amount;
  addSide(game, { kind: "sevenTwo", at: Date.now(), playerId, amount });
  const text = t("gameEvents.sevenTwoFlash", { name: playerName(game, playerId), amount: money(amount) });
  logEvent(game, text);
  flash(game, text, "sevenTwo");
}

export function setHighHand(game: Game, playerId: string, hand: string, window: number) {
  addSide(game, { kind: "highHand", at: Date.now(), playerId, hand: hand.trim(), window });
  const text = t("gameEvents.highHandFlash", { name: playerName(game, playerId), hand: hand.trim() });
  logEvent(game, text);
  flash(game, text, "highHand");
}

/** the house pays whoever holds the high hand; the next window starts with none */
export function payHighHand(game: Game, elapsed: number) {
  const cur = sideStats(game, elapsed).current;
  if (!cur?.playerId) return;
  const amount = game.cash!.highHand.prize;
  addSide(game, { kind: "highHandPaid", at: Date.now(), playerId: cur.playerId, amount, hand: cur.hand });
  const text = t("gameEvents.highHandPaidFlash", { name: playerName(game, cur.playerId), amount: money(amount) });
  logEvent(game, text);
  flash(game, text, "money");
}

/** high hand prizes paid so far, by player */
export function highHandPrizes(game: Game) {
  const won: Record<string, number> = {};
  for (const e of game.sides ?? []) if (e.kind === "highHandPaid" && e.playerId) won[e.playerId] = round2((won[e.playerId] ?? 0) + (e.amount ?? 0));
  return won;
}

// ---------- shared costs and who's paid ----------

/** adds to someone's side of settle-up, by name: the house folds into the host's own numbers when they're one of the players */
function addTo(nets: { name: string; net: number }[], name: string, amount: number) {
  if (Math.abs(amount) <= 0.001) return nets;
  const row = nets.find((x) => nameKey(x.name) === nameKey(name));
  if (row) row.net = round2(row.net + amount);
  else nets.push({ name, net: round2(amount) });
  return nets;
}

/**
 * each person's side of the shared costs, by player id ("" is the house): what
 * they fronted less their share. shares are split in cents, and the odd cents
 * fall to the first people in the split.
 */
export function costNets(game: Game) {
  const nets: Record<string, number> = {};
  const add = (id: string, v: number) => (nets[id] = round2((nets[id] ?? 0) + v));
  const ids = game.players.map((p) => p.id);
  for (const c of game.costs ?? []) {
    const who = costSplit(game, c);
    if (!who.length) continue;
    const cents = Math.round(c.amount * 100);
    const each = Math.floor(cents / who.length);
    who.forEach((id, i) => add(id, -(each + (i < cents - each * who.length ? 1 : 0)) / 100));
    add(c.paidBy && ids.includes(c.paidBy) ? c.paidBy : "", c.amount);
  }
  return nets;
}

/** who shares a cost: the people it names that are still in the game, or everyone */
export function costSplit(game: Game, c: Cost) {
  const named = c.split.filter((id) => game.players.some((p) => p.id === id));
  return named.length ? named : game.players.map((p) => p.id);
}

function withCosts(game: Game, nets: { name: string; net: number }[], house: string) {
  for (const [id, v] of Object.entries(costNets(game))) addTo(nets, id ? playerName(game, id) : house, v);
  return nets;
}

export function addCost(game: Game, c: Omit<Cost, "id">) {
  // assign first, then push through game.costs (see bust)
  if (!game.costs) game.costs = [];
  game.costs.push({ ...c, id: uid(), amount: round2(c.amount) });
  logEvent(game, t("gameEvents.costLog", { label: c.label, amount: money(c.amount), name: c.paidBy ? playerName(game, c.paidBy) : game.house?.trim() || HOUSE() }));
}

export function removeCost(game: Game, id: string) {
  const c = game.costs?.find((x) => x.id === id);
  if (!c) return;
  game.costs = game.costs!.filter((x) => x.id !== id);
  logEvent(game, t("gameEvents.costRemovedLog", { label: c.label }));
}

/**
 * who pays who at the end of a tournament. the buy-ins went in at the door,
 * so whoever holds the money (the house) pays out the prizes and bounties.
 * shared costs count from the start.
 */
export function tourneySettle(game: Game) {
  const house = game.house?.trim() || HOUSE();
  const nets: { name: string; net: number }[] = [];
  if (game.finished && game.tourney) {
    const s = tourneyStats(game);
    const book = bountyBook(game);
    // a satellite seat is paid in the next game, not in cash
    const cash = (place: number | null, id: string) => (!place || place <= s.seats ? 0 : paidFor(game, id, place, s.payouts));
    for (const p of game.players) addTo(nets, p.name, cash(p.place, p.id) + (book.won[p.id] ?? 0));
    addTo(nets, house, -nets.reduce((a, x) => a + x.net, 0));
  }
  return settle(withCosts(game, nets, house));
}

export const settleUp = (game: Game) => (game.type === "cash" ? cashSettle(game) : tourneySettle(game));

type Owe = { from: string; to: string; amount: number };
const samePair = (x: Owe, a: string, b: string) =>
  (nameKey(x.from) === nameKey(a) && nameKey(x.to) === nameKey(b)) || (nameKey(x.from) === nameKey(b) && nameKey(x.to) === nameKey(a));

/** nets a list of debts down to one per pair of people, whichever way it runs */
export function netPairs(list: Owe[]): Owe[] {
  const pairs = new Map<string, Owe>();
  for (const x of list) {
    const k = [nameKey(x.from), nameKey(x.to)].sort().join(">");
    const e = pairs.get(k);
    if (!e) pairs.set(k, { ...x });
    else e.amount = round2(e.amount + (nameKey(e.from) === nameKey(x.from) ? x.amount : -x.amount));
  }
  return [...pairs.values()]
    .filter((e) => Math.abs(e.amount) > 0.004)
    .map((e) => (e.amount > 0 ? e : { from: e.to, to: e.from, amount: -e.amount }));
}

/** settle-up less what's been marked paid: a payment counts as a debt the other way */
export const stillOwed = (game: Game) => netPairs([...settleUp(game), ...(game.paid ?? []).map((p) => ({ from: p.to, to: p.from, amount: p.amount }))]);

/** whether any payment between these two was ticked off */
export const anyPaid = (game: Game, a: string, b: string) => !!game.paid?.some((p) => samePair(p, a, b));

/** ticks off everything still owed between two people in this game */
export function markPaid(game: Game, a: string, b: string) {
  const o = stillOwed(game).find((x) => samePair(x, a, b));
  if (!o) return;
  if (!game.paid) game.paid = [];
  game.paid.push({ ...o, at: Date.now() });
  logEvent(game, t("gameEvents.paidLog", { from: o.from, to: o.to, amount: money(o.amount) }));
}

/** takes back every payment ticked off between two people */
export function unmarkPaid(game: Game, a: string, b: string) {
  game.paid = (game.paid ?? []).filter((p) => !samePair(p, a, b));
  logEvent(game, t("gameEvents.unpaidLog", { a, b }));
}

/** a game's settle-up counts toward what people owe once it's over: a winner, or everyone cashed out */
export const settled = (game: Game) => game.finished || (game.type === "cash" && game.players.length > 0 && game.players.every((p) => p.cashOut !== null));

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

// ---------- shootouts and satellites ----------

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
  g.leagueId = game.leagueId;
  // cash regulars named up front shouldn't be on the clock before the game starts
  for (const p of g.players) p.joinedAt = undefined;
  return g;
}

// what the dealer screen does to a tournament: players in and out, rebuys and
// add-ons, busts (and taking them back), knockouts, a deal, the mystery
// envelopes and a bracket's matches. each tells the room what happened; the
// money is worked out from what's saved (engine.ts).
import type { Game, Match } from "$lib/types";
import { addPlayer, finish, reopen } from "$lib/game";
import { flash, logEvent, playerName } from "$lib/events";
import { reseat, shootout } from "$lib/seats";
import { fairIndex, money, ordinal, round2, shuffle } from "$lib/util";
import { t, tp } from "$lib/i18n";
import { bountyBook, envelopesLeft, survivors, tourneyBook } from "./engine";
import { bracketSize, lostMatch, nextMatch, roundName, roundPlace, seedOrder } from "./bracket";

// ---------- players ----------

/** someone registers (a late entry in a mystery bounty game adds its bounty to the envelopes; a drawn bracket is drawn again to fit them) */
export function register(game: Game, name: string) {
  addPlayer(game, name);
  fitEnvelopes(game);
  if (game.tourney?.format === "bracket" && game.matches) drawBracket(game);
}

/** a rebuy, or (-1) one taken back. one bought after going out puts them back in, and the knockout stands */
export function rebuy(game: Game, playerId: string, delta: number) {
  const p = game.players.find((x) => x.id === playerId);
  const tr = game.tourney;
  if (!p || !tr) return;
  p.rebuys = Math.max(0, p.rebuys + delta);
  fitEnvelopes(game);
  if (delta > 0) {
    if (p.out) unbust(game, playerId, true);
    logEvent(game, t("gamePlay.tournament.reboughtLog", { name: p.name, cost: money(tr.rebuy.cost) }));
    flash(game, t("gamePlay.tournament.rebuysFlash", { name: p.name }), "chips");
  }
}

/** an add-on, or (-1) one taken back */
export function addOn(game: Game, playerId: string, delta: number) {
  const p = game.players.find((x) => x.id === playerId);
  if (!p) return;
  p.addOns = Math.max(0, p.addOns + delta);
  if (delta > 0) logEvent(game, t("gamePlay.tournament.addOnLog", { name: p.name }));
}

/**
 * someone comes out of the game altogether. a bracket's drawn again without
 * them (or put away if there's no one left to play). the knockouts they were
 * credited with go back to nobody, so that bounty money is unclaimed again and
 * an envelope they opened (or opened for themselves at the end) goes back in
 * the pile, where it's fitted to the money that's left.
 */
export function removePlayer(game: Game, playerId: string) {
  const p = game.players.find((x) => x.id === playerId);
  if (!p) return;
  game.players = game.players.filter((x) => x.id !== playerId);
  if (game.tourney?.format === "bracket" && game.matches) {
    if (game.players.filter((x) => !x.out).length >= 2) drawBracket(game);
    else delete game.matches;
  }
  for (const k of game.kos ?? []) {
    if (k.by !== playerId) continue;
    k.by = null;
    delete k.prize;
  }
  if (game.mystery) delete game.mystery.own[playerId];
  fitEnvelopes(game);
  logEvent(game, t("gamePlay.shared.removedLog", { name: p.name }));
}

// ---------- busts ----------

/** out goes a player. `place` is where they finish, if not last of those left (a bracket's round) */
export function bust(game: Game, playerId: string, place?: number) {
  const p = game.players.find((x) => x.id === playerId);
  const tr = game.tourney;
  if (!p || p.out || !tr) return;
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
  const book = tourneyBook(game, tr);
  // the bubble bursts: everyone still sitting gets paid
  const burst = alive.length > 1 && alive.length === book.paid && game.players.length > book.paid;
  if (burst) {
    logEvent(game, t("gameEvents.bubbleLog", { name: p.name }));
    flash(game, t("gameEvents.bubbleFlash", { name: p.name }), "money");
  }
  // down to the mystery bounties: the envelopes come out
  if (tr.bounty && tr.bountyKind === "mystery" && !game.mystery && alive.length <= book.mysteryAt) {
    startMystery(game, alive.length, p.bustedAt);
    if (alive.length > 1)
      flash(game, burst ? t("gameEvents.mysteryBubbleFlash", { name: p.name }) : tp("gameEvents.mysteryStartFlash", alive.length), "bounty");
  }
  // a shootout table down to its last player has its winner
  const shoot = shootout(game);
  const table = p.seat?.table;
  const last = shoot && !shoot.final && shoot.tables.length > 1 ? shoot.tables.find((x) => x.table === table)?.left : undefined;
  if (shoot && last?.length === 1) {
    logEvent(game, t("gameEvents.tableWonFlash", { name: last[0].name, table: String(table) }));
    flash(game, t(shoot.ready ? "gameEvents.tablesDoneFlash" : "gameEvents.tableWonFlash", { name: last[0].name, table: String(table) }), "win");
  }
  // a satellite is over once everyone left has a seat
  if (tr.satellite && alive.length > 1 && alive.length <= book.seats) {
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

// ---------- mystery envelopes ----------

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

function startMystery(game: Game, left: number, at: number | null) {
  const tr = game.tourney;
  if (!tr) return;
  const { bounties } = tourneyBook(game, tr);
  game.mystery = { at: at ?? Date.now(), prizes: makeEnvelopes(bounties, Math.max(1, left), tr.payoutRound || 1), own: {} };
  logEvent(game, tp("gameEvents.mysteryStartLog", left, { pool: money(bounties) }));
}

/** it's over: everyone still standing opens one of what's left */
function openOwnEnvelopes(game: Game) {
  const tr = game.tourney;
  if (!tr?.bounty || tr.bountyKind !== "mystery") return;
  // a deal before the envelopes came out: they come out now, one each
  if (!game.mystery) startMystery(game, survivors(game).length, game.endedAt ?? null);
  const m = game.mystery;
  if (!m) return;
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
function fitEnvelopes(game: Game) {
  const m = game.mystery;
  if (!m || !game.tourney) return;
  let diff = round2(tourneyBook(game, game.tourney).bounties - m.prizes.reduce((s, v) => s + v, 0));
  if (diff > 0.004) return void m.prizes.push(diff);
  const small = envelopesLeft(game).reverse();
  for (const v of small) {
    if (diff >= -0.004) break;
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

// ---------- a heads-up bracket ----------

/** a match's winner moves into the next one */
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

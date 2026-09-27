// a tournament's money, worked out from the game every time: what went in,
// the pool and what each place pays (the deal's amounts, once there's a deal),
// where the bounties went, and what each player takes home. nothing here
// changes the game; what the dealer screen does to it is in actions.ts.
import type { Game, Player, TourneySettings } from "$lib/types";
import { defaultPayouts, payoutAmounts, roundShares } from "$lib/blinds";
import { nameKey, round2 } from "$lib/util";
import { payGroups } from "./bracket";

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

/** who took the pot home: the winner, or everyone in on a deal */
export const survivors = (game: Game) =>
  !game.finished ? [] : game.deal ? game.players.filter((p) => p.id in game.deal!.amounts) : game.players.filter((p) => p.place === 1);

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
  // a deal ends it with no knockout: those players are out, but not busted
  const dealt = game.deal?.amounts ?? {};
  for (const p of game.players) {
    won[p.id] = 0;
    // a rebuy after going out comes with a fresh bounty (below); one bought
    // while still in adds to the bounty they've got
    const busts = kos.filter((k) => k.out === p.id).length;
    const busted = p.out && !(p.id in dealt) ? 1 : 0;
    const topUps = Math.max(0, p.rebuys - (busts - busted));
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

/** a paid place, or a bracket round's places sharing one amount (`from` to `to`) */
export interface PaidPlace {
  from: number;
  to: number;
  /** what it pays (each, when shared): the deal's amount once there's a deal */
  amount: number;
  /** a satellite's seat, paid in the next game rather than in cash */
  seat: boolean;
  /** who finished there */
  players: Player[];
}

/** one player's tournament */
export interface Take {
  /** what they paid in: the buy-in, rebuys and add-ons */
  cost: number;
  /** what their place paid (or their share of a deal) */
  prize: number;
  /** what they took in bounties */
  bounty: number;
  /** the two together */
  won: number;
  /** they won a satellite seat (its prize is the seat) */
  seat: boolean;
  net: number;
  kos: number;
}

/**
 * a tournament's book: the entries and chips, the prize table, the paid
 * places, the bubble, the bounties, and each player's take. every screen,
 * report and settle-up reads the money from here.
 */
export function tourneyBook(game: Game, tr: TourneySettings) {
  const entrants = game.players.length;
  const rebuys = game.players.reduce((s, p) => s + p.rebuys, 0);
  const addOns = game.players.reduce((s, p) => s + p.addOns, 0);
  const table = prizeTable(tr, entrants, rebuys, addOns);
  const { pool, seats, payouts } = table;
  const chipsInPlay = entrants * tr.stack + rebuys * tr.rebuy.chips + addOns * tr.addOn.chips;
  const left = game.players.filter((p) => !p.out).length;
  const avgStack = left ? chipsInPlay / left : 0;
  const pcts = (tr.satellite?.seatValue ?? 0) > 0 ? payouts.map((p) => (pool ? Math.round((p / pool) * 100) : 0)) : tr.payouts.length ? tr.payouts : defaultPayouts(entrants);
  // one out from the money, and in it
  const paid = payouts.filter((p) => p > 0).length;
  const bubble = !game.finished && left === paid + 1 && entrants > paid;
  const itm = !game.finished && left <= paid && left > 1;

  // what a finishing place pays: the deal if there was one (nothing for a place it didn't cover), else the table
  const deal = game.deal;
  const pays = (id: string | undefined, place: number) => {
    if (deal && id && id in deal.amounts) return deal.amounts[id];
    if (deal && place <= Object.keys(deal.amounts).length) return 0;
    return payouts[place - 1] ?? 0;
  };
  // the paid places: the table's, a bracket's rounds sharing theirs, or (after a deal) everyone who took a share
  const byRound = tr.format === "bracket" && !deal;
  const rows = byRound ? payGroups(entrants, payouts.length) : Array.from({ length: deal ? Object.keys(deal.amounts).length : payouts.length }, (_, i) => ({ from: i + 1, to: i + 1 }));
  const places: PaidPlace[] = rows.map((r) => {
    const players = game.players.filter((p) => p.place === r.from);
    return { ...r, amount: pays(players[0]?.id, r.from), seat: !byRound && r.from <= seats, players };
  });

  const bounty = bountyBook(game);
  const takes: Record<string, Take> = {};
  for (const p of game.players) {
    const cost = paidIn(tr, 1, p.rebuys, p.addOns);
    const prize = p.place ? pays(p.id, p.place) : 0;
    const won = round2(prize + (bounty.won[p.id] ?? 0));
    const kos = game.kos?.filter((k) => k.by === p.id).length ?? 0;
    takes[p.id] = { cost, prize, bounty: bounty.won[p.id] ?? 0, won, seat: !!p.place && p.place <= seats, net: round2(won - cost), kos };
  }

  return {
    entrants,
    rebuys,
    addOns,
    ...table,
    bounty: tr.bounty,
    chipsInPlay,
    left,
    avgStack,
    pcts,
    paid,
    bubble,
    itm,
    places,
    /** the places are a bracket's, paid by the round reached */
    byRound,
    /** how many are left when a mystery game's envelopes come out */
    mysteryAt: tr.mysteryFrom || paid,
    /** what's on each head now (flat and progressive) */
    head: bounty.head,
    unclaimed: bounty.unclaimed,
    envelopes: envelopesLeft(game),
    takes,
  };
}

export type TourneyBook = ReturnType<typeof tourneyBook>;

/** seats won in finished satellites that haven't been used in another game yet */
export function unusedSeats(games: Game[]) {
  const used = new Set(games.flatMap((g) => g.players.filter((p) => p.ticket).map((p) => `${p.ticket}>${nameKey(p.name)}`)));
  return games
    .flatMap((game) => {
      if (!game.finished || !game.tourney?.satellite) return [];
      const { takes } = tourneyBook(game, game.tourney);
      return [{ game, winners: game.players.filter((p) => takes[p.id].seat && !used.has(`${game.id}>${nameKey(p.name)}`)) }];
    })
    .filter((x) => x.winners.length);
}

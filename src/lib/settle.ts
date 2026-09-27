// who pays who: settle-up, the shared costs, and the payments ticked off
import type { Cost, Game } from "./types";
import type { Owe } from "./kinds/kind";
import { money, nameKey, round2, splitCents, uid } from "./util";
import { t } from "./i18n";
import { houseName, logEvent, playerName } from "./events";
import { kind } from "./kinds";

/** someone's side of settle-up, by name: what they're up (or down) */
export type Net = { name: string; net: number };

/** adds to someone's side of settle-up, by name: the house folds into the host's own numbers when they're one of the players */
export function addTo(nets: Net[], name: string, amount: number) {
  if (Math.abs(amount) <= 0.001) return nets;
  const row = nets.find((x) => nameKey(x.name) === nameKey(name));
  if (row) row.net = round2(row.net + amount);
  else nets.push({ name, net: round2(amount) });
  return nets;
}

/**
 * each person's side of the shared costs, by player id ("" is the house): what
 * they fronted less their share (split to the cent, the odd cents to the first
 * people in the split).
 */
export function costNets(game: Game) {
  const nets: Record<string, number> = {};
  const add = (id: string, v: number) => (nets[id] = round2((nets[id] ?? 0) + v));
  const ids = game.players.map((p) => p.id);
  for (const c of game.costs ?? []) {
    const who = costSplit(game, c);
    if (!who.length) continue;
    splitCents(c.amount, who.map(() => 1)).forEach((v, i) => add(who[i], -v));
    add(c.paidBy && ids.includes(c.paidBy) ? c.paidBy : "", c.amount);
  }
  return nets;
}

/** who shares a cost: the people it names that are still in the game, or everyone */
export function costSplit(game: Game, c: Cost) {
  const named = c.split.filter((id) => game.players.some((p) => p.id === id));
  return named.length ? named : game.players.map((p) => p.id);
}

/** fewest payments to square everyone up, with the shared costs counted in */
export function squareUp(game: Game, nets: Net[]) {
  for (const [id, v] of Object.entries(costNets(game))) addTo(nets, id ? playerName(game, id) : houseName(game), v);
  return settle(nets);
}

export function addCost(game: Game, c: Omit<Cost, "id">) {
  // assign first, then push through game.costs (see bust)
  if (!game.costs) game.costs = [];
  game.costs.push({ ...c, id: uid(), amount: round2(c.amount) });
  logEvent(game, t("gameEvents.costLog", { label: c.label, amount: money(c.amount), name: c.paidBy ? playerName(game, c.paidBy) : houseName(game) }));
}

export function removeCost(game: Game, id: string) {
  const c = game.costs?.find((x) => x.id === id);
  if (!c) return;
  game.costs = game.costs!.filter((x) => x.id !== id);
  logEvent(game, t("gameEvents.costRemovedLog", { label: c.label }));
}

/** who pays who at the end, the way the game's kind works it out */
export const settleUp = (game: Game) => kind(game.type).settle(game);


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

/** a game's settle-up counts toward what people owe once it's over (a winner, or everyone cashed out) */
export const settled = (game: Game) => kind(game.type).settled(game);

/**
 * settle-up from each player's net for the night (any kind of game): the house
 * takes up whatever doesn't balance (the prizes it pays out of the buy-ins it
 * holds), and shared costs count too
 */
export function settleNets(game: Game, nets: Net[]) {
  const list = nets.map((x) => ({ ...x }));
  addTo(list, houseName(game), -list.reduce((a, x) => a + x.net, 0));
  return squareUp(game, list);
}

/** fewest payments to square everyone up */
function settle(people: Net[]) {
  const nets = people.map((p) => ({ name: p.name, net: round2(p.net) })).filter((x) => Math.abs(x.net) > 0.001);
  const debtors = nets.filter((x) => x.net < 0).map((x) => ({ ...x, net: -x.net })).sort((a, b) => b.net - a.net);
  const creditors = nets.filter((x) => x.net > 0).sort((a, b) => b.net - a.net);
  const moves: Owe[] = [];
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

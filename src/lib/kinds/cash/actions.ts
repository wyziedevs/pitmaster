// what the dealer screen does to a cash game: buy-ins and cash-outs, the
// waitlist, the stakes, the rake box and the side games. each one goes in the
// log (and the big ones up on the tv); what it all comes to is engine.ts.
import type { Game, SideEvent } from "$lib/types";
import { addPlayer, finish } from "$lib/game";
import { flash, logEvent, playerName } from "$lib/events";
import { cashToggle } from "$lib/clock";
import { reseat } from "$lib/seats";
import { unitOf } from "$lib/chips";
import { money, nameKey, round2, signed, uid } from "$lib/util";
import { cashGames, cashStakes, isStud, stakesText, studAmounts, variantName } from "$lib/variants";
import { t } from "$lib/i18n";
import { cashNight, sideStats } from "./engine";

const player = (game: Game, id: string) => game.players.find((p) => p.id === id);

// ---------- buy-ins and cash-outs ----------

/** a buy-in (or a rebuy). someone who'd cashed out is back in the game, and back in a seat */
export function addBuyIn(game: Game, id: string, amount: number) {
  const p = player(game, id);
  if (!p) return;
  p.cashIn = round2(p.cashIn + amount);
  if (p.cashOut !== null) {
    p.cashOut = null;
    p.leftAt = null;
    reseat(game, p);
  }
  logEvent(game, t("gamePlay.cash.boughtInLog", { name: p.name, amount: money(amount), total: money(p.cashIn) }));
  flash(game, t("gamePlay.cash.reloadsFlash", { name: p.name, amount: money(amount) }), "chips");
}

/** a buy-in taken back (a mistake, or chips handed back) */
export function undoBuyIn(game: Game, id: string, amount: number) {
  const p = player(game, id);
  if (!p) return;
  p.cashIn = Math.max(0, round2(p.cashIn - amount));
  logEvent(game, t("gamePlay.cash.buyInReducedLog", { name: p.name, amount: money(amount) }));
}

/** they rack up for `amount` (or the host fixes what they cashed out for) */
export function cashOut(game: Game, id: string, amount: number) {
  const p = player(game, id);
  if (!p) return;
  // a seat opening with people waiting is the news: the tv says who's next
  const nextUp = p.cashOut === null && game.waitlist?.[0];
  const out = round2(amount);
  p.cashOut = out;
  p.leftAt = Date.now();
  const net = signed(cashNight(game, p, out).net);
  logEvent(game, t("gamePlay.cash.cashedOutLog", { name: p.name, amount: money(out), net }));
  const racks = t("gamePlay.cash.racksUpFlash", { name: p.name, net });
  if (nextUp) flash(game, `${racks} · ${t("gameEvents.seatOpenFlash", { name: nextUp.name })}`, "seat");
  else flash(game, racks, "rack");
}

export function removePlayer(game: Game, id: string) {
  const p = player(game, id);
  if (!p) return;
  game.players = game.players.filter((x) => x.id !== id);
  logEvent(game, t("gamePlay.shared.removedLog", { name: p.name }));
}

/** the host calls it a night: the session clock stops with it */
export function endGame(game: Game) {
  finish(game);
  if (game.clock.status === "running") cashToggle(game);
  logEvent(game, t("gamePlay.cash.gameOverLog"));
}

// ---------- the waitlist ----------

export function joinWaitlist(game: Game, name: string) {
  const w = { id: uid(), name: name.trim(), at: Date.now() };
  if (!w.name) return;
  game.waitlist = [...(game.waitlist ?? []), w];
  logEvent(game, t("gameEvents.waitlistJoinedLog", { name: w.name }));
}

export function leaveWaitlist(game: Game, id: string) {
  const list = game.waitlist ?? [];
  const w = list.find((x) => x.id === id);
  if (!w) return;
  game.waitlist = list.filter((x) => x.id !== id);
  logEvent(game, t("gameEvents.waitlistLeftLog", { name: w.name }));
}

/**
 * the next on the list (or anyone on it) sits down, and gets a seat if seats
 * are drawn. someone who played earlier tonight gets their own row back with
 * a standard buy-in, so their night adds up as one.
 */
export function seatWaiting(game: Game, id = game.waitlist?.[0]?.id) {
  const list = game.waitlist ?? [];
  const w = list.find((x) => x.id === id);
  if (!w) return;
  game.waitlist = list.filter((x) => x.id !== id);
  const back = game.players.find((p) => p.cashOut !== null && nameKey(p.name) === nameKey(w.name));
  if (back && game.cash) addBuyIn(game, back.id, game.cash.defaultBuyIn);
  else addPlayer(game, w.name);
}

// ---------- the stakes ----------

export function changeBlinds(game: Game, sb: number, bb: number) {
  const c = game.cash;
  if (!c) return;
  c.sb = sb;
  c.bb = bb;
  // stud's ante and bring-in follow the small bet, like the blinds do
  if (cashGames(c).some(isStud)) Object.assign(c, studAmounts(bb, Math.min(unitOf(game.chips, bb), bb)));
  logEvent(game, t("gamePlay.cash.blindsNowLog", { sb: money(sb), bb: money(bb) }));
  flash(game, t("gamePlay.cash.blindsAreNowFlash", { sb: money(sb), bb: money(bb) }));
}

/** dealer's choice: `id` is the game now, picked `elapsed` into the session */
export function pickGame(game: Game, id: string, elapsed: number) {
  const c = game.cash;
  if (!c) return;
  c.current = id;
  c.since = elapsed;
  logEvent(game, t("gamePlay.variants.gameNowLog", { game: variantName(id) }));
  flash(game, t("gamePlay.variants.gameNowFlash", { game: variantName(id), line: stakesText(cashStakes(c, id), true) }), "game");
}

// ---------- the rake box ----------

/** chips pulled from a pot go in the box (a negative amount takes some back out) */
export function addRake(game: Game, amount: number) {
  game.rakeBox = Math.max(0, round2((game.rakeBox ?? 0) + amount));
}

/** the box counted: this is what's in it */
export function recountRake(game: Game, amount: number) {
  game.rakeBox = round2(amount);
  logEvent(game, t("gamePlay.cash.rakeRecountedLog", { amount: money(game.rakeBox) }));
}

// ---------- the side games ----------

function addSide(game: Game, e: SideEvent) {
  // assign first, then push through game.sides: pushing onto the fresh []
  // itself would skip the reactive copy the game actually keeps
  if (!game.sides) game.sides = [];
  game.sides.push(e);
}

export function callBombPot(game: Game) {
  const b = game.cash?.bomb;
  if (!b) return;
  addSide(game, { kind: "bomb", at: Date.now() });
  const text = t(b.doubleBoard ? "gameEvents.bombDoubleFlash" : "gameEvents.bombFlash", { ante: money(b.ante) });
  logEvent(game, text);
  flash(game, text, "bomb");
}

export function sevenTwoWin(game: Game, playerId: string) {
  const amount = game.cash?.sevenTwo.amount;
  if (amount === undefined) return;
  addSide(game, { kind: "sevenTwo", at: Date.now(), playerId, amount });
  const text = t("gameEvents.sevenTwoFlash", { name: playerName(game, playerId), amount: money(amount) });
  logEvent(game, text);
  flash(game, text, "sevenTwo");
}

/** `playerId` has the high hand now, in this window of play */
export function setHighHand(game: Game, playerId: string, hand: string, window: number) {
  addSide(game, { kind: "highHand", at: Date.now(), playerId, hand: hand.trim(), window });
  const text = t("gameEvents.highHandFlash", { name: playerName(game, playerId), hand: hand.trim() });
  logEvent(game, text);
  flash(game, text, "highHand");
}

/** the house pays whoever holds the high hand; the next window starts with none */
export function payHighHand(game: Game, elapsed: number) {
  const cur = sideStats(game, elapsed).current;
  const amount = game.cash?.highHand.prize;
  if (!cur || amount === undefined) return;
  addSide(game, { kind: "highHandPaid", at: Date.now(), playerId: cur.playerId, amount, hand: cur.hand });
  const text = t("gameEvents.highHandPaidFlash", { name: playerName(game, cur.playerId), amount: money(amount) });
  logEvent(game, text);
  flash(game, text, "money");
}

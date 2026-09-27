// the poker kinds' own settings, checked when a game (or a template) comes
// from outside this browser. see check.ts for the rest of a game.
import { bool, id, list, maybe, num, obj, oneOf, orNull, str } from "$lib/shape";
import { isVariant } from "$lib/variants";

export const isLevel = (l: unknown) =>
  obj(l) && num(l.sb) && num(l.bb) && num(l.ante) && num(l.minutes) && maybe(list(str))(l.colorUp) && maybe(isVariant)(l.game) && maybe(num)(l.bringIn);

export const isTourneySettings = (t: unknown) =>
  obj(t) &&
  num(t.buyIn) &&
  list(num)(t.payouts) &&
  obj(t.rebuy) &&
  obj(t.addOn) &&
  num(t.bounty) &&
  oneOf("flat", "progressive", "mystery")(t.bountyKind) &&
  num(t.mysteryFrom) &&
  orNull((x) => obj(x) && num(x.seatValue))(t.satellite) &&
  oneOf("standard", "shootout", "bracket")(t.format) &&
  maybe(list(isVariant))(t.rotation);

const bombs = (b: unknown) => obj(b) && bool(b.on) && num(b.ante) && bool(b.doubleBoard) && num(b.everyMinutes);
const sevenTwo = (s: unknown) => obj(s) && bool(s.on) && num(s.amount);
const highHand = (h: unknown) => obj(h) && bool(h.on) && num(h.prize) && num(h.everyMinutes);

export const isCashSettings = (c: unknown) =>
  obj(c) &&
  num(c.sb) &&
  num(c.bb) &&
  obj(c.rake) &&
  bombs(c.bomb) &&
  sevenTwo(c.sevenTwo) &&
  highHand(c.highHand) &&
  maybe(list(isVariant))(c.games) &&
  maybe(isVariant)(c.current) &&
  maybe(num)(c.since) &&
  maybe(num)(c.rotateMinutes) &&
  maybe(num)(c.ante) &&
  maybe(num)(c.bringIn);

/** one bomb pot, 7-2 win or high hand in a cash game */
export const isSide = (e: unknown) => {
  if (!obj(e) || !num(e.at)) return false;
  if (e.kind === "bomb") return true;
  if (!id(e.playerId)) return false;
  if (e.kind === "sevenTwo") return num(e.amount);
  if (e.kind === "highHand") return str(e.hand) && num(e.window);
  return e.kind === "highHandPaid" && num(e.amount) && str(e.hand);
};
/** someone waiting for a seat */
export const isWaiting = (w: unknown) => obj(w) && id(w.id) && str(w.name) && num(w.at);
/** one elimination, and (mystery bounties) the envelope it opened */
export const isKnockout = (k: unknown) => obj(k) && id(k.out) && orNull(id)(k.by) && num(k.at) && maybe(num)(k.prize);
export const isMystery = (m: unknown) => obj(m) && num(m.at) && list(num)(m.prizes) && obj(m.own) && Object.values(m.own).every(num);
/** a final-table chop: what each player took */
export const isDeal = (d: unknown) => obj(d) && oneOf("icm", "chop")(d.kind) && obj(d.amounts) && Object.values(d.amounts).every(num) && num(d.at);
/** one heads-up match in a bracket */
export const isMatch = (m: unknown) => obj(m) && num(m.round) && num(m.slot) && orNull(id)(m.a) && orNull(id)(m.b) && orNull(id)(m.winner) && orNull(num)(m.at);

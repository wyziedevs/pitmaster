// imported files and tv snapshots come from outside this browser, so they're
// checked before anything reads them: the right kind of value everywhere the
// app looks, ids that are safe in a page address and colors that are only
// colors. anything else is turned away whole, never half saved.
import type { ChipSet, EventKind, Game, League, PayHandles, Template } from "./types";
import { FACE_DEFAULTS } from "./chips";
import { isVariant } from "./variants";

type Obj = Record<string, unknown>;
type Is = (x: unknown) => boolean;

export const obj = (x: unknown): x is Obj => typeof x === "object" && x !== null && !Array.isArray(x);
const num = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);
const str = (x: unknown): x is string => typeof x === "string";
const bool = (x: unknown) => typeof x === "boolean";
const orNull = (is: Is) => (x: unknown) => x === null || is(x);
const maybe = (is: Is) => (x: unknown) => x === undefined || is(x);
const list = (is: Is) => (x: unknown) => Array.isArray(x) && x.every(is);
const id = (x: unknown) => str(x) && /^[\w-]{1,64}$/.test(x);
const color = maybe((x) => x === "" || (str(x) && /^#[0-9a-f]{3,8}$/i.test(x)));
/** a chip design the app can draw */
const style = maybe((x) => str(x) && Object.hasOwn(FACE_DEFAULTS, x));

const chip = (c: unknown) =>
  obj(c) &&
  id(c.id) &&
  str(c.label) &&
  [c.color, c.accent, c.accent2, c.inlay, c.ink, c.trim].every(color) &&
  style(c.style) &&
  num(c.value) &&
  num(c.count);

const player = (p: unknown) =>
  obj(p) &&
  id(p.id) &&
  str(p.name) &&
  num(p.cashIn) &&
  orNull(num)(p.cashOut) &&
  num(p.rebuys) &&
  num(p.addOns) &&
  bool(p.out) &&
  orNull(num)(p.place) &&
  orNull(num)(p.bustedAt) &&
  maybe(orNull((s) => obj(s) && num(s.table) && num(s.seat)))(p.seat) &&
  maybe(id)(p.ticket);

const variant = (v: unknown) => isVariant(v);
const level = (l: unknown) =>
  obj(l) && num(l.sb) && num(l.bb) && num(l.ante) && num(l.minutes) && maybe(list(str))(l.colorUp) && maybe(variant)(l.game) && maybe(num)(l.bringIn);
const said = orNull((n) => obj(n) && str(n.text) && num(n.at));
const EVENT_KINDS: EventKind[] = ["win", "deal", "money", "bounty", "bust", "chips", "rack", "shuffle", "draw", "seat", "bomb", "sevenTwo", "highHand", "game", "note"];
const flashed = orNull((n) => obj(n) && str(n.text) && num(n.at) && (EVENT_KINDS as string[]).includes(n.kind as string));
const clock = (c: unknown) =>
  obj(c) && ["idle", "running", "paused"].includes(c.status as string) && num(c.levelIndex) && num(c.levelElapsedMs) && num(c.elapsedMs);
const tourney = (t: unknown) =>
  obj(t) &&
  num(t.buyIn) &&
  list(num)(t.payouts) &&
  obj(t.rebuy) &&
  obj(t.addOn) &&
  num(t.bounty) &&
  ["flat", "progressive", "mystery"].includes(t.bountyKind as string) &&
  num(t.mysteryFrom) &&
  orNull((x) => obj(x) && num(x.seatValue))(t.satellite) &&
  ["standard", "shootout", "bracket"].includes(t.format as string) &&
  maybe(list(variant))(t.rotation);
/** one elimination, and (mystery bounties) the envelope it opened */
const knockout = (k: unknown) => obj(k) && id(k.out) && orNull(id)(k.by) && num(k.at) && maybe(num)(k.prize);
const mystery = (m: unknown) => obj(m) && num(m.at) && list(num)(m.prizes) && obj(m.own) && Object.values(m.own).every(num);
const bombs = (b: unknown) => obj(b) && bool(b.on) && num(b.ante) && bool(b.doubleBoard) && num(b.everyMinutes);
const sevenTwo = (s: unknown) => obj(s) && bool(s.on) && num(s.amount);
const highHand = (h: unknown) => obj(h) && bool(h.on) && num(h.prize) && num(h.everyMinutes);
const cash = (c: unknown) =>
  obj(c) &&
  num(c.sb) &&
  num(c.bb) &&
  obj(c.rake) &&
  bombs(c.bomb) &&
  sevenTwo(c.sevenTwo) &&
  highHand(c.highHand) &&
  maybe(list(variant))(c.games) &&
  maybe(variant)(c.current) &&
  maybe(num)(c.since) &&
  maybe(num)(c.rotateMinutes) &&
  maybe(num)(c.ante) &&
  maybe(num)(c.bringIn);
/** one bomb pot, 7-2 win or high hand in a cash game */
const side = (e: unknown) =>
  obj(e) &&
  ["bomb", "sevenTwo", "highHand", "highHandPaid"].includes(e.kind as string) &&
  num(e.at) &&
  maybe(id)(e.playerId) &&
  maybe(num)(e.amount) &&
  maybe(str)(e.hand) &&
  maybe(num)(e.window);
/** a line of the game's log: when, and what happened (game.ts keeps the latest 300) */
const cost = (c: unknown) => obj(c) && id(c.id) && str(c.label) && num(c.amount) && orNull(id)(c.paidBy) && list(id)(c.split);
const payment = (p: unknown) => obj(p) && str(p.from) && str(p.to) && num(p.amount) && num(p.at);
const waiting = (w: unknown) => obj(w) && id(w.id) && str(w.name) && num(w.at);
const entry = (e: unknown) => obj(e) && num(e.t) && str(e.text);
/** one heads-up match in a bracket */
const match = (m: unknown) => obj(m) && num(m.round) && num(m.slot) && orNull(id)(m.a) && orNull(id)(m.b) && orNull(id)(m.winner) && orNull(num)(m.at);
/** a league's standings on a tv snapshot */
const board = (b: unknown) =>
  obj(b) && str(b.name) && num(b.games) && list((r) => obj(r) && str(r.name) && num(r.points) && num(r.games))(b.rows);

export function isGame(g: unknown): g is Game {
  return (
    obj(g) &&
    id(g.id) &&
    str(g.name) &&
    num(g.createdAt) &&
    num(g.updatedAt) &&
    str(g.chipSetName) &&
    num(g.multiplier) &&
    list(chip)(g.chips) &&
    str(g.notes) &&
    list(player)(g.players) &&
    clock(g.clock) &&
    list(level)(g.levels) &&
    said(g.message) &&
    flashed(g.flash) &&
    list(entry)(g.log) &&
    (g.log as unknown[]).length <= 300 &&
    orNull((l) => obj(l) && str(l.code) && str(l.key))(g.live) &&
    bool(g.finished) &&
    maybe(list(knockout))(g.kos) &&
    maybe(mystery)(g.mystery) &&
    maybe(list(side))(g.sides) &&
    maybe(list(cost))(g.costs) &&
    maybe(num)(g.finalAt) &&
    maybe(list(match))(g.matches) &&
    maybe(list(payment))(g.paid) &&
    maybe(list(waiting))(g.waitlist) &&
    maybe(id)(g.leagueId) &&
    maybe(board)(g.league) &&
    // a tournament's clock needs at least one level to count down
    (g.type === "cash" ? cash(g.cash) : g.type === "tournament" && tourney(g.tourney) && (g.levels as unknown[]).length > 0)
  );
}

export const isChipSet = (s: unknown): s is ChipSet => obj(s) && id(s.id) && str(s.name) && str(s.note) && list(chip)(s.chips);

export const isTemplate = (t: unknown): t is Template =>
  obj(t) &&
  id(t.id) &&
  str(t.name) &&
  (t.type === "cash" || t.type === "tournament") &&
  num(t.createdAt) &&
  str(t.chipSetId) &&
  num(t.multiplier) &&
  str(t.notes) &&
  list(str)(t.players) &&
  maybe(list(level))(t.levels) &&
  maybe(tourney)(t.tourney) &&
  maybe(cash)(t.cash);

const GAME_TYPES = ["cash", "tournament"];
export const isLeague = (l: unknown): l is League =>
  obj(l) &&
  id(l.id) &&
  str(l.name) &&
  num(l.start) &&
  maybe(num)(l.end) &&
  list((x) => GAME_TYPES.includes(x as string))(l.types) &&
  obj(l.points) &&
  ["table", "beaten", "root"].includes(l.points.kind as string) &&
  list(num)(l.points.table) &&
  num(l.points.play) &&
  num(l.points.ko) &&
  maybe(num)(l.bestOf) &&
  num(l.updatedAt);

/** pay handles by player: only the three apps, only text */
export const isHandles = (h: unknown): h is Record<string, PayHandles> =>
  obj(h) && Object.values(h).every((v) => obj(v) && Object.entries(v).every(([k, s]) => ["venmo", "cashapp", "paypal"].includes(k) && str(s)));

/** everything an export file carries (see store.ts) */
export const isData = (d: unknown) =>
  obj(d) && list(isGame)(d.games) && list(isChipSet)(d.chipSets) && list(isTemplate)(d.templates) && isHandles(d.handles) && str(d.defaultChipSetId) &&
  maybe(list(isLeague))(d.leagues) &&
  (d.exportedAt === undefined || typeof d.exportedAt === "number");

/** a password-locked export's lock: what crypto.ts needs to try a password */
export const isLocked = (l: unknown) => obj(l) && str(l.salt) && num(l.rounds) && str(l.data);

// imported files and tv snapshots come from outside this browser, so they're
// checked before anything reads them: the right kind of value everywhere the
// app looks, ids that are safe in a page address and colors that are only
// colors. anything else is turned away whole, never half saved.
import type { ChipSet, EventKind, Game, League, PayHandles, Template } from "./types";
import { FACE_DEFAULTS } from "./chips";
import { bool, id, list, maybe, num, obj, orNull, str } from "./shape";
import { isCashSettings, isLevel, isTourneySettings } from "./kinds/poker/check";
import { isKind, kindOf } from "./kinds";

// the primitives (shape.ts) and each kind's own settings (kinds/) live elsewhere
export { obj } from "./shape";
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

const said = orNull((n) => obj(n) && str(n.text) && num(n.at));
const EVENT_KINDS: EventKind[] = ["win", "deal", "money", "bounty", "bust", "chips", "rack", "shuffle", "draw", "seat", "bomb", "sevenTwo", "highHand", "game", "note"];
const flashed = orNull((n) => obj(n) && str(n.text) && num(n.at) && (EVENT_KINDS as string[]).includes(n.kind as string));
const clock = (c: unknown) =>
  obj(c) && ["idle", "running", "paused"].includes(c.status as string) && num(c.levelIndex) && num(c.levelElapsedMs) && num(c.elapsedMs);
/** a line of the game's log: when, and what happened (game.ts keeps the latest 300) */
const cost = (c: unknown) => obj(c) && id(c.id) && str(c.label) && num(c.amount) && orNull(id)(c.paidBy) && list(id)(c.split);
const payment = (p: unknown) => obj(p) && str(p.from) && str(p.to) && num(p.amount) && num(p.at);
const entry = (e: unknown) => obj(e) && num(e.t) && str(e.text);
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
    list(isLevel)(g.levels) &&
    said(g.message) &&
    flashed(g.flash) &&
    list(entry)(g.log) &&
    (g.log as unknown[]).length <= 300 &&
    orNull((l) => obj(l) && str(l.code) && str(l.key))(g.live) &&
    bool(g.finished) &&
    maybe(list(cost))(g.costs) &&
    maybe(list(payment))(g.paid) &&
    maybe(id)(g.leagueId) &&
    maybe(board)(g.league) &&
    // and the parts that belong to its kind
    isKind(g.type) &&
    kindOf(g.type).check(g)
  );
}

export const isChipSet = (s: unknown): s is ChipSet => obj(s) && id(s.id) && str(s.name) && str(s.note) && list(chip)(s.chips);

export const isTemplate = (t: unknown): t is Template =>
  obj(t) &&
  id(t.id) &&
  str(t.name) &&
  isKind(t.type) &&
  kindOf(t.type).poker &&
  num(t.createdAt) &&
  str(t.chipSetId) &&
  num(t.multiplier) &&
  str(t.notes) &&
  list(str)(t.players) &&
  maybe(list(isLevel))(t.levels) &&
  maybe(isTourneySettings)(t.tourney) &&
  maybe(isCashSettings)(t.cash);

export const isLeague = (l: unknown): l is League =>
  obj(l) &&
  id(l.id) &&
  str(l.name) &&
  num(l.start) &&
  maybe(num)(l.end) &&
  list(isKind)(l.types) &&
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

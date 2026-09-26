// imported files and tv snapshots come from outside this browser, so they're
// checked before anything reads them: the right kind of value everywhere the
// app looks, ids that are safe in a page address and colors that are only
// colors. anything else is turned away whole, never half saved.
import type { ChipSet, Game, PayHandles, Template } from "./types";
import { FACE_DEFAULTS } from "./chips";

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
  maybe(orNull((s) => obj(s) && num(s.table) && num(s.seat)))(p.seat);

const level = (l: unknown) => obj(l) && num(l.sb) && num(l.bb) && num(l.ante) && num(l.minutes) && maybe(list(str))(l.colorUp);
const said = orNull((n) => obj(n) && str(n.text) && num(n.at));
const clock = (c: unknown) =>
  obj(c) && ["idle", "running", "paused"].includes(c.status as string) && num(c.levelIndex) && num(c.levelElapsedMs) && num(c.elapsedMs);
const tourney = (t: unknown) => obj(t) && num(t.buyIn) && list(num)(t.payouts) && obj(t.rebuy) && obj(t.addOn);
const cash = (c: unknown) => obj(c) && num(c.sb) && num(c.bb) && obj(c.rake);
/** a line of the game's log: when, and what happened (game.ts keeps the latest 300) */
const entry = (e: unknown) => obj(e) && num(e.t) && str(e.text);

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
    said(g.flash) &&
    list(entry)(g.log) &&
    (g.log as unknown[]).length <= 300 &&
    orNull((l) => obj(l) && str(l.code) && str(l.key))(g.live) &&
    bool(g.finished) &&
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

/** pay handles by player: only the three apps, only text */
export const isHandles = (h: unknown): h is Record<string, PayHandles> =>
  obj(h) && Object.values(h).every((v) => obj(v) && Object.entries(v).every(([k, s]) => ["venmo", "cashapp", "paypal"].includes(k) && str(s)));

/** everything an export file carries (see store.ts) */
export const isData = (d: unknown) =>
  obj(d) && list(isGame)(d.games) && list(isChipSet)(d.chipSets) && list(isTemplate)(d.templates) && isHandles(d.handles) && str(d.defaultChipSetId) &&
  (d.exportedAt === undefined || typeof d.exportedAt === "number");

/** a password-locked export's lock: what crypto.ts needs to try a password */
export const isLocked = (l: unknown) => obj(l) && str(l.salt) && num(l.rounds) && str(l.data);

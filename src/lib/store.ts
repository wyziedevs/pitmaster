// everything lives in this browser, encrypted with this browser's key (see
// vault.ts). the api only relays locked tv snapshots and never owns data.
import type { ChipSet, Game, PayHandles, Template } from "./types";
import { nameKey } from "./util";
import { PRESET_CHIP_SETS, presetCopy } from "./chips";
import { endLive, publish } from "./sync";
import { lockText, unlockText, type Locked } from "./crypto";
import { onSaved, readSlot, save as saveSlot } from "./vault";
import { isData, isLocked, obj } from "./check";

interface Data {
  chipSets: ChipSet[];
  games: Game[];
  defaultChipSetId: string;
  /** saved setups */
  templates: Template[];
  /** where each regular gets paid, keyed by nameKey */
  handles: Record<string, PayHandles>;
  /** when everything was last exported, for the backup reminder */
  exportedAt?: number;
}

const fresh = (): Data => ({
  chipSets: PRESET_CHIP_SETS.map(presetCopy),
  games: [],
  defaultChipSetId: PRESET_CHIP_SETS[0].id,
  templates: [],
  handles: {},
});

// ---------- what's saved ----------
// decrypted once, when the app opens or is unlocked (see lock.svelte.ts), and
// held here, parsed. every read hands out its own copy of just the part it
// asked for, so a page can change what it got without touching the saved
// data until it saves. a save changes the data here in place and hands the
// vault a way to make the text, not the text: a burst of changes becomes one
// piece of text, made when the save actually goes out. while locked there's
// nothing here at all.

/** what's saved, as text: null until it's needed after a change */
let plain: string | null = null;
/** what's saved, parsed: shared, so it never leaves this file uncopied */
let parsed: Data | null = null;

function hold(text: string) {
  plain = text || null;
  parsed = null;
}

/**
 * unseal what's saved with this key. false if the key doesn't open it; a
 * storage hiccup (the disk, the browser) throws instead, since what's saved may
 * be fine and only needs another try.
 */
export async function openStore(key: CryptoKey) {
  try {
    hold((await readSlot("data", key)) ?? JSON.stringify(fresh()));
    return true;
  } catch (e) {
    hold("");
    if ((e instanceof DOMException && e.name === "OperationError") || (e instanceof Error && e.message === "not sealed")) return false;
    throw e;
  }
}

/** a page that can't encrypt keeps everything in memory only */
export const memoryStore = () => hold(JSON.stringify(fresh()));

function data(): Data {
  if (parsed) return parsed;
  if (!plain) throw new Error("the store was read while locked");
  return (parsed = JSON.parse(plain) as Data);
}
/** everything, as text: made once per change */
const text = () => (plain ??= JSON.stringify(data()));

/** everything, as text, for sealing under a new key */
export const storeText = () => text();

// another tab changed what's saved: this copy takes it on, then tells whoever's
// holding a piece of it (the dealer screen, say) to read theirs again
const watchers = new Set<() => void>();
/** hear when another tab changes what's saved. returns stop. */
export function onOtherTab(cb: () => void) {
  watchers.add(cb);
  return () => void watchers.delete(cb);
}
onSaved("data", (text) => {
  hold(text);
  for (const cb of watchers) cb();
});

const copy = <T>(v: T): T => structuredClone(v);

/** save `d`, changed in place (or a whole new one) */
function save(d: Data) {
  parsed = d;
  plain = null;
  saveSlot("data", text);
}

// ---------- chip sets ----------

export const getChipSets = () => copy(data().chipSets);
export const getDefaultChipSetId = () => data().defaultChipSetId;

export function getChipSet(id: string) {
  const sets = data().chipSets;
  return copy(sets.find((s) => s.id === id) ?? sets[0]);
}

export function saveChipSet(set: ChipSet) {
  const d = data();
  const i = d.chipSets.findIndex((s) => s.id === set.id);
  if (i >= 0) d.chipSets[i] = copy(set);
  else d.chipSets.push(copy(set));
  save(d);
}

export function deleteChipSet(id: string) {
  const d = data();
  d.chipSets = d.chipSets.filter((s) => s.id !== id);
  if (d.defaultChipSetId === id) d.defaultChipSetId = d.chipSets[0]?.id ?? "";
  save(d);
}

export function setDefaultChipSet(id: string) {
  const d = data();
  d.defaultChipSetId = id;
  save(d);
}

export function restorePresets() {
  const d = data();
  for (const p of PRESET_CHIP_SETS) {
    const i = d.chipSets.findIndex((s) => s.id === p.id);
    if (i >= 0) d.chipSets[i] = presetCopy(p);
    else d.chipSets.push(presetCopy(p));
  }
  save(d);
}

// ---------- games ----------

export const getGames = () => copy(data().games).sort((a, b) => b.createdAt - a.createdAt);
export function getGame(id: string) {
  const g = data().games.find((g) => g.id === id);
  return g ? copy(g) : null;
}

/** save + broadcast to any open tv screens */
export function saveGame(game: Game) {
  game.updatedAt = Date.now();
  const d = data();
  const i = d.games.findIndex((g) => g.id === game.id);
  if (i >= 0) d.games[i] = copy(game);
  else d.games.push(copy(game));
  save(d);
  publish(game);
  return game;
}

export function deleteGame(id: string) {
  const d = data();
  const live = d.games.find((g) => g.id === id)?.live;
  if (live) endLive(live).catch(() => {});
  d.games = d.games.filter((g) => g.id !== id);
  save(d);
}

// ---------- templates ----------

export const getTemplates = () => copy(data().templates).sort((a, b) => a.name.localeCompare(b.name));
export function getTemplate(id: string) {
  const t = data().templates.find((t) => t.id === id);
  return t ? copy(t) : null;
}

export function saveTemplate(t: Template) {
  const d = data();
  const i = d.templates.findIndex((x) => x.id === t.id);
  if (i >= 0) d.templates[i] = copy(t);
  else d.templates.push(copy(t));
  save(d);
}

export function deleteTemplate(id: string) {
  const d = data();
  d.templates = d.templates.filter((t) => t.id !== id);
  save(d);
}

// ---------- regulars ----------

/** everyone who's played here, most games first. spelling from their latest game wins. */
export function knownPlayers() {
  const seen = new Map<string, { name: string; games: number; last: number }>();
  for (const g of data().games) {
    for (const p of g.players) {
      const k = nameKey(p.name);
      if (!k || /^seat \d+$/.test(k)) continue;
      const x = seen.get(k);
      if (!x) seen.set(k, { name: p.name.trim(), games: 1, last: g.createdAt });
      else {
        x.games++;
        if (g.createdAt > x.last) Object.assign(x, { name: p.name.trim(), last: g.createdAt });
      }
    }
  }
  return [...seen.values()].sort((a, b) => b.games - a.games || b.last - a.last);
}

// ---------- pay handles ----------
// keyed by player name, so they live in objects with nothing built in: a
// player called "constructor" or "__proto__" is just a name.

const byName = <T>(r: Record<string, T>) => Object.assign(Object.create(null) as Record<string, T>, r);

export const getHandles = () => byName(copy(data().handles));
export const handlesFor = (name: string) => getHandles()[nameKey(name)] ?? null;

/** save (or clear) where someone gets paid. blank fields are dropped. */
export function saveHandles(name: string, h: PayHandles) {
  const d = data();
  const clean: PayHandles = {};
  for (const k of ["venmo", "cashapp", "paypal"] as const) {
    const v = h[k]?.trim().replace(/^[@$]/, "");
    if (v) clean[k] = v;
  }
  const handles = byName(d.handles);
  if (Object.keys(clean).length) handles[nameKey(name)] = clean;
  else delete handles[nameKey(name)];
  d.handles = handles;
  save(d);
}

// ---------- export + import ----------
// there's no account and no server copy, so a file is how a game moves from
// one computer to another: export here, import there, keep running it.

/**
 * an export file. "everything" is the whole browser (and, if asked, the
 * settings); "game" is one game with its chip set and its players' pay links.
 */
export interface Backup {
  pitmaster: 1;
  kind: "everything" | "game";
  exportedAt: number;
  data: Data;
  settings?: Record<string, unknown>;
}

/** an export file locked with a password: only its kind and date can be read without it */
export interface LockedBackup {
  pitmaster: 1;
  kind: Backup["kind"];
  exportedAt: number;
  locked: Locked;
}

/** when this browser last exported everything (0 = never). kept with the rest, encrypted */
export const lastExport = () => data().exportedAt ?? 0;

/** the whole browser as a file, with the settings if they're passed in */
export function exportAll(settings?: object) {
  const d = data();
  d.exportedAt = Date.now();
  save(d);
  const b: Backup = { pitmaster: 1, kind: "everything", exportedAt: d.exportedAt, data: d, settings: settings && { ...settings } };
  return JSON.stringify(b, null, 2);
}

/** one game, ready to carry to another device */
export function exportGame(id: string) {
  const d = data();
  const g = d.games.find((x) => x.id === id);
  if (!g) return null;
  const set = d.chipSets.find((s) => s.name === g.chipSetName);
  const handles = Object.fromEntries(
    Object.entries(d.handles).filter(([k]) => g.players.some((p) => nameKey(p.name) === k))
  );
  const b: Backup = {
    pitmaster: 1,
    kind: "game",
    exportedAt: Date.now(),
    data: { games: [g], chipSets: set ? [set] : [], templates: [], handles, defaultChipSetId: "" },
  };
  return JSON.stringify(b, null, 2);
}

/** the same file, locked with a password */
export async function lockBackup(json: string, password: string) {
  const b = JSON.parse(json) as Backup;
  const file: LockedBackup = { pitmaster: 1, kind: b.kind, exportedAt: b.exportedAt, locked: await lockText(json, password) };
  return JSON.stringify(file, null, 2);
}

/**
 * read an export file and check every part of it is really one of ours (see
 * check.ts), so a damaged or doctored file can't get into what's saved here.
 * throws if it isn't.
 */
export function readBackup(json: string): Backup | LockedBackup {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new Error("It isn't a PitMaster export (it's not JSON).");
  }
  if (!obj(raw) || raw.pitmaster !== 1 || (raw.kind !== "everything" && raw.kind !== "game") || typeof raw.exportedAt !== "number")
    throw new Error("It isn't a PitMaster export.");
  if ("locked" in raw) {
    if (!isLocked(raw.locked)) throw new Error("It's locked, but damaged.");
    return raw as unknown as LockedBackup;
  }
  if (!isData(raw.data) || (raw.settings !== undefined && !obj(raw.settings))) throw new Error("It's damaged, or from something else.");
  return raw as unknown as Backup;
}

/** open a locked export. throws if the password is wrong. */
export async function unlockBackup(b: LockedBackup, password: string) {
  let json: string;
  try {
    json = await unlockText(b.locked, password);
  } catch {
    throw new Error("That password doesn't open it.");
  }
  const inner = readBackup(json);
  if ("locked" in inner) throw new Error("It isn't a PitMaster export.");
  return inner;
}

export type ImportMode = "merge" | "replace";

/** what an import would do, counted up front so the host knows before they commit */
export function planImport(b: Backup, mode: ImportMode) {
  const here = data();
  const mine = new Map(here.games.map((g) => [g.id, g]));
  let added = 0;
  let updated = 0;
  let kept = 0;
  for (const g of b.data.games) {
    const m = mine.get(g.id);
    if (!m) added++;
    else if (g.updatedAt > m.updatedAt) updated++;
    else kept++;
  }
  return { added, updated, kept, here: here.games.length };
}

/** keep one of each id: the file's copy wins where `newer` says so */
function union<T extends { id: string }>(here: T[], file: T[], newer: (file: T, here: T) => boolean) {
  const m = new Map(here.map((x) => [x.id, x]));
  for (const x of file) {
    const h = m.get(x.id);
    if (!h || newer(x, h)) m.set(x.id, x);
  }
  return [...m.values()];
}

// what everything was just before the last import, so it can be taken back.
// held in memory for this visit only, never saved anywhere
let beforeImport: string | null = null;

/** put everything back the way it was before the last import */
export function undoImport() {
  if (!beforeImport) return false;
  save(JSON.parse(beforeImport) as Data);
  beforeImport = null;
  return true;
}

/**
 * bring a file in. merge adds what's new and takes the newer copy of any game
 * both sides have (nothing here is deleted); replace makes this browser the file.
 */
export function importBackup(b: Backup, mode: ImportMode) {
  beforeImport = text();
  // a plain copy (json, so a reactive proxy passed in by mistake still works)
  const file: Data = JSON.parse(JSON.stringify(b.data));
  if (mode === "replace" && b.kind === "everything") {
    if (!file.chipSets.some((s) => s.id === file.defaultChipSetId)) file.defaultChipSetId = file.chipSets[0]?.id ?? PRESET_CHIP_SETS[0].id;
    save(file);
    return;
  }
  const d = data();
  d.games = union(d.games, file.games, (f, h) => f.updatedAt >= h.updatedAt);
  d.chipSets = union(d.chipSets, file.chipSets, () => true);
  d.templates = union(d.templates, file.templates, (f, h) => f.createdAt >= h.createdAt);
  d.handles = byName({ ...d.handles, ...file.handles });
  save(d);
}

/** games + chip sets back to a fresh install. settings are left alone. */
export function wipeAll() {
  for (const g of data().games) if (g.live) endLive(g.live).catch(() => {});
  beforeImport = null;
  save(fresh());
}

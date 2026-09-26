// where everything is saved: IndexedDB, holding this browser's key and the
// data and settings sealed with it, side by side. a new key (a passcode set,
// changed or turned off) and everything sealed with it land in one
// transaction or not at all, and every save checks it's still using the
// current key, so no tab can ever leave data locked with a key that's gone.
import { canEncrypt, newKey, lockedKey, seal, token, unseal, type KeyLock } from "./crypto";

/** what's kept as the key: the key itself, or with a passcode, the key locked by it. kid tells one key from the next */
export type Keeper = { kid: string; key: CryptoKey } | { kid: string; lock: KeyLock };
export type Slot = "data" | "settings";

/** the key this tab saves with, once it's open (none on plain http, or while locked) */
export let session: { kid: string; key: CryptoKey } | null = null;

/** what a save does when it can't: another tab changed the key (so this tab is out of date), or storage failed; and when saving works again */
export const hooks = {
  stale: () => location.reload(),
  failed: (e: unknown) => console.warn("couldn't save", e),
  recovered: () => {},
};

// ---------- IndexedDB ----------

let conn: Promise<IDBDatabase> | undefined;
function db() {
  return (conn ??= new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open("pitmaster-vault", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("vault");
    req.onsuccess = () => {
      const d = req.result;
      // a newer copy of the site in another tab needs the database changed:
      // step aside and come back as that copy
      d.onversionchange = () => {
        d.close();
        location.reload();
      };
      // the browser closed it (storage cleared, the disk went away): open it again next time
      d.onclose = () => (conn = undefined);
      resolve(d);
    };
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("blocked"));
  }).catch((e) => {
    // a failed open isn't kept: the next save tries again
    conn = undefined;
    throw e;
  }));
}

/** run `work` in one transaction. resolves with what it passes to `done` once the transaction commits. */
async function inTx<T>(mode: IDBTransactionMode, work: (s: IDBObjectStore, done: (v: T) => void) => void) {
  const d = await db();
  return new Promise<T>((resolve, reject) => {
    const t = d.transaction("vault", mode);
    let out: T;
    work(t.objectStore("vault"), (v) => (out = v));
    t.oncomplete = () => resolve(out);
    t.onerror = t.onabort = () => reject(t.error ?? new Error("aborted"));
  });
}

const get = <T>(name: string) =>
  inTx<T | undefined>("readonly", (s, done) => {
    const r = s.get(name);
    r.onsuccess = () => done(r.result);
  });

export const readKeeper = () => get<Keeper>("keeper");

/** why nothing can be kept, when it can't: no https (so no encryption), or site storage switched off */
export let noKeeper: "insecure" | "blocked" | null = null;

/**
 * this browser's keeper, made on the first visit. null when the page can't
 * encrypt or keep anything (noKeeper says which).
 */
export async function openKeeper(): Promise<Keeper | null> {
  noKeeper = !canEncrypt() ? "insecure" : typeof indexedDB === "undefined" ? "blocked" : null;
  if (noKeeper) return null;
  try {
    const made: Keeper = { kid: token(9), key: await newKey() };
    // one transaction reads it and, the first time, adds this one, so two tabs
    // opening at the same moment still end up sharing a key
    return await inTx<Keeper>("readwrite", (s, done) => {
      const r = s.get("keeper");
      r.onsuccess = () => {
        if (r.result) return done(r.result);
        s.add(made, "keeper");
        done(made);
      };
    });
  } catch {
    noKeeper = "blocked";
    return null;
  }
}

const sizes: Partial<Record<Slot, number>> = {};

/** how much a slot takes up, sealed */
export const savedSize = (slot: Slot) => sizes[slot] ?? 0;

/** a slot, unsealed (null if nothing's saved yet). throws if the key doesn't open it. */
export async function readSlot(slot: Slot, key: CryptoKey) {
  const sealed = await get<string>(slot);
  if (!sealed) return null;
  sizes[slot] = sealed.length;
  return unseal(key, sealed);
}

// ---------- saving ----------
// saves queue up and go out one at a time, the newest text for each slot
// winning. each one is written only if the key it was sealed with is still
// the current one, checked in the same transaction.

/** what each slot will save next: the text, or a way to make it when it goes out */
const queued = new Map<Slot, string | (() => string)>();
let running: Promise<void> | null = null;
let held = false;
let retry: ReturnType<typeof setTimeout> | undefined;
/** saves are failing: said once, not on every retry */
let failing = false;

// once something's been saved, ask the browser to keep it for good. without
// this a browser short on space (or Safari, after a week away) may clear the
// site's storage, and with it the key: everything saved would be gone
let askedToKeep = false;
function keepForGood() {
  if (askedToKeep) return;
  askedToKeep = true;
  navigator.storage?.persist?.().catch(() => {});
}

// closing the tab with a save still going out: the browser asks first
if (typeof window !== "undefined")
  addEventListener("beforeunload", (e) => {
    if (running || queued.size) e.preventDefault();
  });

export function begin(s: { kid: string; key: CryptoKey }) {
  session = s;
}

/** save a slot. nothing is saved without a key: on plain http, or while locked. */
export function save(slot: Slot, text: string | (() => string)) {
  if (!session) return;
  queued.set(slot, text);
  run();
}

let lastTried: [Slot, string] | null = null;

function run() {
  if (running || held || !session || !queued.size) return running;
  running = (async () => {
    try {
      while (queued.size && !held && session) {
        const [slot, next] = queued.entries().next().value!;
        queued.delete(slot);
        const text = typeof next === "function" ? next() : next;
        lastTried = [slot, text];
        const s = session;
        const sealed = await seal(s.key, text, true);
        const current = await inTx<boolean>("readwrite", (st, done) => {
          const k = st.get("keeper");
          k.onsuccess = () => {
            if (k.result?.kid !== s.kid) return done(false);
            st.put(sealed, slot);
            done(true);
          };
        });
        if (!current) return hooks.stale();
        sizes[slot] = sealed.length;
        post({ type: "saved", slot, kid: s.kid });
        keepForGood();
        if (failing) hooks.recovered();
        failing = false;
      }
    } catch (e) {
      if (!failing) hooks.failed(e);
      failing = true;
      // what didn't save goes back in line (unless something newer already
      // took its place) and gets another go shortly
      if (lastTried && !queued.has(lastTried[0])) queued.set(...lastTried);
      clearTimeout(retry);
      retry = setTimeout(run, 5000);
    } finally {
      running = null;
    }
  })();
  return running;
}

/** wait until every save made so far is written. false if one failed: it stays in line for the retry */
export async function flush() {
  while (run()) {
    await running;
    if (failing) return false;
  }
  return true;
}

/**
 * a new key for everything. `texts` (all of it, as it stands) is sealed with
 * the new key and saved in the same transaction as the key. with a passcode
 * the key is kept locked by it; without one, as it is. other tabs reload.
 */
export async function rekey(passcode: string | null, texts: Record<Slot, string>) {
  held = true;
  queued.clear(); // texts has everything saved so far
  try {
    await running;
    const kid = token(9);
    const made = passcode ? await lockedKey(passcode) : { key: await newKey(), lock: null };
    const keeper: Keeper = made.lock ? { kid, lock: made.lock } : { kid, key: made.key };
    const data = await seal(made.key, texts.data, true);
    const settings = await seal(made.key, texts.settings, true);
    await inTx("readwrite", (s) => {
      s.put(keeper, "keeper");
      s.put(data, "data");
      s.put(settings, "settings");
    });
    session = { kid, key: made.key };
    sizes.data = data.length;
    sizes.settings = settings.length;
    post({ type: "rekey" });
  } catch (e) {
    // nothing changed: the old key stands, and what was going to be saved still
    // is (unless something newer was saved while the new key was being made)
    for (const slot of ["data", "settings"] as const) if (!queued.has(slot)) queued.set(slot, texts[slot]);
    throw e;
  } finally {
    held = false;
    run(); // anything saved while the new key was being made
  }
}

/** delete the key and everything saved with it. reload after. */
export async function wipe() {
  held = true;
  queued.clear();
  session = null;
  await inTx("readwrite", (s) => s.clear());
  post({ type: "rekey" });
}

// ---------- other tabs ----------

export type VaultMessage =
  | { type: "saved"; slot: Slot; kid: string }
  | { type: "rekey" } // the key changed: reload
  | { type: "lock" } // lock now
  | { type: "active" } // someone's using PitMaster in another tab
  | { type: "key?" } // a tab that just opened, locked, asking whether another has the key
  | { type: "key"; kid: string; key: CryptoKey }; // unlocked: here it is

const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("pitmaster-vault") : null;

export const post = (m: VaultMessage) => channel?.postMessage(m);

/** hear from the other tabs */
export function onVault(cb: (m: VaultMessage) => void) {
  channel?.addEventListener("message", (e) => cb(e.data));
}

// another tab saved: take its copy, so a save here doesn't undo it. unless
// this tab has a save of its own on the way: that lands after, and the other
// tab takes it in turn, so what each tab holds always matches what's written
const readers: Partial<Record<Slot, (text: string) => void>> = {};
export const onSaved = (slot: Slot, cb: (text: string) => void) => void (readers[slot] = cb);
const pending = (slot: Slot) => queued.has(slot) || (!!running && lastTried?.[0] === slot);

onVault(async (m) => {
  if (m.type !== "saved" || !session || m.kid !== session.kid || pending(m.slot)) return;
  const text = await readSlot(m.slot, session.key).catch(() => null);
  if (text !== null && !pending(m.slot)) readers[m.slot]?.(text);
});

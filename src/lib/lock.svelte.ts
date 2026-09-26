// the passcode lock. with a passcode, this browser's key is kept locked by it
// (see vault.ts), so nothing saved can be read until it's typed, and the app
// locks itself again after a stretch with no input.
//  - it's one lock for the whole browser: locking locks every PitMaster tab,
//    and unlocking one unlocks the rest (the key goes to them directly, never
//    through storage).
//  - locking reloads each tab, so nothing unlocked is left in memory.
//  - tv windows never lock and never get the key: they show only the game
//    they were given, and nothing on them can change it.
import { openKey } from "./crypto";
import { begin, flush, onVault, openKeeper, post, readKeeper, rekey, session, wipe } from "./vault";
import { getGame, memoryStore, openStore, storeText } from "./store";
import { openSettings, settings, settingsText } from "./settings.svelte";
import { answerWants, flushLive } from "./sync";

/**
 * open: unlocked and saving, encrypted.
 * memory: this page can't encrypt (plain http), so nothing is saved.
 * unreadable: there's saved data this browser's key can't open.
 * locked: a passcode is set and hasn't been typed.
 */
export type VaultState = "open" | "memory" | "unreadable" | "locked";

export const vault = $state({ state: "open" as VaultState, passcode: false });

/** the key it locks sits in this browser's files, so a copy of them can be
 *  guessed at offline: short passcodes fall fast even at 600k rounds */
export const MIN_PASSCODE = 8;

/** a tv screen: never locked, never given the key */
export const isDisplay = () => /\/tv\/?$/.test(location.pathname);

/** open what's saved, as far as it can be without the passcode. the root layout waits for this. */
export async function startVault() {
  const k = await openKeeper();
  if (!k) {
    memoryStore();
    answerWants(getGame);
    vault.state = "memory";
    return;
  }
  vault.passcode = "lock" in k;
  if ("key" in k) return openWith(k.kid, k.key);
  vault.state = "locked";
  // another tab of this browser may already be unlocked
  if (!isDisplay()) post({ type: "key?" });
}

async function openWith(kid: string, key: CryptoKey) {
  if (!(await openStore(key))) {
    vault.state = "unreadable";
    return;
  }
  await openSettings(key);
  // a tv window reads its game once and hears the rest from the dealer's tab:
  // with no key to save with, it doesn't re-read everything each time that tab saves
  if (!isDisplay()) begin({ kid, key });
  answerWants(getGame);
  lastActive = Date.now();
  vault.state = "open";
}

// ---------- unlocking ----------
// wrong passcodes are counted, and after five each try waits longer, up to 15
// minutes. the count is kept in plain storage so a reload doesn't reset it
// (it says nothing but how many tries and until when).

const TRIES = "pitmaster.tries";

function tries(): { n: number; until: number } {
  try {
    return { n: 0, until: 0, ...JSON.parse(localStorage.getItem(TRIES) ?? "{}") };
  } catch {
    return { n: 0, until: 0 };
  }
}

/** ms until the passcode can be tried again (0 = now) */
export const waitLeft = () => Math.max(0, tries().until - Date.now());

function missed() {
  const t = tries();
  t.n++;
  if (t.n >= 5) t.until = Date.now() + Math.min(30_000 * 2 ** (t.n - 5), 15 * 60_000);
  try {
    localStorage.setItem(TRIES, JSON.stringify(t));
  } catch {}
}

/** try a passcode. true if it opened; other locked tabs open too. */
export async function unlock(passcode: string) {
  if (waitLeft()) return false;
  const k = await readKeeper();
  if (!k || "key" in k) {
    location.reload(); // the lock was turned off in another tab
    return false;
  }
  let key: CryptoKey;
  try {
    key = await openKey(k.lock, passcode);
  } catch {
    missed();
    return false;
  }
  try {
    localStorage.removeItem(TRIES);
  } catch {}
  await openWith(k.kid, key);
  post({ type: "key", kid: k.kid, key });
  return true;
}

// ---------- locking ----------

let locking = false;

/** lock every PitMaster tab in this browser now (tv windows keep going) */
export async function lockNow() {
  post({ type: "lock" });
  await lockHere();
}

async function lockHere() {
  if (locking) return;
  locking = true;
  answerWants(null);
  vault.state = "locked"; // off the screen right away
  await flush(); // every save lands first
  await flushLive();
  location.reload(); // and nothing unlocked stays in memory
}

onVault(async (m) => {
  if (isDisplay()) return;
  if (m.type === "rekey") location.reload();
  else if (m.type === "lock") await lockHere();
  else if (m.type === "active") lastActive = Date.now();
  else if (m.type === "key?" && vault.state === "open" && session && !locking) post({ type: "key", kid: session.kid, key: session.key });
  else if (m.type === "key" && vault.state === "locked" && !locking && (await readKeeper())?.kid === m.kid) await openWith(m.kid, m.key);
});

// ---------- auto-lock ----------
// any click, tap, key, scroll or pointer move in any PitMaster tab counts

let lastActive = Date.now();
let lastSaid = 0;

function poke() {
  lastActive = Date.now();
  if (lastActive - lastSaid > 2000) {
    lastSaid = lastActive;
    post({ type: "active" });
  }
}

function check() {
  if (vault.state !== "open" || !vault.passcode || !settings.autoLock) return;
  if (Date.now() - lastActive >= settings.autoLock * 1000) void lockNow();
}

const INPUT = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "scroll"] as const;

/** count input in this tab and lock after the auto-lock time without any. returns stop. */
export function watchIdle() {
  lastActive = Date.now();
  for (const e of INPUT) addEventListener(e, poke, { capture: true, passive: true });
  // timers slow down in background tabs, and stop while the computer sleeps
  document.addEventListener("visibilitychange", check);
  const t = setInterval(check, 1000);
  return () => {
    for (const e of INPUT) removeEventListener(e, poke, { capture: true });
    document.removeEventListener("visibilitychange", check);
    clearInterval(t);
  };
}

// ---------- the passcode ----------

/**
 * turn the lock on, change the passcode, or turn it off (next = null).
 * everything's sealed again under a new key either way. throws "wrong" if
 * `current` isn't the passcode.
 */
export async function setPasscode(next: string | null, current = "") {
  const k = await readKeeper();
  if (k && "lock" in k) await openKey(k.lock, current).catch(() => Promise.reject(new Error("wrong")));
  await rekey(next, { data: storeText(), settings: settingsText() });
  vault.passcode = !!next;
  lastActive = Date.now();
}

/** delete everything saved in this browser, key and all, and start fresh */
export async function forgetAll() {
  await wipe();
  // and the little that's kept unencrypted: the look, the passcode tries
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith("pitmaster.")) localStorage.removeItem(k);
  } catch {}
  location.reload();
}

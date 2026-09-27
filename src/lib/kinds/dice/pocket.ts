// a phone's own numbers for the round, kept so a reload doesn't lose the cup:
// sealed in IndexedDB with a key made here that no script can read out (the
// same way the vault keeps this browser's key). nothing is kept in plain text,
// and a new round replaces the last.
import { newKey, seal, unseal } from "$lib/crypto";

export interface Roll {
  round: number;
  nums: number[];
  salt: string;
  commit: string;
}

let conn: Promise<IDBDatabase> | undefined;
function db() {
  return (conn ??= new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open("pitmaster-cup", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("cup");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }).catch((e) => {
    conn = undefined;
    throw e;
  }));
}

async function get<T>(name: string): Promise<T | undefined> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const r = d.transaction("cup", "readonly").objectStore("cup").get(name);
    r.onsuccess = () => resolve(r.result as T | undefined);
    r.onerror = () => reject(r.error);
  });
}

async function put(name: string, value: unknown) {
  const d = await db();
  return new Promise<void>((resolve, reject) => {
    const tx = d.transaction("cup", "readwrite");
    tx.objectStore("cup").put(value, name);
    tx.oncomplete = () => resolve();
    tx.onerror = tx.onabort = () => reject(tx.error);
  });
}

/** this phone's key for its cup: made once, never readable */
async function key() {
  const k = await get<CryptoKey>("key");
  if (k) return k;
  const made = await newKey();
  await put("key", made);
  return made;
}

/** keep this seat's roll for the round */
export async function keepRoll(slot: string, roll: Roll) {
  await put(`roll:${slot}`, await seal(await key(), JSON.stringify(roll)));
}

/** this seat's roll, if one was kept */
export async function readRoll(slot: string): Promise<Roll | null> {
  const sealed = await get<string>(`roll:${slot}`).catch(() => undefined);
  if (!sealed) return null;
  try {
    return JSON.parse(await unseal(await key(), sealed)) as Roll;
  } catch {
    return null;
  }
}

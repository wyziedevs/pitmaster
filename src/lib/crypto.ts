// everything PitMaster keeps is encrypted first, in the browser, with
// WebCrypto's AES-256-GCM. there are three kinds of key:
//  - this browser's: made at random on the first visit, and it locks what's
//    saved on this device (see vault.ts). it can be used but never read out
//    by any script. with a passcode set, it's kept locked by the passcode.
//  - a tv code's: made from the code, so the server stores games it can't
//    read. the code itself never leaves the screens that know it.
//  - a password's: for an export file, when one is set.
// browsers only offer WebCrypto on https pages (and localhost). without it
// nothing gets saved at all, rather than saved readable.

const te = new TextEncoder();
const td = new TextDecoder();

/** false on plain-http pages (other than localhost), where browsers switch WebCrypto off */
export const canEncrypt = () => typeof crypto !== "undefined" && !!crypto.subtle;

// ---------- bytes ----------

function b64(bytes: Uint8Array) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function unb64(s: string) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
const random = (n: number) => crypto.getRandomValues(new Uint8Array(n));

/** a random url-safe string, for secrets like a tv code's write key */
export const token = (bytes = 32) => b64(random(bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function squeeze(bytes: Uint8Array, through: CompressionStream | DecompressionStream) {
  const out = new Blob([bytes as Uint8Array<ArrayBuffer>]).stream().pipeThrough(through);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

// ---------- sealing ----------
// a sealed string is "pm1.<z or p>.<iv>.<ciphertext>": z when the text was
// gzipped before it was encrypted, p when it wasn't.

/**
 * encrypt text. `zip` gzips it first, which roughly quarters saved data; tv
 * snapshots skip it, since an older tv browser may not be able to unzip.
 */
export async function seal(key: CryptoKey, text: string, zip = false) {
  let bytes = te.encode(text);
  const z = zip && typeof CompressionStream !== "undefined";
  if (z) bytes = await squeeze(bytes, new CompressionStream("gzip"));
  const iv = random(12);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, bytes));
  return `pm1.${z ? "z" : "p"}.${b64(iv)}.${b64(ct)}`;
}

/** decrypt what seal made. throws if the key is wrong or a single bit was changed. */
export async function unseal(key: CryptoKey, sealed: string) {
  const [v, z, iv, ct] = sealed.split(".");
  if (v !== "pm1" || !iv || !ct) throw new Error("not sealed");
  let bytes = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, key, unb64(ct)));
  if (z === "z") bytes = await squeeze(bytes, new DecompressionStream("gzip"));
  return td.decode(bytes);
}

// ---------- this browser's key ----------

/** a new key for what's saved here: usable, never readable */
export const newKey = () => crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);

/** a key locked with a passcode: what turns the passcode into the key that locks it, and the key, locked */
export interface KeyLock {
  salt: Uint8Array<ArrayBuffer>;
  rounds: number;
  iv: Uint8Array<ArrayBuffer>;
  locked: ArrayBuffer;
}

const unwrap = (l: KeyLock, wrapper: CryptoKey) =>
  crypto.subtle.unwrapKey("raw", l.locked, wrapper, { name: "AES-GCM", iv: l.iv }, "AES-GCM", false, ["encrypt", "decrypt"]);

/**
 * a new key, and the same key locked with a passcode (kept in its place). the
 * key is readable only for as long as it takes to lock it, and only inside
 * WebCrypto; what comes back can't be read out.
 */
export async function lockedKey(passcode: string) {
  const salt = random(16);
  const iv = random(12);
  const wrapper = await passwordKey(passcode, salt, ROUNDS, ["wrapKey", "unwrapKey"]);
  const loose = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const lock: KeyLock = { salt, rounds: ROUNDS, iv, locked: await crypto.subtle.wrapKey("raw", loose, wrapper, { name: "AES-GCM", iv }) };
  return { key: await unwrap(lock, wrapper), lock };
}

/** the key a passcode locked. throws if the passcode is wrong. */
export async function openKey(l: KeyLock, passcode: string) {
  return unwrap(l, await passwordKey(passcode, l.salt, l.rounds, ["wrapKey", "unwrapKey"]));
}

// ---------- tv codes ----------

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I/L to mix up
export const CODE_LENGTH = 8;

/** a new tv code: 8 characters, one of about 850 billion. the relay only ever
 *  sees what one slow hash makes of it, and at this length trying them all
 *  is years of work, not a night's */
export function newCode() {
  let code = "";
  while (code.length < CODE_LENGTH) {
    const [b] = random(1);
    // 248 is 8 × 31: dropping the bytes above it keeps every character equally likely
    if (b < 248) code += CODE_CHARS[b % CODE_CHARS.length];
  }
  return code;
}

/** what someone typed, as a code: capitals, no spaces or dashes */
export const cleanCode = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

/** a code the way it's shown, split in two so it's easy to read out: "ABCD 2345" */
export const showCode = (code: string) => `${code.slice(0, CODE_LENGTH / 2)} ${code.slice(CODE_LENGTH / 2)}`;

const codes = new Map<string, Promise<{ id: string; key: CryptoKey }>>();

/**
 * a code's id (how the server finds the game) and key (what locks it). both
 * come out of one slow hash of the code, so the server, which only ever sees
 * the id, can't get back to the code or the key short of guessing codes one
 * slow hash at a time.
 */
export function codeKeys(code: string) {
  let p = codes.get(code);
  if (!p) {
    p = (async () => {
      const base = await crypto.subtle.importKey("raw", te.encode(code), "PBKDF2", false, ["deriveBits"]);
      const params = { name: "PBKDF2", hash: "SHA-256", salt: te.encode("pitmaster tv code"), iterations: 200_000 };
      const bits = new Uint8Array(await crypto.subtle.deriveBits(params, base, 512));
      const key = await crypto.subtle.importKey("raw", bits.slice(32), "AES-GCM", false, ["encrypt", "decrypt"]);
      return { id: hex(bits.slice(0, 16)), key };
    })();
    p.catch(() => codes.delete(code));
    codes.set(code, p);
  }
  return p;
}

// ---------- passwords (export files and the passcode) ----------

const ROUNDS = 600_000;

/** text locked with a password: the salt and rounds that turn it into the key, and the sealed text */
export interface Locked {
  salt: string;
  rounds: number;
  data: string;
}

async function passwordKey(password: string, salt: Uint8Array<ArrayBuffer>, rounds: number, uses: KeyUsage[] = ["encrypt", "decrypt"]) {
  const base = await crypto.subtle.importKey("raw", te.encode(password.normalize("NFKC")), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations: rounds }, base, { name: "AES-GCM", length: 256 }, false, uses);
}

export async function lockText(text: string, password: string): Promise<Locked> {
  const salt = random(16);
  return { salt: b64(salt), rounds: ROUNDS, data: await seal(await passwordKey(password, salt, ROUNDS), text, true) };
}

/** throws if the password is wrong (or the file was changed) */
export async function unlockText(l: Locked, password: string) {
  // a file asking for billions of rounds would hang the tab
  if (!(l.rounds >= 1 && l.rounds <= 10_000_000)) throw new Error("bad rounds");
  return unseal(await passwordKey(password, unb64(l.salt), l.rounds), l.data);
}

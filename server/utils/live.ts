// a tv code session. the code itself never reaches the server: the host's
// browser turns it into an id (to find the game) and a key (to lock it), and
// sends only the id and the locked game. nothing stored here can be read.
import type { H3Event } from "h3";

export interface LiveRecord {
  /**
   * sha-256 of the host's write key (the key itself is never stored). blank
   * once the host stops sharing: the game is gone, and the blank record holds
   * the code until it expires, so no one else can take it over and put
   * something on a tv that still has it open.
   */
  keyHash: string;
  /** the game, encrypted in the host's browser (null until the first update) */
  data: string | null;
  updatedAt: number;
}

const TTL = 60 * 60 * 24 * 2; // copies are deleted 2 days after their last update
const MAX_BODY = 1_000_000; // bytes; a big tournament's snapshot is well under this

export const liveStorage = () => useStorage<LiveRecord>("live");

/** a wrong code or key. each one counts toward the address's limit (see middleware/limit.ts) */
export function missing(event: H3Event, statusCode = 404) {
  count(event, "miss");
  return createError({ statusCode, statusMessage: statusCode === 403 ? "wrong key" : "no game with that code" });
}

/** sharing stopped: the tv can stop asking */
export const stopped = () => createError({ statusCode: 410, statusMessage: "the host stopped sharing" });

/** the id in the url: 32 hex characters, or it can't be one of ours */
export function liveId(event: H3Event) {
  const id = getRouterParam(event, "id") ?? "";
  if (!/^[0-9a-f]{32}$/.test(id)) throw missing(event);
  return id;
}

export async function hashKey(key: string) {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key)));
  return Array.from(d, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const isKey = (k: unknown): k is string => typeof k === "string" && /^[A-Za-z0-9_-]{32,128}$/.test(k);

/** the record for this id, if the request carries its write key */
export async function ownLive(event: H3Event, id: string) {
  const rec = await liveStorage().getItem(id);
  if (!rec) throw missing(event);
  if (!rec.keyHash) throw stopped();
  const key = getHeader(event, "x-live-key");
  if (!isKey(key) || !same(await hashKey(key), rec.keyHash)) throw missing(event, 403);
  return rec;
}

/** compare two hashes in the same time whatever they hold */
function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** the json body, refused when it's oversized */
export async function smallBody<T>(event: H3Event) {
  if (Number(getHeader(event, "content-length") || 0) > MAX_BODY) throw createError({ statusCode: 413, statusMessage: "too big" });
  const raw = (await readRawBody(event)) ?? "";
  if (raw.length > MAX_BODY) throw createError({ statusCode: 413, statusMessage: "too big" });
  try {
    return JSON.parse(raw) as Partial<T>;
  } catch {
    throw createError({ statusCode: 400, statusMessage: "not json" });
  }
}

/** a snapshot as the host's browser sealed it (see src/lib/crypto.ts): version, zip flag, 12-byte iv, ciphertext */
export const isSealed = (s: unknown): s is string => typeof s === "string" && /^pm1\.[pz]\.[A-Za-z0-9+/]{16}\.[A-Za-z0-9+/]+=*$/.test(s);

export async function putLive(id: string, record: LiveRecord) {
  await liveStorage().setItem(id, record, { ttl: TTL });
}

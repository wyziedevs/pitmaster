// a tv code session. the code itself never reaches the server: the host's
// browser turns it into an id (to find the game) and a key (to lock it), and
// sends only the id and the locked game. nothing stored here can be read.
// (who may read and write what is utils/relay.ts)
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

/** a seat's mailbox: what that phone last sent, sealed with the game's key on the phone */
export interface SeatMail {
  data: string;
  updatedAt: number;
}

/** a seat's mailbox, with the seat it's for */
export type Mailbox = SeatMail & { seat: string };

const TTL = 60 * 60 * 24 * 2; // copies are deleted 2 days after their last update
export const MAX_BODY = 1_000_000; // bytes; a big tournament's snapshot is well under this

export const liveStorage = () => useStorage<LiveRecord>("live");
const mailStorage = () => useStorage<SeatMail>("live");
/**
 * phones as dice cups: sha-256 of each seat's write key, by seat id (the keys
 * themselves are never stored), so a phone can write to its own mailbox and no
 * one else's. kept apart from the game ("h:<id>"), so the host's snapshots
 * and its seats never race for the same record
 */
const seatsStorage = () => useStorage<Record<string, string>>("live");
export const getSeats = async (id: string) => (await seatsStorage().getItem(`h:${id}`)) ?? {};
export const putSeats = (id: string, seats: Record<string, string>) => seatsStorage().setItem(`h:${id}`, seats, { ttl: TTL });

/** a seat's mailbox: "s:<id>:<seat>" (apart from the games, which are bare ids) */
const mailKey = (id: string, seat: string) => `s:${id}:${seat}`;

/** a game's id: 32 hex characters, made from its code in the host's browser */
export const isLiveId = (s: unknown): s is string => typeof s === "string" && /^[0-9a-f]{32}$/.test(s);

/** a seat id: 16 url-safe characters, made by the host */
export const isSeat = (s: unknown): s is string => typeof s === "string" && /^[A-Za-z0-9_-]{16}$/.test(s);

export async function putMail(id: string, seat: string, data: string): Promise<SeatMail> {
  const mail = { data, updatedAt: Date.now() };
  await mailStorage().setItem(mailKey(id, seat), mail, { ttl: TTL });
  return mail;
}

/** every seat's mailbox for a game */
export async function allMail(id: string): Promise<Mailbox[]> {
  const keys = await mailStorage().getKeys(`s:${id}`);
  const all = await Promise.all(
    keys.map(async (k) => {
      const seat = k.split(":").at(-1)!;
      const m = isSeat(seat) ? await mailStorage().getItem(k) : null;
      return m && { seat, ...m };
    })
  );
  return all.filter((m) => m !== null);
}

/** stop sharing takes the mailboxes (and the seats) too */
export async function dropMail(id: string) {
  const keys = await mailStorage().getKeys(`s:${id}`);
  await Promise.all([...keys.map((k) => mailStorage().removeItem(k)), seatsStorage().removeItem(`h:${id}`)]);
}

/** a seat's own key, checked against the hash the host left for it in `seats` */
export async function ownSeat(seats: Record<string, string>, seat: string, key: unknown) {
  const hash = seats[seat];
  return !!hash && isKey(key) && same(await hashKey(key), hash);
}

/** the seats a host may name: up to 40, each an id and a sha-256 */
export const isSeats = (s: unknown): s is Record<string, string> =>
  isPlain(s) && Object.keys(s).length <= 40 && Object.entries(s).every(([k, h]) => isSeat(k) && typeof h === "string" && /^[0-9a-f]{64}$/.test(h));

export async function hashKey(key: string) {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key)));
  return Array.from(d, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const isKey = (k: unknown): k is string => typeof k === "string" && /^[A-Za-z0-9_-]{32,128}$/.test(k);

/** compare two hashes in the same time whatever they hold */
export function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** a json object (not null, not an array): what every body and socket message has to be */
export const isPlain = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

const tooBig = () => createError({ statusCode: 413, statusMessage: "too big" });

/** the raw body, refused when it's oversized (by its header first, before it's read into memory) */
export async function readSmallRaw(event: H3Event) {
  if (Number(getHeader(event, "content-length") || 0) > MAX_BODY) throw tooBig();
  const raw = await readRawBody(event, false);
  if (raw && raw.byteLength > MAX_BODY) throw tooBig();
  return raw;
}

/** the json body, refused when it's oversized or isn't an object */
export async function smallBody<T>(event: H3Event) {
  const raw = await readSmallRaw(event);
  let body: unknown = null;
  try {
    body = JSON.parse(raw ? new TextDecoder().decode(raw) : "");
  } catch {}
  if (!isPlain(body)) throw createError({ statusCode: 400, statusMessage: "not json" });
  return body as { [K in keyof T]?: unknown };
}

/** a snapshot as the host's browser sealed it (see src/lib/crypto.ts): version, zip flag, 12-byte iv, ciphertext */
export const isSealed = (s: unknown): s is string => typeof s === "string" && /^pm1\.[pz]\.[A-Za-z0-9+/]{16}\.[A-Za-z0-9+/]+=*$/.test(s);

/** a phone's mailbox: a hash, then a few numbers, sealed. far smaller than a snapshot */
export const isMail = (s: unknown): s is string => isSealed(s) && s.length <= 4096;

export async function putLive(id: string, record: LiveRecord) {
  await liveStorage().setItem(id, record, { ttl: TTL });
}

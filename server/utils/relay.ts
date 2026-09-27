// the relay's reads and writes, the same whether they came over http
// (api/live/**) or down a websocket (routes/api/live/socket.ts). each checks
// who's asking and answers with what happened; the caller turns a refusal into
// an http error or a socket's {t:"err"}. a wrong code or key counts toward the
// address's limit (see middleware/limit.ts) whichever way it came.
import type { H3Event } from "h3";
import type { Peer } from "crossws";

type From = H3Event | Peer;
export type Fail = { ok: false; status: number; why: string };
export type Result<T extends object = object> = ({ ok: true } & T) | Fail;

const fail = (status: number, why: string): Fail => ({ ok: false, status, why });

/** a wrong code or key: this is what guessing looks like, so it counts */
function miss(from: From, status: 403 | 404) {
  const ip = ipOf(from);
  if (ip) count(ip, "miss");
  return fail(status, status === 403 ? "wrong key" : "no game with that code");
}

/** the record, while it's still shared (a stopped one has a blank key hash) */
function shared(from: From, rec: LiveRecord | null): Result<{ rec: LiveRecord }> {
  if (!rec) return miss(from, 404);
  if (!rec.keyHash) return fail(410, "the host stopped sharing");
  return { ok: true, rec };
}

/** the record, if `key` is its host's write key */
async function asHost(from: From, id: string, key: unknown): Promise<Result<{ rec: LiveRecord }>> {
  const r = shared(from, await liveStorage().getItem(id));
  if (r.ok && !(isKey(key) && same(await hashKey(key), r.rec.keyHash))) return miss(from, 403);
  return r;
}

// one write at a time per game, so one that read the record before a stop
// can't write the old key back and bring the game back
const locks = new Map<string, Promise<unknown>>();
function withLock<T>(id: string, fn: () => Promise<T>) {
  const run = (locks.get(id) ?? Promise.resolve()).then(fn);
  const done = run.then(() => {}, () => {});
  locks.set(id, done);
  void done.then(() => locks.get(id) === done && locks.delete(id));
  return run;
}

/** a new game: the id made from its code, and the host's write key (kept hashed) */
export async function startLive(id: unknown, key: unknown): Promise<Result> {
  if (!isLiveId(id) || !isKey(key)) return fail(400, "bad id or key");
  return withLock(id, async (): Promise<Result> => {
    if (await liveStorage().hasItem(id)) return fail(409, "code taken");
    await putLive(id, { keyHash: await hashKey(key), data: null, updatedAt: Date.now() });
    return { ok: true };
  });
}

/** a game for a screen, and with `withMail` every seat's mailbox too */
export async function readLive(from: From, id: string, withMail = false): Promise<Result<{ rec: LiveRecord; mail: Mailbox[] }>> {
  const [rec, mail] = await Promise.all([liveStorage().getItem(id), withMail ? allMail(id) : []]);
  const r = shared(from, rec);
  return r.ok ? { ...r, mail } : r;
}

/** the host: its latest snapshot, for everyone following */
export const putSnapshot = (from: From, id: string, key: unknown, data: unknown) =>
  withLock(id, async (): Promise<Result<{ at: number }>> => {
    const r = await asHost(from, id, key);
    if (!r.ok) return r;
    if (!isSealed(data)) return fail(400, "missing game");
    const at = Date.now();
    await putLive(id, { ...r.rec, data, updatedAt: at });
    push(from, id, { t: "snap", id, data, at });
    return { ok: true, at };
  });

/** the host: the seats phones may write to, by the sha-256 of each one's key */
export const putSeatHashes = (from: From, id: string, key: unknown, seats: unknown) =>
  withLock(id, async (): Promise<Result> => {
    const r = await asHost(from, id, key);
    if (!r.ok) return r;
    if (!isSeats(seats)) return fail(400, "bad seats");
    await putSeats(id, seats);
    return { ok: true };
  });

/** a phone: its own seat's mailbox, with that seat's own key */
export const putSeatMail = (from: From, id: string, seat: unknown, key: unknown, data: unknown) =>
  withLock(id, async (): Promise<Result<{ at: number }>> => {
    const [rec, seats] = await Promise.all([liveStorage().getItem(id), getSeats(id)]);
    const r = shared(from, rec);
    if (!r.ok) return r;
    if (!isSeat(seat) || !(await ownSeat(seats, seat, key))) return miss(from, 403);
    if (!isMail(data)) return fail(400, "missing mail");
    const mail = await putMail(id, seat, data);
    push(from, id, { t: "seat", id, seat, data: mail.data, at: mail.updatedAt });
    return { ok: true, at: mail.updatedAt };
  });

/**
 * the host stops sharing: the game and its mailboxes go now, not two days
 * from the last update. a blank record keeps the code taken until it would
 * have expired
 */
export const stopLive = (from: From, id: string, key: unknown) =>
  withLock(id, async (): Promise<Result> => {
    const r = await asHost(from, id, key);
    if (!r.ok) return r;
    await Promise.all([putLive(id, { keyHash: "", data: null, updatedAt: Date.now() }), dropMail(id)]);
    push(from, id, { t: "gone", id });
    return { ok: true };
  });

const toError = (f: Fail) => createError({ statusCode: f.status, statusMessage: f.why });

/** over http: the answer, or the error a refusal is thrown as */
export function orThrow<T extends object>(r: Result<T>) {
  if (!r.ok) throw toError(r);
  return r;
}

/** the id in the url: 32 hex characters, or it can't be one of ours (which counts, like any wrong code) */
export function liveId(event: H3Event) {
  const id = getRouterParam(event, "id");
  if (!isLiveId(id)) throw toError(miss(event, 404));
  return id;
}

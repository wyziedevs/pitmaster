// a rough speed limit per address, counted in memory for a minute at a time
// and never stored or logged. each worker instance keeps its own counts, so
// this slows one noisy address down; a cloudflare rate limiting rule is the
// real guard (see README).
import type { H3Event } from "h3";
import type { Peer } from "crossws";

const MINUTE = 60_000;
const counts = new Map<string, { n: number; until: number }>();

/** how many of each an address may do in a minute */
export const LIMITS = {
  // a room full of tvs behind one address polls every 2 seconds each
  any: 3000,
  // wrong codes and wrong keys: this is what guessing looks like
  miss: 120,
  new: 20,
  socket: 60,
} as const;

/**
 * the address a request or a websocket came from. cloudflare sets
 * cf-connecting-ip itself, so a client can't fake it. a socket's is gone once
 * the durable object has slept, and there's none in dev: then it's blank
 */
export const ipOf = (who: H3Event | Peer) =>
  "publish" in who ? ((who.request as Request | undefined)?.headers?.get?.("cf-connecting-ip") ?? "") : getHeader(who, "cf-connecting-ip") || getRequestIP(who) || "unknown";

// by a request, or (for a websocket, which has none) by its address
function tally(who: H3Event | string, kind: string) {
  const k = `${kind} ${typeof who === "string" ? who : ipOf(who)}`;
  const now = Date.now();
  let c = counts.get(k);
  if (!c || c.until <= now) {
    if (counts.size > 50_000) for (const [x, v] of counts) if (v.until <= now) counts.delete(x);
    c = { n: 0, until: now + MINUTE };
    counts.set(k, c);
  }
  return c;
}

/** refuse the request once this address has done `kind` its limit's worth this minute */
export function slowDown(event: H3Event, kind: keyof typeof LIMITS) {
  const c = tally(event, kind);
  if (c.n < LIMITS[kind]) return;
  setResponseHeader(event, "Retry-After", Math.ceil((c.until - Date.now()) / 1000));
  throw createError({ statusCode: 429, statusMessage: "too many requests" });
}

/** count one `kind` for this address */
export function count(who: H3Event | string, kind: keyof typeof LIMITS) {
  tally(who, kind).n++;
}

/** whether this address has used up `kind` this minute (for a websocket, which can't be answered 429) */
export const tooMany = (ip: string, kind: keyof typeof LIMITS) => tally(ip, kind).n >= LIMITS[kind];

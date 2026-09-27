// a rough speed limit per address, counted in memory for a minute at a time
// and never stored or logged. each worker instance keeps its own counts, so
// this slows one noisy address down; a cloudflare rate limiting rule is the
// real guard (see README).
import type { H3Event } from "h3";

const MINUTE = 60_000;
const counts = new Map<string, { n: number; until: number }>();

/** the address a request came from. cloudflare sets cf-connecting-ip itself, so a client can't fake it */
export const ipOf = (event: H3Event) => getHeader(event, "cf-connecting-ip") || getRequestIP(event) || "unknown";

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

/** refuse the request once this address has done `kind` `max` times this minute */
export function slowDown(event: H3Event, kind: string, max: number) {
  const c = tally(event, kind);
  if (c.n < max) return;
  setResponseHeader(event, "Retry-After", String(Math.ceil((c.until - Date.now()) / 1000)));
  throw createError({ statusCode: 429, statusMessage: "too many requests" });
}

/** count one `kind` for this address */
export function count(who: H3Event | string, kind: string) {
  tally(who, kind).n++;
}

/** whether this address has done `kind` `max` times this minute (for a websocket, which can't be answered 429) */
export const tooMany = (ip: string, kind: string, max: number) => tally(ip, kind).n >= max;

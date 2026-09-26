// a rough speed limit per address, counted in memory for a minute at a time
// and never stored or logged. each worker instance keeps its own counts, so
// this slows one noisy address down; a cloudflare rate limiting rule is the
// real guard (see README).
import type { H3Event } from "h3";

const MINUTE = 60_000;
const counts = new Map<string, { n: number; until: number }>();

function tally(event: H3Event, kind: string) {
  // cloudflare sets cf-connecting-ip itself, so a client can't fake it
  const ip = getHeader(event, "cf-connecting-ip") || getRequestIP(event) || "unknown";
  const k = `${kind} ${ip}`;
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
export function count(event: H3Event, kind: string) {
  tally(event, kind).n++;
}

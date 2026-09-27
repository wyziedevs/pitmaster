// one websocket per screen, instead of every tv and phone asking every two
// seconds. a screen follows a game by its id; the host sends its snapshots
// down its own socket, and each phone sends its mailbox down its. everything
// that comes through is sealed in a browser: this only ever sees ids, keys
// and ciphertext. kv still keeps every snapshot and mailbox, so a screen that
// joins (or a tv that can't hold a socket) gets the latest. the reads and
// writes themselves are utils/relay.ts, the same as over http.
import type { Peer } from "crossws";
import type { ServerMsg } from "../../../../src/lib/protocol";

// a screen follows its own game (a host maybe a few), and sends a few messages a second at most
const MAX_FOLLOWS = 8;
const MAX_MESSAGES = 300; // a minute
// games that aren't there a socket may ask after before it's closed: this is what guessing codes looks like
const MAX_MISSES = 3;
// closing codes the screen backs off from for a while (src/lib/socket.ts)
const MISSES = 4008;
const FLOOD = 4029;

const send = (peer: Peer, msg: ServerMsg) => void peer.send(JSON.stringify(msg));

/** what's counted on a socket (kept in memory, like the speed limits) */
const tally = (peer: Peer) => peer.context as { misses?: number; sent?: number; until?: number };

/** a message as it came: a json object, every field still to be checked */
function parse(text: string) {
  try {
    const m: unknown = JSON.parse(text);
    return isPlain(m) ? m : null;
  } catch {
    return null;
  }
}

/** a write's answer, numbered as the sender numbered it so it knows which one landed */
function answer(peer: Peer, id: string, n: number | undefined, r: Result<{ at?: number }>) {
  send(peer, r.ok ? { t: "ok", id, at: r.at, n } : { t: "err", why: r.why, id, n, status: r.status });
}

async function follow(peer: Peer, id: string) {
  if (!peer.topics.has(id) && peer.topics.size >= MAX_FOLLOWS) return send(peer, { t: "err", why: "too many", id });
  addFollower(peer, id);
  const r = await readLive(peer, id, true);
  if (!r.ok) {
    if (r.status === 410) return send(peer, { t: "gone", id });
    // no game with that id (or not yet: a new code takes a while to reach
    // every server, so it's still followed). it counted as a wrong code
    const c = tally(peer);
    c.misses = (c.misses ?? 0) + 1;
    if (c.misses > MAX_MISSES) return peer.close(MISSES, "too many misses");
    return send(peer, { t: "none", id });
  }
  if (r.rec.data) send(peer, { t: "snap", id, data: r.rec.data, at: r.rec.updatedAt });
  for (const m of r.mail) send(peer, { t: "seat", id, seat: m.seat, data: m.data, at: m.updatedAt });
}

export default defineWebSocketHandler({
  // only the site's own pages may open one (a websocket isn't covered by cors).
  // in dev anything reaching this computer through vite is the site itself (a tunnel too)
  // (import.meta.dev is fixed when it's built, so a deployed worker always checks)
  upgrade(request) {
    if (!import.meta.dev && !isSite(request.headers.get("origin"))) return new Response("forbidden", { status: 403 });
    // the speed limits (see middleware/limit.ts): new sockets, and none at all
    // for an address that's been guessing codes
    const ip = request.headers.get("cf-connecting-ip");
    if (!ip) return;
    if (tooMany(ip, "miss") || tooMany(ip, "socket")) return new Response("too many requests", { status: 429 });
    count(ip, "socket");
  },

  async message(peer, message) {
    // a socket that floods is closed
    const c = tally(peer);
    const now = Date.now();
    if (!c.until || c.until <= now) Object.assign(c, { sent: 0, until: now + 60_000 });
    c.sent = (c.sent ?? 0) + 1;
    if (c.sent > MAX_MESSAGES) return peer.close(FLOOD, "too many messages");
    // and one from an address that's been guessing (over http it'd get 429s)
    const ip = ipOf(peer);
    if (ip && tooMany(ip, "miss")) return peer.close(MISSES, "too many misses");

    const text = message.text();
    if (text.length > MAX_BODY) return send(peer, { t: "err", why: "too big" });
    const m = parse(text);
    if (!m) return send(peer, { t: "err", why: "not json" });
    const n = typeof m.n === "number" && Number.isSafeInteger(m.n) ? m.n : undefined;
    if (!isLiveId(m.id)) return send(peer, { t: "err", why: "bad id", n });
    const id = m.id;

    switch (m.t) {
      // a tv, a phone, or the host: follow this game, or stop
      case "follow":
        return follow(peer, id);
      case "unfollow":
        return dropFollower(peer, id);
      // the host: its latest snapshot, for everyone following
      case "put":
        return answer(peer, id, n, await putSnapshot(peer, id, m.key, m.data));
      // the host: the seats phones may write to, by the hash of each one's key
      case "seats":
        return answer(peer, id, n, await putSeatHashes(peer, id, m.key, m.seats));
      // a phone: what it has to say this round (a hash, then its numbers), sealed
      case "seat":
        return answer(peer, id, n, await putSeatMail(peer, id, m.seat, m.key, m.data));
    }
    send(peer, { t: "err", why: "unknown", n });
  },

  close(peer) {
    dropFollower(peer);
  },
});

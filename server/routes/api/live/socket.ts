// one websocket per screen, instead of every tv and phone asking every two
// seconds. a screen follows one game by its id; the host sends its snapshots
// down its own socket, and each phone sends its mailbox down its. everything
// that comes through is sealed in a browser: this only ever sees ids, key
// hashes and ciphertext. kv still keeps every snapshot and mailbox, so a
// screen that joins (or a tv that can't hold a socket) gets the latest.
import type { Peer } from "crossws";

const SITE = /^(https:\/\/(pitmaster\.cc|([a-z0-9-]+\.)?pitmaster\.pages\.dev)|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/;
const ID = /^[0-9a-f]{32}$/;
// a snapshot is well under this; anything bigger is turned away
const MAX = 1_000_000;

const send = (peer: Peer, msg: object) => peer.send(JSON.stringify(msg));

async function follow(peer: Peer, id: string) {
  peer.subscribe(id);
  followLocal(id, peer);
  const rec = await liveStorage().getItem(id);
  if (!rec) return send(peer, { t: "none", id });
  if (!rec.keyHash) return send(peer, { t: "gone", id });
  if (rec.data) send(peer, { t: "snap", id, data: rec.data, at: rec.updatedAt });
  for (const m of await allMail(id)) send(peer, { t: "seat", id, seat: m.seat, data: m.data, at: m.updatedAt });
}

/** the record, if `key` is the host's write key for it */
async function owned(id: string, key: unknown) {
  const rec = await liveStorage().getItem(id);
  if (!rec?.keyHash || !isKey(key) || !same(await hashKey(key), rec.keyHash)) return null;
  return rec;
}

export default defineWebSocketHandler({
  // only the site's own pages may open one (a websocket isn't covered by cors).
  // in dev anything reaching this computer through vite is the site itself (a tunnel too)
  upgrade(request) {
    if (import.meta.dev) return;
    const origin = request.headers.get("origin") ?? "";
    if (!SITE.test(origin)) return new Response("forbidden", { status: 403 });
  },

  async message(peer, message) {
    const text = message.text();
    if (text.length > MAX) return send(peer, { t: "err", why: "too big" });
    let m: Record<string, unknown>;
    try {
      m = JSON.parse(text);
    } catch {
      return send(peer, { t: "err", why: "not json" });
    }
    const id = typeof m.id === "string" && ID.test(m.id) ? m.id : null;
    if (!id) return send(peer, { t: "err", why: "bad id" });

    // a tv, a phone, or the host: follow this game
    if (m.t === "follow") return follow(peer, id);

    // the host: its latest snapshot, for everyone following
    if (m.t === "put") {
      const rec = await owned(id, m.key);
      if (!rec) return send(peer, { t: "err", why: "wrong key", id });
      if (!isSealed(m.data)) return send(peer, { t: "err", why: "missing game", id });
      const at = Date.now();
      await putLive(id, { ...rec, data: m.data, updatedAt: at });
      peer.publish(id, JSON.stringify({ t: "snap", id, data: m.data, at }));
      return send(peer, { t: "ok", id, at });
    }

    // the host: the seats phones may write to, by the hash of each one's key
    if (m.t === "seats") {
      if (!(await owned(id, m.key))) return send(peer, { t: "err", why: "wrong key", id });
      if (!isSeats(m.seats)) return send(peer, { t: "err", why: "bad seats", id });
      await putSeats(id, m.seats);
      return send(peer, { t: "ok", id });
    }

    // a phone: what it has to say this round (a hash, then its numbers), sealed
    if (m.t === "seat") {
      const seat = m.seat;
      const rec = await liveStorage().getItem(id);
      if (!rec?.keyHash || !(await ownSeat(id, seat, m.key))) return send(peer, { t: "err", why: "wrong key", id });
      if (!isSealed(m.data)) return send(peer, { t: "err", why: "missing mail", id });
      const mail = await putMail(id, seat as string, m.data);
      const out = JSON.stringify({ t: "seat", id, seat, data: mail.data, at: mail.updatedAt });
      peer.publish(id, out);
      return send(peer, { t: "ok", id, at: mail.updatedAt });
    }
    send(peer, { t: "err", why: "unknown" });
  },

  close(peer) {
    unfollowLocal(peer);
  },
});

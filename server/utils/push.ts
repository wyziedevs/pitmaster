// pushes: every screen following a game gets its new snapshot (and its
// players' mailboxes) the moment the host sends one, over its websocket.
// on cloudflare the sockets live in one durable object, which keeps the game
// each follows on the socket itself (so they survive the object sleeping);
// in dev they're kept here, in memory.
import type { H3Event } from "h3";

interface Follower {
  send: (data: string) => unknown;
}
const local = new Map<string, Set<Follower>>();

export function followLocal(id: string, peer: Follower) {
  let set = local.get(id);
  if (!set) local.set(id, (set = new Set()));
  set.add(peer);
}

export function unfollowLocal(peer: Follower) {
  for (const [id, set] of local) {
    set.delete(peer);
    if (!set.size) local.delete(id);
  }
}

interface DurableSockets {
  ctx: { getWebSockets(): { send(data: string): void; deserializeAttachment(): unknown }[] };
}

/** send `msg` to every socket following game `id` (but not `except`, the one it came from) */
export function push(event: H3Event | null, id: string, msg: object, except?: Follower) {
  const text = JSON.stringify(msg);
  const durable = (event?.context.cloudflare as { durable?: DurableSockets } | undefined)?.durable;
  if (durable) {
    for (const ws of durable.ctx.getWebSockets()) {
      const state = ws.deserializeAttachment() as { t?: Set<string> } | null;
      if (state?.t?.has(id)) ws.send(text);
    }
    return;
  }
  for (const p of local.get(id) ?? []) if (p !== except) p.send(text);
}

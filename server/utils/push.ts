// pushes: every screen following a game gets its new snapshot (and its
// players' mailboxes) the moment the host sends one, over its websocket.
// on cloudflare the sockets live in one durable object, which keeps the game
// each follows on the socket itself (so they survive the object sleeping);
// in dev they're kept here, in memory, too, for the writes that come over http.
import type { H3Event } from "h3";
import type { Peer } from "crossws";
import type { ServerMsg } from "../../src/lib/protocol";

interface DurableSockets {
  ctx: { getWebSockets(): { send(data: string): void; deserializeAttachment(): unknown }[] };
}

/** what nitro's cloudflare-durable preset puts on each request */
export interface CloudflareCtx {
  /** the durable object, when the request is running in it */
  durable?: DurableSockets;
  /** hand the request to the durable object (outside it) */
  durableFetch?: (req?: Request) => Promise<Response>;
}

export const cloudflareOf = (event: H3Event) => event.context.cloudflare as CloudflareCtx | undefined;

const local = new Map<string, Set<Peer>>();

/** `peer` hears game `id` from now on */
export function addFollower(peer: Peer, id: string) {
  peer.subscribe(id);
  if (!import.meta.dev) return;
  let set = local.get(id);
  if (!set) local.set(id, (set = new Set()));
  set.add(peer);
}

/**
 * `peer` stops hearing game `id` (or every game, once it's closed). on
 * cloudflare the socket keeps its own list, which crossws doesn't trim, so a
 * game it stopped following can still reach it; the screen drops those
 */
export function dropFollower(peer: Peer, id?: string) {
  if (id) peer.unsubscribe(id);
  if (!import.meta.dev) return;
  for (const [k, set] of local) {
    if (id && k !== id) continue;
    set.delete(peer);
    if (!set.size) local.delete(k);
  }
}

/** send `msg` to every socket following game `id`. from a socket, to every one but that one */
export function push(from: H3Event | Peer, id: string, msg: ServerMsg) {
  const text = JSON.stringify(msg);
  if ("publish" in from) return from.publish(id, text);
  const durable = cloudflareOf(from)?.durable;
  if (durable) {
    for (const ws of durable.ctx.getWebSockets()) {
      const state = ws.deserializeAttachment() as { t?: Set<string> } | null;
      if (state?.t?.has(id)) ws.send(text);
    }
    return;
  }
  for (const p of local.get(id) ?? []) p.send(text);
}

// one websocket to the relay for this screen: the host sends its snapshots
// down it, tvs and phones hear them the moment they land, and a phone sends
// its mailbox. every message is sealed before it goes (sync.ts), so this only
// carries ids and ciphertext. if a socket can't be had, the callers fall back
// to asking over http, as before.
import { API } from "./api";

export type RelayMsg = { t: string; id?: string; data?: string; at?: number; seat?: string; why?: string; n?: number };
type Listener = (m: RelayMsg) => void;

const url = () => {
  const base = API || location.origin;
  return base.replace(/^http/, "ws") + "/api/live/socket";
};

let ws: WebSocket | null = null;
let open = false;
let openedAt = 0;
let tries = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
// what's been sent and is waiting on the relay's answer, by number
let sent = 0;
const answers = new Map<number, (ok: boolean) => void>();
/** the games this screen follows, sent again after every reconnect */
const following = new Map<string, Set<Listener>>();
const watchers = new Set<(open: boolean) => void>();

function setOpen(v: boolean) {
  if (open === v) return;
  open = v;
  for (const w of watchers) w(v);
}

function connect() {
  if (ws || typeof WebSocket === "undefined") return;
  clearTimeout(timer);
  let s: WebSocket;
  try {
    s = new WebSocket(url());
  } catch {
    return retry();
  }
  ws = s;
  s.onopen = () => {
    openedAt = Date.now();
    setOpen(true);
    for (const id of following.keys()) s.send(JSON.stringify({ t: "follow", id }));
  };
  s.onmessage = (e) => {
    let m: RelayMsg;
    try {
      m = JSON.parse(String(e.data));
    } catch {
      return;
    }
    if (typeof m.n === "number") return void answers.get(m.n)?.(m.t === "ok");
    if (m.id) for (const l of following.get(m.id) ?? []) l(m);
  };
  s.onclose = () => {
    if (ws !== s) return;
    drop();
    retry();
  };
  s.onerror = () => s.close();
}

/** the socket's gone: anything waiting on an answer won't get one */
function drop() {
  // one that stayed up a while starts the back off over (one the relay keeps closing doesn't)
  if (openedAt && Date.now() - openedAt > 10_000) tries = 0;
  openedAt = 0;
  ws = null;
  setOpen(false);
  for (const done of [...answers.values()]) done(false);
}

// back off (1s, 2s, 4s... up to 30s) while nothing's reachable
function retry() {
  if (!following.size) return;
  clearTimeout(timer);
  timer = setTimeout(connect, Math.min(30_000, 1000 * 2 ** tries++));
}

/** hear everything about game `id` (its snapshots, its seats' mailboxes). returns stop */
export function follow(id: string, cb: Listener) {
  let set = following.get(id);
  const fresh = !set;
  if (!set) following.set(id, (set = new Set()));
  set.add(cb);
  if (open && fresh) ws!.send(JSON.stringify({ t: "follow", id }));
  connect();
  return () => {
    set!.delete(cb);
    if (!set!.size) following.delete(id);
    if (!following.size) {
      clearTimeout(timer);
      const s = ws;
      drop();
      s?.close();
    }
  };
}

/**
 * send something down the socket and wait for the relay to say it has it.
 * false: there's no socket, the relay turned it down, or no answer came in
 * time (a socket that died without closing), so use http
 */
export function relay(msg: RelayMsg & Record<string, unknown>, waitMs = 5000): Promise<boolean> {
  if (!open || ws?.readyState !== WebSocket.OPEN) return Promise.resolve(false);
  const n = ++sent;
  ws.send(JSON.stringify({ ...msg, n }));
  return new Promise((resolve) => {
    const late = setTimeout(() => done(false), waitMs);
    const done = (ok: boolean) => {
      clearTimeout(late);
      answers.delete(n);
      resolve(ok);
    };
    answers.set(n, done);
  });
}

// back on the network: try now, not at the end of the back off
if (typeof window !== "undefined")
  window.addEventListener("online", () => {
    if (ws || !following.size) return;
    tries = 0;
    connect();
  });

/** hear when the socket opens and closes. returns stop */
export function onSocket(cb: (open: boolean) => void) {
  watchers.add(cb);
  return () => void watchers.delete(cb);
}

export const socketOpen = () => open;

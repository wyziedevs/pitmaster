// one websocket to the relay for this screen: the host sends its snapshots
// down it, tvs and phones hear them the moment they land, and a phone sends
// its mailbox. every message is sealed before it goes (sync.ts), so this only
// carries ids and ciphertext. if a socket can't be had, or the relay won't
// follow a game on it, the callers fall back to asking over http, as before.
import { API } from "./api";
import type { Ask, ClientMsg, ServerMsg } from "./protocol";

type Listener = (m: ServerMsg) => void;

const url = () => (API || location.origin).replace(/^http/, "ws") + "/api/live/socket";

// the relay closed it for asking after too many games that aren't there
// (4008) or for sending too much (4029), and lets it back after a minute
// (server/routes/api/live/socket.ts). so it waits that long
const HELD = new Set([4008, 4029]);
const HOLD = 60_000;

/** the socket: nothing to follow, on its way, open, or waiting to try again. `tries` is how far the back off has gone */
type State =
  | { s: "idle" }
  | { s: "connecting"; ws: WebSocket; tries: number }
  | { s: "open"; ws: WebSocket; tries: number; since: number }
  | { s: "waiting"; held: boolean; timer: ReturnType<typeof setTimeout> };

let state: State = { s: "idle" };
const watchers = new Set<(open: boolean) => void>();
/** the games this screen follows, sent again after every reconnect */
const following = new Map<string, Set<Listener>>();
/** followed games the relay turned away (a socket follows only so many): these are asked for over http */
const refused = new Set<string>();
// what's been sent and is waiting on the relay's answer, by number
let sent = 0;
const answers = new Map<number, (status: number) => void>();

/** move to `next`, telling the watchers when that opens or closes the socket */
function to(next: State) {
  const was = state.s === "open";
  if (state.s === "waiting") clearTimeout(state.timer);
  state = next;
  const now = next.s === "open";
  if (was === now) return;
  // the socket's gone: anything waiting on an answer won't get one, and what it turned away it may take next time
  if (was) {
    refused.clear();
    for (const done of [...answers.values()]) done(0);
  }
  for (const w of watchers) w(now);
}

const put = (msg: ClientMsg) => state.s === "open" && state.ws.send(JSON.stringify(msg));

function connect(tries = 0) {
  if (typeof WebSocket === "undefined") return;
  let ws: WebSocket;
  try {
    ws = new WebSocket(url());
  } catch {
    return wait(tries, false);
  }
  to({ s: "connecting", ws, tries });
  ws.onopen = () => {
    if (state.s !== "connecting" || state.ws !== ws) return;
    to({ s: "open", ws, tries, since: Date.now() });
    for (const id of following.keys()) put({ t: "follow", id });
  };
  ws.onmessage = (e) => hear(e.data);
  // (an error is always followed by a close)
  ws.onclose = (e) => {
    if (!("ws" in state) || state.ws !== ws) return;
    // one that stayed up a while starts the back off over (one the relay keeps closing doesn't)
    const up = state.s === "open" && Date.now() - state.since > 10_000;
    wait(up ? 0 : state.tries, HELD.has(e.code));
  };
}

// back off (1s, 2s, 4s... up to 30s) while nothing's reachable, or a minute when the relay said so
function wait(tries: number, held: boolean) {
  if (!following.size) return to({ s: "idle" });
  const ms = held ? HOLD : Math.min(30_000, 1000 * 2 ** tries);
  to({ s: "waiting", held, timer: setTimeout(() => connect(tries + 1), ms) });
}

function hear(raw: unknown) {
  let m: ServerMsg;
  try {
    m = JSON.parse(String(raw));
  } catch {
    return;
  }
  if (typeof m?.t !== "string") return;
  if ((m.t === "ok" || m.t === "err") && typeof m.n === "number") return void answers.get(m.n)?.(m.t === "ok" ? 200 : (m.status ?? 0));
  if (!m.id || !following.has(m.id)) return;
  if (m.t === "err" && m.why === "too many") refused.add(m.id);
  for (const l of following.get(m.id)!) l(m);
}

/** nothing left to follow: the socket can go */
function close() {
  const ws = "ws" in state ? state.ws : null;
  to({ s: "idle" });
  ws?.close();
}

/**
 * hear everything about game `id` (its snapshots, its seats' mailboxes). a
 * game the relay won't follow on this socket hears {t:"err",why:"too many"}
 * and should be asked for over http (see hears). returns stop
 */
export function follow(id: string, cb: Listener) {
  const fresh = !following.has(id);
  const set = following.get(id) ?? new Set<Listener>();
  set.add(cb);
  if (fresh) {
    following.set(id, set);
    put({ t: "follow", id });
  }
  if (state.s === "idle") connect();
  return () => {
    if (!set.delete(cb) || set.size) return;
    following.delete(id);
    if (!following.size) return close();
    // one the relay turned away: it never followed it, so there's nothing to take back
    if (refused.delete(id) || state.s !== "open") return;
    put({ t: "unfollow", id });
    // room on the relay again: one it turned away can come down the socket after all
    const [next] = refused;
    if (!next) return;
    refused.delete(next);
    put({ t: "follow", id: next });
  };
}

/**
 * send something down the socket and wait for the relay's answer, as the http
 * status the same write would get (200: it has it; 403: wrong key...). 0:
 * there's no socket, or no answer came in time (a socket that died without
 * closing), so use http
 */
export function relay(msg: Ask, waitMs = 5000): Promise<number> {
  if (state.s !== "open" || state.ws.readyState !== WebSocket.OPEN) return Promise.resolve(0);
  const n = ++sent;
  put({ ...msg, n });
  return new Promise((resolve) => {
    const late = setTimeout(() => done(0), waitMs);
    const done = (status: number) => {
      clearTimeout(late);
      answers.delete(n);
      resolve(status);
    };
    answers.set(n, done);
  });
}

// back on the network: try now, not at the end of the back off (unless the relay asked for the wait)
if (typeof window !== "undefined")
  window.addEventListener("online", () => {
    if (state.s === "waiting" && !state.held) connect();
  });

/** hear when the socket opens and closes. returns stop */
export function onSocket(cb: (open: boolean) => void) {
  watchers.add(cb);
  return () => void watchers.delete(cb);
}

/** whether game `id` comes down the socket: it's open, and the relay took the follow */
export const hears = (id: string) => state.s === "open" && following.has(id) && !refused.has(id);

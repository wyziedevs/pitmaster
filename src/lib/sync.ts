// live sync between the dealer screen and tv screens.
//  - same browser (a tv window dragged to the hdmi screen, or a cast tab):
//    BroadcastChannel. nothing leaves the computer.
//  - any other device (a smart tv's browser, phones): the nitro api relays
//    snapshots under the tv code. each one is encrypted here first, with a key
//    made from the code, and the api only ever sees an id made from the code,
//    so it stores games it can't read. they go down a websocket (socket.ts)
//    and are pushed to every screen the moment they land; without one, the
//    host sends them over http and the screens ask every couple of seconds.
//  - phones as dice cups write to their own seat's mailbox the same way,
//    sealed with the same key.
import type { Game } from "./types";
import { API } from "./api";
import { myPrefs } from "./settings.svelte";
import { canEncrypt, codeKeys, newCode, seal, token, unseal } from "./crypto";
import { isGame } from "./check";
import { follow, hears, onSocket, relay } from "./socket";
import { leagueBoardFor } from "./boards";
import { t } from "./i18n";

const bc = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("pitmaster") : null;

type Live = NonNullable<Game["live"]>;


/** what a tv on this computer gets: the game minus its write key, plus the host's display prefs and its league's standings */
// (and never the phones' seat keys: each phone has its own, and only the host's device holds them all)
export const publicSnapshot = (g: Game): Game => ({ ...g, live: g.live ? { code: g.live.code, key: "" } : null, prefs: myPrefs(), league: leagueBoardFor(g), cupKeys: undefined });

/** what goes to the server: no code, no key and no log (the tv never shows it) */
const remoteSnapshot = (g: Game): Game => ({ ...publicSnapshot(g), live: null, log: [] });

// the host follows its own game on the socket: that keeps the socket up to send
// snapshots down, and brings in its players' phones' mailboxes
const hosting = new Map<string, () => void>();
async function host(code: string) {
  if (hosting.has(code)) return;
  hosting.set(code, () => {});
  try {
    const { id, key } = await codeKeys(code);
    // stopped sharing meanwhile: don't follow it after all
    if (!hosting.has(code)) return;
    hosting.set(
      code,
      follow(id, (m) => {
        if (m.t === "seat") void hear(code, key, m.seat, m.data, m.at);
      })
    );
  } catch {
    hosting.delete(code);
  }
}

const unhost = (code: string) => {
  hosting.get(code)?.();
  hosting.delete(code);
};

// cloudflare kv takes one write a second per code, so a code's writes go out
// at least that far apart: the first right away, then the newest of whatever
// changed meanwhile. a write that fails because the server is busy or out of
// reach is tried again, backing off, until it lands or something newer replaces it.
const GAP = 1100;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, Math.max(0, ms)));

interface Pushing {
  next: Game | null; // waiting its turn
  last: number; // when the last write for this code finished
  run: Promise<void> | null; // the loop sending them, while there's anything to send
  stopped: boolean; // sharing ended: nothing more goes out, not even a retry
  wake: (() => void) | null; // cuts short the wait before the next write
}
const pushing = (last = 0): Pushing => ({ next: null, last, run: null, stopped: false, wake: null });
/** wait `ms` before the next write, unless sharing stops first */
const pause = (p: Pushing, ms: number) =>
  new Promise<void>((done) => {
    const timer = setTimeout(done, Math.max(0, ms));
    p.wake = () => {
      clearTimeout(timer);
      done();
    };
  });
const pushes = new Map<string, Pushing>();

export function publish(game: Game) {
  bc?.postMessage({ type: "game", game: publicSnapshot(game) });
  if (!game.live) return;
  const live = game.live;
  void host(live.code);
  const p = pushes.get(live.code) ?? pushing();
  pushes.set(live.code, p);
  p.next = remoteSnapshot(game);
  p.run ??= (async () => {
    let wait = GAP;
    while (p.next) {
      await pause(p, p.last + wait - Date.now());
      const snap = p.next;
      if (!snap) break; // stopped sharing meanwhile
      p.next = null;
      const status = await push(live, snap);
      p.last = Date.now();
      const retry = status === 0 || status === 429 || status >= 500;
      wait = retry ? Math.min(wait * 2, 30_000) : GAP;
      if (retry && !p.stopped) p.next ??= snap;
    }
    p.run = null;
  })();
}

/** send one snapshot: down the socket if it's open, or over http. the status, or 0 when the server couldn't be reached */
async function push({ code, key }: Live, snap: Game) {
  try {
    const { id, key: lock } = await codeKeys(code);
    const data = await seal(lock, JSON.stringify(snap));
    const status = await relay({ t: "put", id, key, data });
    if (status) return status;
    const r = await fetch(`${API}/api/live/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Live-Key": key },
      body: JSON.stringify({ data }),
    });
    return r.status;
  } catch {
    return 0;
  }
}

/** same-browser updates for game `id`. returns unsubscribe. */
export function subscribeLocal(id: string, cb: (g: Game) => void) {
  const onMsg = (e: MessageEvent) => e.data?.type === "game" && e.data.game?.id === id && cb(e.data.game);
  bc?.addEventListener("message", onMsg);
  return () => bc?.removeEventListener("message", onMsg);
}

// a tv window never holds the key, so with a passcode set it can't read the
// game itself: it asks, and a tab that's unlocked answers with the same
// snapshot the tv gets on every change (see lock.svelte.ts)
let lookup: ((id: string) => Game | null) | null = null;

/** answer tv windows asking for a game (null: stop answering) */
export const answerWants = (get: typeof lookup) => void (lookup = get);

bc?.addEventListener("message", (e) => {
  if (e.data?.type !== "want" || !lookup) return;
  const g = lookup(String(e.data.id));
  if (g) bc.postMessage({ type: "game", game: publicSnapshot(g) });
});

/** ask for game `id` every couple of seconds until someone answers (see subscribeLocal). returns stop. */
export function askFor(id: string, everyMs = 2000) {
  const ask = () => bc?.postMessage({ type: "want", id });
  ask();
  const t = setInterval(ask, everyMs);
  return () => clearInterval(t);
}

/**
 * a new tv code. the code is made here and never sent: the server gets the
 * id made from it, and a write key so only this game's host can update it.
 */
export async function startLive(): Promise<Live> {
  for (let tries = 0; tries < 5; tries++) {
    const code = newCode();
    const key = token();
    const { id } = await codeKeys(code);
    const r = await fetch(`${API}/api/live`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, key }),
    });
    if (r.status === 409) continue; // that code's taken: draw another
    if (!r.ok) throw new Error(`the server said ${r.status}`);
    // that was this code's first write, so its first snapshot waits a second
    pushes.set(code, pushing(Date.now()));
    return { code, key };
  }
  throw new Error("no free code");
}

/** give snapshots still on their way to the server up to `maxMs` to land (before the app locks) */
export async function flushLive(maxMs = 3000) {
  await Promise.race([Promise.all([...pushes.values()].map((p) => p.run)), sleep(maxMs)]);
}

/**
 * stop sharing: the server deletes its copy now, instead of two days after the
 * last update. a write already under way finishes first, so it can't land
 * after the delete. throws if the server can't be reached after a few tries.
 */
export async function endLive({ code, key }: Live) {
  const p = pushes.get(code);
  pushes.delete(code);
  unhost(code);
  if (p) {
    p.stopped = true;
    p.next = null;
    p.wake?.();
    await p.run;
  }
  const { id } = await codeKeys(code);
  let last = p?.last ?? 0;
  for (let tries = 0; tries < 4; tries++) {
    await sleep(last + GAP * 2 ** tries - Date.now());
    const r = await fetch(`${API}/api/live/${id}`, { method: "DELETE", headers: { "X-Live-Key": key } }).catch(() => null);
    last = Date.now();
    // 404 and 410: already gone
    if (r && (r.ok || r.status === 404 || r.status === 410)) return;
    if (r?.status === 403) break;
  }
  throw new Error("couldn't reach the server");
}

/**
 * follow code: every new snapshot to cb, pushed down the socket the moment it
 * lands. while there's no socket, the api is polled instead. onError hears
 * about wrong codes and network trouble. a wrong code is asked about less
 * often (a code that was just made can take up to a minute to reach every
 * server), and a code whose host stopped sharing isn't asked about again.
 */
export function pollLive(code: string, cb: (g: Game) => void, onError: (msg: string) => void, everyMs = 2000) {
  if (!canEncrypt()) {
    onError(t("tv.connect.needsHttps"));
    return () => {};
  }
  const keys = codeKeys(code);
  let id = ""; // once the code's been made into one
  let since = 0;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function take(data: string, at: number) {
    if (at && at <= since) return;
    const game = await keys
      .then(({ key }) => unseal(key, data))
      .then(JSON.parse)
      .catch(() => null);
    // a newer one landed while this was being opened
    if (stopped || (at && at <= since)) return;
    if (!isGame(game)) return onError(t("tv.connect.cantUnlock"));
    since = at || since;
    cb(game);
  }

  async function tick() {
    timer = undefined;
    // the socket's back (and has this game): it'll bring what's new
    if (stopped || hears(id)) return;
    let wait = everyMs;
    try {
      const k = await keys;
      const r = await fetch(`${API}/api/live/${k.id}?since=${since}`, { cache: "no-store" });
      if (r.status === 410) {
        stopped = true;
        onError(t("tv.connect.stopped"));
      } else if (r.status === 404) {
        onError(t("tv.connect.noGame"));
        wait = everyMs * 3;
      } else if (r.status === 429) {
        onError(t("tv.connect.busy"));
        wait = everyMs * 5;
      } else if (!r.ok) onError(t("tv.connect.serverSaid", { status: String(r.status) }));
      else {
        const body = await r.json();
        if (body.changed && body.data) await take(body.data, Number(body.updatedAt) || 0);
        else if (body.changed) onError(t("tv.connect.notStarted"));
      }
    } catch {
      onError(t("tv.connect.cantReach"));
    }
    if (!stopped && !hears(id)) timer = setTimeout(tick, wait);
  }
  const poll = () => {
    if (!stopped && !timer && !hears(id)) timer = setTimeout(tick, 0);
  };

  let unfollow = () => {};
  keys
    .then((k) => {
      id = k.id;
      if (stopped) return;
      unfollow = follow(id, (m) => {
        if (m.t === "snap") void take(m.data, m.at);
        else if (m.t === "gone") {
          stopped = true;
          onError(t("tv.connect.stopped"));
        } else if (m.t === "none") onError(t("tv.connect.noGame"));
        // the relay won't follow it on this socket: ask over http instead
        else if (m.t === "err") poll();
      });
    })
    .catch(() => onError(t("tv.connect.cantUnlock")));
  // no socket (yet, or any more): ask over http until there is one
  const stopWatch = onSocket((open) => !open && poll());
  const first = setTimeout(poll, 2500);
  return () => {
    stopped = true;
    clearTimeout(timer);
    clearTimeout(first);
    stopWatch();
    unfollow();
  };
}

// ---------- phones as dice cups: each seat's mailbox ----------

/** the host: which seats may write, by the sha-256 of each seat's key */
export async function registerSeats({ code, key }: Live, seats: Record<string, string>) {
  const { id } = await codeKeys(code);
  const status = await relay({ t: "seats", id, key, seats });
  if (status) return status === 200;
  const r = await fetch(`${API}/api/live/${id}/seats`, { method: "PUT", headers: { "Content-Type": "application/json", "X-Live-Key": key }, body: JSON.stringify({ seats }) }).catch(() => null);
  return !!r?.ok;
}

/** each hosted game's seat watchers, and the newest mailbox each seat's been heard with */
const seatWatch = new Map<string, { cbs: Set<(seat: string, text: string) => void>; seen: Map<string, number> }>();

/** a seat's mailbox, however it came (pushed down the socket, or asked for): each one's heard once */
async function hear(code: string, key: CryptoKey, seat: string, data: string, at: number) {
  const w = seatWatch.get(code);
  if (!w || (w.seen.get(seat) ?? 0) >= at) return;
  w.seen.set(seat, at);
  const text = await unseal(key, data).catch(() => null);
  if (text !== null) for (const cb of w.cbs) cb(seat, text);
}

/**
 * the host: hear each phone's mailbox (unsealed), as it's written. over the
 * socket it's pushed; without one, the mailboxes are asked for every couple
 * of seconds. returns stop
 */
export function watchSeats(code: string, cb: (seat: string, text: string) => void, everyMs = 2000) {
  const w = seatWatch.get(code) ?? { cbs: new Set(), seen: new Map() };
  seatWatch.set(code, w);
  w.cbs.add(cb);
  void host(code);
  let asking = false;
  const ask = async () => {
    // one ask at a time: a slow answer isn't asked over
    if (asking) return;
    asking = true;
    try {
      const { id, key } = await codeKeys(code);
      if (hears(id)) return;
      const r = await fetch(`${API}/api/live/${id}/mail`, { cache: "no-store" });
      if (!r.ok) return;
      const { mail } = (await r.json()) as { mail: { seat: string; data: string; updatedAt: number }[] };
      for (const m of mail) await hear(code, key, m.seat, m.data, m.updatedAt);
    } catch {
      // out of reach: asked again next time
    } finally {
      asking = false;
    }
  };
  const timer = setInterval(ask, everyMs);
  void ask();
  return () => {
    clearInterval(timer);
    w.cbs.delete(cb);
    if (w.cbs.size || seatWatch.get(code) !== w) return;
    seatWatch.delete(code);
    // hosted only to hear the phones (nothing's shared from here): stop
    if (!pushes.has(code)) unhost(code);
  };
}

/** a phone: write to its own seat's mailbox, sealed with the game's key */
export async function sendSeat(code: string, seat: string, seatKey: string, text: string) {
  const { id, key } = await codeKeys(code);
  const data = await seal(key, text);
  const status = await relay({ t: "seat", id, seat, key: seatKey, data });
  if (status) return status === 200;
  const r = await fetch(`${API}/api/live/${id}/seat/${seat}`, { method: "PUT", headers: { "Content-Type": "application/json", "X-Seat-Key": seatKey }, body: JSON.stringify({ data }) }).catch(() => null);
  return !!r?.ok;
}

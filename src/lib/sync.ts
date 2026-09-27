// live sync between the dealer screen and tv screens.
//  - same browser (a tv window dragged to the hdmi screen, or a cast tab):
//    BroadcastChannel. nothing leaves the computer.
//  - any other device (a smart tv's browser, phones): the nitro api relays
//    snapshots under the tv code. each one is encrypted here first, with a key
//    made from the code, and the api only ever sees an id made from the code,
//    so it stores games it can't read.
import type { Game } from "./types";
import { API } from "./api";
import { myPrefs } from "./settings.svelte";
import { canEncrypt, codeKeys, newCode, seal, token, unseal } from "./crypto";
import { isGame } from "./check";

const bc = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("pitmaster") : null;

type Live = NonNullable<Game["live"]>;

// a league game's standings, worked out from what's saved (store.ts hands this over)
let boardFor: (g: Game) => Game["league"] = () => undefined;
export const leagueBoards = (fn: typeof boardFor) => void (boardFor = fn);

/** what a tv on this computer gets: the game minus its write key, plus the host's display prefs and its league's standings */
export const publicSnapshot = (g: Game): Game => ({ ...g, live: g.live ? { code: g.live.code, key: "" } : null, prefs: myPrefs(), league: boardFor(g) });

/** what goes to the server: no code, no key and no log (the tv never shows it) */
const remoteSnapshot = (g: Game): Game => ({ ...publicSnapshot(g), live: null, log: [] });

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
}
const pushes = new Map<string, Pushing>();

export function publish(game: Game) {
  bc?.postMessage({ type: "game", game: publicSnapshot(game) });
  if (!game.live) return;
  const live = game.live;
  const p = pushes.get(live.code) ?? { next: null, last: 0, run: null };
  pushes.set(live.code, p);
  p.next = remoteSnapshot(game);
  p.run ??= (async () => {
    let wait = GAP;
    while (p.next) {
      await sleep(p.last + wait - Date.now());
      const snap = p.next;
      if (!snap) break; // stopped sharing meanwhile
      p.next = null;
      const status = await push(live, snap);
      p.last = Date.now();
      const retry = status === 0 || status === 429 || status >= 500;
      wait = retry ? Math.min(wait * 2, 30_000) : GAP;
      if (retry) p.next ??= snap;
    }
    p.run = null;
  })();
}

/** send one snapshot. the status, or 0 when the server couldn't be reached */
async function push({ code, key }: Live, snap: Game) {
  try {
    const { id, key: lock } = await codeKeys(code);
    const r = await fetch(`${API}/api/live/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Live-Key": key },
      body: JSON.stringify({ data: await seal(lock, JSON.stringify(snap)) }),
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
    pushes.set(code, { next: null, last: Date.now(), run: null });
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
  if (p) {
    p.next = null;
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
 * poll the api for code. cb gets each new snapshot; onError hears about wrong
 * codes and network trouble. a wrong code is asked about less often (a code
 * that was just made can take up to a minute to reach every server), and a
 * code whose host stopped sharing isn't asked about again.
 */
export function pollLive(code: string, cb: (g: Game) => void, onError: (msg: string) => void, everyMs = 2000) {
  if (!canEncrypt()) {
    onError("This screen can only unlock the game on a secure (https) page");
    return () => {};
  }
  const keys = codeKeys(code);
  let since = 0;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout>;

  async function tick() {
    let wait = everyMs;
    try {
      const { id, key } = await keys;
      const r = await fetch(`${API}/api/live/${id}?since=${since}`, { cache: "no-store" });
      if (r.status === 410) {
        stopped = true;
        onError("The host stopped sharing this game");
      } else if (r.status === 404) {
        onError("No game with that code");
        wait = everyMs * 3;
      } else if (r.status === 429) {
        onError("Too many screens asking at once, retrying…");
        wait = everyMs * 5;
      } else if (!r.ok) onError(`The server said ${r.status}`);
      else {
        const body = await r.json();
        if (body.changed && body.data) {
          const game = await unseal(key, body.data).then(JSON.parse, () => null);
          if (!isGame(game)) onError("That game couldn't be unlocked");
          else {
            since = Number(body.updatedAt) || 0;
            cb(game);
          }
        } else if (body.changed) {
          onError("Waiting for the host to start…");
        }
      }
    } catch {
      onError("Can't reach the server, retrying…");
    }
    if (!stopped) timer = setTimeout(tick, wait);
  }
  tick();
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}

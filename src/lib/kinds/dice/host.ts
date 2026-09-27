// the host's side of phones as dice cups: seat each player's phone, collect
// the hashes, deal the host's numbers once they're all in, and on a call
// collect the numbers, check them and count. the host's device only ever
// holds what a phone has already revealed.
import type { Game } from "$lib/types";
import { flash, logEvent } from "$lib/game";
import { t, tp } from "$lib/i18n";
import { diceState, judge } from "./engine";
import { addRound, faceCount } from "./actions";
import { combine, commitOf, newSeat, numbers, readMail, seatOwner, sha256, waitingOn } from "./cups";

const pname = (game: Game, id: string) => game.players.find((p) => p.id === id)?.name ?? "?";

/** turn the phones on: a seat (and its key, kept here, never in a snapshot) for every player */
export function startCups(game: Game) {
  const seats: Record<string, string> = {};
  const keys: Record<string, string> = { ...(game.cupKeys ?? {}) };
  for (const p of game.players) {
    const old = game.cups?.seats[p.id];
    if (old && keys[p.id]) seats[p.id] = old;
    else {
      const s = newSeat();
      seats[p.id] = s.seat;
      keys[p.id] = s.key;
    }
  }
  game.cupKeys = keys;
  game.cups = { on: true, seats, round: (game.rounds?.length ?? 0) + 1, phase: "commit", commits: {}, shown: {}, real: [] };
  logEvent(game, t("gamePlay.dice.cups.onLog"));
  flash(game, t("gamePlay.dice.cups.rollFlash"), "shuffle");
}

/** back to real cups for the rest of the game */
export function stopCups(game: Game) {
  if (game.cups) game.cups = { ...game.cups, on: false };
  logEvent(game, t("gamePlay.dice.cups.offLog"));
}

/** the sha-256 of each seat's key, for the relay (it never sees the keys themselves) */
export async function seatHashes(game: Game) {
  const out: Record<string, string> = {};
  for (const [pid, seat] of Object.entries(game.cups?.seats ?? {})) if (game.cupKeys?.[pid]) out[seat] = await sha256(game.cupKeys[pid]);
  return out;
}

/** a new round's cups: everyone rolls again */
function nextRound(game: Game) {
  const c = game.cups!;
  game.cups = { ...c, round: (game.rounds?.length ?? 0) + 1, phase: "commit", commits: {}, shown: {}, host: undefined, call: undefined, real: [] };
}

/** once every phone has locked in, the host's numbers go out and everyone can look */
function dealIfReady(game: Game) {
  const c = game.cups!;
  const st = diceState(game);
  if (c.phase !== "commit" || waitingOn(game, st.alive).length) return false;
  const host: Record<string, number[]> = {};
  for (const id of st.alive) if (!c.real?.includes(id)) host[id] = numbers(st.lives[id]);
  game.cups = { ...c, phase: "play", host };
  flash(game, t("gamePlay.dice.cups.lookFlash"), "shuffle");
  return true;
}

/**
 * a phone's mailbox changed. true when the game changed (save it). a hash is
 * taken once a round (a second one can't replace it); numbers are taken only
 * after a call, and checked against the hash.
 */
export async function takeMail(game: Game, seat: string, text: string) {
  const c = game.cups;
  if (!c?.on) return false;
  const pid = seatOwner(c, seat);
  const mail = readMail(text);
  if (!pid || !mail || mail.r !== c.round || game.finished) return false;
  const st = diceState(game);
  if (!st.alive.includes(pid)) return false;
  if (c.phase === "commit" && !c.commits?.[pid]) {
    game.cups = { ...c, commits: { ...c.commits, [pid]: mail.c } };
    dealIfReady(game);
    return true;
  }
  if (c.phase === "reveal" && !c.shown?.[pid] && mail.n && mail.s !== undefined) {
    const lives = st.lives[pid];
    const good = mail.c === c.commits?.[pid] && mail.n.length === lives && (await commitOf(game.id, c.round, seat, mail.n, mail.s)) === c.commits?.[pid];
    // a phone that doesn't match what it locked in is caught: its dice don't count
    const dice = good ? combine(mail.n, c.host?.[pid] ?? []) : [];
    game.cups = { ...c, shown: { ...c.shown, [pid]: dice }, cheats: good ? c.cheats : [...(c.cheats ?? []), pid] };
    return true;
  }
  return false;
}

/** a phone dropped: that player rolls real dice this round, and the host types their count on a call */
export function toRealDice(game: Game, pid: string) {
  const c = game.cups!;
  game.cups = { ...c, real: [...new Set([...(c.real ?? []), pid])], commits: Object.fromEntries(Object.entries(c.commits ?? {}).filter(([k]) => k !== pid)) };
  logEvent(game, t("gamePlay.dice.cups.realLog", { name: pname(game, pid) }));
  dealIfReady(game);
}

/** someone called: every phone shows its numbers */
export function callForReveal(game: Game, call: { bid: { count: number; face: number }; bidder: string; caller: string; call: "liar" | "spot" }) {
  const c = game.cups!;
  game.cups = { ...c, phase: "reveal", call };
  flash(game, call.call === "liar" ? t("gamePlay.dice.cups.liarFlash", { caller: pname(game, call.caller), bid: faceCount(call.bid.count, call.bid.face) }) : t("gamePlay.dice.cups.spotFlash", { caller: pname(game, call.caller), bid: faceCount(call.bid.count, call.bid.face) }), "liar");
}

/**
 * count the call: every cup that's shown, plus what the host typed for anyone
 * on real dice. a phone that was caught loses the round (and only they do).
 */
export function countCall(game: Game, realCounts: Record<string, number> = {}) {
  const c = game.cups!;
  const call = c.call;
  if (!call) return;
  const st = diceState(game);
  const face = call.bid.face;
  const wild = st.wild && face !== 1;
  let actual = 0;
  for (const dice of Object.values(c.shown ?? {})) actual += dice.filter((d) => d === face || (wild && d === 1)).length;
  for (const id of c.real ?? []) actual += Math.max(0, Math.round(realCounts[id] ?? 0));
  const cheats = (c.cheats ?? []).filter((id) => st.alive.includes(id));
  const reveal = Object.fromEntries(Object.entries(c.shown ?? {}).filter(([, d]) => d.length));
  if (cheats.length) {
    addRound(game, { ...call, actual, losers: cheats, reveal, cheats, at: Date.now() });
    flash(game, tp("gamePlay.dice.cups.caughtFlash", cheats.length, { names: cheats.map((id) => pname(game, id)).join(", ") }), "bust");
  } else addRound(game, { ...call, actual, ...judge(game.dice!, { ...call, actual }, st.alive), reveal, at: Date.now() });
  if (!game.finished) nextRound(game);
}

// the host's side of phones as dice cups: seat each player's phone, collect
// the hashes, deal the host's numbers once they're all in, and on a call
// collect the numbers, check them and count. the host's device only ever
// holds what a phone has already revealed.
import type { Game } from "$lib/types";
import { flash, logEvent, playerName } from "$lib/events";
import { t, tp } from "$lib/i18n";
import { countsToward, diceState, judge, type Call } from "./engine";
import { addRound, faceCount } from "./actions";
import { activeCups, combine, commitOf, newSeat, nextNumber, numbers, readMail, seatOwner, sha256, waitingOn } from "./cups";

/** a seat (and its key, kept here, never in a snapshot) for every player who hasn't one yet */
export function seatAll(game: Game) {
  const seats: Record<string, string> = { ...(game.cups?.seats ?? {}) };
  const keys: Record<string, string> = { ...(game.cupKeys ?? {}) };
  for (const p of game.players) {
    if (seats[p.id] && keys[p.id]) continue;
    const s = newSeat();
    seats[p.id] = s.seat;
    keys[p.id] = s.key;
  }
  game.cupKeys = keys;
  return seats;
}

/** a player added with the phones on gets a seat of their own too */
export function seatLate(game: Game) {
  const c = activeCups(game);
  if (c) game.cups = { ...c, seats: seatAll(game) };
}

/** turn the phones on: a seat for every player, and everyone rolls */
export function startCups(game: Game) {
  const seats = seatAll(game);
  game.cups = { on: true, seats, round: nextNumber(game), phase: "commit", commits: {}, shown: {}, real: [] };
  logEvent(game, t("gamePlay.dice.cups.onLog"));
  flash(game, t("gamePlay.dice.cups.rollFlash"), "shuffle");
}

/** back to real cups for the rest of the game */
export function stopCups(game: Game) {
  if (game.cups) game.cups = { ...game.cups, on: false };
  logEvent(game, t("gamePlay.dice.cups.offLog"));
}

/** the sha-256 of each seat's key (by player), for the relay (it never sees the keys themselves) */
export async function seatHashes(seats: Record<string, string>, keys: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const [pid, seat] of Object.entries(seats)) if (keys[pid]) out[seat] = await sha256(keys[pid]);
  return out;
}

/** once every phone has locked in, the host's numbers go out and everyone can look */
function dealIfReady(game: Game) {
  const c = activeCups(game);
  const st = diceState(game);
  if (c?.phase !== "commit" || waitingOn(c, st.alive).length) return;
  const host: Record<string, number[]> = {};
  for (const id of st.alive) if (!c.real?.includes(id)) host[id] = numbers(st.lives[id]);
  game.cups = { ...c, phase: "play", host };
  flash(game, t("gamePlay.dice.cups.lookFlash"), "shuffle");
}

/**
 * a phone's mailbox changed: what it did to the game (null: nothing, so
 * nothing to save). a hash is taken once a round (a second one can't replace
 * it); numbers are taken only after a call, and checked against the hash.
 * the last cup shown (with nobody on real dice) is counted right away.
 */
export async function takeMail(game: Game, seat: string, text: string): Promise<"took" | "counted" | null> {
  const mail = readMail(text);
  const seen = activeCups(game);
  if (!mail || !seen) return null;
  // check a reveal's numbers first: the game can move on while that runs, so
  // everything below reads it fresh
  const pid = seatOwner(seen, seat);
  const checked = pid && mail.n && mail.s !== undefined ? await commitOf(game.id, mail.r, seat, mail.n, mail.s) : null;
  const c = activeCups(game);
  if (!c || c.round !== seen.round || !pid || mail.r !== c.round || game.finished) return null;
  const st = diceState(game);
  if (!st.alive.includes(pid)) return null;
  if (c.phase === "commit" && !c.commits?.[pid] && !c.real?.includes(pid)) {
    game.cups = { ...c, commits: { ...c.commits, [pid]: mail.c } };
    dealIfReady(game);
    return "took";
  }
  if (c.phase === "reveal" && !c.shown?.[pid] && !c.real?.includes(pid) && mail.n && checked) {
    const good = mail.c === c.commits?.[pid] && mail.n.length === st.lives[pid] && checked === c.commits?.[pid];
    // a phone that doesn't match what it locked in is caught: its dice don't count
    const dice = good ? combine(mail.n, c.host?.[pid] ?? []) : [];
    const next = { ...c, shown: { ...c.shown, [pid]: dice }, cheats: good ? c.cheats : [...(c.cheats ?? []), pid] };
    game.cups = next;
    if (waitingOn(next, st.alive).length || next.real?.length) return "took";
    countCall(game);
    return "counted";
  }
  return null;
}

/** a phone dropped: that player rolls real dice this round, and the host types their count on a call */
export function toRealDice(game: Game, pid: string) {
  const c = activeCups(game);
  if (!c) return;
  game.cups = { ...c, real: [...new Set([...(c.real ?? []), pid])], commits: Object.fromEntries(Object.entries(c.commits ?? {}).filter(([k]) => k !== pid)) };
  logEvent(game, t("gamePlay.dice.cups.realLog", { name: playerName(game, pid) }));
  dealIfReady(game);
}

/** someone called: every phone shows its numbers */
export function callForReveal(game: Game, call: Call) {
  const c = activeCups(game);
  if (!c) return;
  game.cups = { ...c, phase: "reveal", call };
  const said = { caller: playerName(game, call.caller), bid: faceCount(call.bid.count, call.bid.face) };
  flash(game, call.call === "liar" ? t("gamePlay.dice.cups.liarFlash", said) : t("gamePlay.dice.cups.spotFlash", said), "liar");
}

/**
 * count the call: every cup that's shown, plus what the host typed for anyone
 * on real dice. a phone that was caught loses the round (and only they do).
 */
export function countCall(game: Game, realCounts: Record<string, number | null> = {}) {
  const c = activeCups(game);
  const call = c?.call;
  if (!c || !call || c.phase !== "reveal" || !game.dice) return;
  const st = diceState(game);
  let actual = 0;
  for (const [id, dice] of Object.entries(c.shown ?? {})) if (!c.real?.includes(id)) actual += dice.filter((d) => countsToward(d, call.bid.face, st.wild)).length;
  // no more of a face than the dice that player has
  for (const id of c.real ?? []) if (st.alive.includes(id)) actual += Math.min(st.lives[id], Math.max(0, Math.round(realCounts[id] ?? 0)));
  const cheats = (c.cheats ?? []).filter((id) => st.alive.includes(id));
  const reveal = Object.fromEntries(Object.entries(c.shown ?? {}).filter(([, d]) => d.length));
  const judged = judge(game.dice, { ...call, actual }, st.alive);
  if (!cheats.length) return addRound(game, { ...call, actual, ...judged, reveal, at: Date.now() });
  // the dice a cheat loses go to whoever won the call (or the next one who played fair)
  const winner = [judged.winner, call.bidder, call.caller, ...st.alive].find((id) => !cheats.includes(id));
  addRound(game, { ...call, actual, losers: cheats, winner, reveal, cheats, at: Date.now() });
  if (!game.finished) flash(game, tp("gamePlay.dice.cups.caughtFlash", cheats.length, { names: cheats.map((id) => playerName(game, id)).join(", ") }), "bust");
}

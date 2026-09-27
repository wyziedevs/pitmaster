// what the dealer screen does to a pot game. each action is one event, told
// to the room; the pot and everyone's money come from the events (engine.ts).
import type { Game, PotEvent } from "$lib/types";
import { flash, logEvent, playerName } from "$lib/events";
import { money, round2 } from "$lib/util";
import { t } from "$lib/i18n";
import { potCap, potState } from "./engine";


/** what an event was, in words (the tv writes its recent ones from these: it never gets the log) */
export function eventText(game: Game, e: PotEvent, round = 0) {
  const who = e.players[0] ?? "";
  const amount = money(e.amount);
  if (e.kind === "ante") return t("gamePlay.pot.anteLog", { amount, n: String(round) });
  if (e.kind === "match") return t("gamePlay.pot.matchLog", { names: e.players.map((id) => playerName(game, id)).join(", "), amount });
  if (e.kind === "take") return t(e.note === "win" ? "gamePlay.pot.winLog" : e.note === "pot" ? "gamePlay.pot.takePotLog" : "gamePlay.pot.takeLog", { name: playerName(game, who), amount });
  if (e.note === "post") return t("gamePlay.pot.postLog", { name: playerName(game, who), amount });
  return t(e.note === "lose" ? "gamePlay.pot.loseLog" : "gamePlay.pot.payLog", { name: playerName(game, who), amount });
}

/** one move: one or more events that share its time (so undo takes them back together), a log line for each, and the tv hears about it */
function add(game: Game, events: Omit<PotEvent, "at">[], kind: Parameters<typeof flash>[2]) {
  if (game.finished) return;
  // (only an ante needs the round: it starts the next one)
  const round = potState(game).rounds + 1;
  const at = Date.now();
  if (!game.potEvents) game.potEvents = [];
  for (const e of events) game.potEvents.push({ ...e, at });
  if (!game.clock.startedAt) game.clock.startedAt = at;
  const texts = events.map((e) => eventText(game, { ...e, at }, round));
  for (const text of texts) logEvent(game, text);
  flash(game, texts.join(" · "), kind);
}

/** a new round: everyone antes */
export function anteUp(game: Game) {
  const s = game.pot!;
  if (!(s.ante > 0) || !game.players.length) return;
  add(game, [{ kind: "ante", players: game.players.map((p) => p.id), amount: s.ante }], "chips");
}

/** in-between: a bet, won (taken from the pot), lost (paid in) or posted (paid in twice) */
export function bet(game: Game, id: string, amount: number, result: "win" | "lose" | "post") {
  const a = round2(Math.min(Math.max(0, amount), potCap(game.pot!, potState(game).pot)));
  if (!(a > 0)) return;
  if (result === "win") add(game, [{ kind: "take", players: [id], amount: a, note: "win" }], "money");
  else add(game, [{ kind: "pay", players: [id], amount: result === "post" ? round2(a * 2) : a, note: result }], "bust");
}

/** someone puts money in (a lost hand, a fine, a pig out) */
export function pay(game: Game, id: string, amount: number) {
  const a = round2(Math.max(0, amount));
  if (a > 0) add(game, [{ kind: "pay", players: [id], amount: a }], "chips");
}

/** someone takes money out (a won hand), never more than the pot */
export function take(game: Game, id: string, amount: number) {
  const a = round2(Math.min(Math.max(0, amount), potState(game).pot));
  if (a > 0) add(game, [{ kind: "take", players: [id], amount: a }], "money");
}

/** the winner takes the whole pot */
export function takePot(game: Game, id: string) {
  const pot = potState(game).pot;
  if (pot > 0) add(game, [{ kind: "take", players: [id], amount: pot, note: "pot" }], "win");
}

/**
 * losers match the pot (guts, bourre): each puts in what's in it now, up to
 * the limit. the hand's winner, if there is one, takes the pot first, so what
 * they match is the next pot
 */
export function matchPot(game: Game, ids: string[], winner?: string) {
  const pot = potState(game).pot;
  const cost = potCap(game.pot!, pot);
  const losers = ids.filter((id) => id !== winner);
  if (!losers.length || !(cost > 0)) return;
  const match = { kind: "match" as const, players: losers, amount: cost };
  if (!winner) add(game, [match], "bust");
  else add(game, [{ kind: "take", players: [winner], amount: pot, note: "pot" }, match], "win");
}

/** takes back the last move (every event it made), unless the game's over */
export function undoPot(game: Game) {
  const events = game.potEvents ?? [];
  const at = events.at(-1)?.at;
  if (at === undefined || game.finished) return;
  while (events.at(-1)?.at === at) events.pop();
  logEvent(game, t("gamePlay.pot.undoLog"));
}

/** the game's over: whatever's left in the pot goes back out (engine.ts says how) */
export function endPot(game: Game) {
  const left = potState(game).left;
  game.finished = true;
  game.endedAt = Date.now();
  const text = left > 0.004 ? t(game.pot!.leftover === "back" ? "gamePlay.pot.endBackLog" : "gamePlay.pot.endSplitLog", { amount: money(left) }) : t("gamePlay.pot.endLog");
  logEvent(game, text);
  flash(game, text, "money");
}

/** back on: a game ended by mistake */
export function reopenPot(game: Game) {
  game.finished = false;
  game.endedAt = undefined;
}

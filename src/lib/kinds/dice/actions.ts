// what the dealer screen does to a liar's dice game: a round goes in (and is
// told to the room), or the last one comes back out. everything else is
// worked out from the rounds (engine.ts).
import type { DiceRound, Game } from "$lib/types";
import { finish, reopen } from "$lib/game";
import { flash, logEvent, playerName } from "$lib/events";
import { ordinal } from "$lib/util";
import { t, tp } from "$lib/i18n";
import { diceState } from "./engine";

const names = (game: Game, ids: string[]) => ids.map((id) => playerName(game, id)).join(", ");

/** "7 fours" */
export const faceCount = (count: number, face: number) => tp(`gamePlay.dice.faceCount.f${face}`, count);

/** what happened in a round, in a sentence for the log and the tv */
export function roundText(game: Game, r: DiceRound) {
  const lost = r.losers.length ? tp("gamePlay.dice.losesDie", r.losers.length, { names: names(game, r.losers) }) : "";
  const gained = r.gains?.length ? t("gamePlay.dice.getsDieBack", { names: names(game, r.gains) }) : "";
  const result = [lost, gained].filter(Boolean).join(" ");
  if (!r.call || !r.bid || r.actual === undefined) return result;
  const bid = faceCount(r.bid.count, r.bid.face);
  if (r.call === "liar") return t("gamePlay.dice.liarText", { caller: playerName(game, r.caller), bid, actual: String(r.actual), result });
  return t(r.actual === r.bid.count ? "gamePlay.dice.spotRightText" : "gamePlay.dice.spotWrongText", { caller: playerName(game, r.caller), bid, actual: String(r.actual), result });
}

/**
 * a round is played: in it goes, and the room hears about it. the biggest
 * news wins the tv: the winner, then someone out of dice, then the call
 * itself, then a palifico round coming up.
 */
export function addRound(game: Game, r: DiceRound) {
  const before = diceState(game);
  // it's over once one player has dice left
  if (before.over || game.finished) return;
  if (!game.rounds) game.rounds = [];
  game.rounds.push(r);
  // the night starts with its first round, if the host didn't start it
  if (!game.clock.startedAt) game.clock.startedAt = r.at;
  const after = diceState(game);
  const text = roundText(game, r);
  logEvent(game, t("gamePlay.dice.roundLog", { n: String(game.rounds.length), text }));
  const out = before.alive.filter((id) => after.lives[id] === 0);
  if (after.over) {
    const champ = game.players.find((p) => after.places[p.id] === 1);
    finish(game, r.at);
    const w = t("gameEvents.wins", { name: champ?.name ?? "?" });
    logEvent(game, w);
    flash(game, w, "win");
  } else if (out.length) {
    const place = after.places[out[0]] ?? 0;
    flash(game, `${r.call ? `${text} · ` : ""}${tp("gamePlay.dice.outOfDice", out.length, { names: names(game, out), place: ordinal(place) })}`, "bust");
  } else if (r.call) flash(game, text, "liar");
  else if (after.palifico) flash(game, t("gamePlay.dice.palificoFlash", { name: playerName(game, after.palifico) }), "note");
  else flash(game, text, "liar");
}

/** takes back the last round (it's the only one that can come back out on its own) */
export function undoRound(game: Game) {
  const r = game.rounds?.pop();
  if (!r) return;
  reopen(game);
  logEvent(game, t("gamePlay.dice.undoLog", { n: String(game.rounds!.length + 1) }));
}

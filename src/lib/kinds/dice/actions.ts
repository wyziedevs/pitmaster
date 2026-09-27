// what the dealer screen does to a liar's dice game: a round goes in (and is
// told to the room), or the last one comes back out. everything else is
// worked out from the rounds (engine.ts).
import type { DiceRound, Game } from "$lib/types";
import { flash, playerName } from "$lib/events";
import { ordinal } from "$lib/util";
import { t, tp } from "$lib/i18n";
import { playRound, takeBackRound } from "../lastStanding";
import { called, diceState } from "./engine";
import { nextRound } from "./cups";

const names = (game: Game, ids: string[]) => ids.map((id) => playerName(game, id)).join(", ");

/** "7 fours" */
export const faceCount = (count: number, face: number) => tp(`gamePlay.dice.faceCount.f${face}`, count);

/** what happened in a round, in a sentence for the log and the tv */
export function roundText(game: Game, r: DiceRound) {
  const lost = r.losers.length ? tp("gamePlay.dice.losesDie", r.losers.length, { names: names(game, r.losers) }) : "";
  const gained = r.gains?.length ? t("gamePlay.dice.getsDieBack", { names: names(game, r.gains) }) : "";
  const result = [lost, gained].filter(Boolean).join(" ");
  if (!called(r)) return result;
  const bid = faceCount(r.bid.count, r.bid.face);
  if (r.call === "liar") return t("gamePlay.dice.liarText", { caller: playerName(game, r.caller), bid, actual: String(r.actual), result });
  return t(r.actual === r.bid.count ? "gamePlay.dice.spotRightText" : "gamePlay.dice.spotWrongText", { caller: playerName(game, r.caller), bid, actual: String(r.actual), result });
}

/**
 * a round is played: in it goes, the room hears about it, and with phones
 * everyone rolls again. the biggest news wins the tv: the winner, then
 * someone out of dice, then a palifico round coming up, then the round itself.
 */
export function addRound(game: Game, r: DiceRound) {
  const text = roundText(game, r);
  const rounds = () => {
    if (!game.rounds) game.rounds = [];
    return game.rounds;
  };
  playRound(game, { state: diceState, rounds, log: (n) => t("gamePlay.dice.roundLog", { n: String(n), text }) }, r, (after, out) => {
    if (out.length) flash(game, `${r.call ? `${text} · ` : ""}${tp("gamePlay.dice.outOfDice", out.length, { names: names(game, out), place: ordinal(after.places[out[0]] ?? 0) })}`, "bust");
    // (a call is news enough by itself)
    else if (after.palifico && !r.call) flash(game, t("gamePlay.dice.palificoFlash", { name: playerName(game, after.palifico) }), "note");
    else flash(game, text, "liar");
  });
  nextRound(game);
}

/** takes back the last round; with phones, the dice left changed, so everyone rolls again */
export function undoRound(game: Game) {
  takeBackRound(game, game.rounds);
  nextRound(game);
}

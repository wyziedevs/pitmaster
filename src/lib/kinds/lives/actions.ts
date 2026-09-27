// what the dealer screen does to a lives game: a round goes in (and the room
// hears about it), or the last one comes back out.
import type { Game, LivesRound } from "$lib/types";
import { flash, playerName } from "$lib/events";
import { ordinal } from "$lib/util";
import { t, tp } from "$lib/i18n";
import { playRound, takeBackRound } from "../lastStanding";
import { livesState } from "./engine";

/** what a round did, in a sentence: "Bo loses a life. Cy loses two." */
export function roundText(game: Game, r: LivesRound) {
  return Object.entries(r.lost)
    .filter(([, n]) => n > 0)
    .map(([id, n]) => tp("gamePlay.lives.losesLives", n, { name: playerName(game, id) }))
    .join(" ");
}

/**
 * what a round can really cost: no more than each player has left, nothing
 * from anyone already out, and nothing from its winner (money per life goes
 * to them, so every life lost has to be paid to someone)
 */
function fairLost(game: Game, r: Pick<LivesRound, "lost" | "winner">) {
  const lives = livesState(game).lives;
  return Object.fromEntries(
    Object.entries(r.lost)
      .map(([id, n]) => [id, id === r.winner ? 0 : Math.min(Math.max(0, Math.round(n)), lives[id] ?? 0)] as const)
      .filter(([, n]) => n > 0)
  );
}

/** a round that would leave nobody with a life: last one standing needs one, so it's played again */
export const wipesOut = (game: Game, lost: Record<string, number>) => {
  const { alive, lives } = livesState(game);
  return alive.length > 0 && alive.every((id) => (lost[id] ?? 0) >= lives[id]);
};

/** a round is played: in it goes; the winner, then anyone out, gets the tv */
export function addLifeRound(game: Game, round: LivesRound) {
  const r = { ...round, lost: fairLost(game, round) };
  if (!Object.keys(r.lost).length || wipesOut(game, r.lost)) return;
  const text = roundText(game, r);
  const rounds = () => {
    if (!game.lifeRounds) game.lifeRounds = [];
    return game.lifeRounds;
  };
  playRound(game, { state: livesState, rounds, log: (n) => t("gamePlay.lives.roundLog", { n: String(n), text }) }, r, (after, out) => {
    if (!out.length) return flash(game, text, "chips");
    flash(game, `${text} ${tp("gamePlay.lives.outOfLives", out.length, { names: out.map((id) => playerName(game, id)).join(", "), place: ordinal(after.places[out[0]] ?? 0) })}`, "bust");
  });
}

/** takes back the last round */
export const undoLifeRound = (game: Game) => takeBackRound(game, game.lifeRounds);

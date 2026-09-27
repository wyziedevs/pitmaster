// what the dealer screen does to a lives game: a round goes in (and the room
// hears about it), or the last one comes back out.
import type { Game, LivesRound } from "$lib/types";
import { flash, logEvent } from "$lib/game";
import { ordinal } from "$lib/util";
import { t, tp } from "$lib/i18n";
import { livesState } from "./engine";

const name = (game: Game, id: string) => game.players.find((p) => p.id === id)?.name ?? "?";

/** what a round did, in a sentence: "Bo loses a life. Cy loses two." */
export function roundText(game: Game, r: LivesRound) {
  return Object.entries(r.lost)
    .filter(([, n]) => n > 0)
    .map(([id, n]) => tp("gamePlay.lives.losesLives", n, { name: name(game, id) }))
    .join(" ");
}

/** a round is played: in it goes; the winner, then anyone out, gets the tv */
export function addLifeRound(game: Game, r: LivesRound) {
  const before = livesState(game);
  if (before.over || game.finished || !Object.values(r.lost).some((n) => n > 0)) return;
  if (!game.lifeRounds) game.lifeRounds = [];
  game.lifeRounds.push(r);
  if (!game.clock.startedAt) game.clock.startedAt = r.at;
  const after = livesState(game);
  const text = roundText(game, r);
  logEvent(game, t("gamePlay.lives.roundLog", { n: String(game.lifeRounds.length), text }));
  const out = before.alive.filter((id) => after.lives[id] === 0);
  if (after.over) {
    const champ = game.players.find((p) => after.places[p.id] === 1);
    game.finished = true;
    game.endedAt = r.at;
    const w = t("gameEvents.wins", { name: champ?.name ?? "?" });
    logEvent(game, w);
    flash(game, w, "win");
  } else if (out.length) {
    flash(game, `${text} ${tp("gamePlay.lives.outOfLives", out.length, { names: out.map((id) => name(game, id)).join(", "), place: ordinal(after.places[out[0]] ?? 0) })}`, "bust");
  } else flash(game, text, "chips");
}

/** takes back the last round */
export function undoLifeRound(game: Game) {
  if (!game.lifeRounds?.pop()) return;
  game.finished = false;
  game.endedAt = undefined;
  logEvent(game, t("gamePlay.dice.undoLog", { n: String(game.lifeRounds.length + 1) }));
}

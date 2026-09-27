// what a game says as it goes: its log, the flash on every screen, and the
// names it says them with
import type { EventKind, Game } from "./types";
import { t } from "./i18n";

export function logEvent(game: Game, text: string) {
  game.log.unshift({ t: Date.now(), text });
  game.log = game.log.slice(0, 300);
}

export function flash(game: Game, text: string, kind: EventKind = "note") {
  game.flash = { text, at: Date.now(), kind };
}

/** a player by id, for the log and the screens (or `fallback` for no one) */
export const playerName = (game: Game, id: string | null | undefined, fallback = "?") => game.players.find((p) => p.id === id)?.name ?? fallback;

/** who rake, fees and prizes are owed to: the house the host named, or "The House" */
export const houseName = (game: Game) => game.house?.trim() || t("gameEvents.defaultHouseName");

import type { Game, GameChip, GameType, Level, Player } from "./types";
import { newClock } from "./clock";
import { money, uid } from "./util";
import { t } from "./i18n";
import { flash, logEvent } from "./events";
import { seatNewcomer } from "./seats";

/** when a game was played: when its clock started, or when it was made */
export const playedAt = (game: Game) => game.clock.startedAt ?? game.createdAt;
/** its day, for a spreadsheet: 2026-09-27 */
export const gameDate = (game: Game) => new Date(playedAt(game)).toISOString().slice(0, 10);

/** it's over (at `at`, or now) */
export function finish(game: Game, at = Date.now()) {
  game.finished = true;
  game.endedAt = at;
}

/** back on: the end was taken back */
export function reopen(game: Game) {
  game.finished = false;
  game.endedAt = undefined;
}

/** the rules only its kind reads: a tournament's structure, a cash game's stakes, the other kinds' own */
type Rules = Partial<Pick<Game, "tourney" | "cash" | "dice" | "lives" | "pot" | "casino">>;

/** a new game. the chips and the clock's levels are poker's; the other kinds leave them out */
export function newGame(p: { name: string; type: GameType; notes: string; players: string[]; chipSetName?: string; multiplier?: number; chips?: GameChip[]; levels?: Level[] } & Rules): Game {
  const now = Date.now();
  const game: Game = {
    id: uid(),
    name: p.name,
    type: p.type,
    createdAt: now,
    updatedAt: now,
    chipSetName: p.chipSetName ?? "",
    multiplier: p.multiplier ?? 1,
    chips: p.chips ?? [],
    notes: p.notes,
    players: [],
    clock: newClock(),
    levels: p.levels ?? [],
    tourney: p.tourney,
    cash: p.cash,
    dice: p.dice,
    lives: p.lives,
    pot: p.pot,
    casino: p.casino,
    message: null,
    flash: null,
    log: [],
    live: null,
    finished: false,
  };
  for (const name of p.players) addPlayer(game, name, true);
  logEvent(game, t("gameEvents.created"));
  return game;
}

function newPlayer(name: string): Player {
  return { id: uid(), name, cashIn: 0, cashOut: null, rebuys: 0, addOns: 0, out: false, place: null, bustedAt: null };
}

export function addPlayer(game: Game, name: string, quiet = false) {
  const p = newPlayer(name.trim() || `Seat ${game.players.length + 1}`);
  // a cash game buys them in and starts their clock
  if (game.cash) {
    p.cashIn = game.cash.defaultBuyIn;
    p.joinedAt = Date.now();
  }
  // seat them before they join the list: once pushed into a live game, writes
  // have to go through game.players, not this object
  seatNewcomer(game, p);
  game.players.push(p);
  if (!quiet) {
    logEvent(
      game,
      game.cash ? t("gameEvents.satDownWithAmount", { name: p.name, amount: money(p.cashIn) }) : t("gameEvents.registered", { name: p.name }),
    );
    flash(game, game.cash ? t("gameEvents.satDownFlash", { name: p.name }) : t("gameEvents.isInFlash", { name: p.name }), "chips");
  }
  return p;
}

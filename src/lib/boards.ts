// where a league game's standings come from for its tv snapshot. store.ts
// (which has every game) hands the source over when it loads; sync.ts asks it
// for each snapshot. it imports nothing, so it's ready whichever of the two
// loads first (they import each other, through the kinds of game).
import type { Game } from "./types";

let source: (g: Game) => Game["league"] = () => undefined;
export const setLeagueBoards = (fn: typeof source) => void (source = fn);
export const leagueBoardFor = (g: Game) => source(g);

// what every kind of game gives the rest of the app. the app asks a game's kind
// (kinds/index.ts) instead of branching on game.type, so a new kind is one
// folder here and one line in the registry.
import type { Component } from "svelte";
import type { Game, GameType, Player } from "$lib/types";
import type { Result } from "$lib/stats";

export type Owe = { from: string; to: string; amount: number };
export type Line = { text: string; tone?: "good" | "hot" };

export interface Kind {
  id: GameType;
  /** the short name on lists and pills: "Cash", "Tournament" */
  label: () => string;
  /** a filter's name for all of them: "Cash Games", "Tournaments" */
  plural: () => string;
  /** what starts one: "New Cash Game" */
  newLabel: () => string;
  /** the browser tab's title on its dealer screen (never the game's own name) */
  tabTitle: () => string;
  /** more words that find its New command in the palette */
  keywords: string;
  /**
   * a poker kind is played in chips from a chip set, on the blind clock, and
   * shares the new-game form (kinds/poker/Setup.svelte) and the poker board
   * on the tv (TvView draws it). any other kind brings its own of each.
   */
  poker: boolean;
  /** how its players are ranked in a league: by finishing place, or (no places, like cash) by what they won */
  ranks: "place" | "net";
  // its screens, loaded when they're needed (so a tv doesn't carry every
  // dealer screen, and nothing here imports a page)
  /** the new-game form: the whole page */
  Setup: () => Promise<{ default: Component<{ type: GameType }> }>;
  /** the dealer screen's controls */
  Control: () => Promise<{ default: Component<{ game: Game; persist: () => void }> }>;
  /** the tv board's middle, for a kind that isn't poker (TvView draws the poker ones) */
  Board?: () => Promise<{ default: Component<{ game: Game; narrow: boolean }> }>;

  /** its own settings on a game from outside (an import, a tv snapshot) are the right shape */
  check: (g: Record<string, unknown>) => boolean;
  /** each player's night, once it's final (see stats.ts) */
  results: (game: Game) => Result[];
  /** who pays who at the end: the fewest payments that square everyone up */
  settle: (game: Game) => Owe[];
  /** it's over, so what's owed counts */
  settled: (game: Game) => boolean;
  /** someone who still needs a chair (seats and table balancing) */
  playing: (game: Game, p: Player) => boolean;
  /** the recap's lines after the title, and the spreadsheet */
  recap: (game: Game) => string[];
  csv: (game: Game) => string;
  /** a line for the games list: the setup, and (running) what it's doing now */
  summary: (game: Game, running: boolean) => string;
  now: (game: Game, at: number) => string;
  /** who won and by how much, in a line */
  headline: (game: Game) => string;
  /** one player's result in a line, for their history on Players */
  describe: (r: Result) => string;
  /** what Find Me says about someone on a phone */
  find: (game: Game, p: Player) => Line[];
}

// the poker games PitMaster knows, and how each is bet and dealt. a level (or a
// cash game) says which game it is by id; one that says nothing is No Limit
// Hold'em. limit games read the big blind as the small bet and twice it as the
// big bet, so a level's numbers mean the same thing whatever's being played.
import type { CashSettings } from "./types";
import { amt, money } from "./util";
import { t } from "./i18n";

/** no limit, pot limit or fixed limit */
export type Betting = "nl" | "pl" | "fl";

export interface Variant {
  id: string;
  /** what the table calls it, the same in every language */
  short: string;
  betting: Betting;
  /** blinds, or stud's ante and bring-in */
  structure: "blinds" | "stud";
}

export const VARIANTS: Variant[] = [
  { id: "nlhe", short: "NLHE", betting: "nl", structure: "blinds" },
  { id: "plhe", short: "PLHE", betting: "pl", structure: "blinds" },
  { id: "lhe", short: "LHE", betting: "fl", structure: "blinds" },
  { id: "plo", short: "PLO", betting: "pl", structure: "blinds" },
  { id: "plo5", short: "PLO5", betting: "pl", structure: "blinds" },
  { id: "plo8", short: "PLO8", betting: "pl", structure: "blinds" },
  { id: "bigo", short: "Big O", betting: "pl", structure: "blinds" },
  { id: "o8", short: "O8", betting: "fl", structure: "blinds" },
  { id: "stud", short: "Stud", betting: "fl", structure: "stud" },
  { id: "stud8", short: "Stud 8", betting: "fl", structure: "stud" },
  { id: "razz", short: "Razz", betting: "fl", structure: "stud" },
  { id: "td27", short: "2-7 TD", betting: "fl", structure: "blinds" },
  { id: "sd27", short: "NL 2-7", betting: "nl", structure: "blinds" },
  { id: "badugi", short: "Badugi", betting: "fl", structure: "blinds" },
  { id: "fcd", short: "5CD", betting: "fl", structure: "blinds" },
];

/** the mixed games everyone knows, in their usual order */
export const ROTATIONS: { id: string; games: string[] }[] = [
  { id: "horse", games: ["lhe", "o8", "razz", "stud", "stud8"] },
  { id: "hose", games: ["lhe", "o8", "stud", "stud8"] },
  { id: "eight", games: ["td27", "lhe", "o8", "razz", "stud", "stud8", "nlhe", "plo"] },
  { id: "ho", games: ["nlhe", "plo"] },
];

const NLHE = VARIANTS[0];
export const variant = (id: string | undefined) => VARIANTS.find((v) => v.id === id) ?? NLHE;
export const isVariant = (id: unknown) => typeof id === "string" && VARIANTS.some((v) => v.id === id);
/** the game's full name, in the reader's language */
export const variantName = (id: string | undefined) => t(`common.variants.${variant(id).id}`);
/** the known mix these games are, in its order (HORSE, 8-Game), if they're one */
export const rotationOf = (games: string[]) => ROTATIONS.find((x) => x.games.length === games.length && x.games.every((g, i) => g === games[i]));
/** the name of a known mix (HORSE, 8-Game), or null for one of the host's own */
export function rotationName(games: string[]) {
  const r = rotationOf(games);
  return r ? t(`common.rotations.${r.id}`) : null;
}
/** "LHE, O8, Razz": the games by the names the table calls them */
export const shortList = (games: string[]) => games.map((g) => variant(g).short).join(", ");
/** the games in words: one's full name, or several as dealer's choice (cash) or the mix (a tournament: HORSE, or the list) */
export function gamesLabel(games: string[], cash: boolean) {
  if (games.length === 1) return variantName(games[0]);
  return cash ? `${t("gameSetup.variants.dealersChoice")} (${shortList(games)})` : (rotationName(games) ?? shortList(games));
}
/** a stud game: an ante and a bring-in instead of blinds */
export const isStud = (id: string | undefined) => variant(id).structure === "stud";
export const isLimit = (id: string | undefined) => variant(id).betting === "fl";

/** a stud game's ante and bring-in for a small bet: a fifth and two fifths of it, in the smallest chip (at least one) */
export function studAmounts(smallBet: number, unit: number) {
  const r = (x: number) => Math.max(unit, Math.round(x / unit) * unit);
  return { ante: +r(smallBet / 5).toFixed(4), bringIn: +r((smallBet * 2) / 5).toFixed(4) };
}

/** a level or cash game's numbers, for one line of text */
export interface Stakes {
  game?: string;
  sb: number;
  bb: number;
  ante?: number;
  bringIn?: number;
}

/** a number the way the stakes write it: money in a cash game, chips in a tournament */
const figure = (cash: boolean) => (n: number) => (cash ? money(n) : amt(n));

/**
 * what the table is playing for, written the way that kind of game says it:
 *   no limit and pot limit: the blinds, "1/2"
 *   limit:                  the small and big bet, "2/4"
 *   stud:                   "Ante 1, Bring-In 2 · 5/10"
 * `cash` writes them as money.
 */
export function stakesText(s: Stakes, cash = false) {
  const f = figure(cash);
  const pair = stakePair(s).map(f).join("/");
  if (isStud(s.game)) return `${studLine(s, cash)} · ${pair}`;
  if (isLimit(s.game) || !s.ante) return pair;
  return `${pair} · ${t("common.stakes.anteLine", { ante: f(s.ante) })}`;
}

/** the two numbers it's played for: the blinds, or (limit and stud) the small and big bet */
export const stakePair = (s: Stakes): [number, number] => (variant(s.game).betting === "fl" ? [s.bb, s.bb * 2] : [s.sb, s.bb]);

/** stud's ante and bring-in, "Ante 1, Bring-In 2" */
export function studLine(s: Pick<Stakes, "ante" | "bringIn">, cash = false) {
  const f = figure(cash);
  return t("common.stakes.studLine", { ante: f(s.ante ?? 0), bringIn: f(s.bringIn ?? 0) });
}

/** "PLO · 1/2", "Stud · Ante 1, Bring-In 2 · 5/10" */
export const gameLine = (s: Stakes, cash = false) => `${variant(s.game).short} · ${stakesText(s, cash)}`;

// ---------- dealer's choice ----------

/** the games, or hold'em when there are none */
export const orHoldem = (games: string[] | undefined) => (games?.length ? games : ["nlhe"]);
/** a cash game's games: dealer's choice when there's more than one */
export const cashGames = (c: CashSettings) => orHoldem(c.games);

/**
 * what a cash game is playing after `played` ms: the one picked, moved on one
 * every rotateMinutes since it was picked (0 = the host moves it by hand)
 */
export function cashGameNow(c: CashSettings, played: number) {
  const games = cashGames(c);
  const at = Math.max(0, games.indexOf(c.current ?? games[0]));
  const every = (c.rotateMinutes ?? 0) * 60000;
  const steps = every > 0 ? Math.floor(Math.max(0, played - (c.since ?? 0)) / every) : 0;
  const index = (at + steps) % games.length;
  const next = games[(index + 1) % games.length];
  // how long until it moves on by itself (null: the host moves it)
  const nextIn = every > 0 && games.length > 1 ? every - (Math.max(0, played - (c.since ?? 0)) % every) : null;
  return { id: games[index], index, next, nextIn };
}

/** the stakes a cash game is playing right now */
export const cashStakes = (c: CashSettings, game: string): Stakes => ({ game, sb: c.sb, bb: c.bb, ante: isStud(game) ? c.ante : 0, bringIn: c.bringIn });

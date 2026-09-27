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
/** the name of a known mix (HORSE, 8-Game), or null for one of the host's own */
export function rotationName(games: string[]) {
  const r = ROTATIONS.find((x) => x.games.length === games.length && x.games.every((g, i) => g === games[i]));
  return r ? t(`common.rotations.${r.id}`) : null;
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
interface Stakes {
  game?: string;
  sb: number;
  bb: number;
  ante?: number;
  bringIn?: number;
}

/**
 * what the table is playing for, written the way that kind of game says it:
 *   no limit and pot limit: the blinds, "1/2"
 *   limit:                  the small and big bet, "2/4"
 *   stud:                   "Ante 1, Bring-In 2 · 5/10"
 * `cash` writes them as money.
 */
export function stakesText(s: Stakes, cash = false) {
  const f = (n: number) => (cash ? money(n) : amt(n));
  const v = variant(s.game);
  if (v.structure === "stud")
    return `${t("common.stakes.studLine", { ante: f(s.ante ?? 0), bringIn: f(s.bringIn ?? 0) })} · ${f(s.bb)}/${f(s.bb * 2)}`;
  if (v.betting === "fl") return `${f(s.bb)}/${f(s.bb * 2)}`;
  return `${f(s.sb)}/${f(s.bb)}${s.ante ? ` · ${t("common.stakes.anteLine", { ante: f(s.ante) })}` : ""}`;
}

/** "PLO · 1/2", "Stud · Ante 1, Bring-In 2 · 5/10" */
export const gameLine = (s: Stakes, cash = false) => `${variant(s.game).short} · ${stakesText(s, cash)}`;

// ---------- dealer's choice ----------

/** a cash game's games: dealer's choice when there's more than one */
export const cashGames = (c: CashSettings) => (c.games?.length ? c.games : ["nlhe"]);

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

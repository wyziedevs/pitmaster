// running a game back: straight away (rerun), or through its kind's form
// (tweak and rerun: /new?type=<kind>&from=<id>), which starts from its setup
import { page } from "$app/state";
import { getGame, getLeagues } from "./store";
import { newGame } from "./game";
import { inSeason } from "./stats";
import { nameKey } from "./util";
import { toast } from "./toast.svelte";
import type { Game, GameType, League } from "./types";
import { t } from "./i18n";

/** its players once each, in the order they came */
export const namesOf = (g: Game) => [...new Map(g.players.map((p) => [nameKey(p.name), p.name.trim()])).values()];

/** its league, while that season's still on and still takes this kind of game */
export const leagueOf = (g: Game, leagues: League[]) =>
  g.leagueId && leagues.some((l) => l.id === g.leagueId && l.types.includes(g.type) && inSeason(l, Date.now())) ? g.leagueId : undefined;

/** a fresh game with the same setup and the same people: chips, structure, buy-ins, and its kind's own rules (their rounds start over) */
export function rerun(game: Game): Game {
  const { name, type, chipSetName, multiplier, chips, notes, levels, tourney, cash, dice, lives, pot, casino } = structuredClone(game);
  const g = newGame({ name, type, chipSetName, multiplier, chips, notes, levels, tourney, cash, dice, lives, pot, casino, players: namesOf(game) });
  g.from = game.id;
  g.seatsPerTable = game.seatsPerTable;
  g.house = game.house;
  g.leagueId = leagueOf(game, getLeagues());
  // cash regulars named up front shouldn't be on the clock before the game starts
  for (const p of g.players) p.joinedAt = undefined;
  return g;
}

/** the game a tweak and rerun starts from, if it's still here and the same kind (says so either way) */
export function copyFrom(id: string | null, type: GameType): Game | null {
  if (!id) return null;
  const g = getGame(id);
  if (!g || g.type !== type) {
    toast(t("gameSetup.alerts.gameGone"), "bad");
    return null;
  }
  toast(t("gameSetup.alerts.copiedSetup", { name: g.name }), "info");
  return g;
}

/** the game in ?from=, for a kind's own form */
export const startFrom = (type: GameType) => copyFrom(page.url.searchParams.get("from"), type);

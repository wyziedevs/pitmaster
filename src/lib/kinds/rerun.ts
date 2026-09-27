// tweak and rerun for the kinds with their own forms: the earlier game a new
// game starts from (/new?type=dice&from=<id>), and the league it keeps
import { page } from "$app/state";
import { getGame } from "$lib/store";
import { inSeason } from "$lib/stats";
import { nameKey } from "$lib/util";
import { toast } from "$lib/toast.svelte";
import type { Game, GameType, League } from "$lib/types";
import { t } from "$lib/i18n";

/** the game in ?from=, if it's still here and the same kind (says so either way) */
export function startFrom(type: GameType): Game | null {
  const id = page.url.searchParams.get("from");
  if (!id) return null;
  const g = getGame(id);
  if (!g || g.type !== type) {
    toast(t("gameSetup.alerts.gameGone"), "bad");
    return null;
  }
  toast(t("gameSetup.alerts.copiedSetup", { name: g.name }), "info");
  return g;
}

/** its players once each, one to a line, ready for the names box */
export const namesOf = (g: Game) => [...new Map(g.players.map((p) => [nameKey(p.name), p.name.trim()])).values()].join("\n");

/** its league, while that season's still on */
export const leagueOf = (g: Game | null, leagues: League[]) => (g?.leagueId && leagues.some((l) => l.id === g.leagueId && inSeason(l, Date.now())) ? g.leagueId : null);

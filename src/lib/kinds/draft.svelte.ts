// a new game on its way, for the kinds with their own form (SetupShell): its
// name, who's playing, the notes and the league. a tweak and rerun
// (?from=<id>) starts it from that game's setup.
import { goto } from "$app/navigation";
import { saveGame, getLeagues, knownPlayers } from "$lib/store";
import { newGame } from "$lib/game";
import { currentLeague } from "$lib/stats";
import { leagueOf, namesOf, startFrom } from "$lib/rerun";
import { settings, houseRules } from "$lib/settings.svelte";
import { nameKey } from "$lib/util";
import type { Game, GameType } from "$lib/types";

export class Draft {
  /** the game a tweak and rerun starts from */
  readonly src: Game | null;
  /** the league that's on for this kind of game, if there is one */
  readonly leagues;
  /** regulars one click away, most games first */
  readonly regulars = knownPlayers().slice(0, 16);
  /** the host's own name for it (until then it's the kind's) */
  name = $state<string | null>(null);
  playerNames = $state("");
  notes = $state("");
  leagueId = $state("");
  readonly names = $derived(
    this.playerNames
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean),
  );
  readonly unlisted = $derived(this.regulars.filter((r) => !this.names.some((n) => nameKey(n) === nameKey(r.name))));

  constructor(readonly type: GameType) {
    this.src = startFrom(type);
    this.leagues = getLeagues().filter((l) => l.types.includes(type));
    const src = this.src;
    this.name = src?.name ?? null;
    this.playerNames = src ? namesOf(src).join("\n") : "";
    this.notes = src ? src.notes : settings.rulesOnNew ? houseRules().join("\n") : "";
    this.leagueId = (src && leagueOf(src, this.leagues)) ?? currentLeague(this.leagues, type)?.id ?? "";
  }

  addRegular(n: string) {
    this.playerNames = (this.playerNames.trim() ? this.playerNames.trim() + "\n" : "") + n;
  }

  /** deal it: the kind's own rules go in with the rest */
  create(defaultName: string, rules: Pick<Game, "dice" | "lives" | "pot">) {
    const g = newGame({ name: this.name?.trim() || defaultName, type: this.type, notes: this.notes, players: this.names, ...rules });
    if (this.src) g.from = this.src.id;
    if (this.leagues.some((l) => l.id === this.leagueId)) g.leagueId = this.leagueId;
    saveGame(g);
    goto(`/game/${g.id}`);
  }
}

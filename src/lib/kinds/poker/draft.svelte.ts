// a poker game on its way: what cash games and tournaments share on the form
// (the name, the league, the chips, the game, who's playing and the notes),
// each type's own draft, and what the night adds. the form stays up when the
// type changes, so both types' drafts do too.
import { page } from "$app/state";
import { goto } from "$app/navigation";
import { getChipSets, getDefaultChipSetId, getGames, getLeagues, getTemplate, knownPlayers, saveGame } from "$lib/store";
import { currentLeague } from "$lib/stats";
import { copyFrom, leagueOf, namesOf } from "$lib/rerun";
import { gameChips, unitOf } from "$lib/chips";
import { newGame, unusedSeats } from "$lib/game";
import { getPreset } from "$lib/presets";
import { nameKey } from "$lib/util";
import { toast } from "$lib/toast.svelte";
import { settings, houseRules } from "$lib/settings.svelte";
import { t } from "$lib/i18n";
import type { GameType, Template } from "$lib/types";
import { Features, type Feature } from "./features.svelte";
import { GamePick } from "./games.svelte";
import { CashDraft } from "../cash/draft.svelte";
import { TourneyDraft } from "../tournament/draft.svelte";

/** what a template or an old game brings to the form */
type Setup = Pick<Template, "multiplier" | "notes" | "players" | "levels" | "tourney" | "cash"> & { chipSetId?: string; name?: string };

const day = new Date().toLocaleDateString(settings.language, { weekday: "long" });

export class PokerDraft {
  readonly sets = getChipSets();
  readonly features = new Features();
  readonly pick = new GamePick();
  readonly cash = new CashDraft(this.features, this.pick);
  readonly tourney = new TourneyDraft(this.features, this.pick, () => this.chips);

  name = $state("");
  // every new game starts with the default set (Settings > Chip Sets)
  chipSetId = $state(getDefaultChipSetId() || this.sets[0]?.id);
  multiplier = $state(1);
  playerNames = $state("");
  // the house rules ride along on every new game unless the host said not to
  notes = $state(settings.rulesOnNew ? houseRules().join("\n") : "");
  /** satellite seats brought in: each winner's name, and the game they won it in */
  tickets = $state<Record<string, string>>({});
  /** the last name filled in for them (in whatever language), so a name the host typed is left alone */
  #named = "";
  /** the last ?template=, ?from= and ?preset= loaded */
  #loaded = "";

  constructor(readonly typeOf: () => GameType) {}

  get type() {
    return this.typeOf();
  }
  readonly isCash = $derived(this.type === "cash");
  readonly chipSet = $derived(this.sets.find((s) => s.id === this.chipSetId) ?? this.sets[0]);
  readonly chips = $derived(this.chipSet ? gameChips(this.chipSet, this.multiplier) : []);
  readonly names = $derived(
    this.playerNames
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean),
  );
  // "Friday Cash Game": the day, not "night", since plenty of games run in the afternoon
  readonly defaultName = $derived(`${day} ${this.isCash ? t("gameSetup.header.cashGame") : t("gameSetup.header.tournament")}`);

  // the league it counts toward: the one that's on for this type of game (until the host picks another)
  readonly #leagues = getLeagues();
  readonly leagues = $derived(this.#leagues.filter((l) => l.types.includes(this.type)));
  leagueId = $derived(currentLeague(this.#leagues, this.type)?.id ?? "");

  // regulars one click away, most games first; anyone already listed drops out
  readonly #regulars = knownPlayers().slice(0, 16);
  readonly unlisted = $derived(this.#regulars.filter((r) => !this.names.some((n) => nameKey(n) === nameKey(r.name))));
  // seats won in satellites come in with their buy-in paid by the ticket
  readonly #seatWinners = $derived(this.isCash ? [] : unusedSeats(getGames()));
  /** each satellite's winners not brought in yet */
  readonly seatsWaiting = $derived(
    this.#seatWinners.map((w) => ({ ...w, winners: w.winners.filter((p) => this.tickets[nameKey(p.name)] !== w.game.id) })).filter((w) => w.winners.length),
  );
  readonly rulesMissing = $derived(houseRules().some((r) => !this.notes.includes(r)));

  /** a new chip set, or a new type: its defaults, and the name if the host hasn't typed their own */
  applyDefaults() {
    const set = this.chipSet;
    if (!set) return;
    if (!this.name || this.name === this.#named) this.name = this.defaultName;
    this.#named = this.defaultName;
    const unit = unitOf(gameChips(set));
    if (this.isCash) {
      this.multiplier = 1;
      this.cash.defaults(unit);
    } else {
      // coin chips (25¢, 50¢…) read as 25, 50… ; dollar chips play at face value
      this.multiplier = unit < 1 ? 100 : 1;
      this.tourney.defaults(gameChips(set, this.multiplier));
    }
  }

  useSet(id: string) {
    this.chipSetId = id;
    this.applyDefaults();
  }

  /** the type changed (the switch link, back or forward): a game it can play, and its defaults */
  retype() {
    this.pick.fit(this.isCash);
    this.applyDefaults();
  }

  addRegular(n: string) {
    this.playerNames = (this.playerNames.trim() ? this.playerNames.trim() + "\n" : "") + n;
  }

  addWinners(from: string, winners: { name: string }[]) {
    for (const p of winners) {
      if (!this.names.some((n) => nameKey(n) === nameKey(p.name))) this.addRegular(p.name);
      this.tickets[nameKey(p.name)] = from;
    }
  }

  addHouseRules() {
    const add = houseRules().filter((r) => !this.notes.includes(r));
    this.notes = [this.notes.trim(), ...add].filter(Boolean).join("\n");
  }

  /** added for just this game */
  add(f: Feature) {
    this.features.tonight[f] = true;
    // a rake added for the night should rake something
    if (f === "rake" && this.cash.rakeMode === "none") this.cash.rakeMode = "pot";
  }

  /** taken back off this game, with what it had set */
  drop(f: Feature) {
    this.features.tonight[f] = false;
    if (f === "variants") this.pick.pick = "nlhe";
    if (f === "rake") this.cash.rakeMode = "none";
    if (f === "format") {
      this.tourney.satelliteOn = false;
      this.tourney.format = "standard";
    }
  }

  /** a template or an old game, on the form (the chip set's defaults don't then stomp on it) */
  fill(x: Setup) {
    if (x.chipSetId && this.sets.some((s) => s.id === x.chipSetId)) this.chipSetId = x.chipSetId;
    this.multiplier = x.multiplier;
    this.notes = x.notes;
    this.playerNames = x.players.join("\n");
    if (x.name) this.name = x.name;
    if (x.cash) this.cash.fill(x.cash, x.players.length);
    if (x.tourney) this.tourney.fill(x.tourney);
    this.tourney.edited = x.levels?.length ? x.levels : null;
    this.pick.fit(this.isCash);
  }

  /** a template, a preset or an old game to start from (?template=, ?preset=, ?from=), each once */
  load(q: URLSearchParams) {
    const [tid, gid, pid] = [q.get("template"), q.get("from"), q.get("preset")];
    const key = `${tid}|${gid}|${pid}`;
    if (key === this.#loaded || (!tid && !gid && !pid)) return;
    this.#loaded = key;
    if (pid) {
      const p = getPreset(pid);
      if (!p || this.isCash) return void toast(t("gameSetup.alerts.presetGone"), "bad");
      this.tourney.preset(p);
      toast(t("gameSetup.alerts.loadedTemplate", { name: t(`gameSetup.header.presets.${p.id}`) }), "info");
    } else if (tid) {
      const tpl = getTemplate(tid);
      if (!tpl) return void toast(t("gameSetup.alerts.templateGone"), "bad");
      this.fill(tpl);
      toast(t("gameSetup.alerts.loadedTemplate", { name: tpl.name }), "info");
    } else if (gid) {
      const g = copyFrom(gid, this.type);
      if (!g) return;
      this.fill({ ...g, chipSetId: this.sets.find((s) => s.name === g.chipSetName)?.id, players: namesOf(g) });
      if (g.house) this.cash.house = g.house;
      // its league, if that season's still on (otherwise the one that's on now stays picked)
      this.leagueId = leagueOf(g, this.#leagues) ?? this.leagueId;
    }
  }

  /** what a template and a game of this type both keep: the chips' value, the notes, who's playing and its type's rules */
  payload() {
    return {
      multiplier: this.multiplier,
      notes: this.notes,
      players: this.names,
      tourney: this.isCash ? undefined : this.tourney.settings(),
      cash: this.isCash ? this.cash.settings() : undefined,
    };
  }

  /** this setup as a template (a hand-edited structure goes with it; otherwise it's worked out again) */
  template(id: string, name: string): Template {
    const levels = !this.isCash && this.tourney.edited ? $state.snapshot(this.tourney.edited) : undefined;
    return { id, name, type: this.type, createdAt: Date.now(), chipSetId: this.chipSetId, ...this.payload(), levels };
  }

  /** deal it */
  create() {
    const set = this.chipSet;
    if (!set) return void toast(t("gameSetup.alerts.makeChipSetFirst"), "bad");
    if (!this.isCash && !this.tourney.levels.length) return void toast(t("gameSetup.alerts.structureEmpty"), "bad");
    const g = newGame({
      ...this.payload(),
      name: this.name.trim() || this.defaultName,
      type: this.type,
      chipSetName: set.name,
      chips: $state.snapshot(this.chips),
      levels: this.isCash ? [] : $state.snapshot(this.tourney.levels),
    });
    const from = page.url.searchParams.get("from");
    if (from) g.from = from;
    if (this.isCash && this.cash.rake !== "none") g.house = this.cash.house.trim() || t("gameSetup.cash.rake.defaultHouseName");
    if (settings.seatsPerTable !== 9) g.seatsPerTable = settings.seatsPerTable;
    if (this.leagueId && this.leagues.some((l) => l.id === this.leagueId)) g.leagueId = this.leagueId;
    if (!this.isCash) for (const p of g.players) if (this.tickets[nameKey(p.name)]) p.ticket = this.tickets[nameKey(p.name)];
    saveGame(g);
    goto(`/game/${g.id}`);
  }
}

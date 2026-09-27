<script lang="ts">
  // a new lives game: which one (31, screw your neighbor...), how many lives,
  // who's playing, and what it's played for
  import Icon from "$lib/components/Icon.svelte";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Plus from "@lucide/svelte/icons/plus";
  import { goto } from "$app/navigation";
  import { pagehead } from "$lib/pagehead";
  import { saveGame, getLeagues, knownPlayers } from "$lib/store";
  import { newGame } from "$lib/game";
  import { currentLeague } from "$lib/stats";
  import { settings, houseRules } from "$lib/settings.svelte";
  import { nameKey } from "$lib/util";
  import StakesFields from "../StakesFields.svelte";
  import Life from "./Life.svelte";
  import type { GameType, LivesSettings } from "$lib/types";
  import { LIVES_DEFAULTS } from "./index";
  import { LIVES_PRESETS, livesPreset } from "./presets";
  import { leagueOf, namesOf, startFrom } from "../rerun";
  import { t, tp } from "$lib/i18n";

  // (this form is only ever a lives game)
  let {}: { type: GameType } = $props();
  const type: GameType = "lives";

  // tweak and rerun starts from an earlier game's setup
  const src = startFrom(type);
  const d = src?.lives ?? LIVES_DEFAULTS();
  const day = new Date().toLocaleDateString(settings.language, { weekday: "long" });
  let preset = $state<LivesSettings["preset"]>(d.preset);
  let name = $state(src?.name ?? "");
  let named = !!src;
  // the name follows the game picked until the host types their own
  $effect(() => {
    if (!named) name = `${day} ${t(`common.kinds.lives.presets.${preset}`)}`;
  });
  let lives = $state(d.lives);
  // a new pick brings that game's usual lives (a copied game keeps its own)
  let picked = d.preset;
  $effect(() => {
    if (preset === picked) return;
    picked = preset;
    lives = livesPreset(preset).lives;
  });
  let stakes = $state(src ? structuredClone(d.stakes) : { ...d.stakes, payoutRound: settings.payoutRound || 1 });
  let playerNames = $state(src ? namesOf(src) : "");
  let notes = $state(src ? src.notes : settings.rulesOnNew ? houseRules().join("\n") : "");
  const names = $derived(
    playerNames
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean)
  );

  const leagues = getLeagues().filter((l) => l.types.includes(type));
  let leagueId = $state(leagueOf(src, leagues) ?? currentLeague(leagues, type)?.id ?? "");
  const regulars = knownPlayers().slice(0, 16);
  const unlisted = $derived(regulars.filter((r) => !names.some((n) => nameKey(n) === nameKey(r.name))));
  const addRegular = (n: string) => (playerNames = (playerNames.trim() ? playerNames.trim() + "\n" : "") + n);

  function create() {
    if (names.length < 2 && !confirm(t("gameSetup.players.fewPlayersConfirm"))) return;
    const g = newGame({ name: name.trim() || `${day} ${t(`common.kinds.lives.presets.${preset}`)}`, type, chipSetName: "", multiplier: 1, chips: [], notes, players: names, levels: [] });
    g.lives = { preset, lives: Math.max(1, Math.min(50, Math.round(lives || 1))), stakes: { ...$state.snapshot(stakes), buyIn: Math.max(0, stakes.buyIn || 0), perDie: Math.max(0, stakes.perDie || 0) } };
    if (leagueId && leagues.some((l) => l.id === leagueId)) g.leagueId = leagueId;
    if (src) g.from = src.id;
    saveGame(g);
    goto(`/game/${g.id}`);
  }
</script>

<svelte:head><title>{t("common.kinds.lives.newLabel")} · PitMaster</title></svelte:head>

<div class="spread" use:pagehead>
  <h1>{t("common.kinds.lives.newLabel")}</h1>
</div>

<div class="cols">
  <div>
    <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
      <legend class="ruled w-full px-0">{t("gameSetup.basics.legend")}</legend>
      <label>
        <span>{t("gameSetup.basics.game")}</span>
        <select bind:value={preset}>
          {#each LIVES_PRESETS as p (p.id)}<option value={p.id}>{t(`common.kinds.lives.presets.${p.id}`)}</option>{/each}
        </select>
      </label>
      <p class="small muted -mt-1 mx-0 mb-[10px]">{t(`gameSetup.lives.rules.${preset}`)}</p>
      <label><span>{t("gameSetup.basics.name")}</span><input type="text" bind:value={name} oninput={() => (named = true)} style="width:100%" /></label>
      {#if leagues.length}
        <label>
          <span class="links">{t("gameSetup.basics.league")} <a href="/players#leagues">{t("gameSetup.basics.editLeagues")}</a></span>
          <select bind:value={leagueId}>
            <option value="">{t("gameSetup.basics.noLeague")}</option>
            {#each leagues as l (l.id)}<option value={l.id}>{l.name}</option>{/each}
          </select>
        </label>
      {/if}
      <div class="row">
        <label><span>{t("gameSetup.lives.livesEach")}</span><input type="number" min="1" max="50" step="1" bind:value={lives} /></label>
      </div>
    </fieldset>

    <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
      <legend class="ruled w-full px-0">{t("gameSetup.dice.stakesLegend")}</legend>
      <StakesFields bind:stakes players={names.length} {lives} unit="life" />
    </fieldset>

    <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
      <legend class="ruled w-full px-0">{t("gameSetup.players.legend")} <span class="small opt text-muted ml-[6px]">{t("gameSetup.players.optional")}</span></legend>
      <label>
        <span>{t("gameSetup.players.namesLabel")}</span>
        <textarea bind:value={playerNames} rows="4" placeholder={t("gameSetup.players.namesPlaceholder")}></textarea>
      </label>
      {#if unlisted.length}
        <p class="small links -mt-1 mx-0 mb-[10px]">
          <span class="muted">{t("gameSetup.players.regulars")}</span>
          {#each unlisted as r (r.name)}<button class="link" data-sound="chips" onclick={() => addRegular(r.name)} title={tp("gameSetup.players.gamesCount", r.games)}><Icon icon={Plus} size="1em" />{r.name}</button>{/each}
        </p>
      {/if}
      <label>
        <span>{t("gameSetup.players.notesLabel")}</span>
        <textarea bind:value={notes} rows={Math.min(8, Math.max(2, notes.split("\n").length + 1))} placeholder={t("gameSetup.players.notesPlaceholder")}></textarea>
      </label>
    </fieldset>
  </div>

  <div class="preview">
    <h2>{t("gameSetup.lives.eachPlayer")}</h2>
    <div class="felt flex flex-wrap gap-2 items-center">{#each Array.from({ length: Math.max(1, Math.min(50, lives || 1)) }) as _, i (i)}<Life token={livesPreset(preset).token} size="28px" />{/each}</div>
    <p class="small">{tp("gamePlay.lives.livesEach", lives || 1)}</p>
  </div>
</div>

<hr />
<p class="row actions justify-between">
  <button class="big" data-sound="riffle" onclick={create}>{t("gameSetup.actions.dealIt")}<span class="flip-rtl"><Icon icon={ArrowRight} /></span></button>
  <a href="/" data-sound="close">{t("common.cancel")}</a>
</p>

<style>
  @media (max-width: 600px) {
    .actions {
      position: sticky;
      bottom: 0;
      z-index: 30;
      margin: 0 -16px;
      padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
      background: var(--bg);
      border-top: var(--hair) solid var(--line);
    }
  }
  .preview {
    position: sticky;
    top: calc(var(--head, 0px) + var(--title, 0px) + 12px);
    align-self: start;
  }
  @media (max-width: 800px) {
    .preview {
      position: static;
    }
  }
</style>

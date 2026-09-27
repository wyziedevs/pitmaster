<script lang="ts">
  // a new pot game: which one, the ante and the pot limit, what happens to
  // what's left at the end, and who's playing
  import Icon from "$lib/components/Icon.svelte";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Plus from "@lucide/svelte/icons/plus";
  import { goto } from "$app/navigation";
  import { pagehead } from "$lib/pagehead";
  import { saveGame, getLeagues, knownPlayers } from "$lib/store";
  import { newGame } from "$lib/game";
  import { currentLeague } from "$lib/stats";
  import { settings, houseRules } from "$lib/settings.svelte";
  import { currencySymbol, money, nameKey } from "$lib/util";
  import type { GameType, PotSettings } from "$lib/types";
  import { POT_DEFAULTS } from "./index";
  import { POT_PRESETS, potPreset } from "./presets";
  import { t, tp } from "$lib/i18n";

  // (this form is only ever a pot game)
  let {}: { type: GameType } = $props();
  const type: GameType = "pot";

  const d = POT_DEFAULTS();
  const day = new Date().toLocaleDateString(settings.language, { weekday: "long" });
  const sym = $derived(currencySymbol());
  let preset = $state<PotSettings["preset"]>(d.preset);
  let name = $state("");
  let named = false;
  $effect(() => {
    if (!named) name = `${day} ${t(`common.kinds.pot.presets.${preset}`)}`;
  });
  let ante = $state(d.ante);
  let limit = $state(d.limit);
  $effect(() => {
    const p = potPreset(preset);
    ante = p.ante;
    limit = p.limit;
  });
  let leftover = $state<PotSettings["leftover"]>(d.leftover);
  let playerNames = $state("");
  let notes = $state(settings.rulesOnNew ? houseRules().join("\n") : "");
  const names = $derived(
    playerNames
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean)
  );

  const leagues = getLeagues().filter((l) => l.types.includes(type));
  let leagueId = $state(currentLeague(leagues, type)?.id ?? "");
  const regulars = knownPlayers().slice(0, 16);
  const unlisted = $derived(regulars.filter((r) => !names.some((n) => nameKey(n) === nameKey(r.name))));
  const addRegular = (n: string) => (playerNames = (playerNames.trim() ? playerNames.trim() + "\n" : "") + n);

  function create() {
    if (names.length < 2 && !confirm(t("gameSetup.dice.fewPlayersConfirm"))) return;
    const g = newGame({ name: name.trim() || `${day} ${t(`common.kinds.pot.presets.${preset}`)}`, type, chipSetName: "", multiplier: 1, chips: [], notes, players: names, levels: [] });
    g.pot = { preset, ante: Math.max(0, ante || 0), limit: Math.max(0, limit || 0), leftover };
    if (leagueId && leagues.some((l) => l.id === leagueId)) g.leagueId = leagueId;
    saveGame(g);
    goto(`/game/${g.id}`);
  }
</script>

<svelte:head><title>{t("common.kinds.pot.newLabel")} · PitMaster</title></svelte:head>

<div class="spread" use:pagehead>
  <h1>{t("common.kinds.pot.newLabel")}</h1>
</div>

<div class="cols">
  <div>
    <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
      <legend class="ruled w-full px-0">{t("gameSetup.basics.legend")}</legend>
      <label>
        <span>{t("gameSetup.lives.game")}</span>
        <select bind:value={preset}>
          {#each POT_PRESETS as p (p.id)}<option value={p.id}>{t(`common.kinds.pot.presets.${p.id}`)}</option>{/each}
        </select>
      </label>
      <p class="small muted -mt-1 mx-0 mb-[10px]">{t(`gameSetup.pot.rules.${preset}`)}</p>
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
    </fieldset>

    <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
      <legend class="ruled w-full px-0">{t("gameSetup.pot.potLegend")}</legend>
      <div class="row">
        <label><span>{t("gameSetup.pot.ante", { sym })}</span><input type="number" min="0" step="any" bind:value={ante} /></label>
        <label><span>{t("gameSetup.pot.limit", { sym })}</span><input type="number" min="0" step="any" bind:value={limit} /></label>
      </div>
      <p class="small muted -mt-1">{t("gameSetup.pot.limitHint")}</p>
      <label>
        <span>{t("gameSetup.pot.leftover")}</span>
        <select bind:value={leftover}>
          <option value="split">{t("gameSetup.pot.leftoverSplit")}</option>
          <option value="back">{t("gameSetup.pot.leftoverBack")}</option>
        </select>
      </label>
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
    <h2>{t("gameSetup.pot.eachRound")}</h2>
    <p class="big-num num">{money((names.length || 0) * (ante || 0))}</p>
    <p class="small">{t("gameSetup.pot.firstPot", { n: names.length, ante: money(ante || 0) })}</p>
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
  .big-num {
    font: var(--fs-2xl) / 1.2 var(--font-serif);
    margin: 0;
  }
  @media (max-width: 800px) {
    .preview {
      position: static;
    }
  }
</style>

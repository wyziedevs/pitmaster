<script lang="ts">
  // a new pot game: which one, the ante and the pot limit, what happens to
  // what's left at the end, and who's playing
  import SetupShell from "../SetupShell.svelte";
  import { Draft } from "../draft.svelte";
  import { settings } from "$lib/settings.svelte";
  import { currencySymbol, money } from "$lib/util";
  import type { GameType, PotSettings } from "$lib/types";
  import { POT_DEFAULTS } from "./index";
  import { POT_PRESETS, potPreset } from "./presets";
  import { t, tp } from "$lib/i18n";

  // (this form is only ever a pot game)
  let {}: { type: GameType } = $props();
  const draft = new Draft("pot");
  const src = draft.src;
  const d = src?.pot ?? POT_DEFAULTS();
  const day = new Date().toLocaleDateString(settings.language, { weekday: "long" });
  const sym = $derived(currencySymbol());
  let preset = $state<PotSettings["preset"]>(d.preset);
  let ante = $state(d.ante);
  let limit = $state(d.limit);
  let leftover = $state<PotSettings["leftover"]>(d.leftover);

  /** a new pick brings that game's usual ante and limit */
  function picked() {
    ({ ante, limit } = potPreset(preset));
  }
  const rules = (): PotSettings => ({ preset, ante: Math.max(0, ante || 0), limit: Math.max(0, limit || 0), leftover });
</script>

<SetupShell {draft} defaultName={`${day} ${t(`common.kinds.pot.presets.${preset}`)}`} rules={() => ({ pot: rules() })}>
  {#snippet pick()}
    <label>
      <span>{t("gameSetup.basics.game")}</span>
      <select bind:value={preset} onchange={picked}>
        {#each POT_PRESETS as p (p.id)}<option value={p.id}>{t(`common.kinds.pot.presets.${p.id}`)}</option>{/each}
      </select>
    </label>
    <p class="small muted -mt-1 mx-0 mb-[10px]">{t(`gameSetup.pot.rules.${preset}`)}</p>
  {/snippet}
  {#snippet children()}
    <fieldset>
      <legend>{t("gameSetup.pot.potLegend")}</legend>
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
  {/snippet}
  {#snippet preview(names)}
    <h2>{t("gameSetup.pot.eachRound")}</h2>
    <p class="big-num num">{money(names.length * (ante || 0))}</p>
    <p class="small">{t("gameSetup.pot.firstPot", { players: tp("toys.summary.players", names.length), ante: money(ante || 0) })}</p>
  {/snippet}
</SetupShell>

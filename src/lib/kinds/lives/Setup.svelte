<script lang="ts">
  // a new lives game: which one (31, screw your neighbor...), how many lives,
  // who's playing, and what it's played for
  import SetupShell from "../SetupShell.svelte";
  import StakesFields, { cleanStakes, startStakes } from "../StakesFields.svelte";
  import Life from "./Life.svelte";
  import { Draft } from "../draft.svelte";
  import { settings } from "$lib/settings.svelte";
  import type { GameType, LivesSettings } from "$lib/types";
  import { LIVES_DEFAULTS } from "./index";
  import { LIVES_PRESETS, livesPreset } from "./presets";
  import { t, tp } from "$lib/i18n";

  // (this form is only ever a lives game)
  let {}: { type: GameType } = $props();
  const draft = new Draft("lives");
  const src = draft.src;
  const d = src?.lives ?? LIVES_DEFAULTS();
  const day = new Date().toLocaleDateString(settings.language, { weekday: "long" });
  let preset = $state<LivesSettings["preset"]>(d.preset);
  let lives = $state(d.lives);
  let stakes = $state(startStakes(d.stakes, !!src));

  const rules = (): LivesSettings => ({ preset, lives: Math.max(1, Math.min(50, Math.round(lives || 1))), stakes: cleanStakes(stakes) });
</script>

<SetupShell {draft} defaultName={`${day} ${t(`common.kinds.lives.presets.${preset}`)}`} rules={() => ({ lives: rules() })}>
  {#snippet pick()}
    <label>
      <span>{t("gameSetup.basics.game")}</span>
      <!-- a new pick brings that game's usual lives -->
      <select bind:value={preset} onchange={() => (lives = livesPreset(preset).lives)}>
        {#each LIVES_PRESETS as p (p.id)}<option value={p.id}>{t(`common.kinds.lives.presets.${p.id}`)}</option>{/each}
      </select>
    </label>
    <p class="small muted -mt-1 mx-0 mb-[10px]">{t(`gameSetup.lives.rules.${preset}`)}</p>
  {/snippet}
  {#snippet basics()}
    <div class="row">
      <label><span>{t("gameSetup.lives.livesEach")}</span><input type="number" min="1" max="50" step="1" bind:value={lives} /></label>
    </div>
  {/snippet}
  {#snippet children(names)}
    <fieldset>
      <legend>{t("gameSetup.dice.stakesLegend")}</legend>
      <StakesFields bind:stakes players={names.length} {lives} unit="life" />
    </fieldset>
  {/snippet}
  {#snippet preview()}
    <h2>{t("gameSetup.lives.eachPlayer")}</h2>
    <div class="felt flex flex-wrap gap-2 items-center">{#each Array.from({ length: Math.max(1, Math.min(50, lives || 1)) }) as _, i (i)}<Life token={livesPreset(preset).token} size="28px" />{/each}</div>
    <p class="small">{tp("gamePlay.lives.livesEach", lives || 1)}</p>
  {/snippet}
</SetupShell>

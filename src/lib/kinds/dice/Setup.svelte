<script lang="ts">
  // a new liar's dice game: who's playing, the house's rules, and what it's
  // played for. there are no chips or blinds; the dice are the lives.
  import { reveal, slide } from "$lib/motion";
  import SetupShell from "../SetupShell.svelte";
  import StakesFields, { cleanStakes, startStakes } from "../StakesFields.svelte";
  import Die from "$lib/components/Die.svelte";
  import { Draft } from "../draft.svelte";
  import { settings } from "$lib/settings.svelte";
  import type { DiceSettings, GameType } from "$lib/types";
  import { DICE_DEFAULTS, rulesLine } from "./index";
  import { t } from "$lib/i18n";

  // (this form is only ever liar's dice)
  let {}: { type: GameType } = $props();
  const draft = new Draft("dice");
  const src = draft.src;
  const d = src?.dice ?? DICE_DEFAULTS();
  const day = new Date().toLocaleDateString(settings.language, { weekday: "long" });
  let dice = $state(d.dice);
  let onesWild = $state(d.onesWild);
  let spotOn = $state(d.spotOn);
  let palifico = $state(d.palifico);
  let entry = $state(d.entry);
  let stakes = $state(startStakes(d.stakes, !!src));

  const rules = (): DiceSettings => ({ dice: Math.max(1, Math.min(20, Math.round(dice || 5))), onesWild, spotOn, palifico, stakes: cleanStakes(stakes), entry });
</script>

<SetupShell {draft} defaultName={`${day} ${t("common.kinds.dice.label")}`} fewPlayers={t("gameSetup.dice.fewPlayersConfirm")} rules={() => ({ dice: rules() })}>
  {#snippet children(names)}
    <fieldset>
      <legend>{t("gameSetup.dice.rulesLegend")}</legend>
      <div class="row">
        <label><span>{t("gameSetup.dice.dicePerPlayer")}</span><input type="number" min="1" max="20" step="1" bind:value={dice} /></label>
      </div>
      <label class="across"><input type="checkbox" bind:checked={onesWild} /><span>{t("gameSetup.dice.onesWild")}</span></label>
      <label class="across"><input type="checkbox" bind:checked={palifico} /><span>{t("gameSetup.dice.palifico")}</span></label>
      {#if palifico}<p class="small muted -mt-1 mx-0 mb-[10px]" transition:slide={reveal()}>{t("gameSetup.dice.palificoHint")}</p>{/if}
      <label>
        <span>{t("gameSetup.dice.spotOn")}</span>
        <select bind:value={spotOn}>
          <option value="others">{t("gameSetup.dice.spotOnOthers")}</option>
          <option value="gain">{t("gameSetup.dice.spotOnGain")}</option>
          <option value="off">{t("gameSetup.dice.spotOnOff")}</option>
        </select>
      </label>
    </fieldset>

    <fieldset>
      <legend>{t("gameSetup.dice.stakesLegend")}</legend>
      <StakesFields bind:stakes players={names.length} lives={dice} unit="die" />
    </fieldset>

    <fieldset>
      <legend>{t("gameSetup.dice.entryLegend")}</legend>
      <div class="row" role="radiogroup" aria-label={t("gameSetup.dice.entryLegend")}>
        <label class="across"><input type="radio" name="entry" value="full" bind:group={entry} /><span>{t("gameSetup.dice.entryFull")}</span></label>
        <label class="across"><input type="radio" name="entry" value="quick" bind:group={entry} /><span>{t("gameSetup.dice.entryQuick")}</span></label>
      </div>
      <p class="small muted -mt-1 mx-0 mb-0">{t(entry === "full" ? "gameSetup.dice.entryFullHint" : "gameSetup.dice.entryQuickHint")}</p>
    </fieldset>
  {/snippet}
  {#snippet preview()}
    <h2>{t("gameSetup.dice.eachPlayer")}</h2>
    <div class="felt flex flex-wrap gap-2 items-center">{#each Array.from({ length: Math.max(1, Math.min(20, dice || 1)) }) as _, i (i)}<Die value={(i % 6) + 1} size="30px" />{/each}</div>
    <p class="small">{rulesLine(rules())}</p>
    <p class="small muted">{t("gameSetup.dice.howItPlays")}</p>
  {/snippet}
</SetupShell>

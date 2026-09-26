<script lang="ts">
  import type { CashRake } from "$lib/types";
  import { currencySymbol } from "$lib/util";
  import { reveal, slide } from "$lib/motion";
  import { t } from "$lib/i18n";

  // a cash game's rake: how it's taken, how much, and who it's paid to. the
  // same fields, in the same words, for the default (Settings > Your Game) and
  // on a new game. onchange is for a caller that saves as it goes.
  let {
    mode = $bindable(),
    pct = $bindable(),
    cap = $bindable(),
    fee = $bindable(),
    house = $bindable(),
    onchange,
  }: { mode: CashRake["mode"]; pct: number; cap: number; fee: number; house: string; onchange?: () => void } = $props();

  const sym = $derived(currencySymbol());
  const paidTo = $derived(house.trim() || t("gamePlay.shared.house"));
</script>

<div class="vstack rake">
  <label class="m-0">
    <span>{t("gamePlay.rake.howHouseGetsPaidLabel")}</span>
    <select bind:value={mode} {onchange}>
      <option value="pot">{t("gamePlay.rake.potOption")}</option>
      <option value="seat">{t("gamePlay.rake.seatOption")}</option>
      <option value="none">{t("gamePlay.rake.noneOption")}</option>
    </select>
  </label>
  {#if mode !== "none"}
    <div class="vstack" transition:slide={reveal()}>
      <div class="row">
        {#if mode === "pot"}
          <label class="m-0"><span>{t("gamePlay.rake.pctOfPotLabel")}</span><input type="number" min="0" max="100" step="any" bind:value={pct} {onchange} /></label>
          <label class="m-0"><span>{t("gamePlay.rake.maxPerPotLabel", { sym })}</span><input type="number" min="0" step="any" bind:value={cap} {onchange} /></label>
        {:else}
          <label class="m-0"><span>{t("gamePlay.rake.seatFeeLabel", { sym })}</span><input type="number" min="0" step="any" bind:value={fee} {onchange} /></label>
        {/if}
        <label class="m-0"><span>{t("gamePlay.rake.paidToLabel")}</span><input type="text" bind:value={house} {onchange} list="regulars" autocomplete="off" placeholder={t("gamePlay.rake.paidToPlaceholder")} /></label>
      </div>
      <p class="small muted m-0">
        {#if mode === "pot"}{t("gamePlay.rake.potModeNote", { house: paidTo })}
        {:else}{t("gamePlay.rake.seatModeNote", { house: paidTo })}{/if}
        {t("gamePlay.rake.yourNameNote")}
      </p>
    </div>
  {/if}
</div>

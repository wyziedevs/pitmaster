<script lang="ts">
  // a cash game's own part of the poker form: the blinds, the buy-ins, how
  // long it runs, and (when they're on) the rake and the side games
  import RakeFields from "$lib/components/RakeFields.svelte";
  import { currencySymbol, duration, timeOfDay } from "$lib/util";
  import { time } from "$lib/now.svelte";
  import { bump, reveal, slide } from "$lib/motion";
  import { t } from "$lib/i18n";
  import type { PokerDraft } from "../poker/draft.svelte";

  let { draft }: { draft: PokerDraft } = $props();
  const c = $derived(draft.cash);
  const f = $derived(draft.features);
  const sym = $derived(currencySymbol());
</script>

<fieldset>
  <legend>{t("gameSetup.cash.blinds.legend")}</legend>
  <div class="row">
    <label><span>{t("gameSetup.cash.blinds.smallBlind", { sym })}</span><input type="number" step="any" min="0" bind:value={c.sb} /></label>
    <label><span>{t("gameSetup.cash.blinds.bigBlind", { sym })}</span><input type="number" step="any" min="0" bind:value={c.bb} /></label>
    <label class="across"><input type="checkbox" bind:checked={c.straddle} /><span>{t("gameSetup.cash.blinds.straddlesAllowed")}</span></label>
  </div>
</fieldset>
<fieldset>
  <legend>{t("gameSetup.cash.buyIns.legend")}</legend>
  <div class="row">
    <label><span>{t("gameSetup.cash.buyIns.min", { sym })}</span><input type="number" step="any" min="0" bind:value={c.minBuyIn} /></label>
    <label><span>{t("gameSetup.cash.buyIns.standard", { sym })}</span><input type="number" step="any" min="0" bind:value={c.defaultBuyIn} /></label>
    <label><span>{t("gameSetup.cash.buyIns.max", { sym })}</span><input type="number" step="any" min="0" bind:value={c.maxBuyIn} /></label>
  </div>
  <p class="small muted">{t("gameSetup.cash.buyIns.standardBefore")}<span class="num" use:bump={c.deep}>{c.deep}</span>{t("gameSetup.cash.buyIns.standardAfter")}</p>
</fieldset>
<fieldset>
  <legend>{t("gameSetup.cash.length.legend")}</legend>
  <label>
    <span>{t("gameSetup.cash.length.playForAbout", { duration: duration(c.hours * 60) })}</span>
    <input type="range" min="0.5" max="10" step="0.5" bind:value={c.hours} style="width:100%" />
  </label>
  <p class="small muted -mt-[6px] mx-0 mb-0">{t("gameSetup.cash.length.endsAround", { time: timeOfDay(time.now + c.hours * 3600000) })}</p>
</fieldset>
{#if f.shows("rake")}
  <fieldset transition:slide={reveal()}>
    <legend>{t("gameSetup.cash.rake.legend")}{#if !f.always("rake")}<button class="link small opt ml-2" data-sound="off" onclick={() => draft.drop("rake")}>{t("gameSetup.cash.rake.remove")}</button>{/if}</legend>
    <RakeFields bind:mode={c.rakeMode} bind:pct={c.rakePct} bind:cap={c.rakeCap} bind:fee={c.seatFee} bind:house={c.house} />
  </fieldset>
{/if}
{#if f.shows("bomb") || f.shows("sevenTwo") || f.shows("highHand")}
  <fieldset transition:slide={reveal()}>
    <legend>{t("gameSetup.cash.sides.legend")}</legend>
    {#if f.shows("bomb")}
      <label class="across"><input type="checkbox" bind:checked={c.bombOn} /><span>{t("gameSetup.cash.sides.bombPots")}</span></label>
      {#if c.bombOn}
        <div class="row" transition:slide={reveal()}>
          <label><span>{t("gameSetup.cash.sides.ante", { sym })}</span><input type="number" min="0" step="any" bind:value={c.bombAnte} /></label>
          <label><span>{t("gameSetup.cash.sides.bombEvery")}</span><input type="number" min="0" step="1" bind:value={c.bombEvery} /></label>
          <label class="across"><input type="checkbox" bind:checked={c.bombDouble} /><span>{t("gameSetup.cash.sides.doubleBoard")}</span></label>
        </div>
      {/if}
    {/if}
    {#if f.shows("sevenTwo")}
      <label class="across"><input type="checkbox" bind:checked={c.sevenTwoOn} /><span>{t("gameSetup.cash.sides.sevenTwo")}</span></label>
      {#if c.sevenTwoOn}
        <div class="row" transition:slide={reveal()}>
          <label><span>{t("gameSetup.cash.sides.eachPays", { sym })}</span><input type="number" min="0" step="any" bind:value={c.sevenTwoAmount} /></label>
        </div>
      {/if}
    {/if}
    {#if f.shows("highHand")}
      <label class="across"><input type="checkbox" bind:checked={c.highHandOn} /><span>{t("gameSetup.cash.sides.highHand")}</span></label>
      {#if c.highHandOn}
        <div class="row" transition:slide={reveal()}>
          <label><span>{t("gameSetup.cash.sides.prize", { sym })}</span><input type="number" min="0" step="any" bind:value={c.highHandPrize} /></label>
          <label><span>{t("gameSetup.cash.sides.highHandEvery")}</span><input type="number" min="0" step="1" bind:value={c.highHandEvery} /></label>
        </div>
      {/if}
    {/if}
    <p class="small muted -mt-1 mx-0 mb-0">{t("gameSetup.cash.sides.note")}</p>
  </fieldset>
{/if}

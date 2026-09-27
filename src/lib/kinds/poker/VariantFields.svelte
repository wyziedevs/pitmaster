<script lang="ts">
  // the game on the poker form, when other poker games are on: one of them,
  // a tournament's mix or a cash game's dealer's choice (and stud's ante)
  import { ROTATIONS, VARIANTS, isStud, rotationName, shortList, variantName } from "$lib/variants";
  import { currencySymbol } from "$lib/util";
  import { reveal, slide } from "$lib/motion";
  import { t } from "$lib/i18n";
  import type { PokerDraft } from "./draft.svelte";

  let { draft }: { draft: PokerDraft } = $props();
  const pick = $derived(draft.pick);
  const cash = $derived(draft.cash);
  const isCash = $derived(draft.isCash);
  const sym = $derived(currencySymbol());
</script>

{#if draft.features.shows("variants")}
  <fieldset transition:slide={reveal()}>
    <legend>{t("gameSetup.variants.legend")}{#if !draft.features.always("variants")}<button class="link small opt ml-2" data-sound="off" onclick={() => draft.drop("variants")}>{t("gameSetup.variants.remove")}</button>{/if}</legend>
    <label>
      <span>{t("gameSetup.variants.game")}</span>
      <select bind:value={pick.pick}>
        <optgroup label={t("gameSetup.variants.oneGame")}>
          {#each VARIANTS as v (v.id)}<option value={v.id}>{variantName(v.id)} ({v.short})</option>{/each}
        </optgroup>
        {#if isCash}
          <option value="choice">{t("gameSetup.variants.dealersChoice")}</option>
        {:else}
          <optgroup label={t("gameSetup.variants.mixed")}>
            {#each ROTATIONS as r (r.id)}<option value="mix:{r.id}">{rotationName(r.games)} ({shortList(r.games)})</option>{/each}
            <option value="mix:custom">{t("gameSetup.variants.yourMix")}</option>
          </optgroup>
        {/if}
      </select>
    </label>
    {#if pick.custom}
      <div class="row gap-y-1 mb-[6px]" transition:slide={reveal()}>
        {#each VARIANTS as v (v.id)}<label class="across m-0"><input type="checkbox" checked={pick.own.includes(v.id)} onchange={(e) => pick.toggle(v.id, e.currentTarget.checked)} /><span title={variantName(v.id)}>{v.short}</span></label>{/each}
      </div>
      <p class="small muted -mt-1 mx-0 mb-[10px]">{pick.own.length ? t(isCash ? "gameSetup.variants.choiceOrder" : "gameSetup.variants.mixOrder", { games: shortList(pick.own) }) : t("gameSetup.variants.pickSome")}</p>
    {/if}
    {#if isCash && pick.pick === "choice"}
      <label><span>{t("gameSetup.variants.rotateEvery")}</span><input type="number" min="0" step="1" bind:value={cash.rotateMinutes} /></label>
    {/if}
    {#if isCash && pick.games.some(isStud)}
      <div class="row" transition:slide={reveal()}>
        <label><span>{t("gameSetup.variants.studAnte", { sym })}</span><input type="number" min="0" step="any" bind:value={cash.studAnte} /></label>
        <label><span>{t("gameSetup.variants.bringIn", { sym })}</span><input type="number" min="0" step="any" bind:value={cash.studBringIn} /></label>
      </div>
    {/if}
    <p class="small muted -mt-1 mx-0 mb-0">{isCash ? t("gameSetup.variants.limitNoteCash") : t("gameSetup.variants.limitNoteTourney")}</p>
  </fieldset>
{/if}

<script lang="ts">
  // the poker form's basics: the name, the league, and the chips (a set, and
  // what each one is worth in this game)
  import ChipLegend from "$lib/components/ChipLegend.svelte";
  import { amt, money } from "$lib/util";
  import { t } from "$lib/i18n";
  import type { PokerDraft } from "./draft.svelte";

  let { draft }: { draft: PokerDraft } = $props();
  const chips = $derived(draft.chips);
</script>

<fieldset>
  <legend>{t("gameSetup.basics.legend")}</legend>
  <label><span>{t("gameSetup.basics.name")}</span><input type="text" bind:value={draft.name} style="width:100%" /></label>
  {#if draft.leagues.length}
    <label>
      <span class="links">{t("gameSetup.basics.league")} <a href="/players#leagues">{t("gameSetup.basics.editLeagues")}</a></span>
      <select bind:value={draft.leagueId}>
        <option value="">{t("gameSetup.basics.noLeague")}</option>
        {#each draft.leagues as l (l.id)}<option value={l.id}>{l.name}</option>{/each}
      </select>
    </label>
  {/if}
  <label>
    <span class="links">{t("gameSetup.basics.chipSet")} <a href="/settings#chips">{t("gameSetup.basics.editSets")}</a></span>
    <select bind:value={() => draft.chipSetId, (id) => draft.useSet(id)}>
      {#each draft.sets as s (s.id)}<option value={s.id}>{s.name}{s.owned ? ` (${t("gameSetup.basics.yours")})` : ""}</option>{/each}
    </select>
  </label>
  <!-- the printed value times this is what a chip is worth in the game; the
       hint says it in chips so nobody has to do the math -->
  <label for="mult" class="m-0"><span>{t("gameSetup.basics.chipValues")}</span></label>
  <div class="row mb-[10px]">
    <select id="mult" bind:value={draft.multiplier}>
      {#each [0.01, 0.05, 0.1, 0.25, 0.5, 1, 5, 10, 20, 25, 50, 100, 1000] as m (m)}<option value={m}>{m === 1 ? t("gameSetup.basics.asPrinted") : t("gameSetup.basics.printedTimes", { n: m })}</option>{/each}
    </select>
    {#if chips[0]}
      <span class="small muted">{t("gameSetup.basics.chipPlaysAs", { chip: chips[0].label || money(chips[0].printed), value: draft.isCash ? money(chips[0].value) : amt(chips[0].value) })}</span>
    {/if}
  </div>
  <div class="slab mb-[10px]">
    <ChipLegend {chips} isCash={draft.isCash} size={44} />
  </div>
</fieldset>

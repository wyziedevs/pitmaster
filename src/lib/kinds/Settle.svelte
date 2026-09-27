<script lang="ts">
  // settling up (at the end, or as it goes where money's owed round by
  // round), and the shared costs when they're on
  import type { Game } from "$lib/types";
  import { settleUp } from "$lib/settle";
  import { settings } from "$lib/settings.svelte";
  import SettleMoves from "$lib/components/SettleMoves.svelte";
  import Costs from "$lib/components/Costs.svelte";
  import { t } from "$lib/i18n";

  let { game = $bindable(), persist, early = false, note = "" }: { game: Game; persist: () => void; early?: boolean; note?: string } = $props();

  const moves = $derived(settleUp(game));
  const costsOn = $derived(settings.useCosts || !!game.costs?.length);
</script>

{#if game.finished || (early && moves.length)}
  <div class="part mt-[22px]">
    <h2>{t("gamePlay.shared.settleUp")}</h2>
    {#if moves.length}
      <SettleMoves bind:game {persist} />
      {#if note}<p class="small muted">{note}</p>{/if}
    {:else}
      <p class="small muted">{t("gamePlay.shared.square")}</p>
    {/if}
  </div>
{/if}
{#if costsOn}<div class="part mt-[22px]"><Costs bind:game {persist} /></div>{/if}

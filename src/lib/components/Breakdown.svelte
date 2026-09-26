<script lang="ts">
  import type { GameChip } from "$lib/types";
  import type { Breakdown } from "$lib/chips";
  import { amt } from "$lib/util";
  import Chip from "./Chip.svelte";
  import ChipStack from "./ChipStack.svelte";

  // "each player gets...": stacks on top, a little table below
  let { breakdown, isCash = false, target }: { breakdown: Breakdown<GameChip>; isCash?: boolean; target: number } = $props();
</script>

<div class="bd">
  <div class="stacks">
    {#each breakdown.rows as r (r.chip.id)}
      <div class="col">
        <ChipStack chip={r.chip} n={r.n} />
        <Chip chip={r.chip} size={34} text={r.chip.label || amt(r.chip.value, isCash)} spin={false} />
        <span class="num small">{amt(r.chip.value, isCash)} ×{r.n}</span>
      </div>
    {:else}
      <span class="empty">No chips fit: lower the amount or add chips to the set</span>
    {/each}
  </div>
  <p class="small">
    = <b class="num">{amt(breakdown.total, isCash)}</b> in {breakdown.rows.reduce((s, r) => s + r.n, 0)} chips
    {#if breakdown.short > 0}
      <span class="bad"> · {amt(breakdown.short, isCash)} short of {amt(target, isCash)} (not enough chips in the set, or the amount can't be made)</span>
    {/if}
  </p>
</div>

<style>
  /* room beside every stack for the two halves of a shuffle (toys.ts SPLIT) */
  .stacks {
    display: flex;
    gap: 16px 30px;
    align-items: flex-end;
    flex-wrap: wrap;
    min-height: 60px;
  }
  .col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
</style>

<script lang="ts">
  import type { GameChip } from "$lib/types";
  import { amt } from "$lib/util";
  import Chip from "./Chip.svelte";

  let { chips, isCash = false, size = 56, dim = [] }: { chips: GameChip[]; isCash?: boolean; size?: number; dim?: string[] } = $props();
</script>

<div class="legend">
  {#each chips as c (c.id)}
    <div class="item" class:gone={dim.includes(c.id)}>
      <Chip chip={c} {size} text={c.label || amt(c.value, isCash)} />
      <b class="num">{amt(c.value, isCash)}</b>
    </div>
  {/each}
</div>

<style>
  .legend {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
    align-items: center;
  }
  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    transition:
      opacity var(--dur-settle) var(--ease-out),
      transform var(--dur-settle) var(--ease-out-expo);
  }
  /* colored up: racked and gone, so it sinks and fades instead of blinking off */
  .gone {
    opacity: 0.25;
    transform: translateY(4px) scale(0.92);
    text-decoration: line-through;
  }
</style>

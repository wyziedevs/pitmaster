<script lang="ts">
  import type { GameChip } from "$lib/types";
  import { amt } from "$lib/util";
  import { faceText } from "$lib/chips";
  import Chip from "./Chip.svelte";

  let { chips, isCash = false, size = 56, dim = [] }: { chips: GameChip[]; isCash?: boolean; size?: number; dim?: string[] } = $props();
</script>

<div class="legend flex gap-[18px] flex-wrap items-center">
  {#each chips as c (c.id)}
    <div class="item flex flex-col items-center gap-1" class:gone={dim.includes(c.id)}>
      <Chip chip={c} {size} text={faceText(c, isCash)} />
      <b class="num">{amt(c.value, isCash)}</b>
    </div>
  {/each}
</div>

<style>
  .item {
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

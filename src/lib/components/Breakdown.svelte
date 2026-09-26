<script lang="ts">
  import type { GameChip } from "$lib/types";
  import { faceText, type Breakdown } from "$lib/chips";
  import { amt } from "$lib/util";
  import Chip from "./Chip.svelte";
  import ChipStack from "./ChipStack.svelte";
  import { t, tp } from "$lib/i18n";

  // "each player gets...": stacks on top, a little table below
  let { breakdown, isCash = false, target }: { breakdown: Breakdown<GameChip>; isCash?: boolean; target: number } = $props();
</script>

<div class="bd">
  <!-- room beside every stack for the two halves of a shuffle (toys.ts SPLIT) -->
  <div class="flex flex-wrap items-end gap-y-4 gap-x-[30px] min-h-[60px]">
    {#each breakdown.rows as r (r.chip.id)}
      <div class="flex flex-col items-center gap-1">
        <ChipStack chip={r.chip} n={r.n} text={faceText(r.chip, isCash)} />
        <Chip chip={r.chip} size={34} text={faceText(r.chip, isCash)} spin={false} />
        <span class="num small">{amt(r.chip.value, isCash)} ×{r.n}</span>
      </div>
    {:else}
      <span class="empty">{t("gamePlay.breakdown.noChipsFit")}</span>
    {/each}
  </div>
  <p class="small">
    = <b class="num">{amt(breakdown.total, isCash)}</b> {tp("gamePlay.breakdown.inChips", breakdown.rows.reduce((s, r) => s + r.n, 0))}
    {#if breakdown.short > 0}
      <span class="bad"> · {t("gamePlay.breakdown.shortNote", { short: amt(breakdown.short, isCash), target: amt(target, isCash) })}</span>
    {/if}
  </p>
</div>

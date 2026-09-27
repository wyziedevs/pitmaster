<script lang="ts">
  // who sits where: in seat order, several tables side by side (a column each)
  import type { Player } from "$lib/types";
  import { fade } from "svelte/transition";
  import { leave } from "$lib/motion";
  import { seatLabel } from "$lib/seats";
  import { t } from "$lib/i18n";

  let { list, tables, later }: { list: Player[]; tables: number; later: (node: HTMLElement, cls: string) => void } = $props();

  const byTable = $derived(
    [...new Set(list.map((p) => p.seat?.table ?? 0))]
      .sort((a, b) => a - b)
      .map((table) => ({ table, players: list.filter((p) => (p.seat?.table ?? 0) === table).sort((a, b) => (a.seat?.seat ?? 99) - (b.seat?.seat ?? 99)) }))
  );
</script>

{#if tables > 1}
  <div class="tables">
    {#each byTable as tb (tb.table)}
      <div>
        <span class="tname">{tb.table ? t("tv.seatList.table", { n: String(tb.table) }) : t("tv.seatList.noSeatYet")}</span>
        {#each tb.players as p, i (p.id)}<div class="seat" style:--i={i} use:later={"deal-in"} out:fade={leave()}><span class="fig">{p.seat?.seat ?? ""}</span>{p.name}</div>{/each}
      </div>
    {/each}
  </div>
{:else}
  {#each byTable.flatMap((tb) => tb.players) as p, i (p.id)}<div class="seat" style:--i={i} use:later={"deal-in"} out:fade={leave()}>{#if p.seat}<span class="fig">{seatLabel(p.seat, tables)}</span>{/if}{p.name}</div>{/each}
{/if}

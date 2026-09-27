<script lang="ts">
  // a player to pick: "…" for no one yet (unless there has to be someone), then each of `players`
  import type { Player } from "$lib/types";

  let { value = $bindable(), players, blank = true, label }: { value: string; players: Player[]; blank?: boolean; label?: string } = $props();
</script>

<select bind:value aria-label={label}>
  {#if blank}<option value="">…</option>{/if}
  {#each players as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
</select>

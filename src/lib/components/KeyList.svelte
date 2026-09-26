<script lang="ts">
  // every keyboard shortcut in one list, for Help and Settings. `commands`
  // puts the rebindable Commands key first, the way it's set right now.
  import Kbd from "./Kbd.svelte";
  import { settings } from "$lib/settings.svelte";
  import { keyLabel, FIXED_KEYS, DEFAULT_PALETTE_KEY } from "$lib/keys";

  let { commands = false, class: cls = "" }: { commands?: boolean; class?: string } = $props();

  const keys = $derived<[string, string][]>(
    commands ? [[keyLabel(settings.paletteKey || DEFAULT_PALETTE_KEY), "Open Commands"], ...FIXED_KEYS] : FIXED_KEYS
  );
</script>

<dl class="keylist {cls}">
  {#each keys as [k, what] (k)}<dt><Kbd {k} /></dt><dd>{what}</dd>{/each}
</dl>

<style>
  .keylist {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 6px 12px;
    align-items: center;
    margin: 0;
  }
  dt,
  dd {
    margin: 0;
  }
  dt {
    justify-self: start;
  }
</style>

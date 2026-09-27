<script lang="ts">
  import { page } from "$app/state";
  import { kind } from "$lib/kinds";

  // each kind of game brings its own form (the poker kinds share one, so
  // switching between them keeps it)
  const k = $derived(kind(page.url.searchParams.get("type")));
  const setup = $derived(k.Setup);
</script>

{#await setup() then m}
  <m.default type={k.id} />
{/await}

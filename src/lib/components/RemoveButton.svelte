<script lang="ts">
  // the little x at the end of a row: players, levels, anything in a list goes
  // the same way. `label` says what goes ("Remove Level 3").
  import Icon from "./Icon.svelte";
  import X from "@lucide/svelte/icons/x";

  let { label, onclick }: { label: string; onclick: () => void } = $props();
</script>

<button class="link small muted remove" data-sound="thud" aria-label={label} title={label} {onclick}><Icon icon={X} size="1em" /></button>

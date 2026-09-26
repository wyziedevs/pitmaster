<script lang="ts">
  // a key on screen, drawn one way everywhere: named keys are words (Enter,
  // Esc, Space, Ctrl K) and the arrow keys are Lucide arrows, not unicode ones.
  // takes a label the way keyLabel (keys.ts) writes it: "Ctrl K", "← →", "↑".
  import type { Component } from "svelte";
  import Icon from "./Icon.svelte";
  import ArrowUp from "@lucide/svelte/icons/arrow-up";
  import ArrowDown from "@lucide/svelte/icons/arrow-down";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";

  let { k, class: cls = "" }: { k: string; class?: string } = $props();

  const ARROWS: Record<string, [Component<any>, string]> = {
    "↑": [ArrowUp, "Up"],
    "↓": [ArrowDown, "Down"],
    "←": [ArrowLeft, "Left"],
    "→": [ArrowRight, "Right"],
  };
  const parts = $derived(k.split(" ").filter(Boolean));
</script>

<kbd class={cls}
  >{#each parts as p, i (i)}{#if i}&nbsp;{/if}{#if ARROWS[p]}<Icon icon={ARROWS[p][0]} size="1em" label={ARROWS[p][1]} />{:else}{p}{/if}{/each}</kbd
>

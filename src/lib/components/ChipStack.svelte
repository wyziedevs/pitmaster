<script lang="ts">
  import type { ChipDef } from "$lib/types";
  import { edgeInserts } from "$lib/chips";
  import { flushSync } from "svelte";
  import ChipFace from "./ChipFace.svelte";

  // side view of a stack. caps the drawing at `max` discs. width is px, or any
  // css length (the tv sizes its stacks to the screen). every disc is the same
  // chip Chip.svelte draws: the same inserts on its edge and, on top, the same
  // face, so a stack looks like a pile of the chips shown beside it.
  let { chip, n, max = 20, width = 44 }: { chip: ChipDef; n: number; max?: number; width?: number | string } = $props();
  const uid = $props.id();
  const shown = $derived(Math.min(n, max));

  // fixed "random" per disc, so a stack looks hand-built but doesn't reshuffle
  // on every render: real chips never sit with their inserts lined up
  // (hashed, not stepped: an even step lines the inserts up in a spiral)
  const turn = (i: number) => ((Math.sin(i * 12.9898 + 1) * 43758.5453) % 1 + 1) * 180; // degrees the chip is turned
  const nudge = (i: number) => ((i * 5) % 3) - 1; // whole px left or right
  // which disc's look sits in each place. a shuffle (toys.ts) moves them round
  let order = $state<number[]>([]);
  const look = (i: number) => order[i] ?? i;
  // the tops you can see: the whole stack's, and the bottom half's while a
  // shuffle has it cut in two (toys.ts). the rest sit under the next disc. a
  // top sits square, its label the right way up like the chip on its own
  const topped = (i: number) => i === shown - 1 || i === Math.ceil(shown / 2) - 1;

  let el = $state<HTMLElement>();
  $effect(() => {
    const stack = el;
    if (!stack) return;
    // the shuffle's done: each disc's look moves to the place it landed in,
    // before the stack shows again, so nothing jumps back to how it was
    const restack = (e: Event) => {
      const slots = (e as CustomEvent<number[]>).detail;
      const next: number[] = [];
      slots.forEach((slot, j) => (next[slot] = look(j)));
      flushSync(() => (order = next));
    };
    stack.addEventListener("restack", restack);
    return () => stack.removeEventListener("restack", restack);
  });
</script>

<!-- data-v: tapped, the stack is riffled through on its chip's note (toys.ts) -->
<span
  bind:this={el}
  class="stack"
  data-v={chip.value}
  style:--c={chip.color}
  style:--w={typeof width === "number" ? `${width}px` : width}
  style:--n={shown}
  title="{n} × {chip.label}"
>
  {#each { length: shown } as _, i (i)}
    {@const t = topped(i) ? 0 : turn(look(i))}
    <i style:--i={i} style:--x="{nudge(look(i))}px">
      <svg class="edge" viewBox="-49 0 98 1" preserveAspectRatio="none" aria-hidden="true">
        {#each edgeInserts(chip, t) as s, k (k)}<rect x={s.x} y="0" width={s.w} height="1" fill={s.color} />{/each}
      </svg>
      <svg class="top" viewBox="-49 -49 98 98" preserveAspectRatio="none" aria-hidden="true">
        {#if topped(i)}
          <ChipFace {chip} detail={false} turn={t} id="{uid}-{i}" />
          <circle r="49" fill="url(#{uid}-lit)" />
          <circle r="49" fill="none" stroke="rgb(0 0 0 / 0.4)" stroke-width="1" vector-effect="non-scaling-stroke" />
        {:else}
          <circle r="49" fill={chip.color} />
        {/if}
        {#if i === 0}
          <!-- light from above and to the left, across the face -->
          <defs>
            <radialGradient id="{uid}-lit" cx="0.34" cy="0.22" r="0.8">
              <stop offset="0" stop-color="#fff" stop-opacity="0.2" />
              <stop offset="0.55" stop-color="#fff" stop-opacity="0" />
              <stop offset="1" stop-color="#000" stop-opacity="0.12" />
            </radialGradient>
          </defs>
        {/if}
      </svg>
    </i>
  {/each}
</span>

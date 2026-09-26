<script lang="ts">
  import type { ChipDef } from "$lib/types";
  import { edgeInserts, faceText } from "$lib/chips";
  import { flushSync } from "svelte";
  import { t } from "$lib/i18n";
  import ChipFace from "./ChipFace.svelte";

  // side view of a stack. caps the drawing at `max` discs. width is px, or any
  // css length (the tv sizes its stacks to the screen). every disc is the same
  // chip Chip.svelte draws: the same inserts round its edge and, on top, the
  // same face (ChipFace.svelte, with its value), so a stack looks like a pile
  // of the chips shown beside it. `text` is what the top chip reads, when it
  // isn't the chip's own (a cash game's money).
  let { chip, n, max = 20, width = 44, text }: { chip: ChipDef; n: number; max?: number; width?: number | string; text?: string } = $props();
  const uid = $props.id();
  const shown = $derived(Math.min(n, max));
  const label = $derived(text ?? faceText(chip));

  // how wide it's drawn, for how much of the face's small print can show. the
  // face is squashed to a third of its width, so it reads about as well as a
  // flat chip a bit over half as wide
  let px = $state(0);
  const facePx = $derived((px || (typeof width === "number" ? width : 60)) * 0.6);

  // fixed "random" per disc, so a stack looks hand-built but doesn't reshuffle
  // on every render: real chips never sit with their inserts lined up, or
  // quite square on the one under them (hashed, not stepped: an even step
  // lines the inserts up in a spiral)
  const hash = (i: number, salt: number) => (((Math.sin(i * 12.9898 + salt) * 43758.5453) % 1) + 1) % 1;
  const turn = (i: number) => hash(i, 1) * 360; // degrees the chip is turned
  const nudge = (i: number) => Math.round(hash(i, 7.3) * 2 - 1); // -1, 0 or 1 (half of them 0), scaled to the width in css
  // which disc's look sits in each place. a shuffle (toys.ts) moves them round
  let order = $state<number[]>([]);
  const look = (i: number) => order[i] ?? i;
  // the tops you can see: the whole stack's, and the bottom half's while a
  // shuffle has it cut in two (toys.ts). the rest sit under the next disc. a
  // top sits square, its value the right way up like the chip on its own
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

<!-- data-v: tapped, the stack is riffled through on its chip's note (toys.ts).
     every child is a disc: toys.ts cuts and riffles them -->
<span
  bind:this={el}
  bind:clientWidth={px}
  class="stack"
  data-v={chip.value}
  style:--c={chip.color}
  style:--w={typeof width === "number" ? `${width}px` : width}
  style:--n={shown}
  title={t("chips.stackTitle", { n, value: label })}
>
  {#each { length: shown } as _, i (i)}
    {@const top = topped(i)}
    {@const t = top ? 0 : turn(look(i))}
    <i style:--i={i} style:--x={nudge(look(i))} style:--b={(hash(look(i), 4.1) * 0.08).toFixed(3)}>
      <!-- the edge: the clay and its inserts, wrapped round the front of the chip -->
      <svg class="edge" viewBox="-49 0 98 1" preserveAspectRatio="none" aria-hidden="true">
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
        {#each edgeInserts(chip, t) as s, k (k)}<rect x={s.x} y="0" width={s.w} height="1" fill={s.color} />{/each}
      </svg>
      {#if top}
        <!-- the chip's own face, seen from the stack's low angle -->
        <svg class="face" viewBox="-49 -49 98 98" preserveAspectRatio="none" aria-hidden="true">
          <ChipFace {chip} text={label} size={facePx} turn={t} id="{uid}-{i}" />
          <circle r="49" fill="url(#{uid}-lit)" />
          <circle r="49" fill="none" stroke="rgb(0 0 0 / 0.4)" stroke-width="1" vector-effect="non-scaling-stroke" />
        </svg>
      {/if}
    </i>
  {/each}
</span>

<style>
  /* a stack seen from a little above, like on the table in front of you. every
     disc is a short cylinder: a pill whose round ends are the foreshortened
     ellipse of its face (--e tall), set one chip's thickness (--t) above the
     one under it. so each disc shows only its curved edge band below the next,
     and the top chip shows its face. a page can set --t and --e on a stack to
     draw it thicker or flatter. */
  .stack {
    /* drawn on whole pixels: a disc that dropped in or zipped back in from a
       shuffle is drawn on its own layer while it moves, and a disc at a
       fraction of a pixel shimmered as it went back onto the page */
    --step: round(var(--t, calc(var(--w) * 0.1)), 1px);
    --face: round(var(--e, calc(var(--w) * 0.34)), 1px);
    position: relative;
    isolation: isolate; /* a shuffle reorders the discs without reaching past the stack */
    display: inline-block;
    flex: none;
    width: var(--w);
    height: calc(var(--n, 1) * var(--step) + var(--face));
    vertical-align: bottom;
  }
  /* a stack being shuffled is lifted onto the top layer of the page (toys.ts):
     over everything, and its chips don't drop in again */
  .stack:global(.lifted) {
    position: absolute;
    z-index: 1000;
    margin: 0;
    pointer-events: none;
  }
  .stack:global(.lifted) i {
    animation: none;
  }
  /* its shadow on the felt. the light's up and to the left, so it falls away
     down and to the right, darkest right under the bottom chip */
  .stack::before,
  .stack::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    z-index: -1;
  }
  .stack::before {
    left: 0;
    right: -26%;
    bottom: calc(var(--face) * -0.34);
    height: calc(var(--face) * 1.3);
    background: radial-gradient(closest-side, rgb(0 0 0 / 0.3), rgb(0 0 0 / 0));
  }
  .stack::after {
    left: 1%;
    right: -3%;
    bottom: calc(var(--face) * -0.08);
    height: var(--face);
    background: radial-gradient(closest-side, rgb(0 0 0 / 0.4) 72%, rgb(0 0 0 / 0));
  }
  /* each disc: the edge with its inserts, turned a different amount on every
     disc so they never stack into stripes, and a whole pixel or two off the
     one under it. the seam under it is a dark line where two chips meet, with
     the rounded top of the chip below catching the light under it. */
  i {
    position: absolute;
    left: 0;
    right: 0;
    bottom: calc(var(--i) * var(--step));
    height: calc(var(--face) + var(--step));
    border-radius: 50% / calc(var(--face) / 2);
    overflow: hidden;
    isolation: isolate;
    background: var(--c);
    translate: round(calc(var(--w) * 0.022 * var(--x, 0)), 1px) 0;
    box-shadow:
      0 max(1px, calc(var(--step) * 0.12)) 0 rgb(0 0 0 / 0.5),
      0 max(2px, calc(var(--step) * 0.26)) 0 rgb(255 255 255 / 0.1);
    animation: drop 0.36s var(--ease-out-expo) backwards;
    animation-delay: calc(var(--i) * 18ms + var(--d, 0ms));
  }
  svg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    overflow: visible;
  }
  .edge {
    height: 100%;
  }
  /* the top of a chip under another is only seen mid-shuffle: plain clay */
  i::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: var(--face);
    border-radius: 50%;
    background: var(--c);
    z-index: 1;
  }
  /* the edge is round and faces out, not up, so it's a shade darker than the
     face: darkest at the sides, a soft light just left of center, and its
     rounded bottom edge turning away into shade */
  i::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: inherit;
    background-image: linear-gradient(
      90deg,
      rgb(0 0 0 / 0.56),
      rgb(0 0 0 / 0.24) 15%,
      rgb(255 255 255 / 0.06) 33%,
      rgb(0 0 0 / 0.12) 50%,
      rgb(0 0 0 / 0.3) 76%,
      rgb(0 0 0 / 0.62)
    );
    /* no two chips catch the light quite alike */
    background-color: rgb(0 0 0 / var(--b, 0));
    box-shadow: inset 0 calc(var(--step) * -0.2) calc(var(--step) * 0.3) rgb(0 0 0 / 0.32);
  }
  /* the face, over the shade */
  .face {
    height: var(--face);
    z-index: 2;
  }
  @keyframes drop {
    from {
      transform: translateY(-14px);
      opacity: 0;
    }
  }
</style>

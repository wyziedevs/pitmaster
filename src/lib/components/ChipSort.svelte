<script lang="ts">
  // a spill of chips from your own chip set on the home page. tap the felt and
  // they hop home into stacks by color, each on its own note; tap a loose chip
  // to send just that one; tap a stack to knock it over. tap the felt again
  // once they're all stacked and the lot goes over.
  import Chip from "$lib/components/Chip.svelte";
  import { getChipSet, getDefaultChipSetId } from "$lib/store";
  import { play } from "$lib/sound";
  import { reducedMotion } from "$lib/motion";

  const W = 240;
  const H = 100;
  const SIZE = 28;
  /** how far up each chip on a stack sits */
  const STEP = 2.8;
  const COUNTS = [5, 4, 4, 3, 2];

  const kinds = [...(getChipSet(getDefaultChipSetId())?.chips ?? [])].sort((a, b) => a.value - b.value).slice(0, COUNTS.length);
  const colW = W / Math.max(kinds.length, 1);
  const base = H - SIZE - 2;

  type Loose = { id: number; k: number; x: number; y: number; at: number; d: number; hop: number };
  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const later = (fn: () => void, ms: number) => setTimeout(fn, reducedMotion() ? 0 : ms);

  /** somewhere on the felt, or near `x` when a stack goes over */
  const spot = (x?: number) => ({
    x: x === undefined ? rand(0, W - SIZE) : Math.max(0, Math.min(W - SIZE, x + rand(-56, 56))),
    y: rand(4, H - SIZE - 6),
  });

  let n = 0;
  let chips = $state<Loose[]>(
    kinds.flatMap((_, k) => Array.from({ length: COUNTS[k] }, () => ({ id: n++, k, ...spot(), at: 0, d: 0, hop: 0 }))),
  );
  let stamp = 0;

  const stackX = (k: number) => colW * k + colW / 2 - SIZE / 2;
  // the mat runs away from you, so a chip further back on it is smaller and
  // closer to the middle: FAR is its size at the back edge of the felt. the
  // mat reaches from just above the chips to a little in front of the stacks
  const FAR = 0.8;
  const MAT = { back: -2, front: H + 7 };
  const depth = (y: number) => FAR + (1 - FAR) * Math.min(1, Math.max(0, (y + SIZE / 2 - MAT.back) / (MAT.front - MAT.back)));
  const toward = (x: number, s: number) => W / 2 + (x + SIZE / 2 - W / 2) * s - SIZE / 2;
  /** where each chip is drawn: its own spot, or its place on its stack */
  const placed = $derived.by(() => {
    const height = new Map<number, number>();
    const order = [...chips].filter((c) => c.at).sort((a, b) => a.at - b.at);
    const level = new Map<number, number>();
    for (const c of order) {
      const j = height.get(c.k) ?? 0;
      level.set(c.id, j);
      height.set(c.k, j + 1);
    }
    return chips.map((c) => {
      const j = level.get(c.id);
      if (j === undefined) {
        const s = depth(c.y);
        return { c, s, x: toward(c.x, s), y: c.y, z: Math.round(c.y) };
      }
      const s = depth(base);
      return { c, s, x: toward(stackX(c.k), s), y: base - j * STEP * s, z: 100 + j };
    });
  });

  /** one loose chip, home onto its stack */
  function home(c: Loose, x: number) {
    c.at = ++stamp;
    c.d = 0;
    c.hop++;
    later(() => play("note", { value: kinds[c.k].value, x }), 300);
  }

  /** a stack knocked over: its chips spill out round where it stood */
  function knock(k: number) {
    const on = chips.filter((c) => c.k === k && c.at).sort((a, b) => b.at - a.at);
    on.forEach((c, i) => {
      Object.assign(c, spot(stackX(k)), { at: 0, d: i * 24 });
      c.hop++;
    });
    play("topple");
  }

  /** the felt: every loose chip home, lowest value first, or everything over */
  function felt() {
    const loose = chips.filter((c) => !c.at).sort((a, b) => a.k - b.k || a.x - b.x);
    if (!loose.length) {
      for (const c of chips) Object.assign(c, spot(), { at: 0, d: Math.random() * 90 });
      for (const c of chips) c.hop++;
      play("topple");
      later(() => play("chips"), 160);
      return;
    }
    loose.forEach((c, i) => {
      c.at = ++stamp;
      c.d = i * 55;
      c.hop++;
      later(() => play("note", { value: kinds[c.k].value }), c.d + 300);
    });
  }

  function tap(e: MouseEvent) {
    const el = (e.target as Element).closest<HTMLElement>("[data-i]");
    const c = el ? chips.find((x) => x.id === Number(el.dataset.i)) : undefined;
    if (!c) return felt();
    if (c.at) knock(c.k);
    else home(c, e.clientX);
  }

  function key(e: KeyboardEvent) {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    felt();
  }
</script>

{#if kinds.length}
  <div class="toy">
    <!-- a toy, not a form: the pointer picks a chip or a stack, and the keyboard gets the felt -->
    <div
      class="spill"
      role="button"
      tabindex="0"
      aria-label="Chips to sort. Press to stack them up, and again to knock them over"
      data-sound="none"
      onclick={tap}
      onkeydown={key}
    >
      <!-- a felt mat on the table, running away from you -->
      <span class="mat" aria-hidden="true"></span>
      {#each placed as p (p.c.id)}
        <span
          class="chip"
          class:stacked={!!p.c.at}
          data-i={p.c.id}
          style:translate="{p.x}px {p.y}px"
          style:scale={p.s}
          style:z-index={p.z}
          style:--d="{p.c.d}ms"
        >
          <span class="hop" class:a={p.c.hop % 2 === 1} class:b={p.c.hop > 0 && p.c.hop % 2 === 0}>
            <Chip chip={kinds[p.c.k]} size={SIZE} text="" spin={false} />
          </span>
        </span>
      {/each}
    </div>
    <p class="hint">Tap to sort. Tap a stack to knock it over.</p>
  </div>
{/if}

<style>
  .spill {
    position: relative;
    width: 240px;
    /* the chips' 100px, and the front of the mat */
    height: 110px;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
    border-radius: 6px;
    /* the chips' order front to back stays inside the mat */
    isolation: isolate;
  }
  .spill:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
  /* the mat: felt with a stitched hem and a rubber back, tipped away to the
     same angle the chips are drawn at, so they lie on it */
  .mat {
    position: absolute;
    left: -16px;
    right: -16px;
    bottom: 3px;
    height: 175px;
    border-radius: 9px;
    transform-origin: 50% 100%;
    transform: perspective(360px) rotateX(35deg);
    background:
      var(--cloth),
      radial-gradient(ellipse 70% 55% at 38% 30%, oklch(from var(--felt) calc(l + 0.06) c h), transparent),
      var(--felt);
    background-blend-mode: soft-light, normal, normal;
    box-shadow:
      inset 0 0 0 var(--hair) oklch(from var(--felt) calc(l - 0.08) c h),
      inset 0 0 14px oklch(from var(--felt) calc(l - 0.12) c h / 0.7),
      0 2.5px 0 oklch(from var(--felt) calc(l - 0.17) c h),
      0 8px 14px -4px oklch(10% 0 0 / 0.4);
  }
  .mat::before {
    content: "";
    position: absolute;
    inset: 5px;
    border: 1px dashed color-mix(in oklch, var(--felt), oklch(88% 0.04 160) 38%);
    border-radius: 5px;
  }
  .chip {
    position: absolute;
    left: 0;
    top: 0;
    display: block;
    line-height: 0;
    transition:
      translate 440ms var(--ease-out-expo) var(--d),
      scale 440ms var(--ease-out-expo) var(--d);
  }
  .chip :global(svg) {
    display: block;
    pointer-events: none;
  }
  /* each move is a little hop, not a slide across the felt. two copies of the
     same keyframes so a second move restarts it */
  .hop {
    display: block;
    transition: translate 120ms var(--ease-out);
  }
  .hop.a {
    animation: hop-a 440ms var(--ease-out) var(--d) backwards;
  }
  .hop.b {
    animation: hop-b 440ms var(--ease-out) var(--d) backwards;
  }
  @keyframes hop-a {
    40% {
      translate: 0 -12px;
    }
  }
  @keyframes hop-b {
    40% {
      translate: 0 -12px;
    }
  }
  .chip:not(.stacked):hover .hop {
    translate: 0 -2px;
  }
  @media (prefers-reduced-motion: reduce) {
    .chip,
    .hop {
      transition: none;
    }
    .hop.a,
    .hop.b {
      animation: none;
    }
  }
</style>

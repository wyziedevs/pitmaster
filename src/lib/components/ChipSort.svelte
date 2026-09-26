<script lang="ts">
  // a spill of chips from your own chip set on the home page. tap the felt and
  // they hop home into stacks by color, each on its own note; tap a loose chip
  // to send just that one (off the top of its pile); tap a stack to knock it
  // over. tap the felt again once they're all stacked and the lot goes over.
  // the chips are solid: one that lands on another rests on top of it, a chip
  // thickness up, so a spill heaps up the way real chips do on felt.
  import Chip from "$lib/components/Chip.svelte";
  import { getChipSet, getDefaultChipSetId } from "$lib/store";
  import { play } from "$lib/sound";
  import { reducedMotion } from "$lib/motion";
  import { t } from "$lib/i18n";

  const W = 240;
  const H = 100;
  const SIZE = 28;
  const COUNTS = [6, 5, 4, 4, 3];
  // the chips are drawn by Chip.svelte, tipped back so the face is 0.82 as tall
  // as it's wide: D is the face across, and THICK one chip's edge, in px at
  // full size (its 6 units of edge under the tilt)
  const TILT = 0.82;
  const D = SIZE * 0.98;
  const THICK = (6 * TILT * SIZE) / 100;

  const kinds = [...(getChipSet(getDefaultChipSetId())?.chips ?? [])].sort((a, b) => a.value - b.value).slice(0, COUNTS.length);
  const colW = W / Math.max(kinds.length, 1);
  /** the stacks stand in a row along the front of the mat */
  const base = H - SIZE + 1;
  const stackX = (k: number) => colW * k + colW / 2 - SIZE / 2;

  // the mat runs away from you, so a chip further back on it is smaller and
  // closer to the middle: FAR is its size at the back edge of the felt. the
  // mat reaches from just above the chips to a little in front of the stacks
  const FAR = 0.8;
  const MAT = { back: -2, front: H + 7 };
  const depth = (y: number) => FAR + (1 - FAR) * Math.min(1, Math.max(0, (y + SIZE / 2 - MAT.back) / (MAT.front - MAT.back)));
  const toward = (x: number, s: number) => W / 2 + (x + SIZE / 2 - W / 2) * s - SIZE / 2;
  /** loose chips keep behind the stacks' row, so nothing lands on a stack */
  const BACK = base - Math.ceil(D * TILT * depth(base));

  /**
   * a chip on the felt: `x` across and `y` back to front (where it touches
   * down, before it's raised by what it's lying on), `land` the order the
   * loose ones came down in, `at` its place on its stack once it's sorted,
   * `r` how far it's turned where it lies
   */
  type Loose = { id: number; k: number; x: number; y: number; r: number; land: number; at: number; d: number; hop: number; air: boolean };
  type Spot = { x: number; y: number };
  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const later = (fn: () => void, ms: number) => setTimeout(fn, reducedMotion() ? 0 : ms);

  /** how far apart two chips' centers are across the felt, in chip widths of D */
  function apart(a: Spot, b: Spot) {
    const s = (depth(a.y) + depth(b.y)) / 2;
    return Math.hypot(a.x - b.x, (a.y - b.y) / (TILT * s));
  }
  const clampSpot = (p: Spot): Spot => ({ x: Math.max(0, Math.min(W - SIZE, p.x)), y: Math.max(2, Math.min(BACK, p.y)) });

  /** how many chips up each loose chip lies: one above the highest it came down on */
  function pile(loose: Loose[]) {
    const level = new Map<number, number>();
    const down: Loose[] = [];
    for (const c of [...loose].sort((a, b) => a.land - b.land)) {
      let l = 0;
      for (const q of down) if (apart(c, q) < D) l = Math.max(l, level.get(q.id)! + 1);
      level.set(c.id, l);
      down.push(c);
    }
    return level;
  }

  /**
   * where a chip thrown at `p` comes to rest among the chips already down. if
   * it would sit with less than about half of it on the chip under it, it
   * slides off that chip's edge, down onto whatever's lower, and so on
   */
  function settle(p: Spot, down: Loose[]): Spot {
    const level = pile(down);
    for (let pass = 0; pass < 4; pass++) {
      const hit = down.filter((q) => apart(p, q) < D);
      if (!hit.length) break;
      const top = Math.max(...hit.map((q) => level.get(q.id)!));
      const under = hit.filter((q) => level.get(q.id) === top);
      if (under.some((q) => apart(p, q) <= D * 0.6)) break;
      const q = under[0];
      const s = TILT * (depth(p.y) + depth(q.y)) / 2;
      const dx = p.x - q.x;
      const dz = (p.y - q.y) / s;
      const len = Math.hypot(dx, dz) || 1;
      p = clampSpot({ x: q.x + (dx / len) * D * 1.02, y: q.y + (dz / len) * D * 1.02 * s });
    }
    return p;
  }

  /** somewhere on the felt, or near `x` when a stack goes over */
  const spot = (x?: number): Spot =>
    clampSpot({ x: x === undefined ? rand(0, W - SIZE) : x + rand(-56, 56), y: rand(2, BACK) });

  let landed = 0;
  /** the first spill, each chip coming down on the ones before it */
  function firstSpill() {
    const down: Loose[] = [];
    kinds.forEach((_, k) => {
      for (let i = 0; i < COUNTS[k]; i++) down.push({ id: down.length, k, ...settle(spot(), down), r: rand(0, 360), land: ++landed, at: 0, d: 0, hop: 0, air: false });
    });
    return down;
  }
  let chips = $state<Loose[]>(firstSpill());
  let stamp = 0;

  /**
   * where each chip is drawn, and in what order: its own spot raised by the
   * chips under it, or its place on its stack. chips further back go first,
   * but a chip lying on another always goes after it, so it's drawn over it
   */
  const placed = $derived.by(() => {
    const level = pile(chips.filter((c) => !c.at));
    const height = new Map<number, number>();
    for (const c of chips.filter((c) => c.at).sort((a, b) => a.at - b.at)) {
      level.set(c.id, height.get(c.k) ?? 0);
      height.set(c.k, level.get(c.id)! + 1);
    }
    const all = chips.map((c) => {
      const at = c.at ? { x: stackX(c.k), y: base } : { x: c.x, y: c.y };
      const s = depth(at.y);
      const l = level.get(c.id)!;
      return { c, ...at, l, s, sx: toward(at.x, s), sy: at.y - l * THICK * s };
    });
    // lowest first among chips that overlap, back to front among the rest
    const order: typeof all = [];
    const left = new Set(all);
    while (left.size) {
      let next: (typeof all)[number] | undefined;
      for (const p of left) {
        const blocked = [...left].some((q) => q !== p && q.l < p.l && apart(p, q) < D);
        if (!blocked && (!next || p.y < next.y || (p.y === next.y && p.l < next.l))) next = p;
      }
      next ??= [...left][0];
      left.delete(next);
      order.push(next);
    }
    return order.map((p, i) => ({ ...p, z: (p.c.air ? 1000 : 1) + i }));
  });

  /** a chip in the air until it lands, over everything it passes */
  function fly(c: Loose) {
    c.air = true;
    c.hop++;
    c.r = rand(0, 360);
    later(() => (c.air = false), c.d + 460);
  }

  /** one loose chip, home onto its stack */
  function home(c: Loose, x: number) {
    c.at = ++stamp;
    c.d = 0;
    fly(c);
    later(() => play("note", { value: kinds[c.k].value, x }), 300);
  }

  /** chips coming down on the felt, in the order they land, each on the ones before it */
  function spill(going: Loose[], near?: number) {
    for (const c of going) c.at = 0;
    const down = chips.filter((c) => !c.at && !going.includes(c));
    for (const c of [...going].sort((a, b) => a.d - b.d)) {
      Object.assign(c, settle(spot(near), down), { land: ++landed });
      fly(c);
      down.push(c);
    }
  }

  /** a stack knocked over: its chips spill out round where it stood */
  function knock(k: number) {
    const on = chips.filter((c) => c.k === k && c.at).sort((a, b) => b.at - a.at);
    on.forEach((c, i) => (c.d = i * 24));
    spill(on, stackX(k));
    play("topple");
  }

  /** the felt: every loose chip home, lowest value first, or everything over */
  function felt() {
    const loose = chips.filter((c) => !c.at).sort((a, b) => a.k - b.k || a.x - b.x);
    if (!loose.length) {
      for (const c of chips) c.d = Math.random() * 90;
      spill(chips);
      play("topple");
      later(() => play("chips"), 160);
      return;
    }
    loose.forEach((c, i) => {
      c.at = ++stamp;
      c.d = i * 55;
      fly(c);
      later(() => play("note", { value: kinds[c.k].value }), c.d + 300);
    });
  }

  /** a tap on a pile takes the chip off the top of it */
  function topOf(c: Loose) {
    const level = pile(chips.filter((q) => !q.at));
    const above = chips.filter((q) => !q.at && apart(q, c) < D && level.get(q.id)! > level.get(c.id)!);
    return above.sort((a, b) => level.get(b.id)! - level.get(a.id)!)[0] ?? c;
  }

  function tap(e: MouseEvent) {
    const el = (e.target as Element).closest<HTMLElement>("[data-i]");
    const c = el ? chips.find((x) => x.id === Number(el.dataset.i)) : undefined;
    if (!c) return felt();
    if (c.at) knock(c.k);
    else home(topOf(c), e.clientX);
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
      aria-label={t("chips.sortAreaAria")}
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
          class:a={p.c.hop % 2 === 1}
          class:b={p.c.hop > 0 && p.c.hop % 2 === 0}
          data-i={p.c.id}
          style:translate="{p.sx}px {p.sy}px"
          style:scale={p.s}
          style:z-index={p.z}
          style:--d="{p.c.d}ms"
        >
          <!-- its shadow stays on whatever it's lying on while it hops -->
          <i class="shade"></i>
          <span class="hop">
            <Chip chip={kinds[p.c.k]} size={SIZE} rest={p.c.r} spin={false} shadow={false} />
            <i class="hit"></i>
          </span>
        </span>
      {/each}
    </div>
    <p class="hint">{t("chips.sortHint")}</p>
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
  /* each chip is its drawn box; only the chip itself takes a tap, so a tap
     near the edge of one isn't caught by the corner of the next one's box */
  .chip {
    position: absolute;
    left: 0;
    top: 0;
    display: block;
    width: 28px;
    height: 28px;
    line-height: 0;
    pointer-events: none;
    transition:
      translate 440ms var(--ease-out-expo) var(--d),
      scale 440ms var(--ease-out-expo) var(--d);
  }
  .chip :global(svg) {
    display: block;
  }
  .hit {
    position: absolute;
    left: 0;
    right: 0;
    top: 2px;
    height: 24px;
    border-radius: 50%;
    pointer-events: auto;
  }
  /* the light's up and to the left, so a chip's shadow falls down and to the
     right of it, onto the felt or the chip it's lying on */
  .shade {
    position: absolute;
    left: 2px;
    top: 22px;
    width: 28px;
    height: 6px;
    border-radius: 50%;
    background: radial-gradient(closest-side, rgb(0 0 0 / 0.42), rgb(0 0 0 / 0));
  }
  /* each move is a little hop, not a slide across the felt: the chip comes up
     off its shadow and the shadow tightens and fades under it. two copies of
     the same keyframes so a second move restarts them */
  .hop {
    position: relative;
    display: block;
    transition: translate 120ms var(--ease-out);
  }
  .a .hop {
    animation: hop-a 440ms var(--ease-out) var(--d) backwards;
  }
  .b .hop {
    animation: hop-b 440ms var(--ease-out) var(--d) backwards;
  }
  .a .shade {
    animation: lift-a 440ms var(--ease-out) var(--d) backwards;
  }
  .b .shade {
    animation: lift-b 440ms var(--ease-out) var(--d) backwards;
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
  @keyframes lift-a {
    40% {
      scale: 0.7;
      opacity: 0.35;
    }
  }
  @keyframes lift-b {
    40% {
      scale: 0.7;
      opacity: 0.35;
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
    .a .hop,
    .b .hop,
    .a .shade,
    .b .shade {
      animation: none;
    }
  }
</style>

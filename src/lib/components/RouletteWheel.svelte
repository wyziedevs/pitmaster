<script lang="ts">
  // a single-zero roulette wheel on the home page, seen from the table. flick
  // the wheel to spin it (or tap it and the croupier does): the ball goes round
  // the bowl the other way, slows, runs down the slope past the diamonds,
  // clatters over the frets and drops into a pocket, and the number it found
  // comes up beside it. drag it slowly and the frets tick past under your
  // finger. it's just a wheel to spin: nothing is bet, won or kept.
  import { play } from "$lib/sound";
  import { reducedMotion } from "$lib/motion";

  // the pockets clockwise from the zero, as every single-zero wheel has them
  const ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
  const N = ORDER.length;
  const SEG = 360 / N;
  type Hue = "red" | "black" | "green";
  const hue = (n: number): Hue => (n === 0 ? "green" : REDS.has(n) ? "red" : "black");

  // ---- the wheel, in its own units (drawn -100 to 100) ----
  /** the groove round the bowl the ball runs in, and the slope's top edge */
  const TRACK = 86;
  const SLOPE_TOP = 80;
  /** the diamonds on the slope below it */
  const DIAMOND = 78;
  /** the spinning part's edge */
  const RIM = 70;
  /** the middle of a pocket */
  const POCKET = 46;
  /** px across, and how far the table tips it away */
  const SIZE = 150;
  const TILT = 46;
  const PX = SIZE / 200;
  /** round the track slower than this (deg/s) and the ball can't hold the wall */
  const DROP = 230;

  // ---- its depth, in px ----
  // a real bowl is deep: the wheel sits well down inside the rim, the cone
  // rises out of the wheel's middle, and the whole thing is a turned wooden
  // drum. each is drawn as flat layers stacked close enough to read as solid
  /** from the rim down to the wheel */
  const DEEP = 9;
  /** the drum's side, under the rim */
  const DRUM = 10;
  /** the cone, up from the wheel */
  const CONE = 5;
  const SLOPE = [1, 2, 3, 4, 5, 6].map((k, _, all) => ({ r: SLOPE_TOP - (k * (SLOPE_TOP - RIM)) / all.length, z: (-k * DEEP) / all.length, k: k / all.length }));
  const CONES = [1, 2, 3, 4, 5].map((j, _, all) => ({ r: 37 - j * 4.6, z: -DEEP + (j * CONE) / all.length }));
  const SIDES = Array.from({ length: DRUM }, (_, k) => ({ z: -(k + 1), k: (k + 1) / DRUM }));
  /** how high the bowl's surface is (px, 0 at the rim) at r out from the middle */
  const floorAt = (r: number) => (r >= SLOPE_TOP ? 0 : r >= RIM ? (-DEEP * (SLOPE_TOP - r)) / (SLOPE_TOP - RIM) : -DEEP);

  const uid = $props.id();
  const rad = (d: number) => (d * Math.PI) / 180;
  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const pt = (r: number, a: number) => `${(r * Math.sin(rad(a))).toFixed(2)} ${(-r * Math.cos(rad(a))).toFixed(2)}`;
  // a slice of a ring, clockwise from a0 to a1
  const slice = (r0: number, r1: number, a0: number, a1: number) =>
    `M ${pt(r1, a0)} A ${r1} ${r1} 0 0 1 ${pt(r1, a1)} L ${pt(r0, a1)} A ${r0} ${r0} 0 0 0 ${pt(r0, a0)} Z`;
  // a whole ring, r0 to r1 (fill-rule evenodd)
  const circ = (r: number) => `M ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 Z`;
  const ring = (r0: number, r1: number) => `${circ(r1)} ${circ(r0)}`;
  // an arc along a circle, clockwise from a0 to a1
  const arc = (r: number, a0: number, a1: number) => `M ${pt(r, a0)} A ${r} ${r} 0 0 1 ${pt(r, a1)}`;
  const POCKETS = ORDER.map((n, k) => {
    const a = k * SEG;
    return { n, a, hue: hue(n), ring: slice(54, 66, a - SEG / 2, a + SEG / 2), well: slice(38, 54, a - SEG / 2, a + SEG / 2) };
  });
  const DIAMONDS = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => k * 45 + 22.5);

  // ---- where everything is ----
  /** the wheel's turn, deg clockwise, and how fast it's going (deg/s) */
  let turn = $state(0);
  let spin = 0;
  type Phase = "home" | "pick" | "track" | "fall" | "hop" | "settle";
  let phase = $state<Phase>("home");
  /** once it's in the pockets: where it is on the wheel, and how fast it's crossing them */
  let rel = Math.floor(Math.random() * N) * SEG;
  /** the ball: round the bowl (deg clockwise from the top), out from the middle, up off the wood */
  let ball = $state({ a: rel, r: POCKET, z: 0 });
  let bv = 0;
  let zv = 0;
  let clock = 0;
  let knocked = false;
  let fret = 0;
  let from = { a: 0, r: 0 };
  let goal = 0;
  let dir = 1;

  let id = 0;
  let result = $state<{ n: number; id: number } | null>(null);

  // ---- the loop: only while something's moving ----
  let raf = 0;
  let last = 0;
  function run() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    step(dt);
    raf = grab || phase !== "home" || spin ? requestAnimationFrame(frame) : 0;
  }
  $effect(() => () => cancelAnimationFrame(raf));

  function step(dt: number) {
    // the wheel coasts, a long slow run down
    if (!grab) {
      turn += spin * dt;
      spin *= Math.exp(-dt / 6);
      if (Math.abs(spin) < 1.2 && phase === "home") spin = 0;
    }
    clock += dt;
    switch (phase) {
      case "pick": {
        // the croupier lifts it out of its pocket and sets it in the groove
        const p = Math.min(1, clock / 0.28);
        const e = 1 - (1 - p) ** 3;
        ball = { a: from.a + (from.a + 40 * dir - from.a) * e, r: from.r + (TRACK - from.r) * e, z: Math.sin(p * Math.PI) * 16 };
        if (p === 1) {
          phase = "track";
          clock = 0;
          bv = -dir * rand(640, 860);
          // it runs until it's slow enough to drop, then down the slope
          play("roll", { len: 2.4 * Math.log(Math.abs(bv) / DROP) + 0.5 });
        }
        break;
      }
      case "track":
        ball.a += bv * dt;
        bv *= Math.exp(-dt / 2.4);
        if (Math.abs(bv) < DROP) {
          phase = "fall";
          clock = 0;
          knocked = false;
        }
        break;
      case "fall": {
        // down the slope, quicker as it goes, still carrying round
        const p = Math.min(1, clock / 0.6);
        const r = TRACK - (TRACK - RIM) * p * p;
        ball.a += bv * dt;
        bv *= Math.exp(-dt / 1.6);
        // a diamond in its way knocks it off line and up
        if (!knocked && Math.abs(r - DIAMOND) < 3) {
          const off = (((ball.a - 22.5) % 45) + 45) % 45;
          if (off < 5 || off > 40) {
            knocked = true;
            bv *= rand(0.4, 0.75);
            zv = rand(70, 130);
            play("rim", { x: screenX() });
          }
        }
        const hit = ballUp(dt);
        if (hit) play("fret", { v: hit / 320, x: screenX() });
        ball.r = r;
        if (p === 1) {
          // onto the wheel: from here on it's where it is on the wheel that counts
          phase = "hop";
          rel = ball.a - turn;
          bv -= spin;
          zv = Math.max(zv, rand(90, 150));
          fret = Math.round(rel / SEG);
        }
        break;
      }
      case "hop": {
        rel += bv * dt;
        bv *= Math.exp(-dt / 0.55);
        ball.r += (POCKET - ball.r) * Math.min(1, dt * 7);
        const landed = ballUp(dt);
        // each landing on a fret takes a good bite out of it
        if (landed) {
          play("fret", { v: landed / 240, x: screenX() });
          bv *= 0.6;
        }
        // rolling over the frets, a tick for each
        const f = Math.round(rel / SEG);
        if (f !== fret) {
          fret = f;
          if (ball.z < 0.5) play("fret", { v: Math.min(0.55, Math.abs(bv) / 520), x: screenX() });
        }
        if (ball.z === 0 && !zv && Math.abs(bv) < 28) {
          phase = "settle";
          clock = 0;
          from = { a: rel, r: ball.r };
          goal = Math.round(rel / SEG) * SEG;
        }
        ball.a = turn + rel;
        break;
      }
      case "settle": {
        const p = Math.min(1, clock / 0.22);
        const e = 1 - (1 - p) ** 3;
        rel = from.a + (goal - from.a) * e;
        ball.r = from.r + (POCKET - from.r) * e;
        ball.a = turn + rel;
        if (p === 1) land();
        break;
      }
      case "home":
        ball.a = turn + rel;
        break;
    }
  }

  /** gravity on the ball; returns how hard it came down, if it just did */
  function ballUp(dt: number) {
    if (!zv && !ball.z) return 0;
    zv -= 1500 * dt;
    ball.z += zv * dt;
    if (ball.z > 0) return 0;
    ball.z = 0;
    const hit = -zv;
    zv = hit > 45 ? hit * 0.42 : 0;
    return hit > 45 ? hit : 0;
  }

  function land() {
    const k = ((Math.round(goal / SEG) % N) + N) % N;
    const n = ORDER[k];
    phase = "home";
    result = { n, id: ++id };
    play("pocket", { x: screenX() });
  }

  /** the croupier's spin: the wheel one way, then the ball the other */
  function spinIt(d = (dir = -dir)) {
    if (phase !== "home") return;
    dir = d;
    result = null;
    if (reducedMotion()) {
      rel = Math.floor(Math.random() * N) * SEG;
      goal = rel;
      ball.a = turn + rel;
      return land();
    }
    if (Math.abs(spin) < 120) spin = d * rand(150, 220);
    play("wheel", { len: 5 });
    phase = "pick";
    clock = 0;
    from = { a: ball.a, r: ball.r };
    run();
  }

  // ---- the hand on the wheel ----
  let plane: HTMLElement;
  let grab = $state<{ last: number; moved: number; marks: [number, number][] } | null>(null);
  let under = 0;

  /** the pointer's angle round the wheel, with the table's tip taken out */
  function angleAt(e: PointerEvent) {
    const r = plane.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / Math.cos(rad(TILT));
    return (Math.atan2(dx, -dy) * 180) / Math.PI;
  }
  const screenX = () => plane?.getBoundingClientRect().left + SIZE / 2;

  function down(e: PointerEvent) {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    // a hand on the wheel stops it
    spin = 0;
    grab = { last: angleAt(e), moved: 0, marks: [[performance.now(), turn]] };
    under = Math.floor(turn / SEG);
    run();
  }
  function move(e: PointerEvent) {
    if (!grab) return;
    const a = angleAt(e);
    const d = ((a - grab.last + 540) % 360) - 180;
    grab.last = a;
    grab.moved += Math.abs(d);
    turn += d;
    const now = performance.now();
    grab.marks = [...grab.marks.filter(([t]) => now - t < 90), [now, turn]];
    // the frets tick past under the finger
    const f = Math.floor(turn / SEG);
    if (f !== under) {
      under = f;
      play("fret", { v: 0.22, x: e.clientX });
    }
  }
  function up() {
    if (!grab) return;
    const g = grab;
    grab = null;
    if (g.moved < 4) return spinIt();
    // let go with some speed on it and it spins, and the croupier sends the ball
    const [t0, a0] = g.marks[0];
    const [t1, a1] = g.marks[g.marks.length - 1];
    spin = t1 - t0 > 12 ? Math.max(-480, Math.min(480, ((a1 - a0) / (t1 - t0)) * 1000)) : 0;
    if (Math.abs(spin) > 90 && phase === "home") spinIt(Math.sign(spin));
    else if (Math.abs(spin) > 25) play("wheel", { len: 2 });
    run();
  }
  function key(e: KeyboardEvent) {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    if (!e.repeat) spinIt();
  }

  // the ball on the page: out along its angle, down the bowl as far as the
  // surface under it goes, and up off it when it bounces
  const bx = $derived(ball.r * Math.sin(rad(ball.a)) * PX);
  const by = $derived(-ball.r * Math.cos(rad(ball.a)) * PX);
  const bz = $derived(floorAt(ball.r));
</script>

<div class="toy">
  <div class="table">
    <button
      type="button"
      class="wheel"
      class:held={!!grab}
      data-sound="none"
      aria-label="Roulette wheel, flick it to spin"
      onpointerdown={down}
      onpointermove={move}
      onpointerup={up}
      onpointercancel={up}
      onkeydown={key}
      oncontextmenu={(e) => e.preventDefault()}
    >
      <span class="plane" bind:this={plane} style:--size="{SIZE}px" style:--tilt="{TILT}deg" style:--u="{PX}px" aria-hidden="true">
        <span class="under" style:--z="{-DRUM - 0.5}px"></span>
        <!-- the drum's side: a turned wooden band under the rim, round toward you -->
        {#each SIDES as s (s.z)}
          <span class="layer side" style:--z="{s.z}px" style:--k={s.k}></span>
        {/each}
        <!-- the slope, from the ball track down to the wheel -->
        {#each SLOPE as s (s.z)}
          <span class="layer slope" style:--in={s.r} style:--z="{s.z}px" style:--k={s.k}></span>
        {/each}
        <svg class="layer" style:--z="-1.2px" viewBox="-100 -100 200 200">
          {#each DIAMONDS as a (a)}
            <path transform="rotate({a}) translate(0 {-DIAMOND})" d="M 0 -3.6 L 1.6 0 L 0 3.6 L -1.6 0 Z" class="diamond" />
          {/each}
        </svg>
        <!-- the rim and the polished ball track round the top of the bowl -->
        <svg class="layer" viewBox="-100 -100 200 200">
          <defs>
            <radialGradient id="{uid}-grain" cx="0" cy="0" r="2.2" gradientUnits="userSpaceOnUse" spreadMethod="reflect">
              <stop offset="0" class="grain-a" />
              <stop offset="1" class="grain-b" />
            </radialGradient>
            <linearGradient id="{uid}-light" x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0" class="lit" />
              <stop offset="0.45" class="lit-off" />
              <stop offset="1" class="lit-dark" />
            </linearGradient>
          </defs>
          <path d={ring(92, 99)} fill-rule="evenodd" fill="url(#{uid}-grain)" />
          <path d={ring(SLOPE_TOP, 92)} fill-rule="evenodd" class="track" />
          <path d={ring(SLOPE_TOP, 99)} fill-rule="evenodd" fill="url(#{uid}-light)" />
          <!-- the lacquer catching the light on the far side of the track -->
          <path d={arc(86, -78, 12)} class="sheen" />
          <circle r="92" class="lip" />
          <circle r={SLOPE_TOP + 0.4} class="brink" />
        </svg>
        <!-- the wheel, sunk in the bowl, turning with its turret -->
        <span class="spin" style:rotate="{turn}deg">
          <svg class="layer" style:--z="{-DEEP}px" viewBox="-100 -100 200 200">
            <circle r={RIM} class="wood" />
            {#each POCKETS as p (p.n)}
              <path d={p.ring} class={p.hue} />
              <path d={p.well} class="well {p.hue}" />
            {/each}
            {#each POCKETS as p (p.n)}
              <line transform="rotate({p.a + SEG / 2})" y1="-38" y2="-55" class="fret" />
              <text transform="rotate({p.a}) translate(0 -60)" class="digit">{p.n}</text>
            {/each}
            <circle r="54" class="ring" />
            <circle r="38" class="ring" />
            <circle r="37" class="cone-foot" />
          </svg>
          {#each ["foot", "cap"] as part, i (part)}
            <svg class="layer turret {part}" style:--z="{-DEEP + CONE + 0.5 + i}px" viewBox="-100 -100 200 200">
              <defs>
                <linearGradient id="{uid}-chrome-{part}" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0.2" class="chrome-a" />
                  <stop offset="0.5" class="chrome-b" />
                  <stop offset="0.8" class="chrome-c" />
                </linearGradient>
              </defs>
              <g fill="url(#{uid}-chrome-{part})">
                <path d="M -2 -24 L 2 -24 L 2 -2 L 24 -2 L 24 2 L 2 2 L 2 24 L -2 24 L -2 2 L -24 2 L -24 -2 L -2 -2 Z" />
                {#each [0, 90, 180, 270] as a (a)}<circle transform="rotate({a})" cy="-24" r="3.4" />{/each}
                <circle r="7" />
              </g>
            </svg>
          {/each}
        </span>
        <!-- the room's light on the wheel stays put while it turns under it -->
        <span class="layer rotor-light" style:--z="{-DEEP + 0.3}px"></span>
        <!-- the cone, rising out of the middle -->
        {#each CONES as c (c.z)}
          <span class="layer cone" style:--r={c.r} style:--z="{c.z}px"></span>
        {/each}
        <span class="shade" style:translate="{bx}px {by}px {bz + 0.2}px" style:--z={ball.z}></span>
        <span class="ball" style:transform="translate3d({bx}px, {by}px, {bz + (ball.z + 3) * PX}px) rotateX(calc(-1 * var(--tilt)))"></span>
      </span>
    </button>

    <!-- where it landed, quietly, the way the dice say their total -->
    <div class="said" aria-live="polite">
      {#if result && phase === "home"}
        {#key result.id}<b class="landed num {hue(result.n)}">{result.n}</b>{/key}
      {/if}
    </div>
  </div>
  <p class="hint">Flick the wheel to spin it.</p>
</div>

<style>
  .table {
    position: relative;
    width: 250px;
    height: 118px;
    user-select: none;
    -webkit-user-select: none;
  }
  .wheel {
    all: unset;
    position: absolute;
    inset: 0;
    cursor: grab;
    border-radius: 6px;
    perspective: 520px;
    perspective-origin: 50% 0%;
    touch-action: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
  }
  .wheel:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
  .held {
    cursor: grabbing;
  }

  /* the wheel lying on the table, tipped away */
  .plane {
    position: absolute;
    /* tipped back, the near edge comes toward you and grows: centered here,
       the whole wheel lands inside the table, clear of the hint under it */
    left: calc((250px - var(--size)) / 2);
    top: calc(50px - var(--size) / 2);
    width: var(--size);
    height: var(--size);
    transform-style: preserve-3d;
    transform: rotateX(var(--tilt));
  }
  .plane > * {
    position: absolute;
    inset: 0;
  }
  .plane svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  /* one flat layer of the wheel: a disc r units across (of the 100 to the
     wheel's edge), at its height */
  .layer {
    position: absolute;
    inset: calc((100 - var(--r, 100)) * var(--u));
    border-radius: 50%;
    transform: translateZ(var(--z, 0px));
  }
  /* its weight on the table, under the drum */
  .under {
    inset: -2%;
    border-radius: 50%;
    background: radial-gradient(closest-side, oklch(10% 0.02 50 / 0.6) 80%, transparent);
    transform: translate3d(1.5%, 1.5%, var(--z));
  }

  /* the drum's side, a ring at each height: lit from the left, turning away
     into shadow at both ends, darker the lower it goes */
  .side {
    --r: 99;
    background: linear-gradient(
      90deg,
      oklch(calc(22% - 5% * var(--k)) 0.035 45),
      oklch(calc(36% - 7% * var(--k)) 0.06 50) 24%,
      oklch(calc(33% - 7% * var(--k)) 0.055 48) 55%,
      oklch(calc(18% - 4% * var(--k)) 0.03 45)
    );
    mask: radial-gradient(closest-side, transparent 92%, #000 92.8%);
  }
  /* the slope down to the wheel: rings stepping in and down, the far wall
     lit on the right where it faces the light, deeper ones in the bowl's shade */
  .slope {
    --r: 80.6;
    background: linear-gradient(90deg, oklch(calc(27% - 7% * var(--k)) 0.04 48), oklch(calc(36% - 7% * var(--k)) 0.055 52));
    mask: radial-gradient(closest-side, transparent calc(var(--in) / 80.6 * 100%), #000 calc(var(--in) / 80.6 * 100% + 0.8%));
  }

  /* the rim: turned wood, the grain running round it; the ball track inside
     it, darker and polished; one light over both */
  .grain-a {
    stop-color: oklch(42% 0.08 50);
  }
  .grain-b {
    stop-color: oklch(36% 0.07 44);
  }
  .track {
    fill: oklch(27% 0.04 45);
  }
  .lit {
    stop-color: oklch(100% 0 0 / 0.2);
  }
  .lit-off {
    stop-color: oklch(100% 0 0 / 0);
  }
  .lit-dark {
    stop-color: oklch(0% 0 0 / 0.3);
  }
  .sheen {
    fill: none;
    stroke: oklch(100% 0 0 / 0.13);
    stroke-width: 5;
    stroke-linecap: round;
  }
  .lip {
    fill: none;
    stroke: oklch(62% 0.08 70 / 0.7);
    stroke-width: 0.8;
  }
  /* where the track drops off down the slope */
  .brink {
    fill: none;
    stroke: oklch(18% 0.03 45);
    stroke-width: 0.8;
  }
  .diamond {
    fill: oklch(84% 0.09 88);
    stroke: oklch(52% 0.08 78);
    stroke-width: 0.4;
  }

  /* the wheel and its turret turn together, on their own layers, so turning
     never repaints them */
  .spin {
    transform-style: preserve-3d;
    will-change: rotate;
  }
  .wood {
    fill: oklch(38% 0.07 48);
  }
  .red {
    fill: oklch(47% 0.18 25);
  }
  .black {
    fill: oklch(21% 0.01 60);
  }
  .green {
    fill: oklch(48% 0.13 155);
  }
  /* each pocket's floor, a shade under its number */
  .well.red {
    fill: oklch(37% 0.15 25);
  }
  .well.black {
    fill: oklch(15% 0.01 60);
  }
  .well.green {
    fill: oklch(37% 0.11 155);
  }
  .fret {
    stroke: oklch(86% 0.01 250);
    stroke-width: 1.1;
  }
  .ring {
    fill: none;
    stroke: oklch(80% 0.012 250);
    stroke-width: 0.9;
  }
  .digit {
    fill: oklch(97% 0.005 80);
    font: bold 6.4px var(--font);
    text-anchor: middle;
    dominant-baseline: central;
  }
  .cone-foot {
    fill: oklch(40% 0.075 52);
  }
  /* the light on the wheel, and the shadow the bowl's wall keeps round its edge */
  .rotor-light {
    --r: 70;
    background:
      radial-gradient(circle at 34% 26%, oklch(100% 0 0 / 0.16), transparent 46%),
      radial-gradient(closest-side, transparent 84%, oklch(0% 0 0 / 0.38));
  }
  /* the cone: turned wood, stacked up in rings, lit from the upper left */
  .cone {
    background: radial-gradient(circle at 34% 28%, oklch(58% 0.085 62), oklch(44% 0.08 54) 62%, oklch(36% 0.07 50));
    box-shadow: 0 0 0 0.3px oklch(26% 0.05 45 / 0.5);
  }
  /* the chrome turret the croupier spins it by, standing up off the cone */
  .chrome-a {
    stop-color: oklch(96% 0.005 250);
  }
  .chrome-b {
    stop-color: oklch(74% 0.01 250);
  }
  .chrome-c {
    stop-color: oklch(52% 0.012 250);
  }
  .turret.foot g {
    fill: oklch(36% 0.01 250);
  }
  .turret.cap g {
    stroke: oklch(48% 0.01 250);
    stroke-width: 0.5;
  }

  /* the ball: ivory, lit from the same light, turned to face you */
  .ball {
    inset: auto;
    left: calc(50% - 3px);
    top: calc(50% - 3px);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, oklch(100% 0 0), oklch(93% 0.01 85) 45%, oklch(70% 0.015 80));
  }
  .shade {
    inset: auto;
    left: calc(50% - 3px);
    top: calc(50% - 2px);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: oklch(5% 0.02 50 / calc(0.55 - var(--z) * 0.015));
    filter: blur(1px);
    scale: calc(1 + var(--z) * 0.03);
  }

  /* the number it landed on, in its pocket's color */
  .said {
    position: absolute;
    right: 0;
    top: 2px;
    pointer-events: none;
  }
  .landed {
    display: block;
    font: normal 30px/1 var(--font-serif);
    animation: said 360ms var(--ease-out-expo);
  }
  .landed.red {
    color: var(--accent);
  }
  .landed.green {
    color: var(--good);
  }
  @keyframes said {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .landed {
      animation: none;
    }
  }
</style>

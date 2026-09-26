<script lang="ts">
  // a bill counter on the home page, the kind a cage keeps under the counter,
  // built in 3D: a hopper sloping down the top, the screen and keys below it,
  // and a pocket in front where the counted bills land. a pile of loose cash
  // sits beside it that never runs out: pull the bundle off it and drag it into
  // the hopper (or tap the pile to toss it in), never the same size or the same
  // bills twice. the machine counts them through, snapping each one down into
  // the pocket while the screen ticks up. tap the counted stack and ten bills
  // are banded into a brick for the stack on the right; tap the bricks to break
  // one open and count it again. none of it is real and none of it is kept.
  import { play } from "$lib/sound";
  import { reducedMotion } from "$lib/motion";
  import { money } from "$lib/util";
  import { expoOut } from "svelte/easing";

  /** ms a bill, about what a real one does */
  const PER = 55;
  const MAX = 100;
  /** bills to a band */
  const BAND = 10;
  /** bricks drawn on the stack; past that the count carries on */
  const SHOW = 12;
  // the notes a bundle can be, the common ones more often
  const NOTES = [1, 5, 10, 20, 20, 20, 50, 100, 100];
  // each note's tint, faint, like the real ones
  const HUE: Record<number, number> = { 1: 140, 5: 300, 10: 55, 20: 75, 50: 350, 100: 150 };

  // ---- the shape of it, in px; x across, z toward you, h up off the table ----
  type Pt = [z: number, h: number];
  /** half its width, and half the pocket's */
  const X = 60;
  const IN = 40;
  const FRONT = 22;
  /** the pocket: its back wall, its floor, the lip over it */
  const BACK = -8;
  const FLOOR = 4;
  const LIP = 34;
  // the side, back to front: up the back, down the hopper, down the panel, down the front
  const BOTTOM: Pt = [-38, 0];
  const TOP: Pt = [-38, 70];
  const FEED: Pt = [-8, 52];
  const NOSE: Pt = [FRONT, 42];
  /** a bill, lying down */
  const BW = 64;
  const BD = 27;
  /** px a bill adds to a stack, and a banded brick's height */
  const SHEET = 0.28;
  const BRICK = 3.2;
  // the patches of table the pile and the bricks sit on
  const PILE = { x0: -150, x1: -66, z0: -6, z1: 46 };
  const TOWER = { x0: 72, x1: 140, z0: -30, z1: 10 };

  const deg = (r: number) => (r * 180) / Math.PI;
  /** a flat face from one point of the side to another, across x0 to x1 */
  function face(p: Pt, q: Pt, x0 = -X, x1 = X) {
    const w = x1 - x0;
    const dz = q[0] - p[0];
    const dy = p[1] - q[1];
    const len = Math.hypot(dz, dy);
    return `width:${w}px;height:${len}px;margin:${-len / 2}px 0 0 ${-w / 2}px;transform:translate3d(${(x0 + x1) / 2}px,${-(p[1] + q[1]) / 2}px,${(p[0] + q[0]) / 2}px) rotateX(${deg(Math.atan2(dz, dy))}deg)`;
  }
  /** a patch of the table, x0 to x1 across, z0 (back) to z1 (front) */
  const ground = (g: { x0: number; x1: number; z0: number; z1: number }) => face([g.z0, 0], [g.z1, 0], g.x0, g.x1);
  /** an outline standing in the plane x, facing right */
  function wall(x: number, pts: Pt[]) {
    const zs = pts.map((p) => p[0]);
    const hs = pts.map((p) => p[1]);
    const z0 = Math.min(...zs);
    const z1 = Math.max(...zs);
    const h0 = Math.min(...hs);
    const h1 = Math.max(...hs);
    const w = z1 - z0;
    const h = h1 - h0;
    const poly = pts.map(([z, y]) => `${z1 - z}px ${h1 - y}px`).join(",");
    return `width:${w}px;height:${h}px;margin:${-h / 2}px 0 0 ${-w / 2}px;transform:translate3d(${x}px,${-(h0 + h1) / 2}px,${(z0 + z1) / 2}px) rotateY(90deg);clip-path:polygon(${poly})`;
  }

  // where a brick sits on the table, and the way back to the pocket and the hopper
  const brickX = TOWER.x0 + 2 + BW / 2;
  const brickZ = (TOWER.z0 + TOWER.z1) / 2;
  const fromPocket = { x: -brickX, z: (BACK + FRONT) / 2 - brickZ, h: FLOOR + 3 };
  const toHopper = { x: -brickX, z: (TOP[0] + FEED[0]) / 2 + 4 - brickZ, h: (TOP[1] + FEED[1]) / 2 + 6 };

  type Bundle = { id: number; v: number; n: number };
  let tray = $state<number[]>([]);
  let stacked = $state<number[]>([]);
  let total = $state(0);
  let running = $state(false);
  /** bumps once a bill, so the one falling into the pocket restarts */
  let flick = $state(0);
  /** bumps each drop, so the hopper settles again */
  let drops = $state(0);
  /** a short stack going back up to the hopper */
  let lifting = $state(false);
  let banding = $state(false);
  let bricks = $state<{ id: number; bills: number[] }[]>([]);
  let id = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  let auto: ReturnType<typeof setTimeout> | undefined;

  const later = (fn: () => void, ms: number) => setTimeout(fn, reducedMotion() ? 0 : ms);
  /** a stack's height, taller the more bills are in it */
  const thick = (n: number) => Math.max(1, Math.min(n, MAX) * SHEET);
  const sum = (bills: number[]) => bills.reduce((a, b) => a + b, 0);
  const bundle = (): Bundle => ({ id: ++id, v: NOTES[Math.floor(Math.random() * NOTES.length)], n: 8 + Math.floor(Math.random() * 17) });
  const worth = $derived(bricks.reduce((a, b) => a + sum(b.bills), 0));

  // ---- counting ----
  function start() {
    clearTimeout(auto);
    if (running || lifting || banding || !tray.length) return;
    if (stacked.length >= MAX) return play("off");
    running = true;
    play("motor", { n: Math.min(tray.length, MAX - stacked.length) });
    timer = setInterval(step, reducedMotion() ? 10 : PER);
  }
  function step() {
    if (!tray.length || stacked.length >= MAX) {
      clearInterval(timer);
      running = false;
      play("beep");
      return;
    }
    const v = tray.shift()!;
    stacked.push(v);
    total += v;
    flick++;
    play("count");
  }
  // it starts by itself when bills go in the hopper, like one set to AUTO
  const soon = () => {
    clearTimeout(auto);
    auto = later(start, 450);
  };

  // ---- the pile beside it ----
  // loose bills, as they fell. it's only ever drawn; bundles come off the top
  const LOOSE = [
    { v: 20, x: 4, y: 20, r: -14 },
    { v: 5, x: 18, y: 4, r: 18 },
    { v: 100, x: 2, y: 4, r: 6 },
    { v: 50, x: 20, y: 22, r: -6 },
    { v: 10, x: 8, y: 12, r: -24 },
    { v: 1, x: 16, y: 13, r: 10 },
  ];
  /** the bundle sitting on the pile, the one you'll pick up */
  let next = $state<Bundle>(bundle());
  /** the bundle in hand */
  let cash = $state<Bundle | null>(null);
  /** where the hand picked it up, in the desk */
  let at = $state({ x: 0, y: 0 });
  /** how far it's moved since */
  let drag = $state<{ x: number; y: number } | null>(null);
  /** on its way into the hopper, or back onto the pile */
  let flying = $state(false);
  let home = $state(false);
  let over = $state(false);
  let from: { x: number; y: number; moved: boolean } | null = null;
  let deskEl: HTMLElement;
  let pileEl: HTMLElement;
  let topEl = $state<HTMLElement>();
  let hopperEl: HTMLElement;
  let panelEl: HTMLElement;
  let sideEl: HTMLElement;

  const room = $derived(MAX - tray.length);

  // anywhere over the machine counts: close enough is a drop
  function overMachine(x: number, y: number) {
    const rs = [hopperEl, panelEl, sideEl].map((e) => e.getBoundingClientRect());
    const l = Math.min(...rs.map((r) => r.left));
    const r = Math.max(...rs.map((r) => r.right));
    const t = Math.min(...rs.map((r) => r.top));
    const b = Math.max(...rs.map((r) => r.bottom));
    return x > l - 10 && x < r + 10 && y > t - 30 && y < b;
  }
  /** the middle of an element, in the desk */
  function mid(e: HTMLElement) {
    const d = deskEl.getBoundingClientRect();
    const r = e.getBoundingClientRect();
    return { x: r.left + r.width / 2 - d.left, y: r.top + r.height / 2 - d.top };
  }

  function pick() {
    at = mid(topEl ?? pileEl);
    cash = next;
    home = false;
  }

  function grab(e: PointerEvent) {
    if (e.button !== 0 || cash) return;
    from = { x: e.clientX, y: e.clientY, moved: false };
    pileEl.setPointerCapture(e.pointerId);
    pick();
    play("card", { x: e.clientX });
  }
  function hold(e: PointerEvent) {
    if (!from) return;
    const x = e.clientX - from.x;
    const y = e.clientY - from.y;
    if (!from.moved && Math.hypot(x, y) < 6) return;
    from.moved = true;
    drag = { x, y };
    const now = overMachine(e.clientX, e.clientY);
    if (now && !over) play("tick", { n: 2 });
    over = now;
  }
  function letGo() {
    if (!from) return;
    const tapped = !from.moved;
    from = null;
    if (tapped || over) return drop(tapped);
    // not over the machine: it goes back on the pile
    flying = true;
    home = true;
    drag = { x: 0, y: 0 };
    later(() => {
      cash = null;
      drag = null;
      flying = false;
      home = false;
    }, 260);
  }

  /** the bundle into the hopper */
  function drop(toss: boolean) {
    over = false;
    if (!cash) pick();
    if (room < 1) {
      drag = null;
      cash = null;
      return play("off");
    }
    const n = Math.min(cash!.n, room);
    const v = cash!.v;
    const land = () => {
      tray.push(...Array(n).fill(v));
      drops++;
      play("riffle");
      next = bundle();
      cash = null;
      drag = null;
      flying = false;
      soon();
    };
    if (!toss) return land();
    // a tap tosses it over, from the top of the pile
    const t = mid(hopperEl);
    flying = true;
    requestAnimationFrame(() => {
      drag = { x: t.x - at.x, y: t.y - at.y };
    });
    later(land, 280);
  }

  function key(e: KeyboardEvent) {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    if (!cash) drop(true);
  }

  // ---- the pocket and the bricks ----
  /** ten bills banded into a brick, or a short stack back in the hopper */
  function take() {
    if (stacked.length >= BAND) band();
    else rerun();
  }

  function band() {
    if (running || lifting || banding) return;
    banding = true;
    play("strap");
    later(() => {
      bricks.push({ id: ++id, bills: stacked.splice(0, BAND) });
      banding = false;
      if (bricks.length % 5 === 0) later(() => play("register"), 380);
    }, 300);
  }

  /** the top brick, broken open and fed back through */
  function unband() {
    if (!bricks.length || banding || lifting) return;
    if (room < BAND) return play("off");
    const b = bricks.pop()!;
    later(() => {
      tray.push(...b.bills);
      drops++;
      play("riffle");
      soon();
    }, 260);
    play("card");
  }

  /** a short stack, lifted out and set back in the hopper to go again */
  function rerun() {
    if (running || lifting || banding || !stacked.length) return;
    lifting = true;
    play("square");
    later(() => {
      tray.push(...stacked.splice(0).slice(0, room));
      drops++;
      lifting = false;
      soon();
    }, 320);
  }

  /** a brick lifted off the stack and arced back over into the hopper */
  function back(_: Element, { bottom }: { bottom: number }) {
    return {
      duration: reducedMotion() ? 0 : 280,
      easing: expoOut,
      css: (t: number, u: number) =>
        `translate: ${toHopper.x * u}px ${toHopper.z * u}px ${(toHopper.h - bottom) * u + Math.sin(u * Math.PI) * 24}px; scale: ${0.5 + t * 0.5}`,
    };
  }

  $effect(() => () => {
    clearTimeout(auto);
    clearInterval(timer);
  });
</script>

{#snippet bill(v: number)}
  <span class="bill" style:--hue={HUE[v] ?? 150} aria-hidden="true">
    <i class="n tl">{v}</i>
    <i class="portrait"></i>
    {#if v >= 100}<i class="ribbon"></i>{:else if v > 1}<i class="thread"></i>{/if}
    <i class="n br">{v}</i>
  </span>
{/snippet}

<!-- a solid block lying on whatever it's in: a top, and four sides down to it -->
{#snippet slab(cls: string, h: number, v = 0, w = BW, d = BD)}
  <span class="slab {cls}" style:width="{w}px" style:height="{d}px" style:--h="{h}px" style:--hue={HUE[v] ?? 150}>
    <i class="f bk"></i>
    <i class="f lf"></i>
    <i class="f rt"></i>
    <i class="f fr"></i>
    <i class="f top">{#if v}{@render bill(v)}{/if}</i>
  </span>
{/snippet}

<div class="toy">
  <div class="desk" data-sound="none" bind:this={deskEl}>
    <div class="scene">
      <div class="rig">
        <!-- the pile beside the machine: pull the bundle off it and drag it into the hopper -->
        <button
          type="button"
          class="group pile"
          class:pulling={!!cash}
          bind:this={pileEl}
          aria-label="A pile of cash, put a bundle in the counter"
          onpointerdown={grab}
          onpointermove={hold}
          onpointerup={letGo}
          onpointercancel={letGo}
          onkeydown={key}
          oncontextmenu={(e) => e.preventDefault()}
        >
          <span class="plane table" style={ground(PILE)}>
            <span class="shade"></span>
            {#each LOOSE as b, k (k)}
              <span class="loose" style:left="{b.x}px" style:top="{b.y}px" style:rotate="{b.r}deg" style:transform="translateZ({k * 0.4}px)">
                {@render bill(b.v)}
              </span>
            {/each}
            {#if !cash}
              <span class="bundle" style:transform="translateZ({LOOSE.length * 0.4}px)" bind:this={topEl}>
                {@render slab("bills banded", thick(next.n), next.v)}
              </span>
            {/if}
          </span>
        </button>

        <div class="group machine">
          <span class="plane table" style={face([-50, 0], [34, 0], -X - 10, X + 10)}><span class="shade"></span></span>

          <!-- the body: its side, the front around the pocket, the lip over it -->
          <span class="face side" style={wall(X, [BOTTOM, TOP, FEED, NOSE, [FRONT, 0]])} bind:this={sideEl}></span>
          <span class="face front" style={face(NOSE, [FRONT, LIP])}><i class="led" class:on={running}></i></span>
          <span class="face front" style={face([FRONT, LIP], [FRONT, 0], -X, -IN)}></span>
          <span class="face front" style={face([FRONT, LIP], [FRONT, 0], IN, X)}></span>
          <span class="face foot" style={face([FRONT, FLOOR], [FRONT, 0], -IN, IN)}></span>

          <!-- the hopper on top, sloping down to the feed, with the bills waiting in it -->
          <span class="plane hopper" class:over class:running style={face(TOP, FEED)} bind:this={hopperEl}>
            <span class="guide" style:left="{(2 * X - BW) / 2 - 7}px">{@render slab("plastic", 10, 0, 4, 30)}</span>
            <span class="guide" style:left="{(2 * X + BW) / 2 + 3}px">{@render slab("plastic", 10, 0, 4, 30)}</span>
            {#if tray.length}
              {#key drops}
                <span class="load settle" style:left="{(2 * X - BW) / 2}px">{@render slab("bills", thick(tray.length), tray[tray.length - 1])}</span>
              {/key}
            {/if}
          </span>

          <!-- the panel: the screen and the keys -->
          <span class="face panel" class:running style={face(FEED, NOSE)} bind:this={panelEl}>
            <span class="lcd" aria-hidden="true">
              <span class="line"><i>ADD</i><i>AUTO</i></span>
              <span class="pcs">{stacked.length}<small>PCS</small></span>
              <span class="line"><i>TOTAL</i><i class="sum">{money(total)}</i></span>
            </span>
            <span class="keys" aria-hidden="true">
              {#each { length: 12 } as _, i (i)}<i></i>{/each}
            </span>
            <button type="button" class="start" onclick={start} aria-label="Start counting">START</button>
          </span>
        </div>

        <!-- the pocket in front, where the counted bills land -->
        <button
          type="button"
          class="group pocket"
          class:lifting
          class:banding
          onclick={take}
          aria-label={stacked.length >= BAND
            ? `Band ${BAND} bills, ${money(sum(stacked.slice(0, BAND)))}`
            : stacked.length
              ? `Put the ${stacked.length} counted bills back in the hopper`
              : "The pocket, empty"}
        >
          <span class="face dark back" style={face([BACK, LIP], [BACK, FLOOR], -IN, IN)}></span>
          <span class="face dark inner" style={wall(-IN, [[BACK, FLOOR], [BACK, LIP], [FRONT, LIP], [FRONT, FLOOR]])}></span>
          <span class="plane floor" style={face([BACK, FLOOR], [FRONT, FLOOR], -IN, IN)}>
            {#if stacked.length}
              <span class="load" style:left="{IN - BW / 2}px">{@render slab("bills", thick(stacked.length), stacked[stacked.length - 1])}</span>
            {/if}
            {#if running && stacked.length}
              {#key flick}
                <span class="falling" style:left="{IN - BW / 2}px" style:--t="{thick(stacked.length) + 0.3}px">{@render bill(stacked[stacked.length - 1])}</span>
              {/key}
            {/if}
          </span>
        </button>

        <!-- the bricks, stacked up beside the machine -->
        <button
          type="button"
          class="group tower"
          onclick={unband}
          aria-label={bricks.length ? `${money(worth)} banded, break one open to count it again` : "No bricks yet"}
        >
          <span class="plane table" style={ground(TOWER)}>
            {#if bricks.length}<span class="shade"></span>{/if}
            {#each bricks.slice(0, SHOW) as b, k (b.id)}
              {@const bottom = k * BRICK}
              <span
                class="brick"
                style:left="{2 + ((b.id * 7) % 5) - 2}px"
                style:top="{(TOWER.z1 - TOWER.z0 - BD) / 2 + ((b.id * 3) % 3) - 1}px"
                style:--z="{bottom}px"
                style:--fx="{fromPocket.x}px"
                style:--fy="{fromPocket.z}px"
                style:--fz="{fromPocket.h - bottom}px"
                out:back={{ bottom }}
              >
                {@render slab("bills banded strap", BRICK, b.bills[0])}
              </span>
            {/each}
            {#if bricks.length}
              <span class="worth num" style:--z="{Math.min(bricks.length, SHOW) * BRICK + 3}px">{money(worth)}</span>
            {/if}
          </span>
        </button>
      </div>
    </div>

    <!-- the bundle in hand, drawn in the same light as the table -->
    {#if cash}
      <span
        class="cash"
        class:held={!!drag && !flying}
        class:flying
        class:home
        style:left="{at.x}px"
        style:top="{at.y}px"
        style:translate={drag ? `${drag.x}px ${drag.y}px` : null}
        aria-hidden="true"
      >
        <span class="hand">{@render slab("bills banded", thick(cash.n), cash.v)}</span>
      </span>
    {/if}
  </div>
  <p class="hint">
    {stacked.length >= BAND && !running ? "Tap the stack to band ten." : "Drag cash from the pile into the hopper."}
  </p>
  <p class="sr-only" aria-live="polite">{running ? "" : `${stacked.length} bills counted, ${money(total)} in all`}</p>
</div>

<style>
  /* the machine keeps its own colors, like the cards and dice: it's a thing on the table */
  .desk {
    --body: oklch(30% 0.006 260);
    --body-hi: oklch(36% 0.006 260);
    --plastic: oklch(78% 0.006 260);
    --plastic-hi: oklch(86% 0.005 260);
    --edge: oklch(20% 0.004 260);
    --strap: oklch(80% 0.12 85);
    position: relative;
    width: 290px;
    height: 124px;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
  }
  .scene {
    position: absolute;
    inset: 0;
    perspective: 700px;
    perspective-origin: 150px 10px;
  }
  /* seen from a little above and off to the right, like it's on the counter in front of you */
  .rig {
    position: absolute;
    left: 146px;
    top: 100px;
    transform-style: preserve-3d;
    transform: rotateX(-24deg) rotateY(-20deg);
  }
  .rig * {
    transform-style: preserve-3d;
  }
  .group,
  .face,
  .plane {
    position: absolute;
    left: 0;
    top: 0;
    display: block;
  }
  .face,
  .plane {
    box-sizing: border-box;
    backface-visibility: hidden;
  }
  button {
    all: unset;
    cursor: pointer;
  }
  .group {
    width: 0;
    height: 0;
    transform-style: preserve-3d;
  }

  /* ---- a bill: a tint for the note, a frame, the portrait, the thread ---- */
  .bill {
    position: absolute;
    inset: 0;
    display: block;
    box-sizing: border-box;
    border: var(--hair) solid oklch(56% 0.04 150);
    border-radius: 1.5px;
    background: linear-gradient(170deg, oklch(90% 0.04 var(--hue)), oklch(82% 0.045 150));
    transform-style: flat;
  }
  .bill::before {
    content: "";
    position: absolute;
    inset: 2px;
    border: var(--hair) solid oklch(56% 0.04 150 / 0.5);
    border-radius: 1px;
  }
  .bill i {
    position: absolute;
    font-style: normal;
  }
  .bill .n {
    font: bold 7px/1 var(--font-serif);
    color: oklch(38% 0.05 150);
  }
  .tl {
    left: 4px;
    top: 3px;
  }
  .br {
    right: 4px;
    bottom: 3px;
  }
  .portrait {
    left: calc(38% - 6px);
    top: calc(50% - 7px);
    width: 12px;
    height: 14px;
    border-radius: 50%;
    border: var(--hair) solid oklch(56% 0.04 150 / 0.6);
    background:
      radial-gradient(ellipse 30% 26% at 50% 38%, oklch(58% 0.03 140), transparent),
      radial-gradient(ellipse 48% 30% at 50% 100%, oklch(62% 0.03 140), transparent),
      oklch(92% 0.025 95);
  }
  .thread {
    left: 58%;
    top: 0;
    bottom: 0;
    width: 1px;
    background: oklch(45% 0.05 var(--hue) / 0.5);
  }
  .ribbon {
    left: 56%;
    top: 0;
    bottom: 0;
    width: 3px;
    background: oklch(62% 0.1 262 / 0.7);
  }

  /* ---- a box: the top, and four sides hinged down from its edges ---- */
  .slab {
    position: absolute;
    display: block;
  }
  .slab .f {
    position: absolute;
    display: block;
    box-sizing: border-box;
    backface-visibility: hidden;
  }
  .slab .top {
    inset: 0;
    transform: translateZ(var(--h));
  }
  .slab .fr {
    left: 0;
    bottom: 0;
    width: 100%;
    height: var(--h);
    transform-origin: 50% 100%;
    transform: rotateX(-90deg);
  }
  .slab .bk {
    left: 0;
    top: 0;
    width: 100%;
    height: var(--h);
    transform-origin: 50% 0;
    transform: rotateX(90deg);
  }
  .slab .rt {
    right: 0;
    top: 0;
    width: var(--h);
    height: 100%;
    transform-origin: 100% 50%;
    transform: rotateY(90deg);
  }
  .slab .lf {
    left: 0;
    top: 0;
    width: var(--h);
    height: 100%;
    transform-origin: 0 50%;
    transform: rotateY(-90deg);
  }
  /* a stack of bills: the edges of every one, paler on the long side facing the light */
  .bills .fr,
  .bills .bk {
    background: repeating-linear-gradient(0deg, oklch(86% 0.03 110) 0 1px, oklch(74% 0.04 var(--hue)) 1px 1.6px);
  }
  .bills .rt,
  .bills .lf {
    background: repeating-linear-gradient(90deg, oklch(76% 0.03 110) 0 1px, oklch(64% 0.04 var(--hue)) 1px 1.6px);
  }
  /* a band round the middle: paper on a brick, rubber on a bundle */
  .banded .top::after,
  .banded .fr::after,
  .banded .bk::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(28% - 1px);
    width: 2px;
    background: oklch(52% 0.09 55);
  }
  .strap .top::after,
  .strap .fr::after,
  .strap .bk::after {
    left: calc(50% - 6px);
    width: 12px;
    background: var(--strap);
  }
  .plastic .f {
    background: var(--plastic);
    border: var(--hair) solid oklch(55% 0.006 260);
  }
  .plastic .top {
    background: var(--plastic-hi);
  }

  /* ---- the table under things: just a soft shadow ---- */
  .table .shade {
    position: absolute;
    inset: 0;
    background: radial-gradient(closest-side, oklch(0% 0 0 / 0.16), transparent);
    transform-style: flat;
  }

  /* ---- the body ---- */
  .side {
    background: linear-gradient(180deg, var(--body-hi), var(--body) 60%, oklch(24% 0.006 260));
  }
  .front {
    background: linear-gradient(180deg, var(--body-hi), var(--body));
    border: var(--hair) solid var(--edge);
  }
  .foot {
    background: oklch(24% 0.006 260);
  }
  .led {
    position: absolute;
    right: 10px;
    top: calc(50% - 1.5px);
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: oklch(40% 0.03 150);
    transition: background-color 120ms var(--ease-out);
  }
  .led.on {
    background: oklch(78% 0.18 150);
  }
  .hopper {
    background:
      linear-gradient(0deg, var(--edge) 0 3px, transparent 3px),
      linear-gradient(180deg, var(--plastic), var(--plastic-hi));
    border: var(--hair) solid oklch(55% 0.006 260);
    transition: background-color 160ms var(--ease-out);
  }
  .hopper.over {
    background:
      linear-gradient(0deg, var(--edge) 0 3px, transparent 3px),
      linear-gradient(180deg, var(--plastic-hi), oklch(92% 0.005 260));
  }
  .hopper .guide,
  .hopper .load {
    position: absolute;
    bottom: 4px;
    width: 0;
    height: 0;
  }
  .hopper .guide .slab {
    bottom: 0;
  }
  .load .slab {
    left: 0;
    bottom: 0;
  }
  .hopper .load {
    width: 64px;
    height: 27px;
  }
  /* the stack drops in and settles; the bills shiver while the rollers pull at them */
  .settle {
    animation: settle 300ms var(--ease-out-expo);
  }
  @keyframes settle {
    from {
      translate: 0 0 12px;
    }
  }
  .hopper.running .load .slab {
    animation: shiver 55ms linear infinite alternate;
  }
  @keyframes shiver {
    to {
      translate: 0 0.6px 0;
    }
  }
  .hopper.over .load .slab {
    translate: 0 0 2px;
  }

  /* ---- the panel ---- */
  .panel {
    display: flex;
    gap: 5px;
    padding: 3px 5px;
    background: linear-gradient(180deg, var(--plastic-hi), var(--plastic));
    border: var(--hair) solid oklch(55% 0.006 260);
    transform-style: flat;
  }
  .panel * {
    transform-style: flat;
  }
  .lcd {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.5px 4px;
    border-radius: 2px;
    background: oklch(88% 0.035 235);
    border: var(--hair) solid oklch(36% 0.01 260);
    color: oklch(42% 0.13 268);
    font-family: var(--font-mono);
    transition: background-color 200ms var(--ease-out);
  }
  .lcd .line {
    display: flex;
    justify-content: space-between;
    font-size: 5.5px;
    line-height: 1;
  }
  .lcd i {
    font-style: normal;
  }
  .lcd .pcs {
    align-self: flex-end;
    font-size: 10px;
    line-height: 1;
    font-style: italic;
    font-variant-numeric: tabular-nums;
  }
  .lcd small {
    font-size: 5px;
    margin-left: 1px;
    font-style: normal;
  }
  .lcd .sum {
    font-size: 6px;
  }
  /* the backlight comes up a touch while it runs */
  .running .lcd {
    background: oklch(93% 0.045 235);
  }
  .keys {
    display: grid;
    grid-template-columns: repeat(3, 6px);
    grid-auto-rows: 4px;
    gap: 2px;
    align-content: center;
  }
  .keys i {
    border: var(--hair) solid oklch(40% 0.006 260);
    border-radius: 1px;
    background: oklch(90% 0.004 260);
  }
  .start {
    align-self: center;
    display: grid;
    place-items: center;
    width: 20px;
    height: 12px;
    border-radius: 2px;
    background: oklch(88% 0.03 80);
    border: var(--hair) solid oklch(58% 0.03 80);
    box-shadow: 0 1px 0 oklch(58% 0.03 80);
    font: bold 4px/1 var(--font);
    color: oklch(46% 0.03 80);
    letter-spacing: 0.05em;
    transition:
      translate var(--dur-press) var(--ease-out),
      box-shadow var(--dur-press) var(--ease-out),
      background-color var(--dur-hover) var(--ease-out);
  }
  .start:hover {
    background: oklch(91% 0.035 80);
  }
  .start:active {
    translate: 0 1px;
    box-shadow: 0 0 0 oklch(58% 0.03 80);
  }
  .start:focus-visible {
    outline: 1px solid var(--focus);
  }

  /* ---- the pocket ---- */
  .dark {
    background: oklch(17% 0.004 260);
  }
  /* the slot the bills come out of, and the rollers in it */
  .back {
    background:
      repeating-linear-gradient(90deg, transparent 0 10px, oklch(30% 0.004 260) 10px 16px) 0 5px / 100% 4px no-repeat,
      linear-gradient(180deg, transparent 5px, oklch(8% 0 0) 5px 9px, transparent 9px),
      oklch(20% 0.004 260);
  }
  .inner {
    background: linear-gradient(0deg, oklch(20% 0.004 260), oklch(15% 0.004 260));
  }
  .floor {
    background: linear-gradient(180deg, oklch(18% 0.004 260), oklch(26% 0.005 260));
  }
  .floor .load {
    position: absolute;
    top: 1.5px;
    width: 64px;
    height: 27px;
    transition: translate 320ms var(--ease-out-expo);
  }
  .floor .load .slab {
    top: 0;
  }
  .pocket:hover .load {
    translate: 0 0 1.5px;
  }
  .pocket:focus-visible .floor {
    outline: 1px solid var(--focus);
  }
  .lifting .load {
    translate: 0 -14px 44px;
  }
  /* each bill snaps down out of the slot onto the top of the stack */
  .falling {
    position: absolute;
    top: 1.5px;
    width: 64px;
    height: 27px;
    transform-origin: 50% 0;
    transform: translateZ(var(--t));
    animation: snap 110ms var(--ease-out) both;
  }
  @keyframes snap {
    from {
      transform: translate3d(0, -18px, 24px) rotateX(-24deg);
    }
  }
  /* banding: a paper strap snaps round the middle of the stack */
  .banding .load .slab::after {
    content: "";
    position: absolute;
    left: calc(50% - 6px);
    top: -1px;
    bottom: -1px;
    width: 12px;
    background: var(--strap);
    transform: translateZ(calc(var(--h) + 0.4px));
    animation: wrap 200ms var(--ease-out-expo) backwards;
  }
  @keyframes wrap {
    from {
      scale: 1 0;
    }
  }

  /* ---- the pile, and the bundle in hand ---- */
  .pile {
    cursor: grab;
    touch-action: none;
  }
  .pulling {
    cursor: grabbing;
  }
  .loose,
  .bundle {
    position: absolute;
    width: 64px;
    height: 27px;
  }
  .loose .bill {
    transition: translate 160ms var(--ease-out);
  }
  .bundle {
    left: 12px;
    top: 12px;
    rotate: -5deg;
    animation: pop 260ms var(--ease-out-expo);
  }
  /* a new bundle drops onto the pile the moment the last one's gone */
  @keyframes pop {
    from {
      translate: 0 0 14px;
      scale: 0.9;
    }
  }
  /* pointed at, the bundle lifts like a hand's about to take it */
  .pile:hover .bundle .slab {
    translate: 0 0 2px;
  }
  .bundle .slab {
    transition: translate 160ms var(--ease-out);
  }
  .pile:focus-visible .table {
    outline: 1px solid var(--focus);
  }
  .cash {
    position: absolute;
    z-index: 6;
    width: 0;
    height: 0;
    pointer-events: none;
    perspective: 700px;
    scale: 1.12;
    transition:
      translate 260ms var(--ease-out-expo),
      scale 200ms var(--ease-out),
      opacity 200ms var(--ease-out);
  }
  .hand {
    position: absolute;
    left: -32px;
    top: -13.5px;
    width: 64px;
    height: 27px;
    transform-style: preserve-3d;
    transform: rotateX(-24deg) rotateY(-20deg) rotateX(90deg) rotate(-8deg) translateZ(10px);
    animation: lift 200ms var(--ease-out-expo);
  }
  .hand * {
    transform-style: preserve-3d;
  }
  /* off the top of the pile and into the hand */
  @keyframes lift {
    from {
      transform: rotateX(-24deg) rotateY(-20deg) rotateX(90deg) rotate(-5deg) translateZ(0);
    }
  }
  .cash.held {
    transition: scale 140ms var(--ease-out);
  }
  .cash.home {
    scale: 0.9;
    opacity: 0;
  }

  /* ---- the bricks ---- */
  .brick {
    position: absolute;
    width: 64px;
    height: 27px;
    transform: translateZ(calc(var(--z) + var(--lift, 0px)));
    transition: transform 160ms var(--ease-out);
    animation: land 520ms var(--ease-out-expo);
  }
  /* out of the pocket, up and over onto the stack */
  @keyframes land {
    from {
      translate: var(--fx) var(--fy) var(--fz);
    }
    40% {
      translate: calc(var(--fx) * 0.4) calc(var(--fy) * 0.4) calc(var(--fz) * 0.4 + 26px);
    }
  }
  .tower:hover .brick:nth-last-child(2) {
    --lift: 2px;
  }
  .tower:focus-visible .table {
    outline: 1px solid var(--focus);
  }
  .strap.bills .fr,
  .strap.bills .bk {
    background: repeating-linear-gradient(0deg, oklch(84% 0.04 var(--hue)) 0 0.8px, oklch(72% 0.05 148) 0.8px 1.6px);
  }
  /* what's banded, on a card stood up behind the stack */
  .worth {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 12px;
    display: grid;
    place-items: center;
    font-size: 9px;
    color: var(--muted);
    transform-origin: 50% 100%;
    transform: translateZ(var(--z)) rotateX(-90deg);
    transition: transform 300ms var(--ease-out-expo);
    transform-style: flat;
  }

  @media (prefers-reduced-motion: reduce) {
    .settle,
    .brick,
    .bundle,
    .hand,
    .falling,
    .banding .load .slab::after,
    .hopper.running .load .slab {
      animation: none;
    }
    .floor .load,
    .brick,
    .cash {
      transition: none;
    }
  }
</style>

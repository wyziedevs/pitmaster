<script lang="ts">
  // a desktop banknote counter on the home page, the kind a cage keeps on the
  // counter, built face by face in 3D: a heavy wedge of charcoal plastic up on
  // rubber feet, a hopper sloping back on top where the bills stand in a fan
  // between two guides, a red LED window and a few membrane keys on the panel
  // in front of it, and a stacker at the foot where the counted bills land
  // flat. a pile of loose cash sits beside it that never runs out: pull the
  // bundle off it and drag it into the hopper (or tap the pile to toss it in),
  // never the same size or the same notes twice. the rollers pull the bills
  // down one at a time from the back of the stack, the stacker wheels flick
  // each one out onto the pile in front, and the count and the total tick up.
  // tap the counted stack and ten bills are strapped into a brick for the stack
  // on the right; tap the bricks to break one open and count it again. the
  // notes are the house currency's. none of it is real and none of it is kept.
  import { play } from "$lib/sound";
  import { reducedMotion } from "$lib/motion";
  import { money, currencySymbol } from "$lib/util";
  import { prefs } from "$lib/settings.svelte";
  import { expoOut } from "svelte/easing";
  import { t, tp } from "$lib/i18n";

  /** ms a bill, about what a real one does */
  const PER = 55;
  const MAX = 100;
  /** bills to a strap */
  const BAND = 10;
  /** bricks drawn on the stack; past that the count carries on */
  const SHOW = 12;
  /** what the LED can show before it runs out of figures */
  const TOP_COUNT = 9999;

  // each currency's notes (the common ones more often) and a tint for each,
  // faint, the way the real ones lean one color
  type Notes = { pick: number[]; hue: Record<number, number> };
  const NOTES: Record<string, Notes> = {
    USD: { pick: [1, 5, 10, 20, 20, 20, 50, 100, 100], hue: { 1: 145, 5: 300, 10: 60, 20: 100, 50: 350, 100: 190 } },
    EUR: { pick: [5, 10, 10, 20, 20, 50, 50, 100, 200], hue: { 5: 230, 10: 25, 20: 255, 50: 60, 100: 150, 200: 90 } },
    GBP: { pick: [5, 10, 10, 20, 20, 20, 50], hue: { 5: 190, 10: 55, 20: 300, 50: 25 } },
    JPY: { pick: [1000, 1000, 1000, 5000, 10000, 10000], hue: { 1000: 250, 5000: 310, 10000: 70 } },
    CNY: { pick: [10, 20, 50, 100, 100, 100], hue: { 10: 250, 20: 55, 50: 150, 100: 25 } },
    AUD: { pick: [5, 10, 20, 20, 50, 50, 100], hue: { 5: 340, 10: 250, 20: 30, 50: 90, 100: 150 } },
  };
  const notes = $derived(NOTES[prefs().currency] ?? NOTES.USD);
  /** every note once, low to high */
  const kinds = $derived([...new Set(notes.pick)].sort((a, b) => a - b));
  const tint = (v: number) => notes.hue[v] ?? 150;

  // ---- the shape of it, in px; x across, z toward you, h up off the counter ----
  type Pt = [z: number, h: number];
  /** half its width, half the hopper's and half the stacker's mouth */
  const X = 58;
  const HW = 40;
  const IN = 38;
  /** the underside, up on its rubber feet */
  const FT = 3;
  // the side, back to front: up the back to the hopper's rim, down the shoulder
  // to the panel, down the panel to its nose, then the front straight down.
  // the hopper plate and the slope in front of it meet at a right angle in the
  // throat, so a stack of any size sits square in the V
  const BACK_Z = -48;
  const RIM: Pt = [BACK_Z, 56];
  const THROAT: Pt = [-38, 39];
  const VF: Pt = [-26, 45.5];
  const NOSE: Pt = [12, 34];
  const FRONT = 12;
  /** the stacker: its back wall, the tray the bills land on, the top of its mouth, the tray's front */
  const BACK = -16;
  const FLOOR = 6;
  const LIP = 27;
  const TRAY = 19;
  /** a bill, 2.37 to 1 */
  const BW = 64;
  const BD = 27;
  /** px a bill adds to a stack, and a strapped brick's height */
  const SHEET = 0.2;
  const BRICK = 2.6;
  /** down the hopper plate, rim to throat */
  const PLATE = Math.hypot(THROAT[0] - RIM[0], RIM[1] - THROAT[1]);
  // the patches of counter the pile, the machine and the bricks sit on
  const PILE = { x0: -150, x1: -66, z0: -6, z1: 46 };
  const BASE = { x0: -72, x1: 92, z0: -60, z1: 44 };
  const TOWER = { x0: 70, x1: 138, z0: -30, z1: 10 };
  /** the feet it stands on, the ones you can see: front left, front right, back right */
  const FEET = [
    [-X + 1, FRONT - 5],
    [X - 9, FRONT - 5],
    [X - 9, BACK_Z + 2],
  ];

  const deg = (r: number) => (r * 180) / Math.PI;
  /** a flat face from one point of the side to another, across x0 to x1; it faces up or toward you */
  function face(p: Pt, q: Pt, x0 = -X, x1 = X) {
    const w = x1 - x0;
    const dz = q[0] - p[0];
    const dy = p[1] - q[1];
    const len = Math.hypot(dz, dy);
    return `width:${w}px;height:${len}px;margin:${-len / 2}px 0 0 ${-w / 2}px;transform:translate3d(${(x0 + x1) / 2}px,${-(p[1] + q[1]) / 2}px,${(p[0] + q[0]) / 2}px) rotateX(${deg(Math.atan2(dz, dy))}deg)`;
  }
  /** a patch of the counter, x0 to x1 across, z0 (back) to z1 (front) */
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

  // where a brick sits on the counter, and the way back to the stacker and the hopper
  const brickX = TOWER.x0 + 2 + BW / 2;
  const brickZ = (TOWER.z0 + TOWER.z1) / 2;
  const fromPocket = { x: -brickX, z: BACK + 2 + BD / 2 - brickZ, h: FLOOR + 3 };
  const toHopper = { x: -brickX, z: THROAT[0] - 7 - brickZ, h: THROAT[1] + 12 };

  type Bundle = { id: number; v: number; n: number };
  /** bills in the hopper, the next one pulled first */
  let tray = $state<number[]>([]);
  /** bills in the stacker, the last one counted on top */
  let stacked = $state<number[]>([]);
  /** what the LED reads: bills and money counted since it was cleared */
  let count = $state(0);
  let total = $state(0);
  let running = $state(false);
  /** bills on their way through: pulled off the back of the hopper stack, and flicked into the stacker */
  let pulls = $state<{ id: number; v: number }[]>([]);
  let flights = $state<{ id: number; v: number; land: number }[]>([]);
  /** bumps each drop, so the hopper stack settles again */
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
  /** a steady scatter, 0 to 1, so a stack keeps its shape until it changes */
  const jit = (i: number) => {
    const s = Math.sin(i * 12.9898) * 43758.5453;
    return s - Math.floor(s);
  };
  const bundle = (): Bundle => ({ id: ++id, v: notes.pick[Math.floor(Math.random() * notes.pick.length)], n: 8 + Math.floor(Math.random() * 17) });
  const worth = $derived(bricks.reduce((a, b) => a + sum(b.bills), 0));
  /** what's landed in the stacker so far; the bills still in the air land on top of it */
  const landed = $derived(Math.max(0, stacked.length - flights.length));

  // the hopper stack fanned: the bills behind the front one stand a little
  // higher and a little askew, so their top edges show over it like a riffled
  // deck. the fan shifts each time one is pulled, like the real thing
  const fan = $derived.by(() => {
    const n = tray.length;
    const k = Math.min(n - 1, 5);
    const t = thick(n);
    return Array.from({ length: Math.max(0, k) }, (_, j) => ({
      j,
      v: tray[j],
      z: (t * (j + 0.4)) / (k + 1),
      up: 0.6 + (k - j) * 0.9 + jit(n * 7 + j) * 1.2,
      x: (jit(n * 3 + j * 5) - 0.5) * 2.6,
      r: (jit(n * 11 + j) - 0.5) * 3.2,
    }));
  });

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
    count = Math.min(count + 1, TOP_COUNT);
    total += v;
    play("count");
    if (reducedMotion()) return;
    const pull = { id: ++id, v };
    const flight = { id: pull.id, v, land: thick(stacked.length) };
    pulls.push(pull);
    flights.push(flight);
    setTimeout(() => (pulls = pulls.filter((p) => p.id !== pull.id)), 120);
    setTimeout(() => (flights = flights.filter((f) => f.id !== flight.id)), 170);
  }
  // it starts by itself when bills go in the hopper, like one set to AUTO
  const soon = () => {
    clearTimeout(auto);
    auto = later(start, 450);
  };

  // ---- the keys ----
  function startKey() {
    play("key");
    if (!running && !tray.length) return;
    start();
  }
  function clearKey() {
    play("key");
    count = 0;
    total = 0;
  }

  // ---- the pile beside it ----
  // loose bills, as they fell: which note (low to high), where, and how it's turned
  const LOOSE = [
    { k: 3, x: 4, y: 20, r: -14 },
    { k: 1, x: 18, y: 4, r: 18 },
    { k: 5, x: 2, y: 4, r: 6 },
    { k: 4, x: 20, y: 22, r: -6 },
    { k: 2, x: 8, y: 12, r: -24 },
    { k: 0, x: 16, y: 13, r: 10 },
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

  // ---- the stacker and the bricks ----
  /** ten bills strapped into a brick, or a short stack back in the hopper */
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

  // ---- the LED window ----
  // seven segments to a figure in a 6 by 10 cell, a to g; the dark ones stay
  // faintly there behind the red filter, like a real one
  const across = (y: number) => `0.9,${y} 1.55,${y - 0.65} 4.45,${y - 0.65} 5.1,${y} 4.45,${y + 0.65} 1.55,${y + 0.65}`;
  const down = (x: number, y0: number, y1: number) =>
    `${x},${y0} ${x + 0.65},${y0 + 0.65} ${x + 0.65},${y1 - 0.65} ${x},${y1} ${x - 0.65},${y1 - 0.65} ${x - 0.65},${y0 + 0.65}`;
  const SEGS = [across(0.65), down(5.35, 0.9, 4.8), down(5.35, 5.2, 9.1), across(9.35), down(0.65, 5.2, 9.1), down(0.65, 0.9, 4.8), across(5)];
  /** which segments each figure lights, a to g */
  const FIG: Record<string, string> = {
    "0": "1111110",
    "1": "0110000",
    "2": "1101101",
    "3": "1111001",
    "4": "0110011",
    "5": "1011011",
    "6": "1011111",
    "7": "1110000",
    "8": "1111111",
    "9": "1111011",
  };
  type Cell = { on: string; dp: boolean };
  /** a number right-aligned in at least n cells; a decimal point lights the point, a thousands comma is left out */
  function readout(s: string, n: number): Cell[] {
    const cells: Cell[] = [];
    for (const ch of s) {
      if (FIG[ch]) cells.push({ on: FIG[ch], dp: false });
      else if (ch === "." && cells.length) cells[cells.length - 1].dp = true;
    }
    while (cells.length < n) cells.unshift({ on: "0000000", dp: false });
    return cells;
  }
  const countCells = $derived(readout(String(count), 4));
  const totalCells = $derived(readout(money(total).replace(/[^\d.,]/g, ""), 8));
  /** the total's figures squeeze up when it outgrows eight */
  const pitch = $derived(Math.min(4.5, 36 / totalCells.length));

  $effect(() => () => {
    clearTimeout(auto);
    clearInterval(timer);
  });
</script>

{#snippet bill(v: number)}
  <span class="bill" style:--hue={tint(v)} class:long={String(v).length > 3} aria-hidden="true">
    <i class="frame"></i>
    <i class="portrait"></i>
    <i class="mark"></i>
    <i class="thread"></i>
    <i class="n tl">{v}</i>
    <i class="n br">{v}</i>
  </span>
{/snippet}

<!-- a solid block lying on whatever it's in: a top, and four sides down to it -->
{#snippet cube(cls: string, h: number, v = 0, w = BW, d = BD)}
  <span class="cube {cls}" style:width="{w}px" style:height="{d}px" style:--h="{h}px" style:--hue={v ? tint(v) : 0}>
    <i class="f bk"></i>
    <i class="f lf"></i>
    <i class="f rt"></i>
    <i class="f fr"></i>
    <i class="f top">{#if v}{@render bill(v)}{/if}</i>
  </span>
{/snippet}

<!-- figures on the LED: every segment faintly, then the lit ones glowing over them -->
{#snippet figures(cells: Cell[], x: number, y: number, s: number, p: number)}
  <g class="ghost">
    {#each cells as _, i (i)}
      <g transform="translate({x + i * p} {y}) scale({s}) skewX(-6)">
        {#each SEGS as d (d)}<polygon points={d} />{/each}
        <rect x="6.2" y="8.8" width="1.1" height="1.1" />
      </g>
    {/each}
  </g>
  <g class="lit">
    {#each cells as c, i (i)}
      <g transform="translate({x + i * p} {y}) scale({s}) skewX(-6)">
        {#each SEGS as d, k (d)}{#if c.on[k] === "1"}<polygon points={d} />{/if}{/each}
        {#if c.dp}<rect x="6.2" y="8.8" width="1.1" height="1.1" />{/if}
      </g>
    {/each}
  </g>
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
          aria-label={t("money.pileAriaLabel")}
          onpointerdown={grab}
          onpointermove={hold}
          onpointerup={letGo}
          onpointercancel={letGo}
          onkeydown={key}
          oncontextmenu={(e) => e.preventDefault()}
        >
          <span class="plane table" style={ground(PILE)}>
            {#each LOOSE as b, k (k)}
              <span class="loose" style:left="{b.x}px" style:top="{b.y}px" style:rotate="{b.r}deg" style:transform="translateZ({k * 0.3}px)">
                {@render bill(kinds[b.k % kinds.length])}
              </span>
            {/each}
            {#if !cash}
              <span class="bundle" style:transform="translateZ({LOOSE.length * 0.3}px)" bind:this={topEl}>
                <i class="drop" style:--h="{thick(next.n)}px"></i>
                {@render cube("bills banded", thick(next.n), next.v)}
              </span>
            {/if}
          </span>
        </button>

        <div class="group machine" class:running>
          <!-- its shadow on the counter, and the rubber feet it stands on -->
          <span class="plane table" style={ground(BASE)}>
            <i class="cast" style:left="{-X - BASE.x0}px" style:top="{BACK_Z - BASE.z0}px" style:width="{2 * X}px" style:height="{TRAY - BACK_Z}px"></i>
            <i class="contact" style:left="{-X - BASE.x0}px" style:top="{BACK_Z - BASE.z0}px" style:width="{2 * X}px" style:height="{FRONT - BACK_Z}px"></i>
            {#each FEET as [fx, fz], k (k)}
              <span class="foot" style:left="{fx - BASE.x0}px" style:top="{fz - BASE.z0}px">{@render cube("rubber", FT, 0, 8, 5)}</span>
            {/each}
          </span>

          <!-- the shell: its right side, the shoulders either side of the hopper, the nose and the cheeks round the stacker -->
          <span class="face side" style={wall(X, [[BACK_Z, FT], RIM, VF, NOSE, [FRONT, FT]])} bind:this={sideEl}></span>
          <span class="face shoulder" style={face(RIM, VF, -X, -HW)}></span>
          <span class="face shoulder r" style={face(RIM, VF, HW, X)}></span>
          <span class="face well" style={wall(-HW, [RIM, THROAT, VF])}></span>
          <span class="face nose" style={face(NOSE, [FRONT, LIP])}></span>
          <span class="face cheek" style={face([FRONT, LIP], [FRONT, FT], -X, -IN)}></span>
          <span class="face cheek r" style={face([FRONT, LIP], [FRONT, FT], IN, X)}></span>
          <span class="face base" style={face([FRONT, FLOOR - 2], [FRONT, FT], -IN, IN)}></span>

          <!-- the hopper: a ribbed plate sloping back, two guides, and the bills stood in it -->
          <span class="plane hopper" class:over style={face(RIM, THROAT, -HW, HW)} bind:this={hopperEl}>
            <i class="roller" style:left="{HW - 17}px"></i>
            <i class="roller" style:left="{HW + 5}px"></i>
            {#each [HW - BW / 2 - 4, HW + BW / 2 + 2] as gx (gx)}
              <span class="guide" style:left="{gx}px">{@render cube("fin", 6, 0, 1.6, PLATE)}</span>
            {/each}
            {#if tray.length}
              {#key drops}
                <span class="stand settle" style:left="{HW - BW / 2}px" style:top="{PLATE - BD}px">
                  {#each pulls as p (p.id)}
                    <span class="sheet pull">{@render bill(p.v)}</span>
                  {/each}
                  {#each fan as f (f.j)}
                    <span class="sheet" style:transform="translate3d({f.x}px, {-f.up}px, {f.z}px) rotate({f.r}deg)">{@render bill(f.v)}</span>
                  {/each}
                  <span class="load">{@render cube("bills", thick(tray.length), tray[tray.length - 1])}</span>
                </span>
              {/key}
            {/if}
          </span>

          <!-- the panel: a membrane overlay with the LED window and the keys -->
          <span class="face panel" style={face(VF, NOSE)} bind:this={panelEl}>
            <span class="overlay" dir="ltr">
              <span class="window" aria-hidden="true">
                <svg viewBox="0 0 50 20">
                  <text class="legend" x="3.2" y="9.6">{t("money.pcsLabel")}</text>
                  {@render figures(countCells, 17.4, 1.4, 1, 7.8)}
                  <text class="sym" x="11.6" y="18.7">{currencySymbol()}</text>
                  {@render figures(totalCells, 47.6 - (totalCells.length - 1) * pitch - 3.4, 13.1, 0.56, pitch)}
                </svg>
              </span>
              <span class="lamp add" aria-hidden="true"><i></i>{t("common.add")}</span>
              <span class="lamp auto" aria-hidden="true"><i></i>{t("money.autoLamp")}</span>
              <button type="button" class="key clear" onclick={clearKey} aria-label={t("money.clearAriaLabel")}>{t("common.clear")}</button>
              <button type="button" class="key start" onclick={startKey} aria-label={t("money.startAriaLabel")}>{t("money.start")}</button>
            </span>
          </span>
        </div>

        <!-- the stacker in front, where the counted bills land -->
        <button
          type="button"
          class="group pocket"
          class:lifting
          class:banding
          class:running
          onclick={take}
          aria-label={stacked.length >= BAND
            ? `${tp("money.strapBills", BAND)}, ${money(sum(stacked.slice(0, BAND)))}`
            : stacked.length
              ? tp("money.putBack", stacked.length)
              : t("money.stackerEmpty")}
        >
          <!-- the back wall, with the slot the bills come out of and the stacker wheels in it -->
          <span class="face slot" style={face([BACK, LIP], [BACK, FLOOR], -IN, IN)}>
            <i class="wheel" style:left="{IN - 20}px"></i>
            <i class="wheel" style:left="{IN + 13}px"></i>
          </span>
          <span class="face mouth" style={wall(-IN, [[BACK, FLOOR], [BACK, LIP], [FRONT, LIP], [FRONT, FLOOR]])}></span>
          <span class="plane floor" style={face([BACK, FLOOR], [TRAY, FLOOR], -IN, IN)}>
            {#if landed}
              <span class="load" style:left="{IN - BW / 2}px">{@render cube("bills", thick(landed), stacked[landed - 1])}</span>
            {/if}
            {#each flights as f (f.id)}
              <span class="sheet flick" style:left="{IN - BW / 2}px" style:--land="{f.land}px">{@render bill(f.v)}</span>
            {/each}
          </span>
          <!-- the tray's front edge, with a low lip to stop the bills -->
          <span class="face lip" style={face([TRAY - 1.5, FLOOR + 2], [TRAY, FLOOR + 2], -IN, IN)}></span>
          <span class="face edge" style={face([TRAY, FLOOR + 2], [TRAY, FLOOR - 2], -IN, IN)}></span>
          <span
            class="face edge end"
            style={wall(IN, [
              [FRONT, FLOOR],
              [TRAY - 1.5, FLOOR],
              [TRAY - 1.5, FLOOR + 2],
              [TRAY, FLOOR + 2],
              [TRAY, FLOOR - 2],
              [FRONT, FLOOR - 2],
            ])}
          ></span>
        </button>

        <!-- the bricks, stacked up beside the machine -->
        <button
          type="button"
          class="group tower"
          onclick={unband}
          aria-label={bricks.length ? t("money.bricksStrapped", { amount: money(worth) }) : t("money.noBricksYet")}
        >
          <span class="plane table" style={ground(TOWER)}>
            {#if bricks.length}<i class="drop" style:--h="{Math.min(bricks.length, SHOW) * BRICK}px"></i>{/if}
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
                {@render cube("bills banded strap", BRICK, b.bills[0])}
              </span>
            {/each}
            {#if bricks.length}
              <span class="worth num" style:--z="{Math.min(bricks.length, SHOW) * BRICK + 3}px">{money(worth)}</span>
            {/if}
          </span>
        </button>
      </div>
    </div>

    <!-- the bundle in hand, drawn in the same light as the counter -->
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
        <span class="hand">{@render cube("bills banded", thick(cash.n), cash.v)}</span>
      </span>
    {/if}
  </div>
  <p class="hint">
    {stacked.length >= BAND && !running ? t("money.hintStrap", { n: BAND }) : t("money.hintDrag")}
  </p>
  <p class="sr-only" aria-live="polite">
    {running ? "" : `${tp("money.billsCounted", count)}, ${t("money.totalAll", { amount: money(total) })}`}
  </p>
</div>

<style>
  /* the machine keeps its own colors, like the cards and dice: it's a thing on
     the counter. charcoal plastic, lit from the back left, so what looks up is
     lightest, the front and the right side sit in its shade, and the lower
     shell is a darker molding under a seam */
  .desk {
    --top: oklch(41% 0 0);
    --top-lo: oklch(37% 0 0);
    --bevel: oklch(53% 0 0);
    --front: oklch(29% 0 0);
    --front-lo: oklch(25% 0 0);
    --side: oklch(26% 0 0);
    --lower: oklch(21% 0 0);
    --seam: oklch(13% 0 0);
    --inside: oklch(15% 0 0);
    --rubber: oklch(16% 0 0);
    --led: oklch(69% 0.25 29);
    --lamp: oklch(80% 0.19 145);
    --strap: oklch(77% 0.1 78);
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
  i {
    font-style: normal;
  }

  /* ---- a bill: tinted paper, a printed frame, the portrait, the watermark window, the thread, the value in the corners ---- */
  .bill {
    --ink: oklch(44% 0.07 var(--hue));
    position: absolute;
    inset: 0;
    display: block;
    box-sizing: border-box;
    overflow: hidden;
    border-radius: 1px;
    background:
      radial-gradient(ellipse 9% 30% at 71% 46%, oklch(97% 0.012 var(--hue)) 60%, transparent 100%),
      repeating-radial-gradient(ellipse at 30% 50%, transparent 0 1.1px, oklch(52% 0.06 var(--hue) / 0.11) 1.1px 1.6px),
      linear-gradient(90deg, oklch(89% 0.035 var(--hue)), oklch(92% 0.03 var(--hue)) 60%, oklch(90% 0.03 var(--hue)));
    transform-style: flat;
  }
  /* the shade a bill is in: stood up in the hopper or down in the stacker, it's turned from the light */
  .bill::after {
    content: "";
    position: absolute;
    inset: 0;
    background: oklch(20% 0 0 / var(--dim, 0));
  }
  .bill i {
    position: absolute;
    display: block;
  }
  .bill .frame {
    inset: 1.4px;
    border: 1.1px solid oklch(50% 0.07 var(--hue) / 0.5);
    border-radius: 0.5px;
  }
  .bill .frame::after {
    content: "";
    position: absolute;
    inset: 0.9px;
    border: 0.5px solid oklch(44% 0.07 var(--hue) / 0.4);
  }
  .bill .portrait {
    left: calc(30% - 5.5px);
    top: calc(50% - 7.5px);
    width: 11px;
    height: 15px;
    border-radius: 50%;
    box-sizing: border-box;
    border: 0.8px solid oklch(44% 0.07 var(--hue) / 0.6);
    background:
      radial-gradient(ellipse 26% 22% at 50% 40%, oklch(44% 0.06 var(--hue) / 0.55) 85%, transparent),
      radial-gradient(ellipse 48% 30% at 50% 102%, oklch(44% 0.06 var(--hue) / 0.5) 90%, transparent),
      oklch(86% 0.035 var(--hue));
  }
  .bill .mark {
    left: calc(71% - 4px);
    top: calc(46% - 6px);
    width: 8px;
    height: 12px;
    border-radius: 50%;
    border: 0.5px solid oklch(44% 0.07 var(--hue) / 0.18);
  }
  .bill .thread {
    left: 52%;
    top: 0;
    bottom: 0;
    width: 0.8px;
    background: repeating-linear-gradient(180deg, oklch(40% 0.05 var(--hue) / 0.6) 0 2px, transparent 2px 3.2px);
  }
  .bill .n {
    font: 700 5.5px/1 var(--font-serif);
    color: var(--ink);
    letter-spacing: -0.02em;
  }
  .bill .tl {
    left: 3.6px;
    top: 3.4px;
  }
  .bill .br {
    right: 3.8px;
    bottom: 3.2px;
    font-size: 8px;
  }
  .bill.long .tl {
    font-size: 4.6px;
  }
  .bill.long .br {
    font-size: 6.2px;
  }

  /* ---- a box: the top, and four sides hinged down from its edges ---- */
  .cube {
    position: absolute;
    display: block;
  }
  .cube .f {
    position: absolute;
    display: block;
    box-sizing: border-box;
    backface-visibility: hidden;
  }
  .cube .top {
    inset: 0;
    transform: translateZ(var(--h));
  }
  .cube .fr {
    left: 0;
    bottom: 0;
    width: 100%;
    height: var(--h);
    transform-origin: 50% 100%;
    transform: rotateX(-90deg);
  }
  .cube .bk {
    left: 0;
    top: 0;
    width: 100%;
    height: var(--h);
    transform-origin: 50% 0;
    transform: rotateX(90deg);
  }
  .cube .rt {
    right: 0;
    top: 0;
    width: var(--h);
    height: 100%;
    transform-origin: 100% 50%;
    transform: rotateY(90deg);
  }
  .cube .lf {
    left: 0;
    top: 0;
    width: var(--h);
    height: 100%;
    transform-origin: 0 50%;
    transform: rotateY(-90deg);
  }
  /* a stack of bills: the edge of every sheet, paper between faint lines of the print, darker on the shaded right */
  .bills .fr,
  .bills .bk {
    background: repeating-linear-gradient(0deg, oklch(90% 0.018 var(--hue)) 0 0.55px, oklch(76% 0.035 var(--hue)) 0.55px 1px);
  }
  .bills .rt,
  .bills .lf {
    background: repeating-linear-gradient(90deg, oklch(82% 0.018 var(--hue)) 0 0.55px, oklch(67% 0.035 var(--hue)) 0.55px 1px);
  }
  /* a rubber band round a bundle, and a paper strap round a brick */
  .banded .top::after,
  .banded .fr::after,
  .banded .bk::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(28% - 0.75px);
    width: 1.5px;
    background: oklch(50% 0.08 50);
  }
  .strap .top::after,
  .strap .fr::after,
  .strap .bk::after {
    left: calc(50% - 6px);
    width: 12px;
    background: var(--strap);
    box-shadow: inset 0.5px 0 oklch(66% 0.09 75), inset -0.5px 0 oklch(66% 0.09 75);
  }
  .strap.bills .fr,
  .strap.bills .bk {
    background: repeating-linear-gradient(0deg, oklch(88% 0.02 var(--hue)) 0 0.5px, oklch(74% 0.04 var(--hue)) 0.5px 1px);
  }
  /* a guide: a thin fin of lighter plastic standing up off the hopper plate */
  .fin .f {
    background: oklch(30% 0 0);
  }
  .fin .rt {
    background: linear-gradient(90deg, oklch(27% 0 0), oklch(33% 0 0));
  }
  .fin .top {
    background: oklch(52% 0 0);
  }
  .rubber .f {
    background: var(--rubber);
  }

  /* ---- the counter under things: soft shadows falling forward and right, away from the light ---- */
  .table .cast,
  .table .contact,
  .table .drop {
    position: absolute;
    display: block;
    transform-style: flat;
  }
  .cast {
    translate: 9px 7px;
    border-radius: 6px;
    background: oklch(0% 0 0 / 0.3);
    filter: blur(7px);
  }
  .contact {
    border-radius: 2px;
    background: oklch(0% 0 0 / 0.55);
    filter: blur(1.5px);
  }
  .drop {
    left: 3px;
    top: 3px;
    width: 60px;
    height: 23px;
    translate: calc(var(--h) * 0.5 + 1px) calc(var(--h) * 0.6 + 1px);
    border-radius: 2px;
    background: oklch(0% 0 0 / 0.26);
    filter: blur(2px);
  }
  .foot {
    position: absolute;
  }

  /* ---- the shell ---- */
  .side {
    /* the upper shell, the seam, then the darker lower molding; the vents near the back */
    background:
      repeating-linear-gradient(180deg, var(--seam) 0 1.1px, oklch(33% 0 0) 1.1px 1.6px, transparent 1.6px 3.3px) right 7px top 10px / 15px 16px no-repeat,
      linear-gradient(180deg, transparent 41.5px, var(--seam) 41.5px 42.5px, oklch(32% 0 0) 42.5px 43.2px, transparent 43.2px),
      linear-gradient(180deg, transparent 43px, var(--lower) 43px, oklch(18% 0 0)),
      linear-gradient(170deg, oklch(29% 0 0), var(--side) 55%);
  }
  .shoulder,
  .panel {
    background: linear-gradient(180deg, var(--top), var(--top-lo));
  }
  /* the edges round off, and catch the light as they turn */
  .shoulder.r,
  .panel {
    box-shadow: inset -1px 0 var(--bevel);
  }
  .panel {
    border-bottom: 1px solid var(--bevel);
  }
  .well {
    background: linear-gradient(180deg, oklch(23% 0 0), oklch(17% 0 0));
  }
  .nose {
    background: linear-gradient(180deg, var(--front), var(--front-lo));
    border-bottom: var(--hair) solid var(--seam);
  }
  .cheek {
    background:
      linear-gradient(180deg, transparent 13px, var(--seam) 13px 14px, oklch(31% 0 0) 14px 14.7px, transparent 14.7px),
      linear-gradient(180deg, var(--front), var(--front-lo) 13px, var(--lower) 13px, oklch(17% 0 0));
  }
  .cheek.r {
    box-shadow: inset -1px 0 oklch(36% 0 0);
  }
  .base {
    background: oklch(15% 0 0);
  }

  /* ---- the hopper ---- */
  .hopper {
    /* smoked plastic with ribs down it for the bills to slide on, the dark throat at the foot */
    --plate: oklch(35% 0 0);
    background:
      linear-gradient(0deg, oklch(9% 0 0) 0 1.2px, transparent 1.2px),
      repeating-linear-gradient(90deg, transparent 0 9.4px, oklch(0% 0 0 / 0.14) 9.4px 10px, oklch(100% 0 0 / 0.05) 10px 10.6px) 5px 0 / calc(100% - 10px) 100% no-repeat,
      linear-gradient(180deg, var(--plate), oklch(29% 0 0));
  }
  /* a bundle held over it: the plate lights up where it'll land */
  .hopper.over {
    --plate: oklch(45% 0 0);
  }
  /* the rubber pick rollers, showing through the foot of the plate */
  .roller {
    position: absolute;
    bottom: 1.2px;
    width: 12px;
    height: 3.4px;
    border-radius: 1px;
    background: linear-gradient(180deg, oklch(14% 0 0), oklch(27% 0 0) 45%, oklch(12% 0 0));
    transform: translateZ(0.2px);
  }
  .guide {
    position: absolute;
    top: 0;
    width: 2px;
  }
  .stand {
    position: absolute;
    width: 64px;
    height: 27px;
    --dim: 0.1;
  }
  .stand .load,
  .floor .load {
    position: absolute;
    width: 64px;
    height: 27px;
  }
  .stand .load {
    left: 0;
    top: 0;
  }
  .sheet {
    position: absolute;
    left: 0;
    top: 0;
    width: 64px;
    height: 27px;
    transform-style: flat;
  }
  /* the stack drops in and settles; the bills shiver while the rollers pull at them */
  .settle {
    animation: settle 300ms var(--ease-out-expo);
  }
  @keyframes settle {
    from {
      translate: 0 -6px 10px;
    }
  }
  .running .stand {
    animation: shiver 55ms linear infinite alternate;
  }
  @keyframes shiver {
    to {
      translate: 0 0.5px 0;
    }
  }
  .hopper.over .stand {
    translate: 0 -1px 2px;
  }
  /* the back bill, dragged down off the stack into the throat */
  .pull {
    transform: translate3d(0, -2.5px, 0.15px);
    animation: pull 110ms cubic-bezier(0.5, 0, 1, 1) forwards;
  }
  @keyframes pull {
    to {
      transform: translate3d(0, 30px, 0.15px);
    }
  }

  /* ---- the panel: a satin membrane overlay, the LED window, two lamps and two keys ---- */
  .panel {
    transform-style: flat;
  }
  .panel * {
    transform-style: flat;
  }
  .overlay {
    position: absolute;
    left: 5px;
    top: 5px;
    right: 5px;
    bottom: 6px;
    border-radius: 2.5px;
    background: linear-gradient(180deg, oklch(23% 0 0), oklch(20% 0 0));
    box-shadow:
      inset 0 0 0 0.5px oklch(13% 0 0),
      0 0.5px 0 oklch(47% 0 0);
  }
  .window {
    position: absolute;
    left: 4px;
    top: 3.5px;
    width: 50px;
    height: 20px;
    border-radius: 1.5px;
    background:
      linear-gradient(162deg, oklch(100% 0 0 / 0.06) 0 38%, transparent 38%),
      oklch(12% 0.012 25);
    box-shadow: inset 0 0 0 0.6px oklch(6% 0 0);
  }
  .window svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .ghost {
    fill: oklch(30% 0.09 28 / 0.4);
  }
  .lit,
  .sym,
  .legend {
    fill: var(--led);
  }
  .lit {
    filter: drop-shadow(0 0 0.7px oklch(62% 0.25 29 / 0.9));
  }
  .legend,
  .sym {
    font-family: var(--font);
    font-weight: 700;
  }
  .legend {
    font-size: 3.6px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    opacity: 0.8;
  }
  .sym {
    font-size: 5.8px;
    text-anchor: end;
  }
  .lamp {
    position: absolute;
    top: 5px;
    display: flex;
    align-items: center;
    gap: 1.4px;
    font: 700 3.3px/1 var(--font);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: oklch(76% 0 0);
  }
  .lamp i {
    width: 2.2px;
    height: 2.2px;
    border-radius: 50%;
    background: var(--lamp);
    box-shadow: 0 0 1.2px var(--lamp);
  }
  .lamp.add {
    left: 59px;
  }
  .lamp.auto {
    left: 79px;
  }
  .key {
    position: absolute;
    top: 12.5px;
    height: 8px;
    display: grid;
    place-items: center;
    border-radius: 1.5px;
    background: linear-gradient(180deg, oklch(35% 0 0), oklch(30% 0 0));
    box-shadow:
      inset 0 0.5px oklch(46% 0 0),
      0 0.7px 0 oklch(11% 0 0);
    font: 700 3.3px/1 var(--font);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: oklch(88% 0 0);
    transition:
      translate var(--dur-press) var(--ease-out),
      box-shadow var(--dur-press) var(--ease-out),
      background-color var(--dur-hover) var(--ease-out),
      filter var(--dur-hover) var(--ease-out);
  }
  .key.clear {
    left: 58px;
    width: 17px;
  }
  .key.start {
    left: 78px;
    width: 23px;
  }
  .key:hover {
    filter: brightness(1.18);
  }
  .key:active {
    translate: 0 0.6px;
    box-shadow:
      inset 0 0.5px oklch(40% 0 0),
      0 0.1px 0 oklch(11% 0 0);
  }
  .key:focus-visible {
    outline: 1px solid var(--focus);
  }

  /* ---- the stacker ---- */
  /* the back wall: the slot the bills shoot out of, and the rubber-finned wheels that slap them down */
  .slot {
    background:
      linear-gradient(180deg, transparent 4px, oklch(6% 0 0) 4px 8px, oklch(24% 0 0) 8px 8.6px, transparent 8.6px),
      linear-gradient(180deg, oklch(18% 0 0), oklch(13% 0 0));
  }
  .wheel {
    position: absolute;
    top: 2.5px;
    width: 7px;
    height: 9px;
    border-radius: 1.5px;
    background: repeating-linear-gradient(180deg, oklch(26% 0 0) 0 1.1px, oklch(12% 0 0) 1.1px 2.4px);
  }
  .running .wheel {
    animation: whirl 90ms linear infinite;
  }
  @keyframes whirl {
    to {
      background-position: 0 2.4px;
    }
  }
  .mouth {
    background: linear-gradient(0deg, oklch(15% 0 0), var(--inside) 60%, oklch(11% 0 0));
  }
  /* the tray: dark under the overhang, lighter where it comes out into the light */
  .floor {
    background: linear-gradient(180deg, oklch(12% 0 0), oklch(22% 0 0) 72%, oklch(33% 0 0));
  }
  .floor .load {
    top: 2px;
    --dim: 0.12;
    transition: translate 320ms var(--ease-out-expo);
  }
  .floor .load .cube {
    top: 0;
  }
  .lip {
    background: oklch(40% 0 0);
  }
  .edge {
    background: linear-gradient(180deg, oklch(29% 0 0), oklch(23% 0 0));
  }
  .edge.end {
    background: oklch(22% 0 0);
  }
  .pocket:hover .load {
    translate: 0 0 1.5px;
  }
  .pocket:focus-visible .floor {
    outline: 1px solid var(--focus);
  }
  .lifting .load {
    translate: 0 -16px 40px;
  }
  /* each bill shoots out of the slot, tips over and drops flat onto the stack */
  .flick {
    top: 2px;
    --dim: 0.1;
    transform: translate3d(0, 0, var(--land));
    animation: flick 160ms linear both;
  }
  @keyframes flick {
    from {
      transform: translate3d(0, -25px, 15px) rotateX(-10deg);
      animation-timing-function: cubic-bezier(0.2, 0.6, 0.4, 1);
    }
    45% {
      transform: translate3d(0, -5px, calc(var(--land) + 7px)) rotateX(-5deg);
      animation-timing-function: cubic-bezier(0.55, 0, 1, 0.6);
    }
    to {
      transform: translate3d(0, 0, var(--land));
    }
  }
  /* strapping: a paper strap snaps round the middle of the stack */
  .banding .load .cube::after {
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
  /* a loose bill lies almost flat, a hair of shadow along its lower right */
  .loose .bill {
    box-shadow: 0.5px 0.8px 1px oklch(0% 0 0 / 0.28);
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
  .pile:hover .bundle .cube {
    translate: 0 0 2px;
  }
  .bundle .cube {
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
  /* out of the stacker, up and over onto the stack */
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
  /* what's strapped, on a card stood up behind the stack */
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
    .pull,
    .flick,
    .banding .load .cube::after,
    .running .stand,
    .running .wheel {
      animation: none;
    }
    .floor .load,
    .brick,
    .cash,
    .key {
      transition: none;
    }
  }
</style>

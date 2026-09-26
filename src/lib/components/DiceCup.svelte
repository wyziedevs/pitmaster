<script lang="ts">
  // a pair of casino dice on a little felt table, in 3d. press and hold to pick
  // them up and shake them, let go to throw: they fly down the felt, bounce,
  // tumble over and settle, and the total comes up with its table name when it
  // has one. a tap is a quick throw. each face is lit by where it ends up
  // facing, so a die looks solid from every side.
  import { play } from "$lib/sound";
  import { reducedMotion } from "$lib/motion";

  /** the cube's edge, px */
  const S = 28;
  const ROLL = 760;

  // where each face sits on the cube, and the turn that brings it to the top.
  // opposite faces add up to seven, like a real die.
  const FACES = [
    { v: 1, n: [0, 0, 1], t: `translateZ(${S / 2}px)`, up: [0, 0] },
    { v: 6, n: [0, 0, -1], t: `rotateY(180deg) translateZ(${S / 2}px)`, up: [0, 180] },
    { v: 2, n: [1, 0, 0], t: `rotateY(90deg) translateZ(${S / 2}px)`, up: [0, -90] },
    { v: 5, n: [-1, 0, 0], t: `rotateY(-90deg) translateZ(${S / 2}px)`, up: [0, 90] },
    { v: 3, n: [0, -1, 0], t: `rotateX(90deg) translateZ(${S / 2}px)`, up: [-90, 0] },
    { v: 4, n: [0, 1, 0], t: `rotateX(-90deg) translateZ(${S / 2}px)`, up: [90, 0] },
  ] as const;
  // pips on a 3x3 grid, by cell
  const PIPS = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];
  // what the table calls a roll, when it calls it anything
  const NAMES: Record<number, string> = { 2: "Snake Eyes", 3: "Ace-Deuce", 11: "Yo", 12: "Boxcars" };
  const HARD: Record<number, string> = { 4: "Hard Four", 6: "Hard Six", 8: "Hard Eight", 10: "Hard Ten" };

  type Die = { x: number; y: number; yaw: number; rx: number; ry: number; v: number };
  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const face = () => 1 + Math.floor(Math.random() * 6);
  const later = (fn: () => void, ms: number) => setTimeout(fn, reducedMotion() ? 0 : ms);

  const at = (v: number, x: number, y: number, yaw: number): Die => {
    const f = FACES.find((f) => f.v === v)!;
    return { x, y, yaw, rx: f.up[0], ry: f.up[1], v };
  };
  let dice = $state<Die[]>([at(5, 96, 52, 18), at(2, 142, 64, -24)]);
  let phase = $state<"rest" | "held" | "roll">("rest");
  let result = $state<{ sum: number; name: string } | null>(null);
  let rattle: ReturnType<typeof setInterval> | undefined;

  // ---- light ----
  // each face's brightness from which way it points once the die has turned:
  // lit from above and a little behind the left shoulder
  const L = (() => {
    const v = [-0.35, -0.45, 1];
    const m = Math.hypot(...v);
    return v.map((c) => c / m);
  })();
  const rad = (d: number) => (d * Math.PI) / 180;
  function turn([x, y, z]: readonly number[], d: Die) {
    // rotateZ(yaw) rotateX(rx) rotateY(ry), applied right to left
    let c = Math.cos(rad(d.ry)),
      s = Math.sin(rad(d.ry));
    [x, z] = [x * c + z * s, -x * s + z * c];
    c = Math.cos(rad(d.rx));
    s = Math.sin(rad(d.rx));
    [y, z] = [y * c - z * s, y * s + z * c];
    c = Math.cos(rad(d.yaw));
    s = Math.sin(rad(d.yaw));
    [x, y] = [x * c - y * s, x * s + y * c];
    return [x, y, z];
  }
  /** how dark a face is, and how much of the light glints off it */
  const light = (f: (typeof FACES)[number], d: Die) => {
    const n = turn(f.n, d);
    const lit = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
    return { shade: (0.62 * (1 - lit)).toFixed(3), gloss: (lit ** 4).toFixed(3) };
  };

  // ---- throwing ----
  /** a whole number of extra turns past `from`, landing on `to` */
  const spinTo = (from: number, to: number, turns: number) => to + 360 * Math.ceil((from + turns * 360 - to) / 360);

  function pickUp() {
    if (phase !== "rest") return;
    phase = "held";
    result = null;
    jiggle();
    play("rattle");
    rattle = setInterval(() => {
      jiggle();
      play("rattle");
    }, 90);
  }
  // in the hand: over the near corner, turning over and over against each other
  function jiggle() {
    dice = dice.map((d, i) => ({
      ...d,
      x: 26 + i * 30 + rand(-3, 3),
      y: 118 + rand(-3, 3),
      rx: d.rx + rand(40, 110),
      ry: d.ry + rand(40, 110),
      yaw: d.yaw + rand(-30, 30),
    }));
  }

  function roll() {
    if (phase !== "held") return;
    clearInterval(rattle);
    phase = "roll";
    const x0 = rand(50, 104);
    const spots = [
      [x0, rand(26, 70)],
      [x0 + rand(46, 62), rand(30, 74)],
    ];
    dice = dice.map((d, i) => {
      const v = face();
      const f = FACES.find((f) => f.v === v)!;
      return {
        v,
        x: spots[i][0],
        y: spots[i][1],
        yaw: d.yaw + rand(-160, 160),
        rx: spinTo(d.rx, f.up[0], 2 + Math.round(Math.random())),
        ry: spinTo(d.ry, f.up[1], 1 + Math.round(Math.random())),
      };
    });
    play("tumble");
    later(() => {
      phase = "rest";
      const [a, b] = dice.map((d) => d.v);
      result = { sum: a + b, name: (a === b && HARD[a + b]) || NAMES[a + b] || "" };
      if (a === b) play("success");
    }, ROLL);
  }

  // swapped for another toy mid-shake: the hand stops rattling
  $effect(() => () => clearInterval(rattle));

  function key(e: KeyboardEvent) {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    if (e.type === "keydown" && !e.repeat) pickUp();
    if (e.type === "keyup") roll();
  }
</script>

<svelte:window onpointerup={roll} onpointercancel={roll} onblur={roll} />

<div class="toy">
  <div class="table">
    <button
      type="button"
      class="throw"
      class:held={phase === "held"}
      class:rolling={phase === "roll"}
      data-sound="none"
      aria-label="Dice, hold to shake and let go to roll"
      onpointerdown={(e) => e.button === 0 && pickUp()}
      onkeydown={key}
      onkeyup={key}
      oncontextmenu={(e) => e.preventDefault()}
    >
      <span class="floor" aria-hidden="true">
        <!-- the pass line, printed on the felt -->
        <svg class="print" viewBox="0 0 200 150">
          <path id="pass" d="M 14 112 Q 100 150 186 112" />
          <text><textPath href="#pass" startOffset="50%" text-anchor="middle">PASS LINE</textPath></text>
          <path class="rule" d="M 8 124 Q 100 164 192 124" />
        </svg>
        <!-- the table's near edge, the thickness of the rail -->
        <span class="edge"></span>
        {#each dice as d, i (i)}
          <span class="pos" style:transform="translate3d({d.x - S / 2}px, {d.y - S / 2}px, 0)">
            <span class="shadow" style:rotate="{d.yaw}deg"></span>
            <span class="contact" style:rotate="{d.yaw}deg"></span>
            <span class="lift">
              <span class="cube" style:transform="rotateZ({d.yaw}deg) rotateX({d.rx}deg) rotateY({d.ry}deg)">
                {#each FACES as f (f.v)}
                  {@const l = light(f, d)}
                  <span class="side" style:transform={f.t} style:--shade={l.shade} style:--gloss={l.gloss}>
                    {#each { length: 9 } as _, c (c)}<i class:on={PIPS[f.v].includes(c)}></i>{/each}
                  </span>
                {/each}
              </span>
            </span>
          </span>
        {/each}
      </span>
    </button>
    <div class="said" aria-live="polite">
      {#if result}
        {#key result}
          <b class="sum num">{result.sum}</b>
          {#if result.name}<span class="name">{result.name}</span>{/if}
        {/key}
      {/if}
    </div>
  </div>
  <p class="hint">Hold to shake, let go to roll.</p>
</div>

<style>
  .table {
    position: relative;
    width: 250px;
    height: 118px;
  }
  .throw {
    all: unset;
    position: absolute;
    inset: 0;
    cursor: grab;
    border-radius: 6px;
    perspective: 420px;
    perspective-origin: 50% -10%;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
  }
  .throw:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
  .held {
    cursor: grabbing;
  }

  /* the table: felt inside a padded wooden rail, tipped away, everything on it
     in its own 3d. the rail is the border, so the felt is still 200 by 150 */
  .floor {
    --rail: 7px;
    position: absolute;
    left: calc(25px - var(--rail));
    top: calc(-17px - var(--rail));
    width: 200px;
    height: 150px;
    transform-style: preserve-3d;
    transform: rotateX(56deg);
    border: var(--rail) solid transparent;
    border-radius: 5px;
    background:
      var(--cloth) padding-box,
      radial-gradient(ellipse 70% 60% at 40% 30%, oklch(from var(--felt) calc(l + 0.06) c h), transparent) padding-box,
      linear-gradient(oklch(from var(--felt) calc(l - 0.03) c h), oklch(from var(--felt) calc(l - 0.03) c h)) padding-box,
      linear-gradient(160deg, oklch(40% 0.05 52), oklch(27% 0.04 45) 70%) border-box;
    background-blend-mode: soft-light, normal, normal, normal;
    /* the rail's shadow on the felt, falling away from the light at the back left */
    box-shadow:
      inset 0 0 0 var(--hair) oklch(18% 0.03 45 / 0.7),
      inset 4px 5px 7px -3px oklch(10% 0.03 160 / 0.6);
  }
  .edge {
    position: absolute;
    left: calc(-1 * var(--rail));
    right: calc(-1 * var(--rail));
    top: calc(100% + var(--rail));
    height: 9px;
    transform-origin: 50% 0;
    transform: rotateX(-90deg);
    background: linear-gradient(oklch(30% 0.04 48), oklch(17% 0.025 45));
    box-shadow: inset 0 var(--hair) oklch(48% 0.05 55 / 0.6);
  }
  .print {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .print path {
    fill: none;
  }
  .print .rule {
    stroke: oklch(from var(--felt) calc(l + 0.18) c h / 0.6);
    stroke-width: 1;
  }
  .print text {
    fill: oklch(from var(--felt) calc(l + 0.22) c h / 0.75);
    font: bold 11px var(--font);
    letter-spacing: 0.2em;
  }

  .pos {
    position: absolute;
    left: 0;
    top: 0;
    width: 28px;
    height: 28px;
    transform-style: preserve-3d;
    transition: transform 140ms var(--ease-out);
  }
  .rolling .pos {
    transition: transform 760ms var(--ease-out-expo);
  }
  /* the die's shadow on the felt, thrown forward and right, away from the
     light: tight when it sits, wide, faint and further off up in the air. the
     contact shadow is the dark line where it touches down */
  .shadow,
  .contact {
    position: absolute;
    inset: 0;
    border-radius: 3px;
    transition:
      translate 140ms var(--ease-out),
      scale 140ms var(--ease-out),
      opacity 140ms var(--ease-out);
  }
  .shadow {
    background: oklch(10% 0.03 160 / 0.55);
    filter: blur(3px);
    translate: 5px 6px;
    scale: 1.08;
  }
  .contact {
    inset: -1px;
    background: oklch(8% 0.02 160 / 0.6);
    filter: blur(1px);
  }
  .held .shadow {
    opacity: 0.3;
    translate: 12px 15px;
    scale: 1.35;
  }
  .held .contact {
    opacity: 0;
  }
  .rolling .shadow {
    animation: shadow 760ms linear;
  }
  .rolling .contact {
    animation: contact 760ms linear;
  }
  /* sitting on the felt: its middle half an edge up */
  .lift {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
    translate: 0 0 14px;
    transition: translate 140ms var(--ease-out);
  }
  .held .lift {
    translate: 0 0 44px;
  }
  /* thrown: down onto the felt and a few smaller bounces, timed to the sound */
  .rolling .lift {
    animation: bounce 760ms linear;
  }
  @keyframes bounce {
    0% {
      translate: 0 0 44px;
      animation-timing-function: cubic-bezier(0.5, 0, 1, 1);
    }
    11% {
      translate: 0 0 14px;
      animation-timing-function: cubic-bezier(0, 0, 0.5, 1);
    }
    24% {
      translate: 0 0 36px;
      animation-timing-function: cubic-bezier(0.5, 0, 1, 1);
    }
    35% {
      translate: 0 0 14px;
      animation-timing-function: cubic-bezier(0, 0, 0.5, 1);
    }
    45% {
      translate: 0 0 24px;
      animation-timing-function: cubic-bezier(0.5, 0, 1, 1);
    }
    54% {
      translate: 0 0 14px;
      animation-timing-function: cubic-bezier(0, 0, 0.5, 1);
    }
    61% {
      translate: 0 0 18px;
      animation-timing-function: cubic-bezier(0.5, 0, 1, 1);
    }
    67%,
    100% {
      translate: 0 0 14px;
    }
  }
  @keyframes shadow {
    0%,
    24% {
      opacity: 0.3;
      translate: 12px 15px;
      scale: 1.35;
    }
    45% {
      opacity: 0.55;
      translate: 8px 10px;
      scale: 1.2;
    }
    11%,
    35%,
    54%,
    100% {
      opacity: 1;
      translate: 5px 6px;
      scale: 1.08;
    }
  }
  @keyframes contact {
    0%,
    24%,
    45% {
      opacity: 0;
    }
    11%,
    35%,
    54%,
    100% {
      opacity: 1;
    }
  }
  .cube {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
    transition: transform 140ms var(--ease-out);
  }
  .held .cube {
    transition: transform 90ms linear;
  }
  .rolling .cube {
    transition: transform 760ms cubic-bezier(0.2, 0.7, 0.3, 1);
  }

  /* casino dice: clear red cellulose, razor edges, white pips drilled in and
     filled flush. the light that gets into the block glows at its edges */
  .side {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template: repeat(3, 1fr) / repeat(3, 1fr);
    place-items: center;
    padding: 3px;
    box-sizing: border-box;
    border-radius: 1.5px;
    border: var(--hair) solid oklch(36% 0.15 25);
    background:
      radial-gradient(circle at 70% 75%, oklch(58% 0.2 27 / 0.7), transparent 60%),
      linear-gradient(145deg, oklch(56% 0.21 25), oklch(45% 0.19 25) 60%, oklch(39% 0.17 25));
    box-shadow:
      inset 0 0 1px 0.5px oklch(74% 0.16 30 / 0.55),
      inset 0 0 6px oklch(30% 0.14 25 / 0.5);
    backface-visibility: hidden;
  }
  /* the light: each face as dark as the way it's turned */
  .side::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: 1.5px;
    background: oklch(12% 0.03 25);
    opacity: var(--shade);
    transition: opacity 300ms var(--ease-out);
  }
  /* and a glint off the polish on the face that looks up at it */
  .side::before {
    content: "";
    position: absolute;
    z-index: 1;
    inset: 0;
    border-radius: 1.5px;
    background:
      linear-gradient(135deg, oklch(100% 0 0 / 0.55), oklch(100% 0 0 / 0.08) 38%, transparent 55%),
      radial-gradient(circle at 24% 20%, oklch(100% 0 0 / 0.6), transparent 22%);
    opacity: var(--gloss);
    transition: opacity 300ms var(--ease-out);
  }
  .side i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }
  .side i.on {
    background: radial-gradient(circle at 55% 60%, oklch(99% 0.003 25), oklch(90% 0.008 25) 70%);
    box-shadow:
      inset 0.5px 0.8px 1px oklch(25% 0.1 25 / 0.7),
      0 0 0 0.4px oklch(30% 0.12 25 / 0.5);
  }

  .said {
    position: absolute;
    right: 0;
    top: 2px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    pointer-events: none;
  }
  .sum {
    font-family: var(--font-serif);
    font-weight: normal;
    font-size: 30px;
    line-height: 1;
    animation: said 360ms var(--ease-out-expo);
  }
  .name {
    font-size: 11px;
    color: var(--muted);
    animation: said 360ms var(--ease-out-expo) 60ms backwards;
  }
  @keyframes said {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .pos,
    .rolling .pos,
    .lift,
    .cube,
    .held .cube,
    .rolling .cube,
    .shadow,
    .contact,
    .side::after,
    .side::before {
      transition: none;
    }
    .rolling .lift,
    .rolling .shadow,
    .rolling .contact,
    .sum,
    .name {
      animation: none;
    }
  }
</style>

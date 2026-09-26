<script lang="ts">
  // a fanned hand on the home page, just to fidget with. run a finger or the
  // pointer along it and the cards rise under it, each on its own note; tap
  // one to turn it over; press and hold to square the hand up, and let go to
  // shuffle it back out. nothing to win and nothing is kept.
  import { onMount } from "svelte";
  import { play } from "$lib/sound";
  import { reducedMotion } from "$lib/motion";
  import { t } from "$lib/i18n";

  type Card = { r: number; s: number };
  const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  // the text form, so a phone doesn't swap in its emoji suits
  const SUITS = ["♠︎", "♥︎", "♦︎", "♣︎"];

  // the pips of a number card as a printer lays them out: [column, how far
  // down] with the columns at the left, middle and right of the pip box. any
  // past halfway print upside down, like the bottom half of a real card
  const LAYOUT: Record<number, [number, number][]> = {
    2: [[1, 0], [1, 1]],
    3: [[1, 0], [1, 0.5], [1, 1]],
    4: [[0, 0], [2, 0], [0, 1], [2, 1]],
    5: [[0, 0], [2, 0], [1, 0.5], [0, 1], [2, 1]],
    6: [[0, 0], [2, 0], [0, 0.5], [2, 0.5], [0, 1], [2, 1]],
    7: [[0, 0], [2, 0], [1, 0.25], [0, 0.5], [2, 0.5], [0, 1], [2, 1]],
    8: [[0, 0], [2, 0], [1, 0.25], [0, 0.5], [2, 0.5], [1, 0.75], [0, 1], [2, 1]],
    9: [[0, 0], [2, 0], [0, 1 / 3], [2, 1 / 3], [1, 0.5], [0, 2 / 3], [2, 2 / 3], [0, 1], [2, 1]],
    10: [[0, 0], [2, 0], [1, 1 / 6], [0, 1 / 3], [2, 1 / 3], [0, 2 / 3], [2, 2 / 3], [1, 5 / 6], [0, 1], [2, 1]],
  };
  const COLS = [32, 50, 68];

  const N = 5;
  const MID = (N - 1) / 2;
  /** degrees between cards */
  const SPREAD = 11;
  /** a card's height; it's as wide as a real one is (2.5 by 3.5) */
  const H = 70;
  /** the pivot, this many card heights below a card's top edge */
  const PIVOT = 2.6;
  /** room above the cards for one to rise */
  const TOP = 16;
  const LIFT = 13;
  /** a press this long squares the hand up */
  const HOLD = 260;

  const idx = [...Array(N).keys()];

  function deal(): Card[] {
    const d: Card[] = [];
    for (let s = 0; s < 4; s++) for (let r = 0; r < 13; r++) d.push({ r, s });
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    // lowest to highest, left to right, like a hand you'd sort yourself
    return d.slice(0, N).sort((a, b) => a.r - b.r || a.s - b.s);
  }

  let cards = $state(deal());
  let up = $state(idx.map(() => false));
  /** turns per card, so each turn restarts the lift that goes with it */
  let flips = $state(idx.map(() => 0));
  /** where the pointer is along the fan, in cards (fractional); null when it's elsewhere */
  let over = $state<number | null>(null);
  let squared = $state(true);
  /** the hand is gathering or spreading, so the cards take their time */
  let moving = $state(true);
  let wave = $state(false);
  /** each card's lean when squared, so the deck looks handled rather than stacked by a machine */
  let lean = $state(idx.map(() => (Math.random() * 2 - 1) * 1.6));

  let fan: HTMLDivElement;
  let lastCard = -1;
  let holdTimer: ReturnType<typeof setTimeout> | undefined;
  let pressAt: { x: number; y: number } | null = null;
  let pressing = false;
  let eatClick = false;

  const later = (fn: () => void, ms: number) => setTimeout(fn, reducedMotion() ? 0 : ms);

  // the hand is dealt out from a squared deck when the page opens
  onMount(() => {
    const t = later(spread, 180);
    return () => clearTimeout(t);
  });

  function lift(i: number) {
    if (squared || over === null) return 0;
    const d = i - over;
    return LIFT * Math.exp(-(d * d) / 1.1);
  }
  const angle = (i: number) => (squared ? lean[i] : (i - MID) * SPREAD);

  /** which card the pointer is over, from the angle it makes with the pivot */
  function track(e: PointerEvent) {
    if (squared) return;
    const r = fan.getBoundingClientRect();
    const px = r.left + r.width / 2;
    const py = r.top + TOP + H * PIVOT;
    const deg = (Math.atan2(e.clientX - px, py - e.clientY) * 180) / Math.PI;
    const f = MID + deg / SPREAD;
    if (f < -0.9 || f > N - 0.1) return leave();
    over = f;
    const n = Math.round(Math.max(0, Math.min(N - 1, f)));
    if (n !== lastCard) {
      play("strum", { n, x: e.clientX });
      lastCard = n;
    }
  }

  function leave() {
    over = null;
    lastCard = -1;
  }

  function move(e: PointerEvent) {
    if (pressAt && Math.hypot(e.clientX - pressAt.x, e.clientY - pressAt.y) > 8) {
      // a finger running along the hand, not a hold
      clearTimeout(holdTimer);
      pressAt = null;
    }
    track(e);
  }

  function down(e: PointerEvent) {
    if (e.button !== 0) return;
    pressing = true;
    pressAt = { x: e.clientX, y: e.clientY };
    track(e);
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => {
      pressAt = null;
      square();
      eatClick = true;
    }, HOLD);
  }

  // on the window, so letting go anywhere still deals the hand back out
  function release(e: PointerEvent) {
    if (!pressing) return;
    pressing = false;
    clearTimeout(holdTimer);
    pressAt = null;
    if (squared && eatClick) {
      shuffle();
      // the click this release makes, if it lands on a card, isn't a flip
      setTimeout(() => (eatClick = false));
    }
    if (e.pointerType !== "mouse") leave();
  }

  /** gather the hand into a deck, turning it face down as it comes together */
  function square() {
    if (squared) return;
    lean = idx.map(() => (Math.random() * 2 - 1) * 1.6);
    moving = true;
    squared = true;
    up = idx.map(() => false);
    over = null;
    play("square");
  }

  function spread() {
    squared = false;
    later(() => (moving = false), 520);
  }

  /** new cards, spread back out from the middle */
  function shuffle() {
    cards = deal();
    play("riffle");
    later(spread, 120);
  }

  function flip(i: number, e: MouseEvent) {
    if (eatClick || squared) return;
    up[i] = !up[i];
    flips[i]++;
    play("card", { x: e.clientX || undefined });
    if (up.every(Boolean)) {
      later(() => {
        wave = true;
        play("fanfare");
      }, 260);
      later(() => (wave = false), 1200);
    }
  }

  // S shuffles from the keyboard, the same as a hold
  function key(e: KeyboardEvent) {
    if (e.key !== "s" && e.key !== "S") return;
    if (e.metaKey || e.ctrlKey || e.altKey || squared) return;
    e.preventDefault();
    square();
    later(shuffle, 380);
  }

  const nameOf = (c: Card) =>
    t("toys.cardFan.cardName", { rank: t(`toys.cardFan.ranks.${c.r}`), suit: t(`toys.cardFan.suits.${c.s}`) });
</script>

<svelte:window onpointerup={release} onpointercancel={release} />

<div class="toy">
  <!-- the cards are the buttons; the group only listens for the pointer running along them and S from inside -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="fan"
    dir="ltr"
    class:moving
    class:squared
    class:wave
    class:hovering={over !== null}
    bind:this={fan}
    role="group"
    aria-label={t("toys.cardFan.groupAria")}
    aria-keyshortcuts="S"
    style:--top="{TOP}px"
    style:--h="{H}px"
    style:--pivot="{PIVOT * 100}%"
    onpointermove={move}
    onpointerdown={down}
    onpointerleave={leave}
    oncontextmenu={(e) => e.preventDefault()}
    onkeydown={key}
  >
    {#each idx as i (i)}
      {@const c = cards[i]}
      <button
        type="button"
        class="card"
        style:--a="{angle(i)}deg"
        style:--lift="{lift(i)}px"
        style:--i={i}
        style:--from={Math.abs(i - MID)}
        style:z-index={i}
        data-sound="none"
        aria-label={up[i] ? t("toys.cardFan.faceUp", { name: nameOf(c) }) : t("toys.cardFan.faceDown")}
        onclick={(e) => flip(i, e)}
        onfocus={() => (over = i)}
        onblur={leave}
      >
        <span class="hop" class:fa={flips[i] % 2 === 1} class:fb={flips[i] > 0 && flips[i] % 2 === 0}>
          <span class="turn" class:up={up[i]}>
            <span class="face" class:red={c.s === 1 || c.s === 2} aria-hidden="true">
              {#each ["", "down"] as end (end)}
                <span class="corner {end}" class:ten={c.r === 8}>{RANKS[c.r]}<br />{SUITS[c.s]}</span>
              {/each}
              {#if c.r === 12}
                <span class="ace" class:spade={c.s === 0}>{SUITS[c.s]}</span>
              {:else if c.r >= 9}
                <!-- a court card: the figure's frame, the letter and its suit, mirrored top to bottom -->
                <span class="court">
                  <i>{SUITS[c.s]}</i>
                  <b>{RANKS[c.r]}</b>
                  <i class="down">{SUITS[c.s]}</i>
                </span>
              {:else}
                {#each LAYOUT[c.r + 2] as [col, t], k (k)}
                  <span class="pip" class:down={t > 0.5} style:left="{COLS[col]}%" style:top="{20 + t * 60}%">{SUITS[c.s]}</span>
                {/each}
              {/if}
            </span>
            <!-- the back: a white border, a fine lattice, the house seal -->
            <span class="back" aria-hidden="true"><i class="seal">♠︎<b>♥︎</b></i></span>
          </span>
        </span>
      </button>
    {/each}
  </div>
  <p class="hint">{t("toys.cardFan.hint")}</p>
</div>

<style>
  .fan {
    position: relative;
    width: 216px;
    height: calc(var(--top) + var(--h) + 22px);
    /* a finger can run along the hand without the page scrolling sideways */
    touch-action: pan-y;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
  }
  .card {
    all: unset;
    position: absolute;
    top: var(--top);
    left: calc(50% - 25px);
    width: 50px;
    height: var(--h);
    border-radius: 3.5px;
    cursor: pointer;
    transform-origin: 50% var(--pivot);
    transform: rotate(var(--a)) translateY(calc(var(--lift) * -1));
    transition: transform 180ms var(--ease-out-expo);
  }
  /* gathering and spreading: slower, and from the middle out */
  .moving .card {
    transition-duration: 460ms;
    transition-delay: calc(var(--from) * 28ms);
  }
  .squared .card {
    cursor: grabbing;
  }
  .card:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
  .hop {
    position: absolute;
    inset: 0;
    perspective: 500px;
    transition: scale 140ms var(--ease-out);
  }
  /* pressed: the card gives a little under the thumb */
  .card:active .hop {
    scale: 0.96;
  }
  .squared .hop {
    scale: 0.97;
  }
  .turn {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
    transform: rotateY(180deg);
    transition: transform 440ms var(--ease-out-expo);
  }
  .turn.up {
    transform: rotateY(0deg);
  }
  /* card stock: a paper edge, a shadow on the card under it that opens up as
     the card rises off the hand (light from the upper left), and the sheen
     of the coating, which stays put while the card turns */
  .face,
  .back {
    --stock: oklch(98.2% 0.005 90);
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    border: 0.5px solid oklch(76% 0.006 90);
    border-radius: 3.5px;
    backface-visibility: hidden;
    overflow: hidden;
    box-shadow:
      0.5px 0.5px 1px oklch(10% 0 0 / 0.22),
      calc(1px + var(--lift) * 0.25) calc(1.5px + var(--lift) * 0.4) calc(4px + var(--lift) * 0.5) calc(-1px) oklch(10% 0 0 / 0.3);
    transition: box-shadow 180ms var(--ease-out-expo);
  }
  .face::after,
  .back::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(118deg, oklch(100% 0 0 / 0.5), oklch(100% 0 0 / 0) 34%, oklch(0% 0 0 / 0) 70%, oklch(0% 0 0 / 0.06));
    pointer-events: none;
  }
  .face {
    background: var(--stock);
    color: oklch(22% 0 0);
    font-family: var(--font);
  }
  .face.red {
    color: oklch(50% 0.19 27);
  }
  .corner {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 10px;
    font-size: 10px;
    font-weight: bold;
    line-height: 1;
    text-align: center;
  }
  .corner.ten {
    letter-spacing: -0.12em;
    text-indent: -0.12em;
  }
  .corner.down {
    top: auto;
    left: auto;
    right: 3px;
    bottom: 3px;
    rotate: 180deg;
  }
  .pip {
    position: absolute;
    font-size: 11px;
    line-height: 1;
    translate: -50% -50%;
  }
  .pip.down,
  .court .down {
    rotate: 180deg;
  }
  .ace {
    position: absolute;
    left: 50%;
    top: 50%;
    translate: -50% -50%;
    font-size: 22px;
    line-height: 1;
  }
  /* the ace of spades is the big one, like every deck prints it */
  .ace.spade {
    font-size: 34px;
  }
  .court {
    position: absolute;
    inset: 12px 11px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 1px 0;
    border: 0.5px solid currentColor;
    background:
      linear-gradient(to bottom right, transparent calc(50% - 0.3px), color-mix(in oklch, currentColor 35%, transparent) 50%, transparent calc(50% + 0.3px)),
      oklch(94% 0.04 85);
  }
  .court i {
    font-style: normal;
    font-size: 8px;
    line-height: 1;
  }
  .court b {
    font: normal 24px/1 var(--font-serif);
  }
  /* the back: a white border round a fine lattice in the house felt, with
     the logo's suits in a seal in the middle */
  .back {
    transform: rotateY(180deg);
    padding: 3px;
    background:
      repeating-linear-gradient(60deg, oklch(from var(--felt) calc(l + 0.12) c h / 0.7) 0 0.6px, transparent 0.6px 3.4px) content-box,
      repeating-linear-gradient(-60deg, oklch(from var(--felt) calc(l + 0.12) c h / 0.7) 0 0.6px, transparent 0.6px 3.4px) content-box,
      linear-gradient(var(--felt), var(--felt)) content-box,
      var(--stock);
  }
  .back::before {
    content: "";
    position: absolute;
    inset: 5px;
    border: 0.5px solid oklch(from var(--stock) l c h / 0.6);
    border-radius: 1.5px;
  }
  .seal {
    position: absolute;
    left: 50%;
    top: 50%;
    translate: -50% -50%;
    padding: 3px 4px;
    border-radius: 50%;
    border: 0.5px solid oklch(from var(--felt) calc(l - 0.1) c h);
    background: var(--stock);
    color: oklch(22% 0 0);
    font: normal 8px/1 var(--font);
    letter-spacing: -0.05em;
  }
  .seal b {
    font-weight: normal;
    color: oklch(50% 0.19 27);
  }
  /* turned over: the card comes up off the hand toward you as it goes, and
     back down. two copies so the next turn restarts it */
  .hop.fa {
    animation: turn-a 440ms var(--ease-out-expo);
  }
  .hop.fb {
    animation: turn-b 440ms var(--ease-out-expo);
  }
  @keyframes turn-a {
    35% {
      translate: 0 -4px;
      scale: 1.07;
    }
  }
  @keyframes turn-b {
    35% {
      translate: 0 -4px;
      scale: 1.07;
    }
  }
  /* the whole hand face up: a ripple runs along it */
  .wave .hop {
    animation: hop 700ms var(--ease-out-expo) calc(var(--i) * 45ms);
  }
  @keyframes hop {
    35% {
      translate: 0 -9px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .card,
    .turn,
    .hop,
    .face,
    .back {
      transition: none;
    }
    .wave .hop,
    .hop.fa,
    .hop.fb {
      animation: none;
    }
  }
</style>

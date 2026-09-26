<script lang="ts">
  import type { ChipDef } from "$lib/types";
  import { edgeInserts, faceText } from "$lib/chips";
  import { reducedMotion } from "$lib/motion";
  import { t } from "$lib/i18n";
  import ChipFace from "./ChipFace.svelte";

  // a chip on the table, seen from a little above: its face (ChipFace.svelte)
  // and under it the front of its edge, a band with the edge inserts that face
  // the viewer. `rest` is how far it's turned where it lies (a chip tossed on
  // the felt never lands square); `shadow` off leaves the shadow to whatever
  // it's lying on (Chip Sort draws its own, so it stays down while a chip hops).
  let {
    chip,
    size = 48,
    text,
    spin = true,
    rest = 0,
    shadow = true,
  }: { chip: ChipDef; size?: number; text?: string; spin?: boolean; rest?: number; shadow?: boolean } = $props();

  const uid = $props.id();

  // ---- lying on the table ----
  // the whole chip is tilted back (TILT: how round the face still looks, 1 =
  // straight down on it), so the face is an ellipse and the front of its edge
  // shows under it, EDGE face units thick. a real chip is about 8.5% as thick
  // as it is wide, and tipped back this far only a bit over half of that edge
  // faces us; any more and one chip reads as two stacked. everything inside
  // the tilt, the spin included, happens in the
  // chip's own flat coordinates, so a spinning face turns in perspective.
  // lifted so the tilted chip and its edge sit centered in the square.
  const TILT = 0.82;
  const EDGE = 6;
  const LIFT = ((49 + EDGE) * TILT - 49 * TILT) / 2;
  const R = 49;
  const edgePath = `M ${-R},0 A ${R} ${R} 0 0 0 ${R},0 L ${R},${EDGE} A ${R} ${R} 0 0 1 ${-R},${EDGE} Z`;
  // ---- the spin ----
  // a flick of the finger: the chip turns on the table, fast off the mark, long
  // slow settle. `turn` drives the face and the inserts on the edge together, so
  // the edge rolls round with the face. pointing at it spins it (a mouse), and
  // toys.ts sends "chipspin" when a finger taps it.
  let turn = $state(0);
  let svg = $state<SVGSVGElement>();
  let spinning = 0;
  const SPIN_MS = 900;
  function spinOnce() {
    if (!spin || spinning || reducedMotion()) return;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / SPIN_MS);
      turn = 360 * (t === 1 ? 1 : 1 - 2 ** (-10 * t)); // ease-out-expo
      if (t < 1) spinning = requestAnimationFrame(step);
      else {
        turn = 0;
        spinning = 0;
      }
    };
    spinning = requestAnimationFrame(step);
  }
  $effect(() => {
    const el = svg;
    if (!el) return;
    el.addEventListener("chipspin", spinOnce);
    return () => {
      el.removeEventListener("chipspin", spinOnce);
      cancelAnimationFrame(spinning);
    };
  });
  const hover = (e: PointerEvent) => e.pointerType === "mouse" && spinOnce();

  // the inserts round the edge, turned with the face so it rolls round with it
  const inserts = $derived(edgeInserts(chip, rest + turn));
  const label = $derived(text ?? faceText(chip));
</script>

<!-- data-v: tapped, a chip clacks on its own note (toys.ts) -->
<svg
  bind:this={svg}
  class="chip inline-block flex-none align-middle overflow-visible"
  class:spin
  onpointerenter={hover}
  data-v={chip.value}
  width={size}
  height={size}
  viewBox="-50 -50 100 100"
  role="img"
  aria-label={t("chips.chipAriaLabel", { label, value: chip.value })}
>
  <title>{t("chips.chipTitle", { label, value: chip.value })}</title>
  <defs>
    <clipPath id="{uid}-edge"><path d={edgePath} /></clipPath>
    <!-- the edge is round and faces out, not up, so it's a shade darker than
         the face: darkest at the sides, a soft light just left of center -->
    <linearGradient id="{uid}-round">
      <stop offset="0" stop-color="#000" stop-opacity="0.46" />
      <stop offset="0.2" stop-color="#000" stop-opacity="0.12" />
      <stop offset="0.4" stop-color="#fff" stop-opacity="0.1" />
      <stop offset="0.62" stop-color="#000" stop-opacity="0.1" />
      <stop offset="1" stop-color="#000" stop-opacity="0.5" />
    </linearGradient>
    <radialGradient id="{uid}-shade">
      <stop offset="0" stop-color="#000" stop-opacity="0.35" />
      <stop offset="1" stop-color="#000" stop-opacity="0" />
    </radialGradient>
    <!-- light from above and to the left, across the face -->
    <radialGradient id="{uid}-lit" cx="0.34" cy="0.22" r="0.8">
      <stop offset="0" stop-color="#fff" stop-opacity="0.2" />
      <stop offset="0.55" stop-color="#fff" stop-opacity="0" />
      <stop offset="1" stop-color="#000" stop-opacity="0.12" />
    </radialGradient>
  </defs>

  <!-- its shadow on the table, falling away from the light: down and right -->
  {#if shadow}<ellipse cx="5" cy={(49 + EDGE) * TILT - LIFT - 1} rx="50" ry="9" fill="url(#{uid}-shade)" />{/if}
  <g transform="translate(0 {-LIFT}) scale(1 {TILT})">
  <g clip-path="url(#{uid}-edge)">
    <rect x="-50" y="0" width="100" height="60" fill={chip.color} />
    {#each inserts as s, i (i)}<rect x={s.x} y="0" width={s.w} height="60" fill={s.color} />{/each}
    <rect x="-50" y="0" width="100" height="60" fill="url(#{uid}-round)" />
  </g>
  <path d={edgePath} fill="none" stroke="rgb(0 0 0 / 0.45)" stroke-width="1.2" />

  <!-- the face: what spins -->
  <ChipFace {chip} {text} {size} turn={rest + turn} id={uid} />

  <!-- the light stays where it is while the face turns under it -->
  <circle r="49" fill="url(#{uid}-lit)" />
  <circle r="49" fill="none" stroke="rgb(0 0 0 / 0.4)" stroke-width="1.2" />
  </g>
</svg>

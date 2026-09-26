<svelte:options namespace="svg" />

<script lang="ts">
  import type { ChipDef } from "$lib/types";
  import { faceInk, faceText, FACE_DEFAULTS } from "$lib/chips";

  // a chip's face, flat, in a -50..50 box (radius 49 = the chip's edge), drawn
  // after the real chip families. Chip.svelte tilts it onto the table and
  // ChipStack.svelte sets it on top of a stack. face proportions were measured
  // off the manufacturers' product photos.
  //  basic:      dice chips: 6 edge inserts, a dashed ring, dice pips between the inserts
  //  montecarlo: 6 three-part edge inserts (side, center, side) with crowns between,
  //              a ring in the side color, a gold glitter ring, a silver label
  //  delsol:     casino del sol: a white face; a thin colored rim of 4 long arcs and
  //              4 white inserts (each with a colored block), red ring text, laurel, stars
  let { chip, text, detail, turn = 0, id }: { chip: ChipDef; text?: string; detail: boolean; turn?: number; id: string } = $props();

  const style = $derived(chip.style ?? "basic");
  const label = $derived(text ?? faceText(chip));
  const a2 = $derived(chip.accent2 || chip.accent);
  const inlay = $derived(chip.inlay || FACE_DEFAULTS[style].inlay);
  const ink = $derived(chip.ink || (style === "basic" ? faceInk(chip.color) : "#222"));
  const trim = $derived(chip.trim || FACE_DEFAULTS[style].trim);

  const SIZES = { basic: [24, 22, 19, 16, 13, 11], montecarlo: [24, 22, 19, 16, 13.5, 11.5], delsol: [28, 26, 22, 18, 15, 12] };
  const fs = $derived(SIZES[style][Math.min(Math.max(label.length, 1), 6) - 1]);

  // an arc for text, `from` and `to` in degrees clockwise from the top
  const arc = (r: number, from: number, to: number, sweep = 1) => {
    const p = (deg: number) => `${(r * Math.sin((deg * Math.PI) / 180)).toFixed(2)},${(-r * Math.cos((deg * Math.PI) / 180)).toFixed(2)}`;
    // the span in the direction of travel (clockwise for sweep 1)
    const span = sweep ? (to - from + 360) % 360 : (from - to + 360) % 360;
    const large = span > 180 ? 1 : 0;
    return `M ${p(from)} A ${r},${r} 0 ${large},${sweep} ${p(to)}`;
  };
  const six = [0, 1, 2, 3, 4, 5];

  // casino del sol rim: the band is the outer 9.5% of the chip. going round from
  // the top, every 90°: a 10° colored block, 15° white, a 50° colored arc, 15° white
  const RIM = 46.65;
  const deg = (2 * Math.PI * RIM) / 360;
  const rimDash = `${15 * deg} ${50 * deg} ${15 * deg} ${10 * deg}`;
  const rimOffset = 85 * deg;

  // dice pips for faces 1 to 6, on a 3x3 grid (-1, 0, 1)
  const PIPS: [number, number][][] = [
    [[0, 0]],
    [[-1, -1], [1, 1]],
    [[-1, -1], [0, 0], [1, 1]],
    [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
    [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
  ];
</script>

<defs><clipPath id="{id}-c"><circle r="49" /></clipPath></defs>
<g transform={turn ? `rotate(${turn.toFixed(2)})` : undefined}>
  {#if style === "delsol"}
    <!-- the face is the big white label; only the rim shows the chip's color -->
    <circle r="49" fill={inlay} />
    <circle r={RIM} fill="none" stroke={chip.color} stroke-width="4.8" />
    <circle r={RIM} fill="none" stroke={chip.accent} stroke-width="5" stroke-dasharray={rimDash} stroke-dashoffset={rimOffset} />
    {#if detail}
      <!-- laurel + shield, the pale green of the real print -->
      <g fill="none" stroke="#acd7ab" stroke-width="3.4" stroke-dasharray="3 1.5">
        <path d="M -6,24 C -26,18 -29,-4 -18,-21" />
        <path d="M 6,24 C 26,18 29,-4 18,-21" />
      </g>
      <path d="M -9.5,-15 L 9.5,-15 L 9.5,2 C 9.5,9.5 0,13.5 0,13.5 C 0,13.5 -9.5,9.5 -9.5,2 Z" fill="#c3e3c1" />
      <path id="{id}-r" d={arc(35.6, 214, 146)} fill="none" />
      <text class="ring serif" fill={trim} font-size="6.4">
        <textPath href="#{id}-r" textLength={35.6 * ((292 * Math.PI) / 180)} lengthAdjust="spacingAndGlyphs">CASINO DEL SOL LAS VEGAS • CASINO DEL SOL LAS VEGAS</textPath>
      </text>
      <text fill="#111" font-size="7" y="38.5" text-anchor="middle">★ ★ ★</text>
    {/if}
    <text class="denom serif italic" fill={ink} font-size={fs} dy="0.35em">{label}</text>
  {:else}
    <circle r="49" fill={chip.color} />

    <g clip-path="url(#{id}-c)">
      {#if style === "montecarlo"}
        <!-- six inserts: side, center, side, from 81% of the radius out -->
        {#each six as k (k)}
          <g transform="rotate({k * 60 + 30})">
            <rect x="-11.7" y="-50" width="7.2" height="10.3" fill={a2} />
            <rect x="-4.6" y="-50" width="9.2" height="10.3" rx="1.6" fill={chip.accent} />
            <rect x="4.5" y="-50" width="7.2" height="10.3" fill={a2} />
          </g>
          {#if detail}
            <!-- the molded crown between inserts -->
            <path transform="rotate({k * 60})" d="M -3,-41.4 L -3.4,-45.6 L -1.6,-43.8 L 0,-46.2 L 1.6,-43.8 L 3.4,-45.6 L 3,-41.4 Z" fill={a2} opacity="0.75" />
          {/if}
        {/each}
      {:else}
        <!-- dice chips: six inserts at the edge -->
        {#each six as k (k)}
          <rect x="-7" y="-50" width="14" height="10.5" fill={chip.accent} transform="rotate({k * 60})" />
          {#if detail}
            <g transform="rotate({k * 60 + 30}) translate(0,-41)">
              {#each PIPS[k] as [px, py], i (i)}<circle cx={px * 2.1} cy={py * 2.1} r="0.95" fill={chip.accent} />{/each}
            </g>
          {/if}
        {/each}
      {/if}
    </g>

    {#if style === "montecarlo"}
      <!-- a ring in the side color, the gold glitter ring, then the silver label -->
      <circle r="32.85" fill="none" stroke={a2} stroke-width="3.9" />
      <circle r="28.2" fill="none" stroke={trim} stroke-width="4.4" />
      {#if detail}<circle r="28.2" fill="none" stroke="rgb(255 255 255 / 0.4)" stroke-width="4.4" stroke-dasharray="0.8 1.6" />{/if}
      <circle r="26" fill={inlay} />
      {#if detail}
        <path id="{id}-t" d={arc(20.2, 274, 86)} fill="none" />
        <path id="{id}-b" d={arc(24.1, 248, 112, 0)} fill="none" />
        <text class="print serif" fill={ink} font-size="4.9"><textPath href="#{id}-t" startOffset="50%" text-anchor="middle">MONTE CARLO</textPath></text>
        <text class="print serif" fill={ink} font-size="4.9"><textPath href="#{id}-b" startOffset="50%" text-anchor="middle">POKER CLUB</textPath></text>
      {/if}
      <text class="denom serif" fill={ink} font-size={fs} dy="0.35em">{label}</text>
    {:else}
      <circle r="31" fill="none" stroke={chip.accent} stroke-width="1.6" stroke-dasharray="4 3" />
      <text class="denom" fill={ink} font-size={fs} dy="0.35em">{label}</text>
    {/if}
  {/if}
</g>

<style>
  .denom {
    font-family: var(--font);
    font-weight: bold;
    text-anchor: middle;
    letter-spacing: -0.03em;
  }
  .serif {
    font-family: var(--font-serif);
  }
  .italic {
    font-style: italic;
  }
  .ring {
    font-family: var(--font);
    font-weight: bold;
    letter-spacing: 0.02em;
  }
  .print {
    font-weight: bold;
    letter-spacing: 0.06em;
  }
</style>

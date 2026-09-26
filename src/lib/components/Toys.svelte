<script lang="ts">
  // the home page's desk toys: one at a time, a different one each visit, and
  // the button moves on to the next. all of them are for fidgeting; nothing is
  // kept. each toy's code only comes down when it's first shown (the next one
  // is fetched ahead, so the button never waits), and on a phone too narrow
  // for the toys' box the whole box shrinks to fit rather than run off the page.
  import type { Component } from "svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Shuffle from "@lucide/svelte/icons/shuffle";
  import { fly } from "svelte/transition";
  import { play } from "$lib/sound";
  import { rise } from "$lib/motion";
  import { t } from "$lib/i18n";

  type Load = () => Promise<{ default: Component }>;
  /** nameKey points at toys.widget.names.* so the label follows the current language */
  const TOYS: { nameKey: string; load: Load }[] = [
    { nameKey: "toys.widget.names.cards", load: () => import("./CardFan.svelte") },
    { nameKey: "toys.widget.names.moneyCounter", load: () => import("./MoneyCounter.svelte") },
    { nameKey: "toys.widget.names.chipSort", load: () => import("./ChipSort.svelte") },
    { nameKey: "toys.widget.names.dice", load: () => import("./DiceCup.svelte") },
    { nameKey: "toys.widget.names.roulette", load: () => import("./RouletteWheel.svelte") },
  ];
  /** the toys' box: every toy fits it, so swapping one never moves the page */
  const W = 290;
  const H = 150;

  let at = $state(Math.floor(Math.random() * TOYS.length));
  let turns = $state(0);
  let ready = $state.raw<(Component | undefined)[]>([]);

  function fetchToy(i: number) {
    if (ready[i]) return Promise.resolve();
    return TOYS[i].load().then((m) => {
      const next = [...ready];
      next[i] = m.default;
      ready = next;
    });
  }
  $effect(() => {
    const i = at;
    fetchToy(i).then(() => fetchToy((i + 1) % TOYS.length));
  });
  const Toy = $derived(ready[at]);

  // the next one along, round to the first after the last
  function next() {
    at = (at + 1) % TOYS.length;
    turns++;
    play("riffle");
  }

  // narrower than the box: shrink it all to fit. zoom (not a transform) so the
  // toys' own pointer maths still lines up with what's drawn
  let width = $state(W);
  const zoom = $derived(Math.min(1, width / W));
</script>

<div class="toys flex flex-col items-center gap-1 w-full max-w-[var(--w,290px)] mx-auto my-0" bind:clientWidth={width}>
  <div class="stage grid w-[var(--w)] h-[var(--h)]" style:zoom={zoom < 1 ? zoom : null} style:--w="{W}px" style:--h="{H}px">
    {#key at}
      {#if Toy}
        <div class="slot [grid-area:1/1] grid place-items-center" in:fly={rise(10)}>
          <Toy />
        </div>
      {/if}
    {/key}
  </div>
  <button class="icon-btn next self-end" data-sound="none" onclick={next} title={t("toys.widget.next")} aria-label={t("toys.widget.nextAria", { name: t(TOYS[at].nameKey) })}>
    <span class="grid" style:rotate="{turns * 180}deg"><Icon icon={Shuffle} /></span>
  </button>
</div>

<style>
  /* every toy: its table, and the hint under it */
  .slot > :global(.toy) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  /* a half turn each press */
  .next span {
    transition: rotate var(--dur-pop) var(--ease-out-expo);
  }
  @media (prefers-reduced-motion: reduce) {
    .next span {
      transition: none;
    }
  }
  /* always a clear gap under the toy, however far its table reaches */
  .toys :global(.hint) {
    margin: 6px 0 0;
    font-size: var(--fs-xs);
    color: var(--muted);
    transition: opacity var(--dur-move) var(--ease-out);
  }
  /* on a mouse, the hint steps back until the toy is touched */
  @media (hover: hover) {
    .toys :global(.hint) {
      opacity: 0;
    }
    .stage:hover :global(.hint),
    .stage:focus-within :global(.hint) {
      opacity: 1;
    }
  }
</style>

<script lang="ts">
  // what the cues put on screen (cues.svelte.ts): the toast over a dimmed
  // board, and the flare round the edge of the screen
  import Icon from "../Icon.svelte";
  import { fade } from "svelte/transition";
  import { leave } from "$lib/motion";
  import { NEWS, type Cues } from "./cues.svelte";

  let { cues }: { cues: Cues } = $props();
</script>

{#if cues.toast}
  {#key cues.toast.at}
    <div class="tv-scrim" aria-hidden="true" out:fade={leave()}></div>
    <div class="tv-toast is-{cues.toast.kind}" role="status" out:fade={leave()}>
      <span class="t-icon"><Icon icon={NEWS[cues.toast.kind].icon} size="0.9em" /></span>{cues.toast.text}
    </div>
  {/key}
{/if}

{#if cues.flare}
  {#key cues.flare.key}<div class="flare" style:--flare={cues.flare.color} style:--n={cues.flare.n} aria-hidden="true"></div>{/key}
{/if}

<style>
  /* ---------- the flare: the screen's edge glows in the moment's color ----------
     the visual half of every sound. opacity only (no movement), and at most
     about one pulse a second, so it stays on under reduced motion and well
     clear of anything that could trouble photosensitive viewers. */
  .flare {
    position: fixed;
    inset: 0;
    z-index: 5;
    pointer-events: none;
    opacity: 0;
    box-shadow:
      inset 0 0 0 max(6px, calc(var(--u) * 0.7)) var(--flare),
      inset 0 0 calc(var(--u) * 9) calc(var(--u) * 1.5) color-mix(in oklch, var(--flare) 45%, transparent);
    animation: flare 720ms var(--ease-out) var(--n);
  }
  :global(:root .tv) .flare {
    animation-duration: 720ms !important;
    animation-iteration-count: var(--n) !important;
  }
  @keyframes flare {
    12% {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  /* ---------- the toast ---------- */
  /* while news is up the board steps back, so the chalk toast never runs into
     the chalk clock under it. no border needed to hold it apart. */
  .tv-scrim {
    position: fixed;
    inset: 0;
    background: color-mix(in oklch, var(--tv-bg) 50%, transparent);
    animation: dim 0.45s var(--ease-out);
  }
  @keyframes dim {
    from {
      opacity: 0;
    }
  }
  .tv-toast {
    position: fixed;
    left: 50%;
    top: 42%;
    transform: translate(-50%, -50%);
    background: var(--tv-fg);
    color: var(--tv-bg);
    font: bold max(24px, calc(var(--u) * 4.6)) / 1.1 var(--font);
    padding: calc(var(--u) * 1.8) calc(var(--u) * 3);
    animation: pop 0.45s var(--ease-out-expo);
    text-align: center;
    /* centered by translate, so it would only get half the screen to wrap in */
    width: max-content;
    max-width: min(80vw, 22em);
    text-wrap: balance;
  }
  @keyframes pop {
    from {
      transform: translate(-50%, -50%) scale(0.85);
      opacity: 0;
    }
  }
  /* each kind of news arrives its own way: a bust slams down like a stamp,
     money and the winner rise, a shuffle is dealt in from the side */
  .tv-toast:is(.is-bust, .is-bomb) {
    animation: slam 0.5s var(--ease-out-expo);
  }
  @keyframes slam {
    from {
      transform: translate(-50%, -50%) scale(1.3) rotate(-3deg);
      opacity: 0;
    }
    55% {
      opacity: 1;
    }
  }
  .tv-toast:is(.is-win, .is-money, .is-deal) {
    animation: lift 0.7s var(--ease-out-expo);
  }
  @keyframes lift {
    from {
      transform: translate(-50%, -20%);
      opacity: 0;
    }
  }
  /* a bounty is an envelope torn open: it flips up toward the room */
  .tv-toast.is-bounty {
    animation: unseal 0.8s var(--ease-out-expo);
  }
  @keyframes unseal {
    from {
      transform: translate(-50%, -50%) perspective(40em) rotateX(75deg);
      opacity: 0;
    }
  }
  .tv-toast:is(.is-shuffle, .is-draw) {
    animation: deal 0.6s var(--ease-out-expo);
  }
  @keyframes deal {
    from {
      transform: translate(-90%, -65%) rotate(-7deg);
      opacity: 0;
    }
  }
  .t-icon {
    display: inline-block;
    margin-right: 0.4em;
    vertical-align: -0.06em;
    line-height: 0;
    animation: icon-in 0.55s var(--ease-out-expo) 0.14s backwards;
  }
  @keyframes icon-in {
    from {
      transform: scale(0.3) rotate(-25deg);
      opacity: 0;
    }
  }
</style>

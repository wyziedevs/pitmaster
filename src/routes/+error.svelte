<script lang="ts">
  import { page } from "$app/state";
  import Icon from "$lib/components/Icon.svelte";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import { play } from "$lib/sound";

  const lost = $derived(page.status === 404);
  // the status code, dealt as three cards
  const cards = $derived(
    String(page.status)
      .split("")
      .map((rank, i) => ({ rank, suit: ["♠", "♥", "♣"][i % 3], red: i % 3 === 1 }))
  );

  // a pointer running over the fan plucks each card's edge, a note a card
  function strum(e: PointerEvent, i: number) {
    if (e.pointerType === "mouse") play("strum", { n: i * 2 });
  }
</script>

<svelte:head><title>{lost ? "Page Not Found" : "Error"} · PitMaster</title></svelte:head>

<!-- a press squares the cards up (and sounds like it); let go and they fan out
     again. a toy, hidden from screen readers: there's nothing here to reach by keyboard -->
<div class="hand" aria-hidden="true" data-sound="square">
  {#each cards as c, i (i)}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <span class="card" class:red={c.red} style:--i={i} style:--lift={Math.abs(i - 1)} onpointerenter={(e) => strum(e, i)}>
      <span class="corner">{c.rank}<br />{c.suit}</span>
      <span class="pip">{c.suit}</span>
    </span>
  {/each}
</div>

<h1>{lost ? "Misdeal." : "Something Broke."}</h1>
<p class="muted">
  {#if lost}There's no page at this address. It may have moved, or the link has a typo.{:else}{page.error?.message ?? "Try that again."}{/if}
</p>
<p><a class="btn" href="/"><Icon icon={ArrowLeft} />Back to Games</a></p>

<style>
  .hand {
    display: flex;
    margin: 12px 0 22px 8px;
  }
  /* plain white cards, dealt one after another into a loose fan */
  .card {
    position: relative;
    width: 64px;
    height: 90px;
    margin-left: -8px;
    background: var(--field);
    border: var(--hair) solid var(--line-strong);
    border-radius: 5px;
    font: bold 17px/1.05 var(--font-serif);
    color: var(--fg);
    transform: rotate(calc((var(--i) - 1) * 7deg)) translateY(calc(var(--lift) * 4px));
    animation: deal var(--dur-settle) var(--ease-out-expo) backwards;
    animation-delay: calc(var(--i) * 90ms + 60ms);
    transition: transform var(--dur-move) var(--ease-out-expo);
  }
  .card.red {
    color: var(--accent);
  }
  .corner {
    position: absolute;
    top: 5px;
    left: 7px;
    text-align: center;
  }
  .pip {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 30px;
  }
  @media (hover: hover) {
    .hand:hover .card {
      transform: rotate(calc((var(--i) - 1) * 11deg)) translateY(calc(var(--lift) * 6px));
    }
  }
  /* squared up: every card slides onto the middle one (a card's width, less
     the overlap) */
  .hand {
    user-select: none;
  }
  .hand:active .card {
    transform: translateX(calc((1 - var(--i)) * (64px - 8px)));
    transition-duration: var(--dur-press);
  }
  @keyframes deal {
    from {
      opacity: 0;
      transform: translate(80px, -30px) rotate(20deg);
    }
  }
</style>

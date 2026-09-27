<script lang="ts">
  // the board's top line: the logo, the game's name, what it is, and the time
  import { timeOfDay } from "$lib/util";
  import { time } from "$lib/now.svelte";

  let { name, meta, turned }: { name: string; meta: string; turned: boolean } = $props();
</script>

<header>
  <!-- the logo's suits, turning over every time the level goes up -->
  <span class="suits" class:turned aria-hidden="true">
    <span class="sw"><span>♠</span><span class="red">♦</span></span><span class="sw"><span class="red">♥</span><span>♣</span></span>
  </span>
  <span class="name">{name}</span>
  <span class="meta">{meta}</span>
  <span class="tod fig">{timeOfDay(time.now)}</span>
</header>

<style>
  .fig {
    font-family: var(--font);
    font-variant-numeric: tabular-nums;
  }
  header {
    grid-area: head;
    display: flex;
    gap: calc(var(--u) * 1.6);
    align-items: baseline;
    padding: calc(var(--u) * 1.1) calc(var(--u) * 2);
    border-bottom: var(--hair) solid var(--tv-line);
  }
  .name {
    font: calc(var(--u) * 2.3) / 1.1 var(--font-serif);
    letter-spacing: -0.01em;
  }
  /* the logo's suits: each is a window one glyph tall, and a new level rolls
     the other suit up into it (the site logo does the same on hover) */
  .suits {
    display: inline-flex;
    align-self: center;
    margin-right: calc(var(--u) * -0.9);
    font: calc(var(--u) * 2.1) / 1 var(--font-serif);
  }
  .sw {
    display: inline-flex;
    flex-direction: column;
    height: 1.15em;
    line-height: 1.15;
    overflow: hidden;
  }
  .sw > span {
    transition: transform 700ms var(--ease-out-expo);
  }
  .sw + .sw > span {
    transition-delay: 90ms;
  }
  .turned .sw > span {
    transform: translateY(-100%);
  }
  .red {
    color: var(--tv-hot);
  }
  .meta {
    color: var(--tv-muted);
    font-size: max(13px, calc(var(--u) * 1.35));
  }
  .tod {
    margin-left: auto;
    font-size: max(14px, calc(var(--u) * 1.7));
    font-weight: 700;
  }
  /* a phone, or any short screen (a phone on its side): one column that
     scrolls, clock first, so nothing gets cut off at the bottom */
  @media (max-width: 700px), (max-height: 500px) {
    header {
      flex-wrap: wrap;
      row-gap: 2px;
    }
    .name {
      flex: 1 1 auto;
    }
    .tod {
      white-space: nowrap;
    }
    .meta {
      order: 3;
      flex-basis: 100%;
    }
  }
</style>

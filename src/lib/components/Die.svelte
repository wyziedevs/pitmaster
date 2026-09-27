<script lang="ts">
  // one flat die, like the Dice toy's casino dice seen from above: red, with
  // white pips. with no value it's still under the cup (a plain face).
  let { value = null, size = "24px", dim = false, label = "" }: { value?: number | null; size?: string; dim?: boolean; label?: string } = $props();

  // pips on a 3x3 grid, by cell
  const PIPS = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];
  const on = $derived(new Set(value ? PIPS[value] : []));
</script>

<span class="die" class:dim class:hidden={!value} style:--s={size} role={label ? "img" : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : "true"}>
  {#each Array.from({ length: 9 }) as _, i (i)}<i class:on={on.has(i)}></i>{/each}
</span>

<style>
  .die {
    display: inline-grid;
    grid-template: repeat(3, 1fr) / repeat(3, 1fr);
    place-items: center;
    width: var(--s);
    height: var(--s);
    padding: calc(var(--s) * 0.12);
    box-sizing: border-box;
    border-radius: calc(var(--s) * 0.16);
    border: 1px solid oklch(36% 0.15 25);
    background: linear-gradient(145deg, oklch(56% 0.21 25), oklch(45% 0.19 25) 60%, oklch(39% 0.17 25));
    box-shadow: inset 0 0 1px 0.5px oklch(74% 0.16 30 / 0.55);
    flex: none;
  }
  .die i {
    width: calc(var(--s) * 0.18);
    height: calc(var(--s) * 0.18);
    border-radius: 50%;
  }
  .die i.on {
    background: radial-gradient(circle at 55% 60%, oklch(99% 0.003 25), oklch(90% 0.008 25) 70%);
  }
  /* under the cup: a die with its face hidden */
  .die.hidden {
    background: linear-gradient(145deg, oklch(48% 0.17 25), oklch(38% 0.15 25));
  }
  /* a die that's been lost, or a player who's out */
  .die.dim {
    filter: grayscale(1);
    opacity: 0.35;
  }
</style>

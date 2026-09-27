<script lang="ts">
  // one life, the way the game keeps them: a coin (31, screw your neighbor),
  // a card (knock-out whist) or a die (ship captain and crew). a lost one is
  // greyed out.
  import Die from "$lib/components/Die.svelte";

  let { token, size = "22px", dim = false }: { token: "coin" | "card" | "die"; size?: string; dim?: boolean } = $props();
</script>

{#if token === "die"}
  <Die {size} {dim} />
{:else}
  <span class="life {token}" class:dim style:--s={size} aria-hidden="true"></span>
{/if}

<style>
  .life {
    display: inline-block;
    flex: none;
    width: var(--s);
    height: var(--s);
  }
  /* a coin: brass, with a rim */
  .coin {
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, oklch(88% 0.12 90), oklch(70% 0.14 80) 55%, oklch(52% 0.12 70));
    box-shadow:
      inset 0 0 0 calc(var(--s) * 0.08) oklch(60% 0.12 75),
      inset 0 0 0 calc(var(--s) * 0.14) oklch(82% 0.12 88);
  }
  /* a card: its back, red with a white border */
  .card {
    width: calc(var(--s) * 0.72);
    border-radius: calc(var(--s) * 0.08);
    border: calc(var(--s) * 0.07) solid oklch(96% 0 0);
    background: repeating-linear-gradient(45deg, oklch(48% 0.18 25) 0 calc(var(--s) * 0.08), oklch(40% 0.16 25) calc(var(--s) * 0.08) calc(var(--s) * 0.16));
  }
  .dim {
    filter: grayscale(1);
    opacity: 0.3;
  }
</style>

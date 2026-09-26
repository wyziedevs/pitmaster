<script lang="ts">
  import { currencySymbol, money } from "$lib/util";

  // a tournament's house cut: a flat fee, a percent of what's left, or both.
  // the same fields, in the same words, for the default (Settings > Your Game)
  // and on a new game. onchange is for a caller that saves as it goes.
  let {
    fee = $bindable(),
    pct = $bindable(),
    buyIn,
    onchange,
  }: { fee: number; pct: number; buyIn: number; onchange?: () => void } = $props();

  const sym = $derived(currencySymbol());
  // the example uses the fee as set, or a round one until there is one
  const eg = $derived(fee || 5);
</script>

<div class="vstack cut">
  <div class="row">
    <label><span>Flat Fee per Entry {sym}</span><input type="number" min="0" step="any" max={buyIn} bind:value={fee} {onchange} /></label>
    <label><span>% of the Rest</span><input type="number" min="0" max="100" step="any" bind:value={pct} {onchange} /></label>
  </div>
  <p class="small muted">It comes out of each buy-in and rebuy before the prize pool: a {money(eg)} fee on a {money(buyIn)} buy-in puts {money(Math.max(0, buyIn - eg))} of it in the pool.</p>
</div>

<style>
  .cut label,
  .cut p {
    margin: 0;
  }
</style>

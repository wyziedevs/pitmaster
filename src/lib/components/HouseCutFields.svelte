<script lang="ts">
  import { currencySymbol, money } from "$lib/util";
  import { t } from "$lib/i18n";

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
    <label class="m-0"><span>{t("gamePlay.houseCut.flatFeeLabel", { sym })}</span><input type="number" min="0" step="any" max={buyIn} bind:value={fee} {onchange} /></label>
    <label class="m-0"><span>{t("gamePlay.houseCut.pctOfRestLabel")}</span><input type="number" min="0" max="100" step="any" bind:value={pct} {onchange} /></label>
  </div>
  <p class="small muted m-0">{t("gamePlay.houseCut.exampleNote", { fee: money(eg), buyIn: money(buyIn), net: money(Math.max(0, buyIn - eg)) })}</p>
</div>

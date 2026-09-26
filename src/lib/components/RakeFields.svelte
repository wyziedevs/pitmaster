<script lang="ts">
  import type { CashRake } from "$lib/types";
  import { currencySymbol } from "$lib/util";
  import { reveal, slide } from "$lib/motion";

  // a cash game's rake: how it's taken, how much, and who it's paid to. the
  // same fields, in the same words, for the default (Settings > Your Game) and
  // on a new game. onchange is for a caller that saves as it goes.
  let {
    mode = $bindable(),
    pct = $bindable(),
    cap = $bindable(),
    fee = $bindable(),
    house = $bindable(),
    onchange,
  }: { mode: CashRake["mode"]; pct: number; cap: number; fee: number; house: string; onchange?: () => void } = $props();

  const sym = $derived(currencySymbol());
  const paidTo = $derived(house.trim() || "the house");
</script>

<div class="vstack rake">
  <label>
    <span>How the House Gets Paid</span>
    <select bind:value={mode} {onchange}>
      <option value="pot">A Cut of Each Pot (Rake Box)</option>
      <option value="seat">A Seat Fee From Each Player</option>
      <option value="none">No Rake</option>
    </select>
  </label>
  {#if mode !== "none"}
    <div class="vstack" transition:slide={reveal()}>
      <div class="row">
        {#if mode === "pot"}
          <label><span>% of the Pot</span><input type="number" min="0" max="100" step="any" bind:value={pct} {onchange} /></label>
          <label><span>Max per Pot {sym}</span><input type="number" min="0" step="any" bind:value={cap} {onchange} /></label>
        {:else}
          <label><span>Seat Fee {sym}</span><input type="number" min="0" step="any" bind:value={fee} {onchange} /></label>
        {/if}
        <label><span>Paid To</span><input type="text" bind:value={house} {onchange} list="regulars" autocomplete="off" placeholder="The House" /></label>
      </div>
      <p class="small muted">
        {#if mode === "pot"}Drop the rake in a box as you go and enter it on the dealer screen. The bank counts it, and settle-up pays it to {paidTo}.
        {:else}Paid in cash, not chips. Settle-up adds it to what each player owes {paidTo}.{/if}
        If you're playing too, put your name in Paid To and it's folded into your numbers.
      </p>
    </div>
  {/if}
</div>

<style>
  /* the gaps space the fields, so labels drop their own margin */
  .rake label,
  .rake p {
    margin: 0;
  }
</style>

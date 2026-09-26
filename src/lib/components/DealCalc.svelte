<script lang="ts">
  // final table wants to chop? count the stacks, see what icm and a chip chop
  // pay, and take the one everyone agrees on. taking it ends the tournament.
  import Icon from "./Icon.svelte";
  import Handshake from "@lucide/svelte/icons/handshake";
  import type { Game } from "$lib/types";
  import { tourneyStats, takeDeal } from "$lib/game";
  import { icm, chipChop, roundDeal } from "$lib/deal";
  import { amt, money } from "$lib/util";
  import { bump, reveal, slide } from "$lib/motion";
  import { toast } from "$lib/toast.svelte";

  let { game = $bindable(), persist }: { game: Game; persist: () => void } = $props();

  const s = $derived(tourneyStats(game));
  const alive = $derived(game.players.filter((p) => !p.out));
  // what's left to win: the payout spots the survivors are still playing for
  const prizes = $derived(s.payouts.slice(0, alive.length).concat(Array(Math.max(0, alive.length - s.payouts.length)).fill(0)));
  const left = $derived(prizes.reduce((a, b) => a + b, 0));

  let stacks = $state<Record<string, number>>({});
  // everyone starts at an even share of the chips; count and fix from there
  $effect(() => {
    for (const p of alive) stacks[p.id] ??= Math.round(s.chipsInPlay / Math.max(1, alive.length));
  });

  const counted = $derived(alive.map((p) => Number(stacks[p.id]) || 0));
  const total = $derived(counted.reduce((a, b) => a + b, 0));
  const off = $derived(Math.round(total - s.chipsInPlay));
  // whole dollars, unless the pot is small enough that cents matter
  const unit = $derived(left >= 20 ? 1 : 0.01);
  const byIcm = $derived(roundDeal(icm(counted, prizes), unit));
  const byChop = $derived(roundDeal(chipChop(counted, prizes), unit));

  function take(kind: "icm" | "chop") {
    const pay = kind === "icm" ? byIcm : byChop;
    const names = alive.map((p, i) => `${p.name} ${money(pay[i])}`).join(", ");
    if (!confirm(`Take the ${kind === "icm" ? "ICM" : "chip chop"} deal and end the tournament?\n\n${names}`)) return;
    const amounts = Object.fromEntries(alive.map((p, i) => [p.id, pay[i]]));
    const chips = Object.fromEntries(alive.map((p, i) => [p.id, counted[i]]));
    takeDeal(game, kind, amounts, chips);
    persist();
    // the finished game rakes the pot over (TournamentControl), so this one stays quiet
    toast("Deal done. Results are in.", "info");
  }
</script>

<div class="deal">
  <p class="small muted">
    {alive.length} left, playing for {money(left)}. Count each stack. ICM weighs the pay jumps; a chip chop
    {#if prizes.at(-1)}gives everyone {money(prizes.at(-1) ?? 0)} and splits the rest{:else}splits it all{/if} by chips.
  </p>
  <div class="scroll-x">
    <table>
      <thead>
        <tr><th>Player</th><th class="num">Chips</th><th class="num">ICM</th><th class="num">Chip Chop</th></tr>
      </thead>
      <tbody>
        {#each alive as p, i (p.id)}
          <tr>
            <td>{p.name}</td>
            <td class="num"><input type="number" min="0" step="any" bind:value={stacks[p.id]} aria-label="{p.name}'s Chips" /></td>
            <td class="num"><span use:bump={byIcm[i]}>{money(byIcm[i])}</span></td>
            <td class="num"><span use:bump={byChop[i]}>{money(byChop[i])}</span></td>
          </tr>
        {/each}
        <tr class="total">
          <td>Total</td>
          <td class="num">
            {amt(total)}
            {#if off}<div class="small bad" transition:slide={reveal()}>{off > 0 ? "+" : ""}{amt(off)} vs chips in play</div>{/if}
          </td>
          <td class="num">{money(byIcm.reduce((a, b) => a + b, 0))}</td>
          <td class="num">{money(byChop.reduce((a, b) => a + b, 0))}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <!-- taking a deal ends the game, and that makes its own sound -->
  <div class="row">
    <button data-sound="none" onclick={() => take("icm")}><Icon icon={Handshake} />Take ICM Deal</button>
    <button data-sound="none" onclick={() => take("chop")}><Icon icon={Handshake} />Take Chip Chop</button>
  </div>
</div>

<style>
  .deal .scroll-x {
    margin-bottom: 10px;
  }
  /* room for a seven-digit stack, and narrow enough that the table fits a phone */
  .deal input {
    width: 80px;
    text-align: right;
  }
  .total td {
    font-weight: bold;
    border-bottom: 0;
  }
</style>

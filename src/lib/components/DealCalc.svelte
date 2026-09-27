<script lang="ts">
  // final table wants to chop? count the stacks, see what icm and a chip chop
  // pay, and take the one everyone agrees on. taking it ends the tournament.
  import Icon from "./Icon.svelte";
  import Handshake from "@lucide/svelte/icons/handshake";
  import type { Game } from "$lib/types";
  import type { TourneyBook } from "$lib/kinds/tournament/engine";
  import { takeDeal } from "$lib/kinds/tournament/actions";
  import { icm, chipChop, roundDeal } from "$lib/deal";
  import { amt, money } from "$lib/util";
  import { bump, reveal, slide } from "$lib/motion";
  import { toast } from "$lib/toast.svelte";
  import { t } from "$lib/i18n";

  let { game = $bindable(), persist, book: s }: { game: Game; persist: () => void; book: TourneyBook } = $props();

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
    const confirmMsg =
      kind === "icm" ? t("gamePlay.deal.takeIcmDealConfirm", { names }) : t("gamePlay.deal.takeChipChopDealConfirm", { names });
    if (!confirm(confirmMsg)) return;
    const amounts = Object.fromEntries(alive.map((p, i) => [p.id, pay[i]]));
    const chips = Object.fromEntries(alive.map((p, i) => [p.id, counted[i]]));
    takeDeal(game, kind, amounts, chips);
    persist();
    // the finished game rakes the pot over (TournamentControl), so this one stays quiet
    toast(t("gamePlay.deal.dealDoneToast"), "info");
  }
</script>

<div class="deal">
  <p class="small muted">
    {#if prizes.at(-1)}
      {t("gamePlay.deal.summaryWithPrize", { count: String(alive.length), amount: money(left), prize: money(prizes.at(-1) ?? 0) })}
    {:else}
      {t("gamePlay.deal.summaryNoPrize", { count: String(alive.length), amount: money(left) })}
    {/if}
  </p>
  <div class="scroll-x mb-2.5">
    <table>
      <thead>
        <tr><th>{t("gamePlay.deal.playerHeader")}</th><th class="num">{t("gamePlay.deal.chipsHeader")}</th><th class="num">{t("gamePlay.deal.icmHeader")}</th><th class="num">{t("gamePlay.deal.chipChopHeader")}</th></tr>
      </thead>
      <tbody>
        {#each alive as p, i (p.id)}
          <tr>
            <td>{p.name}</td>
            <td class="num"><input class="w-[80px] text-right" type="number" min="0" step="any" bind:value={stacks[p.id]} aria-label="{p.name} {t('gamePlay.deal.chipsHeader')}" /></td>
            <td class="num"><span use:bump={byIcm[i]}>{money(byIcm[i])}</span></td>
            <td class="num"><span use:bump={byChop[i]}>{money(byChop[i])}</span></td>
          </tr>
        {/each}
        <tr class="total">
          <td class="font-bold border-b-0">{t("gamePlay.deal.totalLabel")}</td>
          <td class="num font-bold border-b-0">
            {amt(total)}
            {#if off}<div class="small bad" transition:slide={reveal()}>{t("gamePlay.deal.offVsChips", { diff: `${off > 0 ? "+" : ""}${amt(off)}` })}</div>{/if}
          </td>
          <td class="num font-bold border-b-0">{money(byIcm.reduce((a, b) => a + b, 0))}</td>
          <td class="num font-bold border-b-0">{money(byChop.reduce((a, b) => a + b, 0))}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <!-- taking a deal ends the game, and that makes its own sound -->
  <div class="row">
    <button data-sound="none" onclick={() => take("icm")}><Icon icon={Handshake} />{t("gamePlay.deal.takeIcmDealButton")}</button>
    <button data-sound="none" onclick={() => take("chop")}><Icon icon={Handshake} />{t("gamePlay.deal.takeChipChopButton")}</button>
  </div>
</div>

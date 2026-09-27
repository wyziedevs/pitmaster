<script lang="ts">
  // the rake box on the dealer screen: a running total the host adds to as
  // chips come out of the pots, and a recount for when the box gets counted
  import Icon from "$lib/components/Icon.svelte";
  import Count from "$lib/components/Count.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import type { Game } from "$lib/types";
  import { bump } from "$lib/motion";
  import { money } from "$lib/util";
  import { t } from "$lib/i18n";
  import { cashRake, cashStats } from "./engine";

  let { game, house, add, recount }: { game: Game; house: string; add: (amount: number) => void; recount: (amount: number) => void } = $props();

  const r = $derived(cashRake(game));
  const total = $derived(cashStats(game).rakeBox);
  // quick buttons for the chips a pot's rake is usually made of (up to the cap)
  const steps = $derived.by(() => {
    const vals = [...new Set(game.chips.map((ch) => ch.value))].sort((a, b) => a - b);
    const under = vals.filter((v) => v <= (r.cap || Infinity));
    return (under.length ? under : vals).slice(0, 3);
  });
  let typed = $state<number | null>(null);

  function other(e: SubmitEvent) {
    e.preventDefault();
    const v = Number(typed) || 0;
    if (v) add(v);
    typed = null;
  }

  function count() {
    const v = prompt(t("gamePlay.cash.rakeBoxPrompt"), String(game.rakeBox ?? 0));
    if (v !== null && Number(v) >= 0) recount(Number(v));
  }
</script>

<div class="rakebox flex flex-wrap items-center gap-x-4 gap-y-1.5 -mt-1 mx-0 mb-5">
  <span class="rb-total"><span class="small muted">{t("gamePlay.cash.rakeBoxLabel")}</span> <b class="num text-[length:var(--fs-md)]" use:bump={total}><Count value={total} format={money} /></b></span>
  <span class="row">
    {#each steps as v (v)}<button data-sound="drop" onclick={() => add(v)} title={t("gamePlay.cash.addToRakeBoxTitle", { amount: money(v) })}>+{money(v)}</button>{/each}
    <form autocomplete="off" class="joined inline-flex" onsubmit={other}>
      <input type="number" step="any" class="w-[72px]" placeholder={t("gamePlay.shared.other")} bind:value={typed} aria-label={t("gamePlay.cash.otherAmountRakeBoxAria")} />
      <button data-sound="drop" class="ml-[calc(-1*var(--hair))]" disabled={!typed} aria-label={t("gamePlay.cash.addThatToRakeBox")} title={typed ? t("gamePlay.cash.addThatToRakeBox") : t("gamePlay.shared.typeAmountFirst")}><Icon icon={Plus} /></button>
    </form>
    <button class="link small muted" data-sound="drop" onclick={count}>{t("gamePlay.cash.recount")}</button>
  </span>
  <span class="small muted">{t("gamePlay.cash.rakePctNote", { pct: String(r.pct), cap: money(r.cap), house })}</span>
</div>

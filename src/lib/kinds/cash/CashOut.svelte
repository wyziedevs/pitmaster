<script lang="ts">
  // cashing a player out on the dealer screen: count their chips by color, or
  // type the total, and see what their night comes to before it goes in
  import { untrack } from "svelte";
  import Chip from "$lib/components/Chip.svelte";
  import type { Game, Player } from "$lib/types";
  import { faceText } from "$lib/chips";
  import { currencySymbol, money, round2, signed } from "$lib/util";
  import { reveal, slide } from "$lib/motion";
  import { t } from "$lib/i18n";
  import { cashNight } from "./engine";

  let { game, p, done, cancel }: { game: Game; p: Player; done: (amount: number) => void; cancel: () => void } = $props();

  let counts = $state<Record<string, number | null>>({});
  // a fix starts from what they cashed out for
  let typed = $state<number | null>(untrack(() => p.cashOut));
  const counted = $derived(round2(game.chips.reduce((sum, c) => sum + (Number(counts[c.id]) || 0) * c.value, 0)));
  const total = $derived(typed !== null && (typed as unknown) !== "" ? Number(typed) || 0 : counted);
  const net = $derived(cashNight(game, p, total).net);

  function submit(e: SubmitEvent) {
    e.preventDefault();
    if (total >= 0) done(total);
  }
</script>

<form autocomplete="off" class="counter vstack py-2.5 px-3" onsubmit={submit} transition:slide={reveal()}>
  <div class="small muted">{t("gamePlay.cash.countChipsPrompt", { name: p.name })}</div>
  <div class="stacks flex flex-wrap gap-x-3.5 gap-y-1.5">
    {#each game.chips as ch (ch.id)}
      <label class="cc inline-flex items-center gap-1.5 m-0">
        <Chip chip={ch} size={30} text={faceText(ch, true)} spin={false} />
        <input type="number" min="0" step="1" class="w-[60px]" bind:value={counts[ch.id]} oninput={() => (typed = null)} aria-label={t("gamePlay.cash.howManyChipsAria", { amount: money(ch.value) })} />
        <span class="small muted num">× {money(ch.value)}</span>
      </label>
    {/each}
  </div>
  <div class="row">
    <label class="across"><span>{t("gamePlay.cash.orTheTotal")} {currencySymbol()}</span><input type="number" min="0" step="any" bind:value={typed} /></label>
    <button data-sound="rack">{t("gamePlay.cash.cashOutAmountButton", { amount: money(total) })}</button>
    <span class="small num {net >= 0 ? 'good' : 'bad'}">{signed(net)} {t("gamePlay.cash.forTheSession")}</span>
    <button type="button" class="link small muted" data-sound="close" onclick={cancel}>{t("common.cancel")}</button>
  </div>
</form>

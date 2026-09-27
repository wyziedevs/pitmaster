<script lang="ts">
  // what a last-one-standing game is played for: a buy-in pot paid by place,
  // or money for every life (or die) lost. liar's dice and the lives games share it.
  import type { DiceStakes } from "$lib/types";
  import { defaultPayouts, payoutAmounts } from "$lib/blinds";
  import { currencySymbol, money } from "$lib/util";
  import { reveal, slide } from "$lib/motion";
  import GameSelect from "$lib/components/GameSelect.svelte";
  import { t } from "$lib/i18n";

  let {
    stakes = $bindable(),
    players,
    lives,
    unit,
  }: { stakes: DiceStakes; players: number; lives: number; unit: "die" | "life" } = $props();

  const sym = $derived(currencySymbol());
  let payoutText = $state(stakes.payouts.join(", "));
  const field = $derived(Math.max(2, players || 6));
  const payouts = $derived(
    payoutText.trim()
      ? payoutText
          .split(/[\s,]+/)
          .map(Number)
          .filter((n) => n > 0)
      : defaultPayouts(field)
  );
  const payoutSum = $derived(payouts.reduce((s, p) => s + p, 0));
  $effect(() => {
    stakes.payouts = payoutText.trim() ? payouts : [];
  });
</script>

<div class="row" role="radiogroup" aria-label={t("gameSetup.dice.stakesLegend")}>
  <label class="across"><input type="radio" name="stakes" value="pot" bind:group={stakes.mode} /><span>{t("gameSetup.dice.stakesPot")}</span></label>
  <label class="across"><input type="radio" name="stakes" value="perDie" bind:group={stakes.mode} /><span>{unit === "die" ? t("gameSetup.dice.stakesPerDie") : t("gameSetup.lives.stakesPerLife")}</span></label>
</div>
{#if stakes.mode === "pot"}
  <div transition:slide={reveal()}>
    <div class="row">
      <label><span>{t("gameSetup.tournament.buyInStacks.buyIn", { sym })}</span><input type="number" min="0" step="any" bind:value={stakes.buyIn} /></label>
      <label><span>{t("gameSetup.tournament.payouts.roundTo")}</span><GameSelect of="round" bind:value={stakes.payoutRound} /></label>
    </div>
    <label>
      <span>{t("gameSetup.tournament.payouts.percentagesLabel")}</span>
      <input type="text" bind:value={payoutText} placeholder={defaultPayouts(field).join(", ")} />
    </label>
    {#if payoutSum !== 100}<p class="warn small">{t("gameSetup.tournament.payouts.sumWarning", { n: payoutSum })}</p>{/if}
    <p class="small">
      {t("gameSetup.dice.potCaption", { n: field, pool: money(field * stakes.buyIn) })}
      {#each payoutAmounts(field * stakes.buyIn, payouts, stakes.payoutRound) as p, i (i)}<span class="num ml-2">{i + 1}. {money(p)}</span>{/each}
    </p>
  </div>
{:else}
  <div transition:slide={reveal()}>
    <div class="row">
      <label><span>{unit === "die" ? t("gameSetup.dice.perDie", { sym }) : t("gameSetup.lives.perLife", { sym })}</span><input type="number" min="0" step="any" bind:value={stakes.perDie} /></label>
      <label>
        <span>{t("gameSetup.dice.perDieTo")}</span>
        <select bind:value={stakes.perDieTo}>
          <option value="winner">{unit === "die" ? t("gameSetup.dice.toWinner") : t("gameSetup.lives.toWinner")}</option>
          <option value="pot">{t("gameSetup.dice.toPot")}</option>
        </select>
      </label>
    </div>
    <p class="small muted -mt-1">
      {unit === "die"
        ? t(stakes.perDieTo === "winner" ? "gameSetup.dice.toWinnerHint" : "gameSetup.dice.toPotHint", { most: money(stakes.perDie * lives) })
        : t(stakes.perDieTo === "winner" ? "gameSetup.lives.toWinnerHint" : "gameSetup.lives.toPotHint", { most: money(stakes.perDie * lives) })}
    </p>
  </div>
{/if}

<script lang="ts" module>
  import type { DiceStakes } from "$lib/types";
  import { settings } from "$lib/settings.svelte";

  /** a new game's stakes: a copied game's own, or the defaults rounded the host's way */
  export const startStakes = (s: DiceStakes, copied: boolean): DiceStakes => (copied ? structuredClone(s) : { ...s, payoutRound: settings.payoutRound || 1 });
  /** the stakes as a game keeps them: nothing below zero */
  export const cleanStakes = (s: DiceStakes): DiceStakes => ({ ...$state.snapshot(s), buyIn: Math.max(0, s.buyIn || 0), perDie: Math.max(0, s.perDie || 0) });
</script>

<script lang="ts">
  // what a last-one-standing game is played for: a buy-in pot paid by place,
  // or money for every life (or die) lost. liar's dice and the lives games share it.
  import { defaultPayouts, payoutAmounts } from "$lib/blinds";
  import { currencySymbol, money, positives } from "$lib/util";
  import { reveal, slide } from "$lib/motion";
  import GameSelect from "$lib/components/GameSelect.svelte";
  import { t } from "$lib/i18n";

  let {
    stakes = $bindable(),
    players,
    lives,
    unit,
  }: { stakes: DiceStakes; players: number; lives: number; unit: "die" | "life" } = $props();

  // the words for a die or a life
  const ns = $derived(unit === "die" ? "gameSetup.dice" : "gameSetup.lives");
  const per = $derived(unit === "die" ? "Die" : "Life");
  const sym = $derived(currencySymbol());
  let payoutText = $state(stakes.payouts.join(", "));
  const field = $derived(Math.max(2, players || 6));
  const payouts = $derived(stakes.payouts.length ? stakes.payouts : defaultPayouts(field));
  const payoutSum = $derived(payouts.reduce((s, p) => s + p, 0));
  const setPayouts = (v: string) => {
    payoutText = v;
    stakes.payouts = positives(v);
  };
</script>

<div class="row" role="radiogroup" aria-label={t("gameSetup.dice.stakesLegend")}>
  <label class="across"><input type="radio" name="stakes" value="pot" bind:group={stakes.mode} /><span>{t("gameSetup.dice.stakesPot")}</span></label>
  <label class="across"><input type="radio" name="stakes" value="perDie" bind:group={stakes.mode} /><span>{t(`${ns}.stakesPer${per}`)}</span></label>
</div>
{#if stakes.mode === "pot"}
  <div transition:slide={reveal()}>
    <div class="row">
      <label><span>{t("gameSetup.tournament.buyInStacks.buyIn", { sym })}</span><input type="number" min="0" step="any" bind:value={stakes.buyIn} /></label>
      <label><span>{t("gameSetup.tournament.payouts.roundTo")}</span><GameSelect of="round" bind:value={stakes.payoutRound} /></label>
    </div>
    <label>
      <span>{t("gameSetup.tournament.payouts.percentagesLabel")}</span>
      <input type="text" bind:value={() => payoutText, setPayouts} placeholder={defaultPayouts(field).join(", ")} />
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
      <label><span>{t(`${ns}.per${per}`, { sym })}</span><input type="number" min="0" step="any" bind:value={stakes.perDie} /></label>
      <label>
        <span>{t("gameSetup.dice.perDieTo")}</span>
        <select bind:value={stakes.perDieTo}>
          <option value="winner">{t(`${ns}.toWinner`)}</option>
          <option value="pot">{t("gameSetup.dice.toPot")}</option>
        </select>
      </label>
    </div>
    <p class="small muted -mt-1">
      {t(`${ns}.${stakes.perDieTo === "winner" ? "toWinnerHint" : "toPotHint"}`, { most: money(stakes.perDie * lives) })}
    </p>
  </div>
{/if}

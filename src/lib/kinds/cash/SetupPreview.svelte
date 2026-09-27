<script lang="ts">
  // the poker form's live preview for a cash game: what a buy-in gets, how
  // many the chips cover, and the game in a few lines
  import Breakdown from "$lib/components/Breakdown.svelte";
  import { distribute } from "$lib/chips";
  import { gamesLabel } from "$lib/variants";
  import { duration, money } from "$lib/util";
  import { t } from "$lib/i18n";
  import type { PokerDraft } from "../poker/draft.svelte";

  let { draft }: { draft: PokerDraft } = $props();
  const c = $derived(draft.cash);
  const breakdown = $derived(distribute(c.defaultBuyIn, draft.chips, c.players));
  // how many standard buy-ins the whole set makes
  const one = $derived(distribute(c.defaultBuyIn, draft.chips, 1));
  const covered = $derived(one.short > 0 || !one.rows.length ? 0 : Math.min(...one.rows.map((r) => Math.floor(r.chip.count / r.n))));
</script>

<h2>{t("gameSetup.previewCash.eachBuyInGets", { amount: money(c.defaultBuyIn) })}</h2>
<div class="felt"><Breakdown {breakdown} isCash target={c.defaultBuyIn} /></div>
<p class="small">
  {#if covered}
    {t("gameSetup.previewCash.coversAbout", { n: covered })}{#if covered < c.players}{" "}<span class="bad">{t("gameSetup.previewCash.fewerThan", { n: c.players })}</span>{/if}
  {:else}
    <span class="bad">{t("gameSetup.previewCash.cantMake")}</span>
  {/if}
</p>
<hr />
<h2>{t("gameSetup.previewCash.summary")}</h2>
<table>
  <tbody>
    {#if draft.features.shows("variants") && !draft.pick.holdem}<tr><td>{t("gameSetup.variants.legend")}</td><td class="num">{gamesLabel(draft.pick.games, true)}</td></tr>{/if}
    <tr><td>{t("gameSetup.previewCash.rowBlinds")}</td><td class="num">{money(c.sb)} / {money(c.bb)}{c.straddle ? t("gameSetup.previewCash.straddlesInline") : ""}</td></tr>
    <tr><td>{t("gameSetup.previewCash.rowBuyIn")}</td><td class="num">{money(c.minBuyIn)}–{money(c.maxBuyIn)}</td></tr>
    <tr><td>{t("gameSetup.previewCash.rowLength")}</td><td class="num">{duration(c.hours * 60)}</td></tr>
    {#if draft.features.shows("rake")}
      <tr>
        <td>{t("gameSetup.previewCash.rowRake")}</td>
        <td class="num">{c.rake === "pot" ? t("gameSetup.previewCash.rakePct", { pct: c.rakePct, cap: money(c.rakeCap) }) : c.rake === "seat" ? t("gameSetup.previewCash.rakeSeat", { fee: money(c.seatFee) }) : t("gameSetup.previewCash.rakeNone")}</td>
      </tr>
    {/if}
  </tbody>
</table>

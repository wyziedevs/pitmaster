<script lang="ts">
  // a tournament's own part of the poker form: the buy-in and stacks, the
  // clock, rebuys, late registration and bounties, the format, the payouts
  // and (when it's on) the house's cut
  import GameSelect from "$lib/components/GameSelect.svelte";
  import HouseCutFields from "$lib/components/HouseCutFields.svelte";
  import { defaultPayouts } from "$lib/blinds";
  import { currencySymbol, duration, money } from "$lib/util";
  import { bump, reveal, slide } from "$lib/motion";
  import { t, tp } from "$lib/i18n";
  import type { PokerDraft } from "../poker/draft.svelte";

  let { draft }: { draft: PokerDraft } = $props();
  const d = $derived(draft.tourney);
  const f = $derived(draft.features);
  const sym = $derived(currencySymbol());
  const rebuys = $derived(f.shows("rebuys") && d.rules.rebuys);
  const est = $derived(d.estimate);
  const satellite = $derived(f.shows("format", "useSatellites"));
  const shootout = $derived(f.shows("format", "useShootouts"));
  const bracket = $derived(f.shows("format", "useBrackets"));
</script>

<fieldset>
  <legend>{t("gameSetup.tournament.buyInStacks.legend")}</legend>
  <div class="row">
    <label><span>{t("gameSetup.tournament.buyInStacks.buyIn", { sym })}</span><input type="number" min="0" step="any" bind:value={d.buyIn} /></label>
    <label><span>{t("gameSetup.tournament.buyInStacks.startingStack")}</span><input type="number" min="1" step="any" bind:value={d.stack} /></label>
    <label><span>{t("gameSetup.tournament.buyInStacks.expectedPlayers")}</span><input type="number" min="2" max="100" bind:value={d.expected} /></label>
  </div>
  <label>
    <span>{t("gameSetup.tournament.buyInStacks.startingDepth")}</span>
    <GameSelect of="depth" bind:value={d.depth} />
  </label>
</fieldset>

<fieldset>
  <legend>{t("gameSetup.tournament.length.legend")}</legend>
  <label>
    <span>{t("gameSetup.tournament.length.wrapUpAbout", { duration: duration(d.hours * 60) })}</span>
    <input type="range" min="1" max="8" step="0.25" bind:value={d.hours} style="width:100%" />
  </label>
  <div class="row">
    <label>
      <span>{t("gameSetup.tournament.length.levelLength")}</span>
      <GameSelect of="level" bind:value={d.levelMinutes} />
    </label>
    <label><span>{t("gameSetup.tournament.length.levelsBetweenBreaks")}</span><input type="number" min="0" bind:value={d.breakEvery} /></label>
    <label><span>{t("gameSetup.tournament.length.breakMinutes")}</span><input type="number" min="1" bind:value={d.breakMinutes} /></label>
    <label><span>{t("gameSetup.tournament.length.antesFromLevel")}</span><input type="number" min="0" bind:value={d.anteFrom} /></label>
  </div>
</fieldset>

<fieldset>
  <legend>{[rebuys ? t("gameSetup.tournament.rebuys.rebuysAddOn") : "", t("gameSetup.tournament.rebuys.lateRegistration"), f.shows("bounty") ? t("gameSetup.tournament.rebuys.bounty") : ""].filter(Boolean).join(" / ")}</legend>
  {#if rebuys}
    <label class="across"><input type="checkbox" bind:checked={d.rebuyOn} /><span>{t("gameSetup.tournament.rebuys.rebuysLabel")}</span></label>
    {#if d.rebuyOn}
      <div class="row" transition:slide={reveal()}>
        <label><span>{t("gameSetup.tournament.rebuys.cost", { sym })}</span><input type="number" min="0" step="any" bind:value={d.rebuyCost} /></label>
        <label><span>{t("gameSetup.tournament.rebuys.chips")}</span><input type="number" min="0" step="any" bind:value={d.rebuyChips} /></label>
        <label><span>{t("gameSetup.tournament.rebuys.throughLevel")}</span><input type="number" min="1" bind:value={d.rebuyUntil} /></label>
      </div>
    {/if}
    <label class="across"><input type="checkbox" bind:checked={d.addOnOn} /><span>{t("gameSetup.tournament.rebuys.addOnLabel")}</span></label>
    {#if d.addOnOn}
      <div class="row" transition:slide={reveal()}>
        <label><span>{t("gameSetup.tournament.rebuys.cost", { sym })}</span><input type="number" min="0" step="any" bind:value={d.addOnCost} /></label>
        <label><span>{t("gameSetup.tournament.rebuys.chips")}</span><input type="number" min="0" step="any" bind:value={d.addOnChips} /></label>
      </div>
    {/if}
  {/if}
  <div class="row">
    <label><span>{t("gameSetup.tournament.rebuys.lateRegThroughLevel")}</span><input type="number" min="0" bind:value={d.lateReg} /></label>
    {#if f.shows("bounty")}<label><span>{t("gameSetup.tournament.rebuys.bountyField", { sym })}</span><input type="number" min="0" step="any" max={d.buyIn} bind:value={d.bounty} /></label>{/if}
  </div>
  {#if f.shows("bounty") && d.bounty > 0}
    <div class="row" transition:slide={reveal()}>
      <label>
        <span>{t("gameSetup.tournament.rebuys.bountyKind")}</span>
        <select bind:value={d.bountyKind}>
          <option value="flat">{t("gameSetup.tournament.rebuys.kindFlat")}</option>
          <option value="progressive">{t("gameSetup.tournament.rebuys.kindProgressive")}</option>
          <option value="mystery">{t("gameSetup.tournament.rebuys.kindMystery")}</option>
        </select>
      </label>
      {#if d.bountyKind === "mystery"}<label transition:slide={{ ...reveal(), axis: "x" }}><span>{t("gameSetup.tournament.rebuys.mysteryFrom")}</span><input type="number" min="0" step="1" bind:value={d.mysteryFrom} /></label>{/if}
    </div>
    <p class="small muted -mt-1 mx-0 mb-[10px]">{t(`gameSetup.tournament.rebuys.hint.${d.bountyKind}`)}</p>
  {/if}
</fieldset>

{#if satellite || shootout || bracket}
  <fieldset transition:slide={reveal()}>
    <legend>{t("gameSetup.tournament.format.legend")}{#if f.tonight.format}<button class="link small opt ml-2" data-sound="off" onclick={() => draft.drop("format")}>{t("gameSetup.tournament.format.remove")}</button>{/if}</legend>
    {#if shootout || bracket}
      <div class="row" role="radiogroup" aria-label={t("gameSetup.tournament.format.legend")}>
        <label class="across"><input type="radio" name="format" value="standard" bind:group={d.format} /><span>{t("gameSetup.tournament.format.standard")}</span></label>
        {#if shootout}<label class="across"><input type="radio" name="format" value="shootout" bind:group={d.format} /><span>{t("gameSetup.tournament.format.shootout")}</span></label>{/if}
        {#if bracket}<label class="across"><input type="radio" name="format" value="bracket" bind:group={d.format} /><span>{t("gameSetup.tournament.format.bracket")}</span></label>{/if}
      </div>
      {#if d.format !== "standard"}<p class="small muted -mt-1 mx-0 mb-[10px]" transition:slide={reveal()}>{t(d.format === "bracket" ? "gameSetup.tournament.format.bracketHint" : "gameSetup.tournament.format.shootoutHint")}</p>{/if}
    {/if}
    {#if satellite && !d.rules.bracket}
      <label class="across"><input type="checkbox" bind:checked={d.satelliteOn} onchange={() => d.satelliteOn && !d.seatValue && (d.seatValue = d.buyIn * 10)} /><span>{t("gameSetup.tournament.format.satellite")}</span></label>
      {#if d.satelliteOn}
        <div class="row" transition:slide={reveal()}>
          <label><span>{t("gameSetup.tournament.format.seatValue", { sym })}</span><input type="number" min="0" step="any" bind:value={d.seatValue} /></label>
        </div>
      {/if}
      <p class="small muted -mt-1 mx-0 mb-[10px]">{t("gameSetup.tournament.format.satelliteHint")}</p>
    {/if}
  </fieldset>
{/if}

<fieldset>
  <legend>{t("gameSetup.tournament.payouts.legend")}</legend>
  {#if d.rules.satellite}
    <p class="small">
      {t("gameSetup.tournament.format.seatsCaption", { n: d.expected, pool: money(est.pool), seats: tp("gameSetup.tournament.format.seats", est.seats), value: money(d.seatValue) })}{#if est.rest > 0.004}{" "}{t("gameSetup.tournament.format.restCaption", { amount: money(est.rest) })}{/if}
    </p>
  {:else}
    <label>
      <span>{t("gameSetup.tournament.payouts.percentagesLabel")}</span>
      <input type="text" bind:value={d.payoutText} placeholder={defaultPayouts(d.expected).join(", ")} />
    </label>
    {#if d.payoutSum !== 100}<p class="warn small" transition:slide={reveal()}>{t("gameSetup.tournament.payouts.sumWarning", { n: d.payoutSum })}</p>{/if}
    <label>
      <span>{t("gameSetup.tournament.payouts.roundTo")}</span>
      <GameSelect of="round" bind:value={d.payoutRound} />
    </label>
    <p class="small">
      {t("gameSetup.tournament.payouts.poolCaption", { n: d.expected, pool: money(est.pool) })}{#if est.bounty || est.house > 0.001}{" "}{t("gameSetup.tournament.payouts.poolAfter", { parts: [est.bounty ? t("gameSetup.tournament.payouts.bountyPart", { amount: money(est.bounty) }) : "", est.house > 0.001 ? t("gameSetup.tournament.payouts.housePart", { amount: money(est.house) }) : ""].filter(Boolean).join(` ${t("gameSetup.tournament.payouts.joinAnd")} `) })}{/if}:
      {#each est.paid as p, i (i)}<span class="num ml-2" use:bump={p.amount}>{p.place}. {money(p.amount)}</span>{/each}
    </p>
  {/if}
</fieldset>

{#if f.shows("cut")}
  <fieldset transition:slide={reveal()}>
    <legend>{t("gameSetup.tournament.houseCut.legend")} <span class="small opt text-muted ml-[6px]">{t("gameSetup.tournament.houseCut.optional")}</span>{#if !f.always("cut")}<button class="link small opt ml-2" data-sound="off" onclick={() => draft.drop("cut")}>{t("gameSetup.tournament.houseCut.remove")}</button>{/if}</legend>
    <HouseCutFields bind:fee={d.fee} bind:pct={d.rakePct} buyIn={d.buyIn} />
  </fieldset>
{/if}

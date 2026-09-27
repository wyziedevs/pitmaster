<script lang="ts">
  // a new liar's dice game: who's playing, the house's rules, and what it's
  // played for. there are no chips or blinds; the dice are the lives.
  import Icon from "$lib/components/Icon.svelte";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Plus from "@lucide/svelte/icons/plus";
  import { goto } from "$app/navigation";
  import { pagehead } from "$lib/pagehead";
  import { saveGame, getLeagues, knownPlayers } from "$lib/store";
  import { newGame } from "$lib/game";
  import { currentLeague } from "$lib/stats";
  import { defaultPayouts, payoutAmounts } from "$lib/blinds";
  import { settings, houseRules } from "$lib/settings.svelte";
  import { currencySymbol, money, nameKey } from "$lib/util";
  import { reveal, slide } from "$lib/motion";
  import GameSelect from "$lib/components/GameSelect.svelte";
  import Die from "$lib/components/Die.svelte";
  import type { DiceSettings, GameType } from "$lib/types";
  import { DICE_DEFAULTS, rulesLine } from "./index";
  import { t, tp } from "$lib/i18n";

  // (this form is only ever liar's dice)
  let {}: { type: GameType } = $props();
  const type: GameType = "dice";

  const d = DICE_DEFAULTS();
  const day = new Date().toLocaleDateString(settings.language, { weekday: "long" });
  let name = $state(`${day} ${t("common.kinds.dice.label")}`);
  let playerNames = $state("");
  let notes = $state(settings.rulesOnNew ? houseRules().join("\n") : "");
  let dice = $state(d.dice);
  let onesWild = $state(d.onesWild);
  let spotOn = $state(d.spotOn);
  let palifico = $state(d.palifico);
  let entry = $state(d.entry);
  let mode = $state(d.stakes.mode);
  let buyIn = $state(d.stakes.buyIn);
  let payoutText = $state("");
  let payoutRound = $state(settings.payoutRound || 1);
  let perDie = $state(d.stakes.perDie);
  let perDieTo = $state(d.stakes.perDieTo);

  const sym = $derived(currencySymbol());
  const names = $derived(
    playerNames
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const field = $derived(Math.max(2, names.length || 6));
  const payouts = $derived(
    payoutText.trim()
      ? payoutText
          .split(/[\s,]+/)
          .map(Number)
          .filter((n) => n > 0)
      : defaultPayouts(field)
  );
  const payoutSum = $derived(payouts.reduce((s, p) => s + p, 0));

  const rules = (): DiceSettings => ({
    dice: Math.max(1, Math.min(20, Math.round(dice || 5))),
    onesWild,
    spotOn,
    palifico,
    stakes: { mode, buyIn: Math.max(0, buyIn || 0), payouts: payoutText.trim() ? payouts : [], payoutRound, perDie: Math.max(0, perDie || 0), perDieTo },
    entry,
  });

  // the league that's on for this kind of game, if there is one
  const leagues = getLeagues().filter((l) => l.types.includes(type));
  let leagueId = $state(currentLeague(leagues, type)?.id ?? "");

  // regulars one click away, most games first
  const regulars = knownPlayers().slice(0, 16);
  const unlisted = $derived(regulars.filter((r) => !names.some((n) => nameKey(n) === nameKey(r.name))));
  const addRegular = (n: string) => (playerNames = (playerNames.trim() ? playerNames.trim() + "\n" : "") + n);

  function create() {
    if (names.length < 2 && !confirm(t("gameSetup.dice.fewPlayersConfirm"))) return;
    const g = newGame({ name: name.trim() || `${day} ${t("common.kinds.dice.label")}`, type, chipSetName: "", multiplier: 1, chips: [], notes, players: names, levels: [] });
    g.dice = rules();
    if (leagueId && leagues.some((l) => l.id === leagueId)) g.leagueId = leagueId;
    saveGame(g);
    goto(`/game/${g.id}`);
  }
</script>

<svelte:head><title>{t("common.kinds.dice.newLabel")} · PitMaster</title></svelte:head>

<div class="spread" use:pagehead>
  <h1>{t("common.kinds.dice.newLabel")}</h1>
</div>

<div class="cols">
  <div>
    <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
      <legend class="ruled w-full px-0">{t("gameSetup.basics.legend")}</legend>
      <label><span>{t("gameSetup.basics.name")}</span><input type="text" bind:value={name} style="width:100%" /></label>
      {#if leagues.length}
        <label>
          <span class="links">{t("gameSetup.basics.league")} <a href="/players#leagues">{t("gameSetup.basics.editLeagues")}</a></span>
          <select bind:value={leagueId}>
            <option value="">{t("gameSetup.basics.noLeague")}</option>
            {#each leagues as l (l.id)}<option value={l.id}>{l.name}</option>{/each}
          </select>
        </label>
      {/if}
    </fieldset>

    <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
      <legend class="ruled w-full px-0">{t("gameSetup.dice.rulesLegend")}</legend>
      <div class="row">
        <label><span>{t("gameSetup.dice.dicePerPlayer")}</span><input type="number" min="1" max="20" step="1" bind:value={dice} /></label>
      </div>
      <label class="across"><input type="checkbox" bind:checked={onesWild} /><span>{t("gameSetup.dice.onesWild")}</span></label>
      <label class="across"><input type="checkbox" bind:checked={palifico} /><span>{t("gameSetup.dice.palifico")}</span></label>
      {#if palifico}<p class="small muted -mt-1 mx-0 mb-[10px]" transition:slide={reveal()}>{t("gameSetup.dice.palificoHint")}</p>{/if}
      <label>
        <span>{t("gameSetup.dice.spotOn")}</span>
        <select bind:value={spotOn}>
          <option value="others">{t("gameSetup.dice.spotOnOthers")}</option>
          <option value="gain">{t("gameSetup.dice.spotOnGain")}</option>
          <option value="off">{t("gameSetup.dice.spotOnOff")}</option>
        </select>
      </label>
    </fieldset>

    <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
      <legend class="ruled w-full px-0">{t("gameSetup.dice.stakesLegend")}</legend>
      <div class="row" role="radiogroup" aria-label={t("gameSetup.dice.stakesLegend")}>
        <label class="across"><input type="radio" name="stakes" value="pot" bind:group={mode} /><span>{t("gameSetup.dice.stakesPot")}</span></label>
        <label class="across"><input type="radio" name="stakes" value="perDie" bind:group={mode} /><span>{t("gameSetup.dice.stakesPerDie")}</span></label>
      </div>
      {#if mode === "pot"}
        <div transition:slide={reveal()}>
          <div class="row">
            <label><span>{t("gameSetup.tournament.buyInStacks.buyIn", { sym })}</span><input type="number" min="0" step="any" bind:value={buyIn} /></label>
            <label><span>{t("gameSetup.tournament.payouts.roundTo")}</span><GameSelect of="round" bind:value={payoutRound} /></label>
          </div>
          <label>
            <span>{t("gameSetup.tournament.payouts.percentagesLabel")}</span>
            <input type="text" bind:value={payoutText} placeholder={defaultPayouts(field).join(", ")} />
          </label>
          {#if payoutSum !== 100}<p class="warn small">{t("gameSetup.tournament.payouts.sumWarning", { n: payoutSum })}</p>{/if}
          <p class="small">
            {t("gameSetup.dice.potCaption", { n: field, pool: money(field * buyIn) })}
            {#each payoutAmounts(field * buyIn, payouts, payoutRound) as p, i (i)}<span class="num ml-2">{i + 1}. {money(p)}</span>{/each}
          </p>
        </div>
      {:else}
        <div transition:slide={reveal()}>
          <div class="row">
            <label><span>{t("gameSetup.dice.perDie", { sym })}</span><input type="number" min="0" step="any" bind:value={perDie} /></label>
            <label>
              <span>{t("gameSetup.dice.perDieTo")}</span>
              <select bind:value={perDieTo}>
                <option value="winner">{t("gameSetup.dice.toWinner")}</option>
                <option value="pot">{t("gameSetup.dice.toPot")}</option>
              </select>
            </label>
          </div>
          <p class="small muted -mt-1">{t(perDieTo === "winner" ? "gameSetup.dice.toWinnerHint" : "gameSetup.dice.toPotHint", { most: money(perDie * dice) })}</p>
        </div>
      {/if}
    </fieldset>

    <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
      <legend class="ruled w-full px-0">{t("gameSetup.dice.entryLegend")}</legend>
      <div class="row" role="radiogroup" aria-label={t("gameSetup.dice.entryLegend")}>
        <label class="across"><input type="radio" name="entry" value="full" bind:group={entry} /><span>{t("gameSetup.dice.entryFull")}</span></label>
        <label class="across"><input type="radio" name="entry" value="quick" bind:group={entry} /><span>{t("gameSetup.dice.entryQuick")}</span></label>
      </div>
      <p class="small muted -mt-1 mx-0 mb-0">{t(entry === "full" ? "gameSetup.dice.entryFullHint" : "gameSetup.dice.entryQuickHint")}</p>
    </fieldset>

    <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
      <legend class="ruled w-full px-0">{t("gameSetup.players.legend")} <span class="small opt text-muted ml-[6px]">{t("gameSetup.players.optional")}</span></legend>
      <label>
        <span>{t("gameSetup.players.namesLabel")}</span>
        <textarea bind:value={playerNames} rows="4" placeholder={t("gameSetup.players.namesPlaceholder")}></textarea>
      </label>
      {#if unlisted.length}
        <p class="small links -mt-1 mx-0 mb-[10px]">
          <span class="muted">{t("gameSetup.players.regulars")}</span>
          {#each unlisted as r (r.name)}<button class="link" data-sound="chips" onclick={() => addRegular(r.name)} title={tp("gameSetup.players.gamesCount", r.games)}><Icon icon={Plus} size="1em" />{r.name}</button>{/each}
        </p>
      {/if}
      <label>
        <span>{t("gameSetup.players.notesLabel")}</span>
        <textarea bind:value={notes} rows={Math.min(8, Math.max(2, notes.split("\n").length + 1))} placeholder={t("gameSetup.players.notesPlaceholder")}></textarea>
      </label>
    </fieldset>
  </div>

  <div class="preview">
    <h2>{t("gameSetup.dice.eachPlayer")}</h2>
    <div class="felt flex flex-wrap gap-2 items-center">{#each Array.from({ length: Math.max(1, Math.min(20, dice || 1)) }) as _, i (i)}<Die value={(i % 6) + 1} size="30px" />{/each}</div>
    <p class="small">{rulesLine(rules())}</p>
    <p class="small muted">{t("gameSetup.dice.howItPlays")}</p>
  </div>
</div>

<hr />
<p class="row actions justify-between">
  <button class="big" data-sound="riffle" onclick={create}>{t("gameSetup.actions.dealIt")}<span class="flip-rtl"><Icon icon={ArrowRight} /></span></button>
  <a href="/" data-sound="close">{t("common.cancel")}</a>
</p>

<style>
  @media (max-width: 600px) {
    .actions {
      position: sticky;
      bottom: 0;
      z-index: 30;
      margin: 0 -16px;
      padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
      background: var(--bg);
      border-top: var(--hair) solid var(--line);
    }
  }
  .preview {
    position: sticky;
    top: calc(var(--head, 0px) + var(--title, 0px) + 12px);
    align-self: start;
  }
  @media (max-width: 800px) {
    .preview {
      position: static;
    }
  }
</style>

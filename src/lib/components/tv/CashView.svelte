<script lang="ts">
  // a cash game on the tv: who's seated and who's waiting on the left, the
  // stakes and the side games in the middle, the buy-in and the rake on the
  // right (when there's anything for it), the chips along the bottom
  import ChipLegend from "../ChipLegend.svelte";
  import Count from "../Count.svelte";
  import ProgressBar from "../ProgressBar.svelte";
  import SeatList from "./SeatList.svelte";
  import LeagueColumn from "./LeagueColumn.svelte";
  import TvFooter from "./TvFooter.svelte";
  import type { TvState } from "./state.svelte";
  import { cashStats, cashRake, sideStats } from "$lib/game";
  import { tableCounts } from "$lib/seats";
  import { cashStakes, isLimit, isStud, stakePair, stakesText, studLine, variant, variantName } from "$lib/variants";
  import { clock, duration, money, timeOfDay } from "$lib/util";
  import { time } from "$lib/now.svelte";
  import { fade } from "svelte/transition";
  import { replay, leave } from "$lib/motion";
  import { t, tp } from "$lib/i18n";

  let { tv, right }: { tv: TvState; right: boolean } = $props();
  const game = $derived(tv.game);
  const c = $derived(game.cash!);

  const cash = $derived(cashStats(game));
  const rake = $derived(cashRake(game));
  const elapsed = $derived(tv.elapsed);
  // the side games: a bomb pot coming due, the 7-2 game, the high hand and its window
  const side = $derived(sideStats(game, elapsed));
  const planned = $derived(c.plannedMinutes * 60000);
  const cashRemaining = $derived(planned - elapsed);
  const now = $derived(tv.cashNow);
  const stud = $derived(!!now && isStud(now.id));
  // a limit game's big number is its bets, not its blinds
  const pair = $derived(stakePair(cashStakes(c, now?.id ?? "nlhe")));
  const stakes = $derived(`${money(pair[0])}/${money(pair[1])}`);
  const highHolder = $derived(side.current ? game.players.find((p) => p.id === side.current!.playerId) : null);

  const tables = $derived(tableCounts(game).length);
  const seated = $derived(game.players.filter((p) => p.cashOut === null));
  // who's next for a seat, and how long they've waited
  const WAITLIST = 6;
  const waitlist = $derived(game.waitlist ?? []);
  const waited = (at: number) => duration(Math.max(1, (time.now - at) / 60000));

  // dealer's choice on a timer moves on by itself: the board says so (a game
  // picked on the dealer screen comes with its own announcement)
  let lastGame = "";
  $effect(() => {
    const id = now?.id ?? "";
    const picked = game.flash?.kind === "game" && Date.now() - game.flash.at < 5000;
    if (lastGame && id && id !== lastGame && !picked) tv.cues.news(t("gamePlay.variants.gameNowFlash", { game: variantName(id), line: stakesText(cashStakes(c, id), true) }), "game");
    lastGame = id;
  });
</script>

<aside class="col left">
  {#if tv.standings && !right}
    <LeagueColumn league={tv.standings} />
  {:else}
    <div class="stat seats" class:many={seated.length > 10}>
      <span class="k">{t("tv.cash.seatedLabel", { n: String(cash.seated) })}</span>
      <SeatList list={seated} {tables} later={tv.later} />
      {#if !seated.length}<div class="sub">{t("tv.cash.openSeats")}</div>{/if}
    </div>
    {#if waitlist.length}
      <div class="stat seats">
        <span class="k">{t("tv.cash.waitlist")}</span>
        {#each waitlist.slice(0, WAITLIST) as w, i (w.id)}<div class="seat" use:tv.later={"deal-in"} out:fade={leave()}><span class="fig">{i + 1}</span>{w.name}<span class="waited fig">{waited(w.at)}</span></div>{/each}
        {#if waitlist.length > WAITLIST}<span class="sub">{tp("tv.cash.waitlistMore", waitlist.length - WAITLIST)}</span>{/if}
      </div>
    {/if}
  {/if}
</aside>

<section class="main" class:held={game.clock.status === "paused"}>
  <div class="level">
    <span>{now && isLimit(now.id) ? t("tv.level.limits") : t("tv.level.blinds")}</span>
    {#if game.clock.status === "paused"}<span class="pill" use:tv.later={"pop"}><span class="blink">{t("tv.status.paused")}</span></span>{/if}
    {#if game.clock.status === "idle"}<span class="pill">{t("tv.status.notStarted")}</span>{/if}
  </div>
  {#if now}<div class="gname" use:replay={[now.id, "roll"]}>{variantName(now.id)}</div>{/if}
  <div class="clock fig stakes" style:--n={stakes.length}>
    <span class="face" use:replay={[stakes, "roll"]}>{money(pair[0])}<span class="sep">/</span>{money(pair[1])}</span>
  </div>
  {#if planned}<div class="bar"><ProgressBar value={elapsed} max={planned} /></div>{/if}
  <div class="after">
    <span><span class="k">{t("tv.cash.session")}</span> <span class="fig">{clock(elapsed)}</span></span>
    {#if game.clock.status !== "idle" && planned}
      {#if cashRemaining > 0}
        <span><span class="k">{t("tv.cash.timeLeft")}</span> <span class="fig">{clock(cashRemaining)}</span></span>
        <span><span class="k">{t("tv.cash.ends")}</span> <span class="fig">~{timeOfDay(time.now + cashRemaining)}</span></span>
      {:else}
        <span class="hot-text">{t("tv.cash.lastOrbit")}</span>
      {/if}
    {/if}
  </div>
  {#if stud}<div class="callout plain"><span class="fig">{studLine(c, true)}</span></div>{/if}
  {#if now && (c.games?.length ?? 0) > 1}
    <div class="callout plain">
      <span class="k">{t("tv.cash.dealersChoice")}</span>
      <span>{t("tv.cash.nextGame", { game: variant(now.next).short })}</span>
      {#if now.nextIn !== null && game.clock.status === "running"}<span class="fig">{clock(now.nextIn)}</span>{/if}
    </div>
  {/if}
  {#if c.straddle && !stud}<div class="callout plain"><span class="k">{t("tv.cash.straddlesWelcome")}</span></div>{/if}
  {#if c.bomb.on}
    {#if side.bombDue}<div class="callout hot-callout" use:tv.later={"pop"}><span class="k">{t("tv.cash.bombNextHand")}</span>{#if tv.showMoney}<span class="fig">{money(c.bomb.ante)}</span>{/if}</div>
    {:else if side.bombIn !== null && game.clock.status === "running"}<div class="callout plain"><span class="k">{t("tv.cash.nextBomb")}</span> <span class="fig">{clock(side.bombIn)}</span></div>{/if}
  {/if}
  {#if c.highHand.on}
    <div class="callout plain" use:replay={[side.current?.at ?? 0, "pop"]}>
      <span class="k">{t("tv.cash.highHand")}</span>
      {#if side.current && highHolder}<b>{side.current.hand}</b> <span>{highHolder.name}</span>{:else}<span>{t("tv.cash.highHandOpen")}</span>{/if}
      {#if tv.showMoney}<span class="fig">{money(c.highHand.prize)}</span>{/if}
      {#if side.hhDue}<span class="hot-text">{t("tv.cash.highHandTimesUp")}</span>{:else if side.windowLeft !== null && game.clock.status === "running"}<span class="fig">{clock(side.windowLeft)}</span>{/if}
    </div>
  {/if}
  {#if c.sevenTwo.on}<div class="callout plain"><span class="k">{t("tv.cash.sevenTwoGame")}</span>{#if tv.showMoney}<span class="fig">{t("tv.cash.sevenTwoPays", { amount: money(c.sevenTwo.amount) })}</span>{/if}</div>{/if}
</section>

{#if right}
  <aside class="col right">
    {#if tv.standings}
      <LeagueColumn league={tv.standings} />
    {:else}
      {#if tv.showMoney}
        <div class="stat">
          <span class="k">{t("tv.cash.buyIn")}</span>
          <span class="v fig">{money(c.minBuyIn)}<span class="of">–{money(c.maxBuyIn)}</span></span>
        </div>
        <div class="stat">
          <span class="k">{t("tv.cash.onTable")}</span>
          <span class="v fig" use:replay={[cash.onTable, "glint"]}><Count value={cash.onTable} format={money} /></span>
        </div>
      {/if}
      {#if rake.mode === "pot"}
        <div class="stat"><span class="k">{t("tv.cash.rake")}</span><span class="v fig">{rake.pct}%</span><span class="sub">{t("tv.cash.upToAPot", { amount: money(rake.cap) })}</span></div>
      {:else if rake.mode === "seat"}
        <div class="stat"><span class="k">{t("tv.cash.seatFee")}</span><span class="v fig">{money(rake.fee)}</span></div>
      {/if}
    {/if}
  </aside>
{/if}

<TvFooter notes={game.notes} followUrl={tv.narrow ? "" : tv.followUrl}>
  {#snippet legend()}<ChipLegend chips={game.chips} size={tv.chipPx} isCash />{/snippet}
</TvFooter>

<script lang="ts">
  // a tournament on the tv: the players and the stacks on the left, the level
  // and its clock in the middle (or, on its turn, the whole bracket), the prize
  // pool and payouts on the right, the chips along the bottom
  import type { Level } from "$lib/types";
  import Digits from "../Digits.svelte";
  import Chip from "../Chip.svelte";
  import ChipLegend from "../ChipLegend.svelte";
  import Count from "../Count.svelte";
  import ProgressBar from "../ProgressBar.svelte";
  import Bracket from "../Bracket.svelte";
  import SeatList from "./SeatList.svelte";
  import LeagueColumn from "./LeagueColumn.svelte";
  import TvFooter from "./TvFooter.svelte";
  import { BANNER, GOOD, HOT } from "./cues.svelte";
  import type { TvState } from "./state.svelte";
  import { playerName } from "$lib/events";
  import { tableCounts, shootout } from "$lib/seats";
  import { roundName, placeRange } from "$lib/kinds/tournament/bracket";
  import { gameLine, isLimit, isStud, stakesText, variantName } from "$lib/variants";
  import { amt, clock, clockFace, money } from "$lib/util";
  import { sounds } from "$lib/sound";
  import { prefs } from "$lib/settings.svelte";
  import { fade } from "svelte/transition";
  import { replay, fresh, reveal } from "$lib/motion";
  import { t, tp } from "$lib/i18n";

  let { tv }: { tv: TvState } = $props();
  const game = $derived(tv.game);
  const d = $derived(tv.d!);
  const stats = $derived(tv.stats!);
  const tr = $derived(game.tourney!);

  // the warning window is the host's pick (0 = off); the last minute also blinks
  const warnMs = $derived(prefs().levelWarning * 60000);
  const running = $derived(game.clock.status === "running");
  const warning = $derived(!!warnMs && !d.level.isBreak && d.remainingMs <= warnMs && running);
  const lastMinute = $derived(warning && d.remainingMs <= 60000);
  const finalFive = $derived(!!d.next && running && d.remainingMs <= 5000);
  const warnLabel = $derived(d.remainingMs <= 60000 ? t("tv.warn.lastMinute") : t("tv.warn.minLeft", { n: String(Math.ceil(d.remainingMs / 60000)) }));
  // a wall clock doesn't pad the minutes: 8:27, not 08:27
  const timeLeft = $derived(clockFace(d.remainingMs));

  const chipsOf = (ids: string[] | undefined) => ids?.map((id) => game.chips.find((c) => c.id === id)).filter((c) => !!c) ?? [];
  const colorUpChips = $derived(chipsOf(d.level.colorUp));
  const nextColorUp = $derived(d.level.isBreak ? chipsOf(game.levels.slice(d.index + 1).find((l) => !l.isBreak)?.colorUp) : []);
  const gone = $derived(game.levels.slice(0, d.index + 1).flatMap((l) => l.colorUp ?? []));
  const levelNum = $derived(tv.levelNum);
  const rebuyOpen = $derived(tr.rebuy.on && levelNum <= tr.rebuy.untilLevel);
  // a bracket is set once it's drawn: no late entries
  const lateRegOpen = $derived(!!tr.lateRegLevel && levelNum <= tr.lateRegLevel && tr.format !== "bracket");
  const addOnBreak = $derived(tr.addOn.on && levelNum === tr.breakEvery);

  // the payout ladder fits nine places; a bigger field says how many more get paid
  const LADDER = 9;
  const ladder = $derived(
    stats.places.slice(0, LADDER).map((r) => ({ label: placeRange(r), who: r.players.filter((x) => x.out), fig: r.seat ? t("tv.tourney.seat") : money(r.amount) }))
  );

  // bounties: the biggest head still in (progressive), or the envelopes left (mystery)
  const bountyKind = $derived(tr.bounty ? tr.bountyKind : null);
  const topHead = $derived.by(() => {
    if (bountyKind !== "progressive") return null;
    const head = stats.head;
    const top = game.players.filter((p) => !p.out).sort((a, b) => (head[b.id] ?? 0) - (head[a.id] ?? 0))[0];
    return top ? { name: top.name, amount: head[top.id] ?? 0 } : null;
  });
  const envelopes = $derived(bountyKind === "mystery" ? stats.envelopes : []);

  // a shootout says how many tables have their winner
  const shoot = $derived(shootout(game));
  const tablesWon = $derived(shoot ? shoot.tables.filter((x) => x.left.length === 1).length : 0);

  // a bracket: the round being played, big enough to read across the room (byes aren't matches)
  const liveMatches = $derived(tv.bracket && tv.round ? game.matches!.filter((m) => m.round === tv.round && m.a && m.b) : []);

  // before the cards go in the air, the tv shows who sits where
  const tables = $derived(tableCounts(game).length);
  const seating = $derived(
    game.clock.status === "idle" && tables ? game.players.filter((p) => p.seat && !p.out).sort((a, b) => a.seat!.table - b.seat!.table || a.seat!.seat - b.seat!.seat) : []
  );

  // the numbers a level is played for, as the board's cells: blinds and an
  // ante, a limit game's bets (and its blinds), or stud's bets, ante and bring-in
  function cells(l: Level, afterBreak = false): { k: string; v: string[] }[] {
    const limits = { k: afterBreak ? t("tv.level.limitsAfterBreak") : t("tv.level.limits"), v: [amt(l.bb), amt(l.bb * 2)] };
    if (isStud(l.game)) return [limits, { k: t("tv.level.ante"), v: [amt(l.ante)] }, { k: t("tv.level.bringIn"), v: [amt(l.bringIn ?? 0)] }];
    if (isLimit(l.game)) return [limits, { k: t("tv.level.blinds"), v: [amt(l.sb), amt(l.bb)] }];
    return [{ k: afterBreak ? t("tv.level.blindsAfterBreak") : t("tv.level.blinds"), v: [amt(l.sb), amt(l.bb)] }, ...(l.ante ? [{ k: t("tv.level.ante"), v: [amt(l.ante)] }] : [])];
  }
  // the strip shrinks to fit long numbers (3,000/6,000 plus an ante): its width in characters goes to css as --n
  const stripLen = (cs: { v: string[] }[]) => cs.reduce((n, c) => n + c.v.join("/").length, 0) + (cs.length - 1) * 2.5 || 1;
  // the game on the board: this level's, or on a break the one coming
  const shownGame = $derived(d.level.isBreak ? d.next?.game : d.level.game);

  // ---------- the room hears it ----------
  const say = (n: number) => n.toLocaleString("en-US");
  /** a level in words: its blinds, or another game's name and what it's played for */
  function levelVoice(l: Level) {
    const level = String(levelNum);
    if (l.isBreak) return tp("tv.voice.breakTime", l.minutes);
    if (!l.game) return l.ante ? t("tv.voice.levelBlindsAnte", { level, sb: say(l.sb), bb: say(l.bb), ante: say(l.ante) }) : t("tv.voice.levelBlinds", { level, sb: say(l.sb), bb: say(l.bb) });
    const game = variantName(l.game);
    if (isStud(l.game)) return t("tv.voice.levelStud", { level, game, ante: say(l.ante), bringIn: say(l.bringIn ?? 0), small: say(l.bb), big: say(l.bb * 2) });
    if (isLimit(l.game)) return t("tv.voice.levelLimit", { level, game, small: say(l.bb), big: say(l.bb * 2) });
    return l.ante ? t("tv.voice.levelGameAnte", { level, game, sb: say(l.sb), bb: say(l.bb), ante: say(l.ante) }) : t("tv.voice.levelGame", { level, game, sb: say(l.sb), bb: say(l.bb) });
  }

  // a new level flashes the middle, beeps, and (after the beeps) says what it is
  let lastIndex = -1;
  let flashLevel = $state(false);
  $effect(() => {
    if (lastIndex !== -1 && d.index !== lastIndex) {
      flashLevel = true;
      setTimeout(() => (flashLevel = false), 2500);
      tv.cues.cue(d.level.isBreak ? sounds.break : sounds.level, d.level.isBreak ? GOOD : BANNER, 3);
      tv.cues.say(levelVoice(d.level), 1300);
    }
    lastIndex = d.index;
  });

  // the last five seconds of a level (or a break) tick out loud, one a second
  // (the clock gives a small pulse with each one)
  let ticked = -1;
  let tickKey = $state(0);
  $effect(() => {
    if (!finalFive) return;
    const left = Math.ceil(d.remainingMs / 1000);
    if (left < 1 || left === ticked) return;
    ticked = left;
    tickKey++;
    tv.cues.cue(() => sounds.tick(left), HOT, 1);
  });

  let warned = -1;
  $effect(() => {
    if (!warning || warned === d.index) return;
    warned = d.index;
    tv.cues.cue(sounds.warn, HOT, 2);
    tv.cues.say(tp("tv.voice.minutesLeftAtBlinds", Math.round(warnMs / 60000)), 700);
  });

  // the bubble bursting runs a glint down the payout ladder, once
  let wasItm: boolean | null = null;
  let burst = $state(false);
  $effect(() => {
    if (wasItm === false && stats.itm) {
      burst = true;
      setTimeout(() => (burst = false), 2600);
    }
    wasItm = stats.itm;
  });
</script>

<aside class="col left">
  <div class="stat">
    <span class="k">{t("tv.tourney.players")}</span>
    <span class="v fig"><span class="n" use:replay={[stats.left, "tumble"]}>{stats.left}</span><span class="of">/{stats.entrants}</span></span>
    {#if stats.bubble}<span class="sub hot-text" use:tv.later={"stamp"}>{t("tv.tourney.onBubble")}</span>{:else if stats.itm}<span class="sub good-text" use:tv.later={"stamp"}>{t("tv.tourney.inTheMoney")}</span>{/if}
  </div>
  {#if tv.bracket}
    <div class="stat matches" class:many={liveMatches.length > 5}>
      <span class="k">{tv.round ? roundName(game, tv.round) : ""}</span>
      {#each liveMatches as m, i (m.slot)}
        <div class="match" style:--i={i} use:tv.later={"deal-in"}>
          <span class:won={m.winner === m.a} class:lost={!!m.winner && m.winner !== m.a}>{playerName(game, m.a, "")}</span>
          <span class="vs">{t("tv.bracket.vs")}</span>
          <span class:won={m.winner === m.b} class:lost={!!m.winner && m.winner !== m.b}>{playerName(game, m.b, "")}</span>
        </div>
      {/each}
    </div>
  {:else if seating.length}
    <div class="stat seats" class:many={seating.length > 10}>
      <span class="k">{t("tv.tourney.seats")}</span>
      <SeatList list={seating} {tables} later={tv.later} />
    </div>
  {:else}
    <div class="stat">
      <span class="k">{t("tv.tourney.avgStack")}</span>
      <span class="v fig"><Count value={Math.round(stats.avgStack)} format={(n) => amt(n)} /></span>
      {#if !d.level.isBreak && d.level.bb}<span class="sub fig">{tp("tv.tourney.bigBlinds", Math.round(stats.avgStack / d.level.bb))}</span>{/if}
    </div>
    {#if tr.rebuy.on || tr.addOn.on}
      <div class="stat pair">
        {#if tr.rebuy.on}<div><span class="k">{t("tv.tourney.rebuys")}</span><span class="v fig" use:replay={[stats.rebuys, "pop"]}>{stats.rebuys}</span></div>{/if}
        {#if tr.addOn.on}<div><span class="k">{t("tv.tourney.addOns")}</span><span class="v fig" use:replay={[stats.addOns, "pop"]}>{stats.addOns}</span></div>{/if}
      </div>
    {/if}
  {/if}
  <div class="notes-col">
    {#if tv.seats}<span>{tp("tv.tourney.satelliteSeats", tv.seats)}{#if tv.showMoney}{" · "}<span class="fig">{money(tr.satellite!.seatValue)}</span>{/if}</span>{/if}
    {#if shoot && shoot.tables.length > 1 && !shoot.final}<span use:replay={[tablesWon, "pop"]}>{t("tv.tourney.shootoutTables", { won: String(tablesWon), tables: String(shoot.tables.length) })}</span>
    {:else if shoot?.final}<span class="good-text">{t("tv.tourney.shootoutFinal")}</span>{/if}
    {#if lateRegOpen}<span class="good-text">{t("tv.tourney.lateRegOpen", { level: String(tr.lateRegLevel) })}</span>{/if}
    {#if rebuyOpen}<span class="good-text">{t("tv.tourney.rebuysOpen", { level: String(tr.rebuy.untilLevel) })}</span>{/if}
    {#if game.clock.status !== "idle"}<span>{t("tv.tourney.elapsed")} <span class="fig">{clock(d.totalElapsedMs)}</span></span>{/if}
  </div>
</aside>

<section class="main" class:flash={flashLevel} class:hot={warning} class:last={lastMinute} class:final={finalFive} class:held={game.clock.status === "paused"}>
  {#if tv.bracketTurn}
    <div class="bracket-wrap" in:fade={reveal()}><Bracket {game} tv from={tv.bracketFrom} /></div>
  {:else}
    <div class="level">
      <span use:replay={[d.index, "roll"]}>{#if d.level.isBreak}{t("tv.level.break")}{:else}{t("tv.level.levelNum", { n: String(levelNum) })}{/if}</span>
      {#if game.clock.status === "paused"}<span class="pill" use:tv.later={"pop"}><span class="blink">{t("tv.status.paused")}</span></span>{/if}
      {#if game.clock.status === "idle"}<span class="pill">{t("tv.status.notStarted")}</span>{/if}
      {#if warning}<span class="pill warn-pill" use:tv.later={"stamp"}>{warnLabel}</span>{/if}
    </div>
    {#if shownGame}<div class="gname" use:replay={[d.index, "roll"]}>{#if d.level.isBreak}<span class="k">{t("tv.level.nextGame")}</span>{/if}{variantName(shownGame)}</div>{/if}
    <!-- three layers so each motion owns one: the final-minute blink, the
         last-five-seconds pulse, and the new level rolling in -->
    <div class="clock fig" class:long={timeLeft.length > 5}>
      <span class="pulse" use:replay={[tickKey, "tick"]}><span class="face" use:replay={[d.index, "roll"]}><Digits value={timeLeft} /></span></span>
    </div>
    <div class="bar"><ProgressBar value={d.progress} /></div>

    {#if d.level.isBreak}
      {#if d.next}{@render strip(d.next, true)}{/if}
      {#if nextColorUp.length || addOnBreak}
        <div class="callouts">
          {#if nextColorUp.length}
            <div class="callout" use:tv.later={"pop"}>
              <span class="k">{t("tv.level.colorUpNow")}</span>
              {#each nextColorUp as c, i (c.id)}<span class="flip" style:--i={i} use:tv.later={"flip-in"}><Chip chip={c} size={tv.chipPx} /></span>{/each}
            </div>
          {/if}
          {#if addOnBreak}
            <div class="callout" use:tv.later={"pop"}><span class="k">{t("tv.level.addOnsOpen")}</span><span class="fig">{money(tr.addOn.cost)}</span> {t("tv.level.addOnsFor")} <span class="fig">{amt(tr.addOn.chips)}</span></div>
          {/if}
        </div>
      {/if}
    {:else}
      {@render strip(d.level, false)}
      <div class="after">
        <span>
          <span class="k">{t("tv.level.nextLevel")}</span>
          {#if d.next}<span class="fig" use:replay={[d.index, "roll"]}>{#if d.next.game}{d.next.game !== d.level.game ? gameLine(d.next) : stakesText(d.next)}{:else}{amt(d.next.sb)}/{amt(d.next.bb)}{d.next.ante ? ` · ${t("tv.level.anteSuffix", { n: amt(d.next.ante) })}` : ""}{/if}</span>{:else}{t("tv.level.finalLevel")}{/if}
        </span>
        {#if d.nextBreakInMs !== null}<span><span class="k">{t("tv.level.nextBreak")}</span> <span class="fig">{clock(d.nextBreakInMs)}</span></span>{/if}
      </div>
      {#if colorUpChips.length && d.elapsedMs < 5 * 60000}
        <div class="callout" use:tv.later={"pop"}>
          <span class="k">{t("tv.level.colorUp")}</span>
          {#each colorUpChips as c, i (c.id)}<span class="flip" style:--i={i} use:tv.later={"flip-in"}><Chip chip={c} size={tv.chipPx} /></span>{/each}
        </div>
      {/if}
    {/if}
  {/if}
</section>

<aside class="col right">
  {#if tv.standings}
    <LeagueColumn league={tv.standings} />
  {:else}
    {#if tv.showMoney}
      <div class="stat">
        <span class="k">{t("tv.tourney.prizePool")}</span>
        <span class="v fig" use:replay={[stats.pool, "glint"]}><Count value={stats.pool} format={money} /></span>
      </div>
    {/if}
    <div class="stat">
      <span class="k">{tv.showMoney ? t("tv.tourney.payouts") : t("tv.tourney.pays")}</span>
      {#if tv.showMoney}
        <!-- places fill in as players finish in the money: their name stamps onto the line -->
        <ol class="ladder" class:burst>
          {#each ladder as l, i (i)}
            <li style:--i={i}>
              <span class="place">{l.label}</span>
              {#if l.who.length}<span class="who" use:fresh={[l.who[0].bustedAt, "stamp"]}>{l.who.map((x) => x.name).join(", ")}</span>{/if}
              <span class="fig">{l.fig}</span>
            </li>
          {/each}
        </ol>
        {#if stats.places.length > LADDER}<span class="sub">{tp("tv.tourney.morePaid", stats.places.length - LADDER)}</span>{/if}
      {:else}
        <span class="v">{t("tv.tourney.topN", { n: String(stats.paid) })}</span>
      {/if}
    </div>
    {#if bountyKind}
      <div class="notes-col">
        {#if bountyKind === "progressive"}
          <span>{t("tv.tourney.progressiveBounties")}</span>
          {#if topHead}<span>{t("tv.tourney.biggestBounty")} <b>{topHead.name}</b>{#if tv.showMoney}{" "}<span class="fig" use:replay={[topHead.amount, "pop"]}>{money(topHead.amount)}</span>{/if}</span>{/if}
        {:else if bountyKind === "mystery"}
          {#if game.mystery}
            <span><span use:replay={[envelopes.length, "pop"]}>{tp("tv.tourney.envelopesLeft", envelopes.length)}</span>{#if tv.showMoney && envelopes.length}{" · "}{t("tv.tourney.topEnvelope")}{" "}<span class="fig">{money(envelopes[0])}</span>{/if}</span>
          {:else}
            <span>{t("tv.tourney.mysteryFrom", { n: String(stats.mysteryAt) })}</span>
          {/if}
        {:else}
          <span>{#if tv.showMoney}<span class="fig">{money(tr.bounty)}</span> {/if}{t("tv.tourney.bountyOnEveryHead")}</span>
        {/if}
      </div>
    {/if}
  {/if}
</aside>

<TvFooter notes={game.notes} followUrl={tv.narrow ? "" : tv.followUrl}>
  {#snippet legend()}<ChipLegend chips={game.chips} size={tv.chipPx} dim={gone} />{/snippet}
</TvFooter>

{#snippet strip(l: Level, afterBreak: boolean)}
  {@const cs = cells(l, afterBreak)}
  <div class="strip" style:--n={stripLen(cs)}>
    {#each cs as c, i (i)}
      <div class="cell">
        <span class="k">{c.k}</span>
        <span class="v fig" use:replay={[d.index, "roll"]}>{c.v[0]}{#if c.v.length > 1}<span class="sep">/</span>{c.v[1]}{/if}</span>
      </div>
    {/each}
  </div>
{/snippet}

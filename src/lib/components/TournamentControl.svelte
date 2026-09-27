<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import Digits from "$lib/components/Digits.svelte";
  import Play from "@lucide/svelte/icons/play";
  import Pause from "@lucide/svelte/icons/pause";
  import ChevronLeft from "@lucide/svelte/icons/chevron-left";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import Trophy from "@lucide/svelte/icons/trophy";
  import Minus from "@lucide/svelte/icons/minus";
  import Plus from "@lucide/svelte/icons/plus";
  import Skull from "@lucide/svelte/icons/skull";
  import Coffee from "@lucide/svelte/icons/coffee";
  import Handshake from "@lucide/svelte/icons/handshake";
  import Ticket from "@lucide/svelte/icons/ticket";
  import type { Game } from "$lib/types";
  import * as clk from "$lib/clock";
  import {
    addPlayer,
    bust,
    unbust,
    tourneyStats,
    logEvent,
    flash,
    creditKo,
    koCount,
    paidFor,
    seatsDrawn,
    seatLabel,
    tableCounts,
    bountyBook,
    envelopesLeft,
    mysteryStartsAt,
    fitEnvelopes,
    setEnvelopes,
    settleUp,
    HOUSE,
    shootout,
    drawFinalTable,
    drawBracket,
    decideMatch,
    matchesPlayed,
    currentRound,
    roundName,
    bracketSize,
    payGroups,
    placeRange,
  } from "$lib/game";
  import { annotate } from "$lib/blinds";
  import { distribute } from "$lib/chips";
  import { amt, clock, clockFace, money, ordinal, timeOfDay } from "$lib/util";
  import { time } from "$lib/now.svelte";
  import { getGame } from "$lib/store";
  import StructureTable from "./StructureTable.svelte";
  import DealCalc from "./DealCalc.svelte";
  import SettleMoves from "./SettleMoves.svelte";
  import Costs from "./Costs.svelte";
  import SeatTools from "./SeatTools.svelte";
  import Bracket from "./Bracket.svelte";
  import { prefs, settings } from "$lib/settings.svelte";
  import { provide } from "$lib/commands.svelte";
  import ChipLegend from "./ChipLegend.svelte";
  import Breakdown from "./Breakdown.svelte";
  import ChipStack from "./ChipStack.svelte";
  import Count from "./Count.svelte";
  import Kbd from "./Kbd.svelte";
  import ProgressBar from "./ProgressBar.svelte";
  import RemoveButton from "./RemoveButton.svelte";
  import { fade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { bump, fresh, reveal, reorder, slide } from "$lib/motion";
  import { play } from "$lib/sound";
  import { t as tt, tp } from "$lib/i18n";

  let { game = $bindable(), persist }: { game: Game; persist: () => void } = $props();

  const t = $derived(game.tourney!);
  // only a running clock needs the time: paused or not started, nothing here ticks
  const d = $derived(clk.derive(game, game.clock.status === "running" ? time.now : 0));
  const s = $derived(tourneyStats(game));
  const running = $derived(game.clock.status === "running");
  const levelNum = $derived(d.level.isBreak ? game.levels.slice(0, d.index).filter((l) => !l.isBreak).length : (d.level.num ?? 0));
  const lateRegOpen = $derived(levelNum <= t.lateRegLevel);
  const rebuyOpen = $derived(t.rebuy.on && levelNum <= t.rebuy.untilLevel);
  const ranked = $derived(
    [...game.players].sort((a, b) => (a.out === b.out ? (a.out ? (a.place ?? 0) - (b.place ?? 0) : 0) : a.out ? 1 : -1))
  );

  let newName = $state("");
  let editStructure = $state(false);
  let showDeal = $state(false);

  // the clock goes red this long before the blinds go up (settings; 0 = off)
  const warnMs = $derived(prefs().levelWarning * 60000);
  const hot = $derived(running && !d.level.isBreak && !!warnMs && d.remainingMs < warnMs);

  const alive = $derived(game.players.filter((p) => !p.out));
  const drawn = $derived(seatsDrawn(game));
  // tools the host switched off (Settings > Your Game) stay hidden, unless this game already uses them
  // a heads-up bracket seats people by its matches, so the seat draw sits it out
  const bracket = $derived(t.format === "bracket");
  const seatsOn = $derived(!bracket && (settings.useSeats || drawn));
  const kosOn = $derived(settings.useBounties || !!t.bounty || !!game.kos?.some((k) => k.by));
  const dealsOn = $derived(settings.useDeals || !!game.deal);
  const tables = $derived(tableCounts(game).length);
  let seatTools = $state<SeatTools>();
  // knockouts get a column once there's a bounty or anyone's been credited
  const showKos = $derived(!!t.bounty || !!game.kos?.some((k) => k.by));
  const lastKo = (id: string) => game.kos?.findLast((k) => k.out === id)?.by ?? "";
  // payout rows: the table's places, or (after a deal) everyone who took a share
  const payRows = $derived(
    Array.from({ length: game.deal ? Object.keys(game.deal.amounts).length : s.payouts.length }, (_, i) => i)
  );
  // settle-up: the payouts once there's a winner, and shared costs (the switch, unless this game has some)
  const costsOn = $derived(settings.useCosts || !!game.costs?.length);
  const moves = $derived(settleUp(game));
  const settleShown = $derived(game.finished || !!game.costs?.length);
  // a shootout plays each table down to one winner, then a final table
  const shoot = $derived(shootout(game));
  // the satellite's seats, and the game each ticket holder won theirs in
  const seats = $derived(t.satellite ? s.seats : 0);
  const ticketFrom = (id: string) => getGame(id)?.name ?? "";
  // no chop in a satellite (the seats are the prize), or before a shootout's final table
  const canDeal = $derived(!game.finished && alive.length >= 2 && alive.length <= 9 && game.clock.status !== "idle" && !t.satellite && (!shoot || shoot.final));

  // bounties: who's taken what, and (progressive) what's on each head now
  const book = $derived(bountyBook(game));
  const pko = $derived(!!t.bounty && t.bountyKind === "progressive");
  const mystery = $derived(!!t.bounty && t.bountyKind === "mystery");
  const left = $derived(envelopesLeft(game));
  const openedList = $derived.by(() => {
    const name = (id: string | null) => game.players.find((p) => p.id === id)?.name ?? "?";
    return [
      ...(game.kos ?? []).filter((k) => k.by && k.prize !== undefined).map((k) => ({ at: k.at, name: name(k.by), prize: k.prize! })),
      ...Object.entries(game.mystery?.own ?? {}).map(([id, prize]) => ({ at: game.endedAt ?? 0, name: name(id), prize })),
    ].sort((a, b) => b.at - a.at);
  });
  let editingEnvelopes = $state(false);
  let envelopeText = $state("");
  let envelopeBad = $state(false);
  function saveEnvelopes(e: SubmitEvent) {
    e.preventDefault();
    const amounts = envelopeText.split(/[\s,]+/).filter(Boolean).map(Number);
    envelopeBad = !setEnvelopes(game, amounts);
    if (envelopeBad) return;
    persist();
    editingEnvelopes = false;
  }
  // ---- a heads-up bracket ----
  // it can be drawn again (with whoever's in now) until a match has been played
  const canDraw = $derived(bracket && !game.finished && alive.length >= 2 && matchesPlayed(game) === 0);
  function drawTheBracket() {
    play("seats", { n: alive.length });
    act(() => drawBracket(game));
  }
  function pickWinner(i: number, id: string) {
    act(() => decideMatch(game, i, id));
    if (game.flash?.kind === "bounty" && Date.now() - game.flash.at < 1000) play(mystery ? "jackpot" : "chips");
  }
  const bracketRound = $derived(bracket ? currentRound(game) : null);
  // payouts by round: 1st, 2nd, then 3rd to 4th, 5th to 8th ... sharing
  const groups = $derived(bracket && !game.deal ? payGroups(s.entrants, s.payouts.length) : null);

  function finalTable() {
    play("seats", { n: alive.length });
    act(() => drawFinalTable(game));
  }

  function credit(outId: string, byId: string | null) {
    act(() => creditKo(game, outId, byId));
    // an envelope opened or a bounty collected, right here
    if (game.flash?.kind === "bounty" && Date.now() - game.flash.at < 1000) play(mystery ? "jackpot" : "chips");
  }

  const cols = $derived(2 + +drawn + +t.rebuy.on + +t.addOn.on + +showKos + +pko);
  // where the money is: one bust off it, or in it
  const moneyState = $derived(s.bubble ? "bubble" : s.itm ? "itm" : "");

  // the first press of the night shuffles the deck; after that the clock winds
  // down and back up like a tape machine
  const startSound = $derived(running ? "pause" : game.clock.status === "idle" ? "riffle" : "resume");

  // seats just drawn (here or from the palette): deal the labels out row by row
  const opened = Date.now();
  let dealtAt = $state(0);
  $effect(() => {
    const f = game.flash;
    if (f?.kind === "draw" && f.at > opened) dealtAt = f.at;
  });
  const dealing = $derived(time.now - dealtAt < 1500);

  // the game just ended in front of us: rake the pot over to the winner
  let wasFinished: boolean | null = null;
  $effect(() => {
    const f = game.finished;
    if (f && wasFinished === false) setTimeout(() => play("ship"), 160);
    wasFinished = f;
  });

  // a few stacks of the game's own chips, biggest first
  const pot = $derived([...game.chips].sort((a, b) => b.value - a.value).slice(0, 4));

  function act(fn: () => void) {
    fn();
    persist();
  }

  // clk.STATUS_LABEL (clock.ts) is English only; this game screen shows its
  // own translated labels for the same three statuses instead.
  const statusLabel = $derived({ idle: tt("gamePlay.shared.statusIdle"), running: tt("gamePlay.shared.statusRunning"), paused: tt("gamePlay.shared.statusPaused") });

  const toggle = () =>
    act(() => {
      const wasIdle = game.clock.status === "idle";
      const wasRunning = running;
      clk.toggle(game);
      logEvent(game, wasRunning ? tt("gamePlay.tournament.clockPausedLog") : wasIdle ? tt("gamePlay.tournament.shuffleUpLog") : tt("gamePlay.tournament.clockResumedLog"));
      if (wasIdle) flash(game, tt("gamePlay.tournament.shuffleUpLog"), "shuffle");
    });

  function addNamed(name: string) {
    if (!name.trim()) return;
    // a bracket takes a new player only until its first match is played, and draws again to fit them
    if (bracket && game.matches && matchesPlayed(game) > 0) return void alert(tt("gamePlay.bracket.startedAlert"));
    if (bracket && game.matches) return act(() => (addPlayer(game, name), drawBracket(game)));
    if (!lateRegOpen && game.clock.status !== "idle" && !confirm(tt("gamePlay.tournament.lateRegClosedConfirm"))) return;
    act(() => addPlayer(game, name));
  }

  function add(e: SubmitEvent) {
    e.preventDefault();
    addNamed(newName);
    newName = "";
  }

  function rebuy(id: string, delta: number) {
    const p = game.players.find((x) => x.id === id)!;
    act(() => {
      p.rebuys = Math.max(0, p.rebuys + delta);
      fitEnvelopes(game);
      if (delta > 0) {
        if (p.out) unbust(game, id, true);
        logEvent(game, tt("gamePlay.tournament.reboughtLog", { name: p.name, cost: money(t.rebuy.cost) }));
        flash(game, tt("gamePlay.tournament.rebuysFlash", { name: p.name }), "chips");
      }
    });
  }

  function addOn(id: string, delta: number) {
    const p = game.players.find((x) => x.id === id)!;
    act(() => {
      p.addOns = Math.max(0, p.addOns + delta);
      if (delta > 0) logEvent(game, tt("gamePlay.tournament.addOnLog", { name: p.name }));
    });
  }

  function removePlayer(id: string) {
    const p = game.players.find((x) => x.id === id)!;
    if (bracket && game.matches && matchesPlayed(game) > 0) return void alert(tt("gamePlay.bracket.startedAlert"));
    if (!confirm(tt("gamePlay.tournament.removeConfirm", { name: p.name }))) return;
    act(() => {
      game.players = game.players.filter((x) => x.id !== id);
      if (bracket && game.matches) drawBracket(game);
      fitEnvelopes(game);
      logEvent(game, tt("gamePlay.shared.removedLog", { name: p.name }));
    });
  }

  // the palette (ctrl k) knows this game while it's on screen. each command
  // makes the same sound as the button it stands in for.
  $effect(() =>
    provide("tourney", () => [
      { id: "t:clock", label: running ? tt("gamePlay.tournament.cmdPauseClock") : game.clock.status === "idle" ? tt("gamePlay.tournament.cmdStartClock") : tt("gamePlay.tournament.cmdResumeClock"), group: tt("gamePlay.shared.groupThisGame"), hint: "Space", run: () => (play(startSound), toggle()) },
      { id: "t:next", label: tt("gamePlay.tournament.cmdNextLevel"), group: tt("gamePlay.shared.groupThisGame"), hint: "→", run: () => (play("flap"), act(() => clk.step(game, 1))) },
      { id: "t:back", label: tt("gamePlay.tournament.cmdPreviousLevel"), group: tt("gamePlay.shared.groupThisGame"), hint: "←", run: () => (play("flapBack"), act(() => clk.step(game, -1))) },
      { id: "t:plus", label: tt("gamePlay.tournament.cmdAddMinute"), group: tt("gamePlay.shared.groupThisGame"), keywords: "+1 time", run: () => (play("wind"), act(() => clk.addTime(game, 60000))) },
      { id: "t:minus", label: tt("gamePlay.tournament.cmdTakeMinuteOff"), group: tt("gamePlay.shared.groupThisGame"), keywords: "-1 time", run: () => (play("unwind"), act(() => clk.addTime(game, -60000))) },
      { id: "t:add", label: tt("gamePlay.tournament.cmdAddPlayer"), group: tt("gamePlay.shared.groupThisGame"), keywords: "register entry seat", prompt: tt("gamePlay.tournament.cmdAddPlayerPrompt"), run: (name: string) => (play("chips"), addNamed(name)) },
      ...(seatsOn ? [{ id: "t:seats", label: drawn ? tt("gamePlay.shared.redrawSeats") : tt("gamePlay.shared.drawSeats"), group: tt("gamePlay.shared.groupThisGame"), keywords: "tables shuffle", run: () => seatTools?.draw() }] : []),
      { id: "t:structure", label: tt("gamePlay.tournament.cmdEditStructure"), group: tt("gamePlay.shared.groupThisGame"), keywords: "blinds levels", run: () => (play("open"), (editStructure = true)) },
      ...(shoot?.ready ? [{ id: "t:final", label: tt("gamePlay.tournament.drawFinalTable"), group: tt("gamePlay.shared.groupThisGame"), keywords: "shootout final table seats", run: finalTable }] : []),
      ...(canDeal && dealsOn ? [{ id: "t:deal", label: tt("gamePlay.tournament.cmdDealCalculator"), group: tt("gamePlay.shared.groupThisGame"), keywords: "icm chop split", run: () => (play("open"), (showDeal = true)) }] : []),
      ...(canDraw ? [{ id: "t:bracket", label: game.matches ? tt("gamePlay.bracket.redraw") : tt("gamePlay.bracket.draw"), group: tt("gamePlay.shared.groupThisGame"), keywords: "heads up matches seeds", run: drawTheBracket }] : []),
      ...(game.matches ?? []).flatMap((m, i) =>
        !m.winner && m.a && m.b
          ? [m.a, m.b].map((w) => ({ id: `t:match:${i}:${w}`, label: tt("gamePlay.bracket.cmdBeats", { winner: game.players.find((p) => p.id === w)?.name ?? "?", loser: game.players.find((p) => p.id === (w === m.a ? m.b : m.a))?.name ?? "?" }), group: tt("gamePlay.shared.groupPlayers"), keywords: "match won heads up", run: () => (play("bust"), pickWinner(i, w)) }))
          : []
      ),
      ...(bracket ? [] : alive).map((p) => ({ id: `t:bust:${p.id}`, label: tt("gamePlay.tournament.bustCommandLabel", { name: p.name }), group: tt("gamePlay.shared.groupPlayers"), keywords: "out eliminate", run: () => (play("bust"), act(() => bust(game, p.id))) })),
      ...(t.rebuy.on && rebuyOpen ? game.players.map((p) => ({ id: `t:rebuy:${p.id}`, label: tt("gamePlay.tournament.rebuyCommandLabel", { name: p.name }), group: tt("gamePlay.shared.groupPlayers"), hint: money(t.rebuy.cost), run: () => (play("chips"), rebuy(p.id, 1)) })) : []),
      ...(t.addOn.on ? alive.map((p) => ({ id: `t:addon:${p.id}`, label: tt("gamePlay.tournament.addOnCommandLabel", { name: p.name }), group: tt("gamePlay.shared.groupPlayers"), hint: money(t.addOn.cost), run: () => (play("chips"), addOn(p.id, 1)) })) : []),
      ...game.players.filter((p) => p.out && !game.deal && !bracket).map((p) => ({ id: `t:unbust:${p.id}`, label: tt("gamePlay.tournament.undoBustCommandLabel", { name: p.name }), group: tt("gamePlay.shared.groupPlayers"), run: () => (play("rewind"), act(() => unbust(game, p.id))) })),
    ])
  );

  // the shortcut keys push their on-screen buttons and <kbd> hints down too
  let held = $state("");

  function onKey(e: KeyboardEvent) {
    const tag = (e.target as HTMLElement).tagName;
    if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(tag)) return;
    if (![" ", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    if (e.repeat) return;
    held = e.key;
    if (e.key === " ") {
      play(startSound);
      toggle();
    }
    if (e.key === "ArrowRight") {
      play("flap");
      act(() => clk.step(game, 1));
    }
    if (e.key === "ArrowLeft") {
      play("flapBack");
      act(() => clk.step(game, -1));
    }
  }
</script>

<svelte:window onkeydown={onKey} onkeyup={() => (held = "")} onblur={() => (held = "")} />

<!-- clock -->
<section class="clockbox" class:brk={d.level.isBreak} class:hot class:paused={game.clock.status === "paused"}>
  <div class="spread">
    <div>
      <div class="lvl">
        <span use:bump={d.index}>{#if d.level.isBreak}<Icon icon={Coffee} /> {tt("gamePlay.shared.breakLabel")}{:else}{tt("gamePlay.tournament.level", { n: String(levelNum) })}{/if}</span>
        <span class="pill" data-s={game.clock.status}>{statusLabel[game.clock.status]}</span>
      </div>
      <div class="clockface" dir="ltr"><Digits value={clockFace(d.remainingMs)} /></div>
    </div>
    <div class="blinds text-right">
      {#if d.level.isBreak}
        <div class="muted small">{tt("gamePlay.tournament.next")}</div>
        {#if d.next}<div class="num bb" dir="ltr">{amt(d.next.sb)}/{amt(d.next.bb)}</div>{/if}
      {:else}
        <div class="num bb" dir="ltr"><span use:bump={d.index}>{amt(d.level.sb)}/{amt(d.level.bb)}</span></div>
        {#if d.level.ante}<div class="num">{tt("gamePlay.shared.ante")} {amt(d.level.ante)}</div>{/if}
        <div class="small muted">{d.next ? tt("gamePlay.tournament.nextColon", { sb: amt(d.next.sb), bb: amt(d.next.bb) }) : tt("gamePlay.tournament.finalLevel")}</div>
      {/if}
    </div>
  </div>
  <ProgressBar value={d.progress} />
  <div class="row controls mt-2 max-[600px]:grid max-[600px]:grid-cols-[repeat(2,minmax(0,1fr))]">
    <button class="big max-[600px]:col-span-full" class:down={held === " "} data-sound={startSound} onclick={toggle}><Icon icon={running ? Pause : Play} />{running ? tt("gamePlay.tournament.pause") : game.clock.status === "idle" ? tt("gamePlay.tournament.start") : tt("gamePlay.tournament.resume")}</button>
    <button class:down={held === "ArrowLeft"} data-sound="flapBack" onclick={() => act(() => clk.step(game, -1))}><span class="flip-rtl inline-flex"><Icon icon={ChevronLeft} /></span>{tt("common.back")}</button>
    <button class:down={held === "ArrowRight"} data-sound="flap" onclick={() => act(() => clk.step(game, 1))}>{tt("common.next")}<span class="flip-rtl inline-flex"><Icon icon={ChevronRight} /></span></button>
    <button data-sound="unwind" onclick={() => act(() => clk.addTime(game, -60000))}>{tt("gamePlay.tournament.minusMinute")}</button>
    <button data-sound="wind" onclick={() => act(() => clk.addTime(game, 60000))}>{tt("gamePlay.tournament.plusMinute")}</button>
    <span class="small muted keys-hint max-[600px]:col-span-full"><Kbd k="Space" class={held === " " ? "down" : ""} /> {tt("gamePlay.tournament.pause")} · <Kbd k="←" class={held === "ArrowLeft" ? "down" : ""} /><Kbd k="→" class={held === "ArrowRight" ? "down" : ""} /> {tt("gamePlay.tournament.keysHintLevels")}</span>
  </div>
</section>

<div class="stats">
  <div>
    <span>{tt("gamePlay.shared.groupPlayers")}</span><b class="num" use:bump={s.left * 1000 + s.entrants}>{s.left}/{s.entrants}</b>
    {#key moneyState}
      {#if moneyState === "bubble"}<small class="bubble pop text-accent">{tt("gamePlay.tournament.bubbleTag")}</small>{:else if moneyState === "itm"}<small class="good pop">{tt("gamePlay.tournament.itmTag")}</small>{/if}
    {/key}
  </div>
  <div><span>{tt("gamePlay.tournament.avgStackLabel")}</span><b class="num" use:bump={Math.round(s.avgStack)}><Count value={Math.round(s.avgStack)} format={amt} /></b>{#if d.level.bb}<small> {Math.round(s.avgStack / d.level.bb)}bb</small>{/if}</div>
  <div><span>{tt("gamePlay.tournament.prizePoolLabel")}</span><b class="num" use:bump={s.pool}><Count value={s.pool} format={money} /></b></div>
  <div><span>{tt("gamePlay.tournament.chipsInPlayLabel")}</span><b class="num" use:bump={s.chipsInPlay}><Count value={s.chipsInPlay} format={amt} /></b></div>
  <div><span>{tt("gamePlay.tournament.nextBreakLabel")}</span><b class="num">{d.nextBreakInMs === null ? tt("gamePlay.tournament.none") : clock(d.nextBreakInMs)}</b></div>
  <div><span>{tt("gamePlay.tournament.elapsedLabel")}</span><b class="num">{clock(d.totalElapsedMs)}</b>{#if game.clock.startedAt}<small> {tt("gamePlay.tournament.sinceTime", { time: timeOfDay(game.clock.startedAt) })}</small>{/if}</div>
</div>

{#if game.finished}
  <div class="warn pop won my-[14px] flex items-end flex-wrap gap-x-4 gap-y-1.5">
    <p class="m-0 self-center">
      {#if game.deal}<Icon icon={Handshake} /> {tt("gamePlay.tournament.dealBanner", { names: game.players.filter((p) => p.id in game.deal!.amounts).map((p) => p.name).join(", ") })}
      {:else if seats > 1}<Icon icon={Ticket} /> {tt("gameEvents.seatsWonFlash", { names: game.players.filter((p) => p.place && p.place <= seats).map((p) => p.name).join(", ") })}
      {:else}<Icon icon={Trophy} /> <b>{game.players.find((p) => p.place === 1)?.name}</b> {tt("gamePlay.tournament.winnerSuffix")}{/if}
      {tt("gamePlay.tournament.tvShowingResults")}
    </p>
    <!-- the pot, pushed across and stacked -->
    <span class="pot inline-flex items-end gap-3.5 flex-none" aria-hidden="true">
      {#each pot as c, i (c.id)}<span style:--d="{200 + i * 110}ms"><ChipStack chip={c} n={[7, 10, 5, 8][i]} width={20} /></span>{/each}
    </span>
  </div>
{/if}

<div class="cols">
  <section>
    <div class="spread">
      <h2>{tt("gamePlay.shared.groupPlayers")}</h2>
      <span class="small">
        {#if bracket}{#if bracketRound}<span class="pop">{roundName(game, bracketRound)}</span>{/if}
        {:else}{#key lateRegOpen}<span class="pop" class:good={lateRegOpen} class:muted={!lateRegOpen}>{lateRegOpen ? tt("gamePlay.tournament.lateRegOpenThrough", { level: String(t.lateRegLevel) }) : tt("gamePlay.tournament.lateRegClosed")}</span>{/key}{/if}
        {#if t.rebuy.on}· {#key rebuyOpen}<span class="pop" class:good={rebuyOpen} class:muted={!rebuyOpen}>{rebuyOpen ? tt("gamePlay.tournament.rebuysOpen") : tt("gamePlay.tournament.rebuysClosed")}</span>{/key}{/if}
      </span>
    </div>
    {#if seatsOn}<SeatTools bind:this={seatTools} bind:game {persist} />{/if}
    <div class="scroll-x">
    <table class="roster">
      <thead>
        <tr>
          {#if drawn}<th>{tt("gamePlay.shared.seatHeader")}</th>{/if}
          <th>{tt("gamePlay.shared.nameHeader")}</th>
          {#if t.rebuy.on}<th class="num">{tt("gamePlay.tournament.rebuysHeader")}</th>{/if}
          {#if t.addOn.on}<th class="num">{tt("gamePlay.tournament.addOnHeader")}</th>{/if}
          {#if showKos}<th class="num">{tt("gamePlay.tournament.kosHeader")}</th>{/if}
          {#if pko}<th class="num">{tt("gamePlay.tournament.bountyHeader")}</th>{/if}
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each ranked as p, i (p.id)}
          <tr class:dim={p.out} in:fade={reveal()} animate:flip={reorder()}>
            {#if drawn}<td class="num seat"><span class:dealt={dealing} style:--i={i}>{p.out ? "" : seatLabel(p.seat, tables)}</span></td>{/if}
            <td class="nowrap who">
              {#if p.out}<span class="num place inline-block min-w-[2.2em] text-muted" use:fresh={[p.bustedAt, "stamp"]}>{ordinal(p.place ?? 0)}</span>{:else if p.place && p.place <= seats}<Icon icon={Ticket} label={tt("gamePlay.tournament.seatWonLabel")} />{:else if p.place === 1}<Icon icon={Trophy} label={tt("gamePlay.tournament.winnerLabel")} />{/if}
              <input type="text" bind:value={p.name} onchange={persist} class="edit-name" aria-label={tt("gamePlay.shared.nameHeader")} />
              {#if p.ticket}<span class="muted inline-flex align-middle" title={tt("gamePlay.tournament.ticketTitle", { game: ticketFrom(p.ticket) })}><Icon icon={Ticket} size="1em" label={tt("gamePlay.tournament.ticketTitle", { game: ticketFrom(p.ticket) })} /></span>{/if}
            </td>
            {#if t.rebuy.on}
              <td class="num nowrap" data-l={tt("gamePlay.tournament.rebuysHeader")}>
                <button class="link" data-sound="rewind" onclick={() => rebuy(p.id, -1)} disabled={!p.rebuys} aria-label={tt("gamePlay.tournament.takeBackRebuyAria")} title={p.rebuys ? tt("gamePlay.tournament.takeBackRebuyTitleYes") : tt("gamePlay.tournament.takeBackRebuyTitleNo")}><Icon icon={Minus} size="1em" /></button>
                {p.rebuys}
                <button class="link" data-sound="chips" onclick={() => rebuy(p.id, 1)} aria-label={tt("gamePlay.tournament.addRebuyAria")}><Icon icon={Plus} size="1em" /></button>
              </td>
            {/if}
            {#if t.addOn.on}
              <td class="num nowrap" data-l={tt("gamePlay.tournament.addOnHeader")}>
                <button class="link" data-sound="rewind" onclick={() => addOn(p.id, -1)} disabled={!p.addOns} aria-label={tt("gamePlay.tournament.takeBackAddOnAria")} title={p.addOns ? tt("gamePlay.tournament.takeBackAddOnTitleYes") : tt("gamePlay.tournament.takeBackAddOnTitleNo")}><Icon icon={Minus} size="1em" /></button>
                {p.addOns}
                <button class="link" data-sound="chips" onclick={() => addOn(p.id, 1)} aria-label={tt("gamePlay.tournament.addAddOnAria")}><Icon icon={Plus} size="1em" /></button>
              </td>
            {/if}
            {#if showKos}<td class="num" class:blank={!koCount(game, p.id)} data-l={tt("gamePlay.tournament.kosHeader")}>{koCount(game, p.id) || ""}</td>{/if}
            {#if pko}<td class="num" class:blank={p.out} data-l={tt("gamePlay.tournament.bountyHeader")}>{#if !p.out}<span use:bump={book.head[p.id]}>{money(book.head[p.id] ?? 0)}</span>{/if}</td>{/if}
            <!-- a busted row's actions may wrap to a second line rather than push the table wider -->
            <td class="acts leading-[30px]">
              {#if bracket}
                <!-- out by losing a match: the bracket below does it -->
              {:else if p.out && !game.deal}
                {#if kosOn}<select class="ko max-w-[150px]" value={lastKo(p.id)} onchange={(e) => credit(p.id, (e.target as HTMLSelectElement).value || null)} aria-label={tt("gamePlay.tournament.whoKnockedOutAria", { name: p.name })}>
                  <option value="">{tt("gamePlay.tournament.koByPlaceholder")}</option>
                  {#each game.players.filter((x) => x.id !== p.id) as x (x.id)}<option value={x.id}>{x.name}</option>{/each}
                </select>{/if}
                <button class="link small nowrap" data-sound="rewind" onclick={() => act(() => unbust(game, p.id))}>{tt("gamePlay.tournament.undoBust")}</button>
              {:else if !game.finished}
                <button class="danger" data-sound="bust" onclick={() => act(() => bust(game, p.id))}><Icon icon={Skull} />{tt("gamePlay.tournament.bust")}</button>
              {/if}
              <RemoveButton label={tt("gamePlay.shared.removePlayer", { name: p.name })} onclick={() => removePlayer(p.id)} />
            </td>
          </tr>
        {:else}
          <tr><td class="empty" colspan={cols}>{tt("gamePlay.tournament.noPlayersYet")}</td></tr>
        {/each}
      </tbody>
    </table>
    </div>
    <form autocomplete="off" class="row add mt-2" onsubmit={add}>
      <input type="text" bind:value={newName} placeholder={tt("gamePlay.shared.playerNamePlaceholder")} list="regulars" autocomplete="off" aria-label={tt("gamePlay.shared.playerNamePlaceholder")} />
      <button data-sound="chips"><Icon icon={Plus} />{tt("gamePlay.tournament.addPlayerButton", { amount: money(t.buyIn) })}</button>
    </form>

    {#if bracket}
      <div class="part mt-[22px]">
        <div class="spread">
          <h2>{tt("gamePlay.bracket.heading")}</h2>
          {#if canDraw && game.matches}<button class="link small" data-sound="none" onclick={drawTheBracket}>{tt("gamePlay.bracket.redraw")}</button>{/if}
        </div>
        {#if !game.matches}
          <p class="small muted">{#if alive.length >= 2}{tt("gamePlay.bracket.drawHint", { size: String(bracketSize(alive.length)) })}{#if bracketSize(alive.length) > alive.length}{" "}{tp("gamePlay.bracket.byes", bracketSize(alive.length) - alive.length)}{/if}{:else}{tt("gamePlay.bracket.needTwo")}{/if}</p>
          {#if canDraw}<button data-sound="none" onclick={drawTheBracket}>{tt("gamePlay.bracket.draw")}</button>{/if}
        {:else}
          <Bracket {game} onpick={game.finished ? undefined : pickWinner} />
          {#if !game.finished}<p class="small muted">{tt("gamePlay.bracket.pickHint")}</p>{/if}
        {/if}
      </div>
    {/if}

    {#if shoot && !game.finished}
      <div class="part mt-[22px]" transition:slide={reveal()}>
        <h2>{tt("gamePlay.tournament.shootoutHeading")}</h2>
        {#if !drawn}
          <p class="small muted">{tt("gamePlay.tournament.shootoutDrawFirst")}</p>
        {:else if shoot.final}
          <p class="small">{tt("gamePlay.tournament.shootoutFinal")}</p>
        {:else}
          <ul class="list-none p-0 m-0 small">
            {#each shoot.tables as x (x.table)}
              <li class="mb-1">{#if x.left.length === 1}<Icon icon={Trophy} size="1em" /> {tt("gamePlay.tournament.tableWinner", { table: String(x.table), name: x.left[0].name })}{:else}<span class="muted">{tp("gamePlay.tournament.tableLeft", x.left.length, { table: String(x.table) })}</span>{/if}</li>
            {/each}
          </ul>
          {#if shoot.ready}<button class="mt-2" data-sound="none" onclick={finalTable} transition:slide={reveal()}><Icon icon={Trophy} />{tt("gamePlay.tournament.drawFinalTable")}</button>{/if}
        {/if}
      </div>
    {/if}

    <h2 class="part mt-[22px]">{tt("gamePlay.tournament.payoutsHeading")}{#if game.deal} <span class="pill">{tt("gamePlay.shared.dealPill")}</span>{/if}</h2>
    {#if groups}
    <table>
      <tbody>
        {#each groups as g (g.from)}
          {@const who = game.players.filter((p) => p.place === g.from)}
          <tr>
            <td class="nowrap">{placeRange(g)}</td>
            <td class="num"><b>{money(s.payouts[g.from - 1] ?? 0)}</b>{#if g.to > g.from} <span class="small muted">{tt("gamePlay.bracket.each")}</span>{/if}</td>
            <td>{#each who as w (w.id)}<span class="paid inline-block me-2" use:fresh={[w.bustedAt ?? game.endedAt, "stamp"]}>{w.name}</span>{/each}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    {:else}
    <table>
      <tbody>
        {#each payRows as i (i)}
          {@const who = game.players.find((p) => p.place === i + 1)}
          {@const owed = paidFor(game, who?.id, i + 1, s.payouts)}
          <tr>
            <td>{ordinal(i + 1)}</td>
            <td class="num muted">{game.deal || seats ? "" : `${s.pcts[i]}%`}</td>
            <td class="num">{#if i < seats}<b>{tt("gamePlay.tournament.seat")}</b> <span class="small muted">{money(owed)}</span>{:else}<b>{money(owed)}</b>{/if}</td>
            <td>
              <!-- a name lands in its place like the busted player's stamp -->
              {#if who}<span class="paid inline-block" use:fresh={[who.bustedAt ?? game.endedAt, "stamp"]}>{who.name}</span>{/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    {/if}
    <p class="small muted">
      {s.entrants} × {money(t.buyIn)}{#if s.rebuys} + {tp("gamePlay.tournament.rebuysCount", s.rebuys)}{/if}{#if s.addOns} + {tp("gamePlay.tournament.addOnsCount", s.addOns)}{/if} = {money(s.gross)}{#if s.bounties} − {tt(pko ? "gamePlay.tournament.bountiesNotePko" : mystery ? "gamePlay.tournament.bountiesNoteMystery" : "gamePlay.tournament.bountiesNote", { bounties: money(s.bounties), bounty: money(s.bounty) })}{/if}{#if s.rake} − {tt("gamePlay.tournament.rakeNote", { rake: money(s.rake) })}{/if}
    </p>
    {#if t.satellite}<p class="small muted">{tt("gamePlay.tournament.satelliteNote", { value: money(t.satellite.seatValue) })}</p>{/if}
    {#if book.unclaimed > 0.004 && (game.finished || !mystery)}
      <p class="small warn" transition:slide={reveal()}>{tt(mystery ? "gamePlay.tournament.unopenedNote" : "gamePlay.tournament.uncreditedNote", { amount: money(book.unclaimed) })}</p>
    {/if}

    {#if mystery}
      <div class="part mt-[22px]">
        <div class="spread">
          <h2>{tt("gamePlay.tournament.mysteryHeading")}</h2>
          {#if game.mystery && left.length && !game.finished}
            <button class="link small" data-sound={editingEnvelopes ? "close" : "open"} aria-expanded={editingEnvelopes} onclick={() => ((editingEnvelopes = !editingEnvelopes), (envelopeText = left.join(", ")), (envelopeBad = false))}>{editingEnvelopes ? tt("common.cancel") : tt("common.edit")}</button>
          {/if}
        </div>
        {#if !game.mystery}
          <p class="small muted">{tt("gamePlay.tournament.mysteryWaiting", { n: String(mysteryStartsAt(game)), pool: money(s.bounties) })}</p>
        {:else}
          {#if editingEnvelopes}
            <form autocomplete="off" class="row" onsubmit={saveEnvelopes} transition:slide={reveal()}>
              <label class="grow"><span>{tt("gamePlay.tournament.envelopesLabel")}</span><input type="text" bind:value={envelopeText} class="w-full" /></label>
              <button>{tt("common.save")}</button>
            </form>
            {#if envelopeBad}<p class="small warn">{tt("gamePlay.tournament.envelopesSumWarning", { amount: money(left.reduce((a, v) => a + v, 0)) })}</p>{/if}
          {:else if left.length}
            <p class="small">
              <span class="muted">{tp("gamePlay.tournament.envelopesLeft", left.length)}</span>
              {#each left as v, i (i)}<span class="num ml-2">{money(v)}</span>{/each}
            </p>
          {/if}
          {#if openedList.length}
            <table>
              <tbody>
                {#each openedList as o, i (i)}
                  <tr><td>{o.name}</td><td class="num"><b>{money(o.prize)}</b></td></tr>
                {/each}
              </tbody>
            </table>
          {/if}
        {/if}
      </div>
    {/if}

    {#if settleShown}
      <div class="part mt-[22px]" transition:slide={reveal()}>
        <h2>{tt("gamePlay.shared.settleUp")}</h2>
        {#if moves.length}
          <SettleMoves bind:game {persist} />
          {#if game.finished}<p class="small muted">{tt("gamePlay.shared.tourneySettleNote", { house: game.house?.trim() || HOUSE() })}</p>{/if}
        {:else}
          <p class="small muted">{tt("gamePlay.shared.square")}</p>
        {/if}
      </div>
    {/if}
    {#if costsOn}<div class="part mt-[22px]"><Costs bind:game {persist} /></div>{/if}

    {#if canDeal && dealsOn}
      <div class="part mt-[22px]" transition:slide={reveal()}>
        <div class="spread">
          <h2>{tt("gamePlay.tournament.dealHeading")}</h2>
          <button class="link small" data-sound={showDeal ? "close" : "open"} aria-expanded={showDeal} onclick={() => (showDeal = !showDeal)}>{showDeal ? tt("gamePlay.tournament.hide") : tt("gamePlay.tournament.runTheNumbers")}</button>
        </div>
        {#if showDeal}<div transition:slide={reveal()}><DealCalc bind:game {persist} /></div>{/if}
      </div>
    {/if}
  </section>

  <section>
    <div class="spread">
      <h2>{tt("gamePlay.tournament.structureHeading")}</h2>
      <button class="link small" data-sound={editStructure ? "close" : "open"} aria-expanded={editStructure} onclick={() => (editStructure = !editStructure)}>{editStructure ? tt("gamePlay.tournament.doneEditing") : tt("common.edit")}</button>
    </div>
    <StructureTable
      bind:levels={game.levels}
      chips={game.chips}
      editable={editStructure}
      current={d.index}
      onjump={(i) => act(() => clk.jump(game, i))}
      onedit={() => {
        annotate(game.levels, game.chips);
        persist();
      }}
    />

    <h2 class="part mt-[22px]">{tt("gamePlay.shared.chipsHeading")}</h2>
    <div class="slab"><ChipLegend chips={game.chips} size={44} /></div>
    <h3 class="mt-3">{tt("gamePlay.tournament.startingStackHeading", { amount: amt(t.stack) })}</h3>
    <div class="felt"><Breakdown breakdown={distribute(t.stack, game.chips, Math.max(2, s.entrants))} target={t.stack} /></div>
    {#if t.rebuy.on}
      <h3 class="mt-3">{tt("gamePlay.tournament.rebuyHeading", { amount: amt(t.rebuy.chips) })}</h3>
      <div class="felt"><Breakdown breakdown={distribute(t.rebuy.chips, game.chips, 1)} target={t.rebuy.chips} /></div>
    {/if}
  </section>
</div>

<style>
  .clockbox.brk {
    background: var(--block);
  }
  .clockbox.hot .clockface {
    color: var(--accent);
  }
  .clockbox > :global(.progress) {
    margin-top: 8px;
  }
  .pot :global(.stack) {
    --t: 3px;
  }
</style>

<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import Digits from "$lib/components/Digits.svelte";
  import Play from "@lucide/svelte/icons/play";
  import Pause from "@lucide/svelte/icons/pause";
  import Plus from "@lucide/svelte/icons/plus";
  import Check from "@lucide/svelte/icons/check";
  import { fade } from "svelte/transition";
  import { bump, reveal, leave, slide } from "$lib/motion";
  import type { Game } from "$lib/types";
  import { cashElapsed, cashToggle } from "$lib/clock";
  import { addPlayer, cashStats, cashSettle, cashRake, logEvent, flash, reseat, seatsDrawn, seatLabel, tableCounts } from "$lib/game";
  import { getHandles } from "$lib/store";
  import { distribute, faceText } from "$lib/chips";
  import { clock, clockFace, currencySymbol, duration, money, nameKey, payLinks, round2, signed, timeOfDay } from "$lib/util";
  import { time } from "$lib/now.svelte";
  import { provide } from "$lib/commands.svelte";
  import { play } from "$lib/sound";
  import ChipLegend from "./ChipLegend.svelte";
  import Breakdown from "./Breakdown.svelte";
  import Chip from "./Chip.svelte";
  import SeatTools from "./SeatTools.svelte";
  import { settings } from "$lib/settings.svelte";
  import Count from "./Count.svelte";
  import RemoveButton from "./RemoveButton.svelte";
  import { t, tp } from "$lib/i18n";

  let { game = $bindable(), persist }: { game: Game; persist: () => void } = $props();

  const c = $derived(game.cash!);
  const s = $derived(cashStats(game));
  const elapsed = $derived(cashElapsed(game, time.now));
  const remaining = $derived(c.plannedMinutes * 60000 - elapsed);
  const running = $derived(game.clock.status === "running");
  // STATUS_LABEL (clock.ts) is English only; this game screen shows its own
  // translated labels for the same three statuses instead.
  const statusLabel = $derived({ idle: t("gamePlay.shared.statusIdle"), running: t("gamePlay.shared.statusRunning"), paused: t("gamePlay.shared.statusPaused") });
  const moves = $derived(cashSettle(game));
  const r = $derived(cashRake(game));
  const house = $derived(game.house?.trim() || t("gamePlay.shared.house"));
  // where people get paid (saved on the Players page), for links in settle-up
  const handles = getHandles();
  const linksFor = (name: string, amount: number) => (settings.usePayLinks ? payLinks(handles[nameKey(name)] ?? null, amount, game.name) : []);
  const anyHandles = $derived(moves.some((m) => handles[nameKey(m.to)]));

  let newName = $state("");
  let newSb = $state(game.cash!.sb);
  let newBb = $state(game.cash!.bb);
  let custom = $state<Record<string, number>>({});
  let buyInFor = $state(game.cash!.defaultBuyIn);

  function act(fn: () => void) {
    fn();
    persist();
  }

  const toggle = () =>
    act(() => {
      const wasIdle = game.clock.status === "idle";
      const wasRunning = running;
      cashToggle(game);
      logEvent(game, wasRunning ? t("gamePlay.cash.sessionPausedLog") : wasIdle ? t("gamePlay.cash.cardsInTheAirLog") : t("gamePlay.cash.sessionResumedLog"));
      if (wasIdle) flash(game, t("gamePlay.cash.cardsInTheAirFlash"), "shuffle");
    });

  const drawn = $derived(seatsDrawn(game));
  // seat draw can be switched off (Settings > Your Game), unless this game already drew seats
  const seatsOn = $derived(settings.useSeats || drawn);
  const tables = $derived(tableCounts(game).length);
  let seatTools = $state<SeatTools>();
  const cols = $derived(drawn ? 7 : 6);

  // the first press of the night shuffles the deck; after that the clock winds
  // down and back up like a tape machine
  const startSound = $derived(running ? "pause" : game.clock.status === "idle" ? "riffle" : "resume");

  // seats just drawn: deal the labels out row by row
  const opened = Date.now();
  let dealtAt = $state(0);
  $effect(() => {
    const f = game.flash;
    if (f?.kind === "draw" && f.at > opened) dealtAt = f.at;
  });
  const dealing = $derived(time.now - dealtAt < 1500);

  // the last cash-out makes the books balance: that deserves the till's bell
  const balanced = $derived(s.allOut && game.players.length > 0 && Math.abs(s.diff) <= 0.001);
  let wasBalanced: boolean | null = null;
  $effect(() => {
    const b = balanced;
    if (b && wasBalanced === false) setTimeout(() => play("register"), 520);
    wasBalanced = b;
  });

  /** how long someone's been at the table (or was, once they've left) */
  function played(p: (typeof game.players)[number]) {
    const start = Math.max(p.joinedAt ?? 0, game.clock.startedAt ?? 0);
    if (!game.clock.startedAt || !start) return "";
    const end = p.leftAt ?? (game.clock.status === "running" ? time.now : (game.endedAt ?? time.now));
    return end > start ? duration((end - start) / 60000) : "";
  }

  function addNamed(name: string) {
    if (!name.trim()) return;
    act(() => addPlayer(game, name));
  }

  function add(e: SubmitEvent) {
    e.preventDefault();
    addNamed(newName);
    newName = "";
  }

  function buyIn(id: string, amount: number) {
    const p = game.players.find((x) => x.id === id)!;
    if (!(amount > 0)) return false;
    if (amount < c.minBuyIn || amount > c.maxBuyIn) {
      if (!confirm(t("gamePlay.cash.buyInOutsideRangeConfirm", { amount: money(amount), min: money(c.minBuyIn), max: money(c.maxBuyIn) }))) return false;
    }
    act(() => {
      p.cashIn = round2(p.cashIn + amount);
      if (p.cashOut !== null) {
        // back in the game
        p.cashOut = null;
        p.leftAt = null;
        reseat(game, p);
      }
      logEvent(game, t("gamePlay.cash.boughtInLog", { name: p.name, amount: money(amount), total: money(p.cashIn) }));
      flash(game, t("gamePlay.cash.reloadsFlash", { name: p.name, amount: money(amount) }), "chips");
    });
    return true;
  }

  function addOther(e: SubmitEvent, id: string) {
    e.preventDefault();
    if (buyIn(id, custom[id])) delete custom[id];
  }

  function undoBuyIn(id: string) {
    const p = game.players.find((x) => x.id === id)!;
    const amount = Number(prompt(t("gamePlay.cash.undoBuyInPrompt", { name: p.name }), String(c.defaultBuyIn)));
    if (!(amount > 0)) return;
    act(() => {
      p.cashIn = Math.max(0, round2(p.cashIn - amount));
      logEvent(game, t("gamePlay.cash.buyInReducedLog", { name: p.name, amount: money(amount) }));
    });
  }

  // ---- cash out: count their chips by color, or type the total ----
  let counting = $state<string | null>(null);
  let counts = $state<Record<string, number | null>>({});
  let typed = $state<number | null>(null);
  const counted = $derived(round2(game.chips.reduce((sum, c) => sum + (Number(counts[c.id]) || 0) * c.value, 0)));
  const outTotal = $derived(typed !== null && (typed as unknown) !== "" ? Number(typed) || 0 : counted);
  const counter = $derived(game.players.find((p) => p.id === counting));

  function openCount(id: string) {
    const p = game.players.find((x) => x.id === id)!;
    counts = {};
    typed = p.cashOut;
    counting = counting === id ? null : id;
  }

  function cashOut(e?: SubmitEvent) {
    e?.preventDefault();
    const p = counter;
    if (!p || !(outTotal >= 0)) return;
    const amount = round2(outTotal);
    act(() => {
      p.cashOut = amount;
      p.leftAt = Date.now();
      const net = round2(amount - p.cashIn);
      logEvent(game, t("gamePlay.cash.cashedOutLog", { name: p.name, amount: money(amount), net: signed(net) }));
      flash(game, t("gamePlay.cash.racksUpFlash", { name: p.name, net: signed(net) }), "rack");
    });
    counting = null;
  }

  function changeBlinds(e?: SubmitEvent) {
    e?.preventDefault();
    act(() => {
      game.cash!.sb = newSb;
      game.cash!.bb = newBb;
      logEvent(game, t("gamePlay.cash.blindsNowLog", { sb: money(newSb), bb: money(newBb) }));
      flash(game, t("gamePlay.cash.blindsAreNowFlash", { sb: money(newSb), bb: money(newBb) }));
    });
  }

  // ---- the rake box: chips pulled from pots, added up as they go in ----
  // quick buttons for the chips a pot's rake is usually made of (up to the cap)
  const rakeSteps = $derived.by(() => {
    const vals = [...new Set(game.chips.map((ch) => ch.value))].sort((a, b) => a - b);
    const under = vals.filter((v) => v <= (r.cap || Infinity));
    return (under.length ? under : vals).slice(0, 3);
  });
  let rakeTyped = $state<number | null>(null);

  function addRake(amount: number) {
    if (!amount) return;
    act(() => (game.rakeBox = Math.max(0, round2((game.rakeBox ?? 0) + amount))));
  }

  function rakeOther(e: SubmitEvent) {
    e.preventDefault();
    addRake(Number(rakeTyped) || 0);
    rakeTyped = null;
  }

  function recountRake() {
    const v = prompt(t("gamePlay.cash.rakeBoxPrompt"), String(game.rakeBox ?? 0));
    if (v === null || !(Number(v) >= 0)) return;
    act(() => {
      game.rakeBox = round2(Number(v));
      logEvent(game, t("gamePlay.cash.rakeRecountedLog", { amount: money(game.rakeBox) }));
    });
  }

  function removePlayer(id: string) {
    const p = game.players.find((x) => x.id === id)!;
    if (!confirm(t("gamePlay.cash.removeConfirm", { name: p.name }))) return;
    act(() => {
      game.players = game.players.filter((x) => x.id !== id);
      logEvent(game, t("gamePlay.shared.removedLog", { name: p.name }));
    });
  }

  function endGame() {
    if (!s.allOut && !confirm(t("gamePlay.cash.endGameConfirm"))) return;
    act(() => {
      game.finished = true;
      game.endedAt = Date.now();
      if (running) cashToggle(game);
      logEvent(game, t("gamePlay.cash.gameOverLog"));
    });
  }

  function blindsFrom(text: string) {
    const [a, b] = text.split("/").map((x) => Number(x.replace(/[^0-9.]/g, "")));
    if (!(a > 0) || !(b > 0)) return;
    newSb = a;
    newBb = b;
    play("flap");
    changeBlinds();
  }

  // the palette (ctrl k) knows this game while it's on screen. each command
  // makes the same sound as the button it stands in for.
  $effect(() =>
    provide("cash", () => [
      { id: "c:clock", label: running ? t("gamePlay.cash.cmdPauseSession") : game.clock.status === "idle" ? t("gamePlay.cash.cmdStartSession") : t("gamePlay.cash.cmdResumeSession"), group: t("gamePlay.shared.groupThisGame"), run: () => (play(startSound), toggle()) },
      { id: "c:add", label: t("gamePlay.cash.cmdSeatPlayer"), group: t("gamePlay.shared.groupThisGame"), keywords: "add sit down", prompt: t("gamePlay.shared.theirNamePrompt"), run: (name: string) => (play("chips"), addNamed(name)) },
      { id: "c:blinds", label: t("gamePlay.cash.changeBlindsButton"), group: t("gamePlay.shared.groupThisGame"), prompt: t("gamePlay.cash.cmdChangeBlindsPrompt"), run: blindsFrom },
      ...(seatsOn ? [{ id: "c:seats", label: drawn ? t("gamePlay.shared.redrawSeats") : t("gamePlay.shared.drawSeats"), group: t("gamePlay.shared.groupThisGame"), keywords: "tables shuffle", run: () => seatTools?.draw() }] : []),
      ...(!game.finished ? [{ id: "c:end", label: t("gamePlay.cash.endGame"), group: t("gamePlay.shared.groupThisGame"), keywords: "finish over", run: () => (play("square"), endGame()) }] : []),
      ...(r.mode === "pot" ? [{ id: "c:rake", label: t("gamePlay.cash.cmdAddToRakeBox"), group: t("gamePlay.shared.groupThisGame"), keywords: "rake house drop", prompt: t("gamePlay.cash.cmdAddToRakeBoxPrompt"), run: (v: string) => (play("drop"), addRake(Number(v.replace(/[^0-9.-]/g, "")) || 0)) }] : []),
      ...game.players.map((p) => ({ id: `c:buy:${p.id}`, label: `${p.cashOut === null ? t("gamePlay.cash.cmdRebuyLabel") : t("gamePlay.cash.cmdBackInLabel")}: ${p.name}`, group: t("gamePlay.shared.groupPlayers"), keywords: "buy in reload top-up", hint: `+${money(c.defaultBuyIn)}`, run: () => (play("chips"), buyIn(p.id, c.defaultBuyIn)) })),
      ...game.players.filter((p) => p.cashOut === null).map((p) => ({ id: `c:out:${p.id}`, label: t("gamePlay.cash.cmdCashOut", { name: p.name }), group: t("gamePlay.shared.groupPlayers"), keywords: "leave rack", run: () => (play(counting === p.id ? "close" : "open"), openCount(p.id)) })),
    ])
  );
</script>

<section class="clockbox" class:paused={game.clock.status === "paused"}>
  <div class="spread">
    <div>
      <div class="lvl">{t("gamePlay.cash.sessionLabel")} <span class="pill" data-s={game.clock.status}>{statusLabel[game.clock.status]}</span></div>
      <div class="clockface" dir="ltr"><Digits value={clockFace(elapsed)} /></div>
      <div class="small muted">
        {#if game.clock.status !== "idle"}
          {#if remaining > 0}{t("gamePlay.cash.leftOfPlanned", { remaining: clock(remaining), total: String(Math.round(c.plannedMinutes / 6) / 10), time: timeOfDay(time.now + remaining) })}{:else}{t("gamePlay.cash.pastPlannedEnd")}{/if}
        {:else}{t("gamePlay.cash.plannedDuration", { h: String(Math.round(c.plannedMinutes / 6) / 10) })}{/if}
      </div>
    </div>
    <div class="blinds text-right max-[600px]:text-left">
      <div class="num bb" dir="ltr"><span use:bump={c.sb * 1e6 + c.bb}>{money(c.sb)}/{money(c.bb)}</span></div>
      <form autocomplete="off" class="row small justify-end mt-1 max-[600px]:justify-start" onsubmit={changeBlinds}>
        <input type="number" step="any" class="w-[70px]" bind:value={newSb} aria-label={t("gamePlay.cash.smallBlindAria")} />/<input type="number" step="any" class="w-[70px]" bind:value={newBb} aria-label={t("gamePlay.cash.bigBlindAria")} />
        <button data-sound="flap">{t("gamePlay.cash.changeBlindsButton")}</button>
      </form>
    </div>
  </div>
  <div class="row controls mt-2">
    <button class="big" data-sound={startSound} onclick={toggle}><Icon icon={running ? Pause : Play} />{running ? t("gamePlay.tournament.pause") : game.clock.status === "idle" ? t("gamePlay.cash.startSession") : t("gamePlay.tournament.resume")}</button>
    {#if !game.finished}<button data-sound="square" onclick={endGame}>{t("gamePlay.cash.endGame")}</button>{:else}<span class="pill pop">{t("gamePlay.cash.finishedPill")}</span>{/if}
  </div>
</section>

<div class="stats">
  <div><span>{t("gamePlay.cash.bankLabel")}</span><b class="num" use:bump={s.bank}><Count value={s.bank} format={money} /></b></div>
  <div><span>{t("gamePlay.cash.onTableLabel")}</span><b class="num" use:bump={s.onTable}><Count value={s.onTable} format={money} /></b></div>
  <div><span>{t("gamePlay.cash.cashedOutLabel")}</span><b class="num" use:bump={s.out}><Count value={s.out} format={money} /></b></div>
  <div><span>{t("gamePlay.cash.seatedLabel")}</span><b class="num" use:bump={s.seated * 1000 + game.players.length}>{s.seated}/{game.players.length}</b></div>
</div>

{#if r.mode === "pot"}
  <!-- the rake box: a running total the host adds to as chips go in -->
  <div class="rakebox flex flex-wrap items-center gap-x-4 gap-y-1.5 -mt-1 mx-0 mb-5">
    <span class="rb-total"><span class="small muted">{t("gamePlay.cash.rakeBoxLabel")}</span> <b class="num text-[length:var(--fs-md)]" use:bump={s.rakeBox}><Count value={s.rakeBox} format={money} /></b></span>
    <span class="row">
      {#each rakeSteps as v (v)}<button data-sound="drop" onclick={() => addRake(v)} title={t("gamePlay.cash.addToRakeBoxTitle", { amount: money(v) })}>+{money(v)}</button>{/each}
      <form autocomplete="off" class="joined inline-flex" onsubmit={rakeOther}>
        <input type="number" step="any" class="w-[72px]" placeholder={t("gamePlay.shared.other")} bind:value={rakeTyped} aria-label={t("gamePlay.cash.otherAmountRakeBoxAria")} />
        <button data-sound="drop" class="ml-[calc(-1*var(--hair))]" disabled={!rakeTyped} aria-label={t("gamePlay.cash.addThatToRakeBox")} title={rakeTyped ? t("gamePlay.cash.addThatToRakeBox") : t("gamePlay.shared.typeAmountFirst")}><Icon icon={Plus} /></button>
      </form>
      <button class="link small muted" data-sound="drop" onclick={recountRake}>{t("gamePlay.cash.recount")}</button>
    </span>
    <span class="small muted">{t("gamePlay.cash.rakePctNote", { pct: String(r.pct), cap: money(r.cap), house })}</span>
  </div>
{:else if r.mode === "seat"}
  <p class="small muted rakebox flex flex-wrap items-center gap-x-4 gap-y-1.5 -mt-1 mx-0 mb-5">{t("gamePlay.cash.seatFeeNote", { fee: money(r.fee), house })}</p>
{/if}

<!-- the players table is where the night is run, so it gets the full width -->
<section class="players mb-[26px]">
    <h2>{t("gamePlay.shared.groupPlayers")}</h2>
    {#if seatsOn}<SeatTools bind:this={seatTools} bind:game {persist} />{/if}
    <div class="scroll-x">
    <table class="roster acts-below min-w-[640px]">
      <thead>
        <tr>
          {#if drawn}<th>{t("gamePlay.shared.seatHeader")}</th>{/if}
          <th>{t("gamePlay.shared.nameHeader")}</th>
          <th class="num hide-sm">{t("gamePlay.cash.playedHeader")}</th>
          <th class="num">{t("gamePlay.cash.inHeader")}</th>
          <th class="num">{t("gamePlay.cash.outHeader")}</th>
          <th class="num">{t("gamePlay.cash.netHeader")}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each game.players as p, i (p.id)}
          {@const net = p.cashOut !== null ? round2(p.cashOut - p.cashIn) : null}
          <tr class:dim={p.cashOut !== null} in:fade={reveal()}>
            {#if drawn}<td class="num seat"><span class:dealt={dealing} style:--i={i}>{p.cashOut === null ? seatLabel(p.seat, tables) : ""}</span></td>{/if}
            <td class="who"><input type="text" bind:value={p.name} onchange={persist} class="edit-name" aria-label={t("gamePlay.shared.nameHeader")} /></td>
            <td class="num muted small hide-sm">{played(p)}</td>
            <td class="num nowrap" data-l={t("gamePlay.cash.inHeader")}><span use:bump={p.cashIn}>{money(p.cashIn)}</span> <button class="link small muted" data-sound="rewind" title={t("gamePlay.cash.fixTitle")} onclick={() => undoBuyIn(p.id)}>{t("gamePlay.cash.fixLink")}</button></td>
            <td class="num" class:blank={p.cashOut === null} data-l={t("gamePlay.cash.outHeader")}>{p.cashOut !== null ? money(p.cashOut) : ""}</td>
            <td class="num {net === null ? 'blank' : net >= 0 ? 'good' : 'bad'}" data-l={t("gamePlay.cash.netHeader")}>{net === null ? "" : signed(net)}</td>
            <td class="nowrap acts w-[1%]">
              <button data-sound="chips" onclick={() => buyIn(p.id, c.defaultBuyIn)} title={p.cashOut === null ? t("gamePlay.cash.standardBuyInTitle") : t("gamePlay.cash.backInForStandardTitle")}>+{money(c.defaultBuyIn)}</button>
              <!-- any other amount: the box and its + are one control -->
              <form autocomplete="off" class="joined inline-flex" onsubmit={(e) => addOther(e, p.id)}>
                <input type="number" step="any" min="0" class="w-[72px]" placeholder={t("gamePlay.shared.other")} bind:value={custom[p.id]} aria-label={t("gamePlay.cash.otherBuyInAria", { name: p.name })} />
                <button data-sound="chips" class="ml-[calc(-1*var(--hair))]" disabled={!custom[p.id]} aria-label={t("gamePlay.cash.addThatBuyInAria", { name: p.name })} title={custom[p.id] ? t("gamePlay.cash.addThatBuyInTitle") : t("gamePlay.shared.typeAmountFirst")}><Icon icon={Plus} /></button>
              </form>
              <button class:down={counting === p.id} data-sound={counting === p.id ? "close" : "open"} aria-expanded={counting === p.id} onclick={() => openCount(p.id)}>{p.cashOut === null ? t("gamePlay.cash.cashOutButton") : t("gamePlay.cash.editCashOutButton")}</button>
              <RemoveButton label={t("gamePlay.shared.removePlayer", { name: p.name })} onclick={() => removePlayer(p.id)} />
            </td>
          </tr>
          {#if counting === p.id}
            <tr class="count-row">
              <td colspan={cols} class="bg-block p-0">
                <form autocomplete="off" class="counter vstack py-2.5 px-3" onsubmit={cashOut} transition:slide={reveal()}>
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
                    <button data-sound="rack">{t("gamePlay.cash.cashOutAmountButton", { amount: money(outTotal) })}</button>
                    <span class="small num {outTotal - p.cashIn >= 0 ? 'good' : 'bad'}">{signed(round2(outTotal - p.cashIn))} {t("gamePlay.cash.forTheSession")}</span>
                    <button type="button" class="link small muted" data-sound="close" onclick={() => (counting = null)}>{t("common.cancel")}</button>
                  </div>
                </form>
              </td>
            </tr>
          {/if}
        {:else}
          <tr><td class="empty" colspan={cols}>{t("gamePlay.cash.noPlayersSeated")}</td></tr>
        {/each}
      </tbody>
    </table>
    </div>
    <form autocomplete="off" class="row add mt-2" onsubmit={add}>
      <input type="text" bind:value={newName} placeholder={t("gamePlay.shared.playerNamePlaceholder")} list="regulars" autocomplete="off" aria-label={t("gamePlay.shared.playerNamePlaceholder")} />
      <button data-sound="chips"><Icon icon={Plus} />{t("gamePlay.cash.sitDownButton", { amount: money(c.defaultBuyIn) })}</button>
    </form>
</section>

<div class="cols">
  <section>
    <h2>{t("gamePlay.cash.settleUpHeading")}</h2>
    {#if Math.abs(s.diff) > 0.001 && s.allOut}
      <p class="warn small" transition:slide={reveal()}>{s.diff > 0 ? t("gamePlay.cash.bankOffCameOut", { amount: money(s.diff) }) : t("gamePlay.cash.bankOffWentIn", { amount: money(s.diff) })}</p>
    {/if}
    {#if balanced}
      <p class="good small with-icon pop"><Icon icon={Check} />{s.rakeBox ? t("gamePlay.cash.bankBalancesWithRakeBox", { amount: money(s.rakeBox) }) : t("gamePlay.cash.bankBalances")}</p>
    {/if}
    {#if moves.length}
      <ul class="moves pl-[18px]" in:slide={reveal()}>
        {#each moves as m, i (i)}
          {@const links = linksFor(m.to, m.amount)}
          <li class="mb-1" in:slide={reveal()} out:slide={leave()} style:--i={i}>
            <b>{m.from}</b> {t("gamePlay.cash.pays")} <b>{m.to}</b> <span class="num">{money(m.amount)}</span>
            {#if links.length}<span class="small pay links ml-3">{#each links as l (l.label)}<a href={l.href} target="_blank" rel="noopener noreferrer" title={t("gamePlay.shared.payLinkTitle", { handle: l.handle, label: l.label })}>{l.label}</a>{/each}</span>{/if}
          </li>
        {/each}
      </ul>
      {#if r.mode === "seat"}<p class="small muted">{t("gamePlay.cash.includesSeatFeeNote", { fee: money(r.fee), house })}</p>{/if}
      {#if !s.allOut}<p class="small muted" in:slide={reveal()} out:slide={leave()}>{t("gamePlay.cash.countsOnlyCashedOut")}</p>{/if}
      {#if !anyHandles && settings.usePayLinks}<p class="small muted">{t("gamePlay.cash.savePlayersNoteBefore")} <a href="/players">{t("gamePlay.shared.groupPlayers")}</a> {t("gamePlay.cash.savePlayersNoteAfter")}</p>{/if}
    {:else}
      <p class="muted small">{t("gamePlay.cash.cashOutToSeeWho")}</p>
    {/if}
  </section>

  <section>
    <h2>{t("gamePlay.shared.chipsHeading")}</h2>
    <div class="slab"><ChipLegend chips={game.chips} isCash size={44} /></div>
    <h3 class="mt-3">
      {t("gamePlay.cash.buyInOfPrefix")}
      <input type="number" step="any" min="0" bind:value={buyInFor} aria-label={t("gamePlay.cash.buyInAmountAria")} /> {t("gamePlay.cash.buyInOfSuffix")}
    </h3>
    <div class="felt"><Breakdown breakdown={distribute(buyInFor, game.chips, Math.max(1, game.players.length))} isCash target={buyInFor} /></div>
    <p class="small muted">{t("gamePlay.cash.buyInRangeNote", { min: money(c.minBuyIn), max: money(c.maxBuyIn), straddle: c.straddle ? t("gamePlay.cash.straddlesAllowed") : t("gamePlay.cash.noStraddles") })}</p>
  </section>
</div>

<style>
  /* global: the remove x at the end is its own component */
  .acts > :global(*) {
    vertical-align: middle;
  }
  .acts > :global(* + *) {
    margin-left: 4px;
  }
</style>

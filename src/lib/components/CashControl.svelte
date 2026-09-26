<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import Play from "@lucide/svelte/icons/play";
  import Pause from "@lucide/svelte/icons/pause";
  import Plus from "@lucide/svelte/icons/plus";
  import Check from "@lucide/svelte/icons/check";
  import { fade } from "svelte/transition";
  import { bump, reveal, leave, slide } from "$lib/motion";
  import type { Game } from "$lib/types";
  import { cashElapsed, cashToggle, STATUS_LABEL } from "$lib/clock";
  import { addPlayer, cashStats, cashSettle, cashRake, HOUSE, logEvent, flash, reseat, seatsDrawn, seatLabel, tableCounts } from "$lib/game";
  import { getHandles } from "$lib/store";
  import { distribute } from "$lib/chips";
  import { clock, currencySymbol, duration, money, nameKey, payLinks, round2, signed, timeOfDay } from "$lib/util";
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

  let { game = $bindable(), persist }: { game: Game; persist: () => void } = $props();

  const c = $derived(game.cash!);
  const s = $derived(cashStats(game));
  const elapsed = $derived(cashElapsed(game, time.now));
  const remaining = $derived(c.plannedMinutes * 60000 - elapsed);
  const running = $derived(game.clock.status === "running");
  const moves = $derived(cashSettle(game));
  const r = $derived(cashRake(game));
  const house = $derived(game.house?.trim() || HOUSE);
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
      logEvent(game, wasRunning ? "Session paused" : wasIdle ? "Cards in the air" : "Session resumed");
      if (wasIdle) flash(game, "Cards in the air!");
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
    if (f?.text === "Seats are drawn" && f.at > opened) dealtAt = f.at;
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
      if (!confirm(`${money(amount)} is outside the ${money(c.minBuyIn)}–${money(c.maxBuyIn)} buy-in range. Add it anyway?`)) return false;
    }
    act(() => {
      p.cashIn = round2(p.cashIn + amount);
      if (p.cashOut !== null) {
        // back in the game
        p.cashOut = null;
        p.leftAt = null;
        reseat(game, p);
      }
      logEvent(game, `${p.name} bought in ${money(amount)} (total ${money(p.cashIn)})`);
      flash(game, `${p.name} reloads ${money(amount)}`);
    });
    return true;
  }

  function addOther(e: SubmitEvent, id: string) {
    e.preventDefault();
    if (buyIn(id, custom[id])) delete custom[id];
  }

  function undoBuyIn(id: string) {
    const p = game.players.find((x) => x.id === id)!;
    const amount = Number(prompt(`How much should come off ${p.name}'s buy-in?`, String(c.defaultBuyIn)));
    if (!(amount > 0)) return;
    act(() => {
      p.cashIn = Math.max(0, round2(p.cashIn - amount));
      logEvent(game, `${p.name}'s buy-in reduced by ${money(amount)}`);
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
      logEvent(game, `${p.name} cashed out ${money(amount)} (${signed(net)})`);
      flash(game, `${p.name} racks up ${signed(net)}`);
    });
    counting = null;
  }

  function changeBlinds(e?: SubmitEvent) {
    e?.preventDefault();
    act(() => {
      game.cash!.sb = newSb;
      game.cash!.bb = newBb;
      logEvent(game, `Blinds now ${money(newSb)}/${money(newBb)}`);
      flash(game, `Blinds are now ${money(newSb)}/${money(newBb)}`);
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
    const v = prompt("What's in the rake box now?", String(game.rakeBox ?? 0));
    if (v === null || !(Number(v) >= 0)) return;
    act(() => {
      game.rakeBox = round2(Number(v));
      logEvent(game, `Rake box recounted: ${money(game.rakeBox)}`);
    });
  }

  function removePlayer(id: string) {
    const p = game.players.find((x) => x.id === id)!;
    if (!confirm(`Remove ${p.name} and their buy-ins from the game?`)) return;
    act(() => {
      game.players = game.players.filter((x) => x.id !== id);
      logEvent(game, `${p.name} removed`);
    });
  }

  function endGame() {
    if (!s.allOut && !confirm("Not everyone has cashed out. End the game anyway?")) return;
    act(() => {
      game.finished = true;
      game.endedAt = Date.now();
      if (running) cashToggle(game);
      logEvent(game, "Game over");
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
      { id: "c:clock", label: running ? "Pause the Session" : game.clock.status === "idle" ? "Start the Session" : "Resume the Session", group: "This Game", run: () => (play(startSound), toggle()) },
      { id: "c:add", label: "Seat a Player", group: "This Game", keywords: "add sit down", prompt: "their name", run: (name: string) => (play("chips"), addNamed(name)) },
      { id: "c:blinds", label: "Change Blinds", group: "This Game", prompt: "the new blinds, like 1/2", run: blindsFrom },
      ...(seatsOn ? [{ id: "c:seats", label: drawn ? "Redraw Seats" : "Draw Seats", group: "This Game", keywords: "tables shuffle", run: () => seatTools?.draw() }] : []),
      ...(!game.finished ? [{ id: "c:end", label: "End the Game", group: "This Game", keywords: "finish over", run: () => (play("square"), endGame()) }] : []),
      ...(r.mode === "pot" ? [{ id: "c:rake", label: "Add to the Rake Box", group: "This Game", keywords: "rake house drop", prompt: "the amount", run: (v: string) => (play("drop"), addRake(Number(v.replace(/[^0-9.-]/g, "")) || 0)) }] : []),
      ...game.players.map((p) => ({ id: `c:buy:${p.id}`, label: `${p.cashOut === null ? "Rebuy" : "Back In"}: ${p.name}`, group: "Players", keywords: "buy in reload top-up", hint: `+${money(c.defaultBuyIn)}`, run: () => (play("chips"), buyIn(p.id, c.defaultBuyIn)) })),
      ...game.players.filter((p) => p.cashOut === null).map((p) => ({ id: `c:out:${p.id}`, label: `Cash Out ${p.name}`, group: "Players", keywords: "leave rack", run: () => (play(counting === p.id ? "close" : "open"), openCount(p.id)) })),
    ])
  );
</script>

<section class="clockbox" class:paused={game.clock.status === "paused"}>
  <div class="spread">
    <div>
      <div class="lvl">Session <span class="pill" data-s={game.clock.status}>{STATUS_LABEL[game.clock.status]}</span></div>
      <div class="clockface num">{clock(elapsed)}</div>
      <div class="small muted">
        {#if game.clock.status !== "idle"}
          {#if remaining > 0}{clock(remaining)} left of {Math.round(c.plannedMinutes / 6) / 10}h · Ends ~{timeOfDay(time.now + remaining)}{:else}Past the planned end: last orbit?{/if}
        {:else}Planned: {Math.round(c.plannedMinutes / 6) / 10}h{/if}
      </div>
    </div>
    <div class="blinds">
      <div class="num bb"><span use:bump={c.sb * 1e6 + c.bb}>{money(c.sb)}/{money(c.bb)}</span></div>
      <form autocomplete="off" class="row small" onsubmit={changeBlinds}>
        <input type="number" step="any" bind:value={newSb} aria-label="Small Blind" />/<input type="number" step="any" bind:value={newBb} aria-label="Big Blind" />
        <button data-sound="flap">Change Blinds</button>
      </form>
    </div>
  </div>
  <div class="row controls">
    <button class="big" data-sound={startSound} onclick={toggle}><Icon icon={running ? Pause : Play} />{running ? "Pause" : game.clock.status === "idle" ? "Start Session" : "Resume"}</button>
    {#if !game.finished}<button data-sound="square" onclick={endGame}>End Game</button>{:else}<span class="pill pop">Finished</span>{/if}
  </div>
</section>

<div class="stats">
  <div><span>Bank (Buy-Ins)</span><b class="num" use:bump={s.bank}><Count value={s.bank} format={money} /></b></div>
  <div><span>On the Table</span><b class="num" use:bump={s.onTable}><Count value={s.onTable} format={money} /></b></div>
  <div><span>Cashed Out</span><b class="num" use:bump={s.out}><Count value={s.out} format={money} /></b></div>
  <div><span>Seated</span><b class="num" use:bump={s.seated * 1000 + game.players.length}>{s.seated}/{game.players.length}</b></div>
</div>

{#if r.mode === "pot"}
  <!-- the rake box: a running total the host adds to as chips go in -->
  <div class="rakebox">
    <span class="rb-total"><span class="small muted">Rake Box</span> <b class="num" use:bump={s.rakeBox}><Count value={s.rakeBox} format={money} /></b></span>
    <span class="row">
      {#each rakeSteps as v (v)}<button data-sound="drop" onclick={() => addRake(v)} title="Add {money(v)} to the rake box">+{money(v)}</button>{/each}
      <form autocomplete="off" class="joined" onsubmit={rakeOther}>
        <input type="number" step="any" placeholder="Other" bind:value={rakeTyped} aria-label="Other amount for the rake box" />
        <button data-sound="drop" disabled={!rakeTyped} aria-label="Add that to the rake box" title={rakeTyped ? "Add that to the rake box" : "Type an amount first"}><Icon icon={Plus} /></button>
      </form>
      <button class="link small muted" data-sound="drop" onclick={recountRake}>Recount</button>
    </span>
    <span class="small muted">{r.pct}% of each pot, up to {money(r.cap)}, to {house}</span>
  </div>
{:else if r.mode === "seat"}
  <p class="small muted rakebox">Seat fee: {money(r.fee)} a player, paid to {house} in cash, not chips. Settle-up includes it.</p>
{/if}

<!-- the players table is where the night is run, so it gets the full width -->
<section class="players">
    <h2>Players</h2>
    {#if seatsOn}<SeatTools bind:this={seatTools} bind:game {persist} />{/if}
    <div class="scroll-x">
    <table class="roster acts-below">
      <thead>
        <tr>
          {#if drawn}<th>Seat</th>{/if}
          <th>Name</th>
          <th class="num hide-sm">Played</th>
          <th class="num">In</th>
          <th class="num">Out</th>
          <th class="num">Net</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each game.players as p, i (p.id)}
          {@const net = p.cashOut !== null ? round2(p.cashOut - p.cashIn) : null}
          <tr class:dim={p.cashOut !== null} in:fade={reveal()}>
            {#if drawn}<td class="num seat"><span class:dealt={dealing} style:--i={i}>{p.cashOut === null ? seatLabel(p.seat, tables) : ""}</span></td>{/if}
            <td class="who"><input type="text" bind:value={p.name} onchange={persist} class="edit-name" aria-label="Name" /></td>
            <td class="num muted small hide-sm">{played(p)}</td>
            <td class="num nowrap" data-l="In"><span use:bump={p.cashIn}>{money(p.cashIn)}</span> <button class="link small muted" data-sound="rewind" title="Take back a buy-in that shouldn't count" onclick={() => undoBuyIn(p.id)}>Fix</button></td>
            <td class="num" class:blank={p.cashOut === null} data-l="Out">{p.cashOut !== null ? money(p.cashOut) : ""}</td>
            <td class="num {net === null ? 'blank' : net >= 0 ? 'good' : 'bad'}" data-l="Net">{net === null ? "" : signed(net)}</td>
            <td class="nowrap acts">
              <button data-sound="chips" onclick={() => buyIn(p.id, c.defaultBuyIn)} title={p.cashOut === null ? "Standard buy-in" : "Back in for a standard buy-in"}>+{money(c.defaultBuyIn)}</button>
              <!-- any other amount: the box and its + are one control -->
              <form autocomplete="off" class="joined" onsubmit={(e) => addOther(e, p.id)}>
                <input type="number" step="any" min="0" placeholder="Other" bind:value={custom[p.id]} aria-label="Other buy-in amount for {p.name}" />
                <button data-sound="chips" disabled={!custom[p.id]} aria-label="Add that buy-in for {p.name}" title={custom[p.id] ? "Add that buy-in" : "Type an amount first"}><Icon icon={Plus} /></button>
              </form>
              <button class:down={counting === p.id} data-sound={counting === p.id ? "close" : "open"} aria-expanded={counting === p.id} onclick={() => openCount(p.id)}>{p.cashOut === null ? "Cash Out" : "Edit Cash-Out"}</button>
              <RemoveButton label="Remove {p.name}" onclick={() => removePlayer(p.id)} />
            </td>
          </tr>
          {#if counting === p.id}
            <tr class="count-row">
              <td colspan={cols}>
                <form autocomplete="off" class="counter vstack" onsubmit={cashOut} transition:slide={reveal()}>
                  <div class="small muted">Count {p.name}'s chips, or type the total.</div>
                  <div class="stacks">
                    {#each game.chips as ch (ch.id)}
                      <label class="cc">
                        <Chip chip={ch} size={30} spin={false} />
                        <input type="number" min="0" step="1" bind:value={counts[ch.id]} oninput={() => (typed = null)} aria-label="How many {money(ch.value)} chips" />
                        <span class="small muted num">× {money(ch.value)}</span>
                      </label>
                    {/each}
                  </div>
                  <div class="row">
                    <label class="inline"><span>Or the Total {currencySymbol()}</span><input type="number" min="0" step="any" bind:value={typed} /></label>
                    <button data-sound="rack">Cash Out {money(outTotal)}</button>
                    <span class="small num {outTotal - p.cashIn >= 0 ? 'good' : 'bad'}">{signed(round2(outTotal - p.cashIn))} for the session</span>
                    <button type="button" class="link small muted" data-sound="close" onclick={() => (counting = null)}>Cancel</button>
                  </div>
                </form>
              </td>
            </tr>
          {/if}
        {:else}
          <tr><td class="empty" colspan={cols}>No players seated yet</td></tr>
        {/each}
      </tbody>
    </table>
    </div>
    <form autocomplete="off" class="row add" onsubmit={add}>
      <input type="text" bind:value={newName} placeholder="Player Name" list="regulars" autocomplete="off" aria-label="Player Name" />
      <button data-sound="chips"><Icon icon={Plus} />Sit Down ({money(c.defaultBuyIn)})</button>
    </form>
</section>

<div class="cols">
  <section>
    <h2>Settle Up</h2>
    {#if Math.abs(s.diff) > 0.001 && s.allOut}
      <p class="warn small" transition:slide={reveal()}>The bank is off by {money(s.diff)}: more {s.diff > 0 ? "came out than went in" : "went in than came out"}. Recheck the cash-outs.</p>
    {/if}
    {#if balanced}
      <p class="good small with-icon pop"><Icon icon={Check} />The bank balances. Every chip is accounted for{s.rakeBox ? `, ${money(s.rakeBox)} of it in the rake box` : ""}.</p>
    {/if}
    {#if moves.length}
      <ul class="moves" in:slide={reveal()}>
        {#each moves as m, i (i)}
          {@const links = linksFor(m.to, m.amount)}
          <li in:slide={reveal()} out:slide={leave()} style:--i={i}>
            <b>{m.from}</b> pays <b>{m.to}</b> <span class="num">{money(m.amount)}</span>
            {#if links.length}<span class="small pay links">{#each links as l (l.label)}<a href={l.href} target="_blank" rel="noopener noreferrer" title="Pay {l.handle} on {l.label}">{l.label}</a>{/each}</span>{/if}
          </li>
        {/each}
      </ul>
      {#if r.mode === "seat"}<p class="small muted">Includes the {money(r.fee)} seat fee each player owes {house}.</p>{/if}
      {#if !s.allOut}<p class="small muted" in:slide={reveal()} out:slide={leave()}>Counts only players who have cashed out so far.</p>{/if}
      {#if !anyHandles && settings.usePayLinks}<p class="small muted">Save players' Venmo, Cash App or PayPal on the <a href="/players">Players</a> page to get pay links here with the amount filled in.</p>{/if}
    {:else}
      <p class="muted small">Cash players out to see who pays who, in as few payments as possible.</p>
    {/if}
  </section>

  <section>
    <h2>Chips</h2>
    <div class="block"><ChipLegend chips={game.chips} isCash size={44} /></div>
    <h3>
      A Buy-In of
      <input type="number" step="any" min="0" bind:value={buyInFor} aria-label="Buy-In Amount" /> Gets
    </h3>
    <div class="felt"><Breakdown breakdown={distribute(buyInFor, game.chips, Math.max(1, game.players.length))} isCash target={buyInFor} /></div>
    <p class="small muted">Buy-in range {money(c.minBuyIn)}–{money(c.maxBuyIn)} · {c.straddle ? "Straddles allowed" : "No straddles"}</p>
  </section>
</div>

<style>
  /* the same size as the tournament clock (TournamentControl) */
  .controls {
    margin-top: 8px;
  }
  .blinds {
    text-align: right;
  }
  .blinds input {
    width: 70px;
  }
  .blinds form {
    justify-content: flex-end;
    margin-top: 4px;
  }
  /* on a phone the blinds drop under the session clock, lined up with it */
  @media (max-width: 600px) {
    .blinds {
      text-align: left;
    }
    .blinds form {
      justify-content: flex-start;
    }
  }
  .moves {
    padding-left: 18px;
  }
  .players {
    margin-bottom: 26px;
  }
  .add {
    margin-top: 8px;
  }
  /* a sub-heading under the chips (A Buy-In of...) */
  h3 {
    margin-top: 12px;
  }
  .players table {
    min-width: 640px;
  }
  .acts {
    width: 1%;
  }
  /* global: the remove x at the end is its own component */
  .acts > :global(*) {
    vertical-align: middle;
  }
  .acts > :global(* + *) {
    margin-left: 4px;
  }
  .joined {
    display: inline-flex;
  }
  .joined input {
    width: 72px;
  }
  /* one hairline where the two meet, not two */
  .joined button {
    margin-left: calc(-1 * var(--hair));
  }
  .count-row td {
    background: var(--block);
    padding: 0;
  }
  .counter {
    padding: 10px 12px;
  }
  .stacks {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
  }
  .cc {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 0;
  }
  .cc input {
    width: 60px;
  }
  .moves li {
    margin-bottom: 4px;
  }
  .pay {
    margin-left: 12px;
  }
  .rakebox {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 16px;
    margin: -4px 0 20px;
  }
  .rb-total b {
    font-size: 16px;
  }
</style>

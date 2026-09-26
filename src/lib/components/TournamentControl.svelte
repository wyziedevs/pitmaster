<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
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
  } from "$lib/game";
  import { annotate } from "$lib/blinds";
  import { distribute } from "$lib/chips";
  import { amt, clock, money, nameKey, ordinal, payLinks, timeOfDay } from "$lib/util";
  import { getHandles } from "$lib/store";
  import { time } from "$lib/now.svelte";
  import StructureTable from "./StructureTable.svelte";
  import DealCalc from "./DealCalc.svelte";
  import SeatTools from "./SeatTools.svelte";
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
  const seatsOn = $derived(settings.useSeats || drawn);
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
  const canDeal = $derived(!game.finished && alive.length >= 2 && alive.length <= 9 && game.clock.status !== "idle");
  const cols = $derived(2 + +drawn + +t.rebuy.on + +t.addOn.on + +showKos);
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
    if (f?.text === "Seats are drawn" && f.at > opened) dealtAt = f.at;
  });
  const dealing = $derived(time.now - dealtAt < 1500);

  // the game just ended in front of us: rake the pot over to the winner
  let wasFinished: boolean | null = null;
  $effect(() => {
    const f = game.finished;
    if (f && wasFinished === false) setTimeout(() => play("ship"), 160);
    wasFinished = f;
  });
  // the host pays the winners out of the pool: links for anyone with a saved handle
  const handles = getHandles();

  // a few stacks of the game's own chips, biggest first
  const pot = $derived([...game.chips].sort((a, b) => b.value - a.value).slice(0, 4));

  function act(fn: () => void) {
    fn();
    persist();
  }

  const toggle = () =>
    act(() => {
      const wasIdle = game.clock.status === "idle";
      const wasRunning = running;
      clk.toggle(game);
      logEvent(game, wasRunning ? "Clock paused" : wasIdle ? "Shuffle up and deal!" : "Clock resumed");
      if (wasIdle) flash(game, "Shuffle up and deal!");
    });

  function addNamed(name: string) {
    if (!name.trim()) return;
    if (!lateRegOpen && game.clock.status !== "idle" && !confirm("Late registration is closed. Add anyway?")) return;
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
      if (delta > 0) {
        if (p.out) unbust(game, id, true);
        logEvent(game, `${p.name} rebought (${money(t.rebuy.cost)})`);
        flash(game, `${p.name} rebuys!`);
      }
    });
  }

  function addOn(id: string, delta: number) {
    const p = game.players.find((x) => x.id === id)!;
    act(() => {
      p.addOns = Math.max(0, p.addOns + delta);
      if (delta > 0) logEvent(game, `${p.name} took the add-on`);
    });
  }

  function removePlayer(id: string) {
    const p = game.players.find((x) => x.id === id)!;
    if (!confirm(`Remove ${p.name} and refund their buy-in?`)) return;
    act(() => {
      game.players = game.players.filter((x) => x.id !== id);
      logEvent(game, `${p.name} removed`);
    });
  }

  // the palette (ctrl k) knows this game while it's on screen. each command
  // makes the same sound as the button it stands in for.
  $effect(() =>
    provide("tourney", () => [
      { id: "t:clock", label: running ? "Pause the Clock" : game.clock.status === "idle" ? "Start the Clock" : "Resume the Clock", group: "This Game", hint: "Space", run: () => (play(startSound), toggle()) },
      { id: "t:next", label: "Next Level", group: "This Game", hint: "→", run: () => (play("flap"), act(() => clk.step(game, 1))) },
      { id: "t:back", label: "Previous Level", group: "This Game", hint: "←", run: () => (play("flapBack"), act(() => clk.step(game, -1))) },
      { id: "t:plus", label: "Add a Minute", group: "This Game", keywords: "+1 time", run: () => (play("wind"), act(() => clk.addTime(game, 60000))) },
      { id: "t:minus", label: "Take a Minute Off", group: "This Game", keywords: "-1 time", run: () => (play("unwind"), act(() => clk.addTime(game, -60000))) },
      { id: "t:add", label: "Add Player", group: "This Game", keywords: "register entry seat", prompt: "their name", run: (name: string) => (play("chips"), addNamed(name)) },
      ...(seatsOn ? [{ id: "t:seats", label: drawn ? "Redraw Seats" : "Draw Seats", group: "This Game", keywords: "tables shuffle", run: () => seatTools?.draw() }] : []),
      { id: "t:structure", label: "Edit the Structure", group: "This Game", keywords: "blinds levels", run: () => (play("open"), (editStructure = true)) },
      ...(canDeal && dealsOn ? [{ id: "t:deal", label: "Deal Calculator", group: "This Game", keywords: "icm chop split", run: () => (play("open"), (showDeal = true)) }] : []),
      ...alive.map((p) => ({ id: `t:bust:${p.id}`, label: `Bust ${p.name}`, group: "Players", keywords: "out eliminate", run: () => (play("bust"), act(() => bust(game, p.id))) })),
      ...(t.rebuy.on && rebuyOpen ? game.players.map((p) => ({ id: `t:rebuy:${p.id}`, label: `Rebuy ${p.name}`, group: "Players", hint: money(t.rebuy.cost), run: () => (play("chips"), rebuy(p.id, 1)) })) : []),
      ...(t.addOn.on ? alive.map((p) => ({ id: `t:addon:${p.id}`, label: `Add-On for ${p.name}`, group: "Players", hint: money(t.addOn.cost), run: () => (play("chips"), addOn(p.id, 1)) })) : []),
      ...game.players.filter((p) => p.out && !game.deal).map((p) => ({ id: `t:unbust:${p.id}`, label: `Undo Bust: ${p.name}`, group: "Players", run: () => (play("rewind"), act(() => unbust(game, p.id))) })),
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
        <span use:bump={d.index}>{#if d.level.isBreak}<Icon icon={Coffee} /> Break{:else}Level {levelNum}{/if}</span>
        <span class="pill" data-s={game.clock.status}>{clk.STATUS_LABEL[game.clock.status]}</span>
      </div>
      <div class="clockface num">{clock(d.remainingMs)}</div>
    </div>
    <div class="blinds">
      {#if d.level.isBreak}
        <div class="muted small">Next</div>
        {#if d.next}<div class="num bb">{amt(d.next.sb)}/{amt(d.next.bb)}</div>{/if}
      {:else}
        <div class="num bb"><span use:bump={d.index}>{amt(d.level.sb)}/{amt(d.level.bb)}</span></div>
        {#if d.level.ante}<div class="num">Ante {amt(d.level.ante)}</div>{/if}
        <div class="small muted">{d.next ? `Next: ${amt(d.next.sb)}/${amt(d.next.bb)}` : "Final Level"}</div>
      {/if}
    </div>
  </div>
  <ProgressBar value={d.progress} />
  <div class="row controls">
    <button class="big" class:down={held === " "} data-sound={startSound} onclick={toggle}><Icon icon={running ? Pause : Play} />{running ? "Pause" : game.clock.status === "idle" ? "Start" : "Resume"}</button>
    <button class:down={held === "ArrowLeft"} data-sound="flapBack" onclick={() => act(() => clk.step(game, -1))}><Icon icon={ChevronLeft} />Back</button>
    <button class:down={held === "ArrowRight"} data-sound="flap" onclick={() => act(() => clk.step(game, 1))}>Next<Icon icon={ChevronRight} /></button>
    <button data-sound="unwind" onclick={() => act(() => clk.addTime(game, -60000))}>−1 Min</button>
    <button data-sound="wind" onclick={() => act(() => clk.addTime(game, 60000))}>+1 Min</button>
    <span class="small muted keys-hint"><Kbd k="Space" class={held === " " ? "down" : ""} /> Pause · <Kbd k="←" class={held === "ArrowLeft" ? "down" : ""} /><Kbd k="→" class={held === "ArrowRight" ? "down" : ""} /> Levels</span>
  </div>
</section>

<div class="stats">
  <div>
    <span>Players</span><b class="num" use:bump={s.left * 1000 + s.entrants}>{s.left}/{s.entrants}</b>
    {#key moneyState}
      {#if moneyState === "bubble"}<small class="bubble pop">Bubble</small>{:else if moneyState === "itm"}<small class="good pop">In the Money</small>{/if}
    {/key}
  </div>
  <div><span>Avg Stack</span><b class="num" use:bump={Math.round(s.avgStack)}><Count value={Math.round(s.avgStack)} format={amt} /></b>{#if d.level.bb}<small> {Math.round(s.avgStack / d.level.bb)}bb</small>{/if}</div>
  <div><span>Prize Pool</span><b class="num" use:bump={s.pool}><Count value={s.pool} format={money} /></b></div>
  <div><span>Chips in Play</span><b class="num" use:bump={s.chipsInPlay}><Count value={s.chipsInPlay} format={amt} /></b></div>
  <div><span>Next Break</span><b class="num">{d.nextBreakInMs === null ? "None" : clock(d.nextBreakInMs)}</b></div>
  <div><span>Elapsed</span><b class="num">{clock(d.totalElapsedMs)}</b>{#if game.clock.startedAt}<small> since {timeOfDay(game.clock.startedAt)}</small>{/if}</div>
</div>

{#if game.finished}
  <div class="warn pop won">
    <p>
      {#if game.deal}<Icon icon={Handshake} /> It's a deal: {game.players.filter((p) => p.id in game.deal!.amounts).map((p) => p.name).join(", ")} split the prize pool.
      {:else}<Icon icon={Trophy} /> <b>{game.players.find((p) => p.place === 1)?.name}</b> wins.{/if}
      The TV is showing the results.
    </p>
    <!-- the pot, pushed across and stacked -->
    <span class="pot" aria-hidden="true">
      {#each pot as c, i (c.id)}<span style:--d="{200 + i * 110}ms"><ChipStack chip={c} n={[7, 10, 5, 8][i]} width={20} /></span>{/each}
    </span>
  </div>
{/if}

<div class="cols">
  <section>
    <div class="spread">
      <h2>Players</h2>
      <span class="small">
        {#key lateRegOpen}<span class="pop" class:good={lateRegOpen} class:muted={!lateRegOpen}>{lateRegOpen ? `Late Registration Open Through Level ${t.lateRegLevel}` : "Late Registration Closed"}</span>{/key}
        {#if t.rebuy.on}· {#key rebuyOpen}<span class="pop" class:good={rebuyOpen} class:muted={!rebuyOpen}>{rebuyOpen ? "Rebuys Open" : "Rebuys Closed"}</span>{/key}{/if}
      </span>
    </div>
    {#if seatsOn}<SeatTools bind:this={seatTools} bind:game {persist} />{/if}
    <div class="scroll-x">
    <table class="roster">
      <thead>
        <tr>
          {#if drawn}<th>Seat</th>{/if}
          <th>Name</th>
          {#if t.rebuy.on}<th class="num">Rebuys</th>{/if}
          {#if t.addOn.on}<th class="num">Add-On</th>{/if}
          {#if showKos}<th class="num">KOs</th>{/if}
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each ranked as p, i (p.id)}
          <tr class:dim={p.out} in:fade={reveal()} animate:flip={reorder()}>
            {#if drawn}<td class="num seat"><span class:dealt={dealing} style:--i={i}>{p.out ? "" : seatLabel(p.seat, tables)}</span></td>{/if}
            <td class="nowrap who">
              {#if p.out}<span class="num place" use:fresh={[p.bustedAt, "stamp"]}>{ordinal(p.place ?? 0)}</span>{:else if p.place === 1}<Icon icon={Trophy} label="Winner" />{/if}
              <input type="text" bind:value={p.name} onchange={persist} class="edit-name" aria-label="Name" />
            </td>
            {#if t.rebuy.on}
              <td class="num nowrap" data-l="Rebuys">
                <button class="link" data-sound="rewind" onclick={() => rebuy(p.id, -1)} disabled={!p.rebuys} aria-label="Take Back a Rebuy" title={p.rebuys ? "Take back a rebuy" : "No rebuys to take back"}><Icon icon={Minus} size="1em" /></button>
                {p.rebuys}
                <button class="link" data-sound="chips" onclick={() => rebuy(p.id, 1)} aria-label="Add a Rebuy"><Icon icon={Plus} size="1em" /></button>
              </td>
            {/if}
            {#if t.addOn.on}
              <td class="num nowrap" data-l="Add-On">
                <button class="link" data-sound="rewind" onclick={() => addOn(p.id, -1)} disabled={!p.addOns} aria-label="Take Back an Add-On" title={p.addOns ? "Take back an add-on" : "No add-ons to take back"}><Icon icon={Minus} size="1em" /></button>
                {p.addOns}
                <button class="link" data-sound="chips" onclick={() => addOn(p.id, 1)} aria-label="Add an Add-On"><Icon icon={Plus} size="1em" /></button>
              </td>
            {/if}
            {#if showKos}<td class="num" class:blank={!koCount(game, p.id)} data-l="KOs">{koCount(game, p.id) || ""}</td>{/if}
            <!-- a busted row's actions may wrap to a second line rather than push the table wider -->
            <td class="acts">
              {#if p.out && !game.deal}
                {#if kosOn}<select class="ko" value={lastKo(p.id)} onchange={(e) => act(() => creditKo(game, p.id, (e.target as HTMLSelectElement).value || null))} aria-label="Who knocked out {p.name}">
                  <option value="">KO’d By…</option>
                  {#each game.players.filter((x) => x.id !== p.id) as x (x.id)}<option value={x.id}>{x.name}</option>{/each}
                </select>{/if}
                <button class="link small nowrap" data-sound="rewind" onclick={() => act(() => unbust(game, p.id))}>Undo Bust</button>
              {:else if !game.finished}
                <button class="danger" data-sound="bust" onclick={() => act(() => bust(game, p.id))}><Icon icon={Skull} />Bust</button>
              {/if}
              <RemoveButton label="Remove {p.name}" onclick={() => removePlayer(p.id)} />
            </td>
          </tr>
        {:else}
          <tr><td class="empty" colspan={cols}>No players yet. Add them below.</td></tr>
        {/each}
      </tbody>
    </table>
    </div>
    <form autocomplete="off" class="row add" onsubmit={add}>
      <input type="text" bind:value={newName} placeholder="Player Name" list="regulars" autocomplete="off" aria-label="Player Name" />
      <button data-sound="chips"><Icon icon={Plus} />Add ({money(t.buyIn)})</button>
    </form>

    <h2 class="part">Payouts{#if game.deal} <span class="pill">Deal</span>{/if}</h2>
    <table>
      <tbody>
        {#each payRows as i (i)}
          {@const who = game.players.find((p) => p.place === i + 1)}
          {@const owed = paidFor(game, who?.id, i + 1, s.payouts)}
          <tr>
            <td>{ordinal(i + 1)}</td>
            <td class="num muted">{game.deal ? "" : `${s.pcts[i]}%`}</td>
            <td class="num"><b>{money(owed)}</b></td>
            <td>
              <!-- a name lands in its place like the busted player's stamp -->
              {#if who}<span class="paid" use:fresh={[who.bustedAt ?? game.endedAt, "stamp"]}>{who.name}</span>{/if}
              {#if who && game.finished && owed > 0 && settings.usePayLinks}
                {@const links = payLinks(handles[nameKey(who.name)] ?? null, owed, game.name)}
                {#if links.length}<span class="small pay links">{#each links as l (l.label)}<a href={l.href} target="_blank" rel="noopener noreferrer" title="Pay {l.handle} on {l.label}">{l.label}</a>{/each}</span>{/if}
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <p class="small muted">
      {s.entrants} × {money(t.buyIn)}{s.rebuys ? ` + ${s.rebuys} rebuys` : ""}{s.addOns ? ` + ${s.addOns} add-ons` : ""} = {money(s.gross)}{s.bounties ? ` − ${money(s.bounties)} in bounties (${money(s.bounty)} a head)` : ""}{s.rake ? ` − ${money(s.rake)} to the house` : ""}
    </p>

    {#if canDeal && dealsOn}
      <div class="part" transition:slide={reveal()}>
        <div class="spread">
          <h2>Deal?</h2>
          <button class="link small" data-sound={showDeal ? "close" : "open"} aria-expanded={showDeal} onclick={() => (showDeal = !showDeal)}>{showDeal ? "Hide" : "Run the Numbers"}</button>
        </div>
        {#if showDeal}<div transition:slide={reveal()}><DealCalc bind:game {persist} /></div>{/if}
      </div>
    {/if}
  </section>

  <section>
    <div class="spread">
      <h2>Structure</h2>
      <button class="link small" data-sound={editStructure ? "close" : "open"} aria-expanded={editStructure} onclick={() => (editStructure = !editStructure)}>{editStructure ? "Done Editing" : "Edit"}</button>
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

    <h2 class="part">Chips</h2>
    <div class="block"><ChipLegend chips={game.chips} size={44} /></div>
    <h3>Starting Stack ({amt(t.stack)})</h3>
    <div class="felt"><Breakdown breakdown={distribute(t.stack, game.chips, Math.max(2, s.entrants))} target={t.stack} /></div>
    {#if t.rebuy.on}
      <h3>Rebuy ({amt(t.rebuy.chips)})</h3>
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
  .blinds {
    text-align: right;
  }
  .controls {
    margin-top: 8px;
  }
  .clockbox > :global(.progress) {
    margin-top: 8px;
  }
  /* one bust from the money: the tense bit, so it gets the red */
  .bubble {
    color: var(--accent);
  }
  .won {
    margin: 14px 0;
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 6px 16px;
  }
  .won p {
    margin: 0;
    align-self: center;
  }
  .pot {
    display: inline-flex;
    align-items: flex-end;
    gap: 14px; /* room for a shuffle's halves (toys.ts SPLIT) */
    flex: none;
  }
  .pot :global(.stack) {
    --t: 3px;
  }
  .place {
    display: inline-block;
    min-width: 2.2em;
    color: var(--muted);
  }
  .acts {
    line-height: 30px;
  }
  .add {
    margin-top: 8px;
  }
  /* a later part of a column (Payouts, Deal?, Chips) starts with room above it */
  .part {
    margin-top: 22px;
  }
  /* and a sub-heading under one (Starting Stack, Rebuy) with a little less */
  h3 {
    margin-top: 12px;
  }
  /* inline-block, so the stamp can turn it */
  .paid {
    display: inline-block;
  }
  /* pay links sit a space after the winner's name */
  .pay {
    margin-left: 12px;
  }
  /* a long name shouldn't push the row wider */
  select.ko {
    max-width: 150px;
  }
  /* on a phone the clock's buttons are an even grid: Pause (or Resume, which
     wouldn't fit a third of a phone) the whole way across, where a thumb finds
     it, then Back and Next, then the minute nudges */
  @media (max-width: 600px) {
    .controls {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .controls > button:first-child {
      grid-column: 1 / -1;
    }
    .controls .keys-hint {
      grid-column: 1 / -1;
    }
  }
</style>

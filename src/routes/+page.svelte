<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import CalcIcon from "@lucide/svelte/icons/calculator";
  import Search from "@lucide/svelte/icons/search";
  import CircleHelp from "@lucide/svelte/icons/circle-help";
  import HardDriveDownload from "@lucide/svelte/icons/hard-drive-download";
  import RotateCw from "@lucide/svelte/icons/rotate-cw";
  import Bookmark from "@lucide/svelte/icons/bookmark";
  import { goto } from "$app/navigation";
  import { getGames, deleteGame, getChipSet, getDefaultChipSetId, saveGame, getTemplates, onOtherTab, lastExport } from "$lib/store";
  import { vault } from "$lib/lock.svelte";
  import { tourneyStats, cashStats, rerun } from "$lib/game";
  import { derive, cashElapsed } from "$lib/clock";
  import { headline, leaderboard } from "$lib/stats";
  import { ago, amt, clock, day, money, signed } from "$lib/util";
  import { totalCount } from "$lib/chips";
  import { calc, CALC_KEY } from "$lib/calcbox.svelte";
  import { palette } from "$lib/commands.svelte";
  import { settings } from "$lib/settings.svelte";
  import { keyLabel, DEFAULT_PALETTE_KEY } from "$lib/keys";
  import { time } from "$lib/now.svelte";
  import { toast } from "$lib/toast.svelte";
  import type { Game } from "$lib/types";
  import Chip from "$lib/components/Chip.svelte";
  import Intro from "$lib/components/Intro.svelte";
  import Toys from "$lib/components/Toys.svelte";
  import { leave, reveal, slide } from "$lib/motion";
  import { fade } from "svelte/transition";
  import { play } from "$lib/sound";
  import { HOME_TITLE } from "$lib/site";

  let games = $state<Game[]>(getGames());
  const chipSet = getChipSet(getDefaultChipSetId());
  // a game running in another tab: the list keeps up with it
  $effect(() => onOtherTab(() => (games = getGames())));

  // safari, and every browser on an iphone or ipad, deletes a site's saved data
  // after seven days without a visit, unless the site's on the home screen.
  // once there are games that haven't been exported, say so
  let evictable = $state(false);
  $effect(() => {
    const ua = navigator.userAgent;
    const webkit = /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg|OPR|Android/.test(ua);
    const installed = matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    const newest = Math.max(0, ...games.map((g) => g.updatedAt));
    if (!webkit || installed || vault.state !== "open" || !newest || newest <= lastExport()) return void (evictable = false);
    const keep = navigator.storage?.persisted?.();
    if (!keep) return void (evictable = true);
    keep.then((p) => (evictable = !p)).catch(() => (evictable = true));
  });

  const live = $derived(games.filter((g) => !g.finished));
  const done = $derived(games.filter((g) => g.finished));

  // past games: search by game or player name, filter by type, ten at a time
  let q = $state("");
  let kind = $state<"all" | "cash" | "tournament">("all");
  let showAll = $state(false);
  const found = $derived(
    done.filter((g) => {
      if (kind !== "all" && g.type !== kind) return false;
      const needle = q.trim().toLowerCase();
      return !needle || g.name.toLowerCase().includes(needle) || g.players.some((p) => p.name.toLowerCase().includes(needle));
    })
  );
  const shown = $derived(showAll ? found : found.slice(0, 10));

  // the side: ways to start fast, the chips you're playing with, who's up,
  // and the tools that aren't in the header
  const templates = getTemplates().slice(0, 4);
  // the last few different games, newest first, to run back in one click
  const recent = $derived(done.filter((g, i) => done.findIndex((x) => x.name === g.name && x.type === g.type) === i).slice(0, 3));
  const board = $derived(leaderboard(done).slice(0, 5));
  const chipCount = chipSet ? totalCount(chipSet.chips) : 0;
  const paletteKey = $derived(keyLabel(settings.paletteKey || DEFAULT_PALETTE_KEY));

  function openCalc() {
    play("open");
    calc.open = true;
  }
  function openCommands() {
    palette.open = true;
  }

  /** what a running game is doing right now, ticking */
  function now(g: Game) {
    if (g.clock.status === "idle") return "";
    if (g.type === "tournament" && g.levels.length) {
      const d = derive(g, time.now);
      const lvl = d.level.isBreak ? "Break" : `Level ${d.level.num ?? d.index + 1} · ${amt(d.level.sb)}/${amt(d.level.bb)}`;
      return `${lvl} · ${clock(d.remainingMs)} left`;
    }
    return `${clock(cashElapsed(g, time.now))} played · ${money(cashStats(g).onTable)} on the table`;
  }

  function runItBack(g: Game) {
    const n = rerun(g);
    saveGame(n);
    toast(`Running “${g.name}” back`);
    goto(`/game/${n.id}`);
  }

  /** the setup in a line. a running cash game already says what's on the table, so it skips the bank */
  function summary(g: Game, running = false) {
    if (g.type === "tournament") {
      const s = tourneyStats(g);
      return `${s.entrants} players · ${money(g.tourney!.buyIn)} buy-in · pool ${money(s.pool)}`;
    }
    const blinds = `${g.players.length} players · ${money(g.cash!.sb)}/${money(g.cash!.bb)}`;
    return running ? blinds : `${blinds} · ${money(cashStats(g).bank)} in play`;
  }

  function status(g: Game) {
    if (g.finished) return "Finished";
    return g.clock.status === "running" ? "Running" : g.clock.status === "paused" ? "Paused" : "Not Started";
  }

  function remove(g: Game) {
    if (!confirm(`Delete “${g.name}”? This can't be undone.`)) return;
    deleteGame(g.id);
    games = getGames();
  }
</script>

<svelte:head><title>{HOME_TITLE}</title></svelte:head>

<div class="home">
<section class="hero block">
  {#if settings.toys}<div class="fidget"><Toys /></div>{/if}
  <h1>Run Your Game.</h1>
  <p>Set your chips, blinds and buy-ins, then put the game up on the TV or any screen.</p>
  <div class="row">
    <a class="btn big" href="/new?type=cash"><Icon icon={Plus} />New Cash Game</a>
    <a class="btn big" href="/new?type=tournament"><Icon icon={Plus} />New Tournament</a>
  </div>
</section>

<section class="now">
  {#if evictable}
    <p class="warn small backup" transition:slide={reveal()}>
      Safari deletes a site's saved games after 7 days without a visit.
      <a href="/settings#data">Export a Backup</a>, or add PitMaster to your Home Screen to keep them.
    </p>
  {/if}
  <h2>Games in Progress</h2>
  {#if live.length}
    <ul class="list bare">
      {#each live as g (g.id)}
        <!-- the name and where it's at on top; the details and the way out underneath -->
        <li out:slide={leave()}>
          <div class="spread">
            <span><span class="pill">{g.type === "cash" ? "Cash" : "Tournament"}</span> <a class="game" href="/game/{g.id}">{g.name}</a></span>
            <span class="pill" data-s={g.clock.status}>{status(g)}</span>
          </div>
          <div class="small muted">
            {#if now(g)}<span class="tick">{now(g)}</span>{:else}Made {ago(g.createdAt)}{/if} · {summary(g, !!now(g))}
          </div>
          <div class="small links">
            <a href="/game/{g.id}/tv" target="_blank">TV View <Icon icon={ExternalLink} size="1em" /></a>
            <button class="link muted" data-sound="thud" onclick={() => remove(g)}>Delete</button>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <div class="empty idle">
      {#if chipSet?.chips[0]}<Chip chip={chipSet.chips[0]} size={30} text="" />{/if}
      <p>No games running. Start one above, or <a href="/settings#data">import one</a> from another device.</p>
    </div>
  {/if}
</section>

{#if done.length}
  <section class="past">
    <div class="spread">
      <h2>Past Games</h2>
      <span class="small"><a href="/players">Player Stats <Icon icon={ArrowRight} size="1em" /></a></span>
    </div>
    <div class="row filters">
      <input type="search" bind:value={q} placeholder="Search Games or Players" aria-label="Search past games" />
      <select bind:value={kind} aria-label="Game type">
        <option value="all">All Games</option>
        <option value="cash">Cash Games</option>
        <option value="tournament">Tournaments</option>
      </select>
      <span class="small muted">{found.length} of {done.length}</span>
    </div>
    <table>
      <thead>
        <tr><th>Date</th><th>Game</th><th>Result</th><th class="hide-sm">Setup</th><th></th></tr>
      </thead>
      <tbody>
        {#each shown as g (g.id)}
          <!-- rows can't slide (a table row won't shrink below its text), so they fade -->
          <tr in:fade={reveal()} out:fade={leave()}>
            <td class="mono nowrap">{day(g.clock.startedAt ?? g.createdAt)}</td>
            <td><span class="pill">{g.type === "cash" ? "Cash" : "Tournament"}</span> <a href="/game/{g.id}">{g.name}</a></td>
            <td class="res">{headline(g)}</td>
            <td class="small muted hide-sm">{summary(g)}</td>
            <td class="nowrap small acts">
              <span class="links">
                <button class="link" data-sound="riffle" onclick={() => runItBack(g)}>Run It Back</button>
                <button class="link muted" data-sound="thud" onclick={() => remove(g)}>Delete</button>
              </span>
            </td>
          </tr>
        {:else}
          <tr><td colspan="5" class="empty">No past games match.</td></tr>
        {/each}
      </tbody>
    </table>
    {#if found.length > shown.length}
      <p class="small"><button class="link" data-sound="open" onclick={() => (showAll = true)}>Show All {found.length}</button></p>
    {/if}
  </section>
{/if}

<aside class="side">
  <section>
    <h2>Quick Start</h2>
    {#if templates.length || recent.length}
      <ul class="rows bare">
        {#each templates as t (t.id)}
          <li>
            <span class="ic muted" aria-hidden="true"><Icon icon={Bookmark} size="1em" /></span>
            <a href="/new?type={t.type}&template={t.id}">{t.name}</a>
            <span class="small muted">{t.type === "cash" ? "Cash" : "Tournament"}</span>
          </li>
        {/each}
        {#each recent as g (g.id)}
          <li>
            <span class="ic muted" aria-hidden="true"><Icon icon={RotateCw} size="1em" /></span>
            <button class="link" data-sound="riffle" title="Run “{g.name}” back: same setup, same players" onclick={() => runItBack(g)}>{g.name}</button>
            <span class="small muted nowrap">{day(g.clock.startedAt ?? g.createdAt)}</span>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="empty small">Templates and past games land here.</p>
    {/if}
  </section>

  {#if chipSet}
    <section>
      <div class="spread">
        <h2>Your Chips</h2>
        <a class="small" href="/settings#chips">Change</a>
      </div>
      <ul class="rows bare chips">
        {#each chipSet.chips as c (c.id)}
          <li>
            <Chip chip={c} size={20} text="" />
            <b class="num">{amt(c.value)}</b>
            <span class="num muted small">×{c.count}</span>
          </li>
        {/each}
      </ul>
      <p class="small muted foot">{chipSet.name} · {chipCount} chips</p>
    </section>
  {/if}

  {#if board.length}
    <section>
      <div class="spread">
        <h2>Top Players</h2>
        <a class="small" href="/players">All Stats</a>
      </div>
      <ol class="rows bare board">
        {#each board as p, i (p.key)}
          <li>
            <span class="num muted small">{i + 1}</span>
            <a href="/players">{p.name}</a>
            <span class="num" class:good={p.net > 0} class:bad={p.net < 0}>{signed(p.net)}</span>
          </li>
        {/each}
      </ol>
    </section>
  {/if}

  <section>
    <h2>Tools</h2>
    <ul class="rows bare tools">
      <li>
        <span class="ic muted" aria-hidden="true"><Icon icon={CalcIcon} size="1em" /></span>
        <button class="link" data-sound="none" onclick={openCalc}>Calculator</button>
        <kbd class="keys-hint">{keyLabel(CALC_KEY)}</kbd>
      </li>
      <li>
        <span class="ic muted" aria-hidden="true"><Icon icon={Search} size="1em" /></span>
        <!-- the palette makes its own sound as it opens -->
        <button class="link" data-sound="none" onclick={openCommands}>Commands</button>
        <kbd class="keys-hint">{paletteKey}</kbd>
      </li>
      <li>
        <span class="ic muted" aria-hidden="true"><Icon icon={HardDriveDownload} size="1em" /></span>
        <a href="/settings#data">Manage Data</a>
      </li>
      <li>
        <span class="ic muted" aria-hidden="true"><Icon icon={CircleHelp} size="1em" /></span>
        <a href="/help">How It Works</a>
      </li>
    </ul>
  </section>
</aside>
</div>

<Intro />

<style>
  /* one column on a phone: the way in, what's running, the side, then the
     past. on a wide screen the side runs down the right the whole way */
  .home {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "hero" "now" "side" "past";
    gap: 26px;
  }
  .hero {
    grid-area: hero;
  }
  .now {
    grid-area: now;
  }
  .backup {
    margin: 0 0 18px;
  }
  .past {
    grid-area: past;
  }
  .side {
    grid-area: side;
    display: grid;
    align-content: start;
    gap: 22px;
  }
  /* a tablet: the side's sections sit side by side instead of stacking */
  @media (min-width: 600px) and (max-width: 899px) {
    .side {
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 22px 28px;
    }
  }
  @media (min-width: 900px) {
    .home {
      grid-template-columns: minmax(0, 1fr) 264px;
      grid-template-areas: "hero side" "now side" "past side";
      grid-template-rows: auto auto 1fr;
      gap: 26px 36px;
    }
  }
  /* the side's sections are peers of the ones beside them (h2s), set at the
     size of a small heading so the main column leads */
  .side h2 {
    font: bold 15px/1.2 var(--font);
  }
  .side section > h2,
  .side .spread {
    padding-bottom: 4px;
    margin-bottom: 2px;
  }
  .side p {
    margin: 6px 0 0;
  }
  /* ledger rows: a mark, the thing, and a figure at the end */
  .rows li {
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    min-height: 30px;
    padding: 2px 0;
    border-bottom: var(--hair) solid var(--line);
  }
  .rows li > :nth-child(2) {
    justify-self: start;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }
  .ic {
    display: inline-flex;
    justify-self: center;
  }
  .board li > :first-child {
    justify-self: center;
  }
  .chips li {
    min-height: 28px;
  }
  /* a phone: the chips go two across, so the set is half as tall */
  @media (max-width: 599px) {
    .chips {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 18px;
    }
  }
  .tick {
    font-variant-numeric: tabular-nums;
  }
  /* on a phone each past game is a short block: the date, then the name, what
     happened and what you can do, all lined up under the name */
  @media (max-width: 600px) {
    .past table,
    .past tbody {
      display: block;
    }
    .past thead {
      display: none;
    }
    .past tr {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 2px 10px;
      padding: 8px 0;
      border-bottom: var(--hair) solid var(--line);
    }
    .past td {
      padding: 0;
      border: 0;
    }
    .past .res,
    .past .acts {
      grid-column: 2;
    }
    .past td[colspan] {
      grid-column: 1 / -1;
    }
  }
  .filters {
    margin-bottom: 8px;
  }
  .filters input {
    width: min(280px, 100%);
  }
  .hero {
    padding: 20px 20px 22px;
  }
  .fidget {
    margin: -6px 0 6px;
  }
  /* wide enough: the toys sit beside the headline instead of over it (and
     with them turned off in Settings, the headline has the block to itself) */
  @media (min-width: 700px) {
    .hero:has(> .fidget) {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      column-gap: 24px;
    }
    .hero > :global(*) {
      grid-column: 1;
    }
    .hero > .fidget {
      grid-column: 2;
      grid-row: 1 / span 3;
      align-self: center;
      margin: 0;
    }
  }
  /* on a phone the two ways in are one full-width target each */
  @media (max-width: 480px) {
    .hero .row > .btn {
      flex: 1 1 100%;
    }
  }
  .hero p {
    margin: 0 0 16px;
    max-width: 60ch;
  }
  /* nothing running: a chip beside the line */
  .idle {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .idle p {
    margin: 0;
  }
  .list li {
    padding: 10px 0;
    border-bottom: var(--hair) solid var(--line);
  }
  .list li > * + * {
    margin-top: 2px;
  }
  .list .game {
    font-size: 15px;
  }
</style>

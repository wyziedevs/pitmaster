<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import FileSpreadsheet from "@lucide/svelte/icons/file-spreadsheet";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ArrowDown from "@lucide/svelte/icons/arrow-down";
  import Seg from "$lib/components/Seg.svelte";
  import { flip as flipRows } from "svelte/animate";
  import { bump, reorder, reveal, slide } from "$lib/motion";
  import { getGames, getHandles, saveHandles } from "$lib/store";
  import { settings } from "$lib/settings.svelte";
  import { leaderboard, PERIODS, type Period, type PlayerLine } from "$lib/stats";
  import { csv, day, download, money, nameKey, ordinal, round2, signed } from "$lib/util";
  import { toast } from "$lib/toast.svelte";
  import type { GameType, PayHandles } from "$lib/types";

  const games = getGames();

  let period = $state<Period>("all");
  let type = $state<GameType | "all">("all");
  let sortBy = $state<keyof typeof SORTS>("net");
  let open = $state<string | null>(null);

  const board = $derived(leaderboard(games, { period, type }));
  // games that actually produced results (a cash game nobody's left yet doesn't count)
  const counted = $derived(new Set(board.flatMap((l) => l.results.map((r) => r.gameId))).size);
  // a column only shows when someone has a number for it
  const hasCash = $derived(type !== "tournament" && board.some((l) => l.cashGames));
  const hasTourney = $derived(type !== "cash" && board.some((l) => l.tourneys));
  const moved = $derived(round2(board.reduce((s, l) => s + l.results.reduce((a, r) => a + r.cost, 0), 0)));

  const perHour = (l: PlayerLine) => (l.hours >= 0.5 ? l.cashNet / l.hours : null);
  const itmPct = (l: PlayerLine) => (l.tourneys ? Math.round((l.itm / l.tourneys) * 100) : null);

  // every column sorts biggest first; click the heading again to flip it
  const SORTS = {
    name: (l: PlayerLine) => l.name.toLowerCase(),
    games: (l: PlayerLine) => l.games,
    net: (l: PlayerLine) => l.net,
    cash: (l: PlayerLine) => l.cashNet,
    tourney: (l: PlayerLine) => l.tourneyNet,
    wins: (l: PlayerLine) => l.wins,
    itm: (l: PlayerLine) => itmPct(l) ?? -1,
    kos: (l: PlayerLine) => l.kos,
    best: (l: PlayerLine) => l.best,
    hourly: (l: PlayerLine) => perHour(l) ?? -Infinity,
    last: (l: PlayerLine) => l.last,
  };
  let flip = $state(false);
  function sort(k: keyof typeof SORTS) {
    flip = sortBy === k ? !flip : false;
    sortBy = k;
  }
  // names run A to Z (ascending); everything else starts biggest first
  const descending = (k: keyof typeof SORTS) => (flip ? k === "name" : k !== "name");
  const rows = $derived.by(() => {
    const f = SORTS[sortBy];
    const dir = (sortBy === "name" ? -1 : 1) * (flip ? -1 : 1);
    return [...board].sort((a, b) => {
      const x = f(a);
      const y = f(b);
      return (x < y ? 1 : x > y ? -1 : 0) * dir;
    });
  });

  function exportCsv() {
    download(
      `pitmaster-players-${new Date().toISOString().slice(0, 10)}.csv`,
      csv([
        ["Player", "Games", "Net", "Cash Net", "Tournament Net", "Tournaments", "Wins", "In the Money", "Knockouts", "Best Result", "Worst Result", "Cash Hours", "Per Hour", "Last Played"],
        ...rows.map((l) => [
          l.name,
          l.games,
          l.net,
          l.cashNet,
          l.tourneyNet,
          l.tourneys,
          l.wins,
          l.itm,
          l.kos,
          l.best,
          l.worst,
          round2(l.hours),
          perHour(l) === null ? "" : round2(perHour(l)!),
          new Date(l.last).toISOString().slice(0, 10),
        ]),
      ])
    );
    toast("Spreadsheet downloaded");
  }

  const cls = (n: number) => (n > 0.001 ? "good" : n < -0.001 ? "bad" : "");

  // where each person gets paid: settle-up and payouts turn these into links
  let handles = $state(getHandles());
  const APPS: { key: keyof PayHandles; label: string; prefix: string }[] = [
    { key: "venmo", label: "Venmo", prefix: "@" },
    { key: "cashapp", label: "Cash App", prefix: "$" },
    { key: "paypal", label: "PayPal", prefix: "paypal.me/" },
  ];
  function setHandle(name: string, key: keyof PayHandles, value: string) {
    saveHandles(name, { ...handles[nameKey(name)], [key]: value });
    handles = getHandles();
    toast(value.trim() ? `Saved ${name}'s ${APPS.find((a) => a.key === key)?.label}` : `Cleared ${name}'s ${APPS.find((a) => a.key === key)?.label}`, "info");
  }
</script>

<svelte:head><title>Players · PitMaster</title></svelte:head>

<div class="spread">
  <h1>Players</h1>
  {#if board.length}<button onclick={exportCsv}><Icon icon={FileSpreadsheet} />Spreadsheet</button>{/if}
</div>
<p class="muted">Results from finished tournaments and from cash players who've cashed out. Names match across games, so spell them the same way.</p>

<div class="row filters">
  <Seg value={period} options={PERIODS} onpick={(v) => (period = v)} labelledby="period-l" />
  <span id="period-l" class="sr-only">Time period</span>
  <Seg
    value={type}
    options={[
      { id: "all", label: "All Games" },
      { id: "cash", label: "Cash" },
      { id: "tournament", label: "Tournaments" },
    ]}
    onpick={(v) => (type = v)}
    labelledby="type-l"
  />
  <span id="type-l" class="sr-only">Game type</span>
</div>

{#if board.length}
  <p class="small muted"><span use:bump={`${period} ${type}`}>{counted} game{counted === 1 ? "" : "s"} · {board.length} player{board.length === 1 ? "" : "s"} · {money(moved)} bought in</span></p>
  <div class="scroll-x">
    <table class="board">
      <thead>
        <tr>
          <th class="rank">#</th>
          {@render th("name", "Player")}
          {@render th("games", "Games", true)}
          {@render th("net", "Net", true)}
          {#if hasCash}{@render th("cash", "Cash", true, "hide-sm")}{@render th("hourly", "Per Hour", true, "hide-sm")}{/if}
          {#if hasTourney}{@render th("tourney", "Tournaments", true, "hide-sm")}{@render th("wins", "Wins", true)}{@render th("itm", "ITM", true, "hide-sm")}{@render th("kos", "KOs", true, "hide-sm")}{/if}
          {@render th("best", "Best Result", true, "hide-sm")}
          {@render th("last", "Last Played", true, "hide-sm")}
        </tr>
      </thead>
      <!-- a body per player, so the row and its history move together when the
           table re-sorts. the name is the button (keyboard and screen readers);
           the rest of the row is a bigger target for the same thing -->
      {#each rows as l, i (l.key)}
        <tbody animate:flipRows={reorder()}>
          <tr class="line" class:open={open === l.key} data-sound={open === l.key ? "close" : "open"} onclick={() => (open = open === l.key ? null : l.key)}>
            <td class="num muted rank">{i + 1}</td>
            <td class="who">
              <button class="link plain with-icon" aria-expanded={open === l.key} data-sound={open === l.key ? "close" : "open"}>
                <Icon icon={ChevronRight} size="1em" />{l.name}
              </button>
            </td>
            <td class="num">{l.games}</td>
            <td class="num {cls(l.net)}"><b>{signed(l.net)}</b></td>
            {#if hasCash}
              <td class="num hide-sm {cls(l.cashNet)}">{l.cashGames ? signed(l.cashNet) : ""}</td>
              <td class="num hide-sm">{perHour(l) === null ? "" : `${signed(perHour(l)!)}/hr`}</td>
            {/if}
            {#if hasTourney}
              <td class="num hide-sm {cls(l.tourneyNet)}">{l.tourneys ? signed(l.tourneyNet) : ""}</td>
              <td class="num">{l.wins || ""}</td>
              <td class="num hide-sm">{itmPct(l) === null ? "" : `${itmPct(l)}%`}</td>
              <td class="num hide-sm">{l.kos || ""}</td>
            {/if}
            <td class="num hide-sm {cls(l.best)}">{signed(l.best)}</td>
            <td class="num hide-sm muted">{day(l.last)}</td>
          </tr>
          {#if open === l.key}
            <tr class="detail">
              <td colspan="12">
                <div transition:slide={reveal()}>
                  <table class="history small">
                    <tbody>
                      {#each l.results as r (r.gameId)}
                        <tr>
                          <td class="mono muted nowrap">{day(r.at)}</td>
                          <td><span class="pill">{r.type === "cash" ? "Cash" : "Tournament"}</span> <a href="/game/{r.gameId}">{r.gameName}</a></td>
                          <td class="muted">
                            {#if r.type === "tournament"}{r.place ? `${ordinal(r.place)} of ${r.entrants}` : ""}{r.kos ? ` · ${r.kos} KO${r.kos > 1 ? "s" : ""}` : ""}
                            {:else}in {money(r.cost)}, out {money(r.won)}{r.hours && r.hours >= 0.1 ? ` · ${r.hours.toFixed(1)}h` : ""}{/if}
                          </td>
                          <td class="num {cls(r.net)}">{signed(r.net)}</td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                  {#if settings.usePayLinks}
                  <div class="handles row small">
                    <span class="muted">Gets Paid On</span>
                    {#each APPS as a (a.key)}
                      <label class="inline">
                        <span>{a.label}</span>
                        <span class="prefixed">
                          <span class="muted" aria-hidden="true">{a.prefix}</span>
                          <input type="text" value={handles[l.key]?.[a.key] ?? ""} onchange={(e) => setHandle(l.name, a.key, e.currentTarget.value)} autocomplete="off" spellcheck="false" aria-label="{l.name}'s {a.label}" />
                        </span>
                      </label>
                    {/each}
                  </div>
                  {/if}
                  <p class="small muted">
                    {[
                      l.games > 1 ? `Worst result ${signed(l.worst)}` : "",
                      l.hours >= 0.5 ? `${l.hours.toFixed(1)} hours in cash games` : "",
                      l.tourneys ? `Cashed ${l.itm} of ${l.tourneys} tournament${l.tourneys > 1 ? "s" : ""}` : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </td>
            </tr>
          {/if}
        </tbody>
      {/each}
    </table>
  </div>
{:else}
  <p class="empty links">
    <span>No results yet{period !== "all" || type !== "all" ? " for this filter" : ""}. They show up here once a tournament has a winner or a cash player cashes out.</span>
    <a href="/">Back to Games</a>
  </p>
{/if}

{#snippet th(key: keyof typeof SORTS, label: string, num = false, extra = "")}
  <th class="{num ? 'num' : ''} {extra}" aria-sort={sortBy === key ? (descending(key) ? "descending" : "ascending") : undefined}>
    <button class="link sort" class:on={sortBy === key} onclick={() => sort(key)} data-sound="soft"
      >{label}{#if sortBy === key}<span class="dir" class:up={!descending(key)}><Icon icon={ArrowDown} size="0.9em" /></span>{/if}</button
    >
  </th>
{/snippet}

<style>
  .filters {
    margin: 12px 0 14px;
    gap: 14px;
  }
  .board th {
    white-space: nowrap;
  }
  .sort {
    color: inherit;
    font-size: inherit;
  }
  .sort.on {
    color: var(--fg);
    text-decoration-color: currentColor;
  }
  /* which way the sorted column runs: one arrow that turns over */
  .dir {
    display: inline-flex;
    margin-left: 2px;
    transition: rotate var(--dur-move) var(--ease-out-expo);
  }
  .dir.up {
    rotate: 180deg;
  }
  .rank {
    width: 1%;
  }
  .line {
    cursor: pointer;
  }
  @media (hover: hover) {
    .line:hover td {
      background: var(--block);
    }
  }
  .line.open td {
    background: var(--block);
    border-bottom-color: transparent;
  }
  .line:active td {
    background: var(--block-2);
    transition-duration: var(--dur-press);
  }
  .plain {
    color: var(--fg);
    /* a long name wraps from the left, like the rest of the column */
    text-align: left;
  }
  /* one chevron that turns down as the history opens */
  .plain :global(.icon) {
    transition:
      transform var(--dur-move) var(--ease-out-expo),
      rotate var(--dur-move) var(--ease-out-expo);
  }
  .line.open .plain :global(.icon) {
    rotate: 90deg;
  }
  .detail > td {
    background: var(--block);
    padding: 0 12px 10px;
  }
  .history td {
    border-bottom-color: var(--line);
    padding: 3px 10px 3px 0;
  }
  .handles {
    gap: 6px 16px;
    margin: 10px 0 2px;
  }
  .handles label {
    margin: 0;
  }
  /* the @ or $ sits inside the box's left edge, so people type just the name */
  .prefixed {
    display: inline-flex;
    align-items: center;
    height: var(--control-h);
    border: var(--hair) solid var(--line-strong);
    background: var(--field);
    padding-left: 6px;
  }
  .prefixed:focus-within {
    border-color: var(--focus);
  }
  .prefixed input {
    border: 0;
    height: calc(var(--control-h) - 2 * var(--hair));
    width: 110px;
    padding-left: 1px;
    background: transparent;
  }
  .prefixed input:focus-visible {
    outline: none;
  }
</style>

<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import FileSpreadsheet from "@lucide/svelte/icons/file-spreadsheet";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ArrowDown from "@lucide/svelte/icons/arrow-down";
  import Seg from "$lib/components/Seg.svelte";
  import Leagues from "$lib/components/Leagues.svelte";
  import { listedKinds, kind } from "$lib/kinds";
  import { flip as flipRows } from "svelte/animate";
  import { bump, reorder, reveal, slide } from "$lib/motion";
  import { getGame, getGames, getHandles, getLeagues, saveGame, saveHandles } from "$lib/store";
  import { logEvent, markPaid, netPairs, settled, stillOwed } from "$lib/game";
  import { settings } from "$lib/settings.svelte";
  import {
    leaderboard,
    PERIODS,
    type Period,
    type PlayerLine,
  } from "$lib/stats";
  import {
    csv,
    day,
    download,
    money,
    nameKey,
    ordinal,
    payLinks,
    round2,
    signed,
  } from "$lib/util";
  import { toast } from "$lib/toast.svelte";
  import type { GameType, PayHandles } from "$lib/types";
  import { t, tp } from "$lib/i18n";

  // reloaded after the Owed list ticks a payment off in some games
  let games = $state.raw(getGames());

  // leagues get their own view once they're switched on (or there are some)
  const leaguesOn = settings.useLeagues || getLeagues().length > 0;
  let view = $state<"board" | "leagues">(leaguesOn && location.hash === "#leagues" ? "leagues" : "board");
  function pickView(v: typeof view) {
    view = v;
    history.replaceState(history.state, "", v === "leagues" ? "#leagues" : location.pathname);
  }

  let period = $state<Period>("all");
  let type = $state<GameType | "all">("all");
  let sortBy = $state<keyof typeof SORTS>("net");
  let open = $state<string | null>(null);

  const board = $derived(leaderboard(games, { period, type }));
  // games that actually produced results (a cash game nobody's left yet doesn't count)
  const counted = $derived(
    new Set(board.flatMap((l) => l.results.map((r) => r.gameId))).size,
  );
  // a column only shows when someone has a number for it
  const hasCash = $derived(
    type !== "tournament" && board.some((l) => l.cashGames),
  );
  const hasTourney = $derived(type !== "cash" && board.some((l) => l.tourneys));
  // wins count in any game with places (liar's dice, a lives game), not just tournaments
  const hasWins = $derived(hasTourney || board.some((l) => l.wins));
  const moved = $derived(
    round2(
      board.reduce((s, l) => s + l.results.reduce((a, r) => a + r.cost, 0), 0),
    ),
  );

  const perHour = (l: PlayerLine) =>
    l.hours >= 0.5 ? l.cashNet / l.hours : null;
  const itmPct = (l: PlayerLine) =>
    l.tourneys ? Math.round((l.itm / l.tourneys) * 100) : null;

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
  const descending = (k: keyof typeof SORTS) =>
    flip ? k === "name" : k !== "name";
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
        [
          t("players.page.csv.player"),
          t("players.page.csv.games"),
          t("players.page.csv.net"),
          t("players.page.csv.cashNet"),
          t("players.page.csv.tourneyNet"),
          t("players.page.csv.tournaments"),
          t("players.page.csv.wins"),
          t("players.page.csv.itm"),
          t("players.page.csv.knockouts"),
          t("players.page.csv.best"),
          t("players.page.csv.worst"),
          t("players.page.csv.cashHours"),
          t("players.page.csv.perHour"),
          t("players.page.csv.last"),
        ],
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
      ]),
    );
    toast(t("players.page.toast.csvDownloaded"));
  }

  // ---- owed: every finished game's unpaid settle-up, netted between each pair ----
  const pair = (a: string, b: string) => [nameKey(a), nameKey(b)].sort().join(">");
  const owedGames = $derived(
    settings.useLedger
      ? games.filter(settled).map((g) => ({ g, owed: stillOwed(g) })).filter((x) => x.owed.length)
      : [],
  );
  const owed = $derived(
    netPairs(owedGames.flatMap((x) => x.owed)).map((o) => ({
      ...o,
      games: owedGames.filter((x) => x.owed.some((y) => pair(y.from, y.to) === pair(o.from, o.to))).map((x) => x.g),
    })),
  );
  // ticked off on this visit: they stay on the list (unticking takes them back)
  let ticked = $state<{ from: string; to: string; amount: number; at: number; ids: string[] }[]>([]);
  const owedRows = $derived([
    ...owed.filter((o) => !ticked.some((x) => pair(x.from, x.to) === pair(o.from, o.to))).map((o) => ({ ...o, ids: o.games.map((g) => g.id), at: 0, done: false })),
    ...ticked.map((o) => ({ ...o, games: o.ids.map((id) => games.find((g) => g.id === id)).filter((g) => !!g), done: true })),
  ]);

  function tickOwed(o: (typeof owedRows)[number], on: boolean) {
    if (on) {
      // each game settles its own side of the pair, whichever way it ran there
      const at = Date.now();
      for (const g of o.games) {
        markPaid(g, o.from, o.to);
        g.paid!.at(-1)!.at = at;
        saveGame(g);
      }
      ticked = [...ticked, { from: o.from, to: o.to, amount: o.amount, at, ids: o.ids }];
      toast(t("players.page.toast.markedPaid", { from: o.from, to: o.to, amount: money(o.amount) }));
    } else {
      for (const id of o.ids) {
        const g = getGame(id);
        if (!g) continue;
        g.paid = (g.paid ?? []).filter((p) => p.at !== o.at || pair(p.from, p.to) !== pair(o.from, o.to));
        logEvent(g, t("gameEvents.unpaidLog", { a: o.from, b: o.to }));
        saveGame(g);
      }
      ticked = ticked.filter((x) => x.at !== o.at);
    }
    games = getGames();
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
    const app = APPS.find((a) => a.key === key)?.label ?? "";
    toast(
      value.trim()
        ? t("players.page.toast.handleSaved", { name, app })
        : t("players.page.toast.handleCleared", { name, app }),
      "info",
    );
  }
</script>

<svelte:head><title>{t("players.page.title")} · PitMaster</title></svelte:head>

<div class="spread">
  <h1>{t("players.page.title")}</h1>
  {#if board.length && view === "board"}<button onclick={exportCsv}
      ><Icon icon={FileSpreadsheet} />{t("players.page.spreadsheetButton")}</button
    >{/if}
</div>
<p class="muted">
  {t("players.page.subtitle")}
</p>

{#if leaguesOn}
  <div class="row mt-3 mx-0 mb-[14px]">
    <Seg
      value={view}
      options={[
        { id: "board", label: t("players.leagues.tabBoard") },
        { id: "leagues", label: t("players.leagues.tabLeagues") },
      ]}
      onpick={pickView}
      labelledby="view-l"
    />
    <span id="view-l" class="sr-only">{t("players.leagues.viewLabel")}</span>
  </div>
{/if}

{#if view === "leagues"}
  <Leagues {games} reload={() => (games = getGames())} />
{:else}
<div class="row mt-3 mx-0 mb-[14px] gap-[14px]">
  <Seg
    value={period}
    options={PERIODS}
    onpick={(v) => (period = v)}
    labelledby="period-l"
  />
  <span id="period-l" class="sr-only">{t("players.page.filter.periodLabel")}</span>
  <Seg
    value={type}
    options={[
      { id: "all", label: t("players.page.filter.allGames") },
      ...listedKinds(games.map((g) => g.type)).map((k) => ({ id: k.id, label: k.plural() })),
    ]}
    onpick={(v) => (type = v)}
    labelledby="type-l"
  />
  <span id="type-l" class="sr-only">{t("players.page.filter.typeLabel")}</span>
</div>

{#if owedRows.length}
  <section class="mb-[22px]" transition:slide={reveal()}>
    <h2>{t("players.page.owed.heading")}</h2>
    <p class="small muted">{t("players.page.owed.note")}</p>
    <ul class="list-none p-0 m-0">
      {#each owedRows as o (pair(o.from, o.to))}
        {@const links = !o.done && settings.usePayLinks ? payLinks(handles[nameKey(o.to)] ?? null, o.amount, o.games.map((g) => g.name).join(", ")) : []}
        <li class="mb-1" class:done={o.done} transition:slide={reveal()}>
          <input type="checkbox" class="m-0 me-2 align-middle" checked={o.done} onchange={(e) => tickOwed(o, e.currentTarget.checked)} aria-label={t("players.page.owed.markPaid", { from: o.from, to: o.to })} />
          {t("players.page.owed.line", { from: o.from, to: o.to })} <b class="num amount">{money(o.amount)}</b>
          <span class="small muted ml-2">{#each o.games as g, i (g.id)}{i ? ", " : ""}<a href="/game/{g.id}">{g.name}</a>{/each}</span>
          {#if links.length}<span class="small pay links ml-3">{#each links as l (l.label)}<a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>{/each}</span>{/if}
        </li>
      {/each}
    </ul>
  </section>
{/if}

{#if board.length}
  <p class="small muted">
    <span use:bump={`${period} ${type}`}
      >{t("players.page.stats.summary", {
        games: tp("players.page.stats.games", counted),
        players: tp("players.page.stats.players", board.length),
        amount: money(moved),
      })}</span
    >
  </p>
  <div class="scroll-x">
    <table class="board">
      <thead>
        <tr>
          <th class="w-[1%] whitespace-nowrap">#</th>
          {@render th("name", t("players.page.table.player"))}
          {@render th("games", t("players.page.table.games"), true)}
          {@render th("net", t("players.page.table.net"), true)}
          {#if hasCash}{@render th("cash", t("players.page.table.cash"), true, "hide-sm")}{@render th(
              "hourly",
              t("players.page.table.perHour"),
              true,
              "hide-sm",
            )}{/if}
          {#if hasTourney}{@render th(
              "tourney",
              t("players.page.table.tournaments"),
              true,
              "hide-sm",
            )}{/if}
          {#if hasWins}{@render th("wins", t("players.page.table.wins"), true)}{/if}
          {#if hasTourney}{@render th(
              "itm",
              t("players.page.table.itm"),
              true,
              "hide-sm",
            )}{@render th("kos", t("players.page.table.kos"), true, "hide-sm")}{/if}
          {@render th("best", t("players.page.table.best"), true, "hide-sm")}
          {@render th("last", t("players.page.table.last"), true, "hide-sm")}
        </tr>
      </thead>
      <!-- a body per player, so the row and its history move together when the
           table re-sorts. the name is the button (keyboard and screen readers);
           the rest of the row is a bigger target for the same thing -->
      {#each rows as l, i (l.key)}
        <tbody animate:flipRows={reorder()}>
          <tr
            class="line cursor-pointer"
            class:open={open === l.key}
            data-sound={open === l.key ? "close" : "open"}
            onclick={() => (open = open === l.key ? null : l.key)}
          >
            <td class="num muted w-[1%]">{i + 1}</td>
            <td class="who">
              <button
                class="link plain text-fg text-left with-icon"
                aria-expanded={open === l.key}
                data-sound={open === l.key ? "close" : "open"}
              >
                <Icon icon={ChevronRight} size="1em" />{l.name}
              </button>
            </td>
            <td class="num">{l.games}</td>
            <td class="num {cls(l.net)}"><b>{signed(l.net)}</b></td>
            {#if hasCash}
              <td class="num hide-sm {cls(l.cashNet)}"
                >{l.cashGames ? signed(l.cashNet) : ""}</td
              >
              <td class="num hide-sm"
                >{perHour(l) === null ? "" : `${signed(perHour(l)!)}/hr`}</td
              >
            {/if}
            {#if hasTourney}
              <td class="num hide-sm {cls(l.tourneyNet)}"
                >{l.tourneys ? signed(l.tourneyNet) : ""}</td
              >
            {/if}
            {#if hasWins}<td class="num">{l.wins || ""}</td>{/if}
            {#if hasTourney}
              <td class="num hide-sm"
                >{itmPct(l) === null ? "" : `${itmPct(l)}%`}</td
              >
              <td class="num hide-sm">{l.kos || ""}</td>
            {/if}
            <td class="num hide-sm {cls(l.best)}">{signed(l.best)}</td>
            <td class="num hide-sm muted">{day(l.last)}</td>
          </tr>
          {#if open === l.key}
            <tr>
              <td colspan="12" class="bg-block pt-0 px-3 pb-[10px]">
                <div transition:slide={reveal()}>
                  <table class="small">
                    <tbody>
                      {#each l.results as r (r.gameId)}
                        <tr>
                          <td class="mono muted nowrap border-b-line pt-[3px] pr-[10px] pb-[3px] pl-0">{day(r.at)}</td>
                          <td class="border-b-line pt-[3px] pr-[10px] pb-[3px] pl-0"
                            ><span class="pill">{kind(r.type).label()}</span> <a href="/game/{r.gameId}">{r.gameName}</a></td
                          >
                          <td class="muted border-b-line pt-[3px] pr-[10px] pb-[3px] pl-0">
                            {kind(r.type).describe(r)}
                          </td>
                          <td class="num {cls(r.net)} border-b-line pt-[3px] pr-[10px] pb-[3px] pl-0">{signed(r.net)}</td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                  {#if settings.usePayLinks}
                    <div class="row small gap-y-[6px] gap-x-4 mt-[10px] mx-0 mb-[2px]">
                      <span class="muted">{t("players.page.payHandles.label")}</span>
                      {#each APPS as a (a.key)}
                        <label class="across m-0">
                          <span>{a.label}</span>
                          <span class="prefixed inline-flex items-center h-[var(--control-h)] border-[length:var(--hair)] border-solid border-line-strong bg-field pl-[6px]">
                            <span class="muted" aria-hidden="true"
                              >{a.prefix}</span
                            >
                            <input
                              type="text"
                              class="border-0 h-[calc(var(--control-h)_-_2*var(--hair))] w-[110px] pl-[1px] bg-transparent"
                              value={handles[l.key]?.[a.key] ?? ""}
                              onchange={(e) =>
                                setHandle(l.name, a.key, e.currentTarget.value)}
                              autocomplete="off"
                              spellcheck="false"
                              aria-label={t("players.page.payHandles.ariaLabel", { name: l.name, app: a.label })}
                            />
                          </span>
                        </label>
                      {/each}
                    </div>
                  {/if}
                  <p class="small muted">
                    {[
                      l.games > 1 ? t("players.page.history.worst", { amount: signed(l.worst) }) : "",
                      l.hours >= 0.5
                        ? t("players.page.history.cashHours", { h: l.hours.toFixed(1) })
                        : "",
                      l.tourneys
                        ? t("players.page.history.cashedTournaments", {
                            itm: l.itm,
                            tournaments: tp("players.page.history.tournamentsCount", l.tourneys),
                          })
                        : "",
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
  <p class="empty flex flex-col">
    <span
      >{period !== "all" || type !== "all"
        ? t("players.page.empty.filtered")
        : t("players.page.empty.default")}</span
    >
    <a href="/" class="pt-5">{t("players.page.empty.backLink")}</a>
  </p>
{/if}
{/if}

{#snippet th(key: keyof typeof SORTS, label: string, num = false, extra = "")}
  <th
    class="{num ? 'num' : ''} {extra} whitespace-nowrap"
    aria-sort={sortBy === key
      ? descending(key)
        ? "descending"
        : "ascending"
      : undefined}
  >
    <button
      class="link sort"
      class:on={sortBy === key}
      onclick={() => sort(key)}
      data-sound="soft"
      >{label}{#if sortBy === key}<span class="dir inline-flex ml-[2px]" class:up={!descending(key)}
          ><Icon icon={ArrowDown} size="0.9em" /></span
        >{/if}</button
    >
  </th>
{/snippet}

<style>
  .done {
    color: var(--muted);
  }
  .done .amount {
    text-decoration: line-through;
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
    transition: rotate var(--dur-move) var(--ease-out-expo);
  }
  .dir.up {
    rotate: 180deg;
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
  /* one chevron that turns down as the history opens */
  .plain :global(.icon) {
    transition:
      transform var(--dur-move) var(--ease-out-expo),
      rotate var(--dur-move) var(--ease-out-expo);
  }
  .line.open .plain :global(.icon) {
    rotate: 90deg;
  }
  /* the @ or $ sits inside the box's left edge, so people type just the name */
  .prefixed:focus-within {
    border-color: var(--focus);
  }
  .prefixed input:focus-visible {
    outline: none;
  }
</style>

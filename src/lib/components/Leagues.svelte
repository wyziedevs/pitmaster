<script lang="ts">
  import Icon from "./Icon.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import Pencil from "@lucide/svelte/icons/pencil";
  import FileSpreadsheet from "@lucide/svelte/icons/file-spreadsheet";
  import Trophy from "@lucide/svelte/icons/trophy";
  import { deleteLeague, getLeagues, saveGame, saveLeague } from "$lib/store";
  import { leagueStandings, placePoints, POINT_TABLE, round1 } from "$lib/stats";
  import { settled } from "$lib/game";
  import { csv, day, download, fileSlug, ordinal, signed, uid } from "$lib/util";
  import { toast } from "$lib/toast.svelte";
  import { reveal, slide } from "$lib/motion";
  import type { Game, GameType, League, LeaguePoints } from "$lib/types";
  import { t, tp } from "$lib/i18n";

  // games: everything saved, for the standings. reload: read them again after linking some
  let { games, reload }: { games: Game[]; reload: () => void } = $props();

  const saved = getLeagues();
  let leagues = $state(saved);
  let pick = $state(saved[0]?.id ?? "");
  const league = $derived(leagues.find((l) => l.id === pick) ?? null);
  const standings = $derived(league ? leagueStandings(league, games) : null);
  const hasTourney = $derived(!!standings?.games.some((g) => g.type === "tournament"));

  // ---- the form: a new league, or the one picked ----
  // dates go in and out of the date fields as the local day
  const pad = (n: number) => String(n).padStart(2, "0");
  const toDay = (ms: number) => {
    const d = new Date(ms);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const fromDay = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return y ? new Date(y, m - 1, d).getTime() : NaN;
  };

  interface Draft {
    id: string;
    name: string;
    start: string;
    end: string;
    cash: boolean;
    tournament: boolean;
    kind: LeaguePoints["kind"];
    table: string;
    play: number;
    ko: number;
    bestOf: number;
  }
  let draft = $state<Draft | null>(null);
  const isNew = $derived(!!draft && !leagues.some((l) => l.id === draft!.id));

  function startNew() {
    const now = new Date();
    draft = {
      id: uid(),
      name: t("players.leagues.defaultName", { year: String(now.getFullYear()) }),
      start: toDay(new Date(now.getFullYear(), now.getMonth(), 1).getTime()),
      end: "",
      cash: false,
      tournament: true,
      kind: "table",
      table: POINT_TABLE.join(", "),
      play: 0,
      ko: 0,
      bestOf: 0,
    };
  }
  function edit(l: League) {
    draft = {
      id: l.id,
      name: l.name,
      start: toDay(l.start),
      end: l.end ? toDay(l.end) : "",
      cash: l.types.includes("cash"),
      tournament: l.types.includes("tournament"),
      kind: l.points.kind,
      table: l.points.table.join(", "),
      play: l.points.play,
      ko: l.points.ko,
      bestOf: l.bestOf ?? 0,
    };
  }

  const tableNums = (s: string) => s.split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n) && n >= 0);
  // what 1st, 2nd and last of ten would get, so the pick explains itself
  const sample = $derived.by(() => {
    if (!draft) return "";
    const p: LeaguePoints = { kind: draft.kind, table: tableNums(draft.table), play: 0, ko: 0 };
    return t("players.leagues.form.sample", { first: round1(placePoints(p, 1, 10)), second: round1(placePoints(p, 2, 10)), last: round1(placePoints(p, 10, 10)) });
  });

  function save(e: SubmitEvent) {
    e.preventDefault();
    if (!draft) return;
    const d = draft;
    const start = fromDay(d.start);
    const end = d.end ? fromDay(d.end) : undefined;
    const types: GameType[] = [...(d.tournament ? ["tournament" as const] : []), ...(d.cash ? ["cash" as const] : [])];
    if (!d.name.trim() || !Number.isFinite(start)) return void toast(t("players.leagues.form.needNameStart"), "bad");
    if (!types.length) return void toast(t("players.leagues.form.needType"), "bad");
    if (end !== undefined && !(end >= start)) return void toast(t("players.leagues.form.endBeforeStart"), "bad");
    const table = tableNums(d.table);
    if (d.kind === "table" && !table.length) return void toast(t("players.leagues.form.needTable"), "bad");
    saveLeague({
      id: d.id,
      name: d.name.trim(),
      start,
      end,
      types,
      points: { kind: d.kind, table: table.length ? table : POINT_TABLE, play: Math.max(0, d.play || 0), ko: Math.max(0, d.ko || 0) },
      bestOf: Math.max(0, Math.round(d.bestOf || 0)) || undefined,
      updatedAt: Date.now(),
    });
    toast(isNew ? t("players.leagues.toast.created", { name: d.name.trim() }) : t("players.leagues.toast.saved", { name: d.name.trim() }));
    leagues = getLeagues();
    pick = d.id;
    draft = null;
  }

  function remove() {
    if (!league || !confirm(t("players.leagues.form.confirmDelete", { name: league.name }))) return;
    deleteLeague(league.id);
    toast(t("players.leagues.toast.deleted", { name: league.name }), "info");
    leagues = getLeagues();
    pick = leagues[0]?.id ?? "";
    draft = null;
    reload();
  }

  // finished games from the season's dates that aren't in any league yet
  const strays = $derived(
    league
      ? games.filter((g) => {
          const at = g.clock.startedAt ?? g.createdAt;
          return !g.leagueId && league.types.includes(g.type) && settled(g) && at >= league.start && (!league.end || at < league.end + 86400000);
        })
      : []
  );
  function linkStrays() {
    if (!league) return;
    for (const g of strays) saveGame({ ...g, leagueId: league.id });
    toast(tp("players.leagues.toast.linked", strays.length, { name: league.name }));
    reload();
  }

  const cls = (n: number) => (n > 0.001 ? "good" : n < -0.001 ? "bad" : "");
  const pts = (n: number) => String(round1(n));

  function exportCsv() {
    if (!league || !standings) return;
    const gs = standings.games;
    download(
      `${fileSlug(league.name)}-${new Date().toISOString().slice(0, 10)}.csv`,
      csv([
        [
          t("players.leagues.csv.place"),
          t("players.leagues.csv.player"),
          t("players.leagues.csv.points"),
          t("players.leagues.csv.played"),
          t("players.leagues.csv.wins"),
          t("players.leagues.csv.knockouts"),
          t("players.leagues.csv.net"),
          ...gs.map((g) => `${new Date(g.clock.startedAt ?? g.createdAt).toISOString().slice(0, 10)} ${g.name}`),
        ],
        ...standings.rows.map((l, i) => [
          i + 1,
          l.name,
          l.points,
          l.played,
          l.wins,
          l.kos,
          l.net,
          // a result best-of left out is in brackets
          ...gs.map((g) => {
            const r = l.results.find((x) => x.gameId === g.id);
            return r ? (r.counted ? r.points : `(${r.points})`) : "";
          }),
        ]),
      ])
    );
    toast(t("players.page.toast.csvDownloaded"));
  }

  const scoring = (l: League) =>
    [
      l.points.kind === "table" ? t("players.leagues.scoring.table", { table: l.points.table.join(", ") }) : t(`players.leagues.scoring.${l.points.kind}`),
      l.points.play ? t("players.leagues.scoring.play", { n: pts(l.points.play) }) : "",
      l.points.ko && l.types.includes("tournament") ? t("players.leagues.scoring.ko", { n: pts(l.points.ko) }) : "",
      l.bestOf ? t("players.leagues.scoring.bestOf", { n: String(l.bestOf) }) : "",
    ]
      .filter(Boolean)
      .join(" · ");
</script>

<div class="spread mb-2">
  <div class="row">
    {#if leagues.length > 1}
      <select bind:value={pick} aria-label={t("players.leagues.pickAria")} onchange={() => (draft = null)}>
        {#each leagues as l (l.id)}<option value={l.id}>{l.name}</option>{/each}
      </select>
    {:else if league}
      <h2 class="m-0">{league.name}</h2>
    {/if}
  </div>
  <span class="row small">
    {#if league && !draft}
      <button class="link" data-sound="open" onclick={() => edit(league)}><Icon icon={Pencil} size="1em" />{t("players.leagues.edit")}</button>
      {#if standings?.rows.length}<button class="link" onclick={exportCsv}><Icon icon={FileSpreadsheet} size="1em" />{t("players.page.spreadsheetButton")}</button>{/if}
    {/if}
    {#if !draft}<button class="link" data-sound="open" onclick={startNew}><Icon icon={Plus} size="1em" />{t("players.leagues.new")}</button>{/if}
  </span>
</div>

{#if draft}
  <form class="box mb-[22px]" autocomplete="off" onsubmit={save} transition:slide={reveal()}>
    <h2>{isNew ? t("players.leagues.new") : t("players.leagues.edit")}</h2>
    <label><span>{t("players.leagues.form.name")}</span><input type="text" bind:value={draft.name} style="width:100%" /></label>
    <div class="row">
      <label><span>{t("players.leagues.form.start")}</span><input type="date" bind:value={draft.start} /></label>
      <label><span>{t("players.leagues.form.end")}</span><input type="date" bind:value={draft.end} /></label>
    </div>
    <div class="row">
      <span class="small muted">{t("players.leagues.form.counts")}</span>
      <label class="across"><input type="checkbox" bind:checked={draft.tournament} /><span>{t("players.page.filter.tournaments")}</span></label>
      <label class="across"><input type="checkbox" bind:checked={draft.cash} /><span>{t("players.page.filter.cash")}</span></label>
    </div>
    <label>
      <span>{t("players.leagues.form.points")}</span>
      <select bind:value={draft.kind}>
        <option value="table">{t("players.leagues.form.kindTable")}</option>
        <option value="beaten">{t("players.leagues.form.kindBeaten")}</option>
        <option value="root">{t("players.leagues.form.kindRoot")}</option>
      </select>
    </label>
    {#if draft.kind === "table"}
      <label transition:slide={reveal()}><span>{t("players.leagues.form.table")}</span><input type="text" bind:value={draft.table} style="width:100%" /></label>
    {/if}
    <p class="small muted -mt-1">{t(`players.leagues.form.hint.${draft.kind}`)} {sample}</p>
    <div class="row">
      <label><span>{t("players.leagues.form.play")}</span><input type="number" min="0" step="any" bind:value={draft.play} /></label>
      {#if draft.tournament}<label><span>{t("players.leagues.form.ko")}</span><input type="number" min="0" step="any" bind:value={draft.ko} /></label>{/if}
      <label><span>{t("players.leagues.form.bestOf")}</span><input type="number" min="0" step="1" bind:value={draft.bestOf} /></label>
    </div>
    <p class="small muted -mt-1">{draft.cash ? t("players.leagues.form.cashNote") : ""} {t("players.leagues.form.bestOfNote")}</p>
    <p class="row">
      <button>{isNew ? t("players.leagues.form.create") : t("common.save")}</button>
      <button type="button" class="link muted" data-sound="close" onclick={() => (draft = null)}>{t("common.cancel")}</button>
      {#if !isNew}<button type="button" class="link muted ml-auto" data-sound="thud" onclick={remove}>{t("players.leagues.form.delete")}</button>{/if}
    </p>
  </form>
{/if}

{#if league && standings}
  <p class="small muted mt-0">
    {league.end ? t("players.leagues.dates", { start: day(league.start), end: day(league.end) }) : t("players.leagues.from", { start: day(league.start) })} · {tp("players.leagues.gamesCount", standings.games.length)} · {scoring(league)}
  </p>
  {#if strays.length}
    <p class="small links" transition:slide={reveal()}>
      <span class="muted">{tp("players.leagues.strays", strays.length)}</span>
      <button class="link" data-sound="chips" onclick={linkStrays}><Icon icon={Plus} size="1em" />{t("players.leagues.addThem")}</button>
    </p>
  {/if}
  {#if standings.rows.length}
    <div class="scroll-x">
      <table class="board">
        <thead>
          <tr>
            <th class="w-[1%]">#</th>
            <th>{t("players.page.table.player")}</th>
            <th class="num">{t("players.leagues.table.points")}</th>
            <th class="num">{t("players.leagues.table.played")}</th>
            <th class="num">{t("players.page.table.wins")}</th>
            {#if hasTourney && league.points.ko}<th class="num hide-sm">{t("players.page.table.kos")}</th>{/if}
            <th class="num hide-sm">{t("players.page.table.net")}</th>
          </tr>
        </thead>
        <tbody>
          {#each standings.rows as l, i (l.key)}
            <tr>
              <td class="num muted">{i + 1}</td>
              <td>{#if i === 0}<span class="lead"><Icon icon={Trophy} size="1em" /></span>{/if}{l.name}</td>
              <td class="num"><b>{pts(l.points)}</b></td>
              <td class="num">{l.played}</td>
              <td class="num">{l.wins || ""}</td>
              {#if hasTourney && league.points.ko}<td class="num hide-sm">{l.kos || ""}</td>{/if}
              <td class="num hide-sm {cls(l.net)}">{signed(l.net)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <h2 class="mt-[22px]">{t("players.leagues.byGame")}</h2>
    <p class="small muted mt-0">{league.bestOf ? t("players.leagues.byGameNoteBest") : t("players.leagues.byGameNote")}</p>
    <div class="scroll-x">
      <table class="board matrix small">
        <thead>
          <tr>
            <th>{t("players.page.table.player")}</th>
            {#each standings.games as g, n (g.id)}<th class="num"><a href="/game/{g.id}" title={g.name}>{t("players.leagues.gameCol", { n: String(n + 1) })}</a><span class="block muted font-normal">{day(g.clock.startedAt ?? g.createdAt)}</span></th>{/each}
            <th class="num">{t("players.leagues.table.points")}</th>
          </tr>
        </thead>
        <tbody>
          {#each standings.rows as l (l.key)}
            <tr>
              <td class="nowrap">{l.name}</td>
              {#each standings.games as g (g.id)}
                {@const r = l.results.find((x) => x.gameId === g.id)}
                <td class="num" class:dropped={r && !r.counted} title={r ? `${ordinal(r.place)} / ${r.entrants}` : ""}>{r ? pts(r.points) : ""}</td>
              {/each}
              <td class="num"><b>{pts(l.points)}</b></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <p class="empty">{t("players.leagues.noGames")}</p>
  {/if}
{:else if !draft}
  <p class="empty flex flex-col">
    <span>{t("players.leagues.none")}</span>
    <button class="link pt-5" data-sound="open" onclick={startNew}>{t("players.leagues.new")}</button>
  </p>
{/if}

<style>
  .lead {
    display: inline-flex;
    margin-inline-end: 0.35em;
    color: var(--muted);
    vertical-align: -0.1em;
  }
  /* a result best-of left out: still shown, struck through */
  .dropped {
    color: var(--muted);
    text-decoration: line-through;
  }
  .matrix th a {
    color: inherit;
  }
</style>

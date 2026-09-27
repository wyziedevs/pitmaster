<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import Undo2 from "@lucide/svelte/icons/undo-2";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import FileSpreadsheet from "@lucide/svelte/icons/file-spreadsheet";
  import Repeat from "@lucide/svelte/icons/repeat";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { getGame, saveGame, deleteGame, exportGame, onOtherTab, getLeagues } from "$lib/store";
  import type { Game } from "$lib/types";
  import { day, download, fileSlug, MOD, timeOfDay } from "$lib/util";
  import { logEvent, rerun } from "$lib/game";
  import { recap, gameCsv } from "$lib/report";
  import { keyLabel } from "$lib/keys";
  import { settings } from "$lib/settings.svelte";
  import { headline } from "$lib/stats";
  import { provide } from "$lib/commands.svelte";
  import { toast } from "$lib/toast.svelte";
  import { play } from "$lib/sound";
  import { reveal, slide } from "$lib/motion";
  import TournamentControl from "$lib/components/TournamentControl.svelte";
  import CashControl from "$lib/components/CashControl.svelte";
  import TvPanel from "$lib/components/TvPanel.svelte";
  import CopyButton from "$lib/components/CopyButton.svelte";
  import Kbd from "$lib/components/Kbd.svelte";
  import { t, tp } from "$lib/i18n";

  const id = $derived(page.params.id!);
  let game = $state<Game | null>(getGame(page.params.id!));
  let showLog = $state(false);

  // ---- undo: every save remembers the state before it ----
  // kept for this visit only. the clock is saved as an anchor (a start time),
  // so undoing a bust five minutes later doesn't rewind the clock with it.
  let saved: Game | null = getGame(page.params.id!);
  const history: { before: Game; what: string }[] = [];
  let undoable = $state(0);

  // run it back lands on this same page with a new id: load that game fresh
  let loaded = page.params.id;
  $effect(() => {
    if (id === loaded) return;
    loaded = id;
    game = getGame(id);
    saved = game ? ($state.snapshot(game) as Game) : null;
    history.length = 0;
    undoable = 0;
  });

  // the same game open in another tab (or deleted from one): take that copy
  // the moment it's saved, so the next change here builds on it instead of
  // quietly undoing it. undo starts over, since its steps were from before
  $effect(() =>
    onOtherTab(() => {
      const there = getGame(id);
      if (there && game && there.updatedAt <= game.updatedAt) return;
      game = there;
      saved = there && structuredClone(there);
      history.length = 0;
      undoable = 0;
    })
  );

  function persist() {
    if (!game) return;
    game.updatedAt = Date.now();
    const next = $state.snapshot(game) as Game;
    if (saved) {
      const what = next.log[0] && next.log[0] !== saved.log[0] ? next.log[0].text : t("gamePlay.game.lastChangeFallback");
      history.push({ before: saved, what });
      if (history.length > 100) history.shift();
      undoable = history.length;
    }
    saved = next;
    saveGame(next);
  }

  function undo() {
    const last = history.pop();
    undoable = history.length;
    if (!last) return;
    game = structuredClone(last.before);
    saved = last.before;
    saveGame(structuredClone(last.before));
    play("rewind");
    toast(t("gamePlay.game.undoToast", { what: last.what }), "info");
  }

  function onKey(e: KeyboardEvent) {
    if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z" || e.shiftKey) return;
    // typing fields keep their own undo
    const tag = (e.target as HTMLElement).tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
    e.preventDefault();
    undo();
  }

  // ---- the league it counts toward ----
  const leagues = getLeagues();
  const leagueChoices = $derived(game ? leagues.filter((l) => l.types.includes(game!.type)) : []);
  function setLeague(id: string) {
    if (!game) return;
    const l = leagues.find((x) => x.id === id);
    if (l) game.leagueId = l.id;
    else delete game.leagueId;
    logEvent(game, l ? t("gameEvents.leagueLog", { name: l.name }) : t("gameEvents.noLeagueLog"));
    persist();
  }

  // ---- wrap-up ----
  const recapText = () => recap($state.snapshot(game) as Game);

  // from the palette there's no button to say Copied, so a toast says it
  async function copyRecap() {
    if (!game) return;
    try {
      await navigator.clipboard.writeText(recapText());
      toast(t("gamePlay.game.copiedRecapToast"));
    } catch {
      toast(t("gamePlay.shared.copyFailed"), "bad");
    }
  }

  // the log has no ids either: an entry is its time and its words, and the
  // odd twin logged in the same millisecond gets a count
  const logRows = $derived.by(() => {
    if (!game) return [];
    const seen = new Map<string, number>();
    return (showLog ? game.log : game.log.slice(0, 8)).map((e) => {
      const k = `${e.t} ${e.text}`;
      const n = seen.get(k) ?? 0;
      seen.set(k, n + 1);
      return { ...e, key: n ? `${k} ${n}` : k };
    });
  });

  function csv() {
    if (!game) return;
    const g = $state.snapshot(game) as Game;
    download(`${fileSlug(g.name)}-${new Date(g.clock.startedAt ?? g.createdAt).toISOString().slice(0, 10)}.csv`, gameCsv(g));
    toast(t("gamePlay.game.spreadsheetDownloadedToast"));
  }

  // one game in a file, to open on another device (Settings, Import) and keep running
  function exportThis() {
    if (!game) return;
    const file = exportGame(game.id);
    if (!file) return;
    download(`${fileSlug(game.name)}.pitmaster.json`, file, "application/json");
    toast(game.finished ? t("gamePlay.game.exportedFinishedToast") : t("gamePlay.game.exportedOngoingToast"));
  }

  function runItBack() {
    if (!game) return;
    const g = rerun($state.snapshot(game) as Game);
    saveGame(g);
    toast(g.players.length ? tp("gamePlay.game.rerunToastWithPlayers", g.players.length) : t("gamePlay.game.rerunToastNoPlayers"));
    goto(`/game/${g.id}`);
  }

  function remove() {
    if (!game || !confirm(t("gamePlay.game.confirmDelete", { name: game.name }))) return;
    deleteGame(game.id);
    toast(t("gamePlay.game.gameDeletedToast"), "info");
    goto("/");
  }

  $effect(() => {
    if (!game) return;
    return provide("game", () => [
      ...(undoable ? [{ id: "g:undo", label: t("gamePlay.game.undo"), group: t("gamePlay.shared.groupThisGame"), hint: `${MOD} Z`, keywords: "oops mistake", run: undo }] : []),
      { id: "g:tv", label: t("gamePlay.game.cmdOpenTvView"), group: t("gamePlay.shared.groupThisGame"), keywords: "screen", run: () => window.open(`/game/${id}/tv`, `tv-${id}`, "popup,width=1280,height=720") },
      { id: "g:recap", label: t("gamePlay.game.cmdCopyRecap"), group: t("gamePlay.shared.groupThisGame"), keywords: "share results text chat email post", run: copyRecap },
      { id: "g:csv", label: t("gamePlay.game.cmdDownloadSpreadsheet"), group: t("gamePlay.shared.groupThisGame"), keywords: "csv export results", run: csv },
      { id: "g:export", label: t("gamePlay.game.cmdMoveToAnotherDevice"), group: t("gamePlay.shared.groupThisGame"), keywords: "export file laptop computer transfer backup", run: exportThis },
      { id: "g:rerun", label: t("gamePlay.game.runItBack"), group: t("gamePlay.shared.groupThisGame"), keywords: "rerun again repeat same", run: runItBack },
      { id: "g:edit", label: t("gamePlay.game.cmdTweakAndRerun"), group: t("gamePlay.shared.groupThisGame"), keywords: "rerun edit copy", run: () => goto(`/new?type=${game!.type}&from=${id}`) },
    ]);
  });
</script>

<!-- the browser keeps tab titles in its history, unencrypted: the kind of game, never its name -->
<svelte:head><title>{game ? (game.type === "cash" ? t("gamePlay.game.tabCash") : t("gamePlay.game.tabTournament")) : t("gamePlay.game.tabGeneric")} · PitMaster</title></svelte:head>
<svelte:window onkeydown={onKey} />

{#if !game}
  <h1>{t("gamePlay.game.noGameTitle")}</h1>
  <p class="muted measure">{t("gamePlay.game.noGameBody")} <a href="/settings#data">{t("gamePlay.game.noGameLink")}</a></p>
  <p><a class="btn" href="/"><span class="flip-rtl inline-flex"><Icon icon={ArrowLeft} /></span>{t("gamePlay.game.backToGames")}</a></p>
{:else}
  {#key game.id}
  <div class="spread mb-3">
    <div>
      <!-- the name is edited in place, so the page's heading is for screen readers -->
      <h1 class="sr-only">{game.name}</h1>
      <input class="title h-auto p-0 bg-transparent w-[min(600px,100%)]" type="text" bind:value={game.name} onchange={persist} aria-label={t("gamePlay.game.gameNameAria")} />
      <div class="small muted">
        {game.type === "cash" ? t("gamePlay.game.tabCash") : t("gamePlay.game.tabTournament")} · {game.chipSetName}{game.multiplier !== 1 ? t("gamePlay.game.chipsMultiplier", { n: String(game.multiplier) }) : ""} · {day(game.createdAt)}
      </div>
    </div>
    <div class="row">
      <button data-sound="none" onclick={undo} disabled={!undoable} title={undoable ? t("gamePlay.game.undoTitleReady", { mod: MOD }) : t("gamePlay.game.undoTitleEmpty")}><Icon icon={Undo2} />{t("gamePlay.game.undo")}</button>
      <a class="btn" href="/game/{game.id}/tv" target="_blank">{t("gamePlay.game.tvView")}<Icon icon={ExternalLink} /></a>
    </div>
  </div>

  {#if game.finished}
    <div class="slab flex flex-wrap gap-[10px] items-center justify-between mb-[14px]" transition:slide={reveal()}>
      <span><b>{t("gamePlay.game.gameOverBanner")}</b> {headline(game)}</span>
      <span class="row">
        <CopyButton text={recapText} label={t("gamePlay.game.copyRecap")} />
        <button onclick={csv}><Icon icon={FileSpreadsheet} />{t("gamePlay.game.downloadSpreadsheet")}</button>
        <button data-sound="riffle" onclick={runItBack}><Icon icon={Repeat} />{t("gamePlay.game.runItBack")}</button>
      </span>
    </div>
  {/if}

  {#if game.type === "tournament"}
    <TournamentControl bind:game {persist} />
  {:else}
    <CashControl bind:game {persist} />
  {/if}

  <hr />
  <div class="cols">
    <TvPanel bind:game {persist} />
    <div class="box">
      <h2>{t("gamePlay.game.houseRulesNotes")} <span class="muted small">{t("gamePlay.game.onTheTv")}</span></h2>
      <textarea bind:value={game.notes} onchange={persist} rows="3" aria-label={t("gamePlay.game.houseRulesNotes")}></textarea>
      <div class="spread mt-[22px]">
        <h2>{t("gamePlay.game.logHeading")}</h2>
        {#if game.log.length > 8}<button class="link small" data-sound={showLog ? "close" : "open"} onclick={() => (showLog = !showLog)}>{showLog ? t("gamePlay.game.showLess") : t("gamePlay.game.showAll", { count: String(game.log.length) })}</button>{/if}
      </div>
      <ul class="bare small max-h-[300px] overflow-auto">
        {#each logRows as e (e.key)}
          <li class="px-0 py-[2px]" in:slide={reveal()}><span class="muted num">{timeOfDay(e.t)}</span> {e.text}</li>
        {/each}
      </ul>

      <h2 class="mt-[22px]">{t("gamePlay.game.thisGameHeading")}</h2>
      {#if leagueChoices.length}
        <label class="across small mb-[6px]">
          <span class="muted">{t("gameSetup.basics.league")}</span>
          <select value={game.leagueId && leagueChoices.some((l) => l.id === game!.leagueId) ? game.leagueId : ""} onchange={(e) => setLeague(e.currentTarget.value)}>
            <option value="">{t("gameSetup.basics.noLeague")}</option>
            {#each leagueChoices as l (l.id)}<option value={l.id}>{l.name}</option>{/each}
          </select>
        </label>
      {/if}
      <p class="small links mt-0 mx-0 mb-[6px]">
        <CopyButton text={recapText} link icon={false} label={t("gamePlay.game.copyRecap")} />
        <button class="link" onclick={csv}>{t("gamePlay.game.downloadSpreadsheet")}</button>
        <button class="link" onclick={exportThis}>{t("gamePlay.game.moveToAnotherDevice")}</button>
        <button class="link" data-sound="riffle" onclick={runItBack}>{t("gamePlay.game.runItBack")}</button>
        <a href="/new?type={game.type}&from={game.id}">{t("gamePlay.game.tweakAndRerun")}</a>
        <button class="link muted" onclick={remove} data-sound="thud">{t("common.delete")}</button>
      </p>
      <p class="small muted">
        {t("gamePlay.game.footerNote")}<span class="keys-hint"> <Kbd k={keyLabel(settings.paletteKey)} /> {t("gamePlay.game.keysHintSuffix")}</span>
      </p>
    </div>
  </div>
  {/key}
{/if}

<style>
  /* the name is editable in place: a dashed rule hints at it on hover, a solid
     one shows while typing */
  /* it's the page's title, so it's the same size as every other h1 and tall
     enough to keep its descenders */
  .title {
    font: var(--fs-2xl) / 1.2 var(--font-serif);
    letter-spacing: -0.01em;
    border: 0;
    border-bottom: var(--hair) dashed transparent;
  }
  .title:hover {
    border-bottom-color: var(--line-strong);
  }
  /* a finger can't hover: the dashes stay, faintly, so the name reads as editable */
  @media (hover: none) {
    .title {
      border-bottom-color: var(--line);
    }
  }
  .title:focus {
    border-bottom-style: solid;
    border-bottom-color: var(--focus);
  }
</style>

<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import Undo2 from "@lucide/svelte/icons/undo-2";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import FileSpreadsheet from "@lucide/svelte/icons/file-spreadsheet";
  import Repeat from "@lucide/svelte/icons/repeat";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { getGame, saveGame, deleteGame, exportGame, onOtherTab } from "$lib/store";
  import type { Game } from "$lib/types";
  import { day, download, fileSlug, MOD, timeOfDay } from "$lib/util";
  import { rerun } from "$lib/game";
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
      const what = next.log[0] && next.log[0] !== saved.log[0] ? next.log[0].text : "the last change";
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
    toast(`Undid: ${last.what}`, "info");
  }

  function onKey(e: KeyboardEvent) {
    if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z" || e.shiftKey) return;
    // typing fields keep their own undo
    const tag = (e.target as HTMLElement).tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
    e.preventDefault();
    undo();
  }

  // ---- wrap-up ----
  const recapText = () => recap($state.snapshot(game) as Game);

  // from the palette there's no button to say Copied, so a toast says it
  async function copyRecap() {
    if (!game) return;
    try {
      await navigator.clipboard.writeText(recapText());
      toast("Recap copied. Paste it wherever your players are.");
    } catch {
      toast("Couldn't copy. The browser blocked the clipboard.", "bad");
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
    toast("Spreadsheet downloaded");
  }

  // one game in a file, to open on another device (Settings, Import) and keep running
  function exportThis() {
    if (!game) return;
    const file = exportGame(game.id);
    if (!file) return;
    download(`${fileSlug(game.name)}.pitmaster.json`, file, "application/json");
    toast(game.finished ? "Exported. Import it on the other device." : "Exported. Import it on the other device and carry on from there.");
  }

  function runItBack() {
    if (!game) return;
    const g = rerun($state.snapshot(game) as Game);
    saveGame(g);
    toast(`New game with the same setup${g.players.length ? ` and ${g.players.length} players` : ""}`);
    goto(`/game/${g.id}`);
  }

  function remove() {
    if (!game || !confirm(`Delete “${game.name}”? This can't be undone.`)) return;
    deleteGame(game.id);
    toast("Game deleted", "info");
    goto("/");
  }

  $effect(() => {
    if (!game) return;
    return provide("game", () => [
      ...(undoable ? [{ id: "g:undo", label: "Undo", group: "This Game", hint: `${MOD} Z`, keywords: "oops mistake", run: undo }] : []),
      { id: "g:tv", label: "Open the TV View", group: "This Game", keywords: "screen", run: () => window.open(`/game/${id}/tv`, `tv-${id}`, "popup,width=1280,height=720") },
      { id: "g:recap", label: "Copy the Recap", group: "This Game", keywords: "share results text chat email post", run: copyRecap },
      { id: "g:csv", label: "Download a Spreadsheet", group: "This Game", keywords: "csv export results", run: csv },
      { id: "g:export", label: "Move This Game to Another Device", group: "This Game", keywords: "export file laptop computer transfer backup", run: exportThis },
      { id: "g:rerun", label: "Run It Back", group: "This Game", keywords: "rerun again repeat same", run: runItBack },
      { id: "g:edit", label: "Tweak the Setup and Rerun", group: "This Game", keywords: "rerun edit copy", run: () => goto(`/new?type=${game!.type}&from=${id}`) },
    ]);
  });
</script>

<!-- the browser keeps tab titles in its history, unencrypted: the kind of game, never its name -->
<svelte:head><title>{game ? (game.type === "cash" ? "Cash Game" : "Tournament") : "Game"} · PitMaster</title></svelte:head>
<svelte:window onkeydown={onKey} />

{#if !game}
  <h1>No Game Here</h1>
  <p class="muted measure">It might have been deleted, or it was made in a different browser. Export it there and <a href="/settings#data">import it here</a>.</p>
  <p><a class="btn" href="/"><Icon icon={ArrowLeft} />Back to Games</a></p>
{:else}
  {#key game.id}
  <div class="spread head">
    <div>
      <!-- the name is edited in place, so the page's heading is for screen readers -->
      <h1 class="sr-only">{game.name}</h1>
      <input class="title" type="text" bind:value={game.name} onchange={persist} aria-label="Game Name" />
      <div class="small muted">
        {game.type === "cash" ? "Cash Game" : "Tournament"} · {game.chipSetName}{game.multiplier !== 1 ? ` (chips ×${game.multiplier})` : ""} · {day(game.createdAt)}
      </div>
    </div>
    <div class="row">
      <button data-sound="none" onclick={undo} disabled={!undoable} title={undoable ? `Undo (${MOD} Z)` : "Nothing to undo yet"}><Icon icon={Undo2} />Undo</button>
      <a class="btn" href="/game/{game.id}/tv" target="_blank">TV View<Icon icon={ExternalLink} /></a>
    </div>
  </div>

  {#if game.finished}
    <div class="block wrapup" transition:slide={reveal()}>
      <span><b>Game over.</b> {headline(game)}</span>
      <span class="row">
        <CopyButton text={recapText} label="Copy Recap" />
        <button onclick={csv}><Icon icon={FileSpreadsheet} />Download Spreadsheet</button>
        <button data-sound="riffle" onclick={runItBack}><Icon icon={Repeat} />Run It Back</button>
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
      <h2>House Rules / Notes <span class="muted small">(On the TV)</span></h2>
      <textarea bind:value={game.notes} onchange={persist} rows="3" aria-label="House Rules / Notes"></textarea>
      <div class="spread part">
        <h2>Log</h2>
        {#if game.log.length > 8}<button class="link small" data-sound={showLog ? "close" : "open"} onclick={() => (showLog = !showLog)}>{showLog ? "Show Less" : `Show All ${game.log.length}`}</button>{/if}
      </div>
      <ul class="bare log small">
        {#each logRows as e (e.key)}
          <li in:slide={reveal()}><span class="muted num">{timeOfDay(e.t)}</span> {e.text}</li>
        {/each}
      </ul>

      <h2 class="part">This Game</h2>
      <p class="actions small links">
        <CopyButton text={recapText} link icon={false} label="Copy Recap" />
        <button class="link" onclick={csv}>Download Spreadsheet</button>
        <button class="link" onclick={exportThis}>Move to Another Device</button>
        <button class="link" data-sound="riffle" onclick={runItBack}>Run It Back</button>
        <a href="/new?type={game.type}&from={game.id}">Tweak and Rerun</a>
        <button class="link muted" onclick={remove} data-sound="thud">Delete</button>
      </p>
      <p class="small muted">
        Run It Back starts a fresh game with this setup and these players. Move saves this game to a file: import it on the other device and it carries on there, TV code and all.<span class="keys-hint"> <Kbd k={keyLabel(settings.paletteKey)} /> does anything on this page from the keyboard.</span>
      </p>
    </div>
  </div>
  {/key}
{/if}

<style>
  .head {
    margin-bottom: 12px;
  }
  /* the name is editable in place: a dashed rule hints at it on hover, a solid
     one shows while typing */
  /* it's the page's title, so it's the same size as every other h1 and tall
     enough to keep its descenders */
  .title {
    font: 30px/1.2 var(--font-serif);
    letter-spacing: -0.01em;
    height: auto;
    border: 0;
    border-bottom: var(--hair) dashed transparent;
    padding: 0;
    background: transparent;
    width: min(600px, 100%);
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
  .wrapup {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .log {
    max-height: 300px;
    overflow: auto;
  }
  .log li {
    padding: 2px 0;
  }
  .actions {
    margin: 0 0 6px;
  }
  /* a later part of the box starts with room above it, like the dealer screen's */
  .part {
    margin-top: 22px;
  }
</style>

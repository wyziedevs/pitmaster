<script lang="ts">
  // the tv board: a header, the board for the kind of game (the poker ones in
  // ./tv, another kind its own Board.svelte), a footer, and what goes over
  // them (the host's message, the news, the controls). what they all work
  // from is one TvState (./tv/state.svelte.ts).
  import "./tv/tv.css";
  import type { Game } from "$lib/types";
  import Dealing from "./Dealing.svelte";
  import FindMe from "./FindMe.svelte";
  import TvHeader from "./tv/TvHeader.svelte";
  import TvFooter from "./tv/TvFooter.svelte";
  import TvAlerts from "./tv/TvAlerts.svelte";
  import TvControls from "./tv/TvControls.svelte";
  import TvWinner from "./tv/TvWinner.svelte";
  import TourneyView from "./tv/TourneyView.svelte";
  import CashView from "./tv/CashView.svelte";
  import LeagueTable from "./tv/LeagueTable.svelte";
  import { TvState } from "./tv/state.svelte";
  import { BANNER } from "./tv/cues.svelte";
  import { cashRake } from "$lib/kinds/cash/engine";
  import { tableCounts } from "$lib/seats";
  import { sounds } from "$lib/sound";
  import { hostPrefs, prefs } from "$lib/settings.svelte";
  import { keepAwake } from "$lib/wakelock.svelte";
  import { innerHeight, innerWidth } from "svelte/reactivity/window";
  import { replay, leave, slide } from "$lib/motion";
  import { t } from "$lib/i18n";

  // code: the tv code this board was opened with (a tv on this computer has it on the game)
  let { game, status = "", code = "" }: { game: Game; status?: string; code?: string } = $props();

  const tv = new TvState(
    () => game,
    () => code
  );
  const cues = tv.cues;
  let idle = $state(false);

  // the board's unit (css --u) goes by the window's size: measured off the
  // board whenever that changes, for what's drawn in px
  let probe = $state<HTMLElement>();
  $effect(() => {
    void [innerWidth.current, innerHeight.current];
    if (probe) tv.unit = probe.getBoundingClientRect().width;
  });

  // a tv on another device takes the host's currency, clock and warning
  $effect(() => {
    hostPrefs.current = game.prefs ?? null;
  });
  $effect(() => () => (hostPrefs.current = null));

  // a kind of game that isn't poker brings its own board
  const board = $derived(tv.kind.Board ?? null);

  // the grid: a cash game with money off the board and no rake has nothing
  // for the right column, and several tables of seats want a wider left one
  const cashRight = $derived(tv.showMoney || cashRake(game).mode !== "none");
  const wideLeft = $derived(tableCounts(game).length > 1 && (tv.isCash || game.clock.status === "idle") && game.players.some((p) => p.seat && tv.kind.playing(game, p)));

  // news from the dealer screen: its toast, its cue, and the words
  let lastFlash = 0;
  $effect(() => {
    const f = game.flash;
    if (!f || f.at <= lastFlash) return;
    const first = lastFlash === 0;
    lastFlash = f.at;
    if (first && Date.now() - f.at > 8000) return; // don't replay old news on load
    cues.news(f.text, f.kind, f.at);
  });

  // the host's message lands with a chime (and gets read out, with the announcer on)
  let lastMessage = 0;
  let bannerKey = $state(0);
  $effect(() => {
    const m = game.message;
    if (!m || m.at <= lastMessage) return;
    const first = lastMessage === 0;
    lastMessage = m.at;
    if (first && Date.now() - m.at > 8000) return;
    cues.cue(sounds.chime, BANNER, 3);
    bannerKey++;
    cues.say(m.text, 1100);
  });

  // keep the screen from dimming mid-level
  keepAwake(() => prefs().tvAwake && game.clock.status === "running" && !game.finished);
</script>

<div class="tv" class:idle class:brk={tv.d?.level.isBreak || !!tv.winner} class:two={tv.isCash && !cashRight} class:wide-left={wideLeft} class:full={tv.bracketTurn}>
  <span class="unit-probe" aria-hidden="true" bind:this={probe}></span>
  <TvHeader name={game.name} meta={tv.meta} turned={tv.levelNum % 2 === 0} />

  {#if game.message?.text}
    <div class="banner" out:slide={leave()} use:replay={[bannerKey, "ring"]}>{game.message.text}</div>
  {/if}

  {#if board}
    {#if tv.standings}
      <section class="kind-board standings"><div class="pk"><LeagueTable league={tv.standings} /></div></section>
    {:else}
      <section class="kind-board">
        {#await board() then m}<m.default {game} narrow={tv.narrow} />{/await}
      </section>
    {/if}
    <TvFooter notes={game.notes} followUrl={tv.narrow ? "" : tv.followUrl} />
  {:else}
    <div class="pk">
      {#if tv.winner}
        <TvWinner {tv} />
      {:else if tv.d && tv.stats}
        <TourneyView {tv} />
      {:else if tv.isCash && game.cash}
        <CashView {tv} right={cashRight} />
      {:else}
        <section class="main wait"><div class="level"><Dealing label={t("tv.wait.waitingForHost")} />{t("tv.wait.waitingForHost")}</div></section>
      {/if}
    </div>
  {/if}

  {#if tv.narrow && (game.players.length || game.waitlist?.length)}<FindMe {game} />{/if}
  <TvAlerts {cues} />
  <TvControls {cues} {status} bind:idle />
</div>

<style>
  .unit-probe {
    position: absolute;
    width: var(--u);
    height: 0;
    visibility: hidden;
    pointer-events: none;
  }
  /* one unit for the whole board: 1% of the width on a 16:9 screen, and the
     same share of the height on anything wider, so nothing ever overflows */
  .tv {
    --u: min(1vw, 1.7778vh);
    --tv-good: var(--good);
    /* across a room a single real pixel disappears, so the board's hairline is
       one css pixel on any screen */
    --hair: 1px;
    --side: calc(var(--u) * 23);
    position: fixed;
    inset: 0;
    background: var(--tv-bg);
    color: var(--tv-fg);
    font-family: var(--font);
    display: grid;
    grid-template-columns: var(--side-l, var(--side)) minmax(0, 1fr) var(--side);
    grid-template-rows: auto auto minmax(0, 1fr) auto;
    grid-template-areas:
      "head head head"
      "banner banner banner"
      "left main right"
      "foot foot foot";
    overflow: hidden;
    transition: background-color 600ms var(--ease-out);
    /* a layer for good, so its text never changes weight when it stops moving
       (+layout.svelte). it fills the screen, so what's fixed inside it stays put */
    will-change: transform;
  }
  .tv.wide-left {
    --side-l: calc(var(--u) * 34);
  }
  .tv.two {
    grid-template-columns: var(--side-l, var(--side)) minmax(0, 1fr);
    grid-template-areas:
      "head head"
      "banner banner"
      "left main"
      "foot foot";
  }
  .tv.idle {
    cursor: none;
  }
  /* on the felt a grey line is the felt's own shade and disappears, so the
     board's lines go a step lighter than the felt instead */
  .tv.brk {
    --tv-line: color-mix(in oklch, var(--tv-fg) 16%, var(--tv-felt));
    background: var(--tv-felt);
  }
  /* a new message rings: the strip flashes bright three times as it lands */
  .banner:global(.ring) {
    animation:
      slidein 0.5s var(--ease-out-expo),
      ring 0.6s var(--ease-out) 0.35s 3;
  }
  @keyframes ring {
    30% {
      background: var(--tv-fg);
    }
  }
  .banner {
    grid-area: banner;
    background: var(--tv-banner);
    color: var(--tv-banner-fg);
    font-size: max(18px, calc(var(--u) * 2.5));
    font-weight: 700;
    padding: calc(var(--u) * 0.9) calc(var(--u) * 2);
    text-align: center;
    animation: slidein 0.5s var(--ease-out-expo);
  }
  @keyframes slidein {
    from {
      transform: translateY(-100%);
    }
  }
  /* a kind that isn't poker draws everything under the header itself */
  .kind-board {
    grid-column: 1 / -1;
    grid-row: 3;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  /* a league's standings, in the board's place while nothing's being played */
  .kind-board.standings {
    align-items: center;
    justify-content: center;
    gap: calc(var(--u) * 1.2);
  }
  .kind-board.standings :global(.k) {
    font-size: max(17px, calc(var(--u) * 1.85));
  }
  /* a tv on its side: the clock across the top, the two stat columns under it */
  @media (orientation: portrait) {
    .tv,
    .tv.two {
      --u: 1.5vw;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      grid-template-rows: auto auto minmax(0, 1fr) auto auto;
      grid-template-areas: "head head" "banner banner" "main main" "left right" "foot foot";
    }
    .tv.two {
      grid-template-areas: "head head" "banner banner" "main main" "left left" "foot foot";
    }
  }
  /* a phone, or any short screen (a phone on its side): one column that
     scrolls, clock first, so nothing gets cut off at the bottom */
  @media (max-width: 700px), (max-height: 500px) {
    .tv,
    .tv.two {
      --u: 1.6vw;
      grid-template-columns: 1fr;
      grid-template-areas: "head" "banner" "main" "find" "left" "right" "foot";
      grid-template-rows: none;
      grid-auto-rows: auto;
      align-content: start;
      overflow-y: auto;
      /* no layer of its own here: that would anchor the fixed controls, toasts
         and flare to the board, and they'd scroll away with it */
      will-change: auto;
      /* the notch, on a phone on its side */
      padding-inline: env(safe-area-inset-left) env(safe-area-inset-right);
    }
    /* another kind's board sits where the clock would, with Find Me after it */
    .kind-board {
      grid-area: main;
      grid-row: auto;
      grid-column: auto;
      overflow: visible;
    }
  }
  /* on its side the screen is wide but short: the board goes by whichever runs
     out first, and the clock and blinds by the height (tv.css), so the clock
     still fits on the first screen */
  @media (min-width: 701px) and (max-height: 500px) {
    .tv,
    .tv.two {
      --u: min(1.6vw, 2.2vh);
    }
  }
</style>

<script lang="ts">
  // a casino night on the tv: the last spin, roll or raffle draw, big, with
  // the roulette board of recent numbers under it; beside it every table and
  // its limits, and the raffle's prizes as they're won
  import type { Game } from "$lib/types";
  import { money } from "$lib/util";
  import { prefs } from "$lib/settings.svelte";
  import { playerName } from "$lib/events";
  import { fade } from "svelte/transition";
  import { reveal, replay } from "$lib/motion";
  import Count from "$lib/components/Count.svelte";
  import { casinoState, pocketHue } from "./engine";
  import { resultText } from "./actions";
  import { houseLine, nameFor } from "./index";
  import { t, tp } from "$lib/i18n";

  let { game, narrow = false }: { game: Game; narrow?: boolean } = $props();

  const s = $derived(game.casino!);
  const st = $derived(casinoState(game));
  const showMoney = $derived(prefs().tvMoney !== false);
  // the newest thing worth watching: a spin, a roll or a draw
  const latest = $derived((game.casinoEvents ?? []).findLast((e) => e.kind !== "buy" && e.kind !== "cash"));
  const table = $derived(latest && "table" in latest ? s.tables.find((x) => x.id === latest.table) : undefined);
  // the roulette board: the last numbers at the table spun most recently (or the first one)
  const wheel = $derived(table?.game === "roulette" ? table : s.tables.find((x) => x.game === "roulette"));
  const board = $derived(wheel ? st.results[wheel.id].slice(-12).reverse() : []);
  const n = $derived(game.casinoEvents?.length ?? 0);
</script>

<div class="casino-board" class:narrow>
  <section class="middle">
    {#if latest?.kind === "draw"}
      <span class="k">{t("casino.play.raffleHeading")} · {latest.prize}</span>
      {#key n}<span class="big winner" in:fade={reveal()}>{playerName(game, latest.player)}</span>{/key}
    {:else if latest && table}
      <span class="k">{nameFor(s, table)}</span>
      {#key n}<span class="big fig {table.game === 'roulette' && latest.kind === 'spin' ? pocketHue(latest.result) : ''}" in:fade={reveal()}>{resultText(latest, table.game)}</span>{/key}
    {:else}
      <span class="k">{game.finished ? t("gamePlay.cash.finishedPill") : t("casino.label")}</span>
      {#if showMoney}<span class="big fig" use:replay={[st.out, "glint"]}><Count value={st.out} format={money} /></span><span class="sub">{t("casino.play.chipsOut")}</span>{/if}
    {/if}
    {#if board.length}
      <ol class="numbers" aria-label={t("casino.play.lastNumbers")}>
        {#each board as r, i (st.results[wheel!.id].length - i)}{#if r.kind === "spin"}<li class={pocketHue(r.result)} class:first={i === 0}>{r.result}</li>{/if}{/each}
      </ol>
    {/if}
    {#if showMoney && game.finished}<span class="sub">{houseLine(game, st.house)}</span>{/if}
  </section>
  <aside class="side">
    <span class="k">{tp("casino.play.tablesCount", s.tables.length)}</span>
    <ol class="rows">
      {#each s.tables as x (x.id)}
        {@const last = st.results[x.id].at(-1)}
        <li>
          <span><b>{nameFor(s, x)}</b>{#if x.dealer}<small>{t("casino.play.dealtBy", { name: x.dealer })}</small>{/if}</span>
          <span class="fig">{last ? resultText(last, x.game) : t("casino.play.limits", { min: money(x.min), max: money(x.max) })}</span>
        </li>
      {/each}
    </ol>
    {#if s.finish === "raffle" && s.prizes.length}
      <span class="k mt">{t("casino.play.raffleHeading")}</span>
      <ol class="rows">
        {#each s.prizes as p, i (i)}
          {@const d = st.draws[i]}
          <li class="prize" class:open={!d}><span>{p}</span><b>{d ? playerName(game, d.player) : ""}</b></li>
        {/each}
      </ol>
    {/if}
  </aside>
</div>

<style>
  .casino-board {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) calc(var(--u) * 30);
    color: var(--tv-fg);
  }
  .k {
    display: block;
    color: var(--tv-muted);
    font-size: max(15px, calc(var(--u) * 1.5));
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .k.mt {
    margin-top: calc(var(--u) * 2);
  }
  .fig {
    font-variant-numeric: tabular-nums;
  }
  .sub {
    color: var(--tv-muted);
    font-size: max(16px, calc(var(--u) * 1.7));
  }
  .middle {
    container-type: size;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: min(calc(var(--u) * 1.2), 2cqh);
    padding: calc(var(--u) * 2);
    text-align: center;
    min-height: 0;
  }
  .big {
    font-size: min(calc(var(--u) * 13), 26cqh, 13cqw);
    font-weight: 700;
    line-height: 0.95;
    letter-spacing: -0.03em;
  }
  .winner {
    font: min(calc(var(--u) * 11), 22cqh, 11cqw) / 1 var(--font-serif);
    color: var(--tv-banner);
  }
  .big:global(.glint) {
    animation: glint 1.6s var(--ease-out);
  }
  @keyframes glint {
    from,
    15% {
      color: var(--tv-banner);
    }
  }
  .red {
    color: var(--tv-hot);
  }
  .green {
    color: var(--tv-good);
  }
  .numbers {
    list-style: none;
    margin: min(calc(var(--u) * 1.4), 3cqh) 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.3em;
    font-size: max(16px, min(calc(var(--u) * 2.2), 5cqh));
    font-variant-numeric: tabular-nums;
  }
  .numbers li {
    min-width: 2em;
    padding: 0.15em 0.3em;
    border: var(--hair) solid var(--tv-line);
  }
  .numbers li.black {
    color: var(--tv-fg);
  }
  .numbers li.first {
    font-weight: 700;
    border-color: currentColor;
  }
  .side {
    border-left: var(--hair) solid var(--tv-line);
    padding: calc(var(--u) * 1.6) calc(var(--u) * 2);
    min-height: 0;
    overflow: hidden;
    font-size: max(17px, calc(var(--u) * 1.8));
  }
  .rows {
    list-style: none;
    margin: calc(var(--u) * 0.6) 0 0;
    padding: 0;
  }
  .rows li {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1em;
    padding: calc(var(--u) * 0.45) 0;
    border-top: var(--hair) solid var(--tv-line);
  }
  .rows small {
    display: block;
    color: var(--tv-muted);
    font-size: 0.75em;
  }
  .rows li.open {
    color: var(--tv-muted);
  }
  .rows li.prize b {
    color: var(--tv-banner);
  }
  .narrow {
    grid-template-columns: 1fr;
  }
  .narrow .middle {
    container-type: normal;
    padding: 18px 16px;
  }
  .narrow .big {
    font-size: 56px;
  }
  .narrow .winner {
    font-size: 44px;
  }
  .narrow .side {
    border-left: 0;
    border-top: var(--hair) solid var(--tv-line);
  }
</style>

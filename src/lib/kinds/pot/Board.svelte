<script lang="ts">
  // a pot game on the tv: the pot, big, whose turn it is, and what just
  // happened to it; everyone's in and out, and the finish
  import type { Game } from "$lib/types";
  import { money, signed } from "$lib/util";
  import { prefs } from "$lib/settings.svelte";
  import { fade } from "svelte/transition";
  import { reveal, replay } from "$lib/motion";
  import Count from "$lib/components/Count.svelte";
  import { potState } from "./engine";
  import { eventText } from "./actions";
  import { presetName, setupLine } from "./index";
  import { t, tp } from "$lib/i18n";

  let { game, narrow = false }: { game: Game; narrow?: boolean } = $props();

  const st = $derived(potState(game));
  const showMoney = $derived(prefs().tvMoney !== false);
  const pname = (id: string | null | undefined) => game.players.find((p) => p.id === id)?.name ?? "";
  // the last few things that happened, newest first, each with its round
  // (keyed by where they are in the game, so an old one keeps its place as new ones come in)
  const recent = $derived.by(() => {
    let round = 0;
    const all = (game.potEvents ?? []).map((e, n) => {
      if (e.kind === "ante") round++;
      return { n, text: eventText(game, e, round) };
    });
    return all.slice(-5).reverse();
  });
  const byNet = $derived([...game.players].sort((a, b) => st.net[b.id] - st.net[a.id]));
  const many = $derived(game.players.length > 10);
</script>

<div class="pot-board" class:narrow class:solo={!showMoney}>
  <section class="middle">
    <span class="k">{game.finished ? t("gamePlay.cash.finishedPill") : `${presetName(game)} · ${tp("gamePlay.pot.rounds", st.rounds)}`}</span>
    {#if showMoney}<span class="pot fig" use:replay={[st.pot, "glint"]}><Count value={st.pot} format={money} /></span>{/if}
    {#if showMoney}<span class="sub">{setupLine(game)}</span>{/if}
    {#if !game.finished && st.turn}<span class="turn">{t("tv.pot.turn", { name: pname(st.turn) })}</span>{/if}
    <!-- (every event is money, so they stay off a board with the money off) -->
    {#if showMoney}
      <ol class="recent">
        {#each recent as r, i (r.n)}<li class:first={i === 0} in:fade={reveal()}>{r.text}</li>{/each}
      </ol>
    {/if}
  </section>
  {#if showMoney}
    <aside class="side">
      <span class="k">{t("tv.pot.standings")}</span>
      <ol class="nets" class:many>
        {#each byNet as p (p.id)}<li class:turn={!game.finished && st.turn === p.id}><b>{p.name}</b><span class="fig" class:good={st.net[p.id] > 0.004} class:bad={st.net[p.id] < -0.004}>{signed(st.net[p.id])}</span></li>{/each}
      </ol>
    </aside>
  {/if}
</div>

<style>
  .pot-board {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) calc(var(--u) * 28);
    color: var(--tv-fg);
  }
  .k {
    display: block;
    color: var(--tv-muted);
    font-size: max(15px, calc(var(--u) * 1.5));
    letter-spacing: 0.14em;
    text-transform: uppercase;
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
  .pot {
    font-size: min(calc(var(--u) * 16), 30cqh, 16cqw);
    font-weight: 700;
    line-height: 0.9;
    letter-spacing: -0.03em;
  }
  .pot:global(.glint) {
    animation: glint 1.6s var(--ease-out);
  }
  @keyframes glint {
    from,
    15% {
      color: var(--tv-banner);
    }
  }
  .turn {
    font: max(22px, min(calc(var(--u) * 3.6), 7cqh)) / 1.1 var(--font-serif);
    color: var(--tv-banner);
  }
  .recent {
    list-style: none;
    margin: min(calc(var(--u) * 1), 2cqh) 0 0;
    padding: 0;
    font-size: max(16px, min(calc(var(--u) * 1.9), 4cqh));
    color: var(--tv-muted);
    display: flex;
    flex-direction: column;
    gap: 0.35em;
  }
  .recent li.first {
    color: var(--tv-fg);
    font-weight: 700;
  }
  .side {
    border-left: var(--hair) solid var(--tv-line);
    padding: calc(var(--u) * 1.6) calc(var(--u) * 2);
    min-height: 0;
    overflow: hidden;
    font-size: max(17px, calc(var(--u) * 1.9));
  }
  .nets {
    list-style: none;
    margin: calc(var(--u) * 0.6) 0 0;
    padding: 0;
  }
  .nets li {
    display: flex;
    justify-content: space-between;
    gap: 1em;
    padding: calc(var(--u) * 0.45) 0;
    border-top: var(--hair) solid var(--tv-line);
  }
  .nets.many li {
    padding: calc(var(--u) * 0.2) 0;
    font-size: max(15px, calc(var(--u) * 1.45));
  }
  .nets li.turn b {
    color: var(--tv-banner);
  }
  .good {
    color: var(--tv-good);
  }
  .bad {
    color: var(--tv-hot);
  }
  .narrow,
  .solo {
    grid-template-columns: 1fr;
  }
  .narrow .middle {
    container-type: normal;
    padding: 18px 16px;
  }
  .narrow .pot {
    font-size: 64px;
  }
  .narrow .side {
    border-left: 0;
    border-top: var(--hair) solid var(--tv-line);
  }
</style>

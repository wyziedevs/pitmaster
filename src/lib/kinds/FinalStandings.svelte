<script lang="ts">
  // a last-one-standing game's end on the tv: the champion, big, and the
  // final standings under them (ten at most, down two columns past five),
  // with what each took home or their net when the money's on the board
  import Icon from "$lib/components/Icon.svelte";
  import Trophy from "@lucide/svelte/icons/trophy";
  import type { DiceStakes, Game } from "$lib/types";
  import { champOf, netOf, type Standing } from "./standing";
  import { money, ordinal, signed } from "$lib/util";
  import { prefs } from "$lib/settings.svelte";
  import { fade } from "svelte/transition";
  import { reveal } from "$lib/motion";
  import { t } from "$lib/i18n";

  let { game, st, stakes }: { game: Game; st: Standing; stakes: DiceStakes } = $props();

  const showMoney = $derived(prefs().tvMoney !== false);
  const shown = $derived([...game.players].sort((a, b) => (st.places[a.id] ?? 99) - (st.places[b.id] ?? 99)).slice(0, 10));
  const rows = $derived(shown.length > 5 ? Math.ceil(shown.length / 2) : shown.length);
</script>

<section class="winner" in:fade={reveal()}>
  <div class="trophy"><Icon icon={Trophy} size="10vh" /></div>
  <div class="k">{t("tv.winner.champion")}</div>
  <div class="big">{champOf(game, st)?.name}</div>
  <ol class="final" class:split={shown.length > 5} style:--rows={rows}>
    {#each shown as p, i (p.id)}
      <li class:top={i % rows === 0}>
        <span class="place">{ordinal(st.places[p.id] ?? 0)}</span>
        <b>{p.name}</b>
        {#if showMoney}<span class="fig">{stakes.mode === "pot" ? money(st.money.won[p.id] ?? 0) : signed(netOf(st, p.id))}</span>{/if}
      </li>
    {/each}
  </ol>
</section>

<style>
  .winner {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: calc(var(--u) * 1);
    text-align: center;
  }
  .trophy {
    color: var(--tv-banner);
    line-height: 0;
  }
  .k {
    display: block;
    color: var(--tv-muted);
    font-size: max(15px, calc(var(--u) * 1.4));
    letter-spacing: 0.14em;
    text-transform: uppercase;
    line-height: 1.3;
  }
  .big {
    font: min(calc(var(--u) * 9.9), 16.5vh) / 1 var(--font-serif);
  }
  .final {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: max(19px, calc(var(--u) * 2.2));
    min-width: min(calc(var(--u) * 40), 92vw);
  }
  .final li {
    display: grid;
    grid-template-columns: 3.2em 1fr auto;
    gap: 1em;
    text-align: left;
    padding: calc(var(--u) * 0.4) 0;
    border-top: var(--hair) solid var(--tv-line);
  }
  .final li.top {
    border-top: 0;
  }
  /* a big table's standings run down two columns instead of off the screen */
  .final.split {
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: repeat(var(--rows), auto);
    column-gap: calc(var(--u) * 4);
    min-width: min(calc(var(--u) * 76), 96vw);
  }
  .place {
    color: var(--tv-muted);
  }
  .fig {
    font-variant-numeric: tabular-nums;
  }
</style>

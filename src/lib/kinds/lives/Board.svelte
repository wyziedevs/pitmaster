<script lang="ts">
  // a lives game on the tv: every player's lives (the lost ones greyed, and
  // whoever's out greyed whole), the round, the stakes, and the winner
  import type { Game } from "$lib/types";
  import { money, ordinal } from "$lib/util";
  import { prefs } from "$lib/settings.svelte";
  import FinalStandings from "../FinalStandings.svelte";
  import { champOf } from "../standing";
  import Life from "./Life.svelte";
  import { livesState } from "./engine";
  import { livesPreset } from "./presets";
  import { presetName, stakesLine } from "./index";
  import { t, tp } from "$lib/i18n";

  let { game, narrow = false }: { game: Game; narrow?: boolean } = $props();

  const l = $derived(game.lives!);
  const token = $derived(livesPreset(l.preset).token);
  const st = $derived(livesState(game));
  const showMoney = $derived(prefs().tvMoney !== false);
  const champ = $derived(game.finished ? champOf(game, st) : null);
  // many players (or lives) get smaller tokens, and a big table smaller still
  const many = $derived(game.players.length > 8 || l.lives > 6);
  const lots = $derived(game.players.length > 16);
</script>

<div class="lives-board" class:narrow>
  {#if champ}
    <FinalStandings {game} {st} stakes={l.stakes} />
  {:else}
    <div class="table">
      <section class="players" class:many class:lots>
        {#each game.players as p (p.id)}
          {@const left = st.lives[p.id]}
          <div class="player" class:out={left === 0}>
            <span class="pname">{p.name}</span>
            <span class="tokens">{#each Array.from({ length: Math.min(l.lives, 12) }) as _, i (i)}<Life {token} size="var(--tok)" dim={i >= left} />{/each}{#if l.lives > 12}<span class="count fig">{left}</span>{/if}</span>
            {#if st.places[p.id]}<span class="sub">{t("tv.dice.outIn", { place: ordinal(st.places[p.id]!) })}</span>{/if}
          </div>
        {/each}
      </section>
      <aside class="side">
        <div class="stat">
          <span class="k">{presetName(game)}</span>
          <span class="v fig">{st.alive.length}</span>
          <span class="sub">{tp("gamePlay.lives.stillIn", st.alive.length)} · {t("tv.dice.round", { n: String((game.lifeRounds?.length ?? 0) + 1) })}</span>
        </div>
        {#if showMoney}
          <div class="stat">
            <span class="k">{t("tv.dice.stakes")}</span>
            <span class="sub">{stakesLine(game)}</span>
            {#if l.stakes.mode === "perDie" && l.stakes.perDieTo === "pot"}<span class="fig">{t("tv.dice.pot", { amount: money(st.money.pool) })}</span>{/if}
          </div>
        {/if}
        <p class="rules">{t(`gameSetup.lives.rules.${l.preset}`)}</p>
      </aside>
    </div>
  {/if}
</div>

<style>
  .lives-board {
    --tok: max(18px, calc(var(--u) * 3));
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    color: var(--tv-fg);
  }
  .k {
    display: block;
    color: var(--tv-muted);
    font-size: max(15px, calc(var(--u) * 1.4));
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .fig {
    font-variant-numeric: tabular-nums;
  }
  .sub {
    color: var(--tv-muted);
    font-size: max(15px, calc(var(--u) * 1.5));
  }
  .table {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) calc(var(--u) * 26);
  }
  .players {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(calc(var(--tok) * 7), 1fr));
    align-content: center;
    gap: calc(var(--u) * 1.6) calc(var(--u) * 2.4);
    padding: calc(var(--u) * 2) calc(var(--u) * 3);
    min-height: 0;
    overflow: hidden;
  }
  .players.many {
    --tok: max(14px, calc(var(--u) * 2.2));
  }
  .players.lots {
    --tok: max(12px, calc(var(--u) * 1.6));
    gap: calc(var(--u) * 1) calc(var(--u) * 1.6);
  }
  .lots .pname {
    font-size: max(17px, calc(var(--u) * 1.8));
  }
  .player {
    display: flex;
    flex-direction: column;
    gap: calc(var(--u) * 0.6);
    padding-bottom: calc(var(--u) * 0.8);
    border-bottom: var(--hair) solid var(--tv-line);
    min-width: 0;
  }
  .player.out {
    opacity: 0.45;
  }
  .pname {
    font: max(20px, calc(var(--u) * 2.4)) / 1.1 var(--font-serif);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tokens {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: calc(var(--tok) * 0.2);
  }
  .count {
    margin-left: 0.4em;
    font-weight: 700;
  }
  .side {
    border-left: var(--hair) solid var(--tv-line);
    padding: calc(var(--u) * 1.6) calc(var(--u) * 2);
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    font-size: max(17px, calc(var(--u) * 1.8));
  }
  .stat {
    display: flex;
    flex-direction: column;
    gap: calc(var(--u) * 0.4);
    padding: calc(var(--u) * 1.2) 0;
    border-bottom: var(--hair) solid var(--tv-line);
  }
  .v {
    font-size: calc(var(--u) * 6);
    font-weight: 700;
    line-height: 1;
  }
  .rules {
    color: var(--tv-muted);
    font-size: 0.85em;
    line-height: 1.35;
  }
  .narrow .table {
    grid-template-columns: 1fr;
  }
  .narrow .side {
    border-left: 0;
    border-top: var(--hair) solid var(--tv-line);
  }
  .narrow .players {
    --tok: 20px;
    padding: 14px 16px;
  }
</style>

<script lang="ts">
  // liar's dice on the tv: every player's dice (the ones they've lost greyed,
  // and whoever's out greyed whole), the dice on the table and what a bid can
  // expect, a palifico banner, and the big moment when a bid is called.
  import Icon from "$lib/components/Icon.svelte";
  import Trophy from "@lucide/svelte/icons/trophy";
  import type { Game } from "$lib/types";
  import Die from "$lib/components/Die.svelte";
  import { money, ordinal, round2, signed } from "$lib/util";
  import { prefs } from "$lib/settings.svelte";
  import { time } from "$lib/now.svelte";
  import { fade } from "svelte/transition";
  import { reveal } from "$lib/motion";
  import { diceState, expected } from "./engine";
  import { faceCount, roundText } from "./actions";
  import { stakesLine } from "./index";
  import { waitingOn } from "./cups";
  import { t, tp } from "$lib/i18n";
  import { playerName } from "$lib/events";

  let { game, narrow = false }: { game: Game; narrow?: boolean } = $props();

  const d = $derived(game.dice!);
  const st = $derived(diceState(game));
  const showMoney = $derived(prefs().tvMoney !== false);
  const champ = $derived(game.finished ? game.players.find((p) => st.places[p.id] === 1) : null);
  const byPlace = $derived([...game.players].sort((a, b) => (st.places[a.id] ?? 99) - (st.places[b.id] ?? 99)));
  // the final standings: ten at most, down two columns past five
  const finals = $derived(byPlace.slice(0, 10));
  const rows = $derived(finals.length > 5 ? Math.ceil(finals.length / 2) : finals.length);
  // many players get smaller cups
  const many = $derived(game.players.length > 8);
  const net = (id: string) => round2((st.money.won[id] ?? 0) - (st.money.paid[id] ?? 0));

  // the call just made: it takes over the board for a few seconds
  const last = $derived(game.rounds?.at(-1));
  const moment = $derived(last?.call && last.bid && last.actual !== undefined && time.now - last.at < 9000 ? last : null);
  const right = $derived(!!moment && (moment.call === "liar" ? moment.actual! < moment.bid!.count : moment.actual === moment.bid!.count));

  // phones as cups: where the round's at, and (after a call) every cup face up
  const cups = $derived(game.cups?.on ? game.cups : null);
  const waiting = $derived(cups ? waitingOn(game, st.alive) : []);
  const shown = $derived(moment?.reveal ?? null);
  // a die that counts toward the bid: its face, or a wild one (as the called
  // round had it: the call can start a palifico, where ones aren't)
  const calledWild = $derived(!!moment && diceState({ ...game, rounds: game.rounds!.slice(0, -1) }).wild);
  const counts = (v: number) => !!moment?.bid && (v === moment.bid.face || (calledWild && moment.bid.face !== 1 && v === 1));
</script>

<div class="dice-board" class:narrow>
  {#if st.palifico && !champ}
    <div class="pal" in:fade={reveal()}><span class="k">{t("tv.dice.palifico")}</span> {t("tv.dice.palificoLine", { name: playerName(game, st.palifico, "") })}</div>
  {/if}

  {#if champ}
    <section class="winner" in:fade={reveal()}>
      <div class="trophy"><Icon icon={Trophy} size="10vh" /></div>
      <div class="k">{t("tv.winner.champion")}</div>
      <div class="big">{champ.name}</div>
      <ol class="final" class:split={finals.length > 5} style:--rows={rows}>
        {#each finals as p, i (p.id)}
          <li class:top={i % rows === 0}>
            <span class="place">{ordinal(st.places[p.id] ?? 0)}</span>
            <b>{p.name}</b>
            {#if showMoney}<span class="fig">{d.stakes.mode === "pot" ? money(st.money.won[p.id] ?? 0) : signed(net(p.id))}</span>{/if}
          </li>
        {/each}
      </ol>
    </section>
  {:else}
    <div class="table">
      <section class="cups" class:many>
        {#each game.players as p (p.id)}
          {@const lives = st.lives[p.id]}
          <div class="cup" class:out={lives === 0} class:starts={st.starter === p.id}>
            <span class="pname">{p.name}{#if st.starter === p.id}<span class="tag">{t("tv.dice.starts")}</span>{/if}</span>
            {#if shown?.[p.id]}
              <span class="dice shown">{#each shown[p.id] as v, i (i)}<span class:hit={counts(v)}><Die value={v} size="var(--die)" /></span>{/each}</span>
            {:else}
              <span class="dice">{#each Array.from({ length: d.dice }) as _, i (i)}<Die size="var(--die)" dim={i >= lives} />{/each}</span>
            {/if}
            {#if moment?.cheats?.includes(p.id)}<span class="sub hot">{t("tv.cup.caught")}</span>{/if}
            {#if st.places[p.id]}<span class="sub">{t("tv.dice.outIn", { place: ordinal(st.places[p.id]!) })}</span>{/if}
          </div>
        {/each}
      </section>
      <aside class="side">
        <div class="stat">
          <span class="k">{t("tv.dice.onTable")}</span>
          <span class="v fig">{st.total}</span>
          <span class="sub">{t("tv.dice.round", { n: String((game.rounds?.length ?? 0) + 1) })}</span>
          {#if cups}
            <span class="sub">{cups.phase === "commit" ? (waiting.length ? t("tv.cup.rollingFor", { names: waiting.map((id) => playerName(game, id, "")).join(", ") }) : t("tv.cup.allIn")) : cups.phase === "play" ? t("tv.cup.bidding") : t("tv.cup.showing")}</span>
          {/if}
        </div>
        <div class="stat">
          <span class="k">{st.wild ? t("tv.dice.expectedWild") : t("tv.dice.expectedPlain")}</span>
          <div class="faces">
            {#each [1, 2, 3, 4, 5, 6] as f (f)}<span class="face"><Die value={f} size="var(--face)" /><span class="fig">{Math.round(expected(st.total, f, st.wild) * 10) / 10}</span></span>{/each}
          </div>
        </div>
        {#if showMoney}
          <div class="stat">
            <span class="k">{t("tv.dice.stakes")}</span>
            <span class="sub">{stakesLine(game)}</span>
            {#if d.stakes.mode === "perDie" && d.stakes.perDieTo === "pot"}<span class="fig">{t("tv.dice.pot", { amount: money(st.money.pool) })}</span>{/if}
          </div>
        {/if}
      </aside>
    </div>
  {/if}

  {#if moment}
    {#key moment.at}
      <div class="moment" class:good={right} in:fade={reveal()}>
        <span class="shout">{moment.call === "liar" ? t("tv.dice.liar") : t("tv.dice.spotOn")}</span>
        <span class="bid">{t("tv.dice.bidWas", { bid: faceCount(moment.bid!.count, moment.bid!.face) })}</span>
        <span class="there">{tp("tv.dice.thereWere", moment.actual!)}</span>
        <span class="res">{roundText(game, { ...moment, call: undefined })}</span>
      </div>
    {/key}
  {/if}
</div>

<style>
  .dice-board {
    --die: max(18px, calc(var(--u) * 3.1));
    --face: max(16px, calc(var(--u) * 2.4));
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
    line-height: 1.3;
  }
  .fig {
    font-variant-numeric: tabular-nums;
  }
  .sub {
    color: var(--tv-muted);
    font-size: max(15px, calc(var(--u) * 1.5));
  }
  .pal {
    background: var(--tv-banner);
    color: var(--tv-banner-fg);
    font-size: max(19px, calc(var(--u) * 2.3));
    font-weight: 700;
    text-align: center;
    padding: calc(var(--u) * 0.8) calc(var(--u) * 2);
  }
  .pal .k {
    display: inline;
    color: inherit;
    margin-right: 0.6em;
  }
  .table {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) calc(var(--u) * 26);
  }
  .cups {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(calc(var(--die) * 6.6), 1fr));
    align-content: center;
    gap: calc(var(--u) * 1.6) calc(var(--u) * 2.4);
    padding: calc(var(--u) * 2) calc(var(--u) * 3);
    min-height: 0;
    overflow: hidden;
  }
  .cups.many {
    --die: max(15px, calc(var(--u) * 2.3));
  }
  .cup {
    display: flex;
    flex-direction: column;
    gap: calc(var(--u) * 0.6);
    padding-bottom: calc(var(--u) * 0.8);
    border-bottom: var(--hair) solid var(--tv-line);
    min-width: 0;
  }
  .pname {
    font: max(20px, calc(var(--u) * 2.4)) / 1.1 var(--font-serif);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tag {
    font-family: var(--font);
    font-size: 0.5em;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--tv-banner);
    margin-left: 0.8em;
    vertical-align: 0.2em;
  }
  .dice {
    display: flex;
    flex-wrap: wrap;
    gap: calc(var(--die) * 0.2);
  }
  .cup.out {
    opacity: 0.45;
  }
  /* the cups up after a call: the dice that count toward the bid stand out */
  .shown > span {
    line-height: 0;
    opacity: 0.45;
  }
  .shown > span.hit {
    opacity: 1;
    outline: 2px solid var(--tv-banner);
    outline-offset: 2px;
    border-radius: 3px;
  }
  .hot {
    color: var(--tv-hot);
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
  .faces {
    display: grid;
    grid-template-columns: repeat(3, auto);
    justify-content: start;
    gap: calc(var(--u) * 0.7) calc(var(--u) * 1.6);
  }
  .face {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    font-size: 1.2em;
    font-weight: 700;
  }

  /* the call: the board goes dark and the word lands, then the count */
  .moment {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: calc(var(--u) * 1);
    background: color-mix(in oklch, var(--tv-bg) 88%, transparent);
    text-align: center;
    padding: calc(var(--u) * 3);
  }
  .shout {
    font: calc(var(--u) * 12) / 1 var(--font-serif);
    color: var(--tv-hot);
    animation: shout 0.6s var(--ease-out-expo);
  }
  .moment.good .shout {
    color: var(--tv-banner);
  }
  .bid {
    font-size: calc(var(--u) * 3);
    font-weight: 700;
  }
  .there {
    font-size: calc(var(--u) * 4.2);
    font-weight: 700;
    animation: shout 0.6s var(--ease-out-expo) 0.9s backwards;
  }
  .res {
    color: var(--tv-muted);
    font-size: calc(var(--u) * 2.2);
    animation: shout 0.6s var(--ease-out-expo) 1.4s backwards;
  }
  @keyframes shout {
    from {
      transform: scale(1.25);
      opacity: 0;
    }
  }

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

  /* a phone: the cups, then the counts under them */
  .narrow .table {
    grid-template-columns: 1fr;
  }
  .narrow .side {
    border-left: 0;
    border-top: var(--hair) solid var(--tv-line);
  }
  .narrow .cups {
    --die: 20px;
    padding: 14px 16px;
  }
  @media (prefers-reduced-motion: reduce) {
    .shout,
    .there,
    .res {
      animation: none;
    }
  }
</style>

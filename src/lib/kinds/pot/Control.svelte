<script lang="ts">
  // the dealer screen for a pot game: the pot, whose turn it is, everyone's
  // ante for a new round, and what each player puts in or takes out. in-between
  // bets against the pot (win, lose, or hit the post and pay double); guts and
  // bourre have the losers match it. the end sends what's left back out.
  import Icon from "$lib/components/Icon.svelte";
  import Undo2 from "@lucide/svelte/icons/undo-2";
  import Coins from "@lucide/svelte/icons/coins";
  import type { Game } from "$lib/types";
  import { reopen } from "$lib/game";
  import { playerName } from "$lib/events";
  import { money, signed } from "$lib/util";
  import { provide } from "$lib/commands.svelte";
  import { play } from "$lib/sound";
  import { bump } from "$lib/motion";
  import Count from "$lib/components/Count.svelte";
  import Roster, { tone } from "../Roster.svelte";
  import Settle from "../Settle.svelte";
  import PlayerSelect from "../PlayerSelect.svelte";
  import { potCap, potState } from "./engine";
  import { anteUp, bet, endPot, matchPot, pay, take, takePot, undoPot } from "./actions";
  import { potPreset } from "./presets";
  import { presetName, setupLine } from "./index";
  import { t, tp } from "$lib/i18n";

  let { game = $bindable(), persist }: { game: Game; persist: () => void } = $props();

  const s = $derived(game.pot!);
  const preset = $derived(potPreset(s.preset));
  const st = $derived(potState(game));
  const started = $derived(!!game.potEvents?.length);

  function act(fn: () => void) {
    fn();
    persist();
  }

  // ---- in-between: whoever's turn it is bets against the pot (unless the dealer picks someone else) ----
  let pick = $state("");
  const bettor = $derived(game.players.some((p) => p.id === pick) ? pick : (st.turn ?? ""));
  let amount = $state<number | null>(null);
  const cap = $derived(potCap(s, st.pot));
  function settleBet(result: "win" | "lose" | "post") {
    const who = bettor;
    const a = amount;
    if (!who || !a) return;
    play(result === "win" ? "chips" : "bust");
    act(() => bet(game, who, a, result));
    amount = null;
    pick = "";
  }

  // ---- anything else: someone pays in, or takes out ----
  let who = $state("");
  let other = $state<number | null>(null);
  let matchers = $state<string[]>([]);
  let handWinner = $state("");
  function move(fn: typeof pay) {
    const a = other;
    if (!who || !a) return;
    play("chips");
    act(() => fn(game, who, a));
    other = null;
  }
  function wholePot() {
    if (!who) return;
    play("ship");
    act(() => takePot(game, who));
  }
  // guts and bourre: the hand's winner takes the pot, and the losers match what was in it
  const losers = $derived(matchers.filter((id) => id !== handWinner));
  function match() {
    if (!losers.length) return;
    play(handWinner ? "ship" : "bust");
    act(() => matchPot(game, [...losers], handWinner || undefined));
    matchers = [];
    handWinner = "";
  }
  function ante() {
    play("chips");
    act(() => anteUp(game));
  }
  function end() {
    if (!confirm(t("gamePlay.pot.endConfirm", { amount: money(st.pot) }))) return;
    play("square");
    act(() => endPot(game));
  }

  $effect(() =>
    provide("pot", () => [
      ...(!game.finished
        ? [
            { id: "p:ante", label: t("gamePlay.pot.anteButton", { amount: money(s.ante) }), group: t("gamePlay.shared.groupThisGame"), keywords: "ante round", run: ante },
            ...game.players.map((p) => ({ id: `p:takepot:${p.id}`, label: t("gamePlay.pot.cmdTakesPot", { name: p.name }), group: t("gamePlay.shared.groupPlayers"), keywords: "win pot", run: () => (play("ship"), act(() => takePot(game, p.id))) })),
          ]
        : []),
      ...(started && !game.finished ? [{ id: "p:undo", label: t("gamePlay.pot.undo"), group: t("gamePlay.shared.groupThisGame"), keywords: "undo", run: () => (play("rewind"), act(() => undoPot(game))) }] : []),
    ])
  );
</script>

<section class="clockbox">
  <div class="spread">
    <div>
      <div class="lvl">{t("gamePlay.pot.potLabel")} · {tp("gamePlay.pot.rounds", st.rounds)}</div>
      <div class="clockface num" use:bump={st.pot}><Count value={st.pot} format={money} /></div>
      <div class="small muted">{presetName(game)} · {setupLine(game)}</div>
    </div>
    <div class="blinds text-right max-[600px]:text-left">
      {#if !game.finished && st.turn}<div class="small muted">{t("gamePlay.pot.turn")}</div><div class="bb">{playerName(game, st.turn, "")}</div>{/if}
      {#if !game.finished && s.limit > 0}<div class="small muted">{t("gamePlay.pot.maxBet", { amount: money(cap) })}</div>{/if}
    </div>
  </div>
  <div class="row controls mt-2">
    {#if !game.finished}
      <button class="big" data-sound="none" onclick={ante} disabled={!game.players.length || !(s.ante > 0)}><Icon icon={Coins} />{t("gamePlay.pot.anteButton", { amount: money(s.ante) })}</button>
      <button data-sound="none" onclick={end}>{t("gamePlay.cash.endGame")}</button>
    {:else}
      <span class="pill pop">{t("gamePlay.cash.finishedPill")}</span>
      <button class="link small" data-sound="rewind" onclick={() => act(() => reopen(game))}>{t("gamePlay.pot.reopen")}</button>
    {/if}
  </div>
</section>

<div class="cols">
  <section>
    {#if !game.finished}
      {#if preset.bets}
        <div class="part">
          <h2>{t("gamePlay.pot.betHeading")}</h2>
          <div class="row">
            <label><span>{t("gamePlay.pot.bettor")}</span>
              <PlayerSelect bind:value={() => bettor, (v) => (pick = v)} players={game.players} blank={false} />
            </label>
            <label><span>{t("gamePlay.pot.betAmount")}</span><input type="number" min="0" step="any" max={cap} class="w-[90px]" bind:value={amount} /></label>
            <button class="link small self-end mb-2" data-sound="chips" onclick={() => (amount = cap)} disabled={!(cap > 0)}>{t("gamePlay.pot.betThePot", { amount: money(cap) })}</button>
          </div>
          {#if amount && amount > cap}<p class="warn small">{t("gamePlay.pot.overLimit", { amount: money(cap) })}</p>{/if}
          <div class="row">
            <button data-sound="none" disabled={!bettor || !amount} onclick={() => settleBet("win")}>{t("gamePlay.pot.win")}</button>
            <button data-sound="none" disabled={!bettor || !amount} onclick={() => settleBet("lose")}>{t("gamePlay.pot.lose")}</button>
            <button data-sound="none" disabled={!bettor || !amount} onclick={() => settleBet("post")}>{t("gamePlay.pot.post")}</button>
          </div>
          <p class="small muted">{t("gamePlay.pot.betHint")}</p>
        </div>
      {/if}

      {#if preset.match}
        <div class="part mt-[22px]">
          <h2>{t("gamePlay.pot.matchHeading", { amount: money(cap) })}</h2>
          <label><span>{t("gamePlay.pot.handWonBy")}</span>
            <PlayerSelect bind:value={handWinner} players={game.players} />
          </label>
          <div class="row">
            {#each game.players as p (p.id)}<label class="across m-0"><input type="checkbox" bind:group={matchers} value={p.id} disabled={p.id === handWinner} /><span>{p.name}</span></label>{/each}
          </div>
          <button class="mt-2" data-sound="none" disabled={!losers.length || !(st.pot > 0)} onclick={match}>{t("gamePlay.pot.matchButton")}</button>
          <p class="small muted">{t("gamePlay.pot.matchHint")}</p>
        </div>
      {/if}

      <div class="part mt-[22px]">
        <h2>{t("gamePlay.pot.moneyHeading")}</h2>
        <div class="row">
          <label><span>{t("gamePlay.shared.nameHeader")}</span>
            <PlayerSelect bind:value={who} players={game.players} />
          </label>
          <label><span>{t("gamePlay.pot.amount")}</span><input type="number" min="0" step="any" class="w-[90px]" bind:value={other} /></label>
        </div>
        <div class="row">
          <button data-sound="none" disabled={!who || !other} onclick={() => move(pay)}>{t("gamePlay.pot.payIn")}</button>
          <button data-sound="none" disabled={!who || !other} onclick={() => move(take)}>{t("gamePlay.pot.takeOut")}</button>
          <button data-sound="none" disabled={!who || !(st.pot > 0)} onclick={wholePot}>{t("gamePlay.pot.takePot")}</button>
        </div>
      </div>
    {/if}

    <div class="part mt-[22px]">
      <div class="spread">
        <h2>{t("gamePlay.pot.historyHeading")}</h2>
        {#if started && !game.finished}<button class="link small" data-sound="rewind" onclick={() => act(() => undoPot(game))}><Icon icon={Undo2} size="1em" />{t("gamePlay.pot.undo")}</button>{/if}
      </div>
      <ul class="bare small events">
        {#each [...game.log].filter((e) => e.t >= (game.potEvents?.[0]?.at ?? Infinity)).slice(0, 30) as e, i (e.t + ":" + i)}<li>{e.text}</li>{:else}<li class="muted">{t("gamePlay.pot.nothingYet")}</li>{/each}
      </ul>
    </div>
  </section>

  <section>
    <Roster bind:game {persist} players={game.players} adding={!game.finished} removing={!started} turn={game.finished ? null : st.turn}>
      {#snippet head()}<th class="num">{t("gamePlay.pot.paidHeader")}</th><th class="num">{t("gamePlay.pot.takenHeader")}</th><th class="num">{t("players.page.table.net")}</th>{/snippet}
      {#snippet row(p)}
        <td class="num" data-l={t("gamePlay.pot.paidHeader")}>{money(st.paid[p.id])}</td>
        <td class="num" data-l={t("gamePlay.pot.takenHeader")}>{money(st.taken[p.id])}</td>
        <td class="num {tone(st.net[p.id])}" data-l={t("players.page.table.net")}><b>{signed(st.net[p.id])}</b></td>
      {/snippet}
    </Roster>
    <p class="small muted mt-2">{t(`gameSetup.pot.rules.${s.preset}`)}</p>
    <Settle bind:game {persist} />
  </section>
</div>

<style>
  .events {
    max-height: 300px;
    overflow: auto;
  }
  .events li {
    padding: 2px 0;
  }
</style>

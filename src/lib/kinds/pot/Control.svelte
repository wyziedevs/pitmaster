<script lang="ts">
  // the dealer screen for a pot game: the pot, whose turn it is, everyone's
  // ante for a new round, and what each player puts in or takes out. in-between
  // bets against the pot (win, lose, or hit the post and pay double); guts and
  // bourre have the losers match it. the end sends what's left back out.
  import Icon from "$lib/components/Icon.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import Undo2 from "@lucide/svelte/icons/undo-2";
  import Coins from "@lucide/svelte/icons/coins";
  import type { Game } from "$lib/types";
  import { addPlayer, logEvent, settleUp } from "$lib/game";
  import { money, signed } from "$lib/util";
  import { provide } from "$lib/commands.svelte";
  import { settings } from "$lib/settings.svelte";
  import { play } from "$lib/sound";
  import { bump } from "$lib/motion";
  import Count from "$lib/components/Count.svelte";
  import SettleMoves from "$lib/components/SettleMoves.svelte";
  import Costs from "$lib/components/Costs.svelte";
  import RemoveButton from "$lib/components/RemoveButton.svelte";
  import { matchCost, maxBet, potState } from "./engine";
  import { anteUp, bet, endPot, matchPot, pay, reopenPot, take, takePot, undoPot } from "./actions";
  import { potPreset } from "./presets";
  import { presetName, setupLine } from "./index";
  import { t, tp } from "$lib/i18n";

  let { game = $bindable(), persist }: { game: Game; persist: () => void } = $props();

  const s = $derived(game.pot!);
  const preset = $derived(potPreset(s.preset));
  const st = $derived(potState(game));
  const pname = (id: string | null | undefined) => game.players.find((p) => p.id === id)?.name ?? "";
  const started = $derived(!!game.potEvents?.length);
  const costsOn = $derived(settings.useCosts || !!game.costs?.length);
  const moves = $derived(settleUp(game));
  const cls = (n: number) => (n > 0.001 ? "good" : n < -0.001 ? "bad" : "");

  function act(fn: () => void) {
    fn();
    persist();
  }

  let newName = $state("");
  function add(e: SubmitEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    act(() => addPlayer(game, newName));
    newName = "";
  }
  function removePlayer(id: string) {
    const p = game.players.find((x) => x.id === id)!;
    if (!confirm(t("gamePlay.cash.removeConfirm", { name: p.name }))) return;
    act(() => {
      game.players = game.players.filter((x) => x.id !== id);
      logEvent(game, t("gamePlay.shared.removedLog", { name: p.name }));
    });
  }

  // ---- in-between: whoever's turn it is bets against the pot ----
  let bettor = $state("");
  let amount = $state<number | null>(null);
  $effect(() => {
    if (!bettor || !game.players.some((p) => p.id === bettor)) bettor = st.turn ?? "";
  });
  const cap = $derived(maxBet(s, st.pot));
  function settleBet(result: "win" | "lose" | "post") {
    if (!bettor || !amount) return;
    play(result === "win" ? "chips" : "bust");
    act(() => bet(game, bettor, amount!, result));
    amount = null;
    bettor = "";
  }

  // ---- anything else: someone pays in, or takes out ----
  let who = $state("");
  let other = $state<number | null>(null);
  let matchers = $state<string[]>([]);
  function payIn() {
    if (!who || !other) return;
    play("chips");
    act(() => pay(game, who, other!));
    other = null;
  }
  function takeOut() {
    if (!who || !other) return;
    play("chips");
    act(() => take(game, who, other!));
    other = null;
  }
  function wholePot() {
    if (!who) return;
    play("ship");
    act(() => takePot(game, who));
  }
  function match() {
    if (!matchers.length) return;
    play("bust");
    act(() => matchPot(game, [...matchers]));
    matchers = [];
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
      ...(started ? [{ id: "p:undo", label: t("gamePlay.pot.undo"), group: t("gamePlay.shared.groupThisGame"), keywords: "undo", run: () => (play("rewind"), act(() => undoPot(game))) }] : []),
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
      {#if !game.finished && st.turn}<div class="small muted">{t("gamePlay.pot.turn")}</div><div class="num bb">{pname(st.turn)}</div>{/if}
      {#if !game.finished && s.limit > 0}<div class="small muted">{t("gamePlay.pot.maxBet", { amount: money(cap) })}</div>{/if}
    </div>
  </div>
  <div class="row controls mt-2">
    {#if !game.finished}
      <button class="big" data-sound="none" onclick={ante} disabled={!game.players.length || !(s.ante > 0)}><Icon icon={Coins} />{t("gamePlay.pot.anteButton", { amount: money(s.ante) })}</button>
      <button data-sound="none" onclick={end}>{t("gamePlay.cash.endGame")}</button>
    {:else}
      <span class="pill pop">{t("gamePlay.cash.finishedPill")}</span>
      <button class="link small" data-sound="rewind" onclick={() => act(() => reopenPot(game))}>{t("gamePlay.pot.reopen")}</button>
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
              <select bind:value={bettor}>{#each game.players as p (p.id)}<option value={p.id}>{p.name}</option>{/each}</select>
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
          <h2>{t("gamePlay.pot.matchHeading", { amount: money(matchCost(s, st.pot)) })}</h2>
          <div class="row">
            {#each game.players as p (p.id)}<label class="across m-0"><input type="checkbox" bind:group={matchers} value={p.id} /><span>{p.name}</span></label>{/each}
          </div>
          <button class="mt-2" data-sound="none" disabled={!matchers.length || !(st.pot > 0)} onclick={match}>{t("gamePlay.pot.matchButton")}</button>
        </div>
      {/if}

      <div class="part mt-[22px]">
        <h2>{t("gamePlay.pot.moneyHeading")}</h2>
        <div class="row">
          <label><span>{t("gamePlay.shared.nameHeader")}</span>
            <select bind:value={who}><option value="">…</option>{#each game.players as p (p.id)}<option value={p.id}>{p.name}</option>{/each}</select>
          </label>
          <label><span>{t("gamePlay.pot.amount")}</span><input type="number" min="0" step="any" class="w-[90px]" bind:value={other} /></label>
        </div>
        <div class="row">
          <button data-sound="none" disabled={!who || !other} onclick={payIn}>{t("gamePlay.pot.payIn")}</button>
          <button data-sound="none" disabled={!who || !other} onclick={takeOut}>{t("gamePlay.pot.takeOut")}</button>
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
    <h2>{t("gamePlay.shared.groupPlayers")}</h2>
    <div class="scroll-x">
      <table class="roster">
        <thead><tr><th>{t("gamePlay.shared.nameHeader")}</th><th class="num">{t("gamePlay.pot.paidHeader")}</th><th class="num">{t("gamePlay.pot.takenHeader")}</th><th class="num">{t("players.page.table.net")}</th><th></th></tr></thead>
        <tbody>
          {#each game.players as p (p.id)}
            <tr class:turn={!game.finished && st.turn === p.id}>
              <td class="nowrap who"><input type="text" bind:value={p.name} onchange={persist} class="edit-name" aria-label={t("gamePlay.shared.nameHeader")} /></td>
              <td class="num">{money(st.paid[p.id])}</td>
              <td class="num">{money(st.taken[p.id])}</td>
              <td class="num {cls(st.net[p.id])}"><b>{signed(st.net[p.id])}</b></td>
              <td class="acts">{#if !started}<RemoveButton label={t("gamePlay.shared.removePlayer", { name: p.name })} onclick={() => removePlayer(p.id)} />{/if}</td>
            </tr>
          {:else}
            <tr><td class="empty" colspan="5">{t("gamePlay.tournament.noPlayersYet")}</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
    {#if !game.finished}
      <form autocomplete="off" class="row add mt-2" onsubmit={add}>
        <input type="text" bind:value={newName} placeholder={t("gamePlay.shared.playerNamePlaceholder")} list="regulars" autocomplete="off" aria-label={t("gamePlay.shared.playerNamePlaceholder")} />
        <button data-sound="chips"><Icon icon={Plus} />{t("gamePlay.dice.addPlayer")}</button>
      </form>
    {/if}
    <p class="small muted mt-2">{t(`gameSetup.pot.rules.${s.preset}`)}</p>

    {#if game.finished}
      <div class="part mt-[22px]">
        <h2>{t("gamePlay.shared.settleUp")}</h2>
        {#if moves.length}<SettleMoves bind:game {persist} />{:else}<p class="small muted">{t("gamePlay.shared.square")}</p>{/if}
      </div>
    {/if}
    {#if costsOn}<div class="part mt-[22px]"><Costs bind:game {persist} /></div>{/if}
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
  tr.turn td {
    background: var(--block);
  }
</style>

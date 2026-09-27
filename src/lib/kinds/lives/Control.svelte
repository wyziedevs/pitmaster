<script lang="ts">
  // the dealer screen for a lives game: count the lives each player lost this
  // round (tap once for one, twice for two), and end it. 31 has a shortcut for
  // a 31: everyone else loses one. undo takes a round back.
  import Icon from "$lib/components/Icon.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import Minus from "@lucide/svelte/icons/minus";
  import Trophy from "@lucide/svelte/icons/trophy";
  import type { Game } from "$lib/types";
  import { playerName } from "$lib/events";
  import { money } from "$lib/util";
  import { provide } from "$lib/commands.svelte";
  import { play } from "$lib/sound";
  import { bump } from "$lib/motion";
  import Roster from "../Roster.svelte";
  import RoundList from "../RoundList.svelte";
  import StandingMoney from "../StandingMoney.svelte";
  import PlayerSelect from "../PlayerSelect.svelte";
  import { champOf, netOf, ranked } from "../standing";
  import Life from "./Life.svelte";
  import { livesState } from "./engine";
  import { addLifeRound, roundText, undoLifeRound, wipesOut } from "./actions";
  import { livesPreset } from "./presets";
  import { presetName, stakesLine } from "./index";
  import { t, tp } from "$lib/i18n";

  let { game = $bindable(), persist }: { game: Game; persist: () => void } = $props();

  const l = $derived(game.lives!);
  const preset = $derived(livesPreset(l.preset));
  const st = $derived(livesState(game));
  const started = $derived(!!game.lifeRounds?.length);
  const alivePlayers = $derived(game.players.filter((p) => st.lives[p.id] > 0));
  const perWinner = $derived(l.stakes.mode === "perDie" && l.stakes.perDieTo === "winner");
  const showNet = $derived(game.finished || l.stakes.mode === "perDie");
  // what's riding on it: the buy-in pot, or the pot lives lost have made
  const pool = $derived(l.stakes.mode === "pot" || l.stakes.perDieTo === "pot" ? st.money.pool : null);

  function act(fn: () => void) {
    fn();
    persist();
  }

  // ---- this round: lives lost, by player ----
  let lost = $state<Record<string, number>>({});
  let winner = $state("");
  const any = $derived(Object.values(lost).some((n) => n > 0));
  // the round's winner loses nothing in it, and someone has to be left
  const winners = $derived(alivePlayers.filter((p) => !lost[p.id]));
  const needsWinner = $derived(perWinner && !winners.some((p) => p.id === winner));
  const wipe = $derived(any && wipesOut(game, lost));
  const bump1 = (id: string, d: number) => (lost[id] = Math.max(0, Math.min(st.lives[id], (lost[id] ?? 0) + d)));
  function endRound() {
    if (!any || needsWinner || wipe) return;
    play("bust");
    act(() => addLifeRound(game, { lost: $state.snapshot(lost), winner: winner || undefined, at: Date.now() }));
    lost = {};
    winner = "";
  }
  // 31: whoever gets 31 costs everyone else a life
  let blitz = $state("");
  function thirtyOne() {
    if (!blitz) return;
    play("bust");
    act(() => addLifeRound(game, { lost: Object.fromEntries(st.alive.filter((id) => id !== blitz).map((id) => [id, 1])), winner: blitz, at: Date.now() }));
    blitz = "";
    lost = {};
  }
  function takeBack() {
    play("rewind");
    act(() => undoLifeRound(game));
  }

  $effect(() =>
    provide("lives", () => [
      ...(!game.finished && !perWinner
        ? alivePlayers.map((p) => ({ id: `l:lose:${p.id}`, label: t("gamePlay.lives.cmdLoses", { name: p.name }), group: t("gamePlay.shared.groupPlayers"), keywords: "life lost round", run: () => (play("bust"), act(() => addLifeRound(game, { lost: { [p.id]: 1 }, at: Date.now() }))) }))
        : []),
      ...(started ? [{ id: "l:undo", label: t("gamePlay.dice.takeBack"), group: t("gamePlay.shared.groupThisGame"), keywords: "undo round", run: takeBack }] : []),
    ])
  );
</script>

<section class="clockbox">
  <div class="spread">
    <div>
      <div class="lvl">{game.finished ? t("gamePlay.dice.over") : t("gamePlay.dice.roundN", { n: String((game.lifeRounds?.length ?? 0) + 1) })}</div>
      <div class="clockface num" use:bump={st.alive.length}>{st.alive.length}</div>
      <div class="small muted">{tp("gamePlay.lives.stillIn", st.alive.length)} · {presetName(game)} · {tp("gamePlay.lives.livesEach", l.lives)}</div>
    </div>
    <div class="blinds text-right max-[600px]:text-left">
      {#if pool !== null}<div class="small muted">{t("gamePlay.pot.potLabel")}</div><div class="bb" use:bump={pool}>{money(pool)}</div>{/if}
      <div class="small muted">{stakesLine(game)}</div>
    </div>
  </div>
  <p class="small muted mt-2 mb-0">{t(`gameSetup.lives.rules.${l.preset}`)}</p>
</section>

{#if game.finished}
  <div class="warn pop won my-[14px]"><p class="m-0"><Icon icon={Trophy} /> <b>{champOf(game, st)?.name ?? "?"}</b> {t("gamePlay.tournament.winnerSuffix")}</p></div>
{/if}

<div class="cols">
  <section>
    <Roster bind:game {persist} players={ranked(game, st)} adding={!started} removing={!started} place={(id) => st.places[id]} dim={(id) => st.lives[id] === 0} net={showNet ? (id) => netOf(st, id) : undefined}>
      {#snippet head()}
        <th>{t("gamePlay.lives.livesHeader")}</th>
        {#if !game.finished}<th class="num">{t("gamePlay.lives.thisRound")}</th>{/if}
      {/snippet}
      {#snippet row(p)}
        {@const left = st.lives[p.id]}
        <td data-l={t("gamePlay.lives.livesHeader")}><span class="inline-flex gap-[3px] flex-wrap items-center" title={tp("gamePlay.lives.livesLeft", left)}>{#each Array.from({ length: Math.min(l.lives, 12) }) as _, i (i)}<Life token={preset.token} size="16px" dim={i >= left} />{/each}{#if l.lives > 12}<span class="num small ml-1">{left}</span>{/if}</span></td>
        {#if !game.finished}
          <td class="num nowrap" class:blank={left === 0} data-l={t("gamePlay.lives.thisRound")}>
            {#if left > 0}
              <button class="link" data-sound="rewind" onclick={() => bump1(p.id, -1)} disabled={!lost[p.id]} aria-label={t("gamePlay.lives.lessAria", { name: p.name })}><Icon icon={Minus} size="1em" /></button>
              <b class:bad={!!lost[p.id]}>{lost[p.id] ? `−${lost[p.id]}` : "0"}</b>
              <button class="link" data-sound="tap" onclick={() => bump1(p.id, 1)} disabled={(lost[p.id] ?? 0) >= left} aria-label={t("gamePlay.lives.moreAria", { name: p.name })}><Icon icon={Plus} size="1em" /></button>
            {/if}
          </td>
        {/if}
      {/snippet}
    </Roster>

    {#if !game.finished && st.alive.length > 1}
      <div class="part mt-[22px]">
        <h2>{t("gamePlay.dice.roundHeading", { n: String((game.lifeRounds?.length ?? 0) + 1) })}</h2>
        <p class="small muted mt-0">{t(`gamePlay.lives.hint.${l.preset}`)}</p>
        <div class="row">
          {#if perWinner}
            <label class="across m-0"><span>{t("gamePlay.dice.wonBy")}</span>
              <PlayerSelect bind:value={winner} players={winners} />
            </label>
          {/if}
          <button data-sound="none" disabled={!any || needsWinner || wipe} onclick={endRound}>{t("gamePlay.lives.endRound")}</button>
        </div>
        {#if wipe}<p class="warn small">{t("gamePlay.lives.everyoneOut")}</p>{/if}
        {#if preset.knock}
          <div class="row small mt-2">
            <span class="muted">{t("gamePlay.lives.thirtyOneBy")}</span>
            <PlayerSelect bind:value={blitz} players={alivePlayers} label={t("gamePlay.lives.thirtyOneBy")} />
            <button data-sound="none" disabled={!blitz} onclick={thirtyOne}>{t("gamePlay.lives.thirtyOneButton")}</button>
          </div>
        {/if}
      </div>
    {/if}

    <RoundList lines={(game.lifeRounds ?? []).map((r) => roundText(game, r) + (r.winner ? ` · ${t("gamePlay.lives.wonBy", { name: playerName(game, r.winner) })}` : ""))} ontakeback={takeBack} />
  </section>

  <section>
    <StandingMoney bind:game {persist} {st} stakes={l.stakes} line={stakesLine(game)} />
  </section>
</div>

<script lang="ts">
  // the dealer screen for a lives game: count the lives each player lost this
  // round (tap once for one, twice for two), and end it. 31 has a shortcut for
  // a 31: everyone else loses one. undo takes a round back.
  import Icon from "$lib/components/Icon.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import Minus from "@lucide/svelte/icons/minus";
  import Undo2 from "@lucide/svelte/icons/undo-2";
  import Trophy from "@lucide/svelte/icons/trophy";
  import type { Game } from "$lib/types";
  import { addPlayer, logEvent, settleUp, HOUSE } from "$lib/game";
  import { money, ordinal, round2, signed } from "$lib/util";
  import { provide } from "$lib/commands.svelte";
  import { settings } from "$lib/settings.svelte";
  import { play } from "$lib/sound";
  import { bump } from "$lib/motion";
  import SettleMoves from "$lib/components/SettleMoves.svelte";
  import Costs from "$lib/components/Costs.svelte";
  import RemoveButton from "$lib/components/RemoveButton.svelte";
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
  const pname = (id: string | undefined) => game.players.find((p) => p.id === id)?.name ?? "?";
  const alivePlayers = $derived(game.players.filter((p) => st.lives[p.id] > 0));
  const ranked = $derived([...game.players].sort((a, b) => (st.places[a.id] ?? 0) - (st.places[b.id] ?? 0) || st.lives[b.id] - st.lives[a.id]));
  const costsOn = $derived(settings.useCosts || !!game.costs?.length);
  const moves = $derived(settleUp(game));
  const perWinner = $derived(l.stakes.mode === "perDie" && l.stakes.perDieTo === "winner");

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

  const net = (id: string) => round2((st.money.won[id] ?? 0) - (st.money.paid[id] ?? 0));
  const cls = (n: number) => (n > 0.001 ? "good" : n < -0.001 ? "bad" : "");
  const showNet = $derived(game.finished || l.stakes.mode === "perDie");
  // what's riding on it: the buy-in pot, or the pot lives lost have made
  const pool = $derived(l.stakes.mode === "pot" || l.stakes.perDieTo === "pot" ? st.money.pool : null);

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
  <div class="warn pop won my-[14px]"><p class="m-0"><Icon icon={Trophy} /> <b>{pname(game.players.find((p) => st.places[p.id] === 1)?.id)}</b> {t("gamePlay.tournament.winnerSuffix")}</p></div>
{/if}

<div class="cols">
  <section>
    <h2>{t("gamePlay.shared.groupPlayers")}</h2>
    <div class="scroll-x">
      <table class="roster">
        <thead>
          <tr>
            <th>{t("gamePlay.shared.nameHeader")}</th>
            <th>{t("gamePlay.lives.livesHeader")}</th>
            {#if !game.finished}<th class="num">{t("gamePlay.lives.thisRound")}</th>{/if}
            {#if showNet}<th class="num">{t("players.page.table.net")}</th>{/if}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each ranked as p (p.id)}
            {@const left = st.lives[p.id]}
            <tr class:dim={left === 0}>
              <td class="nowrap who">
                {#if st.places[p.id]}<span class="num place inline-block min-w-[2.2em] text-muted">{ordinal(st.places[p.id]!)}</span>{/if}
                <input type="text" bind:value={p.name} onchange={persist} class="edit-name" aria-label={t("gamePlay.shared.nameHeader")} />
              </td>
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
              {#if showNet}<td class="num {cls(net(p.id))}" data-l={t("players.page.table.net")}>{signed(net(p.id))}</td>{/if}
              <td class="acts">{#if !started}<RemoveButton label={t("gamePlay.shared.removePlayer", { name: p.name })} onclick={() => removePlayer(p.id)} />{/if}</td>
            </tr>
          {:else}
            <tr><td class="empty" colspan="5">{t("gamePlay.tournament.noPlayersYet")}</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
    {#if !started}
      <form autocomplete="off" class="row add mt-2" onsubmit={add}>
        <input type="text" bind:value={newName} placeholder={t("gamePlay.shared.playerNamePlaceholder")} list="regulars" autocomplete="off" aria-label={t("gamePlay.shared.playerNamePlaceholder")} />
        <button data-sound="chips"><Icon icon={Plus} />{t("gamePlay.dice.addPlayer")}</button>
      </form>
    {/if}

    {#if !game.finished && st.alive.length > 1}
      <div class="part mt-[22px]">
        <h2>{t("gamePlay.dice.roundHeading", { n: String((game.lifeRounds?.length ?? 0) + 1) })}</h2>
        <p class="small muted mt-0">{t(`gamePlay.lives.hint.${l.preset}`)}</p>
        <div class="row">
          {#if perWinner}
            <label class="across m-0"><span>{t("gamePlay.dice.wonBy")}</span>
              <select bind:value={winner}>
                <option value="">…</option>
                {#each winners as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
              </select>
            </label>
          {/if}
          <button data-sound="none" disabled={!any || needsWinner || wipe} onclick={endRound}>{t("gamePlay.lives.endRound")}</button>
        </div>
        {#if wipe}<p class="warn small">{t("gamePlay.lives.everyoneOut")}</p>{/if}
        {#if preset.knock}
          <div class="row small mt-2">
            <span class="muted">{t("gamePlay.lives.thirtyOneBy")}</span>
            <select bind:value={blitz} aria-label={t("gamePlay.lives.thirtyOneBy")}>
              <option value="">…</option>
              {#each alivePlayers as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
            </select>
            <button data-sound="none" disabled={!blitz} onclick={thirtyOne}>{t("gamePlay.lives.thirtyOneButton")}</button>
          </div>
        {/if}
      </div>
    {/if}

    {#if started}
      <div class="part mt-[22px]">
        <div class="spread">
          <h2>{t("gamePlay.dice.roundsHeading")}</h2>
          <button class="link small" data-sound="none" onclick={takeBack}><Icon icon={Undo2} size="1em" />{t("gamePlay.dice.takeBack")}</button>
        </div>
        <ol class="small rounds" reversed>
          {#each [...(game.lifeRounds ?? [])].reverse() as r, i (r.at + ":" + i)}<li>{roundText(game, r)}{#if r.winner}{` · ${t("gamePlay.lives.wonBy", { name: pname(r.winner) })}`}{/if}</li>{/each}
        </ol>
      </div>
    {/if}
  </section>

  <section>
    <h2>{t("gamePlay.dice.moneyHeading")}</h2>
    <p class="small">{stakesLine(game)}</p>
    {#if l.stakes.mode === "pot"}
      <table>
        <tbody>
          {#each st.money.payouts as p, i (i)}
            {@const who = game.players.filter((x) => st.places[x.id] === i + 1)}
            <tr><td>{ordinal(i + 1)}</td><td class="num"><b>{money(p)}</b></td><td>{who.map((x) => x.name).join(", ")}</td></tr>
          {/each}
        </tbody>
      </table>
    {:else if l.stakes.perDieTo === "pot"}
      <p class="small">{t("gamePlay.dice.potSoFar", { amount: money(st.money.pool) })}</p>
    {/if}
    {#if moves.length || game.finished}
      <div class="part mt-[22px]">
        <h2>{t("gamePlay.shared.settleUp")}</h2>
        {#if moves.length}
          <SettleMoves bind:game {persist} />
          {#if l.stakes.mode === "pot"}<p class="small muted">{t("gamePlay.shared.tourneySettleNote", { house: game.house?.trim() || HOUSE() })}</p>{/if}
        {:else}
          <p class="small muted">{t("gamePlay.shared.square")}</p>
        {/if}
      </div>
    {/if}
    {#if costsOn}<div class="part mt-[22px]"><Costs bind:game {persist} /></div>{/if}
  </section>
</div>

<style>
  .rounds {
    margin: 0;
    padding-inline-start: 2em;
    max-height: 320px;
    overflow: auto;
  }
  .rounds li {
    padding: 2px 0;
  }
</style>

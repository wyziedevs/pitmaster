<script lang="ts">
  // the dealer screen for liar's dice. a round goes in one of two ways:
  // quick (tap who lost a die) or full (the bid, who called it and how many
  // there really were, and PitMaster works out who loses). undo takes either back.
  import Icon from "$lib/components/Icon.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import Undo2 from "@lucide/svelte/icons/undo-2";
  import Trophy from "@lucide/svelte/icons/trophy";
  import Megaphone from "@lucide/svelte/icons/megaphone";
  import Smartphone from "@lucide/svelte/icons/smartphone";
  import Check from "@lucide/svelte/icons/check";
  import QrCode from "$lib/components/QrCode.svelte";
  import CopyButton from "$lib/components/CopyButton.svelte";
  import { registerSeats, watchSeats } from "$lib/sync";
  import { callForReveal, countCall, nextRound, seatAll, seatHashes, startCups, stopCups, takeMail, toRealDice } from "./host";
  import { waitingOn } from "./cups";
  import type { DiceRound, Game } from "$lib/types";
  import { addPlayer } from "$lib/game";
  import { logEvent, houseName, playerName } from "$lib/events";
  import { settleUp } from "$lib/settle";
  import { money, ordinal, round2, signed } from "$lib/util";
  import { provide } from "$lib/commands.svelte";
  import { settings } from "$lib/settings.svelte";
  import { play } from "$lib/sound";
  import { reveal, slide, bump } from "$lib/motion";
  import Seg from "$lib/components/Seg.svelte";
  import Die from "$lib/components/Die.svelte";
  import SettleMoves from "$lib/components/SettleMoves.svelte";
  import Costs from "$lib/components/Costs.svelte";
  import RemoveButton from "$lib/components/RemoveButton.svelte";
  import { diceState, expected, judge } from "./engine";
  import { addRound, roundText, undoRound } from "./actions";
  import { rulesLine, stakesLine } from "./index";
  import { t, tp } from "$lib/i18n";

  let { game = $bindable(), persist }: { game: Game; persist: () => void } = $props();

  const d = $derived(game.dice!);
  const st = $derived(diceState(game));
  const started = $derived(!!game.rounds?.length);
  const alivePlayers = $derived(game.players.filter((p) => st.lives[p.id] > 0));
  const ranked = $derived(
    [...game.players].sort((a, b) => (st.places[a.id] ?? 0) - (st.places[b.id] ?? 0) || st.lives[b.id] - st.lives[a.id])
  );
  const costsOn = $derived(settings.useCosts || !!game.costs?.length);
  const moves = $derived(settleUp(game));
  const perWinner = $derived(d.stakes.mode === "perDie" && d.stakes.perDieTo === "winner");

  function act(fn: () => void) {
    fn();
    persist();
  }

  // ---- players, before the first round ----
  let newName = $state("");
  function add(e: SubmitEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    act(() => seatNew(addPlayer(game, newName)));
    newName = "";
  }
  // a player added with the phones on gets a seat of their own too
  function seatNew<T>(x: T) {
    if (game.cups?.on) game.cups = { ...game.cups, seats: seatAll(game) };
    return x;
  }
  function removePlayer(id: string) {
    const p = game.players.find((x) => x.id === id)!;
    if (!confirm(t("gamePlay.cash.removeConfirm", { name: p.name }))) return;
    act(() => {
      game.players = game.players.filter((x) => x.id !== id);
      logEvent(game, t("gamePlay.shared.removedLog", { name: p.name }));
    });
  }

  // ---- a round ----
  const setEntry = (v: "quick" | "full") => act(() => (game.dice!.entry = v));
  function commit(r: Omit<DiceRound, "at">) {
    play(r.losers.length ? "bust" : "chips");
    act(() => {
      addRound(game, { ...r, at: Date.now() });
      // a round typed in with the phones on (from Commands): they roll again
      nextRound(game);
    });
    reset();
  }

  // quick: tap who lost; with money going to whoever won the call, say who that was
  let quickLoser = $state<string | null>(null);
  let quickWinner = $state("");
  function tapLoser(id: string) {
    if (!perWinner) return commit({ losers: [id] });
    quickLoser = quickLoser === id ? null : id;
  }
  function quickCommit() {
    if (!quickLoser || !quickWinner) return;
    commit({ losers: [quickLoser], winner: quickWinner });
  }
  // spot on for everyone else, in quick mode: the caller keeps theirs
  let quickSpot = $state("");
  function quickSpotOn() {
    if (!quickSpot) return;
    if (d.spotOn === "gain") return commit({ losers: [], gains: [quickSpot], winner: quickSpot });
    commit({ losers: st.alive.filter((id) => id !== quickSpot), winner: quickSpot });
  }

  // full: the bid, who made it, who called it and how, and how many there were
  let count = $state<number | null>(null);
  let face = $state(2);
  let bidder = $state("");
  let caller = $state("");
  let call = $state<"liar" | "spot">("liar");
  let actual = $state<number | null>(null);
  const ready = $derived(!!count && count > 0 && !!bidder && !!caller && bidder !== caller && actual !== null && actual >= 0);
  const outcome = $derived(ready ? judge(d, { bid: { count: count!, face }, bidder, caller, call, actual: actual! }, st.alive) : null);
  function fullCommit(e: SubmitEvent) {
    e.preventDefault();
    if (!ready || !outcome) return;
    commit({ bid: { count: count!, face }, bidder, caller, call, actual: actual!, ...outcome });
  }
  function reset() {
    quickLoser = null;
    quickWinner = "";
    quickSpot = "";
    count = null;
    actual = null;
    bidder = "";
    caller = "";
    call = "liar";
  }

  // the round starts with whoever lost the last one: they bid first
  $effect(() => {
    if (!bidder && st.starter && d.entry === "full") bidder = st.starter;
  });

  function takeBack() {
    play("rewind");
    act(() => {
      undoRound(game);
      // the dice left changed: with phones, everyone rolls again
      nextRound(game);
    });
  }

  // ---- phones as dice cups ----
  const cups = $derived(game.cups?.on ? game.cups : null);
  const waiting = $derived(cups ? waitingOn(game, st.alive) : []);
  const cupLink = (pid: string) => (game.live && game.cups && game.cupKeys?.[pid] ? `${location.origin}/cup#${game.live.code}.${game.cups.seats[pid]}.${game.cupKeys[pid]}` : "");
  // the relay learns each seat's key hash once, whenever the seats change
  // (tried again in a few seconds when the relay can't be reached)
  let registered = "";
  let retry = $state(0);
  $effect(() => {
    void retry;
    const live = game.live;
    if (!live || !cups) return;
    const snap = $state.snapshot(game) as Game;
    const key = `${live.code}|${JSON.stringify(snap.cups?.seats)}`;
    if (key === registered) return;
    registered = key;
    let again: ReturnType<typeof setTimeout> | undefined;
    seatHashes(snap)
      .then((h) => registerSeats(live, h))
      .then((ok) => {
        if (ok || registered !== key) return;
        registered = "";
        again = setTimeout(() => retry++, 5000);
      });
    return () => clearTimeout(again);
  });
  // each phone's mailbox, as it's written: a hash, then (on a call) its numbers
  $effect(() => {
    const code = game.live?.code;
    if (!code || !game.cups?.on) return;
    return watchSeats(code, async (seat, text) => {
      if (!(await takeMail(game, seat, text))) return;
      // every cup shown (and nobody on real dice): count it right away
      const c = game.cups;
      if (c?.phase === "reveal" && !waitingOn(game, diceState(game).alive).length && !c.real?.length) {
        countCall(game);
        reset();
      }
      persist();
    });
  });
  function phonesOn() {
    play("riffle");
    act(() => startCups(game));
    setEntry("full");
  }
  function phonesOff() {
    if (!confirm(t("gamePlay.dice.cups.offConfirm"))) return;
    act(() => stopCups(game));
  }
  // a call with phones: the bid and who called it, then the phones show and PitMaster counts
  function phoneCall(e: SubmitEvent) {
    e.preventDefault();
    if (!count || !bidder || !caller || bidder === caller || game.cups?.phase !== "play") return;
    play("bust");
    act(() => callForReveal(game, { bid: { count: count!, face }, bidder, caller, call }));
  }
  let realCounts = $state<Record<string, number | null>>({});
  // everyone on real dice has a count typed in
  const realReady = $derived((cups?.real ?? []).every((id) => !st.alive.includes(id) || (typeof realCounts[id] === "number" && realCounts[id]! >= 0)));
  function countNow() {
    play("chips");
    act(() => countCall(game, $state.snapshot(realCounts) as Record<string, number>));
    realCounts = {};
    reset();
  }

  const net = (id: string) => round2((st.money.won[id] ?? 0) - (st.money.paid[id] ?? 0));
  const cls = (n: number) => (n > 0.001 ? "good" : n < -0.001 ? "bad" : "");
  const showNet = $derived(game.finished || d.stakes.mode === "perDie");

  // the palette knows this game while it's on screen
  $effect(() =>
    provide("dice", () => [
      ...(!game.finished
        ? alivePlayers.map((p) => ({ id: `d:lose:${p.id}`, label: t("gamePlay.dice.cmdLoses", { name: p.name }), group: t("gamePlay.shared.groupPlayers"), keywords: "liar dice lost", run: () => tapLoser(p.id) }))
        : []),
      ...(started ? [{ id: "d:undo", label: t("gamePlay.dice.takeBack"), group: t("gamePlay.shared.groupThisGame"), keywords: "undo round", run: takeBack }] : []),
      ...(!started ? [{ id: "d:add", label: t("gamePlay.tournament.cmdAddPlayer"), group: t("gamePlay.shared.groupThisGame"), keywords: "register seat", prompt: t("gamePlay.tournament.cmdAddPlayerPrompt"), run: (n: string) => (play("chips"), act(() => seatNew(addPlayer(game, n)))) }] : []),
    ])
  );
</script>

<section class="clockbox">
  <div class="spread">
    <div>
      <div class="lvl">{game.finished ? t("gamePlay.dice.over") : t("gamePlay.dice.roundN", { n: String((game.rounds?.length ?? 0) + 1) })}</div>
      <div class="clockface num" use:bump={st.total}>{st.total}</div>
      <div class="small muted">{tp("gamePlay.dice.diceOnTable", st.total)} · {tp("toys.summary.players", st.alive.length)}</div>
    </div>
    <div class="blinds text-right max-[600px]:text-left">
      <div class="small muted">{t("gamePlay.dice.expected")}</div>
      <div class="num bb">{Math.round(expected(st.total, 2, st.wild) * 10) / 10}</div>
      <div class="small muted">{st.wild ? t("gamePlay.dice.expectedWild", { ones: String(Math.round(expected(st.total, 1, true) * 10) / 10) }) : t("gamePlay.dice.expectedPlain")}</div>
    </div>
  </div>
  <p class="small muted mt-2 mb-0">{rulesLine(d)} · {stakesLine(game)}</p>
</section>

{#if st.palifico && !game.finished}
  <div class="warn pop my-[14px]" transition:slide={reveal()}><Icon icon={Megaphone} /> {t("gamePlay.dice.palificoBanner", { name: playerName(game, st.palifico) })}</div>
{/if}

{#if game.finished}
  <div class="warn pop won my-[14px]"><p class="m-0"><Icon icon={Trophy} /> <b>{playerName(game, game.players.find((p) => st.places[p.id] === 1)?.id)}</b> {t("gamePlay.tournament.winnerSuffix")}</p></div>
{/if}

<div class="cols">
  <section>
    <h2>{t("gamePlay.shared.groupPlayers")}</h2>
    <div class="scroll-x">
      <table class="roster">
        <thead>
          <tr>
            <th>{t("gamePlay.shared.nameHeader")}</th>
            <th>{t("gamePlay.dice.diceHeader")}</th>
            {#if showNet}<th class="num">{t("players.page.table.net")}</th>{/if}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each ranked as p (p.id)}
            {@const lives = st.lives[p.id]}
            <tr class:dim={lives === 0}>
              <td class="nowrap who">
                {#if st.places[p.id]}<span class="num place inline-block min-w-[2.2em] text-muted">{ordinal(st.places[p.id]!)}</span>{/if}
                <input type="text" bind:value={p.name} onchange={persist} class="edit-name" aria-label={t("gamePlay.shared.nameHeader")} />
                {#if st.starter === p.id && !game.finished}<span class="pill">{t("gamePlay.dice.starts")}</span>{/if}
              </td>
              <td data-l={t("gamePlay.dice.diceHeader")}><span class="inline-flex gap-[3px] flex-wrap" title={tp("gamePlay.dice.diceLeft", lives)}>{#each Array.from({ length: d.dice }) as _, i (i)}<Die size="16px" dim={i >= lives} />{/each}</span></td>
              {#if showNet}<td class="num {cls(net(p.id))}" data-l={t("players.page.table.net")}>{signed(net(p.id))}</td>{/if}
              <td class="acts">{#if !started}<RemoveButton label={t("gamePlay.shared.removePlayer", { name: p.name })} onclick={() => removePlayer(p.id)} />{/if}</td>
            </tr>
          {:else}
            <tr><td class="empty" colspan="4">{t("gamePlay.tournament.noPlayersYet")}</td></tr>
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
        <div class="spread">
          <h2>{t("gamePlay.dice.roundHeading", { n: String((game.rounds?.length ?? 0) + 1) })}</h2>
          {#if !cups}<Seg value={d.entry} options={[{ id: "full", label: t("gameSetup.dice.entryFull") }, { id: "quick", label: t("gameSetup.dice.entryQuick") }]} onpick={setEntry} labelledby="entry-l" />{/if}
          <span id="entry-l" class="sr-only">{t("gameSetup.dice.entryLegend")}</span>
        </div>

        {#if cups}
          {#if cups.phase === "commit"}
            <p class="small mt-0"><Icon icon={Smartphone} size="1em" /> {waiting.length ? t("gamePlay.dice.cups.rolling", { names: waiting.map((id) => playerName(game, id)).join(", ") }) : t("gamePlay.dice.cups.dealing")}</p>
          {:else if cups.phase === "play"}
            <p class="small mt-0"><Icon icon={Smartphone} size="1em" /> {t("gamePlay.dice.cups.bidAway")}</p>
          {/if}
          {#if cups.phase !== "reveal"}
            <form autocomplete="off" onsubmit={phoneCall}>
              <div class="row">
                <label><span>{t("gamePlay.dice.bid")}</span><input type="number" min="1" step="1" class="w-[80px]" bind:value={count} /></label>
                <div>
                  <span class="block small muted mb-1">{t("gamePlay.dice.face")}</span>
                  <span class="inline-flex gap-1" role="radiogroup" aria-label={t("gamePlay.dice.face")}>
                    {#each [1, 2, 3, 4, 5, 6] as f (f)}<button type="button" class="facebtn" class:on={face === f} aria-pressed={face === f} data-sound="tap" onclick={() => (face = f)}><Die value={f} size="26px" label={String(f)} /></button>{/each}
                  </span>
                </div>
              </div>
              <div class="row">
                <label><span>{t("gamePlay.dice.bidBy")}</span>
                  <select bind:value={bidder}><option value="">…</option>{#each alivePlayers as p (p.id)}<option value={p.id}>{p.name}</option>{/each}</select>
                </label>
                <label><span>{t("gamePlay.dice.calledBy")}</span>
                  <select bind:value={caller}><option value="">…</option>{#each alivePlayers.filter((p) => p.id !== bidder) as p (p.id)}<option value={p.id}>{p.name}</option>{/each}</select>
                </label>
                {#if d.spotOn !== "off"}
                  <label><span>{t("gamePlay.dice.call")}</span>
                    <select bind:value={call}><option value="liar">{t("gamePlay.dice.callLiar")}</option><option value="spot">{t("gamePlay.dice.callSpot")}</option></select>
                  </label>
                {/if}
              </div>
              <button data-sound="none" disabled={!count || !bidder || !caller || cups.phase !== "play"}>{call === "liar" ? t("gamePlay.dice.callLiarButton") : t("gamePlay.dice.callSpotButton")}</button>
            </form>
          {:else}
            <p class="small mt-0"><Icon icon={Smartphone} size="1em" /> {waiting.length ? t("gamePlay.dice.cups.showing", { names: waiting.map((id) => playerName(game, id)).join(", ") }) : t("gamePlay.dice.cups.allShown")}</p>
            {#if cups.real?.length}
              <div class="row">
                {#each cups.real as id (id)}
                  <label><span>{t("gamePlay.dice.cups.realCount", { name: playerName(game, id), faces: t(`gamePlay.dice.faceNames.f${cups.call?.bid.face ?? 2}`) })}</span><input type="number" min="0" step="1" class="w-[80px]" bind:value={realCounts[id]} /></label>
                {/each}
              </div>
            {/if}
            <button data-sound="none" disabled={waiting.length > 0 || !realReady} onclick={countNow}>{t("gamePlay.dice.cups.countNow")}</button>
          {/if}
          {#if waiting.length}
            <p class="small links mt-2">
              <span class="muted">{t("gamePlay.dice.cups.dropped")}</span>
              {#each waiting as id (id)}<button class="link" data-sound="tap" onclick={() => act(() => toRealDice(game, id))}>{t("gamePlay.dice.cups.toReal", { name: playerName(game, id) })}</button>{/each}
            </p>
          {/if}
        {:else if d.entry === "quick"}
          <p class="small muted mt-0">{perWinner ? t("gamePlay.dice.quickHintWinner") : t("gamePlay.dice.quickHint")}</p>
          <div class="row">
            {#each alivePlayers as p (p.id)}<button class:on={quickLoser === p.id} aria-pressed={quickLoser === p.id} data-sound={perWinner ? "tap" : "none"} onclick={() => tapLoser(p.id)}>{p.name}</button>{/each}
          </div>
          {#if perWinner && quickLoser}
            <div class="row mt-2" transition:slide={reveal()}>
              <label class="across m-0"><span>{t("gamePlay.dice.wonBy")}</span>
                <select bind:value={quickWinner}>
                  <option value="">…</option>
                  {#each alivePlayers.filter((p) => p.id !== quickLoser) as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
                </select>
              </label>
              <button data-sound="none" disabled={!quickWinner} onclick={quickCommit}>{tp("gamePlay.dice.losesDie", 1, { names: playerName(game, quickLoser) })}</button>
            </div>
          {/if}
          {#if d.spotOn !== "off"}
            <div class="row small mt-2">
              <span class="muted">{t("gamePlay.dice.spotOnBy")}</span>
              <select bind:value={quickSpot} aria-label={t("gamePlay.dice.spotOnBy")}>
                <option value="">…</option>
                {#each alivePlayers as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
              </select>
              <button data-sound="none" disabled={!quickSpot} onclick={quickSpotOn}>{d.spotOn === "gain" ? t("gamePlay.dice.spotGainButton") : t("gamePlay.dice.spotOthersButton")}</button>
            </div>
          {/if}
        {:else}
          <form autocomplete="off" onsubmit={fullCommit}>
            <div class="row">
              <label><span>{t("gamePlay.dice.bid")}</span><input type="number" min="1" step="1" class="w-[80px]" bind:value={count} /></label>
              <div>
                <span class="block small muted mb-1">{t("gamePlay.dice.face")}</span>
                <span class="inline-flex gap-1" role="radiogroup" aria-label={t("gamePlay.dice.face")}>
                  {#each [1, 2, 3, 4, 5, 6] as f (f)}<button type="button" class="facebtn" class:on={face === f} aria-pressed={face === f} data-sound="tap" onclick={() => (face = f)}><Die value={f} size="26px" label={String(f)} /></button>{/each}
                </span>
              </div>
            </div>
            <div class="row">
              <label><span>{t("gamePlay.dice.bidBy")}</span>
                <select bind:value={bidder}><option value="">…</option>{#each alivePlayers as p (p.id)}<option value={p.id}>{p.name}</option>{/each}</select>
              </label>
              <label><span>{t("gamePlay.dice.calledBy")}</span>
                <select bind:value={caller}><option value="">…</option>{#each alivePlayers.filter((p) => p.id !== bidder) as p (p.id)}<option value={p.id}>{p.name}</option>{/each}</select>
              </label>
              {#if d.spotOn !== "off"}
                <label><span>{t("gamePlay.dice.call")}</span>
                  <select bind:value={call}><option value="liar">{t("gamePlay.dice.callLiar")}</option><option value="spot">{t("gamePlay.dice.callSpot")}</option></select>
                </label>
              {/if}
              <label><span>{t("gamePlay.dice.thereWere", { faces: t(`gamePlay.dice.faceNames.f${face}`) })}</span><input type="number" min="0" step="1" class="w-[80px]" bind:value={actual} /></label>
            </div>
            {#if outcome}
              <p class="small" transition:slide={reveal()}>{roundText(game, { bid: { count: count!, face }, bidder, caller, call, actual: actual!, ...outcome, at: 0 })}</p>
            {/if}
            <button data-sound="none" disabled={!ready}>{call === "liar" ? t("gamePlay.dice.callLiarButton") : t("gamePlay.dice.callSpotButton")}</button>
          </form>
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
          {#each [...(game.rounds ?? [])].reverse() as r, i (r.at + ":" + i)}<li>{roundText(game, r)}</li>{/each}
        </ol>
      </div>
    {/if}
  </section>

  <section>
    {#if !game.finished}
      <div class="mb-[22px]">
        <h2><Icon icon={Smartphone} size="1em" /> {t("gamePlay.dice.cups.heading")}</h2>
        {#if !cups}
          <p class="small muted mt-0">{t("gamePlay.dice.cups.intro")}</p>
          {#if game.live}<button data-sound="none" onclick={phonesOn}>{t("gamePlay.dice.cups.turnOn")}</button>
          {:else}<p class="small">{t("gamePlay.dice.cups.goLiveFirst")}</p>{/if}
        {:else}
          <p class="small muted mt-0">{t("gamePlay.dice.cups.scan")}</p>
          <div class="seats">
            {#each alivePlayers as p (p.id)}
              {@const link = cupLink(p.id)}
              <div class="seat">
                <b>{p.name}{#if cups.commits?.[p.id] || cups.shown?.[p.id]} <span class="good"><Icon icon={Check} size="1em" /></span>{/if}</b>
                {#if link}<QrCode text={link} label={t("gamePlay.dice.cups.qrLabel", { name: p.name })} size="112px" />{/if}
                {#if link}<CopyButton text={() => link} link icon={false} label={t("gamePlay.dice.cups.copyLink")} />{/if}
              </div>
            {/each}
          </div>
          <p class="small links"><button class="link muted" data-sound="off" onclick={phonesOff}>{t("gamePlay.dice.cups.turnOff")}</button></p>
        {/if}
      </div>
    {/if}
    <h2>{t("gamePlay.dice.moneyHeading")}</h2>
    {#if d.stakes.mode === "pot"}
      <p class="small">{stakesLine(game)}</p>
      <table>
        <tbody>
          {#each st.money.payouts as p, i (i)}
            {@const who = game.players.filter((x) => st.places[x.id] === i + 1)}
            <tr><td>{ordinal(i + 1)}</td><td class="num"><b>{money(p)}</b></td><td>{who.map((x) => x.name).join(", ")}</td></tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p class="small">{stakesLine(game)}</p>
      {#if d.stakes.perDieTo === "pot"}<p class="small">{t("gamePlay.dice.potSoFar", { amount: money(st.money.pool) })}</p>{/if}
    {/if}

    {#if moves.length || game.finished}
      <div class="part mt-[22px]">
        <h2>{t("gamePlay.shared.settleUp")}</h2>
        {#if moves.length}
          <SettleMoves bind:game {persist} />
          {#if d.stakes.mode === "pot"}<p class="small muted">{t("gamePlay.shared.tourneySettleNote", { house: houseName(game) })}</p>{/if}
        {:else}
          <p class="small muted">{t("gamePlay.shared.square")}</p>
        {/if}
      </div>
    {/if}
    {#if costsOn}<div class="part mt-[22px]"><Costs bind:game {persist} /></div>{/if}
  </section>
</div>

<style>
  .facebtn {
    padding: 2px;
    height: auto;
    border-color: transparent;
    background: transparent;
  }
  .facebtn.on {
    border-color: var(--fg);
    background: var(--block);
  }
  .row button.on {
    border-color: var(--fg);
    background: var(--block-2);
  }
  .rounds {
    margin: 0;
    padding-inline-start: 2em;
    max-height: 320px;
    overflow: auto;
  }
  .rounds li {
    padding: 2px 0;
  }
  .seats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
    gap: 14px;
  }
  .seat {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
</style>

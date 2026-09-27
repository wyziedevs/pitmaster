<script lang="ts">
  // the dealer screen for liar's dice. a round goes in one of two ways:
  // quick (tap who lost a die) or full (the bid, who called it and how many
  // there really were, and PitMaster works out who loses). undo takes either back.
  import Icon from "$lib/components/Icon.svelte";
  import Trophy from "@lucide/svelte/icons/trophy";
  import Megaphone from "@lucide/svelte/icons/megaphone";
  import Smartphone from "@lucide/svelte/icons/smartphone";
  import Check from "@lucide/svelte/icons/check";
  import QrCode from "$lib/components/QrCode.svelte";
  import CopyButton from "$lib/components/CopyButton.svelte";
  import { registerSeats, watchSeats } from "$lib/sync";
  import { callForReveal, countCall, seatHashes, seatLate, startCups, stopCups, takeMail, toRealDice } from "./host";
  import { activeCups, waitingOn } from "./cups";
  import type { DiceRound, Game } from "$lib/types";
  import { addPlayer } from "$lib/game";
  import { playerName } from "$lib/events";
  import { provide } from "$lib/commands.svelte";
  import { play } from "$lib/sound";
  import { reveal, slide, bump } from "$lib/motion";
  import Seg from "$lib/components/Seg.svelte";
  import Die from "$lib/components/Die.svelte";
  import Roster from "../Roster.svelte";
  import RoundList from "../RoundList.svelte";
  import StandingMoney from "../StandingMoney.svelte";
  import PlayerSelect from "../PlayerSelect.svelte";
  import { champOf, netOf, ranked } from "../standing";
  import { diceState, expected, judge } from "./engine";
  import { addRound, roundText, undoRound } from "./actions";
  import { rulesLine, stakesLine } from "./index";
  import { t, tp } from "$lib/i18n";

  let { game = $bindable(), persist }: { game: Game; persist: () => void } = $props();

  const d = $derived(game.dice!);
  const st = $derived(diceState(game));
  const started = $derived(!!game.rounds?.length);
  const alivePlayers = $derived(game.players.filter((p) => st.lives[p.id] > 0));
  const perWinner = $derived(d.stakes.mode === "perDie" && d.stakes.perDieTo === "winner");
  const showNet = $derived(game.finished || d.stakes.mode === "perDie");

  function act(fn: () => void) {
    fn();
    persist();
  }

  // ---- a round ----
  const setEntry = (v: "quick" | "full") => act(() => (d.entry = v));
  // the round being typed in. quick: who lost (and, with money going to whoever
  // won the call, who that was), or who called spot on. full: the bid, who
  // made it, who called it and how, and how many there were
  const fresh = (face = 2) => ({ loser: null as string | null, winner: "", spot: "", count: null as number | null, face, bidder: "", caller: "", call: "liar" as "liar" | "spot", actual: null as number | null });
  let draft = $state(fresh());
  const reset = () => (draft = fresh(draft.face));
  function commit(r: Omit<DiceRound, "at">) {
    play(r.losers.length ? "bust" : "chips");
    act(() => addRound(game, { ...r, at: Date.now() }));
    reset();
  }

  // quick: tap who lost; with money going to whoever won the call, say who that was
  function tapLoser(id: string) {
    if (!perWinner) return commit({ losers: [id] });
    draft.loser = draft.loser === id ? null : id;
  }
  function quickCommit() {
    if (draft.loser && draft.winner) commit({ losers: [draft.loser], winner: draft.winner });
  }
  // spot on for everyone else, in quick mode: the caller keeps theirs
  function quickSpotOn() {
    const id = draft.spot;
    if (!id) return;
    if (d.spotOn === "gain") return commit({ losers: [], gains: [id], winner: id });
    commit({ losers: st.alive.filter((x) => x !== id), winner: id });
  }

  // full: the round starts with whoever lost the last one, so they bid first
  // (unless the dealer picks someone else)
  const bidder = $derived(draft.bidder || (d.entry === "full" ? (st.starter ?? "") : ""));
  // the call, once it's whole: enough for the phones (they count), and with
  // how many there were, enough to say who loses
  const called = $derived(draft.count && draft.count > 0 && bidder && draft.caller && bidder !== draft.caller ? { bid: { count: draft.count, face: draft.face }, bidder, caller: draft.caller, call: draft.call } : null);
  const counted = $derived(called && draft.actual !== null && draft.actual >= 0 ? { ...called, actual: draft.actual } : null);
  const outcome = $derived(counted ? { ...counted, ...judge(d, counted, st.alive) } : null);
  function fullCommit(e: SubmitEvent) {
    e.preventDefault();
    if (outcome) commit(outcome);
  }

  function takeBack() {
    play("rewind");
    act(() => undoRound(game));
  }

  // ---- phones as dice cups ----
  const cups = $derived(activeCups(game));
  const waiting = $derived(cups ? waitingOn(cups, st.alive) : []);
  const cupLink = (pid: string) => (game.live && cups && game.cupKeys?.[pid] ? `${location.origin}/cup#${game.live.code}.${cups.seats[pid]}.${game.cupKeys[pid]}` : "");
  // the relay learns each seat's key hash whenever the seats change (and
  // again in a few seconds when it can't be reached)
  const seating = $derived(game.live && cups ? JSON.stringify([game.live.code, game.live.key, cups.seats, game.cupKeys ?? {}]) : "");
  let retry = $state(0);
  $effect(() => {
    void retry;
    if (!seating) return;
    const [code, key, seats, keys]: [string, string, Record<string, string>, Record<string, string>] = JSON.parse(seating);
    let gone = false;
    let again: ReturnType<typeof setTimeout> | undefined;
    seatHashes(seats, keys)
      .then((h) => registerSeats({ code, key }, h))
      .then((ok) => {
        if (!ok && !gone) again = setTimeout(() => retry++, 5000);
      });
    return () => {
      gone = true;
      clearTimeout(again);
    };
  });
  // each phone's mailbox, as it's written: a hash, then (on a call) its numbers
  const watching = $derived(cups && game.live ? game.live.code : "");
  $effect(() => {
    if (!watching) return;
    return watchSeats(watching, async (seat, text) => {
      const got = await takeMail(game, seat, text);
      if (!got) return;
      if (got === "counted") reset();
      persist();
    });
  });
  function phonesOn() {
    play("riffle");
    // with phones, a round is always the whole call
    act(() => {
      startCups(game);
      d.entry = "full";
    });
  }
  function phonesOff() {
    if (!confirm(t("gamePlay.dice.cups.offConfirm"))) return;
    act(() => stopCups(game));
  }
  // a call with phones: the bid and who called it, then the phones show and PitMaster counts
  function phoneCall(e: SubmitEvent) {
    e.preventDefault();
    if (!called || cups?.phase !== "play") return;
    play("bust");
    act(() => callForReveal(game, called));
  }
  let realCounts = $state<Record<string, number | null>>({});
  // everyone on real dice has a count typed in
  const realReady = $derived((cups?.real ?? []).every((id) => !st.alive.includes(id) || (realCounts[id] ?? -1) >= 0));
  function countNow() {
    play("chips");
    act(() => countCall(game, $state.snapshot(realCounts)));
    realCounts = {};
    reset();
  }

  // the palette knows this game while it's on screen
  $effect(() =>
    provide("dice", () => [
      ...(!game.finished
        ? alivePlayers.map((p) => ({ id: `d:lose:${p.id}`, label: t("gamePlay.dice.cmdLoses", { name: p.name }), group: t("gamePlay.shared.groupPlayers"), keywords: "liar dice lost", run: () => tapLoser(p.id) }))
        : []),
      ...(started ? [{ id: "d:undo", label: t("gamePlay.dice.takeBack"), group: t("gamePlay.shared.groupThisGame"), keywords: "undo round", run: takeBack }] : []),
      ...(!started ? [{ id: "d:add", label: t("gamePlay.tournament.cmdAddPlayer"), group: t("gamePlay.shared.groupThisGame"), keywords: "register seat", prompt: t("gamePlay.tournament.cmdAddPlayerPrompt"), run: (n: string) => (play("chips"), act(() => (addPlayer(game, n), seatLate(game)))) }] : []),
    ])
  );
</script>

{#snippet bidFields(full: boolean)}
  <div class="row">
    <label><span>{t("gamePlay.dice.bid")}</span><input type="number" min="1" step="1" class="w-[80px]" bind:value={draft.count} /></label>
    <div>
      <span class="block small muted mb-1">{t("gamePlay.dice.face")}</span>
      <span class="inline-flex gap-1" role="radiogroup" aria-label={t("gamePlay.dice.face")}>
        {#each [1, 2, 3, 4, 5, 6] as f (f)}<button type="button" class="facebtn" class:on={draft.face === f} aria-pressed={draft.face === f} data-sound="tap" onclick={() => (draft.face = f)}><Die value={f} size="26px" label={String(f)} /></button>{/each}
      </span>
    </div>
  </div>
  <div class="row">
    <label><span>{t("gamePlay.dice.bidBy")}</span>
      <PlayerSelect bind:value={() => bidder, (v) => (draft.bidder = v)} players={alivePlayers} />
    </label>
    <label><span>{t("gamePlay.dice.calledBy")}</span>
      <PlayerSelect bind:value={draft.caller} players={alivePlayers.filter((p) => p.id !== bidder)} />
    </label>
    {#if d.spotOn !== "off"}
      <label><span>{t("gamePlay.dice.call")}</span>
        <select bind:value={draft.call}><option value="liar">{t("gamePlay.dice.callLiar")}</option><option value="spot">{t("gamePlay.dice.callSpot")}</option></select>
      </label>
    {/if}
    {#if full}<label><span>{t("gamePlay.dice.thereWere", { faces: t(`gamePlay.dice.faceNames.f${draft.face}`) })}</span><input type="number" min="0" step="1" class="w-[80px]" bind:value={draft.actual} /></label>{/if}
  </div>
{/snippet}

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
  <div class="warn pop won my-[14px]"><p class="m-0"><Icon icon={Trophy} /> <b>{champOf(game, st)?.name ?? "?"}</b> {t("gamePlay.tournament.winnerSuffix")}</p></div>
{/if}

<div class="cols">
  <section>
    <Roster bind:game {persist} players={ranked(game, st)} adding={!started} removing={!started} added={() => seatLate(game)} place={(id) => st.places[id]} dim={(id) => st.lives[id] === 0} net={showNet ? (id) => netOf(st, id) : undefined}>
      {#snippet head()}<th>{t("gamePlay.dice.diceHeader")}</th>{/snippet}
      {#snippet badge(p)}{#if st.starter === p.id && !game.finished}<span class="pill">{t("gamePlay.dice.starts")}</span>{/if}{/snippet}
      {#snippet row(p)}
        {@const lives = st.lives[p.id]}
        <td data-l={t("gamePlay.dice.diceHeader")}><span class="inline-flex gap-[3px] flex-wrap" title={tp("gamePlay.dice.diceLeft", lives)}>{#each Array.from({ length: d.dice }) as _, i (i)}<Die size="16px" dim={i >= lives} />{/each}</span></td>
      {/snippet}
    </Roster>

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
              {@render bidFields(false)}
              <button data-sound="none" disabled={!called || cups.phase !== "play"}>{draft.call === "liar" ? t("gamePlay.dice.callLiarButton") : t("gamePlay.dice.callSpotButton")}</button>
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
            {#each alivePlayers as p (p.id)}<button class:on={draft.loser === p.id} aria-pressed={draft.loser === p.id} data-sound={perWinner ? "tap" : "none"} onclick={() => tapLoser(p.id)}>{p.name}</button>{/each}
          </div>
          {#if perWinner && draft.loser}
            <div class="row mt-2" transition:slide={reveal()}>
              <label class="across m-0"><span>{t("gamePlay.dice.wonBy")}</span>
                <PlayerSelect bind:value={draft.winner} players={alivePlayers.filter((p) => p.id !== draft.loser)} />
              </label>
              <button data-sound="none" disabled={!draft.winner} onclick={quickCommit}>{tp("gamePlay.dice.losesDie", 1, { names: playerName(game, draft.loser) })}</button>
            </div>
          {/if}
          {#if d.spotOn !== "off"}
            <div class="row small mt-2">
              <span class="muted">{t("gamePlay.dice.spotOnBy")}</span>
              <PlayerSelect bind:value={draft.spot} players={alivePlayers} label={t("gamePlay.dice.spotOnBy")} />
              <button data-sound="none" disabled={!draft.spot} onclick={quickSpotOn}>{d.spotOn === "gain" ? t("gamePlay.dice.spotGainButton") : t("gamePlay.dice.spotOthersButton")}</button>
            </div>
          {/if}
        {:else}
          <form autocomplete="off" onsubmit={fullCommit}>
            {@render bidFields(true)}
            {#if outcome}
              <p class="small" transition:slide={reveal()}>{roundText(game, { ...outcome, at: 0 })}</p>
            {/if}
            <button data-sound="none" disabled={!outcome}>{draft.call === "liar" ? t("gamePlay.dice.callLiarButton") : t("gamePlay.dice.callSpotButton")}</button>
          </form>
        {/if}
      </div>
    {/if}

    <RoundList lines={(game.rounds ?? []).map((r) => roundText(game, r))} ontakeback={takeBack} />
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
    <StandingMoney bind:game {persist} {st} stakes={d.stakes} line={stakesLine(game)} />
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

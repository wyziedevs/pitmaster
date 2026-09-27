<script lang="ts">
  // one player's phone as their cup. shake (or tap) to roll: the phone locks
  // its numbers in with a hash, and once everyone's in, the host's numbers
  // come back and the dice are known. hold to look: they hide again the moment
  // the finger lifts, so a neighbor can't glance over. on a call the phone
  // shows its numbers on its own, and the host counts everyone's.
  import type { Game } from "$lib/types";
  import Die from "$lib/components/Die.svelte";
  import { sendSeat } from "$lib/sync";
  import { diceState } from "./engine";
  import { combine, commitOf, numbers, waitingOn } from "./cups";
  import { keepRoll, readRoll, type Roll } from "./pocket";
  import { faceCount } from "./actions";
  import { token } from "$lib/crypto";
  import { money, ordinal, round2, signed } from "$lib/util";
  import { t, tp } from "$lib/i18n";

  let { game, code, seat, seatKey }: { game: Game; code: string; seat: string; seatKey: string } = $props();

  const c = $derived(game.cups);
  const pid = $derived(c ? (Object.entries(c.seats).find(([, s]) => s === seat)?.[0] ?? null) : null);
  const me = $derived(game.players.find((p) => p.id === pid) ?? null);
  const st = $derived(diceState(game));
  const lives = $derived(pid ? st.lives[pid] : 0);
  const slot = $derived(`${game.id}:${seat}`);
  const real = $derived(!!pid && !!c?.real?.includes(pid));

  // this round's roll, from the pocket (so a reload keeps it)
  let roll = $state<Roll | null>(null);
  let loadedFor = "";
  $effect(() => {
    const key = `${slot}:${c?.round}`;
    if (key === loadedFor) return;
    loadedFor = key;
    readRoll(slot).then((r) => (roll = r && r.round === c?.round ? r : null));
  });

  const hostNums = $derived(pid && c?.phase !== "commit" ? c?.host?.[pid] : undefined);
  const dice = $derived(roll && hostNums ? combine(roll.nums, hostNums) : null);
  const waiting = $derived(c ? waitingOn(game, st.alive) : []);
  const net = $derived(pid ? round2((st.money.won[pid] ?? 0) - (st.money.paid[pid] ?? 0)) : 0);

  // ---- rolling ----
  let rolling = $state(false);
  async function doRoll() {
    if (!c || !pid || roll || rolling || c.phase !== "commit" || real || !lives) return;
    rolling = true;
    const nums = numbers(lives);
    const salt = token(16);
    const r: Roll = { round: c.round, nums, salt, commit: await commitOf(game.id, c.round, seat, nums, salt) };
    await keepRoll(slot, r);
    roll = r;
    rolling = false;
    navigator.vibrate?.(60);
    void send();
  }

  // shaking the phone rolls it too, where the browser lets a page feel it
  let motionAsked = $state(false);
  $effect(() => {
    let last = 0;
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const g = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0);
      if (g > 24 && Date.now() - last > 800) {
        last = Date.now();
        doRoll();
      }
    };
    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  });
  async function allowShake() {
    motionAsked = true;
    const DM = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
    await DM.requestPermission?.().catch(() => {});
  }

  // ---- what goes to the mailbox: the hash, and on a call the numbers ----
  let sentAt = 0;
  async function send() {
    if (!c || !pid || !roll || roll.round !== c.round) return;
    const reveal = c.phase === "reveal";
    const mail = reveal ? { r: roll.round, c: roll.commit, n: roll.nums, s: roll.salt } : { r: roll.round, c: roll.commit };
    sentAt = Date.now();
    await sendSeat(code, seat, seatKey, JSON.stringify(mail));
  }
  // until the host has it, say it again every few seconds (a dropped message, a reload)
  $effect(() => {
    if (!c || !pid || !roll) return;
    const needed = (c.phase === "commit" && !c.commits?.[pid]) || (c.phase === "reveal" && !c.shown?.[pid]);
    if (!needed) return;
    if (Date.now() - sentAt > 1500) void send();
    const id = setInterval(send, 3000);
    return () => clearInterval(id);
  });

  // a call: it shows by itself
  $effect(() => {
    if (c?.phase === "reveal" && roll && pid && !c.shown?.[pid]) navigator.vibrate?.([80, 60, 80]);
  });
  // a new round that's yours to start buzzes
  let buzzedFor = 0;
  $effect(() => {
    if (c && st.starter === pid && c.round !== buzzedFor && c.phase === "commit") {
      buzzedFor = c.round;
      navigator.vibrate?.(200);
    }
  });

  // ---- looking: only while the finger's down ----
  let looking = $state(false);
  const look = (on: boolean) => (looking = on && !!dice);

  const last = $derived(game.rounds?.at(-1));
  const lostRoll = $derived(!!c && !!pid && c.phase !== "commit" && !roll && !real && !!c.commits?.[pid]);
</script>

<main class="cup">
  {#if !c?.on}
    <p class="note">{t("tv.cup.notOn")}</p>
  {:else if !me}
    <p class="note">{t("tv.cup.noSeat")}</p>
  {:else}
    <header>
      <b class="who">{me.name}</b>
      <span class="left">{#each Array.from({ length: game.dice?.dice ?? 5 }) as _, i (i)}<Die size="18px" dim={i >= lives} />{/each}</span>
    </header>
    <p class="meta">
      {t("tv.dice.round", { n: String(c.round) })} · {tp("gamePlay.dice.diceOnTable", st.total)}
      {#if st.starter === pid}<span class="tag">{t("tv.cup.yourStart")}</span>{/if}
      {#if st.palifico}<span class="tag hot">{t("tv.dice.palifico")}</span>{/if}
    </p>

    {#if st.places[me.id]}
      <div class="stage"><p class="big">{st.places[me.id] === 1 ? t("tv.find.winner") : t("tv.find.outIn", { place: ordinal(st.places[me.id]!) })}</p></div>
    {:else if real}
      <div class="stage"><p class="big">{t("tv.cup.realDice")}</p></div>
    {:else if c.phase === "commit"}
      <div class="stage">
        {#if !roll}
          <button class="roll" onclick={doRoll} disabled={rolling}>{t("tv.cup.roll")}</button>
          {#if !motionAsked && typeof DeviceMotionEvent !== "undefined" && "requestPermission" in DeviceMotionEvent}<button class="link small" onclick={allowShake}>{t("tv.cup.allowShake")}</button>{/if}
        {:else}
          <p class="big">{t("tv.cup.rolled")}</p>
          {#if waiting.length}<p class="small">{t("tv.cup.waitingFor", { names: waiting.map((id) => game.players.find((p) => p.id === id)?.name ?? "?").join(", ") })}</p>{/if}
        {/if}
      </div>
    {:else if lostRoll}
      <div class="stage"><p class="big">{t("tv.cup.lostRoll")}</p></div>
    {:else}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="stage peek" class:on={looking} onpointerdown={() => look(true)} onpointerup={() => look(false)} onpointercancel={() => look(false)} onpointerleave={() => look(false)} oncontextmenu={(e) => e.preventDefault()}>
        {#if looking && dice}
          <div class="dice">{#each dice as v, i (i)}<Die value={v} size="min(18vw, 84px)" />{/each}</div>
        {:else}
          <p class="big">{c.phase === "reveal" ? t("tv.cup.shown") : t("tv.cup.hold")}</p>
        {/if}
      </div>
    {/if}

    {#if c.call}
      <p class="call">{c.call.call === "liar" ? t("tv.dice.liar") : t("tv.dice.spotOn")} {t("tv.dice.bidWas", { bid: faceCount(c.call.bid.count, c.call.bid.face) })}</p>
    {:else if last?.bid && last.actual !== undefined}
      <p class="call small">{t("tv.cup.lastCall", { bid: faceCount(last.bid.count, last.bid.face), actual: String(last.actual) })}</p>
    {/if}
    {#if game.dice?.stakes.mode === "perDie" || game.finished}<p class="small">{signed(net)}</p>{/if}
    {#if game.dice?.stakes.mode === "pot" && game.finished && (st.money.won[me.id] ?? 0) > 0}<p class="small">{t("tv.find.won", { amount: money(st.money.won[me.id]) })}</p>{/if}
  {/if}
</main>

<style>
  .cup {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px 16px calc(18px + env(safe-area-inset-bottom));
    background: var(--tv-bg, #141414);
    color: var(--tv-fg, #eee);
    text-align: center;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  .who {
    font: 26px/1.1 var(--font-serif);
    text-align: left;
  }
  .left {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 3px;
    justify-content: flex-end;
  }
  .meta,
  .small {
    color: var(--tv-muted, #aaa);
    font-size: 15px;
    margin: 0;
  }
  .tag {
    margin-left: 8px;
    color: var(--tv-banner, #f5c400);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 12px;
  }
  .tag.hot {
    color: var(--tv-hot, #f55);
  }
  .stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    border: 1px solid var(--tv-line, #333);
    background: var(--tv-felt, #1e3b2c);
    min-height: 46dvh;
    touch-action: none;
  }
  .peek.on {
    background: var(--tv-raise, #222);
  }
  .big {
    font: 28px/1.2 var(--font-serif);
    margin: 0;
    padding: 0 12px;
  }
  .roll {
    font-size: 22px;
    height: auto;
    padding: 18px 28px;
  }
  .dice {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }
  .call {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }
  .note {
    margin: auto;
    max-width: 30ch;
  }
</style>

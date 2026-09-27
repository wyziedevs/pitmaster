<script lang="ts">
  // the cash side games on the dealer screen: call a bomb pot, mark a 7-2 win,
  // set and pay the high hand. each is its own switch (Settings > Your Game),
  // and only the ones this game plays show up.
  import Icon from "./Icon.svelte";
  import Bomb from "@lucide/svelte/icons/bomb";
  import Spade from "@lucide/svelte/icons/spade";
  import Crown from "@lucide/svelte/icons/crown";
  import type { Game } from "$lib/types";
  import { callBombPot, sevenTwoWin, setHighHand, payHighHand, sideStats } from "$lib/game";
  import { clock, money } from "$lib/util";
  import { provide } from "$lib/commands.svelte";
  import { play } from "$lib/sound";
  import { bump } from "$lib/motion";
  import { t, tp } from "$lib/i18n";

  let { game = $bindable(), persist, elapsed }: { game: Game; persist: () => void; elapsed: number } = $props();

  const c = $derived(game.cash!);
  const st = $derived(sideStats(game, elapsed));
  const running = $derived(game.clock.status === "running");
  // anyone at the table can win a hand; before anyone's sat down, anyone listed
  const seated = $derived(game.players.some((p) => p.cashOut === null) ? game.players.filter((p) => p.cashOut === null) : game.players);
  const holder = $derived(game.players.find((p) => p.id === st.current?.playerId));

  let sevenTwoBy = $state("");
  let highBy = $state("");
  let highText = $state("");

  function act(fn: () => void) {
    fn();
    persist();
  }

  const bomb = () => act(() => callBombPot(game));

  function sevenTwo(e?: SubmitEvent, id = sevenTwoBy) {
    e?.preventDefault();
    if (!id) return;
    act(() => sevenTwoWin(game, id));
    sevenTwoBy = "";
  }

  function high(e?: SubmitEvent, id = highBy, hand = highText) {
    e?.preventDefault();
    if (!id || !hand.trim()) return;
    act(() => setHighHand(game, id, hand, st.window));
    highBy = "";
    highText = "";
  }

  function payHigh() {
    if (!holder || !confirm(t("gamePlay.cash.sides.payConfirm", { name: holder.name, amount: money(c.highHand.prize) }))) return;
    play("register");
    act(() => payHighHand(game, elapsed));
  }

  // the palette (ctrl k) can run every side game by name
  $effect(() =>
    provide("sides", () => [
      ...(c.bomb.on ? [{ id: "s:bomb", label: t("gamePlay.cash.sides.cmdBomb"), group: t("gamePlay.shared.groupThisGame"), keywords: "bomb pot ante", run: () => (play("thud"), bomb()) }] : []),
      ...(c.highHand.on && holder ? [{ id: "s:pay", label: t("gamePlay.cash.sides.cmdPayHighHand"), group: t("gamePlay.shared.groupThisGame"), keywords: "high hand prize jackpot", run: payHigh }] : []),
      ...(c.sevenTwo.on
        ? seated.map((p) => ({ id: `s:72:${p.id}`, label: t("gamePlay.cash.sides.cmdSevenTwo", { name: p.name }), group: t("gamePlay.shared.groupPlayers"), keywords: "7-2 seven deuce", run: () => (play("chips"), sevenTwo(undefined, p.id)) }))
        : []),
      ...(c.highHand.on
        ? seated.map((p) => ({
            id: `s:hh:${p.id}`,
            label: t("gamePlay.cash.sides.cmdHighHand", { name: p.name }),
            group: t("gamePlay.shared.groupPlayers"),
            keywords: "high hand",
            prompt: t("gamePlay.cash.sides.handPlaceholder"),
            run: (hand: string) => (play("card"), high(undefined, p.id, hand)),
          }))
        : []),
    ])
  );
</script>

<section class="sides mb-[26px]">
  <h2>{t("gamePlay.cash.sides.heading")}</h2>
  <div class="vstack">
    {#if c.bomb.on}
      <div class="row">
        <button class:hot={st.bombDue} data-sound="thud" onclick={bomb}><Icon icon={Bomb} />{t("gamePlay.cash.sides.bombPot")}</button>
        <span class="small muted">{t(c.bomb.doubleBoard ? "gamePlay.cash.sides.bombInfoDouble" : "gamePlay.cash.sides.bombInfo", { ante: money(c.bomb.ante) })}</span>
        {#if st.bombDue}<span class="small bad pop">{t("gamePlay.cash.sides.bombDue")}</span>
        {:else if st.bombIn !== null && running}<span class="small muted num">{t("gamePlay.cash.sides.bombNext", { time: clock(st.bombIn) })}</span>{/if}
        {#if st.bombs}<span class="small muted" use:bump={st.bombs}>{tp("gamePlay.cash.sides.bombsCalled", st.bombs)}</span>{/if}
      </div>
    {/if}
    {#if c.sevenTwo.on}
      <form autocomplete="off" class="row" onsubmit={(e) => sevenTwo(e)}>
        <select bind:value={sevenTwoBy} aria-label={t("gamePlay.cash.sides.whoWon")}>
          <option value="">{t("gamePlay.cash.sides.whoWon")}</option>
          {#each seated as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
        </select>
        <button data-sound="chips" disabled={!sevenTwoBy}><Icon icon={Spade} />{t("gamePlay.cash.sides.sevenTwoWin")}</button>
        <span class="small muted">{t("gamePlay.cash.sides.sevenTwoInfo", { amount: money(c.sevenTwo.amount) })}</span>
      </form>
    {/if}
    {#if c.highHand.on}
      <div class="vstack gap-1.5">
        <p class="m-0">
          {#if st.current && holder}
            <span class="small muted">{t("gamePlay.cash.sides.highHandNow")}</span> <b>{st.current.hand}</b> · {holder.name}
            <button class="ml-2" data-sound="none" onclick={payHigh}>{t("gamePlay.cash.sides.pay", { amount: money(c.highHand.prize) })}</button>
            {#if st.hhDue}<span class="small bad pop ml-2">{t("gamePlay.cash.sides.timesUp")}</span>{/if}
          {:else}
            <span class="small muted">{t("gamePlay.cash.sides.noHighHand", { amount: money(c.highHand.prize) })}</span>
          {/if}
          {#if st.windowLeft !== null && running && !st.hhDue}<span class="small muted num ml-2">{t("gamePlay.cash.sides.windowLeft", { time: clock(st.windowLeft) })}</span>{/if}
        </p>
        <form autocomplete="off" class="row" onsubmit={(e) => high(e)}>
          <select bind:value={highBy} aria-label={t("gamePlay.cash.sides.whoHasIt")}>
            <option value="">{t("gamePlay.cash.sides.whoHasIt")}</option>
            {#each seated as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
          </select>
          <input type="text" bind:value={highText} placeholder={t("gamePlay.cash.sides.handPlaceholder")} aria-label={t("gamePlay.cash.sides.handPlaceholder")} />
          <button data-sound="card" disabled={!highBy || !highText.trim()}><Icon icon={Crown} />{st.current ? t("gamePlay.cash.sides.beatIt") : t("gamePlay.cash.sides.setHighHand")}</button>
        </form>
      </div>
    {/if}
  </div>
</section>

<style>
  /* a bomb pot that's come due: the button asks for it */
  .hot {
    border-color: var(--accent);
    color: var(--accent);
  }
</style>

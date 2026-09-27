<script lang="ts">
  // the dealer screen for a casino night: the chips out, the bank (chips
  // bought and turned back in), each table with a spin or a roll for the ones
  // with no wheel or dice of their own, and the raffle once chips turn into
  // tickets. the end says what the house kept, or what the night raised.
  import Icon from "$lib/components/Icon.svelte";
  import Undo2 from "@lucide/svelte/icons/undo-2";
  import Coins from "@lucide/svelte/icons/coins";
  import Dices from "@lucide/svelte/icons/dices";
  import Ticket from "@lucide/svelte/icons/ticket";
  import Plus from "@lucide/svelte/icons/plus";
  import type { Game } from "$lib/types";
  import { reopen } from "$lib/game";
  import { playerName } from "$lib/events";
  import { money } from "$lib/util";
  import { provide } from "$lib/commands.svelte";
  import { play } from "$lib/sound";
  import { bump } from "$lib/motion";
  import Count from "$lib/components/Count.svelte";
  import Roster from "../Roster.svelte";
  import Settle from "../Settle.svelte";
  import PlayerSelect from "../PlayerSelect.svelte";
  import { casinoState, drawFor, pocketHue } from "./engine";
  import { addPrize, bank, draw, drawPrize, endNight, gameName, resultText, undoCasino } from "./actions";
  import { houseLine, nameFor } from "./index";
  import { t, tp } from "$lib/i18n";

  let { game = $bindable(), persist }: { game: Game; persist: () => void } = $props();

  const s = $derived(game.casino!);
  const st = $derived(casinoState(game));
  const raffle = $derived(s.finish === "raffle");
  const started = $derived(!!game.casinoEvents?.length);
  const canUndo = $derived(started && (!game.finished || game.casinoEvents?.at(-1)?.kind === "draw"));

  function act(fn: () => void) {
    fn();
    persist();
  }

  // ---- the bank ----
  let who = $state("");
  let amount = $state<number | null>(null);
  function move(back: boolean) {
    const a = amount;
    if (!who || !a) return;
    play(back ? "rack" : "chips");
    act(() => bank(game, who, a, back));
    amount = null;
  }

  // ---- the tables ----
  function spin(id: string) {
    play("spin");
    act(() => draw(game, id));
  }

  // ---- the raffle ----
  let prize = $state("");
  function drawOne() {
    play("fanfare");
    act(() => drawPrize(game));
  }
  function newPrize(e: SubmitEvent) {
    e.preventDefault();
    if (!prize.trim()) return;
    act(() => addPrize(game, prize));
    prize = "";
  }

  function end() {
    if (!confirm(st.out > 0 ? t("casino.play.endConfirm", { amount: money(st.out) }) : t("casino.play.endConfirmPlain"))) return;
    play("square");
    act(() => endNight(game));
  }
  function undo() {
    play("rewind");
    act(() => undoCasino(game));
  }

  $effect(() =>
    provide("casino", () => [
      ...(!game.finished
        ? s.tables.filter((x) => drawFor(x.game)).map((x) => ({ id: `k:draw:${x.id}`, label: t(drawFor(x.game) === "roll" ? "casino.play.cmdRoll" : "casino.play.cmdSpin", { table: nameFor(s, x) }), group: t("gamePlay.shared.groupThisGame"), keywords: "spin roll wheel dice", run: () => spin(x.id) }))
        : []),
      ...(raffle && st.nextPrize && st.drum ? [{ id: "k:raffle", label: t("casino.play.drawButton", { prize: st.nextPrize }), group: t("gamePlay.shared.groupThisGame"), keywords: "raffle draw prize", run: drawOne }] : []),
      ...(canUndo ? [{ id: "k:undo", label: t("gamePlay.pot.undo"), group: t("gamePlay.shared.groupThisGame"), keywords: "undo", run: undo }] : []),
    ])
  );
</script>

<section class="clockbox">
  <div class="spread">
    <div>
      <div class="lvl">{t("casino.play.chipsOut")}</div>
      <div class="clockface num" use:bump={st.out}><Count value={st.out} format={money} /></div>
      <div class="small muted">{t("casino.play.bankLine", { sold: money(st.sold), back: money(st.returned) })}</div>
    </div>
    <div class="blinds text-right max-[600px]:text-left">
      <div class="small muted">{tp("casino.play.tablesCount", s.tables.length)}</div>
      <div class="bb">{houseLine(game, st.house)}</div>
    </div>
  </div>
  <div class="row controls mt-2">
    {#if !game.finished}
      <button data-sound="none" onclick={end}>{t("casino.play.endNight")}</button>
    {:else}
      <span class="pill pop">{t("gamePlay.cash.finishedPill")}</span>
      <button class="link small" data-sound="rewind" onclick={() => act(() => reopen(game))}>{t("gamePlay.pot.reopen")}</button>
    {/if}
  </div>
</section>

<div class="cols">
  <section>
    {#if !game.finished}
      <div class="part">
        <h2>{t("casino.play.bankHeading")}</h2>
        <div class="row">
          <label><span>{t("gamePlay.shared.nameHeader")}</span>
            <PlayerSelect bind:value={who} players={game.players} />
          </label>
          <label><span>{t("gamePlay.pot.amount")}</span><input type="number" min="0" step="any" class="w-[90px]" bind:value={amount} /></label>
        </div>
        <div class="row">
          <button data-sound="none" disabled={!who || !amount} onclick={() => move(false)}><Icon icon={Coins} />{t("casino.play.buy")}</button>
          <button data-sound="none" disabled={!who || !amount} onclick={() => move(true)}>{raffle ? t("casino.play.cashForTickets") : t("casino.play.cashIn")}</button>
        </div>
        <p class="small muted">{raffle ? t("casino.play.bankRaffleHint", { amount: money(s.ticket) }) : t("casino.play.bankHint")}</p>
      </div>

      <div class="part mt-[22px]">
        <h2>{t("casino.play.tablesHeading")}</h2>
        <ul class="bare tables">
          {#each s.tables as x (x.id)}
            {@const last = st.results[x.id]?.at(-1)}
            {@const kind = drawFor(x.game)}
            <li>
              <div class="spread">
                <div>
                  <b>{nameFor(s, x)}</b>
                  <span class="small muted">{t("casino.play.limits", { min: money(x.min), max: money(x.max) })}{x.dealer ? ` · ${t("casino.play.dealtBy", { name: x.dealer })}` : ""}</span>
                </div>
                {#if kind}<button data-sound="none" onclick={() => spin(x.id)}><Icon icon={Dices} />{kind === "roll" ? t("casino.play.roll") : t("casino.play.spin")}</button>{/if}
              </div>
              {#if last}
                <p class="m-0 mt-1">
                  <span class="result {x.game === 'roulette' && last.kind === 'spin' ? pocketHue(last.result) : ''}" use:bump={st.results[x.id].length}>{resultText(last, x.game)}</span>
                  {#if x.game === "roulette"}
                    <span class="history small">
                      {#each st.results[x.id].slice(-13, -1).reverse() as r, i (i)}{#if r.kind === "spin"}<span class="dot {pocketHue(r.result)}">{r.result}</span>{/if}{/each}
                    </span>
                  {/if}
                </p>
              {:else}
                <p class="small muted m-0 mt-1">{t(`casino.rules.${x.game}`)}</p>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if raffle}
      <div class="part mt-[22px]">
        <h2>{t("casino.play.raffleHeading")}</h2>
        <p class="small">{tp("casino.play.inDrum", st.drum)}</p>
        {#if st.nextPrize}
          <button class="big" data-sound="none" disabled={!st.drum} onclick={drawOne}><Icon icon={Ticket} />{t("casino.play.drawButton", { prize: st.nextPrize })}</button>
          {#if !st.drum}<p class="small muted">{t("casino.play.noTickets")}</p>{/if}
        {:else}
          <p class="small muted">{s.prizes.length ? t("casino.play.allDrawn") : t("casino.play.noPrizes")}</p>
        {/if}
        <form autocomplete="off" class="row add mt-2" onsubmit={newPrize}>
          <input type="text" bind:value={prize} placeholder={t("casino.play.prizePlaceholder")} aria-label={t("casino.play.prizePlaceholder")} />
          <button data-sound="chips"><Icon icon={Plus} />{t("casino.play.addPrize")}</button>
        </form>
        {#if s.prizes.length}
          <ol class="small prizes">
            {#each s.prizes as p, i (i)}
              {@const d = st.draws[i]}
              <li class:muted={!d}>{p}{#if d}: <b>{playerName(game, d.player)}</b>{/if}</li>
            {/each}
          </ol>
        {/if}
      </div>
    {/if}

    <div class="part mt-[22px]">
      <div class="spread">
        <h2>{t("gamePlay.pot.historyHeading")}</h2>
        {#if canUndo}<button class="link small" data-sound="none" onclick={undo}><Icon icon={Undo2} size="1em" />{t("gamePlay.pot.undo")}</button>{/if}
      </div>
      <ul class="bare small events">
        {#each [...game.log].filter((e) => e.t >= (game.casinoEvents?.[0]?.at ?? Infinity)).slice(0, 30) as e, i (e.t + ":" + i)}<li>{e.text}</li>{:else}<li class="muted">{t("casino.play.nothingYet")}</li>{/each}
      </ul>
    </div>
  </section>

  <section>
    <Roster bind:game {persist} players={game.players} adding={!game.finished} removing={!started} net={raffle ? undefined : (id) => st.net[id]}>
      {#snippet head()}<th class="num">{t("casino.play.boughtHeader")}</th><th class="num">{raffle ? t("casino.play.ticketsHeader") : t("casino.play.backHeader")}</th>{/snippet}
      {#snippet row(p)}
        <td class="num" data-l={t("casino.play.boughtHeader")}>{money(st.bought[p.id])}</td>
        {#if raffle}<td class="num" data-l={t("casino.play.ticketsHeader")}>{st.tickets[p.id]}</td>
        {:else}<td class="num" data-l={t("casino.play.backHeader")}>{money(st.back[p.id])}</td>{/if}
      {/snippet}
    </Roster>
    <p class="small muted mt-2">{raffle ? t("casino.play.raffleNote") : t("casino.play.moneyNote")}</p>
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
  .tables li {
    padding: 10px 0;
    border-top: var(--hair) solid var(--line);
  }
  .tables li:first-child {
    border-top: 0;
    padding-top: 0;
  }
  .result {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .result.red,
  .dot.red {
    color: var(--accent);
  }
  .result.green,
  .dot.green {
    color: var(--good);
  }
  .history {
    margin-inline-start: 0.6em;
    color: var(--muted);
  }
  .dot {
    display: inline-block;
    min-width: 1.6em;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }
  .dot.black {
    color: var(--fg);
  }
  .prizes {
    margin: 10px 0 0;
    padding-inline-start: 1.4em;
  }
</style>

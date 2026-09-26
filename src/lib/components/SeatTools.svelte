<script lang="ts">
  // the seat draw and the floor's advice, shared by cash games and tournaments
  import Icon from "./Icon.svelte";
  import Shuffle from "@lucide/svelte/icons/shuffle";
  import { reveal, slide } from "$lib/motion";
  import type { Game } from "$lib/types";
  import { drawSeats, clearSeats, seatsDrawn, seatsPer, tableAdvice, applyAdvice } from "$lib/game";
  import { play } from "$lib/sound";
  import { t } from "$lib/i18n";

  let { game = $bindable(), persist }: { game: Game; persist: () => void } = $props();

  const drawn = $derived(seatsDrawn(game));
  const advice = $derived(drawn ? tableAdvice(game) : null);
  const nameOf = (id: string) => game.players.find((p) => p.id === id)?.name ?? "?";

  function act(fn: () => void) {
    fn();
    persist();
  }

  // shuffle up, then a card dealt to each seat (after the confirm, so a
  // cancelled redraw stays quiet)
  export function draw() {
    if (drawn && !confirm(t("gamePlay.seats.redrawConfirm"))) return;
    play("seats", { n: game.players.length });
    act(() => drawSeats(game, seatsPer(game)));
  }

  function setPerTable(e: Event) {
    const n = Number((e.target as HTMLSelectElement).value);
    act(() => (drawn ? drawSeats(game, n) : (game.seatsPerTable = n)));
  }

  function adviceText(a: NonNullable<typeof advice>) {
    if (a.kind === "move")
      return t("gamePlay.seats.adviceMove", { name: nameOf(a.id), from: String(a.from.table), to: String(a.to.table), seat: String(a.to.seat) });
    return t("gamePlay.seats.adviceBreak", {
      table: String(a.table),
      moves: a.moves.map((m) => t("gamePlay.seats.moveItem", { name: nameOf(m.id), table: String(m.to.table), seat: String(m.to.seat) })).join(", "),
    });
  }
</script>

<div class="row small tools mb-2">
  <button data-sound="none" onclick={draw}><Icon icon={Shuffle} />{drawn ? t("gamePlay.shared.redrawSeats") : t("gamePlay.shared.drawSeats")}</button>
  <select value={seatsPer(game)} onchange={setPerTable} aria-label={t("gamePlay.seats.seatsPerTableAria")}>
    {#each [2, 3, 4, 5, 6, 7, 8, 9, 10] as n (n)}<option value={n}>{t("gamePlay.seats.perTableOption", { n: String(n) })}</option>{/each}
  </select>
  {#if drawn}<button class="link small muted" data-sound="swish" onclick={() => act(() => clearSeats(game))}>{t("gamePlay.seats.clearSeats")}</button>{/if}
</div>
{#if advice}
  <div class="warn small advice flex gap-2.5 items-center justify-between mb-2" transition:slide={reveal()}>
    <span>{adviceText(advice)}</span>
    <button data-sound="card" onclick={() => act(() => applyAdvice(game, advice))}>{t("gamePlay.seats.moveThemButton")}</button>
  </div>
{/if}

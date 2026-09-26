<script lang="ts">
  // the seat draw and the floor's advice, shared by cash games and tournaments
  import Icon from "./Icon.svelte";
  import Shuffle from "@lucide/svelte/icons/shuffle";
  import { reveal, slide } from "$lib/motion";
  import type { Game } from "$lib/types";
  import { drawSeats, clearSeats, seatsDrawn, seatsPer, tableAdvice, applyAdvice } from "$lib/game";
  import { play } from "$lib/sound";

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
    if (drawn && !confirm("Redraw every seat?")) return;
    play("seats", { n: game.players.length });
    act(() => drawSeats(game, seatsPer(game)));
  }

  function setPerTable(e: Event) {
    const n = Number((e.target as HTMLSelectElement).value);
    act(() => (drawn ? drawSeats(game, n) : (game.seatsPerTable = n)));
  }

  function adviceText(a: NonNullable<typeof advice>) {
    if (a.kind === "move") return `Balance the tables: ${nameOf(a.id)} moves from table ${a.from.table} to table ${a.to.table}, seat ${a.to.seat}.`;
    return `Everyone fits at one fewer table. Break table ${a.table}: ${a.moves.map((m) => `${nameOf(m.id)} to T${m.to.table} S${m.to.seat}`).join(", ")}.`;
  }
</script>

<div class="row small tools">
  <button data-sound="none" onclick={draw}><Icon icon={Shuffle} />{drawn ? "Redraw Seats" : "Draw Seats"}</button>
  <select value={seatsPer(game)} onchange={setPerTable} aria-label="Seats per table">
    {#each [2, 3, 4, 5, 6, 7, 8, 9, 10] as n (n)}<option value={n}>{n} per Table</option>{/each}
  </select>
  {#if drawn}<button class="link small muted" data-sound="swish" onclick={() => act(() => clearSeats(game))}>Clear Seats</button>{/if}
</div>
{#if advice}
  <div class="warn small advice" transition:slide={reveal()}>
    <span>{adviceText(advice)}</span>
    <button data-sound="card" onclick={() => act(() => applyAdvice(game, advice))}>Move Them</button>
  </div>
{/if}

<style>
  .tools {
    margin-bottom: 8px;
  }
  .advice {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
</style>

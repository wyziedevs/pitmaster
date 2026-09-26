<script lang="ts">
  import { tick } from "svelte";
  import { fade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import Icon from "$lib/components/Icon.svelte";
  import Coffee from "@lucide/svelte/icons/coffee";
  import Plus from "@lucide/svelte/icons/plus";
  import type { GameChip, Level } from "$lib/types";
  import { annotate } from "$lib/blinds";
  import { amt, duration } from "$lib/util";
  import { leave, reorder, reveal } from "$lib/motion";
  import Chip from "./Chip.svelte";
  import RemoveButton from "./RemoveButton.svelte";

  let {
    levels = $bindable(),
    chips,
    editable = false,
    current = -1,
    onjump,
    onedit,
  }: {
    levels: Level[];
    chips: GameChip[];
    editable?: boolean;
    current?: number;
    onjump?: (i: number) => void;
    onedit?: () => void;
  } = $props();

  const starts = $derived.by(() => {
    let acc = 0;
    return levels.map((l) => {
      const s = acc;
      acc += Number(l.minutes) || 0;
      return s;
    });
  });

  const chipById = (id: string) => chips.find((c) => c.id === id);

  // levels are saved without ids, so each row gets one here and keeps it
  // through adds and removes: the rows below a change glide to their new place
  // instead of every one redrawing, and focus stays with its own level. (a
  // table row can't be clipped, so rows fade in and out rather than slide.)
  let made = 0;
  const ids: number[] = [];
  const keys = $derived.by(() => {
    // swapped from outside (an undo, a new structure): top up or trim to fit
    while (ids.length < levels.length) ids.push(made++);
    ids.length = levels.length;
    return [...ids];
  });

  let table = $state<HTMLTableElement>();

  function changed() {
    annotate(levels, chips);
    onedit?.();
  }

  function insertAfter(i: number, brk: boolean) {
    const l = levels[i];
    levels.splice(
      i + 1,
      0,
      brk ? { sb: 0, bb: 0, ante: 0, minutes: 10, isBreak: true } : { sb: l.sb * 2 || 1, bb: l.bb * 2 || 2, ante: l.ante ? l.bb * 2 : 0, minutes: l.minutes || 20 }
    );
    ids.splice(i + 1, 0, made++);
    changed();
  }

  async function remove(i: number) {
    const row = table?.querySelector(`[data-row="${keys[i]}"]`);
    const focused = !!row?.contains(document.activeElement);
    levels.splice(i, 1);
    ids.splice(i, 1);
    changed();
    // the x that had focus went with its row: hand it to the one that moved up
    // (or the new last row), so a keyboard can keep clearing levels
    if (!focused || !levels.length) return;
    await tick();
    table?.querySelector<HTMLElement>(`[data-row="${ids[Math.min(i, ids.length - 1)]}"] .remove`)?.focus();
  }
</script>

<!-- the @container rules below measure this box -->
<div class="scroll-x frame">
  <table class="structure" class:editing={editable} bind:this={table}>
    <thead>
      <tr>
        <th>Level</th>
        <th class="num">Small</th>
        <th class="num">Big</th>
        <th class="num">Ante</th>
        <th class="num">Minutes</th>
        <th class="num starts">Starts</th>
        <th class="notes">Notes</th>
        {#if editable || onjump}<th></th>{/if}
      </tr>
    </thead>
    <tbody>
      {#each levels as l, i (keys[i])}
        <tr
          class:current={i === current}
          class:dim={i < current}
          class:brk={l.isBreak}
          class:ot={l.overtime}
          data-row={keys[i]}
          in:fade={reveal()}
          out:fade={leave()}
          animate:flip={reorder()}
        >
          {#if l.isBreak}
            <td colspan="4"><b><Icon icon={Coffee} /> Break</b></td>
          {:else}
            <td class="num">{l.num}</td>
            {#if editable}
              <td class="num"><input type="number" min="0" step="any" bind:value={l.sb} onchange={changed} aria-label="Level {l.num} Small Blind" /></td>
              <td class="num"><input type="number" min="0" step="any" bind:value={l.bb} onchange={changed} aria-label="Level {l.num} Big Blind" /></td>
              <td class="num"><input type="number" min="0" step="any" bind:value={l.ante} onchange={changed} aria-label="Level {l.num} Ante" /></td>
            {:else}
              <td class="num">{amt(l.sb)}</td>
              <td class="num">{amt(l.bb)}</td>
              <td class="num">{l.ante ? amt(l.ante) : ""}</td>
            {/if}
          {/if}
          <td class="num">
            {#if editable}
              <input type="number" class="min" min="1" step="1" bind:value={l.minutes} onchange={changed} aria-label="{l.isBreak ? 'Break' : `Level ${l.num}`} Minutes" />
            {:else}
              {l.minutes}
            {/if}
          </td>
          <td class="num muted nowrap starts">{duration(starts[i])}</td>
          <td class="small notes">
            {#if l.colorUp?.length}
              <span class="cu" title="Color up these chips"><span class="cu-l">Color Up</span>
                {#each l.colorUp as id (id)}
                  {@const c = chipById(id)}
                  {#if c}<Chip chip={c} size={18} text="" spin={false} />{/if}
                {/each}
              </span>
            {/if}
            {#if l.overtime}<span class="muted ot-l">Overtime</span>{/if}
          </td>
          {#if editable || onjump}
            <td class="small actions">
              {#if onjump && i !== current}<button class="link go" data-sound="flap" title="Jump the clock to this {l.isBreak ? 'break' : 'level'}" onclick={() => onjump(i)}>Go</button>{/if}
              {#if editable}
                <span class="adds">
                  <button class="link" data-sound="card" title="Add a level after this one" onclick={() => insertAfter(i, false)}><Icon icon={Plus} size="1em" />Level</button>
                  <button class="link" data-sound="card" title="Add a break after this one" onclick={() => insertAfter(i, true)}><Icon icon={Plus} size="1em" />Break</button>
                </span>
                <RemoveButton label={l.isBreak ? "Remove This Break" : `Remove Level ${l.num}`} onclick={() => remove(i)} />
              {/if}
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .frame {
    container-type: inline-size;
  }
  /* editing fits the table to its column instead of scrolling it sideways:
     the number boxes share whatever width the rest leaves (enough for five
     digits), and past that the reference columns and the add links give way */
  .structure.editing {
    width: 100%;
  }
  .structure input[type="number"] {
    width: 100%;
    min-width: 3.6em;
  }
  .structure input.min {
    min-width: 2.8em;
  }
  .structure td:has(> input[type="number"]) {
    width: 16%;
    padding-right: 6px;
  }
  .structure td:has(> input.min) {
    width: 11%;
  }
  /* a narrow column: the start times and notes step aside while editing (they
     come back on Done) */
  @container (max-width: 500px) {
    .editing .starts,
    .editing .notes {
      display: none;
    }
  }
  /* a phone: + Level and + Break stack in the row, the boxes pack tighter and
     Go waits for Done (jumping the clock isn't part of editing) */
  @container (max-width: 420px) {
    .editing .go {
      display: none;
    }
    .structure.editing input[type="number"] {
      min-width: 3.2em;
    }
    .structure.editing input.min {
      min-width: 2.6em;
    }
    .structure.editing td:has(> input[type="number"]) {
      padding-right: 4px;
    }
    .editing .adds {
      display: inline-flex;
      flex-direction: column;
      align-items: flex-start;
      vertical-align: middle;
    }
  }
  .adds {
    white-space: nowrap;
  }
  .editing .cu-l,
  .editing .ot-l {
    display: none;
  }
  tr.brk td {
    background: var(--block);
  }
  /* rows are tinted (breaks, the current level), so the text on the left gets
     the same room from the tint's edge as the last column has on the right */
  th:first-child,
  td:first-child {
    padding-left: 10px;
  }
  tr.ot td {
    font-style: italic;
  }
  .cu {
    display: inline-flex;
    gap: 3px;
    align-items: center;
  }
  .actions {
    white-space: nowrap;
  }
  .actions button,
  .adds {
    margin-right: 8px;
  }
  .adds button:last-child {
    margin-right: 0;
  }
  .actions > button:last-child {
    margin-right: 0;
  }
</style>

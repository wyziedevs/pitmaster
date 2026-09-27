<script lang="ts">
  import { tick } from "svelte";
  import { fade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import Icon from "$lib/components/Icon.svelte";
  import Coffee from "@lucide/svelte/icons/coffee";
  import Plus from "@lucide/svelte/icons/plus";
  import type { GameChip, Level } from "$lib/types";
  import { annotate } from "$lib/blinds";
  import { unitOf } from "$lib/chips";
  import { amt, duration } from "$lib/util";
  import { leave, reorder, reveal } from "$lib/motion";
  import Chip from "./Chip.svelte";
  import RemoveButton from "./RemoveButton.svelte";
  import { t } from "$lib/i18n";
  import { isLimit, isStud, studAmounts, VARIANTS, variant, variantName } from "$lib/variants";

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
  // a column for the game when the levels play more than hold'em, and one for stud's bring-in
  const hasGame = $derived(levels.some((l) => l.game));
  const hasStud = $derived(levels.some((l) => !l.isBreak && isStud(l.game)));
  // a new level between two plays the game after the one above it, if they rotate
  function nextGame(i: number) {
    const games = levels.filter((l) => !l.isBreak && l.game).map((l) => l.game!);
    const cur = levels[i].game;
    if (!cur) return undefined;
    const order = [...new Set(games)];
    return order[(order.indexOf(cur) + 1) % order.length];
  }
  // a level's numbers follow its game: stud has no blinds and gets an ante and
  // a bring-in, and a big blind ante only goes on the big-bet games
  const unit = $derived(unitOf(chips));
  function fit(l: Level, was: string | undefined) {
    if (isStud(l.game)) return void Object.assign(l, { sb: 0 }, studAmounts(l.bb, unit));
    delete l.bringIn;
    if (isStud(was)) Object.assign(l, { sb: +(l.bb / 2).toFixed(4), ante: 0 });
    else if (isLimit(l.game)) l.ante = 0;
  }
  function setGame(l: Level, game: string) {
    const was = l.game;
    l.game = game;
    fit(l, was);
    changed();
  }

  // levels are saved without ids, so each row gets one here and keeps it
  // through adds and removes: the rows below a change glide to their new place
  // instead of every one redrawing, and focus stays with its own level. (a
  // table row can't be clipped, so rows fade in and out rather than slide.)
  // swapped from outside (an undo, a new structure), the rows keep theirs by
  // place, and any past the end get their place's, below every one in use.
  let made = 0;
  let ids = $state.raw<number[]>([]);
  const keys = $derived.by(() => {
    const low = Math.min(0, ...ids);
    return levels.map((_, i) => ids[i] ?? low - 1 - (i - ids.length));
  });
  /** a row added or removed here, before the levels change: the keys below it move with it */
  function rekey(fn: (k: number[]) => void) {
    const k = [...keys];
    fn(k);
    ids = k;
  }

  let table = $state<HTMLTableElement>();

  function changed() {
    annotate(levels, chips);
    onedit?.();
  }

  function insertAfter(i: number, brk: boolean) {
    // a level added under a break follows the level before the break
    const from = levels.slice(0, i + 1).findLastIndex((x) => !x.isBreak);
    const l = levels[from < 0 ? i : from];
    const add: Level = brk
      ? { sb: 0, bb: 0, ante: 0, minutes: 10, isBreak: true }
      : { sb: l.sb * 2 || 1, bb: l.bb * 2 || 2, ante: l.ante ? l.ante * 2 : 0, minutes: l.minutes || 20 };
    if (!brk && l.game) {
      add.game = nextGame(from);
      fit(add, l.game);
    }
    rekey((k) => k.splice(i + 1, 0, made++));
    levels.splice(i + 1, 0, add);
    changed();
  }

  async function remove(i: number) {
    const row = table?.querySelector(`[data-row="${keys[i]}"]`);
    const focused = !!row?.contains(document.activeElement);
    rekey((k) => k.splice(i, 1));
    levels.splice(i, 1);
    changed();
    // the x that had focus went with its row: hand it to the one that moved up
    // (or the new last row), so a keyboard can keep clearing levels
    if (!focused || !levels.length) return;
    await tick();
    table?.querySelector<HTMLElement>(`[data-row="${keys[Math.min(i, keys.length - 1)]}"] .remove`)?.focus();
  }
</script>

<!-- the @container rules below measure this box -->
<div class="scroll-x frame">
  <table class="structure" class:editing={editable} bind:this={table}>
    <thead>
      <tr>
        <th class="pl-[10px]">{t("gamePlay.structure.levelHeader")}</th>
        {#if hasGame}<th>{t("gamePlay.structure.gameHeader")}</th>{/if}
        <th class="num">{t("gamePlay.structure.smallHeader")}</th>
        <th class="num">{t("gamePlay.structure.bigHeader")}</th>
        <th class="num">{t("gamePlay.shared.ante")}</th>
        {#if hasStud}<th class="num">{t("gamePlay.structure.bringInHeader")}</th>{/if}
        <th class="num">{t("gamePlay.structure.minutesHeader")}</th>
        <th class="num starts">{t("gamePlay.structure.startsHeader")}</th>
        <th class="notes">{t("gamePlay.structure.notesHeader")}</th>
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
            <td colspan={4 + +hasGame + +hasStud} class="pl-[10px]"><b><Icon icon={Coffee} /> {t("gamePlay.shared.breakLabel")}</b></td>
          {:else}
            <td class="num pl-[10px]">{l.num}</td>
            {#if hasGame}
              <td class="nowrap">
                {#if editable}
                  <select class="w-full min-w-[5em]" value={l.game ?? "nlhe"} onchange={(e) => setGame(l, e.currentTarget.value)} aria-label={t("gamePlay.structure.gameAria", { n: String(l.num) })}>
                    {#each VARIANTS as v (v.id)}<option value={v.id}>{v.short}</option>{/each}
                  </select>
                {:else}<span title={variantName(l.game)}>{variant(l.game).short}</span>{/if}
              </td>
            {/if}
            {#if editable}
              <td class="num"><input type="number" class="w-full min-w-[3.6em]" min="0" step="any" bind:value={l.sb} onchange={changed} aria-label={t("gamePlay.structure.smallBlindAria", { n: String(l.num) })} /></td>
              <td class="num"><input type="number" class="w-full min-w-[3.6em]" min="0" step="any" bind:value={l.bb} onchange={changed} aria-label={t("gamePlay.structure.bigBlindAria", { n: String(l.num) })} /></td>
              <td class="num"><input type="number" class="w-full min-w-[3.6em]" min="0" step="any" bind:value={l.ante} onchange={changed} aria-label={t("gamePlay.structure.anteAria", { n: String(l.num) })} /></td>
              {#if hasStud}<td class="num">{#if isStud(l.game)}<input type="number" class="w-full min-w-[3.6em]" min="0" step="any" bind:value={l.bringIn} onchange={changed} aria-label={t("gamePlay.structure.bringInAria", { n: String(l.num) })} />{/if}</td>{/if}
            {:else}
              <td class="num">{l.sb ? amt(l.sb) : ""}</td>
              <td class="num">{amt(l.bb)}</td>
              <td class="num">{l.ante ? amt(l.ante) : ""}</td>
              {#if hasStud}<td class="num">{isStud(l.game) && l.bringIn ? amt(l.bringIn) : ""}</td>{/if}
            {/if}
          {/if}
          <td class="num">
            {#if editable}
              <input type="number" class="min w-full min-w-[2.8em]" min="1" step="1" bind:value={l.minutes} onchange={changed} aria-label={l.isBreak ? t("gamePlay.structure.minutesAriaBreak") : t("gamePlay.structure.minutesAriaLevel", { n: String(l.num) })} />
            {:else}
              {l.minutes}
            {/if}
          </td>
          <td class="num muted nowrap starts">{duration(starts[i])}</td>
          <td class="small notes">
            {#if l.colorUp?.length}
              <span class="cu inline-flex gap-[3px] items-center" title={t("gamePlay.structure.colorUpTitle")}><span class="cu-l">{t("gamePlay.structure.colorUpLabel")}</span>
                {#each l.colorUp as id (id)}
                  {@const c = chipById(id)}
                  {#if c}<Chip chip={c} size={18} spin={false} />{/if}
                {/each}
              </span>
            {/if}
            {#if l.overtime}<span class="muted ot-l">{t("gamePlay.structure.overtimeLabel")}</span>{/if}
          </td>
          {#if editable || onjump}
            <td class="small actions whitespace-nowrap">
              {#if onjump && i !== current}<button class="link go" data-sound="flap" title={l.isBreak ? t("gamePlay.structure.jumpTitleBreak") : t("gamePlay.structure.jumpTitleLevel")} onclick={() => onjump(i)}>{t("gamePlay.structure.goLabel")}</button>{/if}
              {#if editable}
                <span class="adds whitespace-nowrap">
                  <button class="link" data-sound="card" title={t("gamePlay.structure.addLevelTitle")} onclick={() => insertAfter(i, false)}><Icon icon={Plus} size="1em" />{t("gamePlay.structure.addLevelLabel")}</button>
                  <button class="link" data-sound="card" title={t("gamePlay.structure.addBreakTitle")} onclick={() => insertAfter(i, true)}><Icon icon={Plus} size="1em" />{t("gamePlay.shared.breakLabel")}</button>
                </span>
                <RemoveButton label={l.isBreak ? t("gamePlay.structure.removeThisBreak") : t("gamePlay.structure.removeLevelN", { n: String(l.num) })} onclick={() => remove(i)} />
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
  .editing .cu-l,
  .editing .ot-l {
    display: none;
  }
  tr.brk td {
    background: var(--block);
  }
  tr.ot td {
    font-style: italic;
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

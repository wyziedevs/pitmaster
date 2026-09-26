<script lang="ts" module>
  // the set that was open, so leaving Chip Sets and coming back finds it again
  let lastOpen = "";
</script>

<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import {
    getChipSets,
    saveChipSet,
    deleteChipSet,
    getDefaultChipSetId,
    setDefaultChipSet,
    restorePresets,
  } from "$lib/store";
  import RotateCw from "@lucide/svelte/icons/rotate-cw";
  import { FACE_DEFAULTS, totalCount, totalValue } from "$lib/chips";
  import type { ChipDef, ChipSet, ChipStyle } from "$lib/types";
  import { money, uid } from "$lib/util";
  import Chip from "$lib/components/Chip.svelte";
  import RemoveButton from "$lib/components/RemoveButton.svelte";
  import ChipStack from "$lib/components/ChipStack.svelte";
  import Check from "@lucide/svelte/icons/check";
  import ArrowDownWideNarrow from "@lucide/svelte/icons/arrow-down-wide-narrow";
  import { tick } from "svelte";
  import { fade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { reveal, leave, reorder, bump, replay, slide } from "$lib/motion";
  import { toast } from "$lib/toast.svelte";
  import { play } from "$lib/sound";

  const found = getChipSets();
  let sets = $state<ChipSet[]>(found);
  let defaultId = $state(getDefaultChipSetId());
  let selId = $state(found.some((s) => s.id === lastOpen) ? lastOpen : getDefaultChipSetId() || found[0]?.id);
  const sel = $derived(sets.find((s) => s.id === selId));
  $effect(() => void (lastOpen = selId ?? ""));

  // autosave whatever set is being edited, and say so. each save seals the whole
  // store again, so edits wait until they pause (a color being dragged is a
  // stream of them) and go at once when a field's done or this closes. opening a
  // set only notes how it looks; nothing's saved until it changes.
  let saved = $state(false);
  let savedTimer: ReturnType<typeof setTimeout>;
  let saveTimer: ReturnType<typeof setTimeout>;
  let pending: ChipSet | null = null;
  let lastSaved = "";
  let lastId = "";
  $effect(() => {
    if (!sel) return;
    const snap = $state.snapshot(sel);
    const key = JSON.stringify(snap);
    if (snap.id !== lastId) {
      flush(); // the set being left
      lastId = snap.id;
      lastSaved = key;
      return;
    }
    if (key === lastSaved) return;
    lastSaved = key;
    pending = snap;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 400);
  });

  function flush() {
    clearTimeout(saveTimer);
    if (!pending) return;
    saveChipSet(pending);
    // (a set that's no longer open saves quietly)
    if (pending.id === selId) {
      saved = true;
      clearTimeout(savedTimer);
      savedTimer = setTimeout(() => (saved = false), 1400);
    }
    pending = null;
  }
  // a field that's done saves now, once its edit has landed
  const settle = () => tick().then(flush);
  $effect(() => flush);

  function addChip() {
    if (!sel) return;
    const last = sel.chips[sel.chips.length - 1];
    // the new chip lands on its own note
    setTimeout(() => play("note", { value: last ? last.value * 5 : 1 }), 120);
    sel.chips.push({
      ...(last ? { style: last.style, inlay: last.inlay, ink: last.ink, trim: last.trim, accent2: last.accent2 } : {}),
      id: uid(),
      label: "New",
      color: "#888888",
      accent: "#ffffff",
      value: last ? last.value * 5 : 1,
      count: 25,
    });
  }

  const DESIGNS: { id: ChipStyle; short: string; name: string }[] = [
    { id: "montecarlo", short: "Monte Carlo", name: "Monte Carlo (3-Part Inserts + Silver Label)" },
    { id: "delsol", short: "Casino Del Sol", name: "Casino Del Sol (Colored Rim + Big White Label)" },
    { id: "basic", short: "Dice", name: "Dice (Edge Inserts + Pips)" },
  ];

  // "set every chip to…" is an action, not a setting: it resets to the prompt.
  // the chips flip over in turn (cascade); one chip's own select flips just it.
  let cascade = $state(false);
  function applyDesign(e: Event) {
    const el = e.target as HTMLSelectElement;
    const style = el.value as ChipStyle;
    el.value = "";
    if (!style || !sel) return;
    const was = sel.chips.map((c) => c.style);
    cascade = true;
    setTimeout(() => (cascade = false), 700 + sel.chips.length * 60);
    sel.chips.forEach((c) => (c.style = style));
    // they flip over one after another, each landing on its own note
    sel.chips.forEach((c, i) => {
      if (was[i] !== style) setTimeout(() => play("note", { value: c.value }), 200 + i * 60);
    });
    toast(`Every chip is ${DESIGNS.find((d) => d.id === style)?.short} now`, "info");
  }

  // each design only draws some of the colors, so each row only offers those.
  // fallbacks match what Chip.svelte paints when a color was never picked.
  type ColorKey = "color" | "accent" | "accent2" | "inlay" | "trim";
  const SWATCHES: Record<ChipStyle, { key: ColorKey; label: string }[]> = {
    basic: [
      { key: "color", label: "Clay" },
      { key: "accent", label: "Inserts + Pips" },
    ],
    montecarlo: [
      { key: "color", label: "Clay" },
      { key: "accent", label: "Insert Centers" },
      { key: "accent2", label: "Insert Sides + Ring" },
      { key: "inlay", label: "Label" },
      { key: "trim", label: "Glitter Ring" },
    ],
    delsol: [
      { key: "color", label: "Rim" },
      { key: "accent", label: "Inserts" },
      { key: "inlay", label: "Label" },
      { key: "trim", label: "Ring Text" },
    ],
  };
  function colorOf(c: ChipDef, key: ColorKey) {
    if (c[key]) return c[key]!;
    if (key === "accent2") return c.accent;
    const face = FACE_DEFAULTS[c.style ?? "basic"];
    return key === "inlay" ? face.inlay : face.trim;
  }

  // sorted low to high, the set plays itself up the scale as the rows settle
  function sortChips() {
    if (!sel) return;
    sel.chips.sort((a, b) => a.value - b.value);
    setTimeout(() => play("run", { values: sel!.chips.map((c) => c.value), gap: 0.07 }), 160);
  }

  // a set picked from the list plays its chips in a row, each on its own note
  function pick(s: ChipSet) {
    if (s.id === selId) return;
    selId = s.id;
    play("run", { values: s.chips.map((c) => c.value) });
  }

  function newSet(copy = false) {
    flush(); // before the list is read back
    const s: ChipSet =
      copy && sel
        ? { ...$state.snapshot(sel), id: uid(), name: sel.name + " (Copy)", chips: sel.chips.map((c) => ({ ...c, id: uid() })) }
        : { id: uid(), name: "New Chip Set", note: "", chips: [] };
    saveChipSet(s);
    sets = getChipSets();
    selId = s.id;
  }

  function remove() {
    if (!sel || !confirm(`Delete the chip set “${sel.name}”? Games already set up keep their own copy.`)) return;
    const name = sel.name;
    pending = null; // its unsaved edits go with it
    deleteChipSet(sel.id);
    sets = getChipSets();
    defaultId = getDefaultChipSetId();
    selId = sets[0]?.id;
    toast(`Deleted ${name}`, "info");
  }

  function makeDefault() {
    if (!sel) return;
    setDefaultChipSet(sel.id);
    defaultId = sel.id;
    toast(`New games start with ${sel.name}`);
  }

  function resetPresets() {
    if (!confirm("Reset the built-in chip sets back to their original values? Your own sets stay.")) return;
    flush();
    restorePresets();
    sets = getChipSets();
    lastId = ""; // the open set is as saved now: nothing new to save
    if (!sets.some((s) => s.id === selId)) selId = sets[0]?.id;
    toast("Built-in sets are back to new");
  }
</script>

<div class="layout">
  <aside>
    <ul class="bare sets">
      {#each sets as s (s.id)}
        <li class:on={s.id === selId} in:slide={reveal()} out:slide={leave()}>
          <button class="link" data-sound="none" aria-current={s.id === selId ? "true" : undefined} onclick={() => pick(s)}>{s.name}</button>
          {#if s.owned}<span class="pill">Yours</span>{/if}
          {#if s.id === defaultId}<span class="pill" in:fade={reveal()}>Default</span>{/if}
          <div class="mini">
            {#each s.chips as c (c.id)}<Chip chip={c} size={16} text="" spin={false} />{/each}
          </div>
        </li>
      {/each}
    </ul>
    {#if !sets.length}<p class="empty">No chip sets yet. Make one to start.</p>{/if}
    <p class="row">
      <button data-sound="card" onclick={() => newSet()}><Icon icon={Plus} />New Set</button>
      <button data-sound="card" onclick={() => newSet(true)} disabled={!sel} title={sel ? undefined : "Pick a set to copy first"}>Duplicate</button>
    </p>
    <p class="row">
      <button class="link small muted" data-sound="rewind" onclick={resetPresets}><Icon icon={RotateCw} size="1em" />Reset Built-In Sets</button>
    </p>
  </aside>

  {#if sel}
    {#key selId}
    <!-- (a finished field bubbles its change up here, and saves) -->
    <section in:fade={reveal()} onchange={settle}>
      <div class="row">
        <label style="flex:1">
          <span class="name-l">Name {#if saved}<span class="saved" transition:fade={leave()}><Icon icon={Check} size="1em" />Saved</span>{/if}</span>
          <input type="text" bind:value={sel.name} style="width:100%" />
        </label>
      </div>
      <label><span>Notes</span><textarea bind:value={sel.note} rows="2"></textarea></label>
      <label class="inline"><input type="checkbox" bind:checked={sel.owned} /><span>I Own This Set</span></label>

      <div class="spread chips-head">
        <h3>Chips</h3>
        <select class="all" onchange={applyDesign} aria-label="Set every chip's design">
          <option value="">Set Every Chip To…</option>
          {#each DESIGNS as d (d.id)}<option value={d.id}>{d.name}</option>{/each}
        </select>
      </div>
      <div class="scroll-x editor-box">
        <table class="editor">
          <thead>
            <tr>
              <th><span class="sr-only">Preview</span></th>
              <th>Value</th>
              <th>How Many</th>
              <th class="num">Worth</th>
              <th>Face</th>
              <th>Design</th>
              <th>Colors</th>
              <th><span class="sr-only">Remove</span></th>
            </tr>
          </thead>
          <tbody>
            {#each sel.chips as c, i (c.id)}
              {@const name = `the ${money(c.value)} chip`}
              <tr in:fade={reveal()} out:fade={leave()} animate:flip={reorder()}>
                <!-- a new design flips the chip over to show its new face -->
                <td class="pv"><span class="face-up" style:--i={cascade ? i : 0} use:replay={[c.style, "flipover"]}><Chip chip={c} size={44} /></span></td>
                <td class="v" data-l="Value"><input type="number" step="any" min="0" bind:value={c.value} aria-label="Value of chip {i + 1}" /></td>
                <td class="n" data-l="How Many"><input type="number" min="0" step="25" bind:value={c.count} aria-label="How many of {name}" /></td>
                <td class="num worth" data-l="Worth">{money(c.value * c.count)}</td>
                <td class="fc" data-l="Face"><input type="text" class="face" bind:value={c.label} placeholder="Blank" aria-label="Text printed on {name}" title="Text printed on the chip" /></td>
                <td class="ds" data-l="Design">
                  <select bind:value={c.style} onchange={() => setTimeout(() => play("note", { value: c.value }), 200)} aria-label="Design of {name}">
                    {#each DESIGNS as d (d.id)}<option value={d.id}>{d.short}</option>{/each}
                  </select>
                </td>
                <td class="cl" data-l="Colors">
                  <span class="swatches" role="group" aria-label="Colors of {name}">
                    {#each SWATCHES[c.style ?? "basic"] as sw (sw.key)}
                      <label class="sw" style:--c={colorOf(c, sw.key)} title={sw.label}>
                        <input type="color" value={colorOf(c, sw.key)} oninput={(e) => (c[sw.key] = (e.target as HTMLInputElement).value)} onchange={() => play("note", { value: c.value })} aria-label="{sw.label} of {name}" />
                      </label>
                    {/each}
                  </span>
                </td>
                <td class="rm"><RemoveButton label="Remove {name}" onclick={() => sel.chips.splice(i, 1)} /></td>
              </tr>
            {:else}
              <tr><td colspan="8" class="empty">No chips yet. Add the first one below.</td></tr>
            {/each}
          </tbody>
          {#if sel.chips.length}
            <tfoot>
              <tr>
                <td></td>
                <td class="muted">Total</td>
                <td class="num count"><b use:bump={totalCount(sel.chips)}>{totalCount(sel.chips)}</b></td>
                <td class="num"><b use:bump={totalValue(sel.chips)}>{money(totalValue(sel.chips))}</b></td>
                <td colspan="4"></td>
              </tr>
            </tfoot>
          {/if}
        </table>
      </div>
      <p class="row">
        <!-- (both play their chips' own notes) -->
        <button data-sound="none" onclick={addChip}><Icon icon={Plus} />Add Chip</button>
        <button data-sound="none" onclick={sortChips} disabled={sel.chips.length < 2} title={sel.chips.length < 2 ? "Takes two or more chips" : undefined}><Icon icon={ArrowDownWideNarrow} />Sort by Value</button>
      </p>

      <h3 style="margin-top:22px">The Whole Set</h3>
      <div class="case">
        {#each sel.chips as c (c.id)}
          <div class="col">
            <ChipStack chip={c} n={Math.ceil(c.count / 5)} max={40} width={52} />
            <span class="small num">{c.count}</span>
          </div>
        {/each}
      </div>
      <p class="small muted">Each chip drawn is worth 5 chips.</p>

      <p class="row">
        {#if sel.id !== defaultId}<button onclick={makeDefault}>Use This Set by Default</button>{/if}
        <button class="danger" data-sound="thud" onclick={remove}>Delete Set</button>
      </p>
    </section>
    {/key}
  {/if}
</div>


<style>
  .layout {
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 28px;
  }
  @media (max-width: 760px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .sets {
    margin-bottom: 10px;
  }
  /* every row is a hairline box that only shows its bottom edge until it's the
     open one. each sits a hairline up over the one before, so the open row's
     edges land on its neighbors' rules instead of doubling them */
  .sets li {
    padding: 6px;
    margin-top: calc(-1 * var(--hair));
    border: var(--hair) solid transparent;
    border-bottom-color: var(--line);
    transition:
      background-color var(--dur-hover) var(--ease-out),
      border-color var(--dur-hover) var(--ease-out);
  }
  .sets li.on {
    background: var(--block);
    border-color: var(--line-strong);
  }
  label > .name-l {
    display: flex;
    justify-content: space-between;
  }
  .saved {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    color: var(--good);
  }
  .mini {
    display: flex;
    gap: 2px;
    margin-top: 4px;
  }
  .chips-head {
    margin-top: 18px;
  }
  .editor td {
    padding-top: 6px;
    padding-bottom: 6px;
  }
  .editor .pv {
    width: 1%;
    line-height: 0;
    perspective: 300px;
  }
  .face-up {
    display: inline-block;
  }
  /* flicked over: up off the table on its edge, then down on the new face */
  .face-up:global(.flipover) {
    animation: flipover var(--dur-settle) var(--ease-out-expo) backwards;
    animation-delay: calc(var(--i) * 60ms);
  }
  @keyframes flipover {
    from {
      transform: translateY(-10px) rotateY(90deg);
    }
  }
  .editor input[type="number"] {
    width: 84px;
  }
  .editor .face {
    width: 72px;
  }
  .editor .worth {
    min-width: 70px;
  }
  /* the count total sits under the counts, which are inputs, so it lines up
     with their left edge rather than the column's right */
  .editor tfoot td {
    border-bottom: 0;
  }
  .editor tfoot .count {
    text-align: left;
    padding-left: 7px;
  }
  /* one strip of flat swatches instead of five native color wells: each is the
     color itself, and the native picker opens from the invisible input on top */
  .swatches {
    display: inline-flex;
    height: var(--control-h);
    border: var(--hair) solid var(--line-strong);
    vertical-align: middle;
    transition: border-color var(--dur-hover) var(--ease-out);
    /* a swatch is its color: windows high contrast mustn't paint over it */
    forced-color-adjust: none;
  }
  .swatches:hover {
    border-color: var(--muted);
  }
  .sw {
    position: relative;
    display: block;
    width: 26px;
    margin: 0;
    background: var(--c);
    cursor: pointer;
    outline: 0 solid transparent;
    outline-offset: 6px;
    transition:
      opacity var(--dur-press) var(--ease-out),
      var(--t-focus);
  }
  /* a finger needs a bigger swatch to land on */
  @media (pointer: coarse) {
    .sw {
      width: 36px;
    }
  }
  .sw + .sw {
    border-left: var(--hair) solid var(--line-strong);
  }
  /* pressed: the color gives a little, like a link's ink does */
  .sw:active {
    opacity: 0.75;
  }
  /* the picker inside can't show a ring (it's see-through), so its swatch
     wears the site's ring for it, over its neighbors */
  .sw:has(:focus-visible) {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
    z-index: 1;
  }
  /* when its column is too narrow for the table (a phone, or a small window
     beside the set list) each chip becomes a small labeled block instead of a
     row that runs off the edge: value and count up top, then face and design,
     then colors */
  .editor-box {
    container-type: inline-size;
  }
  @container (max-width: 720px) {
    .editor,
    .editor tbody,
    .editor tfoot {
      display: block;
    }
    /* in a wider window the blocks stay phone-sized instead of stretching */
    .editor {
      max-width: 520px;
    }
    .editor thead {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }
    .editor tbody tr {
      display: grid;
      grid-template-columns: 44px minmax(0, 4fr) minmax(0, 6fr) minmax(76px, auto);
      grid-template-areas:
        "pv v n rm"
        ". fc ds ."
        ". cl cl worth";
      gap: 8px 10px;
      align-items: end;
      padding: 10px 0;
      border-bottom: var(--hair) solid var(--line);
    }
    .editor td {
      padding: 0;
      border: 0;
    }
    .editor td[data-l]::before {
      content: attr(data-l);
      display: block;
      margin-bottom: 3px;
      font: var(--fs-xs) var(--font);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .editor .pv {
      grid-area: pv;
      align-self: start;
      width: auto;
    }
    .editor .v {
      grid-area: v;
    }
    .editor .n {
      grid-area: n;
    }
    .editor .rm {
      grid-area: rm;
      align-self: start;
      justify-self: end;
    }
    .editor .fc {
      grid-area: fc;
    }
    .editor .ds {
      grid-area: ds;
    }
    .editor .cl {
      grid-area: cl;
    }
    .editor .worth {
      grid-area: worth;
      min-width: 0;
      line-height: var(--control-h);
    }
    .editor .worth::before {
      line-height: 1.5;
      text-align: right;
    }
    .editor :is(input[type="number"], .face, select) {
      width: 100%;
    }
    .editor td[colspan] {
      grid-column: 1 / -1;
    }
    .editor tfoot tr {
      display: flex;
      gap: 14px;
      padding: 8px 0 0 54px;
    }
    .editor tfoot td:empty {
      display: none;
    }
    .editor tfoot .count {
      padding-left: 0;
    }
  }
  .sw input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    border: 0;
    padding: 0;
  }
  /* room beside every stack for the two halves of a shuffle (toys.ts SPLIT) */
  .case {
    display: flex;
    gap: 16px 36px;
    align-items: flex-end;
    padding: 16px;
    background: var(--felt);
    min-height: 120px;
    flex-wrap: wrap;
  }
  .case .col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: var(--felt-fg);
  }
</style>

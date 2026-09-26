<script lang="ts">
  // ctrl/cmd + k (or whatever the host picked in settings) from anywhere: type
  // a few letters of what you want to do.
  // pages add their own commands (commands.svelte.ts), so on the dealer screen
  // "bust mike" or "next level" is two keystrokes away.
  import { tick, untrack } from "svelte";
  import { fade, fly } from "svelte/transition";
  import Icon from "./Icon.svelte";
  import Kbd from "./Kbd.svelte";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import { allCommands, isPrompted, palette, type Command, type Prompted } from "$lib/commands.svelte";
  import { leave, rise } from "$lib/motion";
  import { play } from "$lib/sound";
  import { settings } from "$lib/settings.svelte";
  import { comboOf, hasModifier, typingIn, DEFAULT_PALETTE_KEY } from "$lib/keys";

  let q = $state("");
  let active = $state(0);
  /** a command that's waiting for its text (Add Player › ___) */
  let asking = $state<Prompted | null>(null);
  let input = $state<HTMLInputElement>();
  let list = $state<HTMLElement>();
  let returnTo: HTMLElement | null = null;

  const words = $derived(q.toLowerCase().split(/\s+/).filter(Boolean));

  // the menu as it stood when the palette opened. building it reads every game
  // and template out of the store, so it happens once an opening, and each
  // keystroke only filters it
  const commands = $derived(palette.open ? untrack(allCommands) : []);

  // every typed word has to start a word somewhere (so "mi" finds Mike, not
  // "eliminate"). words that land in the label itself rank higher than ones
  // that only hit the group or keywords.
  const tokens = (s: string) => s.toLowerCase().split(/[^\p{L}\p{N}$.+-]+/u).filter(Boolean);
  const matches = $derived.by(() => {
    if (asking) return [];
    if (!words.length) return commands;
    return commands
      .map((c) => {
        const label = tokens(c.label);
        const rest = tokens(`${c.group} ${"keywords" in c ? (c.keywords ?? "") : ""}`);
        const inLabel = words.filter((w) => label.some((t) => t.startsWith(w))).length;
        if (!words.every((w) => label.some((t) => t.startsWith(w)) || rest.some((t) => t.startsWith(w)))) return null;
        const score = (words.length - inLabel) * 2 + (label[0]?.startsWith(words[0]) ? 0 : 1) + (isPrompted(c) ? 0.5 : 0);
        return { c, score };
      })
      .filter((x) => x !== null)
      .sort((a, b) => a.score - b.score)
      .map((x) => x.c);
  });

  // shown in groups, but arrow keys walk one flat list
  const groups = $derived.by(() => {
    const out: { name: string; items: { c: Command | Prompted; i: number }[] }[] = [];
    matches.forEach((c, i) => {
      let g = out.find((x) => x.name === c.group);
      if (!g) out.push((g = { name: c.group, items: [] }));
      g.items.push({ c, i });
    });
    return out;
  });
  const flat = $derived(groups.flatMap((g) => g.items));

  $effect(() => {
    void q;
    active = 0;
  });

  // opened by the shortcut or by any button that sets palette.open
  $effect(() => {
    if (!palette.open) return;
    untrack(() => play("open")); // (reading the sound settings isn't a reason to rerun)
    returnTo ??= document.activeElement as HTMLElement | null;
    tick().then(() => input?.focus());
  });

  /** `ran`: a command just ran and makes its own sound, so no pop down */
  function close(ran = false) {
    if (!ran) play("close");
    palette.open = false;
    asking = null;
    q = "";
    returnTo?.focus?.();
    returnTo = null;
  }

  function choose(c: Command | Prompted) {
    if (isPrompted(c)) {
      play("tap");
      asking = c;
      q = "";
      input?.focus();
      return;
    }
    play("tap");
    close(true);
    c.run();
  }

  function submitAsking() {
    if (!asking || !q.trim()) return;
    const c = asking;
    const text = q.trim();
    close(true);
    c.run(text);
  }

  function onKey(e: KeyboardEvent) {
    // settings is listening for a new shortcut: every key is its
    if (palette.recording) return;
    const combo = settings.paletteKey || DEFAULT_PALETTE_KEY;
    if (comboOf(e) !== combo) return;
    // a key on its own (like /) still types in a text box, the search included
    if (!hasModifier(combo) && typingIn(e.target)) return;
    e.preventDefault();
    if (palette.open) close();
    else palette.open = true;
  }

  function onInputKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      if (asking) {
        asking = null;
        q = "";
      } else close();
    } else if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey && !asking)) {
      e.preventDefault();
      active = flat.length ? (active + 1) % flat.length : 0;
      play("tick", { n: active });
      scrollActive();
    } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey && !asking)) {
      e.preventDefault();
      active = flat.length ? (active - 1 + flat.length) % flat.length : 0;
      play("tick", { n: active });
      scrollActive();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (asking) submitAsking();
      else if (flat[active]) choose(flat[active].c);
    } else if (e.key === "Backspace" && asking && !q) {
      asking = null;
    }
  }

  async function scrollActive() {
    await tick();
    list?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }
</script>

<svelte:window onkeydown={onKey} />

{#if palette.open}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="scrim" transition:fade={leave()} onclick={() => close()}></div>
  <div class="palette float" role="dialog" aria-modal="true" aria-label="Commands" in:fly={rise(-8)} out:fade={leave()}>
    <div class="field">
      {#if asking}<span class="asking">{asking.label}<Icon icon={ChevronRight} size="1em" /></span>{/if}
      <input
        bind:this={input}
        bind:value={q}
        onkeydown={onInputKey}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls="palette-list"
        aria-activedescendant={flat[active] ? `cmd-${active}` : undefined}
        placeholder={asking ? asking.prompt : "What Do You Want to Do?"}
        autocomplete="off"
        spellcheck="false"
      />
    </div>
    {#if !asking}
      <div class="list" id="palette-list" role="listbox" bind:this={list}>
        {#each groups as g (g.name)}
          <div class="group eyebrow" role="presentation">{g.name}</div>
          {#each g.items as { c, i } (c.id)}
            <button
              class="item"
              class:on={i === active}
              id="cmd-{i}"
              data-i={i}
              role="option"
              aria-selected={i === active}
              data-sound="none"
              tabindex="-1"
              onpointermove={() => (active = i)}
              onclick={() => choose(c)}
            >
              <span>{c.label}{#if isPrompted(c)}…{/if}</span>
              {#if "hint" in c && c.hint}<span class="hint">{c.hint}</span>{/if}
            </button>
          {/each}
        {:else}
          <p class="empty none">Nothing matches “{q}”.</p>
        {/each}
      </div>
    {:else}
      <p class="none muted small">Type {asking.prompt}, then press Enter.</p>
    {/if}
    <div class="foot small muted">
      <span><Kbd k="↑" /><Kbd k="↓" /> Move</span>
      <span><Kbd k="Enter" /> Run</span>
      <span><Kbd k="Esc" /> {asking ? "Back" : "Close"}</span>
    </div>
  </div>
{/if}

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 70;
    background: var(--scrim);
  }
  /* the floating look (.float) at a bigger size, over the dimmed page */
  .palette {
    position: fixed;
    z-index: 71;
    /* a layer for good, so its text never changes weight when it stops moving (+layout.svelte) */
    will-change: transform;
    top: 12vh;
    left: 50%;
    translate: -50% 0;
    width: min(560px, calc(100vw - 32px));
    display: flex;
    flex-direction: column;
    /* dvh: shorter while a phone's keyboard is up, so the list stays above it */
    max-height: 70dvh;
  }
  .field {
    display: flex;
    align-items: center;
    border-bottom: var(--hair) solid var(--line);
    padding: 0 12px;
  }
  .field input {
    flex: 1;
    height: 46px;
    font-size: 16px;
    border: 0;
    background: transparent;
    padding: 0;
    outline: none;
  }
  .asking {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    margin-right: 8px;
    font-weight: bold;
    white-space: nowrap;
  }
  .list {
    overflow: auto;
    padding: 4px 0;
  }
  .group {
    padding: 8px 12px 2px;
  }
  .item {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    height: auto;
    min-height: 32px;
    padding: 6px 12px;
    background: none;
    border: 0;
    text-align: left;
    white-space: normal;
    transition: none;
  }
  .item:hover,
  .item:active {
    background: none;
    transform: none;
  }
  .item.on {
    background: var(--block-2);
  }
  /* windows high contrast paints over backgrounds: the system's highlight */
  @media (forced-colors: active) {
    .item.on {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
  .item:active {
    background: var(--block-3);
  }
  .hint {
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: var(--fs-sm);
    white-space: nowrap;
  }
  .none {
    margin: 0;
    padding: 12px;
  }
  .foot {
    display: flex;
    gap: 14px;
    border-top: var(--hair) solid var(--line);
    padding: 6px 12px;
  }
  .foot :global(kbd + kbd) {
    margin-left: 2px;
  }
</style>

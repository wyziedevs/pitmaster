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
  import { t } from "$lib/i18n";

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
  <div
    class="scrim fixed inset-0 z-[70] bg-[var(--scrim)]"
    transition:fade={leave()}
    onclick={() => close()}
  ></div>
  <div
    class="palette float fixed z-[71] top-[12vh] left-1/2 w-[min(560px,calc(100vw_-_32px))] flex flex-col max-h-[70dvh]"
    role="dialog"
    aria-modal="true"
    aria-label={t("nav.palette.ariaLabel")}
    in:fly={rise(-8)}
    out:fade={leave()}
  >
    <div class="field flex items-center border-b-[length:var(--hair)] border-solid border-line py-0 px-3">
      {#if asking}<span class="asking inline-flex items-center gap-0.5 me-2 font-bold whitespace-nowrap">{asking.label}<span class="inline-flex flip-rtl"><Icon icon={ChevronRight} size="1em" /></span></span>{/if}
      <input
        class="flex-1 h-[46px] text-[length:var(--fs-md)] border-0 bg-transparent p-0 outline-none"
        bind:this={input}
        bind:value={q}
        onkeydown={onInputKey}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls="palette-list"
        aria-activedescendant={flat[active] ? `cmd-${active}` : undefined}
        placeholder={asking ? asking.prompt : t("nav.palette.placeholder")}
        autocomplete="off"
        spellcheck="false"
      />
    </div>
    {#if !asking}
      <div class="list overflow-auto py-1 px-0" id="palette-list" role="listbox" bind:this={list}>
        {#each groups as g (g.name)}
          <div class="group eyebrow pt-2 px-3 pb-0.5" role="presentation">{g.name}</div>
          {#each g.items as { c, i } (c.id)}
            <button
              class="item flex justify-between gap-3 w-full h-auto min-h-8 py-1.5 px-3 bg-transparent border-0 text-start whitespace-normal transition-none"
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
              {#if "hint" in c && c.hint}<span class="hint text-muted font-mono text-[length:var(--fs-sm)] whitespace-nowrap">{c.hint}</span>{/if}
            </button>
          {/each}
        {:else}
          <p class="empty none m-0 p-3">{t("nav.palette.noResults", { query: q })}</p>
        {/each}
      </div>
    {:else}
      <p class="none muted small m-0 p-3">{t("nav.palette.typeThenEnter", { prompt: asking.prompt })}</p>
    {/if}
    <div class="foot small muted flex gap-3.5 border-t-[length:var(--hair)] border-solid border-line py-1.5 px-3">
      <span><Kbd k="↑" /><Kbd k="↓" /> {t("nav.palette.move")}</span>
      <span><Kbd k="Enter" /> {t("nav.palette.run")}</span>
      <span><Kbd k="Esc" /> {asking ? t("common.back") : t("common.close")}</span>
    </div>
  </div>
{/if}

<style>
  /* the floating look (.float) at a bigger size, over the dimmed page */
  .palette {
    /* a layer for good, so its text never changes weight when it stops moving (+layout.svelte) */
    will-change: transform;
    translate: -50% 0;
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
  .foot :global(kbd + kbd) {
    margin-left: 2px;
  }
</style>

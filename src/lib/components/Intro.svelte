<script module lang="ts">
  // closed without Don't Show Again: it stays shut until the next visit
  let closedThisVisit = false;
</script>

<script lang="ts">
  // the welcome: How It Works, over the home page, until the host says Don't
  // Show Again (saved, encrypted, with the rest of the settings). it's on the
  // help page for good.
  import Icon from "./Icon.svelte";
  import HowItWorks from "./HowItWorks.svelte";
  import Chip from "./Chip.svelte";
  import X from "@lucide/svelte/icons/x";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import { settings, saveSettings } from "$lib/settings.svelte";
  import { getChipSet, getDefaultChipSetId } from "$lib/store";
  import { play } from "$lib/sound";
  import { reducedMotion } from "$lib/motion";

  const chips = (getChipSet(getDefaultChipSetId())?.chips ?? []).slice(0, 5);

  let dialog = $state<HTMLDialogElement>();
  let go = $state<HTMLButtonElement>();
  let show = $state(settings.intro && !closedThisVisit);
  let leaving = $state(false);

  // the home page's own chips land first, then it comes up
  $effect(() => {
    if (!show || !dialog) return;
    const t = setTimeout(() => {
      dialog?.showModal();
      go?.focus();
      play("open");
    }, 420);
    return () => clearTimeout(t);
  });

  function close(forGood = false) {
    if (!dialog?.open || leaving) return;
    closedThisVisit = true;
    if (forGood) {
      settings.intro = false;
      saveSettings();
    }
    play(forGood ? "off" : "close");
    if (reducedMotion()) return finish();
    leaving = true;
    setTimeout(finish, 160);
  }
  function finish() {
    dialog?.close();
    leaving = false;
    show = false;
  }

  function onCancel(e: Event) {
    e.preventDefault();
    close();
  }
  // a click on the dim page around it
  function onBackdrop(e: MouseEvent) {
    if (e.target === dialog) close();
  }
  // a link inside goes somewhere else, so it gets out of the way
  function onLink(e: MouseEvent) {
    if ((e.target as Element).closest("a")) close();
  }
</script>

{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
  <dialog
    bind:this={dialog}
    class="intro float"
    class:leaving
    aria-labelledby="intro-title"
    oncancel={onCancel}
    onclick={(e) => (onBackdrop(e), onLink(e))}
  >
    <div class="head">
      <div class="chips" aria-hidden="true">
        {#each chips as c, i (c.id)}<span style:--i={i}><Chip chip={c} size={30} text="" /></span>{/each}
      </div>
      <button class="icon-btn x" data-sound="none" onclick={() => close()}><Icon icon={X} label="Close" /></button>
    </div>
    <h2 id="intro-title">Welcome to the Table.</h2>
    <p class="lede muted">PitMaster runs your poker game, whatever its size. Four steps and you're dealing.</p>

    <HowItWorks deal />

    <div class="foot">
      <button class="link muted" data-sound="none" onclick={() => close(true)}>Don't Show This Again</button>
      <button class="go big" data-sound="none" onclick={() => close()} bind:this={go}>Let's Play<Icon icon={ArrowRight} /></button>
    </div>
    <p class="small muted note">This lives in <a href="/help">Help</a> too, at the bottom of every page.</p>
  </dialog>
{/if}

<style>
  /* the floating look (.float), over the page dimmed the way the palette dims it */
  .intro {
    width: min(540px, calc(100vw - 32px));
    max-height: calc(100dvh - 32px);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 18px 22px 16px;
    color: var(--fg);
    animation: up var(--dur-pop) var(--ease-out-expo);
  }
  .intro::backdrop {
    background: var(--scrim);
    animation: dim 300ms var(--ease-out);
  }
  .intro.leaving {
    animation: down 160ms var(--ease-out) forwards;
  }
  .intro.leaving::backdrop {
    animation: dim 160ms var(--ease-out) reverse forwards;
  }
  @keyframes up {
    from {
      opacity: 0;
      transform: translateY(18px) scale(0.98);
    }
  }
  @keyframes down {
    to {
      opacity: 0;
      transform: translateY(10px);
    }
  }
  @keyframes dim {
    from {
      opacity: 0;
    }
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
  }
  /* a few chips tossed onto the felt as it opens */
  .chips {
    display: flex;
    gap: 6px;
    padding-top: 4px;
  }
  .chips span {
    animation: toss var(--dur-settle) var(--ease-out-expo) calc(120ms + var(--i) * 55ms) backwards;
  }
  @keyframes toss {
    from {
      opacity: 0;
      transform: translateY(-16px) rotate(-50deg);
    }
  }
  .x {
    margin: -6px -10px 0 0;
  }
  /* the welcome's display title: bigger than a section heading, no rule under it */
  h2 {
    font-size: 26px;
    border: 0;
    padding: 0;
    margin: 0 0 4px;
  }
  .lede {
    margin: 0 0 18px;
  }
  .foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px 16px;
    flex-wrap: wrap;
    margin-top: 22px;
    padding-top: 14px;
    border-top: var(--hair) solid var(--line);
  }
  /* the way in: felt, like the table */
  .go {
    background: var(--felt);
    border-color: var(--felt);
    color: var(--felt-fg);
  }
  .go:hover {
    background: oklch(from var(--felt) calc(l + 0.04) c h);
    border-color: oklch(from var(--felt) calc(l + 0.04) c h);
  }
  .go:active {
    background: oklch(from var(--felt) calc(l - 0.03) c h);
  }
  .note {
    margin: 10px 0 0;
  }
  /* a phone: it comes up from the bottom, full width, like a sheet */
  @media (max-width: 560px) {
    .intro {
      width: 100%;
      max-width: none;
      margin: auto 0 0;
      max-height: calc(100dvh - 24px);
      padding: 16px 16px calc(16px + env(safe-area-inset-bottom));
      border-width: var(--hair) 0 0;
      animation-name: sheet;
    }
    @keyframes sheet {
      from {
        transform: translateY(100%);
      }
    }
    .foot {
      flex-direction: column-reverse;
      align-items: stretch;
    }
    .go {
      width: 100%;
    }
    .foot .link {
      align-self: center;
    }
  }
</style>

<script lang="ts">
  // the tv's own buttons: sound and fullscreen, with a key for each. they show
  // for a few seconds at a time: when the board opens, and whenever a mouse
  // moves, a finger taps or a remote's key is pressed (`idle` is the rest)
  import Icon from "../Icon.svelte";
  import Kbd from "../Kbd.svelte";
  import VolumeX from "@lucide/svelte/icons/volume-x";
  import Volume2 from "@lucide/svelte/icons/volume-2";
  import Maximize from "@lucide/svelte/icons/maximize";
  import type { Cues } from "./cues.svelte";
  import { t } from "$lib/i18n";

  let { cues, status = "", idle = $bindable(false) }: { cues: Cues; status?: string; idle?: boolean } = $props();

  let idleTimer: ReturnType<typeof setTimeout>;
  function poke() {
    idle = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => (idle = true), 3000);
  }
  $effect(() => {
    poke();
    return () => clearTimeout(idleTimer);
  });

  // an iPhone has no fullscreen for pages at all, so there's no button to press there
  const canFullscreen = document.fullscreenEnabled;
  function fullscreen() {
    if (!canFullscreen) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  }

  function onKey(e: KeyboardEvent) {
    poke();
    cues.wake();
    // Ctrl F is the browser's find, not fullscreen
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key.toLowerCase();
    if (key === "f") fullscreen();
    if (key === "s") cues.soundOn ? cues.off() : cues.on();
  }
</script>

<svelte:window
  onmousemove={poke}
  onkeydown={onKey}
  onpointerdown={() => {
    poke();
    cues.wake();
  }}
/>

<div class="controls" class:idle>
  {#if status}<span class="status">{status}</span>{/if}
  <!-- turning sound on answers with the tv's own chime, at the tv's volume -->
  {#if !cues.soundOn}<button data-sound="none" onclick={() => cues.on()}><Icon icon={VolumeX} />{t("tv.controls.enableSound")} <Kbd k="S" class="keys-hint" /></button>
  {:else if !cues.audioOk}<button class="ask" data-sound="none" onclick={() => cues.on()}><Icon icon={VolumeX} />{t("tv.controls.clickForSound")}</button>
  {:else}<button data-sound="off" onclick={() => (cues.soundOn = false)}><Icon icon={Volume2} />{t("tv.controls.soundOn")} <Kbd k="S" class="keys-hint" /></button>{/if}
  {#if canFullscreen}<button onclick={fullscreen}><Icon icon={Maximize} />{t("tv.controls.fullscreen")} <Kbd k="F" class="keys-hint" /></button>{/if}
</div>

<style>
  /* clear of a phone's rounded corners and home bar */
  .controls {
    position: fixed;
    right: calc(10px + env(safe-area-inset-right));
    bottom: calc(10px + env(safe-area-inset-bottom));
    display: flex;
    gap: 6px;
    align-items: center;
    transition: opacity var(--dur-slow) var(--ease-out);
  }
  .controls.idle {
    opacity: 0;
  }
  /* until the browser allows sound, the ask stays up even when idle */
  .controls.idle:has(.ask) {
    opacity: 1;
  }
  .status {
    color: var(--tv-muted);
    font-size: var(--fs-sm);
  }
  .controls button {
    background: var(--tv-raise);
    color: var(--tv-fg);
    border-color: var(--tv-line);
    font-size: var(--fs-sm);
  }
  .controls button:hover {
    border-color: var(--tv-muted);
  }
  .controls :global(kbd) {
    border-color: var(--tv-line);
    background: var(--tv-bg);
  }
  /* a phone, or any short screen (a phone on its side): one column that
     scrolls, clock first, so nothing gets cut off at the bottom */
  @media (max-width: 700px), (max-height: 500px) {
    /* which ride along the bottom as a bar of their own, so the board
       scrolling under them never shows through the words */
    .controls {
      left: 0;
      right: 0;
      bottom: 0;
      padding: 8px calc(10px + env(safe-area-inset-right)) calc(8px + env(safe-area-inset-bottom))
        calc(10px + env(safe-area-inset-left));
      justify-content: flex-end;
      background: var(--tv-bg);
      border-top: var(--hair) solid var(--tv-line);
    }
    .status {
      margin-right: auto;
    }
  }
</style>

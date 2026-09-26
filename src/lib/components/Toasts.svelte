<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import Icon from "./Icon.svelte";
  import Check from "@lucide/svelte/icons/check";
  import Info from "@lucide/svelte/icons/info";
  import CircleAlert from "@lucide/svelte/icons/circle-alert";
  import { toasts, dismiss } from "$lib/toast.svelte";
  import { rise, leave, reorder } from "$lib/motion";

  const ICONS = { ok: Check, info: Info, bad: CircleAlert };
</script>

<div class="toasts" role="status" aria-live="polite">
  {#each toasts as t (t.id)}
    <button class="toast float" data-k={t.kind} data-sound="close" onclick={() => dismiss(t.id)} in:fly={rise(10)} out:fade={leave()} animate:flip={reorder()}>
      <Icon icon={ICONS[t.kind]} />{t.text}
    </button>
  {/each}
</div>

<style>
  .toasts {
    position: fixed;
    left: 50%;
    bottom: calc(16px + env(safe-area-inset-bottom));
    transform: translateX(-50%);
    z-index: 60;
    /* a layer for good, so its text never changes weight when it stops moving (+layout.svelte) */
    will-change: transform;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    pointer-events: none;
    width: max-content;
    max-width: calc(100vw - 32px);
  }
  /* the floating look (.float). a click puts it away, so it answers like a
     button: the face darkens a step under the pointer and gives when pressed */
  .toast {
    pointer-events: auto;
    height: auto;
    min-height: var(--control-h);
    padding: 6px 12px;
    white-space: normal;
    text-align: left;
    color: var(--fg);
    transition:
      background-color var(--dur-hover) var(--ease-out),
      scale var(--dur-press) var(--ease-out),
      var(--t-focus);
  }
  .toast:hover {
    background: var(--block);
    border-color: var(--fg);
  }
  .toast:active {
    background: var(--block-2);
    transform: none;
    scale: 0.97;
  }
  .toast[data-k="ok"] :global(.icon) {
    color: var(--good);
  }
  .toast[data-k="bad"] {
    border-color: var(--accent);
  }
  .toast[data-k="bad"] :global(.icon) {
    color: var(--accent);
  }
</style>

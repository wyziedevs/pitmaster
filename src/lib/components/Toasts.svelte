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

<div
  class="toasts fixed left-1/2 bottom-[calc(16px_+_env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 pointer-events-none w-max max-w-[calc(100vw_-_32px)]"
  role="status"
  aria-live="polite"
>
  {#each toasts as t (t.id)}
    <button
      class="toast float pointer-events-auto h-auto min-h-[var(--control-h)] py-1.5 px-3 whitespace-normal text-left text-fg hover:bg-block hover:border-fg active:bg-block-2"
      data-k={t.kind}
      data-sound="close"
      onclick={() => dismiss(t.id)}
      in:fly={rise(10)}
      out:fade={leave()}
      animate:flip={reorder()}
    >
      <Icon icon={ICONS[t.kind]} />{t.text}
    </button>
  {/each}
</div>

<style>
  .toasts {
    /* a layer for good, so its text never changes weight when it stops moving (+layout.svelte) */
    will-change: transform;
    transform: translateX(-50%);
  }
  /* the floating look (.float). a click puts it away, so it answers like a
     button: the face darkens a step under the pointer and gives when pressed */
  .toast {
    transition:
      background-color var(--dur-hover) var(--ease-out),
      scale var(--dur-press) var(--ease-out),
      var(--t-focus);
  }
  .toast:active {
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

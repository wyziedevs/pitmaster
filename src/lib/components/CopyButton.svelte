<script lang="ts">
  // copies something and says so for a beat (Copied, and the success sound),
  // then goes back to being a button: the recap, the tv link, the tv code
  import type { Snippet } from "svelte";
  import Icon from "./Icon.svelte";
  import Copy from "@lucide/svelte/icons/copy";
  import Check from "@lucide/svelte/icons/check";
  import { play } from "$lib/sound";
  import { toast } from "$lib/toast.svelte";

  let {
    text,
    label = "Copy",
    icon = true,
    link = false,
    plain = false,
    class: cls = "",
    title,
    children,
  }: {
    /** what goes on the clipboard, or a function that builds it on the press (the recap) */
    text: string | (() => string);
    label?: string;
    /** the copy icon before the label; off in a row of plain links (the check still shows once it's copied) */
    icon?: boolean;
    /** a link button instead of a regular one */
    link?: boolean;
    /** no face of its own: `children` is the whole button (the tv code) */
    plain?: boolean;
    class?: string;
    title?: string;
    /** the button's face, told whether it just copied */
    children?: Snippet<[boolean]>;
  } = $props();

  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout>;

  async function copy() {
    try {
      await navigator.clipboard.writeText(typeof text === "function" ? text() : text);
    } catch {
      toast("Couldn't copy. The browser blocked the clipboard.", "bad");
      return;
    }
    play("success");
    copied = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied = false), 1600);
  }
</script>

<!-- no press sound: the success (or the toast's error) comes once the clipboard answers -->
<button type="button" class={cls} class:link class:plain class:done={copied} data-sound="none" {title} aria-live="polite" onclick={copy}>
  {#if children}{@render children(copied)}
  {:else if copied}<Icon icon={Check} size={link ? "1em" : undefined} />Copied
  {:else}{#if icon}<Icon icon={Copy} size={link ? "1em" : undefined} />{/if}{label}{/if}
</button>

<style>
  .done {
    color: var(--good);
  }
  .done :global(.icon) {
    animation: pop var(--dur-pop) var(--ease-out-expo);
  }
  /* nothing but what's inside, still a key: it sinks when pressed and takes
     the focus ring like any other control */
  .plain {
    all: unset;
    display: inline-flex;
    align-items: baseline;
    gap: 12px;
    cursor: pointer;
    transition:
      color var(--dur-hover) var(--ease-out),
      transform var(--dur-press) var(--ease-out),
      var(--t-focus);
  }
  .plain:active {
    transform: translateY(1px);
  }
  .plain:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
</style>

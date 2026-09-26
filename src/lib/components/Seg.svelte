<script lang="ts" generics="T extends string">
  import type { Component } from "svelte";
  import Icon from "./Icon.svelte";
  import { play } from "$lib/sound";

  // segmented choice: buttons butted together, with one frame that slides to
  // whichever is picked instead of blinking from one to the next
  let {
    value,
    options,
    onpick,
    labelledby,
  }: {
    value: T;
    options: { id: T; label: string; icon?: Component<any>; hint?: string }[];
    onpick: (v: T, e: MouseEvent) => void;
    labelledby: string;
  } = $props();

  let el = $state<HTMLDivElement>();
  let x = $state(0);
  let w = $state(0);
  let ready = $state(false);

  // measured to the fraction: a hairline is half a pixel on a sharp screen, and
  // rounding would leave the frame a sliver off the dividers
  function measure() {
    const b = el?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!el || !b) return;
    const box = el.getBoundingClientRect();
    const r = b.getBoundingClientRect();
    x = r.left - box.left;
    w = r.width + parseFloat(getComputedStyle(b).borderLeftWidth); // cover the next button's divider too
  }

  $effect(() => {
    value;
    measure();
  });

  $effect(() => {
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // first position snaps; only real picks slide
    requestAnimationFrame(() => (ready = true));
    return () => ro.disconnect();
  });

  function pick(o: T, e: MouseEvent) {
    if (o === value) return;
    play(options.findIndex((p) => p.id === o) > options.findIndex((p) => p.id === value) ? "on" : "off");
    onpick(o, e);
  }
</script>

<div class="seg" role="group" aria-labelledby={labelledby} bind:this={el}>
  <span class="thumb face" class:ready style:transform="translateX({x}px)" style:width="{w}px" aria-hidden="true"></span>
  {#each options as o (o.id)}
    <button type="button" aria-pressed={value === o.id} data-sound="none" onclick={(e) => pick(o.id, e)}>
      {#if o.icon}<Icon icon={o.icon} />{/if}{o.label}{#if o.hint}<span class="muted">{o.hint}</span>{/if}
    </button>
  {/each}
  <span class="thumb edge" class:ready style:transform="translateX({x}px)" style:width="{w}px" aria-hidden="true"></span>
</div>

<style>
  .seg {
    position: relative;
    display: inline-flex;
    isolation: isolate;
    background: var(--block-2);
    border: var(--hair) solid var(--line-strong);
    border-left: 0;
    vertical-align: middle;
    justify-self: start;
    align-self: center;
    /* never wider than where it sits: on a narrow phone the labels wrap */
    max-width: 100%;
  }
  .seg button {
    position: relative;
    z-index: 1;
    min-width: 0;
    height: auto;
    min-height: calc(var(--control-h) - 2 * var(--hair));
    white-space: normal;
    line-height: 1.2;
    background: transparent;
    border: 0;
    border-left: var(--hair) solid var(--line-strong);
  }
  /* the others darken a step under the pointer and sink when pressed (the
     global button press); the dividers stay put either way */
  .seg button:hover {
    background: var(--block-3);
    border-color: var(--line-strong);
  }
  .seg button:active {
    background: var(--line);
  }
  /* the picked one is already down: its face is the thumb's, so it neither
     darkens nor sinks */
  .seg button[aria-pressed="true"] {
    cursor: default;
  }
  .seg button[aria-pressed="true"]:is(:hover, :active) {
    transform: none;
    background: transparent;
  }
  .seg .muted {
    margin-left: 2px;
  }
  /* the picked face sits under the labels, its edge sits over the dividers */
  .thumb {
    position: absolute;
    top: calc(-1 * var(--hair));
    bottom: calc(-1 * var(--hair));
    left: 0;
    pointer-events: none;
  }
  .thumb.ready {
    transition:
      transform var(--dur-move) var(--ease-out-expo),
      width var(--dur-move) var(--ease-out-expo);
  }
  .face {
    z-index: 0;
    background: var(--field);
  }
  .edge {
    z-index: 2;
    border: var(--hair) solid var(--fg);
  }
</style>

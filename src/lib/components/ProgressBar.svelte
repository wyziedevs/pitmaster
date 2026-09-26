<script lang="ts">
  // a thin bar filling left to right: how far through the level. it's the same
  // thing the clock already says in numbers, so it stays out of the way of a
  // screen reader unless it's given a label. --track and --fill recolor it,
  // --bar-h sets how thick it is.
  let { value, max = 1, label }: { value: number; max?: number; label?: string } = $props();

  const share = $derived(max > 0 ? Math.min(1, Math.max(0, value / max)) : 0);
</script>

<div
  class="progress"
  role={label ? "progressbar" : undefined}
  aria-label={label}
  aria-valuemin={label ? 0 : undefined}
  aria-valuemax={label ? 100 : undefined}
  aria-valuenow={label ? Math.round(share * 100) : undefined}
  aria-hidden={label ? undefined : "true"}
>
  <i style:transform="scaleX({share})"></i>
</div>

<style>
  .progress {
    height: var(--bar-h, 4px);
    background: var(--track, var(--block-2));
  }
  /* scaled, not resized: the clock ticks 4x a second and the bar glides between */
  i {
    display: block;
    height: 100%;
    background: var(--fill, var(--fg));
    transform-origin: left;
    transition: transform var(--dur-move) linear;
  }
</style>

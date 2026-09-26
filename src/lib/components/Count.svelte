<script lang="ts">
  // a number that counts to its new value instead of jumping: the prize pool
  // ticking up when a rebuy lands. whole numbers stay whole on the way.
  import { untrack } from "svelte";
  import { Tween } from "svelte/motion";
  import { quartOut } from "svelte/easing";
  import { reducedMotion } from "$lib/motion";

  let { value, format }: { value: number; format: (n: number) => string } = $props();

  const n = new Tween(untrack(() => value), { easing: quartOut });
  $effect(() => {
    const v = value;
    // a hidden tab gets no animation frames, and reduced motion wants none:
    // both take the new number straight away (a zero duration skips the frame loop)
    untrack(() => {
      if (n.target !== v) n.set(v, { duration: reducedMotion() || document.hidden ? 0 : 520 });
    });
  });
  const whole = $derived(Number.isInteger(value));
  const shown = $derived(n.current === value ? value : whole ? Math.round(n.current) : Math.round(n.current * 100) / 100);
</script>

{format(shown)}

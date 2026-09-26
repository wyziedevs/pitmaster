<script lang="ts">
  import type { Component } from "svelte";

  // every ui glyph goes through here so size + stroke stay consistent.
  // square caps / miter joins: sharper than lucide's friendly default, fits the raw shell.
  let { icon: I, size = "1.15em", label }: { icon: Component<any>; size?: string | number; label?: string } = $props();
</script>

<I
  class="icon"
  {size}
  strokeWidth={2}
  stroke-linecap="square"
  stroke-linejoin="miter"
  aria-hidden={label ? undefined : "true"}
  aria-label={label}
  role={label ? "img" : undefined}
/>

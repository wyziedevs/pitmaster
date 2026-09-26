<!-- a clock face: the colons sit a touch higher than the text baseline, where a
     real clock puts them (.colon in app.css). the dealer screen and the tv both
     draw their clocks with it. -->
<script lang="ts">
  let { value }: { value: string } = $props();
</script>

{#each value.split(":") as part, i (i)}{#if i}<span class="colon">:</span>{/if}{part}{/each}

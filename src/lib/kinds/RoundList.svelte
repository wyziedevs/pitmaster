<script lang="ts">
  // the rounds so far, newest first, and taking the last one back
  import Icon from "$lib/components/Icon.svelte";
  import Undo2 from "@lucide/svelte/icons/undo-2";
  import { t } from "$lib/i18n";

  let { lines, ontakeback }: { lines: string[]; ontakeback: () => void } = $props();
</script>

{#if lines.length}
  <div class="part mt-[22px]">
    <div class="spread">
      <h2>{t("gamePlay.dice.roundsHeading")}</h2>
      <button class="link small" data-sound="none" onclick={ontakeback}><Icon icon={Undo2} size="1em" />{t("gamePlay.dice.takeBack")}</button>
    </div>
    <ol class="small rounds" reversed>
      {#each [...lines].reverse() as text, i (lines.length - i)}<li>{text}</li>{/each}
    </ol>
  </div>
{/if}

<style>
  .rounds {
    margin: 0;
    padding-inline-start: 2em;
    max-height: 320px;
    overflow: auto;
  }
  .rounds li {
    padding: 2px 0;
  }
</style>

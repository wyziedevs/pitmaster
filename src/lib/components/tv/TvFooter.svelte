<script lang="ts">
  // the board's bottom line: the game's chips (a poker board's `legend`), the
  // house rules, and a qr code for phones to follow along
  import type { Snippet } from "svelte";
  import { fly } from "svelte/transition";
  import QrCode from "../QrCode.svelte";
  import { rise } from "$lib/motion";
  import { t } from "$lib/i18n";

  let { notes, followUrl, legend }: { notes: string; followUrl: string; legend?: Snippet } = $props();

  // house rules: two fit on a line; more take turns, one every ten seconds
  const rules = $derived(notes.split("\n").map((r) => r.trim()).filter(Boolean));
  let ruleAt = $state(0);
  $effect(() => {
    if (rules.length <= 2) return;
    const id = setInterval(() => ruleAt++, 10000);
    return () => clearInterval(id);
  });
</script>

{#if legend || rules.length || followUrl}
  <footer class="foot">
    {@render legend?.()}
    {#if rules.length > 2}
      <p class="rules"><span class="k">{t("tv.rules.houseRules")}</span> {#key ruleAt % rules.length}<span class="rule" in:fly={rise(10)}>{rules[ruleAt % rules.length]}</span>{/key}</p>
    {:else if rules.length}
      <p class="rules"><span class="k">{t("tv.rules.houseRules")}</span> {rules.join(" · ")}</p>
    {/if}
    {#if followUrl}
      <figure class="follow">
        <QrCode text={followUrl} label={t("tv.phone.qrLabel")} size="max(64px, calc(var(--u) * 6.5))" />
        <figcaption>{t("tv.phone.follow")}</figcaption>
      </figure>
    {/if}
  </footer>
{/if}

<style>
  /* labels: small, tracked, uppercase through css */
  .k {
    display: block;
    color: var(--tv-muted);
    font-size: max(12px, calc(var(--u) * 1.05));
    font-weight: 400;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    line-height: 1.3;
  }
  /* ---------- the footer: this game's chips and the house rules ---------- */
  .foot {
    grid-area: foot;
    border-top: var(--hair) solid var(--tv-line);
    padding: calc(var(--u) * 1.1) calc(var(--u) * 2);
    display: flex;
    gap: calc(var(--u) * 3);
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    font-size: max(13px, calc(var(--u) * 1.3));
  }
  .foot :global(.legend) {
    gap: calc(var(--u) * 1.4);
  }
  .foot :global(.legend b) {
    font-family: var(--font);
    font-size: 1.05em;
  }
  .rules {
    margin: 0;
    max-width: 60ch;
    text-align: right;
    font-size: 1.1em;
  }
  .rules .k {
    display: inline;
    margin-right: 0.8em;
    font-size: 0.8em;
  }
  .rule {
    display: inline-block;
  }
  .follow {
    margin: 0;
    display: flex;
    align-items: center;
    gap: calc(var(--u) * 0.9);
    color: var(--tv-muted);
    font-size: 0.8em;
    line-height: 1.25;
    max-width: 9em;
  }
  .rules + .follow {
    margin-left: calc(var(--u) * -1);
  }
  /* a phone, or any short screen (a phone on its side): one column that
     scrolls, clock first, so nothing gets cut off at the bottom */
  @media (max-width: 700px), (max-height: 500px) {
    /* room under the chips for the sound and fullscreen buttons */
    .foot {
      justify-content: center;
      padding-bottom: calc(56px + env(safe-area-inset-bottom));
    }
    .rules {
      text-align: center;
    }
  }
</style>

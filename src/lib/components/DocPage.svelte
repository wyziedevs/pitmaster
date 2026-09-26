<script lang="ts">
  import type { Snippet } from "svelte";
  import { t } from "$lib/i18n";

  // the pages that are for reading (help, privacy, terms): one readable column
  // in the middle of the page, a quiet line under the title (the date, or what
  // the page is), and another page linked at the bottom
  let {
    title,
    sub,
    other,
    children,
  }: { title: string; sub: string; other: { href: string; label: string }; children: Snippet } = $props();
</script>

<svelte:head><title>{title} · PitMaster</title></svelte:head>

<article class="doc mx-auto max-w-[84ch]">
  <header>
    <h1>{title}</h1>
    <p class="muted mb-[18px]">{sub}</p>
  </header>
  {@render children()}
  <p class="small muted end mt-10">
    {t("nav.docPage.footerPrefix")} <a href="https://wyzie.io" target="_blank" rel="noopener">Wyzie LLC</a>{t("nav.docPage.footerMiddle")}
    <a href="https://github.com/wyziedevs/pitmaster" target="_blank" rel="noopener">GitHub</a>{t("nav.docPage.codeSuffix")}{t("nav.docPage.footerSeeAlso")} <a href={other.href}>{other.label}</a>.
  </p>
</article>

<style>
  /* plain text all the way down: no rules under the headings or above the end */
  .doc :global(h2) {
    margin: 30px 0 8px;
    padding-bottom: 0;
    border-bottom: 0;
  }
  .doc :global(h3) {
    margin: 18px 0 4px;
    padding-bottom: 0;
    border-bottom: 0;
  }
  .doc :global(h2 + h3) {
    margin-top: 8px;
  }
  .doc :global(p),
  .doc :global(li) {
    line-height: 1.65;
  }
  .doc :global(ul) {
    padding-left: 20px;
  }
  .doc :global(li + li) {
    margin-top: 4px;
  }
  /* the short version, set apart so it's what people read first */
  .doc :global(.short) {
    margin: 0 0 8px;
  }
  .doc :global(.short ul) {
    margin: 6px 0 0;
  }
</style>

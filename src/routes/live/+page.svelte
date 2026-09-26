<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import { goto } from "$app/navigation";
  import { play } from "$lib/sound";
  import { cleanCode, CODE_LENGTH } from "$lib/crypto";
  import { t } from "$lib/i18n";

  let code = $state("");
  const clean = $derived(cleanCode(code));

  // the code box types like a keypad
  function key(e: KeyboardEvent) {
    if (e.key.length === 1 && /[a-z0-9]/i.test(e.key)) play("key");
    else if (e.key === "Backspace" && code) play("soft");
  }

  // the code goes after the #, so it never reaches a server
  function go(e: SubmitEvent) {
    e.preventDefault();
    if (clean.length === CODE_LENGTH) goto(`/tv#${clean}`);
  }
</script>

<svelte:head><title>Put a Poker Game on Any TV · PitMaster</title></svelte:head>

<h1>{t("tv.enterCode.title")}</h1>
<p class="muted">{t("tv.enterCode.introBefore")}<b>{t("tv.panel.goLive")}</b>{t("tv.enterCode.introAfter")}</p>

<form onsubmit={go} class="row" autocomplete="off">
  <input type="text" bind:value={code} maxlength={CODE_LENGTH + 1} placeholder="ABCD 2345" autocomplete="off" autocapitalize="characters" spellcheck="false" class="code w-[7.2em] uppercase tracking-[0.12em] py-1.5 px-2.5 h-auto placeholder:opacity-[0.35]" onkeydown={key} aria-label={t("tv.enterCode.codeAriaLabel")} />
  <button class="big h-auto min-h-[var(--control-h-big)] self-stretch" disabled={clean.length !== CODE_LENGTH} title={clean.length === CODE_LENGTH ? undefined : t("tv.enterCode.typeAllChars", { n: String(CODE_LENGTH) })}>{t("tv.enterCode.showIt")}<Icon icon={ArrowRight} /></button>
</form>
<p class="small muted">{t("tv.enterCode.encryptedNote")}<br /><a href="/privacy#tv">{t("tv.enterCode.howItWorks")}</a></p>

<style>
  /* the same size as the code on the dealer screen (TvPanel), wide enough for
     all eight characters and the space between the halves */
  .code {
    /* all eight characters fit even the narrowest phone */
    font: bold min(44px, 11vw) var(--font-mono);
  }
</style>

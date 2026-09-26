<script lang="ts">
  import Icon from "./Icon.svelte";
  import LockOpen from "@lucide/svelte/icons/lock-open";
  import { unlock, waitLeft, forgetAll } from "$lib/lock.svelte";
  import { time } from "$lib/now.svelte";
  import { clock } from "$lib/util";
  import { play } from "$lib/sound";
  import { replay } from "$lib/motion";
  import { t } from "$lib/i18n";

  let passcode = $state("");
  let busy = $state(false);
  let wrong = $state(false);
  let misses = $state(0); // each wrong try shakes the box, like a door that won't open
  let until = $state(Date.now() + waitLeft());
  const wait = $derived(Math.max(0, until - time.now));
  let box = $state<HTMLInputElement>();

  $effect(() => {
    if (!wait) box?.focus();
  });

  async function go(e: SubmitEvent) {
    e.preventDefault();
    if (!passcode || busy || wait) return;
    busy = true;
    const ok = await unlock(passcode);
    busy = false;
    if (ok) return play("unlock");
    play("error");
    passcode = "";
    wrong = true;
    misses++;
    until = Date.now() + waitLeft();
  }

  function forget() {
    if (!confirm(t("nav.lockScreen.forgetConfirm"))) return;
    forgetAll();
  }
</script>

<svelte:head><title>{t("nav.lockScreen.headTitle")} · PitMaster</title></svelte:head>

<h1>{t("nav.lockScreen.title")}</h1>
<p class="measure">{t("nav.lockScreen.body")}</p>
<form class="row" onsubmit={go} use:replay={[misses, "shake"]}>
  <!-- password managers file a passcode under a name; Settings uses the same one -->
  <input type="text" autocomplete="username" value="PitMaster" hidden />
  <input
    bind:this={box}
    type="password"
    bind:value={passcode}
    autocomplete="current-password"
    placeholder={t("nav.lockScreen.passcodePlaceholder")}
    aria-label={t("nav.lockScreen.passcodePlaceholder")}
    aria-invalid={wrong}
    aria-describedby="lock-note"
    disabled={!!wait}
  />
  <!-- (it clicks open, or doesn't, once the passcode's been tried) -->
  <button data-sound="none" disabled={!passcode || busy || !!wait}><Icon icon={LockOpen} />{busy ? t("nav.lockScreen.unlocking") : t("nav.lockScreen.unlock")}</button>
</form>
<p id="lock-note" class="small" aria-live="polite">
  {#if wait}<span class="bad">{t("nav.lockScreen.tooManyTries", { time: clock(wait) })}</span>
  {:else if wrong}<span class="bad">{t("nav.lockScreen.wrongPasscode")}</span>{/if}
</p>
<p class="small muted measure">
  {t("nav.lockScreen.forgotPrefix")}
  <button class="link" data-sound="thud" onclick={forget}>{t("nav.lockScreen.forgotLinkText")}</button>{t("nav.lockScreen.forgotSuffix")}
</p>

<style>
  #lock-note {
    min-height: 1.5em;
    margin: 6px 0 14px;
  }
  form:global(.shake) {
    animation: shake var(--dur-slow) var(--ease-out);
  }
  @keyframes shake {
    20% {
      transform: translateX(-6px);
    }
    40% {
      transform: translateX(5px);
    }
    60% {
      transform: translateX(-3px);
    }
    80% {
      transform: translateX(1px);
    }
  }
</style>

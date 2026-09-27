<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import Copy from "@lucide/svelte/icons/copy";
  import Check from "@lucide/svelte/icons/check";
  import Send from "@lucide/svelte/icons/send";
  import Dealing from "./Dealing.svelte";
  import CopyButton from "./CopyButton.svelte";
  import Kbd from "./Kbd.svelte";
  import QrCode from "./QrCode.svelte";
  import { fade } from "svelte/transition";
  import { reveal, leave, slide } from "$lib/motion";
  import { toast } from "$lib/toast.svelte";
  import { play } from "$lib/sound";
  import type { Game } from "$lib/types";
  import { endLive, startLive } from "$lib/sync";
  import { showCode } from "$lib/crypto";
  import { logEvent } from "$lib/events";
  import { t } from "$lib/i18n";

  let { game = $bindable(), persist }: { game: Game; persist: () => void } = $props();

  let msg = $state("");
  let busy = $state(false);
  let err = $state("");

  // the code goes after the #, which browsers never send to a server
  const liveUrl = $derived(game.live ? `${location.origin}/tv#${game.live.code}` : "");
  const onLocalhost = $derived(/localhost|127\.0\.0\.1/.test(location.hostname));

  function openTv() {
    window.open(`/game/${game.id}/tv`, `tv-${game.id}`, "popup,width=1280,height=720");
  }

  async function goLive() {
    busy = true;
    err = "";
    try {
      game.live = await startLive();
      logEvent(game, t("tv.panel.logWentLive", { code: showCode(game.live.code) }));
      persist();
      play("success");
    } catch (e) {
      err = t("tv.panel.codeError", { message: (e as Error).message });
      play("error");
    }
    busy = false;
  }

  // the server's copy is deleted right away; screens using the code stop updating
  function stopLive() {
    if (!game.live || !confirm(t("tv.panel.stopConfirm"))) return;
    endLive(game.live).catch(() => toast(t("tv.panel.stopServerError"), "bad"));
    logEvent(game, t("tv.panel.logStoppedSharing"));
    game.live = null;
    persist();
  }

  function send(text = msg) {
    game.message = text.trim() ? { text: text.trim(), at: Date.now() } : null;
    if (text.trim()) logEvent(game, t("tv.panel.logTvMessage", { text: text.trim() }));
    msg = "";
    persist();
    toast(text.trim() ? t("tv.panel.toastOnTv") : t("tv.panel.toastBannerCleared"), text.trim() ? "ok" : "info");
  }

  const quick = $derived([
    t("tv.panel.quick.onBreak"),
    t("tv.panel.quick.lastHandBeforeBreak"),
    t("tv.panel.quick.shuffleUpAndDeal"),
    t("tv.panel.quick.seatChange"),
    t("tv.panel.quick.backIn5"),
    t("tv.panel.quick.registrationClosing"),
  ]);
</script>

<div class="box">
  <h2>{t("tv.panel.title")}</h2>
  <p class="row">
    <button data-sound="open" onclick={openTv}>{t("tv.panel.openWindow")}<Icon icon={ExternalLink} /></button>
    <span class="small muted">{t("tv.panel.dragHint")} <Kbd k="F" /></span>
  </p>

  {#if game.live}
    {@const code = showCode(game.live.code)}
    <div class="live mb-2" in:slide={reveal()}>
      <div class="slab flex flex-wrap items-start gap-x-5 gap-y-3">
        <div class="grow min-w-0">
          <div class="small muted">{t("tv.panel.tvCodeInstructions", { host: location.host })}</div>
          <!-- the code itself is the copy button: it's what people ask for -->
          <CopyButton text={code} plain title={t("tv.panel.copyCodeTitle")}>
            {#snippet children(copied)}
              <span class="code mono font-bold text-[44px] tracking-[0.12em]">{code}</span>
              <span class="small with-icon" class:muted={!copied}>{#if copied}<Icon icon={Check} size="1em" />{t("common.copied")}{:else}<Icon icon={Copy} size="1em" />{t("common.copy")}{/if}</span>
            {/snippet}
          </CopyButton>
          <div class="small row">
            <a href={liveUrl} target="_blank">{liveUrl}</a>
            <CopyButton text={liveUrl} link label={t("tv.panel.copyLink")} />
          </div>
          <button class="link small" data-sound="thud" onclick={stopLive}>{t("tv.panel.stopSharing")}</button>
        </div>
        <!-- phones scan it to follow along: the same link, made on this computer -->
        <figure class="m-0 text-center">
          <QrCode text={liveUrl} label={t("tv.panel.qrLabel")} />
          <figcaption class="small muted mt-1">{t("tv.panel.qrCaption")}</figcaption>
        </figure>
      </div>
      {#if onLocalhost}
        <p class="small warn mt-2 mx-0">{t("tv.panel.localhostBefore")}<b>localhost</b>{t("tv.panel.localhostAfter", { openWindow: t("tv.panel.openWindow") })}</p>
      {/if}
    </div>
  {:else}
    <p class="row">
      <button onclick={goLive} disabled={busy}>{#if busy}<Dealing label={t("tv.panel.gettingCode")} />{t("tv.panel.gettingCode")}{:else}{t("tv.panel.goLiveAnyDevice")}{/if}</button>
      <span class="small muted">{t("tv.panel.goLiveHint")} <a href="/privacy#tv">{t("tv.panel.howItWorks")}</a></span>
    </p>
    {#if err}<p class="small bad" transition:slide={reveal()}>{err}</p>{/if}
  {/if}

  <h2 class="part mt-[22px]">{t("tv.panel.messageTable")}</h2>
  <form
    class="row"
    autocomplete="off"
    onsubmit={(e) => {
      e.preventDefault();
      send();
    }}
  >
    <input type="text" class="grow flex-1" bind:value={msg} placeholder={t("tv.panel.messagePlaceholder")} aria-label={t("tv.panel.messageAriaLabel")} autocomplete="off" />
    <button disabled={!msg.trim()} title={msg.trim() ? undefined : t("tv.panel.typeMessageFirst")}><Icon icon={Send} />{t("tv.panel.send")}</button>
  </form>
  <p class="row small">
    {#each quick as q (q)}<button class="link" onclick={() => send(q)}>{q}</button>{/each}
  </p>
  {#if game.message}
    <p class="small spread" transition:fade={leave()}><span>{t("tv.panel.showing")} <b>{game.message.text}</b></span><button class="link" data-sound="swish" onclick={() => send("")}>{t("common.clear")}</button></p>
  {/if}
</div>


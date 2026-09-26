<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import Copy from "@lucide/svelte/icons/copy";
  import Check from "@lucide/svelte/icons/check";
  import Send from "@lucide/svelte/icons/send";
  import Dealing from "./Dealing.svelte";
  import CopyButton from "./CopyButton.svelte";
  import Kbd from "./Kbd.svelte";
  import { fade } from "svelte/transition";
  import { reveal, leave, slide } from "$lib/motion";
  import { toast } from "$lib/toast.svelte";
  import { play } from "$lib/sound";
  import type { Game } from "$lib/types";
  import { endLive, startLive } from "$lib/sync";
  import { showCode } from "$lib/crypto";
  import { logEvent } from "$lib/game";

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
      logEvent(game, `Went live with code ${showCode(game.live.code)}`);
      persist();
      play("success");
    } catch (e) {
      err = `Couldn't get a code (${(e as Error).message}). Check the connection and try again.`;
      play("error");
    }
    busy = false;
  }

  // the server's copy is deleted right away; screens using the code stop updating
  function stopLive() {
    if (!game.live || !confirm("Stop sharing? Screens using the code stop updating, and the copy on the server is deleted.")) return;
    endLive(game.live).catch(() => toast("Couldn't reach the server to delete its copy. It's deleted on its own two days after the last update.", "bad"));
    logEvent(game, "Stopped sharing");
    game.live = null;
    persist();
  }

  function send(text = msg) {
    game.message = text.trim() ? { text: text.trim(), at: Date.now() } : null;
    if (text.trim()) logEvent(game, `TV message: ${text.trim()}`);
    msg = "";
    persist();
    toast(text.trim() ? "On the TV" : "Banner cleared", text.trim() ? "ok" : "info");
  }

  const quick = ["On Break", "Last Hand Before Break", "Shuffle Up and Deal", "Seat Change", "Back in 5 Minutes", "Registration Closing Soon"];
</script>

<div class="box">
  <h2>TV</h2>
  <p class="row">
    <button data-sound="open" onclick={openTv}>Open TV Window<Icon icon={ExternalLink} /></button>
    <span class="small muted">Drag it to the TV (HDMI) and press <Kbd k="F" /></span>
  </p>

  {#if game.live}
    {@const code = showCode(game.live.code)}
    <div class="live" in:slide={reveal()}>
      <div class="block">
        <div class="small muted">TV code: on any screen, open {location.host}/live and type</div>
        <!-- the code itself is the copy button: it's what people ask for -->
        <CopyButton text={code} plain title="Copy the Code">
          {#snippet children(copied)}
            <span class="code mono">{code}</span>
            <span class="small with-icon" class:muted={!copied}>{#if copied}<Icon icon={Check} size="1em" />Copied{:else}<Icon icon={Copy} size="1em" />Copy{/if}</span>
          {/snippet}
        </CopyButton>
        <div class="small row">
          <a href={liveUrl} target="_blank">{liveUrl}</a>
          <CopyButton text={liveUrl} link label="Copy Link" />
        </div>
        <button class="link small" data-sound="thud" onclick={stopLive}>Stop Sharing</button>
      </div>
      {#if onLocalhost}
        <p class="small warn">Other devices can't open <b>localhost</b>, and a TV needs https to unlock the game. Use Open TV Window here, or a deployed copy or an https tunnel.</p>
      {/if}
    </div>
  {:else}
    <p class="row">
      <button onclick={goLive} disabled={busy}>{#if busy}<Dealing label="Getting a Code" />Getting a Code{:else}Go Live (Any Device){/if}</button>
      <span class="small muted">Get a code for a smart TV, a Chromecast or phones. The game is encrypted before it's sent, and only screens with the code can read it. <a href="/privacy#tv">How it works</a></span>
    </p>
    {#if err}<p class="small bad" transition:slide={reveal()}>{err}</p>{/if}
  {/if}

  <h2 class="part">Message the Table</h2>
  <form
    class="row"
    autocomplete="off"
    onsubmit={(e) => {
      e.preventDefault();
      send();
    }}
  >
    <input type="text" class="grow" bind:value={msg} placeholder="Shows as a Banner on the TV" aria-label="TV Message" autocomplete="off" />
    <button disabled={!msg.trim()} title={msg.trim() ? undefined : "Type a message first"}><Icon icon={Send} />Send</button>
  </form>
  <p class="row small">
    {#each quick as q (q)}<button class="link" onclick={() => send(q)}>{q}</button>{/each}
  </p>
  {#if game.message}
    <p class="small spread" transition:fade={leave()}><span>Showing: <b>{game.message.text}</b></span><button class="link" data-sound="swish" onclick={() => send("")}>Clear</button></p>
  {/if}
</div>

<style>
  .live {
    margin-bottom: 8px;
  }
  .live .warn {
    margin: 8px 0 0;
  }
  .code {
    font-size: 44px;
    letter-spacing: 0.12em;
    font-weight: bold;
  }
  /* a later part of the panel starts with room above it, like the dealer screen's */
  .part {
    margin-top: 22px;
  }
  .grow {
    flex: 1;
  }
</style>

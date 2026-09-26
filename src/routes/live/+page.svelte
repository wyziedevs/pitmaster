<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import { goto } from "$app/navigation";
  import { play } from "$lib/sound";
  import { cleanCode, CODE_LENGTH } from "$lib/crypto";

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

<h1>Put a Game on This Screen</h1>
<p class="muted">On the computer running the game, open it and press <b>Go Live</b>. Then type the code it shows here.</p>

<form onsubmit={go} class="row" autocomplete="off">
  <input type="text" bind:value={code} maxlength={CODE_LENGTH + 1} placeholder="ABCD 2345" autocomplete="off" autocapitalize="characters" spellcheck="false" class="code" onkeydown={key} aria-label="TV code" />
  <button class="big" disabled={clean.length !== CODE_LENGTH} title={clean.length === CODE_LENGTH ? undefined : `Type all ${CODE_LENGTH} characters of the code first`}>Show It<Icon icon={ArrowRight} /></button>
</form>
<p class="small muted">The game is encrypted before it leaves that computer, and only a screen with the code can unlock it.<br /><a href="/privacy#tv">How TV Codes Work</a></p>

<style>
  /* the same size as the code on the dealer screen (TvPanel), wide enough for
     all eight characters and the space between the halves */
  .code {
    /* all eight characters fit even the narrowest phone */
    font: bold min(44px, 11vw) var(--font-mono);
    width: 7.2em;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    padding: 6px 10px;
  }
  .code::placeholder {
    opacity: 0.35;
  }
  /* the box is as tall as its big letters, not the row's usual height, and the
     button beside it stands as tall (on its own line when they wrap, a big button) */
  .row > .code {
    height: auto;
  }
  .row > .code + button {
    height: auto;
    min-height: var(--control-h-big);
    align-self: stretch;
  }
</style>

<script lang="ts">
  import Icon from "./Icon.svelte";
  import LockOpen from "@lucide/svelte/icons/lock-open";
  import { unlock, waitLeft, forgetAll } from "$lib/lock.svelte";
  import { time } from "$lib/now.svelte";
  import { clock } from "$lib/util";
  import { play } from "$lib/sound";
  import { replay } from "$lib/motion";

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
    if (!confirm("Delete everything saved in this browser and start fresh? Without the passcode none of it can be opened, by you or by anyone. This can't be undone.")) return;
    forgetAll();
  }
</script>

<svelte:head><title>Locked · PitMaster</title></svelte:head>

<h1>PitMaster Is Locked</h1>
<p class="measure">Type the passcode to get back to your games. TV screens keep showing the game while it's locked.</p>
<form class="row" onsubmit={go} use:replay={[misses, "shake"]}>
  <!-- password managers file a passcode under a name; Settings uses the same one -->
  <input type="text" autocomplete="username" value="PitMaster" hidden />
  <input
    bind:this={box}
    type="password"
    bind:value={passcode}
    autocomplete="current-password"
    placeholder="Passcode"
    aria-label="Passcode"
    aria-invalid={wrong}
    aria-describedby="lock-note"
    disabled={!!wait}
  />
  <!-- (it clicks open, or doesn't, once the passcode's been tried) -->
  <button data-sound="none" disabled={!passcode || busy || !!wait}><Icon icon={LockOpen} />{busy ? "Unlocking…" : "Unlock"}</button>
</form>
<p id="lock-note" class="small" aria-live="polite">
  {#if wait}<span class="bad">Too many wrong tries. Try again in {clock(wait)}.</span>
  {:else if wrong}<span class="bad">That's not the passcode.</span>{/if}
</p>
<p class="small muted measure">
  Forgot it? Nothing saved here can be opened without it, by you or by us. The only way forward is to
  <button class="link" data-sound="thud" onclick={forget}>delete everything and start fresh</button>, then import an export file if you have one.
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

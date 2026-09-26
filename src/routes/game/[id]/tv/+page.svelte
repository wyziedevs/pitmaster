<script lang="ts">
  import { page } from "$app/state";
  import { getGame } from "$lib/store";
  import { askFor, subscribeLocal } from "$lib/sync";
  import { vault } from "$lib/lock.svelte";
  import type { Game } from "$lib/types";
  import TvView from "$lib/components/TvView.svelte";
  import Dealing from "$lib/components/Dealing.svelte";

  // same-computer tv window: updates instantly over BroadcastChannel. it
  // reads the saved game when it can; with a passcode set it never holds the
  // key, so it asks the tab running the game instead, and waits while locked.
  const id = page.params.id!;
  let game = $state<Game | null>(vault.state === "open" ? getGame(id) : null);

  $effect(() => subscribeLocal(id, (g) => (game = g)));
  $effect(() => {
    if (!game) return askFor(id);
  });
</script>

<!-- no game name: the browser keeps tab titles in its history, unencrypted -->
<svelte:head><title>TV · PitMaster</title></svelte:head>

{#if game}
  <TvView {game} status="Same-Computer Mode" />
{:else if vault.state === "locked"}
  <main class="wrap">
    <h1>Waiting for the Game</h1>
    <p><Dealing label="Waiting" />PitMaster is locked on this computer. Unlock it where the game is running and it shows up here.</p>
  </main>
{:else}
  <main class="wrap">
    <h1>That Game Isn't on This Device</h1>
    <p>On a different device? On the computer running the game, press <b>Go Live</b>, then open <a href="/live">{location.host}/live</a> here and type the code.</p>
  </main>
{/if}

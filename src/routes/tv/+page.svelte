<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { pollLive } from "$lib/sync";
  import { cleanCode, CODE_LENGTH, showCode } from "$lib/crypto";
  import type { Game } from "$lib/types";
  import TvView from "$lib/components/TvView.svelte";
  import Dealing from "$lib/components/Dealing.svelte";

  // a tv on any device, polling the api for the host's latest snapshot. the
  // code rides after the #, which browsers never send to a server, so it
  // stays on the screens that know it.
  const code = $derived(cleanCode(page.url.hash.slice(1)));
  let game = $state<Game | null>(null);
  let status = $state("Connecting…");

  $effect(() => {
    if (code.length !== CODE_LENGTH) return void goto("/live", { replaceState: true });
    game = null;
    status = "Connecting…";
    return pollLive(
      code,
      (g) => {
        game = g;
        status = `Live · ${showCode(code)}`;
      },
      (msg) => (status = msg)
    );
  });
</script>

<!-- no game name: the browser keeps tab titles in its history, unencrypted -->
<svelte:head><title>Live · PitMaster</title></svelte:head>

{#if game}
  <TvView {game} {status} />
{:else}
  <main class="wrap">
    <h1 class="mono">{showCode(code)}</h1>
    <p>{#if status === "Connecting…"}<Dealing label="Connecting" />{/if}{status}</p>
    <p class="small"><a href="/live">Try a Different Code</a></p>
  </main>
{/if}

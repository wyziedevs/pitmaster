<script lang="ts">
  import { page } from "$app/state";
  import { pollLive } from "$lib/sync";
  import { cleanCode, CODE_LENGTH } from "$lib/crypto";
  import type { Game } from "$lib/types";
  import Cup from "$lib/kinds/dice/Cup.svelte";
  import Dealing from "$lib/components/Dealing.svelte";
  import { t } from "$lib/i18n";

  // a player's phone as their dice cup. the link the host's screen shows them
  // is /cup#CODE.SEAT.KEY: the game's code, their seat and the key only this
  // phone gets, all after the #, which browsers never send to a server.
  const parts = $derived(page.url.hash.slice(1).split("."));
  const code = $derived(cleanCode(parts[0] ?? ""));
  const seat = $derived(parts[1] ?? "");
  const seatKey = $derived(parts[2] ?? "");
  const ok = $derived(code.length === CODE_LENGTH && /^[A-Za-z0-9_-]{16}$/.test(seat) && /^[A-Za-z0-9_-]{32,128}$/.test(seatKey));

  let game = $state<Game | null>(null);
  let status = $state("");
  $effect(() => {
    if (!ok) return;
    game = null;
    status = t("tv.connect.connecting");
    return pollLive(
      code,
      (g) => {
        game = g;
        status = "";
      },
      (msg) => (status = msg)
    );
  });
</script>

<!-- no game name: the browser keeps tab titles in its history, unencrypted -->
<svelte:head><title>{t("tv.cup.title")} · PitMaster</title></svelte:head>

{#if !ok}
  <main class="wrap"><p>{t("tv.cup.badLink")}</p></main>
{:else if game}
  <Cup {game} {code} {seat} {seatKey} {status} />
{:else}
  <main class="wrap"><p><Dealing label={t("tv.connect.connectingLabel")} />{status}</p></main>
{/if}

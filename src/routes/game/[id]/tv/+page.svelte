<script lang="ts">
  import { page } from "$app/state";
  import { getGame } from "$lib/store";
  import { askFor, publicSnapshot, subscribeLocal } from "$lib/sync";
  import { vault } from "$lib/lock.svelte";
  import type { Game } from "$lib/types";
  import TvView from "$lib/components/TvView.svelte";
  import Dealing from "$lib/components/Dealing.svelte";
  import { t } from "$lib/i18n";

  // same-computer tv window: updates instantly over BroadcastChannel. it
  // reads the saved game when it can; with a passcode set it never holds the
  // key, so it asks the tab running the game instead, and waits while locked.
  const id = page.params.id!;
  // (the same snapshot the dealer screen sends: the league's standings ride along)
  const saved = vault.state === "open" ? getGame(id) : null;
  let game = $state<Game | null>(saved && publicSnapshot(saved));

  $effect(() => subscribeLocal(id, (g) => (game = g)));
  $effect(() => {
    if (!game) return askFor(id);
  });
</script>

<!-- no game name: the browser keeps tab titles in its history, unencrypted -->
<svelte:head><title>TV · PitMaster</title></svelte:head>

{#if game}
  <TvView {game} status={t("tv.connect.sameComputer")} />
{:else if vault.state === "locked"}
  <main class="wrap">
    <h1>{t("tv.wait.title")}</h1>
    <p><Dealing label={t("tv.wait.label")} />{t("tv.wait.locked")}</p>
  </main>
{:else}
  <main class="wrap">
    <h1>{t("tv.wait.notHereTitle")}</h1>
    <p>{t("tv.wait.notHereBefore")}<b>{t("tv.panel.goLive")}</b>{t("tv.wait.notHereMiddle")}<a href="/live">{location.host}/live</a>{t("tv.wait.notHereAfter")}</p>
  </main>
{/if}

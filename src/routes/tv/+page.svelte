<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { pollLive } from "$lib/sync";
  import { cleanCode, CODE_LENGTH, showCode } from "$lib/crypto";
  import type { Game } from "$lib/types";
  import TvView from "$lib/components/TvView.svelte";
  import Dealing from "$lib/components/Dealing.svelte";
  import { t } from "$lib/i18n";

  // a tv on any device, polling the api for the host's latest snapshot. the
  // code rides after the #, which browsers never send to a server, so it
  // stays on the screens that know it.
  const code = $derived(cleanCode(page.url.hash.slice(1)));
  let game = $state<Game | null>(null);
  // the phase, not the display text: the text is translated (and so can
  // change under it), so nothing here ever compares against a translated string
  type Phase = { kind: "connecting" } | { kind: "live" } | { kind: "error"; msg: string };
  let phase = $state<Phase>({ kind: "connecting" });
  const connecting = $derived(phase.kind === "connecting");
  const status = $derived(
    phase.kind === "connecting"
      ? t("tv.connect.connecting")
      : phase.kind === "live"
        ? t("tv.connect.live", { code: showCode(code) })
        : phase.msg
  );

  $effect(() => {
    if (code.length !== CODE_LENGTH) return void goto("/live", { replaceState: true });
    game = null;
    phase = { kind: "connecting" };
    return pollLive(
      code,
      (g) => {
        game = g;
        phase = { kind: "live" };
      },
      (msg) => (phase = { kind: "error", msg })
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
    <p>{#if connecting}<Dealing label={t("tv.connect.connectingLabel")} />{/if}{status}</p>
    <p class="small"><a href="/live">{t("tv.connect.tryDifferent")}</a></p>
  </main>
{/if}

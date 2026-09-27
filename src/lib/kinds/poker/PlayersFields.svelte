<script lang="ts">
  // who's playing on the poker form (regulars and a tournament's satellite
  // winners one click away), and the house rules and notes for the tv
  import Icon from "$lib/components/Icon.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import { houseRules } from "$lib/settings.svelte";
  import { t, tp } from "$lib/i18n";
  import type { PokerDraft } from "./draft.svelte";

  let { draft }: { draft: PokerDraft } = $props();
</script>

<fieldset>
  <legend>{t("gameSetup.players.legend")} <span class="small opt text-muted ml-[6px]">{t("gameSetup.players.optional")}</span></legend>
  <label>
    <span>{t("gameSetup.players.namesLabel")}</span>
    <textarea bind:value={draft.playerNames} rows="4" placeholder={t("gameSetup.players.namesPlaceholder")}></textarea>
  </label>
  {#if draft.unlisted.length}
    <p class="small links -mt-1 mx-0 mb-[10px]">
      <span class="muted">{t("gameSetup.players.regulars")}</span>
      {#each draft.unlisted as r (r.name)}<button class="link" data-sound="chips" onclick={() => draft.addRegular(r.name)} title={tp("gameSetup.players.gamesCount", r.games)}><Icon icon={Plus} size="1em" />{r.name}</button>{/each}
    </p>
  {/if}
  {#if draft.seatsWaiting.length}
    <p class="small links -mt-1 mx-0 mb-[10px]">
      <span class="muted">{t("gameSetup.players.satelliteWinners")}</span>
      {#each draft.seatsWaiting as w (w.game.id)}
        <button class="link" data-sound="chips" onclick={() => draft.addWinners(w.game.id, w.winners)} title={t("gameSetup.players.seatsFrom", { game: w.game.name })}><Icon icon={Plus} size="1em" />{w.winners.map((p) => p.name).join(", ")}</button>
      {/each}
    </p>
  {/if}
  {#if draft.isCash}
    <label><span>{t("gameSetup.cash.chipMath")}</span><input type="number" min="1" bind:value={draft.cash.players} /></label>
  {/if}
  <label>
    <span>{t("gameSetup.players.notesLabel")}</span>
    <textarea bind:value={draft.notes} rows={Math.min(8, Math.max(2, draft.notes.split("\n").length + 1))} placeholder={t("gameSetup.players.notesPlaceholder")}></textarea>
  </label>
  <p class="small links -mt-[6px] mx-0 mb-0">
    {#if houseRules().length && draft.rulesMissing}<button class="link" data-sound="card" onclick={() => draft.addHouseRules()}><Icon icon={Plus} size="1em" />{t("gameSetup.players.addHouseRules")}</button>{/if}
    <a href="/settings#house">{houseRules().length ? t("gameSetup.players.editHouseRules") : t("gameSetup.players.writeHouseRules")}</a>
  </p>
</fieldset>

<script lang="ts">
  import { untrack } from "svelte";
  import { page } from "$app/state";
  import Icon from "$lib/components/Icon.svelte";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Plus from "@lucide/svelte/icons/plus";
  import type { GameType } from "$lib/types";
  import { t } from "$lib/i18n";
  import { PokerDraft } from "./draft.svelte";
  import SetupHeader from "./SetupHeader.svelte";
  import BasicsFields from "./BasicsFields.svelte";
  import VariantFields from "./VariantFields.svelte";
  import PlayersFields from "./PlayersFields.svelte";
  import CashFields from "../cash/SetupFields.svelte";
  import CashPreview from "../cash/SetupPreview.svelte";
  import TourneyFields from "../tournament/SetupFields.svelte";
  import TourneyPreview from "../tournament/SetupPreview.svelte";

  // the poker kinds' new-game form: cash and tournaments share it, each
  // showing its own parts (kinds/index.ts picks it for them). it stays up when
  // the type changes, so what's been typed in it stays too.
  let { type }: { type: GameType } = $props();
  const draft = new PokerDraft(() => type);

  // a new type (the switch link, back or forward): its defaults, and a game it can play
  $effect(() => {
    void type;
    untrack(() => draft.retype());
  });
  // a template, a preset or an old game to start from, picked here or anywhere else (the palette, Tweak and Rerun)
  $effect(() => {
    const q = page.url.searchParams;
    untrack(() => draft.load(q));
  });

  const addable = $derived(draft.features.addable(type));
</script>

<svelte:head><title>{draft.isCash ? t("gameSetup.header.titleCash") : t("gameSetup.header.titleTournament")} · PitMaster</title></svelte:head>

<SetupHeader {draft} />

<div class="cols">
  <!-- LEFT: settings -->
  <div>
    <BasicsFields {draft} />
    <VariantFields {draft} />
    {#if draft.isCash}<CashFields {draft} />{:else}<TourneyFields {draft} />{/if}

    {#if addable.length}
      <p class="small links -mt-2 mx-0 mb-[22px]">
        <span class="muted">{t("gameSetup.addable.caption")}</span>
        {#each addable as x (x.key)}<button class="link" data-sound="on" onclick={() => draft.add(x.key)}><Icon icon={Plus} size="1em" />{t(x.label)}</button>{/each}
        <a class="muted" href="/settings#game">{t("gameSetup.addable.turnOnForEvery")}</a>
      </p>
    {/if}

    <PlayersFields {draft} />
  </div>

  <!-- RIGHT: live preview -->
  <div class="preview">
    {#if draft.isCash}<CashPreview {draft} />{:else}<TourneyPreview {draft} />{/if}
  </div>
</div>

<hr />
<p class="row actions justify-between">
  <button class="big" data-sound="riffle" onclick={() => draft.create()}>{t("gameSetup.actions.dealIt")}<span class="flip-rtl"><Icon icon={ArrowRight} /></span></button>
  <a href="/" data-sound="close">{t("common.cancel")}</a>
</p>

<style>
  /* the form runs long on a phone, so Deal It stays at the bottom of the screen */
  @media (max-width: 600px) {
    .actions {
      position: sticky;
      bottom: 0;
      z-index: 30;
      margin: 0 -16px;
      padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
      background: var(--bg);
      border-top: var(--hair) solid var(--line);
    }
  }
  .preview {
    position: sticky;
    top: calc(var(--head, 0px) + var(--title, 0px) + 12px);
    align-self: start;
  }
  @media (max-width: 800px) {
    .preview {
      position: static;
    }
  }
</style>

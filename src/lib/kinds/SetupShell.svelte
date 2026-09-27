<script lang="ts">
  // the new-game form around a kind that isn't poker: its name and league, who's
  // playing and the notes, and dealing it. the kind brings its own fields, its
  // preview and its rules (what newGame keeps for it).
  import type { Snippet } from "svelte";
  import Icon from "$lib/components/Icon.svelte";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Plus from "@lucide/svelte/icons/plus";
  import { pagehead } from "$lib/pagehead";
  import type { Draft } from "./draft.svelte";
  import { kind } from "./index";
  import type { Game } from "$lib/types";
  import { t, tp } from "$lib/i18n";

  let {
    draft,
    defaultName,
    fewPlayers = t("gameSetup.players.fewPlayersConfirm"),
    rules,
    pick,
    basics,
    children,
    preview,
  }: {
    draft: Draft;
    /** the name until the host types their own (it follows a preset they pick) */
    defaultName: string;
    fewPlayers?: string;
    /** the kind's own rules for newGame: { dice } / { lives } / { pot } / { casino } */
    rules: () => Pick<Game, "dice" | "lives" | "pot" | "casino">;
    /** above the name: which game of the kind */
    pick?: Snippet;
    /** under the league */
    basics?: Snippet;
    /** the kind's own fieldsets, given who's playing */
    children: Snippet<[string[]]>;
    preview: Snippet<[string[]]>;
  } = $props();

  function create() {
    if (draft.names.length < 2 && !confirm(fewPlayers)) return;
    draft.create(defaultName, rules());
  }
</script>

<svelte:head><title>{kind(draft.type).newLabel()} · PitMaster</title></svelte:head>

<div class="spread" use:pagehead>
  <h1>{kind(draft.type).newLabel()}</h1>
</div>

<div class="cols">
  <div>
    <fieldset>
      <legend>{t("gameSetup.basics.legend")}</legend>
      {@render pick?.()}
      <label><span>{t("gameSetup.basics.name")}</span><input type="text" bind:value={() => draft.name ?? defaultName, (v) => (draft.name = v)} style="width:100%" /></label>
      {#if draft.leagues.length}
        <label>
          <span class="links">{t("gameSetup.basics.league")} <a href="/players#leagues">{t("gameSetup.basics.editLeagues")}</a></span>
          <select bind:value={draft.leagueId}>
            <option value="">{t("gameSetup.basics.noLeague")}</option>
            {#each draft.leagues as l (l.id)}<option value={l.id}>{l.name}</option>{/each}
          </select>
        </label>
      {/if}
      {@render basics?.()}
    </fieldset>

    {@render children(draft.names)}

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
      <label>
        <span>{t("gameSetup.players.notesLabel")}</span>
        <textarea bind:value={draft.notes} rows={Math.min(8, Math.max(2, draft.notes.split("\n").length + 1))} placeholder={t("gameSetup.players.notesPlaceholder")}></textarea>
      </label>
    </fieldset>
  </div>

  <div class="preview">
    {@render preview(draft.names)}
  </div>
</div>

<hr />
<p class="row actions justify-between">
  <button class="big" data-sound="riffle" onclick={create}>{t("gameSetup.actions.dealIt")}<span class="flip-rtl"><Icon icon={ArrowRight} /></span></button>
  <a href="/" data-sound="close">{t("common.cancel")}</a>
</p>

<style>
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
  .preview :global(.big-num) {
    font-size: var(--fs-2xl);
    line-height: 1.2;
    margin: 0;
  }
  @media (max-width: 800px) {
    .preview {
      position: static;
    }
  }
</style>

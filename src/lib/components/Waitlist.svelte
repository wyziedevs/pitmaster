<script lang="ts">
  // who's next for a seat at a cash game. the tv and phones show the list, and
  // when someone cashes out the tv says a seat is open.
  import Icon from "./Icon.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import Armchair from "@lucide/svelte/icons/armchair";
  import RemoveButton from "./RemoveButton.svelte";
  import type { Game } from "$lib/types";
  import { joinWaitlist, leaveWaitlist, seatWaiting } from "$lib/kinds/cash/actions";
  import { duration } from "$lib/util";
  import { time } from "$lib/now.svelte";
  import { provide } from "$lib/commands.svelte";
  import { play } from "$lib/sound";
  import { reveal, leave, slide } from "$lib/motion";
  import { t } from "$lib/i18n";

  let { game = $bindable(), persist }: { game: Game; persist: () => void } = $props();

  const list = $derived(game.waitlist ?? []);
  const next = $derived(list[0]);
  let name = $state("");

  const waited = (at: number) => (time.now - at < 60000 ? t("gamePlay.cash.waitlist.justNow") : duration((time.now - at) / 60000));

  function join(who: string) {
    if (!who.trim()) return;
    joinWaitlist(game, who);
    persist();
  }

  function add(e: SubmitEvent) {
    e.preventDefault();
    join(name);
    name = "";
  }

  function remove(id: string) {
    leaveWaitlist(game, id);
    persist();
  }

  // off the list and into a seat (someone who played earlier tonight gets their own row back)
  function seat(id: string) {
    seatWaiting(game, id);
    persist();
  }

  $effect(() =>
    provide("waitlist", () => [
      { id: "wait:add", label: t("gamePlay.cash.waitlist.cmdAdd"), group: t("gamePlay.shared.groupThisGame"), keywords: "waitlist wait list queue next", prompt: t("gamePlay.shared.theirNamePrompt"), run: (who: string) => (play("note"), join(who)) },
      ...(next ? [{ id: "wait:next", label: t("gamePlay.cash.waitlist.seatNext", { name: next.name }), group: t("gamePlay.shared.groupThisGame"), keywords: "waitlist seat next sit down", run: () => (play("chips"), seat(next.id)) }] : []),
    ])
  );
</script>

<h2>{t("gamePlay.cash.waitlist.heading")}</h2>
{#if list.length}
  <ol class="list-none p-0 m-0 mb-2">
    {#each list as w, i (w.id)}
      <li class="row mb-1" in:slide={reveal()} out:slide={leave()}>
        <span class="num muted w-[1.4em]">{i + 1}</span>
        <b>{w.name}</b>
        <span class="small muted num">{waited(w.at)}</span>
        {#if i > 0}<button class="link small" data-sound="chips" onclick={() => seat(w.id)}>{t("gamePlay.cash.waitlist.seat")}</button>{/if}
        <RemoveButton label={t("gamePlay.cash.waitlist.remove", { name: w.name })} onclick={() => remove(w.id)} />
      </li>
    {/each}
  </ol>
{:else}
  <p class="small muted">{t("gamePlay.cash.waitlist.empty")}</p>
{/if}
<form autocomplete="off" class="row" onsubmit={add}>
  <input type="text" bind:value={name} placeholder={t("gamePlay.shared.playerNamePlaceholder")} list="regulars" aria-label={t("gamePlay.cash.waitlist.cmdAdd")} />
  <button data-sound="note" disabled={!name.trim()} title={name.trim() ? undefined : t("gamePlay.cash.waitlist.typeName")}><Icon icon={Plus} />{t("gamePlay.cash.waitlist.add")}</button>
  {#if next}<button type="button" data-sound="chips" onclick={() => seat(next.id)}><Icon icon={Armchair} />{t("gamePlay.cash.waitlist.seatNext", { name: next.name })}</button>{/if}
</form>

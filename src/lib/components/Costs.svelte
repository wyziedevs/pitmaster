<script lang="ts">
  // shared costs: anything bought for the game, split among the players.
  // they go into settle-up with everything else, never into anyone's results.
  import Icon from "./Icon.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import RemoveButton from "./RemoveButton.svelte";
  import type { Game } from "$lib/types";
  import { addCost, removeCost, costSplit, HOUSE } from "$lib/game";
  import { money } from "$lib/util";
  import { provide } from "$lib/commands.svelte";
  import { reveal, leave, slide } from "$lib/motion";
  import { t, tp } from "$lib/i18n";

  let { game = $bindable(), persist }: { game: Game; persist: () => void } = $props();

  const house = $derived(game.house?.trim() || HOUSE());
  const nameOf = (id: string | null) => (id ? (game.players.find((p) => p.id === id)?.name ?? house) : house);

  let label = $state("");
  let amount = $state<number | null>(null);
  // "" is the house
  let paidBy = $state("");
  let some = $state(false);
  let split = $state<string[]>([]);
  let what = $state<HTMLInputElement>();
  const ready = $derived(!!label.trim() && (amount ?? 0) > 0 && (!some || split.length > 0));

  function add(e: SubmitEvent) {
    e.preventDefault();
    if (!ready) return;
    addCost(game, { label: label.trim(), amount: amount!, paidBy: paidBy || null, split: some ? [...split] : [] });
    persist();
    label = "";
    amount = null;
    some = false;
    split = [];
  }

  function remove(id: string) {
    removeCost(game, id);
    persist();
  }

  $effect(() =>
    provide("costs", () => [
      { id: "c:add", label: t("gamePlay.shared.costs.add"), group: t("gamePlay.shared.groupThisGame"), keywords: "cost expense food drinks split", run: () => what?.focus() },
    ])
  );
</script>

<h2>{t("gamePlay.shared.costs.heading")}</h2>
{#if game.costs?.length}
  <ul class="list-none p-0 m-0 mb-2">
    {#each game.costs as c (c.id)}
      {@const who = costSplit(game, c)}
      <li class="mb-1" in:slide={reveal()} out:slide={leave()}>
        <b>{c.label}</b> <span class="num">{money(c.amount)}</span>
        <span class="small muted">· {t("gamePlay.shared.costs.fronted", { name: nameOf(c.paidBy) })} · <span title={who.map((id) => nameOf(id)).join(", ")}>{c.split.length ? tp("gamePlay.shared.costs.ways", who.length) : t("gamePlay.shared.costs.everyone")}</span></span>
        <RemoveButton label={t("gamePlay.shared.costs.remove", { label: c.label })} onclick={() => remove(c.id)} />
      </li>
    {/each}
  </ul>
{/if}
<form autocomplete="off" class="vstack gap-1.5" onsubmit={add}>
  <div class="row">
    <input type="text" bind:this={what} bind:value={label} placeholder={t("gamePlay.shared.costs.what")} aria-label={t("gamePlay.shared.costs.what")} class="grow" />
    <input type="number" step="any" min="0" bind:value={amount} placeholder={t("gamePlay.shared.costs.amount")} aria-label={t("gamePlay.shared.costs.amount")} class="w-[110px]" />
  </div>
  <div class="row">
    <label class="across m-0"><span>{t("gamePlay.shared.costs.paidBy")}</span>
      <select bind:value={paidBy}>
        <option value="">{house}</option>
        {#each game.players as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
      </select>
    </label>
    <label class="across m-0"><span>{t("gamePlay.shared.costs.split")}</span>
      <select bind:value={some}>
        <option value={false}>{t("gamePlay.shared.costs.everyone")}</option>
        <option value={true}>{t("gamePlay.shared.costs.some")}</option>
      </select>
    </label>
    <button data-sound="chips" disabled={!ready}><Icon icon={Plus} />{t("gamePlay.shared.costs.add")}</button>
  </div>
  {#if some}
    <div class="row small gap-y-1" transition:slide={reveal()}>
      {#each game.players as p (p.id)}<label class="across m-0"><input type="checkbox" class="m-0" bind:group={split} value={p.id} />{p.name}</label>{/each}
    </div>
  {/if}
</form>
<p class="small muted">{t("gamePlay.shared.costs.note")}</p>

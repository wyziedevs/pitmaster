<script lang="ts" module>
  /** a net's color: up, down or even */
  export const tone = (n: number) => (n > 0.001 ? "good" : n < -0.001 ? "bad" : "");
</script>

<script lang="ts">
  // the players table the kinds that aren't poker share: each name (fixed in
  // place), where they finished, the kind's own columns, the net, and adding
  // or removing a player while that's still allowed.
  import type { Snippet } from "svelte";
  import type { Game, Player } from "$lib/types";
  import Icon from "$lib/components/Icon.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import RemoveButton from "$lib/components/RemoveButton.svelte";
  import { addPlayer } from "$lib/game";
  import { logEvent } from "$lib/events";
  import { ordinal, signed } from "$lib/util";
  import { t } from "$lib/i18n";

  let {
    game = $bindable(),
    persist,
    players,
    adding,
    removing,
    added,
    place,
    dim,
    turn,
    net,
    head,
    row,
    badge,
  }: {
    game: Game;
    persist: () => void;
    /** in the order they're listed */
    players: Player[];
    /** a new player can join */
    adding: boolean;
    /** a player can be taken off */
    removing: boolean;
    /** after a player joins (still before it's saved) */
    added?: () => void;
    place?: (id: string) => number | null | undefined;
    /** out of it: the row greys */
    dim?: (id: string) => boolean;
    /** whose turn it is: the row stands out */
    turn?: string | null;
    /** each player's net, in its own column (left out: no column) */
    net?: (id: string) => number;
    /** the kind's own column heads, and each row's cells under them */
    head: Snippet;
    row: Snippet<[Player]>;
    /** after the name */
    badge?: Snippet<[Player]>;
  } = $props();

  let newName = $state("");
  function add(e: SubmitEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    addPlayer(game, newName);
    added?.();
    persist();
    newName = "";
  }
  function remove(p: Player) {
    if (!confirm(t("gamePlay.cash.removeConfirm", { name: p.name }))) return;
    game.players = game.players.filter((x) => x.id !== p.id);
    logEvent(game, t("gamePlay.shared.removedLog", { name: p.name }));
    persist();
  }
  // the empty row spans however many columns the kind has
  const span = (td: HTMLTableCellElement) => {
    td.colSpan = td.closest("table")?.tHead?.rows[0]?.cells.length ?? 1;
  };
</script>

<h2>{t("gamePlay.shared.groupPlayers")}</h2>
<div class="scroll-x">
  <table class="roster">
    <thead>
      <tr>
        <th>{t("gamePlay.shared.nameHeader")}</th>
        {@render head()}
        {#if net}<th class="num">{t("players.page.table.net")}</th>{/if}
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each players as p (p.id)}
        {@const at = place?.(p.id)}
        <tr class:dim={dim?.(p.id)} class:turn={turn === p.id}>
          <td class="nowrap who">
            {#if at}<span class="num place inline-block min-w-[2.2em] text-muted">{ordinal(at)}</span>{/if}
            <input type="text" bind:value={p.name} onchange={persist} class="edit-name" aria-label={t("gamePlay.shared.nameHeader")} />
            {@render badge?.(p)}
          </td>
          {@render row(p)}
          {#if net}<td class="num {tone(net(p.id))}" data-l={t("players.page.table.net")}>{signed(net(p.id))}</td>{/if}
          <td class="acts">{#if removing}<RemoveButton label={t("gamePlay.shared.removePlayer", { name: p.name })} onclick={() => remove(p)} />{/if}</td>
        </tr>
      {:else}
        <tr><td class="empty" {@attach span}>{t("gamePlay.tournament.noPlayersYet")}</td></tr>
      {/each}
    </tbody>
  </table>
</div>
{#if adding}
  <form autocomplete="off" class="row add mt-2" onsubmit={add}>
    <input type="text" bind:value={newName} placeholder={t("gamePlay.shared.playerNamePlaceholder")} list="regulars" autocomplete="off" aria-label={t("gamePlay.shared.playerNamePlaceholder")} />
    <button data-sound="chips"><Icon icon={Plus} />{t("gamePlay.dice.addPlayer")}</button>
  </form>
{/if}

<style>
  tr.turn td {
    background: var(--block);
  }
</style>

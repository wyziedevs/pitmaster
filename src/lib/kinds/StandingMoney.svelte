<script lang="ts">
  // what a last-one-standing game is played for: the stakes, then the prizes
  // by place (a buy-in pot) or the pot lives lost have made so far, and
  // settling up
  import type { DiceStakes, Game } from "$lib/types";
  import type { Standing } from "./standing";
  import { houseName } from "$lib/events";
  import { money, ordinal } from "$lib/util";
  import Settle from "./Settle.svelte";
  import { t } from "$lib/i18n";

  let { game = $bindable(), persist, st, stakes, line }: { game: Game; persist: () => void; st: Standing; stakes: DiceStakes; line: string } = $props();
</script>

<h2>{t("gamePlay.dice.moneyHeading")}</h2>
<p class="small">{line}</p>
{#if stakes.mode === "pot"}
  <table>
    <tbody>
      {#each st.money.payouts as p, i (i)}
        {@const who = game.players.filter((x) => st.places[x.id] === i + 1)}
        <tr><td>{ordinal(i + 1)}</td><td class="num"><b>{money(p)}</b></td><td>{who.map((x) => x.name).join(", ")}</td></tr>
      {/each}
    </tbody>
  </table>
{:else if stakes.perDieTo === "pot"}
  <p class="small">{t("gamePlay.dice.potSoFar", { amount: money(st.money.pool) })}</p>
{/if}
<Settle bind:game {persist} early note={stakes.mode === "pot" ? t("gamePlay.shared.tourneySettleNote", { house: houseName(game) }) : ""} />

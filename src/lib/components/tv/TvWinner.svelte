<script lang="ts">
  // a tournament's end: the champion (or the deal, or a satellite's seats),
  // the pot, and every paid place. a league game's standings take their turn
  import Icon from "../Icon.svelte";
  import ChipStack from "../ChipStack.svelte";
  import Trophy from "@lucide/svelte/icons/trophy";
  import LeagueTable from "./LeagueTable.svelte";
  import type { TvState } from "./state.svelte";
  import { paidFor } from "$lib/game";
  import { placeRange } from "$lib/bracket";
  import { money, ordinal } from "$lib/util";
  import { t, tp } from "$lib/i18n";

  let { tv }: { tv: TvState } = $props();
  const game = $derived(tv.game);
  const stats = $derived(tv.stats!);

  // the pot: a row of stacks from the game's own chips, biggest first
  const pot = $derived([...game.chips].sort((a, b) => b.value - a.value).slice(0, 5));
  // it only makes its entrance if the game just ended
  const justWon = $derived(!!game.endedAt && Date.now() - game.endedAt < 15000);
  // each paid place (a bracket's round shares its places), ten at most
  const places = $derived(
    tv.groups.length
      ? tv.groups.map((g) => ({ label: placeRange(g), names: game.players.filter((x) => x.place === g.from).map((x) => x.name), fig: money(stats.payouts[g.from - 1] ?? 0) }))
      : Array.from({ length: Math.min(10, game.deal ? Object.keys(game.deal.amounts).length : stats.payouts.length) }, (_, i) => {
          const who = game.players.find((x) => x.place === i + 1);
          return { label: ordinal(i + 1), names: who ? [who.name] : [], fig: i < tv.seats ? t("tv.tourney.seat") : money(paidFor(game, who?.id, i + 1, stats.payouts)) };
        })
  );
  // a long list runs down two columns
  const rows = $derived(places.length > 5 ? Math.ceil(places.length / 2) : places.length);
</script>

<section class="winner" class:entrance={justWon}>
  <div class="trophy"><Icon icon={Trophy} size="11vh" /></div>
  <div class="k">{game.deal ? t("tv.winner.dealMade") : tv.seats > 1 ? t("tv.winner.satellite") : t("tv.winner.champion")}</div>
  <div class="big">{game.deal ? t("tv.winner.dealBig") : tv.seats > 1 ? tp("tv.winner.seatsWon", tv.seats) : tv.winner?.name}</div>
  <!-- the pot, pushed across the felt and stacked one chip at a time -->
  <div class="pot" aria-hidden="true">
    {#each pot as c, i (c.id)}<span style:--d="{500 + i * 160}ms"><ChipStack chip={c} n={[12, 18, 9, 15, 7][i]} width="min(6vw, 10vh)" /></span>{/each}
  </div>
  {#if tv.standings}
    <LeagueTable league={tv.standings} />
  {:else}
    <ol class="final" class:split={places.length > 5} style:--rows={rows}>
      {#each places as p, i (i)}
        <li class:top={i % rows === 0} style:--i={i}>
          <span class="place">{p.label}</span>
          <b>{p.names.join(", ") || t("tv.winner.nobodyYet")}</b>
          {#if tv.showMoney || (!tv.groups.length && i < tv.seats)}<span class="fig">{p.fig}</span>{/if}
        </li>
      {/each}
    </ol>
  {/if}
</section>

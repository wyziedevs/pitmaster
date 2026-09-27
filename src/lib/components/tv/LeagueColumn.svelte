<script lang="ts">
  // a league's standings in a side column, taking its turn with what's usually there
  import type { Game } from "$lib/types";
  import { fade } from "svelte/transition";
  import { reveal } from "$lib/motion";
  import { ordinal } from "$lib/util";
  import { points } from "./LeagueTable.svelte";
  import { t, tp } from "$lib/i18n";

  let { league }: { league: NonNullable<Game["league"]> } = $props();
</script>

<div class="stat league" in:fade={reveal()}>
  <span class="k">{t("tv.league.standings")}</span>
  <span class="lname">{league.name}</span>
  <ol class="ladder">
    {#each league.rows.slice(0, 9) as r, i (i)}
      <li><span class="place">{ordinal(i + 1)}</span><span class="who">{r.name}</span><span class="fig">{points(r.points)}</span></li>
    {/each}
  </ol>
  <span class="sub">{tp("tv.league.afterGames", league.games)}</span>
</div>

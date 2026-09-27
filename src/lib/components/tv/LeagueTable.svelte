<script lang="ts" module>
  import { round1 } from "$lib/stats";
  import { t } from "$lib/i18n";

  /** a player's league points, to a tenth */
  export const points = (n: number) => t("tv.league.points", { n: String(round1(n)) });
</script>

<script lang="ts">
  // a league's whole standings, big: on the winner screen, and in another kind's board's place
  import type { Game } from "$lib/types";
  import { fade } from "svelte/transition";
  import { reveal } from "$lib/motion";
  import { ordinal } from "$lib/util";

  let { league }: { league: NonNullable<Game["league"]> } = $props();

  // a long table runs down two columns
  const rows = $derived(league.rows.length > 5 ? Math.ceil(league.rows.length / 2) : league.rows.length);
</script>

<div class="k" in:fade={reveal()}>{t("tv.league.standings")} · {league.name}</div>
<ol class="final" class:split={league.rows.length > 5} style:--rows={rows} in:fade={reveal()}>
  {#each league.rows as r, i (i)}
    <li class:top={i % rows === 0}>
      <span class="place">{ordinal(i + 1)}</span>
      <b>{r.name}</b>
      <span class="fig">{points(r.points)}</span>
    </li>
  {/each}
</ol>

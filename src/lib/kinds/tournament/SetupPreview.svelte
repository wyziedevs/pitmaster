<script lang="ts">
  // the poker form's live preview for a tournament: each player's starting
  // chips, and the blind structure (worked out, or as the host edited it)
  import Icon from "$lib/components/Icon.svelte";
  import RotateCw from "@lucide/svelte/icons/rotate-cw";
  import Breakdown from "$lib/components/Breakdown.svelte";
  import StructureTable from "$lib/components/StructureTable.svelte";
  import { distribute, maxStack } from "$lib/chips";
  import { plannedMinutes, structureMinutes } from "$lib/blinds";
  import { amt, duration, timeOfDay } from "$lib/util";
  import { time } from "$lib/now.svelte";
  import { t } from "$lib/i18n";
  import type { PokerDraft } from "../poker/draft.svelte";

  let { draft }: { draft: PokerDraft } = $props();
  const d = $derived(draft.tourney);
  const chips = $derived(draft.chips);
  const levels = $derived(d.levels);
  const planned = $derived(plannedMinutes(levels));
  const played = $derived(levels.filter((l) => !l.isBreak && !l.overtime));
  const last = $derived(played.at(-1));
</script>

<h2>{t("gameSetup.previewTournament.eachPlayerStarts")}</h2>
<div class="felt"><Breakdown breakdown={distribute(d.stack, chips, d.expected)} target={d.stack} /></div>
{#if chips.length}
  <p class="small muted">
    {t("gameSetup.previewTournament.chipMathCaption", {
      chips: amt(d.stack),
      bb: levels[0] ? Math.round(d.stack / levels[0].bb) : "?",
      n: d.expected,
      amount: amt(maxStack(chips, d.expected)),
    })}
  </p>
{/if}
<hr />
<div class="spread">
  <h2>{t("gameSetup.previewTournament.blindStructure")}</h2>
  <span class="small">
    {#if d.edited}<button class="link" data-sound="rewind" onclick={() => (d.edited = null)}><Icon icon={RotateCw} size="1em" />{t("gameSetup.previewTournament.resetToAuto")}</button>{:else}<span class="muted">{t("gameSetup.previewTournament.autoEdit")}</span>{/if}
  </span>
</div>
<p class="small">
  {t("gameSetup.previewTournament.levelsOver", { n: played.length, duration: duration(planned) })}
  {#if last}{t("gameSetup.previewTournament.endsAroundLevel", { sb: amt(last.sb), bb: amt(last.bb) })}{/if}
  {t("gameSetup.previewTournament.startNowTime", { time: timeOfDay(time.now + planned * 60000) })}
  {t("gameSetup.previewTournament.overtimeNote", { duration: duration(structureMinutes(levels)) })}
</p>
<StructureTable bind:levels={() => d.levels, (v) => (d.edited = v)} {chips} editable onedit={() => d.keep()} />

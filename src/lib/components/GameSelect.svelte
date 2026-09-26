<script lang="ts">
  import { money } from "$lib/util";
  import { t } from "$lib/i18n";

  // one of the lists every game's setup picks from. the defaults (Settings >
  // New Games) and the new game form both use these, so the two offer the same
  // choices in the same words.
  let {
    of,
    value = $bindable(),
    id,
    onchange,
  }: { of: "depth" | "level" | "round"; value: number; id?: string; onchange?: () => void } = $props();

  const LEVELS = [5, 8, 10, 12, 15, 20, 25, 30, 40, 45, 60];
  const ROUNDING = [1, 5, 10, 20];

  // (rounding is written in the host's currency, so it's worked out each time;
  // the depth/level labels go through t() so they re-translate on language change)
  const options = $derived<[number, string][]>(
    of === "depth"
      ? [
          [50, t("nav.gameSelect.depthTurbo", { bb: 50 })],
          [75, t("nav.gameSelect.depthPlain", { bb: 75 })],
          [100, t("nav.gameSelect.depthNormal", { bb: 100 })],
          [150, t("nav.gameSelect.depthDeep", { bb: 150 })],
          [200, t("nav.gameSelect.depthVeryDeep", { bb: 200 })],
        ]
      : of === "level"
        ? LEVELS.map((m) => [m, t("nav.gameSelect.minutes", { n: m })])
        : ROUNDING.map((v) => [v, money(v)])
  );
</script>

<select {id} bind:value {onchange}>
  {#each options as [v, label] (v)}<option value={v}>{label}</option>{/each}
</select>

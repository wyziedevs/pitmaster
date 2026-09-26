<script lang="ts">
  import { money } from "$lib/util";

  // one of the lists every game's setup picks from. the defaults (Settings >
  // New Games) and the new game form both use these, so the two offer the same
  // choices in the same words.
  let {
    of,
    value = $bindable(),
    id,
    onchange,
  }: { of: "depth" | "level" | "round"; value: number; id?: string; onchange?: () => void } = $props();

  const DEPTHS: [number, string][] = [
    [50, "Turbo: 50 Big Blinds"],
    [75, "75 Big Blinds"],
    [100, "Normal: 100 Big Blinds"],
    [150, "Deep: 150 Big Blinds"],
    [200, "Very Deep: 200 Big Blinds"],
  ];
  const LEVELS = [5, 8, 10, 12, 15, 20, 25, 30, 40, 45, 60];
  const ROUNDING = [1, 5, 10, 20];

  // (rounding is written in the host's currency, so it's worked out each time)
  const options = $derived<[number, string][]>(
    of === "depth" ? DEPTHS : of === "level" ? LEVELS.map((m) => [m, `${m} Minutes`]) : ROUNDING.map((v) => [v, money(v)])
  );
</script>

<select {id} bind:value {onchange}>
  {#each options as [v, label] (v)}<option value={v}>{label}</option>{/each}
</select>

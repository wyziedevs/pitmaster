// the pot games PitMaster knows. each is the same running pot with its own
// name, a usual ante and limit, the buttons its table needs most, and (in
// the i18n files) its rules.

interface PotPreset {
  id: "inbetween" | "guts" | "bourre" | "pigs" | "custom";
  /** in-between's bet against the pot: win, lose or hit the post */
  bets?: boolean;
  /** guts and bourre: losers match the pot */
  match?: boolean;
  /** a usual ante and limit, in big-blind-ish units of the host's money */
  ante: number;
  limit: number;
}

export const POT_PRESETS: PotPreset[] = [
  { id: "inbetween", bets: true, ante: 1, limit: 0 },
  { id: "guts", match: true, ante: 1, limit: 20 },
  { id: "bourre", match: true, ante: 1, limit: 20 },
  { id: "pigs", ante: 1, limit: 0 },
  { id: "custom", bets: true, match: true, ante: 1, limit: 0 },
];

export const potPreset = (id: string | undefined) => POT_PRESETS.find((p) => p.id === id) ?? POT_PRESETS[0];

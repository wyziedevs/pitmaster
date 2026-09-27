// the lives games PitMaster knows: each starts everyone with the same lives
// and takes them away round by round, on the same last-one-standing engine
// as liar's dice (kinds/standing.ts). a preset is a name, how many lives, what
// a life looks like on the tv, and (in the i18n files) its rules.

interface LivesPreset {
  id: "scat" | "screw" | "whist" | "ship" | "custom";
  lives: number;
  /** what a life is at the table */
  token: "coin" | "card" | "die";
  /** 31: a knocker caught lowest loses two, and a 31 costs everyone else one */
  knock?: boolean;
}

export const LIVES_PRESETS: LivesPreset[] = [
  { id: "scat", lives: 3, token: "coin", knock: true },
  { id: "screw", lives: 3, token: "coin" },
  { id: "whist", lives: 1, token: "card" },
  { id: "ship", lives: 3, token: "die" },
  { id: "custom", lives: 3, token: "coin" },
];

export const livesPreset = (id: string | undefined) => LIVES_PRESETS.find((p) => p.id === id) ?? LIVES_PRESETS[0];

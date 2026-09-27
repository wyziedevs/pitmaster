// built-in starting points for a tournament. they sit in New Game's Start From
// list and the palette, next to the host's own templates. each one changes only
// the few settings that make it what it is; everything else stays the host's
// own defaults. nothing here is stored, so they can't be deleted or go stale.
import type { BountyKind } from "./types";

export interface Preset {
  id: "turbo" | "hyper" | "deepstack" | "freezeout" | "sitgo" | "pko" | "mystery";
  levelMinutes?: number;
  hours?: number;
  depth?: number;
  breakEvery?: number;
  lateReg?: number;
  rebuys?: boolean;
  addOn?: boolean;
  expected?: number;
  payouts?: number[];
  bountyKind?: BountyKind;
  /** the bounty, as a share of the buy-in */
  bountyShare?: number;
}

export const PRESETS: Preset[] = [
  { id: "turbo", levelMinutes: 10, hours: 2.5, depth: 50, lateReg: 3 },
  { id: "hyper", levelMinutes: 5, hours: 1.25, depth: 50, breakEvery: 0, lateReg: 2 },
  { id: "deepstack", levelMinutes: 30, hours: 6, depth: 200, lateReg: 6 },
  { id: "freezeout", rebuys: false, addOn: false },
  { id: "sitgo", expected: 9, levelMinutes: 10, hours: 1.5, breakEvery: 0, lateReg: 0, rebuys: false, addOn: false, payouts: [50, 30, 20] },
  { id: "pko", bountyKind: "progressive", bountyShare: 0.5 },
  { id: "mystery", bountyKind: "mystery", bountyShare: 0.5 },
];

export const getPreset = (id: string) => PRESETS.find((p) => p.id === id);

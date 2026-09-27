// the optional parts of the poker form. each has its switch (Settings > Your
// Game) that puts it on every game; one that's off can still be added for
// just this game, and a template or rerun that used it brings it along. off
// means off: it isn't in the game at all.
import { settings } from "$lib/settings.svelte";
import type { GameType } from "$lib/types";

export type Feature = "variants" | "rake" | "bomb" | "sevenTwo" | "highHand" | "rebuys" | "bounty" | "cut" | "format";
type Switch = "useVariants" | "useRake" | "useBombPots" | "useSevenTwo" | "useHighHand" | "useRebuys" | "useBounties" | "useHouseCut" | "useSatellites" | "useShootouts" | "useBrackets";

/** in the order the form offers them. a format is three switches: satellites, shootouts and brackets */
const FEATURES: Record<Feature, { switches: Switch[]; label: string; kinds: GameType[] }> = {
  variants: { switches: ["useVariants"], label: "gameSetup.variants.addable", kinds: ["cash", "tournament"] },
  rake: { switches: ["useRake"], label: "gameSetup.addable.rakeOrSeatFee", kinds: ["cash"] },
  bomb: { switches: ["useBombPots"], label: "gameSetup.cash.sides.bombPots", kinds: ["cash"] },
  sevenTwo: { switches: ["useSevenTwo"], label: "gameSetup.cash.sides.sevenTwo", kinds: ["cash"] },
  highHand: { switches: ["useHighHand"], label: "gameSetup.cash.sides.highHand", kinds: ["cash"] },
  rebuys: { switches: ["useRebuys"], label: "gameSetup.addable.rebuysAddOns", kinds: ["tournament"] },
  bounty: { switches: ["useBounties"], label: "gameSetup.addable.bounty", kinds: ["tournament"] },
  cut: { switches: ["useHouseCut"], label: "gameSetup.tournament.houseCut.legend", kinds: ["tournament"] },
  format: { switches: ["useSatellites", "useShootouts", "useBrackets"], label: "gameSetup.tournament.format.addable", kinds: ["tournament"] },
};
const ALL = Object.keys(FEATURES) as Feature[];

export class Features {
  /** added for just this game */
  tonight = $state(Object.fromEntries(ALL.map((f) => [f, false])) as Record<Feature, boolean>);

  /** on the form: switched on for every game, or added for this one (`on` picks one of its switches) */
  shows = (f: Feature, on: Switch = FEATURES[f].switches[0]) => settings[on] || this.tonight[f];

  /** on for every game, so it can't be taken off this one */
  always = (f: Feature) => settings[FEATURES[f].switches[0]];

  /** what a game of this type can still add for the night */
  addable(type: GameType) {
    return ALL.filter((f) => FEATURES[f].kinds.includes(type) && !FEATURES[f].switches.every((on) => this.shows(f, on))).map((f) => ({ key: f, label: FEATURES[f].label }));
  }
}

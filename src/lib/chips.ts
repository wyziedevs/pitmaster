import type { ChipDef, ChipSet, ChipStyle, GameChip } from "./types";
import { amt, isMultiple, uid } from "./util";

type PresetChip = Omit<ChipDef, "id">;
type Preset = Omit<ChipSet, "chips"> & {
  style: ChipStyle;
  /** shared by every chip in the set unless a chip overrides it */
  look?: Pick<ChipDef, "inlay" | "ink" | "trim">;
  chips: PresetChip[];
};

// every color below was sampled from the manufacturer's product photos: the
// median of each part of the chip (clay, insert center, insert sides and ring,
// label, glitter ring), so they match the real chips, not a guess at them.

// KardShark 14g Monte Carlo, low denomination (amazon B0CFBPLWG4)
const KS_LOOK = { inlay: "#c4c6c4", ink: "#222222", trim: "#a6a06c" };
// DA VINCI Monte Carlo Poker Club 14g (amazon B072YRK4HD)
const DV_LOOK = { inlay: "#c6c5c1", ink: "#222222", trim: "#c8b565" };
// Playzaic 13.5g Monte Carlo tournament chips (amazon B0FPPJXNXD)
const PZ_LOOK = { inlay: "#d6d8da", ink: "#222222", trim: "#bca77a" };
// DA VINCI Casino Del Sol 11.5g (amazon B0009XDB8G)
const DS_LOOK = { inlay: "#fdfdfb", ink: "#111111", trim: "#7e1b15" };

const casinoDelSol500: PresetChip[] = [
  { label: "$1", color: "#244590", accent: "#fdfdfb", value: 1, count: 150 },
  { label: "$5", color: "#bb3d4b", accent: "#fdfdfb", value: 5, count: 150 },
  { label: "$25", color: "#216238", accent: "#fdfdfb", value: 25, count: 100 },
  { label: "$100", color: "#2a2a2a", accent: "#fdfdfb", value: 100, count: 50 },
  { label: "$500", color: "#818080", accent: "#fdfdfb", value: 500, count: 50 },
];

// monte carlo chips: accent is the center of each edge insert, accent2 its two
// sides (and the ring around the label)
const monteCarloLow500: PresetChip[] = [
  { label: "25¢", color: "#6a3f3a", accent: "#ce9e09", accent2: "#2e386d", value: 0.25, count: 150 },
  { label: "50¢", color: "#6d8c91", accent: "#c8b50a", accent2: "#273e6f", value: 0.5, count: 100 },
  { label: "$1", color: "#d4d5c6", accent: "#213467", accent2: "#658080", value: 1, count: 100 },
  { label: "$5", color: "#75322d", accent: "#7a315e", accent2: "#d19e07", value: 5, count: 100 },
  { label: "$25", color: "#225c50", accent: "#b19507", accent2: "#ada974", value: 25, count: 50 },
];

// the first set is the one a first visit starts on: plain dice chips, the most
// common set
export const PRESET_CHIP_SETS: Preset[] = [
  {
    id: "basic-300",
    name: "Dice Chips 300",
    note: "The standard 11.5g dice chip set with no values printed: 100 white and 50 each of red, blue, green and black. Colors match Casino Supply's dice-rim chips.",
    style: "basic",
    chips: [
      { label: "", color: "#d6d3cc", accent: "#2d4571", value: 1, count: 100 },
      { label: "", color: "#9d2530", accent: "#d5cbc4", value: 5, count: 50 },
      { label: "", color: "#285393", accent: "#e1dbd4", value: 10, count: 50 },
      { label: "", color: "#01a364", accent: "#ded8cc", value: 25, count: 50 },
      { label: "", color: "#212028", accent: "#d4cbc1", value: 100, count: 50 },
    ],
  },
  {
    id: "mc-low-500",
    name: "Monte Carlo 500 (Low Stakes)",
    note: "0.25 to 25, made for small-stakes cash games, in KardShark's colors: 150 brown 0.25, 100 blue-gray 0.50, 100 cream 1, 100 red 5, 50 green 25.",
    style: "montecarlo",
    look: KS_LOOK,
    chips: monteCarloLow500,
  },
  {
    id: "cds-500",
    name: "Casino Del Sol 500",
    note: "DA VINCI's 11.5g clay composite set in a silver aluminum case, 1 to 500: 150 blue 1, 150 red 5, 100 green 25, 50 black 100, 50 gray 500. Works well for tournaments.",
    style: "delsol",
    look: DS_LOOK,
    chips: casinoDelSol500,
  },
  {
    id: "mc-std-500",
    name: "Monte Carlo 500 (Standard)",
    note: "The standard 1 to 1,000 breakdown, in DA VINCI's Monte Carlo Poker Club colors: 100 white 1, 150 red 5, 100 green 25, 100 black 100, 25 purple 500, 25 yellow 1,000.",
    style: "montecarlo",
    look: DV_LOOK,
    chips: [
      { label: "$1", color: "#d5d4d0", accent: "#06446a", accent2: "#8a918c", value: 1, count: 100 },
      { label: "$5", color: "#6f2c25", accent: "#6d3860", accent2: "#c09838", value: 5, count: 150 },
      { label: "$25", color: "#065e47", accent: "#b1992f", accent2: "#a0a49f", value: 25, count: 100 },
      { label: "$100", color: "#22221f", accent: "#cac8c0", accent2: "#c5a642", value: 100, count: 100 },
      { label: "$500", color: "#2a2648", accent: "#cacac7", accent2: "#9b9b9e", value: 500, count: 25 },
      { label: "$1000", color: "#aea32c", accent: "#e2dbd6", accent2: "#a03a2b", value: 1000, count: 25 },
    ],
  },
  {
    id: "tourney-1000",
    name: "Monte Carlo Tournament 1000",
    note: "Playzaic's 1,000-chip Monte Carlo tournament set: 300 green 25, 250 black 100, 150 blue 500, 200 cream 1,000, 50 pink 5,000, 50 orange 10,000.",
    style: "montecarlo",
    look: PZ_LOOK,
    chips: [
      { label: "$25", color: "#5ea05e", accent: "#ccc490", accent2: "#ccc490", value: 25, count: 300 },
      { label: "$100", color: "#3e3d40", accent: "#e1d9ce", accent2: "#cdb77a", value: 100, count: 250 },
      { label: "$500", color: "#474778", accent: "#dfddda", accent2: "#817f8b", value: 500, count: 150 },
      { label: "$1000", color: "#cebe89", accent: "#e2d7d6", accent2: "#905251", value: 1000, count: 200 },
      { label: "$5000", color: "#e461aa", accent: "#86bfb9", accent2: "#46509f", value: 5000, count: 50 },
      { label: "$10000", color: "#c9925c", accent: "#dcdada", accent2: "#484340", value: 10000, count: 50 },
    ],
  },
];

export const presetCopy = (p: Preset): ChipSet => ({
  id: p.id,
  name: p.name,
  note: p.note,
  owned: p.owned,
  chips: p.chips.map((c) => ({ id: uid(), style: p.style, ...p.look, ...c })),
});

/**
 * what's on the chip face: its printed text, or, on a chip with nothing
 * printed (dice chips), its value, the way a host stickers a blank chip. a
 * game chip's value is what it plays for in that game.
 */
export const faceText = (c: ChipDef, isCash = false) => c.label || amt(c.value, isCash);

/** chips as used in a game. printed value x multiplier, sorted small -> big */
export function gameChips(set: ChipSet, multiplier = 1): GameChip[] {
  return set.chips
    .filter((c) => c.count > 0 && c.value > 0)
    .map((c) => ({ ...c, printed: c.value, value: +(c.value * multiplier).toFixed(4) }))
    .sort((a, b) => a.value - b.value);
}

export const totalValue = (chips: ChipDef[]) => chips.reduce((s, c) => s + c.value * c.count, 0);
export const totalCount = (chips: ChipDef[]) => chips.reduce((s, c) => s + Number(c.count || 0), 0);

export interface Breakdown<C extends ChipDef = ChipDef> {
  rows: { chip: C; n: number }[];
  total: number;
  short: number;
}

/**
 * split `stack` worth of chips for each of `players` people.
 * hands out plenty of small chips first (for posting blinds), then fills with bigger ones.
 */
export function distribute<C extends ChipDef>(stack: number, chips: C[], players = 1): Breakdown<C> {
  players = Math.max(1, players);
  const sorted = [...chips].sort((a, b) => a.value - b.value).filter((c) => c.value <= stack);
  const avail = sorted.map((c) => Math.floor(c.count / players));
  const n = sorted.map(() => 0);
  let remaining = stack;

  // small-chip base: each lower denom gets ~18% of the stack, max 20 chips, in stacks of 5
  const lowers = sorted.length > 2 ? sorted.length - 2 : sorted.length - 1;
  for (let i = 0; i < lowers; i++) {
    const v = sorted[i].value;
    let take = Math.max(0, Math.min(Math.floor(avail[i] * 0.75), 20, Math.floor((stack * 0.18) / v), Math.floor(remaining / v)));
    if (take >= 5) take -= take % 5;
    n[i] = take;
    remaining = +(remaining - take * v).toFixed(4);
  }

  // fill with the biggest chips that fit
  for (let i = sorted.length - 1; i >= 0; i--) {
    const v = sorted[i].value;
    const take = Math.min(avail[i] - n[i], Math.floor(+(remaining / v).toFixed(6)));
    if (take > 0) {
      n[i] += take;
      remaining = +(remaining - take * v).toFixed(4);
    }
  }

  // couldn't make it exact? back off one big chip and re-fill with smaller ones
  // (only keep the change if it actually gets closer)
  for (let pass = 0; pass < 3 && remaining > 1e-6; pass++) {
    const i = n.findIndex((x, j) => x > 0 && sorted[j].value > remaining);
    if (i < 0) break;
    const tryN = [...n];
    let tryRem = +(remaining + sorted[i].value).toFixed(4);
    tryN[i]--;
    for (let j = i - 1; j >= 0; j--) {
      const v = sorted[j].value;
      const take = Math.min(avail[j] - tryN[j], Math.floor(+(tryRem / v).toFixed(6)));
      if (take > 0) {
        tryN[j] += take;
        tryRem = +(tryRem - take * v).toFixed(4);
      }
    }
    if (tryRem >= remaining) break;
    n.splice(0, n.length, ...tryN);
    remaining = tryRem;
  }

  const rows = sorted.map((chip, i) => ({ chip, n: n[i] })).filter((r) => r.n > 0);
  const total = +rows.reduce((s, r) => s + r.n * r.chip.value, 0).toFixed(4);
  return { rows, total, short: +(stack - total).toFixed(4) };
}

/** roughly the biggest stack everyone can get */
export const maxStack = (chips: ChipDef[], players: number) =>
  chips.reduce((s, c) => s + Math.floor(c.count / Math.max(1, players)) * c.value, 0);

/** biggest chip that can still make every amount in `values` */
export function smallestNeeded<C extends ChipDef>(values: number[], chips: C[]): C {
  const desc = [...chips].sort((a, b) => b.value - a.value);
  for (const c of desc) if (values.every((v) => !v || isMultiple(v, c.value))) return c;
  return desc[desc.length - 1];
}

/** a color's relative luminance (WCAG), 0 black to 1 white */
function luminance(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = (parseInt(h.slice(i, i + 2), 16) || 0) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/** readable text on a chip face */
export const faceInk = (hex: string) => (luminance(hex) > 0.3 ? "#111" : "#fff");

/**
 * what a sticker's value is printed in: the chip's own clay color, like a
 * casino's denomination print (a shade deeper if it needs it to read), or its
 * inserts' color when the clay is too close to the sticker (a white chip), or
 * plain ink.
 */
export function printInk(sticker: string, choices: string[]) {
  for (const hex of choices) {
    const h = hex.replace("#", "");
    const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) || 0);
    for (const deeper of [1, 0.85, 0.72, 0.6]) {
      const ink = "#" + rgb.map((v) => Math.round(v * deeper).toString(16).padStart(2, "0")).join("");
      if (contrast(ink, sticker) >= 4.5) return ink;
    }
  }
  return faceInk(sticker);
}

/**
 * the inserts round a chip's edge that face the viewer, for a chip turned
 * `turn` degrees: where they sit across the front of the edge, seen straight
 * on (x from -49 at the left to 49 at the right), matching where the face
 * draws them. Chip.svelte and ChipStack.svelte both draw the edge from this.
 */
export function edgeInserts(chip: ChipDef, turn = 0) {
  const R = 49;
  const style = chip.style ?? "basic";
  const a2 = chip.accent2 || chip.accent;
  const rad = (d: number) => (d * Math.PI) / 180;
  const half = (x: number) => (Math.asin(x / 50) * 180) / Math.PI; // a face rect's half-width as an angle
  const out: { from: number; to: number; color: string }[] = [];
  if (style === "delsol") {
    // the rim's colored dashes, 15° each, twice every 90°
    for (let k = 0; k < 4; k++) for (const c of [12.5, 77.5]) out.push({ from: k * 90 + c - 7.5, to: k * 90 + c + 7.5, color: chip.accent });
  } else if (style === "montecarlo") {
    for (let k = 0; k < 6; k++) {
      const c = k * 60 + 30;
      out.push({ from: c - half(11.7), to: c - half(4.5), color: a2 });
      out.push({ from: c - half(4.6), to: c + half(4.6), color: chip.accent });
      out.push({ from: c + half(4.5), to: c + half(11.7), color: a2 });
    }
  } else for (let k = 0; k < 6; k++) out.push({ from: k * 60 - half(7), to: k * 60 + half(7), color: chip.accent });
  // only the front half of the edge faces us (90° to 270°)
  return out
    .map((s) => {
      const from = (((s.from + turn) % 360) + 360) % 360;
      return { ...s, from, to: from + (s.to - s.from) };
    })
    .map((s) => ({ ...s, from: Math.max(90, s.from), to: Math.min(270, s.to) }))
    .filter((s) => s.to > s.from)
    .map((s) => {
      const x = R * Math.sin(rad(s.to));
      return { x, w: R * Math.sin(rad(s.from)) - x, color: s.color };
    });
}

/**
 * the colors a face falls back to for a part that was never picked, by design.
 * ChipFace.svelte paints with them and the chip set editor offers them. a dice
 * chip's inlay is the paper sticker its value is printed on.
 */
export const FACE_DEFAULTS: Record<ChipStyle, { inlay: string; trim: string }> = {
  basic: { inlay: "#efede7", trim: "#b7a86a" },
  montecarlo: { inlay: "#c9cac7", trim: "#b7a86a" },
  delsol: { inlay: "#fdfdfb", trim: "#7e1b15" },
};

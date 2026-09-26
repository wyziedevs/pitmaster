/** what a flash toast is about: the tv picks its icon, sound and color by
 *  this, not by matching words in the (now translated) text */
export type EventKind = "win" | "deal" | "money" | "bust" | "chips" | "rack" | "shuffle" | "seat" | "note";

/** how a chip is drawn. matches the real chip families. */
export type ChipStyle = "basic" | "montecarlo" | "delsol";

export interface ChipDef {
  id: string;
  label: string;
  /** base clay color */
  color: string;
  /** main edge spot color */
  accent: string;
  /** second edge spot color */
  accent2?: string;
  /** center label / inlay color */
  inlay?: string;
  /** denomination text color */
  ink?: string;
  /** ring text / trim color on the inlay */
  trim?: string;
  style?: ChipStyle;
  /** printed / face value */
  value: number;
  count: number;
}

export interface ChipSet {
  id: string;
  name: string;
  note: string;
  /** a set the host actually owns (vs a generic starter) */
  owned?: boolean;
  chips: ChipDef[];
}

/** a chip as used inside a game: `value` is what it's worth in this game, `printed` is the face value */
export interface GameChip extends ChipDef {
  printed: number;
}

export interface Level {
  sb: number;
  bb: number;
  ante: number;
  minutes: number;
  isBreak?: boolean;
  overtime?: boolean;
  /** 1-based level number (breaks have none) */
  num?: number | null;
  /** chip ids that can be colored up when this level starts */
  colorUp?: string[];
}

export interface Player {
  id: string;
  name: string;
  /** cash: total $ bought in */
  cashIn: number;
  /** cash: $ they left with (null = still playing) */
  cashOut: number | null;
  rebuys: number;
  addOns: number;
  out: boolean;
  place: number | null;
  bustedAt: number | null;
  /** where they sit, once seats are drawn */
  seat?: Seat | null;
  /** cash: when they sat down and when they racked up (for hours played) */
  joinedAt?: number;
  leftAt?: number | null;
}

export interface Seat {
  table: number;
  seat: number;
}

/** one elimination: who went out and (if the host picked) who sent them there */
export interface Knockout {
  out: string;
  by: string | null;
  at: number;
}

export type ClockStatus = "idle" | "running" | "paused";

export interface Clock {
  status: ClockStatus;
  /** tournament anchor */
  levelIndex: number;
  levelElapsedMs: number;
  /** cash anchor */
  elapsedMs: number;
  anchorAt: number | null;
  startedAt: number | null;
}

export interface TourneySettings {
  buyIn: number;
  stack: number;
  expected: number;
  targetMinutes: number;
  levelMinutes: number;
  breakEvery: number;
  breakMinutes: number;
  /** level # where big blind ante starts, 0 = no antes */
  anteFrom: number;
  depth: number;
  rebuy: { on: boolean; cost: number; chips: number; untilLevel: number };
  addOn: { on: boolean; cost: number; chips: number };
  lateRegLevel: number;
  payouts: number[];
  /** % of what's left of each entry (after bounties and the flat fee) that the house keeps */
  rakePct: number;
  /** a flat amount the house keeps out of every buy-in and rebuy, 0 = none */
  fee: number;
  /** payouts come out in multiples of this ($1, $5, $10); the leftovers go to 1st */
  payoutRound: number;
  /** $ of each entry that sits on the player's head, 0 = no bounties */
  bounty: number;
}

/**
 * how a cash game pays the house.
 *  pot:  a cut of each pot goes in the rake box (pct, up to cap); the host logs what's in the box
 *  seat: every player pays a flat fee to sit, in cash, outside the chips
 */
export interface CashRake {
  mode: "none" | "pot" | "seat";
  pct: number;
  cap: number;
  fee: number;
}

export interface CashSettings {
  sb: number;
  bb: number;
  straddle: boolean;
  minBuyIn: number;
  maxBuyIn: number;
  defaultBuyIn: number;
  plannedMinutes: number;
  rake: CashRake;
}

export type GameType = "cash" | "tournament";

export interface Game {
  id: string;
  name: string;
  type: GameType;
  createdAt: number;
  updatedAt: number;
  chipSetName: string;
  /** chip value multiplier: game value = printed x multiplier */
  multiplier: number;
  chips: GameChip[];
  notes: string;
  players: Player[];
  clock: Clock;
  levels: Level[];
  tourney?: TourneySettings;
  cash?: CashSettings;
  /** banner pushed to the tv */
  message: { text: string; at: number } | null;
  /** last notable thing that happened, for tv toasts: what it says, and what
   *  kind of thing it was (that picks the toast's icon, sound and color, so
   *  the tv doesn't have to guess by pattern-matching translated text) */
  flash: { text: string; at: number; kind: EventKind } | null;
  log: { t: number; text: string }[];
  live: { code: string; key: string } | null;
  finished: boolean;
  /** every elimination, in order (tournaments) */
  kos?: Knockout[];
  /** seats per table for the seat draw */
  seatsPerTable?: number;
  /** the game this one was rerun from */
  from?: string;
  /** when the game was ended (cash: End Game; tournament: the winner) */
  endedAt?: number;
  /** a final-table chop: what each remaining player took instead of the payout table */
  deal?: { kind: "icm" | "chop"; amounts: Record<string, number>; at: number };
  /** only on published snapshots: the host's display prefs, so a tv on another device matches */
  prefs?: HostPrefs;
  /** cash: what's been dropped in the rake box so far */
  rakeBox?: number;
  /** who the rake and fees are paid to in settle-up (a player's name, or "The House") */
  house?: string;
}

/** where a regular gets paid, for settle-up links */
export interface PayHandles {
  venmo?: string;
  cashapp?: string;
  paypal?: string;
}

export interface HostPrefs {
  currency: string;
  clock: "12h" | "24h";
  levelWarning: number;
  tvSound: boolean;
  tvAwake: boolean;
  /** the tv reads level changes and busts out loud */
  tvVoice: boolean;
  /** the tv shows dollar amounts (pool, payouts, buy-ins) */
  tvMoney: boolean;
  /** how loud the tv plays, 0 to 100 */
  tvVolume: number;
}

/** a saved setup to start new games from */
export interface Template {
  id: string;
  name: string;
  type: GameType;
  createdAt: number;
  chipSetId: string;
  multiplier: number;
  notes: string;
  players: string[];
  /** tournament structure, if it was hand-edited (otherwise it regenerates) */
  levels?: Level[];
  tourney?: TourneySettings;
  cash?: CashSettings;
}

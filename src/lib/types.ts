/** what a flash toast is about: the tv picks its icon, sound and color by
 *  this, not by matching words in the (now translated) text */
export type EventKind =
  | "win"
  | "deal"
  | "money"
  | "bounty"
  | "bust"
  | "chips"
  | "rack"
  | "shuffle"
  | "draw"
  | "seat"
  | "bomb"
  | "sevenTwo"
  | "highHand"
  | "game"
  | "liar"
  | "note";

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
  /** the game played this level (variants.ts), none = no limit hold'em. limit games read bb as the small bet */
  game?: string;
  /** stud games: what the low card brings it in for (the ante is `ante`) */
  bringIn?: number;
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
  /** tournaments: the satellite whose seat paid this buy-in */
  ticket?: string;
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
  /** mystery bounties: the envelope `by` opened for this knockout */
  prize?: number;
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
  /**
   * how a knockout pays.
   *  flat:        the whole bounty goes to whoever knocked them out
   *  progressive: half goes to them, half is added to their own bounty
   *  mystery:     from `mysteryFrom` players left, each knockout opens a random
   *               envelope from the bounty money
   */
  bountyKind: BountyKind;
  /** mystery: how many players are left when the envelopes come out, 0 = when the money is reached */
  mysteryFrom: number;
  /** a satellite: the prizes are seats in another game, each worth this much (null = cash prizes) */
  satellite: { seatValue: number } | null;
  /**
   *  standard: one field, tables balanced as they shrink
   *  shootout: each table plays down to one winner, then the winners meet at a final table
   *  bracket:  heads-up matches, the winner of each moving on to the next round
   */
  format: "standard" | "shootout" | "bracket";
  /** the games, a new one each level in this order (HORSE, 8-Game, or the host's own), or one game for all of it. none = no limit hold'em */
  rotation?: string[];
}

export type BountyKind = "flat" | "progressive" | "mystery";

/** one heads-up match in a bracket. round 1 is the first; slot is its place in the round, top to bottom */
export interface Match {
  round: number;
  slot: number;
  /** player ids: null is a bye (round 1) or a winner still to come */
  a: string | null;
  b: string | null;
  winner: string | null;
  /** when it was decided */
  at: number | null;
}

/** a mystery bounty game's envelopes, made when the mystery part starts */
export interface Mystery {
  /** when the envelopes came out: knockouts from here on open one */
  at: number;
  /** every envelope, opened or not */
  prizes: number[];
  /** what each player still standing at the end opened for themselves */
  own: Record<string, number>;
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
  /** the side games: each is its own switch (Settings > Your Game) */
  bomb: BombPots;
  sevenTwo: SevenTwo;
  highHand: HighHand;
  /** the games played (variants.ts): one, or several for dealer's choice. none = no limit hold'em */
  games?: string[];
  /** dealer's choice: the game picked last, and how much play had gone by when it was */
  current?: string;
  since?: number;
  /** dealer's choice moves on to the next game every this many minutes of play, 0 = when the host says */
  rotateMinutes?: number;
  /** stud games: each player's ante and the bring-in */
  ante?: number;
  bringIn?: number;
}

/** everyone antes, the flop comes with no betting before it */
export interface BombPots {
  on: boolean;
  /** what each player puts in */
  ante: number;
  doubleBoard: boolean;
  /** one comes due every this many minutes of play, 0 = only when the host calls one */
  everyMinutes: number;
}

/** winning a hand with 7-2 collects this from everyone dealt in (in chips, at the table) */
export interface SevenTwo {
  on: boolean;
  amount: number;
}

/** the best hand in each window of play wins a prize the house pays */
export interface HighHand {
  on: boolean;
  prize: number;
  /** a new window every this many minutes of play, 0 = one for the whole game */
  everyMinutes: number;
}

/**
 * one thing that happened in a cash side game.
 *  bomb:         a bomb pot was called
 *  sevenTwo:     playerId won a hand with 7-2 and collected amount from each player
 *  highHand:     playerId has the high hand now (hand is what the host typed)
 *  highHandPaid: playerId was paid amount for the high hand; the next window starts clean
 */
export type SideEvent =
  | { kind: "bomb"; at: number }
  | { kind: "sevenTwo"; at: number; playerId: string; amount: number }
  /** window: which window of play it was set in (see HighHand.everyMinutes) */
  | { kind: "highHand"; at: number; playerId: string; hand: string; window: number }
  | { kind: "highHandPaid"; at: number; playerId: string; amount: number; hand: string };
export type HighHandSet = Extract<SideEvent, { kind: "highHand" }>;
export type HighHandPaid = Extract<SideEvent, { kind: "highHandPaid" }>;

/** something bought for the game (food, drinks, a new deck), split among the players */
export interface Cost {
  id: string;
  label: string;
  amount: number;
  /** a player id, or null for the house */
  paidBy: string | null;
  /** player ids who share it, empty = everyone in the game */
  split: string[];
}

/** someone waiting for a seat at a cash game, since `at` */
export interface Waiting {
  id: string;
  name: string;
  at: number;
}

/** a settle-up payment the host ticked off: from paid to this much */
export interface Payment {
  from: string;
  to: string;
  amount: number;
  at: number;
}

/** the kind of game: each has a folder in kinds/ and a line in kinds/index.ts */
export type GameType = "cash" | "tournament" | "dice" | "lives" | "pot";

/**
 * what a liar's dice game is played for.
 *  pot:    everyone buys in, and the pot is paid out by place (the payout table, rounded)
 *  perDie: every die lost costs a set amount, into a pot the last one standing
 *          takes, or straight to whoever won that call
 */
export interface DiceStakes {
  mode: "pot" | "perDie";
  buyIn: number;
  /** % of the pot for each place; empty = the usual table for the field */
  payouts: number[];
  payoutRound: number;
  perDie: number;
  perDieTo: "pot" | "winner";
}

/**
 * a lives game (31, screw your neighbor, knock-out whist, ship captain and
 * crew): everyone starts with the same lives, rounds take them away, and the
 * last one with any wins. played for what liar's dice is (DiceStakes, a life
 * being a die).
 */
export interface LivesSettings {
  preset: "scat" | "screw" | "whist" | "ship" | "custom";
  lives: number;
  stakes: DiceStakes;
}

/** one round of a lives game: the lives each player lost in it, and who won it (for money per life lost) */
export interface LivesRound {
  lost: Record<string, number>;
  winner?: string;
  at: number;
}

/**
 * a pot game (in-between, guts, bourre, pass the pigs): a running pot that
 * players ante into, pay into and take from.
 */
export interface PotSettings {
  preset: "inbetween" | "guts" | "bourre" | "pigs" | "custom";
  /** what each player puts in to start a round */
  ante: number;
  /** the most one bet can win or cost, and what matching the pot pays at most (0 = the whole pot) */
  limit: number;
  /** what's left in the pot at the end: split evenly, or back to whoever put it in */
  leftover: "split" | "back";
}

/**
 * one thing that happened to a pot. ante: everyone listed puts `amount` in;
 * pay and match: they put `amount` in (a lost bet, or matching the pot);
 * take: they take `amount` out (a won bet, or the whole pot)
 */
export interface PotEvent {
  kind: "ante" | "pay" | "match" | "take";
  players: string[];
  amount: number;
  at: number;
  /** in-between: how a bet went (a post pays double) */
  note?: "win" | "lose" | "post" | "pot";
}

/** how a liar's dice game is played */
export interface DiceSettings {
  /** dice each player starts with */
  dice: number;
  onesWild: boolean;
  /** calling spot on: not allowed, everyone else loses a die, or the caller gets one back */
  spotOn: "off" | "others" | "gain";
  /** a player down to their last die starts a round with no wild ones and a face that can't change */
  palifico: boolean;
  stakes: DiceStakes;
  /** the dealer screen: tap who lost a die, or enter the whole call */
  entry: "quick" | "full";
}

/**
 * one round of liar's dice: only the rounds are saved, and everything else
 * (dice left, who's out, places, money) is worked out from them. a quick
 * round has just its losers; a full one has the call that decided it.
 */
export interface DiceRound {
  bid?: { count: number; face: number };
  bidder?: string;
  caller?: string;
  call?: "liar" | "spot";
  /** how many of the bid's face there really were */
  actual?: number;
  losers: string[];
  /** spot on, where the caller gets one back */
  gains?: string[];
  /** who won the call (a die lost is paid to them, when the stakes say so) */
  winner?: string;
  at: number;
  /** phones as cups: everyone's dice, as the phones showed them at the call */
  reveal?: Record<string, number[]>;
  /** phones as cups: players whose phone's numbers didn't match what it locked in */
  cheats?: string[];
}

/**
 * phones as dice cups (kinds/dice/cups.ts): the round in play. what's here is
 * safe for anyone holding the live code to see: seat ids, the phones' hashes,
 * the host's numbers (no use without each phone's own), and what the phones
 * have already shown.
 */
export interface CupState {
  /** the table plays with phones (false: back to real cups) */
  on: boolean;
  /** each player's seat, by player id */
  seats: Record<string, string>;
  /** the deal's number: goes up with every deal and never repeats (a take back deals again), so a phone's hash is only good once */
  round: number;
  /** commit: the phones lock in; play: everyone can look; reveal: a call, the phones show */
  phase: "commit" | "play" | "reveal";
  /** each phone's hash for this round, by player id */
  commits?: Record<string, string>;
  /** the host's numbers, once every hash is in: one a die, by player id */
  host?: Record<string, number[]>;
  /** each phone's dice, once it's shown them on a call (empty: it didn't match) */
  shown?: Record<string, number[]>;
  /** players rolling real dice this round (their phone dropped out) */
  real?: string[];
  /** players whose numbers didn't match their hash this round */
  cheats?: string[];
  /** the call being counted */
  call?: { bid: { count: number; face: number }; bidder: string; caller: string; call: "liar" | "spot" };
}

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
  /** when the game was ended (cash and pot games: End Game; the rest: the winner) */
  endedAt?: number;
  /** a final-table chop: what each remaining player took instead of the payout table */
  deal?: { kind: "icm" | "chop"; amounts: Record<string, number>; at: number };
  /** mystery bounties, once they've started */
  mystery?: Mystery;
  /** shootouts: when the table winners were seated at the final table */
  finalAt?: number;
  /** a heads-up bracket's matches, every round, drawn at the start */
  matches?: Match[];
  /** liar's dice: how it's played, and every round so far */
  dice?: DiceSettings;
  rounds?: DiceRound[];
  /** liar's dice with phones as cups: the round in play */
  cups?: CupState;
  /** each player's seat key: only on the host's own device, never in a snapshot */
  cupKeys?: Record<string, string>;
  /** a lives game: how it's played, and every round so far */
  lives?: LivesSettings;
  lifeRounds?: LivesRound[];
  /** a pot game: how it's played, and everything that's happened to the pot */
  pot?: PotSettings;
  potEvents?: PotEvent[];
  /** cash: the side games' bomb pots, 7-2 wins and high hands, in order */
  sides?: SideEvent[];
  /** shared costs: they go into settle-up, not into anyone's results */
  costs?: Cost[];
  /** settle-up payments marked paid; what's still owed is worked out from these */
  paid?: Payment[];
  /** cash: who's waiting for a seat, first in line first */
  waitlist?: Waiting[];
  /** only on published snapshots: the host's display prefs, so a tv on another device matches */
  prefs?: HostPrefs;
  /** cash: what's been dropped in the rake box so far */
  rakeBox?: number;
  /** who the rake and fees are paid to in settle-up (a player's name, or "The House") */
  house?: string;
  /** the league this game counts toward */
  leagueId?: string;
  /** only on published snapshots: the league's top standings, worked out by the host */
  league?: LeagueBoard;
}

/**
 * how a league scores a game.
 *  table:  points by finishing place, from `table` (1st, 2nd, ...)
 *  beaten: one point for every player you finished ahead of, plus one
 *  root:   10 x the square root of (entrants / place): bigger fields are worth more
 * cash games rank everyone by what they won that night.
 */
export interface LeaguePoints {
  kind: "table" | "beaten" | "root";
  table: number[];
  /** points just for playing a game */
  play: number;
  /** points for each knockout (tournaments) */
  ko: number;
}

/** a season: the games linked to it, scored the same way */
export interface League {
  id: string;
  name: string;
  /** when the season runs (new games pick the league that's on) */
  start: number;
  end?: number;
  /** which kinds of game count */
  types: GameType[];
  points: LeaguePoints;
  /** keep each player's best this many results, 0 or missing = all of them */
  bestOf?: number;
  updatedAt: number;
}

/** a league's top standings, as a tv gets them */
export interface LeagueBoard {
  name: string;
  /** games that count so far */
  games: number;
  rows: { name: string; points: number; games: number }[];
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

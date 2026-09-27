// liar's dice: everyone starts with the same dice under a cup, bids go round
// the table on how many of a face there are in all, and a bid called a liar
// (or spot on) costs someone a die. the last one with dice wins. played on the
// "last one standing" engine (kinds/standing.ts) the other lives games share.
import type { DiceSettings, Game } from "$lib/types";
import type { Kind } from "../kind";
import { isStakes, lastStandingKind } from "../lastStanding";
import { money } from "$lib/util";
import { bool, id, list, maybe, num, obj, oneOf, type Is } from "$lib/shape";
import { diceState } from "./engine";
import { t, tp } from "$lib/i18n";

/** a new game's rules, before the host changes any */
export const DICE_DEFAULTS = (): DiceSettings => ({
  dice: 5,
  onesWild: true,
  spotOn: "others",
  palifico: true,
  stakes: { mode: "pot", buyIn: 10, payouts: [], payoutRound: 1, perDie: 1, perDieTo: "winner" },
  entry: "full",
});

const settings = (d: unknown) =>
  obj(d) && num(d.dice) && d.dice >= 1 && d.dice <= 20 && bool(d.onesWild) && oneOf("off", "others", "gain")(d.spotOn) && bool(d.palifico) && isStakes(d.stakes) && oneOf("quick", "full")(d.entry);
/** a bid: how many of which face */
const bid = (b: unknown) => obj(b) && num(b.count) && num(b.face) && b.face >= 1 && b.face <= 6;
/** something by player */
const byPlayer = (is: Is) => (x: unknown) => obj(x) && Object.entries(x).every(([k, v]) => id(k) && is(v));
/** numbers from lo to hi */
const within = (lo: number, hi: number) => list((d) => num(d) && d >= lo && d <= hi);
/** dice by player: faces 1 to 6 */
const faces = byPlayer(within(1, 6));
/** numbers by player, 0 to 5 (the host's half of each die) */
const halves = byPlayer(within(0, 5));
const strings = byPlayer((v) => typeof v === "string" && v.length <= 128);
const round = (r: unknown) =>
  obj(r) &&
  maybe(bid)(r.bid) &&
  maybe(id)(r.bidder) &&
  maybe(id)(r.caller) &&
  maybe(oneOf("liar", "spot"))(r.call) &&
  maybe(num)(r.actual) &&
  list(id)(r.losers) &&
  maybe(list(id))(r.gains) &&
  maybe(id)(r.winner) &&
  num(r.at) &&
  maybe(faces)(r.reveal) &&
  maybe(list(id))(r.cheats);
const cups = (c: unknown) =>
  obj(c) &&
  bool(c.on) &&
  strings(c.seats) &&
  num(c.round) &&
  oneOf("commit", "play", "reveal")(c.phase) &&
  maybe(strings)(c.commits) &&
  maybe(halves)(c.host) &&
  maybe(faces)(c.shown) &&
  maybe(list(id))(c.real) &&
  maybe(list(id))(c.cheats) &&
  maybe((x) => obj(x) && bid(x.bid) && id(x.bidder) && id(x.caller) && oneOf("liar", "spot")(x.call))(c.call);

/** the stakes in words: "$10 buy-in, pool $60" or "$1 a die, to the winner of each call" */
export function stakesLine(game: Game) {
  const s = game.dice!.stakes;
  if (s.mode === "pot") return t("gamePlay.dice.stakesPot", { buyIn: money(s.buyIn), pool: money(s.buyIn * game.players.length) });
  return t(s.perDieTo === "pot" ? "gamePlay.dice.stakesPerDiePot" : "gamePlay.dice.stakesPerDieWinner", { amount: money(s.perDie) });
}

/** the rules in a few words: "5 dice each · ones wild · spot on · palifico" */
export function rulesLine(d: DiceSettings) {
  return [
    tp("gamePlay.dice.diceEach", d.dice),
    d.onesWild ? t("gamePlay.dice.onesWild") : "",
    d.spotOn !== "off" ? t(d.spotOn === "gain" ? "gamePlay.dice.spotOnGain" : "gamePlay.dice.spotOnOthers") : "",
    d.palifico ? t("gamePlay.dice.palifico") : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

const shared = lastStandingKind({
  state: diceState,
  stakes: (game) => game.dice!.stakes,
  played: (game) => game.rounds?.length ?? 0,
  left: (n) => tp("gamePlay.dice.diceLeft", n),
  lostColumn: () => t("gamePlay.dice.csvDiceLost"),
  setup: (game) => `${rulesLine(game.dice!)} · ${stakesLine(game)}`,
  // whose palifico round it is, or who starts it
  more: (st, p) =>
    st.palifico === p.id ? [{ text: t("gamePlay.dice.yourPalifico"), tone: "hot" }] : st.starter === p.id ? [{ text: t("gamePlay.dice.youStart") }] : [],
});

export const dice: Kind = {
  id: "dice",
  label: () => t("common.kinds.dice.label"),
  plural: () => t("common.kinds.dice.plural"),
  newLabel: () => t("common.kinds.dice.newLabel"),
  tabTitle: () => t("common.kinds.dice.label"),
  keywords: "liars dice bluff perudo dudo",
  poker: false,
  ranks: "place",
  Setup: () => import("./Setup.svelte"),
  Control: () => import("./Control.svelte"),
  Board: () => import("./Board.svelte"),
  check: (g) => settings(g.dice) && maybe(list(round))(g.rounds) && maybe(cups)(g.cups) && maybe(strings)(g.cupKeys),
  ...shared,
  summary: (game) => `${tp("toys.summary.players", game.players.length)} · ${rulesLine(game.dice!)} · ${stakesLine(game)}`,
  now: (game) => {
    const st = diceState(game);
    return t("gamePlay.dice.nowLine", { round: String((game.rounds?.length ?? 0) + 1), dice: tp("gamePlay.dice.diceOnTable", st.total), left: tp("toys.summary.players", st.alive.length) });
  },
};

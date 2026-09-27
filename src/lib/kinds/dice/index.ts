// liar's dice: everyone starts with the same dice under a cup, bids go round
// the table on how many of a face there are in all, and a bid called a liar
// (or spot on) costs someone a die. the last one with dice wins. played on the
// "last one standing" engine (kinds/lives.ts) the other lives games share.
import type { DiceSettings, Game, Player } from "$lib/types";
import type { Kind, Line } from "../kind";
import type { Result } from "$lib/stats";
import { settleNets } from "$lib/game";
import { pad, settleLines } from "$lib/report";
import { csv, money, nameKey, ordinal, round2, signed } from "$lib/util";
import { bool, id, list, maybe, num, obj, oneOf } from "$lib/shape";
import { prefs } from "$lib/settings.svelte";
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

const stakes = (s: unknown) =>
  obj(s) && oneOf("pot", "perDie")(s.mode) && num(s.buyIn) && list(num)(s.payouts) && num(s.payoutRound) && num(s.perDie) && oneOf("pot", "winner")(s.perDieTo);
const settings = (d: unknown) =>
  obj(d) && num(d.dice) && d.dice >= 1 && d.dice <= 20 && bool(d.onesWild) && oneOf("off", "others", "gain")(d.spotOn) && bool(d.palifico) && stakes(d.stakes) && oneOf("quick", "full")(d.entry);
const round = (r: unknown) =>
  obj(r) &&
  maybe((b) => obj(b) && num(b.count) && num(b.face) && b.face >= 1 && b.face <= 6)(r.bid) &&
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
/** dice by player: faces 1 to 6 */
const faces = (x: unknown) => obj(x) && Object.entries(x).every(([k, v]) => id(k) && list((d) => num(d) && d >= 1 && d <= 6)(v));
/** numbers by player, 0 to 5 (the host's half of each die) */
const halves = (x: unknown) => obj(x) && Object.entries(x).every(([k, v]) => id(k) && list((d) => num(d) && d >= 0 && d <= 5)(v));
const strings = (x: unknown) => obj(x) && Object.entries(x).every(([k, v]) => id(k) && typeof v === "string" && v.length <= 128);
const cups = (c: unknown) =>
  obj(c) &&
  bool(c.on) &&
  strings(c.seats) &&
  num(c.round) &&
  oneOf("commit", "play", "reveal")(c.phase) &&
  maybe(strings)(c.commits) &&
  maybe(halves)(c.host) &&
  maybe((x) => obj(x) && Object.entries(x).every(([k, v]) => id(k) && list((d) => num(d) && d >= 1 && d <= 6)(v)))(c.shown) &&
  maybe(list(id))(c.real) &&
  maybe(list(id))(c.cheats) &&
  maybe(
    (x) =>
      obj(x) &&
      obj(x.bid) &&
      num(x.bid.count) &&
      num(x.bid.face) &&
      id(x.bidder) &&
      id(x.caller) &&
      oneOf("liar", "spot")(x.call)
  )(c.call);

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

/** each player's night, once it's over: what they paid, took home and where they finished */
function results(game: Game): Result[] {
  if (!game.finished || !game.dice) return [];
  const st = diceState(game);
  const base = { gameId: game.id, gameName: game.name, type: game.type, at: game.clock.startedAt ?? game.createdAt };
  return game.players.map((p) => {
    const cost = st.money.paid[p.id] ?? 0;
    const won = st.money.won[p.id] ?? 0;
    return {
      ...base,
      key: nameKey(p.name),
      name: p.name.trim(),
      cost,
      won,
      net: round2(won - cost),
      place: st.places[p.id],
      entrants: game.players.length,
      itm: won > 0,
      kos: 0,
      hours: null,
      highHand: 0,
      sevenTwo: 0,
    };
  });
}

/**
 * who pays who. a buy-in pot was paid at the door, so whoever holds it (the
 * house) pays the prizes; money per die is owed player to player
 */
function settleDice(game: Game) {
  if (!game.dice || !game.rounds?.length) return settleNets(game, []);
  const st = diceState(game);
  const pot = game.dice.stakes.mode === "pot";
  // a pot is only paid out once it's over; dice lost are owed as they go
  if (pot && !game.finished) return settleNets(game, []);
  return settleNets(
    game,
    game.players.map((p) => ({ name: p.name, net: round2((st.money.won[p.id] ?? 0) - (pot ? 0 : (st.money.paid[p.id] ?? 0))) }))
  );
}

function recap(game: Game) {
  const d = game.dice!;
  const st = diceState(game);
  const lines = [`${rulesLine(d)} · ${stakesLine(game)}`, tp("gamePlay.dice.roundsPlayed", game.rounds?.length ?? 0), ""];
  const byPlace = [...game.players].sort((a, b) => (st.places[a.id] ?? 0) - (st.places[b.id] ?? 0) || st.lives[b.id] - st.lives[a.id]);
  const w = Math.max(...byPlace.map((p) => p.name.length), 4) + 2;
  for (const p of byPlace) {
    const place = st.places[p.id];
    const label = place ? pad(ordinal(place), 6) : pad(tp("gamePlay.dice.diceLeft", st.lives[p.id]), 10);
    const net = round2((st.money.won[p.id] ?? 0) - (st.money.paid[p.id] ?? 0));
    lines.push(`${label}${pad(p.name, w)}${game.finished || d.stakes.mode === "perDie" ? signed(net) : ""}`.trimEnd());
  }
  lines.push(...settleLines(game));
  return lines;
}

function gameCsv(game: Game) {
  const st = diceState(game);
  const date = new Date(game.clock.startedAt ?? game.createdAt).toISOString().slice(0, 10);
  return csv([
    [t("players.report.csv.date"), t("players.report.csv.game"), t("players.report.csv.player"), t("players.report.csv.place"), t("gamePlay.dice.csvDiceLost"), t("players.report.csv.paidIn"), t("players.report.csv.won"), t("players.report.csv.net")],
    ...game.players.map((p) => [date, game.name, p.name, st.places[p.id] ?? "", st.lost[p.id] ?? 0, st.money.paid[p.id] ?? 0, st.money.won[p.id] ?? 0, round2((st.money.won[p.id] ?? 0) - (st.money.paid[p.id] ?? 0))]),
  ]);
}

function find(game: Game, p: Player): Line[] {
  const st = diceState(game);
  const showMoney = prefs().tvMoney !== false;
  const out: Line[] = [];
  const place = st.places[p.id];
  if (place === 1) out.push({ text: t("tv.find.winner"), tone: "good" });
  else if (place) out.push({ text: t("tv.find.outIn", { place: ordinal(place) }), tone: "hot" });
  else {
    out.push({ text: tp("gamePlay.dice.diceLeft", st.lives[p.id]), tone: "good" });
    if (st.palifico === p.id) out.push({ text: t("gamePlay.dice.yourPalifico"), tone: "hot" });
    else if (st.starter === p.id) out.push({ text: t("gamePlay.dice.youStart") });
  }
  const net = round2((st.money.won[p.id] ?? 0) - (st.money.paid[p.id] ?? 0));
  if (showMoney && (game.finished || game.dice!.stakes.mode === "perDie") && Math.abs(net) > 0.004) out.push({ text: signed(net), tone: net > 0 ? "good" : undefined });
  return out;
}

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
  results,
  settle: settleDice,
  settled: (game) => game.finished,
  playing: (game, p) => diceState(game).lives[p.id] > 0,
  recap,
  csv: gameCsv,
  summary: (game) => `${tp("toys.summary.players", game.players.length)} · ${rulesLine(game.dice!)} · ${stakesLine(game)}`,
  now: (game) => {
    const st = diceState(game);
    return t("gamePlay.dice.nowLine", { round: String((game.rounds?.length ?? 0) + 1), dice: tp("gamePlay.dice.diceOnTable", st.total), left: tp("toys.summary.players", st.alive.length) });
  },
  headline: (game) => {
    const w = results(game).find((r) => r.place === 1);
    return w ? (w.won > 0 ? `${w.name} won ${money(w.won)}` : w.name) : "";
  },
  describe: (r) => [r.place ? t("players.page.history.place", { place: ordinal(r.place), entrants: r.entrants }) : ""].filter(Boolean).join(" · "),
  find,
};

// lives games: 31 (scat), screw your neighbor, knock-out whist, ship captain
// and crew, or the host's own. everyone starts with the same lives, each round
// takes some away, and the last one with any wins. they share liar's dice's
// last-one-standing engine (kinds/standing.ts) and its stakes.
import type { Game, LivesSettings, Player } from "$lib/types";
import type { Kind, Line } from "../kind";
import type { Result } from "$lib/stats";
import { settleNets } from "$lib/game";
import { pad, settleLines } from "$lib/report";
import { csv, money, nameKey, ordinal, round2, signed } from "$lib/util";
import { id, list, maybe, num, obj, oneOf } from "$lib/shape";
import { prefs } from "$lib/settings.svelte";
import { livesState } from "./engine";
import { livesPreset } from "./presets";
import { t, tp } from "$lib/i18n";

/** a new game's setup for a preset, before the host changes it */
export const LIVES_DEFAULTS = (preset: LivesSettings["preset"] = "scat"): LivesSettings => ({
  preset,
  lives: livesPreset(preset).lives,
  stakes: { mode: "pot", buyIn: 5, payouts: [], payoutRound: 1, perDie: 1, perDieTo: "pot" },
});

const stakes = (s: unknown) =>
  obj(s) && oneOf("pot", "perDie")(s.mode) && num(s.buyIn) && list(num)(s.payouts) && num(s.payoutRound) && num(s.perDie) && oneOf("pot", "winner")(s.perDieTo);
const settings = (l: unknown) => obj(l) && oneOf("scat", "screw", "whist", "ship", "custom")(l.preset) && num(l.lives) && l.lives >= 1 && l.lives <= 50 && stakes(l.stakes);
const round = (r: unknown) => obj(r) && obj(r.lost) && Object.entries(r.lost).every(([k, v]) => id(k) && num(v) && v >= 0 && v <= 50) && maybe(id)(r.winner) && num(r.at);

/** the game's name: the preset's, or (the host's own) just "Lives" */
export const presetName = (g: Game) => t(`common.kinds.lives.presets.${g.lives!.preset}`);

/** the stakes in words */
export function stakesLine(game: Game) {
  const s = game.lives!.stakes;
  if (s.mode === "pot") return t("gamePlay.dice.stakesPot", { buyIn: money(s.buyIn), pool: money(s.buyIn * game.players.length) });
  return t(s.perDieTo === "pot" ? "gamePlay.lives.stakesPerLifePot" : "gamePlay.lives.stakesPerLifeWinner", { amount: money(s.perDie) });
}

function results(game: Game): Result[] {
  if (!game.finished || !game.lives) return [];
  const st = livesState(game);
  const base = { gameId: game.id, gameName: game.name, type: game.type, at: game.clock.startedAt ?? game.createdAt };
  return game.players.map((p) => {
    const cost = st.money.paid[p.id] ?? 0;
    const won = st.money.won[p.id] ?? 0;
    return { ...base, key: nameKey(p.name), name: p.name.trim(), cost, won, net: round2(won - cost), place: st.places[p.id], entrants: game.players.length, itm: won > 0, kos: 0, hours: null, highHand: 0, sevenTwo: 0 };
  });
}

/** a buy-in pot is paid by the house once it's over; money per life is owed player to player as it goes */
function settleLives(game: Game) {
  if (!game.lives || !game.lifeRounds?.length) return settleNets(game, []);
  const st = livesState(game);
  const pot = game.lives.stakes.mode === "pot";
  if (pot && !game.finished) return settleNets(game, []);
  return settleNets(game, game.players.map((p) => ({ name: p.name, net: round2((st.money.won[p.id] ?? 0) - (pot ? 0 : (st.money.paid[p.id] ?? 0))) })));
}

function recap(game: Game) {
  const st = livesState(game);
  const lines = [`${presetName(game)} · ${tp("gamePlay.lives.livesEach", game.lives!.lives)} · ${stakesLine(game)}`, tp("gamePlay.dice.roundsPlayed", game.lifeRounds?.length ?? 0), ""];
  const byPlace = [...game.players].sort((a, b) => (st.places[a.id] ?? 0) - (st.places[b.id] ?? 0) || st.lives[b.id] - st.lives[a.id]);
  const w = Math.max(...byPlace.map((p) => p.name.length), 4) + 2;
  for (const p of byPlace) {
    const place = st.places[p.id];
    const label = place ? pad(ordinal(place), 6) : pad(tp("gamePlay.lives.livesLeft", st.lives[p.id]), 10);
    const net = round2((st.money.won[p.id] ?? 0) - (st.money.paid[p.id] ?? 0));
    lines.push(`${label}${pad(p.name, w)}${game.finished || game.lives!.stakes.mode === "perDie" ? signed(net) : ""}`.trimEnd());
  }
  lines.push(...settleLines(game));
  return lines;
}

function gameCsv(game: Game) {
  const st = livesState(game);
  const date = new Date(game.clock.startedAt ?? game.createdAt).toISOString().slice(0, 10);
  return csv([
    [t("players.report.csv.date"), t("players.report.csv.game"), t("players.report.csv.player"), t("players.report.csv.place"), t("gamePlay.lives.csvLivesLost"), t("players.report.csv.paidIn"), t("players.report.csv.won"), t("players.report.csv.net")],
    ...game.players.map((p) => [date, game.name, p.name, st.places[p.id] ?? "", st.lost[p.id] ?? 0, st.money.paid[p.id] ?? 0, st.money.won[p.id] ?? 0, round2((st.money.won[p.id] ?? 0) - (st.money.paid[p.id] ?? 0))]),
  ]);
}

function find(game: Game, p: Player): Line[] {
  const st = livesState(game);
  const out: Line[] = [];
  const place = st.places[p.id];
  if (place === 1) out.push({ text: t("tv.find.winner"), tone: "good" });
  else if (place) out.push({ text: t("tv.find.outIn", { place: ordinal(place) }), tone: "hot" });
  else out.push({ text: tp("gamePlay.lives.livesLeft", st.lives[p.id]), tone: "good" });
  const net = round2((st.money.won[p.id] ?? 0) - (st.money.paid[p.id] ?? 0));
  if (prefs().tvMoney !== false && (game.finished || game.lives!.stakes.mode === "perDie") && Math.abs(net) > 0.004) out.push({ text: signed(net), tone: net > 0 ? "good" : undefined });
  return out;
}

export const lives: Kind = {
  id: "lives",
  label: () => t("common.kinds.lives.label"),
  plural: () => t("common.kinds.lives.plural"),
  newLabel: () => t("common.kinds.lives.newLabel"),
  tabTitle: () => t("common.kinds.lives.label"),
  keywords: "31 scat screw your neighbor knock out whist ship captain crew elimination lives",
  poker: false,
  ranks: "place",
  Setup: () => import("./Setup.svelte"),
  Control: () => import("./Control.svelte"),
  Board: () => import("./Board.svelte"),
  check: (g) => settings(g.lives) && maybe(list(round))(g.lifeRounds),
  results,
  settle: settleLives,
  settled: (game) => game.finished,
  playing: (game, p) => livesState(game).lives[p.id] > 0,
  recap,
  csv: gameCsv,
  summary: (game) => `${presetName(game)} · ${tp("toys.summary.players", game.players.length)} · ${stakesLine(game)}`,
  now: (game) => {
    const st = livesState(game);
    return t("gamePlay.lives.nowLine", { round: String((game.lifeRounds?.length ?? 0) + 1), left: tp("toys.summary.players", st.alive.length) });
  },
  headline: (game) => {
    const w = results(game).find((r) => r.place === 1);
    return w ? (w.won > 0 ? `${w.name} won ${money(w.won)}` : w.name) : "";
  },
  describe: (r) => (r.place ? t("players.page.history.place", { place: ordinal(r.place), entrants: r.entrants }) : ""),
  find,
};

// a tournament: everyone buys in once (and rebuys or adds on, if allowed),
// plays down to a winner on the blind clock, and the places are paid from the
// pool. its dealer screen is Control.svelte; its form and its tv board are the
// poker ones it shares with cash games.
import type { Game, Player } from "$lib/types";
import type { Kind, Line } from "../kind";
import { resultRow, type Result } from "$lib/stats";
import { gameDate } from "$lib/game";
import { houseName, playerName } from "$lib/events";
import { addTo, costNets, squareUp } from "$lib/settle";
import { tableCounts } from "$lib/seats";
import { roundName } from "./bracket";
import { tourneyBook } from "./engine";
import { derive } from "$lib/clock";
import { pad, settleLines } from "$lib/report";
import { amt, clock, csv, duration, money, ordinal, timeOfDay } from "$lib/util";
import { gameLine, gamesLabel } from "$lib/variants";
import { isDeal, isKnockout, isMatch, isMystery, isTourneySettings } from "../poker/check";
import { list, maybe, num } from "$lib/shape";
import { seatText } from "../poker/seat";
import { pokerSetup } from "../poker";
import { prefs } from "$lib/settings.svelte";
import { t, tp } from "$lib/i18n";

/** a tournament counts once it has a winner (until then the pool can still grow) */
function results(game: Game): Result[] {
  if (!game.finished || !game.tourney) return [];
  const s = tourneyBook(game, game.tourney);
  return game.players.map((p) => {
    const take = s.takes[p.id];
    return resultRow(game, p, take.cost, take.won, { place: p.place, entrants: s.entrants, itm: take.prize > 0, kos: take.kos });
  });
}

function recap(game: Game) {
  const lines: string[] = [];
  if (!game.tourney) return lines;
  const s = tourneyBook(game, game.tourney);
  const extras = [s.rebuys ? tp("players.report.tourney.rebuys", s.rebuys) : "", s.addOns ? tp("players.report.tourney.addOns", s.addOns) : ""].filter(Boolean);
  const rotation = game.tourney.rotation ?? [];
  const mix = rotation.length ? gamesLabel(rotation, false) : "";
  const parts = [mix, tp("players.report.tourney.entrants", s.entrants), t("players.report.tourney.buyIn", { amount: money(game.tourney.buyIn) }), ...extras].filter(Boolean).join(" · ");
  const pool = t("players.report.tourney.pool", { amount: money(s.pool) });
  const rakeNote = s.rake ? ` ${t("players.report.tourney.rakeKept", { amount: money(s.rake) })}` : "";
  lines.push(`${parts} · ${pool}${rakeNote}`);
  if (game.levels.length && game.clock.startedAt) {
    const d = derive(game, game.endedAt ?? Date.now());
    lines.push(t("players.report.tourney.endedAt", { duration: duration(d.totalElapsedMs / 60000), stakes: d.level.game ? gameLine(d.level) : `${amt(d.level.sb)}/${amt(d.level.bb)}` }));
  }
  lines.push("");
  const byPlace = [...game.players].sort((a, b) => (a.place ?? 999) - (b.place ?? 999));
  const w = Math.max(...byPlace.map((p) => p.name.length), 4) + 2;
  for (const p of byPlace) {
    const take = s.takes[p.id];
    const label = p.place ? pad(ordinal(p.place), 6) : pad(t("players.report.tourney.stillIn"), 6);
    // what they won counts once there's a winner; a satellite seat is won, not paid in cash
    const won = game.finished && take.won ? (take.seat ? t("players.report.tourney.seat", { amount: money(take.won) }) : money(take.won)) : "";
    const tail = [won, take.kos ? tp("players.report.tourney.kos", take.kos) : ""].filter(Boolean).join(" · ");
    lines.push(`${label}${pad(p.name, w)}${tail}`.trimEnd());
  }
  lines.push(...settleLines(game));
  if (!game.finished) lines.push("", t("players.report.tourney.stillPlayingNote"));
  return lines;
}

function gameCsv(game: Game) {
  if (!game.tourney) return "";
  const date = gameDate(game);
  const s = tourneyBook(game, game.tourney);
  const costs = costNets(game);
  return csv([
    [
      t("players.report.csv.date"),
      t("players.report.csv.game"),
      t("players.report.csv.player"),
      t("players.report.csv.place"),
      t("players.report.csv.rebuys"),
      t("players.report.csv.addOns"),
      t("players.report.csv.paidIn"),
      t("players.report.csv.won"),
      t("players.report.csv.net"),
      t("players.report.csv.knockouts"),
      t("players.report.csv.busted"),
      ...(game.costs?.length ? [t("players.report.csv.costs")] : []),
    ],
    ...[...game.players]
      .sort((a, b) => (a.place ?? 999) - (b.place ?? 999))
      .map((p) => {
        const take = s.takes[p.id];
        // what they won (and so their net) counts once there's a winner
        const r = game.finished ? take : null;
        return [date, game.name, p.name, p.place ?? "", p.rebuys, p.addOns, take.cost, r?.won ?? "", r?.net ?? "", take.kos, p.bustedAt ? timeOfDay(p.bustedAt) : "", ...(game.costs?.length ? [costs[p.id] ?? 0] : [])];
      }),
  ]);
}

function find(game: Game, p: Player): Line[] {
  const out: Line[] = [];
  const tr = game.tourney;
  if (!tr) return out;
  const showMoney = prefs().tvMoney !== false;
  const s = tourneyBook(game, tr);
  const take = s.takes[p.id];
  if (p.place === 1 && !take.seat) out.push({ text: t("tv.find.winner"), tone: "good" });
  else if (take.seat) out.push({ text: t("tv.find.wonSeat"), tone: "good" });
  else if (p.out) out.push({ text: t("tv.find.outIn", { place: ordinal(p.place ?? 0) }), tone: "hot" });
  else if (game.matches?.length) {
    // a bracket: who they play next, or who they're waiting on
    const m = game.matches.find((x) => !x.winner && (x.a === p.id || x.b === p.id));
    const opp = m && (m.a === p.id ? m.b : m.a);
    out.push({ text: m ? (opp ? t("tv.find.nextMatch", { name: playerName(game, opp), round: roundName(game, m.round) }) : t("tv.find.waitingMatch", { round: roundName(game, m.round) })) : t("tv.find.stillIn"), tone: "good" });
    out.push({ text: tp("tv.find.left", s.left) });
  } else {
    out.push({ text: seatText(game, p) || (tableCounts(game).length ? t("tv.find.noSeat") : t("tv.find.stillIn")), tone: "good" });
    out.push({ text: tp("tv.find.left", s.left) });
  }
  // what their place paid, once they finished in the money (a seat isn't cash)
  const won = take.seat ? 0 : take.prize;
  if (showMoney && won > 0) out.push({ text: t("tv.find.won", { amount: money(won) }), tone: "good" });
  const kind = tr.bounty ? tr.bountyKind : null;
  if (!p.out && showMoney && kind === "progressive") out.push({ text: t("tv.find.bountyOn", { amount: money(s.head[p.id] ?? 0) }) });
  else if (!p.out && showMoney && kind === "flat") out.push({ text: t("tv.find.bountyOn", { amount: money(tr.bounty) }) });
  if (take.kos) out.push({ text: tp("tv.find.knockouts", take.kos) });
  return out;
}

/**
 * who pays who at the end of a tournament. the buy-ins went in at the door,
 * so whoever holds the money (the house) pays out the prizes and bounties.
 * shared costs count from the start.
 */
function tourneySettle(game: Game) {
  const house = houseName(game);
  const nets: { name: string; net: number }[] = [];
  if (game.finished && game.tourney) {
    const { takes } = tourneyBook(game, game.tourney);
    // a satellite seat is paid in the next game, not in cash
    for (const p of game.players) addTo(nets, p.name, (takes[p.id].seat ? 0 : takes[p.id].prize) + takes[p.id].bounty);
    addTo(nets, house, -nets.reduce((a, x) => a + x.net, 0));
  }
  return squareUp(game, nets);
}

export const tournament: Kind = {
  id: "tournament",
  label: () => t("toys.gameType.tournament"),
  plural: () => t("toys.past.tournaments"),
  newLabel: () => t("nav.shortcuts.newTournament"),
  tabTitle: () => t("gamePlay.game.tabTournament"),
  keywords: "start mtt sng",
  poker: true,
  ranks: "place",
  Setup: pokerSetup,
  Control: () => import("./Control.svelte"),
  // a tournament's clock needs at least one level to count down
  check: (g) =>
    isTourneySettings(g.tourney) &&
    Array.isArray(g.levels) &&
    g.levels.length > 0 &&
    maybe(list(isKnockout))(g.kos) &&
    maybe(isMystery)(g.mystery) &&
    maybe(num)(g.finalAt) &&
    maybe(list(isMatch))(g.matches) &&
    maybe(isDeal)(g.deal),
  results,
  settle: tourneySettle,
  settled: (game) => game.finished,
  playing: (_game, p) => !p.out,
  recap,
  csv: gameCsv,
  summary: (game) => {
    if (!game.tourney) return "";
    const s = tourneyBook(game, game.tourney);
    return t("toys.summary.tournament", { players: tp("toys.summary.players", s.entrants), buyIn: money(game.tourney.buyIn), pool: money(s.pool) });
  },
  now: (game, at) => {
    if (!game.levels.length) return "";
    const d = derive(game, at);
    const lvl = d.level.isBreak ? t("toys.now.break") : t("toys.now.level", { num: String(d.level.num ?? d.index + 1), sb: amt(d.level.sb), bb: amt(d.level.bb) });
    return t("toys.now.left", { status: lvl, time: clock(d.remainingMs) });
  },
  headline: (game) => {
    const w = results(game).find((r) => r.place === 1);
    return w ? t("common.wonHeadline", { name: w.name, amount: money(w.won) }) : "";
  },
  describe: (r) =>
    [r.place ? t("players.page.history.place", { place: ordinal(r.place), entrants: r.entrants }) : "", r.kos ? tp("players.page.history.kos", r.kos) : ""].filter(Boolean).join(" · "),
  find,
};

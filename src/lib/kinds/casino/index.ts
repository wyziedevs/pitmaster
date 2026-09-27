// casino night: blackjack, roulette, craps, baccarat and the money wheel, for
// an event, a fundraiser or a club night. players buy chips at the bank and
// play the house; the bank keeps the count. at the end chips cash out to money,
// or to raffle tickets for a raffle of prizes. the bank pays and takes money as
// it goes, so only shared costs are left to settle.
import type { CasinoSettings, Game, Player } from "$lib/types";
import type { Kind, Line } from "../kind";
import { resultRow, type Result } from "$lib/stats";
import { gameDate } from "$lib/game";
import { squareUp } from "$lib/settle";
import { pad, settleLines } from "$lib/report";
import { csv, money, signed, uid } from "$lib/util";
import { id, list, num, obj, oneOf, str } from "$lib/shape";
import { prefs } from "$lib/settings.svelte";
import { casinoState, tableName, TABLE_GAMES, TABLE_LIMITS } from "./engine";
import { gameName } from "./actions";
import { t, tp } from "$lib/i18n";

/** a table of `game` at its usual limits */
export const newTable = (game: CasinoSettings["tables"][number]["game"]) => ({ id: uid(), game, dealer: "", min: TABLE_LIMITS[game][0], max: TABLE_LIMITS[game][1] });

export const CASINO_DEFAULTS = (): CasinoSettings => ({
  tables: [newTable("blackjack"), newTable("roulette"), newTable("craps")],
  finish: "money",
  ticket: 25,
  prizes: [],
});

const amount = (x: unknown) => num(x) && x >= 0;
const table = (x: unknown) => obj(x) && id(x.id) && oneOf(...TABLE_GAMES)(x.game) && str(x.dealer) && amount(x.min) && amount(x.max);
const settings = (s: unknown) => obj(s) && list(table)(s.tables) && oneOf("money", "raffle")(s.finish) && amount(s.ticket) && list(str)(s.prizes);
const die = (x: unknown) => num(x) && Number.isInteger(x) && x >= 1 && x <= 6;
const event = (e: unknown) =>
  obj(e) &&
  num(e.at) &&
  (e.kind === "buy" || e.kind === "cash"
    ? id(e.player) && amount(e.amount)
    : e.kind === "spin"
      ? id(e.table) && amount(e.result)
      : e.kind === "roll"
        ? id(e.table) && Array.isArray(e.dice) && e.dice.length === 2 && e.dice.every(die)
        : e.kind === "draw" && id(e.player) && str(e.prize));

export const nameFor = (s: CasinoSettings, x: CasinoSettings["tables"][number]) => tableName(s, x, gameName);
const raffle = (game: Game) => game.casino!.finish === "raffle";

/** the floor in words: "Blackjack, Roulette and Craps" */
export const floorLine = (game: Game) => game.casino!.tables.map((x) => nameFor(game.casino!, x)).join(", ") || t("casino.play.noTables");

/** what the house is up, or (a raffle) what the night raised */
export const houseLine = (game: Game, house: number) => (raffle(game) ? t("casino.play.raised", { amount: money(house) }) : t("casino.play.houseUp", { amount: signed(house) }));

/** everyone counts once it's over: what they bought, and what came back to them in money */
function results(game: Game): Result[] {
  if (!game.finished || !game.casino) return [];
  const st = casinoState(game);
  const back = (id: string) => (raffle(game) ? 0 : st.back[id]);
  return game.players.filter((p) => st.bought[p.id] > 0).map((p) => resultRow(game, p, st.bought[p.id], back(p.id), { itm: st.net[p.id] > 0 }));
}

function recap(game: Game) {
  const st = casinoState(game);
  const lines = [`${floorLine(game)} · ${tp("toys.summary.players", game.players.length)}`, ""];
  const rows = [...game.players].sort((a, b) => st.net[b.id] - st.net[a.id]);
  const w = Math.max(...rows.map((p) => p.name.length), 4) + 2;
  for (const p of rows) {
    const got = raffle(game) ? tp("casino.play.tickets", st.tickets[p.id]) : signed(st.net[p.id]);
    lines.push(`${pad(p.name, w)}${pad(money(st.bought[p.id]), 12)}${got}`);
  }
  lines.push("", houseLine(game, st.house));
  if (!game.finished && st.out > 0) lines.push(t("casino.play.chipsOutLine", { amount: money(st.out) }));
  if (st.draws.length) lines.push("", t("casino.play.winnersHeading"), ...st.draws.map((d) => `${d.prize}: ${game.players.find((p) => p.id === d.player)?.name ?? "?"}`));
  lines.push(...settleLines(game));
  return lines;
}

function gameCsv(game: Game) {
  const st = casinoState(game);
  const date = gameDate(game);
  return csv([
    [t("players.report.csv.date"), t("players.report.csv.game"), t("players.report.csv.player"), t("casino.play.boughtHeader"), t("casino.play.backHeader"), t("casino.play.ticketsHeader"), t("players.report.csv.net")],
    ...game.players.map((p) => [date, game.name, p.name, st.bought[p.id], st.back[p.id], st.tickets[p.id], st.net[p.id]]),
  ]);
}

function find(game: Game, p: Player): Line[] {
  const st = casinoState(game);
  const out: Line[] = [];
  if (prefs().tvMoney !== false) {
    out.push({ text: t("casino.play.findBank", { bought: money(st.bought[p.id]), back: money(st.back[p.id]) }) });
    if (!raffle(game) && Math.abs(st.net[p.id]) > 0.004) out.push({ text: signed(st.net[p.id]), tone: st.net[p.id] > 0 ? "good" : undefined });
  }
  if (st.tickets[p.id]) out.push({ text: tp("casino.play.findTickets", st.tickets[p.id]) });
  for (const prize of st.won[p.id]) out.push({ text: t("casino.play.findWon", { prize }), tone: "good" });
  return out;
}

export const casino: Kind = {
  id: "casino",
  label: () => t("casino.label"),
  plural: () => t("casino.plural"),
  newLabel: () => t("casino.newLabel"),
  tabTitle: () => t("casino.label"),
  keywords: "casino night blackjack roulette craps baccarat wheel raffle fundraiser bank",
  poker: false,
  ranks: "net",
  Setup: () => import("./Setup.svelte"),
  Control: () => import("./Control.svelte"),
  Board: () => import("./Board.svelte"),
  check: (g) => settings(g.casino) && (g.casinoEvents === undefined || list(event)(g.casinoEvents)),
  results,
  // the bank pays and takes money on the spot: only shared costs are left
  settle: (game) => squareUp(game, []),
  settled: (game) => game.finished,
  playing: () => true,
  recap,
  csv: gameCsv,
  summary: (game) => `${tp("casino.play.tablesCount", game.casino!.tables.length)} · ${tp("toys.summary.players", game.players.length)}`,
  now: (game) => t("casino.play.chipsOutLine", { amount: money(casinoState(game).out) }),
  headline: (game) => {
    if (raffle(game)) return houseLine(game, casinoState(game).house);
    const top = [...results(game)].sort((a, b) => b.net - a.net)[0];
    return top && top.net > 0 ? `${top.name} ${signed(top.net)}` : "";
  },
  describe: (r) => t("players.page.history.cashInOut", { in: money(r.cost), out: money(r.won) }),
  find,
};

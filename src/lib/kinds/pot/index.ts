// pot games: in-between (acey deucey), guts, bourre, pass the pigs, or the
// host's own. a running pot that players ante into, pay into and take from,
// with a pot limit and a round counter. each player's in and out adds up like
// a cash game, so settle-up and pay links work the same.
import type { Game, Player, PotSettings } from "$lib/types";
import type { Kind, Line } from "../kind";
import { resultRow, type Result } from "$lib/stats";
import { gameDate } from "$lib/game";
import { settleNets } from "$lib/settle";
import { pad, settleLines } from "$lib/report";
import { csv, money, signed } from "$lib/util";
import { id, list, maybe, num, obj, oneOf } from "$lib/shape";
import { prefs } from "$lib/settings.svelte";
import { potState } from "./engine";
import { potPreset } from "./presets";
import { t, tp } from "$lib/i18n";

export const POT_DEFAULTS = (preset: PotSettings["preset"] = "inbetween"): PotSettings => ({
  preset,
  ante: potPreset(preset).ante,
  limit: potPreset(preset).limit,
  leftover: "split",
});

const settings = (s: unknown) => obj(s) && oneOf("inbetween", "guts", "bourre", "pigs", "custom")(s.preset) && num(s.ante) && s.ante >= 0 && num(s.limit) && s.limit >= 0 && oneOf("split", "back")(s.leftover);
const event = (e: unknown) =>
  obj(e) && oneOf("ante", "pay", "match", "take")(e.kind) && list(id)(e.players) && num(e.amount) && e.amount >= 0 && num(e.at) && maybe(oneOf("win", "lose", "post", "pot"))(e.note);

export const presetName = (g: Game) => t(`common.kinds.pot.presets.${g.pot!.preset}`);

/** the setup in words: "$1 ante · pot limit $20" */
export function setupLine(game: Game) {
  const s = game.pot!;
  return [t("gamePlay.pot.anteLine", { amount: money(s.ante) }), s.limit > 0 ? t("gamePlay.pot.limitLine", { amount: money(s.limit) }) : t("gamePlay.pot.noLimit")].join(" · ");
}

/** everyone counts once it's over (until then the pot still belongs to the table) */
function results(game: Game): Result[] {
  if (!game.finished || !game.pot) return [];
  const st = potState(game);
  // no places in a pot game
  return game.players.map((p) => resultRow(game, p, st.paid[p.id], st.taken[p.id], { itm: st.net[p.id] > 0 }));
}

/** like a cash game: what each took out less what each put in, player to player */
function settlePot(game: Game) {
  if (!game.pot || !game.finished) return settleNets(game, []);
  const st = potState(game);
  return settleNets(game, game.players.map((p) => ({ name: p.name, net: st.net[p.id] })));
}

function recap(game: Game) {
  const st = potState(game);
  const lines = [`${presetName(game)} · ${setupLine(game)} · ${tp("gamePlay.pot.rounds", st.rounds)}`, ""];
  const rows = [...game.players].sort((a, b) => st.net[b.id] - st.net[a.id]);
  const w = Math.max(...rows.map((p) => p.name.length), 4) + 2;
  for (const p of rows) lines.push(`${pad(p.name, w)}${signed(st.net[p.id])}`);
  if (!game.finished) lines.push("", t("gamePlay.pot.inThePot", { amount: money(st.pot) }));
  lines.push(...settleLines(game));
  return lines;
}

function gameCsv(game: Game) {
  const st = potState(game);
  const date = gameDate(game);
  return csv([
    [t("players.report.csv.date"), t("players.report.csv.game"), t("players.report.csv.player"), t("players.report.csv.paidIn"), t("gamePlay.pot.csvTaken"), t("players.report.csv.net")],
    ...game.players.map((p) => [date, game.name, p.name, st.paid[p.id], st.taken[p.id], st.net[p.id]]),
  ]);
}

function find(game: Game, p: Player): Line[] {
  const st = potState(game);
  const out: Line[] = [];
  if (!game.finished && st.turn === p.id) out.push({ text: t("gamePlay.pot.yourTurn"), tone: "good" });
  if (prefs().tvMoney !== false) {
    out.push({ text: t("gamePlay.pot.inOut", { paid: money(st.paid[p.id]), taken: money(st.taken[p.id]) }) });
    const net = st.net[p.id];
    if (Math.abs(net) > 0.004) out.push({ text: signed(net), tone: net > 0 ? "good" : undefined });
  }
  return out;
}

export const pot: Kind = {
  id: "pot",
  label: () => t("common.kinds.pot.label"),
  plural: () => t("common.kinds.pot.plural"),
  newLabel: () => t("common.kinds.pot.newLabel"),
  tabTitle: () => t("common.kinds.pot.label"),
  keywords: "in between acey deucey guts bourre pass the pigs pot ante",
  poker: false,
  ranks: "net",
  Setup: () => import("./Setup.svelte"),
  Control: () => import("./Control.svelte"),
  Board: () => import("./Board.svelte"),
  check: (g) => settings(g.pot) && maybe(list(event))(g.potEvents),
  results,
  settle: settlePot,
  settled: (game) => game.finished,
  playing: () => true,
  recap,
  csv: gameCsv,
  summary: (game) => `${presetName(game)} · ${tp("toys.summary.players", game.players.length)} · ${setupLine(game)}`,
  now: (game) => {
    const st = potState(game);
    return t("gamePlay.pot.nowLine", { pot: money(st.pot), round: String(Math.max(1, st.rounds)) });
  },
  headline: (game) => {
    const top = [...results(game)].sort((a, b) => b.net - a.net)[0];
    return top && top.net > 0 ? `${top.name} ${signed(top.net)}` : "";
  },
  describe: (r) => t("players.page.history.cashInOut", { in: money(r.cost), out: money(r.won) }),
  find,
};

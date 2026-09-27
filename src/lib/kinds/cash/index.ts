// a cash game: buy in, play for as long as you like, cash out what's in front
// of you. its dealer screen is Control.svelte; its form and its tv board are
// the poker ones it shares with tournaments.
import type { Game, Player } from "$lib/types";
import type { Kind, Line } from "../kind";
import type { Result } from "$lib/stats";
import { cashRake, cashSettle, cashStats, costNets, HOUSE, highHandPrizes } from "$lib/game";
import { cashElapsed } from "$lib/clock";
import { settleLines, pad } from "$lib/report";
import { clock, csv, duration, money, nameKey, round2, signed, timeOfDay } from "$lib/util";
import { cashGames, cashStakes, gameLine, variant } from "$lib/variants";
import { isCashSettings, isSide, isWaiting } from "../poker/check";
import { list, maybe } from "$lib/shape";
import { seatText } from "../poker/seat";
import { pokerSetup } from "../poker";
import { prefs } from "$lib/settings.svelte";
import { t, tp } from "$lib/i18n";

/** the stakes in a line: the blinds, the game (another poker game) or the games (dealer's choice) */
function stakes(game: Game) {
  const c = game.cash!;
  if (!c.games?.length) return `${money(c.sb)}/${money(c.bb)}`;
  const games = cashGames(c);
  if (games.length > 1) return `${t("gameSetup.variants.dealersChoice")} (${games.map((g) => variant(g).short).join(", ")}) · ${money(c.sb)}/${money(c.bb)}`;
  return gameLine(cashStakes(c, games[0]), true);
}

/** a player counts once they've cashed out; a seat fee is part of what the night cost them */
function results(game: Game): Result[] {
  const base = { gameId: game.id, gameName: game.name, type: game.type, at: game.clock.startedAt ?? game.createdAt };
  const r = cashRake(game);
  const fee = r.mode === "seat" ? r.fee : 0;
  const prizes = highHandPrizes(game);
  return game.players
    .filter((p) => p.cashOut !== null)
    .map((p) => {
      const start = Math.max(p.joinedAt ?? 0, game.clock.startedAt ?? 0) || null;
      const hours = start && p.leftAt && p.leftAt > start ? (p.leftAt - start) / 3600000 : null;
      const highHand = prizes[p.id] ?? 0;
      return {
        ...base,
        key: nameKey(p.name),
        name: p.name.trim(),
        cost: round2(p.cashIn + fee),
        won: round2((p.cashOut ?? 0) + highHand),
        net: round2((p.cashOut ?? 0) + highHand - p.cashIn - fee),
        place: null,
        entrants: game.players.length,
        itm: false,
        kos: 0,
        hours,
        highHand,
        sevenTwo: (game.sides ?? []).filter((e) => e.kind === "sevenTwo" && e.playerId === p.id).length,
      };
    });
}

function recap(game: Game) {
  const lines: string[] = [];
  const s = cashStats(game);
  const played = cashElapsed(game) / 60000;
  lines.push(t("players.report.cash.summary", { stakes: stakes(game), played: played >= 1 ? ` · ${duration(played)}` : "", bank: money(s.bank) }));
  lines.push("");
  // biggest winner first, anyone still sitting at the bottom
  const net = (p: Player) => (p.cashOut === null ? -1e12 : p.cashOut - p.cashIn);
  const rows = [...game.players].sort((a, b) => net(b) - net(a));
  const w = Math.max(...rows.map((p) => p.name.length), 4) + 2;
  for (const p of rows) {
    const net = p.cashOut === null ? null : round2(p.cashOut - p.cashIn);
    lines.push(`${pad(p.name, w)}${net === null ? t("players.report.cash.stillPlaying", { in: money(p.cashIn) }) : signed(net)}`);
  }
  const r = cashRake(game);
  const house = game.house?.trim() || HOUSE();
  if (s.rakeBox) lines.push("", t("players.report.cash.rakeBox", { amount: money(s.rakeBox), house }));
  if (s.seatFees) lines.push("", t("players.report.cash.seatFee", { amount: money(r.fee), house }));
  // the side games: bomb pots, 7-2 wins and every high hand the house paid
  const sides = game.sides ?? [];
  const name = (id?: string) => game.players.find((p) => p.id === id)?.name ?? "?";
  const bombs = sides.filter((e) => e.kind === "bomb").length;
  const sevenTwos = new Map<string, number>();
  for (const e of sides) if (e.kind === "sevenTwo") sevenTwos.set(name(e.playerId), (sevenTwos.get(name(e.playerId)) ?? 0) + 1);
  const sideLines = [
    bombs ? tp("players.report.cash.bombPots", bombs) : "",
    sevenTwos.size ? t("players.report.cash.sevenTwo", { list: [...sevenTwos].map(([n, k]) => (k > 1 ? `${n} ×${k}` : n)).join(", ") }) : "",
    ...sides.filter((e) => e.kind === "highHandPaid").map((e) => t("players.report.cash.highHand", { name: name(e.playerId), hand: e.hand ?? "", amount: money(e.amount ?? 0), house })),
  ].filter(Boolean);
  if (sideLines.length) lines.push("", ...sideLines);
  lines.push(...settleLines(game));
  if (s.allOut && Math.abs(s.diff) > 0.001) lines.push("", t("players.report.cash.bankOff", { amount: money(s.diff) }));
  return lines;
}

function gameCsv(game: Game) {
  const date = new Date(game.clock.startedAt ?? game.createdAt).toISOString().slice(0, 10);
  // a seat fee is part of the night's net, same as on the Players page
  const r = cashRake(game);
  const fee = r.mode === "seat" ? r.fee : 0;
  const prizes = highHandPrizes(game);
  const hh = Object.keys(prizes).length > 0;
  const costs = costNets(game);
  return csv([
    [
      t("players.report.csv.date"),
      t("players.report.csv.game"),
      t("players.report.csv.player"),
      t("players.report.csv.boughtIn"),
      t("players.report.csv.cashedOut"),
      ...(fee ? [t("players.report.csv.seatFee")] : []),
      ...(hh ? [t("players.report.csv.highHand")] : []),
      t("players.report.csv.net"),
      ...(game.costs?.length ? [t("players.report.csv.costs")] : []),
      t("players.report.csv.satDown"),
      t("players.report.csv.left"),
    ],
    ...game.players.map((p) => [
      date,
      game.name,
      p.name,
      p.cashIn,
      p.cashOut ?? "",
      ...(fee ? [fee] : []),
      ...(hh ? [prizes[p.id] ?? ""] : []),
      p.cashOut === null ? "" : round2(p.cashOut - p.cashIn - fee + (prizes[p.id] ?? 0)),
      ...(game.costs?.length ? [costs[p.id] ?? 0] : []),
      p.joinedAt ? timeOfDay(Math.max(p.joinedAt, game.clock.startedAt ?? 0)) : "",
      p.leftAt ? timeOfDay(p.leftAt) : "",
    ]),
  ]);
}

function find(game: Game, p: Player): Line[] {
  const out: Line[] = [];
  const showMoney = prefs().tvMoney !== false;
  if (p.cashOut === null) {
    out.push({ text: seatText(game, p) || t("tv.find.playing"), tone: "good" });
    if (showMoney) out.push({ text: t("tv.find.inFor", { amount: money(p.cashIn) }) });
  } else out.push({ text: showMoney ? t("tv.find.cashedOutFor", { amount: money(p.cashOut) }) : t("tv.find.cashedOut") });
  return out;
}

export const cash: Kind = {
  id: "cash",
  label: () => t("toys.gameType.cash"),
  plural: () => t("toys.past.cashGames"),
  newLabel: () => t("nav.shortcuts.newCashGame"),
  tabTitle: () => t("gamePlay.game.tabCash"),
  keywords: "start ring",
  poker: true,
  ranks: "net",
  Setup: pokerSetup,
  Control: () => import("./Control.svelte"),
  check: (g) => isCashSettings(g.cash) && maybe(list(isSide))(g.sides) && maybe(list(isWaiting))(g.waitlist),
  results,
  settle: (game) => cashSettle(game),
  // over once everyone's cashed out, or the host ended it
  settled: (game) => game.finished || (game.players.length > 0 && game.players.every((p) => p.cashOut !== null)),
  playing: (_game, p) => p.cashOut === null,
  recap,
  csv: gameCsv,
  summary: (game, running) => {
    const blinds = t("toys.summary.cashBlinds", { players: tp("toys.summary.players", game.players.length), sb: money(game.cash!.sb), bb: money(game.cash!.bb) });
    return running ? blinds : t("toys.summary.inPlay", { blinds, bank: money(cashStats(game).bank) });
  },
  now: (game, at) => t("toys.now.cashStatus", { time: clock(cashElapsed(game, at)), money: money(cashStats(game).onTable) }),
  headline: (game) => {
    const top = [...results(game)].sort((a, b) => b.net - a.net)[0];
    return top && top.net > 0 ? `${top.name} ${signed(top.net)}` : "";
  },
  describe: (r) =>
    [
      t("players.page.history.cashInOut", { in: money(r.cost), out: money(r.won - r.highHand) }),
      r.hours && r.hours >= 0.1 ? t("players.page.history.hoursSuffix", { h: r.hours.toFixed(1) }) : "",
      r.highHand ? t("players.page.history.highHand", { amount: money(r.highHand) }) : "",
      r.sevenTwo ? tp("players.page.history.sevenTwo", r.sevenTwo) : "",
    ]
      .filter(Boolean)
      .join(" · "),
  find,
};

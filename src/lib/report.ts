// the game written down: a plain-text recap to paste anywhere and a csv for
// spreadsheets. both come from the same numbers the dealer screen shows.
import type { Game } from "./types";
import { anyPaid, cashRake, cashStats, costNets, HOUSE, highHandPrizes, koCount, settleUp, stillOwed, tourneyStats } from "./game";
import { handlesFor } from "./store";
import { settings } from "./settings.svelte";
import { cashElapsed, derive } from "./clock";
import { results } from "./stats";
import { amt, csv, day, duration, money, ordinal, round2, signed, timeOfDay } from "./util";
import { t, tp } from "$lib/i18n";

const pad = (s: string, n: number) => s + " ".repeat(Math.max(1, n - s.length));

/** the shared costs and who pays who, the same for cash and tournaments */
function settleLines(game: Game) {
  const lines: string[] = [];
  const house = game.house?.trim() || HOUSE();
  const name = (id: string | null) => (id ? (game.players.find((p) => p.id === id)?.name ?? house) : house);
  if (game.costs?.length) lines.push("", t("players.report.cash.costs", { list: game.costs.map((c) => `${c.label} ${money(c.amount)} (${name(c.paidBy)})`).join(", ") }));
  const moves = settleUp(game);
  if (!moves.length) return lines;
  const owed = stillOwed(game);
  lines.push("", t("players.report.cash.settleUp"));
  for (const m of moves) {
    // where to send it, if the one getting paid has saved a handle
    const h = settings.usePayLinks ? handlesFor(m.to) : null;
    const where = [h?.venmo && `Venmo @${h.venmo}`, h?.cashapp && `Cash App $${h.cashapp}`, h?.paypal && `paypal.me/${h.paypal}`].filter(Boolean).join(", ");
    // ticked off, or ticked off and then the game changed: what's left, either way
    const rest = owed.find((o) => [o.from, o.to].includes(m.from) && [o.from, o.to].includes(m.to));
    const paid = anyPaid(game, m.from, m.to);
    const note = !paid
      ? where
      : !rest
        ? t("players.report.cash.paidTag")
        : rest.from === m.from
          ? t("gamePlay.shared.leftToPay", { amount: money(rest.amount) })
          : t("gamePlay.shared.paidBack", { from: rest.from, to: rest.to, amount: money(rest.amount) });
    lines.push(t("players.report.cash.settleLine", { from: m.from, to: m.to, amount: money(m.amount), where: note ? ` (${note})` : "" }));
  }
  return lines;
}

/** the recap people paste into a chat, an email or a post */
export function recap(game: Game) {
  const lines: string[] = [`${game.name} · ${day(game.clock.startedAt ?? game.createdAt)}`];

  if (game.type === "cash" && game.cash) {
    const s = cashStats(game);
    const played = cashElapsed(game) / 60000;
    lines.push(
      t("players.report.cash.summary", {
        stakes: `${money(game.cash.sb)}/${money(game.cash.bb)}`,
        played: played >= 1 ? ` · ${duration(played)}` : "",
        bank: money(s.bank),
      }),
    );
    lines.push("");
    // biggest winner first, anyone still sitting at the bottom
    const net = (p: Game["players"][number]) => (p.cashOut === null ? -1e12 : p.cashOut - p.cashIn);
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
    return lines.join("\n");
  }

  if (game.tourney) {
    const s = tourneyStats(game);
    const extras = [s.rebuys ? tp("players.report.tourney.rebuys", s.rebuys) : "", s.addOns ? tp("players.report.tourney.addOns", s.addOns) : ""].filter(Boolean);
    const parts = [tp("players.report.tourney.entrants", s.entrants), t("players.report.tourney.buyIn", { amount: money(game.tourney.buyIn) }), ...extras].join(" · ");
    const pool = t("players.report.tourney.pool", { amount: money(s.pool) });
    const rakeNote = s.rake ? ` ${t("players.report.tourney.rakeKept", { amount: money(s.rake) })}` : "";
    lines.push(`${parts} · ${pool}${rakeNote}`);
    if (game.levels.length && game.clock.startedAt) {
      const d = derive(game, game.endedAt ?? Date.now());
      lines.push(t("players.report.tourney.endedAt", { duration: duration(d.totalElapsedMs / 60000), stakes: `${amt(d.level.sb)}/${amt(d.level.bb)}` }));
    }
    lines.push("");
    const done = results(game);
    const byPlace = [...game.players].sort((a, b) => (a.place ?? 999) - (b.place ?? 999));
    const w = Math.max(...byPlace.map((p) => p.name.length), 4) + 2;
    for (const p of byPlace) {
      const r = done.find((x) => x.name === p.name.trim());
      const label = p.place ? pad(ordinal(p.place), 6) : pad(t("players.report.tourney.stillIn"), 6);
      const kos = koCount(game, p.id);
      const tail = [r && r.won ? money(r.won) : "", kos ? tp("players.report.tourney.kos", kos) : ""].filter(Boolean).join(" · ");
      lines.push(`${label}${pad(p.name, w)}${tail}`.trimEnd());
    }
    lines.push(...settleLines(game));
    if (!game.finished) lines.push("", t("players.report.tourney.stillPlayingNote"));
    return lines.join("\n");
  }
  return lines.join("\n");
}

/** one row per player, the numbers a spreadsheet wants */
export function gameCsv(game: Game) {
  const date = new Date(game.clock.startedAt ?? game.createdAt).toISOString().slice(0, 10);
  if (game.type === "cash") {
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
  const t2 = game.tourney!;
  const done = results(game);
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
        const r = done.find((x) => x.name === p.name.trim());
        const cost = t2.buyIn + p.rebuys * t2.rebuy.cost + p.addOns * t2.addOn.cost;
        return [date, game.name, p.name, p.place ?? "", p.rebuys, p.addOns, cost, r?.won ?? "", r ? r.net : "", koCount(game, p.id), p.bustedAt ? timeOfDay(p.bustedAt) : "", ...(game.costs?.length ? [costs[p.id] ?? 0] : [])];
      }),
  ]);
}

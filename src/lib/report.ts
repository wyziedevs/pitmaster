// the game written down: a plain-text recap to paste anywhere and a csv for
// spreadsheets. both come from the same numbers the dealer screen shows.
import type { Game } from "./types";
import { cashRake, cashSettle, cashStats, HOUSE, koCount, tourneyStats } from "./game";
import { handlesFor } from "./store";
import { settings } from "./settings.svelte";
import { cashElapsed, derive } from "./clock";
import { results } from "./stats";
import { amt, csv, day, duration, money, ordinal, round2, signed, timeOfDay } from "./util";

const pad = (s: string, n: number) => s + " ".repeat(Math.max(1, n - s.length));

/** the recap people paste into a chat, an email or a post */
export function recap(game: Game) {
  const lines: string[] = [`${game.name} · ${day(game.clock.startedAt ?? game.createdAt)}`];

  if (game.type === "cash" && game.cash) {
    const s = cashStats(game);
    const played = cashElapsed(game) / 60000;
    lines.push(`${money(game.cash.sb)}/${money(game.cash.bb)}${played >= 1 ? ` · ${duration(played)}` : ""} · ${money(s.bank)} bought in`);
    lines.push("");
    // biggest winner first, anyone still sitting at the bottom
    const net = (p: Game["players"][number]) => (p.cashOut === null ? -1e12 : p.cashOut - p.cashIn);
    const rows = [...game.players].sort((a, b) => net(b) - net(a));
    const w = Math.max(...rows.map((p) => p.name.length), 4) + 2;
    for (const p of rows) {
      const net = p.cashOut === null ? null : round2(p.cashOut - p.cashIn);
      lines.push(`${pad(p.name, w)}${net === null ? `still playing (${money(p.cashIn)} in)` : signed(net)}`);
    }
    const r = cashRake(game);
    const house = game.house?.trim() || HOUSE;
    if (s.rakeBox) lines.push("", `Rake box: ${money(s.rakeBox)}, to ${house}`);
    if (s.seatFees) lines.push("", `Seat fee: ${money(r.fee)} a player, to ${house}`);
    const moves = cashSettle(game);
    if (moves.length) {
      lines.push("", "Settle up:");
      for (const m of moves) {
        // where to send it, if the one getting paid has saved a handle
        const h = settings.usePayLinks ? handlesFor(m.to) : null;
        const where = [h?.venmo && `Venmo @${h.venmo}`, h?.cashapp && `Cash App $${h.cashapp}`, h?.paypal && `paypal.me/${h.paypal}`].filter(Boolean).join(", ");
        lines.push(`${m.from} pays ${m.to} ${money(m.amount)}${where ? ` (${where})` : ""}`);
      }
    }
    if (s.allOut && Math.abs(s.diff) > 0.001) lines.push("", `(The bank is off by ${money(s.diff)}.)`);
    return lines.join("\n");
  }

  if (game.tourney) {
    const s = tourneyStats(game);
    const extras = [s.rebuys ? `${s.rebuys} rebuy${s.rebuys > 1 ? "s" : ""}` : "", s.addOns ? `${s.addOns} add-on${s.addOns > 1 ? "s" : ""}` : ""].filter(Boolean);
    lines.push(`${s.entrants} players · ${money(game.tourney.buyIn)} buy-in${extras.length ? ` · ${extras.join(" · ")}` : ""} · pool ${money(s.pool)}${s.rake ? ` (house kept ${money(s.rake)})` : ""}`);
    if (game.levels.length && game.clock.startedAt) {
      const d = derive(game, game.endedAt ?? Date.now());
      lines.push(`${duration(d.totalElapsedMs / 60000)}, ended at ${amt(d.level.sb)}/${amt(d.level.bb)}`);
    }
    lines.push("");
    const done = results(game);
    const byPlace = [...game.players].sort((a, b) => (a.place ?? 999) - (b.place ?? 999));
    const w = Math.max(...byPlace.map((p) => p.name.length), 4) + 2;
    for (const p of byPlace) {
      const r = done.find((x) => x.name === p.name.trim());
      const label = p.place ? pad(ordinal(p.place), 6) : pad("in", 6);
      const kos = koCount(game, p.id);
      const tail = [r && r.won ? money(r.won) : "", kos ? `${kos} KO${kos > 1 ? "s" : ""}` : ""].filter(Boolean).join(" · ");
      lines.push(`${label}${pad(p.name, w)}${tail}`.trimEnd());
    }
    if (!game.finished) lines.push("", "(Still playing.)");
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
    return csv([
      ["Date", "Game", "Player", "Bought In", "Cashed Out", ...(fee ? ["Seat Fee"] : []), "Net", "Sat Down", "Left"],
      ...game.players.map((p) => [
        date,
        game.name,
        p.name,
        p.cashIn,
        p.cashOut ?? "",
        ...(fee ? [fee] : []),
        p.cashOut === null ? "" : round2(p.cashOut - p.cashIn - fee),
        p.joinedAt ? timeOfDay(Math.max(p.joinedAt, game.clock.startedAt ?? 0)) : "",
        p.leftAt ? timeOfDay(p.leftAt) : "",
      ]),
    ]);
  }
  const t = game.tourney!;
  const done = results(game);
  return csv([
    ["Date", "Game", "Player", "Place", "Rebuys", "Add-Ons", "Paid In", "Won", "Net", "Knockouts", "Busted"],
    ...[...game.players]
      .sort((a, b) => (a.place ?? 999) - (b.place ?? 999))
      .map((p) => {
        const r = done.find((x) => x.name === p.name.trim());
        const cost = t.buyIn + p.rebuys * t.rebuy.cost + p.addOns * t.addOn.cost;
        return [date, game.name, p.name, p.place ?? "", p.rebuys, p.addOns, cost, r?.won ?? "", r ? r.net : "", koCount(game, p.id), p.bustedAt ? timeOfDay(p.bustedAt) : ""];
      }),
  ]);
}

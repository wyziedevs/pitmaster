// the game written down: a plain-text recap to paste anywhere and a csv for
// spreadsheets. both come from the same numbers the dealer screen shows; each
// kind of game writes its own (kinds/), and the settle-up lines are shared.
import type { Game } from "./types";
import { anyPaid, HOUSE, settleUp, stillOwed } from "./game";
import { handlesFor } from "./store";
import { settings } from "./settings.svelte";
import { day, money } from "./util";
import { t } from "$lib/i18n";
import { kind } from "./kinds";

/** a column in the plain-text recap */
export const pad = (s: string, n: number) => s + " ".repeat(Math.max(1, n - s.length));

/** the shared costs and who pays who, the same for every kind of game */
export function settleLines(game: Game) {
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

/** the recap people paste into a chat, an email or a post: the title, then what its kind has to say */
export function recap(game: Game) {
  return [`${game.name} · ${day(game.clock.startedAt ?? game.createdAt)}`, ...kind(game.type).recap(game)].join("\n");
}

/** one row per player, the numbers a spreadsheet wants */
export const gameCsv = (game: Game) => kind(game.type).csv(game);

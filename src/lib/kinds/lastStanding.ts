// what liar's dice and the lives games share as kinds: on the same
// last-one-standing engine (standing.ts), their results, settle-up, recap,
// spreadsheet and Find Me all read the same standing. each passes what's its
// own: its state, its stakes, and its words for a die or a life.
import type { DiceStakes, Game, Player } from "$lib/types";
import type { Kind, Line } from "./kind";
import type { Standing } from "./standing";
import { netOf } from "./standing";
import { gameDate } from "$lib/game";
import { resultRow } from "$lib/stats";
import { settleNets } from "$lib/settle";
import { pad, settleLines } from "$lib/report";
import { csv, money, ordinal, round2, signed } from "$lib/util";
import { list, num, obj, oneOf } from "$lib/shape";
import { prefs } from "$lib/settings.svelte";
import { t, tp } from "$lib/i18n";

/** stakes from outside (an import, a tv snapshot) are the right shape */
export const isStakes = (s: unknown) =>
  obj(s) && oneOf("pot", "perDie")(s.mode) && num(s.buyIn) && list(num)(s.payouts) && num(s.payoutRound) && num(s.perDie) && oneOf("pot", "winner")(s.perDieTo);

export function lastStandingKind<S extends Standing>(k: {
  state: (game: Game) => S;
  stakes: (game: Game) => DiceStakes;
  /** rounds played so far */
  played: (game: Game) => number;
  /** "3 dice left", "2 lives left" */
  left: (n: number) => string;
  /** the spreadsheet's column for what each lost: "Dice Lost" */
  lostColumn: () => string;
  /** the recap's first line: the rules and the stakes */
  setup: (game: Game) => string;
  /** more for Find Me about someone still in (whose palifico it is...) */
  more?: (st: S, p: Player) => Line[];
}): Pick<Kind, "results" | "settle" | "settled" | "playing" | "recap" | "csv" | "find" | "headline" | "describe"> {
  // a buy-in pot is only paid once it's over; money per life is owed as it goes
  const counts = (game: Game) => game.finished || k.stakes(game).mode === "perDie";

  const results = (game: Game) => {
    if (!game.finished) return [];
    const st = k.state(game);
    return game.players.map((p) => {
      const won = st.money.won[p.id] ?? 0;
      return resultRow(game, p, st.money.paid[p.id] ?? 0, won, { place: st.places[p.id], itm: won > 0 });
    });
  };

  return {
    results,
    // a buy-in pot was paid at the door, so whoever holds it (the house) pays the prizes; money per life is owed player to player
    settle: (game) => {
      if (!k.played(game) || !counts(game)) return settleNets(game, []);
      const st = k.state(game);
      const pot = k.stakes(game).mode === "pot";
      return settleNets(game, game.players.map((p) => ({ name: p.name, net: round2((st.money.won[p.id] ?? 0) - (pot ? 0 : (st.money.paid[p.id] ?? 0))) })));
    },
    settled: (game) => game.finished,
    playing: (game, p) => k.state(game).lives[p.id] > 0,
    recap: (game) => {
      const st = k.state(game);
      const lines = [k.setup(game), tp("gamePlay.dice.roundsPlayed", k.played(game)), ""];
      const byPlace = [...game.players].sort((a, b) => (st.places[a.id] ?? 0) - (st.places[b.id] ?? 0) || st.lives[b.id] - st.lives[a.id]);
      const w = Math.max(...byPlace.map((p) => p.name.length), 4) + 2;
      for (const p of byPlace) {
        const place = st.places[p.id];
        const label = place ? pad(ordinal(place), 6) : pad(k.left(st.lives[p.id]), 10);
        lines.push(`${label}${pad(p.name, w)}${counts(game) ? signed(netOf(st, p.id)) : ""}`.trimEnd());
      }
      lines.push(...settleLines(game));
      return lines;
    },
    csv: (game) => {
      const st = k.state(game);
      const date = gameDate(game);
      return csv([
        [t("players.report.csv.date"), t("players.report.csv.game"), t("players.report.csv.player"), t("players.report.csv.place"), k.lostColumn(), t("players.report.csv.paidIn"), t("players.report.csv.won"), t("players.report.csv.net")],
        ...game.players.map((p) => [date, game.name, p.name, st.places[p.id] ?? "", st.lost[p.id] ?? 0, st.money.paid[p.id] ?? 0, st.money.won[p.id] ?? 0, netOf(st, p.id)]),
      ]);
    },
    find: (game, p) => {
      const st = k.state(game);
      const place = st.places[p.id];
      const out: Line[] =
        place === 1
          ? [{ text: t("tv.find.winner"), tone: "good" }]
          : place
            ? [{ text: t("tv.find.outIn", { place: ordinal(place) }), tone: "hot" }]
            : [{ text: k.left(st.lives[p.id]), tone: "good" }, ...(k.more?.(st, p) ?? [])];
      const net = netOf(st, p.id);
      if (prefs().tvMoney !== false && counts(game) && Math.abs(net) > 0.004) out.push({ text: signed(net), tone: net > 0 ? "good" : undefined });
      return out;
    },
    headline: (game) => {
      const w = results(game).find((r) => r.place === 1);
      return w ? (w.won > 0 ? t("common.wonHeadline", { name: w.name, amount: money(w.won) }) : w.name) : "";
    },
    describe: (r) => (r.place ? t("players.page.history.place", { place: ordinal(r.place), entrants: r.entrants }) : ""),
  };
}

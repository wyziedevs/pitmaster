// what the dealer screen does at a casino night: the bank sells chips and
// takes them back, the tables with no wheel or dice of their own spin and roll
// here, and the raffle draws its prizes. each is one event, logged and told
// to the room; what it all comes to is engine.ts.
import type { CasinoEvent, CasinoTable, Game } from "$lib/types";
import { finish } from "$lib/game";
import { flash, logEvent, playerName } from "$lib/events";
import { fairIndex, money, round2, signed } from "$lib/util";
import { t, tp } from "$lib/i18n";
import { casinoState, JOKER, pocketHue, tableName, WHEEL } from "./engine";

export const gameName = (g: CasinoTable["game"]) => t(`casino.games.${g}`);
const nameOf = (game: Game, id: string) => {
  const table = game.casino!.tables.find((x) => x.id === id);
  return table ? tableName(game.casino!, table, gameName) : "?";
};

/** a spin or a roll's result in words: "17 Red", "Joker", "4 and 3: 7" */
export function resultText(e: Extract<CasinoEvent, { kind: "spin" | "roll" }>, game: CasinoTable["game"]) {
  if (e.kind === "roll") return t("casino.play.rollResult", { a: e.dice[0], b: e.dice[1], total: e.dice[0] + e.dice[1] });
  if (game === "wheel") return e.result === JOKER ? t("casino.play.joker") : t("casino.play.wheelResult", { n: e.result });
  return `${e.result} ${t(`casino.play.hues.${pocketHue(e.result)}`)}`;
}

/** what an event was, in words, for the log and the tv's flash */
function eventText(game: Game, e: CasinoEvent) {
  if (e.kind === "buy") return t("casino.play.buyLog", { name: playerName(game, e.player), amount: money(e.amount) });
  if (e.kind === "cash") return t("casino.play.cashLog", { name: playerName(game, e.player), amount: money(e.amount) });
  if (e.kind === "draw") return t("casino.play.drawLog", { name: playerName(game, e.player), prize: e.prize });
  const table = game.casino!.tables.find((x) => x.id === e.table);
  return `${nameOf(game, e.table)}: ${table ? resultText(e, table.game) : "?"}`;
}

function add(game: Game, e: CasinoEvent, kind: Parameters<typeof flash>[2], text = eventText(game, e)) {
  if (!game.casinoEvents) game.casinoEvents = [];
  game.casinoEvents.push(e);
  if (!game.clock.startedAt) game.clock.startedAt = e.at;
  logEvent(game, text);
  flash(game, text, kind);
}

// ---------- the bank ----------

/** chips sold at the bank (or, with `back`, chips turned back in) */
export function bank(game: Game, player: string, amount: number, back = false) {
  const a = round2(amount);
  if (game.finished || !(a > 0) || !game.players.some((p) => p.id === player)) return;
  const e: CasinoEvent = { kind: back ? "cash" : "buy", player, amount: a, at: Date.now() };
  const s = game.casino!;
  if (!back || s.finish !== "raffle" || !(s.ticket > 0)) return add(game, e, back ? "rack" : "chips");
  // a raffle's tickets come from everything they've turned in, so this turn-in earns what it tips over
  const had = casinoState(game).back[player];
  const tickets = (x: number) => Math.floor(x / s.ticket + 1e-9);
  add(game, e, "rack", t("casino.play.ticketsLog", { name: playerName(game, player), amount: money(a), tickets: tp("casino.play.tickets", tickets(had + a) - tickets(had)) }));
}

// ---------- the tables ----------

/** a roulette or money wheel spin, or a craps roll, drawn fair on this screen */
export function draw(game: Game, tableId: string) {
  const table = game.casino?.tables.find((x) => x.id === tableId);
  if (!table || game.finished) return;
  const at = Date.now();
  if (table.game === "craps") add(game, { kind: "roll", table: table.id, dice: [fairIndex(6) + 1, fairIndex(6) + 1], at }, "shuffle");
  else if (table.game === "roulette") add(game, { kind: "spin", table: table.id, result: fairIndex(37), at }, "shuffle");
  else if (table.game === "wheel") {
    let k = fairIndex(WHEEL.reduce((a, w) => a + w.spaces, 0));
    const hit = WHEEL.find((w) => (k -= w.spaces) < 0)!;
    add(game, { kind: "spin", table: table.id, result: hit.pays, at }, "shuffle");
  }
}

// ---------- the raffle ----------

/** the next prize goes to a ticket drawn fair from every one still in the drum */
export function drawPrize(game: Game) {
  const st = casinoState(game);
  if (!st.nextPrize || !st.drum) return;
  let k = fairIndex(st.drum);
  const winner = game.players.find((p) => (k -= st.inDrum[p.id]) < 0);
  if (winner) add(game, { kind: "draw", player: winner.id, prize: st.nextPrize, at: Date.now() }, "win");
}

export function addPrize(game: Game, prize: string) {
  const p = prize.trim();
  if (p) game.casino!.prizes.push(p);
}

// ---------- the night ----------

/** takes back the last thing that happened (once it's over, only a raffle draw: the raffle runs after the end) */
export function undoCasino(game: Game) {
  const last = game.casinoEvents?.at(-1);
  if (!last || (game.finished && last.kind !== "draw")) return;
  game.casinoEvents!.pop();
  logEvent(game, t("casino.play.undoLog"));
}

export function endNight(game: Game) {
  const st = casinoState(game);
  finish(game);
  const text = game.casino!.finish === "raffle" ? t("casino.play.endRaisedLog", { amount: money(st.house) }) : t("casino.play.endLog", { amount: signed(st.house) });
  logEvent(game, text);
  flash(game, text, "money");
}

// a casino night, worked out from its events: what each player bought at the
// bank and turned back in, the chips still out, what the house is up, each
// table's results and the raffle. nothing here changes the game (actions.ts does).
import type { CasinoEvent, CasinoSettings, CasinoTable, Game } from "$lib/types";
import { round2 } from "$lib/util";

// ---------- the tables ----------

export const TABLE_GAMES: CasinoTable["game"][] = ["blackjack", "roulette", "craps", "baccarat", "wheel"];

/** what the dealer's screen draws for a table: a roulette spin, a money wheel spin, the dice, or nothing (the cards are real) */
export const drawFor = (game: CasinoTable["game"]) => (game === "roulette" || game === "wheel" ? "spin" : game === "craps" ? "roll" : null);

/** a table's usual limits, in the host's money */
export const TABLE_LIMITS: Record<CasinoTable["game"], [number, number]> = {
  blackjack: [5, 100],
  roulette: [1, 50],
  craps: [5, 100],
  baccarat: [10, 200],
  wheel: [1, 25],
};

const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
/** a single-zero pocket's color */
export const pocketHue = (n: number) => (n === 0 ? "green" : REDS.has(n) ? "red" : "black");

/** a money wheel's 54 spaces, by what each pays to 1 (the two top spaces are the jokers) */
export const WHEEL = [
  { pays: 1, spaces: 24 },
  { pays: 2, spaces: 15 },
  { pays: 5, spaces: 7 },
  { pays: 10, spaces: 4 },
  { pays: 20, spaces: 2 },
  { pays: 40, spaces: 2 },
];
export const JOKER = 40;

/** a table's name on screen: its game, numbered when there's more than one of it */
export function tableName(s: CasinoSettings, table: CasinoTable, name: (game: CasinoTable["game"]) => string) {
  const same = s.tables.filter((x) => x.game === table.game);
  return same.length > 1 ? `${name(table.game)} ${same.indexOf(table) + 1}` : name(table.game);
}

// ---------- the night ----------

type Result = Extract<CasinoEvent, { kind: "spin" | "roll" }>;
type Draw = Extract<CasinoEvent, { kind: "draw" }>;

export function casinoState(game: Game) {
  const s = game.casino!;
  const ids = game.players.map((p) => p.id);
  const bought: Record<string, number> = {};
  const back: Record<string, number> = {};
  for (const id of ids) (bought[id] = 0), (back[id] = 0);
  const results: Record<string, Result[]> = Object.fromEntries(s.tables.map((x) => [x.id, []]));
  const draws: Draw[] = [];
  for (const e of game.casinoEvents ?? []) {
    if (e.kind === "buy" || e.kind === "cash") {
      if (!(e.player in bought)) continue;
      const to = e.kind === "buy" ? bought : back;
      to[e.player] = round2(to[e.player] + e.amount);
    } else if (e.kind === "draw") draws.push(e);
    else results[e.table]?.push(e);
  }
  const sold = round2(ids.reduce((a, id) => a + bought[id], 0));
  const returned = round2(ids.reduce((a, id) => a + back[id], 0));
  const raffle = s.finish === "raffle";
  // a raffle's chips come back as tickets (the odd chips are the house's); each prize won uses up the ticket drawn
  const tickets = Object.fromEntries(ids.map((id) => [id, raffle && s.ticket > 0 ? Math.floor(back[id] / s.ticket + 1e-9) : 0]));
  const won: Record<string, string[]> = Object.fromEntries(ids.map((id) => [id, []]));
  for (const d of draws) won[d.player]?.push(d.prize);
  const inDrum = Object.fromEntries(ids.map((id) => [id, Math.max(0, tickets[id] - won[id].length)]));
  // chips cashed in are paid out in money; raffle chips aren't, so every buy-in is the night's
  const net = Object.fromEntries(ids.map((id) => [id, round2((raffle ? 0 : back[id]) - bought[id])]));
  return {
    bought,
    back,
    net,
    sold,
    returned,
    /** the chips still on the floor: in hands and in the table trays */
    out: round2(sold - returned),
    /** what the house keeps: the money in less what it's paid out (a raffle keeps it all) */
    house: round2(raffle ? sold : sold - returned),
    results,
    draws,
    tickets,
    won,
    inDrum,
    drum: ids.reduce((a, id) => a + inDrum[id], 0),
    /** the next prize to draw, in the host's order */
    nextPrize: s.prizes[draws.length] as string | undefined,
  };
}

export type CasinoNight = ReturnType<typeof casinoState>;

// phones as dice cups: fair rolls that no one (the host included) can see
// early or pick. each round:
//  1. every phone picks its own random numbers and sends only a hash of them
//     (sha-256 of the numbers and a salt), which locks them in unseen
//  2. once every hash is in, the host's device picks its own numbers and puts
//     them in the snapshot
//  3. each die is the phone's number plus the host's, mod 6: the phone shows
//     its dice at once, the host can't work them out without the phone's
//     numbers, and the phone couldn't choose them (it locked in first)
//  4. on a call every phone sends its numbers and salt; the host checks them
//     against the hashes, rebuilds every cup and counts. a phone whose numbers
//     don't match is caught, and it loses the round
// all the randomness is crypto.getRandomValues. what the phones send is sealed
// with the game's key (sync.ts), so the relay sees only ids and ciphertext.
import type { CupState, Game } from "$lib/types";
import { token } from "$lib/crypto";

/** a fair random whole number below n (0 to 5 for a die) */
function below(n: number) {
  const limit = Math.floor(0x100000000 / n) * n;
  const x = new Uint32Array(1);
  do crypto.getRandomValues(x);
  while (x[0] >= limit);
  return x[0] % n;
}

/** `count` numbers from 0 to 5 */
export const numbers = (count: number) => Array.from({ length: count }, () => below(6));

/** a seat's id (public) and key (the phone's alone) */
export const newSeat = () => ({ seat: token(12), key: token(32) });

const hex = (b: ArrayBuffer) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join("");
export const sha256 = async (text: string) => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));

/** what a phone locks in: its numbers for this round, bound to the game, the round and its seat */
export const commitOf = (gameId: string, round: number, seat: string, nums: number[], salt: string) => sha256(`${gameId}|${round}|${seat}|${nums.join(",")}|${salt}`);

/** a phone's dice: its numbers plus the host's, mod 6, as faces 1 to 6 */
export const combine = (phone: number[], host: number[]) => phone.map((n, i) => ((n + (host[i] ?? 0)) % 6) + 1);

/**
 * what a phone sends to its mailbox: its hash for the round, then (on a call)
 * its numbers and salt with it. nothing in the hash gives the numbers away.
 */
export interface CupMail {
  r: number;
  c: string;
  n?: number[];
  s?: string;
}

export function readMail(text: string): CupMail | null {
  try {
    const m = JSON.parse(text);
    if (typeof m?.r !== "number" || typeof m.c !== "string" || !/^[0-9a-f]{64}$/.test(m.c)) return null;
    if (m.n !== undefined && !(Array.isArray(m.n) && m.n.length <= 20 && m.n.every((x: unknown) => Number.isInteger(x) && (x as number) >= 0 && (x as number) <= 5))) return null;
    if (m.s !== undefined && (typeof m.s !== "string" || m.s.length > 64)) return null;
    return m as CupMail;
  } catch {
    return null;
  }
}

/** the player a seat belongs to */
export const seatOwner = (cups: CupState, seat: string) => Object.entries(cups.seats).find(([, s]) => s === seat)?.[0] ?? null;

/** who still has to lock in (or reveal) this round: everyone still in who isn't on real dice */
export function waitingOn(game: Game, alive: string[]) {
  const c = game.cups!;
  const phones = alive.filter((id) => !c.real?.includes(id) && c.seats[id]);
  if (c.phase === "commit") return phones.filter((id) => !c.commits?.[id]);
  if (c.phase === "reveal") return phones.filter((id) => !c.shown?.[id]);
  return [];
}

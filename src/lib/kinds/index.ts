// every kind of game, in the order they're offered. the app asks a game's
// kind for what differs (its form, its dealer screen, its results, its
// recap...) instead of branching on game.type, so a new kind is a folder
// here and a line in this list.
import type { GameType } from "$lib/types";
import type { Kind } from "./kind";
import { settings } from "$lib/settings.svelte";
import { cash } from "./cash";
import { tournament } from "./tournament";
import { dice } from "./dice";
import { lives } from "./lives";
import { pot } from "./pot";

export const KINDS: Kind[] = [cash, tournament, dice, lives, pot];

/** the kinds a new game can be: poker always, the rest once they're switched on (Settings > Your Game) */
export const offeredKinds = () => KINDS.filter((k) => k.poker || settings.useOtherGames);
/** the kinds worth a filter: the ones offered, and any there are games of */
export function listedKinds(used: Iterable<string>) {
  const u = new Set(used);
  return KINDS.filter((k) => k.poker || settings.useOtherGames || u.has(k.id));
}

/** one of ours */
export const isKind = (x: unknown): x is GameType => KINDS.some((k) => k.id === x);
/** a kind by its id; anything else is a cash game */
export const kind = (id: string | null | undefined): Kind => KINDS.find((k) => k.id === id) ?? KINDS[0];
export type { Kind } from "./kind";

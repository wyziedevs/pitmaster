// every kind of game, in the order they're offered. the app asks a game's
// kind for what differs (its form, its dealer screen, its results, its
// recap...) instead of branching on game.type, so a new kind is a folder
// here and a line in this list.
import type { GameType } from "$lib/types";
import type { Kind } from "./kind";
import { cash } from "./cash";
import { tournament } from "./tournament";

export const KINDS: Kind[] = [cash, tournament];

/** one of ours */
export const isKind = (x: unknown): x is GameType => KINDS.some((k) => k.id === x);
/** a kind by its id; anything else is a cash game */
export const kind = (id: string | null | undefined): Kind => KINDS.find((k) => k.id === id) ?? KINDS[0];
export const kindOf = kind;
export type { Kind } from "./kind";

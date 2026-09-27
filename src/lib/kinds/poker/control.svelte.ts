// what the cash and tournament dealer screens share: the start button (its
// label, its sound and what it logs), seats being dealt out, a sound for
// something that just happened, and saving each change as it's made
import type { Game } from "$lib/types";
import { flash, logEvent } from "$lib/events";
import { time } from "$lib/now.svelte";
import { t } from "$lib/i18n";

const STATUS = { idle: "gamePlay.shared.statusIdle", running: "gamePlay.shared.statusRunning", paused: "gamePlay.shared.statusPaused" };

export class Dealer {
  /** seats drawn before the screen opened aren't dealt out again */
  readonly #opened = Date.now();

  constructor(
    readonly game: () => Game,
    readonly persist: () => void,
  ) {}

  readonly running = $derived.by(() => this.game().clock.status === "running");
  // clock.ts's STATUS_LABEL is English only; the screen says it in the host's language
  readonly status = $derived.by(() => t(STATUS[this.game().clock.status]));
  // the first press of the night shuffles the deck; after that the clock winds
  // down and back up like a tape machine
  readonly startSound = $derived.by<"pause" | "riffle" | "resume">(() => (this.running ? "pause" : this.game().clock.status === "idle" ? "riffle" : "resume"));
  // seats just drawn (here or from the palette): the labels are dealt out row by row
  readonly #dealtAt = $derived.by(() => {
    const f = this.game().flash;
    return f?.kind === "draw" && f.at > this.#opened ? f.at : 0;
  });
  readonly dealing = $derived(time.now - this.#dealtAt < 1500);

  /** a change, saved */
  act = (fn: () => void) => {
    fn();
    this.persist();
  };

  /** start, pause or resume with `flip`, and log which (the start also goes up on the tv) */
  toggle(flip: (game: Game) => void, said: { paused: string; started: string; resumed: string; flash: string }) {
    this.act(() => {
      const game = this.game();
      const was = game.clock.status;
      flip(game);
      logEvent(game, was === "running" ? said.paused : was === "idle" ? said.started : said.resumed);
      if (was === "idle") flash(game, said.flash, "shuffle");
    });
  }
}

/** `fn` when `on` turns true in front of us (not when the screen opens with it already true) */
export function onRise(on: () => boolean, fn: () => void) {
  let was: boolean | null = null;
  $effect(() => {
    const now = on();
    if (now && was === false) fn();
    was = now;
  });
}

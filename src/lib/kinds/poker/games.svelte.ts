// the game on the poker form: hold'em, another poker game, or several (a
// tournament's mix, a cash game's dealer's choice)
import { ROTATIONS, orHoldem, rotationOf } from "$lib/variants";

export class GamePick {
  /** a variant's id, "mix:<rotation>", "mix:custom" (tournaments) or "choice" (cash) */
  pick = $state("nlhe");
  /** the host's own list, in the order they ticked them */
  own = $state<string[]>(["nlhe", "plo"]);
  /** the host's own list is the game: dealer's choice, or their own mix */
  readonly custom = $derived(this.pick === "choice" || this.pick === "mix:custom");
  // the host's own list with nothing ticked plays hold'em
  readonly games = $derived<string[]>(
    this.custom ? orHoldem(this.own) : this.pick.startsWith("mix:") ? (ROTATIONS.find((r) => `mix:${r.id}` === this.pick)?.games ?? ["nlhe"]) : [this.pick],
  );
  // plain no limit hold'em is saved as nothing at all
  readonly holdem = $derived(this.games.length === 1 && this.games[0] === "nlhe");

  toggle(id: string, on: boolean) {
    this.own = on ? [...this.own.filter((g) => g !== id), id] : this.own.filter((g) => g !== id);
  }

  /** the pick that makes these games: one of them, a known mix, or the host's own */
  set(games: string[], cash: boolean) {
    const r = rotationOf(games);
    if (games.length === 1) this.pick = games[0];
    else if (r && !cash) this.pick = `mix:${r.id}`;
    else {
      this.own = [...games];
      this.pick = cash ? "choice" : "mix:custom";
    }
  }

  /** a pick this kind of game can't play (a mix on a cash game) goes back to hold'em */
  fit(cash: boolean) {
    if (cash ? this.pick.startsWith("mix:") : this.pick === "choice") this.pick = "nlhe";
  }
}

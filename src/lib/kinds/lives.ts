// last one standing: everyone starts with the same lives (dice in liar's dice,
// coins in 31, cards in screw your neighbor...), each event takes some away
// (or, now and then, gives one back), and a player with none left is out.
// every lives game is worked out from its events with this, so none of it is
// saved: lives, places and who's still in come from the events every time.

export interface LivesEvent {
  /** lives each player gained (+) or lost (-) */
  effect: Record<string, number>;
  at: number;
}

/**
 * where everyone stands after these events, in order.
 *  lives:   what each player has left
 *  lost:    how many each has lost in all (a life won back doesn't undo one)
 *  places:  where each player finished, once they're out (the winner is 1st);
 *           players out in the same event share the best of their places
 *  history: each event with everyone's lives before and after it
 */
export function standing(ids: string[], start: number, events: LivesEvent[], max = start) {
  const lives: Record<string, number> = {};
  const lost: Record<string, number> = {};
  const places: Record<string, number | null> = {};
  const outAt: Record<string, number> = {};
  for (const id of ids) {
    lives[id] = start;
    lost[id] = 0;
    places[id] = null;
  }
  const history: { effect: Record<string, number>; before: Record<string, number>; after: Record<string, number>; at: number }[] = [];
  for (const e of events) {
    const before = { ...lives };
    const alive = ids.filter((id) => lives[id] > 0);
    for (const [id, d] of Object.entries(e.effect)) {
      if (!(id in lives) || lives[id] <= 0) continue;
      if (d < 0) lost[id] += -d;
      lives[id] = Math.max(0, Math.min(max, lives[id] + d));
    }
    const gone = alive.filter((id) => lives[id] === 0);
    // out together: they share the best place among them
    for (const id of gone) {
      places[id] = alive.length - gone.length + 1;
      outAt[id] = e.at;
    }
    history.push({ effect: e.effect, before, after: { ...lives }, at: e.at });
  }
  const left = ids.filter((id) => lives[id] > 0);
  if (left.length === 1 && ids.length > 1) places[left[0]] = 1;
  return { lives, lost, places, outAt, history };
}

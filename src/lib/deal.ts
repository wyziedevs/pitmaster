// final-table deal math. two ways to chop what's left of the prize pool:
//  - icm (malmuth-harville): what each stack is worth given the pay jumps
//  - chip chop: everyone locks up the lowest remaining prize, the rest goes by chips

/** icm equity for each stack. exact for up to ~10 players (it walks every finishing order). */
export function icm(stacks: number[], prizes: number[]): number[] {
  const n = stacks.length;
  const total = stacks.reduce((s, x) => s + x, 0);
  const out = stacks.map(() => 0);
  if (!n || total <= 0) return out;
  const pay = prizes.slice(0, n);
  // who's already placed is a bitmask; frontier maps each one to its chance.
  // go place by place; for each set of players already finished above, spread
  // the chance that each remaining player takes the next spot
  let frontier = new Map<number, number>([[0, 1]]);
  for (let place = 0; place < pay.length; place++) {
    const next = new Map<number, number>();
    for (const [mask, p] of frontier) {
      let left = 0;
      for (let i = 0; i < n; i++) if (!(mask & (1 << i))) left += stacks[i];
      if (left <= 0) continue;
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) continue;
        const q = (p * stacks[i]) / left;
        out[i] += q * pay[place];
        const m = mask | (1 << i);
        next.set(m, (next.get(m) ?? 0) + q);
      }
    }
    frontier = next;
  }
  return out;
}

/** lowest remaining prize for everyone, the rest split by chip count */
export function chipChop(stacks: number[], prizes: number[]): number[] {
  const n = stacks.length;
  const pay = prizes.slice(0, n);
  const floor = pay.length >= n ? pay[n - 1] : 0;
  const pool = pay.reduce((s, x) => s + x, 0);
  const total = stacks.reduce((s, x) => s + x, 0);
  const rest = pool - floor * n;
  return stacks.map((s) => floor + (total > 0 ? (rest * s) / total : rest / n));
}

/** whole-unit amounts that still add up to the pool: leftovers go to the biggest stacks */
export function roundDeal(amounts: number[], unit = 1) {
  const target = Math.round(amounts.reduce((s, x) => s + x, 0) / unit) * unit;
  const r = amounts.map((a) => Math.floor(a / unit) * unit);
  let short = Math.round((target - r.reduce((s, x) => s + x, 0)) / unit);
  const order = amounts.map((a, i) => ({ i, frac: a / unit - Math.floor(a / unit) })).sort((a, b) => b.frac - a.frac);
  for (let k = 0; short > 0 && order.length; k = (k + 1) % order.length, short--) r[order[k].i] += unit;
  return r;
}

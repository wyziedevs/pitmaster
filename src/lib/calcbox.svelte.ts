// the floating calculator: whether it's open and where it sits. its own file,
// so the header's button and the C key can open it on any page while the math
// (calc.svelte.ts) comes down only with the calculator itself. never saved.

export const CALC_KEY = "C";

export const calc = $state({
  open: false,
  /** top-left corner in px, or null for the default corner */
  x: null as number | null,
  y: null as number | null,
  /** see-through, and clicks go through it to the page underneath */
  ghost: false,
  /** just the display, no keys */
  small: false,
});

export function closeCalculator() {
  calc.open = false;
  calc.ghost = false;
}

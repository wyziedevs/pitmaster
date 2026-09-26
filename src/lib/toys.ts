// the chips are toys. anywhere a chip is drawn (and isn't part of a button):
//  - point at it and it spins, with a whirr (the spin itself is in Chip.svelte)
//  - tap it and it clacks on its own note (sound.ts noteFor), and on a touch
//    screen, where nothing hovers, it spins too
//  - tap a stack and it's shuffled like at a real table: cut in half, the two
//    halves set side by side, then pushed together so the chips riffle into
//    one stack (a short stack just hops, disc by disc)
// wired once for the whole site in +layout.svelte.
import { play } from "./sound";
import { reducedMotion } from "./motion";

/** chips and stacks inside a control belong to that control */
const owned = (el: Element) => !!el.parentElement?.closest("button, a, [data-sound]");

export function pressToy(e: PointerEvent) {
  const target = e.target as Element | null;
  const stack = target?.closest?.<HTMLElement>(".stack[data-v]");
  if (stack && !owned(stack)) return shuffleStack(stack, e.clientX);
  const chip = target?.closest?.<SVGElement>("svg.chip[data-v]");
  if (!chip || owned(chip)) return;
  play("note", { value: Number(chip.dataset.v), x: e.clientX });
  if (e.pointerType !== "mouse") chip.dispatchEvent(new Event("chipspin"));
}

export function hoverToy(e: PointerEvent) {
  if (e.pointerType !== "mouse" || reducedMotion()) return;
  const chip = (e.target as Element | null)?.closest?.<SVGElement>("svg.chip.spin[data-v]");
  // only on the way in, not every time the pointer crosses a stripe inside it
  if (!chip || chip.contains(e.relatedTarget as Node | null)) return;
  play("spin", { value: Number(chip.dataset.v), x: e.clientX });
}

const MOVE = "cubic-bezier(0.25, 1, 0.5, 1)";
/** how far each half slides out, in stack widths: a clear gap between the two
 *  halves. layouts that hold stacks leave at least this much room beside each */
export const SPLIT = 0.64;
const busy = new WeakSet<Element>();

/**
 * the chip shuffle. the bottom half stays put and slides left; the top half
 * lifts off, slides right and comes down beside it. then the two are pushed
 * together and zip up from the bottom, one chip from each side in turn, into
 * one stack. when it's done the stack keeps its new order: ChipStack.svelte
 * hears "restack" and moves each disc's own turn and nudge to where it landed.
 */
function shuffleStack(stack: HTMLElement, x: number) {
  const discs = [...stack.children] as HTMLElement[];
  if (busy.has(stack)) return;
  if (discs.length < 4) return hopStack(stack, discs, x);
  const n = discs.length;
  const w = stack.offsetWidth;
  // one chip's thickness, from the layout itself (a zoomed page's rects would be scaled)
  const bottom = (d: Element) => parseFloat(getComputedStyle(d).bottom);
  const t = bottom(discs[1]) - bottom(discs[0]);
  const ms = Math.min(1250, 820 + n * 12);
  const half = Math.ceil(n / 2); // the bottom half
  // when each chip lands in the merged stack (as a fraction of the shuffle)
  const lands = (slot: number) => 0.52 + (slot / (n - 1)) * 0.4;

  // the sound lands with the motion: the cut set down, then a clack per chip zipping in
  const clacks = Math.min(14, n);
  play("stack", {
    value: Number(stack.dataset.v),
    n: clacks,
    cut: (0.3 * ms) / 1000,
    lead: (lands(0) * ms) / 1000,
    gap: ((lands(n - 1) - lands(0)) * ms) / 1000 / (clacks - 1),
    x,
  });
  if (reducedMotion()) return;

  // the chips come up off the page for the shuffle: a copy of the stack on the
  // top layer, exactly over it, so nothing on the page covers or clips the
  // halves as they spread out. the stack itself waits, hidden, underneath.
  const box = stack.getBoundingClientRect();
  const lifted = stack.cloneNode(true) as HTMLElement;
  lifted.classList.add("lifted");
  lifted.setAttribute("aria-hidden", "true");
  lifted.removeAttribute("title");
  lifted.style.setProperty("--w", `${w}px`);
  lifted.style.setProperty("--t", `${t}px`);
  lifted.style.setProperty("--e", `${parseFloat(getComputedStyle(discs[0]).height) - t}px`);
  Object.assign(lifted.style, { left: `${box.left + scrollX}px`, top: `${box.top + scrollY}px` });
  document.body.append(lifted);
  stack.style.visibility = "hidden";
  const copies = [...lifted.children] as HTMLElement[];

  // where each disc ends up once they're riffled together
  const slotOf = (j: number) => (j < half ? 2 * j : 2 * (j - half) + 1);

  busy.add(stack);
  let left = n;
  const done = () => {
    if (--left) return;
    // the real stack takes the shuffled order before it shows again, so
    // nothing jumps back to how it was
    stack.dispatchEvent(new CustomEvent("restack", { detail: discs.map((_, j) => slotOf(j)) }));
    lifted.remove();
    stack.style.visibility = "";
    busy.delete(stack);
  };
  copies.forEach((d, j) => {
    const low = j < half;
    const k = low ? j : j - half; // its place in its half
    const slot = slotOf(j);
    const side = low ? -1 : 1;
    const cutY = (j - k) * t; // the top half comes down to the felt
    const endY = (j - slot) * t;
    const at = lands(slot);
    d.animate(
      [
        { offset: 0, transform: "none", zIndex: j, easing: MOVE },
        { offset: 0.12, transform: `translate(${side * w * (low ? 0.08 : 0.22)}px, ${low ? 0 : -t * 1.5}px)`, zIndex: j, easing: MOVE },
        { offset: 0.3, transform: `translate(${side * w * SPLIT}px, ${cutY}px)`, zIndex: slot },
        { offset: at - 0.16, transform: `translate(${side * w * SPLIT}px, ${cutY}px)`, zIndex: slot, easing: MOVE },
        { offset: at, transform: `translate(0px, ${endY}px)`, zIndex: slot },
        { offset: 1, transform: `translate(0px, ${endY}px)`, zIndex: slot },
      ],
      { duration: ms },
    ).finished.finally(done);
  });
}

/** too short to cut: each disc hops in turn, bottom to top, in step with its clack */
function hopStack(stack: HTMLElement, discs: HTMLElement[], x: number) {
  if (!discs.length) return;
  const gap = Math.min(24, 380 / discs.length);
  // a tall stack gets fewer clacks than discs, spread over the same time
  const n = Math.min(14, discs.length);
  play("stack", { value: Number(stack.dataset.v), n, gap: (discs.length * gap) / n / 1000, x });
  if (reducedMotion()) return;
  discs.forEach((d, i) =>
    d.animate([{ transform: "none" }, { transform: "translateY(-5px)", offset: 0.35 }, { transform: "none" }], {
      duration: 260,
      delay: i * gap,
      easing: "ease-out",
    }),
  );
}

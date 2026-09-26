// shared motion: one set of timings for every svelte transition, plus the few
// effects that need js (number bumps, the theme reveal). css-only motion lives
// in app.css next to the --dur-* tokens.
import { tick } from "svelte";
import { cubicOut, expoOut, quartOut } from "svelte/easing";
import { slide as svelteSlide, type SlideParams } from "svelte/transition";

export const reducedMotion = () =>
  typeof window !== "undefined" &&
  (matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced");

// durations collapse to 0 under reduced motion so outros don't hang around
const d = (ms: number) => (reducedMotion() ? 0 : ms);

/** rows, notes and options appearing inline */
export const reveal = () => ({ duration: d(220), easing: quartOut });
/** something leaving: faster than it arrived */
export const leave = () => ({ duration: d(150), easing: cubicOut });
/** rows re-sorting (flip) */
export const reorder = () => ({ duration: d(320), easing: expoOut });
/** toasts and small things rising into place */
export const rise = (y = 8) => ({ y, duration: d(260), easing: expoOut });

/**
 * svelte's slide, without the jump when it ends. slide clips the box while it
 * opens, which keeps its children's margins inside it; when it finished and
 * the clip came off, those margins collapsed out through the box and whatever
 * was in it hopped a few px after the smooth part. a block that slides keeps
 * its children's margins inside it for good (flow-root), open or opening, so
 * the last frame is where it stays. use it everywhere in place of svelte's.
 */
export function slide(node: Element, params?: SlideParams) {
  const el = node as HTMLElement;
  if (getComputedStyle(el).display === "block") el.style.display = "flow-root";
  return svelteSlide(el, params);
}

/**
 * replays a short highlight whenever `value` changes: a stat that moved, a
 * count that went up. `use:bump={value}`
 */
export function bump(node: HTMLElement, value: unknown) {
  return {
    update(next: unknown) {
      if (next === value) return;
      value = next;
      restart(node, "bump");
    },
  };
}

/**
 * play `cls`'s animation from the start, without making the browser lay out
 * the page to do it (three stats bumping at once used to mean three layouts):
 * its running animations are rewound, or, when they've finished, the class
 * comes off and goes back on two frames later, once the browser has seen it gone
 */
function restart(node: HTMLElement, cls: string) {
  if (!node.classList.contains(cls)) return node.classList.add(cls);
  const own = node.getAnimations().filter((a) => a instanceof CSSAnimation);
  if (own.length) {
    for (const a of own) {
      a.cancel();
      a.play();
    }
    return;
  }
  node.classList.remove(cls);
  requestAnimationFrame(() => requestAnimationFrame(() => node.classList.add(cls)));
}

/**
 * the same idea for any one-shot animation class: replays `cls` whenever `key`
 * changes, never on first render. `use:replay={[level, "roll"]}`
 */
export function replay(node: HTMLElement, [key, cls]: [unknown, string]) {
  return {
    update([next, c]: [unknown, string]) {
      if (next === key) return;
      key = next;
      restart(node, c);
    },
  };
}

/**
 * plays `cls` once if the thing it marks happened just now (a bust, a win), so
 * reopening the page later doesn't replay the whole night. `use:fresh={[at, "stamp"]}`
 */
export function fresh(node: HTMLElement, [at, cls]: [number | null | undefined, string]) {
  if (at && Date.now() - at < 2000) node.classList.add(cls);
}

type ViewTransition = { ready: Promise<void>; finished: Promise<void> };
const vt = () =>
  (document as Document & { startViewTransition?: (cb: () => unknown) => ViewTransition }).startViewTransition?.bind(document);

/**
 * swap the theme with the new one wiping out in a circle from the click.
 * falls back to an instant swap without view transitions or with reduced motion.
 */
export async function revealTheme(update: () => void, x: number, y: number) {
  const start = vt();
  if (!start || reducedMotion()) return update();
  const root = document.documentElement;
  root.dataset.vt = "theme";
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const run = once(update);
  const t = start(async () => {
    run();
    await tick();
  });
  // the browser only calls back once it can paint; never leave the theme waiting on that
  setTimeout(run, 300);
  try {
    await t.ready;
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" }
    );
    await t.finished;
  } catch {
  } finally {
    delete root.dataset.vt;
  }
}

/** page-to-page crossfade (sveltekit onNavigate). resolves when the new page is in. */
export function pageTransition(complete: Promise<void>) {
  const start = vt();
  if (!start || reducedMotion()) return;
  return new Promise<void>((resolve) => {
    const t = start(async () => {
      resolve();
      await complete;
    });
    // a transition the browser skips (a second click mid-swap, a hidden tab)
    // rejects `ready`; the page still arrives, so there's nothing to report
    t.ready.catch(() => {});
    // same safety as the theme: navigation never waits on a frame that isn't coming
    setTimeout(resolve, 300);
  });
}

function once(fn: () => void) {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    fn();
  };
}

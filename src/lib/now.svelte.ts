// one shared ticking clock for every component that shows live time. it only
// ticks while something on the screen is reading it (a clock, a countdown),
// four times a second, and once a second while the tab is hidden: nothing's
// looking, but the tv's level-up sounds still come on time.
import { createSubscriber } from "svelte/reactivity";

let current = Date.now();
let live = false;

const subscribe = createSubscriber((update) => {
  live = true;
  let t: ReturnType<typeof setTimeout>;
  const tick = () => {
    current = Date.now();
    update();
    t = setTimeout(tick, document.hidden ? 1000 : 250);
  };
  // back in view: catch up at once rather than on the next slow tick
  const seen = () => {
    if (document.hidden) return;
    clearTimeout(t);
    tick();
  };
  current = Date.now();
  t = setTimeout(tick, 250);
  document.addEventListener("visibilitychange", seen);
  return () => {
    live = false;
    clearTimeout(t);
    document.removeEventListener("visibilitychange", seen);
  };
});

export const time = {
  /** the time now, ms. read in the template or an effect and it keeps it current */
  get now() {
    subscribe();
    // read from a click handler with nothing ticking: the real time
    return live ? current : Date.now();
  },
};

// tiny sound kit. webaudio, no files.
//  - `sounds` are the tv's game events: loud bleeps and chips a room can hear.
//  - `play()` is the interface's own tactile layer: short, quiet clicks, clacks
//    and chip notes that sit under a press. gated by the "Interface Sounds" setting.
import { settings, prefs } from "./settings.svelte";

let ctx: AudioContext | null = null;
// two volume knobs: the interface's clicks and the tv's alarms each run through
// their own gain. `bus` is whichever one the sound being built right now uses.
let uiOut: GainNode | null = null;
let tvOut: GainNode | null = null;
let bus: AudioNode | null = null;

/** a volume slider (0 to 100) as a gain: 70 is the original loudness, and it's
 *  squared so the slider feels even to the ear */
export const gainFor = (v: number) => (Math.max(0, Math.min(100, Number(v) || 0)) / 70) ** 2;

function audio() {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    uiOut = ctx.createGain();
    tvOut = ctx.createGain();
    uiOut.connect(ctx.destination);
    tvOut.connect(ctx.destination);
    // the interface sounds like it's on a table in a room: a short, dark answer
    // (felt eats the highs) under the dry sound
    try {
      const room = ctx.createConvolver();
      room.buffer = roomTail(ctx);
      const wet = ctx.createGain();
      wet.gain.value = 0.2;
      uiOut.connect(room).connect(wet).connect(ctx.destination);
    } catch {}
  }
  if (ctx.state === "suspended") ctx.resume();
  // read the sliders every time, so a change is heard on the very next sound
  uiOut!.gain.value = gainFor(settings.volume);
  tvOut!.gain.value = gainFor(prefs().tvVolume);
  return ctx;
}

/** a third of a second of dark, fading stereo noise: the room's reply */
function roomTail(a: AudioContext) {
  const len = Math.round(a.sampleRate * 0.32);
  const gap = Math.round(a.sampleRate * 0.007); // the nearest wall is a few steps away
  const b = a.createBuffer(2, len, a.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    let lp = 0;
    for (let i = gap; i < len; i++) {
      lp += 0.3 * (Math.random() * 2 - 1 - lp); // one-pole lowpass: warm, not hissy
      d[i] = lp * Math.exp(-(i - gap) / a.sampleRate / 0.055);
    }
  }
  return b;
}

// a quiet page lets the sound card rest: the interface's clicks come in
// bursts, so after a while with nothing to play the context is suspended, and
// the next press wakes it (audio() resumes it). a page that's played the tv's
// sounds never rests: an alarm can't wait on a wake-up.
let tvUsed = false;
let resting: ReturnType<typeof setTimeout> | undefined;
function restSoon() {
  clearTimeout(resting);
  if (tvUsed) return;
  resting = setTimeout(() => {
    if (!tvUsed && ctx?.state === "running") ctx.suspend().catch(() => {});
  }, 15000);
}

/** where the current sound goes: the tv's bus unless the interface asked */
const out = (a: AudioContext) => bus ?? tvOut ?? a.destination;

/** try to start audio; true once it's actually playing. call it from a click or key. */
export async function resumeAudio() {
  try {
    const a = audio();
    if (a.state !== "running") await a.resume();
    return a.state === "running";
  } catch {
    return false;
  }
}

/**
 * can this tab make noise yet? browsers hold audio until the page has been
 * clicked or tapped; a page the browser already trusts may start "running".
 */
export function audioReady() {
  try {
    return audio().state === "running";
  } catch {
    return false;
  }
}

export function beep(pattern: [freq: number, len: number][], vol = 0.25) {
  try {
    tvUsed = true;
    const a = audio();
    bus = tvOut;
    let t = a.currentTime;
    for (const [freq, len] of pattern) {
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = "square";
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + len);
      o.connect(g).connect(out(a));
      o.start(t);
      o.stop(t + len);
      t += len + 0.06;
    }
  } catch {}
}

export const sounds = {
  level: () => beep([[660, 0.18], [880, 0.18], [1100, 0.35]]),
  warn: () => beep([[520, 0.12], [520, 0.12]]),
  break: () => beep([[440, 0.3], [330, 0.5]]),
  /** a knockout: the stack goes over and skitters across the felt, then the low call */
  bust: () => {
    room((a, t) => topple(a, t, 3.2));
    setTimeout(() => beep([[300, 0.2], [200, 0.4]], 0.2), 260);
  },
  ding: () => beep([[1320, 0.12]], 0.15),
  win: () => beep([[523, 0.15], [659, 0.15], [784, 0.15], [1047, 0.5]]),
  /** the last five seconds of a level, one a second, like a wall clock. each
   *  tick sits a little higher than the last, so the room hears it closing in */
  tick: (left = 5) => room((a, t) => click(a, t, { freq: 2600 + (5 - left) * 280, q: 4, len: 0.03, vol: 0.22 })),
  /** the deck getting shuffled for the table: first hand, seats drawn */
  shuffle: () => room((a, t) => riffle(a, t, 4)),
  /** chips hitting the felt, loud enough for the room: buy-ins, rebuys, reloads */
  chips: () =>
    room((a, t) => {
      for (let i = 0; i < 4; i++) clack(a, t + i * jitter(0.05, 0.3), 0.3 * (1 - i * 0.18), jitter(1, 0.05));
    }),
  /** racking up: a stack sliding into the rack one chip at a time, then the rack set down */
  rack: () => room((a, t) => rack(a, t, 0.24)),
  /** the bubble bursts (or the table makes a deal): chips raked over, then a bright run up */
  money: () => {
    room((a, t) => {
      let at = t;
      for (let i = 0; i < 6; i++) {
        clack(a, at, 0.26 * (1 - i * 0.1));
        at += jitter(0.045, 0.3);
      }
    });
    setTimeout(() => beep([[784, 0.09], [988, 0.09], [1175, 0.09], [1568, 0.32]], 0.16), 360);
  },
  /** ship it: the pot pushed to the winner in a run of clacks, then the fanfare */
  ship: () => {
    room((a, t) => {
      let at = t;
      for (let i = 0; i < 9; i++) {
        clack(a, at, 0.3 * (1 - i * 0.07));
        at += jitter(0.04 + i * 0.006, 0.35);
      }
    });
    setTimeout(() => beep([[523, 0.15], [659, 0.15], [784, 0.15], [1047, 0.5]]), 560);
  },
  /** the host's message landing on the screen: a two-note chime, like a PA */
  chime: () =>
    room((a, t) => {
      tone(a, t, { freq: 988, len: 0.55, vol: 0.13 });
      tone(a, t + 0.3, { freq: 784, len: 0.8, vol: 0.12 });
    }),
};

function room(fn: (a: AudioContext, t: number) => void) {
  try {
    tvUsed = true;
    const a = audio();
    bus = tvOut;
    fn(a, a.currentTime + 0.001);
  } catch {}
}

// ---------- the pieces every sound is built from ----------

let noise: AudioBuffer | null = null;
function noiseBuffer(a: AudioContext) {
  if (noise) return noise;
  noise = a.createBuffer(1, a.sampleRate * 0.25, a.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noise;
}

/** a filtered noise burst: the body of every click */
function click(a: AudioContext, at: number, { freq = 2400, q = 1.4, len = 0.018, vol = 0.05 } = {}) {
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a);
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  f.Q.value = q;
  const g = a.createGain();
  g.gain.setValueAtTime(vol, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  src.connect(f).connect(g).connect(out(a));
  src.start(at, Math.random() * 0.2);
  src.stop(at + len + 0.01);
}

/** a short sine blip: pitch for toggles and chimes */
function tone(a: AudioContext, at: number, { freq = 880, len = 0.06, vol = 0.03, type = "sine" as OscillatorType } = {}) {
  const o = a.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  o.connect(g).connect(out(a));
  o.start(at);
  o.stop(at + len + 0.01);
}

/** a tone that bends from one pitch to another: tape stops, pops, rewinds */
function sweep(a: AudioContext, at: number, { from = 400, to = 800, len = 0.08, vol = 0.02, type = "sine" as OscillatorType } = {}) {
  const o = a.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(from, at);
  o.frequency.exponentialRampToValueAtTime(to, at + len);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  o.connect(g).connect(out(a));
  o.start(at);
  o.stop(at + len + 0.01);
}

/**
 * something turning over and over: noise through a band that pulses once a
 * turn. the turns slow down (`rate` to `rate1`) and the band drops, like a
 * chip spun on the felt winding down, or one tumbling through the air.
 */
function whirr(
  a: AudioContext,
  at: number,
  { len = 0.8, freq = 2600, freq1 = 900, rate = 22, rate1 = 5, q = 2.2, vol = 0.02 } = {},
) {
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a);
  src.loop = true;
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, at);
  f.frequency.exponentialRampToValueAtTime(freq1, at + len);
  // each turn: a gain that swings between 0 and 1 on a slowing wave
  const turn = a.createGain();
  turn.gain.value = 0.5;
  const lfo = a.createOscillator();
  lfo.frequency.setValueAtTime(rate, at);
  lfo.frequency.exponentialRampToValueAtTime(rate1, at + len);
  const depth = a.createGain();
  depth.gain.value = 0.5;
  lfo.connect(depth).connect(turn.gain);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  src.connect(f).connect(turn).connect(g).connect(out(a));
  src.start(at, Math.random() * 0.2);
  src.stop(at + len + 0.02);
  lfo.start(at);
  lfo.stop(at + len + 0.02);
}

const jitter = (n: number, amt = 0.08) => n * (1 + (Math.random() * 2 - 1) * amt);

/** one clay chip knocking another: a bright click with a little ring. `p` tunes it */
function clack(a: AudioContext, at: number, v: number, p = 1) {
  click(a, at, { freq: jitter(3800, 0.15) * p, q: 6, len: 0.03, vol: v });
  click(a, at, { freq: jitter(6900, 0.1) * p, q: 9, len: 0.01, vol: v * 0.4 }); // the edge
  tone(a, at, { freq: jitter(2900, 0.1) * p, len: 0.025, vol: v * 0.25, type: "triangle" });
}

/** a wooden bar struck once, the chips' own singing voice (marimba, more or less) */
/** paper moving: a band of noise swept from one pitch to another */
function hiss(a: AudioContext, at: number, { from = 3000, to = 1500, len = 0.12, vol = 0.02 } = {}) {
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a);
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 1;
  f.frequency.setValueAtTime(from, at);
  f.frequency.exponentialRampToValueAtTime(to, at + len);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + len * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  src.connect(f).connect(g).connect(out(a));
  src.start(at, Math.random() * 0.2);
  src.stop(at + len + 0.02);
}

/** one card's edge under the thumb, tuned to a pentatonic step so a strum always sounds right */
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
function pluck(a: AudioContext, at: number, n: number) {
  const step = PENTA[Math.max(0, Math.min(n, PENTA.length - 1))];
  click(a, at, { freq: jitter(2400 + step * 90, 0.08), q: 2.4, len: 0.012, vol: 0.04 });
  mallet(a, at + 0.003, 660 * 2 ** (step / 12), 0.012);
}

function mallet(a: AudioContext, at: number, freq: number, vol: number) {
  tone(a, at, { freq, len: 0.45, vol });
  tone(a, at, { freq: freq * 4, len: 0.06, vol: vol * 0.3 });
  tone(a, at, { freq: freq * 9.2, len: 0.02, vol: vol * 0.1 });
}

/** a small bell: a few out-of-tune partials that fade at their own pace */
function bell(a: AudioContext, at: number, freq: number, vol: number) {
  tone(a, at, { freq, len: 0.9, vol });
  tone(a, at, { freq: freq * 2.76, len: 0.4, vol: vol * 0.4 });
  tone(a, at, { freq: freq * 5.4, len: 0.18, vol: vol * 0.2 });
}

/**
 * every chip has its own note, from its value: the notes climb a major
 * pentatonic scale as the chips go up (1 is a middle C, 25 an A, 100 a D,
 * 1000 an A), so any set played low to high is a little tune that never
 * clashes. a chip sounds the same wherever it is.
 */
const PENTATONIC = [0, 2, 4, 7, 9];
export function noteFor(value: number) {
  const step = Math.max(-5, Math.min(12, Math.round(Math.log10(Math.max(Number(value) || 1, 0.01)) * 3)));
  const semis = Math.floor(step / 5) * 12 + PENTATONIC[((step % 5) + 5) % 5];
  return 261.63 * 2 ** (semis / 12);
}
/** the clack leans a little toward the note: higher chips click a touch brighter */
const leanTo = (freq: number) => (freq / 440) ** 0.18;

/**
 * a riffle shuffle: two halves of the deck purring together (fast in the
 * middle, slower at the ends), then the bridge as the cards fall flat.
 * `g` scales it up for the tv. returns when the cards are down.
 */
function riffle(a: AudioContext, t: number, g = 1) {
  const n = 24;
  let at = t;
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1);
    const mid = Math.sin(p * Math.PI);
    at += jitter(0.019 - 0.009 * mid, 0.25);
    click(a, at, { freq: jitter(2600 + 1600 * mid, 0.12), q: 2.4, len: 0.011, vol: g * 0.034 * (0.55 + 0.45 * mid) });
  }
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a);
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 1.1;
  const b = at + 0.05;
  f.frequency.setValueAtTime(2400, b);
  f.frequency.exponentialRampToValueAtTime(700, b + 0.16);
  const gain = a.createGain();
  gain.gain.setValueAtTime(0.0001, b);
  gain.gain.exponentialRampToValueAtTime(g * 0.03, b + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, b + 0.18);
  src.connect(f).connect(gain).connect(out(a));
  src.start(b);
  src.stop(b + 0.2);
  return b + 0.18;
}

/** one card pitched across the table: an airy flick, then flat on the felt */
function card(a: AudioContext, at: number, g = 1) {
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a);
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 1.3;
  f.frequency.setValueAtTime(5200, at);
  f.frequency.exponentialRampToValueAtTime(1800, at + 0.06);
  const gain = a.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(g * 0.022, at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.06);
  src.connect(f).connect(gain).connect(out(a));
  src.start(at, Math.random() * 0.2);
  src.stop(at + 0.07);
  click(a, at + 0.058, { freq: jitter(1100), q: 0.9, len: 0.03, vol: g * 0.055 });
}

/** a stack knocked over: a thud, then the chips skitter off, each bounce shorter and quieter */
function topple(a: AudioContext, t: number, g = 1) {
  click(a, t, { freq: 420, q: 0.8, len: 0.06, vol: g * 0.1 });
  tone(a, t, { freq: 98, len: 0.1, vol: g * 0.05 });
  let at = t + 0.05;
  let gap = 0.08;
  for (let i = 0; i < 7; i++) {
    clack(a, at, g * 0.07 * (1 - i * 0.12), jitter(1 - i * 0.03, 0.04));
    at += jitter(gap, 0.2);
    gap *= 0.74;
  }
}

/** a stack sliding into the rack one chip at a time, then the rack set down */
function rack(a: AudioContext, t: number, g: number) {
  let at = t;
  for (let i = 0; i < 8; i++) {
    clack(a, at, g * (1 - i * 0.08));
    at += jitter(0.036, 0.25);
  }
  click(a, at + 0.03, { freq: 420, q: 0.8, len: 0.08, vol: g * 1.15 });
}

// ---------- the interface's sounds ----------

type Opts = {
  /** a chip's value, for its note */
  value?: number;
  /** several chips' values, played as a run */
  values?: number[];
  /** how many: chips in a stack, seats to deal, a list position */
  n?: number;
  /** seconds between chips in a riffle */
  gap?: number;
  /** a chip shuffle: seconds until the cut half is set down, and until the riffle starts */
  cut?: number;
  lead?: number;
  /** how hard something hit, 0 to 1 */
  v?: number;
  /** where on the screen it happened (a pointer's clientX), for which side it comes from */
  x?: number;
  /** how long it runs, seconds: a wheel coasting, a ball going round */
  len?: number;
};
type Sound = (a: AudioContext, t: number, o: Opts) => void;

const kit = {
  /** a button going down: a soft, dry tick */
  tap: (a, t) => click(a, t, { freq: jitter(2200), q: 1.2, len: 0.02, vol: 0.06 }),
  /** a big button going down: rounder and deeper, like a good keyboard's space bar */
  thock: (a, t) => {
    click(a, t, { freq: jitter(1300), q: 1.1, len: 0.03, vol: 0.07 });
    tone(a, t, { freq: jitter(190, 0.05), len: 0.05, vol: 0.035 });
  },
  /** the same key coming back up: the upstroke, higher and quieter than the press */
  up: (a, t) => click(a, t, { freq: jitter(3300), q: 1.8, len: 0.012, vol: 0.026 }),
  /** a big key coming back up: the space bar's lighter knock as it lands on top */
  upBig: (a, t) => {
    click(a, t, { freq: jitter(2100), q: 1.4, len: 0.016, vol: 0.03 });
    tone(a, t, { freq: jitter(300, 0.05), len: 0.03, vol: 0.012 });
  },
  /** a number stepped one notch: a ratchet click, brighter going up (`v` > 0) than down */
  notch: (a, t, o) => {
    const up = (o.v ?? 1) > 0;
    click(a, t, { freq: jitter(up ? 2900 : 2000, 0.04), q: 5, len: 0.012, vol: 0.075 });
    tone(a, t + 0.004, { freq: up ? 990 : 740, len: 0.03, vol: 0.011 });
  },
  /** link-style buttons: lighter and higher */
  soft: (a, t) => click(a, t, { freq: jitter(3400), q: 1.6, len: 0.012, vol: 0.035 }),
  /** a switch flipping: tick plus a little pitch, up for on and down for off */
  on: (a, t) => {
    click(a, t, { freq: 2600, len: 0.014, vol: 0.05 });
    tone(a, t + 0.005, { freq: 1180, len: 0.05, vol: 0.022 });
  },
  off: (a, t) => {
    click(a, t, { freq: 2000, len: 0.014, vol: 0.05 });
    tone(a, t + 0.005, { freq: 820, len: 0.05, vol: 0.022 });
  },
  /** clay chips knocking together: two or three bright clacks, never the same twice */
  chips: (a, t) => {
    const n = 2 + Math.round(Math.random());
    for (let i = 0; i < n; i++) clack(a, t + i * jitter(0.045, 0.35), 0.09 * (1 - i * 0.25), jitter(1, 0.06));
  },
  /** one chip, tapped: a clack and its own note */
  note: (a, t, o) => {
    const f = noteFor(o.value ?? 1);
    clack(a, t, 0.06, leanTo(f));
    mallet(a, t + 0.004, f, 0.028);
  },
  /** chips in a row, each on its own note: a sort, a set flipping over one by one */
  run: (a, t, o) => {
    (o.values ?? []).slice(0, 12).forEach((v, i) => {
      const f = noteFor(v);
      const at = t + i * (o.gap ?? 0.06);
      clack(a, at, 0.045, leanTo(f));
      mallet(a, at + 0.004, f, 0.02);
    });
  },
  /** a chip spun flat on the felt under the pointer: a flick, then it whirrs down */
  spin: (a, t, o) => {
    const f = noteFor(o.value ?? 1);
    click(a, t, { freq: 3600, q: 3, len: 0.012, vol: 0.02 });
    whirr(a, t + 0.01, { len: 0.8, freq: 2800 * leanTo(f), freq1: 900, rate: 24, rate1: 5, vol: 0.07 });
    tone(a, t + 0.02, { freq: f * 2, len: 0.45, vol: 0.005 });
  },
  /**
   * a chip flipped like a coin: the thumb's tink, a flutter through the air,
   * then it lands on its note and settles, each wobble quicker and quieter.
   * the landing is timed to the home page's flick (0.4s).
   */
  flip: (a, t, o) => {
    const f = noteFor(o.value ?? 1);
    click(a, t, { freq: 4200, q: 4, len: 0.014, vol: 0.05 });
    tone(a, t, { freq: f * 3, len: 0.07, vol: 0.01 });
    whirr(a, t + 0.03, { len: 0.32, freq: 1900, freq1: 1500, rate: 16, rate1: 11, q: 1.4, vol: 0.045 });
    const land = t + 0.4;
    clack(a, land, 0.08, leanTo(f));
    mallet(a, land + 0.004, f, 0.026);
    let at = land + 0.07;
    let gap = 0.05;
    for (let i = 0; i < 4; i++) {
      clack(a, at, 0.03 * (1 - i * 0.22), leanTo(f) * 1.05);
      at += gap;
      gap *= 0.68;
    }
  },
  /** every hero chip flipped in order: up the notes twice, a shower of chips, a bell */
  jackpot: (a, t, o) => {
    const vals = [...(o.values ?? [1, 5, 25, 100, 500])].sort((x, y) => x - y).slice(0, 8);
    const notes = [...vals.map(noteFor), ...vals.map((v) => noteFor(v) * 2)];
    notes.forEach((f, i) => mallet(a, t + i * 0.05, f, 0.022));
    const end = t + notes.length * 0.05;
    for (let i = 0; i < 16; i++) clack(a, end + Math.random() * 0.6, 0.02 + Math.random() * 0.045, jitter(1, 0.15));
    bell(a, end, 2093, 0.02);
    bell(a, end + 0.12, 2637, 0.018);
  },
  /**
   * a stack tapped: the chip shuffle. with `cut`, the top half is lifted off and
   * set down beside the rest first; then the chips riffle together one at a
   * time, and the stack is squared up with a flat knock.
   */
  stack: (a, t, o) => {
    const n = Math.max(3, Math.min(14, o.n ?? 8));
    const gap = o.gap ?? 0.024;
    const p = leanTo(noteFor(o.value ?? 1));
    if (o.cut) {
      click(a, t, { freq: 2600, q: 2, len: 0.012, vol: 0.03 }); // fingers on the edge
      clack(a, t + o.cut, 0.06, p * 0.9);
      clack(a, t + o.cut + 0.012, 0.035, p * 0.86);
    }
    let at = t + (o.lead ?? 0);
    for (let i = 0; i < n; i++) {
      clack(a, at, 0.05 * (0.7 + 0.3 * Math.sin((i / (n - 1)) * Math.PI)), p * (0.96 + (i / n) * 0.1));
      at += jitter(gap, 0.3);
    }
    click(a, at + 0.02, { freq: 900, q: 1, len: 0.04, vol: 0.05 });
  },
  /** a fresh deck: Deal It, the first hand, Run It Back */
  riffle: (a, t) => void riffle(a, t),
  /** drawing seats: shuffle up, then a card dealt to each seat */
  seats: (a, t, o) => {
    const down = riffle(a, t);
    for (let i = 0; i < Math.min(8, Math.max(2, o.n ?? 6)); i++) card(a, down + 0.1 + i * jitter(0.075, 0.1));
  },
  /** a card landing: a file dropped in to import */
  card: (a, t) => card(a, t),
  /** ship it: the pot raked over and stacked, then two bright notes for the winner */
  ship: (a, t) => {
    let at = t;
    for (let i = 0; i < 7; i++) {
      clack(a, at, 0.085 * (1 - i * 0.09));
      at += jitter(0.05 + i * 0.008, 0.4);
    }
    tone(a, at + 0.04, { freq: 1047, len: 0.1, vol: 0.03, type: "triangle" });
    tone(a, at + 0.12, { freq: 1319, len: 0.1, vol: 0.028, type: "triangle" });
    tone(a, at + 0.2, { freq: 1568, len: 0.26, vol: 0.026, type: "triangle" });
  },
  /** knocked out: the stack goes over, then a small, sorry womp womp */
  bust: (a, t) => {
    topple(a, t);
    tone(a, t + 0.36, { freq: 196, len: 0.16, vol: 0.022, type: "triangle" });
    sweep(a, t + 0.52, { from: 185, to: 160, len: 0.4, vol: 0.022, type: "triangle" });
  },
  /** taken back: a quick rewind chirp and the chip set down again */
  rewind: (a, t) => {
    sweep(a, t, { from: 320, to: 1300, len: 0.12, vol: 0.02, type: "triangle" });
    clack(a, t + 0.13, 0.06);
  },
  /** something went down hard: delete */
  thud: (a, t) => {
    click(a, t, { freq: 380, q: 0.8, len: 0.07, vol: 0.12 });
    tone(a, t, { freq: 110, len: 0.09, vol: 0.05 });
  },
  /** the clock stopping: a tape machine winding down */
  pause: (a, t) => {
    click(a, t, { freq: 1800, q: 1.4, len: 0.016, vol: 0.05 });
    sweep(a, t + 0.01, { from: 560, to: 150, len: 0.22, vol: 0.024, type: "triangle" });
  },
  /** and starting again: the tape getting up to speed */
  resume: (a, t) => {
    click(a, t, { freq: 2200, q: 1.4, len: 0.016, vol: 0.05 });
    sweep(a, t + 0.01, { from: 170, to: 600, len: 0.16, vol: 0.024, type: "triangle" });
  },
  /** the next level: a split-flap board clattering over to the new blinds */
  flap: (a, t) => {
    let at = t;
    for (let i = 0; i < 4; i++) {
      click(a, at, { freq: jitter(2500 - i * 150), q: 2, len: 0.012, vol: 0.08 * (1 - i * 0.15) });
      at += jitter(0.028, 0.15);
    }
    click(a, at + 0.02, { freq: jitter(1400), q: 1.6, len: 0.022, vol: 0.07 });
  },
  /** a level back: the same board, lower, turning the other way */
  flapBack: (a, t) => {
    let at = t;
    for (let i = 0; i < 3; i++) {
      click(a, at, { freq: jitter(1700 + i * 120), q: 2, len: 0.012, vol: 0.08 * (1 - i * 0.15) });
      at += jitter(0.03, 0.15);
    }
    click(a, at + 0.02, { freq: jitter(1100), q: 1.6, len: 0.022, vol: 0.07 });
  },
  /** a minute on: a kitchen timer wound forward, the ratchet climbing */
  wind: (a, t) => {
    for (let i = 0; i < 5; i++) click(a, t + i * 0.034, { freq: 1700 + i * 220, q: 5, len: 0.012, vol: 0.11 });
  },
  /** a minute off: the ratchet running back down */
  unwind: (a, t) => {
    for (let i = 0; i < 5; i++) click(a, t + i * 0.026, { freq: 2600 - i * 220, q: 5, len: 0.012, vol: 0.11 });
  },
  /** chips dropped through the slot into the rake box: a clack, then the hollow wooden box */
  drop: (a, t) => {
    clack(a, t, 0.07);
    clack(a, t + jitter(0.03, 0.3), 0.045, 0.94);
    click(a, t + 0.075, { freq: 700, q: 5, len: 0.06, vol: 0.07 });
    tone(a, t + 0.075, { freq: 260, len: 0.07, vol: 0.03 });
  },
  /** cashing out: a stack sliding into the rack, then the rack set down */
  rack: (a, t) => rack(a, t, 0.075),
  /** the bank balances: the till drawer rattles open and the bell rings */
  register: (a, t) => {
    for (let i = 0; i < 3; i++) click(a, t + i * 0.022, { freq: jitter(3000, 0.2), q: 3, len: 0.012, vol: 0.04 });
    click(a, t + 0.08, { freq: 600, q: 1.2, len: 0.05, vol: 0.06 });
    bell(a, t + 0.1, 2637, 0.022);
    bell(a, t + 0.19, 3136, 0.02);
  },
  /** locked: the shackle snapping home, a metal click on a heavy body */
  lock: (a, t) => {
    click(a, t, { freq: 5200, q: 8, len: 0.015, vol: 0.06 });
    click(a, t + 0.012, { freq: 3100, q: 6, len: 0.02, vol: 0.05 });
    click(a, t + 0.01, { freq: 500, q: 1, len: 0.05, vol: 0.08 });
    tone(a, t + 0.01, { freq: 140, len: 0.06, vol: 0.03 });
  },
  /** unlocked: the key turning, the shackle springing, two notes up */
  unlock: (a, t) => {
    click(a, t, { freq: 3400, q: 6, len: 0.015, vol: 0.05 });
    click(a, t + 0.05, { freq: 5000, q: 8, len: 0.012, vol: 0.045 });
    tone(a, t + 0.09, { freq: 784, len: 0.1, vol: 0.022, type: "triangle" });
    tone(a, t + 0.16, { freq: 1175, len: 0.2, vol: 0.02, type: "triangle" });
  },
  /** a menu or the command palette opening: a small pop up */
  open: (a, t) => {
    click(a, t, { freq: 3000, q: 1.6, len: 0.01, vol: 0.025 });
    sweep(a, t, { from: 380, to: 760, len: 0.07, vol: 0.02 });
  },
  /** and closing: the pop going back down */
  close: (a, t) => sweep(a, t, { from: 700, to: 360, len: 0.06, vol: 0.016 }),
  /** moving through a list: a tiny detent, higher near the top */
  tick: (a, t, o) => click(a, t, { freq: 3400 - Math.min(o.n ?? 0, 12) * 90, q: 3, len: 0.012, vol: 0.06 }),
  /** it worked: two soft rising notes */
  success: (a, t) => {
    tone(a, t, { freq: 1047, len: 0.09, vol: 0.028, type: "triangle" });
    tone(a, t + 0.075, { freq: 1568, len: 0.16, vol: 0.024, type: "triangle" });
  },
  /** it didn't: one low, short note */
  error: (a, t) => {
    tone(a, t, { freq: 330, len: 0.12, vol: 0.03, type: "triangle" });
    tone(a, t + 0.09, { freq: 262, len: 0.16, vol: 0.026, type: "triangle" });
  },
  /** the calculator's =: a round key, then the answer rings on the note of the chip its size */
  total: (a, t, o) => {
    click(a, t, { freq: jitter(1300), q: 1.1, len: 0.03, vol: 0.07 });
    mallet(a, t + 0.03, noteFor(Math.abs(o.value ?? 1)), 0.026);
  },
  /** something tossed across the screen hitting the edge: a hollow knock, harder the faster it came */
  knock: (a, t, o) => {
    const v = Math.min(1, o.v ?? 0.5);
    click(a, t, { freq: jitter(900), q: 1.4, len: 0.03, vol: 0.02 + 0.045 * v });
    tone(a, t, { freq: jitter(150, 0.05), len: 0.06, vol: 0.015 + 0.03 * v });
  },
  /** a key on the code pad */
  key: (a, t) => click(a, t, { freq: jitter(1700, 0.12), q: 2.2, len: 0.022, vol: 0.05 }),
  /** a thumb run along the home page's fanned hand: one card's edge, on its own note, higher to the right */
  strum: (a, t, o) => pluck(a, t, o.n ?? 0),
  /** every card in the hand face up: the thumb runs the whole fan */
  fanfare: (a, t) => {
    for (let i = 0; i < 5; i++) pluck(a, t + i * 0.05, i);
    pluck(a, t + 5 * 0.05 + 0.03, 7);
  },
  /** the hand squared up into a deck: the cards sliding together, then tapped square on the table */
  square: (a, t) => {
    for (let i = 0; i < 3; i++) card(a, t + i * jitter(0.035, 0.2), 0.7);
    click(a, t + 0.13, { freq: jitter(900), q: 1.1, len: 0.03, vol: 0.06 });
    tone(a, t + 0.13, { freq: jitter(170, 0.05), len: 0.05, vol: 0.025 });
  },
  /** the home page's bill counter spinning up: the motor, running for `n` bills */
  motor: (a, t, o) => {
    const len = (o.n ?? 10) * 0.055 + 0.2;
    sweep(a, t, { from: 90, to: 150, len: 0.12, vol: 0.02, type: "triangle" });
    whirr(a, t, { len, freq: 480, freq1: 560, rate: 90, rate1: 80, q: 1, vol: 0.022 });
  },
  /** one bill snapped through the counter's rollers */
  count: (a, t) => {
    click(a, t, { freq: jitter(2300, 0.2), q: 1.6, len: 0.01, vol: 0.035 });
    hiss(a, t, { from: 3200, to: 1800, len: 0.035, vol: 0.012 });
  },
  /** ten bills squared and banded: the paper snaps round, then the brick is set down */
  strap: (a, t) => {
    for (let i = 0; i < 3; i++) card(a, t + i * jitter(0.03, 0.2), 0.6);
    click(a, t + 0.12, { freq: 4800, q: 3, len: 0.012, vol: 0.05 });
    hiss(a, t + 0.12, { from: 2400, to: 5200, len: 0.08, vol: 0.018 });
    click(a, t + 0.34, { freq: jitter(620), q: 1, len: 0.04, vol: 0.08 });
    tone(a, t + 0.34, { freq: jitter(140, 0.05), len: 0.06, vol: 0.035 });
  },
  /** the batch is counted: the counter's beep */
  beep: (a, t) => tone(a, t, { freq: 2800, len: 0.09, vol: 0.016, type: "square" }),
  /** dice shaken in a cupped hand: a few bright knocks against each other */
  rattle: (a, t) => {
    for (let i = 0; i < 3; i++) click(a, t + i * jitter(0.022, 0.4), { freq: jitter(3100, 0.2), q: 4, len: 0.01, vol: 0.035 });
  },
  /** dice thrown down the felt: each hit shorter and softer than the last, two dice a hair apart */
  tumble: (a, t) => {
    [0.08, 0.26, 0.4, 0.5, 0.57].forEach((h, i) => {
      const v = 1 - i * 0.17;
      for (const off of [0, jitter(0.025, 0.5)]) {
        click(a, t + h + off, { freq: jitter(2700, 0.15), q: 3, len: 0.014, vol: 0.06 * v });
        click(a, t + h + off, { freq: jitter(850, 0.1), q: 1.2, len: 0.03, vol: 0.045 * v });
      }
    });
  },
  /** a stack of chips knocked over on the felt */
  topple: (a, t) => topple(a, t, 0.8),
  /** the roulette wheel set turning: a low, heavy hum that takes its time running down */
  wheel: (a, t, o) => {
    tone(a, t, { freq: jitter(120, 0.05), len: 0.09, vol: 0.03 });
    whirr(a, t, { len: o.len ?? 3, freq: 620, freq1: 240, rate: 9, rate1: 2, q: 1.3, vol: 0.013 });
  },
  /** the ball running round the bowl the other way: a bright roll, slowing and falling in pitch */
  roll: (a, t, o) => whirr(a, t, { len: o.len ?? 2.6, freq: 3800, freq1: 1400, rate: 34, rate1: 7, q: 1.1, vol: 0.016 }),
  /** the ball knocked off line by a diamond on the way down: a bright little ping */
  rim: (a, t) => {
    click(a, t, { freq: jitter(5400), q: 8, len: 0.016, vol: 0.07 });
    tone(a, t, { freq: jitter(3300, 0.05), len: 0.035, vol: 0.016, type: "triangle" });
  },
  /** the ball over a fret between two pockets: quick and light, `v` hard */
  fret: (a, t, o) => {
    const v = Math.max(0, Math.min(1, o.v ?? 0.5));
    click(a, t, { freq: jitter(4300, 0.12), q: 7, len: 0.012, vol: 0.015 + 0.055 * v });
    tone(a, t, { freq: jitter(2500, 0.1), len: 0.02, vol: 0.003 + 0.012 * v, type: "triangle" });
  },
  /** the ball comes to rest in its pocket */
  pocket: (a, t) => {
    click(a, t, { freq: jitter(1500), q: 1.3, len: 0.035, vol: 0.055 });
    tone(a, t, { freq: jitter(240, 0.04), len: 0.07, vol: 0.026 });
  },
  /** a light swipe for the theme changing */
  swish: (a, t) => {
    const src = a.createBufferSource();
    src.buffer = noiseBuffer(a);
    const f = a.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 0.9;
    f.frequency.setValueAtTime(700, t);
    f.frequency.exponentialRampToValueAtTime(4200, t + 0.22);
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.03, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    src.connect(f).connect(g).connect(out(a));
    src.start(t);
    src.stop(t + 0.28);
  },
} satisfies Record<string, Sound>;

export type UiSound = keyof typeof kit;

// the same sound twice in a frame is just louder; a few want a longer rest
const REST: Partial<Record<UiSound, number>> = { spin: 140, tick: 20, strum: 12, count: 25, rattle: 70, fret: 24, notch: 30 };
const lastPlayed: Partial<Record<UiSound, number>> = {};

// where the last press was, so a sound comes from that side of the screen
let pressX = -1;
let pressedAt = 0;
if (typeof window !== "undefined")
  addEventListener(
    "pointerdown",
    (e) => {
      pressX = e.clientX;
      pressedAt = performance.now();
    },
    { capture: true, passive: true },
  );

/** -0.35 (the left edge) to 0.35 (the right): a hint of a side, never a hard pan */
function sideOf(x?: number) {
  if (x === undefined) {
    x = pressX;
    // a key, not a pointer: wherever the focus is
    if (performance.now() - pressedAt > 600) {
      const r = (document.activeElement as HTMLElement | null)?.getBoundingClientRect?.();
      x = r?.width ? r.left + r.width / 2 : innerWidth / 2;
    }
  }
  return Math.max(-1, Math.min(1, (x / innerWidth) * 2 - 1)) * 0.35;
}

/** the interface's way in: a panner for this one sound, into the interface's volume */
function voice(a: AudioContext, x?: number): AudioNode {
  if (!a.createStereoPanner) return uiOut!;
  const p = a.createStereoPanner();
  p.pan.value = sideOf(x);
  p.connect(uiOut!);
  setTimeout(() => p.disconnect(), 4000);
  return p;
}

/** play an interface sound. no-op when sounds are off, the tab is hidden, or it just played */
export function play(name: UiSound, o: Opts = {}) {
  if (!settings.sounds || typeof window === "undefined" || document.hidden) return;
  const now = performance.now();
  if (now - (lastPlayed[name] ?? 0) < (REST[name] ?? 35)) return;
  lastPlayed[name] = now;
  try {
    const a = audio();
    bus = voice(a, o.x);
    (kit[name] as Sound)(a, a.currentTime + 0.001, o);
    restSoon();
  } catch {}
}

/** a range slider's detent: pitch follows the thumb, so dragging sounds like a ratchet */
let lastDetent = 0;
export function detent(fraction: number) {
  if (!settings.sounds || document.hidden) return;
  const now = performance.now();
  if (now - lastDetent < 28) return;
  lastDetent = now;
  try {
    const a = audio();
    bus = voice(a);
    const t = a.currentTime + 0.001;
    click(a, t, { freq: 1800 + fraction * 1800, q: 3, len: 0.01, vol: 0.03 });
    tone(a, t, { freq: 500 + fraction * 700, len: 0.02, vol: 0.012 });
    restSoon();
  } catch {}
}

/**
 * the tv reading something out to the room (web speech). browsers want a click
 * on the page first, same as sound; where it isn't supported it does nothing.
 */
export function speak(text: string, delay = 0) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  setTimeout(() => {
    try {
      // only a voice on this device: some browsers offer voices that send the
      // words (players' names, say) off to be spoken somewhere else
      const all = speechSynthesis.getVoices();
      const here = all.filter((v) => v.localService);
      if (all.length && !here.length) return;
      const u = new SpeechSynthesisUtterance(text);
      u.voice = here.find((v) => v.default) ?? here.find((v) => /^en\b/i.test(v.lang)) ?? here[0] ?? null;
      u.rate = 0.95;
      u.volume = Math.min(1, gainFor(prefs().tvVolume));
      speechSynthesis.speak(u);
    } catch {}
  }, delay);
}

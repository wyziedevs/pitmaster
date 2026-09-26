// the floating calculator's math (Calculator.svelte; where it sits is in
// calcbox.svelte.ts, so every page can open it without loading this). nothing
// here is ever saved. the tape and the position live in memory, so a
// reload wipes them and nothing typed into it touches storage.

export type Op = "+" | "−" | "×" | "÷";
type Tok = number | Op | "(" | ")";

/** the sum so far, the number being typed, and what came of it */
export const sum = $state({
  /** numbers, operators and brackets, as entered */
  toks: [] as Tok[],
  /** the number being typed, as typed ("12.", "-") */
  entry: "",
  /** how the entry reads in the sum when it isn't just its digits ("10%") */
  note: "",
  /** the sum that made the answer, as the tape prints it: "(200 + 10%) × 3 =" */
  said: "",
  /** = was just pressed: the answer sits in entry. a digit starts over, an operator carries on */
  done: false,
  error: "",
  /** = again repeats the last step: 5 + 3 = = = */
  again: null as { op: Op; n: number } | null,
  tape: [] as { expr: string; value: number }[],
});

// how each number in the sum read when typed (a % keeps its %), by its place in toks
let notes: Record<number, string> = {};

const MAX_DIGITS = 15;
const TOO_BIG = 1e15;
const MAX_DEPTH = 12;

/** hide float dust: 0.1 + 0.2 is 0.3 here */
const tidy = (n: number) => (n === 0 ? 0 : Number(n.toPrecision(12)));

export function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 10 });
}

/** the entry as it's being typed: commas in the whole part, the decimals as typed */
function fmtEntry(s: string) {
  if (s === "-") return "-";
  const neg = s.startsWith("-");
  const [whole, frac] = (neg ? s.slice(1) : s).split(".");
  const w = (whole || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "-" : "") + w + (frac !== undefined ? "." + frac : "");
}

const opOf: Record<string, Op> = { "+": "+", "-": "−", "−": "−", "*": "×", x: "×", "×": "×", "/": "÷", "÷": "÷" };
export const asOp = (k: string) => opOf[k] ?? null;
const isOp = (t: Tok | undefined): t is Op => t === "+" || t === "−" || t === "×" || t === "÷";
const last = () => sum.toks.at(-1);

function apply(a: number, op: Op, b: number) {
  if (op === "+") return a + b;
  if (op === "−") return a - b;
  if (op === "×") return a * b;
  if (b === 0) throw new Error("divide-by-zero");
  return a / b;
}

/** brackets still open */
export function openParens(toks: Tok[] = sum.toks) {
  let n = 0;
  for (const t of toks) n += t === "(" ? 1 : t === ")" ? -1 : 0;
  return n;
}

/** a sum as it could be worked out now: a trailing operator or bracket left off, open brackets closed */
function finished(input: Tok[]) {
  const t = [...input];
  while (t.length && (isOp(t.at(-1)) || t.at(-1) === "(")) t.pop();
  for (let open = openParens(t); open > 0; open--) t.push(")");
  return t;
}

/** brackets first, then × and ÷, then + and −, like on paper */
function evaluate(input: Tok[]) {
  const t = finished(input);
  if (!t.length) return 0;
  let i = 0;
  const factor = (): number => {
    const x = t[i++];
    if (x === "(") {
      const v = expr();
      i++; // its )
      return v;
    }
    if (typeof x === "number") return x;
    throw new Error("cant-work-out");
  };
  const term = () => {
    let v = factor();
    while (t[i] === "×" || t[i] === "÷") {
      const o = t[i++] as Op;
      v = apply(v, o, factor());
    }
    return v;
  };
  const expr = (): number => {
    let v = term();
    while (t[i] === "+" || t[i] === "−") {
      const o = t[i++] as Op;
      v = apply(v, o, term());
    }
    return v;
  };
  const v = tidy(expr());
  if (!Number.isFinite(v) || Math.abs(v) >= TOO_BIG) throw new Error("too-big");
  return v;
}

const entryValue = () => Number(sum.entry === "-" ? 0 : sum.entry) || 0;

/** a sum written out: "(20 + 5) × 8" */
function write(toks: Tok[], names: Record<number, string>, tail = "") {
  const parts = toks.map((t, i) => (typeof t === "number" ? (names[i] ?? fmt(t)) : t));
  if (tail) parts.push(tail);
  let out = "";
  for (const p of parts) out += !out || p === ")" || out.endsWith("(") ? p : " " + p;
  return out;
}

/** the sum as typed so far */
export const line = () => write(sum.toks, notes, sum.entry ? sum.note || fmtEntry(sum.entry) : "");

/** the big line: the whole sum as it's typed, or the answer */
export function shown() {
  if (sum.error) return sum.error;
  if (sum.done) return fmt(entryValue());
  return line() || "0";
}

/** everything typed, the entry included */
const all = (): Tok[] => (sum.entry && sum.entry !== "-" ? [...sum.toks, entryValue()] : [...sum.toks]);

/** what it comes to so far, once there's something to work out */
export function preview() {
  if (sum.done || sum.error) return null;
  const f = finished(all());
  if (!f.some(isOp) && !sum.note && !Object.keys(notes).length) return null;
  try {
    return evaluate(f);
  } catch {
    return null;
  }
}

/** the value on screen, for copying or putting in a box */
export function current() {
  if (sum.error) return null;
  if (sum.done) return entryValue();
  const p = preview();
  if (p !== null) return p;
  if (sum.entry) return entryValue();
  const n = sum.toks.findLast((t) => typeof t === "number");
  return typeof n === "number" ? n : 0;
}

/** the operator waiting for its next number, for lighting its key */
export const pendingOp = () => (!sum.entry && !sum.done && isOp(last()) ? (last() as Op) : null);

function fresh() {
  sum.toks = [];
  sum.entry = "";
  sum.note = "";
  sum.said = "";
  sum.done = false;
  sum.error = "";
  sum.again = null;
  notes = {};
}

/** the entry joins the sum */
function commit() {
  if (sum.note) notes[sum.toks.length] = sum.note;
  sum.toks.push(entryValue());
  sum.entry = "";
  sum.note = "";
}

export function digit(d: string) {
  if (sum.error || sum.done) fresh();
  if (sum.note) {
    sum.entry = "";
    sum.note = "";
  }
  // (2 + 3)4 is (2 + 3) × 4
  if (!sum.entry && last() === ")") sum.toks.push("×");
  const neg = sum.entry.startsWith("-");
  const body = neg ? sum.entry.slice(1) : sum.entry;
  if (body.replace(".", "").length >= MAX_DIGITS) return false;
  if (d === ".") {
    if (body.includes(".")) return false;
    sum.entry = (neg ? "-" : "") + (body || "0") + ".";
  } else sum.entry = (neg ? "-" : "") + (body === "0" ? d : body + d);
  return true;
}

export function op(o: Op) {
  if (sum.error) return false;
  if (sum.done) {
    // carry on from the answer
    const v = entryValue();
    fresh();
    sum.toks = [v, o];
    return true;
  }
  if (sum.entry === "-") sum.entry = "";
  if (sum.entry) {
    commit();
    sum.toks.push(o);
    return true;
  }
  const l = last();
  // changed their mind: 5 + × is 5 ×
  if (isOp(l)) sum.toks[sum.toks.length - 1] = o;
  // − to open a sum or a bracket starts a negative number
  else if (l === undefined || l === "(") {
    if (o === "−") sum.entry = "-";
    else if (l === undefined) sum.toks = [0, o];
    else return false;
  } else sum.toks.push(o);
  return true;
}

export function paren(p: "(" | ")") {
  if (sum.error) return false;
  if (p === "(") {
    if (sum.done) fresh();
    if (openParens() >= MAX_DEPTH) return false;
    // -( is -1 × (
    if (sum.entry === "-") {
      sum.entry = "";
      sum.toks.push(-1, "×");
    } else if (sum.entry) {
      commit();
      sum.toks.push("×"); // 5(2 + 3) is 5 × (2 + 3)
    } else if (typeof last() === "number" || last() === ")") sum.toks.push("×");
    sum.toks.push("(");
    return true;
  }
  if (sum.done || !openParens()) return false;
  if (sum.entry && sum.entry !== "-") commit();
  else if (last() === "(" || isOp(last())) return false;
  sum.toks.push(")");
  return true;
}

export function equals() {
  if (sum.error) return false;
  try {
    if (sum.done) {
      if (!sum.again) return false;
      const { op: o, n } = sum.again;
      const was = entryValue();
      const v = evaluate([was, o, n]);
      sum.said = `${fmt(was)} ${o} ${fmt(n)} =`;
      settle(v);
      return true;
    }
    const f = finished(all());
    const names = { ...notes };
    if (sum.entry && sum.note) names[sum.toks.length] = sum.note;
    // a lone number: nothing to work out
    if (!f.length || (f.length === 1 && !sum.note)) return false;
    const v = evaluate(f);
    const lastOp = f.at(-2);
    const n = f.at(-1);
    sum.again = isOp(lastOp) && typeof n === "number" ? { op: lastOp, n } : null;
    sum.said = `${write(f, names)} =`;
    sum.toks = [];
    notes = {};
    settle(v);
    return true;
  } catch (e) {
    sum.error = (e as Error).message;
    return false;
  }
}

function settle(v: number) {
  sum.entry = String(v);
  sum.note = "";
  sum.done = true;
  sum.tape = [{ expr: sum.said, value: v }, ...sum.tape].slice(0, 20);
}

/** C clears what's being typed, AC (nothing typed) the whole sum, and AC on a
 * clear screen tears off the tape */
export function clear() {
  if (sum.entry && !sum.done && !sum.error) {
    sum.entry = "";
    sum.note = "";
  } else if (!sum.entry && !sum.toks.length && !sum.error) sum.tape = [];
  else fresh();
}
export const clearsAll = () => !sum.entry || sum.done || !!sum.error;

export function back() {
  if (sum.error) return (fresh(), true);
  if (sum.done) {
    // the answer becomes a number to edit
    if (!/^-?\d+(\.\d+)?$/.test(sum.entry)) return false;
    sum.done = false;
    sum.said = "";
    sum.again = null;
  }
  if (sum.note) {
    sum.entry = "";
    sum.note = "";
    return true;
  }
  if (sum.entry) {
    sum.entry = sum.entry.slice(0, -1);
    return true;
  }
  if (!sum.toks.length) return false;
  // nothing typed: take the last operator or bracket back off, and the number before it comes back to edit
  sum.toks.pop();
  const n = last();
  if (typeof n === "number") {
    sum.toks.pop();
    sum.entry = String(n);
    delete notes[sum.toks.length];
  }
  return true;
}

export function negate() {
  if (sum.error) return false;
  if (sum.done) {
    const v = -entryValue();
    fresh();
    sum.entry = String(v);
    return true;
  }
  sum.note = "";
  if (sum.entry) {
    sum.entry = sum.entry === "-" ? "" : sum.entry.startsWith("-") ? sum.entry.slice(1) : "-" + sum.entry;
    return true;
  }
  // nothing typed: the next number will be negative
  if (last() === ")") return false;
  sum.entry = "-";
  return true;
}

/** 10% on its own is 0.1; after + or −, it's that much of what came before (200 + 10% is 220) */
export function percent() {
  if (sum.error) return false;
  if (sum.done) {
    const was = entryValue();
    fresh();
    sum.entry = String(tidy(was / 100));
    sum.note = `${fmt(was)}%`;
    return true;
  }
  if (!sum.entry || sum.entry === "-" || sum.note) return false;
  const p = entryValue();
  const lastOp = last();
  let v = p / 100;
  if (lastOp === "+" || lastOp === "−") {
    // what came before, inside the same bracket
    let j = sum.toks.length - 2;
    for (let depth = 0; j >= 0; j--) {
      const t = sum.toks[j];
      if (t === ")") depth++;
      else if (t === "(" && depth-- === 0) break;
    }
    try {
      v = evaluate(sum.toks.slice(j + 1, -1)) * (p / 100);
    } catch {
      return false;
    }
  }
  sum.note = `${fmtEntry(sum.entry)}%`;
  sum.entry = String(tidy(v));
  return true;
}

/** 25k is 25,000 and 1.5m is 1,500,000: tournament stacks without the zeros */
export function thousands(unit: "k" | "m") {
  if (sum.error) return false;
  const times = unit === "k" ? 1e3 : 1e6;
  if (sum.done) {
    const was = entryValue();
    fresh();
    sum.entry = String(tidy(was * times));
    sum.note = `${fmt(was)}${unit}`;
    return true;
  }
  if (!sum.entry || sum.entry === "-" || sum.note) return false;
  const v = tidy(entryValue() * times);
  if (Math.abs(v) >= TOO_BIG) return false;
  sum.note = `${fmtEntry(sum.entry)}${unit}`;
  sum.entry = String(v);
  return true;
}

/** a number from the tape, a paste, or a box on the page */
export function use(v: number) {
  if (!Number.isFinite(v)) return false;
  if (sum.done || sum.error) fresh();
  if (!sum.entry && last() === ")") sum.toks.push("×");
  sum.entry = String(tidy(v));
  sum.note = "";
  return true;
}

/** "$1,250.50" → 1250.5; anything that isn't one number is null */
export function parseNumber(text: string) {
  const s = text.trim().replace(/[\s,$€£¥]/g, "");
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  return Number(s);
}

/** a whole sum pasted in, "(20+5)*8", typed key by key. false if it isn't one */
export function feed(text: string) {
  const s = text.replace(/[\s,$€£¥=]/g, "");
  if (!s || !/^[\d.+\-−*/×÷x()%km]+$/i.test(s)) return false;
  for (const ch of s) {
    const o = asOp(ch);
    if (/[\d.]/.test(ch)) digit(ch);
    // written out, "2 × -3" is a negative number, not a change of mind
    else if (o === "−" && !sum.entry && isOp(last())) negate();
    else if (o) op(o);
    else if (ch === "(" || ch === ")") paren(ch);
    else if (ch === "%") percent();
    else if (/[km]/i.test(ch)) thousands(ch.toLowerCase() as "k" | "m");
  }
  return true;
}

/** a sum from the tape, back on the screen to change */
export function recall(expr: string) {
  fresh();
  return feed(expr);
}

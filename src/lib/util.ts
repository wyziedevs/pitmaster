import { prefs } from "./settings.svelte";

export const uid = () => Math.random().toString(36).slice(2, 9);

// one formatter per currency and cents/no-cents, made on first use
const formatters = new Map<string, Intl.NumberFormat>();
function formatter(currency: string, cents: boolean) {
  const key = currency + cents;
  let f = formatters.get(key);
  if (!f) {
    try {
      const digits = new Intl.NumberFormat("en-US", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
      f = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
        minimumFractionDigits: cents ? digits : 0,
        maximumFractionDigits: digits,
      });
    } catch {
      f = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: cents ? 2 : 0 });
    }
    formatters.set(key, f);
  }
  return f;
}

/** $0.25, $1, $1.50, $1,200 (or €, £, ¥… per the currency setting) */
export function money(n: number) {
  n = Number(n) || 0;
  const cents = Math.round(Math.abs(n) * 100) % 100 !== 0;
  return formatter(prefs().currency, cents).format(n);
}

/** just the symbol, for "Buy-In $" style labels */
export function currencySymbol() {
  return formatter(prefs().currency, false).formatToParts(0).find((p) => p.type === "currency")?.value ?? "$";
}

/** +$20 / -$15, for results */
export const signed = (n: number) => (n > 0.001 ? "+" : "") + money(n);

/** chip / blind amount: money for cash games, plain numbers for tournaments */
export function amt(n: number, isCash = false) {
  if (isCash) return money(n);
  n = Number(n) || 0;
  if (n >= 1e6) return +(n / 1e6).toFixed(2) + "M";
  if (n >= 1e4 && n % 1000 === 0) return n / 1000 + "K";
  return plainNum.format(n);
}
const plainNum = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/** mm:ss or h:mm:ss */
export function clock(ms: number) {
  const t = Math.ceil(Math.max(0, ms) / 1000);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const pad = (x: number) => String(x).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function duration(min: number) {
  min = Math.round(min);
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** 7:30 PM or 19:30, per the time setting */
export const timeOfDay = (ts: number) => (prefs().clock === "24h" ? time24 : time12).format(ts);
const time12 = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
const time24 = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: false });

const thisYear = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const otherYear = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Sep 25, or Sep 25, 2024 when it isn't this year */
export function day(ts: number) {
  const d = new Date(ts);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return (sameYear ? thisYear : otherYear).format(d);
}

export function ago(ts: number) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} hr ago`;
  return day(ts);
}

export const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
export const isMultiple = (x: number, unit: number) => unit > 0 && near(Math.round(x / unit) * unit, x);
export const round2 = (n: number) => Math.round(n * 100) / 100;

export function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export const SUITS = ["♠", "♥", "♦", "♣"] as const;

/** players are matched across games by name, ignoring case and spacing */
export const nameKey = (name: string) => name.trim().replace(/\s+/g, " ").toLowerCase();

/** rows to a csv file's text */
export function csv(rows: (string | number | null | undefined)[][]) {
  const cell = (v: string | number | null | undefined) => {
    let s = v === null || v === undefined ? "" : String(v);
    // text that starts like a formula (a player named "=HYPERLINK(…)") would
    // run when the file opens in a spreadsheet. a leading ' keeps it text.
    if (typeof v === "string" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(cell).join(",")).join("\n");
}

/** hand the browser a file to save */
export function download(name: string, text: string, type = "text/csv") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** the shortcut modifier as this computer labels it: ⌘ on a Mac, Ctrl elsewhere */
export const MOD = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";

export const fileSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "game";

/**
 * links that open a payment app with the amount filled in, one per handle the
 * person has saved. cash app and paypal.me take the amount in the path; venmo
 * takes it as a query.
 */
export function payLinks(h: { venmo?: string; cashapp?: string; paypal?: string } | null, amount: number, note = "Poker") {
  if (!h) return [];
  const n = round2(amount);
  const links: { label: string; handle: string; href: string }[] = [];
  if (h.venmo) links.push({ label: "Venmo", handle: `@${h.venmo}`, href: `https://venmo.com/${encodeURIComponent(h.venmo)}?txn=pay&amount=${n}&note=${encodeURIComponent(note)}` });
  if (h.cashapp) links.push({ label: "Cash App", handle: `$${h.cashapp}`, href: `https://cash.app/$${encodeURIComponent(h.cashapp)}/${n}` });
  if (h.paypal) links.push({ label: "PayPal", handle: `paypal.me/${h.paypal}`, href: `https://paypal.me/${encodeURIComponent(h.paypal)}/${n}${encodeURIComponent(prefs().currency)}` });
  return links;
}

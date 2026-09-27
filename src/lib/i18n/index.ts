// the runtime side of i18n: t() and tp() read whichever of these dictionaries
// matches settings.language, falling back to English for a key that language
// hasn't got. each namespace file is typed against its own English shape, so
// a language missing a key is a build error there, not a silent blank here.
import { settings as appSettings } from "../settings.svelte";
import { LANG_CODES, type Lang } from "./langs";
import { common } from "./common";
import { gameEvents } from "./gameEvents";
import { nav } from "./nav";
import { toys } from "./toys";
import { calculator } from "./calculator";
import { money } from "./money";
import { chips } from "./chips";
import { gameSetup } from "./gameSetup";
import { gamePlay } from "./gamePlay";
import { players } from "./players";
import { tv } from "./tv";
import { legal } from "./legal";
import { settings } from "./settings";
import { util } from "./util";
import { casino } from "./casino";

const ALL = { common, gameEvents, nav, toys, calculator, money, chips, gameSetup, gamePlay, players, tv, legal, settings, util, casino } as const;

/** the language in force right now, guarded against a stale or hand-edited save */
export const lang = (): Lang => ((LANG_CODES as string[]).includes(appSettings.language) ? (appSettings.language as Lang) : "en");

function get(root: unknown, parts: string[]): unknown {
  let cur = root;
  for (const k of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

function lookup(path: string): unknown {
  const [ns, ...rest] = path.split(".");
  const dict = (ALL as Record<string, unknown>)[ns];
  if (!dict) return undefined;
  const l = lang();
  const here = get((dict as Record<Lang, unknown>)[l], rest);
  if (here !== undefined) return here;
  return l === "en" ? undefined : get((dict as Record<Lang, unknown>).en, rest);
}

function fill(s: string, params?: Record<string, string | number>): string {
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (whole, k: string) => (Object.hasOwn(params, k) ? String(params[k]) : whole));
}

/** a string for the current language, falling back to English, then to the key itself */
export function t(path: string, params?: Record<string, string | number>): string {
  const val = lookup(path);
  if (typeof val !== "string") {
    if (typeof window !== "undefined") console.warn(`i18n: missing key "${path}"`);
    return path;
  }
  return fill(val, params);
}

const pluralRules = new Map<Lang, Intl.PluralRules>();
function rulesFor(l: Lang) {
  let r = pluralRules.get(l);
  if (!r) pluralRules.set(l, (r = new Intl.PluralRules(l)));
  return r;
}

/** a string picked by count (via Intl.PluralRules, so every language's own plural rules apply), with {count} and any extra params filled in */
export function tp(path: string, count: number, params?: Record<string, string | number>): string {
  const node = lookup(path);
  if (!node || typeof node !== "object") {
    if (typeof window !== "undefined") console.warn(`i18n: missing plural key "${path}"`);
    return path;
  }
  const forms = node as Record<string, string>;
  const category = rulesFor(lang()).select(count);
  const str = forms[category] ?? forms.other;
  if (typeof str !== "string") return path;
  return fill(str, { ...params, count });
}

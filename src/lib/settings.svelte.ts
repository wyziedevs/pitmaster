// per-browser preferences. kept apart from the game data (store.ts) so a backup
// restore or a wipe never flips someone's theme. encrypted like the games,
// except the theme, motion and language, which app.html reads before the page paints.
import type { BountyKind, CashRake, HostPrefs } from "./types";
import { DEFAULT_PALETTE_KEY } from "./keys";
import { onSaved, readSlot, save } from "./vault";
import { detectLanguage, isRtl } from "./i18n/langs";

export type Theme = "system" | "light" | "dark";

export interface Settings {
  theme: Theme;
  sounds: boolean; // quiet clicks under buttons, toggles and chip actions
  volume: number; // interface sounds, 0 to 100 (70 = as designed)
  tvVolume: number; // the tv's alarms, ticks and announcer, 0 to 100
  motion: "system" | "reduced"; // reduced = no animation, whatever the computer says
  autoLock: number; // with a passcode: seconds without input before it locks, 0 = only when closed
  paletteKey: string; // what opens Commands, like "Mod+K" (see keys.ts)
  intro: boolean; // show How It Works on the home page (until Don't Show Again)
  toys: boolean; // the desk toys on the home page (cards, dice, the wheel...)
  language: string; // an ISO code from i18n/langs.ts; guessed from the browser on the first visit
  currency: string;
  clock: "12h" | "24h";
  levelWarning: number; // minutes before a level ends, 0 = off
  tvSound: boolean;
  tvAwake: boolean;
  tvVoice: boolean;
  tvMoney: boolean;

  // ---- what this host's games use. each is its own switch, so any game,
  // whatever its size, takes exactly the parts it needs ----
  useRake: boolean; // cash games: a cut of each pot, or a seat fee
  useHouseCut: boolean; // tournaments: a flat fee or a % out of each buy-in
  useBounties: boolean; // bounties and knockout credit
  useRebuys: boolean; // rebuys and add-ons
  useSeats: boolean; // seat draw and table balancing
  useDeals: boolean; // the final-table deal calculator
  usePayLinks: boolean; // venmo / cash app / paypal links in settle-up
  useBombPots: boolean; // cash games: bomb pots, called by hand or on a timer
  useSevenTwo: boolean; // cash games: winning with 7-2 collects from everyone
  useHighHand: boolean; // cash games: a prize for the best hand in each stretch of play
  useCosts: boolean; // split what was bought for the game in settle-up
  useLedger: boolean; // tick off settle-up payments, and see who still owes whom on Players
  useSatellites: boolean; // tournaments whose prizes are seats in another game
  useShootouts: boolean; // tournaments where each table plays down to one winner
  useBrackets: boolean; // tournaments played as heads-up matches, winner moves on
  useVariants: boolean; // other poker games: omaha, stud, draw, mixed games and dealer's choice
  useWaitlist: boolean; // cash games: a list of who's next for a seat
  useLeagues: boolean; // seasons that score the games linked to them, on Players and the tv

  // ---- the house ----
  houseRules: string; // one per line
  rulesOnNew: boolean; // start every new game's notes with them
  houseName: string; // who rake and fees are paid to in settle-up

  // ---- new game defaults (flat, so a setting added later still gets its default) ----
  tBuyIn: number;
  tStack: number; // 0 = fit it to the chip set
  tPlayers: number;
  tHours: number;
  tLevel: number;
  tDepth: number; // starting stack in big blinds at level 1
  tBreakEvery: number; // levels between breaks, 0 = none
  tBreakMinutes: number;
  tAnteFrom: number; // 0 = no antes
  tLateReg: number; // late registration through this level
  tRebuy: boolean;
  tRebuyUntil: number;
  tAddOn: boolean;
  tAddOnCost: number;
  tBounty: number; // 0 = none
  tBountyKind: BountyKind; // flat, progressive (PKO) or mystery
  tPayouts: string; // "50, 30, 20"; blank = by how many play
  tRakePct: number;
  tFee: number;
  payoutRound: number;
  cashDepth: number; // standard cash buy-in, in big blinds
  cashMinBB: number;
  cashMaxBB: number;
  cashHours: number;
  cashStraddle: boolean;
  cashRakeMode: CashRake["mode"];
  cashRakePct: number;
  cashRakeCap: number;
  cashSeatFee: number;
  cashBombBB: number; // a bomb pot's ante, in big blinds
  cashBombEvery: number; // minutes between bomb pots, 0 = only when called
  cashBombDouble: boolean;
  cashSevenTwoBB: number; // what a 7-2 win collects from each player, in big blinds
  cashHighHandPrize: number;
  cashHighHandEvery: number; // minutes in each high hand window, 0 = one for the whole game
  seatsPerTable: number;
}

export const LOOK_KEY = "pitmaster.look"; // theme and motion, readable (the rest is in the vault)

const defaults: Settings = {
  theme: "system",
  sounds: true,
  volume: 70,
  tvVolume: 70,
  language: "en",
  currency: "USD",
  clock: "12h",
  levelWarning: 1,
  tvSound: true,
  tvAwake: true,
  tvVoice: false,
  tvMoney: true,
  motion: "system",
  autoLock: 300,
  paletteKey: DEFAULT_PALETTE_KEY,
  intro: true,
  toys: true,

  useRake: false,
  useHouseCut: false,
  useBounties: true,
  useRebuys: true,
  useSeats: true,
  useDeals: true,
  usePayLinks: true,
  useBombPots: false,
  useSevenTwo: false,
  useHighHand: false,
  useCosts: false,
  useLedger: false,
  useSatellites: false,
  useShootouts: false,
  useBrackets: false,
  useVariants: false,
  useWaitlist: false,
  useLeagues: false,

  houseRules: "",
  rulesOnNew: true,
  houseName: "The House",

  tBuyIn: 20,
  tStack: 0,
  tPlayers: 8,
  tHours: 3,
  tLevel: 20,
  tDepth: 100,
  tBreakEvery: 4,
  tBreakMinutes: 10,
  tAnteFrom: 0,
  tLateReg: 4,
  tRebuy: true,
  tRebuyUntil: 4,
  tAddOn: false,
  tAddOnCost: 10,
  tBounty: 0,
  tBountyKind: "flat",
  tPayouts: "",
  tRakePct: 0,
  tFee: 0,
  payoutRound: 1,
  cashDepth: 100,
  cashMinBB: 40,
  cashMaxBB: 200,
  cashHours: 4,
  cashStraddle: true,
  cashRakeMode: "none",
  cashRakePct: 5,
  cashRakeCap: 3,
  cashSeatFee: 5,
  cashBombBB: 2,
  cashBombEvery: 0,
  cashBombDouble: false,
  cashSevenTwoBB: 2,
  cashHighHandPrize: 50,
  cashHighHandEvery: 60,
  seatsPerTable: 9,
};

/** the house rules as a list */
export const houseRules = () =>
  settings.houseRules
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);

/** the theme, motion and language, the only settings kept readable */
function look(): Partial<Settings> {
  try {
    const { theme, motion, language } = JSON.parse(localStorage.getItem(LOOK_KEY) ?? "{}");
    return { ...(theme && { theme }), ...(motion && { motion }), ...(language && { language }) };
  } catch {
    return {};
  }
}

const firstLook = look();
// first visit, no language picked yet: guess from the browser instead of defaulting to English
export const settings = $state<Settings>({
  ...defaults,
  ...firstLook,
  ...(firstLook.language ? {} : { language: detectLanguage() }),
});

/** decrypt the rest of the settings, once the vault's open */
export async function openSettings(key: CryptoKey) {
  try {
    const saved = await readSlot("settings", key);
    if (saved) Object.assign(settings, JSON.parse(saved), look());
  } catch {} // unreadable: the defaults stand, and the next save replaces it
  applyTheme();
  applyLang();
}

/** the settings as text, for sealing under a new key */
export const settingsText = () => JSON.stringify(settings);

// another tab changed a setting
onSaved("settings", (t) => {
  Object.assign(settings, JSON.parse(t), look());
  applyTheme();
  applyLang();
});

export function saveSettings() {
  try {
    localStorage.setItem(LOOK_KEY, JSON.stringify({ theme: settings.theme, motion: settings.motion, language: settings.language }));
  } catch {}
  save("settings", JSON.stringify(settings));
  applyTheme();
  applyLang();
}

// how this screen looks and sounds is its own business: an imported backup
// brings the house rules, money and defaults, but not these
const THIS_SCREEN: (keyof Settings)[] = ["theme", "motion", "language", "sounds", "volume", "paletteKey", "autoLock", "intro"];

/** take on the settings from another device's backup (unknown or mistyped keys are skipped) */
export function adoptSettings(from: Record<string, unknown>) {
  for (const k of Object.keys(defaults) as (keyof Settings)[]) {
    if (THIS_SCREEN.includes(k) || typeof from[k] !== typeof defaults[k]) continue;
    (settings as unknown as Record<string, unknown>)[k] = from[k];
  }
  if (!["flat", "progressive", "mystery"].includes(settings.tBountyKind)) settings.tBountyKind = "flat";
  saveSettings();
}

// app.html sets data-theme before first paint; this keeps it in sync after that
const darkQuery = typeof window !== "undefined" ? matchMedia("(prefers-color-scheme: dark)") : null;

export const resolvedTheme = () =>
  settings.theme === "system" ? (darkQuery?.matches ? "dark" : "light") : settings.theme;

export function applyTheme() {
  if (!darkQuery) return;
  const root = document.documentElement;
  root.dataset.theme = resolvedTheme();
  // the browser's bar follows, as app.html set it
  const bar = root.dataset.theme === "dark" ? "#151515" : "#fdfdfd";
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => (m.content = bar));
  // motion.ts and app.css read this alongside prefers-reduced-motion
  if (settings.motion === "reduced") document.documentElement.dataset.motion = "reduced";
  else delete document.documentElement.dataset.motion;
}

darkQuery?.addEventListener("change", applyTheme);

// app.html guesses this from the browser before first paint; this keeps it in
// sync once the real setting is known (a passcode's LockScreen, then the app)
export function applyLang() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.lang = settings.language;
  root.dir = isRtl(settings.language) ? "rtl" : "ltr";
}

// ---------- what the host picked, as the tv sees it ----------
// a tv on another device has its own (probably untouched) settings. the host's
// currency, clock and warning ride along on each snapshot and win over them.
export const hostPrefs = $state<{ current: HostPrefs | null }>({ current: null });

export const myPrefs = (): HostPrefs => ({
  currency: settings.currency,
  clock: settings.clock,
  levelWarning: settings.levelWarning,
  tvSound: settings.tvSound,
  tvAwake: settings.tvAwake,
  tvVoice: settings.tvVoice,
  tvMoney: settings.tvMoney,
  tvVolume: settings.tvVolume,
});

/** the prefs in force on this screen: the host's on a remote tv, otherwise ours */
export const prefs = (): HostPrefs => hostPrefs.current ?? myPrefs();

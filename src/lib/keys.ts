// keyboard shortcuts the host can rebind. a shortcut is saved as text like
// "Mod+K" or "Mod+Shift+P": Mod is ⌘ on a Mac and Ctrl everywhere else, so the
// default works on both. recording and matching both go through comboOf, so a
// shortcut always matches the keys that made it.

export const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export const DEFAULT_PALETTE_KEY = "Mod+K";

const MODIFIER_KEYS = ["Control", "Meta", "Alt", "Shift", "AltGraph", "CapsLock", "Fn", "FnLock", "OS", "Hyper", "Super"];

/** the key itself. letters and digits go by what's printed on them; with Alt
 *  held a Mac types ˚ for K, so those fall back to the key's spot */
function keyName(e: KeyboardEvent) {
  if (e.key.length === 1 && /[a-z0-9]/i.test(e.key)) return e.key.toUpperCase();
  const spot = /^(?:Key([A-Z])|Digit(\d))$/.exec(e.code);
  if (spot) return spot[1] ?? spot[2];
  if (e.key === " ") return "Space";
  return e.key;
}

/** the modifiers held down, in a fixed order */
function held(e: KeyboardEvent) {
  const mods: string[] = [];
  if (IS_MAC ? e.metaKey : e.ctrlKey) mods.push("Mod");
  if (IS_MAC && e.ctrlKey) mods.push("Ctrl");
  if (!IS_MAC && e.metaKey) mods.push("Win");
  if (e.altKey) mods.push("Alt");
  if (e.shiftKey) mods.push("Shift");
  return mods;
}

/** the shortcut a key press makes, or "" while only modifiers are down */
export function comboOf(e: KeyboardEvent) {
  if (!e.key || MODIFIER_KEYS.includes(e.key)) return "";
  return [...held(e), keyName(e)].join("+");
}

/** just the modifiers, for showing what's held while recording ("Ctrl Shift") */
export const heldLabel = (e: KeyboardEvent) => keyLabel(held(e).join("+"));

/** does this shortcut hold a key that isn't typing (Ctrl, ⌘, Alt)? */
export const hasModifier = (combo: string) => /(^|\+)(Mod|Ctrl|Alt)\+/.test(combo);

const NAMES: Record<string, string> = {
  Mod: IS_MAC ? "⌘" : "Ctrl",
  Ctrl: "⌃",
  Alt: IS_MAC ? "⌥" : "Alt",
  Shift: IS_MAC ? "⇧" : "Shift",
  Win: "Win",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Escape: "Esc",
};

/** how a shortcut reads on screen: "Ctrl K", "⌘ ⇧ P", "/" */
export const keyLabel = (combo: string) =>
  combo
    .split("+")
    .filter(Boolean)
    .map((p) => NAMES[p] ?? p)
    .join(" ");

/** the shortcuts that can't be changed, for Settings and Help (KeyList.svelte).
 *  keys are written the way keyLabel writes them, so Kbd.svelte draws the arrows */
export const FIXED_KEYS: [string, string][] = [
  ["C", "Open the Calculator (Any Page)"],
  ["Space", "Start or Pause the Clock (Dealer Screen)"],
  [`${NAMES.ArrowLeft} ${NAMES.ArrowRight}`, "Previous or Next Level (Dealer Screen)"],
  [`${keyLabel("Mod")} Z`, "Undo the Last Change (Dealer Screen)"],
  ["F", "Full Screen (TV)"],
  ["S", "Sound On or Off (TV)"],
];

/** true when the key press is going into something that takes typing */
export function typingIn(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el?.tagName) return false;
  if (el.isContentEditable || el.tagName === "TEXTAREA" || el.tagName === "SELECT") return true;
  return el.tagName === "INPUT" && !["checkbox", "radio", "button", "submit", "range", "color", "file"].includes((el as HTMLInputElement).type);
}

// with Ctrl / ⌘ these belong to the browser (a page can't have them) or to
// editing, and ⌘/Ctrl Z is undo on the dealer screen
const TAKEN: Record<string, string> = {
  Z: "undo",
  Y: "redo",
  C: "copy",
  V: "paste",
  X: "cut",
  A: "select all",
  W: "closing the tab",
  T: "a new tab",
  N: "a new window",
  Q: "quitting the browser",
  R: "reloading the page",
};

/** why a shortcut won't work, or "" if it's fine */
export function keyProblem(combo: string) {
  const parts = combo.split("+");
  const key = parts.at(-1) ?? "";
  if (parts.includes("Win")) return "The Windows key belongs to Windows. Try Ctrl or Alt instead.";
  if (["F5", "F11", "F12"].includes(key)) return `The browser uses ${key}. Pick another.`;
  if (!hasModifier(combo)) {
    // a key on its own only fires outside text boxes, so it can't be one you type with or tab around on
    const plain = /^(F\d{1,2}|[^\p{L}\p{N}\s])$/u.test(key) && key !== "Space";
    if (!plain) return "On its own that key is for typing or moving around. Hold Ctrl or Alt with it, or pick a key like / or F2.";
    return "";
  }
  if (parts.includes("Mod") && TAKEN[key]) return `${keyLabel(`Mod+${key}`)} is for ${TAKEN[key]}. Pick another.`;
  return "";
}

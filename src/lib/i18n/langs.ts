// the 8 languages, by total speakers worldwide (native + second language).
// `native` is what each language calls itself, for the picker in Settings.
export const LANGS = [
  { code: "en", name: "English", native: "English", rtl: false },
  { code: "zh", name: "Chinese", native: "中文", rtl: false },
  { code: "hi", name: "Hindi", native: "हिन्दी", rtl: false },
  { code: "es", name: "Spanish", native: "Español", rtl: false },
  { code: "fr", name: "French", native: "Français", rtl: false },
  { code: "ar", name: "Arabic", native: "العربية", rtl: true },
  { code: "bn", name: "Bengali", native: "বাংলা", rtl: false },
  { code: "pt", name: "Portuguese", native: "Português", rtl: false },
] as const;

export type Lang = (typeof LANGS)[number]["code"];

export const LANG_CODES = LANGS.map((l) => l.code) as Lang[];

export const isLang = (x: string): x is Lang => (LANG_CODES as string[]).includes(x);

export const isRtl = (code: string) => LANGS.find((l) => l.code === code)?.rtl ?? false;

/** best supported match for a browser's language list; "en" if none fit */
export function detectLanguage(): Lang {
  if (typeof navigator === "undefined") return "en";
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of tags) {
    const base = tag?.slice(0, 2).toLowerCase();
    if (base && isLang(base)) return base;
  }
  return "en";
}

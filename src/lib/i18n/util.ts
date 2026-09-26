// the handful of user-facing phrases util.ts itself produces (relative
// times). everything else there is either a symbol (¥, $), a raw number, or
// runs through Intl, so this is the whole of what it needs translated.
import type { Lang } from "./langs";

interface Plural {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

export interface UtilDict {
  justNow: string;
  minutesAgo: Plural;
  hoursAgo: Plural;
}

export const util: Record<Lang, UtilDict> = {
  en: {
    justNow: "just now",
    minutesAgo: { one: "{count} min ago", other: "{count} min ago" },
    hoursAgo: { one: "{count} hr ago", other: "{count} hr ago" },
  },
  zh: {
    justNow: "刚刚",
    minutesAgo: { other: "{count} 分钟前" },
    hoursAgo: { other: "{count} 小时前" },
  },
  hi: {
    justNow: "अभी-अभी",
    minutesAgo: { one: "{count} मिनट पहले", other: "{count} मिनट पहले" },
    hoursAgo: { one: "{count} घंटे पहले", other: "{count} घंटे पहले" },
  },
  es: {
    justNow: "justo ahora",
    minutesAgo: { one: "hace {count} min", other: "hace {count} min" },
    hoursAgo: { one: "hace {count} h", other: "hace {count} h" },
  },
  fr: {
    justNow: "à l'instant",
    minutesAgo: { one: "il y a {count} min", other: "il y a {count} min" },
    hoursAgo: { one: "il y a {count} h", other: "il y a {count} h" },
  },
  ar: {
    justNow: "الآن",
    minutesAgo: {
      zero: "منذ أقل من دقيقة",
      one: "منذ دقيقة",
      two: "منذ دقيقتين",
      few: "منذ {count} دقائق",
      many: "منذ {count} دقيقة",
      other: "منذ {count} دقيقة",
    },
    hoursAgo: {
      zero: "منذ أقل من ساعة",
      one: "منذ ساعة",
      two: "منذ ساعتين",
      few: "منذ {count} ساعات",
      many: "منذ {count} ساعة",
      other: "منذ {count} ساعة",
    },
  },
  bn: {
    justNow: "এইমাত্র",
    minutesAgo: { other: "{count} মিনিট আগে" },
    hoursAgo: { other: "{count} ঘণ্টা আগে" },
  },
  pt: {
    justNow: "agora mesmo",
    minutesAgo: { one: "há {count} min", other: "há {count} min" },
    hoursAgo: { one: "há {count} h", other: "há {count} h" },
  },
};

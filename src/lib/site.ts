// where the site lives and what search engines and link previews see for each
// page. the app draws itself in the browser (ssr is off), so hooks.server.ts
// writes these into the page before it's sent: crawlers and chat apps that
// never run the app still get a real title, description and canonical address.
// the tab title after that comes from each page's own <svelte:head>, so keep
// the titles here matching those.
export const SITE = "https://pitmaster.cc";
/** where the code is, public under the MIT license */
export const REPO = "https://github.com/wyziedevs/pitmaster";
export const NAME = "PitMaster";
export const HOME_TITLE = "PitMaster · Poker Blind Clock & Game Manager";
const DESCRIPTION =
  "Run a poker game of any size: blind clocks, chip math, buy-ins, payouts and a live TV display. Free, no account, encrypted on your device.";

/** `path` is the page's canonical address; null keeps it out of search (it's someone's own data, or nothing) */
type Meta = { title: string; description: string; path: string | null };

export function metaFor(route: string | null, url: URL): Meta {
  switch (route) {
    case "/":
      return { title: HOME_TITLE, description: DESCRIPTION, path: "/" };
    case "/new":
      return url.searchParams.get("type") === "tournament"
        ? {
            title: "New Tournament · PitMaster",
            description:
              "Build a poker tournament blind structure sized to your time: starting stacks, breaks, antes, rebuys, bounties and payouts, for any number of players.",
            path: "/new?type=tournament",
          }
        : {
            title: "New Cash Game · PitMaster",
            description:
              "Set up a poker cash game: blinds, buy-in range, rake or seat fees, chips per buy-in, and a settle-up with pay links when it's over.",
            path: "/new?type=cash",
          };
    case "/live":
      return {
        title: "Put a Poker Game on Any TV · PitMaster",
        description:
          "Put a PitMaster game on any TV, tablet or phone: type the 8-character code from the host's screen. The game is end-to-end encrypted on the way.",
        path: "/live",
      };
    case "/help":
      return {
        title: "Help · PitMaster",
        description:
          "How to run a poker cash game or tournament with PitMaster: chip sets, blind clocks, the TV display, the calculator, shortcuts and where your data lives.",
        path: "/help",
      };
    case "/privacy":
      return {
        title: "Privacy · PitMaster",
        description:
          "What PitMaster keeps and where: no accounts, no tracking, games encrypted on your device, and how TV codes stay end-to-end encrypted on the way.",
        path: "/privacy",
      };
    case "/terms":
      return {
        title: "Terms of Use · PitMaster",
        description:
          "The terms for using PitMaster, a free poker blind clock and game manager from Wyzie LLC: running a legal game, your data, checking the math and liability.",
        path: "/terms",
      };
    case "/players":
      return { title: "Players · PitMaster", description: DESCRIPTION, path: null };
    case "/settings":
      return { title: "Settings · PitMaster", description: DESCRIPTION, path: null };
    case "/game/[id]":
    case "/game/[id]/tv":
    case "/tv":
    case "/cup":
      return { title: NAME, description: DESCRIPTION, path: null };
    default:
      return { title: "Page Not Found · PitMaster", description: DESCRIPTION, path: null };
  }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** who makes it, for search engines: the home page says so in schema.org terms */
const LD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://wyzie.io/#organization", name: "Wyzie LLC", url: "https://wyzie.io" },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      name: NAME,
      url: `${SITE}/`,
      inLanguage: "en",
      publisher: { "@id": "https://wyzie.io/#organization" },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE}/#app`,
      name: NAME,
      inLanguage: "en",
      url: `${SITE}/`,
      description: DESCRIPTION,
      image: `${SITE}/og.png`,
      applicationCategory: "GameApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      license: "https://opensource.org/license/mit",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": "https://wyzie.io/#organization" },
    },
    {
      "@type": "SoftwareSourceCode",
      name: NAME,
      codeRepository: REPO,
      programmingLanguage: ["TypeScript", "Svelte"],
      license: "https://opensource.org/license/mit",
      targetProduct: { "@id": `${SITE}/#app` },
      publisher: { "@id": "https://wyzie.io/#organization" },
    },
  ],
}).replace(/</g, "\\u003c");

/** the page's own tags, for the <!--pitmaster:head--> spot in app.html */
export function headFor(route: string | null, url: URL): string {
  const m = metaFor(route, url);
  const at = SITE + (m.path ?? url.pathname);
  return [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    m.path ? `<link rel="canonical" href="${esc(at)}" />` : `<meta name="robots" content="noindex" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${esc(at)}" />`,
    route === "/" ? `<script type="application/ld+json">${LD}</script>` : "",
  ].join("\n    ");
}

// every page passes through here: the one real address, the page's own title
// and description for search engines and link previews (site.ts), and the rest
// of the security headers. the content security policy comes from
// svelte.config.js, so sveltekit can put its nonce in it.
import type { Handle } from "@sveltejs/kit";
import { SITE, headFor } from "$lib/site";

/** other names for the site, sent on to the real one (each has to be a custom domain on the pages project to get here) */
const MOVED = new Set(["www.pitmaster.cc", "pitmaster.pages.dev"]);

export const handle: Handle = async ({ event, resolve }) => {
  const { host, pathname, search } = event.url;
  if (MOVED.has(host)) return new Response(null, { status: 301, headers: { Location: SITE + pathname + search } });

  const head = headFor(event.route.id, event.url);
  const res = await resolve(event, { transformPageChunk: ({ html }) => html.replace("<!--pitmaster:head-->", head) });
  const h = res.headers;
  h.set("X-Content-Type-Options", "nosniff");
  // no other site can frame a page (the csp says so too; this covers older browsers)
  h.set("X-Frame-Options", "DENY");
  h.set("Cross-Origin-Resource-Policy", "same-origin");
  // tv links carry the code after the #, which is never sent anyway; this also keeps page paths to ourselves
  h.set("Referrer-Policy", "no-referrer");
  h.set("Cross-Origin-Opener-Policy", "same-origin");
  // wake lock, fullscreen and the clipboard stay on for this site: the tv and copy buttons use them
  h.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), hid=(), bluetooth=(), midi=(), display-capture=(), browsing-topics=()"
  );
  if (event.url.protocol === "https:") h.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  // preview deployments (abc123.pitmaster.pages.dev) stay out of search
  if (host.endsWith(".pages.dev")) h.set("X-Robots-Tag", "noindex");
  return res;
};

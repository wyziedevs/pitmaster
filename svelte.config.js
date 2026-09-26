import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { loadEnv } from "vite";

// the api's origin, so the content security policy lets the tv code calls through
// (in dev it's the same origin, through vite's proxy)
const api = loadEnv("production", process.cwd(), "VITE_").VITE_API_URL;

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    // only this site's own scripts run (sveltekit's inline ones get a fresh
    // nonce per page), and the page can only talk to this site and the api.
    // styles allow inline because svelte sets style attributes.
    csp: {
      mode: "auto",
      directives: {
        "default-src": ["self"],
        "script-src": ["self"],
        "style-src": ["self", "unsafe-inline"],
        "img-src": ["self", "data:", "blob:"],
        "font-src": ["self"],
        "connect-src": ["self", ...(api ? [new URL(api).origin] : [])],
        "media-src": ["self", "data:", "blob:"],
        "object-src": ["none"],
        "frame-src": ["none"],
        // the service worker (src/service-worker.ts), for loads with no network
        "worker-src": ["self"],
        "manifest-src": ["self"],
        "base-uri": ["self"],
        "form-action": ["self"],
        "frame-ancestors": ["none"],
      },
    },
  },
};

export default config;

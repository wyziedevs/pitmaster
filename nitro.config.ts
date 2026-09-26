import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  preset: "cloudflare-module",
  srcDir: "server",
  compatibilityDate: "2025-01-01",
  // matches compatibility_flags in wrangler.api.toml (nitro would otherwise
  // look for it in wrangler.toml, which is the site's)
  cloudflare: { nodeCompat: true },
  // live game snapshots for the tv view, encrypted before they arrive. KV in
  // prod (which Cloudflare also encrypts at rest), a local folder in dev.
  storage: {
    live: { driver: "cloudflare-kv-binding", binding: "LIVE" },
  },
  devStorage: {
    live: { driver: "fs", base: "./.data/live" },
  },
  // every answer, the 404s and 429s too (which sites may read them is
  // middleware/cors.ts)
  routeRules: {
    "/**": {
      headers: {
        "Cache-Control": "no-store",
        // it only ever answers with json, so nothing it sends may run, be framed or sniffed
        "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        // nothing here is a page: keep it out of search
        "X-Robots-Tag": "noindex",
      },
    },
  },
});

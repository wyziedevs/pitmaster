import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    // same-origin /api in dev. the dev server only answers this computer; to
    // try a tv or phone, point an https tunnel at it (see README). vite turns
    // away hostnames it doesn't know, so cloudflare's quick tunnels are let in
    // by name (cloudflare hands those out, so no one can aim one at this computer).
    // (ws: the live screens' websockets go the same way)
    proxy: { "/api": { target: "http://localhost:3001", ws: true } },
    allowedHosts: [".trycloudflare.com"],
  },
});

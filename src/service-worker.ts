/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
// the site keeps working with no connection once it's been opened here:
// game night wifi drops, the page reloads, and the game is still there (it
// was always in this browser). the app's own files are kept, one copy per
// version, and a page that can't reach the network gets the last copy of it.
// nothing saved passes through here (that's in IndexedDB, encrypted) and
// nothing from the api is ever kept.
import { build, files, version } from "$service-worker";

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `pitmaster-${version}`;
// the app and its icons; not what only crawlers, link previews and security researchers read
const ASSETS = [...build, ...files.filter((f) => !/\/(og\.png|robots\.txt|sitemap\.xml)$|\/\.well-known\//.test(f))];
const KEEP = new Set(ASSETS);
// the pages kept for a load with no network. any other address (a game, a tv
// screen) gets the home page's copy: the app finds its own way from there
const PAGES = new Set(["/", "/new", "/players", "/settings", "/live", "/tv", "/help", "/privacy", "/terms"]);

sw.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

// a new version takes over once every tab of the old one is closed, so an open
// tab never has its files swapped out from under it. then the old copies go
sw.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
});

sw.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== sw.location.origin) return;

  // the app's files never change under one name: from the copy, at once
  if (KEEP.has(url.pathname)) {
    e.respondWith(caches.match(url.pathname).then((hit) => hit ?? fetch(req)));
    return;
  }

  // a page: the network first, so a new version shows the moment it's out;
  // the last good copy when the network isn't there
  if (req.mode === "navigate") {
    const key = PAGES.has(url.pathname) ? url.pathname : "/";
    e.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        try {
          const res = await fetch(req);
          if (res.ok && PAGES.has(url.pathname)) cache.put(key, res.clone());
          return res;
        } catch {
          return (await cache.match(key)) ?? (await cache.match("/")) ?? Response.error();
        }
      })(),
    );
  }
});

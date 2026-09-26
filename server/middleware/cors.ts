// cors: the site and the api live on different addresses in prod (pitmaster.cc
// and api.pitmaster.cc), so browsers ask first. only the site itself, its
// preview deployments and a copy running on this computer get an answer that
// lets them read; any other site's page is turned away by the browser.
// (the dev server needs none of this: vite proxies /api on the same address.)
const SITE = /^(https:\/\/(pitmaster\.cc|([a-z0-9-]+\.)?pitmaster\.pages\.dev)|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/;

export default defineEventHandler((event) => {
  const origin = getRequestHeader(event, "origin");
  appendResponseHeader(event, "Vary", "Origin");
  // set first, so it rides on every answer: the 404s and 429s too
  if (origin && SITE.test(origin)) setResponseHeader(event, "Access-Control-Allow-Origin", origin);
  if (event.method !== "OPTIONS") return;
  setResponseHeaders(event, {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Live-Key",
    "Access-Control-Max-Age": "86400",
  });
  setResponseStatus(event, 204);
  return "";
});

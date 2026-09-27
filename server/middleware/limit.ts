// speed limits on the tv relay, per address, per minute (see utils/limit.ts)
export default defineEventHandler((event) => {
  if (!event.path.startsWith("/api/live") || event.method === "OPTIONS") return;
  slowDown(event, "any");
  count(event, "any");
  // an address that's been guessing codes or keys gets nothing more this minute
  slowDown(event, "miss");
  if (event.method === "POST") {
    slowDown(event, "new");
    count(event, "new");
  }
});

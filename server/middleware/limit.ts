// speed limits on the tv relay, per address, per minute (see utils/limit.ts)
export default defineEventHandler((event) => {
  if (!event.path.startsWith("/api/live") || event.method === "OPTIONS") return;
  // a room full of tvs behind one address polls every 2 seconds each
  slowDown(event, "any", 3000);
  count(event, "any");
  // wrong codes and wrong keys: this is what guessing looks like
  slowDown(event, "miss", 120);
  if (event.method === "POST") {
    slowDown(event, "new", 20);
    count(event, "new");
  }
});

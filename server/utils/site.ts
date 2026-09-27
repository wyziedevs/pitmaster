// the site's own pages: pitmaster.cc, its preview deployments, and a copy
// running on this computer. only these may read the api (middleware/cors.ts)
// or open a websocket to it (routes/api/live/socket.ts).
const SITE = /^(https:\/\/(pitmaster\.cc|([a-z0-9-]+\.)?pitmaster\.pages\.dev)|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/;

export const isSite = (origin: string | null | undefined): origin is string => !!origin && SITE.test(origin);

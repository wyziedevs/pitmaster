// on cloudflare every screen's websocket lives in one durable object, so a
// write that should reach them (a snapshot, a phone's mailbox, stop sharing)
// is handed to that object to run, where it can push to them. reads stay out
// here. (in dev there's one process, so there's nothing to hand over.)
export default defineEventHandler(async (event) => {
  const cf = event.context.cloudflare as { durable?: unknown; durableFetch?: (req?: Request) => Promise<Response>; request?: Request } | undefined;
  if (!cf?.durableFetch || cf.durable || !event.path.startsWith("/api/live") || !["PUT", "DELETE"].includes(event.method)) return;
  const body = await readRawBody(event, false);
  const req = new Request(getRequestURL(event), { method: event.method, headers: getRequestHeaders(event) as HeadersInit, body: body ?? undefined });
  return cf.durableFetch(req);
});

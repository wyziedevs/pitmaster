// on cloudflare every screen's websocket lives in one durable object, so a
// write that should reach them (a snapshot, a phone's mailbox, stop sharing)
// is handed to that object to run, where it can push to them. reads stay out
// here. (in dev there's one process, so there's nothing to hand over.)
export default defineEventHandler(async (event) => {
  const cf = event.context.cloudflare as { durable?: unknown; durableFetch?: (req?: Request) => Promise<Response>; request?: Request } | undefined;
  if (!cf?.durableFetch || cf.durable || !event.path.startsWith("/api/live") || !["PUT", "DELETE"].includes(event.method)) return;
  // turned away out here when it's too big, before it's read into memory
  if (Number(getHeader(event, "content-length") || 0) > MAX_BODY) throw createError({ statusCode: 413, statusMessage: "too big" });
  const body = await readRawBody(event, false);
  if (body && body.byteLength > MAX_BODY) throw createError({ statusCode: 413, statusMessage: "too big" });
  const req = new Request(getRequestURL(event), { method: event.method, headers: getRequestHeaders(event) as HeadersInit, body: body ?? undefined });
  return cf.durableFetch(req);
});

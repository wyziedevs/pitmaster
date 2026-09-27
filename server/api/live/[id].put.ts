// the host pushes the latest snapshot, sealed in their browser. needs the write
// key. (the host's own websocket does the same, faster: see routes/api/live/socket.ts)
export default defineEventHandler(async (event) => {
  const id = liveId(event);
  const { data } = await smallBody<{ data: string }>(event);
  const { at } = orThrow(await putSnapshot(event, id, getHeader(event, "x-live-key"), data));
  return { ok: true, updatedAt: at };
});

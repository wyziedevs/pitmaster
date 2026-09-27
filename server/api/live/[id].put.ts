// the host pushes the latest snapshot, sealed in their browser. needs the write
// key. (the host's own websocket does the same, faster: see routes/api/live/socket.ts)
export default defineEventHandler(async (event) => {
  const id = liveId(event);
  const rec = await ownLive(event, id);
  const { data } = await smallBody<{ data: string }>(event);
  if (!isSealed(data)) throw createError({ statusCode: 400, statusMessage: "missing game" });

  const updatedAt = Date.now();
  await putLive(id, { ...rec, data, updatedAt });
  // screens following over a websocket hear it now
  push(event, id, { t: "snap", id, data, at: updatedAt });
  return { ok: true, updatedAt };
});

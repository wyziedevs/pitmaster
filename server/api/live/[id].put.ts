// the host pushes the latest snapshot, sealed in their browser. needs the write key.
export default defineEventHandler(async (event) => {
  const id = liveId(event);
  const rec = await ownLive(event, id);
  const { data } = await smallBody<{ data: string }>(event);
  if (!isSealed(data)) throw createError({ statusCode: 400, statusMessage: "missing game" });

  const updatedAt = Date.now();
  await putLive(id, { ...rec, data, updatedAt });
  return { ok: true, updatedAt };
});

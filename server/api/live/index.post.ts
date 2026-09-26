// start a live session. the browser made the code and sends only the id made
// from it, plus a write key, which is stored hashed.
export default defineEventHandler(async (event) => {
  const { id, key } = await smallBody<{ id: string; key: string }>(event);
  if (typeof id !== "string" || !/^[0-9a-f]{32}$/.test(id) || !isKey(key)) {
    throw createError({ statusCode: 400, statusMessage: "bad id or key" });
  }
  if (await liveStorage().hasItem(id)) throw createError({ statusCode: 409, statusMessage: "code taken" });
  await putLive(id, { keyHash: await hashKey(key), data: null, updatedAt: Date.now() });
  setResponseStatus(event, 201);
  return { ok: true };
});

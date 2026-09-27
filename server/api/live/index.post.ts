// start a live session. the browser made the code and sends only the id made
// from it, plus a write key, which is stored hashed.
export default defineEventHandler(async (event) => {
  const { id, key } = await smallBody<{ id: string; key: string }>(event);
  orThrow(await startLive(id, key));
  setResponseStatus(event, 201);
  return { ok: true };
});

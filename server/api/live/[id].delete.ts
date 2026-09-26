// stop sharing: the game goes now, not two days from its last update. needs the
// write key. a blank record keeps the code taken until it would have expired.
export default defineEventHandler(async (event) => {
  const id = liveId(event);
  await ownLive(event, id);
  await putLive(id, { keyHash: "", data: null, updatedAt: Date.now() });
  return { ok: true };
});

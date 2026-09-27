// stop sharing: the game goes now, not two days from its last update. needs the
// write key. a blank record keeps the code taken until it would have expired.
export default defineEventHandler(async (event) => {
  orThrow(await stopLive(event, liveId(event), getHeader(event, "x-live-key")));
  return { ok: true };
});

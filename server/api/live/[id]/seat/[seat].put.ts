// a phone writes to its own mailbox: its hash for the round, then its numbers,
// sealed with the game's key on the phone. needs that seat's own key, which the
// host gave only that phone.
export default defineEventHandler(async (event) => {
  const id = liveId(event);
  const { data } = await smallBody<{ data: string }>(event);
  const { at } = orThrow(await putSeatMail(event, id, getRouterParam(event, "seat"), getHeader(event, "x-seat-key"), data));
  return { ok: true, updatedAt: at };
});

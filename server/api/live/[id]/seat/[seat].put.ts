// a phone writes to its own mailbox: its hash for the round, then its numbers,
// sealed with the game's key on the phone. needs that seat's own key, which the
// host gave only that phone.
export default defineEventHandler(async (event) => {
  const id = liveId(event);
  const seat = getRouterParam(event, "seat") ?? "";
  const rec = await liveStorage().getItem(id);
  if (!rec) throw missing(event);
  if (!rec.keyHash) throw stopped();
  if (!(await ownSeat(id, seat, getHeader(event, "x-seat-key")))) throw missing(event, 403);
  const { data } = await smallBody<{ data: string }>(event);
  if (!isMail(data)) throw createError({ statusCode: 400, statusMessage: "missing mail" });
  const mail = await putMail(id, seat, data);
  push(event, id, { t: "seat", id, seat, data: mail.data, at: mail.updatedAt });
  return { ok: true, updatedAt: mail.updatedAt };
});

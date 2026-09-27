// phones as dice cups: the host says which seats may write to their own
// mailbox, by the sha-256 of each seat's key (the keys never come here). needs
// the host's write key.
export default defineEventHandler(async (event) => {
  const id = liveId(event);
  await ownLive(event, id);
  const { seats } = await smallBody<{ seats: Record<string, string> }>(event);
  if (!isSeats(seats)) throw createError({ statusCode: 400, statusMessage: "bad seats" });
  await putSeats(id, seats);
  return { ok: true };
});

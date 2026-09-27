// every seat's mailbox for a game, for a screen that can't hold a websocket.
// all sealed: without the game's code there's nothing here to read.
export default defineEventHandler(async (event) => {
  const id = liveId(event);
  const rec = await liveStorage().getItem(id);
  if (!rec) throw missing(event);
  if (!rec.keyHash) throw stopped();
  return { mail: await allMail(id) };
});

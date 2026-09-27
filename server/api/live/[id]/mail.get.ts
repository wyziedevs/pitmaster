// every seat's mailbox for a game, for a screen that can't hold a websocket.
// all sealed: without the game's code there's nothing here to read.
export default defineEventHandler(async (event) => {
  const { mail } = orThrow(await readLive(event, liveId(event), true));
  return { mail };
});

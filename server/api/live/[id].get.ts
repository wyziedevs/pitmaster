// the tv polls this. ?since=<updatedAt> returns { changed: false } when nothing's new.
export default defineEventHandler(async (event) => {
  const rec = await liveStorage().getItem(liveId(event));
  if (!rec) throw missing(event);
  if (!rec.keyHash) throw stopped();

  const since = Number(getQuery(event).since || 0);
  if (since && rec.updatedAt <= since) return { changed: false, updatedAt: rec.updatedAt };
  return { changed: true, updatedAt: rec.updatedAt, data: rec.data };
});

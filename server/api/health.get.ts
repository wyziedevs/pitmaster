export default defineEventHandler(() => {
  return {
    status: "ok",
    message: "pitmaster api is alive",
    timestamp: new Date().toISOString(),
  };
});

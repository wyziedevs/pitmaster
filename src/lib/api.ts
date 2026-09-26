// dev: vite proxies /api to nitro on :3001, so relative urls work (through a tunnel too).
// prod: VITE_API_URL from .env.production (https://api.pitmaster.cc). to point a build
// somewhere else, set it in .env.production.local, which stays out of git.
export const API: string = import.meta.env.VITE_API_URL ?? "";

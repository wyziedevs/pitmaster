// what goes up and down the relay's websocket (src/lib/socket.ts here, and
// server/routes/api/live/socket.ts there). only ids, write keys and
// ciphertext: everything in `data` was sealed in a browser.

/** a write that waits on the relay's answer: {t:"ok"} or {t:"err"}, with the same `n` */
export type Ask =
  | { t: "put"; id: string; key: string; data: string }
  | { t: "seats"; id: string; key: string; seats: Record<string, string> }
  | { t: "seat"; id: string; seat: string; key: string; data: string };

/** from a screen to the relay */
export type ClientMsg = { t: "follow"; id: string } | { t: "unfollow"; id: string } | (Ask & { n: number });

/** from the relay to a screen. a refused write's err carries the http status it would have got */
export type ServerMsg =
  | { t: "snap"; id: string; data: string; at: number }
  | { t: "seat"; id: string; seat: string; data: string; at: number }
  | { t: "none"; id: string }
  | { t: "gone"; id: string }
  | { t: "ok"; id: string; at?: number; n?: number }
  | { t: "err"; why: string; id?: string; n?: number; status?: number };

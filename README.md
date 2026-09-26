# PitMaster

live at [pitmaster.cc](https://pitmaster.cc). made by [Wyzie LLC](https://wyzie.io), open source under the [MIT license](LICENSE).

run a poker game of any size, from a kitchen table to a room full of tables: pick your chips, set blinds / buy-ins / length, run cash games or tournaments, and put a live view on the tv. no accounts, and everything it keeps is encrypted.

built on the [SCeNT stack](https://github.com/wyziedevs/SCeNT): **S**velteKit + **C**loudflare + **N**itro + **T**ypeScript.

## run it

```bash
pnpm install
pnpm run dev
```

- app: http://localhost:5173
- api (nitro): http://localhost:3001, proxied at `/api` by vite
- a tv or phone on another device needs **https**: browsers only offer WebCrypto on secure pages (and `localhost`), and without it the tv can't unlock the game and nothing gets saved. to try it in dev, open a tunnel (`cloudflared tunnel --url http://localhost:5173`) and use its https url on both screens. the dev server itself only answers this computer. a tv window on the same computer works anywhere.

## what's in it

| page | what |
| --- | --- |
| `/` | games in progress (live level / time left) + past games: search by game or player, filter by type, run it back. on a visit, a welcome with the four steps from nothing to a game on the tv, until the host picks **don't show this again** (saved, encrypted, with the settings) |
| `/help` | the same four steps for good, plus running a game, the tv, the calculator, every shortcut and where your data lives. open while locked, and in the sitemap |
| `/players` | leaderboard across every game: net, cash vs tournament, $/hr, wins, ITM %, knockouts, best result. filter by period and type, sort any column, open a player for their game-by-game history and their venmo / cash app / paypal handles (settle-up and payouts turn them into pay links with the amount filled in), export csv |
| `/settings` | six tabs down the left (the tab rides in the url #): **your game**: each piece is its own switch, so any game takes exactly the parts it needs: a cash game rake (a cut of each pot or a seat fee, and who it's paid to), a tournament house cut (flat fee and/or %), and the extras (bounties & knockouts, rebuys & add-ons, seat draw & tables, final table deals, pay links). anything off is gone from new games and the dealer screen, a new game can still add it just for that game, and a game that already uses one keeps it. theme, interface sounds and their volume, motion (system / reduced), currency, 12 / 24-hour time. **the house**: your house rules (one per line, common ones one click away; they start every new game and take turns on the tv). **new game defaults**: tournaments (buy-in, players, starting stack or auto, depth, length, level length, breaks, antes, late reg, rebuys / add-on, bounty, payout percentages, payout rounding), cash games (min / standard / max buy-in in big blinds, length, straddles), seats per table. level warning, templates. **chip sets**: the editor: design (Monte Carlo / Casino Del Sol / basic), colors, values, counts. comes with common starter sets (Monte Carlo 500 low stakes and standard, Casino Del Sol 500, a 1000-chip tournament set, basic dice chips); mark the ones you own. pick the default, reset the built-in sets. tv: sound on start, tv volume, keep awake, announcer (reads blinds, breaks, busts and the winner out loud), money on the tv. **export & import**: everything in one file (settings optional, password optional), import by picking or dropping a file (add to what's here, newer copy of a game wins, or replace everything), delete everything. language is saved for when translations arrive. |
| `/new?type=cash` | blinds, buy-in range, session length, straddles, rake (a cut of each pot into a rake box, or a seat fee, paid to the house or to a player), chips per buy-in, "how many buy-ins does my set cover". house rules, regulars one click away. save the setup as a template or load one. |
| `/new?type=tournament` | buy-in, starting stack, target length → auto blind structure (breaks, antes, color-ups, overtime levels), rebuys, add-on, late reg, bounties, payouts rounded to $1 / $5 / $10 / $20, house cut (flat fee per entry and/or a %). `&template=` loads a template, `&from=<game id>` copies an old game to tweak |
| `/privacy`, `/terms` | privacy policy and terms of use, written for a side project with no accounts and no database. update them whenever data handling changes |
| `/game/:id` | dealer screen. clock controls (`space`, `←` `→`), bust / rebuy / add-on, knockout credit, seat draw + table balancing, final-table deal calculator (icm / chip chop), bubble / in-the-money callouts, cash buy-ins + rake box + chip-count cash-outs + settle-up (rake and seat fees paid to the house, pay links), message the tv, undo (`ctrl z`), copy recap, csv, run it back, move this game to another device (a one-game export file) |
| `/game/:id/tv` | tv view, same computer (drag the window to the tv over hdmi, press `f`) |
| `/live` → `/tv#CODE` | tv view on any device: host hits **go live**, tv types the 6-character code. the code rides after the `#`, so it's never sent to a server. it shows the host's currency, time format and warning, not its own |

**`ctrl k` / `⌘ k` anywhere** (rebind it in settings > keyboard; stored as text like `Mod+K`, see `src/lib/keys.ts`) opens the command palette: jump to a page or game, start from a template, and on the dealer screen do anything by name ("bust mike", "next level", "add player", "cash out jess", "undo").

## how the data works

- everything lives in the host's browser, encrypted (see **security** below). no accounts.
- moving to another device is a file: settings > export & import writes `{ pitmaster: 1, kind, exportedAt, data, settings? }` (`kind` is `everything`, or `game` for one game with its chip set and its players' pay links). with a password it's `{ pitmaster: 1, kind, exportedAt, locked: { salt, rounds, data } }`. import merges by id (a game's newer `updatedAt` wins; nothing is deleted) or replaces everything. a live game's tv code and key come along, so the tv keeps working when the laptop takes over. imported settings skip this screen's theme, motion and interface sound.
- player stats aren't stored. `/players` works them out from the saved games every time, matching players by name (case and spacing ignored), so fixing a game fixes the leaderboard. a tournament counts once it has a winner; a cash player counts once they cash out.
- clocks are stored as an anchor (`status`, `levelIndex`, `levelElapsedMs`, `anchorAt`). every screen works out the live time itself, so the tv keeps ticking even if the dealer tab closes.
- same-computer tv syncs instantly over `BroadcastChannel`. other tabs of the app pick up each other's saves from the `storage` event.
- **go live**: the browser draws a 6-character code and derives an `id` and an AES key from it (PBKDF2, 200k rounds). it `POST`s `{ id, key }` to `/api/live` (the write key is stored hashed), `PUT`s sealed snapshots to `/api/live/:id` with `X-Live-Key`, and **stop sharing** `DELETE`s it. the tv derives the same id and key from the code and polls `GET /api/live/:id?since=`. stored in Cloudflare KV (a local `.data/` folder in dev); expires 2 days after the last update.

## security

- **on the device** (`src/lib/vault.ts`): games, chip sets, templates, pay links and settings are sealed with AES-256-GCM (gzipped first) and kept in IndexedDB (`pitmaster-vault`) next to the key that seals them: `keeper` (the key, non-extractable, with a random `kid`), `data` and `settings` (both `pm1.<z|p>.<iv>.<ciphertext>`). a new key and everything sealed with it are written in one transaction, and every save checks, in its own transaction, that it's still using the current key; a tab that isn't reloads. only `pitmaster.look` (theme and motion, read by `app.html` before first paint), `pitmaster.exported` (a timestamp) and `pitmaster.tries` (wrong passcode count) are plain, in `localStorage`. the store decrypts once, when the app opens or is unlocked, and keeps plaintext in memory only.
- what that does and doesn't cover without a passcode: the key lives in the same browser profile as the data, so it protects against anything that gets the saved data without the key (like someone browsing the site's storage in devtools), not against someone who can use the browser or copies the whole profile. the privacy page says so; keep it that way.
- **passcode lock** (`src/lib/lock.svelte.ts`, settings > passcode lock): the key is kept wrapped by a key made from the passcode (PBKDF2-SHA256, 600k rounds, `wrapKey`/`unwrapKey`, so the raw key never reaches javascript). setting, changing or removing it re-seals everything under a new key. it's one lock per browser: locking reloads every app tab so nothing unlocked stays in memory, unlocking one tab hands the key to the others over `BroadcastChannel`, and a new tab asks an unlocked one for it. auto-lock (30 s to 1 h, or only when closed) counts input in every tab. after 5 wrong tries each try waits longer, up to 15 minutes. forgetting it means deleting everything.
- **tv windows never lock and never hold the key**: with a passcode on, `/game/:id/tv` asks an unlocked tab for its game over `BroadcastChannel` and gets the same snapshot every change sends, and waits while everything's locked. `/tv`, `/live`, `/help`, `/privacy` and `/terms` stay open too (nothing saved is on them). tv screens have no command palette and nothing that edits.
- **no WebCrypto** (plain http): nothing is saved and the app says so. **key gone** (site data half-cleared): the app says the data can't be opened and never overwrites it until the host chooses to start fresh.
- **tv codes**: end-to-end encrypted. the server only sees an id derived from the code, a sealed snapshot and a SHA-256 of the write key. snapshots leave out the log, the code and the key. codes use `crypto.getRandomValues` (31 characters, 6 long, about 887 million).
- **export files**: optional password (8 characters or more), PBKDF2-SHA256 600k rounds to an AES-256-GCM key.
- **anything from outside** (an imported file, a tv snapshot) goes through `src/lib/check.ts` first: every field the app reads has to be the right type, ids have to be safe in a url and chip colors have to be hex. a file that fails is turned away whole. imports are capped at 50 MB.
- **spreadsheets**: text that starts like a formula (`=`, `+`, `-`, `@`) gets a leading `'` in csv downloads, so a player's name can't run in Excel or Sheets.
- **names as keys**: pay links are keyed by player name in objects with no prototype, so a player called `constructor` or `__proto__` is just a name.
- **the site**: a strict content security policy from `svelte.config.js` (scripts only from this origin, with a per-request nonce for sveltekit's inline ones; `connect-src` is the site plus `VITE_API_URL`), and `src/hooks.server.ts` adds HSTS, `nosniff`, `no-referrer`, COOP and a permissions policy. `_headers` (in the project root; the adapter copies it) covers the static files.
- **the api**: only answers browsers on pitmaster.cc, its preview deployments and `localhost` (`server/middleware/cors.ts`). it validates ids, keys and sealed payloads, caps bodies at 1 MB, compares key hashes in constant time, and answers with `default-src 'none'`, `nosniff` and HSTS. stop sharing leaves a blank record (no game, no key hash) until the code would have expired, so no one else can claim it and put something on a tv that still has it open (it answers `410`, and the tv stops asking).
- **speed limits** (`server/middleware/limit.ts`): per address per minute, 20 new codes, 120 wrong codes or keys (past that, everything from that address waits out the minute) and 3,000 requests in all. counted in memory for a minute and never stored or logged. each worker instance counts on its own, so this is a speed bump; the real guard is a cloudflare rate limiting rule (security > waf > rate limiting rules) on `/api/live`, e.g. 300 requests per 10 seconds per ip.
- **kv's one write a second per key**: the host spaces a code's writes at least 1.1 s apart (newest wins), retries busy or failed ones with backoff, and stop sharing waits for any write in flight and retries until the copy is gone.
- **dependencies**: run `pnpm audit` before deploying, and keep it at zero.
- in production, turn on **Always Use HTTPS** for any custom domain in cloudflare.

## code map

```
src/lib/
  types.ts        all the shapes
  chips.ts        presets, chip splitting (distribute), stack math
  blinds.ts       structure generator, color-ups, payouts
  clock.ts        pure clock math (derive / start / pause / jump)
  game.ts         new game, bust, rebuy, knockouts, bounties, deals, seats + table balancing, rerun, cash stats, settle-up
  stats.ts        per-game results and the all-time leaderboard
  report.ts       the plain-text recap and per-game csv
  deal.ts         icm and chip-chop math
  commands.svelte.ts  the command palette's registry (pages add their own commands)
  calc.svelte.ts  the floating calculator (C anywhere): brackets, till-style %, the answers so far. never saved
  crypto.ts       all the encryption: sealing, keys, the passcode's key wrap, tv code keys, export passwords
  vault.ts        IndexedDB: the key and everything sealed with it, saved together; the other-tab messages
  lock.svelte.ts  the passcode lock: unlock, lock now, auto-lock, tabs sharing the lock, tv windows
  check.ts        the shape check for anything from outside (imported files, tv snapshots)
  site.ts         the address, and each page's title and description for search and link previews
  store.ts        the game data (games, chip sets, templates, pay links), export + import
  sync.ts         BroadcastChannel + the end-to-end encrypted live api client
  components/     Chip, ChipStack, Breakdown, StructureTable, TvView, TvPanel, TournamentControl, CashControl, SeatTools, DealCalc, Palette, Calculator, Intro + HowItWorks
server/api/live/  nitro routes for the tv relay (they only ever see sealed data)
src/app.css       the raw shell theme; every color/font is a token in :root
```

## search and sharing

the app draws itself in the browser, so `src/hooks.server.ts` writes each page's title, description, canonical address and open graph tags (from `src/lib/site.ts`) into the html before it's sent: search engines and chat apps get them without running anything. the home page also carries schema.org data naming Wyzie LLC as the publisher. pages with someone's own data (`/game/*`, `/tv`, `/players`, `/settings`) and 404s are `noindex`. keep the titles in `site.ts` matching each page's `<svelte:head>`.

`static/` has the rest: `robots.txt`, `sitemap.xml` (add a page there when it should be found), `manifest.webmanifest` and its icons, `og.png` (the 1200 x 630 link preview), `favicon.ico` next to `favicon.svg`, and `.well-known/security.txt` (its `Expires` date needs moving forward before september 2027).

## deploy (cloudflare)

two configs: `wrangler.toml` is the site (pages; sveltekit's adapter reads it too) and `wrangler.api.toml` is the tv relay worker. the site is **pitmaster.cc** and the api is **api.pitmaster.cc**; `pitmaster.cc` has to be a zone on the same cloudflare account.

```bash
pnpm exec wrangler kv namespace create LIVE -c wrangler.api.toml   # paste the id into wrangler.api.toml
pnpm run deploy:api                                                 # nitro → worker, on api.pitmaster.cc
pnpm run deploy                                                     # sveltekit → pages (pitmaster)
```

then, once, in the dashboard:

- **pages > pitmaster > custom domains**: add `pitmaster.cc` and `www.pitmaster.cc`. `www` and `pitmaster.pages.dev` answer with a 301 to `https://pitmaster.cc` (`src/hooks.server.ts`), and preview deployments are `noindex`.
- **ssl/tls**: always use https on, min tls 1.2.
- **security > waf**: the rate limiting rule on `/api/live` (see **speed limits**).
- submit `https://pitmaster.cc/sitemap.xml` in google search console and bing webmaster tools.

the build finds the api through `VITE_API_URL` in `.env.production` (committed; it's not a secret, it's in every page's csp). to try the real builds locally, put `VITE_API_URL=http://127.0.0.1:8787` in `.env.production.local`, build, then `pnpm exec wrangler pages dev` for the site and `pnpm exec wrangler dev -c wrangler.api.toml` for the api.

## ui

the ui is a deliberate shell: raw, craigslist / are.na style. the plan is to polish it later with impeccable and keep the vibe. start with the tokens in `src/app.css` and the TV styles in `TvView.svelte`.

## license

[MIT](LICENSE), © Wyzie LLC. the license covers the code, not the PitMaster name: if you publish your own copy, give it a name of its own. found a security problem? see [SECURITY.md](SECURITY.md) rather than opening an issue.

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
| `/players` | leaderboard across every game: net, cash vs tournament, $/hr, wins, ITM %, knockouts, best result. filter by period and type, sort any column, open a player for their game-by-game history and their venmo / cash app / paypal handles (settle-up turns them into pay links with the amount filled in), export csv. with leagues on, a **leagues** view scores a season of linked games: points by place from a table, one per player beaten, or a square-root formula that rewards bigger fields, plus points for playing and per knockout, best-of-N, standings, a game-by-game grid and csv. with who owes who on, **owed** lists every finished game's unpaid settle-up, netted between each pair, with a paid box that ticks it off in every game it came from |
| `/settings` | six tabs down the left (the tab rides in the url #): **your game**: each piece is its own switch, so any game takes exactly the parts it needs: a cash game rake (a cut of each pot or a seat fee, and who it's paid to), a tournament house cut (flat fee and/or %), and the extras (bounties & knockouts, rebuys & add-ons, seat draw & tables, final table deals, pay links, shared costs, who owes who, satellites, shootouts, heads-up brackets, the waitlist, leagues, other poker games, games besides poker, and the cash side games: bomb pots, the 7-2 game, high hand). anything off is gone from new games and the dealer screen, a new game can still add it just for that game, and a game that already uses one keeps it. then your house rules (one per line, common ones one click away; they start every new game and take turns on the tv). **new games**: tournaments (buy-in, players, starting stack or auto, depth, length, level length, breaks, antes, late reg, rebuys / add-on, bounty and its kind, payout percentages, payout rounding), cash games (min / standard / max buy-in in big blinds, length, straddles, bomb pot ante and timer, 7-2 amount, high hand prize and window), seats per table, templates. **chip sets**: the editor: design (Monte Carlo / Casino Del Sol / basic), colors, values, counts. comes with common starter sets (Monte Carlo 500 low stakes and standard, Casino Del Sol 500, a 1000-chip tournament set, basic dice chips); mark the ones you own. pick the default, reset the built-in sets. **tv**: sound on start, tv volume, level warning, keep awake, announcer (reads blinds, breaks, busts and the winner out loud), money on the tv. **general**: theme, interface sounds and their volume, motion (system / reduced), home page toys, the command palette's key, language (english, chinese, hindi, spanish, french, arabic, bengali or portuguese, guessed from the browser; arabic runs right to left), currency, 12 / 24-hour time. **your data**: the passcode lock, and export & import: everything in one file (settings optional, password optional), import by picking or dropping a file (add to what's here, newer copy of a game wins, or replace everything), delete everything. |
| `/new?type=cash` | blinds, buy-in range, session length, straddles, rake (a cut of each pot into a rake box, or a seat fee, paid to the house or to a player), side games (bomb pots by hand or every n minutes, double board; the 7-2 game; a high hand prize per window of play), chips per buy-in, "how many buy-ins does my set cover". house rules, regulars one click away. save the setup as a template or load one. |
| `/new?type=tournament` | buy-in, starting stack, target length → auto blind structure (breaks, antes, color-ups, overtime levels), rebuys, add-on, late reg, bounties (flat, progressive knockout, or mystery envelopes that come out at a set number of players), payouts rounded to $1 / $5 / $10 / $20, house cut (flat fee per entry and/or a %), format (shootout, a heads-up bracket, or a satellite paying seats of a set worth, with the rest to the next place). with other poker games on, the game: one of fifteen (`variants.ts`: hold'em, omaha, stud, razz, draw...), a known mix (horse, hose, 8-game, hold'em and omaha) or your own, one game a level; stud levels get an ante and a bring-in, and limit games bet the big blind and twice it. satellite winners waiting for a seat are one click away on the players list. **start from** a template or a built-in preset (turbo, hyper turbo, deepstack, freezeout, sit & go, pko, mystery bounty). `&template=` loads a template, `&preset=` a preset, `&from=<game id>` copies an old game to tweak |
| `/new?type=dice` | liar's dice: dice per player, ones wild, spot on (everyone else loses a die, or the caller gets one back, or off), palifico, and the stakes: a buy-in pot paid by place (payout table and rounding) or an amount per die lost, into a pot for the winner or straight to whoever won each call. quick entry (tap who lost) or full (the bid, who called it and how many there were). |
| `/new?type=lives` | lives games on the same last-one-standing engine as liar's dice: 31 (scat), screw your neighbor, knock-out whist, ship captain and crew, or your own, each with its rules and a starting number of lives; the same stakes as liar's dice (a buy-in pot by place, or money per life lost). the dealer screen counts the lives each player lost in a round (and 31 has a button for a 31). |
| `/new?type=pot` | pot games: in-between (acey deucey), guts, bourré, pass the pigs, or your own. an ante, a pot limit (the most a bet can win or cost, and what matching the pot costs), and what happens to what's left at the end (split evenly, or back to whoever put it in). the dealer screen antes everyone in, takes in-between bets (win, lose, or the post pays double), losers matching the pot, and anyone paying in or taking out; each player's in and out settles up like a cash game. |
| `/game/:id` | dealer screen. clock controls (`space`, `←` `→`), bust / rebuy / add-on, knockout credit (a progressive knockout shows every bounty as it grows; a mystery bounty opens a random envelope on the tv, and the host can change the unopened amounts), seat draw + table balancing, shootouts (each table plays down to its winner, then draw final table), heads-up brackets (random seeds, byes to the top seeds for an uneven field, click each match's winner; the loser is out in that round and everyone out in the same round shares those places' payouts; the tv lists the round's matches and shows the whole bracket before the start and on breaks), satellites (places pay seats in another game; the seat winners come in on that game's new game with their buy-in paid by the ticket), final-table deal calculator (icm / chip chop), bubble / in-the-money callouts, cash buy-ins + rake box + chip-count cash-outs, settle-up for cash and tournaments (rake and seat fees paid to the house, high hand prizes and tournament prizes paid by it, shared costs, pay links, a paid box on each payment), shared costs (anything bought for the game, split among everyone or some players), side games (call a bomb pot when one's due, mark a 7-2 win, set and pay the high hand; all on the tv), message the tv, undo (`ctrl z`), copy recap, csv, run it back, move this game to another device (a one-game export file) |
| `/game/:id/tv` | tv view, same computer (drag the window to the tv over hdmi, press `f`) |
| `/live` → `/tv#CODE` | tv view on any device: host hits **go live**, tv types the 8-character code (or a phone scans the qr code on the tv or the dealer screen, drawn on the device by `uqr`). on a phone it's one column that scrolls, with **find me** under the clock: type a name for their seat, bounty and place, looked up in the snapshot the phone already has. the code rides after the `#`, so it's never sent to a server. it shows the host's currency, time format and warning, not its own |
| `/cup#CODE.SEAT.KEY` | a player's phone as their liar's dice cup (from the qr code the dealer screen shows each player once phones are on): shake or tap to roll, hold to look, and on a call it shows the cup to the tv. only that seat's phone can write to it (see **phones as dice cups** below) |
| `/privacy`, `/terms` | privacy policy and terms of use, written for a side project with no accounts and no database. update them whenever data handling changes |

**`ctrl k` / `⌘ k` anywhere** (rebind it in settings > general > keyboard; stored as text like `Mod+K`, see `src/lib/keys.ts`) opens the command palette: jump to a page or game, start from a template or a preset, and on the dealer screen do anything by name ("bust mike", "next level", "add player", "cash out jess", "undo").

## how the data works

- everything lives in the host's browser, encrypted (see **security** below). no accounts.
- moving to another device is a file: settings > export & import writes `{ pitmaster: 1, kind, exportedAt, data, settings? }` (`kind` is `everything`, or `game` for one game with its chip set and its players' pay links). with a password it's `{ pitmaster: 1, kind, exportedAt, locked: { salt, rounds, data } }`. import merges by id (a game's newer `updatedAt` wins; nothing is deleted) or replaces everything. a live game's tv code and key come along, so the tv keeps working when the laptop takes over. imported settings skip this screen's theme, motion and interface sound.
- player stats aren't stored. `/players` works them out from the saved games every time, matching players by name (case and spacing ignored), so fixing a game fixes the leaderboard. a tournament counts once it has a winner; a cash player counts once they cash out; liar's dice, lives and pot games count once they're over. each kind of game works out its own (`results` in `kinds/`). shared costs go into settle-up but never into results. league standings (`leagueStandings`) are worked out the same way from the games linked to the league; cash games rank by net that night. a league game's tv snapshot carries its top ten (`publicSnapshot` adds `league`), since the tv only ever holds the one game.
- what people still owe isn't stored either. a game keeps only the payments the host ticked off (`game.paid`), and owed is settle-up less those, so a game changed after it was paid shows what's left or what comes back.
- clocks are stored as an anchor (`status`, `levelIndex`, `levelElapsedMs`, `anchorAt`). every screen works out the live time itself, so the tv keeps ticking even if the dealer tab closes.
- same-computer tv syncs instantly over `BroadcastChannel`. other tabs of the app pick up each other's saves from the `storage` event.
- **go live**: the browser draws an 8-character code and derives an `id` and an AES key from it (PBKDF2, 200k rounds). it `POST`s `{ id, key }` to `/api/live` (the write key is stored hashed), `PUT`s sealed snapshots to `/api/live/:id` with `X-Live-Key`, and **stop sharing** `DELETE`s it. the tv derives the same id and key from the code and follows it down a websocket (see **websockets** below), or polls `GET /api/live/:id?since=` when it can't hold one. stored in Cloudflare KV (a local `.data/` folder in dev); expires 2 days after the last update.

## security

- **on the device** (`src/lib/vault.ts`): games, chip sets, templates, pay links and settings are sealed with AES-256-GCM (gzipped first) and kept in IndexedDB (`pitmaster-vault`) next to the key that seals them: `keeper` (the key, non-extractable, with a random `kid`), `data` and `settings` (both `pm1.<z|p>.<iv>.<ciphertext>`). a new key and everything sealed with it are written in one transaction, and every save checks, in its own transaction, that it's still using the current key; a tab that isn't reloads. only `pitmaster.look` (theme and motion, read by `app.html` before first paint), `pitmaster.exported` (a timestamp) and `pitmaster.tries` (wrong passcode count) are plain, in `localStorage`. the store decrypts once, when the app opens or is unlocked, and keeps plaintext in memory only.
- what that does and doesn't cover without a passcode: the key lives in the same browser profile as the data, so it protects against anything that gets the saved data without the key (like someone browsing the site's storage in devtools), not against someone who can use the browser or copies the whole profile. the privacy page says so; keep it that way.
- **passcode lock** (`src/lib/lock.svelte.ts`, settings > passcode lock): the key is kept wrapped by a key made from the passcode (PBKDF2-SHA256, 600k rounds, `wrapKey`/`unwrapKey`, so the raw key never reaches javascript). setting, changing or removing it re-seals everything under a new key. it's one lock per browser: locking reloads every app tab so nothing unlocked stays in memory, unlocking one tab hands the key to the others over `BroadcastChannel`, and a new tab asks an unlocked one for it. auto-lock (30 s to 1 h, or only when closed) counts input in every tab. after 5 wrong tries each try waits longer, up to 15 minutes. forgetting it means deleting everything.
- **tv windows never lock and never hold the key**: with a passcode on, `/game/:id/tv` asks an unlocked tab for its game over `BroadcastChannel` and gets the same snapshot every change sends, and waits while everything's locked. `/tv`, `/live`, `/help`, `/privacy` and `/terms` stay open too (nothing saved is on them). tv screens have no command palette and nothing that edits.
- **no WebCrypto** (plain http): nothing is saved and the app says so. **key gone** (site data half-cleared): the app says the data can't be opened and never overwrites it until the host chooses to start fresh.
- **tv codes**: end-to-end encrypted. the server only sees an id derived from the code, a sealed snapshot and a SHA-256 of the write key. snapshots leave out the log, the code and the key. codes use `crypto.getRandomValues` (31 characters, 8 long, about 853 billion).
- **export files**: optional password (8 characters or more), PBKDF2-SHA256 600k rounds to an AES-256-GCM key.
- **anything from outside** (an imported file, a tv snapshot) goes through `src/lib/check.ts` first: every field the app reads has to be the right type, ids have to be safe in a url and chip colors have to be hex. a file that fails is turned away whole. imports are capped at 50 MB.
- **spreadsheets**: text that starts like a formula (`=`, `+`, `-`, `@`) gets a leading `'` in csv downloads, so a player's name can't run in Excel or Sheets.
- **names as keys**: pay links are keyed by player name in objects with no prototype, so a player called `constructor` or `__proto__` is just a name.
- **the site**: a strict content security policy from `svelte.config.js` (scripts only from this origin, with a per-request nonce for sveltekit's inline ones; `connect-src` is the site plus `VITE_API_URL`), and `src/hooks.server.ts` adds HSTS, `nosniff`, `no-referrer`, COOP and a permissions policy. `_headers` (in the project root; the adapter copies it) covers the static files.
- **the api**: only answers browsers on pitmaster.cc, its preview deployments and `localhost` (`server/middleware/cors.ts`). it validates ids, keys and sealed payloads, caps bodies at 1 MB, compares key hashes in constant time, and answers with `default-src 'none'`, `nosniff` and HSTS. stop sharing leaves a blank record (no game, no key hash) until the code would have expired, so no one else can claim it and put something on a tv that still has it open (it answers `410`, and the tv stops asking).
- **speed limits** (`server/middleware/limit.ts`): per address per minute, 20 new codes, 120 wrong codes or keys (past that, everything from that address waits out the minute) and 3,000 requests in all. counted in memory for a minute and never stored or logged. each worker instance counts on its own, so this is a speed bump; the real guard is a cloudflare rate limiting rule (security > waf > rate limiting rules) on `/api/live`, e.g. 300 requests per 10 seconds per ip.
- **phones as dice cups (commit and reveal)**: no one, the host included, can see a phone's dice early or pick them. each round every phone picks its own random numbers and sends only `sha-256(game id | round | seat | numbers | salt)`; once every hash is in, the host's device picks its numbers and puts them in the snapshot; each die is the phone's number plus the host's, mod 6. on a call every phone sends its numbers and salt, the host checks them against the hashes, rebuilds every cup and counts, and a phone that doesn't match is caught and loses the round. all of it comes from `crypto.getRandomValues`. a phone's link is `/cup#CODE.SEAT.KEY`: its seat's key rides after the `#`, the relay keeps only a sha-256 of it (`h:<id>`), and a mailbox (`s:<id>:<seat>`) takes a write only with its own key. what's in a mailbox is sealed with the game's key on the phone, so the relay sees ids, key hashes and ciphertext. the phone keeps its numbers sealed in IndexedDB with a key made there that no script can read out (`kinds/dice/pocket.ts`). seat keys live only on the host's device: snapshots leave them out (`publicSnapshot`).
- **websockets** (`server/routes/api/live/socket.ts`): every screen follows its game down one socket instead of asking every 2 seconds, and the host sends its snapshots (and a phone its mailbox) down its own; each one is pushed to the others the moment it lands. on cloudflare they all live in one durable object (nitro's `cloudflare-durable` preset), and writes that come in over http are handed to that object (`server/middleware/0-durable.ts`) so they're pushed too. a socket only opens from the site's own pages, 60 a minute per address (none for an address past its wrong codes); one that asks after games that aren't there, follows more than a few, or floods is closed. every write down a socket is answered, and one that isn't answered in 5 seconds goes over http instead. kv still keeps every snapshot and mailbox, so a screen that joins gets the latest, and one that can't hold a socket polls as before.
- **kv's one write a second per key**: the host spaces a code's writes at least 1.1 s apart (newest wins), retries busy or failed ones with backoff, and stop sharing waits for any write in flight and retries until the copy is gone.
- **dependencies**: run `pnpm audit` before deploying, and keep it at zero.
- in production, turn on **Always Use HTTPS** for any custom domain in cloudflare.

## code map

```
src/lib/
  types.ts        all the shapes
  chips.ts        chip set presets, chip splitting (distribute), stack math
  presets.ts      built-in tournament presets (turbo, deepstack, pko...)
  blinds.ts       structure generator, color-ups, payouts
  clock.ts        pure clock math (derive / start / pause / jump)
  game.ts         new game, bust, rebuy, knockouts, bounties (flat / progressive / mystery envelopes), deals, seats + table balancing, rerun, cash stats, settle-up (cash and tournament), shared costs, payments and what's still owed
  stats.ts        per-game results, the all-time leaderboard and league standings
  variants.ts     the poker games: how each is bet (no limit, pot limit, limit) and dealt (blinds or stud), the mixes, dealer's choice
  report.ts       the plain-text recap and per-game csv
  deal.ts         icm and chip-chop math
  commands.svelte.ts  the command palette's registry (pages add their own commands)
  calc.svelte.ts  the floating calculator (C anywhere): brackets, till-style %, the answers so far. never saved
  crypto.ts       all the encryption: sealing, keys, the passcode's key wrap, tv code keys, export passwords
  vault.ts        IndexedDB: the key and everything sealed with it, saved together; the other-tab messages
  lock.svelte.ts  the passcode lock: unlock, lock now, auto-lock, tabs sharing the lock, tv windows
  check.ts        the shape check for anything from outside (imported files, tv snapshots); shape.ts has its building blocks
  kinds/          one folder per kind of game (cash/, tournament/, dice/, lives/, pot/, and poker/ for what cash and tournaments share: the new-game form and their settings' checks; standing.ts is the last-one-standing engine and stakes that liar's dice and the lives games share). each gives kinds/index.ts its form, its dealer screen, a tv board if it isn't poker, and its results, settle-up, recap, csv and check (kinds/kind.ts), so the rest of the app asks the kind instead of branching on game.type
  site.ts         the address, and each page's title and description for search and link previews
  store.ts        the game data (games, chip sets, templates, pay links, leagues), export + import
  sync.ts         BroadcastChannel + the end-to-end encrypted live api client
  components/     Chip, ChipStack, Breakdown, StructureTable, TvView (the poker board, and the frame every kind's board sits in), TvPanel, SeatTools, DealCalc, Bracket, Leagues, Palette, Calculator, Intro + HowItWorks
server/api/live/  nitro routes for the tv relay (they only ever see sealed data): snapshots, seats and their mailboxes
server/routes/api/live/socket.ts  the websocket every live screen follows its game on
src/app.css       the raw shell theme; every color/font is a token in :root
```

## search and sharing

the app draws itself in the browser, so `src/hooks.server.ts` writes each page's title, description, canonical address and open graph tags (from `src/lib/site.ts`) into the html before it's sent: search engines and chat apps get them without running anything. the home page also carries schema.org data naming Wyzie LLC as the publisher. pages with someone's own data (`/game/*`, `/tv`, `/cup`, `/players`, `/settings`) and 404s are `noindex`. keep the titles in `site.ts` matching each page's `<svelte:head>`.

`static/` has the rest: `robots.txt`, `sitemap.xml` (add a page there when it should be found), `manifest.webmanifest` and its icons, `og.png` (the 1200 x 630 link preview), `favicon.ico` next to `favicon.svg`, and `.well-known/security.txt` (its `Expires` date needs moving forward before september 2027).

## deploy (cloudflare)

two configs: `wrangler.toml` is the site (pages; sveltekit's adapter reads it too) and `wrangler.api.toml` is the tv relay worker (with its durable object for the websockets; the first deploy creates it from `[[migrations]]`). the site is **pitmaster.cc** and the api is **api.pitmaster.cc**; `pitmaster.cc` has to be a zone on the same cloudflare account.

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

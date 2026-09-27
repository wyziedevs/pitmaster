# Roadmap

Everything PitMaster could run next, from the easiest to the biggest. Each phase ships on its own and leaves the app working.

## Rules for every phase

These come from PRODUCT.md and how the app is built today. Every phase follows them.

- **Its own switch.** Each feature gets a `use*` switch in Settings > Your Game (next to `useRake`, `useBounties`...), is off or on by default as noted, and can be added to one game on New Game.
- **Money always adds up.** Anything that moves money goes through settle-up, the recap, the CSV and `stats.ts`, and can be undone (`ctrl z`).
- **Encrypted like the rest.** New fields live on `Game`, `Settings` or a new store list, all sealed by the vault. New store lists go into export/import and `check.ts`. Anything that changes what leaves the device updates /privacy and /terms.
- **No migrations.** There are no users yet, so change the data shape directly (see the memory note on legacy code).
- **Derive, don't store.** Like `stats.ts`, store only what happened (events) and work out totals from it. Store a value only when it's random or typed by the host.
- **The TV earns its drama.** New TV states are glanceable from across the room, and motion or sound is kept for real events (a bomb pot called, a mystery bounty opened, "Liar!").
- **Commands.** Every new dealer action is in the command palette by name ("bomb pot", "7-2 mike", "liar").
- **Copy.** Plain and short, Title Case labels, no em dashes, nothing that assumes the size of the game, the currency or the room.
- **Docs.** README (page table and "how the data works"), /help, and the announcer's lines are updated in the same phase.
- **Check.** `pnpm check` passes, and the phase is walked through in the browser: setup, dealer screen, TV (same computer and a live code), recap, CSV, /players, export and import.

## Phase 1: Presets and bounty variants

**Status: done.**

Small changes to what already exists.

**1a. Tournament presets.** Built-in starting points shown in New Game's "Start From" list next to the host's own templates: Turbo (10 min levels), Hyper (5 min, 50 bb deep), Deepstack (200 bb, 30 min), Freezeout (no rebuys or add-on), Sit & Go (one table, top 3 paid), plus PKO and Mystery Bounty.
- `PRESETS` in `src/lib/presets.ts`. It isn't stored and can't be deleted. Each preset only changes the settings that make it what it is, so the host's own defaults and chip set stay.
- The picker groups them under Built In, and a loaded preset can be saved as the host's own template. They're in the palette too (`&preset=` in the url).

**1b. Progressive knockout (PKO).** Half of a bounty goes to whoever busted the player, and half is added to the buster's own bounty.
- `TourneySettings.bountyKind: "flat" | "progressive" | "mystery"`.
- Each player's current bounty is worked out by replaying `game.kos` in order (a rebuy starts a fresh bounty). Nothing new is stored.
- `stats.ts` `results()` pays out bounties by kind. The dealer screen and TV standings show each player's current bounty and call out the biggest one.

**1c. Mystery bounty.** From a chosen point (players left, or a level), each knockout draws a random prize from the bounty pool.
- `TourneySettings.mystery: { from: number; prizes: number[] }`. When the mystery phase starts, the pool is split into envelopes (a few big ones, many small ones). The host can edit them, and they always sum to the pool.
- Each draw uses `crypto.getRandomValues` and is stored on its knockout: `Knockout.prize`.
- TV: an envelope opens, the amount is shown, and a short sound plays. The list of prizes still unclaimed stays on screen.

**Done when:** a PKO and a mystery bounty tournament each run to a winner, and the bounties in the recap, CSV and /players match the payouts to the cent.

## Phase 2: Cash side games

**Status: done.**

The extras cash tables actually play. Each has its own switch, off to start. Everything is logged in one list of events on the game: `game.sides: { kind, at, playerId?, amount?, hand?, window? }[]`, and `sideStats()` in `game.ts` works out the rest from it. The dealer controls are `SideGames.svelte`.

**2a. Bomb pots.** Everyone antes a set amount and the flop comes with no preflop betting.
- `CashSettings.bomb: { on; ante; doubleBoard; everyMinutes }`. `everyMinutes: 0` means the host only calls them by hand.
- The dealer screen has a **Bomb Pot** button. The TV shows "Bomb Pot: everyone in for 5, double board", and a countdown to the next one when it's on a timer.
- The chips stay on the table, so cash-ins and cash-outs don't change. Bomb pots are only logged and counted in the recap.

**2b. The 7-2 game.** Winning a hand with 7-2 collects a set amount from every player dealt in.
- `CashSettings.sevenTwo: { on; amount }`. The dealer screen has a **7-2 Win** button and picks who won.
- TV flash: "Jess won with 7-2. Everyone pays 5." It's logged and counted, and the money moves in chips.
- /players shows each player's 7-2 wins in their game history.

**2c. High hand.** The best hand in a time window wins a prize paid by the house.
- `CashSettings.highHand: { on; prize; everyMinutes }`. The host types the current high hand and who holds it. When its window runs out, the dealer screen and the TV say it's time to pay.
- The TV shows the hand ("Aces Full of Kings, Mike") with a countdown to the end of the window.
- At the end, the prize is logged as a side event with an amount. `cashSettle` makes the house pay the player: it comes off what the house is owed in rake and seat fees, and past that the house pays in. `results()` counts it in the player's `won`, and the recap and CSV list it.

**Done when:** a cash game with all three runs, and settle-up still balances with rake, seat fees and a high-hand payout.

## Phase 3: Money across games

**Status: done.** Two switches, both off to start: Shared Costs and Who Owes Who. Tournaments got a settle-up too (the house pays out the prizes and bounties once there's a winner), so both game types share one list of payments (`SettleMoves.svelte`, costs in `Costs.svelte`). A payment is stored as what was paid (`game.paid: { from, to, amount, at }[]`) rather than a flag, so a game changed after it was paid shows what's left, or what comes back.

**3a. Shared costs.** Anything bought for the game, split among the players.
- `game.costs: { id; label; amount; paidBy; split: string[] }[]`. `split` lists player ids, and empty means everyone. `paidBy` is a player id or the house.
- These go into `settle()` so one set of transfers covers everything, but not into poker results. `net` and the leaderboard don't change.
- The copy stays neutral ("Costs"), not food or drinks.

**3b. Running ledger.** Who still owes whom, across every game.
- `game.paid: Record<string, number>`, keyed `fromKey>toKey`, with when it was marked paid. The settle-up rows get a **Paid** checkbox.
- /players gets an **Owed** view: unpaid transfers from every game, netted by pair, with pay links.

**Done when:** two games with unpaid settle-ups net correctly in Owed, and ticking Paid clears them.

## Phase 4: Tournament formats

**4a. Satellites.** The prizes are seats in another game instead of cash.
- `TourneySettings.prize: { kind: "cash" } | { kind: "seats"; seatValue: number; target?: string }`. The number of seats is `floor(pool / seatValue)`, and the remainder goes to the next place as cash.
- The TV payout table shows "Seat" in place of an amount.
- On New Game for the target game, **Add Satellite Winners** brings them in. `Player.ticket` holds the satellite's game id, so the buy-in shows as paid by ticket.
- Stats: a seat counts as `seatValue` won in the satellite, and as a normal buy-in cost in the target game.

**4b. Shootouts.** Each table plays down to one winner, then the winners meet at a final table.
- `TourneySettings.format: "standard" | "shootout"`. Shootouts need a seat draw, and `tableAdvice` stays off (no balancing).
- When a table is down to one player, that player is marked as the table winner. When every table is done, **Draw Final Table** seats the winners.
- Players out in round one are placed by the order they went out.

**Done when:** a satellite feeds a real target game, and a shootout with 3 tables ends with the right places and payouts.

## Phase 5: Waitlist and phones

**5a. Waitlist (cash).** `game.waitlist: { name; at }[]`.
- **Seat Next** adds the next name as a player and seats them with `seatNewcomer`. When someone cashes out and a seat opens, a flash says so.
- The TV shows the list and how long each person has waited.

**5b. Phone view.** `/tv#CODE` on a narrow screen gets its own layout: clock, blinds, what's next, payouts, the waitlist, and **Find Me** (type your name to see your seat, your bounty and your place).
- It's the same snapshot and the same code, so no new data leaves the device. The TV and the dealer screen show a QR code for the `/tv#CODE` link. The code stays after the `#`, so it's never sent to a server.
- /privacy says phones can use the code too, and anyone with it sees what the TV shows.

**Done when:** a phone follows a live game, finds a player's seat, and nothing new shows up in network requests except the existing snapshot polls.

## Phase 6: Leagues and seasons

- A new encrypted store list: `leagues: League[]` with `{ id; name; start; end?; types: GameType[]; points; bestOf? }`. `Game.leagueId` links a game to a league. Export/import and `check.ts` carry it.
- Points: pick a preset (a fixed table by place, or a formula based on entrants and place), plus points for playing and for knockouts. `bestOf` keeps each player's best N results.
- Standings are worked out in `stats.ts` (`leagueStandings`), like the leaderboard, and are never stored.
- /players gets a Leagues tab: standings, game-by-game points, and CSV export.
- TV: when a league game is idle, on a break or finished, the host's snapshot carries the top standings (`publicSnapshot` adds `league`), and the TV rotates them in. The TV only ever holds one game, so the host computes them.

**Done when:** a 4-game league with bestOf 3 gives the right standings on /players and on the TV.

## Phase 7: Heads-up brackets

- `TourneySettings.format` adds `"bracket"`. `game.matches: { round; a; b; winner; at }[]`, with seeds drawn randomly and byes filled for uneven fields.
- Setting a match's winner moves them to the next round. Payouts go by the round reached.
- The TV draws the bracket, and the current matches are large enough to read from across the room.

**Done when:** an 11-player bracket (with byes) plays out, and the places and payouts are right.

## Phase 8: Other poker games

The biggest poker change: blinds stop being the only kind of structure.

**8a. Variants and betting.** A `variants.ts` list: No Limit Hold'em, Pot Limit Omaha (4 and 5 card, hi-lo), Limit Hold'em, Stud and Stud Hi-Lo, Razz, 2-7 Triple Draw, Badugi, and more. Each one says:
- its betting: no limit, pot limit or fixed limit
- its structure: blinds, or stud (an ante and a bring-in)

`Level` gains `game?: string` and `bringIn?: number`. Limit games read `bb` as the small bet and `2 × bb` as the big bet, so nothing else about `Level` changes.

**8b. Mixed tournaments.** `TourneySettings.rotation: string[]` (HORSE, 8-Game, or custom), switching each level.
- `blinds.ts` `generateStructure` makes limit and stud levels (small and big bets, bring-ins).
- The structure table shows each level's game.

**8c. Dealer's choice (cash).** `CashSettings.games: string[]` and `current`, with an optional `rotateMinutes`.
- The dealer screen has a game picker, and **Next Game** is in the palette.

**8d. TV and tools.**
- The TV shows the current game name large, with its limits written for its kind ("PLO · 1/2", "Stud · Ante 1, Bring-In 2 · 5/10"). The announcer reads game changes.
- The calculator gets a **Pot** mode for pot-limit games (pot, the call, and the max raise).

**Done when:** a HORSE tournament and a dealer's choice cash game each run, with correct limits on the TV and structure table.

## Phase 9: Game kinds (groundwork for other games)

Today about 30 places branch on `game.type === "cash" | "tournament"`. Before adding games that aren't poker, give each kind one home:

- `src/lib/kinds/<kind>.ts` holds its defaults, `results()` adapter, recap and CSV lines, and validator.
- Its components are a New Game section, a dealer control (like `CashControl`) and a TV view.
- A registry, so the rest of the app asks the kind instead of branching.

Move cash and tournament onto this first, with no change in behavior. Then `GameType` grows by one entry per new kind.

**Done when:** cash and tournament run exactly as before, and adding a kind means one folder and one line in the registry.

## Phase 10: Liar's Dice

The first game that isn't poker. It's built on a **last one standing** engine, where players lose lives (here, dice) until one is left, so the other lives games in Phase 11 reuse it.

- **Kind `dice`.** Settings: dice per player (5), ones wild, spot-on calls, palifico (the special round when a player is down to one die), and the stakes:
  - a buy-in pot paid out by place, with the existing payout table and rounding
  - or a set amount per die lost, paid to the pot or to the player who won the challenge
- **What's stored:** only the rounds, `game.rounds: { bid?: { count; face }; bidder?; caller; call: "liar" | "spot"; actual?; losers: string[]; at }[]`. Dice left, who's out and places are all worked out from them.
- **Dealer screen:**
  - **Quick:** tap who lost a die.
  - **Full:** enter the bid, who called, and how many were really there. PitMaster works out who loses (for spot-on, everyone else, or a die back for the caller).
  - Undo works on either.
- **TV:**
  - every player's dice, drawn like the Dice toy, with the ones who are out greyed
  - total dice on the table, and the expected count of any face (a third of all dice with ones wild, a sixth without), which players use to judge a bid
  - "Liar!" and the reveal as the big moment, and a palifico banner
- **Stats:** a `results()` adapter so Liar's Dice shows up on /players with wins and net, filterable by kind.

**Done when:** a 6-player game runs to a winner in both quick and full modes, and the per-die stakes settle correctly.

### Phase 10b: Phones as dice cups

Each player's phone is their cup. They shake it, peek at their dice, and on a call every phone reveals at once on the TV, and PitMaster counts the dice itself. No one, including the host, can see anyone's dice early, and no one can pick their own.

**Fair rolls (commit, then reveal).** Neither side alone decides a die:
1. At the start of a round, each phone picks its own random numbers and sends only a hash of them (SHA-256 of the numbers and a salt). This locks them in without showing them.
2. Once every phone has sent its hash, the host's device picks its own random numbers and puts them in the snapshot.
3. Each die is the phone's number plus the host's number, mod 6. The phone shows its dice right away. The host can't work them out without the phone's numbers, and the phone couldn't pick them because it had to lock in before the host's numbers existed.
4. On a call, every phone sends its numbers and salt. The host checks them against the hashes and rebuilds everyone's dice. A phone that doesn't match is caught, shown on the TV, and loses the round.

All randomness comes from `crypto.getRandomValues`.

**Joining.**
- The host's dealer screen shows each player a QR code: the live code plus a seat token only that phone gets, in the `#` so it never reaches a server.
- The phone opens `/cup#CODE.SEAT` and shows only that player's cup. Anyone else who has the live code can still watch like a TV, but can't write to a seat.

**Relay changes.** Today only the host writes.
- Add a mailbox per seat: `PUT /api/live/:id/seat/:seat` with the seat's own write key. The server stores only a SHA-256 of that key, like the host's.
- What's in a mailbox (the hash, and later the reveal) is sealed with the game's key, so the server sees only ids and ciphertext.
- Before a hash is revealed there's nothing secret in it, so other people who hold the live code learn nothing by reading it.
- Same 2-day expiry as today.

**Load.**
- Every phone polling every 2 seconds is far more reads than one TV. A table of 8 is about 14,000 reads an hour, and KV's free tier allows 100,000 reads a day.
- So this phase moves the live relay onto a Durable Object with a WebSocket per screen. Pushes replace polling, and the TV gets instant updates too. KV stays as the backup store.

**On the phone.**
- The cup: shake or tap to roll, then hold to peek. The dice are hidden again when the finger lifts, so a neighbor can't glance at them.
- Your dice left, the current bid, the total on the table, and a haptic buzz when it's your turn.
- The phone's own numbers are kept sealed at rest (a non-extractable key, like the vault), so a reload keeps the cup and nothing is ever saved in plain text.

**Fallbacks.**
- If a phone drops, the host can switch that player to real dice for the round and type their count in full mode.
- The whole table can switch back to real cups at any time.

**Privacy and terms.**
- /privacy gets a section on player phones: what each phone sends (a hash, then its numbers, sealed), what the server can see (ids and hashes of keys), and when it's deleted.
- /terms doesn't change.
- README "security" gets the commit-and-reveal scheme.

**Done when:**
- A 5-phone game plays to a winner and every call is counted automatically.
- A phone that sends a tampered reveal is caught.
- The host's device never holds a phone's dice before the reveal (checked in the snapshot and network requests).
- The server's KV and Durable Object logs show only ids, key hashes and ciphertext.

## Phase 11: Table and pot games

Two engines cover most other games people play for chips around a table.

**11a. More lives games** on the Phase 10 engine, as presets with their own names and rules text:
- 31 (Scat)
- Screw Your Neighbor
- Knock-Out Whist
- Ship, Captain and Crew elimination

**11b. Pot games.** Kind `pot`: a running pot that players ante into, pay into and take from.
- Examples: In-Between (Acey Deucey), Guts, Bourré, Pass the Pigs.
- Events: ante, pay the pot, match the pot, take the pot, with a pot limit and a round counter. Each player's in and out adds up like a cash game, so settle-up and pay links work unchanged.
- The TV shows the pot large, whose turn it is, and the last few events.

**Done when:** an In-Between game with a pot limit and a 31 game each settle up correctly.

## Phase 12: Casino Night

Casino games run on chips, for an event, a fundraiser or a club night.

- **Kind `casino`.** Players buy chips at the bank, like cash buy-ins. A list of tables: `{ game: "blackjack" | "roulette" | "craps" | "baccarat" | "wheel"; dealer; min; max }`. The bank tracks the chips out.
- **Roulette on screen.** The Roulette toy gets a real mode for a table without a wheel: spin on the dealer's screen, and the TV shows the number and a board of the last results. Draws use `crypto.getRandomValues`.
- **The finish.** Chips cash out to money, or to raffle tickets at a set rate. **Raffle Draw** on the TV picks winners from the tickets, one prize at a time.
- **Legal.** /terms gets a line saying casino-style games for money or prizes are regulated in many places, and PitMaster only keeps the count. The side-project framing and responsibility wording stay as they are.

**Done when:** a casino night with 3 tables, a roulette table with no physical wheel and a raffle runs from buy-ins to prizes, and the bank balances.

## Other ideas

Things that came up but aren't planned yet:
- scorekeepers for dice games like Farkle and Yahtzee, with money per point
- a sound and look for each new kind's TV
- translations, once the text is stable

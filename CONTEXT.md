# PitMaster Domain

The words the code uses for the game night, so modules can be named after them.

**Game**: one night of one kind, saved as one record. Everything shown about it is worked out from what's saved.

**Kind**: what sort of game it is: cash, tournament, liar's dice, lives, pot or casino night. Each kind is a folder in `src/lib/kinds/` and gives the app one `Kind` (`kinds/kind.ts`): its form, dealer screen, results, settle-up, recap, csv and check. The rest of the app asks the kind instead of branching on `game.type`.

**Engine**: a kind's `engine.ts`. Works out what the game comes to from what's saved, and never changes it.

**Actions**: a kind's `actions.ts`. What the dealer screen does to the game, each change logged and, when it's news, flashed on the tv.

**Book**: a tournament's money, worked out whole (`tourneyBook`): the pool, the paid places, the bubble, the bounties and each player's take. A deal's amounts replace the payout table once there's a deal.

**Take**: one tournament player's money in the book: what they paid in, their prize, their bounties, a satellite seat and their net.

**Night**: one cash player's money (`cashNight`): the chips they cashed out less what they bought in, the seat fee, high hand prizes, and the net those come to. Every screen, report and settle-up uses this one net.

**Standing**: who's still in, their lives or dice, their places and the money, for the last-one-standing kinds (liar's dice, lives). Worked out from the rounds by `kinds/standing.ts`.

**Settled**: when a game's results count (in stats and leagues). A tournament once it has a winner; a cash player once they cash out; the other kinds once they're over. A cash game stays in progress until the host ends it, even after everyone has cashed out.

**Bank**: a casino night's money (`casinoState`): the chips each player bought and turned back in, the chips still out, and what the house kept (a raffle keeps it all, and the chips come back as tickets). The bank pays and takes money on the spot, so nobody owes anybody.

**Deal**: the final table agreeing to split what's left (ICM or chip chop). It ends the tournament; its survivors are out, but not busted.

**Snapshot**: the copy of a game a tv or phone gets, sealed with the game's key. It leaves out what only the host's device holds (seat keys) and adds the host's display prefs and league board.

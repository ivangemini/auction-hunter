# Reputation and Auction Tiers v0.1

## Purpose
Reputation is the first session-level progression currency. Cash determines whether the player can afford a bid; reputation determines which auction market they are trusted to enter.

## Tiers
| Tier | Unlock | XP per win | Launch lot |
| --- | ---: | ---: | --- |
| Garage Auctions | 0 REP | 35 | Garage Locker #17 |
| Estate Auctions | 120 REP | 60 | Estate Locker #42 |
| Collector Club | 320 REP | 100 | Collector Locker #8 |

At launch each tier has one lot template. The tier model is data-driven so additional lot templates can be added without changing progression logic.

## Flow
- The lobby shows all three tiers in a selector.
- Locked tiers display their required reputation.
- Winning a lot awards the fixed reputation amount for the selected tier.
- The player may continue playing lower unlocked tiers after unlocking a higher tier.
- On a fresh save the game starts in Garage Auctions. When the auction scene is entered again, it defaults to the highest unlocked tier.

## Save compatibility
`reputationXp` is added to the existing v1 local save and defaults to zero for older saves. No reset or migration prompt is required.

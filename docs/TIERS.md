# Reputation and Auction Tiers v0.3

## Purpose
Reputation is the session-level progression currency. Cash determines whether the player can afford a bid; reputation determines which auction market they are trusted to enter.

## Tiers
| Tier | Unlock | XP per win | Normal lot templates |
| --- | ---: | ---: | ---: |
| Garage Auctions | 0 REP | 35 | 8 |
| Estate Auctions | 120 REP | 60 | 8 |
| Collector Club | 320 REP | 100 | 8 |

The 24-template normal-auction catalog is evenly distributed across the three tiers. Tier progression values remain unchanged by the breadth expansion, so existing saves and the first-session progression curve keep the same unlock pacing.

## Flow
- The market shows all three tiers in a selector.
- Locked tiers display their required reputation.
- Each normal market presents three distinct lot options from the selected tier's eight-template pool.
- Selecting a lot opens its lobby before GameplayAPI is activated.
- Winning a lot awards the fixed reputation amount for the selected tier.
- The player may continue playing lower unlocked tiers after unlocking a higher tier.
- On a fresh save the game starts in Garage Auctions. When the auction scene is entered again, it defaults to the highest unlocked tier.
- Daily Special chooses from currently unlocked tiers and intentionally bypasses normal three-option selection after activation.

## Content scaling
Additional templates can be added to a tier without changing progression logic. New templates must use stable IDs, truthful clues and valid item pools; content-scale tests verify that every tier references existing, distinct lot IDs.

## Save compatibility
`reputationXp` remains part of save version 1. Expanding tier lot arrays does not mutate persisted player state or require a migration.

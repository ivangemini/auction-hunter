# Rival dealers v0.2

## Purpose
The same named dealers appear across auctions so players can learn behavior rather than treating every NPC as an interchangeable random budget.

Rival identity and tuning live in `src/data/balance.ts`; valuation logic lives in `src/domain/auction.ts`. The auction scene only presents the dealer name, visible behavior/specialty text and current tell.

## Stable dealers
The initial roster is intentionally small and persistent:

| Dealer | Visible behavior | Specialty | Specialty value premium |
| --- | --- | --- | ---: |
| Victor | cautious reseller | electronics + tools | 18% |
| Mira | margin-focused | watches + art | 24% |
| Anton | pushes auctions hard | toys + collectibles | 28% |

The same dealer ID always keeps the same specialty. This makes repeated exposure useful knowledge.

## Hidden budget model
Each generated lot already has a hidden appraised value based on the exact generated copies. For a rival, matching specialty items are valued at that dealer's specialty multiplier before the dealer's normal hidden-value factor is sampled.

Conceptually:

`rival lot value = normal hidden value + specialty item value × (specialty multiplier - 1)`

The existing bidder-specific hidden-value factor is then applied and the result is rounded to the lot's bid increment.

Consequences:
- a dealer does not receive a flat advantage on every lot;
- a mixed lot only receives the premium on the relevant share of hidden value;
- clue-reading becomes more useful because visible category signals can imply which rival may stay in longer;
- per-copy condition/traits still matter because rival pressure starts from the concrete generated appraisal rather than catalog base value.

## Learned behavior
The specialty is visible beside each dealer's personality text. Exact max bids remain hidden and are still communicated only through `calm` / `watching` / `hesitating` / `out` tells.

This is the intended learning loop: the player knows what a rival likes, sees truthful clues for the lot, watches tells during bidding, and gradually learns when a named dealer is likely to create extra pressure.

## Economy guardrails
- Specialty multipliers are additive only on matching item value, not the whole lot.
- Domain code clamps specialty multipliers to a maximum of 2× as a defensive bound.
- Profiles without a specialty preserve the old valuation behavior exactly.
- No save migration is required: dealer identities/specialties are content definitions, not player-owned state.

## Validation
Domain tests protect both compatibility and specialty behavior:
- old profiles without specialties produce the same budgets as before;
- a matching category increases rival valuation;
- an unrelated specialty does not alter lot valuation;
- resulting budgets still use the existing bid-increment rounding and eligibility rules.

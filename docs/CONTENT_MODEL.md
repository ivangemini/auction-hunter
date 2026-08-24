# Content model

Auction Hunter should scale to hundreds or thousands of collectible items without requiring scene rewrites.

## Stable identifiers
Every persistent content entity must have a stable machine ID. IDs may appear in saves, analytics and collection progress, so treat them as long-lived contracts.

Rules:
- unique within entity type;
- lowercase machine-readable convention;
- never reuse an ID for different content;
- do not rename after release without migration/alias support.

## Item definition responsibilities
An item definition owns or references:
- stable ID;
- localized display name;
- category;
- rarity;
- baseline value;
- runtime art ID/asset;
- auction availability through lot pools.

Do not put runtime ownership, appraised outcome or player-specific condition directly in static definitions.

## Lot template responsibilities
A lot template describes generation inputs, not one player's generated lot:
- stable ID and optional reusable `artId`;
- localized title/location;
- reserve price and bid increment;
- item pool and item count;
- clue definitions.

### Clue contract
A clue is no longer decorative copy. Each clue contains localized text plus a machine-readable signal (`categories` or explicit `itemIds`). During lot generation, every clue attempts to reserve one unique matching find before the remaining slots are filled randomly.

This creates partial but truthful pre-auction information: the player does not know the exact item, condition or market factor, but can reason about the kinds of value hidden in the lot.

New clues must always have at least one eligible match in the owning lot's item pool.

## Runtime instances
Generated lot/item instances reference stable definitions and carry runtime outcomes separately. Condition, appraisal, restoration outcome and sale/keep decisions are runtime state, not catalog identity.

## Localization
Display copy is content, not identity. IDs must not depend on English/Russian names.

## Scale safeguards
Before large content imports, add automated checks for:
- duplicate IDs;
- missing locale strings;
- invalid rarity/category references;
- impossible value ranges;
- broken asset references;
- lot pools referencing missing items;
- clue signals with no eligible item in the owning lot.

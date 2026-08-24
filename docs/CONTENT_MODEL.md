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
- localized display name/description;
- category/set;
- rarity;
- baseline value/tuning range;
- art/asset reference or temporary visual archetype alias;
- restoration/condition metadata when implemented;
- discovery/auction availability tags.

Do not put runtime ownership, appraised outcome or player-specific condition directly in static definitions.

## Lot template responsibilities
A lot template describes generation inputs, not one player's generated lot:
- stable ID;
- localized title/location/clues;
- reserve/bid tuning;
- eligible item pools/tags;
- item-count range;
- tier/availability requirements;
- truthful clue signals;
- future rarity/condition biases.

## Runtime instances
Generated lot/item instances reference stable definitions and carry runtime outcome values separately. This lets balance/content definitions evolve without mutating historical identity.

## Localization
Display copy is content, not identity. IDs must not depend on English/Russian names.

## Current scale
The v1 content pass contains 24 item identities, 18 lot templates and 8 collection sets. The 12 original items have dedicated SVG art. The 12 added identities intentionally reuse related original visual archetypes through `src/game/art.ts`; this is an interim art strategy, not final asset completion.

## Scale safeguards
Automated tests check:
- duplicate item/lot IDs;
- missing tier lot references;
- lot pools referencing missing items;
- clue signals that cannot match anything in their lot pool;
- v1 target counts for items/lots/tier variants;
- collection coverage for every catalog item;
- RU/EN localization parity through the i18n gate.

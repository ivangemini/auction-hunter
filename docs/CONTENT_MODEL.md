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
- art/asset reference;
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
The current breadth pass contains 36 item identities, 24 lot templates and 12 collection sets. All 36 catalog items have direct dedicated SVG art identities. The lot catalog uses nine authored environment illustrations across the three auction tiers; multiple lot templates may intentionally share an environment while retaining distinct names, clues, pools and economy tuning.

Each tier now owns eight normal-auction lot templates. This increases the number of possible three-option market combinations while preserving the existing tier progression and save schema.

## Scale safeguards
Automated tests check:
- duplicate item/lot IDs;
- missing tier lot references;
- lot pools referencing missing items;
- clue signals that cannot match anything in their lot pool;
- target counts for items/lots/tier variants;
- collection coverage for every catalog item;
- direct item-art coverage and declared lot environments;
- RU/EN localization parity through the i18n gate.

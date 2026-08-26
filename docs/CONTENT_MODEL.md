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
The runtime catalog now contains 72 item identities, 42 normal-auction lot templates and 36 collection sets. All 72 catalog items have direct dedicated SVG art identities and every item belongs to at least one collection goal.

The 42 normal-auction templates are split evenly across the three reputation tiers: fourteen Garage, fourteen Estate and fourteen Collector variants. They reuse nine authored semantic environment illustrations while retaining distinct localized names, truthful clues, item pools and economy tuning.

The original breadth packs establish the core collectible catalog; P9 adds campaign-linked investigation, archive, communications, expedition, clearance and dispatch objects without renaming old IDs or changing the save schema. Each P9 breadth identity is routed through at least two truthful normal-auction lots, and the final six identities also participate in optional post-campaign Black Ledger Discovery cases.

## Scale safeguards
Automated tests check:
- duplicate item/lot IDs;
- missing tier lot references;
- lot pools referencing missing items;
- clue signals that cannot match anything in their lot pool;
- target counts for items/lots/tier variants;
- collection coverage for every catalog item;
- direct item-art coverage and declared lot environments;
- P9 breadth-route truthfulness and idempotent registration;
- RU/EN localization parity through the i18n gate.

The production breadth visual-review gate additionally requests every additive SVG directly, enforces the `512×360` viewBox/no-embedded-text contract, captures each P9 art wave, and traverses all Collection Book pages in RU and EN so catalog growth cannot silently outpace review coverage.

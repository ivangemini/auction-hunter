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
An item definition should eventually own or reference:
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
A lot template should describe generation inputs, not one player's generated lot:
- stable ID;
- localized title/location/clues;
- reserve/bid tuning;
- eligible item pools/tags;
- item-count range;
- tier/availability requirements;
- future rarity/condition biases.

## Runtime instances
Generated lot/item instances should reference stable definitions and carry runtime outcome values separately. This lets balance/content definitions evolve without mutating historical identity.

## Localization
Display copy is content, not identity. IDs must not depend on English/Russian names.

## Scale safeguards
Before large content imports, add automated checks for:
- duplicate IDs;
- missing locale strings;
- invalid rarity/category references;
- impossible value ranges;
- broken asset references;
- lot pools referencing missing items.

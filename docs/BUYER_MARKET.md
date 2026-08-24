# Buyer Market and collectible traits

## Purpose
The Buyer Market turns kept inventory into an economic decision rather than a purely completionist choice. A find can be sold immediately during lot resolution, quick-sold later from the Collection Book, or held for a specialist buyer who may pay a substantial premium.

## Daily market
Each local calendar day exposes three deterministic offers:
- two category buyers drawn from watches, electronics, toys, art, tools and general collectibles;
- one specialist buyer targeting collectible traits.

The same day key always produces the same offers. Each offer can purchase exactly one matching collection item that day. The claimed-offer list resets when the local day changes.

Category premiums currently range from 15% to 30% above the concrete copy's saved appraisal. Specialist premiums range from 32% to 50% above the concrete copy's saved appraisal. This is intentionally stronger than Collection Book quick-sale rates so holding a strong example can create a meaningful future payoff.

## Identity traits and per-copy variants
Stable identity traits still describe properties inherent to a catalog item, including:
- Signed;
- First edition;
- Original package;
- Limited run;
- Prototype;
- Mechanical;
- Period design;
- Provenance.

Each generated find may additionally roll a concrete-copy variant after its normal condition and market-factor sampling. Positive variants include Complete set, Rare variant and Documented history. Negative variants include Replacement parts, Incomplete and Authenticity risk.

Variant probabilities scale by rarity: better items have a higher chance of a positive distinguishing property and a lower chance of a negative one. Variant multipliers are bounded so they can create a meaningful surprise without producing unbounded economy spikes. The generator prevents contradictory `Complete set` + `Incomplete` combinations.

Traits are shown after appraisal and in collection/Buyer Market views. They do not alter stable set identity: collection-set progression still uses catalog item IDs.

## Concrete inventory instances
`collection` remains the compatibility/index layer used by existing collection-set and achievement logic. In parallel, `collectionItems` stores one record for every owned copy:
- unique instance ID;
- stable catalog item ID;
- saved appraised value;
- condition;
- restoration state/grade;
- exact trait IDs;
- acquisition timestamp.

Keeping an item after appraisal writes the exact current copy, including any restoration performed during that lot. Two copies of the same catalog item can therefore have different condition, traits and economic value.

Older v1 saves with only `collection: string[]` normalize into one legacy instance per owned ID. Legacy instances use catalog base value and stable identity traits, so existing players keep all inventory without a reset or save-version bump.

## Economy rules
- Immediate sale during lot resolution is the liquidity-first option and realizes the generated appraisal immediately.
- Collection quick-sale remains always available and preserves the Warehouse upgrade. For duplicates it uses the lowest-appraised owned copy first, protecting stronger specimens from accidental disposal.
- Buyer Market uses the concrete copy's saved appraisal as its premium basis, so condition, variant traits and restoration continue to matter after the auction ends.
- The market automatically surfaces the highest-value matching concrete copy for each offer.
- Selling to a buyer removes that exact instance plus one matching entry from the compatibility collection index.
- Buyer sales count toward lifetime sales and daily `itemsSold` / `salesValue` contract progress.
- Selling the last copy of a set item can reduce unfinished set progress, exactly like normal collection resale.

## Persistence
The save schema remains `version: 1` and uses additive fields:
- `buyerMarketDayKey`;
- `claimedBuyerOfferIds`;
- `collectionItems` for concrete owned copies.

Normalization sanitizes instance values/conditions/traits and reconciles instances against the legacy collection ID list. Orphan instance records are ignored, and missing legacy instances are synthesized rather than deleting progression.

## Analytics
`item_appraised` can record the concrete trait IDs and combined trait multiplier.

`buyer_sale_completed` records:
- buyer ID;
- sold item ID;
- local day key;
- realized value;
- buyer multiplier;
- exact concrete-copy trait IDs.

The buyer-sale event is also a Yandex Metrica goal so market adoption and value can be compared against normal item disposition and retention.

## Follow-up depth
The next trading-depth work should not add another major responsibility directly to `AuctionScene.ts`. Decompose that scene first, then deepen restoration choices, persistent rival specialties, set perks and longer discovery chains.

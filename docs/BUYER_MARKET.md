# Buyer Market and collectible traits

## Purpose
The Buyer Market turns kept inventory into an economic decision rather than a purely completionist choice. A find can be sold immediately during lot resolution, quick-sold later from the Collection Book, or held for a specialist buyer who may pay a substantial premium.

## Daily market
Each local calendar day exposes three deterministic offers:
- two category buyers drawn from watches, electronics, toys, art, tools and general collectibles;
- one specialist buyer targeting collectible traits.

The same day key always produces the same offers. Each offer can purchase exactly one matching collection item that day. The claimed-offer list resets when the local day changes.

Category premiums currently range from 15% to 30% above the concrete copy's saved appraisal. Specialist premiums range from 32% to 50% above the concrete copy's saved appraisal before permanent collection expertise. This is intentionally stronger than Collection Book quick-sale rates so holding a strong example can create a meaningful future payoff.

## Permanent collection expertise
Claimed Collection Book sets grant permanent category expertise. Every claimed set contributes **+4 percentage points** for its configured item category, stacking to a global **+12 percentage-point cap**.

Pricing uses:

`realized value = round(saved appraisal × (buyer multiplier + category expertise bonus))`

The expertise bonus is additive to the multiplier. For example, a 1.22 electronics buyer plus two claimed electronics expertise sets becomes 1.30, not `1.22 × 1.08`.

Category buyers naturally apply expertise to their category. Trait-specialist buyers resolve expertise from the category of the exact concrete copy they match, so the same specialist offer can price two otherwise valid items differently when the player's permanent expertise differs by category.

Buyer Market preview and `GameStore.sellToBuyer` use the same helper and claimed-set source, preventing a displayed offer from diverging from the realized transaction. When a concrete match receives expertise, the buyer dossier exposes the added expertise percentage directly.

Expertise is derived from the existing `claimedSetRewards` state. It requires no new save version or migration and remains active after the player later sells items from a completed set.

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
- Permanent expertise is then added to the buyer multiplier for the concrete copy's category, capped at +12 percentage points.
- The market automatically surfaces the highest-value matching concrete copy for each offer after expertise pricing is applied.
- Selling to a buyer removes that exact instance plus one matching entry from the compatibility collection index.
- Buyer sales count toward lifetime sales and daily `itemsSold` / `salesValue` contract progress.
- Selling the last copy of a set item can reduce unfinished set progress, exactly like normal collection resale; already claimed expertise is never revoked.

## Persistence
The save schema remains `version: 1` and uses additive fields already present in the game:
- `buyerMarketDayKey`;
- `claimedBuyerOfferIds`;
- `collectionItems` for concrete owned copies;
- `claimedSetRewards`, which now also acts as the source of permanent expertise unlocks.

Normalization sanitizes instance values/conditions/traits and reconciles instances against the legacy collection ID list. Orphan instance records are ignored, and missing legacy instances are synthesized rather than deleting progression.

## Analytics
`item_appraised` can record the concrete trait IDs and combined trait multiplier.

`buyer_sale_completed` records:
- buyer ID;
- sold item ID;
- local day key;
- realized value;
- effective buyer multiplier after collection expertise;
- exact concrete-copy trait IDs.

The buyer-sale event is also a Yandex Metrica goal so market adoption and value can be compared against normal item disposition and retention.

## Follow-up depth
The next retention-depth target after permanent set expertise is longer legendary discovery chains that span multiple auctions without moving another major responsibility back into `AuctionScene.ts`.

# Buyer Market and collectible traits

## Purpose
The Buyer Market turns kept inventory into an economic decision rather than a purely completionist choice. A find can be sold immediately during lot resolution, quick-sold later from the Collection Book, or held for a specialist buyer who may pay a substantial premium.

## Daily market
Each local calendar day exposes three deterministic offers:
- two category buyers drawn from watches, electronics, toys, art, tools and general collectibles;
- one specialist buyer targeting collectible traits.

The same day key always produces the same offers. Each offer can purchase exactly one matching collection item that day. The claimed-offer list resets when the local day changes.

Category premiums currently range from 15% to 30% above catalog base value. Specialist premiums range from 32% to 50% above catalog base value. These values are intentionally stronger than Collection Book quick-sale rates so holding inventory can create a meaningful future payoff.

## Traits
Traits are stable market/provenance tags attached to selected item identities. Initial traits include:
- Signed;
- First edition;
- Original package;
- Limited run;
- Prototype;
- Mechanical;
- Period design;
- Provenance.

Traits are visible in the Collection Book and are used by specialist buyers. They do not alter set identity: collection/set progression still uses stable item IDs.

This first version intentionally uses stable identity-level traits rather than per-copy randomized serial numbers/defects. Per-copy traits require an inventory-instance persistence model and should be added only after the large Auction scene is decomposed so that reveal/appraisal UI and save migration can be changed safely.

## Economy rules
- Immediate sell during lot resolution remains the liquidity-first option based on the generated appraisal.
- Collection quick-sale remains always available and preserves the existing Warehouse upgrade value.
- Buyer Market offers are optional, limited and higher-value.
- Selling to a buyer removes exactly one copy from collection inventory.
- Buyer sales count toward lifetime sales and daily `itemsSold` / `salesValue` contract progress.
- Selling the last copy of a set item can reduce unfinished set progress, exactly like normal collection resale.

## Persistence
The existing save schema version remains `1` and receives two additive fields:
- `buyerMarketDayKey`;
- `claimedBuyerOfferIds`.

Older v1 saves normalize these fields to `null` and `[]` without resetting cash, collection or progression.

## Analytics
`buyer_sale_completed` records:
- buyer ID;
- sold item ID;
- local day key;
- realized value;
- buyer multiplier;
- applicable collectible trait IDs.

The event is also a Yandex Metrica goal so buyer-market adoption and value can be compared against normal item disposition and retention.

## Follow-up depth
The next deeper iteration can add per-copy traits such as condition defects, serial-number rarity, replaced parts and discovered provenance. That iteration should persist individual inventory instances instead of overloading the current string-ID collection model.

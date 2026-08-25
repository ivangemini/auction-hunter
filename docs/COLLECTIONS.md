# Collection Book v0.5

## Purpose
The collection book creates a session-to-session reason to keep selected finds instead of always maximizing immediate cash. It also provides a recovery route so collecting cannot permanently strand the bankroll.

Progress is based on unique kept item IDs. Duplicate copies remain valid inventory but do not advance a set twice.

## Current sets
The expanded catalog contains 12 sets covering all 36 item identities:
- Retro Tech — cassette player, film camera, rare handheld console — 1,200 ₽.
- Timekeepers — brass desk clock, 1930s pocket watch — 900 ₽.
- Toy Vault — vintage toy robot, prototype collectible toy — 1,000 ₽.
- Treasure Shelf — toolbox, vinyl records, telescope, signed poster, silver ring — 1,600 ₽.
- Field Tech — multimeter, pocket radio, instant camera — 1,100 ₽.
- Street Nostalgia — tin car, mini console, pre-production figure — 1,500 ₽.
- Optics & Print — binoculars, numbered gallery print, old comics — 1,300 ₽.
- Travel Case — travel clock, enamel brooch, military watch — 1,600 ₽.
- Repair Bench — soldering station, multimeter, pocket radio, pocket television — 1,500 ₽.
- Miniature Worlds — model train, tin car, toy robot, clockwork automaton — 2,200 ₽.
- Estate Library — manual typewriter, fountain pen, first-edition book, porcelain figurine — 2,300 ₽.
- Patron Vault — Art Deco lamp, signed rare vinyl, master artist study, mechanical chronograph — 3,200 ₽.

Set overlap is intentional: an item can contribute to more than one themed long-term goal. Automated content coverage guarantees every catalog item appears in at least one set.

## Reward rules
- A set becomes claimable only when every required unique item is owned.
- Each set reward can be claimed once.
- Claiming pays the cash reward and permanently activates that set's expertise perk.
- Selling an item can reduce current set progress.
- A reward and expertise perk already claimed are never revoked and cannot be claimed again.
- Showroom upgrades may scale the actual cash reward through the existing meta-progression rule; expertise values are not scaled by business upgrades.

## Permanent expertise
Claimed sets now provide a lasting reason to complete the Collection Book beyond the one-time cash payout.

Each set grants **+4 percentage points** to Buyer Market pricing for one item category. Multiple claimed sets for the same category stack to a global **+12 percentage-point cap**. The bonus is added to the buyer's normal multiplier rather than multiplying the premium again.

Current expertise mapping:
- Electronics — Retro Tech, Field Tech.
- Watches — Timekeepers, Travel Case.
- Toys — Toy Vault, Street Nostalgia, Miniature Worlds.
- Collectibles — Treasure Shelf, Estate Library.
- Art — Optics & Print, Patron Vault.
- Tools — Repair Bench.

The perk is derived from the existing `claimedSetRewards` IDs. No new save field or migration is required. Once claimed, expertise remains active even if the player later sells one of the items that originally completed the set.

For category Buyer Market offers, expertise applies to the matching category directly. For trait-specialist offers, expertise follows the category of the concrete matched copy, so a signed art item and a signed collectible can receive different permanent bonuses from the same specialist buyer.

Collection Book previews the permanent expertise before claim and changes the set state to `EXPERTISE ACTIVE` after claim so the long-term reward is visible rather than hidden in economy math.

## Concrete copies
The compatibility `collection: string[]` list remains the source for set membership and copy counts. Every owned entry is also represented by a concrete `collectionItems` record containing its appraisal, condition, restoration state, traits and acquisition timestamp.

Keeping a find stores its post-appraisal/post-restoration state. Two copies of the same catalog identity can therefore have different values and traits while still counting as the same unique set item.

Older saves that contain only the legacy ID list automatically receive one synthesized instance per owned entry; no collection reset or save-version migration prompt is required.

## Inventory resale
Owned item icons are interactive. The item card shows copy count and, when concrete instance data exists, details for the lowest-value owned copy.

Quick-sale value is derived from that concrete copy's saved appraisal and the current Warehouse resale rate. The lowest-appraised duplicate is intentionally sold first so emergency liquidity does not silently destroy the player's strongest specimen.

Selling removes exactly one matching compatibility entry and the corresponding concrete instance, adds cash, increments lifetime sales and persists through the same local/cloud save boundary as other economy mutations.

This is an anti-soft-lock path, not an optimal trading strategy; the resale haircut preserves the opportunity cost of keeping finds. Higher-value concrete copies may be more profitable through Buyer Market specialist demand and permanent collection expertise.

## Pagination and scale
Collection Book displays four sets per page. Twelve sets therefore occupy three pages without requiring a layout redesign, and further breadth can continue through the same pagination model.

## Multi-scene save consistency
`GameStore` reloads persisted state before reads and mutations. Auction, collection and Buyer Market scenes therefore cannot overwrite one another with stale snapshots.

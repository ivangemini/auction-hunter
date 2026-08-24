# Collection Book v0.4

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
- Selling an item can reduce current set progress.
- A reward already claimed is never revoked and cannot be claimed again.
- Showroom upgrades may scale the actual reward through the existing meta-progression rule.

## Concrete copies
The compatibility `collection: string[]` list remains the source for set membership and copy counts. Every owned entry is also represented by a concrete `collectionItems` record containing its appraisal, condition, restoration state, traits and acquisition timestamp.

Keeping a find stores its post-appraisal/post-restoration state. Two copies of the same catalog identity can therefore have different values and traits while still counting as the same unique set item.

Older saves that contain only the legacy ID list automatically receive one synthesized instance per owned entry; no collection reset or save-version migration prompt is required.

## Inventory resale
Owned item icons are interactive. The item card shows copy count and, when concrete instance data exists, details for the lowest-value owned copy.

Quick-sale value is derived from that concrete copy's saved appraisal and the current Warehouse resale rate. The lowest-appraised duplicate is intentionally sold first so emergency liquidity does not silently destroy the player's strongest specimen.

Selling removes exactly one matching compatibility entry and the corresponding concrete instance, adds cash, increments lifetime sales and persists through the same local/cloud save boundary as other economy mutations.

This is an anti-soft-lock path, not an optimal trading strategy; the resale haircut preserves the opportunity cost of keeping finds. Higher-value concrete copies may be more profitable through Buyer Market specialist demand.

## Pagination and scale
Collection Book displays four sets per page. Twelve sets therefore occupy three pages without requiring a layout redesign, and further breadth can continue through the same pagination model.

## Multi-scene save consistency
`GameStore` reloads persisted state before reads and mutations. Auction, collection and Buyer Market scenes therefore cannot overwrite one another with stale snapshots.

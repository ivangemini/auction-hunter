# Collection Book v0.3

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

## Inventory resale
Owned item icons are interactive. The item card shows copy count and a quick-sale value derived from the catalog base value and the current Warehouse resale rate.

Selling removes exactly one matching collection entry, adds cash, increments lifetime sales and persists through the same local/cloud save boundary as other economy mutations.

This is an anti-soft-lock path, not an optimal trading strategy; the resale haircut preserves the opportunity cost of keeping finds.

## Pagination and scale
Collection Book displays four sets per page. Twelve sets therefore occupy three pages without requiring a layout redesign, and further breadth can continue through the same pagination model.

## Multi-scene save consistency
`GameStore` reloads persisted state before reads and mutations. Auction and collection scenes therefore cannot overwrite one another with stale snapshots.

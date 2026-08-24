# Collection Book v0.2

## Purpose
The collection book creates a session-to-session reason to keep selected finds instead of always maximizing immediate cash. It now also provides a recovery route so collecting cannot permanently strand the bankroll.

Progress is based on unique kept item IDs. Duplicate copies remain valid inventory but do not advance a set twice.

## Sets
- Retro Tech — cassette player, film camera, rare handheld console — 1,200 ₽ reward.
- Timekeepers — brass desk clock, 1930s pocket watch — 900 ₽ reward.
- Toy Vault — vintage toy robot, prototype collectible toy — 1,000 ₽ reward.
- Treasure Shelf — toolbox, vinyl records, telescope, signed poster, silver ring — 1,600 ₽ reward.

## Reward rules
- A set becomes claimable only when every required unique item is owned.
- Each set reward can be claimed once.
- Selling an item can reduce current set progress.
- A reward already claimed is never revoked and cannot be claimed again.

## Inventory resale
Owned item icons are interactive. The item card shows copy count and a quick-sale value equal to 65% of catalog base value, rounded to gameplay currency precision.

Selling removes exactly one matching collection entry, adds cash, increments lifetime sales and persists through the same local/cloud save boundary as other economy mutations.

This is an anti-soft-lock path, not an optimal trading strategy; the haircut preserves the opportunity cost of keeping finds.

## Multi-scene save consistency
`GameStore` reloads persisted state before reads and mutations. Auction and collection scenes therefore cannot overwrite one another with stale snapshots.

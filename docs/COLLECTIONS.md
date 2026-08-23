# Collection Book v0.1

## Purpose
The collection book creates a session-to-session reason to keep selected finds instead of always maximizing immediate cash. Progress is based on unique kept item IDs; duplicate copies remain valid collection inventory but do not advance a set twice.

## Sets
- Retro Tech — cassette player, film camera, rare handheld console — 1,200 ₽ reward.
- Timekeepers — brass desk clock, 1930s pocket watch — 900 ₽ reward.
- Toy Vault — vintage toy robot, prototype collectible toy — 1,000 ₽ reward.
- Treasure Shelf — toolbox, vinyl records, telescope, signed poster, silver ring — 1,600 ₽ reward.

Together the four sets cover all 12 launch items.

## Reward rules
- A set becomes claimable only when every required unique item has been kept at least once.
- Each set reward can be claimed once.
- Claimed set IDs are persisted in `auction-hunter.save.v1` as `claimedSetRewards`.
- Existing v1 saves migrate forward without reset because the new array defaults to empty and is sanitized on load.

## Multi-scene save consistency
`GameStore` reloads the persisted state before reads and mutations. This prevents the auction and collection scenes from overwriting one another with stale in-memory snapshots.

# Meta progression v1

## Purpose
The Office turns cash and repeat play into durable goals beyond simply unlocking the three auction tiers. It deliberately reuses the existing auction loop instead of adding a second currency.

## Daily contracts
Three contracts are selected deterministically for each local calendar day. Progress is reset when the day key changes. Current contract metrics are auctions played, auctions won, items sold, items kept and sales value.

Contracts are optional bonus goals: failing to complete them never blocks the core loop. The Contracts Desk upgrade increases their cash rewards by 10% per level.

## Achievements
Achievements are permanent milestones derived from durable save metrics such as auctions played/won, unique collection size, lifetime sales, claimed sets, reputation and highest bankroll. Rewards can be claimed once.

## Business upgrades
All upgrades have three levels and are bought with normal cash, creating long-term sinks without introducing a premium-like currency.

- Warehouse & logistics: collection quick-sale rate improves from 65% to 80% of base value.
- Contracts desk: daily contract rewards improve from 1.00x to 1.30x.
- Showroom: collection-set rewards improve from 1.00x to 1.30x.

Upgrade costs rise sharply by level so early bankroll decisions remain meaningful.

## Save compatibility
The save remains `version: 1` and receives additive fields with defaults. Older local/cloud saves normalize into the expanded shape without reset. Cloud conflict scoring also recognizes achievement and upgrade progression as tie-break information.

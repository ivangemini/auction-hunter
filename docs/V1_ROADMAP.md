# Auction Hunter — v1.0 roadmap

This roadmap starts from the MVP+ build and tracks the path to a durable first release. It is intentionally ordered by player value, not implementation novelty.

## A. Long-term goals and meta
- [x] Daily contracts: three deterministic goals per local day with claimable cash rewards.
- [x] Achievement milestones with one-time rewards.
- [x] Business Office scene as the meta-progression hub.
- [x] Three cash-funded business upgrade paths.
- [x] Lifetime statistics dashboard.
- [x] Recent auction history with up to 20 cloud-persisted lot outcomes.
- [ ] Daily login/return streak only if retention data shows it adds value without harmful FOMO.

## B. Auction depth
- [x] Truthful clue-backed generation.
- [x] Risky NPC bidding where blindly forcing every win is not optimal.
- [x] One restoration attempt per won lot.
- [x] Bidder personality tells/reactions communicate pressure without exposing exact max bids.
- [x] Rare visible lot modifiers/events alter quantity, condition, reserve or market value.
- [x] Paid advanced inspection unlocked at 220 REP; reports broad condition and rare+ signals without exposing exact hidden value/items.

## C. Content scale
- [x] 18 lot templates: 6 Garage, 6 Estate and 6 Collector variants.
- [x] 24 collectible items.
- [x] 8 collection sets covering the full 24-item catalog.
- [x] Content validation for IDs, pools, clue signals, tier coverage and collection coverage.
- [x] Replayability regression floor for content count, tier variety, contracts, achievements, upgrades and lot modifiers.
- [ ] Second art pass for the 12 new item identities and additional lot backgrounds; current expansion uses intentional visual archetype aliases rather than generic fallback art.

## D. Return loops
- [x] Daily Special.
- [x] Daily contracts.
- [x] Achievement completion chase.
- [x] Business upgrades and collection-set progression provide persistent medium/long-term goals.
- [ ] Weekly/featured objective only after daily behavior is measured.
- [ ] Featured collection/set rotation if collection engagement justifies it.

## E. Economy and telemetry
- [x] Anti-soft-lock collection resale.
- [x] Rewarded ads do not penalize keeping collectibles.
- [x] Business upgrade sinks to prevent meaningless cash inflation.
- [x] Economy simulation/regression tests for representative blind-force behavior and starting-bankroll accessibility.
- [x] Advanced inspection is a bounded optional cash sink with typed analytics.
- [ ] First real-traffic tuning pass using win/loss, bankruptcy, lot-profit and retention telemetry.
- [ ] IAP/store decision remains gated on retention and monetization data.

## F. Release quality
- [x] RU/EN baseline localization.
- [x] Landscape-first mobile guard and larger touch targets.
- [x] Accessibility controls for sound feedback, reduced motion and higher contrast.
- [x] Yandex release archive workflow and moderation checklist.
- [x] Documented content-duration/replayability evidence aligned with Yandex requirement 2.9.
- [ ] Timed 10+ minute run in the real Yandex draft on a fresh save.
- [ ] Real Yandex draft/device QA.

## v1.0 definition
Auction Hunter can be called a full v1.0 when the core auction loop is proven in the real Yandex draft/traffic and the game has durable goals beyond the first tier unlocks. The code-side v1 systems are now substantially present: daily objectives, achievements, meaningful cash sinks/business progression, history, advanced auction information layers, sufficient catalog variety, stable economy recovery and accessibility controls. Remaining release gates are the second visual polish pass plus real draft/device/content-duration validation and telemetry-driven tuning.
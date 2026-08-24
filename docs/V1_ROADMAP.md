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
- [x] Three-option normal-auction market with Dealer Memory from prior personal outcomes.

## C. Content scale
- [x] 24 lot templates: 8 Garage, 8 Estate and 8 Collector variants.
- [x] 36 collectible item identities.
- [x] 12 collection sets covering the full 36-item catalog.
- [x] Content validation for IDs, pools, clue signals, tier coverage and collection coverage.
- [x] Replayability regression floor for content count, tier variety, contracts, achievements, upgrades and lot modifiers.
- [x] Direct SVG art for all 36 item identities and 9 reusable lot environments across the three tiers.

## D. Return loops
- [x] Daily Special.
- [x] Daily contracts.
- [x] Achievement completion chase.
- [x] Business upgrades and collection-set progression provide persistent medium/long-term goals.
- [x] Dealer Memory makes prior normal-auction experience useful in later sessions.
- [ ] Weekly/featured objective only after daily behavior is measured.
- [ ] Featured collection/set rotation if collection engagement justifies it.

## E. Economy and telemetry
- [x] Anti-soft-lock collection resale.
- [x] Rewarded ads do not penalize keeping collectibles.
- [x] Business upgrade sinks to prevent meaningless cash inflation.
- [x] Economy simulation/regression tests for representative blind-force behavior and starting-bankroll accessibility.
- [x] Advanced inspection is a bounded optional cash sink with typed analytics.
- [x] Rewarded, sparse interstitial and API-controlled sticky-banner launch monetization layers.
- [ ] First real-traffic tuning pass using win/loss, bankruptcy, lot-profit and retention telemetry.
- [ ] IAP/store decision remains gated on retention and monetization data.

## F. Release quality
- [x] RU/EN baseline localization.
- [x] Landscape-first mobile guard and larger touch targets.
- [x] Accessibility controls for sound feedback, reduced motion and higher contrast.
- [x] Yandex release archive workflow and moderation checklist.
- [x] Documented content-duration/replayability evidence aligned with Yandex requirement 2.9.
- [x] Cloud-save uploads serialized so stale requests cannot overtake newer pending progress.
- [ ] Timed 10+ minute run in the real Yandex draft on a fresh save.
- [ ] Real Yandex draft/device QA.

## v1.0 definition
Auction Hunter can be called a full v1.0 when the core auction loop is proven in the real Yandex draft/traffic and the game has durable goals beyond the first tier unlocks. The code/content-side v1 systems are substantially present: daily objectives, achievements, meaningful cash sinks/business progression, history/Dealer Memory, advanced auction information layers, a 36-item / 24-lot / 12-set catalog, direct catalog art coverage, stable economy recovery, monetization and accessibility controls. Remaining release gates require the real Yandex draft/device/content-duration validation and the first telemetry-driven tuning pass.

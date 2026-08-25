# P8 systemic replayability

## Status

P8 is implementation-complete. Post-release telemetry can tune numbers, but no planned P8 gameplay system remains required for the milestone.

## Goal
P8 increases meaningful variation per auction and gives players multi-session reasons to care about specific lots, copies and named rivals without adding a parallel campaign or duplicating Daily Special, Daily Contracts, Buyer Market, Office upgrades or Discovery Board.

The core loop remains:

`read visible lot information -> bid/pass -> reveal -> appraise -> restore/sell/keep -> use collection/trading/meta systems`

All P8 systems feed that loop.

## Persistent market trends
Market trends are deterministic from persisted `auctionsPlayed`. A trend is active for three normal auctions and then cools down for two before the next category cycle.

Six authored category trends cover electronics, watches, toys, art, tools and collectibles. The active trend has an explicit remaining-auction indicator before commitment.

A trend affects concrete item appraisal, rival valuation through the same bounded appraisal, normal lot-choice economics and category Buyer Market premiums for already-owned copies. Lot-selection relevance is derived only from truthful visible clues; hidden items are never inspected to produce a player-facing hint.

Typed analytics carries explicit `marketTrendId` and remaining-duration context through lot presentation/selection and Buyer Market sales, so trend effects can be measured independently from ordinary modifiers.

## Rare lot events and special rulesets
The visible modifier pool contains seventeen bilingual risk/reward identities. The added P8 breadth includes estate deadlines, archivist notes, dealer feuds, museum deaccession, courier damage, private previews and mixed pallets in addition to the original modifiers.

Two special rulesets sit inside the normal economy:

- `sealed-storage`: one visible clue, an extra find, cheaper entry and a coarser risk envelope;
- `vip-invitation`: Collector Club cadence with stronger item/value/condition economics and bounded rival pressure.

Both continue through ordinary reveal, appraisal, restoration, collection, trading and progression. Persistent market trends compose with them rather than replacing them.

## Collector Requests
Collector Requests rotate in six-auction windows rather than every day. Eight authored requests cover common, demanding and rare tiers.

A request can require category, one or more concrete-copy traits, minimum/maximum condition or combinations of those requirements. Fulfillment uses the exact inventory instance and its stored appraisal/condition/traits. The qualifying copy is removed once, the bounded premium is paid once for that request window, and normal sales/lifetime-sales/contracts/analytics continue to advance.

Requests are presented as a private commission inside Buyer Market, not as a fourth daily buyer card. They do not require a separate gameplay mode and do not leak active-lot hidden contents.

## Rival relationships
Eight persistent named dealers now participate. Only three appear in one auction, with specialist selection preferring dealers whose authored categories match the generated concrete lot.

Persistent dossier records track encounters, player wins and rival wins. Knowledge unlocks at 1, 3 and 6 encounters. The final stage reveals an authored weakness, never an exact max bid.

Each dealer owns a readable trait, at least two specialty categories, an authored weakness and one rare signature bid pattern. Signature activation is sparse, limited to once per rival per auction and can never exceed the already-generated normal ceiling. The roster therefore expands behavior breadth without secretly adding money.

## VIP and reputation cadence
Estate unlocks at 120 REP, Sealed Storage joins the progression later in Estate play, and Collector Club plus VIP availability arrive at the 320 REP late-game transition. Advanced Inspection remains another independent late-game milestone.

VIP is offered on a four-auction Collector cadence as one explicit choice rather than silently replacing normal Collector lots. Choosing or skipping it remains a player decision.

This is the P8 reputation extension: additional systemic unlocks are layered onto the existing REP track instead of adding a second XP currency.

## Provenance jackpot stories
There is no Mythic rarity color tier. Jackpot moments derive from unusually strong combinations of existing concrete-copy traits.

Current authored combinations include Archive-grade copy, Sealed first run, Matching mechanical copy and Documented prototype. The combination receives a small bounded bonus on top of existing trait valuation and appears only after appraisal with dedicated analytics.

## Discovery and completionism
Discovery Board now contains seven ordered multi-auction cases and paginates three cases at a time. Several cases contain alternative leads that converge back into the same investigation, and `The Black Glass Estate` is a five-stage case with two separate branching stages.

One-step-per-auction pacing and one-time rewards remain unchanged, so a single lucky lot cannot instantly clear a case.

Collection Book preserves historical completion independently of current inventory: identities ever discovered, best condition, best appraised value and discovered per-copy variant breadth. Keeping or immediately selling a freshly appraised copy both update history. Legacy v1 saves backfill from their current concrete inventory.

## Persistence and compatibility
All persistent P8 systems remain additive fields in save `version: 1` and normalize with legacy-safe defaults/backfills. Duplicate IDs in `collection` remain meaningful inventory copies and are never deduplicated by normalization.

## Analytics
P8 has explicit typed events/context for collector request completion, rival auction resolution, rival signature moves, jackpot provenance reveal, lot modifiers/VIP and persistent market trends. This permits separate retention/economy attribution without inferring hidden state.

## Economy guardrails
P8 multipliers are intentionally bounded:

- trends use capped multipliers;
- jackpot bonus is capped before the overall trait cap;
- rival specialty bonuses affect matching value only;
- signature moves never exceed normal ceilings;
- VIP pressure is fixed and visible through the format;
- Collector Request premiums are authored and bounded;
- Sealed/VIP reuse existing bid/reveal economics.

The original force-win simulation remains mandatory.

## 30/60/120-minute systemic simulation
`src/data/longHorizonEconomy.test.ts` stress-tests the combined systems with deterministic seeds and three visible-information policies: cheapest entry, trend-aware value/reserve selection and category-diversified selection.

The gate checks solvency and meaningful win access at 30/60/120 minutes, bounded runaway cash, absence of category collapse and occasional/optional VIP availability.

## P8 acceptance contract
`src/data/p8Acceptance.test.ts` is the milestone floor. It requires:

- at least 8 authored rivals;
- at least 17 visible lot modifiers;
- at least 6 persistent market trends;
- at least 8 Collector Requests;
- at least 7 Discovery cases, including a 5+ stage case with multiple branches;
- at least 4 bounded provenance jackpot combinations;
- gated and occasional Sealed/VIP formats inside normal reputation progression.

Existing compact-landscape and browser production gates cover the player-facing screens used by P8: lot selection/auction, Buyer Market/Collector Requests, Discovery Board, Collection Book and rival bidding UI. P8 did not introduce a parallel scene family that bypasses those gates.

## Prestige / New Game+ decision
Prestige is deliberately **not** part of P8. The design decision is closed: do not add a reset loop until released telemetry shows a meaningful cohort repeatedly reaching the current late game. Adding Prestige now would manufacture duration by replaying solved content and would conflict with P8's goal of systemic depth.

If telemetry later justifies Prestige, it becomes a separate post-release roadmap milestone with its own economy simulation and save-migration review rather than an unfinished P8 checkbox.

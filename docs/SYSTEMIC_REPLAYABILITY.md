# P8 systemic replayability

## Goal
P8 increases meaningful variation per auction and gives players multi-session reasons to care about specific lots, copies and named rivals without adding a parallel campaign or duplicating Daily Special, Daily Contracts, Buyer Market, Office upgrades or Discovery Board.

The core loop remains:

`read visible lot information -> bid/pass -> reveal -> appraise -> restore/sell/keep -> use collection/trading/meta systems`

All P8 systems feed that loop.

## Persistent market trends
Market trends are deterministic from persisted `auctionsPlayed`. A trend is active for three normal auctions and then cools down for two before the next category cycle.

Six authored category trends cover electronics, watches, toys, art, tools and collectibles. The active trend has an explicit remaining-auction indicator before commitment.

A trend affects:
- concrete item appraisal for exposed lots;
- rival valuation indirectly through the same concrete appraisal;
- normal lot-choice economics;
- category Buyer Market premiums for already-owned copies.

The system never inspects hidden items to tell the player that a lot is exposed. Lot-selection relevance is derived only from truthful visible clues.

## Rare lot events and special rulesets
The rare modifier pool contains thirteen bilingual visible events with bounded combinations of reserve, item count, condition, market value, clues and bid increment.

`sealed-storage` is the first genuinely different ruleset rather than a reskin:
- less information before bidding;
- a coarser bid increment/risk envelope;
- compensating lot economics;
- normal reveal/appraisal/restoration/collection afterward.

Modifiers compose with persistent market trends instead of replacing them.

## Collector Requests
Collector Requests rotate in six-auction windows rather than every day. Eight authored requests cover common, demanding and rare tiers.

A request can require:
- category;
- one or more concrete-copy traits;
- minimum or maximum condition;
- combinations of those requirements.

Fulfillment uses the exact inventory instance and its stored appraisal/condition/traits. The qualifying copy is removed once, the bounded premium is paid once for that request window, and normal sales/lifetime-sales/contracts/analytics continue to advance.

Requests are presented as a private commission inside Buyer Market, not as a fourth daily buyer card. They do not require a separate gameplay mode and do not leak active-lot hidden contents.

## Rival relationships
Six persistent named dealers currently participate. Only three appear in one auction, with up to two slots preferring dealers whose specialties match the generated concrete lot.

Persistent dossier records track:
- encounters;
- player wins against each participating rival;
- rival wins when that dealer is the actual leader after a player pass.

Knowledge unlocks at 1, 3 and 6 encounters. The final stage reveals an authored weakness, never an exact max bid.

Each dealer also owns one rare signature bid pattern. Activation is deterministic and sparse, use is limited to once per rival per auction, and the special response can never exceed the already-generated normal ceiling. Signature moves alter the shape of bidding rather than secretly adding money.

See `RIVALS.md` for the full roster and behavior contract.

## VIP auctions
VIP is a high-reputation Collector Club format:
- requires 650 REP;
- is offered on a five-auction cadence;
- appears as one explicit choice rather than silently replacing every Collector lot;
- grants a stronger item/value/condition profile at higher visible reserve and bid increment;
- adds a bounded 8% rival-ceiling pressure uplift.

Choosing or skipping VIP remains a player decision. The special format still uses ordinary reveal, appraisal, restoration, collection, Buyer Market and progression.

## Provenance jackpot stories
There is no new Mythic rarity color tier. Jackpot moments are derived from unusually strong combinations of existing concrete-copy traits.

Current authored combinations include:
- Archive-grade copy: provenance + rare variant;
- Sealed first run: first edition + factory sealed;
- Matching mechanical copy: mechanical + matching serials;
- Documented prototype: prototype + documented history.

The combination receives a small additional bounded multiplier on top of existing trait valuation. The reveal is surfaced only after appraisal with a dedicated provenance banner and typed analytics.

The combinations were intentionally selected so they are reachable: one side is normally an authored identity/provenance trait and the other can come from the existing per-copy variant roll.

## Discovery and completionism
Discovery Board has expanded from three to six ordered multi-auction cases and paginates three cases at a time. Ordered one-step-per-auction pacing and one-time completion rewards remain unchanged.

Collection Book now preserves historical completion information independently of current inventory:
- unique item identities ever discovered;
- best condition ever seen for each identity;
- best appraised value ever seen for each identity;
- breadth of positive/negative per-copy variant traits ever discovered.

Keeping or immediately selling a freshly appraised copy both update history. Legacy v1 saves backfill a baseline from their current concrete inventory. Selling a record copy later does not erase the record.

## Persistence and compatibility
All new persistent systems remain additive fields in save `version: 1` and are normalized with legacy-safe defaults/backfills.

Current additive P8 records include:
- `claimedCollectorRequests`;
- `rivalEncounters`;
- `rivalPlayerWins`;
- `rivalWins`;
- `discoveredItemIds`;
- `bestConditionByItem`;
- `bestValueByItem`;
- `discoveredVariantTraitIds`.

The canonical local-first/cloud-save boundary is unchanged. Duplicate IDs in `collection` remain meaningful inventory copies and must never be deduplicated by normalization.

## Analytics
P8 uses the existing typed analytics stream plus dedicated events for systems that need separate attribution:
- collector request completion;
- rival auction resolution;
- rival signature move use;
- jackpot provenance reveal.

Normal lot-option, auction-start/history and modifier IDs continue to carry visible modifier/VIP context. Market-trend-specific cross-system attribution remains an explicit future analytics refinement rather than being inferred from hidden state.

## Economy guardrails
P8 multipliers are intentionally layered behind deterministic tests:
- market trend multiplier is bounded;
- jackpot bonus is capped before the overall trait multiplier cap;
- rival specialty bonuses affect only matching item value;
- signature moves never exceed normal ceilings;
- VIP rival pressure is a visible, fixed +8%;
- Collector Request premiums are authored and bounded;
- sealed/VIP formats reuse existing bid/reveal economics.

The original force-win economy simulation remains mandatory.

## 30/60/120-minute systemic simulation
`src/data/longHorizonEconomy.test.ts` stress-tests the combined systems with deterministic seeds and three visible-information policies:
- cheapest visible entry;
- trend-aware value/reserve selection;
- category-diversified selection.

The model advances real reputation unlocks, market cycles, modifiers, VIP availability, concrete item rolls, rival specialties/ceilings and bankroll. Won lots are liquidated at appraisal as a deliberately aggressive stress assumption rather than a claim about optimal production play.

The gate checks:
- solvency and meaningful win access at 30, 60 and 120 minutes;
- bounded runaway cash;
- no collapse of trend-aware/diversified choice onto one category;
- VIP remains an occasional offered format rather than becoming the permanent late-game auction type.

It does not replace real telemetry or manual play. Hoarding behavior, Buyer Market timing, request opportunity cost and restoration decisions remain candidates for later scenario models/telemetry.

## Remaining P8 work
The largest intentionally open pieces are:
- grow rivals toward 8–10 only when new identities are mechanically distinct;
- explicit market-event attribution/history analytics beyond modifier IDs;
- branching Discovery leads rather than only more linear cases;
- dedicated seeded compact-landscape captures for learned dossier/VIP/jackpot states;
- telemetry-driven late-game reputation cadence and any Prestige/New Game+ decision;
- explicit hoarding/opportunity-cost simulation before closing the complete P8 acceptance gate.

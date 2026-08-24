# Economy and retention guardrails

This document defines design constraints and current pre-release tuning. Real tuning must be driven by telemetry after release.

## Retention thesis
The primary hook is uncertainty followed by reveal: inspect truthful partial information, risk bankroll, discover hidden items, then decide whether to realize value or keep collection progress.

Nested loops:
- seconds: next bid / next reveal;
- minutes: lot profit or loss;
- session: bankroll/reputation progress and unlocks;
- daily: special lot and collection goals;
- long term: rare sets, higher-value tiers and future business progression.

## Auction skill model
Visible clues are machine-backed signals. Each clue guarantees a matching type of find when the lot pool can satisfy it, while exact item, condition and market factor remain hidden.

NPC willingness-to-pay is intentionally much closer to hidden value than in the original vertical slice:
- cautious profile: 45–65% of generated appraisal;
- competitive profile: 60–85%;
- aggressive profile: 75–102%.

The player should not be able to profit safely by forcing every auction to completion. Pre-release Monte Carlo checks on the tuned pools target a meaningful minority of losing forced wins while keeping early Garage lots affordable often enough for first-session progress. Live telemetry remains the authority after release.

## Liquidity / anti-soft-lock
Collection inventory can be quick-sold at 65% of catalog base value. This is deliberately conservative: keeping a collectible has opportunity cost, but a player who spent most of the bankroll and kept the finds can recover enough liquidity to continue playing.

Set rewards remain one-time. Selling a last copy after claiming a set does not revoke the already-claimed reward and cannot make it claimable twice.

## Restoration economy
Condition still creates resale uplift, but restoration is now a lot-level scarce action: one restoration attempt per won lot. The timing game itself remains non-destructive for the first retention test; the strategic cost is choosing which find receives the one attempt.

## Rewarded monetization
The completed-round rewarded cash bonus remains 25% with a 150 ₽ floor and 600 ₽ cap, but its basis is now the total appraised value disposed during the round (`sales + kept appraisal`), not sales alone. Choosing collection progress therefore no longer reduces the offered ad reward.

Interstitials remain only at natural breaks. Never interrupt a bid, reveal interaction, restoration mini-game or transactional decision.

## Economy goals
- Early players must recover from ordinary mistakes.
- A single unlucky lot must not commonly soft-lock progression.
- Skill/information should matter alongside randomness.
- Better tiers should increase opportunity and variance, not only inflate every number.
- Keeping a collectible should create a meaningful opportunity cost versus selling it.
- Rare jackpots should feel exceptional without making normal lots pointless.

## Tuning rules for agents
For material economy changes:
1. state the target behavior/metric;
2. change the narrowest relevant parameters;
3. avoid simultaneous unrelated tuning;
4. preserve save compatibility;
5. update deterministic tests and this document when the model changes.

## Metrics to evaluate after release
- tutorial/core-loop completion;
- time to first bid/win/reveal;
- pass rate by lot/tier;
- winning bid / generated value ratio;
- lot profitability distribution;
- near-bankruptcy and collection-resale frequency;
- restoration usage and selected-item value;
- collection engagement;
- auctions/session and D1/D7 return behavior;
- rewarded opt-in/completion;
- ARPDAU/LTV only alongside retention and player experience.

Do not optimize ad impressions in isolation from retention.

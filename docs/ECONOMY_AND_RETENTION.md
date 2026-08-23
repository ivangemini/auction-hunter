# Economy and retention guardrails

This document defines design constraints, not final balance numbers. Real tuning should be driven by telemetry after release.

## Retention thesis
The primary hook is uncertainty followed by reveal: inspect partial information, risk bankroll, discover hidden items, then decide whether to realize value or keep collection progress.

Nested loops:
- seconds: next bid / next reveal;
- minutes: lot profit or loss;
- session: bankroll/reputation progress and unlocks;
- daily: special lot, collection goals and future daily tasks;
- long term: rare sets, business progression and high-tier auction access.

## Economy goals
- Early players must recover from ordinary mistakes.
- A single unlucky lot must not commonly soft-lock progression.
- Skill/information should matter alongside randomness.
- Better tiers should increase opportunity and variance, not only inflate every number.
- Keeping a collectible should create a meaningful opportunity cost versus selling it.
- Rare jackpots should feel exceptional without making normal lots feel pointless.

## Tuning rules for agents
Do not change reserve prices, value ranges, NPC bid factors, rarity rates or progression requirements casually. For material changes:
1. state the target behavior/metric;
2. change the narrowest relevant parameters;
3. avoid simultaneous changes to several economy systems unless intentionally running a full rebalance;
4. preserve save compatibility;
5. update this document if the economy model itself changes.

## Monetization guardrails
Rewarded ads may offer optional value such as:
- extra pre-auction information;
- optional expert appraisal assistance;
- post-lot convenience/value boosts;
- other benefits that do not make the unpaid loop deliberately bad.

Interstitials belong only at natural breaks. Never interrupt a bid, reveal interaction, restoration mini-game or transactional decision.

## Metrics to design for
When analytics exist, evaluate at least:
- tutorial/core-loop completion;
- time to first bid/win/reveal;
- session length;
- auctions per session;
- return behavior (D1/D7 where available);
- bankruptcy/near-bankruptcy frequency;
- lot profitability distribution;
- collection engagement;
- rewarded-ad opt-in and completion;
- ARPDAU/LTV only alongside retention and player experience.

Do not optimize ad impressions in isolation from retention.

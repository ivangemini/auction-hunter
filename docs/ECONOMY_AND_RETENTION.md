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
Rewarded ads may offer optional value such as extra information, expert assistance or post-lot bonuses, but the free loop must remain complete and non-frustrating.

The launch rewarded placement is deliberately bounded: the completed-round cash bonus is 25% of that round's sales, with a 150 ₽ floor and 600 ₽ cap. This gives low-bankroll players meaningful recovery value without allowing high-tier jackpots to scale ad rewards without limit.

Interstitials belong only at natural breaks. The launch client requests one after auction #2 and then every 3 auctions, only when the player chooses to continue to the next auction. Yandex frequency controls may reduce actual impressions further.

Never interrupt a bid, reveal interaction, restoration mini-game or transactional decision. Do not increase ad cadence or reward size based on revenue alone; use retention and economy telemetry.

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

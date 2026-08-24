# Economy and retention guardrails

This document defines design constraints, not final balance numbers. Real tuning should be driven by telemetry after release.

## Retention thesis
The primary hook is uncertainty followed by reveal: inspect partial information, risk bankroll, discover hidden items, then decide whether to realize value or keep collection progress.

Nested loops:
- seconds: next bid / next reveal;
- minutes: lot profit or loss;
- session: bankroll/reputation progress, contracts and business investment;
- daily: Daily Special, contracts and collection goals;
- long term: achievements, business upgrades, rare sets and high-tier auction access.

## Economy goals
- Early players must recover from ordinary mistakes.
- A single unlucky lot must not commonly soft-lock progression.
- Skill/information should matter alongside randomness.
- Better tiers should increase opportunity and variance, not only inflate every number.
- Keeping a collectible should create a meaningful opportunity cost versus selling it.
- Rare jackpots should feel exceptional without making normal lots feel pointless.
- Cash must retain purpose through business upgrades instead of inflating without sinks.

## Simulation regression gate
`src/data/economySimulation.test.ts` deterministically samples every configured lot using the production generation and NPC-bidding formulas. It models the deliberately naive strategy of forcing a win one increment above the highest NPC budget.

The gate protects broad launch behavior rather than pretending to predict real retention:
- each tier must produce both profitable and losing forced wins;
- forced-win loss rate must stay above 5% so "always win" is not risk-free;
- forced-win loss rate must stay below 45% so casual auction pressure is not structurally punitive;
- mean forced-win margin must remain between -5% and +20% of hidden appraisal value;
- at least 60% of sampled Garage force-win prices must remain reachable from the 2,500 ₽ starting bankroll;
- the median Garage force-win price must not exceed the starting bankroll;
- every Garage lot's first possible player bid must be affordable at the starting bankroll.

These are regression bounds, not final balance targets. Real traffic can justify changing them, but any change should be intentional and documented alongside telemetry.

## Tuning rules for agents
Do not change reserve prices, value ranges, NPC bid factors, rarity rates or progression requirements casually. For material changes:
1. state the target behavior/metric;
2. change the narrowest relevant parameters;
3. avoid simultaneous changes to several economy systems unless intentionally running a full rebalance;
4. preserve save compatibility;
5. update this document if the economy model itself changes;
6. keep the economy simulation green or explicitly revise its documented bounds based on evidence.

## Monetization guardrails
Rewarded ads may offer optional value such as extra information, expert assistance or post-lot bonuses, but the free loop must remain complete and non-frustrating.

The launch rewarded placement is deliberately bounded: the completed-round cash bonus is 25% of total round appraisal (sold plus kept value), with a 150 ₽ floor and 600 ₽ cap. Keeping a collectible therefore never reduces the offered ad reward.

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
- contract and business-upgrade engagement;
- rewarded-ad opt-in and completion;
- ARPDAU/LTV only alongside retention and player experience.

Do not optimize ad impressions in isolation from retention.

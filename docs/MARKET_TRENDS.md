# Persistent market trends

## Purpose
Persistent market trends make the value of visible category information change across several normal auctions. The system is deliberately layered onto the existing three-lot choice, clue reading and rival-specialty economy rather than adding a separate market screen or currency.

## Cadence
A trend is derived deterministically from the persisted `auctionsPlayed` count:

- 3 normal-auction counts with one active category trend;
- 2 neutral/cooldown auction counts;
- then the next authored trend begins.

Because the schedule derives from an already persisted counter, local/cloud saves keep the same active trend after refresh without adding another save field.

## Launch trend set
Six authored RU/EN trends currently cover every item category:

- Watch Fever: watches ×1.16.
- Electronics Glut: electronics ×0.92.
- Toy Nostalgia Wave: toys ×1.14.
- Gallery Season: art ×1.15.
- Workshop Shortage: tools ×1.12.
- Curio Correction: collectibles ×0.91.

Trend multipliers are bounded defensively in domain code.

## Information contract
A lot is considered exposed to a category trend only when its **visible clue signals** point at that category. Current hidden contents are never inspected to decide what the lot-selection card says.

During an active trend every normal choice surfaces the trend name and remaining auction count. The copy explicitly says whether that lot's visible signals place it inside or outside the trend.

## Economy integration
When a visible lot is exposed, the trend multiplier composes with any rare lot modifier before concrete finds are generated. The normal appraisal pipeline therefore carries the effect into:

- generated concrete-copy values;
- player appraisal/sell/keep decisions;
- rival hidden valuations and specialty pressure;
- round economics and existing analytics/history fields.

A local rare modifier and a persistent trend may exist on the same lot; neither silently replaces the other.

Buyer Market repricing of previously stored inventory is intentionally a separate follow-up. The first implementation does not double-apply a current trend to old copies.

## Validation
`src/domain/marketTrend.test.ts` protects cadence, visible-signal exposure and multiplier bounds. `src/game/lotMarket.test.ts` protects persistence across auction counts, cooldown behavior and rare-event composition.

The economy simulation remains the release guardrail whenever trend multipliers or event frequency are tuned.

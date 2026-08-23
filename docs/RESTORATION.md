# Restoration v0.1

## Purpose
Restoration inserts a short skill beat between appraisal and sale. It turns item condition into a visible value lever without blocking players who prefer the faster reveal → sell loop.

## Condition
Each generated find receives a condition score between 42% and 92%. Condition modifies the item's market appraisal; otherwise identical finds can therefore have meaningfully different values.

Condition bands:
- Poor: below 55%
- Fair: 55–69%
- Good: 70–85%
- Excellent: 86%+

## Mini-game
After appraisal the player may sell, keep, or restore once.

The restoration screen shows a moving marker and a green target zone. The player presses STOP. Rarer items use a narrower target zone.

Results:
- Perfect: +24 percentage points of condition, capped at 100%.
- Good: +14 points.
- Rough: +6 points.

Restoration never decreases value in v0.1. This is intentional for the first retention test; cost, failure risk, consumables, and rewarded-ad assists should only be added after telemetry shows the interaction itself is worth keeping.

## Economy
Condition uses a multiplier of `0.4 + condition × 0.7`. At 100% the item is worth 1.10× its condition-neutral market basis; lower-condition finds are discounted. Restoration recalculates the appraisal by the ratio between the old and new condition multipliers.

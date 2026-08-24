# Restoration v0.2

## Purpose
Restoration is a short skill beat after appraisal, but it must create a decision rather than a mandatory click on every item.

The economy/formula source of truth is `src/domain/restoration.ts`. Phaser owns interaction/timing and the lot-level usage allowance.

## Condition
Each generated find receives a condition score between 42% and 92%. Condition modifies appraisal through `0.4 + condition × 0.7`.

Condition bands:
- Poor: below 55%;
- Fair: 55–69%;
- Good: 70–85%;
- Excellent: 86%+.

## One attempt per lot
A won lot grants exactly one restoration attempt across all of its finds. Once used, later items show restoration as spent and cannot launch the mini-game.

This makes the decision strategic: spend the attempt early on a damaged item, or save it in case a rarer/high-value find appears later.

The allowance resets only when a new lot is prepared.

## Mini-game
The player stops a moving marker inside a target zone. Rarer items use narrower target zones.

Results remain:
- Perfect: +24 condition points, capped at 100%;
- Good: +14 points;
- Rough: +6 points.

Restoration still never reduces value in this pre-release version. Failure costs and consumables should only be considered after telemetry proves the interaction is worth retaining.

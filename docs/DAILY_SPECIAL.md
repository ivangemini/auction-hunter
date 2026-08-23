# Daily Special v0.1

## Purpose
The Daily Special adds a lightweight return trigger without introducing a separate content pipeline. It deterministically selects one lot from the player's currently unlocked auction tiers for the local calendar day.

## Bonuses
- Appraised find values: ×1.20 before condition is applied.
- Reputation for the first successful Daily win: ×1.50, rounded to the nearest whole XP.

## Completion rules
- The player may retry the Daily after passing or losing.
- The day is marked complete only after winning the lot.
- The boosted Daily can be completed once per local calendar day.
- After completion the lobby shows a completed state until the local day changes.

## Determinism
The date key uses the player's browser-local `YYYY-MM-DD`. A stable hash maps that key onto the set of unlocked lot templates, so refreshing does not reroll the Daily while newly unlocked tiers expand the candidate pool on future days.

## Save compatibility
`lastDailyCompletedDay` is added to the existing v1 save and defaults to `null` for older saves.

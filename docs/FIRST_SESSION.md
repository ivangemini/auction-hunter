# First Session v0.1

## Onboarding
A fresh save now starts in a three-page onboarding scene before the auction lobby:

1. Read visible lot clues and protect the bankroll.
2. Reveal, appraise and optionally restore finds.
3. Keep unique finds for sets, earn REP for tier unlocks and use the Daily Special.

The art pack is preloaded before this scene is marked ready, so onboarding is a real interactive first screen rather than copy shown under the platform loader. Completion is persisted in the existing v1 save.

## 30-minute target curve
The initial progression target is intentionally expressed as testable milestones rather than wall-clock gates:

| Target minute | Milestone | Planned state |
| ---: | --- | --- |
| 5 | First win | 1 Garage win / 35 REP |
| 15 | Estate unlock | 4 Garage wins / 140 REP (threshold 120) |
| 20 | First Estate win | 4 Garage + 1 Estate / 200 REP |
| 30 | Collector unlock | 4 Garage + 3 Estate / 320 REP |

The code-level regression test verifies the reputation arithmetic behind the 4-win and 7-win unlock plan. Actual time-to-milestone must later be validated with event analytics; the target minutes are product pacing goals, not artificial timers.

## Why no forced tutorial actions
The onboarding explains the decision loop but does not force a specific bid, restoration result or keep/sell choice. The first playable auction therefore remains representative of normal gameplay and can be used for retention/economy telemetry once analytics is added.

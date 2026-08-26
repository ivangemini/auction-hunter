# P9 campaign telemetry and duration acceptance

## Purpose

P9 targets roughly **6–10 hours of first-play authored campaign progression** before Endless Dealer Career. Automated content budgets can protect authored scope, but they cannot prove real player time. This document defines the production measurement contract for the remaining duration acceptance.

## Instrumented campaign funnel

Campaign progression uses the existing typed analytics events:

- `campaign_mission_started` — chapter ID + mission ID;
- `campaign_mission_completed` — chapter ID + mission ID + rewards/evidence;
- `campaign_optional_objective_completed` — mastery objective outcome;
- `campaign_branch_chosen` — authored consequential choice;
- `session_started` — page-session boundary.

The Metrica adapter promotes the first three campaign events to stable JavaScript goals:

- `ah_campaign_mission_started`;
- `ah_campaign_mission_completed`;
- `ah_campaign_optional_objective_completed`.

The goal payload retains the typed `missionId` / `chapterId`, so a single stable goal can be filtered by authored step without creating 28 separate hard-coded goal names.

## Duration definitions

Do not mix these metrics.

### 1. Wall-clock time to finale

Start boundary: first `ah_campaign_mission_started` whose payload has `missionId = first-day-floor`.

Completion boundary: `ah_campaign_mission_completed` whose payload has `missionId = lost-collection-finale`.

The elapsed timestamp difference is **calendar progression time**, not active gameplay time. It is useful for cadence/drop-off analysis across multiple visits but does not satisfy the 6–10 hour gameplay-duration target by itself.

### 2. Active campaign playtime

The acceptance metric is active playtime attributable to the first campaign run. Use:

- Yandex Games / Metrica visit playtime for the completion cohort;
- campaign mission start/completion goals to delimit the campaign portion of those visits;
- a controlled timed human playtest as the calibration source before enough live traffic exists.

Background tabs, paused gameplay, ads and time outside active game interaction must not be counted as authored campaign playtime.

### 3. Chapter pacing

For each chapter, measure the time and number of ordinary auctions between its first mission start and its last mission completion. This catches chapters that are technically present but collapse into a few minutes of clicking.

## Authored budget guard

`src/data/campaignDurationBudget.test.ts` protects the authored five-chapter envelope from accidental compression. Current data budgets total approximately **415–625 minutes** (6 h 55 min – 10 h 25 min). This is a design envelope only; human/telemetry validation remains mandatory.

## Human playtest protocol

Run fresh-save playthroughs with no developer shortcuts and record:

1. active stopwatch time from the first campaign mission until finale resolution;
2. per-chapter active time;
3. total auctions played and won;
4. deaths/soft-locks/reloads if any;
5. optional objectives completed;
6. finale route/epilogue;
7. any point where the player needed external explanation or could not identify the next action.

Pause the stopwatch for real-world interruptions. Do not pause for normal in-game browsing, collection management, appraisal, restoration, Buyer Market use or Office decisions when they occur naturally during the first campaign run.

## Acceptance criteria

Do not mark the roadmap duration item complete until there is real measured evidence.

Minimum pre-release evidence:

- at least 3 clean fresh-save human playthroughs;
- no run blocked by a campaign dead end or save migration issue;
- median active first-play campaign duration inside the 6–10 hour target, or an explicit documented rebalance decision if measured behavior falls outside it;
- chapter pacing reviewed for obvious compression/outlier grind.

After launch, replace the tiny manual sample with telemetry cohorts and track median plus distribution, not only the mean.

## Useful launch reports

- campaign start -> Chapter II -> Chapter III -> Closed Circle -> finale conversion;
- median active playtime for players who reach the finale;
- median wall-clock days/visits to finale;
- mission-level abandonment rate;
- normal auctions per chapter;
- optional mastery completion rate;
- branch/epilogue distribution;
- retention of campaign completers after Endless Dealer Career unlocks.

## Privacy

No new player identifier or persistence field is required. Auction Hunter continues to send typed gameplay context only; Metrica/Yandex supply their normal analytics session context. The game does not add names, email addresses, free-form text or device identifiers for this measurement.

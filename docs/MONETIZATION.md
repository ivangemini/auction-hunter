# Monetization

## Product rule
Monetization must add optional value without making the base auction loop deliberately frustrating. A player must always be able to continue without watching an ad.

## Rewarded video v0.1
The first rewarded placement is the completed-lot summary, after bidding, reveal, appraisal and disposition are finished. Gameplay is already marked inactive at this screen.

Offer:
- the button explicitly says that an ad will be shown;
- the exact cash reward is displayed before the player opts in;
- the normal `Next auction` action remains available beside the offer;
- the offer can be claimed at most once per completed lot.

Reward formula lives in `src/domain/rewardedAds.ts`:
- 15% of the final winning bid;
- minimum 100 ₽;
- maximum 1,000 ₽;
- rounded to 25 ₽ increments.

The floor keeps the first rewarded offer understandable and useful. The cap prevents ad rewards from overtaking normal auction/sale economics.

## SDK boundary
Only `src/platform/yandex.ts` calls `ysdk.adv.showRewardedVideo()`.

The adapter distinguishes:
- rewarded;
- closed without reward;
- unavailable;
- error.

Cash is granted only from the confirmed `onRewarded` callback. The scene and adapter both guard against duplicate reward callbacks/taps.

If the SDK is unavailable in local development, the offer returns `unavailable`; local mode does not mint free rewarded cash.

## Persistence
Rewarded cash is granted through `GameStore`, immediately written to the local save and queued for Yandex cloud synchronization. Rewarded cash does not increment `lifetimeSales`, because it is not sale revenue.

## Analytics
The current funnel emits:
- `rewarded_ad_requested`;
- `rewarded_ad_result`;
- `rewarded_cash_granted`.

Use these events to measure opt-in rate, rewarded completion rate and rewarded-cash impact before adding more placements.

## Interstitials
Interstitials are not implemented yet. If introduced, they may appear only at natural breaks and must never interrupt bidding, reveal, restoration or another active-input moment.

## Release QA
Before release in Yandex Games, verify rewarded video in the Yandex debug environment on desktop and a real mobile device:
1. The offer clearly names the reward before the ad starts.
2. Closing/skipping without `onRewarded` grants nothing.
3. A completed rewarded impression grants exactly once.
4. Rapid repeated taps cannot duplicate the grant.
5. Cash persists after reload/cloud synchronization.
6. The player can always choose `Next auction` without watching the ad.
7. Gameplay/focus state is correct before, during and after the ad.

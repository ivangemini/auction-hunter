# Monetization v0.1

## Principles
Monetization is optional and is never allowed to interrupt active bidding, reveal, appraisal, restoration or sell/keep input. The unpaid core loop remains complete and intentionally playable.

## Sticky banner — passive baseline
Auction Hunter uses the Yandex sticky-banner API as a passive monetization layer outside active gameplay.

Runtime policy:
- show the sticky banner while Yandex `GameplayAPI` is inactive, including lot choice/lobby, pass/round-summary breaks and meta screens reached from those breaks;
- hide the sticky banner from the moment an auction starts through bidding, reveal, appraisal, restoration and sell/keep resolution;
- repeated show/hide requests are serialized by the platform adapter so rapid state transitions finish in the requested order;
- banner unavailability or Yandex-side errors never block progression.

This policy is intentionally coupled to the existing gameplay boundary rather than individual Phaser controls. It keeps the banner away from the most input-dense part of the core loop and reduces accidental-click risk without giving up passive exposure during natural browsing/break states.

Yandex Console requirement: enable sticky banners for the intended device classes/positions and enable **Use the API to display a sticky-banner**. Without that console setting the game cannot control banner visibility with `showBannerAdv()` / `hideBannerAdv()`.

## Rewarded placement — round summary
After a won lot has been fully resolved, the round summary may offer one optional rewarded video.

The button explicitly says that an ad will be shown and displays the exact cash reward before the player opts in.

Reward formula:
- 25% of cash sales from the resolved lot;
- minimum 150 ₽;
- maximum 600 ₽;
- rounded to the nearest 10 ₽.

The reward is granted at most once for the current round and only from the Yandex `onRewarded` callback. Closing or failing to open the ad without `onRewarded` grants nothing. Reward cash is persisted locally immediately and enters the normal cloud-save queue before the player continues.

## Interstitial policy
Interstitials are requested only after the player explicitly presses `Next auction` from a pass/loss screen or a completed round summary.

Client-side request cadence:
- first eligible break: after auction #2;
- then every 3 auctions: #5, #8, #11, ...

Yandex may independently decline an impression or enforce a stricter frequency. The game continues normally whether the ad was shown, skipped or errored.

## Pause and audio lifecycle
`game_api_pause` and `game_api_resume` are subscribed immediately after SDK initialization. Browser `visibilitychange`, `blur` and `focus` are also tracked as fallback pause reasons.

While any pause reason is active:
- the Phaser time step sleeps;
- all game audio is paused;
- active auction state remains in memory;
- no gameplay transition depends on an ad callback arriving during the suspended frame loop.

The game resumes only after all active pause reasons clear. Gameplay markup remains owned by Yandex events plus the game's existing `GameplayAPI.start/stop` boundaries.

## Local/dev behavior
If the Yandex advertising API is unavailable, rewarded controls are shown as unavailable, interstitial requests are skipped and sticky-banner visibility calls become harmless unavailable results. Local development never fabricates a successful ad reward or banner impression.

## Metrics
Schema v1 tracks rewarded request/reward/close and interstitial request/close. Sticky-banner API status is treated as platform state rather than a gameplay impression metric; Yandex's advertising reporting remains authoritative for actual banner delivery/revenue.

Review rewarded opt-in/completion, interstitial delivery, banner revenue/exposure and retention alongside session length, bankruptcy rate and D1/D7 before changing reward size, impression cadence or passive-banner exposure.

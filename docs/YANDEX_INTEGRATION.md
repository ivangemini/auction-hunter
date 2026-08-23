# Yandex Games integration contract

## Ownership
All direct Yandex Games SDK calls belong under `src/platform/`. Game/domain/data code consumes narrow adapters.

## Boot
The game must support local development when the Yandex SDK is unavailable. Production initialization should:
1. initialize the SDK;
2. expose locale/platform information through adapters;
3. reconcile local/cloud save when Player data is available;
4. boot the playable game;
5. call `LoadingAPI.ready()` only when the initial playable state is ready for interaction.

Do not signal ready simply because JavaScript loaded.

## Hosting/build
Preserve a relative Vite base path so the built archive can run from Yandex hosting paths. Treat production ZIP/archive behavior as a release gate.

## Focus and lifecycle
Platform overlays, ads and browser focus changes must not corrupt active auction state. Gameplay should be paused/gated where needed and restored idempotently.

## Rewarded ads
`src/platform/yandex.ts` owns `ysdk.adv.showRewardedVideo()` calls.

The rewarded adapter distinguishes:
- rewarded;
- closed without reward;
- unavailable;
- error.

Grant the reward exactly once and only after the Yandex `onRewarded` callback confirms the impression. The first placement is the completed-lot summary; it is optional, names the exact cash reward before the call, and never blocks `Next auction`.

If a future rewarded placement is called while gameplay is marked active, the adapter stops gameplay markup around the ad and restores the prior state after closure. Product policy still prefers placements at natural breaks.

See `docs/MONETIZATION.md` for reward formula and placement rules.

## Interstitials
Interstitials are not implemented yet. They may appear only at natural breaks and never while the player is actively bidding, revealing or restoring.

## Cloud saves
Cloud synchronization is local-first and implemented through `src/platform/cloudSave.ts` plus the save/store boundary. The Yandex Player copy mirrors the normalized save and startup reconciliation chooses the newer/stronger progression state according to `docs/CLOUD_SAVE.md`.

Never blindly overwrite progress based only on callback arrival order. Failed cloud operations must not roll back local progress.

## Future purchases/leaderboards
Keep payments and leaderboard calls behind adapters and validate callback/idempotency behavior. Product decisions for IAP must be documented before implementation.

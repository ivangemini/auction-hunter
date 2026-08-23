# Yandex Games integration contract

## Ownership
All direct Yandex Games SDK calls belong under `src/platform/`. Game/domain/data code consumes narrow adapters.

## Boot
The game must support local development when the Yandex SDK is unavailable. Production initialization should:
1. initialize the SDK;
2. subscribe to platform pause/resume lifecycle;
3. reconcile local/cloud progress;
4. expose locale/platform information through adapters;
5. boot the playable game;
6. call `LoadingAPI.ready()` only when the initial playable state is ready for interaction.

Do not signal ready simply because JavaScript loaded.

## Hosting/build
Preserve a relative Vite base path so the built archive can run from Yandex hosting paths. Treat production ZIP/archive behavior as a release gate.

## Focus and lifecycle
`game_api_pause` / `game_api_resume` are the primary platform lifecycle events. Browser visibility and window focus are additional fallback reasons. While paused, Phaser's time step and all game audio are suspended. Multiple simultaneous pause reasons must clear before the game resumes.

Platform overlays, ads and browser focus changes must not corrupt active auction state. Gameplay markup continues to use the explicit gameplay boundaries already defined by `GameplayAPI.start()` / `GameplayAPI.stop()`; Yandex pause/resume events coordinate markup automatically during platform pauses.

## Advertising
Direct advertising calls live in `src/platform/ads.ts`.

Rewarded flow distinguishes:
- opened;
- reward confirmed;
- closed without reward;
- unavailable/error.

Grant the reward exactly once and only after Yandex invokes `onRewarded`. The player must always see both the advertising action and the exact reward before opting in.

Interstitials may be requested only at natural breaks after a user action and never while the player is actively bidding, revealing, restoring or making a transactional decision. Ad failure or frequency rejection must never block progression.

See `docs/MONETIZATION.md` for the product policy and tuning values.

## Cloud saves
The game is local-first. Cloud synchronization uses `ysdk.getPlayer()` and Player data behind `src/platform/cloudSave.ts`. Startup reconciliation, conflict policy and write coalescing are defined in `docs/CLOUD_SAVE.md`.

Never blindly overwrite progress based only on callback arrival order, and never roll back newer local progress because a cloud operation failed.

## Future purchases/leaderboards
Keep payments and leaderboard calls behind adapters and validate callback/idempotency behavior. Product decisions for IAP must be documented before implementation.

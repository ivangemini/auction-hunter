# Yandex Games integration contract

## Ownership
All direct Yandex Games SDK calls belong under `src/platform/`. Game/domain/data code consumes narrow adapters.

## Boot
The game must support local development when the Yandex SDK is unavailable. Production initialization should:
1. initialize the SDK;
2. expose locale/platform information through adapters;
3. boot the playable game;
4. call `LoadingAPI.ready()` only when the initial playable state is ready for interaction.

Do not signal ready simply because JavaScript loaded.

## Hosting/build
Preserve a relative Vite base path so the built archive can run from Yandex hosting paths. Treat production ZIP/archive behavior as a release gate.

## Focus and lifecycle
Platform overlays, ads and browser focus changes must not corrupt active auction state. Gameplay should be paused/gated where needed and restored idempotently.

## Future ads
Rewarded flow must distinguish:
- opened;
- completed/reward confirmed;
- closed without reward;
- error.

Grant the reward exactly once and only after confirmed completion.

Interstitials must appear only at natural breaks and never while the player is actively bidding/revealing/restoring.

## Future cloud saves
Before enabling cloud synchronization, define:
- explicit save schema version;
- migration path;
- timestamps/version counters as needed;
- deterministic local/cloud conflict resolution;
- offline behavior;
- failure fallback.

Never blindly overwrite progress based only on callback arrival order.

## Future purchases/leaderboards
Keep payments and leaderboard calls behind adapters and validate callback/idempotency behavior. Product decisions for IAP must be documented before implementation.

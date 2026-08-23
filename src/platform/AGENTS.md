# Platform/Yandex agent instructions

Applies to `src/platform/` in addition to parent instructions.

## Isolation
All direct Yandex Games SDK interaction belongs here. Game scenes and domain code should call small adapter functions rather than touching `YaGames`, player, payments or advertising objects directly.

## Startup
- Preserve SDK initialization fallback for local/browser development.
- Call `LoadingAPI.ready()` only after the initial playable state is actually ready.
- A failed/missing SDK in local development must not crash the game unnecessarily.

## Ads and focus
Future ad adapters must:
- pause or gate gameplay input before display;
- restore game state/audio/focus safely afterward;
- distinguish successful rewarded completion from close/error;
- never grant rewarded benefits before confirmed completion;
- avoid interstitials during active gameplay.

## Saves
When Yandex cloud saves are added, define deterministic merge/migration semantics with local state. Never overwrite a newer/progressed save merely because one backend returned later.

## Compatibility
Do not assume the SDK object exists during local development or every initialization path. Keep browser/platform feature checks explicit.

See `docs/YANDEX_INTEGRATION.md` before changing this layer.

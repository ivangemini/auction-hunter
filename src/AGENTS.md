# Source-code agent instructions

Applies to everything under `src/` in addition to the repository-root `AGENTS.md`.

## Boundaries
- `domain/` must stay independent of Phaser, browser globals and Yandex APIs.
- `data/` contains static definitions and balance/content inputs; it should not own runtime state.
- `game/` owns Phaser presentation and runtime orchestration, not platform SDK contracts.
- `platform/` owns Yandex/browser adapters and should expose small application-facing functions.
- localization belongs in the i18n layer; do not embed duplicated RU/EN text inside scenes.

## State and persistence
- Runtime/player state should have one authoritative owner.
- Do not read/write `localStorage` directly from scenes or domain modules.
- Any persisted shape change must consider migration/default behavior for existing saves.
- Prefer additive schema evolution while the game is live.

## Code shape
- Prefer explicit types over untyped objects.
- Keep pure calculations separate from rendering where practical.
- Avoid hidden side effects in utility functions.
- Keep random selection behind functions that can later be seeded/tested.
- Do not introduce singleton global mutable state unless the architecture explicitly calls for it.

## UI/gameplay
- Assume both touch and mouse input.
- Interactive targets should be comfortably tappable on mobile.
- Avoid text or controls that only fit the 1280x720 reference canvas.
- Pause or gate gameplay input when platform overlays/ads require it.

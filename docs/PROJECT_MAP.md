# Project map

This is the fast navigation map for humans and coding agents.

## Root
- `AGENTS.md` — canonical agent policy.
- `README.md` — project entry point and commands.
- `package.json` — scripts and runtime/dev dependencies.
- `index.html` — browser shell and Yandex SDK script entry.
- `vite.config.ts` — build/hosting configuration. Keep the relative base path compatible with Yandex archive hosting.
- `tsconfig.json` — TypeScript compiler contract.
- `.github/workflows/ci.yml` — CI quality gates.

## Documentation
- `docs/GAME_DESIGN.md` — product thesis, core loop, retention layers and MVP intent.
- `docs/ROADMAP.md` — implementation sequence/status.
- `docs/ARCHITECTURE.md` — module boundaries and dependency direction.
- `docs/ENGINEERING.md` — development/validation workflow.
- `docs/CONTENT_MODEL.md` — catalog and stable-ID conventions.
- `docs/ECONOMY_AND_RETENTION.md` — economy/retention design guardrails.
- `docs/YANDEX_INTEGRATION.md` — Yandex platform contract.
- `docs/ANALYTICS.md` — telemetry event contract and naming.
- `docs/DECISIONS.md` — durable architecture/product decisions.

## Source
### `src/main.ts`
Application entry point. Boots Phaser using the game configuration.

### `src/domain/`
Platform-agnostic model/types and, as the project grows, pure game rules. This layer must not depend on Phaser or Yandex.

### `src/data/`
Static content and tuning inputs. Current catalog/lot definitions live in `catalog.ts`. Add content here rather than embedding it in scenes.

### `src/game/`
Phaser runtime and presentation.
- `config.ts` — Phaser configuration.
- `scenes/` — scene orchestration.
- `store.ts` — current player-state persistence boundary.
- `ui.ts` — shared Phaser UI helpers.

### `src/platform/`
External platform adapters. `yandex.ts` owns Yandex Games SDK integration and local fallback behavior.

### `src/i18n.ts`
Current RU/EN localization foundation.

### `src/styles.css`
Browser shell/global CSS. Phaser canvas UI primarily lives in the game layer.

## Where to make common changes
- Add an item/lot: `src/data/`, then update content docs if the schema changes.
- Change auction rules: extract/use domain logic; do not bury balance formulas in scene rendering.
- Change save behavior: `src/game/store.ts` today; introduce migrations before breaking persisted fields.
- Add Yandex feature: `src/platform/` first, expose a narrow adapter to the game.
- Add localized UI copy: localization layer, not duplicated scene literals.
- Change product scope: `docs/GAME_DESIGN.md` + `docs/ROADMAP.md`.
- Change architecture: `docs/ARCHITECTURE.md` + `docs/DECISIONS.md`.

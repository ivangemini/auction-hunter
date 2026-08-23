# Project map

This is the fast navigation map for humans and coding agents.

## Root
- `AGENTS.md` — canonical agent policy.
- `README.md` — project entry point and commands.
- `package.json` — scripts and runtime/dev dependencies.
- `index.html` — browser shell and Yandex SDK script entry.
- `vite.config.ts` — build/hosting configuration. Keep the relative base path compatible with Yandex archive hosting.
- `tsconfig.json` — TypeScript compiler contract.
- `playwright.config.ts` — browser QA configuration.
- `.github/workflows/ci.yml` — CI quality gates.

## Documentation
- `docs/GAME_DESIGN.md` — product thesis, core loop, retention layers and MVP intent.
- `docs/ROADMAP.md` — implementation sequence/status.
- `docs/ARCHITECTURE.md` — module boundaries and dependency direction.
- `docs/ENGINEERING.md` — development/validation workflow.
- `docs/CONTENT_MODEL.md` — catalog and stable-ID conventions.
- `docs/ECONOMY_AND_RETENTION.md` — economy/retention design guardrails.
- `docs/RESTORATION.md` — restoration loop and value rules.
- `docs/ART_DIRECTION.md` — visual language and asset direction.
- `docs/QA.md` — browser/device QA matrix and regression expectations.
- `docs/YANDEX_INTEGRATION.md` — Yandex platform contract.
- `docs/ANALYTICS.md` — telemetry event contract and naming.
- `docs/DECISIONS.md` — durable architecture/product decisions.

## Source
### `src/main.ts`
Application entry point. Boots Phaser using the game configuration.

### `src/domain/`
Platform-agnostic types and pure rules.
- `auction.ts` — lot generation, condition/market-value generation, bidder budgets and bid eligibility.
- `restoration.ts` — restoration/condition value formulas.
- `*.test.ts` — deterministic Vitest coverage for economy-critical rules.

### `src/data/`
Static content and tuning inputs.
- `catalog.ts` — item and lot definitions.
- `balance.ts` — condition/market ranges and bidder profiles.

### `src/game/`
Phaser runtime and presentation.
- `config.ts` — Phaser configuration.
- `art.ts` — asset preload/texture resolution.
- `scenes/` — presentation/orchestration, not balance formulas.
- `store.ts` — current player-state persistence boundary.
- `ui.ts` — shared Phaser UI helpers.
- `restoration.ts` — compatibility re-export; domain implementation lives under `src/domain/`.

### `src/platform/`
External platform adapters. `yandex.ts` owns Yandex Games SDK integration and local fallback behavior.

### `src/i18n.ts`
Current RU/EN localization foundation.

### `src/styles.css`
Browser shell/global CSS. Phaser canvas UI primarily lives in the game layer.

## Tests
- `src/domain/*.test.ts` — fast deterministic unit tests for pure game rules.
- `tests/browser.spec.ts` — Playwright browser/runtime regression coverage.
- `tests/restoration.spec.ts` — existing restoration regression coverage through the compatibility boundary.

## Where to make common changes
- Add an item/lot: `src/data/`, then update content docs if the schema changes.
- Tune condition/market/NPC ranges: `src/data/balance.ts`.
- Change auction/restoration formulas: `src/domain/` with unit tests.
- Change auction presentation: `src/game/scenes/` without duplicating domain formulas.
- Change save behavior: `src/game/store.ts` today; introduce migrations before breaking persisted fields.
- Add Yandex feature: `src/platform/` first, expose a narrow adapter to the game.
- Add localized UI copy: localization layer, not duplicated scene literals.
- Change product scope: `docs/GAME_DESIGN.md` + `docs/ROADMAP.md`.
- Change architecture: `docs/ARCHITECTURE.md` + `docs/DECISIONS.md`.

# Project map

Fast navigation map for humans and coding agents.

## Root
- `AGENTS.md` — canonical agent policy.
- `README.md` — entry point and commands.
- `package.json` — scripts/dependencies.
- `index.html` — browser shell, Yandex SDK script and portrait orientation guard.
- `vite.config.ts` — relative build configuration.
- `playwright.config.ts` — desktop/landscape/portrait browser QA.
- `.github/workflows/ci.yml` — CI gates.

## Documentation
- `GAME_DESIGN.md`, `ROADMAP.md` — product intent and delivery status.
- `ARCHITECTURE.md`, `ENGINEERING.md`, `DECISIONS.md` — technical contracts/workflow.
- `CONTENT_MODEL.md`, `ECONOMY_AND_RETENTION.md` — content/economy rules.
- `RESTORATION.md`, `COLLECTIONS.md`, `TIERS.md`, `DAILY_SPECIAL.md`, `FIRST_SESSION.md` — gameplay contracts.
- `CLOUD_SAVE.md`, `YANDEX_INTEGRATION.md` — persistence/platform contracts.
- `ANALYTICS.md` — telemetry contract.
- `ART_DIRECTION.md`, `QA.md` — visual/device QA contracts.

## Source
### `src/main.ts`
Startup orchestration: SDK, localized orientation guard, lifecycle, cloud sync, analytics, Phaser boot.

### `src/analytics.ts`
Versioned gameplay analytics boundary.

### `src/domain/`
Pure platform-agnostic rules and types.
- `auction.ts` — clue-backed lot generation, bidding, NPC budgets.
- `restoration.ts` — condition/value formulas.
- `collection.ts` — collection resale/copy-count helpers.
- `*.test.ts` — deterministic domain coverage.

### `src/data/`
Static content/tuning inputs.
- `catalog.ts` — 12 items and 9 clue-backed lot templates.
- `balance.ts` — condition/market ranges and bidder profiles.
- `collections.ts` — sets and resale-rate tuning.
- `tiers.ts` — reputation/tier definitions and 3 lots per tier.
- `daily.ts`, `progression.ts`, `monetization.ts` — daily/progression/ad policy.

### `src/game/`
- `scenes/AuctionScene.ts` — auction presentation/orchestration, one-per-lot restoration allowance, round summary/ads.
- `scenes/CollectionScene.ts` — sets plus inventory resale modal.
- `scenes/OnboardingScene.ts` — first-session onboarding.
- `store.ts`, `save.ts` — gameplay mutation and persistence boundaries.
- `feedback.ts` — lightweight Web Audio cues and camera juice.
- `ui.ts` — shared buttons with mobile hit slop/contrast handling.
- `art.ts`, `config.ts`, `lifecycle.ts` — rendering/runtime infrastructure.

### `src/platform/`
- `yandex.ts` — SDK/Player integration.
- `cloudSave.ts` — Player-data synchronization.
- `ads.ts` — rewarded/interstitial adapter.
- `lifecycle.ts` — Yandex/browser/orientation pause reasons.

### `src/i18n.ts`
RU/EN gameplay and orientation copy.

## Tests
- `src/domain/*.test.ts` — fast economy/game-rule unit tests.
- `tests/browser.spec.ts` — responsive/runtime/orientation smoke coverage.
- Other `tests/*.spec.ts` cover system contracts used by Playwright QA.

## Where to make common changes
- Add/tune lots and clue signals: `src/data/catalog.ts` + `docs/CONTENT_MODEL.md`.
- Tune NPC/economy ranges: `src/data/balance.ts` + `docs/ECONOMY_AND_RETENTION.md`.
- Change clue generation/restoration/resale formulas: matching `src/domain/` module + unit tests.
- Change presentation: `src/game/scenes/`.
- Change local save schema: `src/game/save.ts` + migration tests.
- Change Yandex/cloud/ads/lifecycle: `src/platform/` + platform docs/tests.
- Change localized copy: `src/i18n.ts`.

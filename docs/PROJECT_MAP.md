# Project map

Fast navigation map for humans and coding agents.

## Root
- `AGENTS.md` — canonical agent policy.
- `README.md` — project entry point and commands.
- `package.json` — scripts/dependencies.
- `index.html` — browser shell and Yandex SDK script entry.
- `vite.config.ts` — build/relative hosting configuration.
- `vitest.config.ts` — unit-test discovery; only `src/**/*.test.ts` belongs to Vitest.
- `tsconfig.json` — TypeScript contract.
- `playwright.config.ts` — browser QA configuration for `tests/*.spec.ts`.
- `.github/workflows/ci.yml` — continuous quality gates.
- `.github/workflows/yandex-release.yml` — manual validated Yandex ZIP artifact build.

## Documentation
- `GAME_DESIGN.md`, `ROADMAP.md` — product intent and delivery status.
- `ARCHITECTURE.md`, `ENGINEERING.md`, `DECISIONS.md` — technical contracts/workflow.
- `CONTENT_MODEL.md`, `ECONOMY_AND_RETENTION.md` — content/economy rules.
- `RESTORATION.md`, `COLLECTIONS.md`, `TIERS.md`, `DAILY_SPECIAL.md`, `FIRST_SESSION.md` — shipped gameplay-system contracts.
- `MONETIZATION.md` — rewarded/interstitial placement and tuning policy.
- `IAP_GATE.md` — telemetry gate before purchase design.
- `CLOUD_SAVE.md`, `YANDEX_INTEGRATION.md` — persistence/platform contracts.
- `ANALYTICS.md` — versioned telemetry contract.
- `ART_DIRECTION.md`, `QA.md`, `MODERATION.md` — visual, QA and release contracts.

## Source
### `src/main.ts`
Startup orchestration: analytics/platform lifecycle/cloud synchronization, then Phaser boot.

### `src/analytics.ts`
Versioned gameplay analytics boundary.

### `src/domain/`
Pure platform-agnostic rules and types.
- `auction.ts` — lot generation, appraisal, NPC budgets and bid eligibility.
- `restoration.ts` — condition/restoration value formulas.
- `monetization.ts` — pure rewarded-value and interstitial-cadence rules.
- `*.test.ts` — deterministic Vitest tests.

### `src/data/`
Static content and tuning inputs.
- `catalog.ts` — items/lots.
- `balance.ts` — appraisal and bidder tuning.
- `collections.ts` — collection definitions/helpers.
- `tiers.ts` — reputation/auction tiers.
- `daily.ts` — daily-special selection/config.
- `progression.ts` — onboarding/first-session progression data.
- `monetization.ts` — ad reward/cadence tuning.

### `src/game/`
Phaser runtime and local game state.
- `config.ts` — Phaser configuration.
- `lifecycle.ts` — binds platform pause state to Phaser/game audio suspension.
- `art.ts` — asset preload/texture resolution.
- `scenes/AuctionScene.ts` — auction presentation/orchestration and ad-placement calls.
- `scenes/CollectionScene.ts` — collection book.
- `scenes/OnboardingScene.ts` — first-session onboarding.
- `store.ts` — gameplay-facing state mutations.
- `save.ts` — versioned local save normalization/serialization.
- `ui.ts` — shared Phaser UI helpers.
- `restoration.ts` — compatibility re-export to domain formulas.

### `src/platform/`
External platform adapters.
- `yandex.ts` — Yandex SDK/Player access and gameplay markup.
- `ads.ts` — rewarded/fullscreen ad callback normalization.
- `lifecycle.ts` — Yandex/browser pause state coordination.
- `cloudSave.ts` — Yandex Player-data synchronization/reconciliation.

### `src/i18n.ts`
RU/EN localization source of truth. Gameplay UI copy must come from here or localized content definitions rather than inline locale branches. The table is exported so parity tests can validate the complete contract.

### `public/assets/`
Runtime artwork for lots/items.

## Tests
- `src/domain/*.test.ts` — fast domain unit tests, including monetization policy.
- `src/i18n.test.ts` — RU/EN key, non-empty value and interpolation-placeholder parity.
- `tests/browser.spec.ts` — browser/runtime and responsive regression coverage.
- `tests/restoration.spec.ts`, `collections.spec.ts`, `tiers.spec.ts`, `daily.spec.ts`, `progression.spec.ts`, `analytics.spec.ts`, `cloud-save.spec.ts` — Playwright system/regression coverage.

## Where to make common changes
- Add content: `src/data/` + content docs if schema changes.
- Tune economy/NPC ranges: `src/data/balance.ts`.
- Tune ad reward/cadence: `src/data/monetization.ts` + `docs/MONETIZATION.md`.
- Change auction/restoration/monetization formulas: `src/domain/` + unit tests.
- Change collection/tier/daily/progression definitions: matching `src/data/*` file + matching doc/test.
- Change presentation: `src/game/scenes/`; do not duplicate domain formulas.
- Change local save schema: `src/game/save.ts` + migration/compatibility tests.
- Change cloud sync/Yandex behavior: `src/platform/` + platform docs/tests.
- Change analytics semantics: `src/analytics.ts` + `docs/ANALYTICS.md`.
- Change localized copy: `src/i18n.ts` and keep RU/EN placeholders aligned.
- Change product scope: `docs/GAME_DESIGN.md` + `docs/ROADMAP.md`.
- Change architecture: `docs/ARCHITECTURE.md` + `docs/DECISIONS.md`.

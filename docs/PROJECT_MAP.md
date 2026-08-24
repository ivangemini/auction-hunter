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
- `.github/workflows/yandex-release.yml` — moderation-ready ZIP build workflow.

## Documentation
- `GAME_DESIGN.md`, `ROADMAP.md`, `V1_ROADMAP.md` — product intent and delivery status.
- `ARCHITECTURE.md`, `ENGINEERING.md`, `DECISIONS.md` — technical contracts/workflow.
- `CONTENT_MODEL.md`, `ECONOMY_AND_RETENTION.md`, `CONTENT_DURATION.md` — content/economy/replayability rules and moderation evidence.
- `RESTORATION.md`, `COLLECTIONS.md`, `TIERS.md`, `DAILY_SPECIAL.md`, `FIRST_SESSION.md` — gameplay contracts.
- `CLOUD_SAVE.md`, `YANDEX_INTEGRATION.md`, `MONETIZATION.md`, `MODERATION.md` — persistence/platform/release contracts.
- `ANALYTICS.md` — telemetry contract.
- `ART_DIRECTION.md`, `QA.md` — visual/device QA contracts.

## Source
### `src/main.ts`
Startup orchestration: SDK, localized orientation guard, accessibility preferences, lifecycle, cloud sync, auction-history analytics sink and Phaser boot.

### `src/analytics.ts`
Versioned gameplay analytics boundary, including auction, monetization, meta-progression and advanced-inspection events.

### `src/domain/`
Pure platform-agnostic rules and types.
- `auction.ts` — clue-backed lot generation, bidding, NPC budgets and bidder tells.
- `lotModifier.ts` — deterministic effects for rare visible auction events.
- `inspection.ts` — late-game inspection report rules.
- `restoration.ts` — condition/value formulas.
- `collection.ts` — collection resale/copy-count helpers.
- `meta.ts`, `history.ts` — meta-progression calculations and capped recent-auction history.
- `*.test.ts` — deterministic domain coverage.

### `src/data/`
Static content/tuning inputs.
- `catalog.ts` — 24 items and 18 clue-backed lot templates.
- `balance.ts` — condition/market ranges, bidder profiles and tell text.
- `collections.ts` — 8 sets and resale-rate tuning.
- `tiers.ts` — reputation/tier definitions and 6 lots per tier.
- `lotModifiers.ts` — rare visible lot events and their probability.
- `inspection.ts` — inspection unlock/cost tuning.
- `meta.ts` — daily contracts, achievements and business upgrades.
- `daily.ts`, `progression.ts`, `monetization.ts` — daily/progression/ad policy.
- `replayability.test.ts` — v1 content/replayability regression floor.

### `src/game/`
- `scenes/AuctionScene.ts` — auction presentation/orchestration, clues, modifiers, bidder tells, advanced inspection, one-per-lot restoration and round summary/ads.
- `scenes/CollectionScene.ts` — paged collection sets plus inventory resale modal.
- `scenes/OfficeScene.ts` — contracts, upgrades, achievements, stats, recent auction history and accessibility settings.
- `scenes/OnboardingScene.ts` — first-session onboarding.
- `store.ts`, `save.ts` — gameplay mutation and persistence boundaries.
- `historyTracking.ts` — turns canonical typed analytics outcomes into capped persisted history.
- `preferences.ts` — device-local sound/reduced-motion/high-contrast preferences.
- `feedback.ts` — lightweight Web Audio cues and motion-aware camera juice.
- `ui.ts` — shared buttons with mobile hit slop/contrast handling.
- `art.ts`, `config.ts`, `lifecycle.ts` — rendering/runtime infrastructure.

### `src/platform/`
- `yandex.ts` — SDK/Player integration.
- `cloudSave.ts` — Player-data synchronization.
- `ads.ts` — rewarded/interstitial adapter.
- `lifecycle.ts` — Yandex/browser/orientation pause reasons.

### `src/i18n.ts`
RU/EN gameplay, Office, inspection, accessibility and orientation copy.

## Tests
- `src/domain/*.test.ts` — fast economy/game-rule unit tests.
- `src/data/*.test.ts` — content integrity, scale and replayability regression coverage.
- `tests/browser.spec.ts` — responsive/runtime/orientation smoke coverage.
- Other `tests/*.spec.ts` cover system contracts used by Playwright QA.

## Where to make common changes
- Add/tune lots and clue signals: `src/data/catalog.ts` + `docs/CONTENT_MODEL.md`.
- Tune NPC/economy ranges: `src/data/balance.ts` + `docs/ECONOMY_AND_RETENTION.md`.
- Change clue generation/restoration/resale/inspection formulas: matching `src/domain/` module + focused unit tests.
- Change contracts/achievements/upgrades: `src/data/meta.ts` + `src/domain/meta.ts`.
- Change presentation: `src/game/scenes/`.
- Change local/cloud save schema: `src/game/save.ts` + migration/normalization tests.
- Change device-local accessibility preferences: `src/game/preferences.ts`.
- Change Yandex/cloud/ads/lifecycle: `src/platform/` + platform docs/tests.
- Change localized copy: `src/i18n.ts`.
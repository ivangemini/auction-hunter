# Project map

Fast navigation map for humans and coding agents.

## Root
- `AGENTS.md` — canonical agent policy.
- `README.md` — entry point and commands.
- `package.json` — scripts/dependencies.
- `.env.example` — optional local Yandex Metrica counter configuration.
- `index.html` — browser shell, Yandex SDK script and portrait orientation guard.
- `vite.config.ts` — relative build configuration.
- `playwright.config.ts` — desktop/landscape/portrait browser QA.
- `.github/workflows/ci.yml` — CI gates, draft/archive validation, candidate ZIP and promotional PNG artifacts.
- `.github/workflows/yandex-release.yml` — moderation-ready ZIP + promotional-art release workflow; validates draft metadata and injects optional `YANDEX_METRICA_ID` into the release build.
- `release/yandex-draft-metadata.json` — machine-readable RU/EN draft copy and current visual-field constraints.
- `release/promotional/` — reviewed SVG sources for the Yandex catalog icon/cover; `generated/` is produced by CI/release rather than committed.
- `scripts/validate-yandex-draft.mjs` — release metadata length/casing/consistency/spec validator.
- `scripts/validate-yandex-archive.mjs` — built archive root/path/size/SDK/title validator.
- `scripts/render-yandex-promos.mjs` — deterministic 512×512 icon and 800×470 cover PNG renderer/validator.

## Documentation
- `GAME_DESIGN.md`, `ROADMAP.md`, `V1_ROADMAP.md` — product intent and delivery status.
- `ARCHITECTURE.md`, `ENGINEERING.md`, `DECISIONS.md` — technical contracts/workflow.
- `CONTENT_MODEL.md`, `ECONOMY_AND_RETENTION.md`, `CONTENT_DURATION.md` — content/economy/replayability rules and moderation evidence.
- `RESTORATION.md`, `COLLECTIONS.md`, `TIERS.md`, `DAILY_SPECIAL.md`, `FIRST_SESSION.md` — gameplay contracts.
- `CLOUD_SAVE.md`, `YANDEX_INTEGRATION.md`, `MONETIZATION.md`, `MODERATION.md` — persistence/platform/release contracts.
- `YANDEX_DRAFT_METADATA.md` — ready-to-paste draft fields, generated promotional-art workflow and required gameplay screenshot shot-list.
- `ANALYTICS.md` — typed event schema plus optional Yandex Metrica transport/setup.
- `ART_DIRECTION.md`, `QA.md` — visual/device QA contracts.

## Source
### `src/main.ts`
Startup orchestration: SDK, localized orientation guard, accessibility preferences, lifecycle, cloud sync, auction-history analytics sink, optional Metrica analytics sink and Phaser boot.

### `src/analytics.ts`
Versioned vendor-neutral gameplay analytics boundary, including auction, monetization, meta-progression and advanced-inspection events.

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
- `catalog.ts` — 24 items and 18 clue-backed lot templates, including their lot `artId` assignments.
- `artManifest.ts` — direct item-art IDs and the nine allowed lot-environment art IDs.
- `artCoverage.test.ts` — prevents catalog item art aliases/fallback and enforces the v1 lot-environment floor.
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
- `art.ts` — preloads direct catalog item art and declared lot environments; runtime fallback is defensive only.
- `config.ts`, `lifecycle.ts` — rendering/runtime infrastructure.

### `public/assets/`
- `items/` — direct SVG for every one of the 24 catalog item IDs plus defensive `fallback.svg`.
- `lots/` — nine authored lot environments: three Garage, three Estate and three Collector archetypes.

### `src/platform/`
- `yandex.ts` — Yandex Games SDK/Player integration.
- `cloudSave.ts` — Player-data synchronization.
- `ads.ts` — rewarded/interstitial adapter.
- `lifecycle.ts` — Yandex/browser/orientation pause reasons.
- `metrica.ts` — optional Yandex Metrica tag loader and typed analytics transport; no-op without a real counter ID.

### `src/i18n.ts`
RU/EN gameplay, Office, inspection, accessibility and orientation copy. The visible game brand is `Auction Hunter` in both locales to match Yandex draft materials.

## Tests
- `src/domain/*.test.ts` — fast economy/game-rule unit tests.
- `src/data/*.test.ts` — content integrity, art coverage, scale and replayability regression coverage.
- `src/platform/*.test.ts` — platform adapter contracts that can be verified without live Yandex services.
- `tests/browser.spec.ts` — responsive/runtime/orientation smoke coverage.
- Other `tests/*.spec.ts` cover system contracts used by Playwright QA.

## Where to make common changes
- Add/tune lots and clue signals: `src/data/catalog.ts` + `docs/CONTENT_MODEL.md`.
- Add/change catalog art: `public/assets/`, `src/data/artManifest.ts`, lot `artId` assignments and `src/data/artCoverage.test.ts`.
- Change Yandex icon/cover: `release/promotional/*.svg` + `scripts/render-yandex-promos.mjs`; never hand-edit generated PNGs.
- Tune NPC/economy ranges: `src/data/balance.ts` + `docs/ECONOMY_AND_RETENTION.md`.
- Change clue generation/restoration/resale/inspection formulas: matching `src/domain/` module + focused unit tests.
- Change contracts/achievements/upgrades: `src/data/meta.ts` + `src/domain/meta.ts`.
- Change presentation: `src/game/scenes/`.
- Change local/cloud save schema: `src/game/save.ts` + migration/normalization tests.
- Change device-local accessibility preferences: `src/game/preferences.ts`.
- Change Yandex Games/cloud/ads/lifecycle/Metrica: `src/platform/` + platform docs/tests.
- Change draft catalog text/limits: `release/yandex-draft-metadata.json` + `docs/YANDEX_DRAFT_METADATA.md` + validator.
- Change localized gameplay copy: `src/i18n.ts`.

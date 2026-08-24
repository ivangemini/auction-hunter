# Project map

Fast navigation map for humans and coding agents.

## Root
- `AGENTS.md` — canonical agent policy.
- `README.md` — entry point and commands.
- `package.json` — scripts/dependencies and canonical repository release version; validated against Yandex Draft metadata.
- `.env.example` — optional local Yandex Metrica counter configuration.
- `index.html` — browser shell, Yandex SDK script and portrait orientation guard.
- `vite.config.ts` — relative build configuration; production source maps are disabled so release archives do not ship source maps.
- `playwright.config.ts` — desktop/landscape/portrait browser QA.
- `.github/workflows/ci.yml` — CI gates, draft/archive validation, candidate ZIP, promo/screenshots and unified submission artifacts; also uploads dedicated restoration visual-review captures without changing the Yandex submission screenshot set.
- `.github/workflows/yandex-release.yml` — moderation-ready release workflow; produces the game ZIP plus a single submission bundle and injects optional `YANDEX_METRICA_ID` into the release build.
- `release/yandex-draft-metadata.json` — machine-readable RU/EN draft copy and current visual-field constraints.
- `release/promotional/` — reviewed SVG sources for the Yandex catalog icon/cover; `generated/` is produced by CI/release rather than committed.
- `release/screenshots/generated/` — generated RU/EN desktop/mobile production screenshots; CI/release output only.
- `release/screenshots/review/` — temporary RU/EN screen-family visual-review captures used by CI; currently restoration mode/timing screens and intentionally excluded from Yandex submission assets.
- `release/screenshots/debug/` — temporary capture diagnostics created only when the production screenshot flow needs failure evidence; CI may upload them with short retention.
- `release/submission/generated/` — assembled Draft submission tree; CI/release output only.
- `scripts/validate-yandex-draft.mjs` — release metadata length/casing/consistency/spec validator, including package/release version parity.
- `scripts/validate-yandex-archive.mjs` — built archive root/path/size/SDK/title validator; rejects production source maps.
- `scripts/render-yandex-promos.mjs` — deterministic 512×512 icon and 800×470 cover PNG renderer/validator.
- `scripts/capture-yandex-screenshots.mjs` — production-build RU/EN gameplay capture plus non-blank art-region checks; core-loop navigation is analytics-event-driven and asserts one committed lot choice remains stable through the auction before reveal/appraisal capture.
- `scripts/capture-restoration-review.mjs` — drives a production build through the real auction/reveal/appraisal path, then captures RU/EN restoration mode-picker and timing-stage evidence with transition-difference assertions.
- `scripts/build-yandex-submission.mjs` — assembles game ZIP, promo art, screenshots and metadata with SHA-256 manifests.

## Documentation
- `GAME_DESIGN.md`, `ROADMAP.md`, `V1_ROADMAP.md` — product intent and delivery status.
- `PRE_RELEASE_AUDIT.md` — latest release-risk and maintainability audit.
- `ARCHITECTURE.md`, `ENGINEERING.md`, `DECISIONS.md` — technical contracts/workflow.
- `CONTENT_MODEL.md`, `ECONOMY_AND_RETENTION.md`, `CONTENT_DURATION.md` — content/economy/replayability rules and moderation evidence.
- `BUYER_MARKET.md` — daily specialist demand, identity/per-copy trait rules and exact-copy premium-sale economics.
- `RESTORATION.md`, `COLLECTIONS.md`, `TIERS.md`, `DAILY_SPECIAL.md`, `FIRST_SESSION.md` — gameplay contracts.
- `CLOUD_SAVE.md`, `YANDEX_INTEGRATION.md`, `MONETIZATION.md`, `MODERATION.md` — persistence/platform/release contracts.
- `YANDEX_DRAFT_METADATA.md` — ready-to-paste draft fields, generated promotional-art workflow and gameplay screenshot guidance.
- `ANALYTICS.md` — typed event schema plus optional Yandex Metrica transport/setup.
- `ART_DIRECTION.md`, `QA.md` — visual/device QA contracts.

## Source
### `src/main.ts`
Startup orchestration: SDK, sticky-banner gameplay policy, localized orientation guard, accessibility preferences, lifecycle, cloud sync, auction-history analytics sink, optional Metrica analytics sink and Phaser boot.

### `src/analytics.ts`
Versioned vendor-neutral gameplay analytics boundary, including lot-selection, per-find appraisal traits, auction, restoration-mode, buyer-market, monetization, meta-progression and advanced-inspection events.

### `src/domain/`
Pure platform-agnostic rules and types.
- `auction.ts` — clue-backed lot generation, per-find trait rolls/value multipliers, bidding, NPC budgets and bidder tells.
- `lotSelection.ts` — deterministic distinct-option sampling for the pre-auction market choice.
- `lotModifier.ts` — deterministic effects for rare visible lot events.
- `inspection.ts` — late-game inspection report rules.
- `restoration.ts` — condition/value formulas plus Safe/Pro/Risky restoration-mode timing/reward rules.
- `collection.ts` — collection resale/copy-count helpers.
- `meta.ts` — meta-progression calculations.
- `history.ts` — capped recent-auction history plus pure per-lot Dealer Memory summaries used by the selection screen.
- `types.ts` — stable catalog types plus `CollectionItem` concrete owned-copy persistence model.
- `*.test.ts` — deterministic domain coverage.

### `src/data/`
Static content/tuning inputs.
- `catalog.ts` — 36 items and 24 clue-backed lot templates, including their lot `artId` assignments.
- `itemTraits.ts` — stable identity traits plus bounded positive/negative per-find variants, their appraisal multipliers and compatibility rules.
- `itemTraits.test.ts` — variant multiplier and contradictory-trait regression coverage.
- `buyers.ts` — category/specialist buyer definitions, deterministic daily offer selection and exact-copy premium-sale matching/value rules.
- `buyers.test.ts` — deterministic offer, trait matching and concrete-copy premium regression coverage.
- `artManifest.ts` — direct item-art IDs and the nine allowed lot-environment art IDs.
- `artCoverage.test.ts` — prevents catalog item art aliases/fallback and enforces the lot-environment floor.
- `balance.ts` — condition/market ranges and bidder profiles and tell text.
- `collections.ts` — 12 sets and resale-rate tuning.
- `tiers.ts` — reputation/tier definitions and 8 lots per tier.
- `lotModifiers.ts` — rare visible lot events and their probability.
- `inspection.ts` — inspection unlock/cost tuning.
- `meta.ts` — daily contracts, achievements and business upgrades.
- `daily.ts`, `progression.ts`, `monetization.ts` — daily/progression/ad policy.
- `replayability.test.ts`, `contentScale.test.ts` — expanded content/replayability regression floors.

### `src/game/`
- `scenes/AuctionScene.ts` — canonical auction/reveal orchestration and gameplay state: selection preparation, lobby, bidding, clues, inspection, item disposition, round summary and ads. P7 presentation overrides inherit this behavior rather than duplicating rules.
- `scenes/PolishedAuctionScene.ts` — P7 lot-selection presentation with authored environment cards, Dealer Memory/status hierarchy, hover/selection motion and a one-shot selection lock that prevents queued multi-card selection races.
- `scenes/PolishedAuctionSceneV2.ts` — P7 active-bidding, win, reveal and appraisal presentation: current-bid focal treatment, persistent rival cards/tells, staged item hero reveal, rarity/value feedback and locale-safe action controls.
- `lotMarket.ts` — normal-auction tier validation, three-choice generation, visible modifier application and page-session market-cycle cache.
- `lotMarket.test.ts` — deterministic tier fallback/distinct-choice/cache regression coverage.
- `restorationUi.ts` — P7 restoration workbench presentation: Safe/Pro/Risky decision cards with visible speed/window/reward tradeoffs, persistent item condition/value context, explicit Good/Perfect timing bands, dominant STOP control and one-shot input guards; formula/reward truth remains in `src/domain/restoration.ts`.
- `scenes/CollectionScene.ts` — paged collection sets, concrete-copy appraisal/condition/trait display, Buyer Market navigation and lowest-value-first inventory quick sale.
- `scenes/BuyerMarketScene.ts` — three deterministic daily buyers, exact-copy premium inventory matching and one completed sale per offer/day.
- `scenes/OfficeScene.ts` — contracts, upgrades, achievements, stats, recent auction history and accessibility settings.
- `scenes/OnboardingScene.ts` — first-session onboarding.
- `store.ts`, `save.ts` — gameplay mutation and persistence boundaries, including concrete `collectionItems`, legacy collection reconciliation, Buyer Market day/claim state and exact-copy transactions.
- `historyTracking.ts` — turns canonical typed analytics outcomes into capped persisted history; Dealer Memory reads this existing save data rather than introducing a new schema.
- `preferences.ts` — device-local sound/reduced-motion/high-contrast preferences.
- `feedback.ts` — lightweight Web Audio cues and motion-aware camera juice.
- `motion.ts` — shared interaction/reveal/value timing tokens and reduced-motion-aware scene motion helpers.
- `ui.ts` — shared buttons with mobile hit slop, fixed hit targets, feedback/motion options and locale-specific font-size overrides where a compact action needs them.
- `art.ts` — preloads direct catalog item art and declared lot environments, rasterizing SVG at explicit 512×360 dimensions; runtime fallback is defensive only.
- `config.ts`, `lifecycle.ts` — rendering/runtime infrastructure.

### `public/assets/`
- `items/` — direct SVG for every one of the 36 catalog item IDs plus defensive `fallback.svg`.
- `lots/` — nine authored lot environments: three Garage, three Estate and three Collector archetypes.

### `src/platform/`
- `yandex.ts` — Yandex Games SDK/Player integration plus gameplay-activity notifications for platform policies.
- `cloudSave.ts` — Player-data synchronization with coalesced, serialized uploads.
- `ads.ts` — rewarded/interstitial adapters plus API-controlled sticky-banner policy.
- `lifecycle.ts` — Yandex/browser/orientation pause reasons.
- `metrica.ts` — optional Yandex Metrica tag loader and typed analytics transport; Buyer Market sales are stable goals; no-op without a real counter ID.

### `src/i18n.ts`
RU/EN gameplay, lot-selection/Dealer Memory, restoration-mode, Office, inspection, accessibility and orientation copy. The Buyer Market keeps its compact RU/EN scene copy beside the isolated market UI for now. The visible game brand is `Auction Hunter` in both locales to match Yandex draft materials.

## Tests
- `src/domain/*.test.ts` — fast economy/game-rule unit tests, including deterministic lot-option sampling, per-find appraisal variance, restoration-mode tradeoffs and Dealer Memory aggregation.
- `src/data/*.test.ts` — content integrity, item-trait compatibility, Buyer Market exact-copy rules, direct-art coverage, 36/24/12 scale and replayability regression coverage.
- `src/game/lotMarket.test.ts` — isolated normal-market tier/cache behavior.
- `src/game/save.test.ts` — save normalization, legacy-to-instance collection migration and persisted-instance sanitization.
- `src/game/buyerMarket.test.ts` — focused persistence/transaction coverage for exact-copy sale, one-offer-per-day and daily reset semantics.
- `src/platform/*.test.ts` — platform adapter contracts, including cloud-save ordering, that can be verified without live Yandex services.
- `tests/browser.spec.ts` — responsive/runtime/orientation smoke coverage.
- `tests/lot-selection.spec.ts` — browser funnel coverage for three unique options, market-cycle semantics, Dealer Memory rendering path, committed choice and delayed auction start.
- `tests/restoration.spec.ts` — compatibility-level condition/value and Safe/Pro/Risky restoration contract coverage.
- Other `tests/*.spec.ts` cover system contracts used by Playwright QA.
- `scripts/capture-yandex-screenshots.mjs` doubles as a production-build core-loop smoke test: it verifies a single lot selection remains stable through a legitimate auction win, advances reveal/appraisal by observed analytics events and rejects visually blank lot/item art.
- `scripts/capture-restoration-review.mjs` is the restoration screen-family visual gate: it follows the same production core loop and verifies the mode/timing screens visibly replace their preceding states before CI uploads the four RU/EN review captures.

## Where to make common changes
- Add/tune lots and clue signals: `src/data/catalog.ts` + `docs/CONTENT_MODEL.md`.
- Add/change stable or randomized collectible traits: `src/data/itemTraits.ts` + `src/domain/auction.ts` + `docs/BUYER_MARKET.md`.
- Change concrete owned-copy persistence: `src/game/save.ts` + `src/game/store.ts` + migration tests. Keep `collection: string[]` synchronized while legacy set/progression logic depends on it.
- Change Buyer Market buyers/premiums/matching: `src/data/buyers.ts`; transaction semantics live in `src/game/store.ts`; presentation lives in `src/game/scenes/BuyerMarketScene.ts`.
- Change normal-auction option sampling/cache behavior: `src/domain/lotSelection.ts` + `src/game/lotMarket.ts`; change polished selection presentation in `src/game/scenes/PolishedAuctionScene.ts`.
- Change active bidding/win/reveal/appraisal presentation without changing auction rules: `src/game/scenes/PolishedAuctionSceneV2.ts`.
- Change restoration mode difficulty/reward rules: `src/domain/restoration.ts`; change restoration choice/timing presentation in `src/game/restorationUi.ts`; update visual evidence through `scripts/capture-restoration-review.mjs`.
- Change Dealer Memory aggregation: `src/domain/history.ts`; change its polished lot-card presentation in `src/game/scenes/PolishedAuctionScene.ts`.
- Add/change catalog art: `public/assets/`, `src/data/artManifest.ts`, lot `artId` assignments and `src/data/artCoverage.test.ts`.
- Change Yandex icon/cover: `release/promotional/*.svg` + `scripts/render-yandex-promos.mjs`; never hand-edit generated PNGs.
- Change Yandex gameplay screenshot scenarios: `scripts/capture-yandex-screenshots.mjs`; keep them on the production build, real scene transitions and analytics-confirmed state changes.
- Change submission-bundle structure/checksums: `scripts/build-yandex-submission.mjs` + both GitHub workflows.
- Tune NPC/economy ranges: `src/data/balance.ts` + `docs/ECONOMY_AND_RETENTION.md`.
- Change clue generation/resale/inspection formulas: matching `src/domain/` module + focused unit tests.
- Change contracts/achievements/upgrades: `src/data/meta.ts` + `src/domain/meta.ts`.
- Change presentation: `src/game/scenes/` plus dedicated `src/game/*Ui.ts` helpers when a responsibility is already extracted.
- Change local/cloud save schema: `src/game/save.ts` + migration/normalization tests.
- Change device-local accessibility preferences: `src/game/preferences.ts`.
- Change Yandex Games/cloud/ads/lifecycle/Metrica: `src/platform/` + platform docs/tests.
- Change draft catalog text/limits: `release/yandex-draft-metadata.json` + `docs/YANDEX_DRAFT_METADATA.md` + validator.
- Change localized gameplay copy: `src/i18n.ts`.

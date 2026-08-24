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
- `.github/workflows/ci.yml` — CI gates, draft/archive validation, candidate ZIP, promo/screenshots and unified submission artifacts.
- `.github/workflows/yandex-release.yml` — moderation-ready release workflow; produces the game ZIP plus a single submission bundle and injects optional `YANDEX_METRICA_ID` into the release build.
- `release/yandex-draft-metadata.json` — machine-readable RU/EN draft copy and current visual-field constraints.
- `release/promotional/` — reviewed SVG sources for the Yandex catalog icon/cover; `generated/` is produced by CI/release rather than committed.
- `release/screenshots/generated/` — generated RU/EN desktop/mobile production screenshots; CI/release output only.
- `release/submission/generated/` — assembled Draft submission tree; CI/release output only.
- `scripts/validate-yandex-draft.mjs` — release metadata length/casing/consistency/spec validator, including package/release version parity.
- `scripts/validate-yandex-archive.mjs` — built archive root/path/size/SDK/title validator; rejects production source maps.
- `scripts/render-yandex-promos.mjs` — deterministic 512×512 icon and 800×470 cover PNG renderer/validator.
- `scripts/capture-yandex-screenshots.mjs` — production-build RU/EN gameplay capture plus non-blank art-region checks; current core-loop capture includes lot selection before bidding.
- `scripts/build-yandex-submission.mjs` — assembles game ZIP, promo art, screenshots and metadata with SHA-256 manifests.

## Documentation
- `GAME_DESIGN.md`, `ROADMAP.md`, `V1_ROADMAP.md` — product intent and delivery status.
- `PRE_RELEASE_AUDIT.md` — latest release-risk and maintainability audit.
- `ARCHITECTURE.md`, `ENGINEERING.md`, `DECISIONS.md` — technical contracts/workflow.
- `CONTENT_MODEL.md`, `ECONOMY_AND_RETENTION.md`, `CONTENT_DURATION.md` — content/economy/replayability rules and moderation evidence.
- `BUYER_MARKET.md` — daily specialist demand, collectible-trait and premium-sale rules.
- `RESTORATION.md`, `COLLECTIONS.md`, `TIERS.md`, `DAILY_SPECIAL.md`, `FIRST_SESSION.md` — gameplay contracts.
- `CLOUD_SAVE.md`, `YANDEX_INTEGRATION.md`, `MONETIZATION.md`, `MODERATION.md` — persistence/platform/release contracts.
- `YANDEX_DRAFT_METADATA.md` — ready-to-paste draft fields, generated promotional-art workflow and gameplay screenshot guidance.
- `ANALYTICS.md` — typed event schema plus optional Yandex Metrica transport/setup.
- `ART_DIRECTION.md`, `QA.md` — visual/device QA contracts.

## Source
### `src/main.ts`
Startup orchestration: SDK, sticky-banner gameplay policy, localized orientation guard, accessibility preferences, lifecycle, cloud sync, auction-history analytics sink, optional Metrica analytics sink and Phaser boot.

### `src/analytics.ts`
Versioned vendor-neutral gameplay analytics boundary, including lot-selection, auction, buyer-market, monetization, meta-progression and advanced-inspection events.

### `src/domain/`
Pure platform-agnostic rules and types.
- `auction.ts` — clue-backed lot generation, bidding, NPC budgets and bidder tells.
- `lotSelection.ts` — deterministic distinct-option sampling for the pre-auction market choice.
- `lotModifier.ts` — deterministic effects for rare visible lot events.
- `inspection.ts` — late-game inspection report rules.
- `restoration.ts` — condition/value formulas.
- `collection.ts` — collection resale/copy-count helpers.
- `meta.ts` — meta-progression calculations.
- `history.ts` — capped recent-auction history plus pure per-lot Dealer Memory summaries used by the selection screen.
- `*.test.ts` — deterministic domain coverage.

### `src/data/`
Static content/tuning inputs.
- `catalog.ts` — 36 items and 24 clue-backed lot templates, including their lot `artId` assignments.
- `itemTraits.ts` — stable collectible/provenance trait definitions and item assignments used by specialist demand.
- `buyers.ts` — category/specialist buyer definitions, deterministic daily offer selection and premium-sale matching/value rules.
- `buyers.test.ts` — deterministic offer, trait matching and premium regression coverage.
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
- `scenes/AuctionScene.ts` — three-option normal-auction selection with Dealer Memory, detailed lot lobby, bidding, clues, modifiers, bidder tells, advanced inspection, one-per-lot restoration and round summary/ads.
- `scenes/CollectionScene.ts` — paged collection sets, market-trait display, Buyer Market navigation and inventory quick-sale modal.
- `scenes/BuyerMarketScene.ts` — three deterministic daily buyers, premium inventory matching and one completed sale per offer/day.
- `scenes/OfficeScene.ts` — contracts, upgrades, achievements, stats, recent auction history and accessibility settings.
- `scenes/OnboardingScene.ts` — first-session onboarding.
- `store.ts`, `save.ts` — gameplay mutation and persistence boundaries, including Buyer Market day/claim state and transactions.
- `historyTracking.ts` — turns canonical typed analytics outcomes into capped persisted history; Dealer Memory reads this existing save data rather than introducing a new schema.
- `preferences.ts` — device-local sound/reduced-motion/high-contrast preferences.
- `feedback.ts` — lightweight Web Audio cues and motion-aware camera juice.
- `ui.ts` — shared buttons with mobile hit slop/contrast handling.
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
RU/EN gameplay, lot-selection/Dealer Memory, Office, inspection, accessibility and orientation copy. The Buyer Market keeps its compact RU/EN scene copy beside the isolated market UI for now. The visible game brand is `Auction Hunter` in both locales to match Yandex draft materials.

## Tests
- `src/domain/*.test.ts` — fast economy/game-rule unit tests, including deterministic lot-option sampling and Dealer Memory aggregation.
- `src/data/*.test.ts` — content integrity, Buyer Market rules, direct-art coverage, 36/24/12 scale and replayability regression coverage.
- `src/game/buyerMarket.test.ts` — focused persistence/transaction coverage for one-copy sale, one-offer-per-day and daily reset semantics.
- `src/platform/*.test.ts` — platform adapter contracts, including cloud-save ordering, that can be verified without live Yandex services.
- `tests/browser.spec.ts` — responsive/runtime/orientation smoke coverage.
- `tests/lot-selection.spec.ts` — browser funnel coverage for three unique options, market-cycle semantics, Dealer Memory rendering path, committed choice and delayed auction start.
- Other `tests/*.spec.ts` cover system contracts used by Playwright QA.
- `scripts/capture-yandex-screenshots.mjs` doubles as a production-build core-loop smoke test and rejects visually blank lot/item art.

## Where to make common changes
- Add/tune lots and clue signals: `src/data/catalog.ts` + `docs/CONTENT_MODEL.md`.
- Add/change stable collectible traits: `src/data/itemTraits.ts` + `docs/BUYER_MARKET.md`.
- Change Buyer Market buyers/premiums/matching: `src/data/buyers.ts`; transaction semantics live in `src/game/store.ts`; presentation lives in `src/game/scenes/BuyerMarketScene.ts`.
- Change normal-auction option sampling/selection behavior: `src/domain/lotSelection.ts` + `src/game/scenes/AuctionScene.ts` + focused browser coverage.
- Change Dealer Memory aggregation: `src/domain/history.ts`; change its presentation in `src/game/scenes/AuctionScene.ts`.
- Add/change catalog art: `public/assets/`, `src/data/artManifest.ts`, lot `artId` assignments and `src/data/artCoverage.test.ts`.
- Change Yandex icon/cover: `release/promotional/*.svg` + `scripts/render-yandex-promos.mjs`; never hand-edit generated PNGs.
- Change Yandex gameplay screenshot scenarios: `scripts/capture-yandex-screenshots.mjs`; keep them on the production build and real scene transitions.
- Change submission-bundle structure/checksums: `scripts/build-yandex-submission.mjs` + both GitHub workflows.
- Tune NPC/economy ranges: `src/data/balance.ts` + `docs/ECONOMY_AND_RETENTION.md`.
- Change clue generation/restoration/resale/inspection formulas: matching `src/domain/` module + focused unit tests.
- Change contracts/achievements/upgrades: `src/data/meta.ts` + `src/domain/meta.ts`.
- Change presentation: `src/game/scenes/`.
- Change local/cloud save schema: `src/game/save.ts` + migration/normalization tests.
- Change device-local accessibility preferences: `src/game/preferences.ts`.
- Change Yandex Games/cloud/ads/lifecycle/Metrica: `src/platform/` + platform docs/tests.
- Change draft catalog text/limits: `release/yandex-draft-metadata.json` + `docs/YANDEX_DRAFT_METADATA.md` + validator.
- Change localized gameplay copy: `src/i18n.ts`.

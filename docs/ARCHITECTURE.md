# Architecture

## Goals
The architecture should let us iterate on retention, economy and content rapidly without coupling those changes to Phaser rendering or Yandex-specific APIs.

## Layer model

```text
Browser / Yandex Games
        |
 platform adapters + cloud sync
        |
 game runtime / scenes / store
        |
 domain rules + data
```

Pure domain/data rules must remain usable without a running Phaser scene or Yandex SDK.

## Current modules

### Domain — `src/domain/`
- `types.ts` — shared model contracts.
- `auction.ts` — lot generation, appraisal inputs, bid increments, NPC budgets and bid eligibility.
- `restoration.ts` — condition/value multipliers and restoration outcomes.
- `*.test.ts` — deterministic Vitest coverage for economy-critical rules.
- No Phaser, DOM, storage or Yandex imports.

Randomness in domain rules is injected so tests can reproduce exact outcomes.

### Data — `src/data/`
Static content and tuning only; no runtime player state.
- `catalog.ts` — item and lot definitions.
- `balance.ts` — condition/market ranges and bidder profiles.
- `collections.ts` — collection metadata/helpers.
- `tiers.ts` — reputation and auction-tier definitions.
- `daily.ts` — deterministic daily-special definitions.
- `progression.ts` — first-session/progression configuration.

### Game — `src/game/`
- `scenes/AuctionScene.ts` — presentation, input and transition orchestration; delegates economy calculations to domain modules.
- `scenes/CollectionScene.ts` — collection-book presentation.
- `scenes/OnboardingScene.ts` — first-session onboarding.
- `store.ts` — gameplay-facing state mutation/persistence boundary.
- `save.ts` — versioned save normalization/serialization helpers.
- `art.ts`, `ui.ts`, `config.ts` — rendering/runtime infrastructure.
- `restoration.ts` — compatibility re-export; formula source of truth is `src/domain/restoration.ts`.

Scenes must not duplicate balance-critical formulas or call Yandex APIs directly.

### Persistence and cloud synchronization
The game is local-first.
- Local mutations are persisted immediately through the store/save boundary.
- `src/game/save.ts` owns normalized save shape handling.
- `src/platform/cloudSave.ts` mirrors/reconciles the normalized save with Yandex Player data.
- Startup synchronization occurs before gameplay scenes are created.
- Cloud failures must not roll back newer local progress.

See `docs/CLOUD_SAVE.md` for conflict and write policy.

### Platform — `src/platform/`
- `yandex.ts` — SDK initialization, Player access and platform lifecycle helpers.
- `cloudSave.ts` — Yandex Player-data synchronization.
- Future ads, payments and leaderboard adapters also belong here.

No other layer should call Yandex Games APIs directly.

### Analytics — `src/analytics.ts`
Owns the versioned gameplay event schema/dispatch boundary. Event semantics are defined in `docs/ANALYTICS.md`; UI implementation details should not leak into stable event names.

### Localization — `src/i18n.ts`
RU and EN are the baseline locales. Gameplay code requests localized copy instead of embedding parallel language strings throughout scenes.

## Dependency rules
Allowed direction:
- game -> domain
- game -> data
- game -> platform adapters
- game -> save/store abstractions
- data -> domain types/contracts
- domain -> domain
- platform -> browser/Yandex SDK
- startup -> analytics/platform/game bootstrap

Avoid:
- domain -> Phaser/DOM/platform/game/data tuning tables
- data -> game scene/storage
- scene -> raw Yandex SDK/direct localStorage
- platform -> Phaser scene logic

## Evolution triggers
Create/extract a dedicated module when a rule is reused, materially affects economy/retention, needs isolated tests, makes a scene hard to review, or requires platform lifecycle/error handling.

Likely future modules include `domain/progression.ts`, dedicated ad/payment adapters and a larger `game/ui/` design system as scope warrants.

## Performance posture
This is a browser game. Prefer compressed assets, bounded object/particle counts, lazy loading for larger content packs and clear low-allocation hot paths. Treat startup time and mobile memory as product metrics without speculative micro-optimization.

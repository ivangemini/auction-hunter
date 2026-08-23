# Architecture

## Goals
The architecture should let us iterate on retention, economy and content rapidly without coupling those changes to Phaser rendering or Yandex-specific APIs.

## Layer model

```text
Browser / Yandex Games
        |
   platform adapters
        |
 game runtime / scenes
        |
 domain rules + data
```

The domain/data side must remain usable without a running Phaser scene or Yandex SDK.

## Current modules

### Domain
`src/domain/`
- shared game types;
- future pure auction, valuation, progression and restoration rules;
- no Phaser, DOM, storage or Yandex imports.

### Data
`src/data/`
- item definitions;
- lot templates;
- balance/content inputs;
- no runtime player state.

### Game
`src/game/`
- scene lifecycle;
- visual rendering;
- input;
- orchestration between data/domain/store/platform adapters.

Scenes may prototype logic early, but balance-critical or reusable rules should migrate to pure modules as they stabilize.

### Persistence
`src/game/store.ts` is the current persistence boundary. This is deliberately simple for the vertical slice. Before the save shape becomes complex, introduce:
- an explicit schema version;
- migration functions;
- separation between serialization and gameplay APIs;
- cloud/local reconciliation rules.

### Platform
`src/platform/`
- SDK initialization;
- locale/platform signals;
- future ads, cloud save, leaderboard and payments adapters.

No other layer should call Yandex APIs directly.

### Localization
`src/i18n.ts` is the baseline locale boundary. As copy grows, split dictionaries/modules without changing the principle that gameplay code requests localized copy rather than embedding duplicated languages.

## Dependency rules
Allowed direction:
- game -> domain
- game -> data
- game -> platform adapters
- game -> persistence abstraction
- platform -> browser/Yandex SDK

Avoid:
- domain -> Phaser
- domain -> platform
- data -> game scene
- data -> storage
- scene -> raw Yandex SDK
- scene -> direct localStorage

## Evolution triggers
Create a dedicated module when any of these becomes true:
- a rule is used by more than one scene;
- a formula meaningfully affects economy/retention;
- behavior needs isolated tests;
- a scene is becoming hard to review safely;
- a platform integration needs lifecycle/error handling.

Likely future modules:
- `domain/auction.ts`
- `domain/valuation.ts`
- `domain/restoration.ts`
- `domain/progression.ts`
- `analytics/`
- `save/` with migrations and cloud reconciliation
- `game/ui/` design system/components

## Performance posture
This is a browser game. Prefer low allocation in hot paths, compressed assets, bounded particle/object counts and lazy loading for large content packs. Do not optimize speculative code at the expense of clarity, but treat mobile memory/startup time as product metrics.

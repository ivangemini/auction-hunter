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
- `auction.ts` — lot generation, appraisal inputs, bid increments, NPC budgets and bid eligibility;
- `restoration.ts` — condition/value multiplier and restoration outcomes;
- deterministic Vitest coverage next to the rules;
- no Phaser, DOM, storage or Yandex imports.

### Data
`src/data/`
- item definitions;
- lot templates;
- `balance.ts` for condition/market ranges and bidder profiles;
- no runtime player state.

### Game
`src/game/`
- scene lifecycle;
- visual rendering and art loading;
- input and timing;
- orchestration between data/domain/store/platform adapters.

`AuctionScene` owns presentation and transitions. It delegates balance-critical auction/restoration calculations to domain modules.

`src/game/restoration.ts` is a compatibility re-export only; the source of truth is `src/domain/restoration.ts`.

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
- data -> domain types/contracts
- domain -> domain
- platform -> browser/Yandex SDK

Avoid:
- domain -> Phaser
- domain -> platform
- domain -> game
- domain -> data tuning tables
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
- `domain/progression.ts`
- `analytics/`
- `save/` with migrations and cloud reconciliation
- `game/ui/` design system/components

## Performance posture
This is a browser game. Prefer low allocation in hot paths, compressed assets, bounded particle/object counts and lazy loading for large content packs. Do not optimize speculative code at the expense of clarity, but treat mobile memory/startup time as product metrics.

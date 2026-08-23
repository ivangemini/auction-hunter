# Data/content agent instructions

Applies to `src/data/` in addition to parent instructions.

## IDs are contracts
- Item, lot, category and future collection IDs must be unique, stable and machine-oriented.
- Never recycle an old ID for different content.
- Renaming a persisted ID requires a migration plan.

## Content rules
- Keep definitions declarative; no Phaser objects, DOM access or Yandex calls.
- Prices, rarity, item pools, conditions and future tuning values belong in data/config rather than scenes.
- User-visible names/descriptions must remain localizable.
- New content should not silently invalidate old saves or collection progress.

## Economy changes
When changing values that affect expected profit, rarity or progression speed:
1. Read `docs/ECONOMY_AND_RETENTION.md`.
2. State the intended player-behavior effect.
3. Avoid large global rebalance changes bundled with unrelated work.
4. Preserve a path for existing players whose bankroll/progression was earned under prior values.

## Validation direction
As the catalog grows, prefer schema/duplicate-ID validation scripts over manual inspection. Do not add hundreds of entries without automated validation.

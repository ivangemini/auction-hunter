# Decision log

Record durable choices that future agents should not casually reverse. Add an entry when a change alters a major architectural or product constraint.

## ADR-001 — Browser-first stack
**Status:** accepted

Use TypeScript + Phaser + Vite for the browser game. Yandex Games is the first distribution target, but core game rules should not depend on Yandex APIs.

## ADR-002 — Data-driven content
**Status:** accepted

Items, lots and balance inputs live outside Phaser scene rendering. Stable content IDs are treated as persisted/analytics contracts.

## ADR-003 — Platform isolation
**Status:** accepted

Direct Yandex SDK access is isolated under `src/platform/`. This supports local development, testing and future platform portability.

## ADR-004 — Retention without hostile monetization
**Status:** accepted

Curiosity, collection, skill and progression are the intended retention mechanisms. Rewarded ads are optional value exchanges; interstitials occur only at natural breaks. The base game must not be made intentionally tedious to force monetization.

## ADR-005 — Agent instruction hierarchy
**Status:** accepted

`AGENTS.md` is the canonical repository policy. Nested `AGENTS.md` files add directory-specific constraints. Tool-specific instruction files should point to the canonical hierarchy instead of copying large rule sets that can drift.

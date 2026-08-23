# Auction Hunter

Browser-first auction, appraisal, restoration and collection game targeting Yandex Games.

## Stack
- Phaser 4
- TypeScript
- Vite
- Vitest
- Playwright
- Yandex Games SDK

## Development

```bash
npm install
npm run dev
```

## Quality gates

```bash
npm run typecheck
npm test
npm run build
npm run qa:browser
```

## Project docs
- [`AGENTS.md`](./AGENTS.md) — canonical AI-agent/project rules
- [`docs/GAME_DESIGN.md`](./docs/GAME_DESIGN.md) — product/core-loop design
- [`docs/ROADMAP.md`](./docs/ROADMAP.md) — implementation sequence
- [`docs/PROJECT_MAP.md`](./docs/PROJECT_MAP.md) — repository navigation
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — module boundaries
- [`docs/ENGINEERING.md`](./docs/ENGINEERING.md) — development workflow
- [`docs/CONTENT_MODEL.md`](./docs/CONTENT_MODEL.md) — catalog/data contracts
- [`docs/ECONOMY_AND_RETENTION.md`](./docs/ECONOMY_AND_RETENTION.md) — tuning guardrails
- [`docs/RESTORATION.md`](./docs/RESTORATION.md) — restoration mechanic/economy
- [`docs/COLLECTIONS.md`](./docs/COLLECTIONS.md) — collection-book behavior
- [`docs/TIERS.md`](./docs/TIERS.md) — reputation and auction tiers
- [`docs/DAILY_SPECIAL.md`](./docs/DAILY_SPECIAL.md) — daily auction contract
- [`docs/FIRST_SESSION.md`](./docs/FIRST_SESSION.md) — onboarding/first-session progression
- [`docs/CLOUD_SAVE.md`](./docs/CLOUD_SAVE.md) — local/cloud save reconciliation
- [`docs/ANALYTICS.md`](./docs/ANALYTICS.md) — gameplay telemetry contract
- [`docs/ART_DIRECTION.md`](./docs/ART_DIRECTION.md) — visual language and assets
- [`docs/QA.md`](./docs/QA.md) — browser/device QA contract
- [`docs/YANDEX_INTEGRATION.md`](./docs/YANDEX_INTEGRATION.md) — platform contract
- [`docs/DECISIONS.md`](./docs/DECISIONS.md) — durable decisions

The current vertical slice includes onboarding, tiered/daily auctions, bidding, reveal/appraisal, optional restoration, collection progress, reputation, local-first/cloud-synced saves and versioned analytics.

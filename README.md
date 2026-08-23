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
- [`docs/ART_DIRECTION.md`](./docs/ART_DIRECTION.md) — visual language and assets
- [`docs/QA.md`](./docs/QA.md) — browser/device QA contract
- [`docs/YANDEX_INTEGRATION.md`](./docs/YANDEX_INTEGRATION.md) — platform contract
- [`docs/ANALYTICS.md`](./docs/ANALYTICS.md) — planned telemetry contract
- [`docs/DECISIONS.md`](./docs/DECISIONS.md) — durable decisions

The current vertical slice covers: inspect a lot, bid against NPCs, reveal items, appraise them, optionally restore them, then sell or keep them in the collection.

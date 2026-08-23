# Auction Hunter — agent instructions

This file is the canonical instruction set for AI coding agents working in this repository. Tool-specific files such as `CLAUDE.md`, `GEMINI.md`, Cursor rules and Copilot instructions point back here to avoid policy drift.

## Mission
Build a browser-first auction, appraisal, restoration and collection game for Yandex Games. Optimize for retention, replayability and sustainable monetization while preserving player trust, performance and maintainability.

## Read before changing code
1. `README.md`
2. `docs/GAME_DESIGN.md`
3. `docs/ROADMAP.md`
4. `docs/PROJECT_MAP.md`
5. `docs/ARCHITECTURE.md`
6. The nearest nested `AGENTS.md` for the files you will edit.

For economy, content, analytics or platform work also read the matching document in `docs/`.

## Product priorities
In order:
1. A clear and satisfying core loop.
2. Fast first-session time-to-fun and strong curiosity/reveal hooks.
3. Stable saves and no accidental loss of player progress.
4. Mobile and desktop browser usability.
5. Data-driven content and economy that can be tuned without rewriting scenes.
6. Optional, policy-compliant monetization. Never make the base game intentionally frustrating to sell relief.
7. Small, reversible changes backed by validation.

## Non-negotiable engineering rules
- Keep game/business rules out of Phaser rendering code when practical.
- `src/data` owns static content definitions; scenes must not hardcode item prices, rarity tables or lot economy values.
- `src/domain` owns pure auction, valuation, restoration and future progression rules.
- Randomness in domain rules must be injectable so tests are deterministic.
- `src/platform` is the only place allowed to call Yandex Games APIs directly.
- Persisted state must be accessed through the store/save layer, not ad-hoc `localStorage` calls.
- Treat persisted identifiers as public schema: do not rename or reuse item IDs without a migration plan.
- RU and EN are baseline locales. User-facing strings must not be scattered through gameplay logic.
- Preserve relative Vite base-path behavior so ZIP/archive hosting works on Yandex Games.
- Preserve correct Yandex `LoadingAPI.ready()` semantics: signal ready only after the game can be interacted with.
- Ads must never interrupt active input or create an accidental loss/failure state.
- Do not add new dependencies when a small local module is sufficient. Explain non-trivial dependency additions in the commit/PR.
- Do not perform broad refactors unrelated to the requested task.

## Architecture boundaries
- `src/domain/`: platform-agnostic types and pure game rules.
- `src/data/`: catalog, lot templates and static balancing/content inputs.
- `src/game/`: Phaser scenes, presentation and runtime orchestration.
- `src/platform/`: Yandex/browser integration boundaries.
- `src/i18n.ts`: localization foundation.

Dependency direction should generally flow from presentation/platform adapters toward domain/data, not the reverse. See `docs/ARCHITECTURE.md`.

## Change protocol
Before editing:
- Inspect the current implementation and relevant docs.
- Identify whether the change affects save schema, economy, analytics contracts, Yandex behavior or localization.

While editing:
- Prefer the smallest coherent change.
- Extract rules from scenes when they become independently testable domain logic.
- Keep data additions data-driven and deterministic in shape.
- Update documentation in the same change when a contract or architectural decision changes.

After editing:
- Run the quality gates below.
- Check mobile-sized layout for UI changes.
- Verify no user-facing text bypassed localization.
- For save/economy changes, explicitly reason about existing players.

## Quality gates
Required for functional changes:

```bash
npm run typecheck
npm test
npm run build
```

For browser/UI changes also run:

```bash
npm run qa:browser
```

CI runs unit and browser gates on pushes/PRs to `main`.

Do not claim a gate passed unless it was actually executed successfully. If execution is unavailable, state that clearly.

## Commit discipline
- Keep commits scoped and descriptive.
- Do not commit generated `dist/`, secrets, local caches or editor state.
- Avoid drive-by formatting of unrelated files.
- If a task changes product behavior, update `docs/GAME_DESIGN.md` or `docs/DECISIONS.md` as appropriate.

## Current core loop
Auction -> inspect clues -> bid/pass -> win lot -> reveal -> appraise -> optionally restore -> sell/keep -> bankroll/collection growth -> next auction.

## Source-of-truth docs
- Product: `docs/GAME_DESIGN.md`
- Delivery sequence: `docs/ROADMAP.md`
- File ownership: `docs/PROJECT_MAP.md`
- Technical structure: `docs/ARCHITECTURE.md`
- Engineering workflow: `docs/ENGINEERING.md`
- Content IDs/data: `docs/CONTENT_MODEL.md`
- Economy/retention: `docs/ECONOMY_AND_RETENTION.md`
- Restoration: `docs/RESTORATION.md`
- Yandex contract: `docs/YANDEX_INTEGRATION.md`
- Analytics contract: `docs/ANALYTICS.md`
- Architectural decisions: `docs/DECISIONS.md`

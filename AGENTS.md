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

For economy, content, save/cloud, analytics or platform work also read the matching source-of-truth document under `docs/`.

For any player-facing UI, art, layout, animation, game-feel or presentation work, **also read and apply**:
- `docs/ART_DIRECTION.md`
- `skills/auction-hunter-visual-design/SKILL.md`
- `skills/auction-hunter-animation-game-feel/SKILL.md`

Do not treat functional UI as visually complete merely because browser tests pass.

## Product priorities
In order:
1. A clear and satisfying core loop.
2. Fast first-session time-to-fun and strong curiosity/reveal hooks.
3. Stable saves and no accidental loss of player progress.
4. Mobile and desktop browser usability.
5. Data-driven content and economy that can be tuned without rewriting scenes.
6. Optional, policy-compliant monetization. Never make the base game intentionally frustrating to sell relief.
7. Small, reversible changes backed by validation.

## Visual-quality requirement
Auction Hunter is a game, not an admin dashboard. Player-facing screens must communicate the storage-auction/treasure-hunting fantasy through authored art, visual hierarchy, atmosphere, material language and responsive feedback.

For material presentation changes:
- identify the intended focal point before coding;
- prefer reusable visual systems over one-off rectangles/text styles;
- make lot/item imagery a meaningful part of the composition rather than a decorative thumbnail;
- add proportionate interaction/state feedback while respecting reduced-motion settings;
- inspect a production screenshot after implementation and perform another pass if it still reads as a wireframe/prototype;
- use `skills/auction-hunter-visual-design/references/visual-review-checklist.md` for review.

For animation/game-feel changes:
- motion must acknowledge input, clarify causality, direct attention, build tension or communicate reward/value;
- use the timing, reduced-motion, state-safety and performance rules in `skills/auction-hunter-animation-game-feel/SKILL.md`;
- animation must never become the source of economy/gameplay truth or introduce double-submit paths.

## Non-negotiable engineering rules
- Keep game/business rules out of Phaser rendering code when practical.
- `src/data` owns static content definitions/tuning; scenes must not hardcode item prices, rarity tables or economy ranges.
- `src/domain` owns pure auction, valuation, restoration and future reusable progression rules.
- Randomness in domain rules must be injectable so tests are deterministic.
- `src/platform` is the only place allowed to call Yandex Games APIs directly.
- Persisted state must go through store/save boundaries; never add ad-hoc `localStorage` writes.
- Preserve the local-first/cloud-sync contract in `docs/CLOUD_SAVE.md`; cloud failure must not destroy newer local progress.
- Treat persisted/content identifiers as public schema: do not rename/reuse IDs without migration/alias planning.
- RU and EN are baseline locales. User-facing strings must not be scattered through gameplay logic.
- Preserve relative Vite base-path behavior so ZIP/archive hosting works on Yandex Games.
- Preserve correct Yandex `LoadingAPI.ready()` semantics: signal ready only after the game can be interacted with.
- Ads must never interrupt active input or create an accidental loss/failure state.
- Do not add new dependencies when a small local module is sufficient. Explain non-trivial additions.
- Do not perform broad refactors unrelated to the requested task.

## Architecture boundaries
- `src/domain/`: platform-agnostic types and pure game rules.
- `src/data/`: catalog, collection/tier/daily/progression definitions and balance inputs.
- `src/game/`: Phaser scenes, presentation, local store/save and runtime orchestration.
- `src/platform/`: Yandex/browser integrations including cloud synchronization.
- `src/analytics.ts`: versioned gameplay analytics boundary.
- `src/i18n.ts`: localization foundation.

Dependency direction should follow `docs/ARCHITECTURE.md`.

## Change protocol
Before editing:
- Inspect current implementation and relevant docs.
- Identify save-schema, economy, analytics, Yandex, localization and existing-player implications.

While editing:
- Prefer the smallest coherent change.
- Extract independently testable rules from scenes into domain modules.
- Keep content/tuning data-driven and deterministic in shape.
- Update source-of-truth docs in the same change when a contract changes.

After editing:
- Run the quality gates below.
- Check mobile-sized layout for UI changes.
- Verify user-facing copy follows localization conventions.
- Explicitly reason about existing players for save/economy changes.
- For visual/UI work, inspect the resulting screenshot itself; test success alone is not visual acceptance.

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
- If product behavior changes, update the corresponding product/system doc and `ROADMAP.md` where relevant.

## Current core loop
Onboarding -> choose tier/daily lot -> inspect -> bid/pass -> reveal -> appraise -> optionally restore -> sell/keep -> collection/reputation/bankroll growth -> next auction.

## Source-of-truth docs
- Product/delivery: `docs/GAME_DESIGN.md`, `docs/ROADMAP.md`
- Architecture/workflow: `docs/ARCHITECTURE.md`, `docs/ENGINEERING.md`, `docs/DECISIONS.md`
- Content/economy: `docs/CONTENT_MODEL.md`, `docs/ECONOMY_AND_RETENTION.md`
- Gameplay systems: `docs/RESTORATION.md`, `docs/COLLECTIONS.md`, `docs/TIERS.md`, `docs/DAILY_SPECIAL.md`, `docs/FIRST_SESSION.md`
- Save/platform: `docs/CLOUD_SAVE.md`, `docs/YANDEX_INTEGRATION.md`
- Analytics: `docs/ANALYTICS.md`
- Visual/QA: `docs/ART_DIRECTION.md`, `skills/auction-hunter-visual-design/SKILL.md`, `skills/auction-hunter-animation-game-feel/SKILL.md`, `docs/QA.md`

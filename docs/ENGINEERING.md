# Engineering workflow

## Supported workflow

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

CI currently validates TypeScript and production build on pushes/PRs to `main`.

## Definition of done for functional changes
- Requested behavior is implemented.
- TypeScript gate passes.
- Production build passes.
- No unrelated behavior was changed.
- User-facing text follows localization conventions.
- Save/economy implications were checked when relevant.
- Relevant docs are updated when a contract changed.

## Browser/game QA
For visual or interaction changes, inspect at minimum:
- desktop pointer interaction;
- mobile-sized touch layout;
- resize/orientation behavior where applicable;
- repeated clicks/taps on transactional actions;
- page blur/focus around active gameplay.

Before release, expand to a browser/device matrix and document exact supported targets.

## Testing strategy
The vertical slice currently relies on typecheck/build gates. As domain logic grows, prioritize tests for:
1. save migration and serialization;
2. auction/bid state transitions;
3. valuation/economy formulas;
4. reward granting and ad callback idempotency;
5. catalog ID/schema validation;
6. progression unlock conditions.

Prefer pure functions for rules so these tests do not need Phaser.

## Dependency policy
Add a dependency only when it materially reduces complexity or provides a platform capability we should not maintain ourselves. Avoid libraries for trivial helpers.

For upgrades:
- inspect release notes for breaking changes;
- run all gates;
- keep framework/dependency upgrades separate from gameplay changes when possible.

## Generated and local files
Do not commit:
- `node_modules/`;
- `dist/` unless a future release process explicitly requires artifacts;
- editor caches;
- secrets/credentials;
- local environment files containing credentials.

## Validation honesty
Never state that tests, build, browser QA or CI passed unless the corresponding command/check was actually executed successfully. If tooling is unavailable, record the exact unverified gate.

# Engineering workflow

## Supported workflow

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
npm run qa:browser
```

CI validates TypeScript, unit tests, the production build and Chromium browser QA on pushes/PRs to `main`.

## Definition of done for functional changes
- Requested behavior is implemented.
- TypeScript gate passes.
- Unit tests pass.
- Production build passes.
- Relevant browser QA passes for UI/runtime changes.
- No unrelated behavior was changed.
- User-facing text follows localization conventions.
- Save/economy implications were checked when relevant.
- Relevant docs are updated when a contract changed.

## Browser/game QA
For visual or interaction changes, follow `docs/QA.md` and inspect at minimum:
- desktop pointer interaction;
- mobile-sized touch layout;
- resize/orientation behavior where applicable;
- repeated clicks/taps on transactional actions;
- page blur/focus around active gameplay.

## Testing strategy
Vitest is the fast unit-test runner. `vitest.config.ts` deliberately limits discovery to `src/**/*.test.ts`. Playwright owns `tests/*.spec.ts`; do not broaden Vitest discovery to those files because they depend on Playwright fixtures and browser execution.

Pure domain rules must be testable without Phaser, DOM or a browser. Playwright protects browser/runtime integration and responsive behavior.

`src/i18n.test.ts` is a unit-level contract test: RU and EN must expose the same non-empty copy keys and identical interpolation placeholders.

Current priority order:
1. auction generation, valuation and bid eligibility;
2. restoration/economy formulas;
3. save migration and serialization;
4. reward granting and ad callback idempotency;
5. catalog ID/schema validation;
6. progression unlock conditions.

Random domain rules must accept an injected random source so tests can reproduce exact outcomes.

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

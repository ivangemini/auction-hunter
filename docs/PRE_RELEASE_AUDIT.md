# Pre-release audit — 2026-08-24

## Scope
Review of release-critical platform boundaries, persistence, monetization lifecycle, content scale, test/CI coverage, release documentation and maintainability before the first Yandex Games submission.

## Findings addressed in this pass

### P0 — cloud-save upload ordering
Cloud writes were coalesced, but two explicit/lifecycle flushes could overlap at the network layer. If a newer `setData()` completed before an older in-flight request, the older request could theoretically become the last cloud write and create cross-device rollback.

Resolution: serialize cloud flush operations. A later flush waits for the current upload and then takes the newest pending save. Local persistence remains immediate and failed uploads remain recoverable. A focused concurrency regression test covers the ordering contract.

### P1 — repeated gameplay-state notifications
`setGameplayActive()` avoided duplicate Yandex GameplayAPI calls but still notified sticky-banner subscribers on repeated same-state calls. This could create redundant banner API requests during re-renders.

Resolution: gameplay activity subscribers now receive the current state once on subscription and thereafter only actual state transitions.

### P1 — moderation checklist lagged sticky-banner implementation
The runtime/QA documentation described API-controlled sticky banners, but the top-level moderation checklist did not yet include the required Yandex Console switch, placement/overlap check or active-gameplay hide/show verification.

Resolution: add those checks to `MODERATION.md`, plus a cloud-write ordering check under Saves.

### P2 — content documentation drift
Several source-of-truth docs still described older catalog/art states. `CONTENT_MODEL.md` described visual-archetype reuse for the second 12-item pass, `COLLECTIONS.md` listed only the first four sets, and `TIERS.md` still said each tier had one launch lot.

Resolution: synchronize content, collection, tier, art, project-map and v1 roadmap documentation with implemented behavior.

## Structural observations
- The CI pipeline is strong for a small browser game: draft validation, TypeScript, Vitest, production build, Playwright browser QA, screenshot capture and archive/submission validation all run on `main` pushes/PRs.
- `AuctionScene.ts` is the largest concentration of runtime complexity. Avoid adding another major mechanic directly to that scene before extracting responsibilities.
- `catalog.ts` is also becoming large. A future breadth pass beyond the current expansion should split catalog data by responsibility/tier or introduce a composable catalog boundary instead of indefinitely growing one file.
- Collection Book already paginates sets, so collection breadth can grow without a screen redesign.
- Before this audit the 24-item / 18-lot / 8-set floor was adequate as a minimum release proof but thin as a long-term reserve. The first breadth pass has now raised the target to 36 items, 24 lots / 8 per tier and 12 collection sets without changing save schema or tier unlock pacing.
- Data-driven breadth remains lower risk than adding another core mechanic before real telemetry. A second pack can be developed while the submitted candidate is in moderation, preferably after executable gates confirm the first pack.

## Remaining release gates
- Timed meaningful-play test in the real Yandex draft (internal target: at least 12 minutes; platform rule currently requires more than 10 minutes).
- Real desktop + landscape-mobile Yandex draft QA, including sticky placement, lifecycle, ads and cloud recovery.
- Analytics/Metrica verification if custom launch telemetry is enabled.
- First economy/retention tuning pass requires real traffic and is not a pre-submission coding task.

## Unverified executable gates
This audit was performed through repository inspection and targeted source changes. The local quality commands were not executed in this environment. CI remains the authoritative executable gate for typecheck, unit tests, production build, Playwright QA, screenshots and release-archive validation after commits land on `main`.

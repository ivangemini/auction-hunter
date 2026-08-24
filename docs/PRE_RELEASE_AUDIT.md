# Pre-release audit — 2026-08-24

## Scope
Review of release-critical platform boundaries, persistence, monetization lifecycle, content scale, test/CI coverage and maintainability before the first Yandex Games submission.

## Findings addressed in this pass

### P0 — cloud-save upload ordering
Cloud writes were coalesced, but two explicit/lifecycle flushes could overlap at the network layer. If a newer `setData()` completed before an older in-flight request, the older request could theoretically become the last cloud write and create cross-device rollback.

Resolution: serialize cloud flush operations. A later flush waits for the current upload and then takes the newest pending save. Local persistence remains immediate and failed uploads remain recoverable.

### P1 — repeated gameplay-state notifications
`setGameplayActive()` avoided duplicate Yandex GameplayAPI calls but still notified sticky-banner subscribers on repeated same-state calls. This could create redundant banner API requests during re-renders.

Resolution: gameplay activity subscribers now receive the current state once on subscription and thereafter only actual state transitions.

### P2 — content documentation drift
`CONTENT_MODEL.md` still described the second 12-item art pass as visual-archetype reuse even though direct art now exists for all 24 catalog items and automated art coverage enforces it.

Resolution: synchronize the content-model documentation with the implemented art contract.

## Structural observations
- The CI pipeline is strong for a small browser game: draft validation, TypeScript, Vitest, production build, Playwright browser QA, screenshot capture and archive/submission validation all run on `main` pushes/PRs.
- `AuctionScene.ts` is now the largest concentration of runtime complexity. Avoid adding another major mechanic directly to that scene before extracting responsibilities.
- `catalog.ts` is also becoming large. The next content-scale pass should move expansion data behind a composable catalog boundary rather than indefinitely growing one monolithic file.
- Collection Book already paginates sets, so collection breadth can grow without a screen redesign.
- The current 24-item / 18-lot / 8-set floor is adequate as a minimum release proof, but it is not a generous long-term content reserve. Expanding data-driven content is lower risk than adding another core mechanic before real telemetry.

## Unverified gates
This audit was performed through repository inspection. The local quality commands were not executed in this environment. CI remains the authoritative executable gate after the audit commit lands on `main`.

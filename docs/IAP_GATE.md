# IAP decision gate

## Current decision
Do not implement in-app purchases before real release telemetry exists. This is an intentional product gate, not missing engineering work.

The current monetization layer already provides optional rewarded video and sparse interstitial requests. Adding paid products before retention and economy behavior are measured would make it harder to distinguish whether players value the core loop or are compensating for poor balance.

## Metrics required before reopening IAP design
Review at least:
- first-session/core-loop completion;
- D1/D7 return behavior where available;
- median session length and auctions per session;
- bankroll/near-bankruptcy distribution;
- tier unlock pacing;
- collection engagement;
- rewarded-ad opt-in and completion;
- interstitial exposure versus session abandonment;
- revenue per active user alongside retention, not in isolation.

## Product guardrails if the gate opens
Prefer purchases that preserve the auction fantasy and do not turn cash progression into pay-to-win. Good candidates are cosmetic business/warehouse themes, display customization or a clearly scoped supporter-style permanent unlock. Avoid launch consumable cash packs until economy telemetry demonstrates that they cannot mask soft-lock or balance problems.

If purchases are introduced, all Yandex payment calls must live under `src/platform/`, product IDs become stable schema, callback/idempotency behavior must be tested, cloud-save interactions must be documented, and the release checklist must include purchase testing in draft mode.

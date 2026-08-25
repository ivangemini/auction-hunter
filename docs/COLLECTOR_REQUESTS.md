# Collector Requests

## Purpose
Collector Requests create medium-horizon hunting goals that are materially different from Daily Contracts and the Daily Buyer Market. A request asks for a **specific kind of concrete copy** — category, condition, traits or a combination — and rewards keeping the right specimen until a client appears.

## Cadence
One request stays active for six auction counts. The request key combines its definition ID with the deterministic window index, so refresh/local/cloud restore cannot reroll it.

The initial library contains eight RU/EN requests across three tiers:

- common;
- demanding;
- rare.

Examples include a high-condition watch commission, prototype/archive demand, documented art, sealed electronics, mechanical pieces, restoration projects, signed showpieces and museum-grade toys.

## Matching contract
Matching is performed against concrete `collectionItems`, not only the legacy item-ID index. A request may constrain:

- item category;
- one or more trait IDs;
- minimum condition;
- maximum condition;
- any-trait or all-traits matching.

The strongest qualifying owned copy is surfaced to the player. Pricing starts from that exact copy's saved appraisal, so condition, restoration and rolled traits already represented in the appraisal remain economically meaningful.

## Premiums and guardrails
Request multipliers are content-defined and domain-clamped to 1.05x–2.25x. The initial authored set is narrower than that defensive envelope.

Completing a request:

- removes exactly one concrete inventory instance and one matching compatibility collection entry;
- adds normal cash/lifetime sales;
- advances `itemsSold` and `salesValue` Daily Contract metrics;
- emits `collector_request_completed` plus normal collection-sale analytics;
- can happen only once for that deterministic request window.

Requests never block ordinary quick sale or Buyer Market sale. Failing/ignoring a request has no penalty and cannot soft-lock progression.

## Persistence
`claimedCollectorRequests` is an additive field on the existing v1 save. Legacy saves normalize to an empty list. Claim history is bounded in `GameStore` so long play does not grow save payload indefinitely.

## Presentation
The normal Buyer Market remains a three-dossier daily screen. Collector Requests are exposed as a separate compact commission entry in the header; opening it shows a focused private-client dossier with:

- request tier;
- remaining auction count;
- explicit requirements;
- premium percentage;
- best matching concrete copy when available;
- exact offer value;
- completed/no-match states.

This avoids turning the daily market into a fourth generic card while keeping trading decisions in one familiar location.

## Validation
- `src/domain/collectorRequests.test.ts` covers deterministic rotation, matching and pricing.
- `src/game/collectorRequests.test.ts` covers exact-copy sale, one-claim semantics and stale-window rejection.
- Browser/compact-landscape review remains required before the player-facing P8 acceptance item is closed.

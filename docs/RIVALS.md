# Rival dealers v0.4

## Purpose
The same named dealers recur across auctions so the player can learn readable personalities instead of facing interchangeable random budgets. P8 adds a persistent relationship layer and rare dealer-specific signature moves without ever exposing exact maximum bids.

Rival identity/tuning live in `src/data/balance.ts`; valuation, selection and bounded response rules live in `src/domain/auction.ts`; persistent learned knowledge lives in `src/domain/rivalMemory.ts`. Presentation remains a consumer of those rules.

## Stable dealers
The persistent roster contains six dealers:

| Dealer | Base behavior | Specialty | Specialty premium | Rare signature move |
| --- | --- | --- | ---: | --- |
| Victor | cautious / exits early | electronics + tools | 8% | early two-step opening jump |
| Mira | calculated / steady | watches + art | 10% | one late two-step last stand |
| Anton | pressure / double-step | toys + collectibles | 12% | one situational three-step counterpunch |
| Leah | steady style hunter | art + collectibles | 14% | early two-step opening jump |
| Roman | pressure / tech-minded | electronics + toys | 11% | one situational three-step counterpunch |
| Sofia | patient / steady | watches + tools | 13% | one late two-step last stand |

Only three unique rivals appear in one auction. Up to two slots preferentially come from specialists matching the concrete generated lot; the remaining room preserves wildcard variation.

## Hidden budget model
Each generated lot has a hidden appraisal based on concrete copies, condition and traits. A rival gives a modest premium only to matching specialty value before their existing hidden-value factor is sampled.

`rival lot value = normal hidden value + specialty item value × (specialty multiplier - 1)`

The result is rounded to the lot's bid increment. Market trends therefore affect rivals naturally through the same concrete appraisal path rather than a separate cheat multiplier.

VIP auctions are the only explicit format-level pressure adjustment: after the normal rival ceilings are generated, all participating ceilings receive a bounded 8% uplift. The VIP modifier is visible before commitment and the normal ceiling/eligibility rules still apply.

## Persistent dossier knowledge
Every resolved auction records one encounter against each participating rival. A player win records a head-to-head win against all participants; on a pass, only the actual rival leader receives a rival win. Duplicate IDs cannot produce duplicate encounter credit.

Knowledge unlocks from encounter count:

- **1 encounter:** meeting count becomes visible.
- **3 encounters:** the head-to-head record and learned-style state become visible.
- **6 encounters:** the dealer's authored weakness is revealed.

The dossier derives from additive v1 save fields `rivalEncounters`, `rivalPlayerWins` and `rivalWins`. Legacy saves normalize these records to empty objects; save version remains `1`. Knowledge never contains or derives an exact `maxBid` value.

## Rare signature moves
Each dealer has one authored signature pattern. Activation is deterministic from rival + lot + generated ceiling and occurs on roughly one fifth of eligible rival/lot combinations without consuming extra economy RNG.

A signature move:
- is situational rather than available on every response;
- can be used at most once by that rival during the auction;
- returns `null` when its trigger conditions are not met;
- can never exceed `opponentBidCeiling()`;
- falls back to the normal behavior response when unused or unavailable.

This creates memorable opponent moments without granting an invisible budget beyond the already-generated ceiling. `rival_signature_move_used` analytics separates these auctions from ordinary responses.

## Economy guardrails
- Specialty premiums apply only to matching item value, not the whole lot.
- Current specialty premiums remain 8–14%.
- Specialty multipliers are defensively capped at 2×.
- Signature moves alter bid shape, never the underlying ceiling.
- A signature is one-shot and sparse.
- VIP pressure is explicit, visible and bounded at +8% ceiling pressure.
- Existing profiles without specialty/signature fields preserve old behavior.

## Validation
Automated coverage protects six-dealer breadth, profile selection, specialty valuation, standard response rules, signature activation/ceiling bounds, dossier knowledge thresholds, persistent win/loss records and the global economy simulation. Player-facing CI continues to cover the auction scene so dossier copy and VIP/signature presentation remain subject to browser/screenshot QA.

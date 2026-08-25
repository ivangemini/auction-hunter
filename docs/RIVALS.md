# Rival dealers v0.3

## Purpose
The same named dealers appear across auctions so players can learn behavior rather than treating every NPC as an interchangeable random budget.

Rival identity and tuning live in `src/data/balance.ts`; valuation and profile selection live in `src/domain/auction.ts`. The active auction presentation shows the dealer identity, visible behavior/specialty text and current tell while exact max bids remain hidden.

## Stable dealers
The persistent roster now contains six dealers:

| Dealer | Visible behavior | Specialty | Specialty value premium |
| --- | --- | --- | ---: |
| Victor | cautious reseller / exits early | electronics + tools | 8% |
| Mira | calculated / steady | watches + art | 10% |
| Anton | pressure / double-step bids | toys + collectibles | 12% |
| Leah | style hunter / steady | art + collectibles | 14% |
| Roman | tech-minded / pressure | electronics + toys | 11% |
| Sofia | patient / steady | watches + tools | 13% |

The same dealer ID always keeps the same specialty. The roster is deliberately larger than the three opponents present in one auction so repeated lots do not collapse into one fixed trio.

## Opponent selection
The auction selects at most three unique rivals. Up to two slots preferentially come from dealers whose specialties match categories in the **concrete generated lot**, while remaining room is reserved for a wildcard rival.

That affects who turns up after the player commits to a lot but does not leak hidden contents beforehand. Lot-choice information continues to come only from truthful public clues, modifiers, persistent market-trend copy and Dealer Memory.

## Hidden budget model
Each generated lot has a hidden appraised value based on the exact generated copies. For a rival, matching specialty items are valued at that dealer's specialty multiplier before the dealer's normal hidden-value factor is sampled.

Conceptually:

`rival lot value = normal hidden value + specialty item value × (specialty multiplier - 1)`

The bidder-specific hidden-value factor is then applied and the result is rounded to the lot's bid increment.

Consequences:
- a dealer does not receive a flat advantage on every lot;
- a mixed lot only receives the premium on the relevant share of hidden value;
- market trends that change concrete appraisal values naturally change rival pressure through the same valuation path;
- per-copy condition/traits remain relevant because pressure starts from generated concrete copies rather than catalog base value.

## Live behavior
The launch behavior vocabulary remains intentionally readable:

- `cautious`: effectively leaves one normal bid step earlier;
- `steady`: follows the normal ceiling without special bid-step pressure;
- `pressure`: can answer with a two-step raise when budget allows.

Exact max bids remain communicated only through `calm` / `watching` / `hesitating` / `out` tells. Presentation code may animate or characterize these decisions, but domain rules remain the source of truth.

Six dealer identities currently map onto three mechanical behavior archetypes. P8 rival work should add a new dealer only when it brings a genuinely new readable rule or long-horizon relationship/dossier payoff; numeric reskins are not a content goal.

## Economy guardrails
- Specialty multipliers are additive only on matching item value, not the whole lot.
- Current authored specialty premiums remain modest (8–14%).
- Domain code clamps specialty multipliers to a maximum of 2× as a defensive bound.
- Profiles without a specialty preserve the old valuation behavior exactly.
- Rival identity is content definition rather than player-owned state; the current roster requires no save migration.

## Validation
Automated coverage protects roster breadth, valuation compatibility, specialty behavior, bid response rules and the global economy simulation. Any future rival-memory layer must add persisted knowledge without exposing exact max bids or creating a mandatory grind advantage.

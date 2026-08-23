# Analytics contract

Analytics is planned for the retention-ready MVP. This document defines naming/semantics before instrumentation so events remain consistent.

## Principles
- Events describe player actions/outcomes, not UI implementation details.
- Keep event names stable after release.
- Prefer structured properties over encoding values into event names.
- Do not send secrets or unnecessary personal data.
- Economy events should include enough context to reconstruct value flow.

## Initial event vocabulary
Planned examples:
- `session_started`
- `auction_viewed`
- `auction_bid_placed`
- `auction_passed`
- `auction_won`
- `lot_reveal_started`
- `item_revealed`
- `item_appraised`
- `item_sold`
- `item_kept`
- `lot_completed`
- `collection_item_added`
- `rewarded_offer_shown`
- `rewarded_started`
- `rewarded_completed`
- `rewarded_closed`
- `interstitial_shown`

## Common properties
Use stable IDs where possible:
- session ID;
- auction/lot template ID;
- generated lot/session instance ID when added;
- item ID;
- auction tier;
- bankroll before/after for economy actions;
- bid/purchase/sale value;
- rarity/category;
- elapsed session/core-loop time.

## Funnel
The first-session funnel should allow us to measure:
`game ready -> first auction viewed -> first bid -> first lot won -> first reveal -> first appraisal -> first sell/keep -> first lot completed -> second auction started`.

## Change control
If an event's meaning changes materially, add a new event/property version rather than silently reusing the old semantic contract.

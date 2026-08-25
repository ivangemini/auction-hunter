# Legendary discovery chains

## Purpose
Legendary discovery chains are long-horizon treasure trails layered onto the normal auction loop. They reward recognizing connected finds across separate auctions without replacing truthful lot clues, exact appraisal uncertainty, collection decisions or Buyer Market trading.

## v0.1 foundation
Three authored chains are defined in `src/data/discoveryChains.ts`:

- `watchmaker-ledger`: travel clock -> military wristwatch -> 1930s pocket watch.
- `prototype-trail`: tin wind-up car -> pre-production figure -> prototype collectible toy.
- `lost-master-study`: numbered gallery print -> signed concert poster -> master artist study.

Each chain has localized RU/EN premise and step copy plus fixed completion cash and reputation rewards.

## Progression contract
- A chain advances only when the next ordered item is discovered during the active round and then dispositioned through the normal Sell or Keep action.
- Selling a previously owned Collection copy or selling through Buyer Market does not count as a new discovery.
- A chain can advance at most once per auction number. Multiple matching finds in one lot cannot skip the multi-auction pacing.
- Discovering a later step before its prerequisite does not advance the chain.
- Completion is permanent and rewards are granted once.
- Progress is deterministic; no chain rule depends on rendering state or random UI timing.

## Persistence and compatibility
The existing save remains `version: 1`. Three additive fields are normalized with empty defaults for legacy saves:

- `discoveryChainProgress: Record<string, number>`
- `discoveryChainLastAuction: Record<string, number>`
- `completedDiscoveryChains: string[]`

Cloud save continues to serialize the canonical `PlayerSave` through the existing local-first boundary. No direct platform or ad-hoc storage writes are introduced.

## Analytics
`discovery_chain_progressed` records chain id, item id, stage, total stages, auction number, completion state and any completion rewards. It is available to the normal analytics/Metrica parameter stream but is not a launch funnel goal.

## Player presentation
`DiscoveryBoardScene` is reachable from Collection Book and presents the three authored trails as investigation cases rather than a generic progress dashboard.

- Completed steps show the discovered item identity.
- The current authored lead is visible; later stages stay visually locked until prerequisites advance.
- The board shows stage progress and the fixed completion reward without inspecting any active lot's hidden contents.
- A fresh Sell/Keep discovery produces an immediate modal acknowledgement in the reveal loop. Ordinary progression shows the newly unlocked lead; final progression shows the one-time cash/REP reward.
- Presentation is derived from already-persisted save state. The modal does not decide or persist progression.
- Reduced-motion users receive the same information without relying on entrance animation.

## Visual QA
`scripts/capture-collection-market-review.mjs` now covers Collection Book -> Discovery Board -> Buyer Market through real navigation. It seeds one early trail, one near-complete trail and one completed trail, then captures both RU and EN at the production 1280×720 review size. This keeps active, locked and completed case states in the persistent screenshot gate.

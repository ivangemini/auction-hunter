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

## Presentation still required
The foundation intentionally does not claim the P6 roadmap item complete yet. A player-facing follow-up must surface active trails, next clue/progress, completion feedback and RU/EN visual QA without turning the mechanic into a dashboard or revealing hidden lot contents.

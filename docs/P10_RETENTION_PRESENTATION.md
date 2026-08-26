# P10 — Retention, showroom and audiovisual polish

P10 improves long-horizon ownership, sensory reward and presentation before adding more raw catalog breadth. Auction Hunter already has enough item/lot/set breadth for launch-scale variety; this phase should make existing finds, rivals and auctions feel more valuable and memorable.

## Product thesis

P10 should strengthen three retention layers without replacing the existing core loop:

1. **Ownership** — rare finds should remain visible and emotionally valuable after the sell/keep decision.
2. **Anticipation and payoff** — bidding, reveal, appraisal, restoration, sale and collection completion should have stronger audiovisual causality.
3. **Return reasons** — a weekly high-stakes event should complement Daily Special/contracts without creating a second mandatory grind.

Do not turn the game into a decoration simulator or a casino-effects showcase. New presentation must stay subordinate to auction decisions, collection strategy and readable values.

## P10.1 — Dealer Showroom / Trophy Garage

### Goal

Give retained finds a physical home that changes as the dealer business grows. The showroom is a long-term trophy surface, not another inventory table.

### First playable slice

The first P10 slice deliberately requires **no save migration**:

- the existing `businessUpgrades.showroom` level controls display capacity;
- level 0/1/2/3 exposes 4/6/8/10 trophy positions;
- displayed items are derived from the existing legacy `collection` index plus concrete `collectionItems` where available;
- only one copy of each item identity may be displayed automatically;
- the strongest concrete copy wins for that identity;
- rarity is the primary trophy-order signal, followed by concrete appraisal, condition and restored state;
- saves created before concrete inventory persistence still render through a base-value legacy fallback;
- display membership does not remove, lock or economically alter inventory.

The existing Showroom business upgrade keeps its collection-set reward multiplier. P10 display capacity is an additional presentation benefit, not a silent rebalance.

### Visual progression

The room should visibly move through four identities:

1. garage shelf;
2. lit display;
3. curated hall;
4. dealer gallery.

The centerpiece receives the strongest visual hierarchy. Remaining trophies use cabinet/pedestal slots with direct item art. Locked positions should communicate the existing Showroom upgrade as the route to more space.

### Next layers

- backward-compatible manual pinning and ordering of displayed concrete copies;
- room-decoration choices and optional cosmetic cash sinks that never gate progression;
- campaign trophies/evidence as non-inventory display props where appropriate;
- showroom milestones/analytics only after the basic ownership loop is stable.

## P10.2 — Production sound design and music

The current oscillator feedback layer remains a safe fallback, but it is not the production sound ceiling.

### SFX bank

Add small, compressed, browser-safe sampled effects for:

- UI press/confirm/back;
- player bid, NPC bid, pass, warning and sold/hammer;
- reveal materials such as cardboard, cloth, metal, glass, paper and electronics;
- appraisal/value confirmation;
- restoration tools and perfect/good/rough outcomes;
- cash movement, Buyer Market sale, keep, reward, set completion and achievement unlock.

The sample system should retain oscillator fallback behavior if an asset fails to decode or audio is unavailable.

### Ambience

Use restrained loop families for Garage, Estate, Collector/private auction and major campaign/finale spaces. Loops must pause/resume correctly around focus loss, Yandex ads and platform lifecycle events.

### Music

Prefer a small adaptive score over many unrelated tracks:

- Office/collection;
- normal auction;
- high-tier/private auction;
- investigation/campaign tension;
- finale;
- epilogue/victory.

Auction music may add one bounded tension layer as bidding narrows, but music state must never affect auction timing or outcomes.

### Voice/crowd layer

Short auctioneer and crowd barks may be localized for RU/EN. Prefer brief calls and non-verbal crowd reactions over expensive dialogue-heavy voice acting. Important information must remain readable without audio.

### Settings and performance

Add independent SFX/music/ambience controls only when the sampled audio layer exists. Audio assets should be compressed, lazy where practical, and tested on modest mobile browsers.

## P10.3 — Character reactions and game feel

Extend the existing P7 motion language rather than replacing it.

Priorities:

- 3–5 bounded visual reaction states for important rivals/principals: idle, interested, pressured, aggressive bid, win/loss;
- stronger staged reveal: concealment -> object focus -> rarity/name -> appraisal -> traits/provenance;
- causal sale feedback that connects the sold object/value delta to bankroll change;
- distinct Buyer Market premium-sale acknowledgement;
- collection-set and achievement completion beats stronger than ordinary sales;
- restrained ambient motion such as dust/light/fan/background crowd only where it reinforces place.

All motion keeps reduced-motion equivalence, state safety and mobile performance limits from the animation/game-feel skill.

## P10.4 — Weekly Vault Auction

Add one weekly event rather than another daily checklist.

Target shape:

- deterministic local-week seed;
- a short multi-lot run with a shared event budget;
- rotating theme/rule package such as electronics, estate archive, restoration-heavy or rival pressure;
- meaningful prioritization so buying every target is not always optimal;
- one bounded weekly reward/claim state with cloud-safe persistence;
- event analytics for entry, lot choices, completion and return behavior;
- economy/replayability simulation before reward tuning.

The weekly event must not punish players for missing a week and must not become required campaign progression.

## P10.5 — Hero visual fidelity

The 72-item catalog already has direct authored art. P10 should spend art effort selectively instead of redrawing everything.

Priorities:

- top 10–15 legendary/campaign hero finds receive higher-fidelity vector/raster-hybrid treatment;
- principal characters gain expression/pose variants for auction reactions;
- selected lot environments gain controlled variants such as late-night, rain, VIP/private, seized/abandoned or crowded states;
- campaign evidence/finale props may receive hero presentation when they become a focal reward.

Semantic texture IDs remain stable so higher-fidelity replacements do not leak file-format decisions into gameplay code.

## Compatibility rules

- No reset/prestige requirement is introduced by P10.
- Existing collection, concrete-copy inventory, campaign, P8 systems and economy remain authoritative.
- Existing `showroom` upgrade semantics are preserved.
- New persistence must be additive/defaultable and safe for old local/cloud saves.
- Weekly state must use explicit stable identifiers and bounded local-week keys.
- Audio/motion presentation can never become gameplay truth.

## QA and acceptance

For every material P10 player-facing tranche:

- typecheck, tests, production build and browser QA must pass;
- RU/EN desktop and 844x390 compact-landscape screenshots must be generated where resting-state review is meaningful;
- screenshots must be manually inspected, not only existence-checked;
- reduced-motion paths must remain valid;
- sampled audio must be checked for decode failure/fallback, focus/ad lifecycle and mobile performance;
- real-device audio and motion acceptance remains required before release claims.

Telemetry should decide later reward/economy tuning. Do not increase reward size, event pressure or monetization cadence merely because the new retention surfaces exist.

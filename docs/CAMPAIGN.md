# P9 Campaign — The Black Ledger

## Product goal

Turn Auction Hunter into a structured treasure-hunting campaign without replacing the auction/economy game. The campaign should provide roughly 6–10 hours of authored progression, then hand the player into the existing systemic P8 endgame.

Narrative rule: a story beat is valuable only when it creates a later auction, evidence, inventory, relationship or economic decision. Dialogue exists to frame decisions, not to become the game.

## Central mystery

Years ago, reclusive collector **Aleksandr Veyr** disappeared after quietly breaking up a private collection known among dealers as **The Black Ledger**. The name refers both to a physical handwritten ledger and to the collection indexed inside it: objects acquired through bankrupt estates, shuttered workshops and private expeditions whose provenance was deliberately obscured.

A mundane estate clearance puts the first numbered ledger fragment into circulation. Other dealers recognize its mark. From that point, ordinary auctions begin intersecting with a race to reconstruct the ledger before a private buyer can consolidate the collection.

The mystery is grounded in auction gameplay: provenance, incomplete evidence, competing valuations, fake documents, rival ownership and opportunity cost. It is not supernatural and does not reveal hidden exact values outside normal appraisal rules.

## Five-act structure

### Chapter I — First Flip
Target: 30–45 minutes.

The player is introduced to the ordinary dealer loop and mentor/auctioneer context. A low-tier estate lot contains an apparently unimportant provenance slip bearing Veyr's black seal.

Gameplay beats:
- normal auction competence;
- first evidence discovery;
- first explicit choice between immediate profit and preserving evidence;
- Victor becomes the first dealer who visibly recognizes the seal.

Chapter turn: the slip points to an estate inventory number that should not exist in the public catalogue.

### Chapter II — Estate Trail
Target: 60–90 minutes.

The player follows estate clearances and must distinguish useful evidence from expensive noise.

Gameplay beats:
- identify the correct lot from truthful visual/document clues;
- linked two-lot purchase under one budget;
- first counterfeit provenance document;
- optional restoration preserves a serial/engraving clue;
- Mira can trade information for an owned collectible or cash.

Chapter turn: evidence shows that several Black Ledger objects were deliberately sold to different dealers on the same week.

### Chapter III — Dealer War
Target: 90–120 minutes.

The search becomes visible to the rival network. Dealer relationships gain campaign consequences.

Gameplay beats:
- choose which dealer to approach for information;
- rival-owned target can be tracked instead of immediately acquired;
- off-auction negotiation using cash, concrete inventory or favor;
- multi-lot mission where buying the first attractive lot can make the actual target unaffordable;
- a chapter choice establishes trust/rivalry/debt with a principal dealer.

Chapter turn: a private invitation reveals that the collection is being reconsolidated by an anonymous buyer.

### Chapter IV — Closed Circle
Target: 90–150 minutes.

The player enters invitation-only auctions and faces stronger information asymmetry.

Gameplay beats:
- acquire or earn a private-auction invitation;
- closed auction with limited inspection;
- identify a deliberate fake without receiving a free exact-value answer;
- choose whether to expose the fake, exploit it as leverage, or walk away;
- evidence board begins showing multiple plausible routes to the final location.

Chapter turn: the physical Black Ledger is real, but its final pages were removed. The anonymous buyer has one part; a rival has another.

### Chapter V — The Lost Collection
Target: 90–150 minutes.

The campaign culminates in a multi-stage estate/private auction. The player cannot buy every target.

Gameplay beats:
- prepare using evidence and relationships;
- choose a route/ally before the finale;
- 3–4 linked final lots share one campaign budget envelope;
- some lots are valuable financially, others resolve evidence or alter the epilogue;
- rival assistance/pressure depends on earlier choices;
- final ownership/evidence state determines the resolution.

Post-game: Endless Dealer Career unlocks with all P8 systems intact. No prestige/reset is required.

## Principal characters

Use existing cast first.

- **Victor** — recognizes institutional provenance and initially treats the player as an amateur. Arc axis: professional respect vs rivalry.
- **Mira** — information broker mentality; values margins and leverage. Arc axis: trust vs transactional debt.
- **Anton** — aggressive collector who may overcommit when a personal target appears. Arc axis: rivalry vs reluctant cooperation.
- One additional existing rival should become a late-campaign Closed Circle contact after roster review.
- Mentor/auctioneer remains a framing character and tutorial voice, not a magical source of correct answers.

Campaign relationships never reveal exact max bids.

## Campaign state contract

Planned additive save state:
- current chapter;
- completed mission IDs;
- active mission ID;
- evidence IDs discovered;
- branch choice IDs;
- campaign relationship flags/values;
- finale/epilogue state;
- campaign completed flag.

Legacy saves normalize to campaign-not-started without changing bankroll, REP, collection, rivals, contracts, trends or discovery progress.

## Mission objective vocabulary

The first implementation should support reusable objective types rather than hardcoding every mission into scenes:

- win a specified story lot;
- identify/select the correct lot from evidence;
- acquire one of a set of acceptable evidence-bearing items;
- keep/preserve a target instead of selling it;
- complete a linked-lot sequence under a total spend cap;
- do not exceed a bid ceiling;
- appraise/restore a target to reveal evidence;
- allow a named rival to win a tracked target;
- fulfill a concrete negotiation cost (cash or owned item);
- make a campaign branch choice;
- optional objective with bonus reward/relationship effect.

## Art and texture production plan

Campaign production must add visual assets alongside mechanics, not after all gameplay is coded.

### Campaign environment set
At least six semantic hero environments:
1. `campaign-estate-study` — dusty private study, dark wood, green-shaded lamp, archive boxes, framed maps.
2. `campaign-records-basement` — municipal/archive basement, steel shelving, paper bundles, fluorescent spill.
3. `campaign-dealer-backroom` — cramped dealer room with display cases, packing paper and warm task lights.
4. `campaign-private-preview` — upscale preview room, velvet ropes, dark walls, controlled spot lighting.
5. `campaign-closed-auction` — intimate invitation auction, numbered paddles, brass details, low warm light.
6. `campaign-veyr-estate` — final estate hall/study hybrid with layered evidence props and stronger authored composition.

### Evidence props/textures
Create semantic assets for:
- black wax seal;
- torn ledger page;
- numbered provenance folder;
- invitation card;
- annotated estate photograph;
- marked map;
- dealer handwritten note;
- forged certificate variant.

These should be authored/generated as production assets with readable silhouette/material, not flat UI icons. Paper assets need distinct paper grain, aging, ink/stamp language and edge wear while keeping text itself rendered/localized in UI where necessary.

### Story-critical item art
Every new story item gets direct hero art at the same or higher fidelity than P7 catalog art. Prefer strong three-quarter object presentation and condition variants when restoration/evidence depends on physical wear.

## First implementation slice

P9 should begin with a vertical campaign slice rather than all five chapters at once:

1. campaign domain/types + authored chapter/mission data;
2. legacy-safe campaign progress normalization/persistence;
3. Chapter I with 3–4 missions;
4. first Black Ledger evidence prop and campaign-specific estate-study environment;
5. Investigation Wall/mission briefing entry in Business Office;
6. one story mission that changes the normal auction decision rather than only displaying text;
7. typed analytics and deterministic integrity tests;
8. desktop + 844×390 RU/EN visual capture.

Only after this slice feels like Auction Hunter rather than a dialogue overlay should Chapters II–V be produced.

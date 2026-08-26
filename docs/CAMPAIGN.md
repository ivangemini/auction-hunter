# P9 Campaign — The Black Ledger

## Status

The authored campaign feature set is implemented. P9 remains **ACTIVE** only because three release-level acceptance items still require human evidence: a no-shortcuts real-device playthrough, measured 6–10 hour first-play duration, and final human visual inspection.

Current production scope:

- 5 authored chapters;
- 28 production missions;
- 72 item identities;
- 42 normal lot templates;
- 36 collection sets;
- 5 optional campaign mastery objectives;
- 4 mechanically resolved epilogues;
- 20 semantic campaign production assets plus direct P9 item art;
- P8 systemic endgame retained after the finale.

The authored chapter-time envelope is currently **415–625 minutes** (6 h 55 min – 10 h 25 min). That is a regression-protected design budget, not proof of real player duration. See `P9_TELEMETRY.md`.

## Product rule

Auction Hunter remains an auction/economy game. Narrative exists to create later auction, evidence, inventory, relationship, restoration, route-planning or economic decisions. P9 must not collapse into a dialogue-only visual novel.

The story never gives away exact hidden item value or NPC bid ceilings outside the existing appraisal/auction information rules.

## Central mystery

Reclusive collector **Aleksandr Veyr** disappeared after quietly breaking apart a private collection known among dealers as **The Black Ledger**. The name refers both to a handwritten ledger and to the collection indexed inside it: objects acquired through bankrupt estates, shuttered workshops and private expeditions whose provenance was deliberately obscured.

A mundane estate clearance puts the first numbered Black Ledger trace into circulation. Other dealers recognize its mark. Ordinary auctions then become part of a race to reconstruct the ledger before competing dealers and a private buyer consolidate the remaining pieces.

The mystery is grounded in provenance, incomplete evidence, competing valuations, forged documentation, rival ownership and opportunity cost. It is not supernatural.

## Five-act production structure

### Chapter I — First Flip

Authored budget: **30–45 minutes**. Four missions.

Purpose: teach the ordinary dealer loop, then make the first profit-versus-evidence choice.

Key beats:

- complete a normal auction;
- prove bidding discipline under Victor's scrutiny;
- preserve the Black Seal evidence instead of taking immediate profit;
- follow an inventory number that should not exist in the public catalogue.

### Chapter II — Estate Trail

Authored budget: **75–110 minutes**. Six missions.

Purpose: expand evidence handling into materially different gameplay.

Key beats:

- select the correct evidence-bearing lot from truthful clues;
- acquire linked targets under one shared budget;
- identify false provenance;
- use restoration carefully enough to recover a serial trace;
- complete two ordinary auctions to compare repeated clearance patterns;
- negotiate with Mira using cash/favor/relationship consequences.

### Chapter III — Dealer War

Authored budget: **110–155 minutes**. Seven missions.

Purpose: make the rival network mechanically consequential.

Key beats:

- track a leak through dealer behavior;
- withstand Anton's campaign pressure;
- choose an ally;
- resolve Nadia's Archive through trade, purchase or pressure;
- allocate a proxy bid;
- handle a counteroffer;
- recover the route into the Closed Circle.

Nadia is a full campaign principal here: her trust/rivalry outcome feeds back into real auction pressure rather than existing only as dialogue.

### Chapter IV — Closed Circle

Authored budget: **110–165 minutes**. Six missions.

Purpose: increase information asymmetry and consequence density.

Key beats:

- limited private preview;
- sealed-bid decision;
- relationship/debt gate;
- counterfeit-table deduction;
- silent-room / private-auction pressure;
- ledger-room resolution that opens the final route.

### Chapter V — The Lost Collection

Authored budget: **90–150 minutes**. Five missions.

Purpose: force the player to convert the accumulated evidence, bankroll and relationships into a final strategic plan.

Production sequence:

1. choose/resolve the final route;
2. complete three normal auctions to read the late-game market;
3. win two auctions under renewed Anton pressure;
4. prepare the final partner/budget plan;
5. enter the four-lot Veyr finale.

The final auction uses one shared budget. Buying everything is impossible. Evidence lots and financially attractive lots compete for the same resources, so the epilogue is resolved from actual ownership plus relationship state rather than a standalone dialogue choice.

## Mission objective vocabulary

The campaign graph uses reusable objective types rather than one scene per piece of prose:

- normal auction play/win gates;
- keep evidence;
- select an evidence-bearing lot;
- linked-budget acquisition;
- provenance appraisal;
- restoration trace;
- rival tracking;
- negotiation;
- branch choice;
- proxy bid;
- rival deal;
- limited preview;
- sealed bid;
- relationship gate;
- counterfeit table;
- route plan;
- finale preparation;
- multi-lot finale.

Five optional mastery objectives add rewards/relationship effects without blocking the main campaign.

## Principal characters

- **Victor (`npc-0`)** — institutional provenance, professional respect and skepticism.
- **Mira (`npc-1`)** — information leverage, trust and transactional debt.
- **Anton (`npc-2`)** — aggressive collector pressure and rivalry.
- **Nadia (`npc-6`)** — archive intelligence with a dedicated Dealer War negotiation and downstream auction-pressure consequences.
- Mentor/auctioneer frames the first-session experience but is never a magical source of correct values or bid ceilings.

Campaign relationships are bounded trust/rivalry/debt values. They may alter sponsorship, information and bidding pressure, but they never expose exact NPC maximum bids.

## Persistence contract

P9 remains additive inside the version-1 save contract. Campaign progress persists:

- `started`;
- `activeMissionId`;
- `completedMissionIds`;
- `evidenceIds`;
- `branchChoiceIds`;
- per-mission auction baselines;
- relationship trust/rivalry/debt;
- `completed`;
- `epilogueId`.

Legacy saves normalize to campaign-not-started without resetting bankroll, REP, collection, concrete inventory copies, business upgrades, buyer state, rivals, market trends, Discovery progress or P8 systems.

`src/data/p9CompatibilityAcceptance.test.ts` protects the old-save/cloud/monetization/P8 compatibility boundary after the 72/42/36 content expansion.

## Finale and post-game

The finale resolves one of four outcomes from acquired finale lots plus campaign relationship support:

- `shared-truth`;
- `ledger-restored`;
- `dealer-king`;
- `unfinished-ledger`.

Campaign completion does not reset the economy. Endless Dealer Career immediately keeps the player's collection, bankroll, Office, Buyer Market, rivals, trends, Discovery cases and all P8 replayability systems.

The completed Campaign HQ exposes a persistent **Case Record** derived from existing save data. It summarizes:

- missions completed;
- evidence recovered;
- optional mastery completed;
- finale lots recovered;
- strongest ally;
- strongest rival.

The epilogue remains reopenable after restart. No extra save migration is required for the Case Record because it is derived from existing campaign state.

## Content and art contract

P9 content breadth reached the target **72 items / 42 lots / 36 sets** while keeping old IDs/rewards stable.

Every P9 catalog addition must keep:

- direct semantic 512×360 item art;
- truthful lot-category clues;
- at least one meaningful gameplay/story use;
- collection-set coverage;
- stable IDs for save compatibility.

Campaign visuals include at least six authored environment/hero compositions: estate study, records basement, dealer backroom, Closed Circle room, river archive and Veyr estate/finale. Evidence/hero assets include the Black Seal, ledger fragments, invitations, provenance folders, sponsor/proxy material, route maps and finale objects.

Text remains localized in UI rather than embedded into production art where possible.

## Analytics and duration measurement

Typed events cover mission start/completion, optional mastery, branch choices, relationship auction effects and campaign-specific provenance reveals.

`campaign_mission_started`, `campaign_mission_completed` and `campaign_optional_objective_completed` are stable Yandex Metrica JavaScript goals. Their `chapterId`/`missionId` payloads allow mission funnels and pacing reports without creating 28 separate event types.

Use `P9_TELEMETRY.md` for the exact distinction between wall-clock time-to-finale and active first-play duration. The 6–10 hour roadmap item must not be checked from the authored budget alone.

## Automated acceptance

Current automated coverage includes:

- production campaign/test bootstrap parity;
- complete 28-mission graph integrity and fresh-state graph walk;
- a Playwright 28-state production-path mission render matrix;
- old-save/cloud/monetization/P8 compatibility acceptance;
- 30/60/120-minute long-horizon economy gates;
- RU/EN desktop + 844×390 campaign-state transition validation;
- campaign evidence texture rendering validation;
- desktop and compact campaign asset review sheets;
- P9 item-art compact review plus full catalog art manifest coverage;
- persistent epilogue and post-game Case Record unit coverage.

## Manual acceptance still required

Do not call P9 fully complete until all three are done:

1. **Fresh-save real-device playthrough:** no developer shortcuts from the first mission through finale and post-game continuation.
2. **Measured duration:** controlled human playtests followed by live telemetry evidence, using `P9_TELEMETRY.md`.
3. **Final visual review:** inspect the generated RU/EN desktop + 844×390 state/item/environment evidence and repeat the important path on a real device.

These are intentionally kept separate from automated CI so a passing test suite cannot be mistaken for a human acceptance pass.

# Roadmap

## P0 — Vertical slice
- [x] Project architecture.
- [x] Yandex SDK bootstrap and Game Ready hook.
- [x] Data-driven items and lot templates.
- [x] NPC auction bidding.
- [x] Sequential item reveal.
- [x] Appraise + sell/keep decision.
- [x] Local bankroll and collection persistence.
- [x] Real art direction and first asset pack.
- [ ] Device/browser QA — automated gates are present; final Yandex draft + real-device pass remains manual.

## P1 — Retention-ready MVP
- [x] Restoration mini-game.
- [x] Item condition and restoration value uplift.
- [x] Collection book and set completion rewards.
- [x] Reputation XP and three auction tiers.
- [x] Daily special auction.
- [x] First-session onboarding and 30-minute progression curve.
- [x] Event analytics schema.
- [x] Yandex cloud save.
- [x] Clue-backed lot generation: visible clues correspond to real hidden categories/items.
- [x] Auction risk rebalance so forcing every win is not safely optimal.
- [x] Anti-soft-lock collection resale.
- [x] One strategic restoration attempt per won lot.
- [x] Landscape-first mobile guard and expanded touch hit areas.
- [x] Lightweight sound/game-feel feedback without external audio dependencies.
- [x] Round summary values kept inventory and rewarded ads no longer penalize collecting.

## P2 — Monetization and release
- [x] Rewarded ad placements based on optional value.
- [x] Interstitial policy at natural breaks.
- [x] API-controlled sticky banner outside active gameplay.
- [x] Sound/focus/ad pause handling.
- [ ] Store/IAP design if metrics justify it — intentionally gated on post-release telemetry; see `IAP_GATE.md`.
- [x] Full RU/EN localization.
- [x] Yandex moderation checklist and archive build pipeline.
- [ ] Retention/economy tuning from real telemetry — requires released traffic.

## P3 — v1.0 depth
- [x] Daily contracts.
- [x] Achievement milestones.
- [x] Business Office hub and three cash-funded upgrade paths.
- [x] Lifetime statistics dashboard.
- [x] Recent auction history with cloud-persisted outcomes.
- [x] Bidder personality tells/reactions.
- [x] Rare lot modifiers/events.
- [x] Paid late-game advanced inspection that preserves hidden exact value.
- [x] Initial expanded catalog: 18 lot templates, 24 items and 8 collection sets.
- [x] Economy strategy simulation regression gate.
- [x] Accessibility settings for sound feedback, reduced motion and higher contrast.
- [x] Replayability/content-scale regression floor and moderation evidence document.
- [x] Second art/content pass: direct art for all initial 24 items and 9 lot environments.
- [ ] Timed 10+ minute Yandex draft content-duration check.
- [ ] Real Yandex draft/device QA and first telemetry-driven tuning pass.

## P4 — v1.1 decision depth
- [x] Three distinct normal-auction lot options before each auction.
- [x] Selection cards expose opening price, item count, truthful clues and visible rare modifiers without revealing hidden value.
- [x] Dealer Memory summarizes recent personal normal-auction outcomes for the same lot template without inspecting current hidden state.
- [x] Daily Special remains a fixed featured lot and bypasses normal selection after activation.
- [x] Lot-selection funnel analytics and Metrica goal coverage.
- [x] One lot-options impression per tier per page-session market cycle, with shared cycle context on presentation and selection events.
- [x] Browser/Yandex contract and production screenshot automation updated for selection -> lobby -> auction.
- [ ] Tune option mix/modifier frequency from post-launch choice and retention telemetry before promoting v1.1 to a release candidate.

## P5 — content breadth
- [x] First breadth pack: 36 item identities with direct art.
- [x] Expand normal-auction catalog to 24 templates / 8 per tier without changing tier unlock pacing.
- [x] Expand Collection Book while preserving existing set IDs/rewards and save compatibility.
- [x] Keep all new lot clues truthful and all new items represented in at least one collection set.
- [x] Raise automated content/replayability floors to the expanded catalog.
- [x] Run economy simulation and browser/release CI against the expanded pack plus Buyer Market/per-copy traits.
- [x] During campaign production, expand to 72 items / 42 lots / 36 sets while preserving stable IDs, truthful clues, direct art and save compatibility.

## P6 — retention and trading depth
- [x] Stable collectible traits/provenance tags for selected item identities.
- [x] Daily Buyer Market with two category buyers and one specialist buyer.
- [x] One premium sale per buyer offer per local day with cloud-persisted claim state.
- [x] Buyer sales feed cash, lifetime sales, daily contracts and typed analytics/Metrica.
- [x] Collection Book exposes market traits and a direct Buyer Market entry point.
- [x] Per-copy randomized positive/negative traits with appraisal multipliers.
- [x] Inventory-instance persistence retains each copy's appraisal, condition, restoration and traits while preserving the legacy ID index for sets/save compatibility.
- [x] Buyer Market prices and removes the exact concrete copy; Collection quick-sale intentionally sells the lowest-value duplicate first.
- [x] Decompose `AuctionScene.ts` before adding another major reveal/trading mechanic directly to it — lot-market preparation/cache and restoration interaction now live in dedicated game modules.
- [x] Deeper restoration choices with distinct safe/pro/risky paths.
- [x] Persistent rival-dealer specialties and learned behavior.
- [x] Collection-set perks unlock lasting category expertise after reward claim; expertise is derived from existing `claimedSetRewards`, stacks with Warehouse quick-sale rates and remains capped below Buyer Market premiums.
- [x] Legendary multi-auction discovery chains with a player-facing Discovery Board.

## P7 — visual identity and game-feel overhaul — COMPLETE
- [x] Repository-level visual/game-design skill and screenshot review checklist.
- [x] Explicit commercial art direction, shared visual tokens and redesigned core screens.
- [x] Visible character identity in the core loop and authored portraits for the first character set.
- [x] Authored P7 fidelity floor for the original catalog and all nine semantic lot environments.
- [x] Add restrained game-feel polish across important actions: shared tactile press/selection feedback, bid/value pulses, staged reveals, bounded particles/reactions, restoration card staging and reduced-motion-safe paths; `validate-game-feel.mjs` protects the source contract in CI.
- [x] Desktop + compact 844×390 RU/EN production screenshot gates for major screen families.

## P8 — systemic replayability and long-horizon depth — COMPLETE
P8 builds on existing systems rather than adding duplicate daily/meta layers. Acceptance is enforced by `src/data/p8Acceptance.test.ts`, long-horizon simulation and browser/mobile production gates. Detailed contract: `SYSTEMIC_REPLAYABILITY.md`.

- [x] Eight authored persistent rivals with dossier knowledge and bounded signature behaviors.
- [x] Seventeen risk/reward lot modifiers and persistent category market trends.
- [x] Multi-auction Collector Requests for exact concrete inventory copies.
- [x] Sealed Storage and VIP Collector special-auction rulesets.
- [x] Seven Discovery cases including branching and a five-stage/two-branch case.
- [x] Ultra-rare provenance jackpots and persistent collection discovery records.
- [x] 30/60/120-minute long-run economy/replayability gates.
- [x] Prestige evaluated and deferred until post-release late-game telemetry justifies a reset loop.

## P9 — campaign and gameplay expansion — ACTIVE
P9 turns Auction Hunter from a primarily systemic endless auction game into a structured treasure-hunting campaign. Target: roughly 6–10 hours of authored campaign progression followed by the existing P8 systems as endgame. Story beats must create gameplay decisions; do not build a dialogue-only visual novel on top of the auction loop.

### P9.1 — Campaign foundation and story bible
- [x] Add a data-driven campaign domain: five chapters, authored missions, prerequisites, objective types, rewards and legacy-safe progress persistence.
- [x] Establish the central mystery: fragments of the vanished collector Aleksandr Veyr's Black Ledger collection are surfacing through estate clearances and private auctions.
- [x] Define the five-act arc: First Flip -> Estate Trail -> Dealer War -> Closed Circle -> The Lost Collection.
- [x] Reuse existing REP/tier unlocks while campaign missions create additional authored gates and one-off opportunities.
- [x] Add typed campaign analytics for mission start/completion, branch choices, relationship effects, optional mastery and campaign completion; mission start/completion/mastery are also stable Metrica goals for production funnel and pacing analysis.
- [x] Add deterministic campaign integrity tests for prerequisites, authored evidence/rivals, bilingual copy and chapter-specific contracts.

### P9.2 — Narrative Office / investigation hub
- [x] Expand the existing Business Office itself into the campaign headquarters without replacing upgrades/contracts/statistics. The same `office` scene now carries a persistent Black Ledger HQ command surface with active mission/chapter progress plus direct Case/Inbox entry while preserving all six business tabs.
- [x] Add an Investigation Wall showing the Black Ledger trail, discovered evidence, active mission and chapter progress.
- [x] Add Inbox/Phone contacts for authored rival/collector messages and invitations; eight messages currently unlock across the campaign and use existing campaign persistence.
- [x] Add campaign mission briefing cards with objective, known risk and visible reward.
- [x] Keep campaign hub navigation compact-landscape safe and add deterministic RU/EN visual captures for Hub, Inbox, Bonus Goals, Nadia's consequential choice, Finale and persistent Epilogue.

### P9.3 — Campaign mission gameplay
- [x] Add objectives beyond simply winning one lot: evidence selection, linked-budget acquisition, forgery detection, restoration trace, rival tracking/deals, proxy bidding, limited inspection, sealed bid, counterfeit table, route planning and relationship gates.
- [x] Add multi-lot mission sessions where budget carries across consecutive decisions and buying everything is intentionally impossible, including the four-lot finale.
- [x] Add authored inspection choices before story auctions without exposing exact hidden value for free.
- [x] Add off-auction negotiation encounters using cash/favor/relationship stakes.
- [x] Add optional mission objectives that alter rewards/relationships rather than blocking the campaign; five mastery objectives are evaluated once at mission completion and have a dedicated player-facing screen.
- [x] Reuse normal auction progression for several campaign gates; Chapter V now requires three normal auctions plus two wins immediately before the final partner/finale sequence.

### P9.4 — Character arcs and consequential choices
- [x] Promote 4–5 existing dealers/characters into fully authored campaign principals. Victor, Mira and Anton carry the core mechanical arcs; Nadia now has a repeated Inbox arc plus a dedicated Dealer War negotiation whose trust/rivalry outcome changes her real auction pressure.
- [x] Extend relationships from learned bidding behavior into bounded campaign states: trust, rivalry and debt/favor.
- [x] Add meaningful branch choices whose later consequences affect sponsorship, auction pressure, information and epilogue resolution.
- [x] Keep exact NPC bid ceilings hidden regardless of relationship level.
- [x] Add alternative late-campaign approaches plus four mechanically resolved epilogue states.

### P9.5 — Story auctions and locations
- [x] Build authored one-off campaign rulesets including linked-budget estate sale, counterfeit table, limited private preview, sealed bid and final multi-lot auction.
- [x] Reach at least 6 campaign-specific environment/hero compositions with semantic IDs and authored lighting/props: estate study, records basement, dealer backroom, Closed Circle room, river archive and Veyr estate/finale.
- [x] Generate/author new item art and environmental textures continuously with campaign content; campaign/P9 catalog additions use direct semantic assets rather than runtime aliases.
- [x] Add visual evidence props including Black Ledger fragments, wax seal, invitation, provenance folder, maps, sponsor token, proxy sheets and final hero objects.
- [x] Preserve truthful visual clues: story art and UI do not reveal exact hidden values or unrevealed identities for free.

### P9.6 — Campaign content breadth
- [x] Add the first P9 story-driven catalog batch: six normal-auction identities with direct 512×360 art, real lot routes and two additive collection sets.
- [x] Add a second six-item investigation/expedition batch with direct art, two routes per identity and two additional collection sets.
- [x] Add a third six-item records/communications batch and a fourth six-item border/archive batch, each with direct art, two truthful normal-auction routes per identity and additive collection goals.
- [x] Add the final six-item clearance/dispatch batch, reaching 72 item identities / 42 lots / 36 sets; all six identities have direct art, collection coverage and at least two truthful normal-auction routes.
- [x] Expand total item catalog to the ~72-identity target with direct art and at least one meaningful gameplay/story use per new identity.
- [x] Lot-template target of ~42 has been reached while retaining fourteen distinct variants per tier.
- [x] Collection-set target of 24+ has been exceeded without mutating old set IDs/rewards.
- [x] Add 10+ authored story-critical provenance variants whose significance can be discovered through appraisal/evidence rather than rarity color alone; twelve item-specific Black Ledger variants now use real concrete-copy traits, bounded value bonuses and post-appraisal reveal telemetry.
- [x] Add chapter-specific Discovery cases that cross-reference campaign evidence without making normal Discovery Board progress mandatory for the main story; five optional Black Ledger cases cover the five campaign acts.
- [x] Add two optional post-campaign Black Ledger aftermath cases that use all six final breadth identities through ordinary auctions without gating campaign completion.

### P9.7 — Finale and post-game
- [x] Build a multi-stage final auction around the recovered Black Ledger trail; the player cannot acquire every target and must prioritize evidence versus profit.
- [x] Resolve the central mystery through player actions, acquired finale lots and relationship state rather than a standalone exposition screen.
- [x] Unlock Endless Dealer Career after campaign completion while retaining collection, office and all P8 systems without reset.
- [x] Add persistent epilogue state plus a reopenable post-campaign Case Record derived from existing save data: completed missions, recovered evidence, mastery, finale lots and strongest ally/rival are summarized without resetting or migrating the player's economy.

### P9 acceptance
- [ ] Validate a complete fresh-save campaign playthrough end-to-end in browser/device QA. Automated coverage now includes the full graph walk plus a 28-state Playwright production-path render matrix; a no-shortcuts real-device playthrough from the first mission through finale is still required.
- [ ] Validate the target 6–10 hour first-playthrough duration with timed human/telemetry playtests. The authored 415–625 minute budget is regression-gated and mission start/completion/mastery are Metrica goals; real active-play evidence is still required under `P9_TELEMETRY.md`.
- [x] Every authored chapter currently introduces at least one materially different gameplay situation rather than only new text/prices.
- [x] Campaign choices have later mechanical consequences through relationships, pressure/sponsorship and epilogue resolution.
- [ ] Complete visual acceptance for all campaign states/items/environments at desktop + 844×390 RU/EN. Automated state-transition, evidence-render, item-art and campaign-asset gates are in CI; final human screenshot inspection and real-device review remain.
- [x] Run final compatibility acceptance across old saves, cloud save, monetization boundaries and P8 economy gates after P9 content breadth stabilized; `p9CompatibilityAcceptance.test.ts`, cloud/save/ad tests, long-horizon economy tests and browser QA now exercise the retained contracts together.

## P10 — retention, showroom and audiovisual polish — ACTIVE
P10 deepens ownership, sensory reward and return reasons before adding more raw catalog breadth. The existing 72-item/42-lot/36-set content base is treated as sufficient for this tranche; new work should make current finds, rivals and auctions feel more valuable rather than merely increasing counts. Detailed contract: `P10_RETENTION_PRESENTATION.md`.

### P10.1 — Dealer Showroom / Trophy Garage
- [x] Add the first playable Dealer Showroom as a physical long-term trophy room using existing collection data rather than a duplicate inventory system.
- [x] Reuse the existing Showroom business upgrade as visual capacity: levels 0/1/2/3 expose 4/6/8/10 trophy positions while retaining the existing collection-set reward multiplier.
- [x] Auto-curate the strongest concrete copy per item identity with rarity-first trophy ordering and a legacy-save fallback when `collectionItems` are absent.
- [x] Add RU/EN showroom presentation, a dominant centerpiece, inspectable cabinet trophies, reduced-motion-safe entrance/ambient motion and Office/Collection navigation.
- [x] Add deterministic unit coverage for slot capacity, trophy ordering, concrete-copy selection and legacy compatibility.
- [ ] Add backward-compatible manual pinning, ordering and slot assignment for concrete copies.
- [ ] Add room-decoration choices and optional cosmetic cash sinks without gating economy/progression.
- [ ] Add campaign trophies/evidence as non-inventory display props where they strengthen post-campaign ownership.

### P10.2 — Production sound design and music
- [ ] Add a sample-based production SFX bank for auction, reveal materials, appraisal, restoration, sale, rewards and UI while retaining oscillator feedback as a decode/unavailable fallback.
- [ ] Add restrained Garage/Estate/Collector/private/finale ambience loops with correct focus, ad and platform lifecycle pause/resume behavior.
- [ ] Add a small adaptive score for Office/collection, normal auction, high-tier/private auction, investigation, finale and epilogue; tension layers must never alter gameplay timing.
- [ ] Add brief RU/EN auctioneer barks and non-verbal crowd reactions where they improve auction presence without making audio required for comprehension.
- [ ] Add independent SFX/music/ambience controls once the sampled layer exists, with compressed browser-safe assets and mobile performance limits.

### P10.3 — Character reactions and game feel
- [ ] Add 3–5 bounded reaction states for important rivals/principals: idle, interested, pressured, aggressive bid and win/loss.
- [ ] Strengthen reveal staging into concealment -> object focus -> rarity/name -> appraisal -> traits/provenance while preserving immediate state safety and reduced-motion equivalence.
- [ ] Add causal sale feedback that visually connects item/value delta to bankroll, plus a distinct Buyer Market premium-sale acknowledgement.
- [ ] Give collection-set and achievement completion stronger bounded celebrations than ordinary sales.
- [ ] Add restrained environmental motion such as dust/light/fan/background crowd only where it reinforces place and remains mobile-safe.

### P10.4 — Weekly Vault Auction
- [ ] Add a deterministic local-week event with a short multi-lot run and one shared event budget.
- [ ] Add rotating themes/rule packages that reuse current catalog, modifiers, rivals and restoration systems instead of duplicating daily content.
- [ ] Add a bounded weekly reward/claim state with cloud-safe persistence and no penalty for missing a week.
- [ ] Add typed event analytics plus economy/replayability simulation before tuning rewards.

### P10.5 — Hero visual fidelity
- [ ] Upgrade the top 10–15 legendary/campaign hero finds to a higher-fidelity vector/raster-hybrid presentation while retaining semantic texture IDs.
- [ ] Add expression/pose variants for principal characters that map to the new reaction states.
- [ ] Add controlled environment variants such as late-night, rain, VIP/private, seized/abandoned or crowded states without multiplying gameplay templates unnecessarily.
- [ ] Promote selected campaign evidence/finale props to hero presentation where they are actual focal rewards.

### P10 acceptance
- [ ] Keep Dealer Showroom RU/EN desktop + 844×390 resting and inspect-state screenshots in CI and complete manual visual inspection after material changes.
- [ ] Add sampled-audio decode/fallback, lifecycle and performance contracts before calling production sound complete.
- [ ] Run real-device audio + motion QA before release acceptance.
- [ ] Use telemetry before changing weekly reward size, event pressure, economy or monetization cadence.

See `V1_ROADMAP.md` for the release baseline, `SYSTEMIC_REPLAYABILITY.md` for P8, `CAMPAIGN.md` for the P9 story/gameplay contract, `P9_TELEMETRY.md` for duration/telemetry acceptance, and `P10_RETENTION_PRESENTATION.md` for the P10 ownership/audiovisual contract.

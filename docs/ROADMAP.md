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
- [ ] During campaign production, expand toward roughly 72 items / 42 lots / 24+ sets; new content should primarily support authored campaign beats, special auctions and discoveries rather than raw breadth.

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

## P7 — visual identity and game-feel overhaul
- [x] Repository-level visual/game-design skill and screenshot review checklist.
- [x] Explicit commercial art direction, shared visual tokens and redesigned core screens.
- [x] Visible character identity in the core loop and authored portraits for the first character set.
- [x] Authored P7 fidelity floor for the original catalog and all nine semantic lot environments.
- [ ] Add restrained game-feel polish across important actions: press/selection response, number tweens, reveal highlights, particles/reactions and staged transitions with reduced-motion support.
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
- [x] Add typed campaign analytics for mission start/completion, branch choices, relationship effects and campaign completion; abandonment/failure telemetry can be expanded after real playtests.
- [x] Add deterministic campaign integrity tests for prerequisites, authored evidence/rivals, bilingual copy and chapter-specific contracts.

### P9.2 — Narrative Office / investigation hub
- [ ] Expand the existing Business Office itself into the campaign headquarters without replacing upgrades/contracts/statistics; the dedicated campaign hub currently provides the investigation layer.
- [x] Add an Investigation Wall showing the Black Ledger trail, discovered evidence, active mission and chapter progress.
- [ ] Add Inbox/Phone contacts for authored rival/mentor/collector messages and invitations.
- [x] Add campaign mission briefing cards with objective, known risk and visible reward.
- [x] Keep campaign hub navigation compact-landscape safe and add deterministic RU/EN visual captures, including the final auction.

### P9.3 — Campaign mission gameplay
- [x] Add objectives beyond simply winning one lot: evidence selection, linked-budget acquisition, forgery detection, restoration trace, rival tracking/deals, proxy bidding, limited inspection, sealed bid, counterfeit table, route planning and relationship gates.
- [x] Add multi-lot mission sessions where budget carries across consecutive decisions and buying everything is intentionally impossible, including the four-lot finale.
- [x] Add authored inspection choices before story auctions without exposing exact hidden value for free.
- [x] Add off-auction negotiation encounters using cash/favor/relationship stakes.
- [ ] Add optional mission objectives that alter rewards/relationships rather than blocking the campaign.
- [x] Reuse normal auction progression for several campaign gates; Chapter V now requires three normal auctions plus two wins immediately before the final partner/finale sequence.

### P9.4 — Character arcs and consequential choices
- [ ] Promote 4–5 existing dealers/characters into fully authored campaign principals; Victor, Mira and Anton currently carry the main mechanical arcs.
- [x] Extend relationships from learned bidding behavior into bounded campaign states: trust, rivalry and debt/favor.
- [x] Add meaningful branch choices whose later consequences affect sponsorship, auction pressure, information and epilogue resolution.
- [x] Keep exact NPC bid ceilings hidden regardless of relationship level.
- [x] Add alternative late-campaign approaches plus four mechanically resolved epilogue states.

### P9.5 — Story auctions and locations
- [x] Build authored one-off campaign rulesets including linked-budget estate sale, counterfeit table, limited private preview, sealed bid and final multi-lot auction.
- [ ] Reach at least 6 campaign-specific environment/hero compositions with semantic IDs and authored lighting/props; the current campaign asset family is substantial but environment breadth still needs another pass.
- [x] Generate/author new item art and environmental textures continuously with campaign content; campaign/P9 catalog additions use direct semantic assets rather than runtime aliases.
- [x] Add visual evidence props including Black Ledger fragments, wax seal, invitation, provenance folder, maps, sponsor token, proxy sheets and final hero objects.
- [x] Preserve truthful visual clues: story art and UI do not reveal exact hidden values or unrevealed identities for free.

### P9.6 — Campaign content breadth
- [x] Add the first P9 story-driven catalog batch: six normal-auction identities with direct 512×360 art, real lot routes and two additive collection sets.
- [ ] Expand total item catalog further toward ~72 identities, with direct art and at least one meaningful gameplay/story use per new identity.
- [ ] Expand lot templates further toward ~42 and collection sets toward 24+ as later campaign breadth requires them.
- [ ] Add 10+ authored story-critical provenance variants whose significance can be discovered through appraisal/evidence rather than rarity color alone.
- [ ] Add chapter-specific Discovery cases that cross-reference campaign evidence without making normal Discovery Board progress mandatory for the main story.

### P9.7 — Finale and post-game
- [x] Build a multi-stage final auction around the recovered Black Ledger trail; the player cannot acquire every target and must prioritize evidence versus profit.
- [x] Resolve the central mystery through player actions, acquired finale lots and relationship state rather than a standalone exposition screen.
- [x] Unlock Endless Dealer Career after campaign completion while retaining collection, office and all P8 systems without reset.
- [x] Add persistent epilogue state and completion summary without deleting/resetting the player's economy; deeper campaign statistics remain a later polish item.

### P9 acceptance
- [ ] Validate a complete fresh-save campaign playthrough end-to-end in browser/device QA; the authored graph now has a beginning, escalation, fifth-act prelude, climax and ending.
- [ ] Validate the target 6–10 hour first-playthrough duration with timed human/telemetry playtests; automated content gates cannot prove real duration.
- [x] Every authored chapter currently introduces at least one materially different gameplay situation rather than only new text/prices.
- [x] Campaign choices have later mechanical consequences through relationships, pressure/sponsorship and epilogue resolution.
- [ ] Complete visual acceptance for all campaign states/items/environments at desktop + 844×390 RU/EN as the remaining art breadth lands.
- [ ] Run final compatibility acceptance across old saves, cloud save, monetization boundaries and P8 economy gates after P9 content breadth stabilizes.

See `V1_ROADMAP.md` for the release baseline, `SYSTEMIC_REPLAYABILITY.md` for P8, and `CAMPAIGN.md` for the P9 story/gameplay contract.

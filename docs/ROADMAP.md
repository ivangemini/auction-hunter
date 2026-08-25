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
- [x] Expand Collection Book to 12 sets while preserving existing set IDs/rewards and save compatibility.
- [x] Keep all new lot clues truthful and all new items represented in at least one collection set.
- [x] Raise automated content/replayability floors to the expanded catalog.
- [x] Run economy simulation and browser/release CI against the expanded pack plus Buyer Market/per-copy traits.
- [ ] During campaign production, expand toward roughly 72 items / 42 lots / 24 sets; new content should primarily support authored campaign beats, special auctions and discoveries rather than raw breadth.

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
- [x] Authored P7 fidelity floor for all 36 current item identities and all nine semantic lot environments.
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
- [ ] Add a data-driven campaign domain: five chapters, authored missions, prerequisites, objective types, rewards and legacy-safe progress persistence.
- [ ] Establish the central mystery: fragments of the vanished collector Aleksandr Veyr's Black Ledger collection are surfacing through estate clearances and private auctions.
- [ ] Define the five-act arc: First Flip -> Estate Trail -> Dealer War -> Closed Circle -> The Lost Collection.
- [ ] Reuse existing REP/tier unlocks but allow campaign missions to create additional authored gates and one-off opportunities.
- [ ] Add campaign analytics for chapter/mission start, completion, branch choice and failure/abandonment without recording hidden future outcomes.
- [ ] Add deterministic campaign integrity tests: no dead mission prerequisites, all referenced items/rivals/locations exist, both RU/EN copy paths resolve.

### P9.2 — Narrative Office hub
- [ ] Expand Business Office into the campaign headquarters without replacing its current upgrades/contracts/statistics functionality.
- [ ] Add an Investigation Wall showing the Black Ledger trail, discovered evidence, active mission and chapter progress.
- [ ] Add Inbox/Phone contacts for authored rival/mentor/collector messages and invitations.
- [ ] Add campaign mission briefing cards with objective, known risk, optional objective and visible reward.
- [ ] Keep hub navigation compact-landscape safe and add deterministic RU/EN visual captures.

### P9.3 — Campaign mission gameplay
- [ ] Add mission objectives beyond simply winning one lot: identify the correct lot from evidence, acquire linked items under a total budget, detect/avoid a fake, deliberately track a rival-owned item, preserve an item instead of selling it, and win with a capped bid.
- [ ] Add multi-lot mission sessions where budget carries across 2–4 consecutive lots and buying everything is intentionally impossible.
- [ ] Add authored inspection choices before selected story auctions; information has an opportunity/cash cost and never exposes exact hidden value for free.
- [ ] Add off-auction negotiation encounters using concrete owned items/cash/reputation as stakes.
- [ ] Add optional mission objectives that alter rewards/relationships rather than blocking the campaign.
- [ ] Ensure mission rules reuse normal reveal, appraisal, restoration, collection and Buyer Market systems wherever possible.

### P9.4 — Character arcs and consequential choices
- [ ] Promote 4–5 existing dealers/characters into campaign principals with authored arcs rather than introducing an entirely separate cast.
- [ ] Extend relationships from learned bidding behavior into bounded campaign states: trust, rivalry and debt/favor.
- [ ] Add meaningful branch choices at chapter turning points; choices change later mission access, assistance, information or rival pressure rather than only dialogue text.
- [ ] Keep exact NPC bid ceilings hidden regardless of relationship level.
- [ ] Add at least two alternative approaches to a late-campaign mission and at least two epilogue states.

### P9.5 — Story auctions and locations
- [ ] Build authored one-off auction rulesets for campaign beats: counterfeit table, closed invitation auction, linked-lot estate sale and final multi-lot auction.
- [ ] Add at least 6 campaign-specific environments/hero compositions with semantic asset IDs and authored lighting/props.
- [ ] Generate/author new item art and environmental textures continuously with campaign content; no campaign mission ships with placeholder rectangles or generic reused imagery when the story calls for a unique object/location.
- [ ] Add visual evidence props: Black Ledger pages, wax seals, auction invitations, provenance folders, photographs/maps and dealer notes.
- [ ] Preserve truthful visual clues: story art may imply categories/history but must not leak exact hidden values or unrevealed item identities.

### P9.6 — Campaign content breadth
- [ ] Expand item catalog in campaign-driven batches from 36 toward ~72 identities, with direct art and at least one meaningful gameplay/story use per new identity.
- [ ] Expand lot templates from 24 toward ~42 and collection sets from 12 toward ~24 as campaign chapters require them.
- [ ] Add 10+ authored story-critical provenance variants whose significance can be discovered through appraisal/evidence rather than rarity color alone.
- [ ] Add chapter-specific Discovery cases that cross-reference campaign evidence without making normal Discovery Board progress mandatory for the main story.

### P9.7 — Finale and post-game
- [ ] Build a multi-stage final auction around the recovered Black Ledger trail; the player cannot acquire every target and must prioritize based on evidence, relationships and bankroll.
- [ ] Resolve the central mystery through player actions and owned evidence, not a standalone exposition screen.
- [ ] Unlock Endless Dealer Career after campaign completion while retaining collection, office, P8 trends/requests/VIP/discovery systems.
- [ ] Add campaign-completion statistics and epilogue summary without deleting or resetting the player's economy.

### P9 acceptance
- [ ] A fresh player can complete a coherent campaign with a beginning, escalation, climax and ending while still understanding the core auction fantasy.
- [ ] Target authored campaign duration is 6–10 hours for a normal first playthrough; no more than roughly one third of that time should be mandatory dialogue/menus.
- [ ] Every chapter introduces at least one materially different gameplay situation, not merely new text or higher prices.
- [ ] Campaign choices have at least one later mechanical consequence.
- [ ] All new story-critical items/environments have authored/generated production art and pass desktop + 844×390 RU/EN visual review.
- [ ] Existing endless progression, old saves, cloud save, monetization boundaries and P8 economy gates remain compatible.

See `V1_ROADMAP.md` for the release baseline, `SYSTEMIC_REPLAYABILITY.md` for P8, and the forthcoming `CAMPAIGN.md` for the P9 story/gameplay contract.

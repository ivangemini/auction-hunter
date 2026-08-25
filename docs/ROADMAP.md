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
- [ ] During/after first moderation, continue breadth toward roughly 72 items / 42 lots / 24 sets rather than stopping development at the first submitted build.

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
- [ ] Legendary multi-auction discovery chains.

## P7 — visual identity and game-feel overhaul
This pass is a product-quality priority, not optional decoration. Complete it before treating the game as visually release-complete or expanding content indefinitely.

- [x] Add a repository-level visual/game-design skill and screenshot review checklist; require it from agent instructions for player-facing work.
- [x] Raise `ART_DIRECTION.md` from palette/asset guidance to explicit composition, hierarchy, interaction and visual-acceptance rules.
- [x] Establish shared visual tokens/helpers for surfaces, typography roles, buttons, chips, elevation, lighting and motion durations; `src/game/visual.ts` now complements the existing shared button/motion layer.
- [x] Redesign lot selection first: larger authored environment art, stronger lot identity, physical auction-card language, compact clue/status treatment and richer selected/hover states.
- [x] Redesign auction presentation: stronger current-bid focal point, visible rival presence/tells, environmental depth and bid/win/loss feedback.
- [x] Add visible human character identity to the core loop: mentor-led first-session briefing, auctioneer presence and authored Victor/Mira/Anton portraits with RU/EN contextual coaching on the real lot-selection, bidding and reveal/appraisal flow.
- [x] Redesign reveal + appraisal flow around the item as a hero visual with staged reveal, rarity/value feedback and less dashboard-like metadata.
- [x] Redesign restoration so condition, tool/strategy choice and result feel tactile rather than form-like.
- [x] Redesign Collection Book and Buyer Market with stronger collectible/buyer identity, set-progress visualization, concrete-copy hero treatment, premium-sale feedback and dedicated RU/EN visual-review captures.
- [x] Bring Business Office, contracts, upgrades, achievements, statistics, history and settings onto the shared P7 visual system with distinct content hierarchy and dedicated RU/EN visual-review captures.
- [x] Upgrade the schematic lot/item art to the authored P7 fidelity floor while preserving semantic asset IDs and coverage tests.
  - [x] First item-fidelity batch: nine high-visibility reveal/restoration finds upgraded with authored 512×360 vector art plus deterministic 3×3 CI visual review.
  - [x] Second item-fidelity batch: nine more electronics, collectibles, watch, optics and paper/metal finds upgraded; CI permanently reviews Batch 01 and Batch 02 as separate 3×3 contact sheets.
  - [x] Third item-fidelity batch: nine mixed prototype/electronics/paper/toy/optics identities upgraded and added to the persistent review gate.
  - [x] Fourth item-fidelity batch: final nine jewelry/watch/electronics/rail/writing/music identities upgraded; all 36 catalog item identities now meet the accepted P7 fidelity floor.
  - [x] Environment fidelity: all nine semantic lot environments meet the P7 floor — three Estate WebPs plus upgraded Garage/Collector SVGs — with deterministic 3×2 Garage/Collector CI visual review.
- [ ] Add restrained game-feel polish across important actions: press/selection response, number tweens, reveal highlights, particles/reactions and staged transitions with reduced-motion support.
- [ ] Add production screenshot review as an explicit acceptance step for each major screen family and keep desktop + mobile-landscape captures visually credible.

See `V1_ROADMAP.md` for the detailed v1.0 plan, `CONTENT_DURATION.md` for moderation evidence/checks, `BUYER_MARKET.md` for the trading loop, `RIVALS.md` for stable dealer specialties, `skills/auction-hunter-visual-design/SKILL.md` for presentation work and `PRE_RELEASE_AUDIT.md` for the latest release-risk review.

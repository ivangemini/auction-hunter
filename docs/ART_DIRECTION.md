# Auction Hunter — Art Direction v1.0

## Visual thesis
Auction Hunter should feel like a late-evening storage auction: warm tungsten light, cold industrial shadows, dusty surfaces, taped cardboard, worn paint and small flashes of valuable metal or electronics.

The visual hierarchy is built around uncertainty. Lots should look cluttered and partially readable; individual finds become cleaner and brighter only after reveal/appraisal.

The player-facing experience must look like a commercial treasure-hunting game, not a dark web dashboard. Flat panels and text are structural tools, not the visual identity.

## Style
- High-resolution 2D illustrated vector/raster hybrid with simplified, readable shapes and strong silhouettes.
- Slightly stylized/cartoon-adjacent rendering: richer shapes, controlled exaggeration and appealing materials, but not chibi, toy-like or flat clip-art.
- Dark industrial environments with warm amber focal lighting.
- Materials: cardboard, plywood, steel, brass, aged plastic, leather, glass and fabric.
- Use texture deliberately; readability at 1280×720 and on mobile browsers is more important than microscopic detail.
- Prefer authored scene composition and object art over schematic/icon-like depictions for primary gameplay visuals.
- Primary art should still read cleanly when scaled down; silhouette, lighting and material separation matter more than tiny prop density.

## Authored-quality / anti-generated-art rules
Generated concepts may be used as visual-development input, but production assets must be cleaned and art-directed.

Avoid common synthetic/AI-looking artifacts:
- meaningless micro-detail, pseudo-text, fake labels or impossible object joins;
- inconsistent perspective or light direction within one scene;
- repeated decorative clutter with no gameplay or material purpose;
- excessive bloom, gold trim, sparkles or glossy chrome on every component;
- noisy hyper-real rendering that conflicts with the slightly stylized game language;
- baking interface text, prices or dynamic values into generated artwork.

UI typography, prices, clues, badges and dynamic labels are rendered by Phaser, not embedded in raster art. Raster assets should contain the physical scene/object only. Clean silhouettes, controlled value grouping and consistent materials are preferable to maximum detail.

A catalog batch must not read as nine variations of one rendering recipe. Change construction and material language where the identity demands it: aged plastic should not be shaded like brass, paper should not use the same edge treatment as electronics, polished metal should not share identical highlights with wood, and asymmetry should come from the object rather than random decorative noise.

## Palette
- Ink / near-black: `#101216`
- Panel: `#171A20`
- Steel: `#2B3038`
- Dust: `#8B8172`
- Warm light: `#E9B949`
- Copper accent: `#C4773A`
- Success/value: `#63D28D`
- Rare cool accent: `#61A8FF`

Rarity colors remain UI accents. They should not recolor the whole object.

## Shared UI language
Player-facing P7 screens should reuse `src/game/visual.ts` rather than inventing new rectangle styling per scene.

The shared layer provides:
- atmospheric background washes with a restrained contextual accent;
- raised/deep surfaces with consistent shadow, border and top-edge treatment;
- compact chips for rarity, state, category, traits and completion;
- progress bars for set/meta progress;
- hover-lift treatment that respects reduced motion;
- shared palette tokens that complement the existing animated `button()` and `MOTION` timing layer.

Shared helpers are a baseline, not a requirement that every card look identical. Lot cards, collection-set showcases, buyer dossiers and Office modules must still express different purposes through composition, imagery and hierarchy.

## Screen composition standard
Every major screen needs one dominant visual idea and at least three levels of hierarchy.

### Environment layer
Avoid leaving the entire canvas as featureless near-black. Use restrained environmental framing, light falloff, atmospheric gradients, silhouettes, shelves, concrete/warehouse structure or other contextual forms where they support the scene.

The background should create place and depth without reducing text readability.

Garage environments should read as practical, worn and materially dense: steel shelving, cardboard/wood storage, concrete or painted floors, repair equipment and warm utility lighting. Collector environments should feel more curated and valuable: cabinets, glass, dark wood, framed/display objects, safer storage and tighter spotlighting. Tier identity should be readable from the environment before UI copy is read.

### Primary content layer
The thing the player is deciding about should receive the most visual weight:
- lot selection -> lot/environment art;
- auction -> current bid/tension/opponents;
- reveal -> discovered item;
- appraisal -> item plus resolved value;
- restoration -> item condition and timing interaction;
- collection -> owned objects/set progress;
- Buyer Market -> buyer identity and matched item/value;
- Business Office -> current meta task: contract progress, upgrade effect/cost, achievement state, major statistic, history outcome or accessibility state.

Do not let explanatory labels visually outweigh the fantasy or decision.

### Information layer
Use hierarchy rather than a uniform list of labels:
- primary number/action;
- title/state;
- supporting clue/value information;
- tertiary metadata.

Traits, rarity, modifiers and statuses should use compact badges/chips where appropriate instead of adding another full-width text row.

### Interaction layer
Clickable elements must communicate hover/touch/press/selection/disabled state. Important state changes should visibly acknowledge the player instead of replacing text instantaneously.

## Card language
Generic bordered rectangles are not sufficient as finished cards.

Lot/item/buyer/meta cards should combine a subset of:
- large image field or strong focal number/state;
- layered surface/elevation;
- subtle vignette or gradient behind copy;
- auction tags, labels, stamps or physical-material motifs;
- rarity/category/modifier/state chips;
- visual selection/completion state;
- clearly separated primary CTA area.

Card types should differ according to purpose. A storage lot, rival dealer, inventory collectible, daily contract and business upgrade should not feel like the same component with different text.

### Collection Book
Collection sets should read as display cases or archival boards rather than spreadsheet rows. Set progress is visual, item slots have rarity/ownership hierarchy, reward state has its own area and concrete-copy inspection opens as a hero card rather than a small utility modal.

### Buyer Market
Daily buyers should read as distinct dossiers/clients. Buyer identity and demand come first, premium is immediately scannable, and a matching concrete item becomes the hero visual. Completed/no-match/match states must be visually different without relying only on copy. Category buyers and specialist buyers may share the card shell but should not collapse into identical visual accents.

### Business Office
The Office is a business-management room, not a settings dashboard. Its persistent header should establish bankroll/reputation and a warm operational atmosphere, while each tab gets a distinct content grammar:
- Contracts -> job-board/task cards with obvious progress and payout hierarchy.
- Upgrades -> investment cards where current level, effect and next cost are the focal decision.
- Achievements -> compact milestone plaques with completion/claimed states visibly separated.
- Statistics -> large-value plates; the number is dominant and the label is secondary.
- History -> ledger-like outcome rows with profit/loss and win/pass state scannable at a glance.
- Settings -> calm control rows where enabled/disabled state is obvious without reading explanatory text.

The Office may reuse the same surface tokens as other P7 scenes, but tab content must not collapse back into equal-weight generic rectangles.

## Composition rules
- Lot art: dense but controlled foreground clutter, a darker back wall, one primary warm light source and 2–3 readable clue silhouettes.
- Garage lot art: practical storage depth, stronger floor perspective and mixed cardboard/wood/steel materials.
- Collector lot art: curated display/storage depth, more selective highlights and higher-value materials without generic luxury gloss.
- Item art: single object, three-quarter view where practical, transparent/neutral background, strong silhouette.
- Reveal state: object occupies most of the card/screen and receives a subtle rarity halo.
- Appraisal state: value UI becomes brighter than the object; the artwork should not compete with the price.
- Collection sets: progress/reward hierarchy should remain scannable even when an item row contains several identities.
- Buyer Market: the daily offer value and matched concrete item must visually outweigh descriptive buyer copy.
- Office contracts/upgrades: action value and state must remain readable before description copy; finished/claimed/max-level states should change the card hierarchy rather than only one text string.
- Office statistics/history: avoid spreadsheet density; emphasize large values, signed outcomes and state grouping.
- Use empty space deliberately. Large unused areas that carry neither atmosphere nor decision context should be redesigned.

## Game feel and motion
Visual feedback should reinforce causality and importance.

Preferred lightweight treatments:
- short press/selection scale or elevation changes;
- staggered entrance for grouped decision/display cards;
- hover lift for inspectable collection items;
- bid/value number tweening;
- staged reveal/appraisal transitions;
- subtle highlight sweeps/glows;
- restrained dust/spark/light particles on high-value events;
- rival reaction motion;
- short completion/sale acknowledgement before a market state rerenders;
- small camera/container impulses for auction win/loss where appropriate.

Effects must respect the reduced-motion accessibility setting. Motion is for input acknowledgement, state transition, causality and emphasis, not constant decoration.

`skills/auction-hunter-animation-game-feel/SKILL.md` is the implementation standard for motion timing, state safety and browser performance.

## Typography
Typography must create hierarchy. At minimum distinguish:
- screen/lot/item titles;
- primary value/state;
- section labels;
- body/supporting copy;
- metadata.

Decision-driving numbers such as current bid, bankroll, appraisal, profit, Buyer Market offer, contract payout and upgrade cost should be visually stronger than their labels.

Avoid dense developer-style key/value tables when the same information can be scanned through grouping, chips, icons or spatial hierarchy.

## Current screen-family fidelity
The core P7 presentation now has dedicated visual languages for lot selection, bidding/reveal/appraisal, restoration, Collection Book, Buyer Market, first-session character coaching and Business Office/meta screens.

The Office uses the shared atmosphere/surface/chip/progress system while preserving distinct tab composition for Contracts, Upgrades, Achievements, Stats, History and Settings. `scripts/capture-office-review.mjs` reaches the scene through real lot-selection -> Collection -> Office navigation, captures RU/EN Contracts/Upgrades/Achievements/Stats at 1280×720 and asserts tab transitions are visibly distinct before CI uploads all eight review images.

This does not close the overall P7 game-feel pass: particles, richer reactions, additional staged transitions and broader desktop/mobile-landscape acceptance remain separate work.

## Current asset coverage
The expanded catalog has direct authored SVG coverage for all 36 collectible item identities. Catalog items do not depend on visual aliases; `fallback.svg` remains only as a defensive runtime fallback for unknown/missing IDs.

Lot presentation keeps nine semantic environment identities: three Garage, three Estate and three Collector archetypes. The 24 lot templates reuse these identities intentionally through `artId`, so related locations share visual language while names, clues, item pools and economy create distinct lot identities.

### P7 environment fidelity
All nine semantic lot environments now meet the P7 fidelity floor while preserving their existing Phaser texture keys.

The three Estate archetypes (`estate-42`, `estate-attic`, `estate-studio`) use cleaned WebP environment art. The three Garage archetypes (`garage-17`, `garage-workshop`, `garage-market`) and three Collector archetypes (`collector-8`, `collector-vault`, `collector-gallery`) use authored 512×360 SVG environments with stronger perspective, environmental depth, tier-specific materials, controlled warm focal lighting and readable foreground clutter.

Garage/Collector SVGs intentionally do not embed UI copy, labels or pseudo-text. `scripts/capture-environment-art-review.mjs` validates those source contracts and renders all six into a deterministic 3×2 1280×720 CI contact sheet for visual review. Estate remains covered by the normal production screenshot path and runtime loader checks.

### P7 item fidelity — Batch 01
Nine high-visibility reveal/restoration finds preserve their existing semantic IDs and 512×360 vector contract while using stronger silhouettes, authored perspective, material separation, controlled highlights and restrained gradients/shadows rather than schematic icon geometry:
`toolbox`, `toy-robot`, `film-camera`, `pocket-watch`, `porcelain-figurine`, `arcade-handheld`, `clockwork-automaton`, `art-deco-lamp`, `master-study`.

### P7 item fidelity — Batch 02
A second nine identities use the same authored-quality floor while deliberately varying construction/material language across electronics, wood/vinyl, brass, optics, paper, jewelry, console hardware, leather/steel and aged book cloth:
`cassette-player`, `vinyl-box`, `brass-clock`, `telescope`, `signed-poster`, `silver-ring`, `mini-console`, `chronograph-watch`, `first-edition-book`.

### P7 item fidelity — Batch 03
The third nine replace the most schematic prototype, workshop, consumer-electronics, paper, toy and optics placeholders with object-specific construction and materials:
`prototype-toy`, `multimeter`, `portable-radio`, `comic-stack`, `tin-car`, `travel-clock`, `instant-camera`, `binoculars`, `gallery-print`.

The batch deliberately mixes unpainted resin, analog meter glass/bakelite, aged plastic, layered paper, painted tin, leather/brass, camera bellows, leather/metal optics and framed paper so the catalog does not collapse into a single rendering recipe.

### P7 item fidelity — Batch 04
The final nine complete the catalog fidelity pass across jewelry, field watches, production samples, bench electronics, portable CRT-era hardware, rail models, mechanical writing tools and music memorabilia:
`enamel-brooch`, `military-watch`, `preproduction-figure`, `soldering-station`, `pocket-tv`, `model-train`, `manual-typewriter`, `fountain-pen`, `signed-vinyl`.

All **36 of 36 catalog item identities** now meet the accepted authored P7 fidelity floor while retaining their semantic IDs and `512×360` vector source contract.

`scripts/capture-item-art-review.mjs` permanently reviews all four accepted batches as separate deterministic 3×3 1280×720 contact sheets. It validates each SVG source against the `512×360` viewBox contract, rejects embedded `<text>`/pseudo-text, verifies browser decode and uploads the four sheets for human visual review.

This coverage is a correctness and release-quality floor, not a permanent ceiling. Individual assets may still be upgraded later when art direction evolves, but the catalog no longer relies on schematic placeholder art.

`src/data/artManifest.ts` remains the semantic asset manifest and `src/data/artCoverage.test.ts` prevents catalog items from silently falling back to aliases or the lot catalog from shrinking below the environment floor.

## Naming
- vector lot art: `public/assets/lots/<art-id>.svg`
- raster lot art: `public/assets/lots/<art-id>.webp`
- item art: `public/assets/items/<item-id>.svg` (raster replacements may follow the same semantic-ID rule)
- defensive item fallback: `public/assets/items/fallback.svg`

## Replacement rule
Gameplay code refers to semantic Phaser texture keys, not filenames directly. Higher-fidelity PNG/WebP art may replace SVG files while keeping the same semantic IDs. Asset loader routing decides which implementation backs a semantic key; gameplay/data code must not branch on file format.

Changes must keep `artManifest.ts`, loader behavior and coverage tests consistent.

## Visual acceptance
For material player-facing changes, run the browser capture flow and inspect the resulting image. Passing functional/browser tests does not by itself establish visual quality.

Collection Book and Buyer Market use `scripts/capture-collection-market-review.mjs` as a dedicated production-build review path. It reaches both scenes through real canvas navigation, captures RU/EN states and verifies Buyer Market visibly replaces Collection Book before CI uploads the four review images.

Business Office uses `scripts/capture-office-review.mjs` as its dedicated production-build review path. The gate captures RU/EN Contracts, Upgrades, Achievements and Stats, checks 1280×720 PNG validity and verifies each selected tab visibly replaces the previous composition. History/Settings remain covered by the same scene implementation and normal browser interaction gates.

First-session character/tutorial presentation uses `scripts/capture-character-tutorial-review.mjs`; restoration and asset families retain their own dedicated review scripts. A new major player-facing family should add comparable deterministic evidence rather than relying on a single generic screenshot.

Use `skills/auction-hunter-visual-design/SKILL.md`, `skills/auction-hunter-animation-game-feel/SKILL.md` and the visual review checklist. If a screenshot still reads primarily as black rectangles, borders, small schematic art and equal-weight text, the visual task is not complete.

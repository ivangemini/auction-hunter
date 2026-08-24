# Auction Hunter — Art Direction v0.6

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

## Screen composition standard
Every major screen needs one dominant visual idea and at least three levels of hierarchy.

### Environment layer
Avoid leaving the entire canvas as featureless near-black. Use restrained environmental framing, light falloff, atmospheric gradients, silhouettes, shelves, concrete/warehouse structure or other contextual forms where they support the scene.

The background should create place and depth without reducing text readability.

### Primary content layer
The thing the player is deciding about should receive the most visual weight:
- lot selection -> lot/environment art;
- auction -> current bid/tension/opponents;
- reveal -> discovered item;
- appraisal -> item plus resolved value;
- restoration -> item condition and timing interaction;
- collection -> owned objects/set progress;
- Buyer Market -> buyer identity and matched item/value.

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

Lot/item/buyer cards should combine a subset of:
- large image field or image bleed;
- layered surface/elevation;
- subtle vignette or gradient behind copy;
- auction tags, labels, stamps or physical-material motifs;
- rarity/category/modifier chips;
- visual selection state;
- clearly separated primary CTA area.

Card types should differ according to purpose. A storage lot, rival dealer and inventory collectible should not feel like the same component with different text.

## Composition rules
- Lot art: dense but controlled foreground clutter, a darker back wall, one primary warm light source and 2–3 readable clue silhouettes.
- Item art: single object, three-quarter view where practical, transparent/neutral background, strong silhouette.
- Reveal state: object occupies most of the card/screen and receives a subtle rarity halo.
- Appraisal state: value UI becomes brighter than the object; the artwork should not compete with the price.
- Use empty space deliberately. Large unused areas that carry neither atmosphere nor decision context should be redesigned.

## Game feel and motion
Visual feedback should reinforce causality and importance.

Preferred lightweight treatments:
- short press/selection scale or elevation changes;
- bid/value number tweening;
- staged reveal/appraisal transitions;
- subtle highlight sweeps/glows;
- restrained dust/spark/light particles on high-value events;
- rival reaction motion;
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

Decision-driving numbers such as current bid, bankroll, appraisal, profit and Buyer Market offer should be visually stronger than their labels.

Avoid dense developer-style key/value tables when the same information can be scanned through grouping, chips, icons or spatial hierarchy.

## Current asset coverage
The expanded catalog has direct SVG coverage for all 36 collectible item identities. Catalog items do not depend on visual aliases; `fallback.svg` remains only as a defensive runtime fallback for unknown/missing IDs.

Lot presentation keeps nine semantic environment identities: three Garage, three Estate and three Collector archetypes. The 24 lot templates reuse these identities intentionally through `artId`, so related locations share visual language while names, clues, item pools and economy create distinct lot identities.

P7 has started the higher-fidelity raster replacement pass. The three Estate archetypes (`estate-42`, `estate-attic`, `estate-studio`) now use cleaned WebP environment art while preserving the same semantic Phaser texture keys. Garage and Collector archetypes still use their SVG implementations until their corresponding art pass is complete.

### P7 item fidelity — Batch 01
Nine high-visibility reveal/restoration finds preserve their existing semantic IDs and 512×360 vector contract while using stronger silhouettes, authored perspective, material separation, controlled highlights and restrained gradients/shadows rather than schematic icon geometry:
`toolbox`, `toy-robot`, `film-camera`, `pocket-watch`, `porcelain-figurine`, `arcade-handheld`, `clockwork-automaton`, `art-deco-lamp`, `master-study`.

### P7 item fidelity — Batch 02
A second nine identities now use the same authored-quality floor while deliberately varying construction/material language across electronics, wood/vinyl, brass, optics, paper, jewelry, console hardware, leather/steel and aged book cloth:
`cassette-player`, `vinyl-box`, `brass-clock`, `telescope`, `signed-poster`, `silver-ring`, `mini-console`, `chronograph-watch`, `first-edition-book`.

That brings the authored P7 item-fidelity pass to **18 of 36 catalog identities**. The remaining 18 direct SVGs are valid for coverage but remain candidates for the same replacement pass.

`scripts/capture-item-art-review.mjs` keeps both accepted batches under deterministic visual review. CI renders a separate 3×3 1280×720 contact sheet for Batch 01 and Batch 02, validates each SVG source against the 512×360 viewBox contract and verifies browser decode before uploading the sheets for human review. New batches should be added without dropping previously accepted batches.

This coverage is a correctness floor, not a quality ceiling. Existing simple SVGs should be replaced or augmented when they read as schematic placeholders in production screenshots.

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

Use `skills/auction-hunter-visual-design/SKILL.md`, `skills/auction-hunter-animation-game-feel/SKILL.md` and the visual review checklist. If a screenshot still reads primarily as black rectangles, borders, small schematic art and equal-weight text, the visual task is not complete.

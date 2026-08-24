# Auction Hunter — Art Direction v0.4

## Visual thesis
Auction Hunter should feel like a late-evening storage auction: warm tungsten light, cold industrial shadows, dusty surfaces, taped cardboard, worn paint and small flashes of valuable metal or electronics.

The visual hierarchy is built around uncertainty. Lots should look cluttered and partially readable; individual finds become cleaner and brighter only after reveal/appraisal.

The player-facing experience must look like a commercial treasure-hunting game, not a dark web dashboard. Flat panels and text are structural tools, not the visual identity.

## Style
- 2D illustrated vector/raster hybrid with simplified shapes and strong silhouettes.
- Semi-realistic proportions, not cartoon/chibi.
- Dark industrial environments with warm amber focal lighting.
- Materials: cardboard, plywood, steel, brass, aged plastic, glass.
- Use texture sparingly; readability at 1280×720 and on mobile browsers is more important than fine detail.
- Prefer authored scene composition and object art over schematic/icon-like depictions for primary gameplay visuals.

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
- Lot art: dense foreground clutter, a darker back wall, one warm light source and 2–3 readable clue silhouettes.
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

Lot presentation uses nine authored environment SVGs: three Garage, three Estate and three Collector visual archetypes. The 24 lot templates reuse these environments intentionally by setting `artId`, so related locations share visual language while names, clues, item pools and economy create distinct lot identities.

This coverage is a correctness floor, not a quality ceiling. Existing simple SVGs may be replaced or augmented with higher-fidelity raster/vector art when they read as schematic placeholders in production screenshots.

`src/data/artManifest.ts` is the static asset manifest and `src/data/artCoverage.test.ts` prevents catalog items from silently falling back to aliases or the lot catalog from shrinking below the environment floor.

## Naming
- `public/assets/lots/<art-id>.svg`
- `public/assets/items/<item-id>.svg`
- `public/assets/items/fallback.svg`

## Replacement rule
Gameplay code refers to semantic Phaser texture keys, not filenames directly. Future hand-painted or generated PNG/WebP art may replace the SVG files while keeping the same semantic IDs and dimensions. Changes must keep `artManifest.ts` and the coverage test consistent.

## Visual acceptance
For material player-facing changes, run the browser capture flow and inspect the resulting image. Passing functional/browser tests does not by itself establish visual quality.

Use `skills/auction-hunter-visual-design/SKILL.md` and its visual review checklist. If a screenshot still reads primarily as black rectangles, borders, small schematic art and equal-weight text, the visual task is not complete.

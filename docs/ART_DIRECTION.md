# Auction Hunter — Art Direction v0.3

## Visual thesis
Auction Hunter should feel like a late-evening storage auction: warm tungsten light, cold industrial shadows, dusty surfaces, taped cardboard, worn paint and small flashes of valuable metal or electronics.

The visual hierarchy is built around uncertainty. Lots should look cluttered and partially readable; individual finds become cleaner and brighter only after reveal/appraisal.

## Style
- 2D illustrated vector art with simplified shapes and strong silhouettes.
- Semi-realistic proportions, not cartoon/chibi.
- Dark industrial environments with warm amber focal lighting.
- Materials: cardboard, plywood, steel, brass, aged plastic, glass.
- Use texture sparingly; readability at 1280×720 and on mobile browsers is more important than fine detail.

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

## Composition rules
- Lot art: dense foreground clutter, a darker back wall, one warm light source and 2–3 readable clue silhouettes.
- Item art: single object, three-quarter view where practical, transparent/neutral background, strong silhouette.
- Reveal state: object occupies most of the card and receives a subtle rarity halo.
- Appraisal state: value UI becomes brighter than the object; the artwork should not compete with the price.

## Current asset coverage
The expanded catalog has direct SVG coverage for all 36 collectible item identities. Catalog items do not depend on visual aliases; `fallback.svg` remains only as a defensive runtime fallback for unknown/missing IDs.

Lot presentation uses nine authored environment SVGs: three Garage, three Estate and three Collector visual archetypes. The 24 lot templates reuse these environments intentionally by setting `artId`, so related locations share visual language while names, clues, item pools and economy create distinct lot identities.

`src/data/artManifest.ts` is the static asset manifest and `src/data/artCoverage.test.ts` prevents catalog items from silently falling back to aliases or the lot catalog from shrinking below the environment floor.

## Naming
- `public/assets/lots/<art-id>.svg`
- `public/assets/items/<item-id>.svg`
- `public/assets/items/fallback.svg`

## Replacement rule
Gameplay code refers to semantic Phaser texture keys, not filenames directly. Future hand-painted or generated PNG/WebP art may replace the SVG files while keeping the same semantic IDs and dimensions. Changes must keep `artManifest.ts` and the coverage test consistent.

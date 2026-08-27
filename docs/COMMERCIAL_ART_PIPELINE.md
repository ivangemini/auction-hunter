# Auction Hunter — Commercial Art Pipeline

## Locked production target

The primary player-facing visual target is the bright commercial Auction Hunter concept language: painterly environments, expressive characters, large hero objects, warm stage lighting, readable gold/blue/purple accents and reward-forward composition.

The game must not regress to a presentation that reads primarily as dark rectangles, equal-weight utility panels, schematic SVGs or a web dashboard.

The premium-antique tone remains part of the brand through wood, brass, leather, warm tungsten light and collector-room materials, but it is subordinate to readability, character presence and commercial game feel.

## Asset hierarchy

For high-visibility gameplay screens use this priority order:

1. Painterly raster/WebP environment or scene backplate.
2. Painterly/raster character and hero-object art.
3. Live Phaser text, values, badges and hit targets layered over the art.
4. Small utility surfaces only where live information needs contrast.
5. SVG/icon treatment only for secondary symbols, fallback coverage or low-visibility utility elements.

A screen is not considered production-ready merely because its rectangles, borders and SVGs are polished.

## No baked gameplay truth

Prices, lot names, item counts, event/modifier state, campaign state, reputation, bankroll, localization and CTA behavior remain live runtime data. Production raster art is visual presentation, not a source of gameplay truth.

When generated visual-development art contains sample copy or values, runtime must cover/replace decision-driving values with live Phaser layers before shipping. Future asset replacements should prefer text-free source art.

## Lot-selection implementation

`CommercialLotSelectionAuctionScene` is the first production screen migrated to the new pipeline.

- `public/assets/ui/lot-selection-commercial.webp` supplies the auction hall, auctioneer, crowd, lighting, hero-object and material presentation.
- `src/game/scenes/CommercialLotSelectionAuctionScene.ts` supplies live lot names, locations, reserve prices, item counts, event state, tier selection, Collection/Daily/Case navigation and real choose-lot hit targets.
- Existing auction/economy/save/analytics ownership remains in `AuctionScene` and the existing subclass chain.
- Legacy automation coordinates are intentionally preserved with invisible compatibility hit targets while screenshot/QA scripts migrate to semantic helpers.

## Acceptance bar

For each migrated major screen:

- capture the real production build at 1280x720 and compact landscape;
- verify the visual is dominated by authored/painterly scene art rather than UI chrome;
- verify live values match runtime state;
- verify all major navigation and CTA paths remain functional;
- verify reduced motion does not remove required state feedback;
- verify no save/economy/campaign/analytics behavior moved into presentation code.

The next screens to migrate under the same rule are bidding, reveal/appraisal, Buyer Market, Collection Book and Office/Campaign hub.

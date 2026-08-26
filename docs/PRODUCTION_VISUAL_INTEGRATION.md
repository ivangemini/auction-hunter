# Production visual integration audit — 2026-08-26

This document records the runtime-vs-art-promise audit performed against `main` at `1d2070010c5b02e0111cda90d39853e38186b7e7` and the production presentation pass implemented on top of it.

## Scope

This pass is presentation-only. It does not add or change currencies, progression systems, campaign scope, economy rules, item generation, bidding rules, save schema, analytics semantics or Yandex platform behavior.

The target is the existing commercial treasure-hunting fantasy: uncertain lots should read as physical places, bidding should read as a staged auction, appraisal should treat a find as a hero object, Collection should read as a collection/display surface, Buyer Market as premium private demand, and Office/Campaign as a working dealer headquarters rather than a stack of dark panels.

## Runtime path audited

The production Phaser scene chain is not the base `AuctionScene` alone. Current runtime presentation is composed through:

- `CampaignProvenanceAuctionScene` -> `RivalBehaviorAuctionScene` -> `CharacterAuctionScene` -> `PolishedAuctionSceneV2` -> `PolishedAuctionScene` -> `AuctionScene`;
- `CollectorRequestBuyerMarketScene` -> `BuyerMarketScene`;
- `CampaignOfficeScene` -> `OfficeScene`;
- `CampaignPrincipalScene` -> `CampaignGatewayScene` -> `CampaignScene`;
- `CollectionScene` directly.

Visual acceptance therefore has to exercise these production subclasses rather than polishing only legacy/base render functions.

## Art pipeline inventory

### Item art

Current catalog identities resolve through stable semantic `item:<id>` texture keys. The runtime item preload path still loads the current direct item identity assets as authored SVG at the 512x360 presentation contract. There is no production raster/WebP item set behind those semantic keys yet.

This means the item pipeline is direct and identity-safe, but its final fidelity ceiling is still the authored SVG source quality. Converting the same vectors to raster files without new source art would not by itself constitute a quality improvement.

### Normal lot environments

Normal lot art uses stable semantic `lot:<id>` texture keys.

- Estate environments `estate-42`, `estate-attic` and `estate-studio` already resolve to WebP.
- Garage and Collector environment families still resolve to authored SVG assets.

The runtime renderer remains format-agnostic, so future production paintings/renders can replace SVG sources behind semantic IDs without scene/economy changes.

### Characters

The current authored character set is SVG-based: auctioneer, mentor, Victor, Mira, Anton, Leah, Roman and Sofia. These are now treated as primary runtime portraits through a stronger shared portrait frame/stage treatment.

Campaign character promise is broader than the currently mapped portrait asset set. In particular, campaign relationships can reference characters that do not currently have a dedicated mapped portrait asset in `characters.ts`; those cases still require real character art production rather than another placeholder avatar.

### Campaign / office art

Campaign environment, evidence and prop art is currently authored primarily as SVG. The assets are integrated in runtime, but several screens previously buried them under heavy dark overlays and equal-weight UI panels. This pass exposes existing environment art more aggressively and adds restrained material/light separation without embedding dynamic UI text into art.

## Gap found on the audited build

The audited production screenshots showed a material gap between the roadmap/mockup promise and runtime:

- lot selection had real environment art, but card chrome, metric boxes and metadata still dominated the fantasy;
- active bidding had an auctioneer and some rival portraits, but the composition still read as a large bid dashboard beside bidder cards rather than a physical show floor;
- reveal/appraisal already had a large item image, but the item floated in a flat dark panel and the appraisal side read as a utility inspector;
- Collection set screens gave more visual area to nested panels/reward metadata than to owned finds;
- Buyer Market had useful concrete-copy hero art but still read as three equal dark dossiers;
- Office and campaign screens used authored environment cues but retained large flat black surfaces and overlays that suppressed the room/HQ fantasy;
- shared buttons, chips, surfaces and progress bars were functional but visually shallow;
- character presentation existed, but the auctioneer used ambient looping bob motion and portrait framing was still close to placeholder-card treatment.

## Runtime integration implemented in this pass

### Shared visual/material layer

`src/game/visual.ts` now provides a deeper but still bounded shared environment/material treatment:

- wall/floor separation and warm/cool light pools;
- restrained architectural beams/shelves/horizon cues;
- stronger shadow/outer-frame/bevel hierarchy on shared surfaces;
- brass, wood, leather, paper and velvet material tokens;
- reusable item hero stage with halo, frame and plinth shadow;
- deeper chips/progress bars while keeping text dynamic and separate from raster/vector art.

### Shared controls

`src/game/ui.ts` now gives buttons layered shadow, outer frame, highlight, lower edge and press depth while retaining the fixed hit target that protects rapid mouse/touch input. Reduced-motion behavior remains static/short and pointer-cancel visual state is restored safely.

### Lot selection

The production `PolishedAuctionScene` lot cards now allocate more visual weight to the authored environment, use stronger framing/lighting/foreground rails and turn reserve/items/event metadata into quieter physical tags rather than equal dashboard boxes. The campaign-case navigation control was moved out of the lot artwork region.

### Bidding / win

`PolishedAuctionSceneV2` now treats the selected lot as a lit auction stage with a foreground rail, stronger current-bid focal card and clearer leader plate. Win presentation uses a larger stage, stronger halo/environment framing and a short bounded celebration. Bid/Pass coordinates and auction truth remain unchanged.

### Reveal / appraisal

Sealed and revealed finds now sit on a reusable hero stage with a physical plinth/material rail, stronger halo separation and more prominent item art. Appraisal uses a warmer appraiser-desk/value plate and clearer trait/condition grouping while preserving the existing Restore/Sell/Keep interaction coordinates and economy behavior.

### Character integration

The auctioneer is staged as a show host with spotlight/frame/short entrance emphasis instead of perpetual ambient bobbing. Shared character portraits receive a deeper framed treatment. Existing mentor/tutorial and rival behavior remain unchanged.

### Collection

Collection set cards now include a wood/velvet/brass display-case field behind the item row, with slightly larger owned-item slots. Reward/set behavior and collection persistence are unchanged.

### Buyer Market

Concrete-copy match art now uses the shared hero stage and larger item treatment. Daily buyer selection, premiums, exact-copy matching and one-sale-per-day semantics are unchanged.

### Office / campaign

The shared atmosphere plus Office-specific desk/lamp/brass cues establishes a physical business room behind the meta UI. Campaign environment art is displayed larger and at higher visibility with a lighter global dark overlay, plus desk/brass/leather cues. Mission graph, choices and relationship effects are unchanged.

## Reduced motion and compact behavior

All new event animation is either a short bounded entrance/reaction or reuses existing reduced-motion checks. No gameplay outcome depends on animation completion. Core CTA coordinates and fixed hit targets were intentionally retained so 844x390/mobile-landscape scaling keeps the same safe interaction map while larger art and stronger hierarchy survive downscaling.

## Remaining production-art gaps

The following are asset-production gaps, not missing game systems:

1. Current item identity art is still SVG-only. High-value/legendary/marketing-facing finds would benefit most from a curated raster/painted replacement batch behind the existing semantic IDs.
2. Most non-Estate normal lot environments are still SVG. Garage and Collector high-visibility scenes are the next rational raster environment targets.
3. Character portrait sources are still SVG. A production portrait/render pass would materially improve auction, campaign contacts and marketing screenshots without requiring character-system changes.
4. The campaign character roster is broader than the dedicated portrait mapping. Characters without authored mapped portraits should receive real source art rather than monogram/vector filler.
5. Campaign environments/evidence are integrated but largely SVG. The most repeated HQ/story locations are candidates for richer raster production art behind current semantic keys.
6. Final Yandex draft and physical-device review remain manual acceptance items even after automated browser/mobile screenshot gates pass.

These gaps should be handled as deliberate art production/replacement work. They should not be disguised by converting existing SVGs to WebP without materially better source art or by adding decorative AI-like clutter.

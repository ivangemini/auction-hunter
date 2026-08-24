---
name: auction-hunter-visual-design
description: Use for any Auction Hunter screen, UI, asset, animation, game-feel, art-direction, visual-polish or presentation change. It turns functional Phaser UI into a cohesive commercial game presentation while preserving gameplay rules, browser performance and mobile usability.
version: 1.0.0
---

# Auction Hunter visual design skill

## Purpose

Auction Hunter must not ship with presentation that merely communicates data. Every player-facing screen should look intentionally authored for a commercial auction/collection game.

Use this skill whenever work touches:
- Phaser scenes or HUD;
- cards, buttons, panels, modals, navigation or typography;
- lot/item imagery;
- reveal, appraisal, restoration, bidding or sale feedback;
- transitions, particles, camera motion, highlights or sound-linked visual feedback;
- responsive/mobile layout;
- screenshots, promo captures or visual QA.

Read `docs/ART_DIRECTION.md` before making visual decisions. For scene code also follow `src/game/AGENTS.md`.

## Core visual thesis

The player is a treasure hunter entering dim storage spaces and estates, reading incomplete clues, taking financial risks, then revealing unexpectedly valuable objects.

Presentation should therefore move through a visual arc:

**uncertainty -> tension -> reveal -> appraisal/value -> ownership/progression**.

The UI should support that arc instead of presenting every state as an equally flat panel.

## Commercial-quality bar

A screen is not visually complete merely because:
- all information fits;
- buttons work;
- there are borders and background rectangles;
- placeholder/simple SVG art exists;
- automated browser tests pass.

Before calling a player-facing screen complete, check that it has:
1. A clear focal point visible within one second.
2. At least three levels of hierarchy: primary action/value, supporting content, tertiary metadata.
3. Intentional depth using lighting, overlap, elevation, gradients, shadows, vignette, texture or atmospheric separation as appropriate.
4. Artwork large and specific enough to sell the fantasy rather than behaving like a tiny icon inside a developer card.
5. Interaction states that visibly respond to hover/touch/click/selection/disabled conditions.
6. State-change feedback for important moments such as bidding, winning, reveals, appraisal, restoration and sales.
7. Consistent visual tokens and material language across screens.
8. A mobile-landscape composition that remains readable without shrinking the desktop UI indiscriminately.

## Anti-prototype rules

Avoid these patterns unless deliberately justified:
- large empty black areas with isolated text;
- identical rectangular cards for every type of content;
- 1px outline + flat fill as the complete visual treatment;
- tiny schematic illustrations surrounded by unused space;
- raw database-like labels such as rows of key/value text with equal emphasis;
- long text blocks where iconography, badges, chips or visual grouping would communicate faster;
- CTA buttons that look identical to secondary controls;
- one font size/weight hierarchy repeated everywhere;
- static screens where a high-value gameplay event should visibly react;
- decorative effects that obscure clues, values or touch targets.

## Composition

### One dominant idea per screen
Decide what the player should notice first. Examples:
- Lot selection: the fantasy and visible clues of each storage lot.
- Auction: current price, bidding tension and opponent intent.
- Reveal: the discovered object.
- Appraisal: monetary value and uncertainty resolution.
- Collection: owned objects and completion progress.
- Buyer Market: premium buyer identity and best matching item.

Make this element larger, brighter, more detailed or more central than supporting information.

### Cards
Cards should represent physical or thematic objects, not generic web-dashboard tiles.

Use combinations of:
- image bleed or large hero image regions;
- layered panel surfaces;
- top/bottom fades behind text;
- category/rarity chips;
- paper tags, auction labels, inventory stickers or stamped metadata where consistent with art direction;
- selection glow, elevation or scale response;
- differentiated CTA zones.

Do not overload cards with ornamental chrome. Clarity wins over decoration.

### Depth and atmosphere
Prefer a small number of coherent layers:
1. environment/background;
2. atmospheric separation/light;
3. gameplay object or card body;
4. information overlay;
5. interaction/feedback layer.

Warm focal light and colder industrial shadows are the default visual relationship. Rarity color is an accent, not the whole palette.

## Artwork

Treat authored imagery as a primary product feature.

For lots:
- show a believable environment or storage composition, not a diagram;
- give the image enough area to create curiosity;
- expose 2-3 truthful silhouettes/clues without visually cataloguing every hidden item;
- vary framing, props, lighting and clutter so different lots do not look like reskinned cards.

For items:
- favor a strong silhouette and recognizable material;
- use three-quarter perspective when practical;
- allow the object to occupy most of the reveal/appraisal visual field;
- show condition/restoration changes visually when asset scope allows;
- keep rare-value effects subtle enough that the object remains readable.

Generated or replacement raster art may supersede simple SVGs while keeping semantic asset IDs stable.

## Typography and information design

Use typography to express hierarchy, not just to fit text.

At minimum distinguish:
- screen/lot/item title;
- primary value or state;
- section label;
- body/supporting copy;
- metadata/secondary clue text.

Numbers that drive decisions (price, bankroll, profit, appraisal, premium) deserve stronger visual treatment than explanatory labels.

Prefer compact chips/badges for rarity, traits, modifiers and statuses when this improves scan speed.

## Interaction and game feel

Every important input should acknowledge the player.

Use restrained combinations of:
- 80-180 ms press/selection scale or elevation response;
- number tween/count-up for meaningful price/value changes;
- short highlight sweep or glow for appraisal/reveal;
- opponent portrait/card reaction when bidding behavior changes;
- dust/spark/light particles for reveals/restoration where appropriate;
- subtle camera or container motion for auction win/loss moments;
- staged transitions rather than instant replacement of the whole screen.

Effects must remain optional/reduced under the existing reduced-motion accessibility setting.

Do not add motion merely because animation is possible. Motion should communicate input acknowledgement, causality, importance or state transition.

## Visual consistency system

Before adding ad-hoc colors/sizes, reuse or extend shared tokens/helpers for:
- panel/background surfaces;
- border/elevation levels;
- text roles;
- spacing/radii;
- button states;
- rarity/state accents;
- overlays and modal dimming;
- animation durations/easing.

If the same visual pattern appears in 3+ scenes, extract a reusable presentation helper rather than copying coordinates and styles.

## Responsive/mobile rules

Auction Hunter is landscape-first, but visual quality must survive smaller browser viewports.

Check at least:
- production desktop capture size;
- representative mobile-landscape viewport.

On smaller screens:
- preserve hierarchy before decorative details;
- shorten/reflow supporting copy before shrinking primary numbers/actions too far;
- maintain touch-safe target sizes;
- avoid horizontal clipping and text collisions;
- prefer fewer, stronger visual elements over compressing every desktop element.

## Screenshot-driven review loop

For material UI changes, do not stop at code review.

1. Run the relevant browser QA/capture flow.
2. Inspect the screenshot as an image, not only DOM/test output.
3. Compare against `docs/ART_DIRECTION.md` and the checklist in `references/visual-review-checklist.md`.
4. Identify the three most prototype-looking areas.
5. Fix the highest-impact one(s) before declaring the visual pass complete.
6. Re-capture after significant layout/art changes.

When a user provides a screenshot, treat it as direct product evidence. Address the visible problems instead of arguing from implementation details.

## Boundaries

Visual polish must not silently change:
- economy formulas;
- save schema;
- auction probabilities;
- collection ownership;
- monetization behavior;
- analytics semantics.

Keep costly visual effects bounded for browser/mobile performance. Prefer reusable authored assets and lightweight Phaser effects over dependency-heavy UI frameworks.

## Completion checklist

Before finishing a visual task:
- [ ] focal point is obvious;
- [ ] screen does not read as a generic dashboard;
- [ ] image/art area is proportionate to the fantasy;
- [ ] primary action is unmistakable;
- [ ] values and statuses are scannable;
- [ ] hover/touch/press/disabled states are clear;
- [ ] important state changes receive feedback;
- [ ] reduced-motion behavior is respected;
- [ ] desktop and mobile-landscape captures were considered;
- [ ] browser QA still passes;
- [ ] screenshot was inspected after implementation;
- [ ] no gameplay/economy/save behavior changed unintentionally.

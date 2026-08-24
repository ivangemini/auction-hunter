# Auction Hunter visual review checklist

Use this after implementing or materially changing any player-facing screen.

Score each category from 0 to 2:
- 0 = prototype / missing;
- 1 = functional but generic;
- 2 = intentional commercial-quality treatment.

A material visual pass should normally reach at least 16/20 with no zero in focal hierarchy, art/fantasy, interaction feedback or mobile readability.

## 1. Focal hierarchy
- Can a new player tell what matters first within one second?
- Is the primary action more prominent than secondary controls?
- Are decision-driving values stronger than labels?

## 2. Art and fantasy
- Does the screen visually sell storage auctions, treasure hunting, appraisal or collecting?
- Is artwork large enough to matter?
- Does it look authored rather than diagrammatic or placeholder-like?

## 3. Depth and material language
- Are background, content and interaction layers visually separated?
- Do lighting, shadows, gradients, texture or overlap create believable depth without hurting readability?
- Does the screen use the established industrial/warm-amber art direction?

## 4. Information design
- Is metadata grouped rather than presented as a flat list?
- Are traits, rarity, modifiers and status compactly encoded where appropriate?
- Is supporting copy subordinate to the decision itself?

## 5. Interaction feedback
- Do hover/touch/press/selection states visibly react?
- Does the player receive immediate acknowledgement after an input?
- Are disabled and unavailable actions obvious?

## 6. Event feedback / game feel
- Do important events have proportionate visual feedback?
- Are reveals, wins, appraisal changes, restoration and sales more satisfying than simple text replacement?
- Does reduced-motion mode remain usable and calm?

## 7. Consistency
- Are repeated cards/buttons/panels using shared visual rules?
- Are spacing, radii, typography roles and state colors coherent with adjacent screens?
- Are there one-off styles that should become a shared helper/token?

## 8. Density and whitespace
- Is empty space intentional rather than leftover layout area?
- Are images or primary content using the available canvas effectively?
- Is the screen neither cramped nor visually empty?

## 9. Mobile landscape
- Are touch targets safe?
- Is text readable without excessive shrinking?
- Do important actions and values remain visible without clipping or overlap?

## 10. Screenshot quality
- Would a production screenshot look credible on a game catalog/store page?
- Are there obvious developer-placeholder elements?
- Is there a memorable visual identity compared with a generic HTML/Phaser prototype?

## Red flags requiring another pass
- black rectangle + border + text repeated across most of the screen;
- tiny art occupying less visual weight than metadata;
- every card has identical composition regardless of content type;
- raw debug/developer wording visible to players;
- primary CTA visually competes with secondary buttons;
- no visible feedback after a meaningful click;
- large unused areas that could carry environment, art or decision context;
- screenshot still looks like a wireframe despite completed functionality.

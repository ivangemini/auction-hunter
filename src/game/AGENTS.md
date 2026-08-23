# Game-layer agent instructions

Applies to `src/game/` in addition to parent instructions.

## Phaser scenes
Scenes should orchestrate presentation and transitions. Move reusable calculations, economy rules, auction simulation and progression rules into pure modules as soon as they become non-trivial.

Do not let a scene become the permanent home for:
- item valuation formulas;
- save migrations;
- analytics schema definitions;
- Yandex SDK calls;
- large content tables.

If a scene becomes difficult to navigate or test, split by responsibility rather than adding more regions/helpers to one file.

## Interaction rules
- Support mouse and touch.
- Disable or visibly gate controls while an NPC/action transition is pending.
- Avoid double-submit/double-purchase paths.
- Preserve player bankroll and item decisions across render refreshes.
- Never make closing an ad or losing focus count as a gameplay failure.

## Presentation
- Prefer reusable UI helpers/components for repeated visual patterns.
- Keep layout constants/tokens centralized as the visual system matures.
- UI polish may change presentation, but must not silently alter economy or persistence behavior.

## Randomness
Random outcomes are acceptable for auctions/reveals, but probabilities and ranges should be legible from data/config and eventually testable. Do not hide balance-critical randomness in arbitrary scene callbacks.

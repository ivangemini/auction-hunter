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
For player-facing scene work, read `../../skills/auction-hunter-visual-design/SKILL.md` and `../../docs/ART_DIRECTION.md` before implementation.

- Prefer reusable UI helpers/components for repeated visual patterns.
- Keep layout constants/tokens centralized as the visual system matures.
- UI polish may change presentation, but must not silently alter economy or persistence behavior.
- Do not accept a layout whose main vocabulary is only flat dark rectangles, borders and text.
- Give the screen a deliberate focal point and make primary game art/value/action visually dominant.
- Use hierarchy, atmosphere, imagery and feedback to make the scene feel like part of the auction world rather than a dashboard.
- Important interactions must show hover/touch/press/selected/disabled feedback as appropriate.
- Important gameplay events should receive proportionate visual feedback while respecting reduced-motion accessibility.
- When the same visual treatment appears across 3+ scenes, extract or extend a shared helper/token rather than copy-pasting styles and coordinates.
- For material UI changes, inspect a browser screenshot after implementation and review it against `../../skills/auction-hunter-visual-design/references/visual-review-checklist.md`.
- Browser QA passing is necessary but not sufficient for visual acceptance.

## Randomness
Random outcomes are acceptable for auctions/reveals, but probabilities and ranges should be legible from data/config and eventually testable. Do not hide balance-critical randomness in arbitrary scene callbacks.

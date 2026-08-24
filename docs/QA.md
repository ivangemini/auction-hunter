# Auction Hunter — Device / Browser QA

## Automated smoke coverage
CI runs Chromium checks at three viewport shapes:
- desktop: 1280×720;
- mobile landscape: 844×390;
- mobile portrait: 390×844.

The suite verifies boot, viewport containment, no document scrolling, no uncaught page errors and context-menu suppression. Mobile portrait additionally verifies the landscape interaction guard is visible and localized.

## Mobile posture
Auction Hunter is landscape-first for v0.1. On phone-sized portrait viewports the browser orientation guard covers the game and the runtime is paused through the shared lifecycle coordinator. Rotating back to landscape removes the pause reason and resumes normally.

Phaser remains 1280×720 with `Scale.FIT`. Shared buttons now use transparent hit slop around their visual rectangles, improving touchability on short landscape phone screens without changing the desktop composition.

## Browser hardening
- Root game container is fixed to the viewport.
- Overscroll, selection and iOS callout are disabled.
- `contextmenu` is cancelled inside `#game`.
- Yandex pause/resume, visibility, blur/focus and phone portrait orientation all feed the same idempotent pause-reason set.

## Manual Yandex QA — required before checking the roadmap item
Run an uploaded draft through the Yandex Games debug panel on at least one desktop browser and one real mobile device:
1. Game Ready changes only after the first interactive screen.
2. GameplayAPI becomes active for bidding/reveal/restoration and inactive at natural breaks.
3. Switch tabs/minimize during bidding and confirm both gameplay and sound pause/resume.
4. Resize desktop repeatedly; no text/buttons clip.
5. On mobile landscape, tap all auction/reveal/appraisal/restoration/sell/keep controls one-handed.
6. Rotate to portrait: the in-game localized rotate guard appears and active game input stops. Rotate back: play resumes without state loss.
7. Long-press the canvas; no selection/callout/context menu appears.
8. Open Collection Book, sell one owned item and verify cash/save/cloud state update.
9. Complete a lot using exactly one restoration; verify later items cannot launch a second restoration.
10. Run multiple variants within each tier and verify clue text always corresponds to at least one revealed category.
11. Inspect console and Yandex debug panel for runtime errors.

## Roadmap completion rule
Do not mark `Device/browser QA` complete until the manual draft/device pass is performed. Automated CI is a regression gate, not a substitute for platform moderation QA.

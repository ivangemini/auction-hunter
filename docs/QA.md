# Auction Hunter — Device / Browser QA

## Automated smoke coverage
CI runs Chromium checks at three viewport shapes:
- desktop: 1280×720;
- mobile landscape: 844×390;
- mobile portrait: 390×844.

The suite verifies boot, viewport containment, no document scrolling, no uncaught page errors and context-menu suppression. Mobile portrait additionally verifies the landscape interaction guard is visible and localized.

A dedicated desktop interaction contract also verifies the normal-auction decision funnel: the market presents three unique lot IDs, choosing a lot emits exactly one selection event without starting gameplay, and only entering the chosen auction emits `auction_started` / activates Yandex GameplayAPI.

## Mobile posture
Auction Hunter is landscape-first for v0.1. On phone-sized portrait viewports the browser orientation guard covers the game and the runtime is paused through the shared lifecycle coordinator. Rotating back to landscape removes the pause reason and resumes normally.

Phaser remains 1280×720 with `Scale.FIT`. Shared buttons now use transparent hit slop around their visual rectangles, improving touchability on short landscape phone screens without changing the desktop composition.

The three-option lot-selection screen is part of the same 1280×720 composition: all cards and `Choose lot` controls must remain readable/tappable after `Scale.FIT` on the 844×390 landscape-phone project.

## Browser hardening
- Root game container is fixed to the viewport.
- Overscroll, selection and iOS callout are disabled.
- `contextmenu` is cancelled inside `#game`.
- Yandex pause/resume, visibility, blur/focus and phone portrait orientation all feed the same idempotent pause-reason set.

## Manual Yandex QA — required before checking the roadmap item
Run an uploaded draft through the Yandex Games debug panel on at least one desktop browser and one real mobile device:
1. Game Ready changes only after the first interactive screen.
2. Normal auctions first present three distinct options with opening price, item count, clue-backed signals and visible event state; changing tier must not expose hidden item values.
3. Selecting an option opens its detailed lobby without activating GameplayAPI. GameplayAPI becomes active only when the user enters bidding, and inactive at natural breaks.
4. On a short landscape phone, verify all three lot cards and each `Choose lot` button are readable/tappable with no clipping or accidental overlap.
5. Switch tabs/minimize during bidding and confirm both gameplay and sound pause/resume.
6. Resize desktop repeatedly; no text/buttons clip.
7. On mobile landscape, tap all auction/reveal/appraisal/restoration/sell/keep controls one-handed.
8. Rotate to portrait: the in-game localized rotate guard appears and active game input stops. Rotate back: play resumes without state loss.
9. Long-press the canvas; no selection/callout/context menu appears.
10. Open Collection Book from the lot-selection screen, sell one owned item and verify cash/save/cloud state update.
11. Complete a lot using exactly one restoration; verify later items cannot launch a second restoration.
12. Run multiple variants within each tier and verify clue text always corresponds to at least one revealed category.
13. Activate Daily Special and verify it intentionally bypasses three-option selection after activation, while returning to normal auctions restores the choice screen.
14. Inspect console and Yandex debug panel for runtime errors.

## Roadmap completion rule
Do not mark `Device/browser QA` complete until the manual draft/device pass is performed. Automated CI is a regression gate, not a substitute for platform moderation QA.

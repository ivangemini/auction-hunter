# Auction Hunter — Device / Browser QA

## Automated smoke coverage
CI runs Chromium checks at three viewport shapes:

- desktop: 1280×720;
- mobile landscape: 844×390;
- mobile portrait: 390×844.

The smoke suite verifies that the game boots, the Phaser canvas remains inside the viewport, the document does not acquire scrollbars, no uncaught page errors occur, and the in-game context menu / long-press path is suppressed.

## Browser hardening
- `Phaser.Scale.FIT` preserves the 16:9 active field without geometric stretching.
- The root game container is fixed to the available viewport.
- Browser overscroll, text selection and iOS touch callout are disabled in the game surface.
- `contextmenu` is cancelled inside `#game`.

## Manual Yandex QA — required before checking the roadmap item
Run the uploaded draft through the Yandex Games debug panel and verify all of the following on at least one desktop browser and one real mobile device:

1. Game Ready changes only after the lobby is fully interactive.
2. Start an auction: gameplay indicator becomes active.
3. Pass, lose, or finish the lot: gameplay indicator becomes inactive.
4. Switch tabs / minimize and return while bidding; confirm the Yandex gameplay indicator follows platform pause/resume behavior.
5. Resize the desktop window repeatedly; no text or buttons are clipped or overlap.
6. On mobile landscape, tap every auction/reveal/appraisal/sell/keep control with one hand; no browser scrolling or pull-to-refresh occurs.
7. Long-press the canvas; no selection, callout or context menu appears.
8. Rotate the device. If the project is configured as landscape-only in the Yandex draft, confirm the platform rotation prompt appears in portrait.
9. Run one complete lot from lobby to summary and then start a second lot; verify there is no dead-end screen.
10. Inspect the browser console and Yandex debug panel for runtime errors.

## Roadmap completion rule
Do not mark `Device/browser QA` complete until the manual Yandex draft test above has been performed. Automated CI is a regression gate, not a substitute for platform/device moderation QA.

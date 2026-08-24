# Yandex moderation / release checklist

Use this checklist before submitting a build. Requirements can change; re-check the current Yandex Games documentation before each release.

## Archive
- [ ] Run the `Yandex Release Archive` GitHub Actions workflow.
- [ ] Workflow quality gates pass: draft-metadata validation, typecheck, unit tests, production build and browser QA.
- [ ] ZIP contains `index.html` at archive root.
- [ ] Uncompressed files are <= 100 MB.
- [ ] Archive paths contain no spaces or Cyrillic/non-ASCII characters.
- [ ] Do not upload `dist/` directly; use the produced `auction-hunter-yandex.zip` artifact.

## Draft metadata / branding
- [ ] Use `release/yandex-draft-metadata.json` / `docs/YANDEX_DRAFT_METADATA.md` as the source for RU/EN text fields.
- [ ] Run `node scripts/validate-yandex-draft.mjs`; it must pass before archive build.
- [ ] The title is exactly `Auction Hunter` in the game, browser title and every selected-language draft material.
- [ ] The title is not written in full or partial all caps.
- [ ] Verify `Auction Hunter` is still unique in the live Yandex Games catalog before submit.
- [ ] Required icon is 512×512 PNG and cover is 800×470 PNG; neither is a raw gameplay screenshot.
- [ ] At least two valid screenshots are uploaded for every selected platform.

## SDK / lifecycle
- [ ] Open the draft with the Yandex debug panel.
- [ ] `LoadingAPI.ready()` fires only when onboarding/lobby is interactive.
- [ ] Gameplay indicator is active during bidding/reveal/restoration and stopped at natural breaks.
- [ ] `game_api_pause` stops gameplay and sound during ads/platform overlays.
- [ ] `game_api_resume` restores the same state without duplicate actions.
- [ ] Switching tabs/minimizing the browser pauses gameplay and sound.

## Ads
- [ ] Rewarded button explicitly says an ad will be shown and displays the exact reward.
- [ ] Reward is granted only after `onRewarded` and only once.
- [ ] Closing/error without reward does not grant cash or block progression.
- [ ] Interstitial appears only after `Next auction` and never during bidding/reveal/restoration/sell-keep decisions.
- [ ] Sticky banners are enabled for intended desktop/mobile placements and **Use the API to display a sticky-banner** is enabled in the Yandex Console.
- [ ] Sticky banner is visible on non-gameplay/break screens, hidden from auction start through reveal/restoration/sell-keep, and returns at the next natural break.
- [ ] Sticky placement does not overlap or create accidental-click pressure near primary controls on desktop or landscape mobile.
- [ ] Returning from an ad preserves progress.
- [ ] YAN monetization is enabled in the Developer Console before submission if the release is monetized.

## Saves
- [ ] Local progress survives refresh/restart.
- [ ] Authorized Yandex Player progress restores from cloud on a second browser/device test where available.
- [ ] Offline/SDK failure continues with local progress.
- [ ] Older v1 local saves normalize without reset.
- [ ] Recent auction history survives restart/cloud reconciliation without duplicate entries.
- [ ] Rapid consecutive mutations/background flushes do not cause an older cloud upload to replace newer progress.

## Analytics
- [ ] Built-in Yandex Games metrics appear for the draft/test traffic where applicable.
- [ ] If detailed custom telemetry is required for launch, create a Yandex Metrica counter and clear **Receive data only from specified addresses**.
- [ ] Set GitHub Actions repository variable `YANDEX_METRICA_ID` to the real numeric counter ID before building the candidate archive.
- [ ] Create the stable `ah_*` JavaScript goals listed in `docs/ANALYTICS.md`.
- [ ] Run a draft session and confirm `round_completed`, auction outcome and progression parameters arrive in Metrica.
- [ ] Do not claim the first telemetry-driven tuning pass is possible until this verification succeeds.

## Localization / UI / accessibility
- [ ] Russian draft opens with RU game UI from `ysdk.environment.i18n.lang`.
- [ ] English/non-Russian draft opens with EN fallback UI.
- [ ] Draft title, description, instructions and promotional materials are localized for every declared language.
- [ ] No system context menu appears on right-click or long press in the game area.
- [ ] No scrollbars, clipping or dead-end screens at supported desktop/mobile sizes.
- [ ] Real-device landscape controls remain tappable after rotation/background/foreground cycles.
- [ ] Sound feedback toggle works and platform pause still silences audio.
- [ ] Reduced-motion mode suppresses camera shake.
- [ ] Higher-contrast mode remains readable without hiding controls or clipping text.

## Content / policy
- [ ] Read `docs/CONTENT_DURATION.md` and confirm the current build still satisfies its replayability evidence assumptions.
- [ ] Confirm the current breadth floor: 36 items, 24 lot templates / 8 per tier and 12 collection sets, with direct item art and truthful clues.
- [ ] On a fresh Yandex draft save, run a timed natural session for at least 10 minutes; confirm meaningful progression/replay goals still remain after minute 10.
- [ ] During that run, complete multiple auctions and verify different lots/items/NPC outcomes or modifiers occur rather than a fixed one-shot sequence.
- [ ] Genre/description accurately match auction, appraisal, restoration and collection gameplay.
- [ ] No interactive AI runs inside the published game. Pre-generated AI-assisted art/content, if used, is static game material.
- [ ] No third-party ads or unapproved external links are present.

## Final manual gate
Do not submit for moderation until `docs/QA.md` manual Yandex draft/device checks, analytics verification (if custom telemetry is enabled) and the timed content-duration check above are complete. Automated metadata/browser/content/economy tests and the archive workflow reduce regressions but do not replace real draft/device moderation QA.

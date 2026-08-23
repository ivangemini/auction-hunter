# Yandex moderation / release checklist

Use this checklist before submitting a build. Requirements can change; re-check the current Yandex Games documentation before each release.

## Archive
- [ ] Run the `Yandex Release Archive` GitHub Actions workflow.
- [ ] Workflow quality gates pass: typecheck, unit tests, production build and browser QA.
- [ ] ZIP contains `index.html` at archive root.
- [ ] Uncompressed files are <= 100 MB.
- [ ] Archive paths contain no spaces or Cyrillic/non-ASCII characters.
- [ ] Do not upload `dist/` directly; use the produced `auction-hunter-yandex.zip` artifact.

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
- [ ] Returning from an ad preserves progress.
- [ ] YAN monetization is enabled in the Developer Console before submission if the release is monetized.

## Saves
- [ ] Local progress survives refresh/restart.
- [ ] Authorized Yandex Player progress restores from cloud on a second browser/device test where available.
- [ ] Offline/SDK failure continues with local progress.
- [ ] Older v1 local saves migrate without reset.

## Localization / UI
- [ ] Russian draft opens with RU game UI from `ysdk.environment.i18n.lang`.
- [ ] English/non-Russian draft opens with EN fallback UI.
- [ ] Draft title, description, instructions and promotional materials are localized for every declared language.
- [ ] No system context menu appears on right-click or long press in the game area.
- [ ] No scrollbars, clipping or dead-end screens at supported desktop/mobile sizes.
- [ ] Real-device landscape controls remain tappable after rotation/background/foreground cycles.

## Content / policy
- [ ] Game provides more than 10 minutes of replayable content through repeated variable auctions and progression.
- [ ] Genre/description accurately match auction, appraisal, restoration and collection gameplay.
- [ ] No interactive AI runs inside the published game. Pre-generated AI-assisted art/content, if used, is static game material.
- [ ] No third-party ads or unapproved external links are present.

## Final manual gate
Do not submit for moderation until `docs/QA.md` manual Yandex draft/device checks are complete. Automated browser tests and the archive workflow reduce regressions but do not replace real draft/device moderation QA.

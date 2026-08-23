# Auction Hunter agent guide

## Product goal
Build a browser-first auction/appraisal/restoration/collection game optimized for Yandex Games retention and monetization without sacrificing player trust.

## Engineering rules
- Keep the core economy and content data-driven; do not hardcode item values inside scenes.
- Preserve Yandex Games SDK initialization and `LoadingAPI.ready()` semantics.
- Keep `vite.config.ts` base path relative so archive builds work on Yandex hosting.
- Prefer small pure domain modules over scene-local business logic as the project grows.
- Do not add ads at arbitrary gameplay moments. Rewarded ads must be optional and interstitials belong only at natural breaks.
- RU and EN are the baseline locales. Platform language detection should remain the source of truth when the SDK is available.

## Quality gates
Before committing functional changes, run:

```bash
npm run typecheck
npm run build
```

## MVP core loop
Auction -> win lot -> reveal items -> appraise -> sell or keep -> improve bankroll/collection -> next auction.

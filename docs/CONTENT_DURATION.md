# Content duration / replayability evidence

This document is the release evidence and manual gate for Yandex Games requirement 2.9. Re-check the live Yandex requirement before each submission because moderation rules can change.

Current requirement verified 2026-08-24: the game must provide more than 10 minutes of gameplay. Yandex explicitly allows this to be satisfied by sufficient primary content, by replayability/variability with motivation to replay, or by both. A short repeatable loop without meaningful variability or meta progression is not enough.

Reference: https://yandex.com/dev/games/doc/en/requirements/2/9

## Why Auction Hunter is designed to satisfy the rule

Auction Hunter is not a finite one-shot level sequence. Its core auction loop is repeatable and materially changes between runs:

- 24 authored lot templates across Garage, Estate and Collector tiers, eight per tier.
- 36 collectible item identities and 12 collection sets.
- Hidden lot contents are generated from clue-backed pools rather than fixed reveal scripts.
- Item condition and market factors vary between generated finds.
- Concrete copies can roll positive or negative variant traits, changing appraisal and making repeated copies economically distinct.
- NPC bidder profiles and auction pressure vary, and their hidden budgets inherit the actual generated lot value including copy variants.
- Visible rare lot modifiers can change quantity, condition, reserve price or market value.
- Three reputation-gated auction tiers provide progression into higher-value content.
- Daily Special and Daily Contracts provide changing return objectives.
- Achievements and Business Office upgrades create persistent goals between individual auctions.
- Collection completion, recent auction history and lifetime statistics provide long-run progress tracking.
- Late-game Advanced Inspection adds an optional cash-for-information decision without revealing exact hidden value.
- Three-option normal markets create many possible comparison combinations before hidden contents are generated.
- Stable collectible identity traits plus per-copy variants create specialist demand instead of making every item only a rarity/value pair.
- The daily Buyer Market creates three rotating premium sale opportunities and prices the exact kept copy, so condition/restoration/variant quality can matter across sessions.

These systems create both content breadth and metagame motivation to continue playing beyond a single auction.

## Automated regression floor

`src/data/replayability.test.ts` protects a minimum structural floor for the release build. `src/data/contentScale.test.ts` additionally protects the 36-item / 24-lot / 12-set breadth target, eight lots per tier, truthful clues and full collection coverage. Buyer/trait tests protect deterministic daily offers, exact-copy pricing, trait appraisal variance and save migration.

The automated gate is evidence only. It cannot prove elapsed playable duration and does not replace the timed Yandex draft test below.

## Manual timed draft gate

Run this on the actual Yandex draft build before first submission and again after material changes to the core loop or progression.

### Setup

1. Use a fresh player save or a clean test account.
2. Open the Yandex draft with the debug panel available.
3. Use a real target device/browser combination. At minimum test one desktop browser and one landscape mobile device.
4. Start a timer when the first onboarding/gameplay interaction becomes available.
5. Play normally rather than intentionally idling or delaying actions.

### During the run

Record at least:

- elapsed time;
- auctions entered, won and passed;
- distinct lot templates encountered;
- distinct item identities revealed;
- any repeated identity that appeared with meaningfully different appraisal/traits;
- reputation/tier progression;
- collection/set progress;
- Daily Contract progress;
- Buyer Market offers seen and any premium sale completed;
- Office/achievement progression reached during the run;
- any point where the player has no meaningful next objective.

Do not count ad playback, background-tab time, deliberate inactivity or debug-panel time toward playable duration evidence.

### Internal acceptance target

Use a 12-minute internal safety target even though the platform rule is more than 10 minutes.

The gate passes only if a normal fresh-save player can remain in meaningful gameplay for at least 12 minutes and still has legitimate reasons to continue, such as unseen lots/items, better variants of known items, collection goals, specialist buyer demand, contracts, achievements, upgrades or tier progression.

The run fails if gameplay becomes exhausted, deterministic/repetitive without meaningful choice, blocked by economy state, or functionally complete before the target.

## Evidence record

Fill this section from the final candidate build.

- Build/commit: `TBD`
- Yandex draft ID/version: `TBD`
- Test date: `TBD`
- Device/browser: `TBD`
- Locale: `TBD`
- Timed meaningful gameplay: `TBD`
- Auctions played: `TBD`
- Distinct lots encountered: `TBD`
- Distinct items revealed: `TBD`
- Highest tier reached: `TBD`
- Buyer Market / copy-variant notes: `TBD`
- Notes/blockers: `TBD`
- Result: `NOT YET VERIFIED`

Do not change `Result` to passed and do not mark the roadmap timed-duration item complete until this test has been performed on the actual Yandex draft build.

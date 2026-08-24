# Analytics Schema v1

## Transport boundary
Gameplay emits typed analytics through `trackEvent()` in `src/analytics.ts`. Every event is wrapped with:

- `schemaVersion` — currently `1`;
- `eventName` — stable snake-case event name;
- `eventId` — per-event random ID;
- `sessionId` — stable for the current page session;
- `sequence` — monotonically increasing within the page session;
- `occurredAt` — ISO timestamp;
- `payload` — event-specific typed data.

Core gameplay remains analytics-vendor-neutral. Internal consumers can register a sink with `registerAnalyticsSink()` or listen for the browser `auction-hunter:analytics` CustomEvent.

## Yandex analytics layers
Yandex Games Developer Console built-in metrics work automatically and provide coarse player, playtime, retention and monetization indicators without extra game code.

Detailed Auction Hunter economy/funnel telemetry uses the optional adapter in `src/platform/metrica.ts`. When a valid `VITE_YANDEX_METRICA_ID` is configured, the adapter:

1. loads the official Yandex Metrica `tag.js` asynchronously;
2. initializes the configured counter;
3. sends every typed game event through Metrica `params` with the stable event name/schema/payload;
4. additionally emits important funnel/economy milestones through `reachGoal` using stable `ah_*` JavaScript goal IDs.

If no counter ID is configured, the adapter is a no-op and local/browser development continues normally. Telemetry failure never blocks input, persistence or progression.

Official references:
- Yandex Games Metrica setup: https://yandex.com/dev/games/doc/en/concepts/yandex-metrica
- Metrica `reachGoal`: https://yandex.com/support/metrica/en/objects/reachgoal
- Metrica event/parameter methods: https://yandex.com/support/metrica/en/pro/methods

## Metrica setup before real traffic
1. Create a Yandex Metrica tag for the game.
2. Clear **Receive data only from specified addresses** as required by Yandex Games documentation.
3. Put the numeric counter ID in GitHub repository **Actions variable** `YANDEX_METRICA_ID`. `yandex-release.yml` exposes it to Vite as `VITE_YANDEX_METRICA_ID` during the release build.
4. For local verification, copy `.env.example` to `.env.local` and set `VITE_YANDEX_METRICA_ID=<counter id>`.
5. In Metrica, create JavaScript-event goals for the stable identifiers below before relying on funnel/goal reports.
6. After a draft test session, verify both goal completions and event/goal parameters in Metrica before calling detailed telemetry launch-ready.

### Stable JavaScript goal IDs
- `ah_onboarding_completed`
- `ah_lot_option_selected`
- `ah_auction_started`
- `ah_advanced_inspection_used`
- `ah_auction_won`
- `ah_auction_passed`
- `ah_restoration_completed`
- `ah_item_dispositioned`
- `ah_collection_set_reward_claimed`
- `ah_daily_special_completed`
- `ah_daily_contract_reward_claimed`
- `ah_achievement_reward_claimed`
- `ah_business_upgrade_purchased`
- `ah_round_completed`
- `ah_rewarded_ad_rewarded`

All other typed events are still sent through `params`; they do not need to be configured as goals unless a later analysis/funnel requires that.

## Schema events
- `session_started`
- `onboarding_completed`
- `tier_selected`
- `lot_options_presented`
- `lot_option_selected`
- `daily_special_activated`
- `auction_started`
- `advanced_inspection_used`
- `bid_placed`
- `auction_won`
- `auction_passed`
- `item_revealed`
- `item_appraised`
- `restoration_completed`
- `item_dispositioned`
- `collection_set_reward_claimed`
- `daily_special_completed`
- `daily_contract_reward_claimed`
- `achievement_reward_claimed`
- `business_upgrade_purchased`
- `round_completed`
- `rewarded_ad_requested`
- `rewarded_ad_rewarded`
- `rewarded_ad_closed`
- `interstitial_ad_requested`
- `interstitial_ad_closed`

## Lot-selection telemetry
Normal auctions now expose a choice funnel before bidding:
- `lot_options_presented` records the tier, the three presented lot IDs and the aligned visible modifier IDs (`null` when no modifier is present);
- `lot_option_selected` records the committed option index, lot ID, visible reserve price/item count and selected modifier.

Hidden item identity, condition, market factor and NPC bidding limits are deliberately absent from these events at decision time. The selected lot is a Metrica JavaScript goal; the presentation event remains detailed `params` telemetry. Together with `auction_started`, these events separate market-choice abandonment from later auction abandonment.

## Core funnel coverage
The playable flow emits the first-session and economy funnel needed for post-release tuning:
- tier selection and three-option normal-auction presentation/choice;
- Daily activation as a fixed featured-lot path;
- auction start with lot/tier/opening bid/modifier context;
- paid advanced-inspection usage;
- each player bid and pass decision;
- win outcome;
- item reveal and appraisal;
- restoration outcome;
- sell/keep decision;
- exactly one `round_completed` event per cleared lot even when the summary screen is redrawn for ad state;
- collection-set, Daily Contract, achievement and business-upgrade progression;
- rewarded/interstitial request and completion state.

This supports option-level selection rate, modifier preference, reserve-price sensitivity, selection-to-auction conversion, auction pass behavior, inspection usage, reveal/appraisal completion, restoration usage, disposition mix, lot-level estimated result and meta-progression behavior once remote Metrica transport is configured.

## Monetization telemetry
Rewarded events include the summary placement and exact cash reward. The close event records whether an impression opened, whether `onRewarded` occurred and the final adapter outcome.

Interstitial request/close events include the auction number, whether Yandex actually showed an impression and the final adapter outcome. Yandex platform metrics remain the primary source for platform ad/revenue reporting; custom events are for gameplay-context analysis.

## Privacy / cardinality
The typed schema intentionally contains no names, email addresses, device identifiers, free-form user text or other direct personal identifiers.

The Metrica adapter deliberately does **not** forward internal `eventId`, ephemeral `sessionId` or `occurredAt` envelope fields. Metrica already supplies session/time context, while omitting these values reduces needless high-cardinality data. It forwards only stable schema/event context, sequence and typed payload fields.

## Versioning rule
Additive optional payload fields and additive event names may remain in schema v1. Renaming/removing events, changing field meaning, or making an incompatible payload change requires a new schema version.

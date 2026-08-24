# Auction Hunter — Game Design v0.5

## Product thesis
Auction Hunter combines uncertain-value auctions, truthful visual clues, item reveals, appraisal, selective restoration, collection and a lightweight dealer-business meta. The retention hook is curiosity plus judgment: the player compares several imperfect opportunities, then risks bankroll using partial information without ever seeing exact hidden value.

## Core loop
1. Compare three available lots within the selected auction tier using opening price, item count, truthful clue-backed signals and any visible rare event.
2. Choose one lot and inspect its detailed public information.
3. Decide how much those signals justify risking.
4. Bid against NPC buyers or pass before overpaying.
5. Win and reveal hidden items one by one.
6. Appraise each item.
7. Spend the lot's single restoration attempt on the find where it matters most, or save it for a later reveal.
8. Sell for immediate cash or keep for collection/set progress.
9. Review cash result plus estimated kept value, then return to a fresh three-lot market selection.

Daily Special remains a fixed featured opportunity and intentionally bypasses the three-lot comparison screen after activation.

## Meta loop
- Three deterministic Daily Contracts create short return goals.
- Achievements reward permanent milestones.
- The Office turns cash into Warehouse, Contracts Desk and Showroom upgrades instead of letting bankroll become meaningless.
- Recent auction history and lifetime stats make long-run progress visible.
- Paid late-game inspection creates an optional information-vs-cash decision after 220 REP.

## Player fantasy
Start as a small garage reseller and grow into a high-end auction/antique business.

## Decision quality principles
- Lot selection must expose only public information; hidden item identity, condition, market factor and NPC limits are generated only after the player commits to a choice.
- The three normal options must be distinct within a selection screen.
- Visible rare modifiers may influence which lot the player chooses, but they never reveal exact hidden value.
- Clues must be truthful enough to reward attention.
- Blindly winning every auction must not be the dominant strategy.
- Keeping items must have opportunity cost without creating irreversible bankroll failure.
- Restoration must be scarce enough to require prioritization.
- Advanced inspection may improve information quality but must not reveal exact hidden value or NPC limits.
- Collection and monetization incentives must not contradict each other.
- Meta rewards should amplify an enjoyable loop, not compensate for a deliberately frustrating base game.

## Retention layers
- Seconds: compare options / next NPC bid / reveal / restoration timing.
- Minutes: did the chosen lot create total value and did the player overpay?
- Session: improve lot-selection judgment, unlock another tier, complete contracts and invest in the Office.
- Days: Daily Special, Daily Contracts and set completion.
- Long term: achievements, business upgrades, rare sets, auction history and reputation progression.

## Monetization principles
Rewarded ads trade optional attention for bounded bonus value. The launch summary reward uses total round appraisal rather than only sold value so keeping a collectible is not monetization-negative. Interstitials only appear at natural transitions.

## Current content scope
- 24 collectible item definitions with direct SVG art for every identity.
- 18 lot templates: 6 Garage, 6 Estate and 6 Collector variants.
- 9 lot environment illustrations: 3 visual archetypes per tier.
- 3 auction tiers.
- 8 collection sets covering the full catalog.
- Three-option normal-auction selection using truthful signals and visible modifiers.
- Daily Special, Daily Contracts, achievements, Office upgrades, recent history, local/cloud save, analytics and policy-compliant ads.

## Art scope note
The v1 second art pass is complete at the catalog-identity level: the 12 expansion items no longer alias the original 12 item textures, and the lot catalog now uses nine authored environments rather than only one background per tier. `fallback.svg` remains defensive only, not normal catalog presentation.

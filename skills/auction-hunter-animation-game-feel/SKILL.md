---
name: auction-hunter-animation-game-feel
description: Use for any Auction Hunter animation, transition, tween, interaction feedback, reveal sequence, bidding reaction, restoration feedback, particle effect or motion-system change. It defines commercial game-feel standards for Phaser while protecting gameplay state, accessibility and browser performance.
version: 1.0.0
---

# Auction Hunter animation & game-feel skill

## Purpose

Auction Hunter should never feel like a sequence of static forms. Motion must make bidding, discovery, appraisal, restoration, selling and progression feel causal, tactile and rewarding.

Use this skill whenever work touches:
- hover/touch/press/selected states;
- Phaser tweens;
- screen or panel transitions;
- bid-price changes and opponent reactions;
- item reveals and appraisal;
- restoration feedback;
- reward, sale, collection or achievement celebrations;
- particles, glow, camera motion or animated lighting;
- motion accessibility or performance.

Also read `docs/ART_DIRECTION.md` and `skills/auction-hunter-visual-design/SKILL.md`.

## Motion principles

Every animation must do at least one useful job:
1. acknowledge player input;
2. explain causality or state change;
3. direct attention;
4. create tension;
5. communicate value/rarity;
6. celebrate meaningful progress.

Do not animate merely to keep the screen moving.

## Timing system

Use these as default ranges, not rigid constants:

| Motion | Duration | Default easing |
| --- | ---: | --- |
| pointer hover / focus | 110-160 ms | `Cubic.Out` |
| press-down | 65-95 ms | `Cubic.Out` |
| press release / settle | 120-180 ms | `Back.Out` or `Cubic.Out` |
| chip/badge/state change | 140-220 ms | `Sine.Out` |
| panel/card enter | 220-340 ms | `Cubic.Out` |
| modal/major transition | 260-420 ms | `Cubic.InOut` |
| bid/value pulse | 180-320 ms | `Quad.Out` |
| item reveal | 320-520 ms | staged, `Cubic.Out` |
| reward celebration | 420-700 ms | staged, bounded |
| ambient loop | 1.8-4 s | `Sine.InOut` |

Micro-interactions should feel immediate. Do not make the player wait for decorative animation before the game accepts input unless the animation itself is part of the mechanic.

## Interaction language

### Hover
Desktop hover should normally combine only 2-3 signals:
- +1-3% scale;
- 1-3 px lift;
- slightly stronger border/glow/shadow;
- optional art parallax of only a few pixels.

Avoid large zooms and continuous bouncing.

### Press
Press feedback should feel tactile:
- scale to roughly 0.96-0.985;
- move down by roughly 1-2 px;
- reduce shadow depth;
- release into a short settle.

The click action must fire once. Animation callbacks must not create double-submit paths.

### Touch
Do not rely on hover to communicate affordance. Touch must receive immediate press feedback and then a clear selected/transition state.

## Core gameplay motion map

### Lot selection
- cards enter with a small stagger;
- hover lifts the whole card, not just the button;
- image layer may use extremely subtle parallax;
- selecting a lot should emphasize the chosen card while alternatives recede before transition;
- modifier/rare-event badges can receive one short accent pulse, never a permanent distracting loop.

### Auction
- every accepted bid should pulse the price and briefly reinforce the current leader;
- opponent decisions should have a short anticipation beat, not an arbitrary long delay;
- bidder tells should transition visually rather than snapping between identical cards;
- winning should produce a compact impact/settle beat; losing should be clear but not punitive or screen-shaking.

### Reveal
The reveal is a primary retention moment. Stage it:
1. anticipation / concealed state;
2. object enters or resolves into focus;
3. rarity/identity appears;
4. appraisal/value resolves;
5. secondary traits/provenance arrive after the primary value is readable.

Do not reveal all text, price and traits in the same frame.

### Appraisal/value
- meaningful value changes can count/tween rather than teleport;
- avoid long slot-machine number spinning;
- final value should settle cleanly and remain readable;
- rare/legendary value feedback can add a restrained halo, sweep or burst.

### Restoration
- input timing remains the mechanic; decoration must not alter hit timing;
- success/grade should have distinct but short feedback;
- perfect may use sparkle/light sweep;
- rough should read clearly without making the item look permanently destroyed when domain logic is non-destructive.

### Sale/reward/progression
- cash delta should visibly connect to bankroll change;
- collection/set unlocks deserve stronger feedback than ordinary quick sales;
- achievements/rewards should pop in, settle and get out of the way.

## Reduced motion

Motion is optional presentation, not required comprehension.

When reduced motion is active or `prefers-reduced-motion: reduce` is detected:
- remove parallax, camera shake and looping decorative motion;
- replace long movement with short fades/highlights;
- keep immediate press acknowledgment;
- do not hide important state changes behind animation-only cues;
- preserve identical gameplay timing and outcomes unless the animation is literally the mechanic.

## State-safety rules

Animation must never become the source of gameplay truth.

- Persist/save/economy changes happen through existing state boundaries.
- Tweens present state; they do not decide auction outcomes or values.
- Kill or replace stale tweens when rerendering a scene.
- Disable/gate input during non-interruptible transition windows.
- Avoid callbacks that can run after the scene has shut down.
- A skipped/cancelled/reduced animation must still land in the same valid gameplay state.
- Never make ad close, focus loss or browser pause count as a failed timing action.

## Performance budget

Auction Hunter is browser-first and must run on modest mobile hardware.

Prefer:
- Phaser tweens on transforms/alpha;
- a small number of reusable particles;
- preloaded textures;
- bounded glows/overlays;
- one dominant celebration effect at a time.

Avoid:
- many simultaneous full-screen alpha layers;
- expensive filters on every card;
- dozens of independent infinite tweens;
- large particle counts with long lifetimes;
- allocating new animation systems every frame;
- dependency-heavy animation libraries when Phaser already covers the need.

## Reusable motion system

If the same motion appears in 3+ places, extract a shared helper/token for:
- hover lift;
- press squash;
- card enter stagger;
- value pulse/count-up;
- reveal burst;
- glow/settle;
- reduced-motion decision.

Keep durations/easings centralized as the system matures so each scene does not invent its own motion dialect.

## Anti-AI / authored-motion rules

Avoid motion patterns that make generated visuals feel more synthetic:
- constant glitter everywhere;
- unrelated particles on every click;
- all cards bobbing continuously;
- overshooting every transition;
- excessive glow pulsing;
- identical canned animation on events of very different importance.

Commercial polish comes from restraint, hierarchy and consistent timing.

## QA loop

For material motion changes:
1. run typecheck/tests/build;
2. run browser QA;
3. verify mouse and touch paths;
4. verify rapid repeated input does not double-submit;
5. verify reduced-motion path;
6. inspect screenshots for resting-state quality;
7. when practical, manually watch the transition at normal speed and check that it communicates cause/effect.

## Completion checklist

- [ ] every animation has a communication/game-feel purpose;
- [ ] press response is immediate;
- [ ] important value/state changes do not simply teleport when motion would clarify them;
- [ ] motion hierarchy matches gameplay importance;
- [ ] no double-submit or stale tween callback path exists;
- [ ] reduced-motion behavior is safe;
- [ ] touch does not depend on hover;
- [ ] effects are bounded for mobile browser performance;
- [ ] gameplay/economy/save semantics are unchanged by presentation;
- [ ] browser QA still passes.

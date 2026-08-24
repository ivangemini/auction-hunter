# Restoration v0.4

## Purpose
Restoration is a short skill beat after appraisal, but it must create a decision rather than a mandatory click on every item.

The economy/formula source of truth is `src/domain/restoration.ts`. Phaser timing/presentation is isolated in `src/game/restorationUi.ts`; `AuctionScene` only owns the lot-level allowance and the transition back into reveal/disposition flow.

## Condition
Each generated find receives a condition score between 42% and 92%. Condition modifies appraisal through `0.4 + condition × 0.7`.

Condition bands:
- Poor: below 55%;
- Fair: 55–69%;
- Good: 70–85%;
- Excellent: 86%+.

## One attempt per lot
A won lot grants exactly one restoration attempt across all of its finds. Once used, later items show restoration as spent and cannot launch the mini-game.

This makes the first decision strategic: spend the attempt early on a damaged item, or save it in case a rarer/high-value find appears later.

The allowance resets only when a new lot is prepared. Opening the restoration screen and choosing a mode do not consume the attempt; stopping the timing marker does.

## Three restoration approaches
After choosing a find, the player chooses one of three approaches before the timing challenge:

| Mode | Target width | Marker speed | Perfect | Good | Rough |
| --- | ---: | ---: | ---: | ---: | ---: |
| Safe | 1.45× base | 1100 ms crossing | +16 condition points | +10 | +4 |
| Pro | 1.00× base | 900 ms crossing | +24 | +14 | +6 |
| Risky | 0.68× base | 720 ms crossing | +34 | +18 | +0 |

Rarer items still begin with narrower base targets, so rarity remains relevant in all three modes.

The modes create an explicit risk/upside choice:
- **Safe** protects consistency when the player mainly wants some improvement on a valuable copy.
- **Pro** preserves the original pre-v0.3 timing/reward profile and is the balanced default.
- **Risky** has the highest ceiling and the fastest/narrowest timing window, but a rough miss can spend the lot attempt for no value gain.

## P7 presentation contract
The restoration interaction uses a dedicated workbench presentation rather than generic dashboard panels.

Mode selection must expose the decision visually before the player commits:
- the current item remains the dominant physical object on the bench;
- condition and current appraisal remain visible throughout the decision;
- Safe/Pro/Risky use distinct accents, speed indicators and target-window previews;
- the perfect/good reward ceiling is visible on each mode card;
- the three cards may animate/hover, but only one mode callback can commit per rendered picker.

The timing stage keeps the mechanic unchanged while making its outcome zones legible:
- the item, condition and appraisal remain visible beside the timing control;
- the outer **Good** band and inner **Perfect** band are both rendered;
- the moving marker is the only timing input and the STOP action is visually dominant;
- STOP is guarded as a one-shot action so rapid touch/mouse input cannot spend the attempt twice;
- decorative motion respects reduced-motion settings and never changes marker duration, target width or grading.

The post-restoration appraisal remains the canonical disposition screen and shows the realized grade/value gain from the domain outcome. Presentation may celebrate the result, but formulas and persisted ownership stay outside `restorationUi.ts`.

## Player-trust guardrail
Restoration does not reduce condition or appraisal in this version. Even Risky can only produce zero uplift on a rough miss; it cannot damage or destroy an already valuable concrete copy.

That keeps the decision meaningful without turning a short browser mini-game, latency spike or touch imprecision into irreversible inventory loss. Negative restoration outcomes or consumables should only be considered after real telemetry proves the interaction is understandable and worth deepening.

## Visual QA
`scripts/capture-restoration-review.mjs` drives a real production build through lot selection, bidding, win, reveal and appraisal, then captures RU/EN mode-picker and timing-stage screenshots under `release/screenshots/review/`.

These four images are CI review artifacts only. They are intentionally separate from the eight Yandex submission screenshots so presentation QA can evolve without silently changing the store-listing screenshot contract.

## Analytics
`restoration_completed` includes the selected mode alongside grade, condition before/after and realized appraisal gain. This allows Safe/Pro/Risky adoption and outcome quality to be compared after launch without changing save schema.

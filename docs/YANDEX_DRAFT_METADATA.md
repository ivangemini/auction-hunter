# Yandex Games draft metadata

Ready-to-paste release copy for the current Auction Hunter v1 candidate. Source of truth for machine validation: `release/yandex-draft-metadata.json`.

Current field limits/specs were rechecked against the Yandex Games draft documentation on 2026-08-24. Before a later submission, re-check the live form because platform requirements can change.

Reference: https://yandex.com/dev/games/doc/en/console/add-new-game/draft

## Technical parameters

- Version: `1.0.0`
- Supported platforms: Desktop + Mobile
- Orientation: Landscape
- Archive: use the `auction-hunter-yandex` GitHub Actions artifact produced by `Yandex Release Archive`.
- Languages: Russian + English.

## Russian

### Title — 14 characters

Auction Hunter

### SEO description — 120 characters

Аукционы с тайными находками: читай подсказки, торгуйся с соперниками и превращай удачные покупки в коллекцию и прибыль.

### Short description — 55 characters

Оценивай риск, выигрывай лоты и собирай редкие находки.

### Description — 404 characters

Покупай загадочные гаражные, наследственные и коллекционные лоты на аукционах. Читай правдивые подсказки, следи за поведением соперников и решай, когда остановиться, чтобы не переплатить. После победы открывай находки, оценивай их состояние, выбирай предмет для реставрации, продавай ради оборота или оставляй в коллекции. Выполняй ежедневные контракты, закрывай наборы и развивай свой аукционный бизнес.

### How to play — 417 characters

Перед началом торгов изучи подсказки и, если доступно, закажи расширенную проверку лота. Во время аукциона повышай ставку кнопкой «Ставка» или нажми «Пас», если цена стала слишком высокой. После победы открывай предметы по одному, оценивай их, используй одну реставрацию на весь лот и решай, продать находку или оставить её в коллекции. Зарабатывай репутацию, открывай новые уровни аукционов и улучшай бизнес в Офисе.

## English

### Title — 14 characters

Auction Hunter

### SEO description — 141 characters

Mystery auctions with real clues: read the lot, outbid rivals wisely, uncover valuables and turn smart purchases into profit and collections.

### Short description — 61 characters

Read the clues, manage risk, win lots and uncover rare finds.

### Description — 438 characters

Buy mysterious garage, estate and collector lots at competitive auctions. Read truthful clues, watch rival behavior and decide when to stop before you overpay. After a win, reveal finds one by one, appraise their condition, choose one item to restore, then sell for cash or keep it for collection sets. Complete daily contracts, earn reputation, unlock higher auction tiers and grow your dealer business through permanent Office upgrades.

### How to play — 440 characters

Before bidding, study the visible clues and use Advanced Inspection when it is unlocked and worth the fee. During the auction, press Bid to raise the price or Pass when the risk is too high. After winning, reveal and appraise each item, spend the lot’s single restoration attempt carefully, then choose Sell or Keep. Build reputation to unlock stronger auction tiers, complete collection sets and invest profits into upgrades in the Office.

## Visual material requirements

### Required icon
- 512 × 512 px.
- PNG.
- Do not use a raw gameplay screenshot as the icon.
- Keep any important subject inside the central mask-safe area if the same composition will be reused for a maskable icon.

### Required cover
- 800 × 470 px.
- PNG.
- Do not submit a raw gameplay screenshot as the cover.
- Name/branding shown on the cover, if any, must use `Auction Hunter` exactly and must be localized consistently with the selected draft language.

### Optional hero image
- 1560 × 520 px.
- PNG or JPG.

### Required screenshots
For each selected platform, upload at least two screenshots.

- Landscape: 16:9.
- Long side: 1280–2560 px.
- JPEG or 24-bit PNG.
- Desktop screenshots must be landscape.
- Auction Hunter declares landscape on mobile, so mobile screenshots should also be landscape.

Recommended screenshot set:
1. Lot lobby showing truthful clues, lot art and a visible rare modifier or Advanced Inspection control.
2. Active bidding showing current price, NPC bidder tells and the Bid/Pass decision.
3. Reveal/appraisal/restoration moment with a high-rarity find.
4. Collection Book or Office showing sets, contracts, achievements and business progression.

For initial submission, capture at least two clean desktop frames and two clean landscape-mobile frames from the real Yandex Draft candidate. Do not fabricate screenshots from mock UI.

## Manual console checks before submit

- Verify `Auction Hunter` is still unique in the Yandex Games catalog; search-engine results are not authoritative for catalog uniqueness.
- Select the closest available categories/tags that describe auction, collecting and casual simulation gameplay; do not use unrelated high-traffic tags.
- Confirm the age rating matches the actual non-violent content.
- Set the exact declared platform/orientation values above.
- Upload the current release-candidate ZIP, not an older local build.
- Add the real Yandex Metrica counter ID to the GitHub Actions variable `YANDEX_METRICA_ID` before the final telemetry-enabled archive build if custom telemetry is desired at launch.
- Run `docs/QA.md`, `docs/MODERATION.md` and `docs/CONTENT_DURATION.md` against the actual Draft before submitting for moderation.

## Automated guard

`node scripts/validate-yandex-draft.mjs` validates the current text limits, title casing/consistency, non-duplication basics and visual specification constants. CI and the release archive workflow both run it before build/release gates.

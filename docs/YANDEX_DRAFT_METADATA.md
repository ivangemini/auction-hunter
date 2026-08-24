# Yandex Games draft metadata

Ready-to-paste release copy for the current Auction Hunter v1 candidate. Source of truth for machine validation: `release/yandex-draft-metadata.json`.

Current field limits/specs were rechecked against the Yandex Games draft documentation on 2026-08-24. Before a later submission, re-check the live form because platform requirements can change.

Reference: https://yandex.com/dev/games/doc/en/console/add-new-game/draft

## Technical parameters

- Version: `1.0.0`
- Supported platforms: Desktop + Mobile
- Orientation: Landscape
- Languages: Russian + English.
- Preferred release artifact: `auction-hunter-yandex-submission` from `Yandex Release Archive`.
- The unified submission ZIP contains the actual game archive, catalog icon/cover, RU/EN desktop/mobile screenshots, this metadata and SHA-256 manifests.
- If only the playable archive is needed, use `game/auction-hunter-yandex.zip` from inside the submission bundle or the standalone `auction-hunter-yandex` artifact.

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

## Promotional art

The catalog icon and cover are generated deterministically from reviewed SVG sources:

- `release/promotional/icon.svg` → `promotional/icon.png` at exactly 512×512.
- `release/promotional/cover.svg` → `promotional/cover.png` at exactly 800×470.
- `node scripts/render-yandex-promos.mjs` renders and validates both PNGs after Playwright Chromium is installed.

The icon contains no text. The cover is language-neutral except for the exact proper-name brand `Auction Hunter`, so the same composition can be used for RU and EN without an English-only slogan. Promotional art is authored artwork, not a raw gameplay screenshot.

### Required icon
- 512 × 512 px.
- PNG.
- Do not use a raw gameplay screenshot as the icon.
- Keep any important subject inside the central mask-safe area if the same composition will be reused for a maskable icon.

### Required cover
- 800 × 470 px.
- PNG.
- Do not submit a raw gameplay screenshot as the cover.
- Name/branding shown on the cover uses `Auction Hunter` exactly.

### Optional hero image
- 1560 × 520 px.
- PNG or JPG.

## Gameplay screenshots

`node scripts/capture-yandex-screenshots.mjs` captures eight 1280×720 PNG candidates from the real production build. It uses the existing save boundary, the same Yandex locale path as Draft, real Phaser controls and a real Garage auction win/reveal/appraisal flow. It also samples lot/item art regions so visually blank production textures fail CI.

The bundle contains:

- `screenshots/ru/desktop/01-lot-lobby.png`
- `screenshots/ru/desktop/02-active-bidding.png`
- `screenshots/ru/mobile/01-appraised-find.png`
- `screenshots/ru/mobile/02-office-progression.png`
- the same four paths under `screenshots/en/`.

These satisfy the automated 16:9/1280×720 candidate requirement. Before submission, still inspect the images from the exact final release candidate and replace a frame only if the real Yandex Draft renders materially differently.

## Submission bundle

`node scripts/build-yandex-submission.mjs` assembles the release materials into one tree:

- `game/auction-hunter-yandex.zip`
- `promotional/icon.png`
- `promotional/cover.png`
- 8 localized screenshots
- `metadata/yandex-draft-metadata.json`
- `metadata/YANDEX_DRAFT_METADATA.md`
- `submission-manifest.json`
- `SHA256SUMS.txt`

`submission-manifest.json` records the release version, source commit and SHA-256/byte size for every copied release file. `SHA256SUMS.txt` is a simple checksum list for manual verification.

## Manual console checks before submit

- Verify `Auction Hunter` is still unique in the Yandex Games catalog; search-engine results are not authoritative for catalog uniqueness.
- Select the closest available categories/tags that describe auction, collecting and casual simulation gameplay; do not use unrelated high-traffic tags.
- Confirm the age rating matches the actual non-violent content.
- Set Desktop + Mobile and Landscape exactly as declared above.
- Upload `game/auction-hunter-yandex.zip` from the current unified submission bundle, not an older local build.
- Upload `promotional/icon.png`, `promotional/cover.png` and the localized screenshots from the same bundle.
- Add the real Yandex Metrica counter ID to the GitHub Actions variable `YANDEX_METRICA_ID` before the final telemetry-enabled archive build if custom telemetry is desired at launch.
- Run `docs/QA.md`, `docs/MODERATION.md` and `docs/CONTENT_DURATION.md` against the actual Yandex Draft before submitting for moderation.

## Automated guards

The release pipeline runs:

- `validate-yandex-draft.mjs` — field lengths, title casing/consistency and visual spec constants.
- typecheck + unit tests + production build + browser QA.
- `render-yandex-promos.mjs` — promo text policy and exact PNG dimensions.
- `capture-yandex-screenshots.mjs` — production gameplay screenshots and non-blank art validation.
- `validate-yandex-archive.mjs` — archive root/path/size/SDK/title checks.
- `build-yandex-submission.mjs` — exact file-count/structure checks and SHA-256 manifest generation.

Automated gates reduce moderation risk but do not replace final checks inside the actual Yandex Draft.

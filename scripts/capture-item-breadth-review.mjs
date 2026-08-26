import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(root, 'release', 'screenshots', 'item-breadth-review');
const debugRoot = path.join(root, 'release', 'screenshots', 'debug');
const previewUrl = 'http://127.0.0.1:4181';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const SAVE_KEY = 'auction-hunter.save.v1';
const EXPECTED_COLLECTION_PAGES = 9;
const PAGE_ADVANCE_MIN_RATIO = 0.004;
const TERMINAL_MAX_RATIO = 0.003;

const REVIEW_WAVES = [
  {
    file: '01-item-art-breadth.png',
    title: 'P5 + P9 · Expansion Item Art',
    meta: '12 DIRECT IDS · 512×360 SVG · NO FALLBACKS',
    items: [
      'slide-projector', 'watchmaker-tools', 'field-compass', 'tin-airplane', 'mantel-clock', 'numbered-lithograph',
      'archivist-loupe', 'microfilm-reader', 'wax-seal-box', 'auctioneers-ledger', 'brass-cipher-wheel', 'expedition-camera',
    ],
  },
  {
    file: '02-p9-second-item-wave.png',
    title: 'P9 · Investigation & Expedition Finds',
    meta: '6 DIRECT IDS · SECOND CAMPAIGN BATCH',
    items: ['field-recorder', 'postal-scale', 'negative-album', 'brass-map-case', 'surveyor-transit', 'lacquer-document-case'],
  },
  {
    file: '03-p9-third-item-wave.png',
    title: 'P9 · Records & Communications Finds',
    meta: '6 DIRECT IDS · THIRD CAMPAIGN BATCH',
    items: ['telegraph-key', 'survey-notebook', 'stamp-press', 'plate-camera', 'coded-postcard-album', 'portable-duplicator'],
  },
  {
    file: '04-p9-fourth-item-wave.png',
    title: 'P9 · Border Archive Finds',
    meta: '6 DIRECT IDS · FOURTH CAMPAIGN BATCH',
    items: ['archive-card-index', 'brass-letter-opener', 'folding-field-lamp', 'customs-stamp-book', 'wire-photo-transmitter', 'locksmith-gauge-set'],
  },
  {
    file: '05-p9-fifth-item-wave.png',
    title: 'P9 · Clearance & Dispatch Finds',
    meta: '6 DIRECT IDS · FINAL 72-ITEM TARGET',
    items: ['estate-key-register', 'cipher-tape-reader', 'brass-seal-calipers', 'river-signal-lantern', 'consignment-token-board', 'railway-chronometer'],
  },
];

const NEW_ITEMS = REVIEW_WAVES.flatMap((wave) => wave.items);
const seedSave = {
  version: 1,
  updatedAt: 1,
  cash: 125000,
  collection: [...NEW_ITEMS, 'film-camera', 'gallery-print', 'fountain-pen'],
  collectionItems: [],
  claimedSetRewards: [],
  reputationXp: 920,
  lastDailyCompletedDay: null,
  onboardingComplete: true,
  auctionsWon: 30,
  auctionsPlayed: 44,
  lifetimeSales: 88400,
  highestCash: 125000,
  contractDayKey: null,
  contractProgress: {},
  claimedContractRewards: [],
  claimedAchievements: [],
  businessUpgrades: { warehouse: 2, contractsDesk: 1, showroom: 2 },
  auctionHistory: [],
  buyerMarketDayKey: null,
  claimedBuyerOfferIds: [],
  discoveryChainProgress: {},
  discoveryChainLastAuction: {},
  completedDiscoveryChains: [],
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

async function waitForPreview() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(previewUrl);
      if (response.ok) return;
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('Timed out waiting for item-breadth review preview server');
}

async function stopPreview(preview) {
  if (preview.exitCode !== null || preview.signalCode) return;
  const closed = new Promise((resolve) => preview.once('close', resolve));
  preview.kill('SIGTERM');
  const graceful = await Promise.race([
    closed.then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 2_000)),
  ]);
  if (!graceful && preview.exitCode === null) {
    preview.kill('SIGKILL');
    await Promise.race([closed, new Promise((resolve) => setTimeout(resolve, 1_000))]);
  }
}

function validatePng(buffer, name) {
  assert(buffer.length > 60_000, `${name} looks unexpectedly small (${buffer.length} bytes)`);
  assert(buffer.subarray(12, 16).toString('ascii') === 'IHDR', `${name} is not a PNG`);
  assert(buffer.readUInt32BE(16) === 1280 && buffer.readUInt32BE(20) === 720, `${name} must be 1280x720`);
}

async function imageDifferenceRatio(page, before, after) {
  return page.evaluate(async ({ beforeBase64, afterBase64 }) => {
    const decode = async (base64) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Unable to create breadth-review analysis canvas');
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, image.width, image.height).data;
    };
    const left = await decode(beforeBase64);
    const right = await decode(afterBase64);
    let changed = 0;
    let sampled = 0;
    for (let index = 0; index < left.length; index += 64) {
      const delta = Math.abs(left[index] - right[index])
        + Math.abs(left[index + 1] - right[index + 1])
        + Math.abs(left[index + 2] - right[index + 2]);
      sampled += 1;
      if (delta > 42) changed += 1;
    }
    return sampled > 0 ? changed / sampled : 0;
  }, { beforeBase64: before.toString('base64'), afterBase64: after.toString('base64') });
}

async function validateSources() {
  assert(NEW_ITEMS.length === 36, `Expected 36 breadth identities, got ${NEW_ITEMS.length}`);
  assert(new Set(NEW_ITEMS).size === NEW_ITEMS.length, 'Breadth review contains duplicate semantic item IDs');
  for (const id of NEW_ITEMS) {
    const response = await fetch(`${previewUrl}/assets/items/${id}.svg`);
    assert(response.ok, `${id} returned HTTP ${response.status}`);
    const source = await response.text();
    assert(/viewBox=["']\s*0\s+0\s+512\s+360\s*["']/i.test(source), `${id} must use 512x360 viewBox`);
    assert(!/<text\b/i.test(source), `${id} must not embed pseudo-text`);
  }
}

function displayName(id) {
  return id.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
}

async function captureArtSheet(browser, wave) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const columns = wave.items.length <= 6 ? 3 : 4;
  const rows = Math.ceil(wave.items.length / columns);
  const cards = wave.items.map((id, index) => `
    <article class="card">
      <div class="rank">${String(index + 1).padStart(2, '0')}</div>
      <img src="${previewUrl}/assets/items/${id}.svg" alt="${id}">
      <div class="name">${displayName(id)}</div>
    </article>
  `).join('');
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;width:1280px;height:720px;overflow:hidden;background:#0b0e13;color:#f7f3e8;font-family:Arial,sans-serif}
    main{width:1280px;height:720px;padding:26px 32px;background:radial-gradient(circle at 50% 18%,#1b2028 0,#0b0e13 62%)}
    header{height:58px;border-bottom:1px solid rgba(233,185,73,.24);display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
    h1{font-size:23px;margin:0}.meta{font-size:11px;color:#8f98a4;font-weight:700;letter-spacing:.08em}
    .grid{display:grid;grid-template-columns:repeat(${columns},1fr);grid-template-rows:repeat(${rows},1fr);gap:11px;height:588px;max-width:${wave.items.length <= 6 ? '930px' : '1216px'};margin:${wave.items.length <= 6 ? '0 auto' : '0'}}
    .card{position:relative;border:1px solid rgba(233,185,73,.22);background:linear-gradient(145deg,rgba(24,29,36,.98),rgba(12,16,22,.98));overflow:hidden;box-shadow:0 7px 16px rgba(0,0,0,.32)}
    img{width:100%;height:calc(100% - 31px);object-fit:contain;padding:5px 17px 0}.rank{position:absolute;top:7px;left:8px;z-index:2;padding:4px 7px;border:1px solid rgba(233,185,73,.32);background:rgba(18,22,28,.86);color:#d8a94e;font-size:9px;font-weight:700}
    .name{position:absolute;bottom:0;left:0;right:0;height:31px;padding:8px 10px 0;background:rgba(5,8,12,.88);border-top:1px solid rgba(255,255,255,.06);font-size:10px;font-weight:700}
  </style></head><body><main><header><h1>${wave.title}</h1><div class="meta">${wave.meta}</div></header><section class="grid">${cards}</section></main></body></html>`, { waitUntil: 'load' });
  await page.waitForFunction((count) => [...document.images].length === count && [...document.images].every((image) => image.complete && image.naturalWidth > 0), wave.items.length);
  const screenshot = await page.screenshot({ type: 'png' });
  validatePng(screenshot, wave.file);
  fs.writeFileSync(path.join(outputRoot, wave.file), screenshot);
  await page.close();
}

async function clickGame(page, gameX, gameY) {
  const box = await page.locator('canvas').boundingBox();
  assert(box, 'Game canvas has no bounding box');
  await page.mouse.click(box.x + (gameX / GAME_WIDTH) * box.width, box.y + (gameY / GAME_HEIGHT) * box.height);
}

function writeTransitionDebug(localeCode, label, before, after) {
  ensureDirectory(debugRoot);
  fs.writeFileSync(path.join(debugRoot, `breadth-${localeCode}-${label}-before.png`), before);
  fs.writeFileSync(path.join(debugRoot, `breadth-${localeCode}-${label}-after.png`), after);
}

async function captureCollectionLocale(browser, localeCode, locale) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, locale, deviceScaleFactor: 1 });
  try {
    const page = await context.newPage();
    await page.addInitScript(({ key, save, lang }) => {
      window.YaGames = {
        init: async () => ({
          environment: { i18n: { lang } },
          features: { LoadingAPI: { ready() {} }, GameplayAPI: { start() {}, stop() {} } },
        }),
      };
      localStorage.setItem(key, JSON.stringify(save));
    }, { key: SAVE_KEY, save: seedSave, lang: localeCode });
    await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });
    await page.locator('canvas').waitFor({ state: 'visible' });
    await page.waitForTimeout(850);
    await clickGame(page, 1000, 112);
    await page.waitForTimeout(650);

    let current = await page.screenshot({ type: 'png' });
    validatePng(current, `${localeCode} Collection Book page 1`);
    for (let pageNumber = 2; pageNumber <= EXPECTED_COLLECTION_PAGES; pageNumber += 1) {
      await clickGame(page, 735, 674);
      await page.waitForTimeout(420);
      const next = await page.screenshot({ type: 'png' });
      validatePng(next, `${localeCode} Collection Book page ${pageNumber}`);
      const pageAdvance = await imageDifferenceRatio(page, current, next);
      if (pageAdvance <= PAGE_ADVANCE_MIN_RATIO) {
        writeTransitionDebug(localeCode, `page-${pageNumber}`, current, next);
        throw new Error(`${localeCode} did not visibly advance to Collection Book page ${pageNumber} (${pageAdvance.toFixed(3)})`);
      }
      current = next;
    }

    await clickGame(page, 735, 674);
    await page.waitForTimeout(420);
    const finalRepeat = await page.screenshot({ type: 'png' });
    const finalDifference = await imageDifferenceRatio(page, current, finalRepeat);
    if (finalDifference >= TERMINAL_MAX_RATIO) {
      writeTransitionDebug(localeCode, 'terminal', current, finalRepeat);
      throw new Error(`${localeCode} Collection Book page ${EXPECTED_COLLECTION_PAGES} is not terminal (${finalDifference.toFixed(3)})`);
    }

    const localeDir = path.join(outputRoot, localeCode);
    ensureDirectory(localeDir);
    fs.writeFileSync(path.join(localeDir, `06-collection-page-${EXPECTED_COLLECTION_PAGES}.png`), current);
    await page.close();
  } finally {
    await context.close();
  }
}

fs.rmSync(outputRoot, { recursive: true, force: true });
ensureDirectory(outputRoot);
const preview = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4181'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env },
});
let previewLog = '';
preview.stdout.on('data', (chunk) => { previewLog += chunk.toString(); });
preview.stderr.on('data', (chunk) => { previewLog += chunk.toString(); });

try {
  await waitForPreview();
  await validateSources();
  const browser = await chromium.launch({ headless: true });
  try {
    for (const wave of REVIEW_WAVES) await captureArtSheet(browser, wave);
    await captureCollectionLocale(browser, 'ru', 'ru-RU');
    await captureCollectionLocale(browser, 'en', 'en-US');
  } finally {
    await browser.close();
  }
} catch (error) {
  console.error(previewLog);
  throw error;
} finally {
  await stopPreview(preview);
}

for (const wave of REVIEW_WAVES) console.log(`release/screenshots/item-breadth-review/${wave.file}`);
console.log(`release/screenshots/item-breadth-review/ru/06-collection-page-${EXPECTED_COLLECTION_PAGES}.png`);
console.log(`release/screenshots/item-breadth-review/en/06-collection-page-${EXPECTED_COLLECTION_PAGES}.png`);
console.log('P5 + P9 item/Collection Book visual review capture OK');

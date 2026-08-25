import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(root, 'release', 'screenshots', 'item-breadth-review');
const previewUrl = 'http://127.0.0.1:4181';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const SAVE_KEY = 'auction-hunter.save.v1';

const FINAL_WAVE_ITEMS = [
  'desktop-transceiver', 'vacuum-tube-tester',
  'precision-calipers', 'woodworking-plane',
  'expedition-medal', 'cameo-locket',
  'tin-spaceship', 'mechanical-carousel',
  'pilot-watch', 'marine-chronometer',
  'bronze-maquette', 'woodblock-print',
];

const seedSave = {
  version: 1,
  updatedAt: 1,
  cash: 125000,
  collection: [...FINAL_WAVE_ITEMS],
  collectionItems: [],
  claimedSetRewards: [],
  reputationXp: 720,
  lastDailyCompletedDay: null,
  onboardingComplete: true,
  auctionsWon: 24,
  auctionsPlayed: 34,
  lifetimeSales: 68400,
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
  for (const id of FINAL_WAVE_ITEMS) {
    const response = await fetch(`${previewUrl}/assets/items/${id}.svg`);
    assert(response.ok, `${id} returned HTTP ${response.status}`);
    const source = await response.text();
    assert(/viewBox=["']\s*0\s+0\s+512\s+360\s*["']/i.test(source), `${id} must use 512x360 viewBox`);
    assert(!/<text\b/i.test(source), `${id} must not embed pseudo-text`);
  }
}

async function captureArtSheet(browser, items, batchIndex) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const cards = items.map((id, index) => `
    <article class="card">
      <div class="rank">${String(batchIndex * 6 + index + 1).padStart(2, '0')}</div>
      <img src="${previewUrl}/assets/items/${id}.svg" alt="${id}">
      <div class="name">${id.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ')}</div>
    </article>
  `).join('');
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;width:1280px;height:720px;overflow:hidden;background:#0b0e13;color:#f7f3e8;font-family:Arial,sans-serif}
    main{width:1280px;height:720px;padding:30px 38px;background:radial-gradient(circle at 50% 20%,#1b2028 0,#0b0e13 60%)}
    header{height:68px;border-bottom:1px solid rgba(233,185,73,.24);display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
    h1{font-size:26px;margin:0}.meta{font-size:12px;color:#8f98a4;font-weight:700;letter-spacing:.08em}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:16px;height:564px}
    .card{position:relative;border:1px solid rgba(233,185,73,.24);background:linear-gradient(145deg,rgba(24,29,36,.98),rgba(12,16,22,.98));overflow:hidden;box-shadow:0 8px 18px rgba(0,0,0,.34)}
    img{width:100%;height:calc(100% - 38px);object-fit:contain;padding:8px 28px 0}.rank{position:absolute;top:10px;left:11px;z-index:2;padding:6px 9px;border:1px solid rgba(233,185,73,.32);background:rgba(18,22,28,.86);color:#d8a94e;font-size:10px;font-weight:700}
    .name{position:absolute;bottom:0;left:0;right:0;height:38px;padding:11px 14px 0;background:rgba(5,8,12,.86);border-top:1px solid rgba(255,255,255,.06);font-size:12px;font-weight:700}
  </style></head><body><main><header><h1>P5 · 60→72 Item Art</h1><div class="meta">BATCH ${batchIndex + 1}/2 · DIRECT 512×360 SVG</div></header><section class="grid">${cards}</section></main></body></html>`, { waitUntil: 'load' });
  await page.waitForFunction((count) => [...document.images].length === count && [...document.images].every((image) => image.complete && image.naturalWidth > 0), items.length);
  const screenshot = await page.screenshot({ type: 'png' });
  validatePng(screenshot, `final item art batch ${batchIndex + 1}`);
  fs.writeFileSync(path.join(outputRoot, `01-item-art-breadth-${batchIndex + 1}.png`), screenshot);
  await page.close();
}

async function clickGame(page, gameX, gameY) {
  const box = await page.locator('canvas').boundingBox();
  assert(box, 'Game canvas has no bounding box');
  await page.mouse.click(box.x + (gameX / GAME_WIDTH) * box.width, box.y + (gameY / GAME_HEIGHT) * box.height);
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

    for (let pageIndex = 1; pageIndex < 8; pageIndex += 1) {
      await clickGame(page, 735, 674);
      await page.waitForTimeout(220);
    }
    const pageEight = await page.screenshot({ type: 'png' });
    await clickGame(page, 735, 674);
    await page.waitForTimeout(280);
    const pageNine = await page.screenshot({ type: 'png' });
    validatePng(pageNine, `${localeCode} Collection Book page 9`);
    const pageAdvance = await imageDifferenceRatio(page, pageEight, pageNine);
    assert(pageAdvance > 0.02, `${localeCode} did not visibly advance from page 8 to 9 (${pageAdvance.toFixed(3)})`);

    await clickGame(page, 735, 674);
    await page.waitForTimeout(280);
    const finalRepeat = await page.screenshot({ type: 'png' });
    const finalDifference = await imageDifferenceRatio(page, pageNine, finalRepeat);
    assert(finalDifference < 0.012, `${localeCode} Collection Book page 9 is not terminal (${finalDifference.toFixed(3)})`);

    const localeDir = path.join(outputRoot, localeCode);
    ensureDirectory(localeDir);
    fs.writeFileSync(path.join(localeDir, '02-collection-page-9.png'), pageNine);
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
    for (let batchIndex = 0; batchIndex < 2; batchIndex += 1) {
      await captureArtSheet(browser, FINAL_WAVE_ITEMS.slice(batchIndex * 6, batchIndex * 6 + 6), batchIndex);
    }
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

for (let batchIndex = 1; batchIndex <= 2; batchIndex += 1) {
  console.log(`release/screenshots/item-breadth-review/01-item-art-breadth-${batchIndex}.png`);
}
console.log('release/screenshots/item-breadth-review/ru/02-collection-page-9.png');
console.log('release/screenshots/item-breadth-review/en/02-collection-page-9.png');
console.log('P5 60→72 item/Collection Book visual review capture OK');

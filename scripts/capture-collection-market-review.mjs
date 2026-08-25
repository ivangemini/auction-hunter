import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reviewRoot = path.join(root, 'release', 'screenshots', 'collection-market-review');
const previewUrl = 'http://127.0.0.1:4178';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const SAVE_KEY = 'auction-hunter.save.v1';

const REVIEW_COLLECTION = [
  'toolbox', 'toy-robot', 'film-camera', 'pocket-watch', 'porcelain-figurine', 'arcade-handheld',
  'clockwork-automaton', 'art-deco-lamp', 'master-study', 'cassette-player', 'vinyl-box', 'brass-clock',
  'telescope', 'signed-poster', 'silver-ring', 'mini-console', 'chronograph-watch', 'first-edition-book',
];

const seedSave = {
  version: 1,
  updatedAt: 1,
  cash: 125000,
  collection: REVIEW_COLLECTION,
  collectionItems: [{
    id: 'review-film-camera-copy', itemId: 'film-camera', appraisedValue: 1260,
    condition: 0.88, restored: false, traitIds: ['factory-sealed', 'matching-serials'], acquiredAt: 1,
  }],
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
  discoveryChainProgress: { 'watchmaker-ledger': 1, 'prototype-trail': 2, 'lost-master-study': 3 },
  discoveryChainLastAuction: { 'watchmaker-ledger': 31, 'prototype-trail': 32, 'lost-master-study': 33 },
  completedDiscoveryChains: ['lost-master-study'],
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
  throw new Error('Timed out waiting for Collection/Discovery/Buyer Market review preview server');
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

async function clickGame(page, gameX, gameY) {
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  assert(box, 'Game canvas has no bounding box');
  await page.mouse.click(box.x + (gameX / GAME_WIDTH) * box.width, box.y + (gameY / GAME_HEIGHT) * box.height);
}

async function installSeed(page, platformLocale) {
  await page.addInitScript(({ key, save, lang }) => {
    window.YaGames = {
      init: async () => ({
        environment: { i18n: { lang } },
        features: { LoadingAPI: { ready() {} }, GameplayAPI: { start() {}, stop() {} } },
      }),
    };
    localStorage.setItem(key, JSON.stringify(save));
  }, { key: SAVE_KEY, save: seedSave, lang: platformLocale });
}

async function bootPage(context, platformLocale) {
  const page = await context.newPage();
  await installSeed(page, platformLocale);
  await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(850);
  return page;
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
      if (!context) throw new Error('Unable to create visual-review analysis canvas');
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

async function captureLocale(browser, localeCode, locale) {
  const outputDir = path.join(reviewRoot, localeCode);
  ensureDirectory(outputDir);
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, locale, deviceScaleFactor: 1 });

  try {
    const page = await bootPage(context, localeCode);
    await clickGame(page, 1000, 112);
    await page.waitForTimeout(720);
    const collection = await page.screenshot({ type: 'png' });
    validatePng(collection, `${localeCode} Collection Book`);
    fs.writeFileSync(path.join(outputDir, '01-collection-book.png'), collection);

    await clickGame(page, 190, 324);
    await page.waitForTimeout(420);
    const copyTraits = await page.screenshot({ type: 'png' });
    validatePng(copyTraits, `${localeCode} concrete copy trait modal`);
    fs.writeFileSync(path.join(outputDir, '02-copy-traits.png'), copyTraits);
    assert((await imageDifferenceRatio(page, collection, copyTraits)) > 0.12, `${localeCode} concrete copy modal did not visibly open`);

    await clickGame(page, 80, 120);
    await page.waitForTimeout(320);

    // 36 sets at four cards per page must expose a real ninth page.
    for (let pageIndex = 1; pageIndex < 9; pageIndex += 1) {
      await clickGame(page, 735, 674);
      await page.waitForTimeout(240);
    }
    const collectionLastPage = await page.screenshot({ type: 'png' });
    validatePng(collectionLastPage, `${localeCode} Collection Book final page`);
    fs.writeFileSync(path.join(outputDir, '03-collection-last-page.png'), collectionLastPage);
    assert((await imageDifferenceRatio(page, collection, collectionLastPage)) > 0.08, `${localeCode} Collection Book pager did not visibly reach the final page`);

    await clickGame(page, 646, 70);
    await page.waitForTimeout(720);
    const discovery = await page.screenshot({ type: 'png' });
    validatePng(discovery, `${localeCode} Discovery Board`);
    fs.writeFileSync(path.join(outputDir, '04-discovery-board.png'), discovery);
    const discoveryDifference = await imageDifferenceRatio(page, collection, discovery);
    assert(discoveryDifference > 0.18, `${localeCode} Discovery Board did not visibly replace Collection Book (${discoveryDifference.toFixed(3)})`);

    await clickGame(page, 1020, 72);
    await page.waitForTimeout(520);
    await clickGame(page, 817, 70);
    await page.waitForTimeout(720);
    const market = await page.screenshot({ type: 'png' });
    validatePng(market, `${localeCode} Buyer Market`);
    fs.writeFileSync(path.join(outputDir, '05-buyer-market.png'), market);
    const marketDifference = await imageDifferenceRatio(page, collection, market);
    assert(marketDifference > 0.22, `${localeCode} Buyer Market did not visibly replace Collection Book (${marketDifference.toFixed(3)})`);

    await page.close();
  } finally {
    await context.close();
  }
}

fs.rmSync(reviewRoot, { recursive: true, force: true });
ensureDirectory(reviewRoot);

const preview = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4178'], {
  cwd: root, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env },
});
let previewLog = '';
preview.stdout.on('data', (chunk) => { previewLog += chunk.toString(); });
preview.stderr.on('data', (chunk) => { previewLog += chunk.toString(); });

try {
  await waitForPreview();
  const browser = await chromium.launch({ headless: true });
  try {
    await captureLocale(browser, 'ru', 'ru-RU');
    await captureLocale(browser, 'en', 'en-US');
  } finally {
    await browser.close();
  }
} catch (error) {
  console.error(previewLog);
  throw error;
} finally {
  await stopPreview(preview);
}

for (const locale of ['ru', 'en']) {
  for (const file of ['01-collection-book.png', '02-copy-traits.png', '03-collection-last-page.png', '04-discovery-board.png', '05-buyer-market.png']) {
    console.log(path.relative(root, path.join(reviewRoot, locale, file)).split(path.sep).join('/'));
  }
}
console.log('P7 Collection/copy-traits/page-9/Discovery/Buyer Market visual review capture OK');

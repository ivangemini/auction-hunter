import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reviewRoot = path.join(root, 'release', 'screenshots', 'mobile-landscape-review');
const previewUrl = 'http://127.0.0.1:4181';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const VIEWPORT_WIDTH = 844;
const VIEWPORT_HEIGHT = 390;
const SAVE_KEY = 'auction-hunter.save.v1';

const seedSave = {
  version: 1,
  updatedAt: 1,
  cash: 125000,
  collection: [
    'toolbox',
    'toy-robot',
    'film-camera',
    'pocket-watch',
    'porcelain-figurine',
    'arcade-handheld',
    'clockwork-automaton',
    'art-deco-lamp',
    'master-study',
    'cassette-player',
    'vinyl-box',
    'brass-clock',
  ],
  claimedSetRewards: ['garage-starters'],
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
  discoveryChainProgress: {
    'watchmaker-ledger': 1,
    'prototype-trail': 2,
    'lost-master-study': 3,
  },
  discoveryChainLastAuction: {
    'watchmaker-ledger': 31,
    'prototype-trail': 32,
    'lost-master-study': 33,
  },
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
  throw new Error('Timed out waiting for compact mobile-landscape review preview server');
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
  const pageX = box.x + (gameX / GAME_WIDTH) * box.width;
  const pageY = box.y + (gameY / GAME_HEIGHT) * box.height;
  await page.touchscreen.tap(pageX, pageY);
}

async function installSeed(page, platformLocale) {
  await page.addInitScript(({ key, save, lang }) => {
    window.YaGames = {
      init: async () => ({
        environment: { i18n: { lang } },
        features: {
          LoadingAPI: { ready() {} },
          GameplayAPI: { start() {}, stop() {} },
        },
      }),
    };
    localStorage.setItem(key, JSON.stringify(save));
    window.__auctionHunterMobileReviewEvents = [];
    window.addEventListener('auction-hunter:analytics', (event) => {
      window.__auctionHunterMobileReviewEvents.push(event.detail);
    });
  }, { key: SAVE_KEY, save: seedSave, lang: platformLocale });
}

async function bootPage(context, platformLocale) {
  const page = await context.newPage();
  await installSeed(page, platformLocale);
  await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(700);
  await assertCompactLandscapeFrame(page);
  return page;
}

async function assertCompactLandscapeFrame(page) {
  const guardDisplay = await page.locator('#orientation-guard').evaluate((element) => getComputedStyle(element).display);
  assert(guardDisplay === 'none', `Orientation guard should be hidden in landscape, got ${guardDisplay}`);

  const box = await page.locator('canvas').boundingBox();
  assert(box, 'Compact mobile review canvas has no bounding box');
  assert(box.height >= VIEWPORT_HEIGHT * 0.98, `Canvas should fill compact landscape height (${box.height.toFixed(1)}px)`);
  assert(box.width >= 680 && box.width <= VIEWPORT_WIDTH, `Canvas width is unexpected for 16:9 FIT (${box.width.toFixed(1)}px)`);
  const ratio = box.width / box.height;
  assert(Math.abs(ratio - GAME_WIDTH / GAME_HEIGHT) < 0.02, `Canvas aspect ratio drifted to ${ratio.toFixed(3)}`);
}

async function eventCount(page, eventName) {
  return page.evaluate((name) => (
    window.__auctionHunterMobileReviewEvents?.filter((event) => event?.eventName === name).length ?? 0
  ), eventName);
}

async function waitForEventCount(page, eventName, minimum, timeoutMs = 2_500) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await eventCount(page, eventName)) >= minimum) return;
    await page.waitForTimeout(50);
  }
  throw new Error(`Timed out waiting for ${eventName} count >= ${minimum}`);
}

async function chooseGarageLotAndStartAuction(page) {
  const tiersBefore = await eventCount(page, 'tier_selected');
  await clickGame(page, 250, 151);
  await waitForEventCount(page, 'tier_selected', tiersBefore + 1);

  const selectionsBefore = await eventCount(page, 'lot_option_selected');
  await clickGame(page, 240, 625);
  await waitForEventCount(page, 'lot_option_selected', selectionsBefore + 1);

  const startsBefore = await eventCount(page, 'auction_started');
  await clickGame(page, 1038, 620);
  await waitForEventCount(page, 'auction_started', startsBefore + 1);
  await page.waitForTimeout(260);
}

function validatePng(buffer, name) {
  assert(buffer.length > 12_000, `${name} looks unexpectedly small (${buffer.length} bytes)`);
  assert(buffer.subarray(12, 16).toString('ascii') === 'IHDR', `${name} is not a PNG`);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  assert(width === VIEWPORT_WIDTH && height === VIEWPORT_HEIGHT, `${name} must be ${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT}, got ${width}x${height}`);
}

async function capture(page, outputDir, fileName, label) {
  await assertCompactLandscapeFrame(page);
  const screenshot = await page.screenshot({ type: 'png', fullPage: false });
  validatePng(screenshot, label);
  fs.writeFileSync(path.join(outputDir, fileName), screenshot);
  return screenshot;
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
      if (!context) throw new Error('Unable to create compact mobile visual-review analysis canvas');
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
  }, {
    beforeBase64: before.toString('base64'),
    afterBase64: after.toString('base64'),
  });
}

async function captureLocale(browser, localeCode, locale) {
  const outputDir = path.join(reviewRoot, localeCode);
  ensureDirectory(outputDir);
  const context = await browser.newContext({
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
    locale,
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Version/18.6 Mobile/15E148 Safari/604.1',
  });

  try {
    const page = await bootPage(context, localeCode);
    const lotSelection = await capture(page, outputDir, '01-lot-selection.png', `${localeCode} compact lot selection`);

    await clickGame(page, 1000, 112);
    await page.waitForTimeout(620);
    const collection = await capture(page, outputDir, '02-collection-book.png', `${localeCode} compact Collection Book`);
    assert((await imageDifferenceRatio(page, lotSelection, collection)) > 0.12, `${localeCode} compact Collection Book did not visibly replace lot selection`);

    await clickGame(page, 646, 70);
    await page.waitForTimeout(620);
    const discovery = await capture(page, outputDir, '03-discovery-board.png', `${localeCode} compact Discovery Board`);
    assert((await imageDifferenceRatio(page, collection, discovery)) > 0.12, `${localeCode} compact Discovery Board did not visibly replace Collection Book`);

    await clickGame(page, 995, 72);
    await page.waitForTimeout(460);
    await clickGame(page, 817, 70);
    await page.waitForTimeout(620);
    const buyer = await capture(page, outputDir, '04-buyer-market.png', `${localeCode} compact Buyer Market`);
    assert((await imageDifferenceRatio(page, collection, buyer)) > 0.14, `${localeCode} compact Buyer Market did not visibly replace Collection Book`);

    await clickGame(page, 1175, 68);
    await page.waitForTimeout(460);
    await clickGame(page, 995, 70);
    await page.waitForTimeout(620);
    const office = await capture(page, outputDir, '05-office.png', `${localeCode} compact Office`);
    assert((await imageDifferenceRatio(page, buyer, office)) > 0.12, `${localeCode} compact Office did not visibly replace Buyer Market`);
    await page.close();

    const auctionPage = await bootPage(context, localeCode);
    await chooseGarageLotAndStartAuction(auctionPage);
    await capture(auctionPage, outputDir, '06-active-bidding.png', `${localeCode} compact active bidding`);
    await auctionPage.close();
  } finally {
    await context.close();
  }
}

fs.rmSync(reviewRoot, { recursive: true, force: true });
ensureDirectory(reviewRoot);

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

const expectedFiles = [
  '01-lot-selection.png',
  '02-collection-book.png',
  '03-discovery-board.png',
  '04-buyer-market.png',
  '05-office.png',
  '06-active-bidding.png',
];
for (const locale of ['ru', 'en']) {
  for (const file of expectedFiles) {
    const absolute = path.join(reviewRoot, locale, file);
    assert(fs.existsSync(absolute), `Missing compact mobile-landscape review screenshot: ${absolute}`);
    console.log(path.relative(root, absolute).split(path.sep).join('/'));
  }
}
console.log(`P7 compact mobile-landscape visual review capture OK (${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT})`);

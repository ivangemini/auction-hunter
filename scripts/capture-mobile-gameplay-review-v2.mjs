import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reviewRoot = path.join(root, 'release', 'screenshots', 'mobile-gameplay-review');
const previewUrl = 'http://127.0.0.1:4182';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const VIEWPORT_WIDTH = 844;
const VIEWPORT_HEIGHT = 390;
const SAVE_KEY = 'auction-hunter.save.v1';

const seedSave = {
  version: 1,
  updatedAt: 1,
  cash: 500000,
  collection: ['vinyl-box', 'toy-robot', 'film-camera', 'telescope', 'gallery-print', 'enamel-brooch'],
  claimedSetRewards: [],
  reputationXp: 360,
  lastDailyCompletedDay: null,
  onboardingComplete: true,
  auctionsWon: 12,
  auctionsPlayed: 18,
  lifetimeSales: 28600,
  highestCash: 500000,
  contractDayKey: null,
  contractProgress: {},
  claimedContractRewards: [],
  claimedAchievements: [],
  businessUpgrades: { warehouse: 1, contractsDesk: 1, showroom: 1 },
  auctionHistory: [],
  buyerMarketDayKey: null,
  claimedBuyerOfferIds: [],
  discoveryChainProgress: {},
  discoveryChainLastAuction: {},
  completedDiscoveryChains: ['watchmaker-ledger', 'prototype-trail', 'lost-master-study'],
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
  throw new Error('Timed out waiting for compact gameplay review preview server');
}

async function stopPreview(preview) {
  if (preview.exitCode !== null || preview.signalCode) return;
  const closed = new Promise((resolve) => preview.once('close', resolve));
  preview.kill('SIGTERM');
  const graceful = await Promise.race([
    closed.then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 2_000)),
  ]);
  if (!graceful && preview.exitCode === null) preview.kill('SIGKILL');
}

async function clickGame(page, gameX, gameY) {
  const box = await page.locator('canvas').boundingBox();
  assert(box, 'Game canvas has no bounding box');
  await page.touchscreen.tap(
    box.x + (gameX / GAME_WIDTH) * box.width,
    box.y + (gameY / GAME_HEIGHT) * box.height,
  );
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
    window.__auctionHunterCompactGameplayEvents = [];
    window.addEventListener('auction-hunter:analytics', (event) => {
      window.__auctionHunterCompactGameplayEvents.push(event.detail);
    });
  }, { key: SAVE_KEY, save: seedSave, lang: platformLocale });
}

async function assertCompactLandscapeFrame(page) {
  const guardDisplay = await page.locator('#orientation-guard').evaluate((element) => getComputedStyle(element).display);
  assert(guardDisplay === 'none', `Orientation guard should be hidden in landscape, got ${guardDisplay}`);
  const box = await page.locator('canvas').boundingBox();
  assert(box, 'Compact gameplay review canvas has no bounding box');
  assert(box.height >= VIEWPORT_HEIGHT * 0.98, `Canvas should fill compact landscape height (${box.height.toFixed(1)}px)`);
  assert(box.width >= 680 && box.width <= VIEWPORT_WIDTH, `Canvas width is unexpected for 16:9 FIT (${box.width.toFixed(1)}px)`);
  assert(Math.abs(box.width / box.height - GAME_WIDTH / GAME_HEIGHT) < 0.02, 'Canvas aspect ratio drifted');
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

async function eventCount(page, eventName) {
  return page.evaluate((name) => (
    window.__auctionHunterCompactGameplayEvents?.filter((event) => event?.eventName === name).length ?? 0
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

async function activateUntilEvent(page, x, y, eventName, attempts = 12, waitMs = 300) {
  const before = await eventCount(page, eventName);
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if ((await eventCount(page, eventName)) > before) return;
    await clickGame(page, x, y);
    await page.waitForTimeout(waitMs);
  }
  throw new Error(`${eventName} was not observed during compact gameplay review capture`);
}

async function readSaveCash(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) throw new Error('Compact gameplay save disappeared');
    const save = JSON.parse(raw);
    if (typeof save.cash !== 'number') throw new Error('Compact gameplay save has no numeric cash');
    return save.cash;
  }, SAVE_KEY);
}

async function waitForSaveCashAbove(page, baseline, timeoutMs = 2_500) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const cash = await readSaveCash(page);
    if (cash > baseline) return cash;
    await page.waitForTimeout(40);
  }
  throw new Error(`Timed out waiting for cash to increase above ${baseline}`);
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
}

async function winCurrentAuction(page) {
  await chooseGarageLotAndStartAuction(page);
  const winsBefore = await eventCount(page, 'auction_won');
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if ((await eventCount(page, 'auction_won')) > winsBefore) return;
    await clickGame(page, 226, 626);
    await page.waitForTimeout(750);
  }
  throw new Error('Unable to reach an auction win for compact gameplay review capture');
}

function validatePng(buffer, name) {
  assert(buffer.length > 12_000, `${name} looks unexpectedly small (${buffer.length} bytes)`);
  assert(buffer.subarray(12, 16).toString('ascii') === 'IHDR', `${name} is not a PNG`);
  assert(buffer.readUInt32BE(16) === VIEWPORT_WIDTH && buffer.readUInt32BE(20) === VIEWPORT_HEIGHT, `${name} must be ${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT}`);
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
      if (!context) throw new Error('Unable to create compact gameplay analysis canvas');
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
    await winCurrentAuction(page);

    await activateUntilEvent(page, 640, 596, 'item_revealed');
    await page.waitForTimeout(420);
    const reveal = await capture(page, outputDir, '01-reveal.png', `${localeCode} compact reveal`);

    await activateUntilEvent(page, 1016, 560, 'item_appraised');
    await page.waitForTimeout(420);
    const appraisal = await capture(page, outputDir, '02-appraisal.png', `${localeCode} compact appraisal`);
    assert((await imageDifferenceRatio(page, reveal, appraisal)) > 0.025, `${localeCode} appraisal did not visibly change reveal`);

    await clickGame(page, 882, 572);
    await page.waitForTimeout(320);
    const modePicker = await capture(page, outputDir, '03-restoration-mode.png', `${localeCode} compact restoration mode picker`);
    assert((await imageDifferenceRatio(page, appraisal, modePicker)) > 0.14, `${localeCode} restoration mode picker did not visibly replace appraisal`);

    await clickGame(page, 812, 584);
    await page.waitForTimeout(280);
    const timing = await capture(page, outputDir, '04-restoration-timing.png', `${localeCode} compact restoration timing`);
    assert((await imageDifferenceRatio(page, modePicker, timing)) > 0.08, `${localeCode} restoration timing did not visibly replace mode picker`);

    await activateUntilEvent(page, 890, 557, 'restoration_completed', 4, 70);
    await page.waitForTimeout(110);
    const restorationResult = await capture(page, outputDir, '05-restoration-result.png', `${localeCode} compact restoration result`);
    assert((await imageDifferenceRatio(page, timing, restorationResult)) > 0.08, `${localeCode} restoration result did not visibly replace timing`);

    const cashBeforeSale = await readSaveCash(page);
    await clickGame(page, 928, 572);
    const cashAfterSale = await waitForSaveCashAbove(page, cashBeforeSale);
    await page.waitForTimeout(180);
    const saleTransition = await capture(page, outputDir, '06-sell-feedback.png', `${localeCode} compact post-sale transition`);
    const transitionDifference = await imageDifferenceRatio(page, restorationResult, saleTransition);
    assert(transitionDifference > 0.18, `${localeCode} sale did not visibly advance to the next item (${transitionDifference.toFixed(4)})`);
    console.log(`${localeCode} compact sale persisted ${cashBeforeSale} -> ${cashAfterSale}; next-item delta ${transitionDifference.toFixed(4)}`);

    await page.close();
  } finally {
    await context.close();
  }
}

fs.rmSync(reviewRoot, { recursive: true, force: true });
ensureDirectory(reviewRoot);

const preview = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4182'], {
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

for (const locale of ['ru', 'en']) {
  for (const file of [
    '01-reveal.png',
    '02-appraisal.png',
    '03-restoration-mode.png',
    '04-restoration-timing.png',
    '05-restoration-result.png',
    '06-sell-feedback.png',
  ]) console.log(`release/screenshots/mobile-gameplay-review/${locale}/${file}`);
}
console.log('P7 compact gameplay review OK: reveal, appraisal, restoration and persisted sell transition on RU/EN 844x390');

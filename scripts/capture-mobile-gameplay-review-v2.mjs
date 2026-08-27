import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reviewRoot = path.join(root, 'release', 'screenshots', 'mobile-gameplay-review');
const debugRoot = path.join(root, 'release', 'screenshots', 'debug');
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
  collection: [],
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
  throw new Error('Timed out waiting for compact mobile gameplay review preview server');
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
    window.__auctionHunterMobileGameplayEvents = [];
    window.addEventListener('auction-hunter:analytics', (event) => {
      window.__auctionHunterMobileGameplayEvents.push(event.detail);
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
  assert(box, 'Compact mobile gameplay canvas has no bounding box');
  assert(box.height >= VIEWPORT_HEIGHT * 0.98, `Canvas should fill compact landscape height (${box.height.toFixed(1)}px)`);
  assert(box.width >= 680 && box.width <= VIEWPORT_WIDTH, `Canvas width is unexpected for 16:9 FIT (${box.width.toFixed(1)}px)`);
  const ratio = box.width / box.height;
  assert(Math.abs(ratio - GAME_WIDTH / GAME_HEIGHT) < 0.02, `Canvas aspect ratio drifted to ${ratio.toFixed(3)}`);
}

async function eventCount(page, eventName) {
  return page.evaluate((name) => (
    window.__auctionHunterMobileGameplayEvents?.filter((event) => event?.eventName === name).length ?? 0
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

async function activateUntilEvent(page, x, y, eventName, attempts = 8, waitMs = 180) {
  const before = await eventCount(page, eventName);
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    await clickGame(page, x, y);
    try {
      await waitForEventCount(page, eventName, before + 1, waitMs);
      return;
    } catch {
      // Keep trying the stable gameplay corridor.
    }
  }
  throw new Error(`Unable to trigger ${eventName} after ${attempts} compact interactions`);
}

async function winCurrentAuction(page) {
  const tierBefore = await eventCount(page, 'tier_selected');
  await clickGame(page, 250, 151);
  await waitForEventCount(page, 'tier_selected', tierBefore + 1);

  const selectionBefore = await eventCount(page, 'lot_option_selected');
  await clickGame(page, 240, 625);
  await waitForEventCount(page, 'lot_option_selected', selectionBefore + 1);

  const startBefore = await eventCount(page, 'auction_started');
  await clickGame(page, 1038, 620);
  await waitForEventCount(page, 'auction_started', startBefore + 1);

  const winBefore = await eventCount(page, 'auction_won');
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if ((await eventCount(page, 'auction_won')) > winBefore) return;
    await clickGame(page, 226, 626);
    await page.waitForTimeout(600);
  }
  throw new Error('Unable to reach a legitimate compact Garage auction win');
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
      return image;
    };
    const [beforeImage, afterImage] = await Promise.all([decode(beforeBase64), decode(afterBase64)]);
    const canvas = document.createElement('canvas');
    canvas.width = beforeImage.width;
    canvas.height = beforeImage.height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Unable to create compact screenshot comparison canvas');

    context.drawImage(beforeImage, 0, 0);
    const beforePixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(afterImage, 0, 0);
    const afterPixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

    let changed = 0;
    let sampled = 0;
    for (let index = 0; index < beforePixels.length; index += 16) {
      const delta = Math.abs((beforePixels[index] ?? 0) - (afterPixels[index] ?? 0))
        + Math.abs((beforePixels[index + 1] ?? 0) - (afterPixels[index + 1] ?? 0))
        + Math.abs((beforePixels[index + 2] ?? 0) - (afterPixels[index + 2] ?? 0));
      sampled += 1;
      if (delta > 42) changed += 1;
    }
    return sampled > 0 ? changed / sampled : 0;
  }, { beforeBase64: before.toString('base64'), afterBase64: after.toString('base64') });
}

async function readSaveCash(page) {
  return page.evaluate((key) => Number(JSON.parse(localStorage.getItem(key) ?? '{}').cash ?? 0), SAVE_KEY);
}

async function waitForSaveCashAbove(page, baseline, timeoutMs = 2_500) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const cash = await readSaveCash(page);
    if (cash > baseline) return cash;
    await page.waitForTimeout(50);
  }
  throw new Error(`Timed out waiting for cash to exceed ${baseline}`);
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
    const dispositionsBefore = await eventCount(page, 'item_dispositioned');
    const revealsBeforeSale = await eventCount(page, 'item_revealed');
    await clickGame(page, 928, 572);
    const cashAfterSale = await waitForSaveCashAbove(page, cashBeforeSale);
    await waitForEventCount(page, 'item_dispositioned', dispositionsBefore + 1);
    await page.waitForTimeout(240);

    await activateUntilEvent(page, 640, 596, 'item_revealed', 8, 180);
    await waitForEventCount(page, 'item_revealed', revealsBeforeSale + 1);
    await page.waitForTimeout(320);
    const nextReveal = await capture(page, outputDir, '06-next-item-reveal.png', `${localeCode} compact next-item reveal after sale`);
    const nextRevealDifference = await imageDifferenceRatio(page, restorationResult, nextReveal);
    // The state transition is already asserted by item_revealed + persisted sale.
    // English copy occupies fewer pixels than Russian, so allow a small locale
    // variance while still requiring a clearly non-trivial visual replacement.
    assert(nextRevealDifference >= 0.075, `${localeCode} next item did not visibly replace sold item (${nextRevealDifference.toFixed(4)})`);
    console.log(`${localeCode} compact sale persisted ${cashBeforeSale} -> ${cashAfterSale}; next item emitted item_revealed and delta ${nextRevealDifference.toFixed(4)}`);

    await page.close();
  } finally {
    await context.close();
  }
}

fs.rmSync(reviewRoot, { recursive: true, force: true });
fs.rmSync(debugRoot, { recursive: true, force: true });
ensureDirectory(reviewRoot);
ensureDirectory(debugRoot);

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
  console.log('P7 compact reveal/restoration visual review capture OK (844x390)');
} catch (error) {
  console.error(previewLog);
  throw error;
} finally {
  await stopPreview(preview);
}

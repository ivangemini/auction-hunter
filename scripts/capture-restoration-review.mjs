import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reviewRoot = path.join(root, 'release', 'screenshots', 'review');
const previewUrl = 'http://127.0.0.1:4175';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
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
  throw new Error('Timed out waiting for restoration review preview server');
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

async function clickGame(page, gameX, gameY, inputMode = 'auto') {
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  assert(box, 'Game canvas has no bounding box');
  const pageX = box.x + (gameX / GAME_WIDTH) * box.width;
  const pageY = box.y + (gameY / GAME_HEIGHT) * box.height;
  const touchPoints = await page.evaluate(() => navigator.maxTouchPoints);
  if (inputMode === 'mouse' || (inputMode === 'auto' && touchPoints <= 0)) {
    await page.mouse.click(pageX, pageY);
    return;
  }
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
    window.__auctionHunterScreenshotEvents = [];
    window.addEventListener('auction-hunter:analytics', (event) => {
      window.__auctionHunterScreenshotEvents.push(event.detail);
    });
  }, { key: SAVE_KEY, save: seedSave, lang: platformLocale });
}

async function bootPage(context, platformLocale) {
  const page = await context.newPage();
  await installSeed(page, platformLocale);
  await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(650);
  return page;
}

async function eventCount(page, eventName) {
  return page.evaluate((name) => (
    window.__auctionHunterScreenshotEvents?.filter((event) => event?.eventName === name).length ?? 0
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

async function activateUntilEvent(page, x, y, eventName, attempts = 10, waitMs = 280) {
  const touchPoints = await page.evaluate(() => navigator.maxTouchPoints);
  const modes = touchPoints > 0 ? ['mouse', 'touch'] : ['mouse'];
  const before = await eventCount(page, eventName);
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if ((await eventCount(page, eventName)) > before) return;
    await clickGame(page, x, y, modes[attempt % modes.length]);
    await page.waitForTimeout(waitMs);
  }
  throw new Error(`${eventName} was not observed during restoration review capture`);
}

async function chooseLotAndStartAuction(page) {
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
  await chooseLotAndStartAuction(page);
  const winsBefore = await eventCount(page, 'auction_won');
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if ((await eventCount(page, 'auction_won')) > winsBefore) return;
    await clickGame(page, 226, 626);
    await page.waitForTimeout(750);
  }
  throw new Error('Unable to reach an auction win for restoration review capture');
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

function validatePng(buffer, name) {
  assert(buffer.length > 30_000, `${name} looks unexpectedly small (${buffer.length} bytes)`);
  assert(buffer.subarray(12, 16).toString('ascii') === 'IHDR', `${name} is not a PNG`);
  assert(buffer.readUInt32BE(16) === 1280 && buffer.readUInt32BE(20) === 720, `${name} must be 1280x720`);
}

async function captureLocale(browser, localeCode, locale) {
  const outputDir = path.join(reviewRoot, localeCode);
  ensureDirectory(outputDir);
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale,
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/140.0.0.0 Mobile Safari/537.36',
  });

  try {
    const page = await bootPage(context, localeCode);
    await winCurrentAuction(page);
    await activateUntilEvent(page, 640, 596, 'item_revealed');
    await activateUntilEvent(page, 1016, 560, 'item_appraised');
    await page.waitForTimeout(420);

    const appraisal = await page.screenshot({ type: 'png' });
    await clickGame(page, 882, 572);
    await page.waitForTimeout(320);
    const modePicker = await page.screenshot({ type: 'png' });
    validatePng(modePicker, `${localeCode} restoration mode picker`);
    assert(
      (await imageDifferenceRatio(page, appraisal, modePicker)) > 0.18,
      `${localeCode} restoration mode picker did not visibly replace appraisal`,
    );
    fs.writeFileSync(path.join(outputDir, '01-restoration-mode.png'), modePicker);

    await clickGame(page, 812, 584); // Pro card CTA.
    await page.waitForTimeout(280);
    const timing = await page.screenshot({ type: 'png' });
    validatePng(timing, `${localeCode} restoration timing`);
    assert(
      (await imageDifferenceRatio(page, modePicker, timing)) > 0.1,
      `${localeCode} restoration timing screen did not visibly replace mode picker`,
    );
    fs.writeFileSync(path.join(outputDir, '02-restoration-timing.png'), timing);
    await page.close();
  } finally {
    await context.close();
  }
}

fs.rmSync(reviewRoot, { recursive: true, force: true });
ensureDirectory(reviewRoot);

const preview = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4175'], {
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

const generated = [];
for (const locale of ['ru', 'en']) {
  const directory = path.join(reviewRoot, locale);
  for (const file of fs.readdirSync(directory).sort()) {
    generated.push(path.relative(root, path.join(directory, file)).split(path.sep).join('/'));
  }
}
assert(generated.length === 4, `Expected 4 restoration review screenshots, found ${generated.length}`);
console.log(generated.join('\n'));
console.log('Restoration visual review capture OK');

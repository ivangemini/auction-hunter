import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(root, 'release', 'screenshots', 'generated');
const previewUrl = 'http://127.0.0.1:4174';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const SAVE_KEY = 'auction-hunter.save.v1';

const seedSave = {
  version: 1,
  updatedAt: 1,
  cash: 50000,
  collection: ['vinyl-box', 'toy-robot', 'film-camera', 'telescope', 'gallery-print', 'enamel-brooch'],
  claimedSetRewards: [],
  reputationXp: 360,
  lastDailyCompletedDay: null,
  onboardingComplete: true,
  auctionsWon: 12,
  auctionsPlayed: 18,
  lifetimeSales: 28600,
  highestCash: 50000,
  contractDayKey: null,
  contractProgress: {},
  claimedContractRewards: [],
  claimedAchievements: [],
  businessUpgrades: { warehouse: 1, contractsDesk: 1, showroom: 1 },
  auctionHistory: [
    {
      id: 'screenshot-history-1',
      occurredAt: '2026-08-24T08:00:00.000Z',
      lotId: 'estate-42',
      tierId: 'estate',
      outcome: 'won',
      finalBid: 2600,
      sales: 4100,
      keptValue: 1200,
      estimatedResult: 2700,
      daily: false,
    },
    {
      id: 'screenshot-history-2',
      occurredAt: '2026-08-23T08:00:00.000Z',
      lotId: 'garage-17',
      tierId: 'garage',
      outcome: 'passed',
      finalBid: 1950,
      sales: 0,
      keptValue: 0,
      estimatedResult: 0,
      daily: false,
    },
  ],
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
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('Timed out waiting for Vite preview server');
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
    await Promise.race([
      closed,
      new Promise((resolve) => setTimeout(resolve, 1_000)),
    ]);
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

async function installSeed(page, platformLocale, save = seedSave) {
  await page.addInitScript(({ key, save: seededSave, lang }) => {
    window.YaGames = {
      init: async () => ({
        environment: { i18n: { lang } },
        features: {
          LoadingAPI: { ready() {} },
          GameplayAPI: { start() {}, stop() {} },
        },
      }),
    };
    localStorage.setItem(key, JSON.stringify(seededSave));
    window.__auctionHunterScreenshotEvents = [];
    window.addEventListener('auction-hunter:analytics', (event) => {
      window.__auctionHunterScreenshotEvents.push(event.detail);
    });
  }, { key: SAVE_KEY, save, lang: platformLocale });
}

async function bootPage(context, platformLocale, save = seedSave) {
  const page = await context.newPage();
  await installSeed(page, platformLocale, save);
  await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(650);
  return page;
}

async function eventSeen(page, eventName) {
  return page.evaluate((name) => window.__auctionHunterScreenshotEvents?.some((event) => event?.eventName === name) ?? false, eventName);
}

async function activateUntilEvent(page, x, y, eventName, attempts = 10, waitMs = 280) {
  const touchPoints = await page.evaluate(() => navigator.maxTouchPoints);
  const modes = touchPoints > 0 ? ['mouse', 'touch'] : ['mouse'];
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await eventSeen(page, eventName)) return;
    await clickGame(page, x, y, modes[attempt % modes.length]);
    await page.waitForTimeout(waitMs);
    if (await eventSeen(page, eventName)) return;
  }
  throw new Error(`${eventName} was not observed after ${attempts} interaction attempts`);
}

async function winCurrentAuction(page) {
  // Use the real Garage tier tab for a shorter deterministic submission capture while
  // preserving the production selection -> bidding -> win -> reveal path.
  await clickGame(page, 250, 151);
  await page.waitForTimeout(180);
  await clickGame(page, 240, 625); // Choose the first Garage lot option.
  await page.waitForTimeout(180);
  await clickGame(page, 1038, 620); // Enter the chosen auction.
  await page.waitForTimeout(350);
  assert(await eventSeen(page, 'auction_started'), 'Auction did not start before screenshot win loop');

  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (await eventSeen(page, 'auction_won')) return;
    await clickGame(page, 226, 626); // Polished primary bid action.
    await page.waitForTimeout(750);
  }

  throw new Error('Unable to reach a legitimate Garage auction win while capturing screenshots');
}

async function regionStats(page, screenshot, region) {
  return page.evaluate(async ({ pngBase64, sample }) => {
    const image = new Image();
    image.src = `data:image/png;base64,${pngBase64}`;
    await image.decode();

    const canvas = document.createElement('canvas');
    canvas.width = sample.width;
    canvas.height = sample.height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Unable to create screenshot analysis canvas');
    context.drawImage(
      image,
      sample.x,
      sample.y,
      sample.width,
      sample.height,
      0,
      0,
      sample.width,
      sample.height,
    );

    const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
    const buckets = new Set();
    let sampled = 0;
    let visiblyLit = 0;

    for (let index = 0; index < pixels.length; index += 16) {
      const red = pixels[index] ?? 0;
      const green = pixels[index + 1] ?? 0;
      const blue = pixels[index + 2] ?? 0;
      const alpha = pixels[index + 3] ?? 0;
      if (alpha < 16) continue;
      sampled += 1;
      if ((red + green + blue) / 3 > 38) visiblyLit += 1;
      buckets.add(`${red >> 4}:${green >> 4}:${blue >> 4}`);
    }

    return {
      sampled,
      visiblyLitRatio: sampled > 0 ? visiblyLit / sampled : 0,
      colorBuckets: buckets.size,
    };
  }, { pngBase64: screenshot.toString('base64'), sample: region });
}

async function saveViewport(page, outputPath, artRegion = null) {
  const screenshot = await page.screenshot({ path: outputPath, type: 'png', fullPage: false });
  const bytes = screenshot.length;
  assert(bytes > 30_000, `${outputPath} looks unexpectedly small (${bytes} bytes)`);
  assert(screenshot.subarray(12, 16).toString('ascii') === 'IHDR', `${outputPath} is not a PNG`);
  const width = screenshot.readUInt32BE(16);
  const height = screenshot.readUInt32BE(20);
  assert(width === 1280 && height === 720, `${outputPath} is ${width}x${height}; expected 1280x720`);

  if (artRegion) {
    const stats = await regionStats(page, screenshot, artRegion);
    assert(stats.sampled > 500, `${outputPath} art region could not be sampled`);
    assert(stats.colorBuckets >= 6, `${outputPath} art region is visually blank (${stats.colorBuckets} color buckets)`);
    assert(stats.visiblyLitRatio >= 0.08, `${outputPath} art region is too dark/blank (${Math.round(stats.visiblyLitRatio * 100)}% lit pixels)`);
  }
}

async function captureLocale(browser, localeCode, locale) {
  const desktopDir = path.join(outputRoot, localeCode, 'desktop');
  const mobileDir = path.join(outputRoot, localeCode, 'mobile');
  ensureDirectory(desktopDir);
  ensureDirectory(mobileDir);

  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale,
    deviceScaleFactor: 1,
  });
  try {
    const page = await bootPage(desktop, localeCode);
    await saveViewport(
      page,
      path.join(desktopDir, '01-lot-selection.png'),
      { x: 90, y: 292, width: 300, height: 105 },
    );
    await pageWaitAndClick(page, 240, 625, 180); // Choose first visible lot.
    await pageWaitAndClick(page, 1038, 620, 300); // Enter auction.
    await saveViewport(
      page,
      path.join(desktopDir, '02-active-bidding.png'),
      { x: 510, y: 200, width: 270, height: 150 },
    );
    await page.close();
  } finally {
    await desktop.close();
  }

  const mobile = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale,
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/140.0.0.0 Mobile Safari/537.36',
  });
  try {
    const revealSeed = { ...seedSave, cash: 500000, highestCash: 500000 };
    const revealPage = await bootPage(mobile, localeCode, revealSeed);
    await winCurrentAuction(revealPage);
    // The Open Lot and Reveal buttons overlap this safe center point across their two sequential screens.
    // Alternate mouse/touch activation until the actual reveal analytics event confirms progression.
    await activateUntilEvent(revealPage, 640, 596, 'item_revealed', 10, 280);
    await activateUntilEvent(revealPage, 1016, 560, 'item_appraised', 10, 300);
    await page.waitForTimeout(420); // Let appraisal value count-up settle for the production capture.
    await saveViewport(
      revealPage,
      path.join(mobileDir, '01-appraised-find.png'),
      { x: 250, y: 190, width: 330, height: 230 },
    );
    await revealPage.close();

    const officePage = await bootPage(mobile, localeCode);
    await pageWaitAndClick(officePage, 1000, 112, 260); // Collection Book from polished lot selection.
    await pageWaitAndClick(officePage, 970, 72, 350); // Office.
    await saveViewport(officePage, path.join(mobileDir, '02-office-progression.png'));
    await officePage.close();
  } finally {
    await mobile.close();
  }
}

async function pageWaitAndClick(page, x, y, waitMs) {
  await clickGame(page, x, y);
  await page.waitForTimeout(waitMs);
}

fs.rmSync(outputRoot, { recursive: true, force: true });
ensureDirectory(outputRoot);

const preview = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4174'], {
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
  for (const platform of ['desktop', 'mobile']) {
    const directory = path.join(outputRoot, locale, platform);
    for (const file of fs.readdirSync(directory).sort()) {
      generated.push(path.relative(root, path.join(directory, file)).split(path.sep).join('/'));
    }
  }
}

assert(generated.length === 8, `Expected 8 localized gameplay screenshots, found ${generated.length}`);
console.log(generated.join('\n'));
console.log('Yandex gameplay screenshot capture OK');

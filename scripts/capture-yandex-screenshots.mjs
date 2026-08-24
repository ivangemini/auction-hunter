import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(root, 'release', 'screenshots', 'generated');
const previewUrl = 'http://127.0.0.1:4174';
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

async function clickGame(page, gameX, gameY) {
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  assert(box, 'Game canvas has no bounding box');
  await page.mouse.click(
    box.x + (gameX / GAME_WIDTH) * box.width,
    box.y + (gameY / GAME_HEIGHT) * box.height,
  );
}

async function installSeed(page) {
  await page.addInitScript(({ key, save }) => {
    localStorage.setItem(key, JSON.stringify(save));
    window.__auctionHunterScreenshotEvents = [];
    window.addEventListener('auction-hunter:analytics', (event) => {
      window.__auctionHunterScreenshotEvents.push(event.detail);
    });
  }, { key: SAVE_KEY, save: seedSave });
}

async function bootPage(context) {
  const page = await context.newPage();
  await installSeed(page);
  await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(650);
  return page;
}

async function eventSeen(page, eventName) {
  return page.evaluate((name) => window.__auctionHunterScreenshotEvents?.some((event) => event?.eventName === name) ?? false, eventName);
}

async function winCurrentAuction(page) {
  await clickGame(page, 1038, 620);
  await page.waitForTimeout(350);

  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (await eventSeen(page, 'auction_won')) return;
    await clickGame(page, 250, 555);
    await page.waitForTimeout(1200);
  }

  throw new Error('Unable to reach a legitimate auction win while capturing screenshots');
}

async function saveViewport(page, outputPath) {
  await page.screenshot({ path: outputPath, type: 'png', fullPage: false });
  const bytes = fs.statSync(outputPath).size;
  assert(bytes > 80_000, `${outputPath} looks unexpectedly small (${bytes} bytes)`);
  const screenshot = fs.readFileSync(outputPath);
  assert(screenshot.subarray(12, 16).toString('ascii') === 'IHDR', `${outputPath} is not a PNG`);
  const width = screenshot.readUInt32BE(16);
  const height = screenshot.readUInt32BE(20);
  assert(width === 1280 && height === 720, `${outputPath} is ${width}x${height}; expected 1280x720`);
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
    const page = await bootPage(desktop);
    await saveViewport(page, path.join(desktopDir, '01-lot-lobby.png'));
    await clickGame(page, 1038, 620);
    await page.waitForTimeout(300);
    await saveViewport(page, path.join(desktopDir, '02-active-bidding.png'));
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
    const revealPage = await bootPage(mobile);
    await winCurrentAuction(revealPage);
    await pageWaitAndClick(revealPage, 640, 560, 250); // Open lot.
    await pageWaitAndClick(revealPage, 640, 555, 260); // Reveal first item.
    await pageWaitAndClick(revealPage, 640, 568, 300); // Appraise first item.
    assert(await eventSeen(revealPage, 'item_appraised'), 'Appraisal event was not observed before screenshot');
    await saveViewport(revealPage, path.join(mobileDir, '01-appraised-find.png'));
    await revealPage.close();

    const officePage = await bootPage(mobile);
    await pageWaitAndClick(officePage, 1038, 520, 260); // Collection Book.
    await pageWaitAndClick(officePage, 875, 72, 350); // Office.
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

const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4174'], {
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
  preview.kill('SIGTERM');
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

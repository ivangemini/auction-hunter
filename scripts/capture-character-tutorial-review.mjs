import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reviewRoot = path.join(root, 'release', 'screenshots', 'character-tutorial-review');
const previewUrl = 'http://127.0.0.1:4178';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const SAVE_KEY = 'auction-hunter.save.v1';
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

const seedSave = {
  version: 1,
  updatedAt: 1,
  cash: 500000,
  collection: [],
  collectionItems: [],
  claimedSetRewards: [],
  reputationXp: 0,
  lastDailyCompletedDay: null,
  onboardingComplete: false,
  auctionsWon: 0,
  auctionsPlayed: 0,
  lifetimeSales: 0,
  highestCash: 500000,
  contractDayKey: null,
  contractProgress: {},
  claimedContractRewards: [],
  claimedAchievements: [],
  businessUpgrades: { warehouse: 0, contractsDesk: 0, showroom: 0 },
  auctionHistory: [],
  buyerMarketDayKey: null,
  claimedBuyerOfferIds: [],
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
  throw new Error('Timed out waiting for character/tutorial review preview server');
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
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  assert(box, 'Game canvas has no bounding box');
  await page.mouse.click(
    box.x + (gameX / GAME_WIDTH) * box.width,
    box.y + (gameY / GAME_HEIGHT) * box.height,
  );
}

async function eventCount(page, eventName) {
  return page.evaluate((name) => (
    window.__auctionHunterTutorialEvents?.filter((event) => event?.eventName === name).length ?? 0
  ), eventName);
}

async function waitForEvent(page, eventName, previousCount, timeoutMs = 3_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await eventCount(page, eventName)) > previousCount) return;
    await page.waitForTimeout(60);
  }
  throw new Error(`Timed out waiting for ${eventName} during character/tutorial review`);
}

function validatePng(buffer, name) {
  assert(buffer.length > 30_000, `${name} looks unexpectedly small (${buffer.length} bytes)`);
  assert(buffer.subarray(12, 16).toString('ascii') === 'IHDR', `${name} is not a PNG`);
  assert(buffer.readUInt32BE(16) === 1280 && buffer.readUInt32BE(20) === 720, `${name} must be 1280x720`);
}

async function differenceRatio(page, before, after) {
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
  }, { beforeBase64: before.toString('base64'), afterBase64: after.toString('base64') });
}

async function captureLocale(browser, localeCode, locale) {
  const outputDir = path.join(reviewRoot, localeCode);
  ensureDirectory(outputDir);
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, locale, deviceScaleFactor: 1 });
  const page = await context.newPage();
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
    window.__auctionHunterTutorialEvents = [];
    window.addEventListener('auction-hunter:analytics', (event) => {
      window.__auctionHunterTutorialEvents.push(event.detail);
    });
  }, { key: SAVE_KEY, save: seedSave, lang: localeCode });

  try {
    await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });
    await page.locator('canvas').waitFor({ state: 'visible' });
    await page.waitForTimeout(650);

    const onboarding = await page.screenshot({ type: 'png' });
    validatePng(onboarding, `${localeCode} onboarding`);
    fs.writeFileSync(path.join(outputDir, '01-onboarding.png'), onboarding);

    await clickGame(page, 690, 622);
    await page.waitForTimeout(700);
    const lotSelection = await page.screenshot({ type: 'png' });
    validatePng(lotSelection, `${localeCode} tutorial lot selection`);
    assert((await differenceRatio(page, onboarding, lotSelection)) > 0.18, `${localeCode} onboarding did not visibly transition to lot selection`);
    fs.writeFileSync(path.join(outputDir, '02-lot-selection-coach.png'), lotSelection);

    const selectionsBefore = await eventCount(page, 'lot_option_selected');
    await clickGame(page, 224, 641);
    await waitForEvent(page, 'lot_option_selected', selectionsBefore);
    const startsBefore = await eventCount(page, 'auction_started');
    await clickGame(page, 1038, 620);
    await waitForEvent(page, 'auction_started', startsBefore);
    await page.waitForTimeout(500);

    const bidding = await page.screenshot({ type: 'png' });
    validatePng(bidding, `${localeCode} character bidding`);
    assert((await differenceRatio(page, lotSelection, bidding)) > 0.15, `${localeCode} bidding did not visibly replace lot selection`);
    fs.writeFileSync(path.join(outputDir, '03-bidding-characters.png'), bidding);
  } finally {
    await context.close();
  }
}

fs.rmSync(reviewRoot, { recursive: true, force: true });
ensureDirectory(reviewRoot);

const preview = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4178'], {
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
    await captureLocale(browser, 'en', 'en-US');
    await captureLocale(browser, 'ru', 'ru-RU');
  } finally {
    await browser.close();
  }
} catch (error) {
  console.error(previewLog);
  throw error;
} finally {
  await stopPreview(preview);
}

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reviewRoot = path.join(root, 'release', 'screenshots', 'office-review');
const previewUrl = 'http://127.0.0.1:4179';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const SAVE_KEY = 'auction-hunter.save.v1';

const seedSave = {
  version: 1,
  updatedAt: 1,
  cash: 185000,
  collection: ['toolbox', 'toy-robot', 'film-camera', 'pocket-watch', 'porcelain-figurine', 'arcade-handheld', 'vinyl-box', 'telescope'],
  claimedSetRewards: ['garage-starters'],
  reputationXp: 840,
  lastDailyCompletedDay: null,
  onboardingComplete: true,
  auctionsWon: 31,
  auctionsPlayed: 45,
  lifetimeSales: 97200,
  highestCash: 212000,
  contractDayKey: null,
  contractProgress: {},
  claimedContractRewards: [],
  claimedAchievements: [],
  businessUpgrades: { warehouse: 2, contractsDesk: 2, showroom: 1 },
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
  throw new Error('Timed out waiting for Office review preview server');
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
  await page.mouse.click(pageX, pageY);
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
  }, { key: SAVE_KEY, save: seedSave, lang: platformLocale });
}

async function bootOffice(context, platformLocale) {
  const page = await context.newPage();
  await installSeed(page, platformLocale);
  await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(700);

  // Lot selection -> Collection Book -> Business Office through real controls.
  await clickGame(page, 1000, 112);
  await page.waitForTimeout(500);
  await clickGame(page, 1000, 70);
  await page.waitForTimeout(650);
  return page;
}

function validatePng(buffer, name) {
  assert(buffer.length > 20_000, `${name} looks corrupt or empty (${buffer.length} bytes)`);
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
      if (!context) throw new Error('Unable to create Office visual-review analysis canvas');
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

async function captureState(page, outputDir, localeCode, file, label) {
  await page.waitForTimeout(350);
  const screenshot = await page.screenshot({ type: 'png' });
  validatePng(screenshot, `${localeCode} Office ${label}`);
  fs.writeFileSync(path.join(outputDir, file), screenshot);
  return screenshot;
}

async function captureLocale(browser, localeCode, locale) {
  const outputDir = path.join(reviewRoot, localeCode);
  ensureDirectory(outputDir);
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, locale, deviceScaleFactor: 1 });

  try {
    const page = await bootOffice(context, localeCode);

    await clickGame(page, 145, 157);
    const contracts = await captureState(page, outputDir, localeCode, '01-contracts.png', 'Contracts');

    await clickGame(page, 343, 157);
    const upgrades = await captureState(page, outputDir, localeCode, '02-upgrades.png', 'Upgrades');
    assert((await imageDifferenceRatio(page, contracts, upgrades)) > 0.08, `${localeCode} Office Upgrades did not visibly replace Contracts`);

    await clickGame(page, 541, 157);
    const achievementsPage1 = await captureState(page, outputDir, localeCode, '03-achievements-page-1.png', 'Achievements page 1');
    assert((await imageDifferenceRatio(page, upgrades, achievementsPage1)) > 0.08, `${localeCode} Office Achievements did not visibly replace Upgrades`);

    // Real pagination control: validate the second half of the 16-goal catalog is both reachable and visible.
    await clickGame(page, 770, 636);
    const achievementsPage2 = await captureState(page, outputDir, localeCode, '04-achievements-page-2.png', 'Achievements page 2');
    assert((await imageDifferenceRatio(page, achievementsPage1, achievementsPage2)) > 0.04, `${localeCode} Office achievement page 2 did not visibly replace page 1`);

    await clickGame(page, 739, 157);
    const stats = await captureState(page, outputDir, localeCode, '05-stats.png', 'Stats');
    assert((await imageDifferenceRatio(page, achievementsPage2, stats)) > 0.08, `${localeCode} Office Stats did not visibly replace Achievements`);

    await page.close();
  } finally {
    await context.close();
  }
}

fs.rmSync(reviewRoot, { recursive: true, force: true });
ensureDirectory(reviewRoot);

const preview = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4179'], {
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
  for (const file of ['01-contracts.png', '02-upgrades.png', '03-achievements-page-1.png', '04-achievements-page-2.png', '05-stats.png']) {
    console.log(path.relative(root, path.join(reviewRoot, locale, file)).split(path.sep).join('/'));
  }
}
console.log('P7 Office visual review capture OK');

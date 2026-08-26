import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reviewRoot = path.join(root, 'release', 'screenshots', 'campaign-review');
const previewUrl = 'http://127.0.0.1:4179';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const SAVE_KEY = 'auction-hunter.save.v1';
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

const seedSave = {
  version: 1,
  updatedAt: 1,
  cash: 8400,
  collection: ['film-camera', 'pocket-watch'],
  claimedSetRewards: [],
  reputationXp: 165,
  lastDailyCompletedDay: null,
  onboardingComplete: true,
  auctionsWon: 4,
  auctionsPlayed: 7,
  lifetimeSales: 3900,
  highestCash: 9100,
  contractDayKey: null,
  contractProgress: {},
  claimedContractRewards: [],
  claimedAchievements: [],
  businessUpgrades: { warehouse: 0, contractsDesk: 0, showroom: 0 },
  auctionHistory: [],
  buyerMarketDayKey: null,
  claimedBuyerOfferIds: [],
  campaign: {
    started: true,
    activeMissionId: 'black-seal',
    completedMissionIds: ['first-day-floor', 'victor-test'],
    evidenceIds: ['veyr-black-seal'],
    branchChoiceIds: [],
    missionBaselineAuctionsPlayed: { 'first-day-floor': 6, 'victor-test': 7, 'black-seal': 7 },
    missionBaselineAuctionsWon: { 'first-day-floor': 4, 'victor-test': 3, 'black-seal': 4 },
    relationshipTrust: { 'npc-0': 4 },
    relationshipRivalry: {},
    relationshipDebt: {},
    completed: false,
    epilogueId: null,
  },
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
      // Preview still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('Timed out waiting for Campaign review preview server');
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

async function installSeed(page, lang) {
  await page.addInitScript(({ key, save, locale }) => {
    window.YaGames = {
      init: async () => ({
        environment: { i18n: { lang: locale } },
        features: {
          LoadingAPI: { ready() {} },
          GameplayAPI: { start() {}, stop() {} },
        },
      }),
    };
    localStorage.setItem(key, JSON.stringify(save));
  }, { key: SAVE_KEY, save: seedSave, locale: lang });
}

async function clickGame(page, gameX, gameY) {
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  assert(box, 'Campaign canvas has no bounding box');
  await page.mouse.click(
    box.x + (gameX / GAME_WIDTH) * box.width,
    box.y + (gameY / GAME_HEIGHT) * box.height,
  );
}

async function capture(browser, localeCode, locale, viewport, file) {
  const context = await browser.newContext({ viewport, locale, deviceScaleFactor: 1 });
  const page = await context.newPage();
  try {
    await installSeed(page, localeCode);
    await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });
    await page.locator('canvas').waitFor({ state: 'visible' });
    await page.waitForTimeout(650);
    await clickGame(page, 740, 218);
    await page.waitForTimeout(700);

    const outputDir = path.join(reviewRoot, localeCode);
    ensureDirectory(outputDir);
    const screenshot = await page.screenshot({ type: 'png' });
    assert(screenshot.length > 15_000, `${file} looks corrupt or empty`);
    fs.writeFileSync(path.join(outputDir, file), screenshot);
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
    for (const [localeCode, locale] of [['ru', 'ru-RU'], ['en', 'en-US']]) {
      await capture(browser, localeCode, locale, { width: 1280, height: 720 }, '01-desktop-black-seal.png');
      await capture(browser, localeCode, locale, { width: 844, height: 390 }, '02-compact-black-seal.png');
    }
  } finally {
    await browser.close();
  }
} catch (error) {
  console.error(previewLog);
  throw error;
} finally {
  await stopPreview(preview);
}

console.log('P9 Campaign RU/EN desktop + 844x390 visual review capture OK');

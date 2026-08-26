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

const baseSave = {
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
};

const earlyCampaignSave = {
  ...baseSave,
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

const lateCampaignSave = {
  ...baseSave,
  cash: 22400,
  reputationXp: 840,
  auctionsWon: 14,
  auctionsPlayed: 24,
  highestCash: 22400,
  campaign: {
    started: true,
    activeMissionId: 'closed-circle-counterfeit',
    completedMissionIds: [
      'first-day-floor', 'victor-test', 'black-seal', 'missing-inventory',
      'estate-paper-trail', 'estate-linked-lots', 'estate-false-paper', 'estate-restoration-trace', 'estate-night-clearances', 'estate-mira-offer',
      'dealer-war-leak', 'dealer-war-pressure', 'dealer-war-ally', 'dealer-war-proxy', 'dealer-war-counteroffer', 'dealer-war-address',
      'closed-circle-preview', 'closed-circle-sealed-bid', 'closed-circle-debt',
    ],
    evidenceIds: ['veyr-black-seal', 'private-auction-lead', 'closed-circle-address', 'circle-preview-code', 'veyr-buyer-list'],
    branchChoiceIds: ['dealer-ally-mira', 'optional:closed-circle-precision-bid'],
    missionBaselineAuctionsPlayed: { 'closed-circle-counterfeit': 24 },
    missionBaselineAuctionsWon: { 'closed-circle-counterfeit': 14 },
    relationshipTrust: { 'npc-0': 8, 'npc-1': 22, 'npc-6': 12 },
    relationshipRivalry: { 'npc-2': 18 },
    relationshipDebt: { 'npc-1': 4, 'npc-6': 10 },
    completed: false,
    epilogueId: null,
  },
};

const finaleCampaignSave = {
  ...baseSave,
  cash: 28600,
  reputationXp: 1120,
  highestCash: 28600,
  campaign: {
    started: true,
    activeMissionId: 'lost-collection-finale',
    completedMissionIds: [
      'first-day-floor', 'victor-test', 'black-seal', 'missing-inventory',
      'estate-paper-trail', 'estate-linked-lots', 'estate-false-paper', 'estate-restoration-trace', 'estate-night-clearances', 'estate-mira-offer',
      'dealer-war-leak', 'dealer-war-pressure', 'dealer-war-ally', 'dealer-war-proxy', 'dealer-war-counteroffer', 'dealer-war-address',
      'closed-circle-preview', 'closed-circle-sealed-bid', 'closed-circle-debt', 'closed-circle-counterfeit', 'closed-circle-silent-room', 'closed-circle-ledger-room',
      'lost-collection-route', 'lost-collection-market-read', 'lost-collection-pressure-run', 'lost-collection-prep',
    ],
    evidenceIds: [
      'veyr-black-seal', 'veyr-buyer-list', 'circle-sponsor-token', 'lost-collection-index', 'veyr-river-route',
    ],
    branchChoiceIds: ['dealer-ally-mira', 'finale-route:river-archive', 'finale-partner-mira', 'optional:finale-market-read-winning'],
    missionBaselineAuctionsPlayed: { 'lost-collection-finale': 30 },
    missionBaselineAuctionsWon: { 'lost-collection-finale': 18 },
    relationshipTrust: { 'npc-0': 8, 'npc-1': 30, 'npc-6': 12 },
    relationshipRivalry: { 'npc-2': 22 },
    relationshipDebt: { 'npc-1': 4, 'npc-6': 10 },
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

async function installSeed(page, lang, save) {
  await page.addInitScript(({ key, seededSave, locale }) => {
    window.YaGames = {
      init: async () => ({
        environment: { i18n: { lang: locale } },
        features: {
          LoadingAPI: { ready() {} },
          GameplayAPI: { start() {}, stop() {} },
        },
      }),
    };
    localStorage.setItem(key, JSON.stringify(seededSave));
  }, { key: SAVE_KEY, seededSave: save, locale: lang });
}

async function clickGame(page, gameX, gameY) {
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  assert(box, 'Campaign canvas has no bounding box');
  await page.mouse.click(box.x + (gameX / GAME_WIDTH) * box.width, box.y + (gameY / GAME_HEIGHT) * box.height);
}

async function openCampaign(page) {
  await page.locator('canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(650);
  await clickGame(page, 740, 218);
  await page.waitForTimeout(700);
}

async function captureHub(browser, localeCode, locale, viewport, file) {
  const context = await browser.newContext({ viewport, locale, deviceScaleFactor: 1 });
  const page = await context.newPage();
  try {
    await installSeed(page, localeCode, earlyCampaignSave);
    await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });
    await openCampaign(page);
    await saveShot(page, localeCode, file);
  } finally {
    await context.close();
  }
}

async function captureSecondary(browser, localeCode, locale, viewport, file, target) {
  const context = await browser.newContext({ viewport, locale, deviceScaleFactor: 1 });
  const page = await context.newPage();
  try {
    await installSeed(page, localeCode, lateCampaignSave);
    await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });
    await openCampaign(page);
    await clickGame(page, target === 'inbox' ? 644 : 790, 50);
    await page.waitForTimeout(650);
    await saveShot(page, localeCode, file);
  } finally {
    await context.close();
  }
}

async function captureFinale(browser, localeCode, locale, viewport, file) {
  const context = await browser.newContext({ viewport, locale, deviceScaleFactor: 1 });
  const page = await context.newPage();
  try {
    await installSeed(page, localeCode, finaleCampaignSave);
    await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });
    await openCampaign(page);
    await clickGame(page, 1036, 612);
    await page.waitForTimeout(700);
    await saveShot(page, localeCode, file);
  } finally {
    await context.close();
  }
}

async function saveShot(page, localeCode, file) {
  const outputDir = path.join(reviewRoot, localeCode);
  ensureDirectory(outputDir);
  const screenshot = await page.screenshot({ type: 'png' });
  assert(screenshot.length > 15_000, `${file} looks corrupt or empty`);
  fs.writeFileSync(path.join(outputDir, file), screenshot);
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
      await captureHub(browser, localeCode, locale, { width: 1280, height: 720 }, '01-desktop-black-seal.png');
      await captureHub(browser, localeCode, locale, { width: 844, height: 390 }, '02-compact-black-seal.png');
      await captureSecondary(browser, localeCode, locale, { width: 1280, height: 720 }, '03-desktop-inbox.png', 'inbox');
      await captureSecondary(browser, localeCode, locale, { width: 844, height: 390 }, '04-compact-inbox.png', 'inbox');
      await captureSecondary(browser, localeCode, locale, { width: 1280, height: 720 }, '05-desktop-bonus-goals.png', 'bonus');
      await captureSecondary(browser, localeCode, locale, { width: 844, height: 390 }, '06-compact-bonus-goals.png', 'bonus');
      await captureFinale(browser, localeCode, locale, { width: 1280, height: 720 }, '07-desktop-lost-collection.png');
      await captureFinale(browser, localeCode, locale, { width: 844, height: 390 }, '08-compact-lost-collection.png');
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

console.log('P9 Campaign RU/EN hub + inbox + bonus goals + Lost Collection desktop/844x390 visual review capture OK');

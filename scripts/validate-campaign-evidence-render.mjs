import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const debugRoot = path.join(root, 'release', 'screenshots', 'debug');
const previewUrl = 'http://127.0.0.1:4186';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const SAVE_KEY = 'auction-hunter.save.v1';
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

const completedSave = {
  version: 1,
  updatedAt: 1,
  cash: 33600,
  collection: ['film-camera', 'pocket-watch'],
  claimedSetRewards: [],
  reputationXp: 1420,
  lastDailyCompletedDay: null,
  onboardingComplete: true,
  auctionsWon: 18,
  auctionsPlayed: 30,
  lifetimeSales: 62000,
  highestCash: 33600,
  contractDayKey: null,
  contractProgress: {},
  claimedContractRewards: [],
  claimedAchievements: [],
  businessUpgrades: { warehouse: 1, contractsDesk: 1, showroom: 1 },
  auctionHistory: [],
  buyerMarketDayKey: null,
  claimedBuyerOfferIds: [],
  campaign: {
    started: true,
    activeMissionId: null,
    completedMissionIds: [
      'first-day-floor', 'victor-test', 'black-seal', 'missing-inventory',
      'estate-paper-trail', 'estate-linked-lots', 'estate-false-paper', 'estate-restoration-trace', 'estate-night-clearances', 'estate-mira-offer',
      'dealer-war-leak', 'dealer-war-pressure', 'dealer-war-ally', 'dealer-war-nadia-archive', 'dealer-war-proxy', 'dealer-war-counteroffer', 'dealer-war-address',
      'closed-circle-preview', 'closed-circle-sealed-bid', 'closed-circle-debt', 'closed-circle-counterfeit', 'closed-circle-silent-room', 'closed-circle-ledger-room',
      'lost-collection-route', 'lost-collection-market-read', 'lost-collection-pressure-run', 'lost-collection-prep', 'lost-collection-finale',
    ],
    evidenceIds: ['veyr-black-seal', 'veyr-buyer-list', 'circle-sponsor-token', 'lost-collection-index', 'veyr-river-route'],
    branchChoiceIds: ['dealer-ally-mira', 'nadia-shared-lead', 'finale-route:river-archive', 'finale-partner-mira'],
    missionBaselineAuctionsPlayed: {},
    missionBaselineAuctionsWon: {},
    relationshipTrust: { 'npc-0': 8, 'npc-1': 30, 'npc-6': 18 },
    relationshipRivalry: { 'npc-2': 22 },
    relationshipDebt: { 'npc-1': 4, 'npc-6': 7 },
    completed: true,
    epilogueId: 'shared-truth',
  },
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
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
  throw new Error('Timed out waiting for campaign evidence render preview server');
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
  assert(box, 'Campaign canvas has no bounding box');
  await page.mouse.click(box.x + (gameX / GAME_WIDTH) * box.width, box.y + (gameY / GAME_HEIGHT) * box.height);
}

async function regionStats(page, screenshot, region) {
  return page.evaluate(async ({ screenshotBase64, region: target }) => {
    const image = new Image();
    image.src = `data:image/png;base64,${screenshotBase64}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Unable to create campaign evidence analysis canvas');
    context.drawImage(image, 0, 0);
    const x = Math.max(0, Math.floor((target.x / 1280) * image.width));
    const y = Math.max(0, Math.floor((target.y / 720) * image.height));
    const width = Math.max(1, Math.floor((target.width / 1280) * image.width));
    const height = Math.max(1, Math.floor((target.height / 720) * image.height));
    const pixels = context.getImageData(x, y, width, height).data;
    let luminance = 0;
    let nonBlack = 0;
    let samples = 0;
    for (let index = 0; index < pixels.length; index += 16) {
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      luminance += (r + g + b) / 3;
      if (r + g + b > 30) nonBlack += 1;
      samples += 1;
    }
    return { mean: luminance / Math.max(1, samples), nonBlackRatio: nonBlack / Math.max(1, samples) };
  }, { screenshotBase64: screenshot.toString('base64'), region });
}

async function validateViewport(browser, viewport) {
  const context = await browser.newContext({ viewport, locale: 'en-US', deviceScaleFactor: 1 });
  const page = await context.newPage();
  try {
    await page.addInitScript(({ key, save }) => {
      window.YaGames = {
        init: async () => ({
          environment: { i18n: { lang: 'en' } },
          features: { LoadingAPI: { ready() {} }, GameplayAPI: { start() {}, stop() {} } },
        }),
      };
      localStorage.setItem(key, JSON.stringify(save));
    }, { key: SAVE_KEY, save: completedSave });
    await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });
    await page.locator('canvas').waitFor({ state: 'visible' });
    await page.waitForTimeout(650);
    await clickGame(page, 740, 218);
    await page.waitForTimeout(800);

    const canvas = page.locator('canvas');
    const screenshot = await canvas.screenshot({ type: 'png' });
    const indexStats = await regionStats(page, screenshot, { x: 85, y: 331, width: 146, height: 112 });
    const routeStats = await regionStats(page, screenshot, { x: 85, y: 493, width: 146, height: 112 });

    if (routeStats.mean <= 12 || routeStats.nonBlackRatio <= 0.22) {
      fs.mkdirSync(debugRoot, { recursive: true });
      fs.writeFileSync(path.join(debugRoot, `campaign-evidence-${viewport.width}x${viewport.height}.png`), screenshot);
      throw new Error(`River Archive Route evidence art rendered blank/dark at ${viewport.width}x${viewport.height}: mean=${routeStats.mean.toFixed(1)}, nonBlack=${routeStats.nonBlackRatio.toFixed(2)}`);
    }
    assert(indexStats.mean > 12 && indexStats.nonBlackRatio > 0.22, `Lost Collection Index evidence art rendered blank at ${viewport.width}x${viewport.height}`);
    console.log(`${viewport.width}x${viewport.height}: index mean=${indexStats.mean.toFixed(1)}, route mean=${routeStats.mean.toFixed(1)}`);
  } finally {
    await context.close();
  }
}

const preview = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4186'], {
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
    await validateViewport(browser, { width: 1280, height: 720 });
    await validateViewport(browser, { width: 844, height: 390 });
  } finally {
    await browser.close();
  }
} catch (error) {
  console.error(previewLog);
  throw error;
} finally {
  await stopPreview(preview);
}

console.log('P9 campaign evidence render OK: final index and River Archive Route are non-blank on desktop + 844x390');

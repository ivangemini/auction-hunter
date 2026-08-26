import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reviewRoot = path.join(root, 'release', 'screenshots', 'showroom-review');
const debugRoot = path.join(root, 'release', 'screenshots', 'debug');
const previewUrl = 'http://127.0.0.1:4188';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const SAVE_KEY = 'auction-hunter.save.v1';

const collection = [
  'toolbox', 'toy-robot', 'film-camera', 'pocket-watch', 'porcelain-figurine',
  'arcade-handheld', 'clockwork-automaton', 'art-deco-lamp', 'master-study',
  'chronograph-watch', 'first-edition-book', 'signed-vinyl',
];

const collectionItems = collection.map((itemId, index) => ({
  id: `showroom-review-${itemId}`,
  itemId,
  appraisedValue: 1250 + index * 420,
  condition: Math.min(0.98, 0.72 + index * 0.023),
  restored: index % 3 === 0,
  traitIds: index % 4 === 0
    ? ['documented-history', 'matching-serials']
    : index % 4 === 1
      ? ['original-packaging']
      : index % 4 === 2
        ? ['period-design']
        : ['mechanical'],
  acquiredAt: index + 1,
}));

const seedSave = {
  version: 1,
  updatedAt: 1,
  cash: 185000,
  collection,
  collectionItems,
  claimedSetRewards: ['garage-starters'],
  reputationXp: 960,
  lastDailyCompletedDay: null,
  onboardingComplete: true,
  auctionsWon: 42,
  auctionsPlayed: 67,
  lifetimeSales: 162400,
  highestCash: 212000,
  contractDayKey: null,
  contractProgress: {},
  claimedContractRewards: [],
  claimedAchievements: [],
  businessUpgrades: { warehouse: 2, contractsDesk: 2, showroom: 3 },
  auctionHistory: [],
  buyerMarketDayKey: null,
  claimedBuyerOfferIds: [],
  claimedCollectorRequests: [],
  rivalEncounters: {},
  rivalPlayerWins: {},
  rivalWins: {},
  discoveredItemIds: collection,
  bestConditionByItem: {},
  bestValueByItem: {},
  discoveredVariantTraitIds: ['documented-history', 'matching-serials', 'original-packaging', 'period-design', 'mechanical'],
  discoveryChainProgress: {},
  discoveryChainLastAuction: {},
  completedDiscoveryChains: [],
  campaign: {
    started: true,
    activeMissionId: null,
    completedMissionIds: [],
    evidenceIds: [],
    branchChoiceIds: [],
    missionBaselineAuctionsPlayed: {},
    missionBaselineAuctionsWon: {},
    relationshipTrust: {},
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
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('Timed out waiting for Showroom review preview server');
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
  await page.mouse.click(
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
  }, { key: SAVE_KEY, save: seedSave, lang: platformLocale });
}

async function bootShowroom(context, platformLocale) {
  const page = await context.newPage();
  await installSeed(page, platformLocale);
  await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(800);

  // Real navigation: lot selection -> Collection Book -> Office -> Dealer Showroom.
  await clickGame(page, 1000, 112);
  await page.waitForTimeout(520);
  await clickGame(page, 995, 70);
  await page.waitForTimeout(600);
  const office = await page.screenshot({ type: 'png' });
  await clickGame(page, 534, 91);
  await page.waitForTimeout(700);
  return { page, office };
}

function validatePng(buffer, name, width, height) {
  assert(buffer.length > 20_000, `${name} looks corrupt or empty (${buffer.length} bytes)`);
  assert(buffer.subarray(12, 16).toString('ascii') === 'IHDR', `${name} is not a PNG`);
  assert(buffer.readUInt32BE(16) === width && buffer.readUInt32BE(20) === height,
    `${name} must be ${width}x${height}, got ${buffer.readUInt32BE(16)}x${buffer.readUInt32BE(20)}`);
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
      if (!context) throw new Error('Unable to create Showroom visual-review analysis canvas');
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

async function captureViewport(browser, localeCode, locale, viewport, prefix) {
  const outputDir = path.join(reviewRoot, localeCode);
  ensureDirectory(outputDir);
  const context = await browser.newContext({ viewport, locale, deviceScaleFactor: 1 });

  try {
    const { page, office } = await bootShowroom(context, localeCode);
    const showroom = await page.screenshot({ type: 'png' });
    validatePng(showroom, `${localeCode} ${prefix} Showroom`, viewport.width, viewport.height);
    const transition = await imageDifferenceRatio(page, office, showroom);
    if (transition <= 0.18) {
      ensureDirectory(debugRoot);
      fs.writeFileSync(path.join(debugRoot, `showroom-${localeCode}-${prefix}-office.png`), office);
      fs.writeFileSync(path.join(debugRoot, `showroom-${localeCode}-${prefix}-room.png`), showroom);
      throw new Error(`${localeCode} ${prefix} Showroom did not visibly replace Office (${transition.toFixed(3)})`);
    }
    fs.writeFileSync(path.join(outputDir, `01-${prefix}-showroom.png`), showroom);

    // First cabinet slot is guaranteed to contain the second curated item in this seed.
    await clickGame(page, 569, 259);
    await page.waitForTimeout(360);
    const inspect = await page.screenshot({ type: 'png' });
    validatePng(inspect, `${localeCode} ${prefix} Showroom inspect`, viewport.width, viewport.height);
    const inspectDifference = await imageDifferenceRatio(page, showroom, inspect);
    assert(inspectDifference > 0.12, `${localeCode} ${prefix} Showroom dossier did not visibly open (${inspectDifference.toFixed(3)})`);
    fs.writeFileSync(path.join(outputDir, `02-${prefix}-inspect.png`), inspect);

    await page.close();
  } finally {
    await context.close();
  }
}

fs.rmSync(reviewRoot, { recursive: true, force: true });
ensureDirectory(reviewRoot);

const preview = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4188'], {
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
      await captureViewport(browser, localeCode, locale, { width: 1280, height: 720 }, 'desktop');
      await captureViewport(browser, localeCode, locale, { width: 844, height: 390 }, 'compact');
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

for (const locale of ['ru', 'en']) {
  for (const file of ['01-desktop-showroom.png', '02-desktop-inspect.png', '01-compact-showroom.png', '02-compact-inspect.png']) {
    console.log(path.relative(root, path.join(reviewRoot, locale, file)).split(path.sep).join('/'));
  }
}
console.log('P10 Dealer Showroom RU/EN desktop/844x390 visual review capture OK');

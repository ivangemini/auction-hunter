import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const debugRoot = path.join(root, 'release', 'screenshots', 'debug');
const previewUrl = 'http://127.0.0.1:4185';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const SAVE_KEY = 'auction-hunter.save.v1';
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'compact', width: 844, height: 390 },
];

const baseSave = {
  version: 1,
  updatedAt: 1,
  cash: 28000,
  collection: ['film-camera', 'pocket-watch'],
  claimedSetRewards: [],
  reputationXp: 1100,
  lastDailyCompletedDay: null,
  onboardingComplete: true,
  auctionsWon: 18,
  auctionsPlayed: 30,
  lifetimeSales: 62000,
  highestCash: 28000,
  contractDayKey: null,
  contractProgress: {},
  claimedContractRewards: [],
  claimedAchievements: [],
  businessUpgrades: { warehouse: 1, contractsDesk: 1, showroom: 1 },
  auctionHistory: [],
  buyerMarketDayKey: null,
  claimedBuyerOfferIds: [],
};

const lateCampaignSave = {
  ...baseSave,
  campaign: {
    started: true,
    activeMissionId: 'closed-circle-counterfeit',
    completedMissionIds: [
      'first-day-floor', 'victor-test', 'black-seal', 'missing-inventory',
      'estate-paper-trail', 'estate-linked-lots', 'estate-false-paper', 'estate-restoration-trace', 'estate-night-clearances', 'estate-mira-offer',
      'dealer-war-leak', 'dealer-war-pressure', 'dealer-war-ally', 'dealer-war-nadia-archive', 'dealer-war-proxy', 'dealer-war-counteroffer', 'dealer-war-address',
      'closed-circle-preview', 'closed-circle-sealed-bid', 'closed-circle-debt',
    ],
    evidenceIds: ['veyr-black-seal', 'private-auction-lead', 'closed-circle-address', 'circle-preview-code', 'veyr-buyer-list'],
    branchChoiceIds: ['dealer-ally-mira', 'nadia-shared-lead'],
    missionBaselineAuctionsPlayed: { 'closed-circle-counterfeit': 24 },
    missionBaselineAuctionsWon: { 'closed-circle-counterfeit': 14 },
    relationshipTrust: { 'npc-0': 8, 'npc-1': 22, 'npc-6': 18 },
    relationshipRivalry: { 'npc-2': 18 },
    relationshipDebt: { 'npc-1': 4, 'npc-6': 7 },
    completed: false,
    epilogueId: null,
  },
};

const finaleCampaignSave = {
  ...baseSave,
  campaign: {
    started: true,
    activeMissionId: 'lost-collection-finale',
    completedMissionIds: [
      'first-day-floor', 'victor-test', 'black-seal', 'missing-inventory',
      'estate-paper-trail', 'estate-linked-lots', 'estate-false-paper', 'estate-restoration-trace', 'estate-night-clearances', 'estate-mira-offer',
      'dealer-war-leak', 'dealer-war-pressure', 'dealer-war-ally', 'dealer-war-nadia-archive', 'dealer-war-proxy', 'dealer-war-counteroffer', 'dealer-war-address',
      'closed-circle-preview', 'closed-circle-sealed-bid', 'closed-circle-debt', 'closed-circle-counterfeit', 'closed-circle-silent-room', 'closed-circle-ledger-room',
      'lost-collection-route', 'lost-collection-market-read', 'lost-collection-pressure-run', 'lost-collection-prep',
    ],
    evidenceIds: ['veyr-black-seal', 'veyr-buyer-list', 'circle-sponsor-token', 'lost-collection-index', 'veyr-river-route'],
    branchChoiceIds: ['dealer-ally-mira', 'nadia-shared-lead', 'finale-route:river-archive', 'finale-partner-mira'],
    missionBaselineAuctionsPlayed: { 'lost-collection-finale': 30 },
    missionBaselineAuctionsWon: { 'lost-collection-finale': 18 },
    relationshipTrust: { 'npc-0': 8, 'npc-1': 30, 'npc-6': 18 },
    relationshipRivalry: { 'npc-2': 22 },
    relationshipDebt: { 'npc-1': 4, 'npc-6': 7 },
    completed: false,
    epilogueId: null,
  },
};

const completedCampaignSave = {
  ...baseSave,
  cash: 33600,
  reputationXp: 1420,
  campaign: {
    ...finaleCampaignSave.campaign,
    activeMissionId: null,
    completedMissionIds: [...finaleCampaignSave.campaign.completedMissionIds, 'lost-collection-finale'],
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
  throw new Error('Timed out waiting for P9 visual-state validation preview server');
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

async function installSeed(page, save) {
  await page.addInitScript(({ key, seededSave }) => {
    window.YaGames = {
      init: async () => ({
        environment: { i18n: { lang: 'en' } },
        features: { LoadingAPI: { ready() {} }, GameplayAPI: { start() {}, stop() {} } },
      }),
    };
    localStorage.setItem(key, JSON.stringify(seededSave));
  }, { key: SAVE_KEY, seededSave: save });
}

async function bootCampaign(browser, viewport, save) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, locale: 'en-US', deviceScaleFactor: 1 });
  const page = await context.newPage();
  await installSeed(page, save);
  await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(650);
  await clickGame(page, 740, 218);
  await page.waitForTimeout(700);
  return { context, page };
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
      if (!context) throw new Error('Unable to create P9 visual-state analysis canvas');
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

function writeDebug(viewport, label, before, after) {
  fs.mkdirSync(debugRoot, { recursive: true });
  fs.writeFileSync(path.join(debugRoot, `p9-${viewport.name}-${label}-before.png`), before);
  fs.writeFileSync(path.join(debugRoot, `p9-${viewport.name}-${label}-after.png`), after);
}

async function assertTransition(browser, viewport, save, label, clickX, clickY, minRatio) {
  const { context, page } = await bootCampaign(browser, viewport, save);
  try {
    const before = await page.screenshot({ type: 'png' });
    await clickGame(page, clickX, clickY);
    await page.waitForTimeout(650);
    const after = await page.screenshot({ type: 'png' });
    const ratio = await differenceRatio(page, before, after);
    if (ratio <= minRatio) {
      writeDebug(viewport, label, before, after);
      throw new Error(`${viewport.name} ${label} did not visibly replace campaign state (${ratio.toFixed(3)})`);
    }
  } finally {
    await context.close();
  }
}

const preview = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4185'], {
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
    for (const viewport of VIEWPORTS) {
      await assertTransition(browser, viewport, lateCampaignSave, 'inbox', 644, 50, 0.12);
      await assertTransition(browser, viewport, lateCampaignSave, 'bonus-goals', 790, 50, 0.12);
      await assertTransition(browser, viewport, finaleCampaignSave, 'finale', 1036, 612, 0.16);
      await assertTransition(browser, viewport, completedCampaignSave, 'persistent-epilogue', 1036, 588, 0.16);
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

console.log('P9 campaign visual-state transitions OK: Inbox, Bonus Goals, Finale and persistent Epilogue on desktop + 844x390');

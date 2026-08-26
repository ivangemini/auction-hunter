import { expect, test, type Page } from '@playwright/test';
import '../src/data/testSetup';
import { CAMPAIGN_CHAPTER_ORDER, CAMPAIGN_MISSIONS } from '../src/data/campaign';
import { createDefaultSave } from '../src/game/save';

const SAVE_KEY = 'auction-hunter.save.v1';
const MATRIX_SEED_KEY = 'auction-hunter.p9-matrix-seed';
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

const orderedMissions = [...CAMPAIGN_MISSIONS].sort((left, right) => (
  CAMPAIGN_CHAPTER_ORDER[left.chapterId] - CAMPAIGN_CHAPTER_ORDER[right.chapterId]
  || left.order - right.order
));

async function clickGame(page: Page, gameX: number, gameY: number): Promise<void> {
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Campaign matrix canvas has no bounding box');
  await page.mouse.click(
    box.x + (gameX / GAME_WIDTH) * box.width,
    box.y + (gameY / GAME_HEIGHT) * box.height,
  );
}

function missionSave(index: number) {
  const save = createDefaultSave();
  const mission = orderedMissions[index];
  if (!mission) throw new Error(`Missing campaign matrix mission at index ${index}`);

  const completedMissionIds = orderedMissions.slice(0, index).map((entry) => entry.id);
  const evidenceIds = orderedMissions
    .slice(0, index)
    .flatMap((entry) => entry.evidenceRewardIds ?? []);

  save.updatedAt = 10_000 + index;
  save.cash = 75_000;
  save.reputationXp = 1_400;
  save.onboardingComplete = true;
  save.auctionsPlayed = 48 + index;
  save.auctionsWon = 24 + Math.floor(index / 2);
  save.highestCash = save.cash;
  save.campaign = {
    ...save.campaign,
    started: true,
    activeMissionId: mission.id,
    completedMissionIds,
    evidenceIds: [...new Set(evidenceIds)],
    branchChoiceIds: [],
    missionBaselineAuctionsPlayed: { [mission.id]: save.auctionsPlayed },
    missionBaselineAuctionsWon: { [mission.id]: save.auctionsWon },
    relationshipTrust: { 'npc-0': 8, 'npc-1': 16, 'npc-6': 12 },
    relationshipRivalry: { 'npc-2': 14 },
    relationshipDebt: { 'npc-1': 3 },
    completed: false,
    epilogueId: null,
  };
  return save;
}

test('every authored P9 mission renders through the production browser path', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1280x720', 'One full desktop mission matrix is sufficient; compact states have dedicated P9 visual gates.');
  test.setTimeout(120_000);

  let currentMissionId = 'bootstrap';
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(`${currentMissionId}: ${error.message}`));

  await page.addInitScript(({ saveKey, seedKey }) => {
    window.YaGames = {
      init: async () => ({
        environment: { i18n: { lang: 'en' } },
        features: { LoadingAPI: { ready() {} }, GameplayAPI: { start() {}, stop() {} } },
      }),
    } as never;
    const seededSave = sessionStorage.getItem(seedKey);
    if (seededSave) localStorage.setItem(saveKey, seededSave);
  }, { saveKey: SAVE_KEY, seedKey: MATRIX_SEED_KEY });

  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();

  for (let index = 0; index < orderedMissions.length; index += 1) {
    const mission = orderedMissions[index];
    if (!mission) continue;
    currentMissionId = mission.id;
    const save = missionSave(index);

    await page.evaluate(({ seedKey, seededSave }) => {
      sessionStorage.setItem(seedKey, JSON.stringify(seededSave));
    }, { seedKey: MATRIX_SEED_KEY, seededSave: save });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('canvas'), mission.id).toBeVisible();
    await page.waitForTimeout(180);

    await clickGame(page, 740, 218);
    await page.waitForTimeout(220);

    const persisted = await page.evaluate((saveKey) => JSON.parse(localStorage.getItem(saveKey) ?? '{}'), SAVE_KEY);
    expect(persisted.campaign?.activeMissionId, mission.id).toBe(mission.id);
    expect(persisted.campaign?.completed, mission.id).toBe(false);
    expect(pageErrors, mission.id).toEqual([]);
  }

  expect(orderedMissions).toHaveLength(28);
  expect(orderedMissions[0]?.id).toBe('first-day-floor');
  expect(orderedMissions.at(-1)?.id).toBe('lost-collection-finale');
});

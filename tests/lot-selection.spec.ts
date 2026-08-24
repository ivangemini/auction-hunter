import { expect, test, type Page } from '@playwright/test';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const SAVE_KEY = 'auction-hunter.save.v1';

async function clickGame(page: Page, gameX: number, gameY: number): Promise<void> {
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Game canvas has no bounding box');
  await page.mouse.click(
    box.x + (gameX / GAME_WIDTH) * box.width,
    box.y + (gameY / GAME_HEIGHT) * box.height,
  );
}

async function presentedPayloads(page: Page): Promise<Array<{ tierId: string; lotIds: string[]; modifierIds: Array<string | null> }>> {
  return page.evaluate(() => {
    const events = (window as any).__lotSelectionEvents ?? [];
    return events
      .filter((event: any) => event?.eventName === 'lot_options_presented')
      .map((event: any) => event.payload);
  });
}

test('normal auction flow presents stable unique lots and locks the committed choice', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1280x720', 'One desktop interaction pass is sufficient');

  await page.addInitScript(({ saveKey }) => {
    localStorage.setItem(saveKey, JSON.stringify({
      version: 1,
      updatedAt: 1,
      cash: 50000,
      collection: [],
      reputationXp: 360,
      onboardingComplete: true,
      auctionsWon: 10,
      auctionsPlayed: 10,
    }));
    (window as any).__lotSelectionEvents = [];
    window.addEventListener('auction-hunter:analytics', (event) => {
      (window as any).__lotSelectionEvents.push((event as CustomEvent).detail);
    });
  }, { saveKey: SAVE_KEY });

  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect.poll(async () => (await presentedPayloads(page)).length).toBe(1);

  const initialCollector = (await presentedPayloads(page))[0];
  expect(initialCollector?.tierId).toBe('collector');
  expect(initialCollector?.lotIds).toHaveLength(3);
  expect(new Set(initialCollector?.lotIds).size).toBe(3);
  expect(initialCollector?.modifierIds).toHaveLength(3);

  await clickGame(page, 640, 151); // Estate.
  await expect.poll(async () => (await presentedPayloads(page)).length).toBe(2);
  expect((await presentedPayloads(page))[1]?.tierId).toBe('estate');

  await clickGame(page, 1030, 151); // Back to Collector in the same market cycle.
  await expect.poll(async () => (await presentedPayloads(page)).length).toBe(3);
  const collectorAgain = (await presentedPayloads(page))[2];
  expect(collectorAgain?.tierId).toBe('collector');
  expect(collectorAgain?.lotIds).toEqual(initialCollector?.lotIds);
  expect(collectorAgain?.modifierIds).toEqual(initialCollector?.modifierIds);

  await clickGame(page, 240, 625); // Commit first Collector option.
  await expect.poll(() => page.evaluate(() => {
    const events = (window as any).__lotSelectionEvents ?? [];
    return events.filter((event: any) => event?.eventName === 'lot_option_selected').length;
  })).toBe(1);
  expect(await page.evaluate(() => {
    const events = (window as any).__lotSelectionEvents ?? [];
    return events.some((event: any) => event?.eventName === 'auction_started');
  })).toBe(false);

  const presentationsAtCommit = (await presentedPayloads(page)).length;
  await clickGame(page, 640, 151); // Tier tabs are visible but intentionally locked after Choose.
  await page.waitForTimeout(150);
  expect((await presentedPayloads(page)).length).toBe(presentationsAtCommit);

  await clickGame(page, 1038, 620);
  await expect.poll(() => page.evaluate(() => {
    const events = (window as any).__lotSelectionEvents ?? [];
    return events.filter((event: any) => event?.eventName === 'auction_started').length;
  })).toBe(1);
});

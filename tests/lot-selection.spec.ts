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

test('normal auction flow presents three unique lots before bidding starts', async ({ page }, testInfo) => {
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

  const presented = await expect.poll(async () => page.evaluate(() => {
    const events = (window as any).__lotSelectionEvents ?? [];
    return events.find((event: any) => event?.eventName === 'lot_options_presented')?.payload ?? null;
  })).not.toBeNull();
  void presented;

  const payload = await page.evaluate(() => {
    const events = (window as any).__lotSelectionEvents ?? [];
    return events.find((event: any) => event?.eventName === 'lot_options_presented')?.payload;
  });
  expect(payload.lotIds).toHaveLength(3);
  expect(new Set(payload.lotIds).size).toBe(3);
  expect(payload.modifierIds).toHaveLength(3);

  await clickGame(page, 240, 625);
  await expect.poll(() => page.evaluate(() => {
    const events = (window as any).__lotSelectionEvents ?? [];
    return events.filter((event: any) => event?.eventName === 'lot_option_selected').length;
  })).toBe(1);
  expect(await page.evaluate(() => {
    const events = (window as any).__lotSelectionEvents ?? [];
    return events.some((event: any) => event?.eventName === 'auction_started');
  })).toBe(false);

  await clickGame(page, 1038, 620);
  await expect.poll(() => page.evaluate(() => {
    const events = (window as any).__lotSelectionEvents ?? [];
    return events.filter((event: any) => event?.eventName === 'auction_started').length;
  })).toBe(1);
});

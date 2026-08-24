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

test('Buyer Market completes one premium sale and persists the daily claim', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1280x720', 'One desktop transaction pass is sufficient');

  await page.addInitScript((saveKey) => {
    if (!localStorage.getItem(saveKey)) {
      localStorage.setItem(saveKey, JSON.stringify({
        version: 1,
        updatedAt: 1,
        cash: 2500,
        collection: [
          'toolbox',
          'cassette-player',
          'toy-robot',
          'signed-poster',
          'pocket-watch',
          'vinyl-box',
          'prototype-toy',
          'art-deco-lamp',
        ],
        reputationXp: 0,
        onboardingComplete: true,
        auctionsWon: 0,
        auctionsPlayed: 0,
      }));
    }
    (window as any).__buyerEvents = [];
    window.addEventListener('auction-hunter:analytics', (event) => {
      (window as any).__buyerEvents.push((event as CustomEvent).detail);
    });
  }, SAVE_KEY);

  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();

  await clickGame(page, 940, 218); // Collection Book from lot selection.
  await page.waitForTimeout(100);
  await clickGame(page, 775, 72); // Buyer Market.
  await page.waitForTimeout(150);

  const before = await page.evaluate((saveKey) => JSON.parse(localStorage.getItem(saveKey) ?? '{}'), SAVE_KEY);
  const beforeCollectionLength = before.collection.length as number;
  const beforeCash = before.cash as number;

  await clickGame(page, 250, 590); // First daily buyer's sale action.

  await expect.poll(() => page.evaluate(() => {
    const events = (window as any).__buyerEvents ?? [];
    return events.filter((event: any) => event?.eventName === 'buyer_sale_completed').length;
  })).toBe(1);

  const after = await page.evaluate((saveKey) => JSON.parse(localStorage.getItem(saveKey) ?? '{}'), SAVE_KEY);
  expect(after.collection).toHaveLength(beforeCollectionLength - 1);
  expect(after.cash).toBeGreaterThan(beforeCash);
  expect(after.claimedBuyerOfferIds).toHaveLength(1);
  expect(typeof after.buyerMarketDayKey).toBe('string');

  await clickGame(page, 250, 590); // Completed offer has no second sale button.
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => {
    const events = (window as any).__buyerEvents ?? [];
    return events.filter((event: any) => event?.eventName === 'buyer_sale_completed').length;
  })).toBe(1);

  await page.reload();
  await expect(page.locator('canvas')).toBeVisible();
  const reloaded = await page.evaluate((saveKey) => JSON.parse(localStorage.getItem(saveKey) ?? '{}'), SAVE_KEY);
  expect(reloaded.claimedBuyerOfferIds).toEqual(after.claimedBuyerOfferIds);
  expect(reloaded.cash).toBe(after.cash);
});

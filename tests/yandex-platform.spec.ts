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

async function installYandexContractStub(page: Page): Promise<void> {
  await page.addInitScript(({ saveKey }) => {
    const calls = { ready: 0, start: 0, stop: 0, sdkEvents: [] as string[] };
    (window as any).__yandexContractCalls = calls;
    (window as any).YaGames = {
      init: async () => ({
        environment: { i18n: { lang: 'ru-RU' } },
        features: {
          LoadingAPI: {
            ready() {
              calls.ready += 1;
            },
          },
          GameplayAPI: {
            start() {
              calls.start += 1;
            },
            stop() {
              calls.stop += 1;
            },
          },
        },
        on(event: string) {
          calls.sdkEvents.push(event);
        },
        off() {},
      }),
    };
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
  }, { saveKey: SAVE_KEY });
}

test('Yandex Game Ready and gameplay markup follow real scene transitions', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1280x720', 'One desktop orchestration pass is sufficient');
  await installYandexContractStub(page);

  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();

  await expect.poll(() => page.evaluate(() => (window as any).__yandexContractCalls?.ready ?? 0)).toBe(1);
  expect(await page.evaluate(() => document.documentElement.lang)).toBe('ru');
  expect(await page.evaluate(() => (window as any).__yandexContractCalls?.sdkEvents ?? [])).toEqual([
    'game_api_pause',
    'game_api_resume',
  ]);
  expect(await page.evaluate(() => (window as any).__yandexContractCalls?.start ?? 0)).toBe(0);
  expect(await page.evaluate(() => (window as any).__yandexContractCalls?.stop ?? 0)).toBe(0);

  await clickGame(page, 240, 625); // Choose one of the three visible lot options.
  await page.waitForTimeout(120);
  expect(await page.evaluate(() => (window as any).__yandexContractCalls?.start ?? 0)).toBe(0);
  expect(await page.evaluate(() => (window as any).__yandexContractCalls?.stop ?? 0)).toBe(0);

  await clickGame(page, 1038, 620); // Enter the chosen auction.
  await expect.poll(() => page.evaluate(() => (window as any).__yandexContractCalls?.start ?? 0)).toBe(1);
  expect(await page.evaluate(() => (window as any).__yandexContractCalls?.stop ?? 0)).toBe(0);

  await clickGame(page, 580, 626); // Pass at a natural gameplay stop in the polished auction layout.
  await expect.poll(() => page.evaluate(() => (window as any).__yandexContractCalls?.stop ?? 0)).toBe(1);
  expect(await page.evaluate(() => (window as any).__yandexContractCalls?.start ?? 0)).toBe(1);

  await page.waitForTimeout(150);
  expect(await page.evaluate(() => (window as any).__yandexContractCalls?.ready ?? 0)).toBe(1);
});

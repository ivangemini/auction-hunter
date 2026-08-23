import { expect, test } from '@playwright/test';
import { getDailySpecial, localDayKey } from '../src/data/daily';
import { getAuctionTier } from '../src/data/tiers';

test('daily key uses the player local calendar day', () => {
  expect(localDayKey(new Date(2026, 7, 24, 12, 30, 0))).toBe('2026-08-24');
});

test('daily special is deterministic and never selects a locked tier', () => {
  const first = getDailySpecial('2026-08-24', 120);
  const second = getDailySpecial('2026-08-24', 120);

  expect(second).toEqual(first);
  expect(getAuctionTier(first.tierId).minReputationXp).toBeLessThanOrEqual(120);
  expect(first.valueMultiplier).toBe(1.2);
  expect(first.reputationMultiplier).toBe(1.5);
});

import { expect, test } from '@playwright/test';
import { highestUnlockedAuctionTier, unlockedAuctionTiers } from '../src/data/tiers';

test('auction tiers unlock at reputation thresholds', () => {
  expect(unlockedAuctionTiers(0).map((tier) => tier.id)).toEqual(['garage']);
  expect(unlockedAuctionTiers(119).map((tier) => tier.id)).toEqual(['garage']);
  expect(unlockedAuctionTiers(120).map((tier) => tier.id)).toEqual(['garage', 'estate']);
  expect(unlockedAuctionTiers(319).map((tier) => tier.id)).toEqual(['garage', 'estate']);
  expect(unlockedAuctionTiers(320).map((tier) => tier.id)).toEqual(['garage', 'estate', 'collector']);
});

test('highest unlocked tier tracks current reputation', () => {
  expect(highestUnlockedAuctionTier(0).id).toBe('garage');
  expect(highestUnlockedAuctionTier(120).id).toBe('estate');
  expect(highestUnlockedAuctionTier(9999).id).toBe('collector');
});

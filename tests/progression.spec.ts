import { expect, test } from '@playwright/test';
import { FIRST_SESSION_CURVE, projectedReputation } from '../src/data/progression';
import { getAuctionTier } from '../src/data/tiers';

test('early reputation curve requires four Garage wins for Estate', () => {
  const estate = getAuctionTier('estate');
  expect(projectedReputation(3, 0)).toBeLessThan(estate.minReputationXp);
  expect(projectedReputation(4, 0)).toBeGreaterThanOrEqual(estate.minReputationXp);
});

test('seven planned wins unlock Collector at the 30-minute target', () => {
  const collector = getAuctionTier('collector');
  const reputation = projectedReputation(4, 3);
  const finalMilestone = FIRST_SESSION_CURVE[FIRST_SESSION_CURVE.length - 1];

  expect(reputation).toBe(collector.minReputationXp);
  expect(finalMilestone?.id).toBe('collector-unlock');
  expect(finalMilestone?.targetWins).toBe(7);
  expect(finalMilestone?.targetMinute).toBe(30);
});

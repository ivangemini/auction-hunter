import { describe, expect, it } from 'vitest';
import {
  achievementMetricValue,
  collectionResaleRate,
  contractRewardValue,
  nextUpgradeCost,
  selectDailyContracts,
  setRewardValue,
} from './meta';
import type { PlayerSave } from './types';

const save: PlayerSave = {
  version: 1,
  updatedAt: 0,
  cash: 2500,
  collection: ['a', 'a', 'b'],
  claimedSetRewards: ['set-a'],
  reputationXp: 140,
  lastDailyCompletedDay: null,
  onboardingComplete: true,
  auctionsWon: 4,
  auctionsPlayed: 7,
  lifetimeSales: 4200,
  highestCash: 6100,
  contractDayKey: null,
  contractProgress: {},
  claimedContractRewards: [],
  claimedAchievements: [],
  businessUpgrades: { warehouse: 0, contractsDesk: 0, showroom: 0 },
  auctionHistory: [],
  buyerMarketDayKey: null,
  claimedBuyerOfferIds: [],
  discoveryChainProgress: {},
  discoveryChainLastAuction: {},
  completedDiscoveryChains: [],
};

describe('meta progression domain', () => {
  it('selects a deterministic daily subset without duplicates', () => {
    const pool = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }];
    const first = selectDailyContracts(pool, '2026-08-24', 3);
    const second = selectDailyContracts(pool, '2026-08-24', 3);
    expect(first).toEqual(second);
    expect(first).toHaveLength(3);
    expect(new Set(first.map((item) => item.id)).size).toBe(3);
  });

  it('caps resale and scales contract/set rewards by upgrade level', () => {
    expect(collectionResaleRate(0.65, 0)).toBeCloseTo(0.65, 12);
    expect(collectionResaleRate(0.65, 3)).toBeCloseTo(0.8, 12);
    expect(contractRewardValue(500, 2)).toBe(600);
    expect(setRewardValue(900, 3)).toBe(1170);
  });

  it('returns the next business upgrade cost and metric values', () => {
    expect(nextUpgradeCost([100, 200, 300], 0)).toBe(100);
    expect(nextUpgradeCost([100, 200, 300], 2)).toBe(300);
    expect(nextUpgradeCost([100, 200, 300], 3)).toBeNull();
    expect(achievementMetricValue(save, 'uniqueCollection')).toBe(2);
    expect(achievementMetricValue(save, 'highestCash')).toBe(6100);
  });
});

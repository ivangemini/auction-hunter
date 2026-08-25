import { describe, expect, it } from 'vitest';
import { BIDDER_PROFILES } from './balance';
import { COLLECTOR_REQUESTS } from './collectorRequests';
import { DISCOVERY_CHAINS } from './discoveryChains';
import { JACKPOT_VARIANTS } from './jackpotVariants';
import { LOT_MODIFIERS } from './lotModifiers';
import { MARKET_TRENDS, MARKET_TREND_SCHEDULE } from './marketTrends';
import {
  SEALED_AUCTION_CADENCE,
  SEALED_AUCTION_MIN_REP,
  VIP_AUCTION_CADENCE,
  VIP_AUCTION_MIN_REP,
} from './specialAuctions';
import { AUCTION_TIERS } from './tiers';

describe('P8 systemic replayability acceptance', () => {
  it('ships the authored systemic breadth promised by P8', () => {
    expect(BIDDER_PROFILES.length).toBeGreaterThanOrEqual(8);
    expect(LOT_MODIFIERS.length).toBeGreaterThanOrEqual(17);
    expect(MARKET_TRENDS.length).toBeGreaterThanOrEqual(6);
    expect(COLLECTOR_REQUESTS.length).toBeGreaterThanOrEqual(8);
    expect(DISCOVERY_CHAINS.length).toBeGreaterThanOrEqual(7);
    expect(JACKPOT_VARIANTS.length).toBeGreaterThanOrEqual(4);
  });

  it('keeps multi-auction systems persistent rather than daily reskins', () => {
    expect(MARKET_TREND_SCHEDULE.activeAuctions).toBeGreaterThanOrEqual(2);
    expect(MARKET_TREND_SCHEDULE.cooldownAuctions).toBeGreaterThanOrEqual(1);
    expect(DISCOVERY_CHAINS.some((chain) => chain.steps.length >= 5)).toBe(true);
    expect(DISCOVERY_CHAINS.some((chain) => chain.steps.filter((step) => (step.alternativeItemIds?.length ?? 0) > 0).length >= 2)).toBe(true);
  });

  it('keeps special auction formats gated, occasional and inside normal reputation progression', () => {
    const estateUnlock = AUCTION_TIERS.find((tier) => tier.id === 'estate')?.minReputationXp ?? Infinity;
    const collectorUnlock = AUCTION_TIERS.find((tier) => tier.id === 'collector')?.minReputationXp ?? Infinity;

    expect(SEALED_AUCTION_MIN_REP).toBeGreaterThanOrEqual(estateUnlock);
    expect(VIP_AUCTION_MIN_REP).toBeGreaterThanOrEqual(collectorUnlock);
    expect(SEALED_AUCTION_CADENCE).toBeGreaterThanOrEqual(4);
    expect(VIP_AUCTION_CADENCE).toBeGreaterThanOrEqual(3);
  });

  it('keeps rival and jackpot bonuses authored instead of anonymous numeric duplication', () => {
    for (const rival of BIDDER_PROFILES) {
      expect(rival.weakness?.ru.length ?? 0).toBeGreaterThan(0);
      expect(rival.weakness?.en.length ?? 0).toBeGreaterThan(0);
      expect(rival.signatureBehavior).toBeDefined();
      expect(rival.specialtyCategories?.length ?? 0).toBeGreaterThanOrEqual(2);
    }

    for (const jackpot of JACKPOT_VARIANTS) {
      expect(jackpot.name.ru.length).toBeGreaterThan(0);
      expect(jackpot.name.en.length).toBeGreaterThan(0);
      expect(jackpot.multiplier).toBeGreaterThan(1);
      expect(jackpot.multiplier).toBeLessThanOrEqual(1.25);
    }
  });
});

import { describe, expect, it } from 'vitest';
import { CAMPAIGN_OPTIONAL_OBJECTIVES, campaignOptionalObjectiveCompleted } from './campaignOptionalObjectives';
import type { PlayerSave } from '../domain/types';

function saveFor(missionId: string): PlayerSave {
  return {
    version: 1,
    updatedAt: 1,
    cash: 10000,
    collection: [],
    collectionItems: [],
    claimedSetRewards: [],
    reputationXp: 0,
    lastDailyCompletedDay: null,
    onboardingComplete: true,
    auctionsWon: 12,
    auctionsPlayed: 20,
    lifetimeSales: 0,
    highestCash: 10000,
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
    rivalMemories: {},
    collectorRequestClaims: [],
    discoveredItemIds: [],
    discoveredVariantTraitIds: [],
    itemDiscoveryRecords: {},
    campaign: {
      started: true,
      activeMissionId: missionId,
      completedMissionIds: [],
      evidenceIds: [],
      branchChoiceIds: [],
      missionBaselineAuctionsPlayed: { [missionId]: 18 },
      missionBaselineAuctionsWon: { [missionId]: 10 },
      relationshipTrust: {},
      relationshipRivalry: {},
      relationshipDebt: {},
      completed: false,
      epilogueId: null,
    },
  };
}

describe('P9 optional mission objectives', () => {
  it('ships multiple optional mastery goals across the campaign', () => {
    expect(CAMPAIGN_OPTIONAL_OBJECTIVES.length).toBeGreaterThanOrEqual(5);
    expect(new Set(CAMPAIGN_OPTIONAL_OBJECTIVES.map((objective) => objective.id)).size).toBe(CAMPAIGN_OPTIONAL_OBJECTIVES.length);
    expect(CAMPAIGN_OPTIONAL_OBJECTIVES.every((objective) => objective.rewardCash > 0 || objective.rewardRep > 0)).toBe(true);
  });

  it('rewards efficient auction play from the mission baseline only', () => {
    const objective = CAMPAIGN_OPTIONAL_OBJECTIVES.find((entry) => entry.id === 'finale-pressure-clean-run')!;
    const save = saveFor(objective.missionId);
    expect(campaignOptionalObjectiveCompleted(objective, save)).toBe(true);
    save.auctionsPlayed = 22;
    expect(campaignOptionalObjectiveCompleted(objective, save)).toBe(false);
  });

  it('supports branch-based mastery without adding another persisted collection', () => {
    const precision = CAMPAIGN_OPTIONAL_OBJECTIVES.find((entry) => entry.id === 'closed-circle-precision-bid')!;
    const save = saveFor(precision.missionId);
    expect(campaignOptionalObjectiveCompleted(precision, save)).toBe(false);
    save.campaign.branchChoiceIds.push('circle-bid:8800');
    expect(campaignOptionalObjectiveCompleted(precision, save)).toBe(true);
    save.campaign.branchChoiceIds.push(`optional:${precision.id}`);
    expect(campaignOptionalObjectiveCompleted(precision, save)).toBe(false);
  });
});

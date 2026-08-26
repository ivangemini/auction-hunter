import { describe, expect, it } from 'vitest';
import { CAMPAIGN_MISSIONS } from '../data/campaign';
import { createDefaultCampaignProgress } from '../game/save';
import {
  applyCampaignRelationshipDelta,
  campaignMissionAvailable,
  completeCampaignMission,
  nextCampaignMission,
  recordCampaignBranchChoice,
  startCampaignMission,
} from './campaign';

describe('campaign progression', () => {
  it('starts with the first mission and respects prerequisites', () => {
    const progress = createDefaultCampaignProgress();
    const first = CAMPAIGN_MISSIONS[0]!;
    const second = CAMPAIGN_MISSIONS[1]!;

    expect(nextCampaignMission(CAMPAIGN_MISSIONS, progress)?.id).toBe(first.id);
    expect(campaignMissionAvailable(first, progress)).toBe(true);
    expect(campaignMissionAvailable(second, progress)).toBe(false);
  });

  it('completes missions, grants evidence and unlocks the next beat', () => {
    const first = CAMPAIGN_MISSIONS[0]!;
    const second = CAMPAIGN_MISSIONS[1]!;
    let progress = startCampaignMission(createDefaultCampaignProgress(), first);
    progress = completeCampaignMission(progress, first);
    expect(progress.completedMissionIds).toContain(first.id);
    expect(progress.activeMissionId).toBeNull();
    expect(campaignMissionAvailable(second, progress)).toBe(true);

    const blackSeal = CAMPAIGN_MISSIONS.find((mission) => mission.id === 'black-seal')!;
    progress = {
      ...progress,
      completedMissionIds: ['first-day-floor', 'victor-test'],
      activeMissionId: blackSeal.id,
    };
    progress = completeCampaignMission(progress, blackSeal);
    expect(progress.evidenceIds).toContain('veyr-black-seal');
  });

  it('bounds relationship axes and records branch choices once', () => {
    let progress = createDefaultCampaignProgress();
    progress = applyCampaignRelationshipDelta(progress, 'victor', { trust: 120, rivalry: 8, debt: -140 });
    progress = recordCampaignBranchChoice(progress, 'keep-black-seal');
    progress = recordCampaignBranchChoice(progress, 'keep-black-seal');

    expect(progress.relationshipTrust.victor).toBe(100);
    expect(progress.relationshipRivalry.victor).toBe(8);
    expect(progress.relationshipDebt.victor).toBe(-100);
    expect(progress.branchChoiceIds).toEqual(['keep-black-seal']);
  });
});

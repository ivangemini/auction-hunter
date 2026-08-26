import { describe, expect, it } from 'vitest';
import { CAMPAIGN_EVIDENCE, CAMPAIGN_MISSIONS } from '../data/campaign';
import { CAMPAIGN_OPTIONAL_OBJECTIVES } from '../data/campaignOptionalObjectives';
import { createDefaultSave } from '../game/save';
import { buildCampaignCompletionSummary } from './campaignSummary';

describe('campaign completion summary', () => {
  it('derives a stable post-game record from existing campaign persistence', () => {
    const progress = createDefaultSave().campaign;
    progress.completedMissionIds = [
      ...CAMPAIGN_MISSIONS.slice(0, 3).map((mission) => mission.id),
      CAMPAIGN_MISSIONS[0]?.id ?? '',
    ];
    progress.evidenceIds = [
      ...CAMPAIGN_EVIDENCE.slice(0, 2).map((evidence) => evidence.id),
      CAMPAIGN_EVIDENCE[0]?.id ?? '',
    ];
    progress.branchChoiceIds = [
      `optional:${CAMPAIGN_OPTIONAL_OBJECTIVES[0]?.id ?? ''}`,
      `optional:${CAMPAIGN_OPTIONAL_OBJECTIVES[1]?.id ?? ''}`,
      'finale-pick:veyr-master-ledger',
      'finale-buy:veyr-master-ledger',
      'finale-buy:veyr-cipher-cabinet',
    ];
    progress.relationshipTrust = { 'npc-0': 8, 'npc-1': 30, 'npc-6': 18 };
    progress.relationshipRivalry = { 'npc-2': 22, 'npc-6': 4 };

    const summary = buildCampaignCompletionSummary(progress);

    expect(summary.missionsCompleted).toBe(3);
    expect(summary.missionsTotal).toBe(CAMPAIGN_MISSIONS.length);
    expect(summary.evidenceRecovered).toBe(2);
    expect(summary.evidenceTotal).toBe(CAMPAIGN_EVIDENCE.length);
    expect(summary.masteryCompleted).toBe(2);
    expect(summary.masteryTotal).toBe(CAMPAIGN_OPTIONAL_OBJECTIVES.length);
    expect(summary.finaleLotsRecovered).toBe(2);
    expect(summary.strongestAlly).toEqual({ rivalId: 'npc-1', value: 30 });
    expect(summary.strongestRival).toEqual({ rivalId: 'npc-2', value: 22 });
  });

  it('returns null relationship peaks when no positive relationship exists', () => {
    const progress = createDefaultSave().campaign;
    progress.relationshipTrust = { 'npc-0': 0, 'npc-1': -4 };
    progress.relationshipRivalry = {};

    const summary = buildCampaignCompletionSummary(progress);
    expect(summary.strongestAlly).toBeNull();
    expect(summary.strongestRival).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { campaignRivalEffect } from './campaignRelationshipEffects';
import type { CampaignProgressState } from './types';

function progress(overrides: Partial<CampaignProgressState> = {}): CampaignProgressState {
  return {
    started: true,
    activeMissionId: null,
    completedMissionIds: [],
    evidenceIds: [],
    branchChoiceIds: [],
    missionBaselineAuctionsPlayed: {},
    missionBaselineAuctionsWon: {},
    relationshipTrust: {},
    relationshipRivalry: {},
    relationshipDebt: {},
    completed: false,
    epilogueId: null,
    ...overrides,
  };
}

describe('campaign rival auction effects', () => {
  it('turns trust into lower pressure and useful intel', () => {
    const effect = campaignRivalEffect(progress({ relationshipTrust: { 'npc-1': 30 } }), 'npc-1');
    expect(effect.pressureMultiplier).toBeLessThan(1);
    expect(effect.intelLevel).toBe(2);
  });

  it('turns rivalry and debt into bounded extra pressure', () => {
    const effect = campaignRivalEffect(progress({
      relationshipRivalry: { 'npc-1': 100 },
      relationshipDebt: { 'npc-1': 100 },
    }), 'npc-1');
    expect(effect.pressureMultiplier).toBe(1.12);
    expect(effect.intelLevel).toBe(0);
  });

  it('keeps neutral rivals mechanically neutral', () => {
    expect(campaignRivalEffect(progress(), 'npc-0')).toMatchObject({
      trust: 0,
      rivalry: 0,
      debt: 0,
      pressureMultiplier: 1,
      intelLevel: 0,
    });
  });
});

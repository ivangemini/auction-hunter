import { describe, expect, it } from 'vitest';
import { CAMPAIGN_EVIDENCE, CAMPAIGN_MISSIONS } from './campaign';

describe('P9 Chapter III Dealer War', () => {
  const missions = CAMPAIGN_MISSIONS.filter((mission) => mission.chapterId === 'dealer-war');

  it('ships a seven-mission playable chapter spine', () => {
    expect(missions).toHaveLength(7);
    expect(missions.map((mission) => mission.order)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(missions.map((mission) => mission.objective.type)).toEqual([
      'track-rival',
      'win-auction',
      'branch-choice',
      'rival-deal',
      'proxy-bid',
      'rival-deal',
      'select-evidence-lot',
    ]);
  });

  it('starts only after Estate Trail and ends with a Closed Circle lead', () => {
    expect(missions[0]?.prerequisiteMissionIds).toEqual(['estate-mira-offer']);
    expect(missions[6]?.evidenceRewardIds).toContain('closed-circle-address');
    expect(CAMPAIGN_EVIDENCE.some((evidence) => evidence.id === 'closed-circle-address')).toBe(true);
  });

  it('gives Nadia a real relationship mission before the shared-envelope auction', () => {
    expect(missions[3]?.id).toBe('dealer-war-nadia-archive');
    expect(missions[3]?.featuredRivalId).toBe('npc-6');
    expect(missions[3]?.evidenceRewardIds).toContain('nadia-carrier-card');
    expect(CAMPAIGN_EVIDENCE.some((evidence) => evidence.id === 'nadia-carrier-card')).toBe(true);
    expect(missions[4]?.prerequisiteMissionIds).toEqual(['dealer-war-nadia-archive']);
  });

  it('keeps rival pressure and shared-budget bidding mechanically meaningful', () => {
    expect(missions[1]?.featuredRivalId).toBe('npc-2');
    expect(missions[1]?.objective.target).toBe(2);
    expect(missions[4]?.objective.budget).toBe(9500);
    expect(missions[5]?.featuredRivalId).toBe('npc-2');
    expect(missions[4]?.evidenceRewardIds).toContain('proxy-bid-slip');
    expect(missions[5]?.evidenceRewardIds).toContain('anton-buyer-alias');
  });
});

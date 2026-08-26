import { describe, expect, it } from 'vitest';
import { CAMPAIGN_EVIDENCE, CAMPAIGN_MISSIONS } from './campaign';

describe('P9 Chapter III Dealer War', () => {
  const missions = CAMPAIGN_MISSIONS.filter((mission) => mission.chapterId === 'dealer-war');

  it('ships a four-mission playable chapter spine', () => {
    expect(missions).toHaveLength(4);
    expect(missions.map((mission) => mission.order)).toEqual([1, 2, 3, 4]);
    expect(missions.map((mission) => mission.objective.type)).toEqual([
      'track-rival',
      'win-auction',
      'branch-choice',
      'select-evidence-lot',
    ]);
  });

  it('starts only after Estate Trail and ends with a Closed Circle lead', () => {
    expect(missions[0]?.prerequisiteMissionIds).toEqual(['estate-mira-offer']);
    expect(missions[3]?.evidenceRewardIds).toContain('closed-circle-address');
    expect(CAMPAIGN_EVIDENCE.some((evidence) => evidence.id === 'closed-circle-address')).toBe(true);
  });

  it('makes a named pressure rival part of the chapter', () => {
    expect(missions.some((mission) => mission.featuredRivalId === 'npc-2')).toBe(true);
  });
});

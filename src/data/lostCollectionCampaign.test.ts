import { describe, expect, it } from 'vitest';
import { CAMPAIGN_EVIDENCE, CAMPAIGN_MISSIONS } from './campaign';

describe('P9 Chapter V Lost Collection', () => {
  const missions = CAMPAIGN_MISSIONS.filter((mission) => mission.chapterId === 'lost-collection');

  it('ships route planning, finale preparation and the multi-lot finale as one chapter', () => {
    expect(missions).toHaveLength(3);
    expect(missions.map((mission) => mission.order)).toEqual([1, 2, 3]);
    expect(missions.map((mission) => mission.objective.type)).toEqual(['route-plan', 'finale-prep', 'finale']);
  });

  it('cannot begin before Closed Circle is complete and cannot skip preparation', () => {
    expect(missions[0]?.prerequisiteMissionIds).toEqual(['closed-circle-ledger-room']);
    expect(missions[1]?.prerequisiteMissionIds).toEqual(['lost-collection-route']);
    expect(missions[2]?.prerequisiteMissionIds).toEqual(['lost-collection-prep']);
  });

  it('produces a concrete route clue before the final auction', () => {
    expect(missions[0]?.evidenceRewardIds).toContain('veyr-river-route');
    expect(CAMPAIGN_EVIDENCE.some((entry) => entry.id === 'veyr-river-route')).toBe(true);
    expect(missions[2]?.rewardCash).toBe(0);
    expect(missions[2]?.rewardRep).toBe(0);
  });
});

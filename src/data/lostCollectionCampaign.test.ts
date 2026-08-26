import { describe, expect, it } from 'vitest';
import { CAMPAIGN_EVIDENCE, CAMPAIGN_MISSIONS } from './campaign';

describe('P9 Chapter V Lost Collection', () => {
  const missions = CAMPAIGN_MISSIONS.filter((mission) => mission.chapterId === 'lost-collection');

  it('ships a five-stage route, market-read, pressure, preparation and finale ramp', () => {
    expect(missions).toHaveLength(5);
    expect(missions.map((mission) => mission.order)).toEqual([1, 2, 3, 4, 5]);
    expect(missions.map((mission) => mission.objective.type)).toEqual([
      'route-plan',
      'play-auction',
      'win-auction',
      'finale-prep',
      'finale',
    ]);
    expect(missions[1]?.objective.target).toBe(3);
    expect(missions[2]?.objective.target).toBe(2);
  });

  it('cannot begin before Closed Circle is complete and cannot skip the pre-finale ramp', () => {
    expect(missions[0]?.prerequisiteMissionIds).toEqual(['closed-circle-ledger-room']);
    expect(missions[1]?.prerequisiteMissionIds).toEqual(['lost-collection-route']);
    expect(missions[2]?.prerequisiteMissionIds).toEqual(['lost-collection-market-read']);
    expect(missions[3]?.prerequisiteMissionIds).toEqual(['lost-collection-pressure-run']);
    expect(missions[4]?.prerequisiteMissionIds).toEqual(['lost-collection-prep']);
  });

  it('produces a concrete route clue before the final auction and defers finale payout to resolution', () => {
    expect(missions[0]?.evidenceRewardIds).toContain('veyr-river-route');
    expect(CAMPAIGN_EVIDENCE.some((entry) => entry.id === 'veyr-river-route')).toBe(true);
    expect(missions[4]?.rewardCash).toBe(0);
    expect(missions[4]?.rewardRep).toBe(0);
  });
});
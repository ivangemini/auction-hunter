import { describe, expect, it } from 'vitest';
import { CAMPAIGN_EVIDENCE, CAMPAIGN_MISSIONS } from './campaign';

describe('P9 Chapter IV Closed Circle', () => {
  const missions = CAMPAIGN_MISSIONS.filter((mission) => mission.chapterId === 'closed-circle');

  it('ships four mechanically distinct missions', () => {
    expect(missions).toHaveLength(4);
    expect(missions.map((mission) => mission.order)).toEqual([1, 2, 3, 4]);
    expect(missions.map((mission) => mission.objective.type)).toEqual([
      'limited-preview',
      'sealed-bid',
      'relationship-gate',
      'select-evidence-lot',
    ]);
  });

  it('begins from Dealer War and hands a concrete lead into the finale', () => {
    expect(missions[0]?.prerequisiteMissionIds).toEqual(['dealer-war-address']);
    expect(missions[3]?.evidenceRewardIds).toContain('lost-collection-index');
    expect(CAMPAIGN_EVIDENCE.some((entry) => entry.id === 'lost-collection-index')).toBe(true);
  });

  it('constrains information and sealed bid spending explicitly', () => {
    expect(missions[0]?.objective.maxInspections).toBe(3);
    expect(missions[0]?.objective.targetIds).toHaveLength(2);
    expect(missions[1]?.objective.budget).toBe(9600);
  });
});

import { describe, expect, it } from 'vitest';
import { CAMPAIGN_EVIDENCE, CAMPAIGN_MISSIONS } from './campaign';

describe('P9 Chapter IV Closed Circle', () => {
  const missions = CAMPAIGN_MISSIONS.filter((mission) => mission.chapterId === 'closed-circle');

  it('ships six mechanically distinct missions', () => {
    expect(missions).toHaveLength(6);
    expect(missions.map((mission) => mission.order)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(missions.map((mission) => mission.objective.type)).toEqual([
      'limited-preview',
      'sealed-bid',
      'relationship-gate',
      'counterfeit-table',
      'win-auction',
      'select-evidence-lot',
    ]);
  });

  it('begins from Dealer War and hands a concrete lead into Chapter V', () => {
    expect(missions[0]?.prerequisiteMissionIds).toEqual(['dealer-war-address']);
    expect(missions[5]?.evidenceRewardIds).toContain('lost-collection-index');
    expect(CAMPAIGN_EVIDENCE.some((entry) => entry.id === 'lost-collection-index')).toBe(true);
  });

  it('constrains information, spending and counterfeit identification explicitly', () => {
    expect(missions[0]?.objective.maxInspections).toBe(3);
    expect(missions[0]?.objective.targetIds).toHaveLength(2);
    expect(missions[1]?.objective.budget).toBe(9600);
    expect(missions[3]?.objective.targetIds).toEqual(['folder-17', 'wax-card-c']);
    expect(missions[4]?.objective.target).toBe(2);
  });
});

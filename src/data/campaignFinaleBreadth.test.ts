import { beforeAll, describe, expect, it } from 'vitest';
import { CAMPAIGN_MISSIONS } from './campaign';
import { registerCampaignFinaleBreadth } from './campaignFinaleBreadth';

beforeAll(() => registerCampaignFinaleBreadth());

describe('P9 Chapter V Lost Collection breadth', () => {
  const chapter = () => CAMPAIGN_MISSIONS
    .filter((mission) => mission.chapterId === 'lost-collection')
    .sort((a, b) => a.order - b.order);

  it('ships a five-stage final chapter before the separate multi-lot finale resolves', () => {
    const missions = chapter();
    expect(missions).toHaveLength(5);
    expect(missions.map((mission) => mission.order)).toEqual([1, 2, 3, 4, 5]);
    expect(missions.map((mission) => mission.id)).toEqual([
      'lost-collection-route',
      'lost-collection-market-read',
      'lost-collection-pressure-run',
      'lost-collection-prep',
      'lost-collection-finale',
    ]);
  });

  it('requires real core-loop play immediately before partner selection', () => {
    const missions = chapter();
    expect(missions[1]?.objective.type).toBe('play-auction');
    expect(missions[1]?.objective.target).toBe(3);
    expect(missions[2]?.objective.type).toBe('win-auction');
    expect(missions[2]?.objective.target).toBe(2);
    expect(missions[2]?.featuredRivalId).toBe('npc-2');
    expect(missions[3]?.prerequisiteMissionIds).toEqual(['lost-collection-pressure-run']);
  });

  it('remains idempotent when bootstrap/test registration runs more than once', () => {
    registerCampaignFinaleBreadth();
    expect(chapter()).toHaveLength(5);
  });
});

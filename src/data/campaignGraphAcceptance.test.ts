import { describe, expect, it } from 'vitest';
import {
  completeCampaignMission,
  nextCampaignMission,
  startCampaignMission,
} from '../domain/campaign';
import { createDefaultSave } from '../game/save';
import { CAMPAIGN_CHAPTER_ORDER, CAMPAIGN_MISSIONS } from './campaign';

describe('P9 fresh-state campaign graph acceptance', () => {
  it('walks from a clean campaign state through every production mission without a dead end', () => {
    let progress = createDefaultSave().campaign;
    const visited: string[] = [];
    const chapterOrders: number[] = [];

    for (let step = 0; step < CAMPAIGN_MISSIONS.length; step += 1) {
      const mission = nextCampaignMission(CAMPAIGN_MISSIONS, progress);
      expect(mission, `dead end after ${visited.at(-1) ?? 'fresh state'}`).not.toBeNull();
      if (!mission) break;

      expect(visited, `mission repeated: ${mission.id}`).not.toContain(mission.id);
      progress = startCampaignMission(progress, mission);
      expect(progress.activeMissionId).toBe(mission.id);
      progress = completeCampaignMission(progress, mission);
      expect(progress.activeMissionId).toBeNull();
      expect(progress.completedMissionIds).toContain(mission.id);

      visited.push(mission.id);
      chapterOrders.push(CAMPAIGN_CHAPTER_ORDER[mission.chapterId]);
    }

    expect(visited).toHaveLength(CAMPAIGN_MISSIONS.length);
    expect(new Set(visited).size).toBe(CAMPAIGN_MISSIONS.length);
    expect(visited[0]).toBe('first-day-floor');
    expect(visited.at(-1)).toBe('lost-collection-finale');
    expect(chapterOrders).toEqual([...chapterOrders].sort((left, right) => left - right));
    expect(nextCampaignMission(CAMPAIGN_MISSIONS, progress)).toBeNull();
  });
});
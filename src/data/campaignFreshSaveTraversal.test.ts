import { describe, expect, it } from 'vitest';
import { CAMPAIGN_CHAPTERS, CAMPAIGN_MISSIONS } from './campaign';
import {
  campaignMissionAvailable,
  completeCampaignMission,
  nextCampaignMission,
  startCampaignMission,
} from '../domain/campaign';
import { createDefaultCampaignProgress } from '../game/save';

describe('P9 fresh-save campaign traversal acceptance', () => {
  it('walks the complete production mission graph from a clean save without deadlocks', () => {
    let progress = createDefaultCampaignProgress();
    const visited: string[] = [];
    const visitedChapters: string[] = [];

    for (let index = 0; index < CAMPAIGN_MISSIONS.length; index += 1) {
      const mission = nextCampaignMission(CAMPAIGN_MISSIONS, progress);
      expect(mission, `campaign deadlocked after ${visited.join(' -> ')}`).not.toBeNull();
      if (!mission) throw new Error('Campaign traversal unexpectedly deadlocked');

      expect(campaignMissionAvailable(mission, progress), mission.id).toBe(true);
      progress = startCampaignMission(progress, mission);
      expect(progress.activeMissionId).toBe(mission.id);

      progress = completeCampaignMission(progress, mission);
      expect(progress.activeMissionId).toBeNull();
      expect(progress.completedMissionIds).toContain(mission.id);
      visited.push(mission.id);
      if (visitedChapters.at(-1) !== mission.chapterId) visitedChapters.push(mission.chapterId);
    }

    expect(visited).toHaveLength(28);
    expect(new Set(visited).size).toBe(CAMPAIGN_MISSIONS.length);
    expect(visited[0]).toBe('first-day-floor');
    expect(visited.at(-1)).toBe('lost-collection-finale');
    expect(visitedChapters).toEqual(CAMPAIGN_CHAPTERS.map((chapter) => chapter.id));
    expect(nextCampaignMission(CAMPAIGN_MISSIONS, progress)).toBeNull();
    expect(progress.evidenceIds).toContain('veyr-river-route');
  });
});

import { describe, expect, it } from 'vitest';
import { CAMPAIGN_CHAPTERS, CAMPAIGN_EVIDENCE, CAMPAIGN_MISSIONS } from './campaign';

function localized(value: { ru: string; en: string }) {
  return value.ru.trim().length > 0 && value.en.trim().length > 0;
}

describe('P9 campaign content', () => {
  it('defines the complete five-act campaign spine', () => {
    expect(CAMPAIGN_CHAPTERS).toHaveLength(5);
    expect(CAMPAIGN_CHAPTERS.map((chapter) => chapter.order)).toEqual([1, 2, 3, 4, 5]);
    expect(CAMPAIGN_CHAPTERS.every((chapter) => localized(chapter.title) && localized(chapter.subtitle))).toBe(true);
  });

  it('ships a four-mission Chapter I vertical slice', () => {
    const firstChapter = CAMPAIGN_MISSIONS.filter((mission) => mission.chapterId === 'first-flip');
    expect(firstChapter).toHaveLength(4);
    expect(firstChapter.map((mission) => mission.order)).toEqual([1, 2, 3, 4]);
    expect(firstChapter.every((mission) => localized(mission.title) && localized(mission.briefing) && localized(mission.objective.description))).toBe(true);
  });

  it('has no dead mission prerequisites', () => {
    const ids = new Set(CAMPAIGN_MISSIONS.map((mission) => mission.id));
    for (const mission of CAMPAIGN_MISSIONS) {
      for (const prerequisite of mission.prerequisiteMissionIds) expect(ids.has(prerequisite)).toBe(true);
    }
  });

  it('references authored evidence that actually exists', () => {
    const evidenceIds = new Set(CAMPAIGN_EVIDENCE.map((evidence) => evidence.id));
    const rewardedEvidence = CAMPAIGN_MISSIONS.flatMap((mission) => mission.evidenceRewardIds ?? []);
    expect(rewardedEvidence.length).toBeGreaterThan(0);
    for (const evidenceId of rewardedEvidence) expect(evidenceIds.has(evidenceId as never)).toBe(true);
  });

  it('makes Chapter I change gameplay instead of being dialogue-only', () => {
    const objectiveTypes = new Set(CAMPAIGN_MISSIONS.filter((mission) => mission.chapterId === 'first-flip').map((mission) => mission.objective.type));
    expect(objectiveTypes.has('win-auction')).toBe(true);
    expect(objectiveTypes.has('keep-evidence')).toBe(true);
    expect(objectiveTypes.has('select-evidence-lot')).toBe(true);
  });
});

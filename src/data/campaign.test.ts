import { describe, expect, it } from 'vitest';
import { BIDDER_PROFILES } from './balance';
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

  it('ships four authored missions in both Chapter I and the Estate Trail foundation', () => {
    for (const chapterId of ['first-flip', 'estate-trail'] as const) {
      const chapter = CAMPAIGN_MISSIONS.filter((mission) => mission.chapterId === chapterId);
      expect(chapter).toHaveLength(4);
      expect(chapter.map((mission) => mission.order)).toEqual([1, 2, 3, 4]);
      expect(chapter.every((mission) => localized(mission.title) && localized(mission.briefing) && localized(mission.objective.description))).toBe(true);
    }
  });

  it('has no dead mission prerequisites', () => {
    const ids = new Set(CAMPAIGN_MISSIONS.map((mission) => mission.id));
    for (const mission of CAMPAIGN_MISSIONS) {
      for (const prerequisite of mission.prerequisiteMissionIds) expect(ids.has(prerequisite)).toBe(true);
    }
  });

  it('references authored evidence and real persistent rivals', () => {
    const evidenceIds = new Set(CAMPAIGN_EVIDENCE.map((evidence) => evidence.id));
    const rivalIds = new Set(BIDDER_PROFILES.map((rival) => rival.id));
    const rewardedEvidence = CAMPAIGN_MISSIONS.flatMap((mission) => mission.evidenceRewardIds ?? []);
    expect(rewardedEvidence.length).toBeGreaterThanOrEqual(6);
    for (const evidenceId of rewardedEvidence) expect(evidenceIds.has(evidenceId as never)).toBe(true);
    for (const mission of CAMPAIGN_MISSIONS) {
      if (mission.featuredRivalId) expect(rivalIds.has(mission.featuredRivalId)).toBe(true);
    }
  });

  it('changes gameplay vocabulary across the first two chapters instead of becoming dialogue-only', () => {
    const firstTypes = new Set(CAMPAIGN_MISSIONS.filter((mission) => mission.chapterId === 'first-flip').map((mission) => mission.objective.type));
    expect(firstTypes.has('win-auction')).toBe(true);
    expect(firstTypes.has('keep-evidence')).toBe(true);
    expect(firstTypes.has('select-evidence-lot')).toBe(true);

    const estateTypes = new Set(CAMPAIGN_MISSIONS.filter((mission) => mission.chapterId === 'estate-trail').map((mission) => mission.objective.type));
    expect(estateTypes.has('linked-budget')).toBe(true);
    expect(estateTypes.has('appraise-evidence')).toBe(true);
    expect(estateTypes.has('negotiate')).toBe(true);
    const linked = CAMPAIGN_MISSIONS.find((mission) => mission.id === 'estate-linked-lots');
    expect(linked?.objective.budget).toBe(6200);
    expect(linked?.objective.targetIds).toHaveLength(2);
  });
});

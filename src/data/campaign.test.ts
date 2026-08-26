import { describe, expect, it } from 'vitest';
import { BIDDER_PROFILES } from './balance';
import { CAMPAIGN_CHAPTERS, CAMPAIGN_EVIDENCE, CAMPAIGN_MISSIONS } from './campaign';

function localized(value: { ru: string; en: string }) {
  return value.ru.trim().length > 0 && value.en.trim().length > 0;
}

describe('P9 campaign content', () => {
  it('defines the complete five-act campaign spine with 25 authored missions', () => {
    expect(CAMPAIGN_CHAPTERS).toHaveLength(5);
    expect(CAMPAIGN_CHAPTERS.map((chapter) => chapter.order)).toEqual([1, 2, 3, 4, 5]);
    expect(CAMPAIGN_CHAPTERS.every((chapter) => localized(chapter.title) && localized(chapter.subtitle))).toBe(true);
    expect(CAMPAIGN_MISSIONS).toHaveLength(25);
    expect(CAMPAIGN_CHAPTERS.map((chapter) => CAMPAIGN_MISSIONS.filter((mission) => mission.chapterId === chapter.id).length)).toEqual([4, 6, 6, 6, 3]);
  });

  it('keeps Chapter I compact while Estate Trail expands into a six-mission gameplay chapter', () => {
    const first = CAMPAIGN_MISSIONS.filter((mission) => mission.chapterId === 'first-flip');
    expect(first).toHaveLength(4);
    expect(first.map((mission) => mission.order)).toEqual([1, 2, 3, 4]);

    const estate = CAMPAIGN_MISSIONS.filter((mission) => mission.chapterId === 'estate-trail');
    expect(estate).toHaveLength(6);
    expect(estate.map((mission) => mission.order)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(estate.map((mission) => mission.objective.type)).toEqual([
      'select-evidence-lot',
      'linked-budget',
      'appraise-evidence',
      'restoration-trace',
      'play-auction',
      'negotiate',
    ]);
    expect(estate[4]?.objective.target).toBe(2);
    expect(estate.every((mission) => localized(mission.title) && localized(mission.briefing) && localized(mission.objective.description))).toBe(true);
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
    expect(rewardedEvidence.length).toBeGreaterThanOrEqual(15);
    for (const evidenceId of rewardedEvidence) expect(evidenceIds.has(evidenceId as never)).toBe(true);
    for (const mission of CAMPAIGN_MISSIONS) {
      if (mission.featuredRivalId) expect(rivalIds.has(mission.featuredRivalId)).toBe(true);
    }
  });

  it('changes gameplay vocabulary rather than becoming a dialogue-only campaign', () => {
    const types = new Set(CAMPAIGN_MISSIONS.map((mission) => mission.objective.type));
    for (const required of [
      'win-auction',
      'linked-budget',
      'restoration-trace',
      'proxy-bid',
      'rival-deal',
      'limited-preview',
      'sealed-bid',
      'counterfeit-table',
      'route-plan',
      'finale-prep',
      'finale',
    ] as const) expect(types.has(required), required).toBe(true);

    const linked = CAMPAIGN_MISSIONS.find((mission) => mission.id === 'estate-linked-lots');
    expect(linked?.objective.budget).toBe(6200);
    expect(linked?.objective.targetIds).toHaveLength(2);
  });
});

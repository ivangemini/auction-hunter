import { CAMPAIGN_MISSIONS, type CampaignMission } from './campaign';

const FINALE_BREADTH_MISSIONS: readonly CampaignMission[] = [
  {
    id: 'lost-collection-market-read',
    chapterId: 'lost-collection',
    order: 2,
    title: { ru: 'Прочитать рынок', en: 'Read the Market' },
    briefing: {
      ru: 'Перед последней распродажей Вейра рынок нужно проверить на практике. Три обычных аукциона покажут, кто из дилеров перегрет и где сохранить резерв.',
      en: 'Before Veyr’s final sale, test the market in practice. Three normal auctions reveal which dealers are overheated and where to preserve your reserve.',
    },
    objective: {
      type: 'play-auction',
      target: 3,
      description: { ru: 'Завершите 3 обычных аукциона после старта задания.', en: 'Complete 3 normal auctions after starting the mission.' },
    },
    prerequisiteMissionIds: ['lost-collection-route'],
    rewardCash: 2400,
    rewardRep: 265,
  },
  {
    id: 'lost-collection-pressure-run',
    chapterId: 'lost-collection',
    order: 3,
    title: { ru: 'Последняя проверка нервов', en: 'Final Nerve Check' },
    briefing: {
      ru: 'Антон понимает, куда ведёт индекс, и давит на любые лоты, которыми вы интересуетесь. Перед финалом нужно дважды выиграть, не разрушив банкролл паникой.',
      en: 'Anton understands where the index leads and pressures anything you show interest in. Before the finale, win twice without wrecking your bankroll through panic.',
    },
    objective: {
      type: 'win-auction',
      target: 2,
      description: { ru: 'Выиграйте 2 аукциона после старта задания.', en: 'Win 2 auctions after starting the mission.' },
    },
    prerequisiteMissionIds: ['lost-collection-market-read'],
    rewardCash: 3000,
    rewardRep: 280,
    featuredRivalId: 'npc-2',
  },
];

/**
 * Additive P9 installer. It extends the authored fifth chapter without changing
 * persisted IDs or the version-1 save schema. Existing saves that already reached
 * the old finale simply see the new pre-finale missions as available unless the
 * campaign was already completed; completed campaigns remain completed.
 */
export function registerCampaignFinaleBreadth(): void {
  for (const mission of FINALE_BREADTH_MISSIONS) {
    if (!CAMPAIGN_MISSIONS.some((candidate) => candidate.id === mission.id)) CAMPAIGN_MISSIONS.push(mission);
  }

  const prep = CAMPAIGN_MISSIONS.find((mission) => mission.id === 'lost-collection-prep');
  if (prep) {
    prep.order = 4;
    prep.prerequisiteMissionIds = ['lost-collection-pressure-run'];
  }

  const finale = CAMPAIGN_MISSIONS.find((mission) => mission.id === 'lost-collection-finale');
  if (finale) {
    finale.order = 5;
    finale.prerequisiteMissionIds = ['lost-collection-prep'];
  }
}

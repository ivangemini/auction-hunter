import { CAMPAIGN_EVIDENCE, CAMPAIGN_MISSIONS, type CampaignMission } from './campaign';

export const NADIA_ARCHIVE_MISSION: CampaignMission = {
  id: 'dealer-war-nadia-archive',
  chapterId: 'dealer-war',
  order: 4,
  title: { ru: 'Архив Нади', en: "Nadia's Archive" },
  briefing: {
    ru: 'Надя нашла старую карточку перевозчика, но не отдаст её бесплатно. Можно обменяться своей уликой, купить копию или попытаться продавить её — и затем встретить последствия на торгах.',
    en: 'Nadia found an old carrier card, but she will not hand it over for free. Trade one of your leads, buy a copy, or pressure her — then face the auction consequences.',
  },
  objective: {
    type: 'rival-deal',
    target: 1,
    description: {
      ru: 'Закройте сделку с Надей и определите, станет она архивным союзником или новым конкурентом.',
      en: 'Settle with Nadia and decide whether she becomes an archive ally or a sharper competitor.',
    },
  },
  prerequisiteMissionIds: ['dealer-war-ally'],
  rewardCash: 900,
  rewardRep: 125,
  evidenceRewardIds: ['nadia-carrier-card'],
  featuredRivalId: 'npc-6',
  artId: 'provenance-folder',
};

export function registerNadiaCampaignArc(): void {
  if (!CAMPAIGN_EVIDENCE.some((entry) => entry.id === 'nadia-carrier-card')) {
    CAMPAIGN_EVIDENCE.push({
      id: 'nadia-carrier-card',
      title: { ru: 'Карточка речного перевозчика', en: 'River Carrier Card' },
      description: {
        ru: 'Архив Нади связывает код C-17 с перевозчиком, который обслуживал речные склады Вейра.',
        en: "Nadia's archive links code C-17 to a carrier that served Veyr's river warehouses.",
      },
      artId: 'provenance-folder',
    });
  }

  if (!CAMPAIGN_MISSIONS.some((mission) => mission.id === NADIA_ARCHIVE_MISSION.id)) {
    CAMPAIGN_MISSIONS.push({ ...NADIA_ARCHIVE_MISSION });
  }

  const proxy = CAMPAIGN_MISSIONS.find((mission) => mission.id === 'dealer-war-proxy');
  const counteroffer = CAMPAIGN_MISSIONS.find((mission) => mission.id === 'dealer-war-counteroffer');
  const address = CAMPAIGN_MISSIONS.find((mission) => mission.id === 'dealer-war-address');
  if (!proxy || !counteroffer || !address) throw new Error('Dealer War mission spine is incomplete');

  proxy.order = 5;
  proxy.prerequisiteMissionIds = [NADIA_ARCHIVE_MISSION.id];
  counteroffer.order = 6;
  address.order = 7;

  CAMPAIGN_MISSIONS.sort((left, right) => {
    if (left.chapterId === right.chapterId) return left.order - right.order;
    const chapterOrder = ['first-flip', 'estate-trail', 'dealer-war', 'closed-circle', 'lost-collection'];
    return chapterOrder.indexOf(left.chapterId) - chapterOrder.indexOf(right.chapterId);
  });
}

import type { LocalizedText } from '../domain/types';

export type CampaignChapterId = 'first-flip' | 'estate-trail' | 'dealer-war' | 'closed-circle' | 'lost-collection';
export type CampaignObjectiveType =
  | 'play-auction'
  | 'win-auction'
  | 'keep-evidence'
  | 'select-evidence-lot'
  | 'linked-budget'
  | 'appraise-evidence'
  | 'track-rival'
  | 'negotiate'
  | 'branch-choice'
  | 'finale';

export interface CampaignObjective {
  type: CampaignObjectiveType;
  target?: number;
  optional?: boolean;
  description: LocalizedText;
}

export interface CampaignMission {
  id: string;
  chapterId: CampaignChapterId;
  order: number;
  title: LocalizedText;
  briefing: LocalizedText;
  objective: CampaignObjective;
  prerequisiteMissionIds: string[];
  rewardCash: number;
  rewardRep: number;
  evidenceRewardIds?: string[];
  featuredRivalId?: string;
  artId?: string;
}

export interface CampaignChapter {
  id: CampaignChapterId;
  order: number;
  title: LocalizedText;
  subtitle: LocalizedText;
  targetMinutes: [number, number];
}

export const CAMPAIGN_CHAPTERS: CampaignChapter[] = [
  {
    id: 'first-flip', order: 1,
    title: { ru: 'Глава I — Первая сделка', en: 'Chapter I — First Flip' },
    subtitle: { ru: 'Обычная распродажа оставляет необычный след.', en: 'An ordinary clearance leaves an unusual trail.' },
    targetMinutes: [30, 45],
  },
  {
    id: 'estate-trail', order: 2,
    title: { ru: 'Глава II — След поместья', en: 'Chapter II — Estate Trail' },
    subtitle: { ru: 'Архивы, подделки и вещи, которые не должны были встретиться.', en: 'Archives, fakes and objects that should never have crossed paths.' },
    targetMinutes: [60, 90],
  },
  {
    id: 'dealer-war', order: 3,
    title: { ru: 'Глава III — Война дилеров', en: 'Chapter III — Dealer War' },
    subtitle: { ru: 'Теперь за реестром охотитесь не только вы.', en: 'You are no longer the only dealer hunting the ledger.' },
    targetMinutes: [90, 120],
  },
  {
    id: 'closed-circle', order: 4,
    title: { ru: 'Глава IV — Закрытый круг', en: 'Chapter IV — Closed Circle' },
    subtitle: { ru: 'Частные просмотры, ограниченная информация и дорогие ошибки.', en: 'Private previews, limited information and expensive mistakes.' },
    targetMinutes: [90, 150],
  },
  {
    id: 'lost-collection', order: 5,
    title: { ru: 'Глава V — Потерянная коллекция', en: 'Chapter V — The Lost Collection' },
    subtitle: { ru: 'Последние страницы реестра стоят дороже денег.', en: 'The ledger’s final pages are worth more than money.' },
    targetMinutes: [90, 150],
  },
];

export const CAMPAIGN_MISSIONS: CampaignMission[] = [
  {
    id: 'first-day-floor', chapterId: 'first-flip', order: 1,
    title: { ru: 'Первый день', en: 'First Day on the Floor' },
    briefing: { ru: 'Проведите обычный аукцион. Сначала научитесь читать комнату, потом — вещи.', en: 'Run a normal auction. Learn to read the room before you learn to read the objects.' },
    objective: { type: 'play-auction', target: 1, description: { ru: 'Завершите 1 обычный аукцион.', en: 'Complete 1 normal auction.' } },
    prerequisiteMissionIds: [], rewardCash: 250, rewardRep: 10,
  },
  {
    id: 'victor-test', chapterId: 'first-flip', order: 2,
    title: { ru: 'Проверка Виктора', en: "Victor's Test" },
    briefing: { ru: 'Виктор считает, что вы переплачиваете. Докажите, что умеете остановиться — и всё же забрать правильный лот.', en: 'Victor thinks you overpay. Prove you can stop — and still take the right lot.' },
    objective: { type: 'win-auction', target: 1, description: { ru: 'Выиграйте следующий сюжетный аукцион.', en: 'Win the next story auction.' } },
    prerequisiteMissionIds: ['first-day-floor'], rewardCash: 400, rewardRep: 15, featuredRivalId: 'npc-0',
  },
  {
    id: 'black-seal', chapterId: 'first-flip', order: 3,
    title: { ru: 'Чёрная печать', en: 'The Black Seal' },
    briefing: { ru: 'В коробке с бумагами лежит карточка с чёрной восковой печатью. Виктор узнаёт знак, но советует продать всё вместе.', en: 'A paper box contains a card stamped with black wax. Victor recognizes the mark, then tells you to sell the lot intact.' },
    objective: { type: 'keep-evidence', target: 1, description: { ru: 'Сохраните улику вместо немедленной продажи.', en: 'Keep the evidence instead of taking the immediate sale.' } },
    prerequisiteMissionIds: ['victor-test'], rewardCash: 300, rewardRep: 25, evidenceRewardIds: ['veyr-black-seal'], artId: 'evidence-black-seal',
  },
  {
    id: 'missing-inventory', chapterId: 'first-flip', order: 4,
    title: { ru: 'Несуществующий номер', en: 'The Missing Inventory' },
    briefing: { ru: 'На обороте карточки — номер описи, которого нет в публичном каталоге. Нужно найти распродажу, где этот номер всплывёт снова.', en: 'The reverse carries an inventory number absent from the public catalogue. Find the clearance where that number surfaces again.' },
    objective: { type: 'select-evidence-lot', target: 1, description: { ru: 'Выберите правильный лот по документальным зацепкам.', en: 'Select the correct lot using documentary clues.' } },
    prerequisiteMissionIds: ['black-seal'], rewardCash: 650, rewardRep: 40, evidenceRewardIds: ['veyr-inventory-number'], artId: 'campaign-estate-study',
  },
];

export const CAMPAIGN_EVIDENCE = [
  {
    id: 'veyr-black-seal',
    title: { ru: 'Чёрная печать Вейра', en: "Veyr's Black Seal" },
    description: { ru: 'Чёрный воск с геометрическим знаком. Виктор явно видел его раньше.', en: 'Black wax carrying a geometric mark. Victor has clearly seen it before.' },
    artId: 'evidence-black-seal',
  },
  {
    id: 'veyr-inventory-number',
    title: { ru: 'Номер 47-Б', en: 'Inventory 47-B' },
    description: { ru: 'Номер описи отсутствует в открытом каталоге поместья.', en: 'An inventory number missing from the estate’s public catalogue.' },
    artId: 'evidence-ledger-fragment',
  },
] as const;

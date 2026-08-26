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
  budget?: number;
  targetIds?: string[];
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

export const CAMPAIGN_CHAPTER_ORDER: Record<CampaignChapterId, number> = {
  'first-flip': 1,
  'estate-trail': 2,
  'dealer-war': 3,
  'closed-circle': 4,
  'lost-collection': 5,
};

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
  {
    id: 'estate-paper-trail', chapterId: 'estate-trail', order: 1,
    title: { ru: 'Бумажный след', en: 'Paper Trail' },
    briefing: { ru: 'Номер 47-Б связывает две коробки из разных распродаж. Архивная бирка важнее внешне дорогого содержимого.', en: 'Inventory 47-B connects two boxes from separate clearances. The archive mark matters more than the expensive-looking contents.' },
    objective: { type: 'select-evidence-lot', target: 1, description: { ru: 'Найдите второй лот, связанный с номером 47-Б.', en: 'Find the second lot connected to inventory 47-B.' } },
    prerequisiteMissionIds: ['missing-inventory'], rewardCash: 800, rewardRep: 45, evidenceRewardIds: ['veyr-estate-photo'], artId: 'campaign-estate-study',
  },
  {
    id: 'estate-linked-lots', chapterId: 'estate-trail', order: 2,
    title: { ru: 'Две коробки, один бюджет', en: 'Two Boxes, One Budget' },
    briefing: { ru: 'Две связанные части описи уйдут подряд. Красивый первый лот может оставить вас без денег на второй.', en: 'Two linked inventory lots sell back-to-back. An attractive first lot can leave you unable to afford the second.' },
    objective: {
      type: 'linked-budget', target: 2, budget: 6200, targetIds: ['estate-ledger-box', 'estate-photo-box'],
      description: { ru: 'Получите обе связанные находки, потратив не более 6 200 ₽ суммарно.', en: 'Acquire both linked finds while spending no more than 6,200 ₽ total.' },
    },
    prerequisiteMissionIds: ['estate-paper-trail'], rewardCash: 1100, rewardRep: 60, evidenceRewardIds: ['veyr-ledger-margin'],
  },
  {
    id: 'estate-false-paper', chapterId: 'estate-trail', order: 3,
    title: { ru: 'Слишком хорошая история', en: 'A Story Too Clean' },
    briefing: { ru: 'Один provenance-файл выглядит безупречно. Именно это и настораживает: чернила и печать не совпадают с первой уликой.', en: 'One provenance file looks immaculate. That is exactly the problem: its ink and seal disagree with the first evidence.' },
    objective: { type: 'appraise-evidence', target: 1, description: { ru: 'Проверьте provenance и определите подделку до дорогой ошибки.', en: 'Inspect the provenance and identify the fake before an expensive mistake.' } },
    prerequisiteMissionIds: ['estate-linked-lots'], rewardCash: 900, rewardRep: 70, evidenceRewardIds: ['veyr-forgery-pattern'], artId: 'provenance-folder',
  },
  {
    id: 'estate-mira-offer', chapterId: 'estate-trail', order: 4,
    title: { ru: 'Цена информации', en: 'The Price of Information' },
    briefing: { ru: 'Мира знает, кто купил следующую часть реестра, но просит оплату сейчас — деньгами или предметом из вашей коллекции.', en: 'Mira knows who bought the next ledger fragment, but wants payment now — cash or an item from your collection.' },
    objective: { type: 'negotiate', target: 1, description: { ru: 'Решите, чем заплатить Мире — или откажитесь от её короткого пути.', en: 'Choose how to pay Mira — or refuse her shortcut.' } },
    prerequisiteMissionIds: ['estate-false-paper'], rewardCash: 700, rewardRep: 80, evidenceRewardIds: ['private-auction-lead'], featuredRivalId: 'npc-1', artId: 'private-invitation',
  },
  {
    id: 'dealer-war-leak', chapterId: 'dealer-war', order: 1,
    title: { ru: 'Кто слил время?', en: 'Who Leaked the Time?' },
    briefing: { ru: 'На закрытом показе Антон появляется раньше приглашённых и знает точное время из карточки Миры. Совпадение слишком удобное.', en: "Anton reaches the private preview before the invited dealers and knows the exact time from Mira's card. The coincidence is too clean." },
    objective: { type: 'track-rival', target: 1, description: { ru: 'Сопоставьте поведение дилеров и найдите источник утечки.', en: 'Compare dealer behavior and identify the source of the leak.' } },
    prerequisiteMissionIds: ['estate-mira-offer'], rewardCash: 950, rewardRep: 90, evidenceRewardIds: ['dealer-leak-pattern'], featuredRivalId: 'npc-2', artId: 'private-invitation',
  },
  {
    id: 'dealer-war-pressure', chapterId: 'dealer-war', order: 2,
    title: { ru: 'Поднять цену', en: 'Run the Price Up' },
    briefing: { ru: 'Антон теперь знает, что вы идёте по следу Вейра, и специально давит на ваши ставки. Отношения с дилерами впервые меняют потолки торгов.', en: 'Anton now knows you are following Veyr and deliberately pressures your bids. Dealer relationships now change auction ceilings.' },
    objective: { type: 'win-auction', target: 1, description: { ru: 'Выиграйте аукцион после начала задания, несмотря на давление дилеров.', en: 'Win an auction after starting the mission despite dealer pressure.' } },
    prerequisiteMissionIds: ['dealer-war-leak'], rewardCash: 1250, rewardRep: 105, featuredRivalId: 'npc-2',
  },
  {
    id: 'dealer-war-ally', chapterId: 'dealer-war', order: 3,
    title: { ru: 'Один союзник', en: 'One Ally' },
    briefing: { ru: 'Виктор предлагает тихо убрать Антона с одного просмотра. Мира предлагает ложный адрес. Обоих одновременно использовать нельзя.', en: 'Victor offers to quietly keep Anton out of one preview. Mira offers a false address. You cannot use both plays at once.' },
    objective: { type: 'branch-choice', target: 1, description: { ru: 'Выберите, чью помощь принять перед следующим закрытым просмотром.', en: 'Choose whose help to accept before the next private preview.' } },
    prerequisiteMissionIds: ['dealer-war-pressure'], rewardCash: 800, rewardRep: 120, artId: 'provenance-folder',
  },
  {
    id: 'dealer-war-address', chapterId: 'dealer-war', order: 4,
    title: { ru: 'Сгоревший адрес', en: 'The Burned Address' },
    briefing: { ru: 'После вашей сделки сеть меняет место встречи. На трёх карточках только одна использует тот же типографский дефект, что и настоящее приглашение.', en: 'After your move, the network changes venues. Only one of three cards carries the same printing defect as the genuine invitation.' },
    objective: { type: 'select-evidence-lot', target: 1, description: { ru: 'Найдите настоящий новый адрес по дефекту печати.', en: 'Find the genuine new address from the printing defect.' } },
    prerequisiteMissionIds: ['dealer-war-ally'], rewardCash: 1500, rewardRep: 140, evidenceRewardIds: ['closed-circle-address'], artId: 'private-invitation',
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
  {
    id: 'veyr-estate-photo',
    title: { ru: 'Фотография кабинета', en: 'Estate Study Photograph' },
    description: { ru: 'На старой фотографии две архивные коробки стоят рядом, хотя позже их продали отдельно.', en: 'An old photograph shows two archive boxes together although they were later sold separately.' },
    artId: 'campaign-estate-study',
  },
  {
    id: 'veyr-ledger-margin',
    title: { ru: 'Пометка на полях', en: 'Ledger Margin Note' },
    description: { ru: 'Короткая рукописная пометка связывает номера описи с частным покупателем.', en: 'A short handwritten margin note links the inventory numbers to a private buyer.' },
    artId: 'evidence-ledger-fragment',
  },
  {
    id: 'veyr-forgery-pattern',
    title: { ru: 'Шаблон подделки', en: 'Forgery Pattern' },
    description: { ru: 'Поддельные документы повторяют настоящий знак, но используют неправильную бумагу и штамп.', en: 'The forged papers copy the real mark but use the wrong paper stock and stamp.' },
    artId: 'provenance-folder',
  },
  {
    id: 'private-auction-lead',
    title: { ru: 'Частное приглашение', en: 'Private Auction Lead' },
    description: { ru: 'След ведёт к закрытой сети дилеров. На приглашении нет адреса — только время и контакт.', en: 'The trail reaches a closed dealer network. The invitation has no address, only a time and contact.' },
    artId: 'private-invitation',
  },
  {
    id: 'dealer-leak-pattern',
    title: { ru: 'Шаблон утечки', en: 'Leak Pattern' },
    description: { ru: 'Антон появляется на закрытых просмотрах раньше рассылки общего адреса. Кто-то передаёт ему детали заранее.', en: 'Anton reaches private previews before the general address is distributed. Someone is feeding him details early.' },
    artId: 'provenance-folder',
  },
  {
    id: 'closed-circle-address',
    title: { ru: 'Новый адрес круга', en: 'Closed Circle Address' },
    description: { ru: 'Типографский дефект подтверждает подлинность новой карточки. След ведёт в закрытый круг покупателей.', en: 'A printing defect authenticates the new card. The trail now leads into the closed circle of buyers.' },
    artId: 'private-invitation',
  },
] as const;

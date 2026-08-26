import type { LocalizedText } from '../domain/types';

export type CampaignChapterId = 'first-flip' | 'estate-trail' | 'dealer-war' | 'closed-circle' | 'lost-collection';
export type CampaignObjectiveType =
  | 'play-auction'
  | 'win-auction'
  | 'keep-evidence'
  | 'select-evidence-lot'
  | 'linked-budget'
  | 'appraise-evidence'
  | 'restoration-trace'
  | 'track-rival'
  | 'negotiate'
  | 'branch-choice'
  | 'proxy-bid'
  | 'rival-deal'
  | 'limited-preview'
  | 'sealed-bid'
  | 'relationship-gate'
  | 'counterfeit-table'
  | 'route-plan'
  | 'finale-prep'
  | 'finale';

export interface CampaignObjective {
  type: CampaignObjectiveType;
  target?: number;
  optional?: boolean;
  budget?: number;
  targetIds?: string[];
  maxInspections?: number;
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
    targetMinutes: [75, 110],
  },
  {
    id: 'dealer-war', order: 3,
    title: { ru: 'Глава III — Война дилеров', en: 'Chapter III — Dealer War' },
    subtitle: { ru: 'Теперь за реестром охотитесь не только вы.', en: 'You are no longer the only dealer hunting the ledger.' },
    targetMinutes: [110, 155],
  },
  {
    id: 'closed-circle', order: 4,
    title: { ru: 'Глава IV — Закрытый круг', en: 'Chapter IV — Closed Circle' },
    subtitle: { ru: 'Частные просмотры, ограниченная информация и дорогие ошибки.', en: 'Private previews, limited information and expensive mistakes.' },
    targetMinutes: [110, 165],
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
    id: 'estate-restoration-trace', chapterId: 'estate-trail', order: 4,
    title: { ru: 'Серийный номер под пылью', en: 'Serial Under the Dust' },
    briefing: { ru: 'На латунной архивной бирке остался слабый номер. Агрессивная очистка уничтожит след, слишком мягкая — ничего не покажет.', en: 'A brass archive tag carries a faint serial. Aggressive cleaning will destroy it; the wrong gentle method reveals nothing.' },
    objective: { type: 'restoration-trace', target: 1, description: { ru: 'Выберите метод очистки, который проявит номер и сохранит улику.', en: 'Choose a cleaning method that reveals the serial while preserving the evidence.' } },
    prerequisiteMissionIds: ['estate-false-paper'], rewardCash: 1000, rewardRep: 75, evidenceRewardIds: ['veyr-restored-serial'], artId: 'evidence-restored-serial',
  },
  {
    id: 'estate-night-clearances', chapterId: 'estate-trail', order: 5,
    title: { ru: 'Две ночные распродажи', en: 'Two Night Clearances' },
    briefing: { ru: 'Серийный номер указывает не на владельца, а на ликвидационную фирму. Нужно увидеть ещё две её распродажи и сравнить повторяющиеся лоты.', en: 'The serial points to a liquidation broker, not an owner. Observe two more clearances and compare the repeated lot pattern.' },
    objective: { type: 'play-auction', target: 2, description: { ru: 'Завершите 2 аукциона после начала задания.', en: 'Complete 2 auctions after starting the mission.' } },
    prerequisiteMissionIds: ['estate-restoration-trace'], rewardCash: 1200, rewardRep: 85, evidenceRewardIds: ['estate-broker-pattern'], artId: 'campaign-records-basement',
  },
  {
    id: 'estate-mira-offer', chapterId: 'estate-trail', order: 6,
    title: { ru: 'Цена информации', en: 'The Price of Information' },
    briefing: { ru: 'Мира знает, кто купил следующую часть реестра, но просит оплату сейчас — деньгами или услугой.', en: 'Mira knows who bought the next ledger fragment, but wants payment now — cash or a favor.' },
    objective: { type: 'negotiate', target: 1, description: { ru: 'Решите, чем заплатить Мире — или откажитесь от её короткого пути.', en: 'Choose how to pay Mira — or refuse her shortcut.' } },
    prerequisiteMissionIds: ['estate-night-clearances'], rewardCash: 700, rewardRep: 80, evidenceRewardIds: ['private-auction-lead'], featuredRivalId: 'npc-1', artId: 'private-invitation',
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
    briefing: { ru: 'Антон теперь знает, что вы идёте по следу Вейра, и специально давит на ваши ставки. Одной победой его не убедить.', en: 'Anton knows you are following Veyr and deliberately pressures your bids. One win will not make him back off.' },
    objective: { type: 'win-auction', target: 2, description: { ru: 'Выиграйте 2 аукциона после начала задания, несмотря на давление дилеров.', en: 'Win 2 auctions after starting the mission despite dealer pressure.' } },
    prerequisiteMissionIds: ['dealer-war-leak'], rewardCash: 1500, rewardRep: 115, featuredRivalId: 'npc-2',
  },
  {
    id: 'dealer-war-ally', chapterId: 'dealer-war', order: 3,
    title: { ru: 'Один союзник', en: 'One Ally' },
    briefing: { ru: 'Виктор предлагает тихо убрать Антона с одного просмотра. Мира предлагает ложный адрес. Обоих одновременно использовать нельзя.', en: 'Victor offers to quietly keep Anton out of one preview. Mira offers a false address. You cannot use both plays at once.' },
    objective: { type: 'branch-choice', target: 1, description: { ru: 'Выберите, чью помощь принять перед следующим закрытым просмотром.', en: 'Choose whose help to accept before the next private preview.' } },
    prerequisiteMissionIds: ['dealer-war-pressure'], rewardCash: 800, rewardRep: 120, artId: 'provenance-folder',
  },
  {
    id: 'dealer-war-proxy', chapterId: 'dealer-war', order: 4,
    title: { ru: 'Два конверта', en: 'Two Proxy Slips' },
    briefing: { ru: 'Два лота закрываются одновременно. Один содержит архивный ящик, второй специально выглядит дороже. На оба действует один лимит.', en: 'Two lots close simultaneously. One carries the archive crate; the other is staged to look more valuable. Both share one hard envelope.' },
    objective: { type: 'proxy-bid', target: 1, budget: 9500, description: { ru: 'Распределите не более 9 500 ₽ так, чтобы гарантировать архивный лот и не сжечь бюджет на приманке.', en: 'Allocate no more than 9,500 ₽ so the archive lot is secured without burning the envelope on the decoy.' } },
    prerequisiteMissionIds: ['dealer-war-ally'], rewardCash: 1600, rewardRep: 130, evidenceRewardIds: ['proxy-bid-slip'], featuredRivalId: 'npc-2', artId: 'dealer-proxy-sheet',
  },
  {
    id: 'dealer-war-counteroffer', chapterId: 'dealer-war', order: 5,
    title: { ru: 'Контрпредложение Антона', en: "Anton's Counteroffer" },
    briefing: { ru: 'После проигранного архивного лота Антон предлагает имя покупателя. Он хочет деньги, будущую услугу или открытый отказ.', en: 'After losing the archive lot, Anton offers the buyer alias. He wants cash, a future favor or an explicit refusal.' },
    objective: { type: 'rival-deal', target: 1, description: { ru: 'Закройте сделку с Антоном или откажитесь и примите последствия для соперничества.', en: 'Settle with Anton or refuse and accept the rivalry consequence.' } },
    prerequisiteMissionIds: ['dealer-war-proxy'], rewardCash: 1000, rewardRep: 135, evidenceRewardIds: ['anton-buyer-alias'], featuredRivalId: 'npc-2', artId: 'dealer-proxy-sheet',
  },
  {
    id: 'dealer-war-address', chapterId: 'dealer-war', order: 6,
    title: { ru: 'Сгоревший адрес', en: 'The Burned Address' },
    briefing: { ru: 'После вашей сделки сеть меняет место встречи. На трёх карточках только одна использует тот же типографский дефект, что и настоящее приглашение.', en: 'After your move, the network changes venues. Only one of three cards carries the same printing defect as the genuine invitation.' },
    objective: { type: 'select-evidence-lot', target: 1, description: { ru: 'Найдите настоящий новый адрес по дефекту печати.', en: 'Find the genuine new address from the printing defect.' } },
    prerequisiteMissionIds: ['dealer-war-counteroffer'], rewardCash: 1500, rewardRep: 140, evidenceRewardIds: ['closed-circle-address'], artId: 'private-invitation',
  },
  {
    id: 'closed-circle-preview', chapterId: 'closed-circle', order: 1,
    title: { ru: 'Три минуты на просмотр', en: 'Three-Minute Preview' },
    briefing: { ru: 'В закрытом круге нельзя осмотреть всё. Вам дают три проверки на пять объектов, и две витрины специально выставлены как приманки.', en: 'The closed circle does not allow full inspection. You get three checks across five objects, with two displays deliberately staged as decoys.' },
    objective: { type: 'limited-preview', target: 2, maxInspections: 3, targetIds: ['ledger-frame', 'ivory-catalogue'], description: { ru: 'Найдите обе связанные с Вейром вещи, используя не более трёх проверок.', en: 'Identify both Veyr-linked objects using no more than three inspections.' } },
    prerequisiteMissionIds: ['dealer-war-address'], rewardCash: 1700, rewardRep: 155, evidenceRewardIds: ['circle-preview-code'], artId: 'closed-circle-room',
  },
  {
    id: 'closed-circle-sealed-bid', chapterId: 'closed-circle', order: 2,
    title: { ru: 'Одна ставка', en: 'One Bid Only' },
    briefing: { ru: 'На ключевой архивный лот нет открытых торгов. Каждый дилер пишет одну сумму, не видя остальных. Переплата режет дальнейший бюджет, недобор отдаёт лот Антону.', en: 'The key archive lot has no open bidding. Every dealer writes one number without seeing the others. Overpaying hurts the next stage; bidding short hands the lot to Anton.' },
    objective: { type: 'sealed-bid', budget: 9600, target: 1, description: { ru: 'Выберите единственную ставку: достаточно высокую для победы, но не выше 9 600 ₽.', en: 'Choose one sealed bid: high enough to win, but no higher than 9,600 ₽.' } },
    prerequisiteMissionIds: ['closed-circle-preview'], rewardCash: 2100, rewardRep: 175, evidenceRewardIds: ['veyr-buyer-list'], featuredRivalId: 'npc-2', artId: 'sealed-bid-card',
  },
  {
    id: 'closed-circle-debt', chapterId: 'closed-circle', order: 3,
    title: { ru: 'Счёт приходит сейчас', en: 'The Debt Comes Due' },
    briefing: { ru: 'Организатор требует поручителя. Старые решения с Виктором и Мирой впервые определяют, кто впишется за вас — и какой долг придётся вернуть.', en: 'The host requires a sponsor. Your earlier choices with Victor and Mira now determine who will vouch for you — and which debt must be repaid.' },
    objective: { type: 'relationship-gate', target: 1, description: { ru: 'Получите поручительство через доверие или закройте старый долг ценой денег/репутации.', en: 'Secure sponsorship through trust or settle an old debt with cash/reputation.' } },
    prerequisiteMissionIds: ['closed-circle-sealed-bid'], rewardCash: 900, rewardRep: 210, evidenceRewardIds: ['circle-sponsor-token'], artId: 'circle-sponsor-token',
  },
  {
    id: 'closed-circle-counterfeit', chapterId: 'closed-circle', order: 4,
    title: { ru: 'Стол подделок', en: 'The Counterfeit Table' },
    briefing: { ru: 'Перед внутренним аукционом выкладывают четыре provenance-папки. Две настоящие, две собраны из правильных деталей в неправильных сочетаниях.', en: 'Before the inner auction, four provenance folders are laid out. Two are genuine; two combine correct details in the wrong pairings.' },
    objective: { type: 'counterfeit-table', target: 2, targetIds: ['folder-17', 'wax-card-c'], description: { ru: 'Выберите две подлинные provenance-улики, сопоставив бумагу, воск и микрометку.', en: 'Choose the two genuine provenance pieces by matching paper, wax and micro-mark.' } },
    prerequisiteMissionIds: ['closed-circle-debt'], rewardCash: 1900, rewardRep: 220, evidenceRewardIds: ['circle-genuine-pair'], artId: 'counterfeit-table',
  },
  {
    id: 'closed-circle-silent-room', chapterId: 'closed-circle', order: 5,
    title: { ru: 'Подтвердить место за столом', en: 'Keep Your Seat' },
    briefing: { ru: 'После проверки документов вам дают два обычных торговых раунда. Нужно доказать, что приглашение было не случайностью.', en: 'After the document check, you get two ordinary auction rounds. Prove the invitation was not a fluke.' },
    objective: { type: 'win-auction', target: 2, description: { ru: 'Выиграйте 2 аукциона после старта задания.', en: 'Win 2 auctions after starting the mission.' } },
    prerequisiteMissionIds: ['closed-circle-counterfeit'], rewardCash: 2200, rewardRep: 230, featuredRivalId: 'npc-2', artId: 'closed-circle-room',
  },
  {
    id: 'closed-circle-ledger-room', chapterId: 'closed-circle', order: 6,
    title: { ru: 'Комната без каталога', en: 'The Uncatalogued Room' },
    briefing: { ru: 'Последняя комната не отмечена ни в одном списке. У вас есть список покупателей, код просмотра и жетон поручителя — вместе они дают номер ячейки с последней частью реестра.', en: 'The final room appears in no catalogue. The buyer list, preview code and sponsor token together reveal the locker holding the ledger’s final surviving section.' },
    objective: { type: 'select-evidence-lot', target: 1, description: { ru: 'Сопоставьте три улики и выберите правильную ячейку.', en: 'Combine the three clues and choose the correct locker.' } },
    prerequisiteMissionIds: ['closed-circle-silent-room'], rewardCash: 2600, rewardRep: 240, evidenceRewardIds: ['lost-collection-index'], artId: 'sealed-bid-card',
  },
  {
    id: 'lost-collection-route', chapterId: 'lost-collection', order: 1,
    title: { ru: 'Маршрут из индекса', en: 'Route from the Index' },
    briefing: { ru: 'Индекс не содержит адреса. Он связывает сектор C-17, список покупателей и старую транспортную схему. Только один маршрут сходится по всем трём признакам.', en: 'The index contains no address. It links sector C-17, the buyer list and an old transport diagram. Only one route fits all three clues.' },
    objective: { type: 'route-plan', target: 1, description: { ru: 'Восстановите правильный маршрут к последней распродаже Вейра.', en: 'Reconstruct the correct route to Veyr’s final sale.' } },
    prerequisiteMissionIds: ['closed-circle-ledger-room'], rewardCash: 2000, rewardRep: 250, evidenceRewardIds: ['veyr-river-route'], artId: 'final-route-map',
  },
  {
    id: 'lost-collection-prep', chapterId: 'lost-collection', order: 2,
    title: { ru: 'Кого взять в финал', en: 'Choose Your Final Partner' },
    briefing: { ru: 'На последнюю распродажу можно войти с одним союзником — или без него. Выбор меняет информационное преимущество и финальную оценку отношений.', en: 'You can enter the last sale with one ally — or alone. The choice changes your information edge and the final relationship outcome.' },
    objective: { type: 'finale-prep', target: 1, description: { ru: 'Выберите Виктора, Миру или одиночный вход перед финальными торгами.', en: 'Choose Victor, Mira or a solo entry before the final auction.' } },
    prerequisiteMissionIds: ['lost-collection-route'], rewardCash: 1500, rewardRep: 260, artId: 'private-invitation',
  },
  {
    id: 'lost-collection-finale', chapterId: 'lost-collection', order: 3,
    title: { ru: 'Последние четыре лота', en: 'The Final Four Lots' },
    briefing: { ru: 'Четыре объекта уходят подряд под одним бюджетом. Два закрывают историю Вейра, два дают огромную прибыль. Купить всё невозможно.', en: 'Four objects sell back-to-back under one shared envelope. Two resolve Veyr’s history; two maximize profit. You cannot buy everything.' },
    objective: { type: 'finale', target: 1, description: { ru: 'Войдите в финальный multi-lot аукцион и определите судьбу Чёрного реестра.', en: 'Enter the final multi-lot auction and decide the fate of the Black Ledger.' } },
    prerequisiteMissionIds: ['lost-collection-prep'], rewardCash: 0, rewardRep: 0, artId: 'campaign-veyr-estate',
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
    id: 'veyr-restored-serial',
    title: { ru: 'Восстановленный серийный номер', en: 'Recovered Serial Mark' },
    description: { ru: 'Сухая очистка проявила серийный номер ликвидационной фирмы, не повредив патину.', en: 'Dry cleaning revealed a liquidation-company serial without destroying the patina.' },
    artId: 'evidence-restored-serial',
  },
  {
    id: 'estate-broker-pattern',
    title: { ru: 'Повторяющийся брокер', en: 'Repeating Broker Pattern' },
    description: { ru: 'Две ночные распродажи используют ту же систему нумерации и упаковки, что и номер 47-Б.', en: 'Two night clearances use the same numbering and packing system as inventory 47-B.' },
    artId: 'campaign-records-basement',
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
    id: 'proxy-bid-slip',
    title: { ru: 'Копия proxy-ставки', en: 'Proxy Bid Copy' },
    description: { ru: 'На обороте архивного конверта осталось имя посредника, через которого закрытый круг покупал лоты.', en: 'The reverse of the archive proxy slip carries the name of the intermediary used by the closed circle.' },
    artId: 'dealer-proxy-sheet',
  },
  {
    id: 'anton-buyer-alias',
    title: { ru: 'Псевдоним покупателя', en: 'Buyer Alias' },
    description: { ru: 'Антон подтверждает псевдоним, который встречается в proxy-ставке и старой описи.', en: 'Anton confirms an alias shared by the proxy slip and the old inventory.' },
    artId: 'dealer-proxy-sheet',
  },
  {
    id: 'closed-circle-address',
    title: { ru: 'Новый адрес круга', en: 'Closed Circle Address' },
    description: { ru: 'Типографский дефект подтверждает подлинность новой карточки. След ведёт в закрытый круг покупателей.', en: 'A printing defect authenticates the new card. The trail now leads into the closed circle of buyers.' },
    artId: 'private-invitation',
  },
  {
    id: 'circle-preview-code',
    title: { ru: 'Код закрытого просмотра', en: 'Private Preview Code' },
    description: { ru: 'Два настоящих объекта несут одинаковую микрометку: C-17. Это не номер лота, а внутренний код комнаты.', en: 'Two genuine objects carry the same micro-mark: C-17. It is not a lot number but an internal room code.' },
    artId: 'closed-circle-room',
  },
  {
    id: 'veyr-buyer-list',
    title: { ru: 'Список покупателей Вейра', en: "Veyr's Buyer List" },
    description: { ru: 'За выигранной sealed bid карточкой скрывается короткий список покупателей и повторяющийся номер 17.', en: 'The won sealed-bid card conceals a short buyer list with the number 17 recurring beside several names.' },
    artId: 'sealed-bid-card',
  },
  {
    id: 'circle-sponsor-token',
    title: { ru: 'Жетон поручителя', en: 'Sponsor Token' },
    description: { ru: 'Поручитель передаёт латунный жетон с буквой C. Вместе с кодом просмотра он указывает на сектор C-17.', en: 'Your sponsor provides a brass token stamped C. Combined with the preview code, it points to sector C-17.' },
    artId: 'circle-sponsor-token',
  },
  {
    id: 'circle-genuine-pair',
    title: { ru: 'Подлинная пара документов', en: 'Genuine Provenance Pair' },
    description: { ru: 'Две provenance-улики совпадают по бумаге, воску и микрометке; подделки смешивали признаки разных партий.', en: 'Two provenance pieces match on paper, wax and micro-mark; the fakes mixed details from different batches.' },
    artId: 'counterfeit-table',
  },
  {
    id: 'lost-collection-index',
    title: { ru: 'Индекс потерянной коллекции', en: 'Lost Collection Index' },
    description: { ru: 'В ячейке C-17 лежит индекс последней коллекции Вейра — переход к финальной главе.', en: "Locker C-17 contains the index to Veyr's final collection — the lead into the last chapter." },
    artId: 'evidence-ledger-fragment',
  },
  {
    id: 'veyr-river-route',
    title: { ru: 'Маршрут к речному архиву', en: 'River Archive Route' },
    description: { ru: 'Индекс, список покупателей и сектор C-17 сходятся на старом речном архиве, где назначены последние торги.', en: 'The index, buyer list and C-17 sector converge on an old river archive hosting the final sale.' },
    artId: 'final-route-map',
  },
] as const;

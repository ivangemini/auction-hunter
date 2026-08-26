import type { LocalizedText } from '../domain/types';

export interface CampaignMessageAction {
  id: string;
  label: LocalizedText;
  rivalId?: string;
  relationship?: Partial<Record<'trust' | 'rivalry' | 'debt', number>>;
}

export interface CampaignMessageDefinition {
  id: string;
  senderId: string;
  sender: LocalizedText;
  subject: LocalizedText;
  body: LocalizedText;
  afterMissionId: string;
  action?: CampaignMessageAction;
}

export const CAMPAIGN_MESSAGES: readonly CampaignMessageDefinition[] = [
  {
    id: 'victor-black-seal', senderId: 'npc-0', sender: { ru: 'Виктор', en: 'Victor' },
    subject: { ru: 'Про ту печать', en: 'About that seal' },
    body: { ru: 'Я видел этот знак на закрытых описях лет десять назад. Не продавай бумагу вместе с мусором. И не показывай её каждому дилеру в комнате.', en: 'I saw that mark on closed inventories about ten years ago. Do not sell the paper with the junk, and do not show it to every dealer in the room.' },
    afterMissionId: 'black-seal',
  },
  {
    id: 'nadia-47b', senderId: 'npc-6', sender: { ru: 'Надя', en: 'Nadia' },
    subject: { ru: '47-Б — это не номер лота', en: '47-B is not a lot number' },
    body: { ru: 'В архивных описях буква после числа обычно означает внутренний раздел. Если у тебя 47-Б, ищи не второй 47-й лот, а продолжение той же папки.', en: 'In archive inventories, the letter after a number usually marks an internal section. If you have 47-B, look for a continuation of the same file, not another lot numbered 47.' },
    afterMissionId: 'estate-paper-trail',
  },
  {
    id: 'mira-clean-paper', senderId: 'npc-1', sender: { ru: 'Мира', en: 'Mira' },
    subject: { ru: 'Слишком чистый provenance', en: 'Provenance too clean' },
    body: { ru: 'Настоящие архивы пачкаются, теряют углы и меняют руки. Идеальная история иногда стоит дешевле грязной правды. Ты уже понял почему.', en: 'Real archives get dirty, lose corners and change hands. A perfect story is sometimes worth less than a messy truth. You know why now.' },
    afterMissionId: 'estate-false-paper',
  },
  {
    id: 'anton-warning', senderId: 'npc-2', sender: { ru: 'Антон', en: 'Anton' },
    subject: { ru: 'Хватит ходить по моим следам', en: 'Stop following my trail' },
    body: { ru: 'Если ещё раз придёшь на просмотр раньше общей рассылки — считай, что мы оба поняли правила. Я цену не уступлю.', en: 'If you show up before the general notice again, assume we both understand the rules. I will not yield on price.' },
    afterMissionId: 'dealer-war-leak',
  },
  {
    id: 'nadia-archive-exchange', senderId: 'npc-6', sender: { ru: 'Надя', en: 'Nadia' },
    subject: { ru: 'Могу проверить старую картотеку', en: 'I can check the old card index' },
    body: { ru: 'У меня есть доступ к старой картотеке ликвидатора Вейра. Я проверю адрес бесплатно сейчас, но потом ты пропустишь меня вперёд на одном архивном лоте. Согласен?', en: 'I can access the old card index used by Veyr’s liquidator. I will verify the address for free now, but later you let me take the lead on one archive lot. Deal?' },
    afterMissionId: 'dealer-war-ally',
    action: {
      id: 'nadia-archive-favor', label: { ru: 'Принять услугу', en: 'Accept the favor' }, rivalId: 'npc-6', relationship: { trust: 12, debt: 10 },
    },
  },
  {
    id: 'nadia-circle-note', senderId: 'npc-6', sender: { ru: 'Надя', en: 'Nadia' },
    subject: { ru: 'C-17 встречался раньше', en: 'C-17 appeared before' },
    body: { ru: 'C-17 есть в старом списке комнат, но рядом зачёркнуто имя покупателя. Если сохранил список со sealed bid, сравни повторяющиеся номера, не фамилии.', en: 'C-17 appears in an older room list, but the buyer name beside it is crossed out. If you kept the sealed-bid list, compare recurring numbers, not surnames.' },
    afterMissionId: 'closed-circle-sealed-bid',
  },
  {
    id: 'nadia-final-route', senderId: 'npc-6', sender: { ru: 'Надя', en: 'Nadia' },
    subject: { ru: 'Речной архив', en: 'The river archive' },
    body: { ru: 'Маршрут заканчивается не у дома Вейра. Последний склад стоит у воды — старый архив перевозчика. Там документы держали отдельно от вещей, поэтому не путай дорогой лот с важным.', en: 'The route does not end at Veyr’s house. The final store is by the water, an old freight archive. They kept documents apart from objects, so do not confuse the expensive lot with the important one.' },
    afterMissionId: 'lost-collection-route',
  },
  {
    id: 'nadia-epilogue', senderId: 'npc-6', sender: { ru: 'Надя', en: 'Nadia' },
    subject: { ru: 'Что останется в архиве', en: 'What remains in the archive' },
    body: { ru: 'Неважно, что ты оставил себе. Важно, что теперь у вещей снова есть последовательность. Для дилеров это цена. Для архива — память.', en: 'What you kept matters less than the fact the objects have a sequence again. To dealers that is price. To an archive it is memory.' },
    afterMissionId: 'lost-collection-finale',
  },
];

export function campaignMessageUnlocked(message: CampaignMessageDefinition, completedMissionIds: readonly string[]): boolean {
  return completedMissionIds.includes(message.afterMissionId);
}

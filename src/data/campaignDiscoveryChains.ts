import { ITEM_BY_ID } from './catalog';
import { DISCOVERY_CHAINS, type DiscoveryChainDefinition } from './discoveryChains';

/**
 * Optional P9 discovery cases. They echo campaign evidence and chapter themes,
 * but never gate CAMPAIGN_MISSIONS: normal auction finds alone can progress them.
 */
export const CAMPAIGN_DISCOVERY_CHAINS: readonly DiscoveryChainDefinition[] = [
  {
    id: 'ledger-first-mark',
    title: { ru: 'Первая чёрная метка', en: 'The First Black Mark' },
    premise: {
      ru: 'До официального расследования три обычные находки уже несут одинаковую чёрную архивную метку.',
      en: 'Before the formal investigation, three ordinary finds already carry the same black archive mark.',
    },
    steps: [
      { itemId: 'slide-projector', clue: { ru: 'Найдите диапроектор с выцветшим знаком на крышке.', en: 'Find the slide projector with a faded mark on its lid.' } },
      { itemId: 'archivist-loupe', alternativeItemIds: ['field-compass'], clue: { ru: 'Сверьте знак на архивной лупе или полевом компасе.', en: 'Cross-check the mark on an archivist loupe or field compass.' } },
      { itemId: 'wax-seal-box', clue: { ru: 'Замкните след набором сургучных печатей с тем же геометрическим знаком.', en: 'Close the trail with a wax seal box carrying the same geometric device.' } },
    ],
    rewardCash: 2400,
    rewardReputationXp: 55,
  },
  {
    id: 'ledger-estate-negative',
    title: { ru: 'Негативы поместья', en: 'Estate Negatives' },
    premise: {
      ru: 'Фотоматериалы и инвентарные записи показывают, как коллекцию дробили перед распродажами.',
      en: 'Photographic material and inventory records show how the collection was split before clearance sales.',
    },
    steps: [
      { itemId: 'negative-album', clue: { ru: 'Найдите альбом с кадрами ещё не разделённого кабинета.', en: 'Find the negative album showing the study before it was split.' } },
      { itemId: 'postal-scale', clue: { ru: 'Сопоставьте весовые пометки с латунными почтовыми весами ликвидатора.', en: "Match the weight notes to the liquidator's brass postal scale." } },
      { itemId: 'auctioneers-ledger', alternativeItemIds: ['manual-typewriter'], clue: { ru: 'Доберитесь до журнала аукциониста или машинки, на которой печатали ведомости.', en: 'Reach the auctioneer ledger or the typewriter used for the clearance sheets.' } },
    ],
    rewardCash: 3100,
    rewardReputationXp: 70,
  },
  {
    id: 'ledger-dealer-wire',
    title: { ru: 'Дилерская прослушка', en: 'Dealer Wire' },
    premise: {
      ru: 'Записи переговоров, шифр и рабочий инструмент связывают нескольких дилеров с одной скрытой сетью.',
      en: 'Recorded conversations, a cipher and workshop tools connect several dealers to one hidden network.',
    },
    steps: [
      { itemId: 'field-recorder', clue: { ru: 'Найдите полевой диктофон с остатком чужой записи.', en: 'Find the field recorder carrying the tail of someone else’s conversation.' } },
      { itemId: 'brass-cipher-wheel', clue: { ru: 'Сопоставьте повторяющиеся номера с латунным шифр-диском.', en: 'Match the repeated numbers to the brass cipher wheel.' } },
      { itemId: 'watchmaker-tools', alternativeItemIds: ['multimeter'], clue: { ru: 'Проверьте мастерскую по набору часовщика или измерителю с той же меткой.', en: 'Trace the workshop through the watchmaker tools or a meter carrying the same mark.' } },
    ],
    rewardCash: 3600,
    rewardReputationXp: 80,
  },
  {
    id: 'ledger-closed-catalogue',
    title: { ru: 'Каталог без номера', en: 'The Unnumbered Catalogue' },
    premise: {
      ru: 'Закрытый круг оставляет след только в микрофильме, архивном дипломате и одном номерном изображении.',
      en: 'The closed circle leaves a trace only on microfilm, an archival document case and one numbered image.',
    },
    steps: [
      { itemId: 'microfilm-reader', clue: { ru: 'Найдите просмотрщик, настроенный на нестандартный формат карточек.', en: 'Find the reader configured for a nonstandard card format.' } },
      { itemId: 'lacquer-document-case', clue: { ru: 'Сверьте формат с отделениями лакового архивного дипломата.', en: 'Match the format to the compartments inside the lacquer document case.' } },
      { itemId: 'numbered-lithograph', alternativeItemIds: ['gallery-print'], clue: { ru: 'Закройте дело номерной литографией или галерейным принтом с тем же кодом.', en: 'Close the case with the numbered lithograph or a gallery print carrying the same code.' } },
    ],
    rewardCash: 4400,
    rewardReputationXp: 95,
  },
  {
    id: 'ledger-river-expedition',
    title: { ru: 'Последняя экспедиция Вейра', en: "Veyr's Last Expedition" },
    premise: {
      ru: 'Карта, геодезический прибор и экспедиционная камера независимо указывают на один речной маршрут.',
      en: 'A map case, survey instrument and expedition camera independently point to the same river route.',
    },
    steps: [
      { itemId: 'brass-map-case', alternativeItemIds: ['field-compass'], clue: { ru: 'Начните с латунного футляра карт или компаса с тем же сектором.', en: 'Start with the brass map case or a compass carrying the same sector.' } },
      { itemId: 'surveyor-transit', clue: { ru: 'Подтвердите координаты старым геодезическим теодолитом.', en: 'Confirm the coordinates with the antique surveyor transit.' } },
      { itemId: 'expedition-camera', alternativeItemIds: ['instant-camera'], clue: { ru: 'Найдите камеру, на которой сохранился последний визуальный след маршрута.', en: 'Find the camera preserving the route’s final visual record.' } },
    ],
    rewardCash: 5600,
    rewardReputationXp: 120,
  },
];

export function registerCampaignDiscoveryChains(): void {
  const mutable = DISCOVERY_CHAINS as DiscoveryChainDefinition[];
  for (const chain of CAMPAIGN_DISCOVERY_CHAINS) {
    if (mutable.some((candidate) => candidate.id === chain.id)) continue;
    for (const step of chain.steps) {
      for (const itemId of [step.itemId, ...(step.alternativeItemIds ?? [])]) {
        if (!ITEM_BY_ID.has(itemId)) throw new Error(`Missing campaign discovery item ${chain.id}:${itemId}`);
      }
    }
    mutable.push(chain);
  }
}

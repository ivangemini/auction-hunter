import type { CollectorRequestDefinition } from '../domain/collectorRequests';

export const COLLECTOR_REQUEST_WINDOW_AUCTIONS = 6;

export const COLLECTOR_REQUESTS: readonly CollectorRequestDefinition[] = [
  {
    id: 'estate-watch-client',
    name: { ru: 'Частный заказ на часы', en: 'Private Watch Commission' },
    description: {
      ru: 'Клиент ищет часы в хорошем состоянии для личной витрины.',
      en: 'A private client wants a well-preserved watch for a personal display.',
    },
    tier: 'common',
    category: 'watches',
    minCondition: 0.72,
    multiplier: 1.38,
  },
  {
    id: 'prototype-archive',
    name: { ru: 'Архив прототипов', en: 'Prototype Archive' },
    description: {
      ru: 'Архив платит за настоящий прототип или редкий предсерийный вариант.',
      en: 'An archive is paying for a genuine prototype or rare pre-production variant.',
    },
    tier: 'rare',
    traitIds: ['prototype', 'rare-variant'],
    multiplier: 1.72,
  },
  {
    id: 'documented-art',
    name: { ru: 'Куратор с документами', en: 'Documented Art Patron' },
    description: {
      ru: 'Нужно искусство с подтверждённой историей происхождения.',
      en: 'The patron wants art with a credible documented history.',
    },
    tier: 'demanding',
    category: 'art',
    traitIds: ['provenance', 'documented-history', 'signed'],
    minCondition: 0.62,
    multiplier: 1.58,
  },
  {
    id: 'sealed-electronics',
    name: { ru: 'Запечатанная техника', en: 'Sealed Electronics Hunt' },
    description: {
      ru: 'Коллекционер ищет электронику в заводской упаковке или полном оригинальном комплекте.',
      en: 'A collector wants electronics that are factory sealed or retain original presentation.',
    },
    tier: 'rare',
    category: 'electronics',
    traitIds: ['factory-sealed', 'original-packaging', 'complete-set'],
    multiplier: 1.68,
  },
  {
    id: 'mechanical-patron',
    name: { ru: 'Покровитель механики', en: 'Mechanical Patron' },
    description: {
      ru: 'Нужен механический экземпляр в достойном состоянии.',
      en: 'The patron wants a mechanical piece in respectable condition.',
    },
    tier: 'demanding',
    traitIds: ['mechanical'],
    minCondition: 0.76,
    multiplier: 1.52,
  },
  {
    id: 'restoration-project',
    name: { ru: 'Проект для реставратора', en: 'Restoration Project' },
    description: {
      ru: 'Мастерская специально ищет повреждённый или неполный экземпляр под сложное восстановление.',
      en: 'A workshop specifically wants a damaged or incomplete example for a difficult restoration.',
    },
    tier: 'common',
    traitIds: ['replacement-parts', 'incomplete', 'water-damage', 'heavy-wear'],
    maxCondition: 0.68,
    multiplier: 1.42,
  },
  {
    id: 'signed-showpiece',
    name: { ru: 'Подписанный экспонат', en: 'Signed Showpiece' },
    description: {
      ru: 'Для выставки нужен подписанный экземпляр без совсем тяжёлых повреждений.',
      en: 'An exhibition needs a signed piece without severe condition problems.',
    },
    tier: 'demanding',
    traitIds: ['signed'],
    minCondition: 0.65,
    multiplier: 1.5,
  },
  {
    id: 'museum-grade-toy',
    name: { ru: 'Игрушка музейного уровня', en: 'Museum-Grade Toy' },
    description: {
      ru: 'Музей ищет винтажную игрушку в исключительном состоянии.',
      en: 'A museum is seeking a vintage toy in exceptional condition.',
    },
    tier: 'rare',
    category: 'toys',
    minCondition: 0.88,
    multiplier: 1.78,
  },
];

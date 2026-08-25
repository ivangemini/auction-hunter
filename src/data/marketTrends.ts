import type { MarketTrendDefinition, MarketTrendSchedule } from '../domain/marketTrend';

export const MARKET_TREND_SCHEDULE: MarketTrendSchedule = {
  activeAuctions: 3,
  cooldownAuctions: 2,
};

export const MARKET_TRENDS: readonly MarketTrendDefinition[] = [
  {
    id: 'watch-fever',
    name: { ru: 'Часовой ажиотаж', en: 'Watch Fever' },
    description: {
      ru: 'Коллекционеры активно ищут часы. Лоты с явными часовыми сигналами сейчас ценятся выше.',
      en: 'Collectors are chasing watches. Lots with visible watch signals are valued more strongly right now.',
    },
    category: 'watches',
    valueMultiplier: 1.16,
  },
  {
    id: 'electronics-glut',
    name: { ru: 'Перенасыщение техникой', en: 'Electronics Glut' },
    description: {
      ru: 'На рынке слишком много старой электроники. Явно технические лоты временно оцениваются осторожнее.',
      en: 'Too much vintage electronics hit the market. Clearly electronics-heavy lots are valued more cautiously.',
    },
    category: 'electronics',
    valueMultiplier: 0.92,
  },
  {
    id: 'toy-nostalgia',
    name: { ru: 'Волна ностальгии', en: 'Toy Nostalgia Wave' },
    description: {
      ru: 'Винтажные игрушки снова в моде. Лоты с такими сигналами получают премию.',
      en: 'Vintage toys are back in fashion. Lots with those visible signals receive a premium.',
    },
    category: 'toys',
    valueMultiplier: 1.14,
  },
  {
    id: 'gallery-season',
    name: { ru: 'Сезон галерей', en: 'Gallery Season' },
    description: {
      ru: 'Частные кураторы активно закупаются. Искусство в явно отмеченных лотах дорожает.',
      en: 'Private curators are buying aggressively. Art in visibly signaled lots is trading higher.',
    },
    category: 'art',
    valueMultiplier: 1.15,
  },
  {
    id: 'workshop-shortage',
    name: { ru: 'Дефицит мастерских', en: 'Workshop Shortage' },
    description: {
      ru: 'Хороший инструмент быстро разбирают. Лоты с инструментальными сигналами получают дополнительный спрос.',
      en: 'Useful vintage tools are scarce. Lots with visible tool signals attract extra demand.',
    },
    category: 'tools',
    valueMultiplier: 1.12,
  },
  {
    id: 'curio-correction',
    name: { ru: 'Коррекция редкостей', en: 'Curio Correction' },
    description: {
      ru: 'Рынок необычных коллекционных вещей остыл. Явно коллекционные лоты временно оцениваются ниже.',
      en: 'The general curiosity market cooled off. Clearly collectible lots are temporarily valued lower.',
    },
    category: 'collectibles',
    valueMultiplier: 0.91,
  },
];

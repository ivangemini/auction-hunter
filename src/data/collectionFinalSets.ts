import type { CollectionSetDefinition } from './collections';

/**
 * Final P5 Collection Book breadth pack. Kept separate so the 20 -> 24 delta
 * remains auditable while stable legacy set ids stay untouched.
 */
export const FINAL_COLLECTION_SETS = [
  {
    id: 'broadcast-age',
    name: { ru: 'Эпоха эфира', en: 'Broadcast Age' },
    itemIds: ['cassette-player', 'portable-radio', 'pocket-tv', 'signed-vinyl'],
    reward: 3000,
    perk: {
      description: { ru: '+2% к продаже электроники и искусства', en: '+2% quick-sale value for electronics and art' },
      categories: ['electronics', 'art'],
      resaleRateBonus: 0.02,
    },
  },
  {
    id: 'prototype-cabinet',
    name: { ru: 'Шкаф прототипов', en: 'Prototype Cabinet' },
    itemIds: ['prototype-toy', 'preproduction-figure', 'clockwork-automaton', 'mini-console'],
    reward: 3800,
    perk: {
      description: { ru: '+2% к продаже игрушек и электроники', en: '+2% quick-sale value for toys and electronics' },
      categories: ['toys', 'electronics'],
      resaleRateBonus: 0.02,
    },
  },
  {
    id: 'collector-desk',
    name: { ru: 'Стол коллекционера', en: 'Collector Desk' },
    itemIds: ['fountain-pen', 'first-edition-book', 'silver-ring', 'travel-clock'],
    reward: 3200,
    perk: {
      description: { ru: '+2% к продаже часов и редкостей', en: '+2% quick-sale value for watches and collectibles' },
      categories: ['watches', 'collectibles'],
      resaleRateBonus: 0.02,
    },
  },
  {
    id: 'after-hours-exhibit',
    name: { ru: 'Ночная экспозиция', en: 'After-Hours Exhibit' },
    itemIds: ['master-study', 'signed-poster', 'signed-vinyl', 'art-deco-lamp', 'gallery-print'],
    reward: 4000,
    perk: {
      description: { ru: '+3% к быстрой продаже искусства', en: '+3% quick-sale value for art' },
      categories: ['art'],
      resaleRateBonus: 0.03,
    },
  },
] satisfies CollectionSetDefinition[];

import type { ItemCategory, LocalizedText } from '../domain/types';
import { FINAL_COLLECTION_SETS } from './collectionFinalSets';

export interface CollectionSetPerk {
  description: LocalizedText;
  categories: ItemCategory[];
  resaleRateBonus: number;
}

export interface CollectionSetDefinition {
  id: string;
  name: LocalizedText;
  itemIds: string[];
  reward: number;
  perk: CollectionSetPerk;
}

export interface CollectionProgress {
  collected: number;
  total: number;
  complete: boolean;
}

export const COLLECTION_RESALE_RATE = 0.65;
export const COLLECTION_EXPERTISE_BONUS_CAP = 0.1;
export const COLLECTION_EXPERTISE_RESALE_RATE_CAP = 0.9;

export const COLLECTION_SETS: CollectionSetDefinition[] = [
  {
    id: 'retro-tech',
    name: { ru: 'Ретро-техника', en: 'Retro Tech' },
    itemIds: ['cassette-player', 'film-camera', 'arcade-handheld'],
    reward: 1200,
    perk: {
      description: { ru: '+3% к быстрой продаже электроники', en: '+3% quick-sale value for electronics' },
      categories: ['electronics'],
      resaleRateBonus: 0.03,
    },
  },
  {
    id: 'clockwork',
    name: { ru: 'Хранители времени', en: 'Timekeepers' },
    itemIds: ['brass-clock', 'pocket-watch'],
    reward: 900,
    perk: {
      description: { ru: '+4% к быстрой продаже часов', en: '+4% quick-sale value for watches' },
      categories: ['watches'],
      resaleRateBonus: 0.04,
    },
  },
  {
    id: 'toy-vault',
    name: { ru: 'Игрушечный сейф', en: 'Toy Vault' },
    itemIds: ['toy-robot', 'prototype-toy'],
    reward: 1000,
    perk: {
      description: { ru: '+4% к быстрой продаже игрушек', en: '+4% quick-sale value for toys' },
      categories: ['toys'],
      resaleRateBonus: 0.04,
    },
  },
  {
    id: 'treasure-shelf',
    name: { ru: 'Полка находок', en: 'Treasure Shelf' },
    itemIds: ['toolbox', 'vinyl-box', 'telescope', 'signed-poster', 'silver-ring'],
    reward: 1600,
    perk: {
      description: { ru: '+3% к быстрой продаже коллекционных вещей', en: '+3% quick-sale value for collectibles' },
      categories: ['collectibles'],
      resaleRateBonus: 0.03,
    },
  },
  {
    id: 'field-tech',
    name: { ru: 'Полевая техника', en: 'Field Tech' },
    itemIds: ['multimeter', 'portable-radio', 'instant-camera'],
    reward: 1100,
    perk: {
      description: { ru: '+2% к продаже техники и инструментов', en: '+2% quick-sale value for electronics and tools' },
      categories: ['electronics', 'tools'],
      resaleRateBonus: 0.02,
    },
  },
  {
    id: 'street-nostalgia',
    name: { ru: 'Уличная ностальгия', en: 'Street Nostalgia' },
    itemIds: ['tin-car', 'mini-console', 'preproduction-figure'],
    reward: 1500,
    perk: {
      description: { ru: '+2% к продаже игрушек и электроники', en: '+2% quick-sale value for toys and electronics' },
      categories: ['toys', 'electronics'],
      resaleRateBonus: 0.02,
    },
  },
  {
    id: 'optics-and-print',
    name: { ru: 'Оптика и печать', en: 'Optics & Print' },
    itemIds: ['binoculars', 'gallery-print', 'comic-stack'],
    reward: 1300,
    perk: {
      description: { ru: '+2% к продаже искусства и редкостей', en: '+2% quick-sale value for art and collectibles' },
      categories: ['art', 'collectibles'],
      resaleRateBonus: 0.02,
    },
  },
  {
    id: 'travel-case',
    name: { ru: 'Дорожный футляр', en: 'Travel Case' },
    itemIds: ['travel-clock', 'enamel-brooch', 'military-watch'],
    reward: 1600,
    perk: {
      description: { ru: '+2% к продаже часов и редкостей', en: '+2% quick-sale value for watches and collectibles' },
      categories: ['watches', 'collectibles'],
      resaleRateBonus: 0.02,
    },
  },
  {
    id: 'repair-bench',
    name: { ru: 'Ремонтный верстак', en: 'Repair Bench' },
    itemIds: ['soldering-station', 'multimeter', 'portable-radio', 'pocket-tv'],
    reward: 1500,
    perk: {
      description: { ru: '+4% к быстрой продаже инструментов', en: '+4% quick-sale value for tools' },
      categories: ['tools'],
      resaleRateBonus: 0.04,
    },
  },
  {
    id: 'miniature-worlds',
    name: { ru: 'Миниатюрные миры', en: 'Miniature Worlds' },
    itemIds: ['model-train', 'tin-car', 'toy-robot', 'clockwork-automaton'],
    reward: 2200,
    perk: {
      description: { ru: '+3% к быстрой продаже игрушек', en: '+3% quick-sale value for toys' },
      categories: ['toys'],
      resaleRateBonus: 0.03,
    },
  },
  {
    id: 'estate-library',
    name: { ru: 'Библиотека усадьбы', en: 'Estate Library' },
    itemIds: ['manual-typewriter', 'fountain-pen', 'first-edition-book', 'porcelain-figurine'],
    reward: 2300,
    perk: {
      description: { ru: '+3% к продаже искусства и редкостей', en: '+3% quick-sale value for art and collectibles' },
      categories: ['art', 'collectibles'],
      resaleRateBonus: 0.03,
    },
  },
  {
    id: 'patron-vault',
    name: { ru: 'Сейф мецената', en: 'Patron Vault' },
    itemIds: ['art-deco-lamp', 'signed-vinyl', 'master-study', 'chronograph-watch'],
    reward: 3200,
    perk: {
      description: { ru: '+4% к продаже искусства и часов', en: '+4% quick-sale value for art and watches' },
      categories: ['art', 'watches'],
      resaleRateBonus: 0.04,
    },
  },
  {
    id: 'signal-hunters',
    name: { ru: 'Охотники за сигналом', en: 'Signal Hunters' },
    itemIds: ['portable-radio', 'pocket-tv', 'binoculars', 'telescope'],
    reward: 1900,
    perk: {
      description: { ru: '+2% к продаже электроники и редкостей', en: '+2% quick-sale value for electronics and collectibles' },
      categories: ['electronics', 'collectibles'],
      resaleRateBonus: 0.02,
    },
  },
  {
    id: 'analog-studio',
    name: { ru: 'Аналоговая студия', en: 'Analog Studio' },
    itemIds: ['film-camera', 'instant-camera', 'manual-typewriter', 'signed-vinyl'],
    reward: 2100,
    perk: {
      description: { ru: '+2% к продаже электроники и искусства', en: '+2% quick-sale value for electronics and art' },
      categories: ['electronics', 'art'],
      resaleRateBonus: 0.02,
    },
  },
  {
    id: 'precision-desk',
    name: { ru: 'Стол мастера', en: 'Precision Desk' },
    itemIds: ['fountain-pen', 'brass-clock', 'chronograph-watch', 'soldering-station'],
    reward: 2400,
    perk: {
      description: { ru: '+2% к продаже часов, инструментов и редкостей', en: '+2% quick-sale value for watches, tools and collectibles' },
      categories: ['watches', 'tools', 'collectibles'],
      resaleRateBonus: 0.02,
    },
  },
  {
    id: 'midnight-gallery',
    name: { ru: 'Полуночная галерея', en: 'Midnight Gallery' },
    itemIds: ['gallery-print', 'art-deco-lamp', 'porcelain-figurine', 'signed-poster', 'master-study'],
    reward: 3000,
    perk: {
      description: { ru: '+3% к продаже искусства и редкостей', en: '+3% quick-sale value for art and collectibles' },
      categories: ['art', 'collectibles'],
      resaleRateBonus: 0.03,
    },
  },
  {
    id: 'portable-era',
    name: { ru: 'Портативная эпоха', en: 'Portable Era' },
    itemIds: ['cassette-player', 'portable-radio', 'pocket-tv', 'mini-console'],
    reward: 2400,
    perk: {
      description: { ru: '+3% к быстрой продаже электроники', en: '+3% quick-sale value for electronics' },
      categories: ['electronics'],
      resaleRateBonus: 0.03,
    },
  },
  {
    id: 'mechanical-heritage',
    name: { ru: 'Механическое наследие', en: 'Mechanical Heritage' },
    itemIds: ['travel-clock', 'brass-clock', 'military-watch', 'pocket-watch', 'clockwork-automaton'],
    reward: 3400,
    perk: {
      description: { ru: '+2% к продаже часов и механических игрушек', en: '+2% quick-sale value for watches and toys' },
      categories: ['watches', 'toys'],
      resaleRateBonus: 0.02,
    },
  },
  {
    id: 'paper-trail',
    name: { ru: 'Бумажный след', en: 'Paper Trail' },
    itemIds: ['comic-stack', 'manual-typewriter', 'fountain-pen', 'first-edition-book', 'signed-poster'],
    reward: 2900,
    perk: {
      description: { ru: '+2% к продаже искусства и редкостей', en: '+2% quick-sale value for art and collectibles' },
      categories: ['art', 'collectibles'],
      resaleRateBonus: 0.02,
    },
  },
  {
    id: 'cabinet-curios',
    name: { ru: 'Кабинет редкостей', en: 'Cabinet of Curiosities' },
    itemIds: ['silver-ring', 'enamel-brooch', 'porcelain-figurine', 'binoculars', 'telescope'],
    reward: 3100,
    perk: {
      description: { ru: '+3% к быстрой продаже коллекционных вещей', en: '+3% quick-sale value for collectibles' },
      categories: ['collectibles'],
      resaleRateBonus: 0.03,
    },
  },
  ...FINAL_COLLECTION_SETS,
];

export function uniqueCollectionCount(collectionIds: readonly string[]): number {
  return new Set(collectionIds).size;
}

export function collectionSetProgress(
  collectionIds: readonly string[],
  set: CollectionSetDefinition,
): CollectionProgress {
  const owned = new Set(collectionIds);
  const collected = set.itemIds.reduce((count, itemId) => count + (owned.has(itemId) ? 1 : 0), 0);
  return {
    collected,
    total: set.itemIds.length,
    complete: collected === set.itemIds.length,
  };
}

export function collectionExpertiseBonus(
  claimedSetIds: readonly string[],
  category: ItemCategory,
): number {
  const claimed = new Set(claimedSetIds);
  const bonus = COLLECTION_SETS.reduce((total, set) => {
    if (!claimed.has(set.id) || !set.perk.categories.includes(category)) return total;
    return total + set.perk.resaleRateBonus;
  }, 0);
  return Math.min(COLLECTION_EXPERTISE_BONUS_CAP, Math.max(0, bonus));
}

export function collectionExpertiseResaleRate(
  baseRate: number,
  claimedSetIds: readonly string[],
  category: ItemCategory,
): number {
  const normalizedBase = Number.isFinite(baseRate) ? Math.max(0, baseRate) : 0;
  return Math.min(
    COLLECTION_EXPERTISE_RESALE_RATE_CAP,
    normalizedBase + collectionExpertiseBonus(claimedSetIds, category),
  );
}

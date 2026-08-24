import type { ItemCategory, LocalizedText } from '../domain/types';

export interface CollectionExpertisePerk {
  name: LocalizedText;
  category: ItemCategory;
  buyerMarketBonus: number;
}

export interface CollectionSetDefinition {
  id: string;
  name: LocalizedText;
  itemIds: string[];
  reward: number;
  perk: CollectionExpertisePerk;
}

export interface CollectionProgress {
  collected: number;
  total: number;
  complete: boolean;
}

export const COLLECTION_RESALE_RATE = 0.65;
export const BUYER_MARKET_EXPERTISE_CAP = 0.12;

export const COLLECTION_SETS: CollectionSetDefinition[] = [
  {
    id: 'retro-tech',
    name: { ru: 'Ретро-техника', en: 'Retro Tech' },
    itemIds: ['cassette-player', 'film-camera', 'arcade-handheld'],
    reward: 1200,
    perk: {
      name: { ru: 'Эксперт по электронике', en: 'Electronics expertise' },
      category: 'electronics',
      buyerMarketBonus: 0.03,
    },
  },
  {
    id: 'clockwork',
    name: { ru: 'Хранители времени', en: 'Timekeepers' },
    itemIds: ['brass-clock', 'pocket-watch'],
    reward: 900,
    perk: {
      name: { ru: 'Эксперт по часам', en: 'Watch expertise' },
      category: 'watches',
      buyerMarketBonus: 0.03,
    },
  },
  {
    id: 'toy-vault',
    name: { ru: 'Игрушечный сейф', en: 'Toy Vault' },
    itemIds: ['toy-robot', 'prototype-toy'],
    reward: 1000,
    perk: {
      name: { ru: 'Эксперт по игрушкам', en: 'Toy expertise' },
      category: 'toys',
      buyerMarketBonus: 0.03,
    },
  },
  {
    id: 'treasure-shelf',
    name: { ru: 'Полка находок', en: 'Treasure Shelf' },
    itemIds: ['toolbox', 'vinyl-box', 'telescope', 'signed-poster', 'silver-ring'],
    reward: 1600,
    perk: {
      name: { ru: 'Эксперт по редкостям', en: 'Collectibles expertise' },
      category: 'collectibles',
      buyerMarketBonus: 0.03,
    },
  },
  {
    id: 'field-tech',
    name: { ru: 'Полевая техника', en: 'Field Tech' },
    itemIds: ['multimeter', 'portable-radio', 'instant-camera'],
    reward: 1100,
    perk: {
      name: { ru: 'Эксперт по электронике', en: 'Electronics expertise' },
      category: 'electronics',
      buyerMarketBonus: 0.03,
    },
  },
  {
    id: 'street-nostalgia',
    name: { ru: 'Уличная ностальгия', en: 'Street Nostalgia' },
    itemIds: ['tin-car', 'mini-console', 'preproduction-figure'],
    reward: 1500,
    perk: {
      name: { ru: 'Эксперт по игрушкам', en: 'Toy expertise' },
      category: 'toys',
      buyerMarketBonus: 0.03,
    },
  },
  {
    id: 'optics-and-print',
    name: { ru: 'Оптика и печать', en: 'Optics & Print' },
    itemIds: ['binoculars', 'gallery-print', 'comic-stack'],
    reward: 1300,
    perk: {
      name: { ru: 'Эксперт по искусству', en: 'Art expertise' },
      category: 'art',
      buyerMarketBonus: 0.03,
    },
  },
  {
    id: 'travel-case',
    name: { ru: 'Дорожный футляр', en: 'Travel Case' },
    itemIds: ['travel-clock', 'enamel-brooch', 'military-watch'],
    reward: 1600,
    perk: {
      name: { ru: 'Эксперт по часам', en: 'Watch expertise' },
      category: 'watches',
      buyerMarketBonus: 0.03,
    },
  },
  {
    id: 'repair-bench',
    name: { ru: 'Ремонтный верстак', en: 'Repair Bench' },
    itemIds: ['soldering-station', 'multimeter', 'portable-radio', 'pocket-tv'],
    reward: 1500,
    perk: {
      name: { ru: 'Эксперт по инструментам', en: 'Tools expertise' },
      category: 'tools',
      buyerMarketBonus: 0.03,
    },
  },
  {
    id: 'miniature-worlds',
    name: { ru: 'Миниатюрные миры', en: 'Miniature Worlds' },
    itemIds: ['model-train', 'tin-car', 'toy-robot', 'clockwork-automaton'],
    reward: 2200,
    perk: {
      name: { ru: 'Эксперт по игрушкам', en: 'Toy expertise' },
      category: 'toys',
      buyerMarketBonus: 0.03,
    },
  },
  {
    id: 'estate-library',
    name: { ru: 'Библиотека усадьбы', en: 'Estate Library' },
    itemIds: ['manual-typewriter', 'fountain-pen', 'first-edition-book', 'porcelain-figurine'],
    reward: 2300,
    perk: {
      name: { ru: 'Эксперт по редкостям', en: 'Collectibles expertise' },
      category: 'collectibles',
      buyerMarketBonus: 0.03,
    },
  },
  {
    id: 'patron-vault',
    name: { ru: 'Сейф мецената', en: 'Patron Vault' },
    itemIds: ['art-deco-lamp', 'signed-vinyl', 'master-study', 'chronograph-watch'],
    reward: 3200,
    perk: {
      name: { ru: 'Эксперт по искусству', en: 'Art expertise' },
      category: 'art',
      buyerMarketBonus: 0.03,
    },
  },
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

export function buyerMarketExpertiseBonus(
  claimedSetIds: readonly string[],
  category: ItemCategory,
): number {
  const claimed = new Set(claimedSetIds);
  const bonus = COLLECTION_SETS.reduce((sum, set) => (
    claimed.has(set.id) && set.perk.category === category
      ? sum + Math.max(0, set.perk.buyerMarketBonus)
      : sum
  ), 0);
  return Math.min(BUYER_MARKET_EXPERTISE_CAP, bonus);
}

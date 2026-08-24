import type { LocalizedText } from '../domain/types';

export interface CollectionSetDefinition {
  id: string;
  name: LocalizedText;
  itemIds: string[];
  reward: number;
}

export interface CollectionProgress {
  collected: number;
  total: number;
  complete: boolean;
}

export const COLLECTION_RESALE_RATE = 0.65;

export const COLLECTION_SETS: CollectionSetDefinition[] = [
  {
    id: 'retro-tech',
    name: { ru: 'Ретро-техника', en: 'Retro Tech' },
    itemIds: ['cassette-player', 'film-camera', 'arcade-handheld'],
    reward: 1200,
  },
  {
    id: 'clockwork',
    name: { ru: 'Хранители времени', en: 'Timekeepers' },
    itemIds: ['brass-clock', 'pocket-watch'],
    reward: 900,
  },
  {
    id: 'toy-vault',
    name: { ru: 'Игрушечный сейф', en: 'Toy Vault' },
    itemIds: ['toy-robot', 'prototype-toy'],
    reward: 1000,
  },
  {
    id: 'treasure-shelf',
    name: { ru: 'Полка находок', en: 'Treasure Shelf' },
    itemIds: ['toolbox', 'vinyl-box', 'telescope', 'signed-poster', 'silver-ring'],
    reward: 1600,
  },
  {
    id: 'field-tech',
    name: { ru: 'Полевая техника', en: 'Field Tech' },
    itemIds: ['multimeter', 'portable-radio', 'instant-camera'],
    reward: 1100,
  },
  {
    id: 'street-nostalgia',
    name: { ru: 'Уличная ностальгия', en: 'Street Nostalgia' },
    itemIds: ['tin-car', 'mini-console', 'preproduction-figure'],
    reward: 1500,
  },
  {
    id: 'optics-and-print',
    name: { ru: 'Оптика и печать', en: 'Optics & Print' },
    itemIds: ['binoculars', 'gallery-print', 'comic-stack'],
    reward: 1300,
  },
  {
    id: 'travel-case',
    name: { ru: 'Дорожный футляр', en: 'Travel Case' },
    itemIds: ['travel-clock', 'enamel-brooch', 'military-watch'],
    reward: 1600,
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

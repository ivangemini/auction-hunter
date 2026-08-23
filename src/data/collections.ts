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

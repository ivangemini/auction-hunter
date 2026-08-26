import type { ItemDefinition } from '../domain/types';
import { ITEM_BY_ID, ITEMS } from './catalog';
import { ALL_LOTS } from './catalogBreadth';
import { COLLECTION_SETS, type CollectionSetDefinition } from './collections';

/** Third P9 story/material-culture batch: objects that reinforce records, copying and route reconstruction. */
export const CAMPAIGN_BREADTH_THREE_ITEMS: readonly ItemDefinition[] = [
  {
    id: 'telegraph-key',
    name: { ru: 'Латунный телеграфный ключ', en: 'Brass telegraph key' },
    category: 'electronics', rarity: 'rare', baseValue: 1680,
  },
  {
    id: 'survey-notebook',
    name: { ru: 'Полевой геодезический блокнот', en: 'Field survey notebook' },
    category: 'collectibles', rarity: 'rare', baseValue: 1920,
  },
  {
    id: 'stamp-press',
    name: { ru: 'Настольный пресс для печатей', en: 'Desktop seal press' },
    category: 'tools', rarity: 'epic', baseValue: 2860,
  },
  {
    id: 'plate-camera',
    name: { ru: 'Пластинчатая архивная камера', en: 'Archival plate camera' },
    category: 'electronics', rarity: 'epic', baseValue: 4100,
  },
  {
    id: 'coded-postcard-album',
    name: { ru: 'Альбом кодированных открыток', en: 'Coded postcard album' },
    category: 'collectibles', rarity: 'epic', baseValue: 3380,
  },
  {
    id: 'portable-duplicator',
    name: { ru: 'Портативный гектограф', en: 'Portable duplicator' },
    category: 'tools', rarity: 'legendary', baseValue: 7200,
  },
];

export const CAMPAIGN_BREADTH_THREE_SETS: readonly CollectionSetDefinition[] = [
  {
    id: 'communications-desk',
    name: { ru: 'Стол связи', en: 'Communications Desk' },
    itemIds: ['telegraph-key', 'field-recorder', 'portable-radio', 'coded-postcard-album'],
    reward: 5400,
    perk: {
      description: { ru: '+2% к продаже электроники и коллекционных предметов', en: '+2% quick-sale value for electronics and collectibles' },
      categories: ['electronics', 'collectibles'], resaleRateBonus: 0.02,
    },
  },
  {
    id: 'records-workroom',
    name: { ru: 'Архивная мастерская', en: 'Records Workroom' },
    itemIds: ['survey-notebook', 'stamp-press', 'plate-camera', 'portable-duplicator'],
    reward: 7300,
    perk: {
      description: { ru: '+2% к продаже инструментов, электроники и коллекционных предметов', en: '+2% quick-sale value for tools, electronics and collectibles' },
      categories: ['tools', 'electronics', 'collectibles'], resaleRateBonus: 0.02,
    },
  },
];

export const CAMPAIGN_BREADTH_THREE_ROUTES: Readonly<Record<string, readonly string[]>> = {
  'telegraph-key': ['repair-shop-4', 'music-estate-24'],
  'survey-notebook': ['scholar-estate-26', 'traveler-estate-12'],
  'stamp-press': ['maker-locker-41', 'writer-estate-33'],
  'plate-camera': ['photo-lab-locker-27', 'photographer-studio-34'],
  'coded-postcard-album': ['writer-estate-33', 'collector-parlor-15'],
  'portable-duplicator': ['maker-locker-41', 'scholar-estate-26'],
};

export function registerCampaignBreadthThree(): void {
  for (const item of CAMPAIGN_BREADTH_THREE_ITEMS) {
    if (ITEM_BY_ID.has(item.id)) continue;
    ITEMS.push(item);
    ITEM_BY_ID.set(item.id, item);
  }

  for (const [itemId, lotIds] of Object.entries(CAMPAIGN_BREADTH_THREE_ROUTES)) {
    const item = ITEM_BY_ID.get(itemId);
    if (!item) throw new Error(`Missing campaign breadth-three item ${itemId}`);
    for (const lotId of lotIds) {
      const lot = ALL_LOTS.find((candidate) => candidate.id === lotId);
      if (!lot) throw new Error(`Missing campaign breadth-three route lot ${lotId}`);
      if (!lot.itemPool.includes(itemId)) lot.itemPool.push(itemId);
      const truthful = lot.clues.some((clue) => 'itemIds' in clue.signal
        ? clue.signal.itemIds.includes(itemId)
        : clue.signal.categories.includes(item.category));
      if (!truthful) throw new Error(`Campaign breadth-three route has no truthful clue ${lotId}:${itemId}`);
    }
  }

  for (const set of CAMPAIGN_BREADTH_THREE_SETS) {
    if (!COLLECTION_SETS.some((candidate) => candidate.id === set.id)) COLLECTION_SETS.push(set);
  }
}

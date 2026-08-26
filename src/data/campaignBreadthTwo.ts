import type { ItemDefinition } from '../domain/types';
import { ITEM_BY_ID, ITEMS } from './catalog';
import { ALL_LOTS } from './catalogBreadth';
import { COLLECTION_SETS, type CollectionSetDefinition } from './collections';

export const CAMPAIGN_BREADTH_TWO_ITEMS: readonly ItemDefinition[] = [
  {
    id: 'field-recorder',
    name: { ru: 'Полевой катушечный диктофон', en: 'Field reel recorder' },
    category: 'electronics',
    rarity: 'epic',
    baseValue: 2950,
  },
  {
    id: 'postal-scale',
    name: { ru: 'Латунные почтовые весы', en: 'Brass postal scale' },
    category: 'tools',
    rarity: 'rare',
    baseValue: 1480,
  },
  {
    id: 'negative-album',
    name: { ru: 'Архивный альбом негативов', en: 'Archival negative album' },
    category: 'collectibles',
    rarity: 'rare',
    baseValue: 1780,
  },
  {
    id: 'brass-map-case',
    name: { ru: 'Латунный футляр для карт', en: 'Brass map case' },
    category: 'collectibles',
    rarity: 'epic',
    baseValue: 3150,
  },
  {
    id: 'surveyor-transit',
    name: { ru: 'Старинный геодезический теодолит', en: 'Antique surveyor transit' },
    category: 'tools',
    rarity: 'epic',
    baseValue: 3650,
  },
  {
    id: 'lacquer-document-case',
    name: { ru: 'Лаковый дипломат с архивными отделениями', en: 'Lacquer archival document case' },
    category: 'collectibles',
    rarity: 'legendary',
    baseValue: 6950,
  },
];

export const CAMPAIGN_BREADTH_TWO_SETS: readonly CollectionSetDefinition[] = [
  {
    id: 'investigation-kit',
    name: { ru: 'Набор расследователя', en: 'Investigator Kit' },
    itemIds: ['archivist-loupe', 'postal-scale', 'field-recorder', 'negative-album'],
    reward: 4800,
    perk: {
      description: { ru: '+2% к продаже инструментов, электроники и коллекционных предметов', en: '+2% quick-sale value for tools, electronics and collectibles' },
      categories: ['tools', 'electronics', 'collectibles'],
      resaleRateBonus: 0.02,
    },
  },
  {
    id: 'veyr-expedition',
    name: { ru: 'Экспедиция Вейра', en: 'Veyr Expedition' },
    itemIds: ['brass-map-case', 'surveyor-transit', 'expedition-camera', 'lacquer-document-case'],
    reward: 6800,
    perk: {
      description: { ru: '+2% к продаже инструментов и коллекционных предметов', en: '+2% quick-sale value for tools and collectibles' },
      categories: ['tools', 'collectibles'],
      resaleRateBonus: 0.02,
    },
  },
];

export const CAMPAIGN_BREADTH_TWO_ROUTES: Readonly<Record<string, readonly string[]>> = {
  'field-recorder': ['music-estate-24', 'photographer-studio-34'],
  'postal-scale': ['maker-locker-41', 'repair-shop-4'],
  'negative-album': ['photo-lab-locker-27', 'photographer-studio-34'],
  'brass-map-case': ['traveler-estate-12', 'scholar-estate-26'],
  'surveyor-transit': ['repair-shop-4', 'scholar-estate-26'],
  'lacquer-document-case': ['collector-parlor-15', 'jeweler-vault-12'],
};

export function registerCampaignBreadthTwo(): void {
  for (const item of CAMPAIGN_BREADTH_TWO_ITEMS) {
    if (ITEM_BY_ID.has(item.id)) continue;
    ITEMS.push(item);
    ITEM_BY_ID.set(item.id, item);
  }

  for (const [itemId, lotIds] of Object.entries(CAMPAIGN_BREADTH_TWO_ROUTES)) {
    if (!ITEM_BY_ID.has(itemId)) throw new Error(`Missing campaign breadth-two item ${itemId}`);
    for (const lotId of lotIds) {
      const lot = ALL_LOTS.find((candidate) => candidate.id === lotId);
      if (!lot) throw new Error(`Missing campaign breadth-two route lot ${lotId}`);
      if (!lot.itemPool.includes(itemId)) lot.itemPool.push(itemId);
    }
  }

  for (const set of CAMPAIGN_BREADTH_TWO_SETS) {
    if (!COLLECTION_SETS.some((candidate) => candidate.id === set.id)) COLLECTION_SETS.push(set);
  }
}

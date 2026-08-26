import type { ItemDefinition } from '../domain/types';
import { ITEM_BY_ID, ITEMS } from './catalog';
import { ALL_LOTS } from './catalogBreadth';
import { COLLECTION_SETS, type CollectionSetDefinition } from './collections';

/**
 * P9 story-driven catalog pack. These objects can appear in normal auctions so
 * the campaign's material language also enriches Endless Dealer Career.
 */
export const CAMPAIGN_BREADTH_ITEMS: readonly ItemDefinition[] = [
  {
    id: 'archivist-loupe',
    name: { ru: 'Архивная лупа в кожаном футляре', en: 'Cased archivist loupe' },
    category: 'collectibles',
    rarity: 'rare',
    baseValue: 1380,
  },
  {
    id: 'microfilm-reader',
    name: { ru: 'Портативный просмотрщик микрофильмов', en: 'Portable microfilm reader' },
    category: 'electronics',
    rarity: 'epic',
    baseValue: 2350,
  },
  {
    id: 'wax-seal-box',
    name: { ru: 'Набор старых сургучных печатей', en: 'Antique wax seal box' },
    category: 'collectibles',
    rarity: 'rare',
    baseValue: 1560,
  },
  {
    id: 'auctioneers-ledger',
    name: { ru: 'Книга учёта аукциониста', en: "Auctioneer's ledger" },
    category: 'collectibles',
    rarity: 'epic',
    baseValue: 2750,
  },
  {
    id: 'brass-cipher-wheel',
    name: { ru: 'Латунный шифровальный диск', en: 'Brass cipher wheel' },
    category: 'collectibles',
    rarity: 'epic',
    baseValue: 3250,
  },
  {
    id: 'expedition-camera',
    name: { ru: 'Экспедиционная складная камера', en: 'Expedition folding camera' },
    category: 'electronics',
    rarity: 'legendary',
    baseValue: 7600,
  },
];

export const CAMPAIGN_BREADTH_SETS: readonly CollectionSetDefinition[] = [
  {
    id: 'archive-desk',
    name: { ru: 'Архивный стол', en: 'Archive Desk' },
    itemIds: ['archivist-loupe', 'wax-seal-box', 'auctioneers-ledger', 'fountain-pen'],
    reward: 4100,
    perk: {
      description: { ru: '+2% к продаже коллекционных предметов', en: '+2% quick-sale value for collectibles' },
      categories: ['collectibles'],
      resaleRateBonus: 0.02,
    },
  },
  {
    id: 'field-archive',
    name: { ru: 'Полевой архив', en: 'Field Archive' },
    itemIds: ['microfilm-reader', 'brass-cipher-wheel', 'expedition-camera', 'field-compass'],
    reward: 5200,
    perk: {
      description: { ru: '+2% к продаже электроники и коллекционных предметов', en: '+2% quick-sale value for electronics and collectibles' },
      categories: ['electronics', 'collectibles'],
      resaleRateBonus: 0.02,
    },
  },
];

export const CAMPAIGN_BREADTH_ROUTES: Readonly<Record<string, readonly string[]>> = {
  'archivist-loupe': ['scholar-estate-26', 'writer-estate-33'],
  'microfilm-reader': ['photo-lab-locker-27', 'photographer-studio-34'],
  'wax-seal-box': ['writer-estate-33', 'scholar-estate-26'],
  'auctioneers-ledger': ['writer-estate-33', 'scholar-estate-26'],
  'brass-cipher-wheel': ['collector-parlor-15', 'jeweler-vault-12'],
  'expedition-camera': ['traveler-estate-12', 'photographer-studio-34'],
};

export function registerCampaignBreadth(): void {
  for (const item of CAMPAIGN_BREADTH_ITEMS) {
    if (ITEM_BY_ID.has(item.id)) continue;
    ITEMS.push(item);
    ITEM_BY_ID.set(item.id, item);
  }

  for (const [itemId, lotIds] of Object.entries(CAMPAIGN_BREADTH_ROUTES)) {
    if (!ITEM_BY_ID.has(itemId)) throw new Error(`Missing campaign breadth item ${itemId}`);
    for (const lotId of lotIds) {
      const lot = ALL_LOTS.find((candidate) => candidate.id === lotId);
      if (!lot) throw new Error(`Missing campaign route lot ${lotId}`);
      if (!lot.itemPool.includes(itemId)) lot.itemPool.push(itemId);
    }
  }

  for (const set of CAMPAIGN_BREADTH_SETS) {
    if (!COLLECTION_SETS.some((candidate) => candidate.id === set.id)) COLLECTION_SETS.push(set);
  }
}

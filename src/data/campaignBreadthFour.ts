import type { ItemDefinition } from '../domain/types';
import { ITEM_BY_ID, ITEMS } from './catalog';
import { ALL_LOTS } from './catalogBreadth';
import { COLLECTION_SETS, type CollectionSetDefinition } from './collections';

export const CAMPAIGN_BREADTH_FOUR_ITEMS: readonly ItemDefinition[] = [
  { id: 'archive-card-index', name: { ru: 'Деревянная архивная картотека', en: 'Wooden archive card index' }, category: 'collectibles', rarity: 'rare', baseValue: 2180 },
  { id: 'brass-letter-opener', name: { ru: 'Латунный архивный нож', en: 'Brass archive letter opener' }, category: 'tools', rarity: 'rare', baseValue: 1540 },
  { id: 'folding-field-lamp', name: { ru: 'Складная полевая лампа', en: 'Folding field lamp' }, category: 'electronics', rarity: 'epic', baseValue: 3180 },
  { id: 'customs-stamp-book', name: { ru: 'Книга таможенных штампов', en: 'Customs stamp book' }, category: 'collectibles', rarity: 'epic', baseValue: 3520 },
  { id: 'wire-photo-transmitter', name: { ru: 'Аппарат фототелеграфа', en: 'Wire photo transmitter' }, category: 'electronics', rarity: 'legendary', baseValue: 7900 },
  { id: 'locksmith-gauge-set', name: { ru: 'Набор калибров слесаря', en: 'Locksmith gauge set' }, category: 'tools', rarity: 'epic', baseValue: 3920 },
];

export const CAMPAIGN_BREADTH_FOUR_SETS: readonly CollectionSetDefinition[] = [
  {
    id: 'border-records',
    name: { ru: 'Пограничный архив', en: 'Border Records' },
    itemIds: ['archive-card-index', 'customs-stamp-book', 'coded-postcard-album', 'brass-letter-opener'],
    reward: 6500,
    perk: { description: { ru: '+2% к продаже коллекционных предметов и инструментов', en: '+2% quick-sale value for collectibles and tools' }, categories: ['collectibles', 'tools'], resaleRateBonus: 0.02 },
  },
  {
    id: 'field-transmission',
    name: { ru: 'Полевая передача', en: 'Field Transmission' },
    itemIds: ['folding-field-lamp', 'wire-photo-transmitter', 'field-recorder', 'locksmith-gauge-set'],
    reward: 8200,
    perk: { description: { ru: '+2% к продаже электроники и инструментов', en: '+2% quick-sale value for electronics and tools' }, categories: ['electronics', 'tools'], resaleRateBonus: 0.02 },
  },
];

export const CAMPAIGN_BREADTH_FOUR_ROUTES: Readonly<Record<string, readonly string[]>> = {
  'archive-card-index': ['writer-estate-33', 'media-vault-31'],
  'brass-letter-opener': ['maker-locker-41', 'moving-sale-35'],
  'folding-field-lamp': ['maker-locker-41', 'traveler-estate-12'],
  'customs-stamp-book': ['writer-estate-33', 'collector-parlor-15'],
  'wire-photo-transmitter': ['music-estate-24', 'maker-locker-41'],
  'locksmith-gauge-set': ['maker-locker-41', 'moving-sale-35'],
};

export function registerCampaignBreadthFour(): void {
  for (const item of CAMPAIGN_BREADTH_FOUR_ITEMS) {
    if (!ITEM_BY_ID.has(item.id)) { ITEMS.push(item); ITEM_BY_ID.set(item.id, item); }
  }
  for (const [itemId, lotIds] of Object.entries(CAMPAIGN_BREADTH_FOUR_ROUTES)) {
    const item = ITEM_BY_ID.get(itemId);
    if (!item) throw new Error(`Missing campaign breadth-four item ${itemId}`);
    for (const lotId of lotIds) {
      const lot = ALL_LOTS.find((candidate) => candidate.id === lotId);
      if (!lot) throw new Error(`Missing campaign breadth-four route lot ${lotId}`);
      const truthful = lot.clues.some((clue) => 'itemIds' in clue.signal ? clue.signal.itemIds.includes(itemId) : clue.signal.categories.includes(item.category));
      if (!truthful) throw new Error(`Campaign breadth-four route has no truthful clue ${lotId}:${itemId}`);
      if (!lot.itemPool.includes(itemId)) lot.itemPool.push(itemId);
    }
  }
  for (const set of CAMPAIGN_BREADTH_FOUR_SETS) if (!COLLECTION_SETS.some((candidate) => candidate.id === set.id)) COLLECTION_SETS.push(set);
}

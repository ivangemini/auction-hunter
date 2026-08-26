import type { ItemDefinition } from '../domain/types';
import { ITEM_BY_ID, ITEMS } from './catalog';
import { ALL_LOTS } from './catalogBreadth';
import { COLLECTION_SETS, type CollectionSetDefinition } from './collections';

/** Final P9 catalog breadth pack: clearance-control and dispatch artifacts tied to the Black Ledger aftermath. */
export const CAMPAIGN_BREADTH_FIVE_ITEMS: readonly ItemDefinition[] = [
  { id: 'estate-key-register', name: { ru: 'Реестр ключей поместья', en: 'Estate key register' }, category: 'collectibles', rarity: 'rare', baseValue: 2360 },
  { id: 'cipher-tape-reader', name: { ru: 'Считыватель шифроленты', en: 'Cipher tape reader' }, category: 'electronics', rarity: 'epic', baseValue: 4280 },
  { id: 'brass-seal-calipers', name: { ru: 'Латунный калибр печатей', en: 'Brass seal calipers' }, category: 'tools', rarity: 'epic', baseValue: 3650 },
  { id: 'river-signal-lantern', name: { ru: 'Речной сигнальный фонарь', en: 'River signal lantern' }, category: 'electronics', rarity: 'rare', baseValue: 2480 },
  { id: 'consignment-token-board', name: { ru: 'Доска жетонов партий', en: 'Consignment token board' }, category: 'collectibles', rarity: 'epic', baseValue: 3840 },
  { id: 'railway-chronometer', name: { ru: 'Железнодорожный хронометр', en: 'Railway chronometer' }, category: 'watches', rarity: 'legendary', baseValue: 8600 },
];

export const CAMPAIGN_BREADTH_FIVE_SETS: readonly CollectionSetDefinition[] = [
  {
    id: 'clearance-control',
    name: { ru: 'Контроль распродажи', en: 'Clearance Control' },
    itemIds: ['estate-key-register', 'consignment-token-board', 'customs-stamp-book', 'brass-letter-opener'],
    reward: 7200,
    perk: {
      description: { ru: '+2% к продаже коллекционных предметов и инструментов', en: '+2% quick-sale value for collectibles and tools' },
      categories: ['collectibles', 'tools'], resaleRateBonus: 0.02,
    },
  },
  {
    id: 'signal-and-time',
    name: { ru: 'Сигнал и время', en: 'Signal and Time' },
    itemIds: ['cipher-tape-reader', 'river-signal-lantern', 'brass-seal-calipers', 'railway-chronometer'],
    reward: 9300,
    perk: {
      description: { ru: '+2% к продаже электроники, инструментов и часов', en: '+2% quick-sale value for electronics, tools and watches' },
      categories: ['electronics', 'tools', 'watches'], resaleRateBonus: 0.02,
    },
  },
];

export const CAMPAIGN_BREADTH_FIVE_ROUTES: Readonly<Record<string, readonly string[]>> = {
  'estate-key-register': ['writer-estate-33', 'collector-parlor-15'],
  'cipher-tape-reader': ['maker-locker-41', 'media-vault-31'],
  'brass-seal-calipers': ['maker-locker-41', 'moving-sale-35'],
  'river-signal-lantern': ['traveler-estate-12', 'music-estate-24'],
  'consignment-token-board': ['writer-estate-33', 'media-vault-31'],
  'railway-chronometer': ['traveler-estate-12', 'collector-parlor-15'],
};

export function registerCampaignBreadthFive(): void {
  for (const item of CAMPAIGN_BREADTH_FIVE_ITEMS) {
    if (ITEM_BY_ID.has(item.id)) continue;
    ITEMS.push(item);
    ITEM_BY_ID.set(item.id, item);
  }

  for (const [itemId, lotIds] of Object.entries(CAMPAIGN_BREADTH_FIVE_ROUTES)) {
    const item = ITEM_BY_ID.get(itemId);
    if (!item) throw new Error(`Missing campaign breadth-five item ${itemId}`);
    for (const lotId of lotIds) {
      const lot = ALL_LOTS.find((candidate) => candidate.id === lotId);
      if (!lot) throw new Error(`Missing campaign breadth-five route lot ${lotId}`);
      const truthful = lot.clues.some((clue) => 'itemIds' in clue.signal
        ? clue.signal.itemIds.includes(itemId)
        : clue.signal.categories.includes(item.category));
      if (!truthful) throw new Error(`Campaign breadth-five route has no truthful clue ${lotId}:${itemId}`);
      if (!lot.itemPool.includes(itemId)) lot.itemPool.push(itemId);
    }
  }

  for (const set of CAMPAIGN_BREADTH_FIVE_SETS) {
    if (!COLLECTION_SETS.some((candidate) => candidate.id === set.id)) COLLECTION_SETS.push(set);
  }
}

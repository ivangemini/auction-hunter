import type { ItemDefinition } from '../domain/types';
import { ITEM_BY_ID, ITEMS } from './catalog';
import { ALL_LOTS } from './catalogBreadth';
import { COLLECTION_SETS, type CollectionSetDefinition } from './collections';

/**
 * Post-moderation P5 item breadth. Keep these identities stable and pair every
 * entry with direct 512x360 art plus at least one real auction/collection route.
 */
export const BREADTH_ITEMS: readonly ItemDefinition[] = [
  {
    id: 'slide-projector',
    name: { ru: 'Винтажный диапроектор', en: 'Vintage slide projector' },
    category: 'electronics',
    rarity: 'rare',
    baseValue: 1020,
  },
  {
    id: 'watchmaker-tools',
    name: { ru: 'Набор инструментов часовщика', en: 'Watchmaker tool set' },
    category: 'tools',
    rarity: 'rare',
    baseValue: 1180,
  },
  {
    id: 'field-compass',
    name: { ru: 'Полевой латунный компас', en: 'Brass field compass' },
    category: 'collectibles',
    rarity: 'uncommon',
    baseValue: 520,
  },
  {
    id: 'tin-airplane',
    name: { ru: 'Жестяной заводной самолёт', en: 'Tin wind-up airplane' },
    category: 'toys',
    rarity: 'rare',
    baseValue: 1250,
  },
  {
    id: 'mantel-clock',
    name: { ru: 'Каминные механические часы', en: 'Mechanical mantel clock' },
    category: 'watches',
    rarity: 'epic',
    baseValue: 2450,
  },
  {
    id: 'numbered-lithograph',
    name: { ru: 'Номерная авторская литография', en: 'Numbered artist lithograph' },
    category: 'art',
    rarity: 'epic',
    baseValue: 2700,
  },
];

/**
 * Additive goals only: existing 24 sets are intentionally untouched so an old
 * completed/claimed set can never become incomplete after a content update.
 */
export const BREADTH_COLLECTION_SETS: readonly CollectionSetDefinition[] = [
  {
    id: 'field-workshop',
    name: { ru: 'Полевая мастерская', en: 'Field Workshop' },
    itemIds: ['watchmaker-tools', 'field-compass', 'mantel-clock', 'tin-airplane'],
    reward: 3500,
    perk: {
      description: { ru: '+2% к продаже инструментов, часов и игрушек', en: '+2% quick-sale value for tools, watches and toys' },
      categories: ['tools', 'watches', 'toys'],
      resaleRateBonus: 0.02,
    },
  },
  {
    id: 'projection-room',
    name: { ru: 'Проекционный зал', en: 'Projection Room' },
    itemIds: ['slide-projector', 'numbered-lithograph', 'film-camera', 'gallery-print'],
    reward: 3200,
    perk: {
      description: { ru: '+2% к продаже электроники и искусства', en: '+2% quick-sale value for electronics and art' },
      categories: ['electronics', 'art'],
      resaleRateBonus: 0.02,
    },
  },
];

/**
 * Existing clue copy remains truthful: every routed item matches at least one
 * visible category clue in its destination lot.
 */
export const BREADTH_LOT_ROUTES: Readonly<Record<string, readonly string[]>> = {
  'slide-projector': ['photographer-studio-34'],
  'watchmaker-tools': ['repair-shop-4'],
  'field-compass': ['scholar-estate-26'],
  'tin-airplane': ['hobby-locker-22'],
  'mantel-clock': ['horology-case-5'],
  'numbered-lithograph': ['scholar-estate-26'],
};

/**
 * Explicit and idempotent content installation. Runtime calls this before the
 * Phaser game is constructed; Vitest calls the same function from setupFiles.
 */
export function registerItemBreadth(): void {
  for (const item of BREADTH_ITEMS) {
    if (ITEM_BY_ID.has(item.id)) continue;
    ITEMS.push(item);
    ITEM_BY_ID.set(item.id, item);
  }

  for (const [itemId, lotIds] of Object.entries(BREADTH_LOT_ROUTES)) {
    if (!ITEM_BY_ID.has(itemId)) throw new Error(`Missing breadth item ${itemId}`);
    for (const lotId of lotIds) {
      const lot = ALL_LOTS.find((candidate) => candidate.id === lotId);
      if (!lot) throw new Error(`Missing breadth route lot ${lotId}`);
      if (!lot.itemPool.includes(itemId)) lot.itemPool.push(itemId);
    }
  }

  for (const set of BREADTH_COLLECTION_SETS) {
    if (!COLLECTION_SETS.some((candidate) => candidate.id === set.id)) COLLECTION_SETS.push(set);
  }
}

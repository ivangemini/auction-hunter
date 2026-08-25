import { describe, expect, it } from 'vitest';
import { ITEM_ART_IDS } from './artManifest';
import { ITEM_BY_ID, ITEMS } from './catalog';
import { ALL_LOTS } from './catalogBreadth';
import { COLLECTION_SETS } from './collections';
import { BREADTH_COLLECTION_SETS, BREADTH_ITEMS, BREADTH_LOT_ROUTES, registerItemBreadth } from './itemBreadth';

describe('post-moderation item breadth', () => {
  it('installs twenty-four stable bilingual breadth items with direct art', () => {
    expect(BREADTH_ITEMS).toHaveLength(24);
    expect(new Set(BREADTH_ITEMS.map((item) => item.id)).size).toBe(24);
    for (const item of BREADTH_ITEMS) {
      expect(item.name.ru.trim(), `${item.id} RU`).not.toBe('');
      expect(item.name.en.trim(), `${item.id} EN`).not.toBe('');
      expect(item.baseValue, item.id).toBeGreaterThan(0);
      expect(ITEM_BY_ID.get(item.id), item.id).toEqual(item);
      expect(ITEM_ART_IDS.includes(item.id as (typeof ITEM_ART_IDS)[number]), `${item.id} art`).toBe(true);
    }
  });

  it('keeps the large wave balanced across all six item categories', () => {
    const counts = new Map<string, number>();
    for (const item of BREADTH_ITEMS) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    for (const category of ['electronics', 'tools', 'collectibles', 'toys', 'watches', 'art']) {
      expect(counts.get(category), category).toBeGreaterThanOrEqual(3);
    }
  });

  it('routes every breadth item into at least one truthful live-auction pool', () => {
    for (const item of BREADTH_ITEMS) {
      const routeIds = BREADTH_LOT_ROUTES[item.id] ?? [];
      expect(routeIds.length, `${item.id} route count`).toBeGreaterThan(0);
      for (const lotId of routeIds) {
        const lot = ALL_LOTS.find((candidate) => candidate.id === lotId);
        expect(lot, lotId).toBeDefined();
        expect(lot?.itemPool.includes(item.id), `${lotId}:${item.id}`).toBe(true);
        const hasMatchingClue = lot?.clues.some((clue) => {
          if ('itemIds' in clue.signal) return clue.signal.itemIds.includes(item.id);
          return clue.signal.categories.includes(item.category);
        });
        expect(hasMatchingClue, `${lotId}:${item.id} truthful clue`).toBe(true);
      }
    }
  });

  it('covers every breadth item with an additive collection goal', () => {
    expect(BREADTH_COLLECTION_SETS).toHaveLength(8);
    const breadthSetIds = new Set(BREADTH_COLLECTION_SETS.map((set) => set.id));
    const configured = COLLECTION_SETS.filter((set) => breadthSetIds.has(set.id));
    expect(configured).toHaveLength(BREADTH_COLLECTION_SETS.length);
    const covered = new Set(configured.flatMap((set) => set.itemIds));
    for (const item of BREADTH_ITEMS) expect(covered.has(item.id), item.id).toBe(true);
  });

  it('is idempotent across repeated bootstrap/test installation', () => {
    const before = {
      items: ITEMS.length,
      sets: COLLECTION_SETS.length,
      pools: Object.fromEntries(Object.entries(BREADTH_LOT_ROUTES).map(([itemId, lotIds]) => [
        itemId,
        lotIds.map((lotId) => ALL_LOTS.find((lot) => lot.id === lotId)?.itemPool.length ?? -1),
      ])),
    };
    registerItemBreadth();
    expect(ITEMS).toHaveLength(before.items);
    expect(COLLECTION_SETS).toHaveLength(before.sets);
    for (const [itemId, lotIds] of Object.entries(BREADTH_LOT_ROUTES)) {
      expect(lotIds.map((lotId) => ALL_LOTS.find((lot) => lot.id === lotId)?.itemPool.length ?? -1)).toEqual(before.pools[itemId]);
    }
  });
});

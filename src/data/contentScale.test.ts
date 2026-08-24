import { describe, expect, it } from 'vitest';
import { ITEMS, ITEM_BY_ID, LOTS } from './catalog';
import { COLLECTION_SETS } from './collections';
import { AUCTION_TIERS } from './tiers';

describe('content scale', () => {
  it('ships the expanded 36-item and 24-lot catalog', () => {
    expect(ITEMS).toHaveLength(36);
    expect(LOTS).toHaveLength(24);
    expect(new Set(ITEMS.map((item) => item.id)).size).toBe(36);
    expect(new Set(LOTS.map((lot) => lot.id)).size).toBe(24);
  });

  it('gives every tier eight distinct lot variants', () => {
    for (const tier of AUCTION_TIERS) {
      expect(tier.lotIds).toHaveLength(8);
      expect(new Set(tier.lotIds).size).toBe(8);
      for (const lotId of tier.lotIds) expect(LOTS.some((lot) => lot.id === lotId)).toBe(true);
    }
  });

  it('keeps every clue truthful against its configured pool', () => {
    for (const lot of LOTS) {
      for (const itemId of lot.itemPool) expect(ITEM_BY_ID.has(itemId), `${lot.id}:${itemId}`).toBe(true);
      for (const clue of lot.clues) {
        const matches = lot.itemPool.some((itemId) => {
          const item = ITEM_BY_ID.get(itemId);
          if (!item) return false;
          if ('itemIds' in clue.signal) return clue.signal.itemIds.includes(itemId);
          return clue.signal.categories.includes(item.category);
        });
        expect(matches, `clue in ${lot.id} has no matching pool item`).toBe(true);
      }
    }
  });

  it('covers every catalog item with at least one collection set', () => {
    const covered = new Set(COLLECTION_SETS.flatMap((set) => set.itemIds));
    for (const item of ITEMS) expect(covered.has(item.id), item.id).toBe(true);
  });
});

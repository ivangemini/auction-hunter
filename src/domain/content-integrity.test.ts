import { describe, expect, it } from 'vitest';
import { ITEMS, ITEM_BY_ID } from '../data/catalog';
import { ALL_LOTS } from '../data/catalogBreadth';
import { AUCTION_TIERS } from '../data/tiers';
import { clueCandidateIds } from './auction';

describe('content integrity', () => {
  it('keeps item and lot identifiers unique', () => {
    expect(new Set(ITEMS.map((item) => item.id)).size).toBe(ITEMS.length);
    expect(new Set(ALL_LOTS.map((lot) => lot.id)).size).toBe(ALL_LOTS.length);
  });

  it('keeps every lot pool and clue signal internally valid', () => {
    for (const lot of ALL_LOTS) {
      expect(lot.itemCount, `${lot.id} itemCount exceeds unique pool size`).toBeLessThanOrEqual(
        new Set(lot.itemPool).size,
      );

      for (const itemId of lot.itemPool) {
        expect(ITEM_BY_ID.has(itemId), `${lot.id} references missing item ${itemId}`).toBe(true);
      }

      for (const clue of lot.clues) {
        expect(
          clueCandidateIds(clue, lot.itemPool, ITEM_BY_ID).length,
          `${lot.id} has a clue with no eligible find: ${clue.text.en}`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('keeps tier lot references valid and varied', () => {
    const lotIds = new Set(ALL_LOTS.map((lot) => lot.id));

    for (const tier of AUCTION_TIERS) {
      expect(tier.lotIds.length, `${tier.id} should expose multiple lot variants`).toBeGreaterThanOrEqual(12);
      expect(new Set(tier.lotIds).size, `${tier.id} repeats a lot id`).toBe(tier.lotIds.length);
      for (const lotId of tier.lotIds) {
        expect(lotIds.has(lotId), `${tier.id} references missing lot ${lotId}`).toBe(true);
      }
    }
  });
});

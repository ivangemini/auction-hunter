import { describe, expect, it } from 'vitest';
import { BUYER_OFFERS, CATEGORY_BUYERS, SPECIALIST_BUYERS } from './buyers';
import { ITEMS, LOTS } from './catalog';
import { COLLECTION_SETS } from './collections';
import { ITEM_TRAITS } from './itemTraits';
import { LOT_MODIFIERS, LOT_MODIFIER_CHANCE } from './lotModifiers';
import { ACHIEVEMENTS, BUSINESS_UPGRADE_ORDER, DAILY_CONTRACT_POOL } from './meta';
import { AUCTION_TIERS } from './tiers';

describe('replayability floor', () => {
  it('keeps enough configured variety for repeated auction sessions', () => {
    expect(ITEMS.length).toBeGreaterThanOrEqual(36);
    expect(LOTS.length).toBeGreaterThanOrEqual(24);
    expect(COLLECTION_SETS.length).toBeGreaterThanOrEqual(12);
    expect(AUCTION_TIERS).toHaveLength(3);

    for (const tier of AUCTION_TIERS) {
      expect(tier.lotIds.length, `${tier.id} lot variety`).toBeGreaterThanOrEqual(8);
    }
  });

  it('keeps multiple independent return and variation systems configured', () => {
    expect(DAILY_CONTRACT_POOL.length).toBeGreaterThanOrEqual(5);
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(8);
    expect(BUSINESS_UPGRADE_ORDER.length).toBeGreaterThanOrEqual(3);
    expect(LOT_MODIFIERS.length).toBeGreaterThanOrEqual(4);
    expect(LOT_MODIFIER_CHANCE).toBeGreaterThan(0);
    expect(LOT_MODIFIER_CHANCE).toBeLessThan(1);
    expect(Object.keys(ITEM_TRAITS).length).toBeGreaterThanOrEqual(8);
    expect(CATEGORY_BUYERS.length).toBeGreaterThanOrEqual(6);
    expect(SPECIALIST_BUYERS.length).toBeGreaterThanOrEqual(4);
    expect(BUYER_OFFERS.length).toBeGreaterThanOrEqual(10);
  });
});

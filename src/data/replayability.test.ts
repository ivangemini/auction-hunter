import { describe, expect, it } from 'vitest';
import { BUYER_OFFERS, CATEGORY_BUYERS, SPECIALIST_BUYERS } from './buyers';
import { ITEMS } from './catalog';
import { ALL_LOTS } from './catalogBreadth';
import { COLLECTION_SETS } from './collections';
import { ITEM_TRAITS } from './itemTraits';
import { LOT_MODIFIERS, LOT_MODIFIER_CHANCE } from './lotModifiers';
import { ACHIEVEMENTS, BUSINESS_UPGRADE_ORDER, DAILY_CONTRACT_POOL } from './meta';
import { AUCTION_TIERS } from './tiers';

describe('replayability floor', () => {
  it('keeps enough configured variety for repeated auction sessions', () => {
    expect(ITEMS.length).toBeGreaterThanOrEqual(36);
    expect(ALL_LOTS.length).toBeGreaterThanOrEqual(42);
    expect(COLLECTION_SETS.length).toBeGreaterThanOrEqual(24);
    expect(AUCTION_TIERS).toHaveLength(3);

    for (const tier of AUCTION_TIERS) {
      expect(tier.lotIds.length, `${tier.id} lot variety`).toBeGreaterThanOrEqual(14);
    }
  });

  it('keeps multiple independent return and variation systems configured', () => {
    expect(DAILY_CONTRACT_POOL.length).toBeGreaterThanOrEqual(5);
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(8);
    expect(BUSINESS_UPGRADE_ORDER.length).toBeGreaterThanOrEqual(3);
    expect(LOT_MODIFIERS.length).toBeGreaterThanOrEqual(8);
    expect(LOT_MODIFIER_CHANCE).toBeGreaterThan(0);
    expect(LOT_MODIFIER_CHANCE).toBeLessThan(1);
    expect(Object.keys(ITEM_TRAITS).length).toBeGreaterThanOrEqual(18);
    expect(CATEGORY_BUYERS.length).toBeGreaterThanOrEqual(6);
    expect(SPECIALIST_BUYERS.length).toBeGreaterThanOrEqual(6);
    expect(BUYER_OFFERS.length).toBeGreaterThanOrEqual(12);
  });
});

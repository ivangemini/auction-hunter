import { describe, expect, it } from 'vitest';
import { CATEGORY_BUYERS, bestBuyerMatch, buyerOfferValue } from './buyers';
import { ITEM_BY_ID } from './catalog';
import {
  BUYER_MARKET_EXPERTISE_CAP,
  COLLECTION_SET_EXPERTISE_BONUS,
  buyerMarketExpertiseBonus,
} from './collections';

function requireItem(id: string) {
  const item = ITEM_BY_ID.get(id);
  if (!item) throw new Error(`Missing fixture item ${id}`);
  return item;
}

function requireBuyer(id: string) {
  const buyer = CATEGORY_BUYERS.find((candidate) => candidate.id === id);
  if (!buyer) throw new Error(`Missing fixture buyer ${id}`);
  return buyer;
}

describe('collection expertise', () => {
  it('does not grant a bonus until a set reward has been claimed', () => {
    expect(buyerMarketExpertiseBonus([], 'electronics')).toBe(0);
    expect(buyerMarketExpertiseBonus(['retro-tech'], 'watches')).toBe(0);
  });

  it('stacks claimed expertise for the same category without double-counting duplicate ids', () => {
    expect(buyerMarketExpertiseBonus(['retro-tech'], 'electronics')).toBe(COLLECTION_SET_EXPERTISE_BONUS);
    expect(buyerMarketExpertiseBonus(['retro-tech', 'field-tech'], 'electronics')).toBe(0.08);
    expect(buyerMarketExpertiseBonus(['retro-tech', 'retro-tech'], 'electronics')).toBe(COLLECTION_SET_EXPERTISE_BONUS);
  });

  it('caps future stacking at the configured expertise ceiling', () => {
    const toySets = ['toy-vault', 'street-nostalgia', 'miniature-worlds'];
    expect(buyerMarketExpertiseBonus(toySets, 'toys')).toBe(BUYER_MARKET_EXPERTISE_CAP);
  });

  it('adds expertise percentage points to the buyer multiplier', () => {
    const item = requireItem('cassette-player');
    const buyer = requireBuyer('retro-electronics');
    expect(buyerOfferValue(item, buyer, 1000, [], 0)).toBe(1220);
    expect(buyerOfferValue(item, buyer, 1000, [], 0.08)).toBe(1300);
  });

  it('prices preview matches with the same claimed-set expertise used by transactions', () => {
    const item = requireItem('cassette-player');
    const buyer = requireBuyer('retro-electronics');
    const match = bestBuyerMatch(
      [item.id],
      ITEM_BY_ID,
      buyer,
      [{
        id: 'copy-1',
        itemId: item.id,
        appraisedValue: 1000,
        condition: 0.8,
        restored: false,
        traitIds: [],
        acquiredAt: 1,
      }],
      ['retro-tech', 'field-tech'],
    );

    expect(match).not.toBeNull();
    expect(match?.expertiseBonus).toBe(0.08);
    expect(match?.effectiveMultiplier).toBeCloseTo(1.3);
    expect(match?.value).toBe(1300);
  });
});

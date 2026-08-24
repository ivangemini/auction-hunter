import { describe, expect, it } from 'vitest';
import {
  BUYER_OFFERS,
  CATEGORY_BUYERS,
  SPECIALIST_BUYERS,
  bestBuyerMatch,
  buyerOfferMatches,
  buyerOfferValue,
  dailyBuyerOffersForDay,
} from './buyers';
import { ITEM_BY_ID } from './catalog';
import { itemTraitsFor } from './itemTraits';

describe('buyer market', () => {
  it('creates two category buyers plus one specialist deterministically each day', () => {
    const first = dailyBuyerOffersForDay('2026-08-24');
    const second = dailyBuyerOffersForDay('2026-08-24');

    expect(first).toEqual(second);
    expect(first).toHaveLength(3);
    expect(new Set(first.map((offer) => offer.id)).size).toBe(3);
    expect(CATEGORY_BUYERS.some((offer) => offer.id === first[0]?.id)).toBe(true);
    expect(CATEGORY_BUYERS.some((offer) => offer.id === first[1]?.id)).toBe(true);
    expect(SPECIALIST_BUYERS.some((offer) => offer.id === first[2]?.id)).toBe(true);
  });

  it('matches specialist demand against stable collectible traits', () => {
    const provenanceBuyer = BUYER_OFFERS.find((offer) => offer.id === 'provenance-hunter');
    const signedPoster = ITEM_BY_ID.get('signed-poster');
    const toolbox = ITEM_BY_ID.get('toolbox');

    expect(provenanceBuyer).toBeDefined();
    expect(signedPoster).toBeDefined();
    expect(toolbox).toBeDefined();
    expect(itemTraitsFor('signed-poster')).toContain('signed');
    expect(buyerOfferMatches(signedPoster!, provenanceBuyer!)).toBe(true);
    expect(buyerOfferMatches(toolbox!, provenanceBuyer!)).toBe(false);
  });

  it('pays a meaningful premium and selects the most valuable matching held item', () => {
    const curator = BUYER_OFFERS.find((offer) => offer.id === 'art-curator');
    const masterStudy = ITEM_BY_ID.get('master-study');
    expect(curator).toBeDefined();
    expect(masterStudy).toBeDefined();

    const match = bestBuyerMatch(
      ['signed-poster', 'art-deco-lamp', 'master-study', 'master-study'],
      ITEM_BY_ID,
      curator!,
    );

    expect(match).toEqual({
      itemId: 'master-study',
      value: buyerOfferValue(masterStudy!, curator!),
      copies: 2,
    });
    expect(match!.value).toBeGreaterThan(masterStudy!.baseValue);
  });
});

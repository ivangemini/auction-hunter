import { describe, expect, it } from 'vitest';
import { BUYER_OFFERS, buyerOfferMatches, buyerOfferValue } from './buyers';
import { ITEM_BY_ID } from './catalog';

describe('copy trait breadth', () => {
  it('routes new positive copy traits to relevant specialist demand', () => {
    const provenance = BUYER_OFFERS.find((offer) => offer.id === 'provenance-hunter');
    const design = BUYER_OFFERS.find((offer) => offer.id === 'design-house');
    const camera = ITEM_BY_ID.get('film-camera');
    const consoleItem = ITEM_BY_ID.get('arcade-handheld');

    expect(provenance).toBeDefined();
    expect(design).toBeDefined();
    expect(camera).toBeDefined();
    expect(consoleItem).toBeDefined();
    expect(buyerOfferMatches(camera!, provenance!, ['matching-serials'])).toBe(true);
    expect(buyerOfferMatches(consoleItem!, design!, ['factory-sealed'])).toBe(true);
  });

  it('routes worn and water-damaged copies to restoration demand without erasing appraisal penalties', () => {
    const workshop = BUYER_OFFERS.find((offer) => offer.id === 'restoration-workshop');
    const camera = ITEM_BY_ID.get('film-camera');
    const print = ITEM_BY_ID.get('gallery-print');

    expect(workshop).toBeDefined();
    expect(camera).toBeDefined();
    expect(print).toBeDefined();
    expect(buyerOfferMatches(camera!, workshop!, ['heavy-wear'])).toBe(true);
    expect(buyerOfferMatches(print!, workshop!, ['water-damage'])).toBe(true);

    const damagedAppraisal = 420;
    expect(buyerOfferValue(camera!, workshop!, damagedAppraisal, ['heavy-wear']))
      .toBe(Math.round(damagedAppraisal * workshop!.multiplier));
  });
});
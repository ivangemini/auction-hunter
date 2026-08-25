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
import type { CollectionItem } from '../domain/types';

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

  it('creates niche demand for flawed concrete copies without pretending defects add appraisal value', () => {
    const workshop = BUYER_OFFERS.find((offer) => offer.id === 'restoration-workshop');
    const gambler = BUYER_OFFERS.find((offer) => offer.id === 'authenticity-gambler');
    const camera = ITEM_BY_ID.get('film-camera');
    const figurine = ITEM_BY_ID.get('porcelain-figurine');

    expect(workshop).toBeDefined();
    expect(gambler).toBeDefined();
    expect(camera).toBeDefined();
    expect(figurine).toBeDefined();

    expect(buyerOfferMatches(camera!, workshop!, ['replacement-parts'])).toBe(true);
    expect(buyerOfferMatches(camera!, workshop!, ['complete-set'])).toBe(false);
    expect(buyerOfferMatches(figurine!, gambler!, ['replica-risk'])).toBe(true);
    expect(buyerOfferMatches(figurine!, gambler!, ['period-design'])).toBe(false);

    const flawedAppraisal = 520;
    expect(buyerOfferValue(camera!, workshop!, flawedAppraisal, ['replacement-parts']))
      .toBe(Math.round(flawedAppraisal * workshop!.multiplier));
  });

  it('lets a salvage specialist select the best matching flawed copy only', () => {
    const workshop = BUYER_OFFERS.find((offer) => offer.id === 'restoration-workshop');
    expect(workshop).toBeDefined();

    const collectionItems: CollectionItem[] = [
      {
        id: 'clean-copy',
        itemId: 'film-camera',
        appraisedValue: 1100,
        condition: 0.9,
        restored: false,
        traitIds: [],
        acquiredAt: 1,
      },
      {
        id: 'repair-copy-low',
        itemId: 'film-camera',
        appraisedValue: 480,
        condition: 0.55,
        restored: false,
        traitIds: ['replacement-parts'],
        acquiredAt: 2,
      },
      {
        id: 'repair-copy-high',
        itemId: 'pocket-tv',
        appraisedValue: 690,
        condition: 0.66,
        restored: false,
        traitIds: ['incomplete'],
        acquiredAt: 3,
      },
    ];

    const match = bestBuyerMatch(
      ['film-camera', 'film-camera', 'pocket-tv'],
      ITEM_BY_ID,
      workshop!,
      collectionItems,
    );

    expect(match?.instanceId).toBe('repair-copy-high');
    expect(match?.value).toBe(Math.round(690 * workshop!.multiplier));
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

  it('chooses the highest-value concrete copy and prices its saved appraisal', () => {
    const curator = BUYER_OFFERS.find((offer) => offer.id === 'art-curator');
    const masterStudy = ITEM_BY_ID.get('master-study');
    expect(curator).toBeDefined();
    expect(masterStudy).toBeDefined();

    const collectionItems: CollectionItem[] = [
      {
        id: 'copy-low',
        itemId: 'master-study',
        appraisedValue: 3000,
        condition: 0.6,
        restored: false,
        traitIds: ['period-design', 'provenance'],
        acquiredAt: 1,
      },
      {
        id: 'copy-high',
        itemId: 'master-study',
        appraisedValue: 9000,
        condition: 0.94,
        restored: true,
        traitIds: ['period-design', 'provenance', 'documented-history'],
        acquiredAt: 2,
        restorationGrade: 'perfect',
      },
    ];

    const match = bestBuyerMatch(
      ['master-study', 'master-study'],
      ITEM_BY_ID,
      curator!,
      collectionItems,
    );

    expect(match?.instanceId).toBe('copy-high');
    expect(match?.appraisedValue).toBe(9000);
    expect(match?.restored).toBe(true);
    expect(match?.value).toBe(Math.round(9000 * curator!.multiplier));
  });
});

import { describe, expect, it } from 'vitest';
import { normalizeSave } from './save';

describe('save normalization', () => {
  it('keeps legacy v1 saves compatible when newer fields are absent', () => {
    const save = normalizeSave({
      version: 1,
      updatedAt: 123,
      cash: 4321,
      collection: ['film-camera'],
      claimedSetRewards: [],
      reputationXp: 80,
      lastDailyCompletedDay: null,
      onboardingComplete: true,
      auctionsWon: 2,
      auctionsPlayed: 5,
      lifetimeSales: 3500,
    });

    expect(save.cash).toBe(4321);
    expect(save.collection).toEqual(['film-camera']);
    expect(save.collectionItems).toHaveLength(1);
    expect(save.collectionItems?.[0]).toMatchObject({
      itemId: 'film-camera',
      appraisedValue: 780,
      condition: 1,
      restored: false,
      acquiredAt: 0,
    });
    expect(save.auctionHistory).toEqual([]);
    expect(save.highestCash).toBe(4321);
    expect(save.buyerMarketDayKey).toBeNull();
    expect(save.claimedBuyerOfferIds).toEqual([]);
    expect(save.discoveryChainProgress).toEqual({});
    expect(save.claimedDiscoveryChainRewards).toEqual([]);
  });

  it('sanitizes persisted auction history without destroying negative results', () => {
    const save = normalizeSave({
      version: 1,
      cash: 2500,
      auctionHistory: [
        {
          id: 'event-1',
          occurredAt: '2026-08-24T07:00:00.000Z',
          lotId: 'estate-42',
          tierId: 'estate',
          outcome: 'won',
          finalBid: 4200,
          sales: 2500,
          keptValue: 900,
          estimatedResult: -800,
          daily: true,
          modifierId: 'collector-buzz',
        },
        { id: '', tierId: 'invalid' },
      ],
    });

    expect(save.auctionHistory).toHaveLength(1);
    expect(save.auctionHistory[0]?.estimatedResult).toBe(-800);
    expect(save.auctionHistory[0]?.modifierId).toBe('collector-buzz');
  });

  it('sanitizes buyer market state while preserving same-day claims', () => {
    const save = normalizeSave({
      version: 1,
      cash: 2500,
      buyerMarketDayKey: '2026-08-24',
      claimedBuyerOfferIds: ['watch-specialist', 123, '', 'prototype-broker'],
    });

    expect(save.buyerMarketDayKey).toBe('2026-08-24');
    expect(save.claimedBuyerOfferIds).toEqual(['watch-specialist', '', 'prototype-broker']);
  });

  it('sanitizes concrete collection copies and drops orphan instances', () => {
    const save = normalizeSave({
      version: 1,
      cash: 2500,
      collection: ['pocket-watch'],
      collectionItems: [
        {
          id: 'watch-copy',
          itemId: 'pocket-watch',
          appraisedValue: 7300,
          condition: 1.4,
          restored: true,
          traitIds: ['mechanical', 'rare-variant', 'not-a-real-trait'],
          acquiredAt: 999,
          restorationGrade: 'perfect',
        },
        {
          id: 'orphan-copy',
          itemId: 'toolbox',
          appraisedValue: 100,
          condition: 0.8,
          restored: false,
          traitIds: [],
          acquiredAt: 1000,
        },
      ],
    });

    expect(save.collectionItems).toHaveLength(1);
    expect(save.collectionItems?.[0]).toEqual({
      id: 'watch-copy',
      itemId: 'pocket-watch',
      appraisedValue: 7300,
      condition: 1,
      restored: true,
      traitIds: ['mechanical', 'rare-variant'],
      acquiredAt: 999,
      restorationGrade: 'perfect',
    });
  });

  it('keeps valid legendary dossier progress and clamps or drops corrupt entries', () => {
    const save = normalizeSave({
      version: 1,
      cash: 2500,
      discoveryChainProgress: {
        'signal-in-dust': 2,
        'missing-maker': 999,
        'unknown-chain': 3,
      },
      claimedDiscoveryChainRewards: ['patrons-secret', 'not-real'],
    });

    expect(save.discoveryChainProgress).toEqual({
      'signal-in-dust': 2,
      'missing-maker': 4,
    });
    expect(save.claimedDiscoveryChainRewards).toEqual(['patrons-secret']);
  });
});

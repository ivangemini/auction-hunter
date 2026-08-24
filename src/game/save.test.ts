import { describe, expect, it } from 'vitest';
import { normalizeSave } from './save';

describe('save normalization', () => {
  it('keeps legacy v1 saves compatible when history fields are absent', () => {
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
    expect(save.auctionHistory).toEqual([]);
    expect(save.highestCash).toBe(4321);
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
});

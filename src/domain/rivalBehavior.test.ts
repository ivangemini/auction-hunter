import { describe, expect, it } from 'vitest';
import { BIDDER_PROFILES } from '../data/balance';
import {
  eligibleOpponents,
  opponentBidCeiling,
  opponentResponseBid,
  opponentTell,
  type AuctionOpponent,
} from './auction';
import type { LotTemplate } from './types';

const lot: LotTemplate = {
  id: 'behavior-test-lot',
  name: { ru: 'Тест', en: 'Test' },
  location: { ru: 'Тест', en: 'Test' },
  clues: [],
  reservePrice: 300,
  bidIncrement: 100,
  itemCount: 1,
  itemPool: ['toolbox'],
};

function opponent(
  behavior: AuctionOpponent['behavior'],
  maxBid: number,
  id = String(behavior ?? 'steady'),
): AuctionOpponent {
  return {
    id,
    name: { ru: id, en: id },
    maxBid,
    behavior,
  };
}

describe('rival bidding behavior', () => {
  it('telegraphs a mixed roster of steady, cautious and pressure bidders', () => {
    expect(BIDDER_PROFILES.filter((profile) => profile.behavior === 'cautious')).toHaveLength(1);
    expect(BIDDER_PROFILES.filter((profile) => profile.behavior === 'pressure')).toHaveLength(2);
    expect(BIDDER_PROFILES.filter((profile) => profile.behavior === 'steady')).toHaveLength(3);
  });

  it('lets pressure bidders jump two increments when their ceiling supports it', () => {
    const aggressive = opponent('pressure', 900);
    expect(opponentResponseBid(aggressive, 400, lot)).toBe(600);
  });

  it('falls back to one legal increment instead of overshooting a pressure ceiling', () => {
    const aggressive = opponent('pressure', 500);
    expect(opponentResponseBid(aggressive, 400, lot)).toBe(500);
  });

  it('makes cautious bidders preserve one increment of headroom and exit visibly earlier', () => {
    const cautious = opponent('cautious', 700);
    expect(opponentBidCeiling(cautious, lot)).toBe(600);
    expect(opponentResponseBid(cautious, 500, lot)).toBe(600);
    expect(opponentResponseBid(cautious, 600, lot)).toBeNull();
    expect(opponentTell(cautious, 600, lot)).toBe('out');
  });

  it('keeps eligibility and response rules aligned for mixed rivals', () => {
    const cautious = opponent('cautious', 700, 'cautious');
    const pressure = opponent('pressure', 900, 'pressure');
    const steady = opponent('steady', 500, 'steady');

    expect(eligibleOpponents([cautious, pressure, steady], 500, lot).map((candidate) => candidate.id)).toEqual([
      'cautious',
      'pressure',
    ]);
  });
});

import { describe, expect, it } from 'vitest';
import {
  opponentBidCeiling,
  opponentSignatureResponseBid,
  rivalSignatureActive,
  type AuctionOpponent,
} from './auction';
import type { LotTemplate } from './types';

const lot: LotTemplate = {
  id: 'signature-lot',
  name: { ru: 'Лот', en: 'Lot' },
  location: { ru: 'Тест', en: 'Test' },
  clues: [],
  reservePrice: 500,
  bidIncrement: 100,
  itemCount: 1,
  itemPool: ['x'],
};

function opponent(signatureBehavior: AuctionOpponent['signatureBehavior'], maxBid = 1400): AuctionOpponent {
  return {
    id: 'npc-test',
    name: { ru: 'Тест', en: 'Test' },
    maxBid,
    behavior: 'steady',
    signatureBehavior,
    signatureActive: true,
  };
}

describe('rival signature moves', () => {
  it('never exceeds the normal bid ceiling and is disabled after use', () => {
    const rival = opponent('counterpunch', 1400);
    const response = opponentSignatureResponseBid(rival, 900, lot, false);
    expect(response).toBeLessThanOrEqual(opponentBidCeiling(rival, lot));
    expect(opponentSignatureResponseBid(rival, 900, lot, true)).toBeNull();
  });

  it('keeps move identities situational instead of applying every response', () => {
    expect(opponentSignatureResponseBid(opponent('opening-jump'), 600, lot, false)).toBe(800);
    expect(opponentSignatureResponseBid(opponent('opening-jump'), 900, lot, false)).toBeNull();
    expect(opponentSignatureResponseBid(opponent('last-stand'), 600, lot, false)).toBeNull();
    expect(opponentSignatureResponseBid(opponent('last-stand'), 1000, lot, false)).toBe(1200);
  });

  it('uses deterministic rare activation without extra RNG consumption', () => {
    const first = rivalSignatureActive('npc-2', 'garage-17', 1200);
    expect(rivalSignatureActive('npc-2', 'garage-17', 1200)).toBe(first);
    const outcomes = Array.from({ length: 50 }, (_, index) => rivalSignatureActive('npc-2', `lot-${index}`, 1200));
    const activeCount = outcomes.filter(Boolean).length;
    expect(activeCount).toBeGreaterThan(2);
    expect(activeCount).toBeLessThan(20);
  });
});

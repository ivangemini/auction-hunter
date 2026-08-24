import { afterEach, describe, expect, it } from 'vitest';
import { prepareLotMarket, resetLotMarketCache } from './lotMarket';

describe('lot market preparation', () => {
  afterEach(() => resetLotMarketCache());

  it('downgrades locked tiers and returns three distinct normal choices', () => {
    const result = prepareLotMarket({
      requestedTierId: 'collector',
      reputationXp: 0,
      auctionsPlayed: 0,
      random: () => 0.99,
    });

    expect(result.tierId).toBe('garage');
    expect(result.choices).toHaveLength(3);
    expect(new Set(result.choices.map((choice) => choice.lot.id)).size).toBe(3);
  });

  it('keeps the same choices inside one auction market cycle and refreshes after the cycle advances', () => {
    const first = prepareLotMarket({
      requestedTierId: 'garage',
      reputationXp: 0,
      auctionsPlayed: 2,
      random: () => 0,
    });
    const cached = prepareLotMarket({
      requestedTierId: 'garage',
      reputationXp: 0,
      auctionsPlayed: 2,
      random: () => 0.99,
    });
    const nextCycle = prepareLotMarket({
      requestedTierId: 'garage',
      reputationXp: 0,
      auctionsPlayed: 3,
      random: () => 0.99,
    });

    expect(cached.choices).toBe(first.choices);
    expect(nextCycle.choices).not.toBe(first.choices);
  });
});

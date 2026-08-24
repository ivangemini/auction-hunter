import { describe, expect, it } from 'vitest';
import { BIDDER_PROFILES, ITEM_CONDITION_RANGE, MARKET_FACTOR_RANGE } from './balance';
import { ITEM_BY_ID, LOTS } from './catalog';
import { AUCTION_TIERS } from './tiers';
import { createAuctionOpponents, createLotItems, totalAppraisedValue, type RandomSource } from '../domain/auction';

interface Sample {
  lotId: string;
  hiddenValue: number;
  forceWinPrice: number;
  profit: number;
  margin: number;
}

const SAMPLES_PER_LOT = 240;
const STARTING_CASH = 2500;

function seededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function sampleLot(lotId: string): Sample[] {
  const lot = LOTS.find((candidate) => candidate.id === lotId);
  if (!lot) throw new Error(`Missing lot ${lotId}`);

  return Array.from({ length: SAMPLES_PER_LOT }, (_, index) => {
    const random = seededRandom(hash(`${lot.id}:${index}`));
    const items = createLotItems(
      lot,
      ITEM_BY_ID,
      ITEM_CONDITION_RANGE,
      MARKET_FACTOR_RANGE,
      1,
      random,
    );
    const opponents = createAuctionOpponents(lot, items, BIDDER_PROFILES, random);
    const hiddenValue = totalAppraisedValue(items);
    const highestNpcBid = Math.max(lot.reservePrice, ...opponents.map((opponent) => opponent.maxBid));
    const forceWinPrice = highestNpcBid + lot.bidIncrement;
    const profit = hiddenValue - forceWinPrice;
    return {
      lotId: lot.id,
      hiddenValue,
      forceWinPrice,
      profit,
      margin: hiddenValue > 0 ? profit / hiddenValue : 0,
    };
  });
}

function percentile(values: readonly number[], ratio: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.max(0, Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * ratio)));
  return sorted[index] ?? 0;
}

describe('economy strategy simulation', () => {
  it('keeps blind force-winning risky but not structurally punitive in every tier', () => {
    for (const tier of AUCTION_TIERS) {
      const samples = tier.lotIds.flatMap(sampleLot);
      const losses = samples.filter((sample) => sample.profit < 0).length;
      const lossRate = losses / samples.length;
      const averageMargin = samples.reduce((sum, sample) => sum + sample.margin, 0) / samples.length;

      // If losses disappear, the optimal strategy degenerates into "always force the win".
      expect(lossRate, `${tier.id} forced-win loss rate`).toBeGreaterThan(0.05);
      // If close to half or more forced wins lose money, the auction becomes too punishing for casual play.
      expect(lossRate, `${tier.id} forced-win loss rate`).toBeLessThan(0.45);
      // Blind forcing may have a small positive expectation, but should not be an outsized money printer.
      expect(averageMargin, `${tier.id} forced-win average margin`).toBeGreaterThan(-0.05);
      expect(averageMargin, `${tier.id} forced-win average margin`).toBeLessThan(0.2);
      expect(samples.some((sample) => sample.profit > 0), `${tier.id} needs profitable wins`).toBe(true);
      expect(samples.some((sample) => sample.profit < 0), `${tier.id} needs losing wins`).toBe(true);
    }
  });

  it('keeps most Garage force-win outcomes reachable from the starting bankroll', () => {
    const garage = AUCTION_TIERS.find((tier) => tier.id === 'garage');
    if (!garage) throw new Error('Garage tier missing');
    const samples = garage.lotIds.flatMap(sampleLot);
    const affordable = samples.filter((sample) => sample.forceWinPrice <= STARTING_CASH).length / samples.length;
    const medianPrice = percentile(samples.map((sample) => sample.forceWinPrice), 0.5);

    expect(affordable, 'Garage force-win affordability at 2,500 ₽').toBeGreaterThanOrEqual(0.6);
    expect(medianPrice, 'Garage median force-win price').toBeLessThanOrEqual(STARTING_CASH);
  });

  it('keeps every configured lot buyable at least at its first player bid from the starting bankroll', () => {
    const garage = AUCTION_TIERS.find((tier) => tier.id === 'garage');
    if (!garage) throw new Error('Garage tier missing');

    for (const lotId of garage.lotIds) {
      const lot = LOTS.find((candidate) => candidate.id === lotId);
      if (!lot) throw new Error(`Missing Garage lot ${lotId}`);
      expect(lot.reservePrice + lot.bidIncrement, `${lot.id} first bid`).toBeLessThanOrEqual(STARTING_CASH);
    }
  });
});

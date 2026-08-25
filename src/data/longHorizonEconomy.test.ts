import { afterEach, describe, expect, it } from 'vitest';
import { BIDDER_PROFILES, ITEM_CONDITION_RANGE, MARKET_FACTOR_RANGE } from './balance';
import { ITEM_BY_ID } from './catalog';
import { highestUnlockedAuctionTier } from './tiers';
import {
  createAuctionOpponents,
  createLotItems,
  opponentBidCeiling,
  roundToBid,
  totalAppraisedValue,
  type RandomSource,
} from '../domain/auction';
import { modifierConditionRange, modifierMarketMultiplier } from '../domain/lotModifier';
import type { ItemCategory } from '../domain/types';
import { prepareLotMarket, resetLotMarketCache, type LotChoice } from '../game/lotMarket';

const STARTING_CASH = 2500;
const VIP_PRESSURE = 1.08;
const MINUTES_PER_AUCTION = 3;
const SEEDS_PER_HORIZON = 24;

type Policy = 'cheapest' | 'trend-aware' | 'diversified';

interface RunResult {
  minutes: number;
  policy: Policy;
  auctions: number;
  wins: number;
  finalCash: number;
  maxCash: number;
  vipWins: number;
  selectedCategories: Record<ItemCategory, number>;
}

const POLICIES: readonly Policy[] = ['cheapest', 'trend-aware', 'diversified'];
const HORIZONS = [30, 60, 120] as const;
const CATEGORIES: readonly ItemCategory[] = ['electronics', 'watches', 'toys', 'art', 'tools', 'collectibles'];

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

function visibleCategories(choice: LotChoice): ItemCategory[] {
  const categories = new Set<ItemCategory>();
  for (const clue of choice.lot.clues) {
    if ('categories' in clue.signal) {
      clue.signal.categories.forEach((category) => categories.add(category));
    } else {
      clue.signal.itemIds.forEach((itemId) => {
        const category = ITEM_BY_ID.get(itemId)?.category;
        if (category) categories.add(category);
      });
    }
  }
  return [...categories];
}

function chooseOption(
  choices: readonly LotChoice[],
  policy: Policy,
  categoryCounts: Readonly<Record<ItemCategory, number>>,
): LotChoice {
  const ranked = [...choices];
  if (policy === 'cheapest') {
    ranked.sort((left, right) => left.lot.reservePrice - right.lot.reservePrice || left.lot.bidIncrement - right.lot.bidIncrement);
    return ranked[0]!;
  }

  if (policy === 'trend-aware') {
    ranked.sort((left, right) => {
      const leftScore = modifierMarketMultiplier(left.modifier) / Math.max(1, left.lot.reservePrice);
      const rightScore = modifierMarketMultiplier(right.modifier) / Math.max(1, right.lot.reservePrice);
      return rightScore - leftScore;
    });
    return ranked[0]!;
  }

  ranked.sort((left, right) => {
    const leftNeed = Math.min(...visibleCategories(left).map((category) => categoryCounts[category]), Number.MAX_SAFE_INTEGER);
    const rightNeed = Math.min(...visibleCategories(right).map((category) => categoryCounts[category]), Number.MAX_SAFE_INTEGER);
    return leftNeed - rightNeed || left.lot.reservePrice - right.lot.reservePrice;
  });
  return ranked[0]!;
}

function simulate(minutes: number, policy: Policy, seed: number): RunResult {
  const random = seededRandom(seed);
  const auctions = Math.floor(minutes / MINUTES_PER_AUCTION);
  let cash = STARTING_CASH;
  let maxCash = cash;
  let reputationXp = 0;
  let auctionsPlayed = 0;
  let wins = 0;
  let vipWins = 0;
  const selectedCategories = Object.fromEntries(CATEGORIES.map((category) => [category, 0])) as Record<ItemCategory, number>;

  for (let index = 0; index < auctions; index += 1) {
    const tier = highestUnlockedAuctionTier(reputationXp);
    resetLotMarketCache();
    const market = prepareLotMarket({
      requestedTierId: tier.id,
      reputationXp,
      auctionsPlayed,
      random,
    });
    const choice = chooseOption(market.choices, policy, selectedCategories);
    const categories = visibleCategories(choice);
    const primaryCategory = categories[0];
    if (primaryCategory) selectedCategories[primaryCategory] += 1;

    const items = createLotItems(
      choice.lot,
      ITEM_BY_ID,
      modifierConditionRange(ITEM_CONDITION_RANGE, choice.modifier),
      MARKET_FACTOR_RANGE,
      modifierMarketMultiplier(choice.modifier),
      random,
    );
    const opponents = createAuctionOpponents(choice.lot, items, BIDDER_PROFILES, random);
    const vip = choice.modifier?.id.includes('vip-invitation') === true;
    const highestNpcBid = Math.max(
      choice.lot.reservePrice,
      ...opponents.map((opponent) => {
        const ceiling = opponentBidCeiling(opponent, choice.lot);
        return vip ? roundToBid(ceiling * VIP_PRESSURE, choice.lot) : ceiling;
      }),
    );
    const forceWinPrice = highestNpcBid + choice.lot.bidIncrement;

    if (forceWinPrice <= cash) {
      const liquidationValue = totalAppraisedValue(items);
      cash += liquidationValue - forceWinPrice;
      cash = Math.max(0, Math.round(cash));
      maxCash = Math.max(maxCash, cash);
      reputationXp += tier.winXp;
      wins += 1;
      if (vip) vipWins += 1;
    }

    auctionsPlayed += 1;
  }

  return { minutes, policy, auctions, wins, finalCash: cash, maxCash, vipWins, selectedCategories };
}

function dominantCategoryShare(result: RunResult): number {
  const counts = Object.values(result.selectedCategories);
  const total = counts.reduce((sum, count) => sum + count, 0);
  return total > 0 ? Math.max(...counts) / total : 0;
}

afterEach(() => resetLotMarketCache());

describe('P8 long-horizon economy gate', () => {
  it.each(HORIZONS)('keeps %i-minute systemic runs solvent and bounded across visible-choice policies', (minutes) => {
    for (const policy of POLICIES) {
      const runs = Array.from({ length: SEEDS_PER_HORIZON }, (_, index) => simulate(minutes, policy, 9000 + minutes * 31 + index));
      const averageWins = runs.reduce((sum, run) => sum + run.wins, 0) / runs.length;
      const averageFinalCash = runs.reduce((sum, run) => sum + run.finalCash, 0) / runs.length;
      const peakCash = Math.max(...runs.map((run) => run.maxCash));

      expect(averageWins, `${minutes}m ${policy} wins`).toBeGreaterThanOrEqual(Math.max(2, runs[0]!.auctions * 0.2));
      expect(averageFinalCash, `${minutes}m ${policy} cash`).toBeGreaterThan(150);
      expect(peakCash, `${minutes}m ${policy} runaway cash`).toBeLessThan(250_000);
    }
  });

  it('does not let trend-aware or diversification policy collapse onto one category over 120 minutes', () => {
    for (const policy of ['trend-aware', 'diversified'] as const) {
      const runs = Array.from({ length: SEEDS_PER_HORIZON }, (_, index) => simulate(120, policy, 44000 + index));
      const averageDominance = runs.reduce((sum, run) => sum + dominantCategoryShare(run), 0) / runs.length;
      expect(averageDominance, `${policy} category dominance`).toBeLessThan(0.58);
    }
  });

  it('keeps VIP wins occasional rather than turning the late game into a permanent special format', () => {
    const runs = Array.from({ length: SEEDS_PER_HORIZON }, (_, index) => simulate(120, 'trend-aware', 73000 + index));
    const vipWins = runs.reduce((sum, run) => sum + run.vipWins, 0);
    const totalWins = runs.reduce((sum, run) => sum + run.wins, 0);
    const share = totalWins > 0 ? vipWins / totalWins : 0;

    expect(vipWins).toBeGreaterThan(0);
    expect(share).toBeLessThan(0.25);
  });
});

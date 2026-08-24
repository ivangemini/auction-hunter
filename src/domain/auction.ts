import { estimateItemValue } from './restoration';
import type { ItemDefinition, LocalizedText, LotClue, LotTemplate, RevealedItem } from './types';

export type RandomSource = () => number;

export interface NumericRange {
  min: number;
  max: number;
}

export interface BidderProfile {
  id: string;
  name: LocalizedText;
  hiddenValueFactor: NumericRange;
}

export interface AuctionOpponent {
  id: string;
  name: LocalizedText;
  maxBid: number;
}

const DEFAULT_RANDOM: RandomSource = Math.random;

export function randomBetween(range: NumericRange, random: RandomSource = DEFAULT_RANDOM): number {
  if (range.max < range.min) throw new Error('Invalid numeric range');
  const unit = Math.min(1, Math.max(0, random()));
  return range.min + (range.max - range.min) * unit;
}

export function chooseRandom<T>(values: readonly T[], random: RandomSource = DEFAULT_RANDOM): T | undefined {
  if (values.length === 0) return undefined;
  const unit = Math.min(0.9999999999999999, Math.max(0, random()));
  return values[Math.floor(unit * values.length)];
}

export function roundToBid(value: number, lot: LotTemplate): number {
  if (lot.bidIncrement <= 0) throw new Error('Bid increment must be greater than zero');
  return Math.max(lot.reservePrice, Math.round(value / lot.bidIncrement) * lot.bidIncrement);
}

export function nextBid(currentBid: number, lot: LotTemplate): number {
  return currentBid + lot.bidIncrement;
}

export function clueCandidateIds(
  clue: LotClue,
  pool: readonly string[],
  itemById: ReadonlyMap<string, ItemDefinition>,
): string[] {
  const signal = clue.signal;
  if ('itemIds' in signal) {
    const allowed = new Set(signal.itemIds);
    return pool.filter((id) => allowed.has(id) && itemById.has(id));
  }

  return pool.filter((id) => {
    const item = itemById.get(id);
    return Boolean(item && signal.categories.includes(item.category));
  });
}

export function createLotItems(
  lot: LotTemplate,
  itemById: ReadonlyMap<string, ItemDefinition>,
  conditionRange: NumericRange,
  marketFactorRange: NumericRange,
  valueMultiplier = 1,
  random: RandomSource = DEFAULT_RANDOM,
): RevealedItem[] {
  const pool = lot.itemPool.filter((id, index, values) => values.indexOf(id) === index);
  const selected: ItemDefinition[] = [];

  const selectId = (id: string): void => {
    const index = pool.indexOf(id);
    if (index < 0) return;
    pool.splice(index, 1);
    const item = itemById.get(id);
    if (item) selected.push(item);
  };

  // Every visible clue backs at least one generated find when its signal has an eligible item.
  // The player therefore receives real information without learning the exact hidden item/value.
  for (const clue of lot.clues) {
    if (selected.length >= lot.itemCount) break;
    const candidate = chooseRandom(clueCandidateIds(clue, pool, itemById), random);
    if (candidate) selectId(candidate);
  }

  while (selected.length < lot.itemCount && pool.length > 0) {
    const id = chooseRandom(pool, random);
    if (!id) break;
    selectId(id);
  }

  return selected.map((definition) => {
    const condition = randomBetween(conditionRange, random);
    const marketFactor = randomBetween(marketFactorRange, random) * valueMultiplier;

    return {
      definition,
      condition,
      restored: false,
      appraisedValue: estimateItemValue(definition.baseValue, condition, marketFactor),
    };
  });
}

export function totalAppraisedValue(items: readonly RevealedItem[]): number {
  return items.reduce((sum, item) => sum + item.appraisedValue, 0);
}

export function createAuctionOpponents(
  lot: LotTemplate,
  items: readonly RevealedItem[],
  profiles: readonly BidderProfile[],
  random: RandomSource = DEFAULT_RANDOM,
): AuctionOpponent[] {
  const hiddenValue = totalAppraisedValue(items);

  return profiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    maxBid: roundToBid(hiddenValue * randomBetween(profile.hiddenValueFactor, random), lot),
  }));
}

export function eligibleOpponents(
  opponents: readonly AuctionOpponent[],
  currentBid: number,
  lot: LotTemplate,
): AuctionOpponent[] {
  const requiredBid = nextBid(currentBid, lot);
  return opponents.filter((opponent) => opponent.maxBid >= requiredBid);
}

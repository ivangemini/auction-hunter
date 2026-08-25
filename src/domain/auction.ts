import { itemTraitValueMultiplier, rollItemTraits } from '../data/itemTraits';
import { estimateItemValue } from './restoration';
import type { ItemCategory, ItemDefinition, LocalizedText, LotClue, LotTemplate, RevealedItem } from './types';

export type RandomSource = () => number;
export type BidderTell = 'calm' | 'watching' | 'hesitating' | 'out';

export interface NumericRange {
  min: number;
  max: number;
}

export interface BidderProfile {
  id: string;
  name: LocalizedText;
  hiddenValueFactor: NumericRange;
  trait?: LocalizedText;
  specialtyCategories?: readonly ItemCategory[];
  specialtyValueMultiplier?: number;
}

export interface AuctionOpponent {
  id: string;
  name: LocalizedText;
  maxBid: number;
  trait?: LocalizedText;
  specialtyCategories?: readonly ItemCategory[];
  specialtyValueMultiplier?: number;
}

const DEFAULT_RANDOM: RandomSource = Math.random;
const MAX_AUCTION_OPPONENTS = 3;

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

  // Sample condition/market values for the whole lot before trait rolls. Keeping this
  // order stable preserves deterministic economy tests while still allowing each
  // concrete find to gain independent provenance/variant modifiers afterwards.
  const baseSamples = selected.map((definition) => ({
    definition,
    condition: randomBetween(conditionRange, random),
    marketFactor: randomBetween(marketFactorRange, random) * valueMultiplier,
  }));

  return baseSamples.map(({ definition, condition, marketFactor }) => {
    const traitIds = rollItemTraits(definition, random);
    const traitMultiplier = itemTraitValueMultiplier(traitIds);

    return {
      definition,
      condition,
      restored: false,
      traitIds,
      appraisedValue: estimateItemValue(definition.baseValue, condition, marketFactor * traitMultiplier),
    };
  });
}

export function totalAppraisedValue(items: readonly RevealedItem[]): number {
  return items.reduce((sum, item) => sum + item.appraisedValue, 0);
}

export function rivalValuation(items: readonly RevealedItem[], profile: BidderProfile): number {
  const hiddenValue = totalAppraisedValue(items);
  const specialtyCategories = profile.specialtyCategories ?? [];
  if (specialtyCategories.length === 0) return hiddenValue;

  const multiplier = Number.isFinite(profile.specialtyValueMultiplier)
    ? Math.max(1, Math.min(2, profile.specialtyValueMultiplier ?? 1))
    : 1;
  if (multiplier <= 1) return hiddenValue;

  const specialtySet = new Set(specialtyCategories);
  const specialtyValue = items.reduce(
    (sum, item) => specialtySet.has(item.definition.category) ? sum + item.appraisedValue : sum,
    0,
  );
  return hiddenValue + specialtyValue * (multiplier - 1);
}

export function selectAuctionBidderProfiles(
  items: readonly RevealedItem[],
  profiles: readonly BidderProfile[],
  random: RandomSource = DEFAULT_RANDOM,
  count = MAX_AUCTION_OPPONENTS,
): BidderProfile[] {
  const uniqueProfiles = profiles.filter(
    (profile, index, values) => values.findIndex((candidate) => candidate.id === profile.id) === index,
  );
  const desiredCount = Math.min(uniqueProfiles.length, Math.max(0, Math.floor(count)));
  if (desiredCount === 0) return [];

  const itemCategories = new Set(items.map((item) => item.definition.category));
  const preferredIds = new Set(
    uniqueProfiles
      .filter((profile) => (profile.specialtyCategories ?? []).some((category) => itemCategories.has(category)))
      .map((profile) => profile.id),
  );
  const pool = [...uniqueProfiles];
  const selected: BidderProfile[] = [];

  const pickFrom = (candidates: readonly BidderProfile[]): void => {
    const candidate = chooseRandom(candidates, random);
    if (!candidate) return;
    const poolIndex = pool.findIndex((profile) => profile.id === candidate.id);
    if (poolIndex < 0) return;
    selected.push(candidate);
    pool.splice(poolIndex, 1);
  };

  // Let specialists shape the auction, but reserve room for a wildcard rival so
  // repeated lots do not collapse into the same deterministic trio.
  const specialistSlots = Math.min(2, desiredCount, preferredIds.size);
  while (selected.length < specialistSlots) {
    pickFrom(pool.filter((profile) => preferredIds.has(profile.id)));
  }
  while (selected.length < desiredCount) {
    pickFrom(pool);
  }

  return selected;
}

export function createAuctionOpponents(
  lot: LotTemplate,
  items: readonly RevealedItem[],
  profiles: readonly BidderProfile[],
  random: RandomSource = DEFAULT_RANDOM,
): AuctionOpponent[] {
  return selectAuctionBidderProfiles(items, profiles, random).map((profile) => ({
    id: profile.id,
    name: profile.name,
    trait: profile.trait,
    specialtyCategories: profile.specialtyCategories,
    specialtyValueMultiplier: profile.specialtyValueMultiplier,
    maxBid: roundToBid(rivalValuation(items, profile) * randomBetween(profile.hiddenValueFactor, random), lot),
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

export function opponentTell(opponent: AuctionOpponent, currentBid: number, lot: LotTemplate): BidderTell {
  if (opponent.maxBid < nextBid(currentBid, lot)) return 'out';
  const ratio = opponent.maxBid > 0 ? currentBid / opponent.maxBid : 1;
  if (ratio < 0.6) return 'calm';
  if (ratio < 0.82) return 'watching';
  return 'hesitating';
}

import { itemTraitValueMultiplier, rollItemTraits } from '../data/itemTraits';
import { estimateItemValue } from './restoration';
import type { ItemCategory, ItemDefinition, LocalizedText, LotClue, LotTemplate, RevealedItem } from './types';

export type RandomSource = () => number;
export type BidderTell = 'calm' | 'watching' | 'hesitating' | 'out';
export type BidderBehavior = 'steady' | 'cautious' | 'pressure';
export type RivalSignatureBehavior = 'opening-jump' | 'last-stand' | 'counterpunch';

export interface NumericRange {
  min: number;
  max: number;
}

export interface BidderProfile {
  id: string;
  name: LocalizedText;
  hiddenValueFactor: NumericRange;
  trait?: LocalizedText;
  weakness?: LocalizedText;
  behavior?: BidderBehavior;
  signatureBehavior?: RivalSignatureBehavior;
  specialtyCategories?: readonly ItemCategory[];
  specialtyValueMultiplier?: number;
}

export interface AuctionOpponent {
  id: string;
  name: LocalizedText;
  maxBid: number;
  trait?: LocalizedText;
  weakness?: LocalizedText;
  behavior?: BidderBehavior;
  signatureBehavior?: RivalSignatureBehavior;
  signatureActive?: boolean;
  specialtyCategories?: readonly ItemCategory[];
  specialtyValueMultiplier?: number;
}

const DEFAULT_RANDOM: RandomSource = Math.random;
const MAX_AUCTION_OPPONENTS = 3;
const SIGNATURE_ACTIVATION_BUCKETS = 5;

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
  return selectAuctionBidderProfiles(items, profiles, random).map((profile) => {
    const maxBid = roundToBid(rivalValuation(items, profile) * randomBetween(profile.hiddenValueFactor, random), lot);
    return {
      id: profile.id,
      name: profile.name,
      trait: profile.trait,
      weakness: profile.weakness,
      behavior: profile.behavior,
      signatureBehavior: profile.signatureBehavior,
      signatureActive: profile.signatureBehavior ? rivalSignatureActive(profile.id, lot.id, maxBid) : false,
      specialtyCategories: profile.specialtyCategories,
      specialtyValueMultiplier: profile.specialtyValueMultiplier,
      maxBid,
    };
  });
}

export function rivalSignatureActive(rivalId: string, lotId: string, maxBid: number): boolean {
  const input = `${rivalId}:${lotId}:${Math.max(0, Math.round(maxBid))}`;
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % SIGNATURE_ACTIVATION_BUCKETS === 0;
}

export function opponentBidCeiling(opponent: AuctionOpponent, lot: LotTemplate): number {
  if (opponent.behavior !== 'cautious') return opponent.maxBid;
  return Math.max(lot.reservePrice, opponent.maxBid - lot.bidIncrement);
}

export function opponentResponseBid(
  opponent: AuctionOpponent,
  currentBid: number,
  lot: LotTemplate,
): number | null {
  const requiredBid = nextBid(currentBid, lot);
  const ceiling = opponentBidCeiling(opponent, lot);
  if (ceiling < requiredBid) return null;

  if (opponent.behavior === 'pressure') {
    const pressureBid = currentBid + lot.bidIncrement * 2;
    if (pressureBid <= ceiling) return pressureBid;
  }

  return requiredBid;
}

export function opponentSignatureResponseBid(
  opponent: AuctionOpponent,
  currentBid: number,
  lot: LotTemplate,
  alreadyUsed: boolean,
): number | null {
  if (alreadyUsed || !opponent.signatureActive || !opponent.signatureBehavior) return null;
  const ceiling = opponentBidCeiling(opponent, lot);
  const oneStep = currentBid + lot.bidIncrement;
  if (oneStep > ceiling) return null;

  if (opponent.signatureBehavior === 'opening-jump') {
    if (currentBid > lot.reservePrice + lot.bidIncrement * 2) return null;
    const jump = currentBid + lot.bidIncrement * 2;
    return jump <= ceiling ? jump : null;
  }

  if (opponent.signatureBehavior === 'last-stand') {
    const ratio = ceiling > 0 ? currentBid / ceiling : 1;
    if (ratio < 0.68) return null;
    const jump = currentBid + lot.bidIncrement * 2;
    return jump <= ceiling ? jump : null;
  }

  if (opponent.signatureBehavior === 'counterpunch') {
    if (currentBid < lot.reservePrice + lot.bidIncrement * 2) return null;
    const jump = currentBid + lot.bidIncrement * 3;
    return jump <= ceiling ? jump : null;
  }

  return null;
}

export function eligibleOpponents(
  opponents: readonly AuctionOpponent[],
  currentBid: number,
  lot: LotTemplate,
): AuctionOpponent[] {
  return opponents.filter((opponent) => opponentResponseBid(opponent, currentBid, lot) !== null);
}

export function opponentTell(opponent: AuctionOpponent, currentBid: number, lot: LotTemplate): BidderTell {
  const ceiling = opponentBidCeiling(opponent, lot);
  if (opponentResponseBid(opponent, currentBid, lot) === null) return 'out';
  const ratio = ceiling > 0 ? currentBid / ceiling : 1;
  if (ratio < 0.6) return 'calm';
  if (ratio < 0.82) return 'watching';
  return 'hesitating';
}

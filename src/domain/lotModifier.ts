import type { NumericRange, RandomSource } from './auction';
import type { LocalizedText, LotTemplate } from './types';

export interface LotModifierDefinition {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  itemCountDelta?: number;
  reserveMultiplier?: number;
  bidIncrementMultiplier?: number;
  clueLimit?: number;
  conditionDelta?: { min: number; max: number };
  marketMultiplier?: number;
}

const DEFAULT_RANDOM: RandomSource = Math.random;

export function selectLotModifier(
  modifiers: readonly LotModifierDefinition[],
  chance: number,
  random: RandomSource = DEFAULT_RANDOM,
): LotModifierDefinition | null {
  const normalizedChance = Math.max(0, Math.min(1, chance));
  if (modifiers.length === 0 || random() >= normalizedChance) return null;
  const index = Math.min(modifiers.length - 1, Math.floor(random() * modifiers.length));
  return modifiers[index] ?? null;
}

export function applyLotModifier(lot: LotTemplate, modifier: LotModifierDefinition | null): LotTemplate {
  if (!modifier) return lot;
  const bidIncrementMultiplier = Number.isFinite(modifier.bidIncrementMultiplier)
    ? Math.max(0.5, Math.min(3, modifier.bidIncrementMultiplier ?? 1))
    : 1;
  const adjustedBidIncrement = Math.max(1, Math.round(lot.bidIncrement * bidIncrementMultiplier));
  const reserveMultiplier = modifier.reserveMultiplier ?? 1;
  const adjustedReserve = Math.max(
    adjustedBidIncrement,
    Math.round((lot.reservePrice * reserveMultiplier) / adjustedBidIncrement) * adjustedBidIncrement,
  );
  const itemCount = Math.max(1, Math.min(lot.itemPool.length, lot.itemCount + (modifier.itemCountDelta ?? 0)));
  const clueLimit = Number.isFinite(modifier.clueLimit)
    ? Math.max(0, Math.min(lot.clues.length, Math.floor(modifier.clueLimit ?? lot.clues.length)))
    : lot.clues.length;

  return {
    ...lot,
    clues: lot.clues.slice(0, clueLimit),
    reservePrice: adjustedReserve,
    bidIncrement: adjustedBidIncrement,
    itemCount,
  };
}

export function modifierConditionRange(
  base: NumericRange,
  modifier: LotModifierDefinition | null,
): NumericRange {
  if (!modifier?.conditionDelta) return base;
  const min = Math.max(0.2, Math.min(1, base.min + modifier.conditionDelta.min));
  const max = Math.max(min, Math.max(0.2, Math.min(1, base.max + modifier.conditionDelta.max)));
  return { min, max };
}

export function modifierMarketMultiplier(modifier: LotModifierDefinition | null): number {
  const multiplier = modifier?.marketMultiplier ?? 1;
  return Number.isFinite(multiplier) ? Math.max(0.1, multiplier) : 1;
}

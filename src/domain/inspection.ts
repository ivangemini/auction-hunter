import type { Rarity, RevealedItem } from './types';

export type InspectionConditionBand = 'rough' | 'mixed' | 'preserved';

export interface InspectionReport {
  conditionBand: InspectionConditionBand;
  premiumFinds: number;
}

const PREMIUM_RARITIES = new Set<Rarity>(['rare', 'epic', 'legendary']);

export function inspectLot(items: readonly RevealedItem[]): InspectionReport {
  if (items.length === 0) return { conditionBand: 'mixed', premiumFinds: 0 };

  const averageCondition = items.reduce((sum, item) => sum + item.condition, 0) / items.length;
  const conditionBand: InspectionConditionBand = averageCondition < 0.58
    ? 'rough'
    : averageCondition < 0.76
      ? 'mixed'
      : 'preserved';

  return {
    conditionBand,
    premiumFinds: items.filter((item) => PREMIUM_RARITIES.has(item.definition.rarity)).length,
  };
}

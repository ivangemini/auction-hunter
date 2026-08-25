import type { ItemCategory, LocalizedText, LotTemplate } from './types';

export interface MarketTrendDefinition {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  category: ItemCategory;
  valueMultiplier: number;
}

export interface MarketTrendSchedule {
  activeAuctions: number;
  cooldownAuctions: number;
}

export interface ActiveMarketTrend {
  definition: MarketTrendDefinition;
  remainingAuctions: number;
  cycleIndex: number;
}

export function activeMarketTrendForAuction(
  auctionsPlayed: number,
  trends: readonly MarketTrendDefinition[],
  schedule: MarketTrendSchedule,
): ActiveMarketTrend | null {
  if (trends.length === 0) return null;

  const activeAuctions = Math.max(1, Math.floor(schedule.activeAuctions));
  const cooldownAuctions = Math.max(0, Math.floor(schedule.cooldownAuctions));
  const cycleLength = activeAuctions + cooldownAuctions;
  const auctionIndex = Math.max(0, Math.floor(auctionsPlayed));
  const cycleIndex = Math.floor(auctionIndex / cycleLength);
  const phaseIndex = auctionIndex % cycleLength;

  if (phaseIndex >= activeAuctions) return null;

  const definition = trends[cycleIndex % trends.length];
  if (!definition) return null;

  return {
    definition,
    remainingAuctions: activeAuctions - phaseIndex,
    cycleIndex,
  };
}

export function trendTouchesVisibleLot(
  lot: LotTemplate,
  trend: ActiveMarketTrend | null,
  itemCategoryById: ReadonlyMap<string, ItemCategory>,
): boolean {
  if (!trend) return false;
  const category = trend.definition.category;

  return lot.clues.some((clue) => {
    if ('categories' in clue.signal) return clue.signal.categories.includes(category);
    return clue.signal.itemIds.some((itemId) => itemCategoryById.get(itemId) === category);
  });
}

export function marketTrendMultiplier(trend: ActiveMarketTrend | null): number {
  const multiplier = trend?.definition.valueMultiplier ?? 1;
  return Number.isFinite(multiplier) ? Math.max(0.5, Math.min(1.5, multiplier)) : 1;
}

export function marketTrendMultiplierForCategory(
  trend: ActiveMarketTrend | null,
  category: ItemCategory | undefined,
): number {
  if (!trend || !category || trend.definition.category !== category) return 1;
  return marketTrendMultiplier(trend);
}

import { describe, expect, it } from 'vitest';
import type { ItemCategory, LotTemplate } from './types';
import {
  activeMarketTrendForAuction,
  marketTrendMultiplier,
  trendTouchesVisibleLot,
  type MarketTrendDefinition,
} from './marketTrend';

const trends: readonly MarketTrendDefinition[] = [
  {
    id: 'watches-up',
    name: { ru: 'Часы', en: 'Watches' },
    description: { ru: 'Рост', en: 'Up' },
    category: 'watches',
    valueMultiplier: 1.2,
  },
  {
    id: 'electronics-down',
    name: { ru: 'Техника', en: 'Electronics' },
    description: { ru: 'Спад', en: 'Down' },
    category: 'electronics',
    valueMultiplier: 0.9,
  },
];

const lot: LotTemplate = {
  id: 'mixed',
  name: { ru: 'Лот', en: 'Lot' },
  location: { ru: 'Склад', en: 'Storage' },
  clues: [
    { text: { ru: 'Тикает', en: 'Ticking' }, signal: { categories: ['watches'] } },
    { text: { ru: 'Коробка', en: 'Box' }, signal: { itemIds: ['radio'] } },
  ],
  reservePrice: 500,
  bidIncrement: 50,
  itemCount: 2,
  itemPool: ['watch', 'radio'],
};

const categories = new Map<string, ItemCategory>([
  ['watch', 'watches'],
  ['radio', 'electronics'],
]);

describe('market trends', () => {
  it('persists an active trend for three auction numbers then inserts a two-auction cooldown', () => {
    const schedule = { activeAuctions: 3, cooldownAuctions: 2 };

    expect(activeMarketTrendForAuction(0, trends, schedule)).toMatchObject({ remainingAuctions: 3, cycleIndex: 0 });
    expect(activeMarketTrendForAuction(2, trends, schedule)).toMatchObject({ remainingAuctions: 1, cycleIndex: 0 });
    expect(activeMarketTrendForAuction(3, trends, schedule)).toBeNull();
    expect(activeMarketTrendForAuction(4, trends, schedule)).toBeNull();
    expect(activeMarketTrendForAuction(5, trends, schedule)?.definition.id).toBe('electronics-down');
  });

  it('uses only visible clue signals to decide whether a lot is exposed to the trend', () => {
    const schedule = { activeAuctions: 3, cooldownAuctions: 2 };
    const watchTrend = activeMarketTrendForAuction(0, trends, schedule);
    const electronicsTrend = activeMarketTrendForAuction(5, trends, schedule);

    expect(trendTouchesVisibleLot(lot, watchTrend, categories)).toBe(true);
    expect(trendTouchesVisibleLot(lot, electronicsTrend, categories)).toBe(true);
  });

  it('bounds malformed market multipliers defensively', () => {
    const active = activeMarketTrendForAuction(0, [{ ...trends[0]!, valueMultiplier: 9 }], { activeAuctions: 3, cooldownAuctions: 2 });
    expect(marketTrendMultiplier(active)).toBe(1.5);
  });
});

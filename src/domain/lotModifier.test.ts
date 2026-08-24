import { describe, expect, it } from 'vitest';
import { applyLotModifier, modifierConditionRange, modifierMarketMultiplier, selectLotModifier, type LotModifierDefinition } from './lotModifier';
import type { LotTemplate } from './types';

const lot: LotTemplate = {
  id: 'test',
  name: { ru: 'Тест', en: 'Test' },
  location: { ru: 'Тест', en: 'Test' },
  clues: [],
  reservePrice: 500,
  bidIncrement: 100,
  itemCount: 4,
  itemPool: ['a', 'b', 'c', 'd', 'e'],
};

const modifier: LotModifierDefinition = {
  id: 'event',
  name: { ru: 'Событие', en: 'Event' },
  description: { ru: 'Описание', en: 'Description' },
  itemCountDelta: 1,
  reserveMultiplier: 0.75,
  conditionDelta: { min: 0.1, max: 0.05 },
  marketMultiplier: 1.12,
};

describe('lot modifiers', () => {
  it('selects no event outside chance and a deterministic event inside chance', () => {
    expect(selectLotModifier([modifier], 0.2, () => 0.9)).toBeNull();
    const values = [0.1, 0.4];
    expect(selectLotModifier([modifier], 0.2, () => values.shift() ?? 0)).toEqual(modifier);
  });

  it('applies bounded runtime lot and value effects without mutating the source template', () => {
    const adjusted = applyLotModifier(lot, modifier);
    expect(adjusted).not.toBe(lot);
    expect(adjusted.reservePrice).toBe(400);
    expect(adjusted.itemCount).toBe(5);
    expect(lot.reservePrice).toBe(500);
    expect(modifierConditionRange({ min: 0.42, max: 0.92 }, modifier)).toEqual({ min: 0.52, max: 0.9700000000000001 });
    expect(modifierMarketMultiplier(modifier)).toBe(1.12);
  });
});

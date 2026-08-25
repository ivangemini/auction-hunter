import { describe, expect, it } from 'vitest';
import { applyLotModifier, modifierConditionRange, modifierMarketMultiplier } from '../domain/lotModifier';
import type { LotTemplate } from '../domain/types';
import { LOT_MODIFIERS } from './lotModifiers';

const sampleLot: LotTemplate = {
  id: 'test-lot',
  artId: 'garage-17',
  name: { ru: 'Тест', en: 'Test' },
  location: { ru: 'Тест', en: 'Test' },
  clues: [],
  reservePrice: 400,
  bidIncrement: 100,
  itemCount: 4,
  itemPool: ['a', 'b', 'c', 'd', 'e'],
};

describe('lot modifier breadth', () => {
  it('ships eight unique bilingual modifier identities', () => {
    expect(LOT_MODIFIERS).toHaveLength(8);
    expect(new Set(LOT_MODIFIERS.map((modifier) => modifier.id)).size).toBe(8);
    for (const modifier of LOT_MODIFIERS) {
      expect(modifier.name.ru.length).toBeGreaterThan(0);
      expect(modifier.name.en.length).toBeGreaterThan(0);
      expect(modifier.description.ru.length).toBeGreaterThan(0);
      expect(modifier.description.en.length).toBeGreaterThan(0);
    }
  });

  it('keeps all configured multipliers finite and positive', () => {
    for (const modifier of LOT_MODIFIERS) {
      if (modifier.reserveMultiplier !== undefined) {
        expect(Number.isFinite(modifier.reserveMultiplier), modifier.id).toBe(true);
        expect(modifier.reserveMultiplier, modifier.id).toBeGreaterThan(0);
      }
      if (modifier.marketMultiplier !== undefined) {
        expect(Number.isFinite(modifier.marketMultiplier), modifier.id).toBe(true);
        expect(modifier.marketMultiplier, modifier.id).toBeGreaterThan(0);
      }
    }
  });

  it('never creates an impossible item count or reserve', () => {
    for (const modifier of LOT_MODIFIERS) {
      const adjusted = applyLotModifier(sampleLot, modifier);
      expect(adjusted.itemCount, modifier.id).toBeGreaterThanOrEqual(1);
      expect(adjusted.itemCount, modifier.id).toBeLessThanOrEqual(sampleLot.itemPool.length);
      expect(adjusted.reservePrice, modifier.id).toBeGreaterThanOrEqual(sampleLot.bidIncrement);
      expect(adjusted.reservePrice % sampleLot.bidIncrement, modifier.id).toBe(0);
    }
  });

  it('keeps condition and market outputs inside production bounds', () => {
    for (const modifier of LOT_MODIFIERS) {
      const condition = modifierConditionRange({ min: 0.45, max: 0.85 }, modifier);
      expect(condition.min, modifier.id).toBeGreaterThanOrEqual(0.2);
      expect(condition.max, modifier.id).toBeLessThanOrEqual(1);
      expect(condition.max, modifier.id).toBeGreaterThanOrEqual(condition.min);
      expect(modifierMarketMultiplier(modifier), modifier.id).toBeGreaterThanOrEqual(0.1);
    }
  });
});

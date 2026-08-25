import { describe, expect, it } from 'vitest';
import type { ItemDefinition } from '../domain/types';
import { ITEM_TRAITS, itemTraitValueMultiplier, rollItemTraits } from './itemTraits';

const collectible: ItemDefinition = {
  id: 'test-collectible',
  name: { ru: 'Тест', en: 'Test' },
  category: 'collectibles',
  rarity: 'rare',
  baseValue: 1000,
};

const electronics: ItemDefinition = {
  id: 'test-electronics',
  name: { ru: 'Техника', en: 'Electronics' },
  category: 'electronics',
  rarity: 'legendary',
  baseValue: 1000,
};

function sequence(values: readonly number[]): () => number {
  let index = 0;
  return () => values[index++] ?? values.at(-1) ?? 0;
}

describe('item variant traits', () => {
  it('ships a broader concrete-copy trait pool', () => {
    expect(Object.keys(ITEM_TRAITS)).toHaveLength(18);
    expect(ITEM_TRAITS['factory-sealed'].valueMultiplier).toBeGreaterThan(1);
    expect(ITEM_TRAITS['matching-serials'].valueMultiplier).toBeGreaterThan(1);
    expect(ITEM_TRAITS['water-damage'].valueMultiplier).toBeLessThan(1);
    expect(ITEM_TRAITS['heavy-wear'].valueMultiplier).toBeLessThan(1);
  });

  it('never rolls incomplete together with complete-set', () => {
    const traits = rollItemTraits(collectible, sequence([
      0, // positive roll succeeds
      0, // choose complete-set
      0, // negative roll succeeds
      0.6, // choose from remaining compatible negatives
    ]));

    expect(traits).toContain('complete-set');
    expect(traits).not.toContain('incomplete');
  });

  it('keeps factory-sealed copies logically compatible with their negative variant', () => {
    const traits = rollItemTraits(electronics, sequence([
      0, // positive roll succeeds
      0.55, // choose factory-sealed from four eligible positive traits
      0, // negative roll succeeds
      0, // choose first remaining compatible negative
    ]));

    expect(traits).toContain('factory-sealed');
    expect(traits).not.toContain('incomplete');
    expect(traits).not.toContain('replacement-parts');
    expect(traits.some((trait) => trait === 'water-damage' || trait === 'heavy-wear')).toBe(true);
  });

  it('lets positive and negative variants materially change appraisal multipliers', () => {
    expect(itemTraitValueMultiplier(['rare-variant'])).toBeCloseTo(1.28, 12);
    expect(itemTraitValueMultiplier(['incomplete'])).toBeCloseTo(0.72, 12);
    expect(itemTraitValueMultiplier(['rare-variant', 'incomplete'])).toBeCloseTo(0.9216, 12);
    expect(itemTraitValueMultiplier(['factory-sealed'])).toBeCloseTo(1.24, 12);
    expect(itemTraitValueMultiplier(['water-damage'])).toBeCloseTo(0.76, 12);
    expect(itemTraitValueMultiplier(['factory-sealed', 'water-damage'])).toBeCloseTo(0.9424, 12);
  });
});
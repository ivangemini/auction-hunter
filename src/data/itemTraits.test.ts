import { describe, expect, it } from 'vitest';
import type { ItemDefinition } from '../domain/types';
import { itemTraitValueMultiplier, rollItemTraits } from './itemTraits';

const collectible: ItemDefinition = {
  id: 'test-collectible',
  name: { ru: 'Тест', en: 'Test' },
  category: 'collectibles',
  rarity: 'rare',
  baseValue: 1000,
};

function sequence(values: readonly number[]): () => number {
  let index = 0;
  return () => values[index++] ?? values.at(-1) ?? 0;
}

describe('item variant traits', () => {
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

  it('lets positive and negative variants materially change appraisal multipliers', () => {
    expect(itemTraitValueMultiplier(['rare-variant'])).toBeCloseTo(1.28, 12);
    expect(itemTraitValueMultiplier(['incomplete'])).toBeCloseTo(0.72, 12);
    expect(itemTraitValueMultiplier(['rare-variant', 'incomplete'])).toBeCloseTo(0.9216, 12);
  });
});

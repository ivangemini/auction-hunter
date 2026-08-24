import { describe, expect, it } from 'vitest';
import { inspectLot } from './inspection';
import type { Rarity, RevealedItem } from './types';

function item(condition: number, rarity: Rarity): RevealedItem {
  return {
    definition: {
      id: `${rarity}-${condition}`,
      name: { ru: 'Тест', en: 'Test' },
      category: 'collectibles',
      rarity,
      baseValue: 100,
    },
    appraisedValue: 100,
    condition,
    restored: false,
  };
}

describe('advanced inspection', () => {
  it('reports broad condition bands without exposing exact values', () => {
    expect(inspectLot([item(0.45, 'common'), item(0.55, 'uncommon')]).conditionBand).toBe('rough');
    expect(inspectLot([item(0.62, 'common'), item(0.72, 'rare')]).conditionBand).toBe('mixed');
    expect(inspectLot([item(0.82, 'epic'), item(0.9, 'legendary')]).conditionBand).toBe('preserved');
  });

  it('counts only rare-or-better finds as premium signals', () => {
    const report = inspectLot([
      item(0.7, 'common'),
      item(0.7, 'uncommon'),
      item(0.7, 'rare'),
      item(0.7, 'legendary'),
    ]);
    expect(report.premiumFinds).toBe(2);
  });
});

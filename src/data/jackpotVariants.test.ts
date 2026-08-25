import { describe, expect, it } from 'vitest';
import { itemTraitValueMultiplier } from './itemTraits';
import { jackpotTraitBonusMultiplier, jackpotVariantForTraits } from './jackpotVariants';

describe('provenance jackpot variants', () => {
  it('recognizes authored multi-trait copy stories', () => {
    expect(jackpotVariantForTraits(['prototype', 'documented-history'])?.id).toBe('documented-prototype');
    expect(jackpotVariantForTraits(['provenance', 'rare-variant'])?.id).toBe('archive-grade');
    expect(jackpotVariantForTraits(['provenance'])).toBeNull();
  });

  it('adds a bounded bonus on top of existing concrete-copy traits', () => {
    expect(jackpotTraitBonusMultiplier(['prototype', 'documented-history'])).toBeCloseTo(1.14, 12);
    expect(itemTraitValueMultiplier(['prototype', 'documented-history'])).toBeCloseTo(1.16 * 1.14, 12);
    expect(itemTraitValueMultiplier(['provenance', 'rare-variant'])).toBeCloseTo(1.28 * 1.1, 12);
    expect(itemTraitValueMultiplier(['rare-variant'])).toBeCloseTo(1.28, 12);
  });
});

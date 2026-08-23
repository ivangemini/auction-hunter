import { describe, expect, it } from 'vitest';
import { applyRestoration, conditionValueMultiplier, estimateItemValue } from './restoration';

describe('restoration domain', () => {
  it('increases estimated value as condition improves', () => {
    expect(conditionValueMultiplier(0.9)).toBeGreaterThan(conditionValueMultiplier(0.5));
    expect(estimateItemValue(1000, 0.9, 1)).toBeGreaterThan(estimateItemValue(1000, 0.5, 1));
  });

  it('rewards accurate timing and never lowers value', () => {
    const perfect = applyRestoration(1000, 0.5, 0.5, 0.5, 0.1);
    const good = applyRestoration(1000, 0.5, 0.68, 0.5, 0.1);
    const rough = applyRestoration(1000, 0.5, 0.95, 0.5, 0.1);

    expect(perfect.grade).toBe('perfect');
    expect(good.grade).toBe('good');
    expect(rough.grade).toBe('rough');
    expect(perfect.valueGain).toBeGreaterThan(good.valueGain);
    expect(good.valueGain).toBeGreaterThan(rough.valueGain);
    expect(rough.valueAfter).toBeGreaterThanOrEqual(rough.valueBefore);
    expect(perfect.conditionAfter).toBeLessThanOrEqual(1);
  });
});

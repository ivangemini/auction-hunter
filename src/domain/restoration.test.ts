import { describe, expect, it } from 'vitest';
import {
  applyRestoration,
  baseRestorationTargetHalfWidth,
  conditionValueMultiplier,
  estimateItemValue,
  restorationTargetHalfWidth,
} from './restoration';

describe('restoration domain', () => {
  it('increases estimated value as condition improves', () => {
    expect(conditionValueMultiplier(0.9)).toBeGreaterThan(conditionValueMultiplier(0.5));
    expect(estimateItemValue(1000, 0.9, 1)).toBeGreaterThan(estimateItemValue(1000, 0.5, 1));
  });

  it('rewards accurate timing and never lowers value in the default pro mode', () => {
    const perfect = applyRestoration(1000, 0.5, 0.5, 0.5, 0.1);
    const good = applyRestoration(1000, 0.5, 0.68, 0.5, 0.1);
    const rough = applyRestoration(1000, 0.5, 0.95, 0.5, 0.1);

    expect(perfect.mode).toBe('pro');
    expect(perfect.grade).toBe('perfect');
    expect(good.grade).toBe('good');
    expect(rough.grade).toBe('rough');
    expect(perfect.valueGain).toBeGreaterThan(good.valueGain);
    expect(good.valueGain).toBeGreaterThan(rough.valueGain);
    expect(rough.valueAfter).toBeGreaterThanOrEqual(rough.valueBefore);
    expect(perfect.conditionAfter).toBeLessThanOrEqual(1);
  });

  it('makes safe wider and risky narrower while giving risky the highest perfect upside', () => {
    const base = baseRestorationTargetHalfWidth('rare');
    expect(restorationTargetHalfWidth(base, 'safe')).toBeGreaterThan(restorationTargetHalfWidth(base, 'pro'));
    expect(restorationTargetHalfWidth(base, 'risky')).toBeLessThan(restorationTargetHalfWidth(base, 'pro'));

    const safe = applyRestoration(1000, 0.5, 0.5, 0.5, base, 'safe');
    const pro = applyRestoration(1000, 0.5, 0.5, 0.5, base, 'pro');
    const risky = applyRestoration(1000, 0.5, 0.5, 0.5, base, 'risky');

    expect(risky.valueGain).toBeGreaterThan(pro.valueGain);
    expect(pro.valueGain).toBeGreaterThan(safe.valueGain);
  });

  it('lets a risky miss consume the attempt without destroying item value', () => {
    const rough = applyRestoration(1000, 0.5, 0.99, 0.3, 0.1, 'risky');
    expect(rough.grade).toBe('rough');
    expect(rough.conditionAfter).toBe(rough.conditionBefore);
    expect(rough.valueAfter).toBe(rough.valueBefore);
    expect(rough.valueGain).toBe(0);
  });
});

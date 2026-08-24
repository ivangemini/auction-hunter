import { expect, test } from '@playwright/test';
import {
  applyRestoration,
  baseRestorationTargetHalfWidth,
  conditionValueMultiplier,
  estimateItemValue,
  restorationTargetHalfWidth,
} from '../src/game/restoration';

test('condition scales appraisal value', () => {
  expect(conditionValueMultiplier(0.9)).toBeGreaterThan(conditionValueMultiplier(0.5));
  expect(estimateItemValue(1000, 0.9, 1)).toBeGreaterThan(estimateItemValue(1000, 0.5, 1));
});

test('restoration timing rewards accuracy and never lowers value', () => {
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

test('safe, pro and risky modes expose distinct difficulty/upside profiles', () => {
  const base = baseRestorationTargetHalfWidth('legendary');
  expect(restorationTargetHalfWidth(base, 'safe')).toBeGreaterThan(restorationTargetHalfWidth(base, 'pro'));
  expect(restorationTargetHalfWidth(base, 'risky')).toBeLessThan(restorationTargetHalfWidth(base, 'pro'));

  const safe = applyRestoration(1000, 0.5, 0.5, 0.5, base, 'safe');
  const pro = applyRestoration(1000, 0.5, 0.5, 0.5, base, 'pro');
  const risky = applyRestoration(1000, 0.5, 0.5, 0.5, base, 'risky');
  expect(risky.valueGain).toBeGreaterThan(pro.valueGain);
  expect(pro.valueGain).toBeGreaterThan(safe.valueGain);

  const riskyMiss = applyRestoration(1000, 0.5, 0.99, 0.3, base, 'risky');
  expect(riskyMiss.valueGain).toBe(0);
  expect(riskyMiss.valueAfter).toBe(riskyMiss.valueBefore);
});

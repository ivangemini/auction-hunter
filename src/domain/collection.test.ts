import { describe, expect, it } from 'vitest';
import { collectionResaleValue, ownedCopies } from './collection';

describe('collection domain', () => {
  it('calculates a conservative rounded resale value', () => {
    expect(collectionResaleValue(1000, 0.65)).toBe(650);
    expect(collectionResaleValue(90, 0.65)).toBe(60);
    expect(collectionResaleValue(1000, 2)).toBe(1000);
    expect(collectionResaleValue(-10, 0.65)).toBe(0);
  });

  it('counts duplicate inventory copies without changing unique-set semantics', () => {
    expect(ownedCopies(['a', 'b', 'a', 'a'], 'a')).toBe(3);
    expect(ownedCopies(['a', 'b'], 'missing')).toBe(0);
  });
});

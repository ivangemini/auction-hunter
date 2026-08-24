import { describe, expect, test } from 'vitest';
import { chooseDistinctRandom } from './lotSelection';

function sequence(values: number[]): () => number {
  let index = 0;
  return () => values[index++] ?? 0;
}

describe('chooseDistinctRandom', () => {
  test('returns the requested number of unique options without mutating the source', () => {
    const source = ['a', 'b', 'c', 'd', 'e', 'f'];
    const result = chooseDistinctRandom(source, 3, sequence([0, 0.7, 0.4]));

    expect(result).toHaveLength(3);
    expect(new Set(result).size).toBe(3);
    expect(source).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  test('caps the requested count at the available pool size', () => {
    expect(chooseDistinctRandom(['a', 'b'], 5, () => 0)).toEqual(['a', 'b']);
  });

  test('returns no options for non-positive or non-finite counts', () => {
    expect(chooseDistinctRandom(['a'], 0)).toEqual([]);
    expect(chooseDistinctRandom(['a'], -1)).toEqual([]);
    expect(chooseDistinctRandom(['a'], Number.NaN)).toEqual([]);
  });

  test('clamps random sources at both ends instead of reading outside the pool', () => {
    expect(chooseDistinctRandom(['a', 'b', 'c'], 2, sequence([-10, 10]))).toEqual(['a', 'c']);
  });
});

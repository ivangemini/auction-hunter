import type { RandomSource } from './auction';

const DEFAULT_RANDOM: RandomSource = Math.random;

export function chooseDistinctRandom<T>(
  values: readonly T[],
  count: number,
  random: RandomSource = DEFAULT_RANDOM,
): T[] {
  if (!Number.isFinite(count) || count <= 0 || values.length === 0) return [];

  const pool = [...values];
  const selected: T[] = [];
  const target = Math.min(pool.length, Math.floor(count));

  while (selected.length < target && pool.length > 0) {
    const unit = Math.min(0.9999999999999999, Math.max(0, random()));
    const index = Math.floor(unit * pool.length);
    const [value] = pool.splice(index, 1);
    if (value !== undefined) selected.push(value);
  }

  return selected;
}

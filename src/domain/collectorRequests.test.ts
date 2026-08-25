import { describe, expect, it } from 'vitest';
import type { CollectionItem, ItemDefinition } from './types';
import {
  bestCollectorRequestMatch,
  collectorRequestForAuction,
  collectorRequestMatches,
  collectorRequestValue,
  type CollectorRequestDefinition,
} from './collectorRequests';

const requests: readonly CollectorRequestDefinition[] = [
  {
    id: 'watch',
    name: { ru: 'Часы', en: 'Watch' },
    description: { ru: 'Хорошие часы', en: 'Good watch' },
    tier: 'common',
    category: 'watches',
    minCondition: 0.75,
    multiplier: 1.4,
  },
  {
    id: 'prototype',
    name: { ru: 'Прототип', en: 'Prototype' },
    description: { ru: 'Прототип', en: 'Prototype' },
    tier: 'rare',
    traitIds: ['prototype'],
    multiplier: 1.7,
  },
];

const watch: ItemDefinition = {
  id: 'watch-item',
  name: { ru: 'Часы', en: 'Watch' },
  category: 'watches',
  rarity: 'rare',
  baseValue: 1000,
};

const goodCopy: CollectionItem = {
  id: 'copy-good',
  itemId: watch.id,
  appraisedValue: 1200,
  condition: 0.82,
  restored: false,
  traitIds: [],
  acquiredAt: 1,
};

const weakCopy: CollectionItem = {
  ...goodCopy,
  id: 'copy-weak',
  appraisedValue: 900,
  condition: 0.61,
};

describe('collector requests', () => {
  it('keeps one request active across six auction counts and then rotates', () => {
    const first = collectorRequestForAuction(0, requests, 6);
    expect(first).toMatchObject({ requestKey: 'watch@0', remainingAuctions: 6 });
    expect(collectorRequestForAuction(5, requests, 6)).toMatchObject({ requestKey: 'watch@0', remainingAuctions: 1 });
    expect(collectorRequestForAuction(6, requests, 6)).toMatchObject({ requestKey: 'prototype@1', remainingAuctions: 6 });
  });

  it('checks category and concrete-copy condition instead of stable identity alone', () => {
    expect(collectorRequestMatches(watch, goodCopy, requests[0]!)).toBe(true);
    expect(collectorRequestMatches(watch, weakCopy, requests[0]!)).toBe(false);
  });

  it('prices from the saved concrete appraisal and returns the strongest matching copy', () => {
    const active = collectorRequestForAuction(0, requests, 6)!;
    expect(collectorRequestValue(goodCopy, active.definition)).toBe(1680);
    const match = bestCollectorRequestMatch([weakCopy, goodCopy], new Map([[watch.id, watch]]), active);
    expect(match?.instance.id).toBe(goodCopy.id);
    expect(match?.value).toBe(1680);
  });
});

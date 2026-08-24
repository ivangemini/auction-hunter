import { describe, expect, it } from 'vitest';
import {
  clueCandidateIds,
  createAuctionOpponents,
  createLotItems,
  eligibleOpponents,
  nextBid,
  roundToBid,
  totalAppraisedValue,
} from './auction';
import type { BidderProfile, RandomSource } from './auction';
import type { ItemDefinition, LotTemplate } from './types';

const lot: LotTemplate = {
  id: 'test-lot',
  name: { ru: 'Тест', en: 'Test' },
  location: { ru: 'Тест', en: 'Test' },
  clues: [],
  reservePrice: 100,
  bidIncrement: 50,
  itemCount: 2,
  itemPool: ['item-a', 'item-b', 'missing-item'],
};

const items: ItemDefinition[] = [
  {
    id: 'item-a',
    name: { ru: 'A', en: 'A' },
    category: 'electronics',
    rarity: 'common',
    baseValue: 100,
  },
  {
    id: 'item-b',
    name: { ru: 'B', en: 'B' },
    category: 'watches',
    rarity: 'rare',
    baseValue: 100,
  },
];

function sequence(values: readonly number[]): RandomSource {
  let index = 0;
  return () => values[index++] ?? values.at(-1) ?? 0;
}

describe('auction domain', () => {
  it('rounds bidder budgets to the lot increment and never below reserve', () => {
    expect(roundToBid(20, lot)).toBe(100);
    expect(roundToBid(176, lot)).toBe(200);
    expect(nextBid(200, lot)).toBe(250);
  });

  it('selects unique configured items and derives condition/value through injected randomness', () => {
    const itemById = new Map(items.map((item) => [item.id, item]));
    const generated = createLotItems(
      lot,
      itemById,
      { min: 0.42, max: 0.92 },
      { min: 0.9, max: 1.15 },
      1,
      sequence([0, 0, 0, 0, 1, 1, 1]),
    );

    expect(generated.map((item) => item.definition.id)).toEqual(['item-a', 'item-b']);
    expect(generated.map((item) => item.appraisedValue)).toEqual([60, 120]);
    expect(generated[0]!.condition).toBeCloseTo(0.42, 12);
    expect(generated[1]!.condition).toBeCloseTo(0.92, 12);
    expect(generated.every((item) => item.restored === false)).toBe(true);
    expect(new Set(generated.map((item) => item.definition.id)).size).toBe(generated.length);
    expect(totalAppraisedValue(generated)).toBe(180);
  });

  it('turns visible clues into guaranteed category-backed information', () => {
    const itemById = new Map(items.map((item) => [item.id, item]));
    const clueLot: LotTemplate = {
      ...lot,
      itemPool: ['item-a', 'item-b'],
      clues: [
        {
          text: { ru: 'Футляр от часов', en: 'Watch case' },
          signal: { categories: ['watches'] },
        },
      ],
    };

    expect(clueCandidateIds(clueLot.clues[0]!, clueLot.itemPool, itemById)).toEqual(['item-b']);
    const generated = createLotItems(clueLot, itemById, { min: 0.5, max: 0.5 }, { min: 1, max: 1 }, 1, () => 0.99);
    expect(generated.map((item) => item.definition.id)).toContain('item-b');
    expect(generated.map((item) => item.definition.id)).toContain('item-a');
  });

  it('applies daily/special value multipliers after market-factor sampling', () => {
    const itemById = new Map(items.map((item) => [item.id, item]));
    const singleLot = { ...lot, itemCount: 1, itemPool: ['item-a'] };
    const normal = createLotItems(singleLot, itemById, { min: 0.5, max: 0.5 }, { min: 1, max: 1 }, 1, () => 0.99);
    const boosted = createLotItems(singleLot, itemById, { min: 0.5, max: 0.5 }, { min: 1, max: 1 }, 1.5, () => 0.99);
    expect(boosted[0]!.appraisedValue).toBeGreaterThan(normal[0]!.appraisedValue);
  });

  it('lets a positive per-find variant increase appraisal for the same item', () => {
    const itemById = new Map(items.map((item) => [item.id, item]));
    const singleLot = { ...lot, itemCount: 1, itemPool: ['item-b'] };
    const baseline = createLotItems(
      singleLot,
      itemById,
      { min: 0.8, max: 0.8 },
      { min: 1, max: 1 },
      1,
      sequence([0, 0, 0, 1, 1]),
    );
    const variant = createLotItems(
      singleLot,
      itemById,
      { min: 0.8, max: 0.8 },
      { min: 1, max: 1 },
      1,
      sequence([0, 0, 0, 0, 0.6, 1]),
    );

    expect(variant[0]!.traitIds).toContain('rare-variant');
    expect(variant[0]!.appraisedValue).toBeGreaterThan(baseline[0]!.appraisedValue);
  });

  it('derives NPC budgets from hidden lot value and filters who can answer the next bid', () => {
    const generated = [
      { definition: items[0]!, appraisedValue: 60, condition: 0.42, restored: false },
      { definition: items[1]!, appraisedValue: 120, condition: 0.92, restored: false },
    ];
    const profiles: BidderProfile[] = [
      {
        id: 'cautious',
        name: { ru: 'Осторожный', en: 'Cautious' },
        hiddenValueFactor: { min: 0.5, max: 0.5 },
      },
      {
        id: 'aggressive',
        name: { ru: 'Смелый', en: 'Aggressive' },
        hiddenValueFactor: { min: 1, max: 1 },
      },
    ];

    const opponents = createAuctionOpponents(lot, generated, profiles, () => 0);

    expect(opponents.map((opponent) => opponent.maxBid)).toEqual([100, 200]);
    expect(eligibleOpponents(opponents, 100, lot).map((opponent) => opponent.id)).toEqual(['aggressive']);
  });
});

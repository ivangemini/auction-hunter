import { describe, expect, it } from 'vitest';
import type { CollectionItem, ItemDefinition } from './types';
import { curateShowroom, showroomDisplayedValue, showroomSlotCount } from './showroom';

const definitions = new Map<string, ItemDefinition>([
  ['common', { id: 'common', name: { ru: 'Обычный', en: 'Common' }, category: 'tools', rarity: 'common', baseValue: 9000 }],
  ['rare', { id: 'rare', name: { ru: 'Редкий', en: 'Rare' }, category: 'watches', rarity: 'rare', baseValue: 1200 }],
  ['legendary', { id: 'legendary', name: { ru: 'Легендарный', en: 'Legendary' }, category: 'art', rarity: 'legendary', baseValue: 1800 }],
  ['legacy', { id: 'legacy', name: { ru: 'Старый', en: 'Legacy' }, category: 'collectibles', rarity: 'uncommon', baseValue: 650 }],
  ['extra-1', { id: 'extra-1', name: { ru: 'Пятый', en: 'Fifth' }, category: 'toys', rarity: 'common', baseValue: 500 }],
  ['extra-2', { id: 'extra-2', name: { ru: 'Шестой', en: 'Sixth' }, category: 'electronics', rarity: 'common', baseValue: 450 }],
]);

function copy(overrides: Partial<CollectionItem> & Pick<CollectionItem, 'id' | 'itemId'>): CollectionItem {
  return {
    appraisedValue: 1000,
    condition: 0.8,
    restored: false,
    traitIds: [],
    acquiredAt: 1,
    ...overrides,
  };
}

describe('showroom curation', () => {
  it('opens more trophy slots with the existing showroom upgrade', () => {
    expect(showroomSlotCount(-1)).toBe(4);
    expect(showroomSlotCount(0)).toBe(4);
    expect(showroomSlotCount(1)).toBe(6);
    expect(showroomSlotCount(2)).toBe(8);
    expect(showroomSlotCount(3)).toBe(10);
    expect(showroomSlotCount(99)).toBe(10);
  });

  it('prioritizes rarity before raw value so the room reads as a trophy collection', () => {
    const result = curateShowroom(
      ['common', 'rare', 'legendary'],
      [
        copy({ id: 'c', itemId: 'common', appraisedValue: 50000 }),
        copy({ id: 'r', itemId: 'rare', appraisedValue: 2000 }),
        copy({ id: 'l', itemId: 'legendary', appraisedValue: 1800 }),
      ],
      definitions,
      0,
    );
    expect(result.map((entry) => entry.itemId)).toEqual(['legendary', 'rare', 'common']);
  });

  it('selects the strongest concrete copy for one identity without displaying duplicates', () => {
    const result = curateShowroom(
      ['rare', 'rare'],
      [
        copy({ id: 'low', itemId: 'rare', appraisedValue: 1000, condition: 0.65 }),
        copy({ id: 'high', itemId: 'rare', appraisedValue: 1450, condition: 0.95, restored: true }),
      ],
      definitions,
      3,
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.sourceId).toBe('high');
  });

  it('keeps legacy saves displayable when concrete collectionItems are absent', () => {
    const result = curateShowroom(['legacy'], undefined, definitions, 0);
    expect(result[0]).toMatchObject({
      sourceId: 'legacy:legacy',
      appraisedValue: 650,
      legacyFallback: true,
    });
  });

  it('caps the visible curation to unlocked slots and totals displayed appraisal', () => {
    const result = curateShowroom(
      ['common', 'rare', 'legendary', 'legacy', 'extra-1', 'extra-2'],
      undefined,
      definitions,
      0,
    );
    expect(result).toHaveLength(4);
    expect(showroomDisplayedValue(result)).toBe(result.reduce((sum, entry) => sum + entry.appraisedValue, 0));
  });
});

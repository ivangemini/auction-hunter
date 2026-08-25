import { describe, expect, it } from 'vitest';
import { ITEM_BY_ID } from './catalog';
import { COLLECTION_SETS } from './collections';

describe('collection breadth', () => {
  it('keeps twenty-four stable unique collection goal ids', () => {
    expect(COLLECTION_SETS).toHaveLength(24);
    expect(new Set(COLLECTION_SETS.map((set) => set.id)).size).toBe(24);
  });

  it('keeps every collection goal bilingual, rewarding and backed by real items', () => {
    for (const set of COLLECTION_SETS) {
      expect(set.name.ru.trim(), `${set.id} RU name`).not.toBe('');
      expect(set.name.en.trim(), `${set.id} EN name`).not.toBe('');
      expect(set.reward, `${set.id} reward`).toBeGreaterThan(0);
      expect(set.itemIds.length, `${set.id} item count`).toBeGreaterThanOrEqual(2);
      expect(new Set(set.itemIds).size, `${set.id} duplicate item`).toBe(set.itemIds.length);
      for (const itemId of set.itemIds) expect(ITEM_BY_ID.has(itemId), `${set.id}:${itemId}`).toBe(true);

      expect(set.perk.description.ru.trim(), `${set.id} RU perk`).not.toBe('');
      expect(set.perk.description.en.trim(), `${set.id} EN perk`).not.toBe('');
      expect(set.perk.categories.length, `${set.id} perk categories`).toBeGreaterThan(0);
      expect(set.perk.resaleRateBonus, `${set.id} perk bonus`).toBeGreaterThan(0);
      expect(set.perk.resaleRateBonus, `${set.id} perk bonus`).toBeLessThanOrEqual(0.04);
    }
  });

  it('keeps both additive breadth packs present', () => {
    for (const id of [
      'portable-era', 'mechanical-heritage', 'paper-trail', 'cabinet-curios',
      'broadcast-age', 'prototype-cabinet', 'collector-desk', 'after-hours-exhibit',
    ]) {
      expect(COLLECTION_SETS.some((set) => set.id === id), id).toBe(true);
    }
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buyerOfferMatches, dailyBuyerOffersForDay } from '../data/buyers';
import { ITEMS } from '../data/catalog';
import { createDefaultSave, SAVE_STORAGE_KEY } from './save';
import { GameStore } from './store';

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('GameStore buyer market', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    storage = new MemoryStorage();
    vi.stubGlobal('localStorage', storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sells exactly one matching copy and locks that buyer for the day', () => {
    const dayKey = '2026-08-24';
    const offer = dailyBuyerOffersForDay(dayKey)[0];
    expect(offer).toBeDefined();
    const item = ITEMS.find((candidate) => buyerOfferMatches(candidate, offer!));
    expect(item).toBeDefined();

    const save = createDefaultSave();
    save.collection = [item!.id, item!.id];
    save.buyerMarketDayKey = dayKey;
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));

    const store = new GameStore();
    const firstValue = store.sellToBuyer(offer!.id, item!.id, dayKey);
    const afterFirst = store.snapshot;

    expect(firstValue).toBeGreaterThan(item!.baseValue);
    expect(afterFirst.collection.filter((id) => id === item!.id)).toHaveLength(1);
    expect(afterFirst.collectionItems).toHaveLength(1);
    expect(afterFirst.claimedBuyerOfferIds).toContain(offer!.id);
    expect(afterFirst.cash).toBe(2500 + firstValue);
    expect(afterFirst.lifetimeSales).toBe(firstValue);

    expect(store.sellToBuyer(offer!.id, item!.id, dayKey)).toBe(0);
    expect(store.snapshot.collection.filter((id) => id === item!.id)).toHaveLength(1);
  });

  it('prices and removes the exact concrete copy selected by the buyer', () => {
    const dayKey = '2026-08-24';
    const offer = dailyBuyerOffersForDay(dayKey)[0];
    expect(offer).toBeDefined();
    const item = ITEMS.find((candidate) => buyerOfferMatches(candidate, offer!));
    expect(item).toBeDefined();

    const save = createDefaultSave();
    save.collection = [item!.id];
    save.collectionItems = [{
      id: 'premium-copy',
      itemId: item!.id,
      appraisedValue: 5000,
      condition: 0.92,
      restored: true,
      traitIds: [],
      acquiredAt: 10,
      restorationGrade: 'perfect',
    }];
    save.buyerMarketDayKey = dayKey;
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));

    const store = new GameStore();
    const value = store.sellToBuyer(offer!.id, 'premium-copy', dayKey);

    expect(value).toBe(Math.round(5000 * offer!.multiplier));
    expect(store.snapshot.collection).toEqual([]);
    expect(store.snapshot.collectionItems).toEqual([]);
  });

  it('resets claimed offers when the local market day changes', () => {
    const save = createDefaultSave();
    save.buyerMarketDayKey = '2026-08-23';
    save.claimedBuyerOfferIds = ['watch-specialist'];
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));

    const store = new GameStore();
    store.prepareBuyerMarket('2026-08-24');

    expect(store.snapshot.buyerMarketDayKey).toBe('2026-08-24');
    expect(store.snapshot.claimedBuyerOfferIds).toEqual([]);
  });
});

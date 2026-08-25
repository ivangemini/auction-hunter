import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ITEMS } from '../data/catalog';
import type { RevealedItem } from '../domain/types';
import { createDefaultSave, normalizeSave, SAVE_STORAGE_KEY } from './save';
import { GameStore } from './store';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

function revealed(condition: number, value: number): RevealedItem {
  const definition = ITEMS[0]!;
  return {
    definition,
    condition,
    appraisedValue: value,
    restored: false,
    traitIds: ['rare-variant'],
  };
}

describe('collection discovery history', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    storage = new MemoryStorage();
    vi.stubGlobal('localStorage', storage);
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(createDefaultSave()));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('keeps best-ever records across keep and immediate-sale disposition paths', () => {
    const store = new GameStore();
    const first = revealed(0.72, 1400);
    const best = revealed(0.94, 2600);

    store.keepItem(first);
    store.sellItem(best.appraisedValue, best.definition.id, best);

    const save = store.snapshot;
    expect(save.discoveredItemIds).toContain(best.definition.id);
    expect(save.bestConditionByItem[best.definition.id]).toBeCloseTo(0.94, 12);
    expect(save.bestValueByItem[best.definition.id]).toBe(2600);
    expect(save.discoveredVariantTraitIds).toContain('rare-variant');
  });

  it('backfills discovery history for legacy saves from their concrete inventory', () => {
    const item = ITEMS[1]!;
    const legacy = createDefaultSave() as unknown as Record<string, unknown>;
    delete legacy.discoveredItemIds;
    delete legacy.bestConditionByItem;
    delete legacy.bestValueByItem;
    delete legacy.discoveredVariantTraitIds;
    legacy.collection = [item.id];
    legacy.collectionItems = [{
      id: 'legacy-copy',
      itemId: item.id,
      appraisedValue: 4100,
      condition: 0.88,
      restored: false,
      traitIds: ['documented-history'],
      acquiredAt: 0,
    }];

    const normalized = normalizeSave(legacy);
    expect(normalized.discoveredItemIds).toContain(item.id);
    expect(normalized.bestConditionByItem[item.id]).toBeCloseTo(0.88, 12);
    expect(normalized.bestValueByItem[item.id]).toBe(4100);
    expect(normalized.discoveredVariantTraitIds).toContain('documented-history');
  });
});

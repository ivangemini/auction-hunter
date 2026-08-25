import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ITEMS } from '../data/catalog';
import { COLLECTOR_REQUESTS, COLLECTOR_REQUEST_WINDOW_AUCTIONS } from '../data/collectorRequests';
import { collectorRequestForAuction, collectorRequestMatches } from '../domain/collectorRequests';
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

describe('GameStore collector requests', () => {
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

  it('sells the requested concrete copy once for the active multi-auction request', () => {
    const active = collectorRequestForAuction(0, COLLECTOR_REQUESTS, COLLECTOR_REQUEST_WINDOW_AUCTIONS);
    expect(active).not.toBeNull();
    const item = ITEMS.find((candidate) => active && collectorRequestMatches(candidate, {
      id: 'candidate',
      itemId: candidate.id,
      appraisedValue: 4000,
      condition: 0.9,
      restored: false,
      traitIds: [],
      acquiredAt: 1,
    }, active.definition));
    expect(item).toBeDefined();

    const save = createDefaultSave();
    save.auctionsPlayed = 0;
    save.collection = [item!.id, item!.id];
    save.collectionItems = [
      {
        id: 'weaker-copy',
        itemId: item!.id,
        appraisedValue: 1800,
        condition: 0.8,
        restored: false,
        traitIds: [],
        acquiredAt: 1,
      },
      {
        id: 'request-copy',
        itemId: item!.id,
        appraisedValue: 4000,
        condition: 0.9,
        restored: true,
        traitIds: [],
        acquiredAt: 2,
        restorationGrade: 'perfect',
      },
    ];
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));

    const store = new GameStore();
    const value = store.fulfillCollectorRequest(active!.requestKey, 'request-copy');

    expect(value).toBe(Math.round(4000 * active!.definition.multiplier));
    expect(store.snapshot.collection).toEqual([item!.id]);
    expect(store.snapshot.collectionItems?.map((copy) => copy.id)).toEqual(['weaker-copy']);
    expect(store.snapshot.claimedCollectorRequests).toContain(active!.requestKey);
    expect(store.fulfillCollectorRequest(active!.requestKey, 'weaker-copy')).toBe(0);
  });

  it('rejects stale request keys after the request window rotates', () => {
    const oldRequest = collectorRequestForAuction(0, COLLECTOR_REQUESTS, COLLECTOR_REQUEST_WINDOW_AUCTIONS)!;
    const save = createDefaultSave();
    save.auctionsPlayed = COLLECTOR_REQUEST_WINDOW_AUCTIONS;
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));

    const store = new GameStore();
    expect(store.fulfillCollectorRequest(oldRequest.requestKey, 'anything')).toBe(0);
  });
});

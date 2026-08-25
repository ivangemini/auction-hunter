import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DISCOVERY_CHAINS } from '../data/discoveryChains';
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

describe('GameStore discovery chains', () => {
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

  it('persists progress for sold or kept round finds and blocks two stages in one auction', () => {
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(createDefaultSave()));
    const chain = DISCOVERY_CHAINS[0]!;
    const store = new GameStore();

    store.recordAuctionPlayed();
    store.sellItem(100, chain.steps[0]!.itemId);
    expect(store.snapshot.discoveryChainProgress[chain.id]).toBe(1);

    store.keepItem(chain.steps[1]!.itemId);
    expect(store.snapshot.discoveryChainProgress[chain.id]).toBe(1);

    store.recordAuctionPlayed();
    store.keepItem(chain.steps[1]!.itemId);
    expect(store.snapshot.discoveryChainProgress[chain.id]).toBe(2);
  });

  it('grants completion rewards once after discoveries in separate auctions', () => {
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(createDefaultSave()));
    const chain = DISCOVERY_CHAINS[0]!;
    const store = new GameStore();

    for (const step of chain.steps) {
      store.recordAuctionPlayed();
      store.keepItem(step.itemId);
    }

    const completed = store.snapshot;
    expect(completed.completedDiscoveryChains).toContain(chain.id);
    expect(completed.discoveryChainProgress[chain.id]).toBe(chain.steps.length);
    expect(completed.cash).toBe(2500 + chain.rewardCash);
    expect(completed.reputationXp).toBe(chain.rewardReputationXp);

    store.recordAuctionPlayed();
    store.keepItem(chain.steps[chain.steps.length - 1]!.itemId);

    expect(store.snapshot.cash).toBe(2500 + chain.rewardCash);
    expect(store.snapshot.reputationXp).toBe(chain.rewardReputationXp);
  });
});

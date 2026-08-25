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

describe('GameStore legendary discovery chains', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    storage = new MemoryStorage();
    vi.stubGlobal('localStorage', storage);
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(createDefaultSave()));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persists ordered progress across store instances and ignores unrelated keeps', () => {
    const chain = DISCOVERY_CHAINS[0]!;
    const first = new GameStore();

    first.keepItem('toolbox');
    expect(first.snapshot.discoveryChainProgress[chain.id] ?? 0).toBe(0);

    first.keepItem(chain.steps[0]!.itemId);
    expect(first.snapshot.discoveryChainProgress[chain.id]).toBe(1);

    const reloaded = new GameStore();
    reloaded.keepItem(chain.steps[1]!.itemId);
    expect(reloaded.snapshot.discoveryChainProgress[chain.id]).toBe(2);
  });

  it('grants a completed dossier exactly once', () => {
    const chain = DISCOVERY_CHAINS[0]!;
    const store = new GameStore();
    for (const step of chain.steps) store.keepItem(step.itemId);

    expect(store.snapshot.discoveryChainProgress[chain.id]).toBe(chain.steps.length);
    const cashBefore = store.snapshot.cash;
    const repBefore = store.snapshot.reputationXp;

    expect(store.claimDiscoveryChainReward(chain.id)).toEqual({
      cash: chain.rewardCash,
      reputationXp: chain.rewardReputationXp,
    });
    expect(store.snapshot.cash).toBe(cashBefore + chain.rewardCash);
    expect(store.snapshot.reputationXp).toBe(repBefore + chain.rewardReputationXp);
    expect(store.snapshot.claimedDiscoveryChainRewards).toContain(chain.id);
    expect(store.claimDiscoveryChainReward(chain.id)).toBeNull();
  });

  it('refuses to claim an incomplete dossier', () => {
    const chain = DISCOVERY_CHAINS[1]!;
    const store = new GameStore();
    store.keepItem(chain.steps[0]!.itemId);
    expect(store.claimDiscoveryChainReward(chain.id)).toBeNull();
  });
});

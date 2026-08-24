import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { PlayerSave } from '../domain/types';
import { createDefaultSave, SAVE_STORAGE_KEY } from '../game/save';

const CLOUD_KEY = 'auctionHunterSaveV1';

type Deferred<T> = {
  promise: Promise<T>;
  resolve(value: T | PromiseLike<T>): void;
  reject(reason?: unknown): void;
};

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

function deferred<T>(): Deferred<T> {
  let resolve!: Deferred<T>['resolve'];
  let reject!: Deferred<T>['reject'];
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function save(overrides: Partial<PlayerSave>): PlayerSave {
  const next = { ...createDefaultSave(), ...overrides };
  return { ...next, highestCash: Math.max(next.highestCash, next.cash) };
}

describe('Yandex cloud-save write ordering', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test('serializes overlapping flushes so an older upload cannot finish after a newer save', async () => {
    const base = save({ updatedAt: 100, cash: 2500 });
    const firstUpload = deferred<void>();
    const setData = vi.fn()
      .mockImplementationOnce(() => firstUpload.promise)
      .mockResolvedValue(undefined);
    const getPlayer = vi.fn().mockResolvedValue({
      getData: vi.fn().mockResolvedValue({ [CLOUD_KEY]: { schemaVersion: 1, save: base } }),
      setData,
    });

    const storage = new MemoryStorage();
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(base));
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('document', {
      visibilityState: 'visible',
      addEventListener: vi.fn(),
    });
    vi.stubGlobal('window', {
      YaGames: { init: vi.fn().mockResolvedValue({ getPlayer }) },
      addEventListener: vi.fn(),
    });

    const yandex = await import('./yandex');
    await yandex.initYandexSdk();
    const cloudSave = await import('./cloudSave');
    await cloudSave.initializeCloudSave();

    const older = save({ updatedAt: 110, cash: 2800 });
    const newer = save({ updatedAt: 120, cash: 4300, reputationXp: 70 });

    cloudSave.scheduleCloudSave(older);
    const olderFlush = cloudSave.flushCloudSave(false);
    await vi.waitFor(() => expect(setData).toHaveBeenCalledTimes(1));

    cloudSave.scheduleCloudSave(newer);
    const newerFlush = cloudSave.flushCloudSave(true);
    await Promise.resolve();
    expect(setData).toHaveBeenCalledTimes(1);

    firstUpload.resolve(undefined);
    await olderFlush;
    await newerFlush;

    expect(setData).toHaveBeenCalledTimes(2);
    expect(setData.mock.calls[0]?.[0]).toEqual({ [CLOUD_KEY]: { schemaVersion: 1, save: older } });
    expect(setData.mock.calls[0]?.[1]).toBe(false);
    expect(setData.mock.calls[1]?.[0]).toEqual({ [CLOUD_KEY]: { schemaVersion: 1, save: newer } });
    expect(setData.mock.calls[1]?.[1]).toBe(true);
  });
});

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createDefaultSave, SAVE_STORAGE_KEY } from '../game/save';
import type { PlayerSave } from '../domain/types';

const CLOUD_KEY = 'auctionHunterSaveV1';
type Listener = (...args: any[]) => void;

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

interface HarnessOptions {
  local: PlayerSave;
  cloudValue?: unknown;
  getDataError?: Error;
  setData?: ReturnType<typeof vi.fn>;
}

async function installHarness(options: HarnessOptions) {
  const storage = new MemoryStorage();
  storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(options.local));
  const documentEvents = new Map<string, Listener>();
  const windowEvents = new Map<string, Listener>();
  const documentState: { visibilityState: 'visible' | 'hidden' } = { visibilityState: 'visible' };

  const getData = options.getDataError
    ? vi.fn().mockRejectedValue(options.getDataError)
    : vi.fn().mockResolvedValue({ [CLOUD_KEY]: options.cloudValue });
  const setData = options.setData ?? vi.fn().mockResolvedValue(undefined);
  const getPlayer = vi.fn().mockResolvedValue({ getData, setData });

  vi.stubGlobal('localStorage', storage);
  vi.stubGlobal('document', {
    get visibilityState() {
      return documentState.visibilityState;
    },
    addEventListener: vi.fn((event: string, listener: Listener) => documentEvents.set(event, listener)),
  });
  vi.stubGlobal('window', {
    YaGames: {
      init: vi.fn().mockResolvedValue({ getPlayer }),
    },
    addEventListener: vi.fn((event: string, listener: Listener) => windowEvents.set(event, listener)),
  });

  const yandex = await import('./yandex');
  await yandex.initYandexSdk();
  const cloudSave = await import('./cloudSave');
  return { storage, getData, setData, getPlayer, documentEvents, windowEvents, documentState, cloudSave };
}

function save(overrides: Partial<PlayerSave>): PlayerSave {
  const next = { ...createDefaultSave(), ...overrides };
  return { ...next, highestCash: Math.max(next.highestCash, next.cash) };
}

describe('Yandex cloud-save adapter', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test('restores a newer cloud save into local storage before game boot', async () => {
    const local = save({ updatedAt: 100, cash: 3200, reputationXp: 40 });
    const cloud = save({ updatedAt: 200, cash: 8900, reputationXp: 260, auctionsWon: 7 });
    const harness = await installHarness({
      local,
      cloudValue: { schemaVersion: 1, save: cloud },
    });

    const result = await harness.cloudSave.initializeCloudSave();

    expect(result.source).toBe('cloud');
    expect(result.save.cash).toBe(8900);
    expect(result.save.reputationXp).toBe(260);
    expect(JSON.parse(harness.storage.getItem(SAVE_STORAGE_KEY) ?? '{}')).toMatchObject({
      updatedAt: 200,
      cash: 8900,
      reputationXp: 260,
      auctionsWon: 7,
    });
    expect(harness.setData).not.toHaveBeenCalled();
  });

  test('uploads a newer local save with flush=true during startup reconciliation', async () => {
    const local = save({ updatedAt: 300, cash: 7200, reputationXp: 180, auctionsWon: 5 });
    const cloud = save({ updatedAt: 100, cash: 2700, reputationXp: 10 });
    const harness = await installHarness({
      local,
      cloudValue: { schemaVersion: 1, save: cloud },
    });

    const result = await harness.cloudSave.initializeCloudSave();

    expect(result.source).toBe('local');
    expect(harness.setData).toHaveBeenCalledOnce();
    expect(harness.setData).toHaveBeenCalledWith({
      [CLOUD_KEY]: { schemaVersion: 1, save: local },
    }, true);
  });

  test('treats malformed cloud data as absent and preserves local progress', async () => {
    const local = save({ updatedAt: 400, cash: 9100, reputationXp: 220 });
    const harness = await installHarness({ local, cloudValue: { schemaVersion: 999, save: { version: 99 } } });

    const result = await harness.cloudSave.initializeCloudSave();

    expect(result.source).toBe('local');
    expect(result.save.cash).toBe(9100);
    expect(harness.setData).toHaveBeenCalledOnce();
    expect(harness.setData.mock.calls[0]?.[1]).toBe(true);
  });

  test('contains startup cloud errors and keeps the local save playable', async () => {
    const local = save({ updatedAt: 500, cash: 6400, reputationXp: 150 });
    const failure = new Error('network down');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const harness = await installHarness({ local, getDataError: failure });

    const result = await harness.cloudSave.initializeCloudSave();

    expect(result.source).toBe('local');
    expect(result.save.cash).toBe(6400);
    expect(harness.setData).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith('[CloudSave] Initial sync failed; continuing with local progress.', failure);
  });

  test('coalesces queued writes and flushes only the newest save', async () => {
    vi.useFakeTimers();
    const base = save({ updatedAt: 600, cash: 5000 });
    const harness = await installHarness({
      local: base,
      cloudValue: { schemaVersion: 1, save: base },
    });
    await harness.cloudSave.initializeCloudSave();

    const older = save({ updatedAt: 610, cash: 5100 });
    const newer = save({ updatedAt: 620, cash: 5900, reputationXp: 90 });
    harness.cloudSave.scheduleCloudSave(older);
    harness.cloudSave.scheduleCloudSave(newer);

    expect(harness.setData).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(4000);

    expect(harness.setData).toHaveBeenCalledOnce();
    expect(harness.setData).toHaveBeenCalledWith({
      [CLOUD_KEY]: { schemaVersion: 1, save: newer },
    }, false);
  });

  test('requeues a failed write so a later flush can persist the same progress', async () => {
    const base = save({ updatedAt: 700, cash: 5000 });
    const failure = new Error('temporary upload failure');
    const setData = vi.fn()
      .mockRejectedValueOnce(failure)
      .mockResolvedValue(undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const harness = await installHarness({
      local: base,
      cloudValue: { schemaVersion: 1, save: base },
      setData,
    });
    await harness.cloudSave.initializeCloudSave();

    const next = save({ updatedAt: 710, cash: 8100, reputationXp: 210 });
    harness.cloudSave.scheduleCloudSave(next);
    await harness.cloudSave.flushCloudSave(false);
    await harness.cloudSave.flushCloudSave(true);

    expect(setData).toHaveBeenCalledTimes(2);
    expect(setData.mock.calls[0]?.[0]).toEqual({ [CLOUD_KEY]: { schemaVersion: 1, save: next } });
    expect(setData.mock.calls[0]?.[1]).toBe(false);
    expect(setData.mock.calls[1]?.[0]).toEqual({ [CLOUD_KEY]: { schemaVersion: 1, save: next } });
    expect(setData.mock.calls[1]?.[1]).toBe(true);
    expect(warn).toHaveBeenCalledWith('[CloudSave] Upload failed; progress remains queued locally.', failure);
  });
});

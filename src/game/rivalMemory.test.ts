import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDefaultSave, SAVE_STORAGE_KEY } from './save';
import { GameStore } from './store';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

describe('GameStore rival memory', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    storage = new MemoryStorage();
    vi.stubGlobal('localStorage', storage);
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(createDefaultSave()));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('records one encounter and player win against every participating rival', () => {
    const store = new GameStore();
    store.recordRivalAuction(['npc-0', 'npc-1', 'npc-1'], 'player-win');

    expect(store.snapshot.rivalEncounters).toEqual({ 'npc-0': 1, 'npc-1': 1 });
    expect(store.snapshot.rivalPlayerWins).toEqual({ 'npc-0': 1, 'npc-1': 1 });
    expect(store.snapshot.rivalWins).toEqual({});
  });

  it('credits a pass only to the rival who actually leads the auction', () => {
    const store = new GameStore();
    store.recordRivalAuction(['npc-2', 'npc-4'], 'player-pass', 'npc-4');

    expect(store.snapshot.rivalEncounters).toEqual({ 'npc-2': 1, 'npc-4': 1 });
    expect(store.snapshot.rivalPlayerWins).toEqual({});
    expect(store.snapshot.rivalWins).toEqual({ 'npc-4': 1 });
  });
});

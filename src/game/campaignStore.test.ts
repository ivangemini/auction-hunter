import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDefaultSave, SAVE_STORAGE_KEY } from './save';
import { CampaignStore } from './campaignStore';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

describe('CampaignStore', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    storage = new MemoryStorage();
    vi.stubGlobal('localStorage', storage);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('records auction baselines when a mission starts', () => {
    const save = createDefaultSave();
    save.auctionsPlayed = 12;
    save.auctionsWon = 5;
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));

    const store = new CampaignStore();
    expect(store.startMission('first-day-floor')).toBe(true);
    expect(store.progress.activeMissionId).toBe('first-day-floor');
    expect(store.progress.missionBaselineAuctionsPlayed['first-day-floor']).toBe(12);
    expect(store.progress.missionBaselineAuctionsWon['first-day-floor']).toBe(5);
  });

  it('pays mission rewards and evidence only once', () => {
    const save = createDefaultSave();
    save.campaign.completedMissionIds = ['first-day-floor', 'victor-test'];
    save.campaign.activeMissionId = 'black-seal';
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));

    const store = new CampaignStore();
    expect(store.completeMission('black-seal')).toBe(true);
    const after = store.snapshot;
    expect(after.cash).toBe(2800);
    expect(after.reputationXp).toBe(25);
    expect(after.campaign.evidenceIds).toContain('veyr-black-seal');
    expect(store.completeMission('black-seal')).toBe(false);
    expect(store.snapshot.cash).toBe(2800);
    expect(store.snapshot.reputationXp).toBe(25);
  });

  it('persists branch choices and bounded relationship consequences', () => {
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(createDefaultSave()));
    const store = new CampaignStore();
    store.chooseBranch('show-victor-black-seal', 'npc-0', { trust: 140, rivalry: 5 });
    store.chooseBranch('show-victor-black-seal', 'npc-0', { trust: 10 });

    expect(store.progress.branchChoiceIds).toEqual(['show-victor-black-seal']);
    expect(store.progress.relationshipTrust['npc-0']).toBe(100);
    expect(store.progress.relationshipRivalry['npc-0']).toBe(5);
  });
});

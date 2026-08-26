import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerAnalyticsSink, type AnalyticsEnvelope } from '../analytics';
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

  it('charges a paid branch exactly once and refuses unaffordable choices', () => {
    const save = createDefaultSave();
    save.cash = 1500;
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));
    const store = new CampaignStore();

    expect(store.payBranchChoice('mira-paid-cash', 1200, 'npc-1', { trust: 6, debt: -4 })).toBe(true);
    expect(store.snapshot.cash).toBe(300);
    expect(store.progress.relationshipTrust['npc-1']).toBe(6);
    expect(store.payBranchChoice('mira-paid-cash', 1200, 'npc-1', { trust: 6 })).toBe(false);
    expect(store.snapshot.cash).toBe(300);
    expect(store.payBranchChoice('too-expensive', 500)).toBe(false);
    expect(store.progress.branchChoiceIds).not.toContain('too-expensive');
  });

  it('can reset only linked-budget decisions without erasing story choices', () => {
    const save = createDefaultSave();
    save.campaign.branchChoiceIds = [
      'linked-buy:decorative-decoy',
      'linked-buy:estate-ledger-box',
      'show-victor-black-seal',
    ];
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));
    const store = new CampaignStore();

    store.resetBranchChoices('linked-buy:');
    expect(store.progress.branchChoiceIds).toEqual(['show-victor-black-seal']);
  });

  it('only resolves the campaign from the active finale mission, marks Chapter V complete and emits completion telemetry once', () => {
    const save = createDefaultSave();
    save.cash = 7000;
    save.reputationXp = 900;
    save.auctionsPlayed = 41;
    save.auctionsWon = 19;
    save.campaign.started = true;
    save.campaign.completedMissionIds = ['closed-circle-ledger-room', 'lost-collection-route', 'lost-collection-prep'];
    save.campaign.activeMissionId = 'lost-collection-finale';
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));
    const store = new CampaignStore();
    const events: AnalyticsEnvelope[] = [];
    const unregister = registerAnalyticsSink((event) => events.push(event));

    const resolved = store.finishCampaign('shared-truth', ['veyr-master-ledger', 'veyr-cipher-cabinet']);
    const duplicate = store.finishCampaign('dealer-king', ['veyr-portrait-case', 'veyr-chronometer']);
    unregister();

    expect(resolved).toBe(true);
    const after = store.snapshot;
    expect(after.campaign.completed).toBe(true);
    expect(after.campaign.epilogueId).toBe('shared-truth');
    expect(after.campaign.completedMissionIds).toContain('lost-collection-finale');
    expect(after.campaign.activeMissionId).toBeNull();
    expect(after.campaign.branchChoiceIds).toContain('finale-buy:veyr-master-ledger');
    expect(after.cash).toBe(12000);
    expect(after.reputationXp).toBe(1200);
    expect(duplicate).toBe(false);

    const completionEvents = events.filter((event) => event.eventName === 'campaign_completed') as AnalyticsEnvelope<'campaign_completed'>[];
    expect(completionEvents).toHaveLength(1);
    expect(completionEvents[0]?.payload).toMatchObject({
      epilogueId: 'shared-truth',
      finaleLotsRecovered: 2,
      auctionsPlayed: 41,
      auctionsWon: 19,
    });
  });

  it('rejects direct finale resolution when Chapter V preparation is not active', () => {
    const save = createDefaultSave();
    save.campaign.completedMissionIds = ['closed-circle-ledger-room'];
    save.campaign.activeMissionId = null;
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));
    const store = new CampaignStore();
    expect(store.finishCampaign('unfinished-ledger', ['veyr-master-ledger'])).toBe(false);
    expect(store.snapshot.campaign.completed).toBe(false);
  });
});

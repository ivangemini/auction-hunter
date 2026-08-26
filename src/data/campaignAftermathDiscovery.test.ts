import { describe, expect, it } from 'vitest';
import { CAMPAIGN_BREADTH_FIVE_ITEMS } from './campaignBreadthFive';
import {
  CAMPAIGN_AFTERMATH_DISCOVERY_CHAINS,
  registerCampaignAftermathDiscovery,
} from './campaignAftermathDiscovery';
import { DISCOVERY_CHAIN_BY_ID, DISCOVERY_CHAINS } from './discoveryChains';

const EXPECTED_IDS = ['ledger-clearance-control', 'ledger-sealed-dispatch'];

describe('P9 campaign aftermath discovery', () => {
  it('ships two optional post-campaign Black Ledger cases', () => {
    expect(CAMPAIGN_AFTERMATH_DISCOVERY_CHAINS.map((chain) => chain.id)).toEqual(EXPECTED_IDS);
    for (const id of EXPECTED_IDS) {
      expect(DISCOVERY_CHAINS.some((chain) => chain.id === id), id).toBe(true);
      expect(DISCOVERY_CHAIN_BY_ID.get(id)?.id, `${id} lookup`).toBe(id);
    }
  });

  it('uses every fifth-wave identity as meaningful investigation evidence exactly once', () => {
    const primaryIds = CAMPAIGN_AFTERMATH_DISCOVERY_CHAINS.flatMap((chain) => chain.steps.map((step) => step.itemId));
    expect(new Set(primaryIds).size).toBe(primaryIds.length);
    expect(new Set(primaryIds)).toEqual(new Set(CAMPAIGN_BREADTH_FIVE_ITEMS.map((item) => item.id)));
  });

  it('keeps aftermath cases multi-auction, bilingual and endgame-rewarded', () => {
    for (const chain of CAMPAIGN_AFTERMATH_DISCOVERY_CHAINS) {
      expect(chain.steps).toHaveLength(3);
      expect(chain.title.ru.trim()).not.toBe('');
      expect(chain.title.en.trim()).not.toBe('');
      expect(chain.premise.ru.trim()).not.toBe('');
      expect(chain.premise.en.trim()).not.toBe('');
      expect(chain.rewardCash).toBeGreaterThanOrEqual(6000);
      expect(chain.rewardReputationXp).toBeGreaterThanOrEqual(120);
      for (const step of chain.steps) {
        expect(step.clue.ru.trim()).not.toBe('');
        expect(step.clue.en.trim()).not.toBe('');
      }
    }
  });

  it('is idempotent under repeated registration', () => {
    const count = DISCOVERY_CHAINS.length;
    registerCampaignAftermathDiscovery();
    expect(DISCOVERY_CHAINS).toHaveLength(count);
    for (const id of EXPECTED_IDS) expect(DISCOVERY_CHAIN_BY_ID.has(id), id).toBe(true);
  });
});

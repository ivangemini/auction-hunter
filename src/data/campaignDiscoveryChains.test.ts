import { describe, expect, it } from 'vitest';
import { CAMPAIGN_DISCOVERY_CHAINS } from './campaignDiscoveryChains';
import { DISCOVERY_CHAINS } from './discoveryChains';

const EXPECTED_IDS = [
  'ledger-first-mark',
  'ledger-estate-negative',
  'ledger-dealer-wire',
  'ledger-closed-catalogue',
  'ledger-river-expedition',
];

describe('P9 chapter-linked discovery cases', () => {
  it('ships one optional Black Ledger case per campaign act', () => {
    expect(CAMPAIGN_DISCOVERY_CHAINS.map((chain) => chain.id)).toEqual(EXPECTED_IDS);
    for (const id of EXPECTED_IDS) expect(DISCOVERY_CHAINS.some((chain) => chain.id === id)).toBe(true);
  });

  it('keeps every case multi-auction, bilingual and meaningfully rewarded', () => {
    for (const chain of CAMPAIGN_DISCOVERY_CHAINS) {
      expect(chain.steps.length).toBeGreaterThanOrEqual(3);
      expect(chain.title.ru.trim()).not.toBe('');
      expect(chain.title.en.trim()).not.toBe('');
      expect(chain.premise.ru.trim()).not.toBe('');
      expect(chain.premise.en.trim()).not.toBe('');
      expect(chain.rewardCash).toBeGreaterThanOrEqual(2000);
      expect(chain.rewardReputationXp).toBeGreaterThanOrEqual(50);
    }
  });

  it('does not reuse primary items across the five campaign cases', () => {
    const primaryIds = CAMPAIGN_DISCOVERY_CHAINS.flatMap((chain) => chain.steps.map((step) => step.itemId));
    expect(new Set(primaryIds).size).toBe(primaryIds.length);
  });
});

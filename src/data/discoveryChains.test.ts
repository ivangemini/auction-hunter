import { describe, expect, it } from 'vitest';
import { ITEM_BY_ID } from './catalog';
import { DISCOVERY_CHAINS } from './discoveryChains';

describe('legendary discovery chain content', () => {
  it('uses valid catalog identities and meaningful multi-auction length', () => {
    expect(DISCOVERY_CHAINS.length).toBeGreaterThanOrEqual(3);
    for (const chain of DISCOVERY_CHAINS) {
      expect(chain.steps.length).toBeGreaterThanOrEqual(4);
      expect(new Set(chain.steps.map((step) => step.itemId)).size).toBe(chain.steps.length);
      for (const step of chain.steps) expect(ITEM_BY_ID.has(step.itemId)).toBe(true);
    }
  });

  it('gives every completed dossier a meaningful cash and reputation payoff', () => {
    for (const chain of DISCOVERY_CHAINS) {
      expect(chain.rewardCash).toBeGreaterThanOrEqual(3000);
      expect(chain.rewardReputationXp).toBeGreaterThanOrEqual(75);
    }
  });
});

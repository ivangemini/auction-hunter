import { describe, expect, it } from 'vitest';
import { CAMPAIGN_MISSIONS } from './campaign';
import { ITEMS } from './catalog';
import { COLLECTION_SETS } from './collections';
import { DISCOVERY_CHAINS } from './discoveryChains';
import { registerAllContent } from './registerContent';

describe('shared production/test content bootstrap', () => {
  it('is idempotent and preserves the full P9 production content graph', () => {
    const before = {
      items: ITEMS.length,
      missions: CAMPAIGN_MISSIONS.length,
      sets: COLLECTION_SETS.length,
      discoveryChains: DISCOVERY_CHAINS.length,
    };

    registerAllContent();
    registerAllContent();

    expect({
      items: ITEMS.length,
      missions: CAMPAIGN_MISSIONS.length,
      sets: COLLECTION_SETS.length,
      discoveryChains: DISCOVERY_CHAINS.length,
    }).toEqual(before);

    expect(before.items).toBe(72);
    expect(before.missions).toBe(28);
    expect(before.sets).toBe(36);
    expect(before.discoveryChains).toBeGreaterThanOrEqual(14);
  });
});
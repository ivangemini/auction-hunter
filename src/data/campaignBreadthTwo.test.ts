import { beforeAll, describe, expect, it } from 'vitest';
import { ITEM_BY_ID } from './catalog';
import { ALL_LOTS } from './catalogBreadth';
import { COLLECTION_SETS } from './collections';
import {
  CAMPAIGN_BREADTH_TWO_ITEMS,
  CAMPAIGN_BREADTH_TWO_ROUTES,
  CAMPAIGN_BREADTH_TWO_SETS,
  registerCampaignBreadthTwo,
} from './campaignBreadthTwo';

beforeAll(() => registerCampaignBreadthTwo());

describe('P9 second campaign breadth pack', () => {
  it('adds six stable item identities', () => {
    expect(CAMPAIGN_BREADTH_TWO_ITEMS).toHaveLength(6);
    for (const item of CAMPAIGN_BREADTH_TWO_ITEMS) expect(ITEM_BY_ID.get(item.id)).toEqual(item);
  });

  it('routes every item into at least two existing auction templates', () => {
    for (const [itemId, lotIds] of Object.entries(CAMPAIGN_BREADTH_TWO_ROUTES)) {
      expect(lotIds.length).toBeGreaterThanOrEqual(2);
      for (const lotId of lotIds) expect(ALL_LOTS.find((lot) => lot.id === lotId)?.itemPool).toContain(itemId);
    }
  });

  it('adds two additive collection sets without mutating old set IDs', () => {
    expect(CAMPAIGN_BREADTH_TWO_SETS).toHaveLength(2);
    for (const set of CAMPAIGN_BREADTH_TWO_SETS) expect(COLLECTION_SETS.some((candidate) => candidate.id === set.id)).toBe(true);
  });

  it('is safe to register repeatedly', () => {
    const itemCount = ITEM_BY_ID.size;
    const setCount = COLLECTION_SETS.length;
    registerCampaignBreadthTwo();
    expect(ITEM_BY_ID.size).toBe(itemCount);
    expect(COLLECTION_SETS.length).toBe(setCount);
  });
});

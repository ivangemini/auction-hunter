import { describe, expect, it } from 'vitest';
import { ITEM_ART_IDS } from './artManifest';
import {
  CAMPAIGN_BREADTH_FOUR_ITEMS,
  CAMPAIGN_BREADTH_FOUR_ROUTES,
  CAMPAIGN_BREADTH_FOUR_SETS,
  registerCampaignBreadthFour,
} from './campaignBreadthFour';
import { ITEM_BY_ID, ITEMS } from './catalog';
import { ALL_LOTS } from './catalogBreadth';
import { COLLECTION_SETS } from './collections';

describe('P9 fourth campaign catalog batch', () => {
  it('ships six bilingual identities with direct art', () => {
    expect(CAMPAIGN_BREADTH_FOUR_ITEMS).toHaveLength(6);
    for (const item of CAMPAIGN_BREADTH_FOUR_ITEMS) {
      expect(item.name.ru.trim()).not.toBe('');
      expect(item.name.en.trim()).not.toBe('');
      expect(item.baseValue).toBeGreaterThan(0);
      expect(ITEM_BY_ID.get(item.id)).toEqual(item);
      expect(ITEM_ART_IDS.includes(item.id as (typeof ITEM_ART_IDS)[number]), `${item.id} direct art`).toBe(true);
    }
  });

  it('routes every identity through at least two truthful normal-auction lots', () => {
    for (const item of CAMPAIGN_BREADTH_FOUR_ITEMS) {
      const routes = CAMPAIGN_BREADTH_FOUR_ROUTES[item.id] ?? [];
      expect(routes.length, item.id).toBeGreaterThanOrEqual(2);
      for (const lotId of routes) {
        const lot = ALL_LOTS.find((candidate) => candidate.id === lotId);
        expect(lot, lotId).toBeDefined();
        expect(lot?.itemPool.includes(item.id), `${lotId}:${item.id}`).toBe(true);
        expect(lot?.clues.some((clue) => 'itemIds' in clue.signal
          ? clue.signal.itemIds.includes(item.id)
          : clue.signal.categories.includes(item.category)), `${lotId}:${item.id} clue`).toBe(true);
      }
    }
  });

  it('adds two rewarding collection goals covering all six additions', () => {
    const setIds = new Set(CAMPAIGN_BREADTH_FOUR_SETS.map((set) => set.id));
    const installed = COLLECTION_SETS.filter((set) => setIds.has(set.id));
    expect(installed).toHaveLength(2);
    const covered = new Set(installed.flatMap((set) => set.itemIds));
    for (const item of CAMPAIGN_BREADTH_FOUR_ITEMS) expect(covered.has(item.id), item.id).toBe(true);
  });

  it('is idempotent under repeated bootstrap registration', () => {
    const itemCount = ITEMS.length;
    const setCount = COLLECTION_SETS.length;
    registerCampaignBreadthFour();
    expect(ITEMS).toHaveLength(itemCount);
    expect(COLLECTION_SETS).toHaveLength(setCount);
  });
});
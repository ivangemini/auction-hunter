import { describe, expect, it } from 'vitest';
import { ITEM_ART_IDS } from './artManifest';
import {
  CAMPAIGN_BREADTH_ITEMS,
  CAMPAIGN_BREADTH_ROUTES,
  CAMPAIGN_BREADTH_SETS,
  registerCampaignBreadth,
} from './campaignBreadth';
import { ITEM_BY_ID, ITEMS } from './catalog';
import { ALL_LOTS } from './catalogBreadth';
import { COLLECTION_SETS } from './collections';

describe('P9 campaign-driven catalog breadth', () => {
  it('installs six stable bilingual story-adjacent finds with direct art', () => {
    expect(CAMPAIGN_BREADTH_ITEMS).toHaveLength(6);
    expect(new Set(CAMPAIGN_BREADTH_ITEMS.map((item) => item.id)).size).toBe(6);
    for (const item of CAMPAIGN_BREADTH_ITEMS) {
      expect(item.name.ru.trim(), `${item.id} RU`).not.toBe('');
      expect(item.name.en.trim(), `${item.id} EN`).not.toBe('');
      expect(item.baseValue, item.id).toBeGreaterThan(0);
      expect(ITEM_BY_ID.get(item.id), item.id).toEqual(item);
      expect(ITEM_ART_IDS.includes(item.id as (typeof ITEM_ART_IDS)[number]), `${item.id} art`).toBe(true);
    }
  });

  it('keeps every routed campaign find truthful to visible lot clues', () => {
    for (const item of CAMPAIGN_BREADTH_ITEMS) {
      const routes = CAMPAIGN_BREADTH_ROUTES[item.id] ?? [];
      expect(routes.length, item.id).toBeGreaterThanOrEqual(2);
      for (const lotId of routes) {
        const lot = ALL_LOTS.find((candidate) => candidate.id === lotId);
        expect(lot, lotId).toBeDefined();
        expect(lot?.itemPool.includes(item.id), `${lotId}:${item.id}`).toBe(true);
        const truthful = lot?.clues.some((clue) => {
          if ('itemIds' in clue.signal) return clue.signal.itemIds.includes(item.id);
          return clue.signal.categories.includes(item.category);
        });
        expect(truthful, `${lotId}:${item.id} truthful clue`).toBe(true);
      }
    }
  });

  it('adds two non-destructive collection goals for the new finds', () => {
    const ids = new Set(CAMPAIGN_BREADTH_SETS.map((set) => set.id));
    const installed = COLLECTION_SETS.filter((set) => ids.has(set.id));
    expect(installed).toHaveLength(2);
    const covered = new Set(installed.flatMap((set) => set.itemIds));
    for (const item of CAMPAIGN_BREADTH_ITEMS) expect(covered.has(item.id), item.id).toBe(true);
  });

  it('remains idempotent when bootstrap registration repeats', () => {
    const beforeItems = ITEMS.length;
    const beforeSets = COLLECTION_SETS.length;
    const beforePoolSizes = Object.fromEntries(
      Object.entries(CAMPAIGN_BREADTH_ROUTES).flatMap(([itemId, lotIds]) =>
        lotIds.map((lotId) => [`${itemId}:${lotId}`, ALL_LOTS.find((lot) => lot.id === lotId)?.itemPool.length ?? -1]),
      ),
    );

    registerCampaignBreadth();

    expect(ITEMS).toHaveLength(beforeItems);
    expect(COLLECTION_SETS).toHaveLength(beforeSets);
    for (const [itemId, lotIds] of Object.entries(CAMPAIGN_BREADTH_ROUTES)) {
      for (const lotId of lotIds) {
        expect(ALL_LOTS.find((lot) => lot.id === lotId)?.itemPool.length ?? -1).toBe(beforePoolSizes[`${itemId}:${lotId}`]);
      }
    }
  });
});

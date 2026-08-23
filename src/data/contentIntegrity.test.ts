import { describe, expect, it } from 'vitest';
import { ITEMS, ITEM_BY_ID, LOTS } from './catalog';
import { COLLECTION_SETS } from './collections';
import { AUCTION_TIERS } from './tiers';

function expectUnique(values: readonly string[], label: string): void {
  expect(new Set(values).size, `${label} must be unique`).toBe(values.length);
}

function expectLocalizedText(value: { ru: string; en: string }, label: string): void {
  expect(value.ru.trim(), `${label} RU copy must not be empty`).not.toBe('');
  expect(value.en.trim(), `${label} EN copy must not be empty`).not.toBe('');
}

describe('content integrity', () => {
  it('keeps stable catalog identifiers unique and item definitions valid', () => {
    expectUnique(ITEMS.map((item) => item.id), 'item IDs');
    expectUnique(LOTS.map((lot) => lot.id), 'lot IDs');
    expect(ITEM_BY_ID.size).toBe(ITEMS.length);

    for (const item of ITEMS) {
      expect(item.id.trim()).not.toBe('');
      expect(item.baseValue).toBeGreaterThan(0);
      expectLocalizedText(item.name, `item ${item.id}`);
    }
  });

  it('keeps lot pools valid and large enough for configured draws', () => {
    for (const lot of LOTS) {
      expect(lot.reservePrice, `${lot.id} reserve`).toBeGreaterThan(0);
      expect(lot.bidIncrement, `${lot.id} bid increment`).toBeGreaterThan(0);
      expect(lot.itemCount, `${lot.id} item count`).toBeGreaterThan(0);
      expectUnique(lot.itemPool, `${lot.id} item pool`);
      expect(lot.itemPool.length, `${lot.id} pool size`).toBeGreaterThanOrEqual(lot.itemCount);
      expectLocalizedText(lot.name, `lot ${lot.id} name`);
      expectLocalizedText(lot.location, `lot ${lot.id} location`);

      for (const clue of lot.clues) expectLocalizedText(clue, `lot ${lot.id} clue`);
      for (const itemId of lot.itemPool) {
        expect(ITEM_BY_ID.has(itemId), `${lot.id} references missing item ${itemId}`).toBe(true);
      }
    }
  });

  it('keeps progression tiers and collection sets linked to existing content', () => {
    const lotIds = new Set(LOTS.map((lot) => lot.id));
    expectUnique(AUCTION_TIERS.map((tier) => tier.id), 'tier IDs');
    expectUnique(COLLECTION_SETS.map((set) => set.id), 'collection set IDs');

    for (const tier of AUCTION_TIERS) {
      expect(tier.lotIds.length, `${tier.id} must contain a lot`).toBeGreaterThan(0);
      expectUnique(tier.lotIds, `${tier.id} lot IDs`);
      expectLocalizedText(tier.name, `tier ${tier.id}`);
      for (const lotId of tier.lotIds) {
        expect(lotIds.has(lotId), `${tier.id} references missing lot ${lotId}`).toBe(true);
      }
    }

    for (const set of COLLECTION_SETS) {
      expect(set.reward, `${set.id} reward`).toBeGreaterThan(0);
      expect(set.itemIds.length, `${set.id} must contain items`).toBeGreaterThan(0);
      expectUnique(set.itemIds, `${set.id} item IDs`);
      expectLocalizedText(set.name, `collection set ${set.id}`);
      for (const itemId of set.itemIds) {
        expect(ITEM_BY_ID.has(itemId), `${set.id} references missing item ${itemId}`).toBe(true);
      }
    }
  });
});

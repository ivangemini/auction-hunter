import { describe, expect, it } from 'vitest';
import { COLLECTION_SETS, collectionSetProgress, uniqueCollectionCount } from './collections';

describe('collection rules', () => {
  it('uses unique owned items for set progress', () => {
    const set = COLLECTION_SETS[0];
    if (!set) throw new Error('Collection set fixture missing');

    const owned = [set.itemIds[0] ?? '', set.itemIds[0] ?? '', set.itemIds[1] ?? ''];
    const progress = collectionSetProgress(owned, set);

    expect(progress.collected).toBe(2);
    expect(progress.total).toBe(set.itemIds.length);
    expect(progress.complete).toBe(false);
    expect(uniqueCollectionCount(owned)).toBe(2);
  });

  it('completes a set only after every required unique item is owned', () => {
    const set = COLLECTION_SETS[1];
    if (!set) throw new Error('Collection set fixture missing');

    const progress = collectionSetProgress([...set.itemIds, set.itemIds[0] ?? ''], set);
    expect(progress.complete).toBe(true);
    expect(progress.collected).toBe(set.itemIds.length);
  });
});

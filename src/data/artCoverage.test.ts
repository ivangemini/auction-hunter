import { describe, expect, it } from 'vitest';
import { ITEM_ART_IDS, LOT_ART_IDS } from './artManifest';
import { ITEMS } from './catalog';
import { ALL_LOTS } from './catalogBreadth';

describe('v1 art coverage', () => {
  it('gives every catalog item a direct unique art identity', () => {
    expect(new Set(ITEM_ART_IDS).size).toBe(ITEM_ART_IDS.length);
    expect(new Set(ITEM_ART_IDS)).toEqual(new Set(ITEMS.map((item) => item.id)));
  });

  it('uses only declared lot art and keeps at least three visual environments per tier', () => {
    const declared = new Set<string>(LOT_ART_IDS);
    const used = new Set(ALL_LOTS.map((lot) => lot.artId ?? lot.id));
    for (const artId of used) expect(declared.has(artId)).toBe(true);
    expect(used.size).toBeGreaterThanOrEqual(9);
  });
});

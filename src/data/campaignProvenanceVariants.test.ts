import { describe, expect, it } from 'vitest';
import { ITEM_BY_ID } from './catalog';
import {
  CAMPAIGN_PROVENANCE_VARIANTS,
  campaignProvenanceBonusMultiplier,
  campaignProvenanceVariantFor,
} from './campaignProvenanceVariants';
import { ITEM_TRAITS, rollItemTraits } from './itemTraits';

describe('P9 story-critical provenance variants', () => {
  it('ships at least ten authored item-specific variants', () => {
    expect(CAMPAIGN_PROVENANCE_VARIANTS.length).toBeGreaterThanOrEqual(10);
    expect(new Set(CAMPAIGN_PROVENANCE_VARIANTS.map((variant) => variant.id)).size).toBe(CAMPAIGN_PROVENANCE_VARIANTS.length);
  });

  it('references real catalog identities and existing concrete-copy traits', () => {
    for (const variant of CAMPAIGN_PROVENANCE_VARIANTS) {
      expect(ITEM_BY_ID.has(variant.itemId), variant.itemId).toBe(true);
      expect(variant.name.ru.trim()).not.toBe('');
      expect(variant.name.en.trim()).not.toBe('');
      expect(variant.description.ru.trim()).not.toBe('');
      expect(variant.description.en.trim()).not.toBe('');
      expect(variant.requiredTraits.length).toBeGreaterThan(0);
      for (const traitId of variant.requiredTraits) expect(ITEM_TRAITS[traitId], `${variant.id}:${traitId}`).toBeTruthy();
      expect(variant.bonusMultiplier).toBeGreaterThan(1);
      expect(variant.bonusMultiplier).toBeLessThanOrEqual(1.12);
    }
  });

  it('keeps every authored required trait reachable through the concrete-copy roller', () => {
    for (const variant of CAMPAIGN_PROVENANCE_VARIANTS) {
      const item = ITEM_BY_ID.get(variant.itemId);
      if (!item) throw new Error(`Missing provenance item ${variant.itemId}`);

      for (const requiredTrait of variant.requiredTraits) {
        let reachable = false;
        for (let index = 0; index < 100 && !reachable; index += 1) {
          const picker = index / 100;
          const values = [0, picker, 1, 1];
          let cursor = 0;
          const rolled = rollItemTraits(item, () => values[cursor++] ?? 1);
          reachable = rolled.includes(requiredTrait);
        }
        expect(reachable, `${variant.id}:${requiredTrait}`).toBe(true);
      }
    }
  });

  it('only resolves after the required trait is actually present on that item copy', () => {
    expect(campaignProvenanceVariantFor('brass-cipher-wheel', [])).toBeNull();
    expect(campaignProvenanceVariantFor('brass-cipher-wheel', ['rare-variant'])?.id).toBe('c17-cipher-wheel');
    expect(campaignProvenanceVariantFor('field-recorder', ['rare-variant'])).toBeNull();
    expect(campaignProvenanceBonusMultiplier('lacquer-document-case', ['documented-history'])).toBeCloseTo(1.09);
  });
});

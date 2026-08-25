import { describe, expect, it } from 'vitest';
import {
  COLLECTION_EXPERTISE_BONUS_CAP,
  COLLECTION_EXPERTISE_RESALE_RATE_CAP,
  collectionExpertiseBonus,
  collectionExpertiseResaleRate,
} from './collections';

describe('collection expertise perks', () => {
  it('only activates perks from already claimed sets', () => {
    expect(collectionExpertiseBonus([], 'electronics')).toBe(0);
    expect(collectionExpertiseBonus(['retro-tech'], 'electronics')).toBeCloseTo(0.03);
    expect(collectionExpertiseBonus(['retro-tech'], 'watches')).toBe(0);
  });

  it('stacks overlapping thematic expertise with a bounded cap', () => {
    expect(collectionExpertiseBonus(
      ['retro-tech', 'field-tech', 'street-nostalgia'],
      'electronics',
    )).toBeCloseTo(0.07);

    expect(collectionExpertiseBonus(
      ['clockwork', 'travel-case', 'patron-vault'],
      'watches',
    )).toBeCloseTo(COLLECTION_EXPERTISE_BONUS_CAP);
  });

  it('caps the final quick-sale rate so Buyer Market remains the premium channel', () => {
    expect(collectionExpertiseResaleRate(
      0.8,
      ['clockwork', 'travel-case', 'patron-vault'],
      'watches',
    )).toBeCloseTo(COLLECTION_EXPERTISE_RESALE_RATE_CAP);

    expect(collectionExpertiseResaleRate(0.65, ['toy-vault'], 'toys')).toBeCloseTo(0.69);
  });

  it('ignores unknown claimed set ids', () => {
    expect(collectionExpertiseBonus(['missing-set'], 'art')).toBe(0);
  });
});

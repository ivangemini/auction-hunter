import { describe, expect, it } from 'vitest';
import { BIDDER_PROFILES } from './balance';
import {
  createAuctionOpponents,
  selectAuctionBidderProfiles,
  type RandomSource,
} from '../domain/auction';
import type { ItemDefinition, LotTemplate, RevealedItem } from '../domain/types';

const electronics: ItemDefinition = {
  id: 'rival-test-electronics',
  name: { ru: 'Техника', en: 'Electronics' },
  category: 'electronics',
  rarity: 'common',
  baseValue: 1000,
};

const watch: ItemDefinition = {
  id: 'rival-test-watch',
  name: { ru: 'Часы', en: 'Watch' },
  category: 'watches',
  rarity: 'rare',
  baseValue: 1200,
};

const items: RevealedItem[] = [
  { definition: electronics, condition: 0.8, appraisedValue: 900, restored: false, traitIds: [] },
  { definition: watch, condition: 0.8, appraisedValue: 1100, restored: false, traitIds: [] },
];

const lot: LotTemplate = {
  id: 'rival-test-lot',
  name: { ru: 'Тест', en: 'Test' },
  location: { ru: 'Тест', en: 'Test' },
  clues: [],
  reservePrice: 500,
  bidIncrement: 100,
  itemCount: 2,
  itemPool: [electronics.id, watch.id],
};

function sequence(values: readonly number[]): RandomSource {
  let index = 0;
  return () => values[index++] ?? values.at(-1) ?? 0;
}

function matchesCurrentLot(profileId: string): boolean {
  const profile = BIDDER_PROFILES.find((candidate) => candidate.id === profileId);
  return Boolean(profile?.specialtyCategories?.some((category) => category === 'electronics' || category === 'watches'));
}

describe('rival breadth', () => {
  it('keeps eight stable bilingual profiles with authored weaknesses and distinct ids', () => {
    expect(BIDDER_PROFILES).toHaveLength(8);
    expect(new Set(BIDDER_PROFILES.map((profile) => profile.id)).size).toBe(8);
    for (const profile of BIDDER_PROFILES) {
      expect(profile.name.ru.length).toBeGreaterThan(0);
      expect(profile.name.en.length).toBeGreaterThan(0);
      expect(profile.trait?.ru.length ?? 0).toBeGreaterThan(0);
      expect(profile.trait?.en.length ?? 0).toBeGreaterThan(0);
      expect(profile.weakness?.ru.length ?? 0).toBeGreaterThan(0);
      expect(profile.weakness?.en.length ?? 0).toBeGreaterThan(0);
      expect(profile.specialtyCategories?.length ?? 0).toBeGreaterThanOrEqual(2);
      expect(profile.hiddenValueFactor.max).toBeGreaterThanOrEqual(profile.hiddenValueFactor.min);
    }
  });

  it('selects three unique rivals while reserving specialist pressure for the current lot', () => {
    const selected = selectAuctionBidderProfiles(items, BIDDER_PROFILES, sequence([0, 0, 0]));

    expect(selected).toHaveLength(3);
    expect(new Set(selected.map((profile) => profile.id)).size).toBe(3);
    expect(selected.filter((profile) => matchesCurrentLot(profile.id)).length).toBeGreaterThanOrEqual(2);
  });

  it('changes the rival trio when the random draw changes', () => {
    const lowDraw = selectAuctionBidderProfiles(items, BIDDER_PROFILES, sequence([0, 0, 0]));
    const highDraw = selectAuctionBidderProfiles(items, BIDDER_PROFILES, sequence([0.999, 0.999, 0.999]));

    expect(lowDraw.map((profile) => profile.id)).not.toEqual(highDraw.map((profile) => profile.id));
  });

  it('creates exactly three finite bidding budgets from the expanded roster', () => {
    const opponents = createAuctionOpponents(
      lot,
      items,
      BIDDER_PROFILES,
      sequence([0.1, 0.8, 0.4, 0.3, 0.6, 0.9]),
    );

    expect(opponents).toHaveLength(3);
    expect(new Set(opponents.map((opponent) => opponent.id)).size).toBe(3);
    expect(opponents.every((opponent) => Number.isFinite(opponent.maxBid) && opponent.maxBid >= lot.reservePrice)).toBe(true);
  });
});

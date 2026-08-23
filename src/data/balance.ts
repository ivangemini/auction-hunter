import type { BidderProfile, NumericRange } from '../domain/auction';

export const ITEM_CONDITION_RANGE: NumericRange = {
  min: 0.42,
  max: 0.92,
};

export const MARKET_FACTOR_RANGE: NumericRange = {
  min: 0.9,
  max: 1.15,
};

export const BIDDER_PROFILES: readonly BidderProfile[] = [
  {
    id: 'npc-0',
    name: { ru: 'Виктор', en: 'Victor' },
    hiddenValueFactor: { min: 0.26, max: 0.38 },
  },
  {
    id: 'npc-1',
    name: { ru: 'Мира', en: 'Mira' },
    hiddenValueFactor: { min: 0.34, max: 0.48 },
  },
  {
    id: 'npc-2',
    name: { ru: 'Антон', en: 'Anton' },
    hiddenValueFactor: { min: 0.42, max: 0.58 },
  },
];

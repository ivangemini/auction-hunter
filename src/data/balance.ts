import type { BidderProfile, NumericRange } from '../domain/auction';

export const ITEM_CONDITION_RANGE: NumericRange = {
  min: 0.42,
  max: 0.92,
};

export const MARKET_FACTOR_RANGE: NumericRange = {
  min: 0.9,
  max: 1.15,
};

// NPCs now compete close enough to hidden value that blindly forcing every win can lose money.
// Clue-backed generation gives the player information to decide when that risk is justified.
export const BIDDER_PROFILES: readonly BidderProfile[] = [
  {
    id: 'npc-0',
    name: { ru: 'Виктор', en: 'Victor' },
    hiddenValueFactor: { min: 0.45, max: 0.65 },
  },
  {
    id: 'npc-1',
    name: { ru: 'Мира', en: 'Mira' },
    hiddenValueFactor: { min: 0.6, max: 0.85 },
  },
  {
    id: 'npc-2',
    name: { ru: 'Антон', en: 'Anton' },
    hiddenValueFactor: { min: 0.75, max: 1.02 },
  },
];

import type { BidderTell, BidderProfile, NumericRange } from '../domain/auction';
import type { LocalizedText } from '../domain/types';

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
    trait: { ru: 'Осторожный перекупщик', en: 'Cautious reseller' },
    hiddenValueFactor: { min: 0.45, max: 0.65 },
  },
  {
    id: 'npc-1',
    name: { ru: 'Мира', en: 'Mira' },
    trait: { ru: 'Считает каждую маржу', en: 'Margin-focused' },
    hiddenValueFactor: { min: 0.6, max: 0.85 },
  },
  {
    id: 'npc-2',
    name: { ru: 'Антон', en: 'Anton' },
    trait: { ru: 'Любит дожимать торги', en: 'Pushes auctions hard' },
    hiddenValueFactor: { min: 0.75, max: 1.02 },
  },
];

export const BIDDER_TELL_TEXT: Record<BidderTell, LocalizedText> = {
  calm: { ru: 'спокоен', en: 'calm' },
  watching: { ru: 'следит за ценой', en: 'watching the price' },
  hesitating: { ru: 'сомневается', en: 'hesitating' },
  out: { ru: 'больше не поднимет', en: 'won’t raise again' },
};

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
    trait: { ru: 'Осторожный · техника и инструменты', en: 'Cautious · electronics & tools' },
    hiddenValueFactor: { min: 0.45, max: 0.65 },
    specialtyCategories: ['electronics', 'tools'],
    specialtyValueMultiplier: 1.08,
  },
  {
    id: 'npc-1',
    name: { ru: 'Мира', en: 'Mira' },
    trait: { ru: 'Считает маржу · часы и искусство', en: 'Margin-focused · watches & art' },
    hiddenValueFactor: { min: 0.6, max: 0.85 },
    specialtyCategories: ['watches', 'art'],
    specialtyValueMultiplier: 1.1,
  },
  {
    id: 'npc-2',
    name: { ru: 'Антон', en: 'Anton' },
    trait: { ru: 'Дожимает · игрушки и коллекционка', en: 'Pushes hard · toys & collectibles' },
    hiddenValueFactor: { min: 0.75, max: 1.02 },
    specialtyCategories: ['toys', 'collectibles'],
    specialtyValueMultiplier: 1.12,
  },
  {
    id: 'npc-3',
    name: { ru: 'Лея', en: 'Leah' },
    trait: { ru: 'Охотится за стилем · искусство и коллекционка', en: 'Style hunter · art & collectibles' },
    hiddenValueFactor: { min: 0.52, max: 0.78 },
    specialtyCategories: ['art', 'collectibles'],
    specialtyValueMultiplier: 1.14,
  },
  {
    id: 'npc-4',
    name: { ru: 'Роман', en: 'Roman' },
    trait: { ru: 'Технарь · электроника и игрушки', en: 'Tech-minded · electronics & toys' },
    hiddenValueFactor: { min: 0.66, max: 0.9 },
    specialtyCategories: ['electronics', 'toys'],
    specialtyValueMultiplier: 1.11,
  },
  {
    id: 'npc-5',
    name: { ru: 'София', en: 'Sofia' },
    trait: { ru: 'Терпеливая · часы и инструменты', en: 'Patient · watches & tools' },
    hiddenValueFactor: { min: 0.56, max: 0.82 },
    specialtyCategories: ['watches', 'tools'],
    specialtyValueMultiplier: 1.13,
  },
];

export const BIDDER_TELL_TEXT: Record<BidderTell, LocalizedText> = {
  calm: { ru: 'спокоен', en: 'calm' },
  watching: { ru: 'следит за ценой', en: 'watching the price' },
  hesitating: { ru: 'сомневается', en: 'hesitating' },
  out: { ru: 'больше не поднимет', en: 'won’t raise again' },
};

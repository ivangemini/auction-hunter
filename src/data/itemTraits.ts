import type { ItemCategory, ItemDefinition, ItemTraitId, Locale, LocalizedText, Rarity } from '../domain/types';

export interface ItemTraitDefinition {
  id: ItemTraitId;
  name: LocalizedText;
  description: LocalizedText;
  valueMultiplier: number;
  variant: boolean;
}

export const ITEM_TRAITS: Record<ItemTraitId, ItemTraitDefinition> = {
  signed: {
    id: 'signed',
    name: { ru: 'Подпись', en: 'Signed' },
    description: { ru: 'Подлинная подпись повышает интерес профильных покупателей.', en: 'An authentic signature attracts specialist buyers.' },
    valueMultiplier: 1,
    variant: false,
  },
  'first-edition': {
    id: 'first-edition',
    name: { ru: 'Первое издание', en: 'First edition' },
    description: { ru: 'Ранний выпуск особенно ценится коллекционерами.', en: 'An early release is especially desirable to collectors.' },
    valueMultiplier: 1,
    variant: false,
  },
  'original-packaging': {
    id: 'original-packaging',
    name: { ru: 'Оригинальный комплект', en: 'Original package' },
    description: { ru: 'Сохранившийся футляр или заводской комплект повышает коллекционную ценность.', en: 'Original packaging or a complete case raises collector appeal.' },
    valueMultiplier: 1,
    variant: false,
  },
  'limited-run': {
    id: 'limited-run',
    name: { ru: 'Ограниченный тираж', en: 'Limited run' },
    description: { ru: 'Небольшой тираж создаёт дефицит на профильном рынке.', en: 'A limited production run creates specialist demand.' },
    valueMultiplier: 1,
    variant: false,
  },
  prototype: {
    id: 'prototype',
    name: { ru: 'Прототип', en: 'Prototype' },
    description: { ru: 'Предсерийное происхождение интересно редким дилерам.', en: 'Pre-production provenance is valuable to rare-item brokers.' },
    valueMultiplier: 1,
    variant: false,
  },
  mechanical: {
    id: 'mechanical',
    name: { ru: 'Механика', en: 'Mechanical' },
    description: { ru: 'Механические устройства имеют отдельный рынок энтузиастов.', en: 'Mechanical pieces have a dedicated enthusiast market.' },
    valueMultiplier: 1,
    variant: false,
  },
  'period-design': {
    id: 'period-design',
    name: { ru: 'Дизайн эпохи', en: 'Period design' },
    description: { ru: 'Выразительный исторический дизайн интересен интерьерным и арт-дилерам.', en: 'Distinct period design appeals to interiors and art dealers.' },
    valueMultiplier: 1,
    variant: false,
  },
  provenance: {
    id: 'provenance',
    name: { ru: 'Провенанс', en: 'Provenance' },
    description: { ru: 'Прослеживаемая история происхождения повышает доверие коллекционеров.', en: 'Traceable provenance increases collector confidence.' },
    valueMultiplier: 1,
    variant: false,
  },
  'complete-set': {
    id: 'complete-set',
    name: { ru: 'Полный комплект', en: 'Complete set' },
    description: { ru: 'Все штатные детали и аксессуары сохранились вместе с предметом.', en: 'All expected parts and accessories are still present.' },
    valueMultiplier: 1.18,
    variant: true,
  },
  'rare-variant': {
    id: 'rare-variant',
    name: { ru: 'Редкая версия', en: 'Rare variant' },
    description: { ru: 'Редкое исполнение заметно повышает коллекционный спрос.', en: 'An uncommon production variant materially raises collector demand.' },
    valueMultiplier: 1.28,
    variant: true,
  },
  'documented-history': {
    id: 'documented-history',
    name: { ru: 'Документы и история', en: 'Documented history' },
    description: { ru: 'Сохранившиеся документы подтверждают историю конкретного экземпляра.', en: 'Surviving paperwork documents the history of this specific example.' },
    valueMultiplier: 1.16,
    variant: true,
  },
  'replacement-parts': {
    id: 'replacement-parts',
    name: { ru: 'Неродные детали', en: 'Replacement parts' },
    description: { ru: 'Часть оригинальных компонентов заменена, что снижает коллекционную ценность.', en: 'Some original components were replaced, reducing collector value.' },
    valueMultiplier: 0.84,
    variant: true,
  },
  incomplete: {
    id: 'incomplete',
    name: { ru: 'Неполный комплект', en: 'Incomplete' },
    description: { ru: 'Не хватает важной детали или аксессуара.', en: 'An important part or accessory is missing.' },
    valueMultiplier: 0.72,
    variant: true,
  },
  'replica-risk': {
    id: 'replica-risk',
    name: { ru: 'Сомнительная подлинность', en: 'Authenticity risk' },
    description: { ru: 'Есть признаки поздней копии или неподтверждённой подлинности.', en: 'Signs point to a later copy or unverified authenticity.' },
    valueMultiplier: 0.6,
    variant: true,
  },
};

const ITEM_TRAIT_ASSIGNMENTS: Readonly<Record<string, readonly ItemTraitId[]>> = {
  'signed-poster': ['signed', 'provenance'],
  'gallery-print': ['limited-run'],
  'arcade-handheld': ['original-packaging'],
  'pocket-watch': ['mechanical', 'provenance'],
  'prototype-toy': ['prototype', 'limited-run'],
  'travel-clock': ['mechanical'],
  'mini-console': ['limited-run', 'first-edition'],
  'military-watch': ['mechanical', 'provenance'],
  'preproduction-figure': ['prototype', 'limited-run'],
  'model-train': ['mechanical'],
  'porcelain-figurine': ['period-design'],
  'art-deco-lamp': ['period-design'],
  'fountain-pen': ['original-packaging'],
  'chronograph-watch': ['mechanical'],
  'first-edition-book': ['first-edition', 'provenance'],
  'signed-vinyl': ['signed', 'limited-run'],
  'clockwork-automaton': ['mechanical', 'period-design'],
  'master-study': ['period-design', 'provenance'],
};

interface VariantTraitRule {
  id: ItemTraitId;
  categories: readonly ItemCategory[];
}

const POSITIVE_VARIANT_RULES: readonly VariantTraitRule[] = [
  { id: 'complete-set', categories: ['electronics', 'watches', 'toys', 'tools', 'collectibles'] },
  { id: 'rare-variant', categories: ['electronics', 'watches', 'toys', 'art', 'tools', 'collectibles'] },
  { id: 'documented-history', categories: ['watches', 'toys', 'art', 'collectibles'] },
];

const NEGATIVE_VARIANT_RULES: readonly VariantTraitRule[] = [
  { id: 'replacement-parts', categories: ['electronics', 'watches', 'toys', 'tools'] },
  { id: 'incomplete', categories: ['electronics', 'watches', 'toys', 'art', 'tools', 'collectibles'] },
  { id: 'replica-risk', categories: ['watches', 'toys', 'art', 'collectibles'] },
];

const POSITIVE_CHANCE: Record<Rarity, number> = {
  common: 0.14,
  uncommon: 0.22,
  rare: 0.34,
  epic: 0.46,
  legendary: 0.58,
};

const NEGATIVE_CHANCE: Record<Rarity, number> = {
  common: 0.16,
  uncommon: 0.13,
  rare: 0.1,
  epic: 0.07,
  legendary: 0.04,
};

export function itemTraitsFor(itemId: string): ItemTraitId[] {
  return [...(ITEM_TRAIT_ASSIGNMENTS[itemId] ?? [])];
}

export function rollItemTraits(item: ItemDefinition, random: () => number = Math.random): ItemTraitId[] {
  const traits = new Set(itemTraitsFor(item.id));
  const positive = eligibleVariantTraits(POSITIVE_VARIANT_RULES, item.category);

  if (positive.length > 0 && clampedRandom(random) < POSITIVE_CHANCE[item.rarity]) {
    traits.add(pickTrait(positive, random));
  }

  const negative = eligibleVariantTraits(NEGATIVE_VARIANT_RULES, item.category)
    .filter((id) => !(id === 'incomplete' && traits.has('complete-set')));

  if (negative.length > 0 && clampedRandom(random) < NEGATIVE_CHANCE[item.rarity]) {
    traits.add(pickTrait(negative, random));
  }

  return [...traits];
}

export function itemTraitValueMultiplier(traitIds: readonly ItemTraitId[]): number {
  const multiplier = traitIds.reduce((value, id) => value * ITEM_TRAITS[id].valueMultiplier, 1);
  return Math.min(1.7, Math.max(0.5, multiplier));
}

export function itemTraitNames(itemId: string, locale: Locale): string[] {
  return itemTraitNamesForIds(itemTraitsFor(itemId), locale);
}

export function itemTraitNamesForIds(traitIds: readonly ItemTraitId[], locale: Locale): string[] {
  return traitIds.map((id) => ITEM_TRAITS[id].name[locale]);
}

export function isItemTraitId(value: unknown): value is ItemTraitId {
  return typeof value === 'string' && value in ITEM_TRAITS;
}

function eligibleVariantTraits(rules: readonly VariantTraitRule[], category: ItemCategory): ItemTraitId[] {
  return rules.filter((rule) => rule.categories.includes(category)).map((rule) => rule.id);
}

function pickTrait(values: readonly ItemTraitId[], random: () => number): ItemTraitId {
  const unit = Math.min(0.9999999999999999, clampedRandom(random));
  return values[Math.floor(unit * values.length)] ?? values[0]!;
}

function clampedRandom(random: () => number): number {
  return Math.min(1, Math.max(0, random()));
}

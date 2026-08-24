import type { ItemTraitId, Locale, LocalizedText } from '../domain/types';

export interface ItemTraitDefinition {
  id: ItemTraitId;
  name: LocalizedText;
  description: LocalizedText;
}

export const ITEM_TRAITS: Record<ItemTraitId, ItemTraitDefinition> = {
  signed: {
    id: 'signed',
    name: { ru: 'Подпись', en: 'Signed' },
    description: { ru: 'Подлинная подпись повышает интерес профильных покупателей.', en: 'An authentic signature attracts specialist buyers.' },
  },
  'first-edition': {
    id: 'first-edition',
    name: { ru: 'Первое издание', en: 'First edition' },
    description: { ru: 'Ранний выпуск особенно ценится коллекционерами.', en: 'An early release is especially desirable to collectors.' },
  },
  'original-packaging': {
    id: 'original-packaging',
    name: { ru: 'Оригинальный комплект', en: 'Original package' },
    description: { ru: 'Сохранившийся футляр или заводской комплект повышает коллекционную ценность.', en: 'Original packaging or a complete case raises collector appeal.' },
  },
  'limited-run': {
    id: 'limited-run',
    name: { ru: 'Ограниченный тираж', en: 'Limited run' },
    description: { ru: 'Небольшой тираж создаёт дефицит на профильном рынке.', en: 'A limited production run creates specialist demand.' },
  },
  prototype: {
    id: 'prototype',
    name: { ru: 'Прототип', en: 'Prototype' },
    description: { ru: 'Предсерийное происхождение интересно редким дилерам.', en: 'Pre-production provenance is valuable to rare-item brokers.' },
  },
  mechanical: {
    id: 'mechanical',
    name: { ru: 'Механика', en: 'Mechanical' },
    description: { ru: 'Механические устройства имеют отдельный рынок энтузиастов.', en: 'Mechanical pieces have a dedicated enthusiast market.' },
  },
  'period-design': {
    id: 'period-design',
    name: { ru: 'Дизайн эпохи', en: 'Period design' },
    description: { ru: 'Выразительный исторический дизайн интересен интерьерным и арт-дилерам.', en: 'Distinct period design appeals to interiors and art dealers.' },
  },
  provenance: {
    id: 'provenance',
    name: { ru: 'Провенанс', en: 'Provenance' },
    description: { ru: 'Прослеживаемая история происхождения повышает доверие коллекционеров.', en: 'Traceable provenance increases collector confidence.' },
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

export function itemTraitsFor(itemId: string): ItemTraitId[] {
  return [...(ITEM_TRAIT_ASSIGNMENTS[itemId] ?? [])];
}

export function itemTraitNames(itemId: string, locale: Locale): string[] {
  return itemTraitsFor(itemId).map((id) => ITEM_TRAITS[id].name[locale]);
}

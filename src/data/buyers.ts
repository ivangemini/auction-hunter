import type {
  CollectionItem,
  ItemCategory,
  ItemDefinition,
  ItemTraitId,
  LocalizedText,
} from '../domain/types';
import { itemTraitsFor } from './itemTraits';

export interface BuyerOfferDefinition {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  multiplier: number;
  category?: ItemCategory;
  traitIds?: readonly ItemTraitId[];
}

export interface BuyerMatch {
  itemId: string;
  value: number;
  copies: number;
  instanceId?: string;
  appraisedValue?: number;
  condition?: number;
  traitIds?: ItemTraitId[];
  restored?: boolean;
}

export const CATEGORY_BUYERS: readonly BuyerOfferDefinition[] = [
  {
    id: 'watch-specialist',
    name: { ru: 'Часовой специалист', en: 'Watch Specialist' },
    description: { ru: 'Сегодня ищет любые часы и платит выше обычного рынка.', en: 'Buying watches today at a premium over the normal market.' },
    multiplier: 1.3,
    category: 'watches',
  },
  {
    id: 'retro-electronics',
    name: { ru: 'Дилер ретро-техники', en: 'Retro Electronics Dealer' },
    description: { ru: 'Собирает старую электронику для частных клиентов.', en: 'Sourcing vintage electronics for private clients.' },
    multiplier: 1.22,
    category: 'electronics',
  },
  {
    id: 'toy-collector',
    name: { ru: 'Коллекционер игрушек', en: 'Toy Collector' },
    description: { ru: 'Покупает винтажные игрушки и редкие модели.', en: 'Buying vintage toys and unusual models.' },
    multiplier: 1.24,
    category: 'toys',
  },
  {
    id: 'art-curator',
    name: { ru: 'Частный куратор', en: 'Private Curator' },
    description: { ru: 'Ищет искусство и декоративные вещи для новой экспозиции.', en: 'Looking for art and decorative pieces for a new display.' },
    multiplier: 1.28,
    category: 'art',
  },
  {
    id: 'tool-reseller',
    name: { ru: 'Реселлер мастерской', en: 'Workshop Reseller' },
    description: { ru: 'Забирает исправные и винтажные инструменты.', en: 'Buying useful and vintage workshop tools.' },
    multiplier: 1.15,
    category: 'tools',
  },
  {
    id: 'curiosity-dealer',
    name: { ru: 'Дилер редкостей', en: 'Curiosity Dealer' },
    description: { ru: 'Покупает необычные коллекционные предметы широкого профиля.', en: 'Buying unusual general collectibles for a mixed cabinet.' },
    multiplier: 1.18,
    category: 'collectibles',
  },
];

export const SPECIALIST_BUYERS: readonly BuyerOfferDefinition[] = [
  {
    id: 'provenance-hunter',
    name: { ru: 'Охотник за историей', en: 'Provenance Hunter' },
    description: { ru: 'Платит особенно много за подписи, первые издания и подтверждённое происхождение.', en: 'Pays strongly for signatures, first editions and traceable provenance.' },
    multiplier: 1.45,
    traitIds: ['signed', 'first-edition', 'provenance', 'documented-history'],
  },
  {
    id: 'prototype-broker',
    name: { ru: 'Брокер прототипов', en: 'Prototype Broker' },
    description: { ru: 'Ищет предсерийные, малотиражные и редкие варианты.', en: 'Hunting pre-production pieces, limited runs and rare variants.' },
    multiplier: 1.5,
    traitIds: ['prototype', 'limited-run', 'rare-variant'],
  },
  {
    id: 'mechanical-society',
    name: { ru: 'Клуб механики', en: 'Mechanical Society' },
    description: { ru: 'Ценит часы, автоматы и другие механические находки.', en: 'Values watches, automatons and other mechanical finds.' },
    multiplier: 1.35,
    traitIds: ['mechanical'],
  },
  {
    id: 'design-house',
    name: { ru: 'Дом винтажного дизайна', en: 'Vintage Design House' },
    description: { ru: 'Ищет предметы с выразительным дизайном эпохи или полным оригинальным комплектом.', en: 'Seeking strong period design or complete original presentation.' },
    multiplier: 1.32,
    traitIds: ['period-design', 'original-packaging', 'complete-set'],
  },
  {
    id: 'restoration-workshop',
    name: { ru: 'Реставрационная мастерская', en: 'Restoration Workshop' },
    description: { ru: 'Берёт неполные предметы и экземпляры с неродными деталями как проекты для восстановления.', en: 'Buys incomplete pieces and examples with replacement parts as restoration projects.' },
    multiplier: 1.32,
    traitIds: ['replacement-parts', 'incomplete'],
  },
  {
    id: 'authenticity-gambler',
    name: { ru: 'Охотник за спорными вещами', en: 'Authenticity Gambler' },
    description: { ru: 'Рискует на предметах с сомнительной подлинностью и платит больше обычного быстрого рынка.', en: 'Takes chances on authenticity-risk pieces and pays above the normal quick-sale market.' },
    multiplier: 1.42,
    traitIds: ['replica-risk'],
  },
];

export const BUYER_OFFERS: readonly BuyerOfferDefinition[] = [
  ...CATEGORY_BUYERS,
  ...SPECIALIST_BUYERS,
];

export function dailyBuyerOffersForDay(dayKey: string): BuyerOfferDefinition[] {
  const firstIndex = stableHash(`${dayKey}:category:first`) % CATEGORY_BUYERS.length;
  let secondIndex = stableHash(`${dayKey}:category:second`) % (CATEGORY_BUYERS.length - 1);
  if (secondIndex >= firstIndex) secondIndex += 1;
  const specialistIndex = stableHash(`${dayKey}:specialist`) % SPECIALIST_BUYERS.length;

  const first = CATEGORY_BUYERS[firstIndex];
  const second = CATEGORY_BUYERS[secondIndex];
  const specialist = SPECIALIST_BUYERS[specialistIndex];
  return [first, second, specialist].filter((offer): offer is BuyerOfferDefinition => Boolean(offer));
}

export function buyerOfferMatches(
  item: ItemDefinition,
  offer: BuyerOfferDefinition,
  traitIds: readonly ItemTraitId[] = itemTraitsFor(item.id),
): boolean {
  if (offer.category && item.category === offer.category) return true;
  if (!offer.traitIds || offer.traitIds.length === 0) return false;
  const traits = new Set(traitIds);
  return offer.traitIds.some((traitId) => traits.has(traitId));
}

export function buyerOfferValue(
  item: ItemDefinition,
  offer: BuyerOfferDefinition,
  appraisedValue = item.baseValue,
  traitIds: readonly ItemTraitId[] = itemTraitsFor(item.id),
): number {
  if (!buyerOfferMatches(item, offer, traitIds)) return 0;
  return Math.max(1, Math.round(Math.max(1, appraisedValue) * offer.multiplier));
}

export function bestBuyerMatch(
  collectionIds: readonly string[],
  itemById: ReadonlyMap<string, ItemDefinition>,
  offer: BuyerOfferDefinition,
  collectionItems: readonly CollectionItem[] = [],
): BuyerMatch | null {
  const copiesById = new Map<string, number>();
  for (const itemId of collectionIds) copiesById.set(itemId, (copiesById.get(itemId) ?? 0) + 1);

  if (collectionItems.length > 0) {
    let best: BuyerMatch | null = null;
    for (const instance of collectionItems) {
      const item = itemById.get(instance.itemId);
      if (!item || !buyerOfferMatches(item, offer, instance.traitIds)) continue;
      const value = buyerOfferValue(item, offer, instance.appraisedValue, instance.traitIds);
      if (!best || value > best.value) {
        best = {
          itemId: item.id,
          value,
          copies: copiesById.get(item.id) ?? 1,
          instanceId: instance.id,
          appraisedValue: instance.appraisedValue,
          condition: instance.condition,
          traitIds: [...instance.traitIds],
          restored: instance.restored,
        };
      }
    }
    return best;
  }

  let best: BuyerMatch | null = null;
  for (const [itemId, copies] of copiesById) {
    const item = itemById.get(itemId);
    if (!item || !buyerOfferMatches(item, offer)) continue;
    const value = buyerOfferValue(item, offer);
    if (!best || value > best.value) best = { itemId, value, copies };
  }

  return best;
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
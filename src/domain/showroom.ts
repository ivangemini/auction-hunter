import type { CollectionItem, ItemDefinition, Rarity } from './types';

const SHOWROOM_SLOTS = [4, 6, 8, 10] as const;
const RARITY_WEIGHT: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

export interface ShowroomDisplayCopy {
  sourceId: string;
  itemId: string;
  appraisedValue: number;
  condition: number;
  restored: boolean;
  traitIds: CollectionItem['traitIds'];
  acquiredAt: number;
  legacyFallback: boolean;
  trophyScore: number;
}

export function showroomSlotCount(level: number): number {
  const index = Math.max(0, Math.min(SHOWROOM_SLOTS.length - 1, Math.floor(level)));
  return SHOWROOM_SLOTS[index]!;
}

export function showroomTierIndex(level: number): number {
  return Math.max(0, Math.min(3, Math.floor(level)));
}

export function showroomTrophyScore(copy: Pick<ShowroomDisplayCopy, 'appraisedValue' | 'condition' | 'restored'>, definition: ItemDefinition): number {
  const rarity = RARITY_WEIGHT[definition.rarity] * 1_000_000_000;
  const value = Math.max(0, Math.round(copy.appraisedValue)) * 10_000;
  const condition = Math.max(0, Math.min(1, copy.condition)) * 1_000;
  const restoration = copy.restored ? 250 : 0;
  return rarity + value + condition + restoration;
}

export function curateShowroom(
  collection: readonly string[],
  collectionItems: readonly CollectionItem[] | undefined,
  definitions: ReadonlyMap<string, ItemDefinition>,
  showroomLevel: number,
): ShowroomDisplayCopy[] {
  const uniqueItemIds = [...new Set(collection)].filter((itemId) => definitions.has(itemId));
  const concreteByItem = new Map<string, CollectionItem[]>();

  for (const copy of collectionItems ?? []) {
    if (!definitions.has(copy.itemId)) continue;
    const group = concreteByItem.get(copy.itemId) ?? [];
    group.push(copy);
    concreteByItem.set(copy.itemId, group);
  }

  const candidates = uniqueItemIds.map((itemId): ShowroomDisplayCopy => {
    const definition = definitions.get(itemId)!;
    const concrete = [...(concreteByItem.get(itemId) ?? [])]
      .sort((left, right) => {
        const scoreDelta = showroomTrophyScore(right, definition) - showroomTrophyScore(left, definition);
        if (scoreDelta !== 0) return scoreDelta;
        return right.acquiredAt - left.acquiredAt || left.id.localeCompare(right.id);
      })[0];

    if (concrete) {
      const result: ShowroomDisplayCopy = {
        sourceId: concrete.id,
        itemId,
        appraisedValue: concrete.appraisedValue,
        condition: concrete.condition,
        restored: concrete.restored,
        traitIds: [...concrete.traitIds],
        acquiredAt: concrete.acquiredAt,
        legacyFallback: false,
        trophyScore: 0,
      };
      result.trophyScore = showroomTrophyScore(result, definition);
      return result;
    }

    const legacy: ShowroomDisplayCopy = {
      sourceId: `legacy:${itemId}`,
      itemId,
      appraisedValue: definition.baseValue,
      condition: 0.75,
      restored: false,
      traitIds: [],
      acquiredAt: 0,
      legacyFallback: true,
      trophyScore: 0,
    };
    legacy.trophyScore = showroomTrophyScore(legacy, definition);
    return legacy;
  });

  return candidates
    .sort((left, right) => right.trophyScore - left.trophyScore || left.itemId.localeCompare(right.itemId))
    .slice(0, showroomSlotCount(showroomLevel));
}

export function showroomDisplayedValue(copies: readonly ShowroomDisplayCopy[]): number {
  return copies.reduce((total, copy) => total + Math.max(0, copy.appraisedValue), 0);
}

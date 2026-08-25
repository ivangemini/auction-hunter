import type {
  CollectionItem,
  ItemCategory,
  ItemDefinition,
  ItemTraitId,
  LocalizedText,
} from './types';

export type CollectorRequestTier = 'common' | 'demanding' | 'rare';

export interface CollectorRequestDefinition {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  tier: CollectorRequestTier;
  multiplier: number;
  category?: ItemCategory;
  traitIds?: readonly ItemTraitId[];
  requireAllTraits?: boolean;
  minCondition?: number;
  maxCondition?: number;
}

export interface ActiveCollectorRequest {
  definition: CollectorRequestDefinition;
  requestKey: string;
  windowIndex: number;
  remainingAuctions: number;
}

export interface CollectorRequestMatch {
  instance: CollectionItem;
  item: ItemDefinition;
  value: number;
}

export function collectorRequestForAuction(
  auctionsPlayed: number,
  definitions: readonly CollectorRequestDefinition[],
  windowAuctions: number,
): ActiveCollectorRequest | null {
  if (definitions.length === 0) return null;
  const duration = Math.max(2, Math.floor(windowAuctions));
  const auctionIndex = Math.max(0, Math.floor(auctionsPlayed));
  const windowIndex = Math.floor(auctionIndex / duration);
  const definition = definitions[windowIndex % definitions.length];
  if (!definition) return null;

  return {
    definition,
    requestKey: `${definition.id}@${windowIndex}`,
    windowIndex,
    remainingAuctions: duration - (auctionIndex % duration),
  };
}

export function collectorRequestMatches(
  item: ItemDefinition,
  instance: CollectionItem,
  request: CollectorRequestDefinition,
): boolean {
  if (request.category && item.category !== request.category) return false;
  if (request.minCondition !== undefined && instance.condition < clampUnit(request.minCondition)) return false;
  if (request.maxCondition !== undefined && instance.condition > clampUnit(request.maxCondition)) return false;

  if (request.traitIds && request.traitIds.length > 0) {
    const owned = new Set(instance.traitIds);
    const traitMatch = request.requireAllTraits
      ? request.traitIds.every((traitId) => owned.has(traitId))
      : request.traitIds.some((traitId) => owned.has(traitId));
    if (!traitMatch) return false;
  }

  return true;
}

export function collectorRequestValue(
  instance: CollectionItem,
  request: CollectorRequestDefinition,
): number {
  const multiplier = Number.isFinite(request.multiplier)
    ? Math.max(1.05, Math.min(2.25, request.multiplier))
    : 1.05;
  return Math.max(1, Math.round(Math.max(1, instance.appraisedValue) * multiplier));
}

export function bestCollectorRequestMatch(
  collectionItems: readonly CollectionItem[],
  itemById: ReadonlyMap<string, ItemDefinition>,
  active: ActiveCollectorRequest,
): CollectorRequestMatch | null {
  let best: CollectorRequestMatch | null = null;

  for (const instance of collectionItems) {
    const item = itemById.get(instance.itemId);
    if (!item || !collectorRequestMatches(item, instance, active.definition)) continue;
    const value = collectorRequestValue(instance, active.definition);
    if (!best || value > best.value) best = { instance, item, value };
  }

  return best;
}

function clampUnit(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}
